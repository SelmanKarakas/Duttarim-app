const fs=require('fs'),path=require('path'),os=require('os'),assert=require('assert/strict'),{spawn}=require('child_process');
const repo=path.resolve(__dirname,'..');
const V=require('../www/score-versions.js');
const make=(level)=>({id:'example-level-'+level,title:{latin:'Örnek',ug:''},versionGroup:{id:'example',title:{latin:'Örnek',ug:''}},versionLevel:level,tuning:'normal',category:'piece',tempo:90,simplePages:['songs/page.png'],notationPages:[]});
V.validate([make(1),make(3),make(5),make(10)]);
assert.throws(()=>V.validate([make(1),{...make(1),id:'other'}]),/aynı seviye/);
assert.throws(()=>V.validate([{...make(1),versionLevel:1.5}]));
assert.throws(()=>V.validate([{...make(1),difficulty:'beginner'}]));
assert.throws(()=>V.validate([{...make(1),simplePages:[]}]));
assert.throws(()=>V.validate([make(1),{...make(2),versionGroup:{id:'example',title:{latin:'Other',ug:''}}}]));
(async()=>{
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'duttarim-versions-'));
 for(const name of ['tools/song-admin/server.js','tools/song-admin/index.html','tools/song-admin/app.js','tools/song-admin/styles.css','www/score-versions.js','www/version-editor.js','www/versions.css']){let target=path.join(temp,name);fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(path.join(repo,name),target);}
 fs.mkdirSync(path.join(temp,'content'),{recursive:true});fs.writeFileSync(path.join(temp,'content/songs.json'),'[]');
 const server=spawn(process.execPath,[path.join(temp,'tools/song-admin/server.js')],{env:{...process.env,DUTTARIM_ADMIN_PORT:'4189'},windowsHide:true});
 try{
  await new Promise((resolve,reject)=>{server.stdout.on('data',()=>resolve());server.on('error',reject);server.on('exit',code=>reject(Error('Server exit '+code)));});
  const base='http://127.0.0.1:4189';
  for(const file of ['score-versions.js','version-editor.js','versions.css'])assert.equal((await fetch(base+'/shared/'+file)).status,200);
  const image={name:'page.png',data:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/l1sAAAAASUVORK5CYII='};
  async function save(payload){const r=await fetch(base+'/api/song',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});return {status:r.status,data:await r.json()};}
  for(const level of [1,2,3,4,5]){const r=await save({...make(level),simpleFiles:[image],notationFiles:[],publish:false});assert.equal(r.status,200,JSON.stringify(r));assert.equal(r.data.song.versionLevel,level);assert.equal(r.data.song.difficulty,undefined);}
  const duplicate=await save({...make(1),id:'duplicate',simpleFiles:[image],notationFiles:[]});assert.equal(duplicate.status,400);
  const saved=JSON.parse(fs.readFileSync(path.join(temp,'content/songs.json')));assert.equal(saved.length,5);
  const updated=await save({...make(3),editingId:'example-level-3',tempo:110,simpleFiles:[],notationFiles:[]});assert.equal(updated.status,200);assert.equal(updated.data.song.simplePages.length,1);assert.equal(updated.data.song.tempo,110);
  const normal={...make(3),editingId:'example-level-3',difficulty:'intermediate',simpleFiles:[],notationFiles:[]};delete normal.versionGroup;delete normal.versionLevel;const converted=await save(normal);assert.equal(converted.status,200);assert.equal(converted.data.song.versionGroup,undefined);
  console.log('PASS: shared model validation; isolated local API saves 5 versions; duplicate rejection; editing preserves pages; conversion removes group metadata.');
 }finally{server.kill();}
})().catch(e=>{console.error(e);process.exitCode=1});
