/* Current home-page presentation and module navigation. */
(()=>{
 const home=document.getElementById('dashboard');if(!home)return;
 document.body.classList.add('bssc-home-refresh');
 try{localStorage.removeItem('bssc_home_refresh_v1')}catch{}
 const style=document.createElement('link');style.rel='stylesheet';style.href='home-refresh.css?v=20261017-visual';document.head.append(style);
 const navigationStyle=document.createElement('style');navigationStyle.textContent='body.bssc-home-refresh #dashboard .module footer{display:none!important}body.bssc-home-refresh #dashboard .home-tile-art:focus-visible{outline:3px solid #fff;outline-offset:-5px}';document.head.append(navigationStyle);
 const accents={membership:['#df6077','223,96,119'],finance:['#5dc8ae','93,200,174'],bft:['#e8b65c','232,182,92'],bikenights:['#7da9f6','125,169,246'],marketplace:['#c592f1','197,146,241'],sponsors:['#e5a36d','229,163,109'],tracker:['#6dcad4','109,202,212'],storage:['#a7ba84','167,186,132'],volunteers:['#c997b9','201,151,185'],records:['#91a3cb','145,163,203'],admin:['#aaaeb7','170,174,183']};
 const visualOrder=['membership','finance','bft','bikenights','marketplace','sponsors','tracker','storage','volunteers','records','admin'];
 home.querySelectorAll('[data-module-card]').forEach(card=>{const index=visualOrder.indexOf(card.dataset.moduleCard);if(index>=0){const art=document.createElement('button');art.type='button';art.className='home-tile-art';art.setAttribute('aria-label','Open '+(card.querySelector('h2')?.textContent||'module'));art.style.border='0';art.style.padding='0';art.style.cursor='pointer';art.onclick=()=>card.querySelector('[data-open]')?.click();art.style.backgroundImage='url(assets/portal-'+card.dataset.moduleCard+'.webp)';card.prepend(art);}const a=accents[card.dataset.moduleCard]||accents.admin;card.style.setProperty('--home-accent',a[0]);card.style.setProperty('--home-rgb',a[1]);const button=card.querySelector('[data-open]');if(button){const original=button.textContent;button.dataset.classicLabel=original;const label=card.querySelector('h2')?.textContent||'module';button.setAttribute('aria-label','Open '+label)}});
})();
