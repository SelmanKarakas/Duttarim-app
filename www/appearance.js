(function(){
  'use strict';
  var media=window.matchMedia('(prefers-color-scheme: dark)');
  var preference='system';
  try{preference=localStorage.getItem('duttarTheme')||'system';}catch(error){}
  if(['system','light','dark'].indexOf(preference)===-1) preference='system';
  function apply(value){
    preference=['system','light','dark'].indexOf(value)!==-1?value:'system';
    var theme=preference==='system'?(media.matches?'dark':'light'):preference;
    document.documentElement.dataset.theme=theme;
    document.documentElement.style.colorScheme=theme;
    var meta=document.querySelector('meta[name="theme-color"]');
    if(meta) meta.content=theme==='dark'?'#080c12':'#f7f8f6';
    try{localStorage.setItem('duttarTheme',preference);}catch(error){}
    window.dispatchEvent(new CustomEvent('duttar-theme-change',{detail:{preference:preference,theme:theme}}));
  }
  window.DuttarTheme={apply:apply,get preference(){return preference;}};
  media.addEventListener('change',function(){if(preference==='system')apply('system');});
  apply(preference);
})();
