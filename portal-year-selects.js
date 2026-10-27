(function(root){
  'use strict';
  function normalizeYearPicker(select,latestYear){
    const options=Array.from(select.options),years=options.filter(option=>/^20\d{2}(?:\b|$)/.test(option.textContent.trim())&&/^20\d{2}$/.test(option.value));
    if(!years.length)return;
    const valid=years.filter(option=>Number(option.value)<=latestYear).sort((a,b)=>Number(b.value)-Number(a.value));
    const other=options.filter(option=>!years.includes(option));
    const ordered=[...valid,...other],selected=select.value;
    const next=ordered.some(option=>option.value===selected)?selected:(valid[0]?.value||other[0]?.value||'');
    if(options.length===ordered.length&&options.every((option,i)=>option===ordered[i])&&select.value===next)return;
    years.filter(option=>!valid.includes(option)).forEach(option=>option.remove());
    ordered.forEach(option=>select.appendChild(option));
    select.value=next;
    ordered.forEach(option=>{option.defaultSelected=option.value===next;});
  }
  function latestDataYear(){
    if(typeof membershipSheetConfig!=='undefined'){
      const years=Object.keys(membershipSheetConfig).filter(name=>/^20\d{2}$/.test(name)).map(Number);
      if(years.length)return Math.max(...years);
    }
    return 2027;
  }
  function install(){
    let queued=false;
    const update=()=>{queued=false;document.querySelectorAll('select').forEach(select=>normalizeYearPicker(select,latestDataYear()));};
    update();
    new MutationObserver(()=>{if(!queued){queued=true;requestAnimationFrame(update);}}).observe(document.body,{childList:true,subtree:true});
  }
  if(typeof module==='object'&&module.exports)module.exports={normalizeYearPicker};
  else {root.BSSCYearPickers={normalizeYearPicker};install();}
})(typeof window==='undefined'?globalThis:window);
