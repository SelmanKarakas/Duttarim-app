"use strict";

const $ = selector => document.querySelector(selector);
const state = {catalog:[],simpleFiles:[],notationFiles:[],editingId:null};
const versionEditor=createVersionEditor($('#versionEditor'),$('#difficulty'),()=>state.catalog);
const levelLabels={beginner:"Başlangıç",intermediate:"Orta",advanced:"İleri"};
const tuningLabels={normal:"Küçük düzen",big:"Büyük düzen"};

function slugify(value){
  return value.toLocaleLowerCase("tr")
    .normalize("NFD").replace(/[\u0300-\u036f]/g,"")
    .replace(/ı/g,"i").replace(/[^a-z0-9]+/g,"-")
    .replace(/^-+|-+$/g,"");
}

function showNotice(message,error=false){
  const notice=$("#notice");
  notice.textContent=message;
  notice.classList.toggle("error",error);
  notice.classList.remove("hidden");
  window.scrollTo({top:0,behavior:"smooth"});
}

function renderCatalog(){
  $("#songCount").textContent=state.catalog.length;
  $("#catalogList").innerHTML=state.catalog.map(song => {
    const pages=Math.max(song.simplePages?.length||0,song.notationPages?.length||0);
    return `<div class="catalog-row"><div><strong>${escapeHtml(song.title.latin)}</strong><small>${ScoreVersions.isVersion(song)?escapeHtml(song.versionGroup.title.latin)+" · "+song.versionLevel+". seviye":levelLabels[song.difficulty]||"Seviye belirtilmemiş"} · ${tuningLabels[song.tuning]||"Düzen belirtilmemiş"}</small><span>${pages} sayfa · ♩ ${song.tempo}</span></div><button type="button" data-edit="${escapeHtml(song.id)}">Düzenle</button></div>`;
  }).join("");
}

