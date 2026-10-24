/* Portal-only navigation. History retains live nodes and handlers in this signed-in
   session. It never replays the click which loaded a screen or performed a write. */
(() => {
  const back=document.getElementById('back'),header=document.querySelector('.topbar');
  if(!back||!header)return;
  const past=[],future=[],limit=60,handlers=['onclick','onchange','oninput','onsubmit','onkeydown','onkeyup','ondblclick'];
  let pending=null,restoring=false,refreshing=false,timer,selectBefore=null;
  const icon=path=>'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+path+'</svg>';
  const controls=document.createElement('nav');controls.className='portal-browser-controls';controls.setAttribute('aria-label','Portal page navigation');
  back.className='portal-browser-button';back.innerHTML=icon('<path d="m14 6-6 6 6 6M8 12h12"/>');
  back.setAttribute('aria-label','Back one page');back.title='Back one page';
  controls.append(back);
  for(const [id,label,path] of [['portalForward','Forward one page','<path d="m10 6 6 6-6 6M16 12H4"/>'],['portalRefresh','Refresh this page','<path d="M20 7v5h-5M4 17v-5h5"/><path d="M6.1 7a7 7 0 0 1 11.6-1L20 9M4 15l2.3 3A7 7 0 0 0 18 17"/>'],['portalHome','Portal Home','<path d="m3 11 9-8 9 8M5 10v11h5v-7h4v7h5V10"/>']]){
    const b=document.createElement('button');b.type='button';b.id=id;b.className='portal-browser-button';b.title=label;b.setAttribute('aria-label',label);b.innerHTML=icon(path);controls.append(b);
  }
  header.insertBefore(controls,header.querySelector('.portal-search')||header.querySelector('.user'));
  const forward=document.getElementById('portalForward'),refresh=document.getElementById('portalRefresh');
  const notice=document.createElement('span');notice.className='portal-navigation-status';notice.setAttribute('role','status');notice.setAttribute('aria-live','polite');controls.append(notice);
  const css=document.createElement('style');css.textContent=`
    .portal-browser-controls{display:flex;align-items:center;gap:5px;flex:none;position:relative}
    .portal-browser-controls .portal-browser-button,#back.portal-browser-button{position:static!important;display:inline-flex!important;align-items:center;justify-content:center;width:36px!important;height:36px!important;min-width:36px;padding:7px!important;margin:0!important;border:1px solid #c6cbd1!important;border-radius:8px!important;background:#fff!important;color:#15171b!important;box-shadow:none!important;cursor:pointer;flex:none}
    .topbar .page-title{white-space:nowrap}.topbar .signout-btn{white-space:nowrap}.topbar .user{flex:none}
    @media(min-width:761px) and (max-width:1450px){.topbar .user>span{display:none}.topbar>.portal-search{min-width:160px;flex:1}.topbar>div:has(>.page-title){flex:none}}
    .portal-browser-controls svg{display:block;width:20px;height:20px}
    .portal-browser-controls .portal-browser-button:hover:not(:disabled){background:#f3e7ea!important;border-color:#bd1838!important;color:#a70f2c!important}
    .portal-browser-controls .portal-browser-button:disabled{opacity:.32;cursor:default}
    .portal-browser-controls .portal-browser-button:focus-visible{outline:3px solid #bd1838;outline-offset:3px}
    .portal-navigation-status{position:absolute;top:45px;right:0;white-space:nowrap;font-size:11px;color:#fff;background:#1d222a;border-radius:5px;padding:7px 10px;z-index:10;pointer-events:none}
    .portal-navigation-status:empty{display:none}
    #mobilePageRefresh,[data-portal-legacy-back]{display:none!important}
    @media(max-width:1100px) and (min-width:761px){.topbar{gap:10px!important;padding-left:18px!important;padding-right:18px!important}.topbar .user>span{display:none}.portal-browser-controls{gap:3px}.portal-search{min-width:140px!important}}
    @media(max-width:760px){body.portal-authenticated .topbar{height:auto!important;min-height:106px!important;flex-wrap:wrap!important;padding:10px 12px!important}body.portal-authenticated #mobilePageRefresh,[data-portal-legacy-back]{display:none!important}.portal-browser-controls{order:5;flex-basis:100%;justify-content:flex-start;gap:7px}.portal-browser-controls .portal-browser-button,#back.portal-browser-button{width:38px!important;height:38px!important;background:#202126!important;color:#fff!important;border-color:#555!important}.portal-navigation-status{left:185px;right:auto;top:5px;white-space:normal}.topbar>.user{margin-left:auto}}
  `;document.head.append(css);
  function align(){document.documentElement.style.setProperty('--portal-back-top',Math.ceil(header.getBoundingClientRect().height||76)+10+'px');}
  align();if(typeof ResizeObserver!=='undefined')new ResizeObserver(align).observe(header);
  const visible=n=>n&&!!n.getClientRects().length&&!n.closest('[hidden]');
  const home=()=>!document.getElementById('dashboard').classList.contains('hidden');
  const workspace=()=>moduleKey()==='sponsorsnew'?document.getElementById('sponsorshipsNewWorkspace'):document.querySelector('.detail-body > .active')||document.getElementById('detailTasks');
  const moduleKey=()=>home()?'home':document.querySelector('.sidebar [data-module].active')?.dataset.module||moduleLoadingKey||'home';
  function signature(){
    if(home())return 'home';
    const root=workspace();
    const outline=[...root.querySelectorAll('h1,h2,h3,h4,h5,h6,strong,[aria-selected=true],[aria-pressed=true],.selected,.active,select,details[open],iframe')].filter(n=>visible(n)&&!n.closest('dialog,table')).map(n=>n.tagName==='SELECT'?n.id+':'+n.value:n.tagName==='IFRAME'?n.id+':'+n.getAttribute('src'):n.tagName+':'+(n.id||'')+':'+(n.matches('.active')?JSON.stringify(n.dataset):n.textContent.trim().slice(0,160))).slice(0,150);
    return JSON.stringify([moduleKey(),root.id,outline,typeof recordsCategory!=='undefined'?recordsCategory:'',typeof minutesView!=='undefined'?minutesView:null,moduleKey()==='tracker'?document.getElementById('taskTrackerFrame')?.contentWindow?.portalTaskNavigation?.capture():null]);
  }
  function tree(node,skipChildren=false){
    if(!node)return null;
    const item={node};
    if(node.nodeType===1){
      item.attrs=[...node.attributes].map(a=>[a.name,a.value]);item.events=handlers.map(key=>node[key]);
      if('value'in node&&node.type!=='file')item.value=node.value;if('checked'in node)item.checked=node.checked;
      if(node.tagName==='DETAILS')item.open=node.open;
      item.scrollTop=node.scrollTop;item.scrollLeft=node.scrollLeft;
      // Hidden panels still need their attributes restored. Their large contents
      // are retained in place and captured only when that panel is the active page.
      skipChildren=skipChildren||node.hidden||node.matches('[data-finance-panel]:not(.active),[data-bft-panel]:not(.active),[data-bike-panel]:not(.active),[data-market-panel]:not(.active),[data-sponsor-panel]:not(.active)');
    }else item.text=node.nodeValue;
    if(!skipChildren)item.children=[...node.childNodes].map(n=>tree(n));
    return item;
  }
  function restoreTree(item){
    if(!item)return;const n=item.node;
    if(n.nodeType===1){
      for(const a of [...n.attributes])if(!item.attrs.some(([key])=>key===a.name))n.removeAttribute(a.name);
      for(const [key,value]of item.attrs)if(n.getAttribute(key)!==value)n.setAttribute(key,value);
      handlers.forEach((key,i)=>{if(n[key]!==item.events[i])n[key]=item.events[i];});
    }else if(n.nodeValue!==item.text)n.nodeValue=item.text;
    if(item.children){item.children.forEach(restoreTree);if(item.children.length!==n.childNodes.length||item.children.some((c,i)=>n.childNodes[i]!==c.node))n.replaceChildren(...item.children.map(c=>c.node));}
    if(item.value!==undefined)n.value=item.value;if(item.checked!==undefined)n.checked=item.checked;if(item.open!==undefined)n.open=item.open;
    if(n.nodeType===1){n.scrollTop=item.scrollTop;n.scrollLeft=item.scrollLeft;}
  }
  function snapshot(){
    const isHome=home();
    return {signature:signature(),home:isHome,module:moduleKey(),tree:isHome?null:tree(workspace()),header:tree(document.querySelector('.detail-head')),
      workspaceStates:[...document.querySelectorAll('.detail-body > *,.detail-shell > section')].map(node=>tree(node,true)),adapters:Object.values(window.portalViewAdapters||{}).map(adapter=>({adapter,state:adapter.capture()})),
      recordsDashboard,recordsCategory,membership:currentMembershipSheet,clubActive:Object.fromEntries(Object.entries(clubFramework).map(([k,v])=>[k,v.active])),minutes:{...minutesView},storage:{...storageState},storageBrowseAll,scroll:window.scrollY,
      frame:moduleKey()==='tracker'?document.getElementById('taskTrackerFrame')?.contentWindow?.portalTaskNavigation?.capture():null};
  }
  function announce(message){notice.textContent=message;clearTimeout(announce.timer);announce.timer=setTimeout(()=>notice.textContent='',3500);}
  function update(){if(!home())workspace()?.querySelectorAll('button').forEach(b=>{if(!b.closest('dialog')&&isLocalBack(b)&&!b.hasAttribute('data-portal-legacy-back'))b.setAttribute('data-portal-legacy-back','');});back.disabled=!past.length&&!document.querySelector('dialog[open]');forward.disabled=!future.length;refresh.disabled=refreshing;}
  function push(list,item){list.push(item);if(list.length>limit)list.shift();}
  function commit(){
    if(pending&&pending.signature!==signature()){push(past,pending);future.length=0;pending=null;}
    update();
  }
  function restore(view){
    restoring=true;pending=null;
    try{
      recordsDashboard=view.recordsDashboard;recordsCategory=view.recordsCategory;currentMembershipSheet=view.membership;
      Object.entries(view.clubActive).forEach(([k,v])=>{if(clubFramework[k])clubFramework[k].active=v;});Object.assign(minutesView,view.minutes);Object.assign(storageState,view.storage);storageBrowseAll=view.storageBrowseAll;
      if(view.home){view.workspaceStates.forEach(restoreTree);document.getElementById('dashboard').classList.remove('hidden');document.getElementById('detail').classList.remove('active');}
      else{view.workspaceStates.forEach(restoreTree);restoreTree(view.tree);restoreTree(view.header);document.getElementById('dashboard').classList.add('hidden');document.getElementById('detail').classList.add('active');}
      moduleLoadingKey=view.module;setActive(view.module);
      document.querySelectorAll('[data-mobile-module]').forEach(b=>b.classList.toggle('active',b.dataset.mobileModule===view.module));
      document.querySelector('.mobile-more-sheet')?.classList.remove('open');
      view.adapters.forEach(({adapter,state})=>adapter.restore(state));
      if(view.frame)document.getElementById('taskTrackerFrame')?.contentWindow?.portalTaskNavigation?.restore(view.frame);
      window.dispatchEvent(new CustomEvent('portalviewrestored',{detail:{module:view.module}}));
      window.scrollTo({top:view.scroll,behavior:'instant'});
    }finally{restoring=false;update();}
  }
  function move(direction){
    commit();pending=null;
    const dialog=[...document.querySelectorAll('dialog[open]')].at(-1);
    if(dialog){dialog.dispatchEvent(new Event('cancel',{cancelable:true}))&&dialog.close();update();return;}
    const frame=document.getElementById('taskTrackerFrame');
    if(moduleKey()==='tracker'&&frame?.contentWindow?.portalTaskNavigation?.closeDialog()){update();return;}
    const source=direction<0?past:future,target=direction<0?future:past;
    if(!source.length){update();return;}
    const current=snapshot(),next=source.pop();push(target,current);restore(next);
  }
  async function refreshCurrent(){
    if(refreshing)return;commit();pending=null;refreshing=true;update();
    try{
      const root=workspace(),key=moduleKey();
      if(key==='home'){await Promise.allSettled([loadOperationsOverview(),loadAdminSystemStatus(),loadSharedPortalAudit()]);}
      else if(key==='tracker'){await document.getElementById('taskTrackerFrame')?.contentWindow?.portalTaskNavigation?.refresh();}
      else{
        const button=[...root.querySelectorAll('button')].find(b=>visible(b)&&!b.disabled&&/^(refresh|reload|retry)\b/i.test((b.textContent||b.getAttribute('aria-label')||'').trim())&&!b.closest('dialog'));
        if(button){if(typeof button.onclick==='function')await button.onclick.call(button,new Event('click'));else button.click();}
        else if(Object.values(window.portalViewAdapters||{}).some(a=>a.module===key&&a.refresh))await Object.values(window.portalViewAdapters).find(a=>a.module===key&&a.refresh).refresh();
        else if(key==='membership')await loadMembershipSheet(currentMembershipSheet,true);
        else if(key==='finance'&&root.querySelector('[data-finance-tab]'))await loadFinanceTab(root.querySelector('[data-finance-tab].active')?.dataset.financeTab||'dashboard',true);
        else if(key==='bft')await loadBftData();else if(key==='bikenights')await loadBikeNightData();else if(key==='marketplace')await loadMarketplaceData();else if(key==='sponsors')await loadSponsorData();else if(key==='storage')await loadStorage();else if(key==='admin')await loadAdminSystemStatus();
      }
      announce('Page refreshed');
    }catch(error){announce('Could not refresh. '+error.message);}
    finally{refreshing=false;pending=null;update();}
  }
  function beforeNavigation(){if(restoring||refreshing)return;commit();pending=snapshot();}
  const actions=/^(refresh|reload|retry|sync|save|delete|remove|copy|approve|send|cancel|close|sign out|edit|add|new|export|download|print|upload|scan|submit)\b/i;
  function candidate(control){
    if(!control||control.tagName==='SUMMARY'||control.closest('dialog,form,#authGate,.portal-browser-controls')||control.matches('#signOut,#menuToggle,#mobilePageRefresh,[data-gc-edit],[data-gc-file-edit],[data-gc-doc-edit],[data-gc-doc-add],[data-password-toggle],[data-password-copy]'))return false;
    if(control.tagName==='A'&&control.getAttribute('href')&&!control.getAttribute('href').startsWith('#'))return false;
    return !actions.test((control.textContent||control.getAttribute('aria-label')||'').trim());
  }
  function isLocalBack(control){
    if(!control||control.closest('.portal-browser-controls'))return false;
    return [...control.attributes].some(a=>/^data-(?:.*-)?back$/.test(a.name))||/^(?:←\s*(?:back|club|all|dashboard|governance|member|finance|storage|vendors|events|meeting|return|records)|‹\s*back|back\b|go back\b)/i.test((control.textContent||'').trim());
  }
  document.addEventListener('click',event=>{
    const button=event.target.closest('#back,#portalForward,#portalRefresh,#portalHome,#mobilePageRefresh');
    if(button){event.preventDefault();event.stopImmediatePropagation();if(button.id==='back')move(-1);else if(button.id==='portalForward')move(1);else if(button.id==='portalRefresh'||button.id==='mobilePageRefresh')refreshCurrent();else{beforeNavigation();showModule('home');commit();pending=null;}return;}
    if(restoring||!document.body.classList.contains('portal-authenticated'))return;
    const control=event.target.closest('button,a,summary,[role=button],[data-open],[data-module]');
    if(!control||!control.closest('#detail,#dashboard,#sidebar,.mobile-app-nav,.mobile-more-sheet,#portalSearchResults'))return;
    // Old in-page back controls use the same single-step history as the header.
    if(isLocalBack(control)&&!control.closest('dialog')){event.preventDefault();event.stopImmediatePropagation();move(-1);return;}
    if(candidate(control))beforeNavigation();else{commit();pending=null;}
    clearTimeout(timer);timer=setTimeout(commit,50);
  },true);
  document.addEventListener('focusin',event=>{if(event.target.matches('select')&&event.target.closest('#detail')&&!event.target.closest('dialog,form'))selectBefore={node:event.target,view:snapshot()};},true);
  document.addEventListener('change',event=>{
    if(restoring||!event.target.matches('select')||!event.target.closest('#detail')||event.target.closest('dialog,form'))return;
    commit();pending=selectBefore?.node===event.target?selectBefore.view:snapshot();selectBefore=null;clearTimeout(timer);timer=setTimeout(commit,50);
  },true);
  // Async drill-downs may finish seconds after their initiating click.
  new MutationObserver(()=>{if(restoring||refreshing)return;if(pending){clearTimeout(timer);timer=setTimeout(commit,50);}else update();}).observe(document.getElementById('detail'),{subtree:true,childList:true,attributes:true,attributeFilter:['class','hidden','aria-selected','open']});
  function clear(){past.length=0;future.length=0;pending=null;selectBefore=null;update();}
  document.getElementById('signOut')?.addEventListener('click',clear);
  new MutationObserver(()=>{if(!document.body.classList.contains('portal-authenticated'))clear();}).observe(document.body,{attributes:true,attributeFilter:['class']});
  window.portalGoBack=()=>move(-1);window.portalGoForward=()=>move(1);window.portalRefreshCurrent=refreshCurrent;
  window.portalNavigation={before:beforeNavigation,after:commit,clear};
  update();
})();
