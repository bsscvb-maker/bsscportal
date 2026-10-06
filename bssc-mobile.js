/* BSSC Mobile App Layer */
(function(){
  if(window.__bsscMobileLayer)return; window.__bsscMobileLayer=true;
  const mq=window.matchMedia('(max-width:760px)');
  const mainItems=[
    ['home','⌂','Home'],['membership','♟','Members'],['bft','♢','BFT'],['records','▤','Records']
  ];
  const moreItems=[['finance','Finance'],['bikenights','Bike Nights'],['marketplace','Marketplace'],['sponsors','Sponsorships'],['storage','Storage'],['volunteers','Events & Volunteers'],['admin','Administration']];
  function go(key){
    const target=document.querySelector('[data-module="'+key+'"]');
    if(target){target.click(); sync(key);}
    document.querySelector('.mobile-more-sheet')?.classList.remove('open');
  }
  function current(){
    if(!document.getElementById('dashboard')?.classList.contains('hidden'))return 'home';
    const active=document.querySelector('.sidebar [data-module].active');
    return active?.dataset.module||'home';
  }
  function sync(key=current()){
    document.querySelectorAll('[data-mobile-module]').forEach(b=>{
      const k=b.dataset.mobileModule;
      b.classList.toggle('active',k===key||(k==='more'&&moreItems.some(x=>x[0]===key)));
    });
    const title=document.querySelector('.page-title');
    if(title&&mq.matches) title.childNodes[0].nodeValue = key==='home'?'BSSC Mobile':((document.getElementById('detailTitle')?.textContent||'BSSC')+' ');
  }
  function build(){
    if(!mq.matches||document.querySelector('.mobile-app-nav'))return;
    const nav=document.createElement('nav');nav.className='mobile-app-nav';nav.setAttribute('aria-label','Mobile navigation');
    nav.innerHTML=mainItems.map(([k,i,l])=>'<button type="button" data-mobile-module="'+k+'"><span class="mi">'+i+'</span><span>'+l+'</span></button>').join('')+
      '<button type="button" data-mobile-module="more"><span class="mi">•••</span><span>More</span></button>';
    const sheet=document.createElement('section');sheet.className='mobile-more-sheet';sheet.innerHTML='<h3>More modules</h3><div class="mobile-more-grid">'+moreItems.map(([k,l])=>'<button type="button" data-mobile-module="'+k+'">'+l+'</button>').join('')+'</div>';
    document.body.append(sheet,nav);
    nav.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{
      if(b.dataset.mobileModule==='more'){sheet.classList.toggle('open');sync();return;} go(b.dataset.mobileModule);
    }));
    sheet.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>go(b.dataset.mobileModule)));
    document.addEventListener('click',e=>{if(sheet.classList.contains('open')&&!sheet.contains(e.target)&&!e.target.closest('[data-mobile-module="more"]'))sheet.classList.remove('open');});
    document.querySelectorAll('[data-module],[data-open],#back').forEach(el=>el.addEventListener('click',()=>setTimeout(()=>sync(),0)));
    sync();
  }
  function remove(){document.querySelector('.mobile-app-nav')?.remove();document.querySelector('.mobile-more-sheet')?.remove();}
  function apply(){mq.matches?build():remove();}
  mq.addEventListener?.('change',apply);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply);else apply();
})();