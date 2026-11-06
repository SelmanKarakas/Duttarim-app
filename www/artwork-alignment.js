// Coordinates measured on the 724 x 2171 full instrument master.
(()=>{
  const positions=[493,560,704,799,911,976,362,1055,1127,1165,1236];
  const map=document.querySelector('#fretsPanel .fret-map');
  const img=map?.querySelector('.fret-duttar img');
  const grid=document.querySelector('#fretGrid');
  if(!map||!img||!grid)return;
  const ns='http://www.w3.org/2000/svg';
  const guides=document.createElementNS(ns,'svg');
  guides.classList.add('fret-guides');guides.setAttribute('aria-hidden','true');map.appendChild(guides);
  let pending=false;
  function schedule(){if(!pending){pending=true;requestAnimationFrame(align);}}
  function align(){
    pending=false;
    const box=map.getBoundingClientRect(),art=img.getBoundingClientRect();
    if(!box.height||!art.height)return;
    guides.setAttribute('viewBox',`0 0 ${box.width} ${box.height}`);
    guides.replaceChildren();
    const labels=[...grid.querySelectorAll('.fret-label')].map(el=>({el,y:art.top-box.top+(el.dataset.index==='open'?704:positions[Number(el.dataset.index)])/2171*art.height}));
    // Keep the original label sizes; guides retain the exact fret coordinates.
    const right=labels.filter(x=>x.el.classList.contains('string-1')).sort((a,b)=>a.y-b.y);
    let previousBottom=-Infinity;
    for(const item of right){
      const height=item.el.getBoundingClientRect().height;
      item.displayY=Math.max(item.y,previousBottom+2+height/2);
      previousBottom=item.displayY+height/2;
    }
    for(const item of labels){
      item.el.style.top=(item.displayY??item.y)+'px';
      const rect=item.el.getBoundingClientRect(),left=item.el.classList.contains('string-0');
      const line=document.createElementNS(ns,'line');
      line.setAttribute('x1',String((left?rect.right:rect.left)-box.left));
      line.setAttribute('y1',String(rect.top-box.top+rect.height/2));
      line.setAttribute('x2',String(art.left-box.left+(left?300:405)/724*art.width));
      line.setAttribute('y2',String(item.y));guides.appendChild(line);
    }
  }
  new ResizeObserver(schedule).observe(map);
  new MutationObserver(schedule).observe(grid,{childList:true});
  img.addEventListener('load',schedule);schedule();
})();
