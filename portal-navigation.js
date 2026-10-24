/* Previous-screen navigation. Snapshots retain DOM nodes and their event handlers;
   Back never replays a save, payment, email, or deletion action. Session memory only. */
(() => {
  const stack=[];
  let restoring=false,pending=null,sequence=0,selectBefore=null;
  const button=document.getElementById('back');
  if(!button)return;
  button.querySelector('span:last-child').textContent='Back';
  button.setAttribute('aria-label','Go back one screen');
  button.title='Go back one screen';
  const style=document.createElement('style');
  style.textContent='#back{position:sticky;top:var(--portal-back-top,86px)!important;z-index:3!important;background:#000;color:#fff;border-color:#555;box-shadow:0 2px 8px #0002} #back:hover{background:#222;color:#fff}#back .back-icon{color:#fff}#back:focus-visible{outline:3px solid #ad1932;outline-offset:3px}';
  document.head.append(style);
  const header=document.querySelector('.topbar');
  const alignBack=()=>document.documentElement.style.setProperty('--portal-back-top',Math.ceil(header?.getBoundingClientRect().height||76)+10+'px');
  alignBack();
  if(header&&typeof ResizeObserver!=='undefined')new ResizeObserver(alignBack).observe(header);
  window.addEventListener('resize',alignBack,{passive:true});
  function signature(){
    if(!document.getElementById('dashboard').classList.contains('hidden'))return 'home';
    const workspace=document.querySelector('.detail-body > .active');
    return JSON.stringify([document.getElementById('detailTitle').textContent,workspace?.id,
      [...document.querySelectorAll('#detail [class~="active"]')].map(n=>n.id||Object.entries(n.dataset).map(([k,v])=>k+':'+v).join('|')).filter(Boolean),
      [...(workspace||document.getElementById('detail')).querySelectorAll('h2,h3,h4')].filter(n=>n.getClientRects().length).slice(0,60).map(n=>n.textContent),
      recordsDashboard,recordsCategory,typeof minutesView!=='undefined'?minutesView:null]);
  }
  function tree(node){
    if(node.nodeType===1&&(node.hidden||node.matches('[data-finance-panel]:not(.active),[data-bft-panel]:not(.active),[data-bike-panel]:not(.active),[data-market-panel]:not(.active),[data-sponsor-panel]:not(.active)')))return {node,untracked:true};
    const item={node,children:[...node.childNodes].map(tree)};
    if(node.nodeType===1){item.attrs=[...node.attributes].map(a=>[a.name,a.value]);if('value'in node&&node.type!=='file')item.value=node.value;if('checked'in node)item.checked=node.checked;item.scrollTop=node.scrollTop;item.scrollLeft=node.scrollLeft;}
    else item.text=node.nodeValue;
    return item;
  }
  function restoreTree(item){
    if(item.untracked)return;
    const n=item.node;
    if(n.nodeType===1){for(const a of [...n.attributes])if(!item.attrs.some(([k])=>k===a.name))n.removeAttribute(a.name);for(const[k,v]of item.attrs)if(n.getAttribute(k)!==v)n.setAttribute(k,v);}
    else if(n.nodeValue!==item.text)n.nodeValue=item.text;
    item.children.forEach(restoreTree);
    if(item.children.length!==n.childNodes.length||item.children.some((c,i)=>n.childNodes[i]!==c.node))n.replaceChildren(...item.children.map(c=>c.node));
    if(item.value!==undefined)n.value=item.value;if(item.checked!==undefined)n.checked=item.checked;
    if(n.nodeType===1){n.scrollTop=item.scrollTop;n.scrollLeft=item.scrollLeft;}
  }
  function snapshot(){
    const module=document.querySelector('.sidebar [data-module].active')?.dataset.module||document.querySelector('[data-module].active')?.dataset.module||'home';
    const home=!document.getElementById('dashboard').classList.contains('hidden');
    return {signature:signature(),home,module,tree:home?null:tree(document.querySelector('.detail-body > .active')||document.getElementById('detailTasks')),
      header:home?null:tree(document.querySelector('.detail-head')),
      workspaceClasses:[...document.querySelector('.detail-body').children].map(node=>({node,className:node.className})),
      recordsDashboard,recordsCategory,membership:currentMembershipSheet,
      clubActive:Object.fromEntries(Object.entries(clubFramework).map(([k,v])=>[k,v.active])),
      minutes:{...minutesView},storage:{...storageState},storageBrowseAll,scroll:window.scrollY};
  }
  function commit(){
    if(!pending)return;
    if(pending.signature!==signature()){
      if(stack.at(-1)?.signature!==pending.signature)stack.push(pending);
      if(stack.length>40)stack.shift();
    }
    pending=null;
  }
  function goBack(){
    commit();sequence++;
    const open=[...document.querySelectorAll('dialog[open]')].at(-1);if(open){open.close();return;}
    const previous=stack.pop();
    restoring=true;
    try{
      if(!previous||previous.home){showModule('home');return;}
      recordsDashboard=previous.recordsDashboard;recordsCategory=previous.recordsCategory;currentMembershipSheet=previous.membership;
      Object.entries(previous.clubActive).forEach(([k,v])=>{if(clubFramework[k])clubFramework[k].active=v;});
      Object.assign(minutesView,previous.minutes);Object.assign(storageState,previous.storage);storageBrowseAll=previous.storageBrowseAll;
      restoreTree(previous.tree);restoreTree(previous.header);
      previous.workspaceClasses.forEach(({node,className})=>{node.className=className;});
      document.getElementById('dashboard').classList.add('hidden');document.getElementById('detail').classList.add('active');
      moduleLoadingKey=previous.module;setActive(previous.module);
      document.querySelectorAll('[data-mobile-module]').forEach(b=>b.classList.toggle('active',b.dataset.mobileModule===previous.module));
      window.scrollTo({top:previous.scroll,behavior:'instant'});
    }finally{restoring=false;}
  }
  window.portalGoBack=goBack;
  document.addEventListener('click',event=>{
    if(event.target.closest('#back')){event.preventDefault();event.stopImmediatePropagation();goBack();return;}
    if(restoring||!document.body.classList.contains('portal-authenticated'))return;
    const control=event.target.closest('button,a,summary,[role="button"]');
    if(!control||/^(refresh|sync|save|delete|remove|copy|approve|send|cancel|close|sign out)\b/i.test((control.textContent||control.getAttribute('aria-label')||'').trim())||control.closest('dialog')||control.matches('[data-gc-edit],[data-gc-file-edit],[data-gc-doc-edit],[data-gc-doc-add]')||control.matches('#signOut')||control.closest('#authGate'))return;
    if(control.tagName==='A'&&control.getAttribute('href')&&!control.getAttribute('href').startsWith('#'))return;
    if(!control.closest('#detail,#dashboard,#sidebar,.mobile-app-nav,.mobile-more-sheet'))return;
    commit();pending=snapshot();const id=++sequence;
    setTimeout(()=>{if(id===sequence)commit();},100);
  },true);
  document.addEventListener('focusin',event=>{if(event.target.matches('select')&&event.target.closest('#detail'))selectBefore={node:event.target,view:snapshot()};},true);
  document.addEventListener('change',event=>{
    if(restoring||!event.target.matches('select')||!event.target.closest('#detail'))return;
    commit();pending=selectBefore?.node===event.target?selectBefore.view:snapshot();selectBefore=null;const id=++sequence;setTimeout(()=>{if(id===sequence)commit();},100);
  },true);
  document.getElementById('signOut')?.addEventListener('click',()=>{stack.length=0;pending=null;sequence++;});
})();
