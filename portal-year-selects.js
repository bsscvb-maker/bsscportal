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

  let pickerId=0;
  function enhanceYearPicker(select){
    const options=Array.from(select.options);
    if(options.filter(option=>/^20\d{2}$/.test(option.value)).length<2)return;
    let box=select.nextElementSibling;
    if(!box?.classList.contains('bssc-year-menu')){
      box=document.createElement('span');box.className='bssc-year-menu';
      const button=document.createElement('button');button.type='button';button.className='bssc-year-button';button.setAttribute('aria-haspopup','listbox');button.setAttribute('aria-expanded','false');
      const list=document.createElement('span');list.className='bssc-year-options';list.id='bssc-year-options-'+(++pickerId);list.setAttribute('role','listbox');list.hidden=true;
      button.setAttribute('aria-controls',list.id);box.append(button,list);select.after(box);select.style.display='none';
      const close=()=>{list.hidden=true;button.setAttribute('aria-expanded','false');};
      const open=()=>{list.hidden=false;button.setAttribute('aria-expanded','true');const chosen=list.querySelector('[aria-selected="true"]')||list.firstElementChild;if(chosen){list.scrollTop=chosen.offsetTop;chosen.focus({preventScroll:true});}};
      button.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();list.hidden?open():close();});
      button.addEventListener('keydown',event=>{if(['ArrowDown','ArrowUp'].includes(event.key)){event.preventDefault();open();}});
      list.addEventListener('keydown',event=>{
        const items=Array.from(list.children),index=items.indexOf(document.activeElement);let next=index;
        if(event.key==='ArrowDown')next=Math.min(items.length-1,index+1);
        else if(event.key==='ArrowUp')next=Math.max(0,index-1);
        else if(event.key==='Home')next=0;else if(event.key==='End')next=items.length-1;
        else if(event.key==='Escape'){event.preventDefault();close();button.focus();return;}else return;
        event.preventDefault();items[next]?.focus();
      });
      box.addEventListener('focusout',()=>{setTimeout(()=>{if(!box.contains(document.activeElement))close();},0);});
      select.addEventListener('change',()=>{box.dataset.signature='';enhanceYearPicker(select);});
    }
    const signature=JSON.stringify([select.value,options.map(option=>[option.value,option.textContent,option.disabled])]);
    if(box.dataset.signature===signature)return;
    box.dataset.signature=signature;
    const button=box.firstElementChild,list=box.lastElementChild;
    button.textContent=(options.find(option=>option.value===select.value)?.textContent||'Choose year')+' ▾';
    button.setAttribute('aria-label',select.getAttribute('aria-label')||'Choose year');button.disabled=select.disabled;
    list.setAttribute('aria-label',button.getAttribute('aria-label'));list.replaceChildren();
    options.forEach(option=>{
      const item=document.createElement('button');item.type='button';item.setAttribute('role','option');item.setAttribute('aria-selected',String(option.value===select.value));item.textContent=option.textContent;item.disabled=option.disabled;item.tabIndex=-1;
      item.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();select.value=option.value;list.hidden=true;button.setAttribute('aria-expanded','false');select.dispatchEvent(new Event('change',{bubbles:true}));if(button.isConnected)button.focus();});
      list.appendChild(item);
    });
  }

  function latestDataYear(){
    if(typeof membershipSheetConfig!=='undefined'){
      const years=Object.keys(membershipSheetConfig).filter(name=>/^20\d{2}$/.test(name)).map(Number);
      if(years.length)return Math.max(...years);
    }
    return 2027;
  }
  function install(){
    const style=document.createElement('style');style.textContent='.bssc-year-menu{position:relative;display:inline-block;margin-left:10px;vertical-align:middle}.bssc-year-button{min-height:44px;padding:9px 14px!important;border:1px solid #88919c!important;border-radius:7px!important;background:#fff!important;color:#171717!important;font:700 16px Arial,sans-serif!important;cursor:pointer}.bssc-year-options{position:absolute;top:calc(100% + 4px);left:0;z-index:10000;display:block;min-width:145px;max-height:280px;overflow-y:auto;padding:4px;background:#fff;color:#171717;border:1px solid #88919c;border-radius:8px;box-shadow:0 6px 20px #0004}.bssc-year-options[hidden]{display:none!important}.bssc-year-options button{display:block;width:100%;min-height:42px;text-align:left;padding:10px 14px!important;border:0!important;border-radius:4px!important;background:#fff!important;color:#171717!important;font:16px Arial,sans-serif!important;cursor:pointer}.bssc-year-options button[aria-selected=true]{background:#c8102e!important;color:white!important;font-weight:700!important}.bssc-year-options button:focus{outline:3px solid #2867ad!important;outline-offset:-3px;background:#fce8ec!important;color:#171717!important}';document.head.appendChild(style);
    document.addEventListener('pointerdown',event=>{document.querySelectorAll('.bssc-year-menu').forEach(box=>{if(!box.contains(event.target)){box.lastElementChild.hidden=true;box.firstElementChild.setAttribute('aria-expanded','false');}});});
    let queued=false;
    const update=()=>{queued=false;document.querySelectorAll('select').forEach(select=>{normalizeYearPicker(select,latestDataYear());enhanceYearPicker(select);});};
    update();
    new MutationObserver(()=>{if(!queued){queued=true;requestAnimationFrame(update);}}).observe(document.body,{childList:true,subtree:true});
  }
  if(typeof module==='object'&&module.exports)module.exports={normalizeYearPicker};
  else {root.BSSCYearPickers={normalizeYearPicker};install();}
})(typeof window==='undefined'?globalThis:window);
