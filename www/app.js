(function(){
"use strict";

var $=function(s){
  return document.querySelector(s);
};

var $$=function(s){
  return Array.from(
    document.querySelectorAll(s)
  );
};


/* =========================================
   TRANSLATIONS
   ========================================= */

var translations={

tr:{
  normal:"NORMAL AKORT",
  big:"BÜYÜK AKORT",
  flat:"PES",
  sharp:"TİZ",
  ready:"HAZIR",
  listening:"DİNLİYOR",
  inTune:"AKORT TAMAM",
  noSignal:"SES BEKLENİYOR",
  micError:"MİKROFONA ERİŞİLEMEDİ",

  string1:"1. TEL · ZİL",
  string2:"2. TEL · BOM",

  tapString:"Akort etmek istediğiniz tele dokunun.",

  tuner:"AKORT",
  frets:"PERDELER",
  songs:"PARÇALAR",

  aboutTitle:"Hakkında",
  feedback:"Geri Bildirim Gönder",

  fretsTitle:"Perde Haritası",
  fretsSub:"Alt tel (1. tel / zil) üzerindeki 15 perde ve nota karşılıkları.",

  songsTitle:"Parçalar",
  songsSub:"Duttar için hazırlanmış notalar ve çalma önerileri.",
  comingSoon:"Yakında geliyor",
  allSongs:"Tümü",
  favorites:"Favoriler",
  songsComingTitle:"Bu bölüm yakında geliyor",
  songsComingText:"Duttar parçaları, notalar ve detaylı çalma önerileri üzerinde çalışıyoruz.",
  songPlaceholder:"Yakında eklenecek",
  duttarSongs:"Duttar parçaları",

  settings:"Ayarlar",
  settingsSub:"Dili, referans frekansını ve uygulama tercihlerini yönetin.",

  language:"Dil",
  appLanguage:"Uygulama dili",

  favorites:"Favoriler",
  newSong:"Yeni",
  pages:"sayfa",
  tempo:"Tempo",

  tuningSettings:"Akort ayarları",
  reference:"Referans frekansı",
  notation:"Nota gösterimi",

  about:"Duttar için sade, kültürel motiflerden esinlenen hassas akort uygulaması.",

  startMic:"MİKROFONU BAŞLAT",
  stopMic:"DİNLEMEYİ DURDUR",

  chooseLanguage:"Başlamak için dilinizi seçin.",

  micTitle:"Mikrofon izni",
  micExplain:"Duttarınızın sesini dinleyip doğru notayı göstermek için mikrofon erişimi gerekir.",
  allowMic:"MİKROFONA İZİN VER",

  home:"Ana sayfa",
  openSettings:"Ayarlar",

  preview:"DİNLE",
  privacy:"Gizlilik Politikası",

  songsSub:"Duttar için derlenmiş ve düzenlenmiş nota kaynakları.",

  simplified:"Basitleştirilmiş",
  normalNotation:"Nota",

  backToSongs:"Parçalar",
  sourceNotes:"Kaynak ve Notlar",

  uyghurDuttarPiece:"Uygur Duttar Eseri",

  arrangedSource:"Düzenlenmiş nota kaynağı.",
  bothViews:"Basitleştirilmiş ve klasik nota görünümü birlikte sunulur.",

  simplifiedMissing:"Basitleştirilmiş nota henüz eklenmedi.",
  notationMissing:"Normal nota henüz eklenmedi.",

  newSongAdded:"Yeni nota eklendi: {title}",
  newSongsAdded:"{count} yeni nota eklendi."

},

en:{
  normal:"STANDARD TUNING",
  big:"HIGH TUNING",
  flat:"FLAT",
  sharp:"SHARP",
  ready:"READY",
  listening:"LISTENING",
  inTune:"IN TUNE",
  noSignal:"WAITING FOR SOUND",
  micError:"MICROPHONE UNAVAILABLE",

  string1:"STRING 1 · ZIL",
  string2:"STRING 2 · BOM",

  aboutTitle:"About",
  feedback:"Send Feedback",

  tapString:"Tap the string you want to tune.",

  tuner:"TUNER",
  frets:"FRETS",
  songs:"SONGS",

  favorites:"Favorites",
  newSong:"New",
  pages:"pages",
  tempo:"Tempo",

  fretsTitle:"Fret Map",
  fretsSub:"The 15 frets and notes on the lower string (string 1 / zil).",

  songsTitle:"Songs",
  songsSub:"Notes and playing guides prepared for the duttar.",
  comingSoon:"Coming soon",
  allSongs:"All",
  favorites:"Favorites",
  songsComingTitle:"This section is coming soon",
  songsComingText:"We are working on duttar songs, notes and detailed playing guides.",
  songPlaceholder:"Coming soon",
  duttarSongs:"Duttar songs",

  settings:"Settings",
  settingsSub:"Manage language, reference frequency and app preferences.",

  language:"Language",
  appLanguage:"App language",

  tuningSettings:"Tuning settings",
  reference:"Reference frequency",
  notation:"Note notation",

  about:"A precise, minimal dutar tuner inspired by cultural motifs.",

  startMic:"START MICROPHONE",
  stopMic:"STOP LISTENING",

  chooseLanguage:"Choose your language to begin.",

  micTitle:"Microphone access",
  micExplain:"Microphone access is required to listen to your dutar and identify the note.",
  allowMic:"ALLOW MICROPHONE",

  home:"Home",
  openSettings:"Settings",

  preview:"LISTEN",
  privacy:"Privacy Policy",

    songsSub:"Collected and arranged notation resources for the duttar.",

    simplified:"Simplified",
    normalNotation:"Notation",

    backToSongs:"Songs",

    sourceNotes:"Sources and Notes",

    uyghurDuttarPiece:"Uyghur Duttar Piece",

    arrangedSource:"Arranged notation source.",
    bothViews:"Simplified and standard notation views are provided.",

    simplifiedMissing:"Simplified notation has not been added yet.",
    notationMissing:"Standard notation has not been added yet.",

    newSongAdded:"New notation added: {title}",
    newSongsAdded:"{count} new notations added."
},

ug:{
  normal:"نورمال تەڭشەش",
  big:"چوڭ تەڭشەش",
  flat:"پەس",
  sharp:"ئېگىز",
  ready:"تەييار",
  listening:"ئاڭلاۋاتىدۇ",
  inTune:"توغرا تەڭشەلدى",
  noSignal:"ئاۋاز كۈتۈۋاتىدۇ",
  micError:"مىكروفوننى ئىشلەتكىلى بولمىدى",

  string1:"1-تار · زىل",
  string2:"2-تار · بوم",

  favorites:"ياقتۇرغانلار",
  newSong:"يېڭى",
  pages:"بەت",
  tempo:"تېمپو",

  aboutTitle:"ھەققىدە",
  feedback:"پىكىر ئەۋەتىش",

  tapString:"تەڭشىمەكچى بولغان تارغا ئۇرۇڭ.",

  tuner:"تەڭشىگۈچ",
  frets:"پەردىلەر",
  songs:"ناخشىلار",

  fretsTitle:"پەردە خەرىتىسى",
  fretsSub:"تۆۋەنكى تارنىڭ 15 پەردىسى ۋە نوتىلىرى.",


 songsTitle:"ناخشىلار",
 songsSub:"دۇتتار ئۈچۈن تەييارلانغان نوتىلار ۋە ئەسەر تەۋسىيەلىرى",
 comingSoon:"يېقىندا كېلىدۇ",
 allSongs:"ھەممىسى",
 favorites:"ياختۇرغانلىرىڭىز",
 songsComingTitle:"بۇ قىسىم يېقىندا كېلىدۇ",
 songsComingText:"دۇتتار ئەسەرلىرى ، نوتىلار ۋە تەپسىلاتلىق ئەسەر تەۋسىيەلىرى ئۈستىدە ئىشلەۋاتىمىز.",
 songPlaceholder:"يېقىندا قوشۇلىدۇ",
 duttarSongs:"دۇتتار ئەسەرلىرى",

  settings:"تەڭشەكلەر",
  settingsSub:"تىل، پايدىلىنىش چاستوتىسى ۋە ئەپ تاللانمىلىرى.",

  language:"تىل",
  appLanguage:"ئەپ تىلى",

  tuningSettings:"تەڭشەش تاللانمىلىرى",
  reference:"پايدىلىنىش چاستوتىسى",
  notation:"نوتا كۆرسىتىش",

  about:"مەدەنىي نەقىشلەردىن ئىلھاملانغان ئاددىي ۋە توغرا دۇتار تەڭشىگۈچ.",

  startMic:"مىكروفوننى قوزغىتىش",
  stopMic:"ئاڭلاشنى توختىتىش",

  chooseLanguage:"باشلاش ئۈچۈن تىلنى تاللاڭ.",

  micTitle:"مىكروفون ئىجازىتى",
  micExplain:"دۇتار ئاۋازىنى ئاڭلاپ نوتىنى تېپىش ئۈچۈن مىكروفون زۆرۈر.",
  allowMic:"مىكروفونغا ئىجازەت بېرىش",

  home:"باش بەت",
  openSettings:"تەڭشەكلەر",

  preview:"ئاڭلاڭ",
  privacy:"مەخپىيەتلىك سىياسىتى",

  songsSub:"دۇتتار ئۈچۈن توپلانغان ۋە تەھرىرلەنگەن نوتا مەنبەلىرى.",

  simplified:"ئاددىيلاشتۇرۇلغان",
  normalNotation:"نوتا",

  backToSongs:"ناخشىلار",

  sourceNotes:"مەنبە ۋە ئىزاھات",

  uyghurDuttarPiece:"ئۇيغۇر دۇتتار ئەسىرى",

  arrangedSource:"تەھرىرلەنگەن نوتا مەنبەسى.",
  bothViews:"ئاددىيلاشتۇرۇلغان ۋە نورمال نوتا كۆرۈنۈشى تەمىنلەنگەن.",

  simplifiedMissing:"ئاددىيلاشتۇرۇلغان نوتا تېخى قوشۇلمىدى.",
  notationMissing:"نورمال نوتا تېخى قوشۇلمىدى.",

  newSongAdded:"يېڭى نوتا قوشۇلدى: {title}",
  newSongsAdded:"{count} يېڭى نوتا قوشۇلدى."
}

};


/* =========================================
   STATE
   ========================================= */

var lang=
  localStorage.getItem("dutarLang")||
  "tr";

var noteStyle=
  localStorage.getItem("noteStyle")||
  "solfege";

var mode="normal";
var activeString=0;
var currentPanel="tuner";


/* Microphone */

var audioCtx=null;
var analyser=null;
var stream=null;
var raf=0;

var listening=false;
var noSignalFrames=0;


/*
 * Lifecycle state
 */

var userWantsListening=false;

var sessionCompleted=false;
var wasInTune=false;


/* Native tuner */

var nativeTuner=
  window.Capacitor &&
  window.Capacitor.Plugins &&
  window.Capacitor.Plugins.DutarTuner;

var nativePitchListener=null;
var nativeWatchdog=0;


/* Pitch */

var pitchHistory=[];

var displayedNeedleAngle=0;
var targetNeedleAngle=0;

var needleRaf=0;

var lastValidPitchAt=0;
var lastPitchEventAt=0;


/* Calibration */

var referenceHz=
  Number(
    localStorage.getItem(
      "referenceHz"
    )
  )||440;


/* Reference tone */

var toneCtx=null;
var toneOscillators=[];
var toneTimer=0;


/* Tuning completion */

var tuneAttemptTimer=0;
var tuneAttemptStartedAt=0;
var tuneEvidence=0;

var TUNE_CONFIRM_MS=2200;
var TUNE_REQUIRED_HITS=3;

var IN_TUNE_CENTS=8;
var DECAY_TOLERANCE_CENTS=12;

var lastInTuneAt=0;
var tuneGraceMs=1500;


/* =========================================
   TUNINGS
   ========================================= */

var tunings={

normal:[
  {
    note:"D",
    octave:3,
    hz:146.83
  },
  {
    note:"G",
    octave:3,
    hz:196.00
  }
],

big:[
  {
    note:"D",
    octave:3,
    hz:146.83
  },
  {
    note:"A",
    octave:3,
    hz:220.00
  }
]

};


/* =========================================
   NOTE NAMES
   ========================================= */

var solfege={
  C:"DO",
  "C#":"DO♯",

  D:"RE",
  "D#":"RE♯",

  E:"Mİ",

  F:"FA",
  "F#":"FA♯",

  G:"SOL",
  "G#":"SOL♯",

  A:"LA",
  "A#":"LA♯",

  B:"Sİ"
};
/* =========================================
   SONGS
   ========================================= */

var songsData = [];

var LOCAL_SONGS_URL =
  "data/songs-local.json";

var REMOTE_SONGS_URL =
  "https://selmankarakas.github.io/Duttarim-app/content/songs.json";

/* Set only after the Worker is deployed and its /health endpoint is verified. */
var ADMIN_API_URL =
  "https://duttarim-content-api.duttarim-content-api.workers.dev";

var SONGS_CACHE_KEY =
  "duttarimSongsCacheV1";

var KNOWN_SONG_IDS_KEY =
  "duttarimKnownSongIdsV1";

var NEW_SONG_IDS_KEY =
  "duttarimNewSongIdsV1";

var remoteRefreshPromise = null;


function readStoredArray(key){

  try{

    var value =
      JSON.parse(
        localStorage.getItem(key) ||
        "[]"
      );

    return Array.isArray(value)
      ? value
      : [];

  }catch(e){

    return [];
  }
}


function writeStoredArray(key,value){

  try{

    localStorage.setItem(
      key,
      JSON.stringify(value)
    );

  }catch(e){

    console.warn(
      "Song state could not be saved",
      e
    );
  }
}


function validSong(song){

  return !!(
    song &&
    typeof song.id === "string" &&
    song.id &&
    song.title &&
    typeof song.title.latin === "string" &&
    Array.isArray(song.simplePages) &&
    Array.isArray(song.notationPages)
  );
}


function normaliseCatalog(data,baseUrl){

  if(!Array.isArray(data)){
    throw new Error("Invalid songs catalog");
  }

  var ids = Object.create(null);

  return data.map(
    function(rawSong){

      if(!validSong(rawSong)){
        throw new Error("Invalid song entry");
      }

      if(ids[rawSong.id]){
        throw new Error("Duplicate song id");
      }

      ids[rawSong.id] = true;

      var song =
        Object.assign({},rawSong);

      ["simplePages","notationPages"]
        .forEach(
          function(key){

            song[key] =
              rawSong[key].map(
                function(page){

                  if(typeof page !== "string"){
                    throw new Error("Invalid score page");
                  }

                  if(!baseUrl){
                    return page;
                  }

                  return new URL(
                    page,
                    baseUrl
                  ).href;
                }
              );
          }
        );

      return song;
    }
  );
}


function applyNewSongFlags(songs){

  var unreadIds =
    readStoredArray(
      NEW_SONG_IDS_KEY
    );

  return songs.map(
    function(song){

      return Object.assign(
        {},
        song,
        {
          isNew:
            unreadIds.indexOf(
              song.id
            ) !== -1
        }
      );
    }
  );
}


async function fetchSongCatalog(url,baseUrl){

  var response =
    await fetch(
      url,
      {cache:"no-store"}
    );

  if(!response.ok){
    throw new Error("Songs catalog unavailable");
  }

  return normaliseCatalog(
    await response.json(),
    baseUrl
  );
}


function loadCachedSongs(){

  try{

    var cached =
      JSON.parse(
        localStorage.getItem(
          SONGS_CACHE_KEY
        ) ||
        "[]"
      );

    return normaliseCatalog(
      cached,
      null
    );

  }catch(e){

    return [];
  }
}


function saveSongsCache(songs){

  try{

    localStorage.setItem(
      SONGS_CACHE_KEY,
      JSON.stringify(songs)
    );

  }catch(e){

    console.warn(
      "Songs cache could not be saved",
      e
    );
  }
}


function formatTranslation(key,values){

  return Object.keys(values)
    .reduce(
      function(text,keyName){

        return text.replace(
          "{" + keyName + "}",
          String(values[keyName])
        );
      },
      t(key)
    );
}


function showSongsToast(message){

  var toast =
    document.getElementById(
      "songsToast"
    );

  if(!toast){

    toast = document.createElement("div");
    toast.id = "songsToast";
    toast.className = "songs-toast";
    toast.setAttribute("role","status");
    toast.setAttribute("aria-live","polite");
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.classList.add("visible");

  window.clearTimeout(
    showSongsToast.timeoutId
  );

  showSongsToast.timeoutId =
    window.setTimeout(
      function(){
        toast.classList.remove("visible");
      },
      5000
    );
}


async function notifyNewSongs(newSongs){

  if(!newSongs.length){
    return;
  }

  var message =
    newSongs.length === 1
      ? formatTranslation(
          "newSongAdded",
          {title:songTitle(newSongs[0])}
        )
      : formatTranslation(
          "newSongsAdded",
          {count:newSongs.length}
        );

  showSongsToast(message);

  var localNotifications =
    window.Capacitor &&
    window.Capacitor.Plugins &&
    window.Capacitor.Plugins.LocalNotifications;

  if(
    !localNotifications ||
    !localNotifications.checkPermissions ||
    !localNotifications.schedule
  ){
    return;
  }

  try{

    var permission =
      await localNotifications
        .checkPermissions();

    if(permission.display !== "granted"){
      return;
    }

    await localNotifications.schedule({
      notifications:[{
        id:Math.floor(Date.now() / 1000) % 2147483647,
        title:"Duttarim",
        body:message
      }]
    });

  }catch(e){

    console.warn(
      "System notification unavailable",
      e
    );
  }
}


async function refreshSongsFromRemote(){

  if(remoteRefreshPromise){
    return remoteRefreshPromise;
  }

  remoteRefreshPromise =
    (async function(){

      try{

        var remoteSongs =
          await fetchSongCatalog(
            REMOTE_SONGS_URL,
            REMOTE_SONGS_URL
          );

        var knownIds =
          readStoredArray(
            KNOWN_SONG_IDS_KEY
          );

        var unreadIds =
          readStoredArray(
            NEW_SONG_IDS_KEY
          );

        var newSongs =
          remoteSongs.filter(
            function(song){
              return knownIds.indexOf(song.id) === -1;
            }
          );

        newSongs.forEach(
          function(song){

            if(unreadIds.indexOf(song.id) === -1){
              unreadIds.push(song.id);
            }
          }
        );

        writeStoredArray(
          NEW_SONG_IDS_KEY,
          unreadIds
        );

        writeStoredArray(
          KNOWN_SONG_IDS_KEY,
          remoteSongs.map(
            function(song){
              return song.id;
            }
          )
        );

        saveSongsCache(remoteSongs);

        songsData =
          applyNewSongFlags(
            remoteSongs
          );

        renderSongs();

        await notifyNewSongs(newSongs);

      }catch(e){

        console.log(
          "Using offline songs catalog"
        );
      }finally{

        remoteRefreshPromise = null;
      }
    })();

  return remoteRefreshPromise;
}


async function initialiseSongs(){

  var localSongs = [];

  try{

    localSongs =
      await fetchSongCatalog(
        LOCAL_SONGS_URL,
        null
      );

  }catch(e){

    console.warn(
      "Bundled songs catalog unavailable",
      e
    );
  }

  var knownIds =
    readStoredArray(
      KNOWN_SONG_IDS_KEY
    );

  if(!knownIds.length && localSongs.length){

    writeStoredArray(
      KNOWN_SONG_IDS_KEY,
      localSongs.map(
        function(song){
          return song.id;
        }
      )
    );
  }

  var cachedSongs =
    loadCachedSongs();

  songsData =
    applyNewSongFlags(
      cachedSongs.length
        ? cachedSongs
        : localSongs
    );

  renderSongs();

  refreshSongsFromRemote();
}

function adminSlug(value){
  return value.toLocaleLowerCase("tr-TR").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/ı/g,"i").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
}

function adminFileExtension(file){
  if(file.type === "image/png") return "png";
  if(file.type === "image/webp") return "webp";
  return "jpg";
}

function adminReadFile(file){
  return new Promise(function(resolve,reject){
    var reader = new FileReader();
    reader.onload = function(){ resolve(String(reader.result)); };
    reader.onerror = function(){ reject(new Error("Resim okunamadı")); };
    reader.readAsDataURL(file);
  });
}

async function publishAdminSong(event){
  event.preventDefault();
  var status = document.getElementById("adminStatus");
  var button = document.getElementById("adminPublish");
  status.className = "admin-status";

  if(!ADMIN_API_URL){
    status.textContent = "Yayın servisi henüz bağlanmadı.";
    status.classList.add("error");
    return;
  }

  var title = document.getElementById("adminLatinTitle").value.trim();
  var id = adminSlug(title);
  var simple = Array.from(document.getElementById("adminSimpleFiles").files || []);
  var notation = Array.from(document.getElementById("adminNotationFiles").files || []);
  if(!id || !simple.length || !notation.length){
    status.textContent = "Adı ve her iki nota türünün resimlerini seçin.";
    status.classList.add("error");
    return;
  }
  if(songsData.some(function(song){ return song.id === id; })){
    status.textContent = "Bu isimde bir nota zaten var.";
    status.classList.add("error");
    return;
  }

  button.disabled = true;
  status.textContent = "Resimler hazırlanıyor…";
  try{
    var uploads = [];
    async function prepare(files,kind){
      var paths = [];
      for(var index=0; index<files.length; index+=1){
        var file = files[index];
        var path = "songs/" + id.replace(/-/g,"_") + "_" + kind + "_" + (index+1) + "." + adminFileExtension(file);
        paths.push(path);
        uploads.push({path:path,type:file.type,base64:await adminReadFile(file)});
      }
      return paths;
    }
    var simplePaths = await prepare(simple,"basit");
    var notationPaths = await prepare(notation,"normal");
    var cleanCatalog = songsData.map(function(song){
      var copy = Object.assign({},song);
      delete copy.isNew;
      return copy;
    });
    cleanCatalog.push({
      id:id,
      title:{latin:title,ug:document.getElementById("adminUyghurTitle").value.trim()},
      originKey:"uyghurDuttarPiece",
      tempo:Number(document.getElementById("adminTempo").value),
      simplePages:simplePaths,
      notationPages:notationPaths,
      sourceKey:"arrangedSource",
      arrangementKey:"bothViews"
    });
    status.textContent = "Yayınlanıyor…";
    var response = await fetch(ADMIN_API_URL + "/publish",{
      method:"POST",
      headers:{"content-type":"application/json","authorization":"Bearer " + document.getElementById("adminToken").value},
      body:JSON.stringify({catalog:cleanCatalog,files:uploads,message:"Add " + title + " from Duttarim app"})
    });
    var result = await response.json().catch(function(){ return {}; });
    if(!response.ok) throw new Error(result.error || "Yayın başarısız");
    status.textContent = "Nota yayınlandı. Liste kısa süre içinde yenilenecek.";
    status.classList.add("success");
    document.getElementById("adminSongForm").reset();
    window.setTimeout(refreshSongsFromRemote,3000);
  }catch(error){
    status.textContent = error.message || "Yayın başarısız";
    status.classList.add("error");
  }finally{
    button.disabled = false;
  }
}


/* FAVORITES */

var favoriteSongs =
  JSON.parse(
    localStorage.getItem(
      "favoriteSongs"
    ) || "[]"
  );


function isFavorite(songId){

  return favoriteSongs.indexOf(
    songId
  ) !== -1;
}


function toggleFavorite(songId){

  var index =
    favoriteSongs.indexOf(
      songId
    );

  if(index === -1){

    favoriteSongs.push(
      songId
    );

  }else{

    favoriteSongs.splice(
      index,
      1
    );
  }

  localStorage.setItem(
    "favoriteSongs",
    JSON.stringify(
      favoriteSongs
    )
  );

  renderSongs();
}


/* SONG NAME */

function songTitle(song){

  if(
    lang === "ug" &&
    song.title &&
    song.title.ug
  ){

    return song.title.ug;
  }

  return song.title.latin;
}


/* SONG STATE */

var activeSong = null;
var activeScorePage = 0;
var activeSongView = "simple";


/* SONG LIST */

function renderSongs(){

  var list =
    document.getElementById(
      "songList"
    );

  if(!list){
    return;
  }

  list.innerHTML =
    songsData.map(
      function(song){

        var simpleCount =
          (
            song.simplePages ||
            []
          ).length;

        var notationCount =
          (
            song.notationPages ||
            []
          ).length;

        var types = [];

        if(simpleCount){

          types.push(
            t("simplified")
          );
        }

        if(notationCount){

          types.push(
            t("normalNotation")
          );
        }

        /*
         * Kartta sayfa sayısı:
         * En uzun nota türünün sayfasını göster.
         */
        var totalPages =
          Math.max(
            simpleCount,
            notationCount
          );

        return (
          '<div class="song-card-wrap">' +

            '<button ' +
              'class="song-card" ' +
              'data-song-id="' +
              song.id +
              '" ' +
              'type="button">' +

              '<div class="song-card-icon">♪</div>' +

              '<div class="song-card-copy">' +

                '<div class="song-title-row">' +

                  '<strong class="song-card-title">' +
                    songTitle(song) +
                  '</strong>' +

                  (
                    song.isNew
                      ? '<span class="song-new">' +
                          t("newSong") +
                        '</span>'
                      : ''
                  ) +

                '</div>' +

                '<span class="song-card-meta">' +
                  t(song.originKey) +
                '</span>' +

                '<div class="song-card-tags">' +

                  '<span>' +
                    types.join(" · ") +
                  '</span>' +

                  (
                    song.tempo
                      ? '<span>♩ ' +
                          song.tempo +
                        '</span>'
                      : ''
                  ) +

                  (
                    totalPages
                      ? '<span>' +
                          totalPages +
                          ' ' +
                          t("pages") +
                        '</span>'
                      : ''
                  ) +

                '</div>' +

              '</div>' +

            '</button>' +

            '<button ' +
              'class="song-favorite-btn ' +
              (
                isFavorite(song.id)
                  ? 'active'
                  : ''
              ) +
              '" ' +
              'data-favorite-id="' +
              song.id +
              '" ' +
              'type="button" ' +
              'aria-label="' +
              t("favorites") +
              '">' +

              (
                isFavorite(song.id)
                  ? '♥'
                  : '♡'
              ) +

            '</button>' +

          '</div>'
        );
      }
    )
    .join("");


  document
    .querySelectorAll(
      ".song-card"
    )
    .forEach(
      function(card){

        card.onclick =
          function(){

            openSong(
              card.dataset.songId
            );
          };
      }
    );


  document
    .querySelectorAll(
      ".song-favorite-btn"
    )
    .forEach(
      function(button){

        button.onclick =
          function(e){

            e.preventDefault();
            e.stopPropagation();

            toggleFavorite(
              button.dataset.favoriteId
            );
          };
      }
    );
}


/* AVAILABLE VIEWS */

function updateSongViewAvailability(song){

  var simpleBtn =
    document.querySelector(
      '[data-song-view="simple"]'
    );

  var notationBtn =
    document.querySelector(
      '[data-song-view="notation"]'
    );

  var tabs =
    document.querySelector(
      ".song-view-tabs"
    );

  var hasSimple =
    !!(
      song.simplePages &&
      song.simplePages.length
    );

  var hasNotation =
    !!(
      song.notationPages &&
      song.notationPages.length
    );


  if(simpleBtn){

    simpleBtn.classList.toggle(
      "hidden",
      !hasSimple
    );
  }


  if(notationBtn){

    notationBtn.classList.toggle(
      "hidden",
      !hasNotation
    );
  }


  if(tabs){

    tabs.classList.toggle(
      "single",
      hasSimple !== hasNotation
    );
  }


  if(hasSimple){

    activeSongView =
      "simple";

  }else if(hasNotation){

    activeSongView =
      "notation";
  }
}


/* CURRENT PAGES */

function getCurrentPages(){

  if(!activeSong){
    return [];
  }

  if(
    activeSongView ===
    "notation"
  ){

    return (
      activeSong.notationPages ||
      []
    );
  }

  return (
    activeSong.simplePages ||
    []
  );
}


/* RENDER CURRENT PAGE */

function renderCurrentScorePage(){

  if(!activeSong){
    return;
  }

  var pages =
    getCurrentPages();

  var container =
    activeSongView === "notation"
      ? document.getElementById(
          "notationSheet"
        )
      : document.getElementById(
          "simpleScore"
        );

  if(!container){
    return;
  }


  if(!pages.length){

    container.innerHTML =
      '<div class="notation-placeholder">' +
        (
          activeSongView === "notation"
            ? t("notationMissing")
            : t("simplifiedMissing")
        ) +
      '</div>';

    updateScorePagination(0);

    return;
  }


  if(
    activeScorePage >=
    pages.length
  ){

    activeScorePage = 0;
  }


  container.innerHTML =
    '<img ' +
      'class="song-score-image" ' +
      'src="' +
      pages[activeScorePage] +
      '" ' +
      'alt="' +
      songTitle(activeSong) +
      '">' ;


  updateScorePagination(
    pages.length
  );

  applyScoreZoom();
}


/* PAGINATION */

function updateScorePagination(
  pageCount
){

  var pagination =
    document.getElementById(
      "scorePagination"
    );

  var label =
    document.getElementById(
      "scorePageLabel"
    );

  var previous =
    document.getElementById(
      "scorePrevPage"
    );

  var next =
    document.getElementById(
      "scoreNextPage"
    );


  if(!pagination){
    return;
  }


  if(pageCount <= 1){

    pagination.classList.add(
      "hidden"
    );

    return;
  }


  pagination.classList.remove(
    "hidden"
  );


  if(label){

    label.textContent =
      (
        activeScorePage + 1
      ) +
      " / " +
      pageCount;
  }


  if(previous){

    previous.disabled =
      activeScorePage === 0;
  }


  if(next){

    next.disabled =
      activeScorePage ===
      pageCount - 1;
  }
}


/* OPEN SONG */

function openSong(songId){

  var song =
    songsData.find(
      function(item){

        return (
          item.id === songId
        );
      }
    );

  if(!song){
    return;
  }

  if(song.isNew){

    var unreadIds =
      readStoredArray(
        NEW_SONG_IDS_KEY
      ).filter(
        function(id){
          return id !== songId;
        }
      );

    writeStoredArray(
      NEW_SONG_IDS_KEY,
      unreadIds
    );

    song.isNew = false;
    renderSongs();
  }


  activeSong =
    song;

  activeScorePage =
    0;

  scoreZoom =
    1;


  updateSongViewAvailability(
    song
  );


  document
    .getElementById(
      "songsHome"
    )
    .classList
    .add(
      "hidden"
    );


  document
    .getElementById(
      "songDetail"
    )
    .classList
    .remove(
      "hidden"
    );


  document.getElementById(
    "songDetailTitle"
  ).textContent =
    songTitle(song);


  document.getElementById(
    "songDetailOrigin"
  ).textContent =
    t(song.originKey);


  document.getElementById(
    "songSource"
  ).textContent =
    t(song.sourceKey);


  document.getElementById(
    "songArrangement"
  ).textContent =
    t(song.arrangementKey);


  switchSongView(
    activeSongView
  );


  document
    .getElementById(
      "songsPanel"
    )
    .scrollTop = 0;
}


/* SWITCH SIMPLE / NORMAL */

function switchSongView(view){

  if(!activeSong){
    return;
  }


  var pages =
    view === "notation"
      ? activeSong.notationPages
      : activeSong.simplePages;


  /*
   * Olmayan nota tipine
   * geçilmesine izin verme.
   */
  if(
    !pages ||
    !pages.length
  ){
    return;
  }


  activeSongView =
    view;

  activeScorePage =
    0;


  document
    .querySelectorAll(
      ".song-view-btn"
    )
    .forEach(
      function(btn){

        btn.classList.toggle(
          "active",
          btn.dataset.songView ===
          view
        );
      }
    );


  var simpleView =
    document.getElementById(
      "songSimpleView"
    );

  var notationView =
    document.getElementById(
      "songNotationView"
    );


  if(simpleView){

    simpleView.classList.toggle(
      "active",
      view === "simple"
    );
  }


  if(notationView){

    notationView.classList.toggle(
      "active",
      view === "notation"
    );
  }


  renderCurrentScorePage();
}


/* FULLSCREEN */
function toggleScoreFullscreen(){

  var detail =
    document.getElementById(
      "songDetail"
    );

  if(!detail){
    return;
  }

  document.body.classList.toggle(
    "score-fullscreen"
  );

  detail.classList.toggle(
    "score-fullscreen-active"
  );
}
/* =========================================
   FRET DATA
   ========================================= */
var fretData = [
  {number:"2#",  note:"D#"},
  {number:"3-2", note:"E"},
  {number:"4",   note:"F"},
  {number:"4#",  note:"F#"},

  {number:"5",   note:"G"},
  {number:"6",   note:"A"},
  {number:"6#",  note:"A#"},
  {number:"7",   note:"B"},
  {number:"1",   note:"C",  octave:true},

  {number:"2",   note:"D",  octave:true},
  {number:"2#",  note:"D#", octave:true},
  {number:"3",   note:"E",  octave:true},
  {number:"4",   note:"F",  octave:true},
  {number:"4#",  note:"F#", octave:true},
  {number:"5",   note:"G",  octave:true}
];

/* =========================================
   TRANSLATION HELPERS
   ========================================= */

function t(k){

  return (
    translations[lang] &&
    translations[lang][k]
  ) ||
  translations.tr[k] ||
  k;
}


function noteName(n){

  return noteStyle==="letters"
    ?n
    :(solfege[n]||n);
}


function targetLabel(target){

  return noteName(
    target.note
  );
}


function calibratedHz(base){

  return base*
    (
      referenceHz/440
    );
}


/* =========================================
   RENDER
   ========================================= */

function renderCalibration(){

  var button=
    $("#calibrateBtn");

  if(button){

    button.textContent=
      "A4 = "+
      referenceHz+
      " Hz";
  }
}


function applyLanguage(v){

  lang=v;

  localStorage.setItem(
    "dutarLang",
    v
  );

  document.documentElement.lang=v;

  document.documentElement.dir=
    v==="ug"
      ?"rtl"
      :"ltr";


  $$("[data-i18n]")
    .forEach(
      function(el){

        el.textContent=
          t(
            el.dataset.i18n
          );
      }
    );


  if($("#settingsLang")){

    $("#settingsLang").value=v;
  }


  renderAll();


  if(!listening){

    $("#status").textContent=
      sessionCompleted
        ?t("inTune")
        :t("ready");
  }
}


function renderAll(){

  renderStrings();
  renderFrets();
  renderSongs();
  renderNotationButton();
  renderCalibration();
}


function renderNotationButton(){

  var letters=
    noteStyle==="letters";


  $("#notationMain").textContent=
    letters
      ?"C D E"
      :"DO RE";


  $("#notationAlt").textContent=
    letters
      ?"DO RE"
      :"C D E";


  $("#settingsNotation").textContent=
    letters
      ?"C D E F G"
      :"DO RE Mİ";
}


function renderStrings(){

  var data=
    tunings[mode];


  $("#normalNotes").textContent=
    noteStyle==="letters"
      ?"D / G"
      :"RE / SOL";


  $("#bigNotes").textContent=
    noteStyle==="letters"
      ?"D / A"
      :"RE / LA";


  var stringNotes=
    $$(".string-note");


  if(stringNotes[0]){

    stringNotes[0].textContent=
      targetLabel(
        data[0]
      );
  }


  if(stringNotes[1]){

    stringNotes[1].textContent=
      targetLabel(
        data[1]
      );
  }


  $("#note").textContent=
    targetLabel(
      data[activeString]
    );


  var instrument=
    $("#instrumentWrap");


  if(instrument){

    instrument.setAttribute(
      "data-active-string",
      String(activeString)
    );
  }
}


function renderFrets(){

  var grid=$("#fretGrid");

  if(!grid){
    return;
  }

  grid.innerHTML=
    fretData.map(
      function(item,index){

        return (
          '<div class="fret-label" data-index="'+index+'">'+

            '<span class="fret-number">'+
              (
                item.octave
                  ?'<span class="fret-octave">•</span>'
                  :''
              )+
              item.number+
            '</span>'+

            '<span class="fret-note">'+
              noteName(item.note)+
            '</span>'+

          '</div>'
        );
      }
    ).join("");
}


/* =========================================
   NOTATION
   ========================================= */

function toggleNotation(){

  noteStyle=
    noteStyle==="letters"
      ?"solfege"
      :"letters";


  localStorage.setItem(
    "noteStyle",
    noteStyle
  );


  renderAll();
}


/* =========================================
   MODE
   ========================================= */

function setMode(v){

  cancelTuneAttempt();

  sessionCompleted=false;
  wasInTune=false;

  mode=v;
  activeString=0;

  pitchHistory=[];

  lastInTuneAt=0;


  $(".tuner-card").classList.remove(
    "all-complete",
    "tune-hit",
    "in-tune",
    "off-tune"
  );


  $$(".mode-btn")
    .forEach(
      function(button){

        button.classList.toggle(
          "active",
          button.dataset.mode===v
        );
      }
    );


  $$(".string-card")
    .forEach(
      function(card,index){

        card.classList.toggle(
          "active",
          index===0
        );

        card.classList.remove(
          "completed",
          "complete-pulse"
        );
      }
    );


  resetGauge();
  renderStrings();


  if(listening){

    $("#status").textContent=
      t("listening");
  }
}


/* =========================================
   STRING SELECTION
   ========================================= */

function selectString(i){

  cancelTuneAttempt();

  lastInTuneAt=0;
  wasInTune=false;

  activeString=i;

  pitchHistory=[];


  $$(".string-card")
    .forEach(
      function(card,index){

        card.classList.toggle(
          "active",
          index===i
        );
      }
    );


  resetGauge();

  renderStrings();


  if(listening){

    $("#status").textContent=
      t("listening");
  }
}


/* =========================================
   TOP CONTEXT
   ========================================= */

function setTopContext(settingsOpen){

  $("#gearIcon").classList.toggle(
    "hidden",
    settingsOpen
  );


  $("#homeIcon").classList.toggle(
    "hidden",
    !settingsOpen
  );


  $("#contextTop").setAttribute(
    "aria-label",

    settingsOpen
      ?t("home")
      :t("openSettings")
  );
}


/* =========================================
   PANELS
   ========================================= */

async function showPanel(name){

    var previousPanel =
        currentPanel;

  if(name!=="tuner"){

    stopReferenceTone();

    if(listening){

      await stopTuner({
        preserveProgress:false,
        keepIntent:false
      });

    }else{

      resetTuningProgress();
      resetGauge();
    }
  }


  currentPanel=name;
  if(name === "songs"){

    renderSongs();

    if(previousPanel !== "songs"){

      var songsHome =
        document.getElementById(
          "songsHome"
        );

      var songDetail =
        document.getElementById(
          "songDetail"
        );

      if(songsHome){
        songsHome.classList.remove(
          "hidden"
        );
      }

      if(songDetail){
        songDetail.classList.add(
          "hidden"
        );
      }
    }
  }


  ["tuner","frets","settings","songs"]
    .forEach(
      function(panel){

        $("#"+panel+"Panel")
          .classList
          .toggle(
            "active",
            panel===name
          );
      }
    );


  $$(".nav-btn")
    .forEach(
      function(button){

        button.classList.toggle(
          "active",
          button.dataset.panel===name
        );
      }
    );


  $("#micDock").classList.toggle(
    "hidden",
    name!=="tuner"
  );


  setTopContext(
    name==="settings"
  );


  window.scrollTo(
    0,
    0
  );
}

/* =========================================
   RESET PROGRESS
   ========================================= */

function resetTuningProgress(){

  cancelTuneAttempt();

  sessionCompleted=false;
  wasInTune=false;

  lastInTuneAt=0;

  activeString=0;

  pitchHistory=[];


  $(".tuner-card").classList.remove(
    "all-complete",
    "tune-hit"
  );


  $$(".string-card")
    .forEach(
      function(card,index){

        card.classList.remove(
          "completed",
          "complete-pulse"
        );

        card.classList.toggle(
          "active",
          index===0
        );
      }
    );


  renderStrings();
}


/* =========================================
   TUNE ATTEMPT
   ========================================= */

function cancelTuneAttempt(){

  if(tuneAttemptTimer){

    clearTimeout(
      tuneAttemptTimer
    );
  }


  tuneAttemptTimer=0;
  tuneAttemptStartedAt=0;
  tuneEvidence=0;

  lastInTuneAt=0;
}


function startTuneAttempt(){

  if(tuneAttemptTimer){
    return;
  }


  tuneAttemptStartedAt=
    Date.now();


  tuneEvidence=1;


  tuneAttemptTimer=
    setTimeout(
      function(){

        tuneAttemptTimer=0;


        var card=
          $$(".string-card")[
            activeString
          ];


        if(
          listening &&
          tuneEvidence>=TUNE_REQUIRED_HITS &&
          card &&
          !card.classList.contains(
            "completed"
          )
        ){

          completeActiveString();
        }


        tuneAttemptStartedAt=0;
        tuneEvidence=0;
        lastInTuneAt=0;

      },
      TUNE_CONFIRM_MS
    );
}


/* =========================================
   GAUGE RESET
   ========================================= */

function resetGauge(){

  cancelTuneAttempt();

  displayedNeedleAngle=0;
  targetNeedleAngle=0;

  pitchHistory=[];

  wasInTune=false;


  $("#needle").style.transform=
    "rotate(0deg)";


  $("#cents").textContent=
    "0 cent";


  $("#status").textContent=
    t("ready");


  $("#status").style.color="";


  $(".tuner-card").classList.remove(
    "in-tune",
    "off-tune",
    "tune-hit"
  );
}


function resetGaugeForNextString(){

  cancelTuneAttempt();

  pitchHistory=[];

  displayedNeedleAngle=0;
  targetNeedleAngle=0;

  wasInTune=false;


  $("#needle").style.transform=
    "rotate(0deg)";


  $("#cents").textContent=
    "0 cent";


  $(".tuner-card").classList.remove(
    "in-tune",
    "off-tune",
    "tune-hit"
  );
}


/* =========================================
   MEDIAN
   ========================================= */

function median(a){

  var b=
    a.slice().sort(
      function(x,y){

        return x-y;
      }
    );


  return b[
    Math.floor(
      b.length/2
    )
  ];
}


/* =========================================
   OCTAVE CORRECTION
   ========================================= */

function normalizePitchForTarget(
  freq,
  targetHz
){

  if(
    !isFinite(freq) ||
    freq<=0 ||
    !isFinite(targetHz) ||
    targetHz<=0
  ){

    return freq;
  }


  var candidates=[

    {
      hz:freq,
      type:"original"
    },

    {
      hz:freq/2,
      type:"half"
    },

    {
      hz:freq*2,
      type:"double"
    }

  ];


  var originalCents=
    Math.abs(
      1200*
      Math.log(
        freq/targetHz
      )/
      Math.LN2
    );


  var bestHz=freq;
  var bestCents=originalCents;
  var bestType="original";


  candidates.forEach(
    function(candidate){

      if(
        candidate.hz<55 ||
        candidate.hz>1200
      ){
        return;
      }


      var distance=
        Math.abs(
          1200*
          Math.log(
            candidate.hz/
            targetHz
          )/
          Math.LN2
        );


      if(distance<bestCents){

        bestCents=distance;
        bestHz=candidate.hz;
        bestType=candidate.type;
      }
    }
  );


  if(
    bestType!=="original" &&
    bestCents<=70 &&
    originalCents>=900
  ){

    return bestHz;
  }


  return freq;
}


/* =========================================
   PROCESS PITCH
   ========================================= */

function processDetectedPitch(freq){

  if(
    !isFinite(freq) ||
    freq<=0
  ){
    return;
  }


  var target=
    tunings[mode][activeString];


  var targetHz=
    calibratedHz(
      target.hz
    );


  var correctedFreq=
    normalizePitchForTarget(
      freq,
      targetHz
    );


  updatePitch(
    correctedFreq
  );
}


/* =========================================
   NEEDLE
   ========================================= */

function animateNeedle(){

  if(!listening){

    needleRaf=0;
    return;
  }


  displayedNeedleAngle+=
    (
      targetNeedleAngle-
      displayedNeedleAngle
    )*.2;


  if(
    Math.abs(
      targetNeedleAngle-
      displayedNeedleAngle
    )<.03
  ){

    displayedNeedleAngle=
      targetNeedleAngle;
  }


  $("#needle").style.transform=
    "rotate("+
    displayedNeedleAngle+
    "deg)";


  needleRaf=
    requestAnimationFrame(
      animateNeedle
    );
}


function startNeedleAnimation(){

  if(!needleRaf){

    needleRaf=
      requestAnimationFrame(
        animateNeedle
      );
  }
}


/* =========================================
   BROWSER YIN
   ========================================= */

function yin(buf,sr){

  var size=
    buf.length;


  var minFreq=55;
  var maxFreq=1200;


  var minLag=
    Math.max(
      2,
      Math.floor(
        sr/maxFreq
      )
    );


  var maxLag=
    Math.min(
      Math.ceil(
        sr/minFreq
      ),
      Math.floor(
        size/2
      )
    );


  if(
    maxLag<=minLag+2
  ){

    return null;
  }


  var difference=
    new Float64Array(
      maxLag+1
    );


  for(
    var tau=1;
    tau<=maxLag;
    tau++
  ){

    var sum=0;

    var count=
      size-tau;


    for(
      var i=0;
      i<count;
      i++
    ){

      var delta=
        buf[i]-
        buf[i+tau];


      sum+=
        delta*delta;
    }


    difference[tau]=sum;
  }


  var cmnd=
    new Float64Array(
      maxLag+1
    );


  cmnd[0]=1;


  var runningSum=0;


  for(
    var j=1;
    j<=maxLag;
    j++
  ){

    runningSum+=
      difference[j];


    cmnd[j]=
      runningSum<=1e-20
        ?1
        :difference[j]*
         j/
         runningSum;
  }


  var threshold=.15;
  var bestLag=-1;


  for(
    var lag=minLag;
    lag<=maxLag;
    lag++
  ){

    if(
      cmnd[lag]<
      threshold
    ){

      while(
        lag+1<=maxLag &&
        cmnd[lag+1]<
        cmnd[lag]
      ){

        lag++;
      }


      bestLag=lag;
      break;
    }
  }


  if(bestLag<0){

    return null;
  }


  var refinedLag=
    bestLag;


  if(
    bestLag>minLag &&
    bestLag<maxLag
  ){

    var s0=
      cmnd[
        bestLag-1
      ];


    var s1=
      cmnd[
        bestLag
      ];


    var s2=
      cmnd[
        bestLag+1
      ];


    var denominator=
      s0-
      2*s1+
      s2;


    if(
      Math.abs(
        denominator
      )>1e-12
    ){

      var correction=
        .5*
        (
          s0-s2
        )/
        denominator;


      if(
        isFinite(
          correction
        ) &&
        Math.abs(
          correction
        )<=1
      ){

        refinedLag+=
          correction;
      }
    }
  }


  if(
    !isFinite(
      refinedLag
    ) ||
    refinedLag<=0
  ){

    return null;
  }


  var frequency=
    sr/refinedLag;


  if(
    !isFinite(
      frequency
    ) ||
    frequency<minFreq ||
    frequency>maxFreq
  ){

    return null;
  }


  return frequency;
}


/* =========================================
   STRING COMPLETE
   ========================================= */

function completeActiveString(){

  var completedIndex=
    activeString;


  var cards=
    $$(".string-card");


  var completedCard=
    cards[
      completedIndex
    ];


  if(
    !completedCard ||
    completedCard.classList.contains(
      "completed"
    )
  ){

    return;
  }


  completedCard.classList.add(
    "completed"
  );


  completedCard.classList.add(
    "complete-pulse"
  );


  setTimeout(
    function(){

      completedCard.classList.remove(
        "complete-pulse"
      );

    },
    550
  );


  cancelTuneAttempt();

  lastInTuneAt=0;
  pitchHistory=[];


  /*
   * İlk tamamlanmamış teli bul.
   */

  var unfinishedIndex=-1;


  cards.forEach(
    function(card,index){

      if(
        unfinishedIndex===-1 &&
        !card.classList.contains(
          "completed"
        )
      ){

        unfinishedIndex=index;
      }
    }
  );


  /*
   * İkisi de tamam.
   */

  if(unfinishedIndex===-1){

    sessionCompleted=true;


    cards.forEach(
      function(card){

        card.classList.remove(
          "active"
        );
      }
    );


    $(".tuner-card").classList.add(
      "all-complete"
    );


    $("#status").textContent=
      t("inTune");


    $("#status").style.color=
      "var(--good)";


    setTimeout(
      function(){

        stopTuner({
          preserveProgress:true,
          keepIntent:false,
          completedSession:true
        });

      },
      650
    );


    return;
  }


  /*
   * Diğer tamamlanmamış tele geç.
   */

  activeString=
    unfinishedIndex;


  cards.forEach(
    function(card,index){

      card.classList.toggle(
        "active",
        index===unfinishedIndex
      );
    }
  );


  renderStrings();

  resetGaugeForNextString();


  $("#status").textContent=
    t("listening");


  $("#status").style.color="";
}


/* =========================================
   PITCH UPDATE
   ========================================= */

function updatePitch(freq){

  var target=
    tunings[mode][activeString];


  var targetHz=
    calibratedHz(
      target.hz
    );


  var rawCents=
    1200*
    Math.log(
      freq/targetHz
    )/
    Math.LN2;


  /*
   * Bir oktavdan daha uzaktaki
   * sonuçları kullanma.
   */

  if(
    !isFinite(
      rawCents
    ) ||
    Math.abs(
      rawCents
    )>1200
  ){

    lastInTuneAt=0;
    pitchHistory=[];
    wasInTune=false;

    return;
  }


  pitchHistory.push(
    rawCents
  );


  if(
    pitchHistory.length>3
  ){

    pitchHistory.shift();
  }


  var c=
    median(
      pitchHistory
    );


  var clamped=
    Math.max(
      -50,
      Math.min(
        50,
        c
      )
    );


  var absCents=
    Math.abs(c);


  var inTune=
    absCents<=
    IN_TUNE_CENTS;


  targetNeedleAngle=
    clamped/
    50*
    68;


  lastValidPitchAt=
    Date.now();


  $("#cents").textContent=
    (
      c>0
        ?"+"
        :""
    )+
    Math.round(c)+
    " cent";


  $("#note").textContent=
    targetLabel(
      target
    );


  $("#status").textContent =
    inTune
      ? t("inTune")
      : (
          c < 0
            ? t("flat")
            : t("sharp")
        );


  $("#status").style.color=
    inTune
      ?"var(--good)"
      :"var(--warn)";


  $(".tuner-card").classList.toggle(
    "in-tune",
    inTune
  );


  $(".tuner-card").classList.toggle(
    "off-tune",
    !inTune
  );


  /*
   * Doğru bölgeye ilk girişte
   * feedback animasyonu.
   */

  if(
    inTune &&
    !wasInTune
  ){

    var tunerCard=
      $(".tuner-card");


    tunerCard.classList.remove(
      "tune-hit"
    );


    void tunerCard.offsetWidth;


    tunerCard.classList.add(
      "tune-hit"
    );


    setTimeout(
      function(){

        tunerCard.classList.remove(
          "tune-hit"
        );

      },
      420
    );
  }


  wasInTune=
    inTune;


  /*
   * Tek vuruş doğrulama.
   */

  if(inTune){

    lastInTuneAt=
      Date.now();


    if(!tuneAttemptTimer){

      startTuneAttempt();

    }else{

      tuneEvidence++;
    }


  }else if(
    tuneAttemptTimer &&
    absCents<=
    DECAY_TOLERANCE_CENTS
  ){

    /*
     * Decay sırasında ±12 cent
     * tolerans.
     */

    lastInTuneAt=
      Date.now();


  }else{

    wasInTune=false;

    cancelTuneAttempt();
  }
}


/* =========================================
   BROWSER FALLBACK LOOP
   ========================================= */

function loop(){

  if(
    !listening ||
    !analyser
  ){

    return;
  }


  var buf=
    new Float32Array(
      analyser.fftSize
    );


  analyser.getFloatTimeDomainData(
    buf
  );


  var sum=0;


  for(
    var i=0;
    i<buf.length;
    i++
  ){

    sum+=
      buf[i]*
      buf[i];
  }


  var rms=
    Math.sqrt(
      sum/
      buf.length
    );


  if(rms>.006){

    var frequency=
      yin(
        buf,
        audioCtx.sampleRate
      );


    if(
      frequency &&
      isFinite(
        frequency
      )
    ){

      noSignalFrames=0;

      processDetectedPitch(
        frequency
      );

    }else{

      noSignalFrames++;
    }


  }else{

    noSignalFrames++;
  }


  if(
    noSignalFrames>25
  ){

    if(
      !lastInTuneAt ||
      Date.now()-
      lastInTuneAt>
      tuneGraceMs
    ){

      lastInTuneAt=0;
    }


    $("#status").textContent=
      t("noSignal");


    $("#status").style.color=
      "var(--muted)";
  }


  raf=
    requestAnimationFrame(
      loop
    );
}


/* =========================================
   REFERENCE TONE
   ========================================= */

function stopReferenceTone(){

  if(toneTimer){

    clearTimeout(
      toneTimer
    );
  }


  toneTimer=0;


  toneOscillators.forEach(
    function(oscillator){

      try{

        oscillator.stop();

      }catch(e){}
    }
  );


  toneOscillators=[];


  $$(".string-card")
    .forEach(
      function(card){

        card.classList.remove(
          "previewing"
        );
      }
    );
}


async function playReference(i){

  if(listening){

    await stopTuner({
      preserveProgress:false,
      keepIntent:false
    });
  }


  stopReferenceTone();


  selectString(i);


  var AudioCtor=
    window.AudioContext||
    window.webkitAudioContext;


  if(!AudioCtor){

    return;
  }


  if(!toneCtx){

    toneCtx=
      new AudioCtor();
  }


  try{

    await toneCtx.resume();

  }catch(e){

    return;
  }


  var hz=
    calibratedHz(
      tunings[mode][i].hz
    );


  var now=
    toneCtx.currentTime;


  var master=
    toneCtx.createGain();


  var filter=
    toneCtx.createBiquadFilter();


  filter.type=
    "lowpass";


  filter.frequency
    .setValueAtTime(
      2200,
      now
    );


  filter.Q.value=.65;


  master.connect(
    filter
  );


  filter.connect(
    toneCtx.destination
  );


  /*
   * Natural pluck envelope
   */

  master.gain
    .setValueAtTime(
      .0001,
      now
    );


  master.gain
    .exponentialRampToValueAtTime(
      .20,
      now+.012
    );


  master.gain
    .exponentialRampToValueAtTime(
      .065,
      now+.18
    );


  master.gain
    .exponentialRampToValueAtTime(
      .0001,
      now+1.75
    );


  var fund=
    toneCtx.createOscillator();


  var harmonic2=
    toneCtx.createOscillator();


  var harmonic3=
    toneCtx.createOscillator();


  var g1=
    toneCtx.createGain();


  var g2=
    toneCtx.createGain();


  var g3=
    toneCtx.createGain();


  fund.type=
    "triangle";


  harmonic2.type=
    "sine";


  harmonic3.type=
    "sine";


  /*
   * Exact reference frequencies.
   */

  fund.frequency
    .setValueAtTime(
      hz,
      now
    );


  harmonic2.frequency
    .setValueAtTime(
      hz*2,
      now
    );


  harmonic3.frequency
    .setValueAtTime(
      hz*3,
      now
    );


  g1.gain.value=.88;
  g2.gain.value=.12;
  g3.gain.value=.035;


  fund
    .connect(g1)
    .connect(master);


  harmonic2
    .connect(g2)
    .connect(master);


  harmonic3
    .connect(g3)
    .connect(master);


  fund.start(now);
  harmonic2.start(now);
  harmonic3.start(now);


  fund.stop(
    now+1.78
  );


  harmonic2.stop(
    now+1.50
  );


  harmonic3.stop(
    now+1.05
  );


  toneOscillators=[
    fund,
    harmonic2,
    harmonic3
  ];


  var card=
    $$(".string-card")[i];


  if(card){

    card.classList.add(
      "previewing"
    );
  }


  toneTimer=
    setTimeout(
      stopReferenceTone,
      1820
    );
}


/* =========================================
   CALIBRATION
   ========================================= */

function toggleCalibration(){

  referenceHz=
    referenceHz===440
      ?442
      :440;


  localStorage.setItem(
    "referenceHz",
    String(
      referenceHz
    )
  );


  renderCalibration();

  resetGauge();


  if(listening){

    $("#status").textContent=
      t("listening");
  }
}


/* =========================================
   START TUNER
   ========================================= */

async function startTuner(options){

  options=
    options||{};


  if(listening){

    if(
      !options.lifecycleResume
    ){

      userWantsListening=false;


      await stopTuner({
        preserveProgress:false,
        keepIntent:false
      });
    }


    return;
  }


  if(
    !options.lifecycleResume
  ){

    userWantsListening=true;


    if(sessionCompleted){

      resetTuningProgress();
    }
  }


  stopReferenceTone();


  try{

    /*
     * Native Android tuner
     */

    if(nativeTuner){

      if(nativePitchListener){

        try{

          await nativePitchListener.remove();

        }catch(e){}


        nativePitchListener=null;
      }


      nativePitchListener=
        await nativeTuner.addListener(
          "pitch",

          function(data){

            if(!listening){

              return;
            }


            lastPitchEventAt=
              Date.now();


            var freq=
              Number(
                data &&
                data.frequency
              );


            if(
              freq>0 &&
              isFinite(freq)
            ){

              noSignalFrames=0;


              processDetectedPitch(
                freq
              );


              return;
            }


            /*
             * frequency=0:
             * pitch bulunamadı.
             */

            if(
              Date.now()-
              lastValidPitchAt>
              650
            ){

              if(
                !lastInTuneAt ||
                Date.now()-
                lastInTuneAt>
                tuneGraceMs
              ){

                lastInTuneAt=0;
              }


              $("#status").textContent=
                t("noSignal");


              $("#status").style.color=
                "var(--muted)";
            }
          }
        );


      await nativeTuner.start();


      listening=true;

      noSignalFrames=0;
      pitchHistory=[];

      lastInTuneAt=0;

      lastValidPitchAt=
        Date.now();


      lastPitchEventAt=
        Date.now();


      startNeedleAnimation();


      if(nativeWatchdog){

        clearInterval(
          nativeWatchdog
        );
      }


      nativeWatchdog=
        setInterval(
          function(){

            if(!listening){

              return;
            }


            if(
              Date.now()-
              lastPitchEventAt>
              1500
            ){

              lastInTuneAt=0;


              $("#status").textContent=
                t("micError");


              $("#status").style.color=
                "#b55b5b";
            }

          },
          500
        );


      $("#micBtn").classList.add(
        "listening"
      );


      $("#micBtn span").textContent=
        t("stopMic");


      $("#status").textContent=
        t("listening");


      $("#status").style.color="";


      return;
    }


    /*
     * Browser / Web fallback
     */

    stream=
      await navigator.mediaDevices
        .getUserMedia({

          audio:{
            echoCancellation:false,
            noiseSuppression:false,
            autoGainControl:false
          },

          video:false
        });


    audioCtx=
      new (
        window.AudioContext||
        window.webkitAudioContext
      )();


    await audioCtx.resume();


    analyser=
      audioCtx.createAnalyser();


    analyser.fftSize=4096;
    analyser.smoothingTimeConstant=0;


    audioCtx
      .createMediaStreamSource(
        stream
      )
      .connect(
        analyser
      );


    listening=true;

    noSignalFrames=0;
    pitchHistory=[];

    lastInTuneAt=0;

    lastValidPitchAt=
      Date.now();


    startNeedleAnimation();


    $("#micBtn").classList.add(
      "listening"
    );


    $("#micBtn span").textContent=
      t("stopMic");


    $("#status").textContent=
      t("listening");


    $("#status").style.color="";


    loop();


  }catch(e){

    listening=false;

    userWantsListening=false;


    $("#status").textContent=
      t("micError");


    $("#status").style.color=
      "#b55b5b";


    $("#micBtn").classList.remove(
      "listening"
    );


    $("#micBtn span").textContent=
      t("startMic");
  }
}


/* =========================================
   STOP TUNER
   ========================================= */

async function stopTuner(options){

  options=
    options||{};


  var preserveProgress=
    !!options.preserveProgress;


  var keepIntent=
    !!options.keepIntent;


  var completedSession=
    !!options.completedSession;


  listening=false;


  if(!keepIntent){

    userWantsListening=false;
  }


  cancelTuneAttempt();

  lastInTuneAt=0;
  wasInTune=false;


  if(raf){

    cancelAnimationFrame(
      raf
    );
  }


  raf=0;


  if(needleRaf){

    cancelAnimationFrame(
      needleRaf
    );
  }


  needleRaf=0;


  if(nativeWatchdog){

    clearInterval(
      nativeWatchdog
    );
  }


  nativeWatchdog=0;


  if(nativeTuner){

    try{

      await nativeTuner.stop();

    }catch(e){}
  }


  if(nativePitchListener){

    try{

      await nativePitchListener.remove();

    }catch(e){}


    nativePitchListener=null;
  }


  if(stream){

    stream
      .getTracks()
      .forEach(
        function(track){

          track.stop();
        }
      );
  }


  stream=null;


  if(audioCtx){

    try{

      await audioCtx.close();

    }catch(e){}
  }


  audioCtx=null;
  analyser=null;


  $("#micBtn").classList.remove(
    "listening"
  );


  $("#micBtn span").textContent=
    t("startMic");


  if(!preserveProgress){

    resetTuningProgress();
    resetGauge();

  }else if(completedSession){

    $("#status").textContent=
      t("inTune");


    $("#status").style.color=
      "var(--good)";
  }
}


/* =========================================
   EVENTS
   ========================================= */
var fullscreenButton =
  document.getElementById(
    "scoreFullscreen"
  );

if(fullscreenButton){

  fullscreenButton.onclick =
    toggleScoreFullscreen;
}

$("#scorePrevPage").onclick =
  function(){

    var pages =
      getCurrentPages();

    if(
      !pages.length ||
      activeScorePage <= 0
    ){
      return;
    }

    activeScorePage--;

    renderCurrentScorePage();
  };


$("#scoreNextPage").onclick =
  function(){

    var pages =
      getCurrentPages();

    if(
      !pages.length ||
      activeScorePage >=
      pages.length - 1
    ){
      return;
    }

    activeScorePage++;

    renderCurrentScorePage();
  };
$$(".mode-btn")
  .forEach(
    function(button){

      button.onclick=
        function(){

          setMode(
            button.dataset.mode
          );
        };
    }
  );


$$(".string-card")
  .forEach(
    function(card){

      card.onclick=
        function(){

          selectString(
            Number(
              card.dataset.string
            )
          );
        };


      card.onkeydown=
        function(e){

          if(
            e.key==="Enter" ||
            e.key===" "
          ){

            e.preventDefault();


            selectString(
              Number(
                card.dataset.string
              )
            );
          }
        };
    }
  );


$$(".preview-tone")
  .forEach(
    function(button){

      button.onclick=
        function(e){

          e.stopPropagation();


          playReference(
            Number(
              button.dataset.string
            )
          );
        };
    }
  );

/* =========================================
   SONG EVENTS
   ========================================= */

$$(".song-view-btn")
  .forEach(
    function(button){

      button.onclick =
        function(){

          switchSongView(
            button.dataset.songView
          );
        };
    }
  );


var songBackBtn =
  document.getElementById(
    "songBackBtn"
  );

if(songBackBtn){

  songBackBtn.onclick =
    function(){

      var detail =
        document.getElementById(
          "songDetail"
        );

      var home =
        document.getElementById(
          "songsHome"
        );

      if(detail){
        detail.classList.add(
          "hidden"
        );
      }

      if(home){
        home.classList.remove(
          "hidden"
        );
      }

      var songsPanel =
        document.getElementById(
          "songsPanel"
        );

      if(songsPanel){
        songsPanel.scrollTop = 0;
      }
    };
}
$$(".nav-btn")
  .forEach(
    function(button){

      button.onclick =
        function(){

          var panel =
            button.dataset.panel;

          /*
           * Songs detayındayken
           * tekrar Songs'a basılırsa
           * ana şarkı listesine dön.
           */
          if(
            panel === "songs" &&
            currentPanel === "songs"
          ){

            var detail =
              document.getElementById(
                "songDetail"
              );

            var home =
              document.getElementById(
                "songsHome"
              );

            if(
              detail &&
              home &&
              !detail.classList.contains(
                "hidden"
              )
            ){

              detail.classList.add(
                "hidden"
              );

              home.classList.remove(
                "hidden"
              );

              var songsPanel =
                document.getElementById(
                  "songsPanel"
                );

              if(songsPanel){
                songsPanel.scrollTop = 0;
              }

              return;
            }
          }

          showPanel(panel);
        };
    }
  );
var scoreZoom = 1;

var SCORE_ZOOM_MIN = 1;
var SCORE_ZOOM_MAX = 3;
var SCORE_ZOOM_STEP = .25;
function applyScoreZoom(){

  document
    .querySelectorAll(
      ".song-score-image"
    )
    .forEach(
      function(img){

        img.style.width =
          (scoreZoom * 100) + "%";
      }
    );

  var label =
    document.getElementById(
      "scoreZoomLabel"
    );

  if(label){

    label.textContent =
      Math.round(
        scoreZoom * 100
      ) + "%";
  }
}
var zoomIn =
  document.getElementById(
    "scoreZoomIn"
  );

var zoomOut =
  document.getElementById(
    "scoreZoomOut"
  );

if(zoomIn){

  zoomIn.onclick =
    function(){

      scoreZoom =
        Math.min(
          SCORE_ZOOM_MAX,
          scoreZoom +
          SCORE_ZOOM_STEP
        );

      applyScoreZoom();
    };
}

if(zoomOut){

  zoomOut.onclick =
    function(){

      scoreZoom =
        Math.max(
          SCORE_ZOOM_MIN,
          scoreZoom -
          SCORE_ZOOM_STEP
        );

      applyScoreZoom();
    };
}
var zoomLabel =
  document.getElementById(
    "scoreZoomLabel"
  );

if(zoomLabel){

  zoomLabel.onclick =
    function(){

      scoreZoom = 1;

      applyScoreZoom();
    };
}

$("#notationToggle").onclick=
  toggleNotation;


$("#settingsNotation").onclick=
  toggleNotation;


$("#contextTop").onclick=
  function(){

    showPanel(
      currentPanel==="settings"
        ?"tuner"
        :"settings"
    );
  };


$("#settingsLang").onchange=
  function(e){

    applyLanguage(
      e.target.value
    );
  };

var adminTapCount = 0;
var adminTapTimer = 0;
var adminUnlockTap = document.getElementById("adminUnlockTap");
if(adminUnlockTap){
  adminUnlockTap.onclick = function(){
    adminTapCount += 1;
    window.clearTimeout(adminTapTimer);
    adminTapTimer = window.setTimeout(function(){ adminTapCount = 0; },2500);
    if(adminTapCount >= 7){
      adminTapCount = 0;
      var adminCard = document.getElementById("adminCard");
      var settingsPanel = document.getElementById("settingsPanel");
      adminCard.classList.remove("hidden");
      window.setTimeout(function(){
        settingsPanel.scrollTo({
          top:Math.max(0,adminCard.offsetTop-settingsPanel.offsetTop-8),
          behavior:"smooth"
        });
      },0);
    }
  };
}

var adminSongForm = document.getElementById("adminSongForm");
if(adminSongForm){
  adminSongForm.onsubmit = publishAdminSong;
}


$("#micBtn").onclick=
  function(){

    startTuner();
  };


$("#calibrateBtn").onclick=
  toggleCalibration;


/* =========================================
   ONBOARDING
   ========================================= */

$$(".language-options button")
  .forEach(
    function(button){

      button.onclick=
        function(){

          applyLanguage(
            button.dataset.lang
          );


          $("#languageStep")
            .classList
            .add(
              "hidden"
            );


          $("#permissionStep")
            .classList
            .remove(
              "hidden"
            );
        };
    }
  );


$("#allowMic").onclick=
  async function(){

    try{

      if(
        nativeTuner &&
        nativeTuner.requestPermissions
      ){

        var permission=
          await nativeTuner
            .requestPermissions();


        if(
          permission.microphone!==
          "granted"
        ){

          $("#status").textContent=
            t("micError");


          return;
        }
      }


      localStorage.setItem(
        "onboardingDone",
        "1"
      );


      $("#onboarding")
        .classList
        .add(
          "hidden"
        );


      await startTuner();


    }catch(e){

      $("#status").textContent=
        t("micError");


      $("#status").style.color=
        "#b55b5b";
    }
  };


if(
  !localStorage.getItem(
    "onboardingDone"
  )
){

  $("#onboarding")
    .classList
    .remove(
      "hidden"
    );
}


/* =========================================
   CAPACITOR APP LIFECYCLE
   ========================================= */

var capacitorApp=
  window.Capacitor &&
  window.Capacitor.Plugins &&
  window.Capacitor.Plugins.App;


if(capacitorApp){

  capacitorApp.addListener(
    "appStateChange",

    async function(state){

      /*
       * Background
       */

      if(!state.isActive){

        stopReferenceTone();


        userWantsListening=false;


        if(listening){

          await stopTuner({
            preserveProgress:true,
            keepIntent:false
          });
        }


        return;
      }


      /*
       * Foreground
       *
       * Mikrofon otomatik başlamaz.
       * Kullanıcı tekrar butona basar.
       */


      userWantsListening=false;

      refreshSongsFromRemote();
    }
  );
}

/* =========================================
   INITIALISE
   ========================================= */

applyLanguage(
  lang
);

setMode(
  "normal"
);

initialiseSongs();

showPanel(
  "tuner"
);

})();
