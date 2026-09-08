const fs=require('fs'),http=require('http'),path=require('path'),assert=require('assert');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root=path.join(__dirname,'../www');
const server=http.createServer((req,res)=>{let file=path.join(root,decodeURIComponent(req.url.split('?')[0]==='/'?'/index.html':req.url.split('?')[0]));try{let data=fs.readFileSync(file);if(file.endsWith('app.js'))data=Buffer.from(data.toString().replace('})();',`window.testApp={showPanel,renderFrets,setMode,startTuner,stopTuner,playReference,stopReferenceTone,processDetectedPitch,showCompletionMessage,openSong,renderSongs,applyLanguage,get listening(){return listening},get panel(){return currentPanel},set songs(v){songsData=v},get history(){return navigationHistory}};})();`));res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':file.endsWith('.png')?'image/png':'text/html');res.end(data);}catch{res.statusCode=404;res.end('');}});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({channel:'msedge',headless:true});const page=await browser.newPage({viewport:{width:390,height:844}});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.route('https://**',route=>route.abort());await page.addInitScript(()=>{localStorage.setItem('onboardingDone','1');window.nativeMock={permission:'prompt',requests:0,starts:0,stops:0,settings:0,muted:false,listeners:{}};const m=window.nativeMock;window.Capacitor={Plugins:{DutarTuner:{checkPermissions:async()=>({microphone:m.permission}),requestPermissions:async()=>{m.requests++;m.permission='granted';return{microphone:'granted'}},openMicrophoneSettings:async()=>{m.settings++},start:async()=>{m.starts++},stop:async()=>{m.stops++},setAnalysisMuted:async({muted})=>{m.muted=muted},setNoteDetailOrientation:async()=>{},addListener:async(name,fn)=>{m.pitch=fn;return{remove:async()=>{}}}},App:{addListener:(name,fn)=>{const previous=m.listeners[name];m.listeners[name]=async(...args)=>{if(previous)await previous(...args);await fn(...args)};return Promise.resolve({remove(){}})},exitApp:async()=>{m.exited=true}}}};});await page.goto('http://127.0.0.1:'+server.address().port);await page.waitForFunction(()=>window.testApp);
await page.evaluate(async()=>{await testApp.startTuner();});assert.equal(await page.evaluate(()=>nativeMock.requests),1);assert.equal(await page.evaluate(()=>testApp.listening),true);
await page.evaluate(async()=>{await testApp.playReference(0)});assert.equal(await page.evaluate(()=>testApp.listening),true);assert.equal(await page.evaluate(()=>nativeMock.muted),true);assert.equal(await page.evaluate(()=>nativeMock.stops),0);await page.evaluate(()=>testApp.stopReferenceTone());assert.equal(await page.evaluate(()=>nativeMock.muted),false);
await page.evaluate(async()=>{await testApp.stopTuner();nativeMock.permission='denied';await testApp.startTuner()});assert.equal(await page.evaluate(()=>nativeMock.settings),1);assert.equal(await page.evaluate(()=>testApp.listening),false);
await page.evaluate(async()=>{await testApp.showPanel('frets');await testApp.showPanel('songs');await nativeMock.listeners.backButton()});assert.equal(await page.evaluate(()=>testApp.panel),'frets');await page.evaluate(()=>nativeMock.listeners.backButton());assert.equal(await page.evaluate(()=>testApp.panel),'tuner');
for(const size of [{width:320,height:568},{width:390,height:844},{width:768,height:1024}]){await page.setViewportSize(size);await page.evaluate(()=>testApp.showPanel('tuner'));await page.waitForTimeout(100);const bounds=await page.evaluate(()=>{const r=s=>{let b=document.querySelector(s).getBoundingClientRect();return{x:b.x,y:b.y,width:b.width,height:b.height,bottom:b.bottom}};return{mic:r('#micBtn'),nav:r('.bottom-nav'),instrument:r('#instrumentWrap'),gauge:r('.gauge')}});assert(bounds.mic.bottom<=bounds.nav.y+1,JSON.stringify(bounds));const before=bounds.instrument;await page.evaluate(()=>{document.querySelector('#status').textContent='Mikrofon izni için Ayarları Aç';document.querySelector('#cents').textContent='-100.0 cent'});const after=await page.locator('#instrumentWrap').boundingBox();assert(Math.abs(before.height-after.height)<1);await page.screenshot({path:path.join(require('os').tmpdir(),'build2-'+size.width+'.png')});}
await page.evaluate(()=>{testApp.songs=[{id:'exercise-test',category:'exercise',title:{latin:'Exercise test'},origin:{en:'Practice'},simplePages:['dutar-head.png'],notationPages:[]}];testApp.showPanel('songs')});await page.locator('[data-category=exercises]').click();assert.equal(await page.locator('.song-card').count(),1);assert.equal(await page.locator('#librarySearch').count(),0);await page.locator('.song-favorite-btn').click();await page.locator('[data-category=favorites]').click();assert.equal(await page.locator('.song-card').count(),1);
await page.evaluate(()=>{testApp.setMode('normal');testApp.renderFrets();testApp.showPanel('frets')});assert.equal(await page.locator('.dual-fret').allTextContents().then(v=>v.some(s=>s.includes('#'))),false);assert(await page.locator('.string-0.dual-fret').count()>0);assert.equal(await page.locator('.string-1.dual-fret').count(),11);assert.equal(await page.locator('.brand').innerText(),'Perdeler');await page.waitForTimeout(350);await page.screenshot({path:path.join(require('os').tmpdir(),'build2-frets.png')});assert.deepEqual(errors,[]);
for(const bad of ['{broken','null','{}']){
 await page.evaluate(v=>localStorage.setItem('favoriteSongs',v),bad);
 await page.reload(); await page.waitForFunction(()=>window.testApp);
}
await page.evaluate(()=>{testApp.songs=[{id:'safe',title:{latin:'Score\" onerror=\"window.qaInjected=1'},tempo:'<img src=x onerror=window.qaInjected=1>',simplePages:['missing.png'],notationPages:[]}];testApp.showPanel('songs');testApp.openSong('safe')});
await page.waitForTimeout(200);assert.equal(await page.evaluate(()=>window.qaInjected),undefined);
assert.equal(await page.locator('.song-score-image').getAttribute('onerror'),null);
await page.evaluate(async()=>{await testApp.showPanel('tuner');nativeMock.permission='granted';await testApp.startTuner();await nativeMock.listeners.appStateChange({isActive:false})});
assert.equal(await page.evaluate(()=>testApp.listening),false);

await page.reload(); await page.waitForFunction(()=>window.testApp);
for(const language of ['tr','en','ug']) {
 await page.evaluate(l=>testApp.applyLanguage(l),language);
 assert.equal(await page.locator('html').getAttribute('lang'),language);
 assert.equal(await page.locator('html').getAttribute('dir'),language==='ug'?'rtl':'ltr');
 await page.evaluate(()=>testApp.showCompletionMessage());
 assert.equal(await page.locator('#tuningCompleteMessage').innerText(),'✓');
 assert(await page.locator('#tuningCompleteMessage').getAttribute('aria-label'));
}
await page.evaluate(async()=>{testApp.applyLanguage('tr');await testApp.showPanel('tuner');nativeMock.permission='granted';await testApp.startTuner();
 const plugin=Capacitor.Plugins.DutarTuner;
 plugin.setAnalysisMuted=({muted})=>{nativeMock.muted=muted;return muted?new Promise(r=>window.releaseMute=r):Promise.resolve()};
 window.pendingReference=testApp.playReference(0);
});
await page.waitForFunction(()=>window.releaseMute);
await page.evaluate(async()=>{testApp.stopReferenceTone();window.releaseMute();await window.pendingReference});
assert.equal(await page.locator('.previewing').count(),0);
assert.equal(await page.evaluate(()=>nativeMock.muted),false);
console.log('PASS: TR/EN/Uyghur direction, localized completion label, delayed reference cancellation');
await page.goto('http://127.0.0.1:'+server.address().port+'/privacy.html');await page.locator('[data-lang=ug]').click();assert.equal(await page.locator('html').getAttribute('dir'),'rtl');
assert.deepEqual(errors,[]);console.log('PASS: permissions, reference recording coexistence, navigation, 3 viewport layouts, text stability, exercise category/favorites, dual natural-note frets');await browser.close();server.close();})().catch(e=>{console.error(e);process.exit(1)});
