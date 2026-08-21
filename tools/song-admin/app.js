"use strict";

const $ = selector => document.querySelector(selector);
const state = {catalog:[],simpleFiles:[],notationFiles:[]};

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
    return `<div class="catalog-row"><strong>${escapeHtml(song.title.latin)}</strong><span>${pages} sayfa · ♩ ${song.tempo}</span></div>`;
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
  $("#previewMeta").textContent="♩ "+($("#tempo").value||"–");
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
  if(!state.simpleFiles.length&&!state.notationFiles.length){
    showNotice("En az bir nota sayfası seçin.",true); return;
  }
  if(publish&&!window.confirm("Bu nota main dalına commit edilip online yayınlanacak. Devam edilsin mi?")) return;
  const buttons=[$("#saveButton"),$("#publishButton")];
  buttons.forEach(button=>button.disabled=true);
  try{
    const payload={
      id:$("#songId").value,
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
