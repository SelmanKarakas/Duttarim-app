(function(){
"use strict";

var $=function(s){return document.querySelector(s)};
var $$=function(s){return Array.from(document.querySelectorAll(s))};

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
fretsTitle:"Perde Haritası",
fretsSub:"Alt tel (1. tel / zil) üzerindeki 15 perde ve nota karşılıkları.",
settings:"Ayarlar",
settingsSub:"Dili, referans frekansını ve uygulama tercihlerini yönetin.",
language:"Dil",
appLanguage:"Uygulama dili",
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
privacy:"Gizlilik Politikası"
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
tapString:"Tap the string you want to tune.",
tuner:"TUNER",
frets:"FRETS",
fretsTitle:"Fret Map",
fretsSub:"The 15 frets and notes on the lower string (string 1 / zil).",
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
privacy:"Privacy Policy"
},
ug:{
normal:"ئادەتتىكى تەڭشەش",
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
tapString:"تەڭشىمەكچى بولغان تارنى چېكىڭ.",
tuner:"تەڭشەش",
frets:"پەردىلەر",
fretsTitle:"پەردە خەرىتىسى",
fretsSub:"تۆۋەنكى تارنىڭ 15 پەردىسى ۋە نوتىلىرى.",
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
privacy:"مەخپىيەتلىك سىياسىتى"
}
};

var lang=localStorage.getItem("dutarLang")||"tr";
var noteStyle=localStorage.getItem("noteStyle")||"solfege";
var mode="normal",activeString=0,currentPanel="tuner";

var audioCtx=null,analyser=null,stream=null,raf=0;
var listening=false;
var noSignalFrames=0;

var nativeTuner=
  window.Capacitor &&
  window.Capacitor.Plugins &&
  window.Capacitor.Plugins.DutarTuner;

var nativePitchListener=null;
var nativeWatchdog=0;

var pitchHistory=[];
var displayedNeedleAngle=0;
var targetNeedleAngle=0;
var needleRaf=0;
var lastValidPitchAt=0;
var lastPitchEventAt=0;

var referenceHz=
  Number(localStorage.getItem("referenceHz"))||440;

var toneCtx=null;
var toneOscillators=[];
var toneTimer=0;

var autoAdvanceTimer=0;
var autoAdvanceArmed=true;
var stableSince=0;

var tunings={
normal:[
  {note:"D",octave:3,hz:146.83},
  {note:"G",octave:3,hz:196.00}
],
big:[
  {note:"D",octave:3,hz:146.83},
  {note:"A",octave:3,hz:220.00}
]
};

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

var fretData=[
["0","D"],
["1","D#"],
["2","E"],
["3","F"],
["4","F#"],
["5","G"],
["5.5","G#"],
["6","A"],
["7","A#"],
["8","B"],
["9","C"],
["9.5","C#"],
["10","D"],
["11","D#"],
["12","E"],
["13","F"],
["14","F#"],
["15","G"]
];

function t(k){
  return (translations[lang]&&translations[lang][k])||
         translations.tr[k]||
         k;
}

function noteName(n){
  return noteStyle==="letters"
    ? n
    : (solfege[n]||n);
}

function targetLabel(target){
  return noteName(target.note);
}

function calibratedHz(base){
  return base*(referenceHz/440);
}

function renderCalibration(){
  if($("#calibrateBtn")){
    $("#calibrateBtn").textContent=
      "A4 = "+referenceHz+" Hz";
  }
}

function applyLanguage(v){
  lang=v;
  localStorage.setItem("dutarLang",v);

  document.documentElement.lang=v;
  document.documentElement.dir=
    v==="ug"?"rtl":"ltr";

  $$("[data-i18n]").forEach(function(el){
    el.textContent=t(el.dataset.i18n);
  });

  if($("#settingsLang")){
    $("#settingsLang").value=v;
  }

  renderAll();

  if(!listening){
    $("#status").textContent=t("ready");
  }
}

function renderAll(){
  renderStrings();
  renderFrets();
  renderNotationButton();
  renderCalibration();
}

function renderNotationButton(){
  var letters=
    noteStyle==="letters";

  $("#notationMain").textContent=
    letters?"C D E":"DO RE";

  $("#notationAlt").textContent=
    letters?"DO RE":"C D E";

  $("#settingsNotation").textContent=
    letters?"C D E F G":"DO RE Mİ";
}