function escapeHtml(value){
  return String(value).replace(/[&<>"']/g,char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
}

function renderFiles(type){
  const files=state[type+"Files"];
  $("#"+type+"Preview").innerHTML=files.map((file,index) =>
    `<div class="file-item"><img src="${URL.createObjectURL(file)}" alt="Sayfa ${index+1}"><span>${index+1}. ${escapeHtml(file.name)}</span></div>`
  ).join("");
}

function updatePreview(){
  $("#previewTitle").textContent=$("#latinTitle").value||"Parça adı";
  $("#previewUg").textContent=$("#ugTitle").value;
  $("#previewMeta").textContent=["Dutar Eseri",levelLabels[$("#difficulty").value],tuningLabels[$("#tuning").value],"♩ "+($("#tempo").value||"–")].filter(Boolean).join(" · ");
}

function readAsDataUrl(file){
  return new Promise((resolve,reject) => {
    const reader=new FileReader();
    reader.onload=()=>resolve({name:file.name,data:reader.result});
    reader.onerror=()=>reject(reader.error);
    reader.readAsDataURL(file);
  });
}

async function loadCatalog(){
  const response=await fetch("/api/catalog",{cache:"no-store"});
  const data=await response.json();
  if(!response.ok) throw new Error(data.error||"Katalog okunamadı.");
  state.catalog=data.songs;
  renderCatalog();
}

async function submitSong(publish){
  if(!$("#songForm").reportValidity()) return;
  if(!state.editingId&&!state.simpleFiles.length&&!state.notationFiles.length){
    showNotice("En az bir nota sayfası seçin.",true); return;
  }
  if(publish&&!window.confirm("Bu nota main dalına commit edilip online yayınlanacak. Devam edilsin mi?")) return;
  const buttons=[$("#saveButton"),$("#publishButton")];
  buttons.forEach(button=>button.disabled=true);
  try{
    const versionFields=versionEditor.read();
    const payload={
      ...versionFields,
      id:!state.editingId&&versionFields.versionGroup?versionFields.versionGroup.id+'-level-'+versionFields.versionLevel:$('#songId').value,
      category:$("#category").value,
      difficulty:versionFields.versionGroup?undefined:$("#difficulty").value,
      tuning:$("#tuning").value,
      editingId:state.editingId,
      title:{latin:$("#latinTitle").value,ug:$("#ugTitle").value},
      tempo:Number($("#tempo").value),
      simpleFiles:await Promise.all(state.simpleFiles.map(readAsDataUrl)),
      notationFiles:await Promise.all(state.notationFiles.map(readAsDataUrl)),
      publish
    };
    const response=await fetch("/api/song",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
    const data=await response.json();
    if(!response.ok) throw new Error(data.error||"İşlem başarısız.");
    state.catalog=data.catalog;
    state.editingId=data.song.id;
    $("#songId").value=data.song.id;
    versionEditor.set(data.song);
    $("#songId").readOnly=true;
    $("#songId").dataset.edited="1";
    $("#editHint").classList.remove("hidden");
    $("#newSongButton").classList.remove("hidden");
    $("#editorTitle").textContent="Notayı düzenle";
    state.simpleFiles=[];state.notationFiles=[];
    $("#simpleFiles").value="";$("#notationFiles").value="";
    renderFiles("simple");renderFiles("notation");
    renderCatalog();
    showNotice(data.publication?.message||"Nota proje kataloğuna kaydedildi.");
  }catch(error){ showNotice(error.message,true); }
  finally{ buttons.forEach(button=>button.disabled=false); }
}

$("#latinTitle").addEventListener("input",event=>{
  if(!$("#songId").dataset.edited) $("#songId").value=slugify(event.target.value);
  updatePreview();
});
$("#songId").addEventListener("input",()=>{$("#songId").dataset.edited="1";});
$("#ugTitle").addEventListener("input",updatePreview);
$("#tempo").addEventListener("input",updatePreview);
$("#simpleFiles").addEventListener("change",event=>{state.simpleFiles=[...event.target.files];renderFiles("simple");});
$("#notationFiles").addEventListener("change",event=>{state.notationFiles=[...event.target.files];renderFiles("notation");});
$("#songForm").addEventListener("submit",event=>{event.preventDefault();submitSong(false);});
$("#publishButton").addEventListener("click",()=>submitSong(true));

loadCatalog().catch(error=>showNotice(error.message,true));

['category','difficulty','tuning'].forEach(id=>document.getElementById(id).addEventListener('change',updatePreview));
$('#catalogList').onclick=event=>{const button=event.target.closest('[data-edit]');if(!button)return;const song=state.catalog.find(s=>s.id===button.dataset.edit);if(!song)return;state.editingId=song.id;state.simpleFiles=[];state.notationFiles=[];$('#songForm').reset();versionEditor.set(song);$('#songId').value=song.id;$('#songId').readOnly=true;$('#songId').dataset.edited='1';$('#latinTitle').value=song.title.latin;$('#ugTitle').value=song.title.ug||'';$('#tempo').value=song.tempo||100;$('#category').value=song.category==='exercise'?'exercise':'piece';$('#difficulty').value=levelLabels[song.difficulty]?song.difficulty:'';$('#tuning').value=tuningLabels[song.tuning]?song.tuning:'';$('#editHint').classList.remove('hidden');$('#newSongButton').classList.remove('hidden');$('#editorTitle').textContent='Notayı düzenle';renderFiles('simple');renderFiles('notation');updatePreview();$('#latinTitle').focus();window.scrollTo({top:0,behavior:'smooth'});};
$('#newSongButton').onclick=()=>{state.editingId=null;state.simpleFiles=[];state.notationFiles=[];$('#songForm').reset();versionEditor.set(null);$('#songId').readOnly=false;delete $('#songId').dataset.edited;$('#editHint').classList.add('hidden');$('#newSongButton').classList.add('hidden');$('#editorTitle').textContent='Yeni nota ekle';renderFiles('simple');renderFiles('notation');updatePreview();};
