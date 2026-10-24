const fs=require('fs'),http=require('http'),path=require('path'),assert=require('assert');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'../www');
const server=http.createServer((req,res)=>{
 try{const file=path.join(root,req.url.split('?')[0]==='/'?'index.html':req.url.split('?')[0]);let data=fs.readFileSync(file);
 if(file.endsWith('app.js'))data=Buffer.from(data.toString().replace('})();',`window.testApp={showPanel,openSong,applyLanguage,stopReferenceTone,startTuner,stopTuner,get listening(){return listening},set songs(v){songsData=v}};})();`));
 if(file.endsWith('.css'))data=Buffer.from(data.toString().replaceAll('env(safe-area-inset-top)','var(--test-safe-top,0px)').replaceAll('env(safe-area-inset-bottom)','var(--test-safe-bottom,0px)'));
 res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':file.endsWith('.png')?'image/png':'text/html');res.end(data);
 }catch{res.statusCode=404;res.end();}
});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
 for(const platform of ['ios','android']){
 const context=await browser.newContext({viewport:{width:412,height:915},hasTouch:true,reducedMotion:"reduce"});
 await context.route('https://**',route=>route.abort());
 await context.addInitScript(platform=>{
   window.nativeMock={permission:'prompt',requests:0,plays:0,frequencies:[]};const m=nativeMock;
   const original=AudioContext.prototype.createOscillator;AudioContext.prototype.createOscillator=function(){const o=original.call(this);const start=o.start.bind(o);o.start=(...args)=>{m.frequencies.push(o.frequency.value);return start(...args)};return o;};
   window.Capacitor={getPlatform:()=>platform,Plugins:{DutarTuner:{checkPermissions:async()=>({microphone:m.permission}),requestPermissions:()=>{m.requests++;return new Promise(resolve=>window.answerPermission=value=>{m.permission=value;resolve({microphone:value})})},prepareReferencePlayback:async()=>{m.plays++},setAppearance:async()=>{},setAnalysisMuted:async()=>{},setNoteDetailOrientation:async()=>{},openMicrophoneSettings:async()=>{},start:async()=>{},stop:async()=>{},addListener:async()=>({remove:async()=>{}})},App:{addListener:async()=>({remove:async()=>{}})}}};
 },platform);
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:'+server.address().port);await page.waitForFunction(()=>window.testApp);
 if(platform==='ios'){
   await page.waitForFunction(()=>window.answerPermission);assert.equal(await page.locator('#onboarding').isVisible(),false);
   await page.evaluate(()=>answerPermission('denied'));await page.locator('#languageStep').waitFor();assert.equal(await page.locator('#permissionStep').isVisible(),false);
   await page.locator('.language-options [data-lang=en]').click();assert.equal(await page.locator('#onboarding').isVisible(),false);
 }else{
   assert.equal(await page.evaluate(()=>nativeMock.requests),0);await page.locator('.language-options [data-lang=en]').click();await page.locator('#permissionStep').waitFor();await page.locator('#denyMic').click();
 }
 // Reference audio must play without asking for microphone access.
 for(let index=0;index<2;index++){
   await page.locator('.preview-tone').nth(index).click();await page.waitForFunction(()=>nativeMock.frequencies.length>0);
   assert.equal(await page.locator('.preview-tone').nth(index).innerText(),'');
   assert(await page.locator('.preview-tone').nth(index).getAttribute('aria-label'));
   await page.evaluate(()=>{testApp.stopReferenceTone();nativeMock.frequencies=[]});
 }
 assert.equal(await page.evaluate(()=>nativeMock.requests),platform==='ios'?1:0);
 if(platform==='ios')assert.equal(await page.evaluate(()=>nativeMock.plays),2);
 for(const size of [{width:320,height:568},{width:412,height:915},{width:768,height:1024},{width:820,height:1180}]){
   await page.setViewportSize(size);
   for(const inset of [false,true]){
     await page.evaluate(inset=>{document.documentElement.style.setProperty('--test-safe-top',inset?'24px':'0px');document.documentElement.style.setProperty('--test-safe-bottom',inset?'34px':'0px');},inset);
     for(const panel of ['tuner','frets','settings','songs']){
       await page.evaluate(panel=>testApp.showPanel(panel),panel);
       const bounds=await page.evaluate(panel=>{const p=document.querySelector('#'+panel+'Panel'),nav=document.querySelector('.bottom-nav');return{bottom:p.getBoundingClientRect().bottom,nav:nav.getBoundingClientRect().top,overflow:document.documentElement.scrollWidth>innerWidth};},panel);
       assert(!bounds.overflow,platform+' '+panel+' horizontal overflow');assert(bounds.bottom<=bounds.nav+1,JSON.stringify({platform,size,inset,panel,bounds}));
       if(panel==='settings'){
         await page.locator('#settingsPanel').evaluate(e=>e.scrollTop=e.scrollHeight);
         const bottom=await page.locator('.about-links').evaluate(e=>e.getBoundingClientRect().bottom);assert(bottom<=bounds.nav+1,'settings footer clipped '+JSON.stringify({size,inset,bottom,bounds}));
       }
     }
   }
 }
 for(const language of ['tr','en','ug']){
   await page.evaluate(language=>{testApp.applyLanguage(language);testApp.songs=Array.from({length:30},(_,i)=>({id:'qa-'+i,category:'piece',title:{latin:'Example piece '+i,ug:'مۇزىكا'},simplePages:['dutar-head.png'],notationPages:[]}));testApp.showPanel('songs');DuttarTheme.apply('dark');},language);
   await page.locator('[data-category=all]').click();await page.locator('.song-card').last().scrollIntoViewIfNeeded();
   const b=await page.locator('.song-card').last().boundingBox(),nav=await page.locator('.bottom-nav').boundingBox();assert(b.y+b.height<=nav.y+1,'last library card clipped '+language);
 }
 await page.evaluate(()=>{testApp.applyLanguage('en');testApp.songs=[{id:'qa',title:{latin:'Score'},simplePages:['dutar-head.png'],notationPages:[]}];testApp.showPanel('songs');testApp.openSong('qa')});
 const before=await page.locator('#scoreFullscreen').innerHTML();await page.locator('#scoreFullscreen').click();await page.waitForFunction(()=>document.querySelector('#scoreFullscreen').getAttribute('aria-pressed')==='true');assert.notEqual(await page.locator('#scoreFullscreen').innerHTML(),before);assert.equal(await page.locator('#scoreFullscreen').getAttribute('aria-label'),'Exit fullscreen');
 await page.locator('#scoreFullscreen').click();await page.waitForFunction(()=>document.querySelector('#scoreFullscreen').getAttribute('aria-pressed')==='false');
 await page.evaluate(()=>testApp.showPanel('tuner'));assert.equal(await page.locator('#status').evaluate(e=>getComputedStyle(e).userSelect),'none');
 if(process.env.UI_SCREENSHOTS){
   await page.setViewportSize({width:412,height:915});
   for(const panel of ['tuner','frets','settings']){await page.evaluate(p=>testApp.showPanel(p),panel);await page.screenshot({path:path.join(process.env.UI_SCREENSHOTS,platform+'-'+panel+'-polish.png')});}
 }
 assert.equal(await page.locator('body').evaluate(e=>getComputedStyle(e).touchAction),'manipulation');
 await page.reload();await page.waitForFunction(()=>window.testApp);assert.equal(await page.evaluate(()=>nativeMock.requests),0);assert.equal(await page.locator('#onboarding').isVisible(),false);
 assert.deepEqual(errors,[]);await context.close();console.log('PASS '+platform+': permission ordering, reference audio, phone/tablet safe-area scrolling, fullscreen controls, selection and touch behavior');
 }
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;server.close()});