function renderStrings(){
  var data=tunings[mode];

  $("#normalNotes").textContent=
    noteStyle==="letters"
      ?"D / G"
      :"RE / SOL";

  $("#bigNotes").textContent=
    noteStyle==="letters"
      ?"D / A"
      :"RE / LA";

  $$(".string-note")[0].textContent=
    targetLabel(data[0]);

  $$(".string-note")[1].textContent=
    targetLabel(data[1]);

  $("#note").textContent=
    targetLabel(data[activeString]);
}

function renderFrets(){
  $("#fretGrid").innerHTML=
    fretData.map(function(x){
      return '<div class="fret"><strong>'+
        noteName(x[1])+
        '</strong><span>'+
        x[0]+'. '+
        (
          lang==="en"
            ?"fret"
            :lang==="ug"
              ?"پەردە"
              :"perde"
        )+
        '</span></div>';
    }).join("");
}

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

function setMode(v){
  clearTimeout(autoAdvanceTimer);

  autoAdvanceTimer=0;
  autoAdvanceArmed=true;
  stableSince=0;

  mode=v;
  activeString=0;
  pitchHistory=[];

  $$(".mode-btn").forEach(function(b){
    b.classList.toggle(
      "active",
      b.dataset.mode===v
    );
  });

  $$(".string-card").forEach(function(c,i){
    c.classList.toggle(
      "active",
      i===0
    );

    c.classList.remove("completed");
  });

  resetGauge();
  renderStrings();
}

function selectString(i){
  clearTimeout(autoAdvanceTimer);

  autoAdvanceTimer=0;
  autoAdvanceArmed=i===0;
  stableSince=0;

  activeString=i;
  pitchHistory=[];

  $$(".string-card").forEach(function(c,j){
    c.classList.toggle(
      "active",
      j===i
    );
  });

  resetGauge();
  renderStrings();
}

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

async function showPanel(name){

  if(name!=="tuner" && listening){
    await stopTuner();
  }

  currentPanel=name;

  ["tuner","frets","settings"].forEach(function(p){
    $("#"+p+"Panel").classList.toggle(
      "active",
      p===name
    );
  });

  $$(".nav-btn").forEach(function(b){
    b.classList.toggle(
      "active",
      b.dataset.panel===name
    );
  });

  $("#micDock").classList.toggle(
    "hidden",
    name!=="tuner"
  );

  setTopContext(
    name==="settings"
  );

  window.scrollTo(0,0);
}

function resetGauge(){
  clearTimeout(autoAdvanceTimer);

  autoAdvanceTimer=0;
  stableSince=0;

  displayedNeedleAngle=0;
  targetNeedleAngle=0;

  $("#needle").style.transform=
    "rotate(0deg)";

  $("#cents").textContent=
    "0 cent";

  $("#status").textContent=
    t("ready");

  $("#status").style.color="";

  $(".tuner-card").classList.remove(
    "in-tune",
    "off-tune"
  );
}

function median(a){
  var b=a.slice().sort(function(x,y){
    return x-y;
  });

  return b[
    Math.floor(b.length/2)
  ];
}

/*
 * Ok artık son bulunduğu konumda kalır.
 * Yeni geçerli pitch gelene kadar merkeze dönmez.
 */
