(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.ScoreVersions=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
function isVersion(s){return !!(s&&s.versionGroup&&s.versionGroup.id&&Number.isSafeInteger(s.versionLevel)&&s.versionLevel>0);}
function validate(catalog){
 const groups=new Map();
 for(const s of catalog){
  if(s.versionGroup===undefined&&s.versionLevel===undefined)continue;
  const g=s.versionGroup;
  if(!g||typeof g.id!=='string'||!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(g.id)||g.id.length>100||!g.title||typeof g.title.latin!=='string'||!g.title.latin.trim()||g.title.latin.length>160||typeof g.title.ug!=='string'||g.title.ug.length>160||!Number.isSafeInteger(s.versionLevel)||s.versionLevel<1)throw Error('Versiyon grubu, eser adı ve pozitif tam sayı seviye gereklidir.');
  if(!(s.simplePages?.length||s.notationPages?.length))throw Error('Her versiyona en az bir nota sayfası ekleyin.');
  if(s.difficulty!==undefined)throw Error('Versiyonlu eserlerde kolay / orta / zor seviyesi kullanılmaz.');
  let group=groups.get(g.id);
  if(!group){group={title:g.title,levels:new Set()};groups.set(g.id,group);}
  if(group.title.latin!==g.title.latin||group.title.ug!==g.title.ug)throw Error('Aynı gruptaki eser adları aynı olmalıdır.');
  if(group.levels.has(s.versionLevel))throw Error('Bu eserde aynı seviye zaten var. Farklı bir seviye seçin.');
  group.levels.add(s.versionLevel);
 }
 return catalog;
}
function band(level){return Math.min(5,Math.max(1,level));}
return {isVersion,validate,band};
});
