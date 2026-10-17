/* Home-page presentation only. Classic view disables every refresh rule. */
(()=>{
 const home=document.getElementById('dashboard');if(!home)return;
 const key='bssc_home_refresh_v1';
 const bar=document.createElement('div');bar.className='home-view-switch';
 const text=document.createElement('div');text.innerHTML='<span class="home-kicker">BONESHAKERS · CLUB OPERATIONS</span><h2>Your club. One place.</h2><p>People, programs, and the work that keeps us moving.</p>';
 const button=document.createElement('button');button.type='button';button.className='sponsor-tab';
 bar.append(text,button);home.prepend(bar);
 const style=document.createElement('link');style.rel='stylesheet';style.href='home-refresh.css?v=20261017';document.head.append(style);
 let enabled=true;try{enabled=localStorage.getItem(key)!=='classic'}catch{}
 function apply(){document.body.classList.toggle('bssc-home-refresh',enabled);button.textContent=enabled?'Classic view':'Try refreshed view';button.setAttribute('aria-label',enabled?'Restore the original home-page design':'Show the refreshed home-page design');try{localStorage.setItem(key,enabled?'refreshed':'classic')}catch{}}
 button.onclick=()=>{enabled=!enabled;apply()};apply();
 const accents={membership:['#df6077','223,96,119'],finance:['#5dc8ae','93,200,174'],bft:['#e8b65c','232,182,92'],bikenights:['#7da9f6','125,169,246'],marketplace:['#c592f1','197,146,241'],sponsors:['#e5a36d','229,163,109'],tracker:['#6dcad4','109,202,212'],storage:['#a7ba84','167,186,132'],volunteers:['#c997b9','201,151,185'],records:['#91a3cb','145,163,203'],admin:['#aaaeb7','170,174,183']};
 home.querySelectorAll('[data-module-card]').forEach(card=>{const a=accents[card.dataset.moduleCard]||accents.admin;card.style.setProperty('--home-accent',a[0]);card.style.setProperty('--home-rgb',a[1]);const button=card.querySelector('[data-open]');if(button){const original=button.textContent;button.dataset.classicLabel=original;const label=card.querySelector('h2')?.textContent||'module';button.setAttribute('aria-label','Open '+label)}});
})();
