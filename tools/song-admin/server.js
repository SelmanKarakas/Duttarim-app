"use strict";

const http = require("http");
const fs = require("fs");
const fsp = fs.promises;
const path = require("path");
const {execFile} = require("child_process");

const HOST = "127.0.0.1";
const PORT = Number(process.env.DUTTARIM_ADMIN_PORT || 4173);
const ADMIN_DIR = __dirname;
const REPO_DIR = path.resolve(__dirname,"..","..");
const CONTENT_DIR = path.join(REPO_DIR,"content");
const SONGS_DIR = path.join(CONTENT_DIR,"songs");
const CATALOG_PATH = path.join(CONTENT_DIR,"songs.json");
const MAX_BODY_BYTES = 80 * 1024 * 1024;

const MIME_TYPES = {
  ".css":"text/css; charset=utf-8",
  ".html":"text/html; charset=utf-8",
  ".js":"text/javascript; charset=utf-8",
  ".json":"application/json; charset=utf-8",
  ".png":"image/png",
  ".jpg":"image/jpeg",
  ".jpeg":"image/jpeg",
  ".webp":"image/webp"
};

function sendJson(res,status,data){
  const body = JSON.stringify(data);
  res.writeHead(status,{
    "Content-Type":"application/json; charset=utf-8",
    "Content-Length":Buffer.byteLength(body),
    "Cache-Control":"no-store"
  });
  res.end(body);
}