function animateNeedle(){

  if(!listening){
    needleRaf=0;
    return;
  }

  displayedNeedleAngle +=
    (
      targetNeedleAngle -
      displayedNeedleAngle
    )*.2;

  if(
    Math.abs(
      targetNeedleAngle -
      displayedNeedleAngle
    ) < .03
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

/*
 * Browser fallback için YIN
 */
function yin(buf,sr){

  var size=buf.length;

  var minLag=
    Math.floor(sr/1200);

  var maxLag=
    Math.min(
      Math.floor(sr/55),
      Math.floor(size/2)
    );

  var diff=
    new Float32Array(
      maxLag+1
    );

  for(
    var tau=minLag;
    tau<=maxLag;
    tau++
  ){

    var sum=0;

    for(
      var i=0;
      i<size-tau;
      i++
    ){

      var d=
        buf[i]-
        buf[i+tau];

      sum+=d*d;
    }

    diff[tau]=sum;
  }

  var run=0;
  var best=-1;

  for(
    var j=minLag;
    j<=maxLag;
    j++
  ){

    run+=diff[j];

    var cm=
      run
        ?diff[j]*j/run
        :1;

    diff[j]=cm;

    if(
      j>minLag+1 &&
      cm<.14 &&
      cm<=diff[j-1]
    ){

      while(
        j+1<=maxLag
      ){

        var nextRaw=
          diff[j+1];

        var nextRun=
          run+nextRaw;

        var nextCm=
          nextRun
            ?nextRaw*(j+1)/nextRun
            :1;

        if(
          nextCm>=diff[j]
        ){
          break;
        }

        j++;
        run=nextRun;
        diff[j]=nextCm;
      }

      best=j;
      break;
    }
  }

  if(best<0){
    return null;
  }

  var x0=
    best>minLag
      ?best-1
      :best;

  var x2=
    best<maxLag
      ?best+1
      :best;

  var s0=diff[x0];
  var s1=diff[best];
  var s2=diff[x2];

  var den=
    2*s1-s2-s0;

  var better=
    den
      ?best+
       (s2-s0)/(2*den)
      :best;

  return sr/better;
}

function completeActiveString(){

  var completedIndex=
    activeString;

  var cards=
    $$(".string-card");

  cards[
    completedIndex
  ].classList.add(
    "completed"
  );

  stableSince=0;

  if(
    completedIndex===0 &&
    autoAdvanceArmed
  ){

    autoAdvanceArmed=false;

    selectString(1);

    $("#status").textContent=
      t("listening");
  }
}

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

  if(
    !isFinite(rawCents) ||
    Math.abs(rawCents)>600
  ){

    stableSince=0;
    pitchHistory=[];

    return;
  }

  pitchHistory.push(
    rawCents
  );

  if(
    pitchHistory.length>5
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

  var inTune=
    Math.abs(c)<=4;

  targetNeedleAngle=
    clamped/50*68;

  lastValidPitchAt=
    Date.now();

  $("#cents").textContent=
    (c>0?"+":"")+
    Math.round(c)+
    " cent";

  $("#note").textContent=
    targetLabel(target);

  $("#status").textContent=
    inTune
      ?t("inTune")
      :(c<0
        ?t("flat")
        :t("sharp"));

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

  if(inTune){

    if(!stableSince){
      stableSince=
        performance.now();
    }

    if(
      performance.now()-
      stableSince>=3000 &&
      !$$(".string-card")[
        activeString
      ].classList.contains(
        "completed"
      )
    ){

      completeActiveString();
    }

  }else{

    stableSince=0;
  }
}

/*
 * Browser fallback loop
 */
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
      sum/buf.length
    );

  if(rms>.006){

    var f=
      yin(
        buf,
        audioCtx.sampleRate
      );

    if(
      f &&
      isFinite(f)
    ){

      noSignalFrames=0;
      updatePitch(f);

    }else{

      noSignalFrames++;
    }

  }else{

    noSignalFrames++;
  }

  if(
    noSignalFrames>25
  ){

    stableSince=0;

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

function stopReferenceTone(){

  if(toneTimer){
    clearTimeout(
      toneTimer
    );
  }

  toneTimer=0;

  toneOscillators.forEach(
    function(o){
      try{
        o.stop();
      }catch(e){}
    }
  );

  toneOscillators=[];

  $$(".string-card").forEach(
    function(c){
      c.classList.remove(
        "previewing"
      );
    }
  );
}

async function playReference(i){

  if(listening){
    await stopTuner();
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

  await toneCtx.resume();

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
      2400,
      now
    );

  filter.Q.value=.7;

  master.connect(
    filter
  );

  filter.connect(
    toneCtx.destination
  );

  master.gain
    .setValueAtTime(
      .0001,
      now
    );

  master.gain
    .exponentialRampToValueAtTime(
      .24,
      now+.008
    );

  master.gain
    .exponentialRampToValueAtTime(
      .07,
      now+.16
    );

  master.gain
    .exponentialRampToValueAtTime(
      .0001,
      now+1.7
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
    "triangle";

  harmonic3.type=
    "sine";

  fund.frequency
    .setValueAtTime(
      hz*1.012,
      now
    );

  fund.frequency
    .exponentialRampToValueAtTime(
      hz,
      now+.07
    );

  harmonic2.frequency.value=
    hz*2.01;

  harmonic3.frequency.value=
    hz*3.02;

  g1.gain.value=.85;
  g2.gain.value=.20;
  g3.gain.value=.07;

  fund.connect(g1)
      .connect(master);

  harmonic2.connect(g2)
           .connect(master);

  harmonic3.connect(g3)
           .connect(master);

  fund.start(now);
  harmonic2.start(now);
  harmonic3.start(now);

  fund.stop(now+1.75);
  harmonic2.stop(now+1.45);
  harmonic3.stop(now+.95);

  toneOscillators=[
    fund,
    harmonic2,
    harmonic3
  ];

  var card=
    $$(".string-card")[i];

  card.classList.add(
    "previewing"
  );

  toneTimer=
    setTimeout(
      stopReferenceTone,
      1800
    );
}

function toggleCalibration(){

  referenceHz=
    referenceHz===440
      ?442
      :440;

  localStorage.setItem(
    "referenceHz",
    String(referenceHz)
  );

  renderCalibration();
  resetGauge();
}

async function startTuner(){

  if(listening){
    await stopTuner();
    return;
  }

  try{

    if(nativeTuner){

      /*
       * Önce eski listener varsa temizle.
       */
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

            /*
             * Event akışı hâlâ canlı mı?
             */
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

              updatePitch(freq);

              return;
            }

            /*
             * frequency:0 hata değildir.
             * Son gerçek pitch'ten bir süre sonra
             * SES BEKLENİYOR göster.
             *
             * Ok ise son konumunda kalır.
             */
            if(
              Date.now()-
              lastValidPitchAt>
              650
            ){

              stableSince=0;

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

      lastValidPitchAt=
        Date.now();

      lastPitchEventAt=
        Date.now();

      startNeedleAnimation();

      /*
       * Gerçek native event akışı tamamen kesilirse
       * bunu ayrı olarak yakala.
       */
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

              stableSince=0;

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

      return;
    }

    /*
     * Browser / web fallback
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
      .createMediaStreamSource(stream)
      .connect(analyser);

    listening=true;
    noSignalFrames=0;
    pitchHistory=[];

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

    loop();

  }catch(e){

    $("#status").textContent=
      t("micError");

    $("#status").style.color=
      "#b55b5b";

    listening=false;
  }
}

async function stopTuner(){

  listening=false;

  if(raf){
    cancelAnimationFrame(raf);
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
      .forEach(function(x){
        x.stop();
      });
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

  resetGauge();
}

/*
 * Events
 */
$$(".mode-btn").forEach(
  function(b){
    b.onclick=function(){
      setMode(
        b.dataset.mode
      );
    };
  }
);

$$(".string-card").forEach(
  function(c){

    c.onclick=function(){
      selectString(
        Number(
          c.dataset.string
        )
      );
    };

    c.onkeydown=function(e){

      if(
        e.key==="Enter" ||
        e.key===" "
      ){

        e.preventDefault();

        selectString(
          Number(
            c.dataset.string
          )
        );
      }
    };
  }
);

$$(".preview-tone").forEach(
  function(b){

    b.onclick=function(e){

      e.stopPropagation();

      playReference(
        Number(
          b.dataset.string
        )
      );
    };
  }
);

$$(".nav-btn").forEach(
  function(b){

    b.onclick=function(){
      showPanel(
        b.dataset.panel
      );
    };
  }
);

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

$("#micBtn").onclick=
  startTuner;

$("#calibrateBtn").onclick=
  toggleCalibration;

$$(".language-options button")
  .forEach(
    function(b){

      b.onclick=function(){

        applyLanguage(
          b.dataset.lang
        );

        $("#languageStep")
          .classList
          .add("hidden");

        $("#permissionStep")
          .classList
          .remove("hidden");
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
          permission.microphone!=="granted"
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
        .add("hidden");

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
    .remove("hidden");
}

applyLanguage(lang);
setMode("normal");
showPanel("tuner");

})();