function safeId(value){
  return typeof value === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

function validatePayload(payload){
  if(!payload || !safeId(payload.id)) throw new Error("Geçersiz parça kimliği.");
  if(!payload.title || typeof payload.title.latin !== "string" || !payload.title.latin.trim()){
    throw new Error("Latin parça adı zorunludur.");
  }
  if(typeof payload.title.ug !== "string") throw new Error("Uygurca ad geçersiz.");
  if(!Number.isFinite(payload.tempo) || payload.tempo < 20 || payload.tempo > 300){
    throw new Error("Tempo 20–300 arasında olmalıdır.");
  }
  for(const key of ["simpleFiles","notationFiles"]){
    if(!Array.isArray(payload[key])) throw new Error("Nota sayfaları geçersiz.");
    for(const file of payload[key]){
      if(!file || typeof file.name !== "string" || typeof file.data !== "string"){
        throw new Error("Nota dosyası geçersiz.");
      }
      if(!/^data:image\/(?:png|jpeg|webp);base64,/.test(file.data)){
        throw new Error("Yalnızca PNG, JPG ve WEBP kabul edilir.");
      }
    }
  }
  if(!payload.simpleFiles.length && !payload.notationFiles.length){
    throw new Error("En az bir nota sayfası ekleyin.");
  }
}

function extensionFor(file){
  const match = /^data:image\/(png|jpeg|webp);base64,/.exec(file.data);
  return match[1] === "jpeg" ? ".jpg" : "." + match[1];
}

async function readCatalog(){
  const raw = await fsp.readFile(CATALOG_PATH,"utf8");
  const data = JSON.parse(raw);
  if(!Array.isArray(data)) throw new Error("songs.json bir dizi olmalıdır.");
  return data;
}

async function writeAtomic(filePath,content){
  const tempPath = filePath + ".tmp";
  await fsp.writeFile(tempPath,content);
  await fsp.copyFile(tempPath,filePath);
  await fsp.unlink(tempPath);
}

async function saveSong(payload){
  validatePayload(payload);
  await fsp.mkdir(SONGS_DIR,{recursive:true});

  const writtenPaths = [];
  const makePages = async (files,type) => {
    const pages = [];
    for(let index=0; index<files.length; index++){
      const file = files[index];
      const filename = `${payload.id}_${type}_${index + 1}${extensionFor(file)}`;
      const absolutePath = path.join(SONGS_DIR,filename);
      const base64 = file.data.slice(file.data.indexOf(",") + 1);
      await fsp.writeFile(absolutePath,Buffer.from(base64,"base64"));
      writtenPaths.push(path.posix.join("content","songs",filename));
      pages.push(path.posix.join("songs",filename));
    }
    return pages;
  };

  const simplePages = await makePages(payload.simpleFiles,"simple");
  const notationPages = await makePages(payload.notationFiles,"notation");
  const catalog = await readCatalog();
  const entry = {
    id:payload.id,
    title:{latin:payload.title.latin.trim(),ug:payload.title.ug.trim()},
    originKey:"uyghurDuttarPiece",
    tempo:Math.round(payload.tempo),
    simplePages,
    notationPages,
    sourceKey:"arrangedSource",
    arrangementKey:"bothViews"
  };
  const existingIndex = catalog.findIndex(song => song.id === payload.id);
  if(existingIndex === -1) catalog.push(entry);
  else catalog[existingIndex] = entry;

  await writeAtomic(CATALOG_PATH,JSON.stringify(catalog,null,2) + "\n");
  writtenPaths.push("content/songs.json");
  return {entry,writtenPaths};
}

function runGit(args){
  return new Promise((resolve,reject) => {
    execFile("git",["-c",`safe.directory=${REPO_DIR.replace(/\\/g,"/")}`,"-C",REPO_DIR,...args],
      {windowsHide:true},(error,stdout,stderr) => {
        if(error){
          error.message = (stderr || stdout || error.message).trim();
          reject(error);
          return;
        }
        resolve((stdout || stderr).trim());
      });
  });
}

async function publish(paths,songTitle){
  const branch = await runGit(["branch","--show-current"]);
  if(branch !== "main") throw new Error("Yayınlamak için Git dalı main olmalıdır.");
  const alreadyStaged = await runGit(["diff","--cached","--name-only"]);
  if(alreadyStaged) throw new Error("Git alanında önceden hazırlanmış dosyalar var. Önce onları commit edin veya çıkarın.");
  await runGit(["add","--",...paths]);
  const staged = await runGit(["diff","--cached","--name-only"]);
  if(!staged) return {message:"Dosyalar zaten güncel; yeni commit gerekmedi."};
  await runGit(["commit","-m",`Add notation: ${songTitle}`]);
  await runGit(["push","origin","main"]);
  const commit = await runGit(["rev-parse","--short","HEAD"]);
  return {message:`Yayınlandı (${commit}).`,commit};
}

async function readBody(req){
  return new Promise((resolve,reject) => {
    const chunks = [];
    let size = 0;
    req.on("data",chunk => {
      size += chunk.length;
      if(size > MAX_BODY_BYTES){
        reject(new Error("Toplam dosya boyutu çok büyük."));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end",() => {
      try{ resolve(JSON.parse(Buffer.concat(chunks).toString("utf8"))); }
      catch(error){ reject(new Error("İstek verisi okunamadı.")); }
    });
    req.on("error",reject);
  });
}

async function serveStatic(req,res){
  const urlPath = new URL(req.url,"http://localhost").pathname;
  const relative = urlPath === "/" ? "index.html" : decodeURIComponent(urlPath.slice(1));
  const filePath = path.resolve(ADMIN_DIR,relative);
  if(!filePath.startsWith(ADMIN_DIR + path.sep)){
    sendJson(res,403,{error:"Erişim reddedildi."});
    return;
  }
  try{
    const body = await fsp.readFile(filePath);
    res.writeHead(200,{
      "Content-Type":MIME_TYPES[path.extname(filePath).toLowerCase()] || "application/octet-stream",
      "Content-Length":body.length,
      "Cache-Control":"no-store"
    });
    res.end(body);
  }catch(error){
    sendJson(res,404,{error:"Bulunamadı."});
  }
}

const server = http.createServer(async (req,res) => {
  try{
    if(req.method === "GET" && req.url === "/api/catalog"){
      sendJson(res,200,{songs:await readCatalog()});
      return;
    }
    if(req.method === "POST" && req.url === "/api/song"){
      const payload = await readBody(req);
      const result = await saveSong(payload);
      let publication = null;
      if(payload.publish) publication = await publish(result.writtenPaths,result.entry.title.latin);
      sendJson(res,200,{song:result.entry,publication,catalog:await readCatalog()});
      return;
    }
    await serveStatic(req,res);
  }catch(error){
    sendJson(res,400,{error:error.message || "İşlem başarısız."});
  }
});

server.listen(PORT,HOST,() => {
  console.log(`Duttarim Nota Paneli: http://${HOST}:${PORT}`);
});
