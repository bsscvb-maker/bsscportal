/* BoneShakers public website content. Update values and events here once for all connected pages. */
(function(){
"use strict";
var d={lifetime:"$443,898.20",bicycles:"2,100+",average:"123+",since:"2005",bikeCost:"$150",buildDate:"December 5, 2026",ytd:"$53,076.00",asOf:"October 15, 2026"};
var events=[
{date:"2026-10-17",title:"YMCA Greenbrier Trunk or Treat",time:"Time: see event details",place:"Greenbrier Family YMCA · 1033 Greenbrier Parkway, Chesapeake"},
{date:"2026-10-20",title:"BoneShakers Bike Night",time:"7–9 PM",place:"AJ Gators · 1993 Sandbridge Road, Virginia Beach"},
{date:"2026-10-24",title:"CVMA VA 27-14 Chili Cook Off",time:"11:45 AM–4 PM",place:"Meet-up: Wawa · 720 Woodlake Drive, Chesapeake"},
{date:"2026-10-30",title:"Plan Bee Academy Trunk or Treat",time:"Time: see event details",place:"Plan Bee Academy · 4500 Peek Trail, Chesapeake"},
{date:"2026-11-03",title:"General Meeting",time:"6:30–8:30 PM",place:"AJ Gators · 1993 Sandbridge Road, Virginia Beach"},
{date:"2026-11-11",title:"Veterans Day Parade",time:"Time and staging: see event details",place:"See the event calendar"},
{date:"2026-11-28",title:"PACH Stuff the Ambulance",time:"Time: see event details",place:"See the event calendar"},
{date:"2026-12-01",title:"General Meeting",time:"6:30–8:30 PM",place:"AJ Gators · 1993 Sandbridge Road, Virginia Beach"},
{date:"2026-12-05",title:"Bikes for Tykes Build",time:"Time and location: see event details",place:"See the event calendar"},
{date:"2026-12-05",title:"VB Holiday Parade",time:"3–8 PM",place:"See the event calendar"}
];
document.querySelectorAll("[data-bssc-counter]").forEach(function(el){var v=d[el.dataset.bsscCounter];if(v)el.dataset.bsscTarget=v.replace(/[^0-9]/g,"");});
document.querySelectorAll("[data-bssc-metric]").forEach(function(el){var v=d[el.dataset.bsscMetric];if(v)el.textContent=v;});
var today=new Intl.DateTimeFormat("en-CA",{timeZone:"America/New_York",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
document.querySelectorAll("[data-bssc-events]").forEach(function(el){
var n=Number(el.dataset.bsscEvents)||3;
var list=events.filter(function(e){return e.date>=today;}).slice(0,n);
if(!list.length){el.innerHTML='<p>Visit our event calendar for the latest rides and opportunities.</p>';return;}
el.innerHTML=list.map(function(e){var dt=new Date(e.date+"T12:00:00");return '<article class="tile"><p class="event-date">'+dt.toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})+'</p><h3>'+e.title+'</h3><p>'+e.time+'</p><p class="muted">'+e.place+'</p><a class="btn secondary" target="_top" href="https://boneshakerssocialclub.com/event-calendar">Event details</a></article>';}).join("");
});

var style=document.createElement("style");
style.textContent='.bssc-partners{padding:32px 0;max-width:1180px;margin:0 auto;text-align:center;font-family:Verdana,sans-serif}.bssc-partner-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:16px}.bssc-partner-card{display:flex;flex-direction:column;align-items:center;gap:12px;border:1px solid #444;border-radius:16px;padding:16px;text-decoration:none;color:#fff;background:#111;font-size:15px;font-weight:bold}.bssc-partner-card img{width:160px;height:130px;object-fit:contain}.bssc-partner-crop{width:160px;height:130px;display:block;background-repeat:no-repeat}.bssc-partner-card:focus-visible{outline:3px solid #ffaaa4;outline-offset:3px}';
document.head.appendChild(style);
var poster="https://img1.wsimg.com/isteam/ip/6b7b89b2-dd4f-422d-8d29-7971f64bd923/Boneshakers%20Motorcycle%20Riders%20Poster.png";
var partners=[
{name:"Brothers Flooring",href:"https://flooringcontractorportsmouthva.com/",crop:"background-size:617% 1181%;background-position:23.3% 95.3%"},
{name:"Boujiee Dogs",href:"https://www.facebook.com/profile.php?id=100089664885554",img:"https://img1.wsimg.com/isteam/ip/6b7b89b2-dd4f-422d-8d29-7971f64bd923/boujiee-dogs-cocktails-sponsor-logo-transparen.png"},
{name:"Elevation 27",href:"https://www.elevation27.com/",img:"https://img1.wsimg.com/isteam/ip/a61a7501-5b4e-4a14-8b09-6b6b40dc23cf/Elevation27.png"},
{name:"Courthouse Horizons",href:"https://courthousehorizons.com/the-venue/",img:"https://img1.wsimg.com/isteam/ip/6b7b89b2-dd4f-422d-8d29-7971f64bd923/courthouse-horizons-sponsor-logo-transparent.png"},
{name:"YMCA",href:"https://www.ymcashr.org/",crop:"height:130px;margin:0;background-size:640% 1536%;background-position:66.8% 86.2%;clip-path:inset(0 0 18px 0)"}
];
document.querySelectorAll("[data-bssc-partners]").forEach(function(el){
el.classList.add("bssc-partners");
el.innerHTML='<h2>Bikes for Tykes Partners</h2><p>We proudly recognize these partners for sharing their time, talents, services, and resources to help put local children on two wheels.</p><div class="bssc-partner-grid">'+partners.map(function(p){return '<a class="bssc-partner-card" href="'+p.href+'" target="_blank" rel="noopener noreferrer">'+(p.img?'<img loading="lazy" src="'+p.img+'" alt="'+p.name+'">':'<span class="bssc-partner-crop" role="img" aria-label="'+p.name+'" style="background-image:url('+poster+');'+p.crop+'"></span>')+'<span>'+p.name+'</span></a>';}).join("")+'</div>';
});
})();

/* Keep the native motto and navigation visible without fixing the large logo. */
(function(){
try {
var w=parent,doc=w.document;if(!doc.querySelector('[data-aid="HEADER_SECTION"]'))return;
function pin(){
var banner=doc.querySelector('[data-aid="BANNER_RENDERED"]'),nav=doc.querySelector('[data-aid="HEADER_NAV_RENDERED"]');
if(!banner||!nav)return;
var bar=nav.closest('nav[data-ux="Block"]');if(!bar)return;var group=bar.parentElement;
if(!doc.getElementById('bssc-fixed-navigation-style')){
var css=doc.createElement('style');css.id='bssc-fixed-navigation-style';css.textContent='.bssc-fixed-motto{position:fixed!important;top:0!important;left:0!important;width:100%!important;z-index:10001!important;background:#000!important}.bssc-fixed-menu{position:fixed!important;top:var(--bssc-motto-height,64px)!important;left:0!important;width:100%!important;z-index:10000!important;background:#000!important;box-shadow:0 3px 16px #0008}.bssc-fixed-menu>nav{background:#000!important}html{scroll-padding-top:calc(var(--bssc-header-height,144px) + 20px)!important}';
doc.head.appendChild(css);
}
banner.classList.add('bssc-fixed-motto');group.classList.add('bssc-fixed-menu');
var spacer=doc.getElementById('bssc-navigation-space');if(!spacer){spacer=doc.createElement('div');spacer.id='bssc-navigation-space';spacer.setAttribute('aria-hidden','true');banner.before(spacer)}
function size(){var bh=banner.getBoundingClientRect().height,nh=group.getBoundingClientRect().height;doc.documentElement.style.setProperty('--bssc-motto-height',bh+'px');doc.documentElement.style.setProperty('--bssc-header-height',(bh+nh)+'px');spacer.style.height=(bh+nh)+'px'}
size();if(!group.dataset.bsscPinned){group.dataset.bsscPinned='true';new w.ResizeObserver(size).observe(banner);w.addEventListener('resize',size)}
}
pin();
if(!doc.documentElement.dataset.bsscStickyWatch){doc.documentElement.dataset.bsscStickyWatch='true';var scheduled;new w.MutationObserver(function(){if(scheduled)return;scheduled=w.setTimeout(function(){scheduled=null;pin()},150)}).observe(doc.body,{childList:true,subtree:true})}
}catch(e){}
})();

/* Club backgrounds: black surfaces, with existing artwork, controls and status stamps retained. */
(function(){
function blackNativeSurfaces(doc){
if(doc.getElementById('bssc-black-native'))return;
var s=doc.createElement('style');s.id='bssc-black-native';s.textContent='html,body,section[data-ux="Section"],footer[data-ux="Footer"],header[data-ux="Header"],nav[data-ux="Block"]{background-color:#000!important;background-image:none!important}';doc.head.appendChild(s);
}
function blackSurfaces(doc){
if(doc.getElementById('bssc-black-surfaces'))return;
var s=doc.createElement('style');s.id='bssc-black-surfaces';
s.textContent='.bssc-black-surface{background-color:#000!important}.bssc-black-gradient{background-image:none!important}';
doc.head.appendChild(s);
var view=doc.defaultView;
doc.querySelectorAll('html,body,main,section,article,aside,header,footer,nav,div,form,fieldset,dialog,table,thead,tbody,tr,td,th').forEach(function(el){
if(el.closest('button,[role="button"],[class*="stamp"],[class*="badge"],[class*="icon"],[class*="btn"],[class*="payment"]'))return;
el.classList.add('bssc-black-surface');
var bg=view.getComputedStyle(el).backgroundImage;
if(bg.indexOf('gradient(')!==-1&&bg.indexOf('url(')===-1)el.classList.add('bssc-black-gradient');
});
}
blackSurfaces(document);
try{if(/(^|\.)(boneshakerssocialclub\.com|boneshakersocialclub\.godaddysites\.com)$/.test(parent.location.hostname))blackNativeSurfaces(parent.document);}catch(e){}
})();

/* Reserve space for GoDaddy's modern overlay navigation. */
(function(){try{
var d=parent.document,w=parent;
if(d.querySelector('[data-aid="HEADER_SECTION"]')||d.getElementById('bssc-header-offset-fix'))return;
var n=d.querySelector('nav[data-ux="Block"][data-nav-measure]');if(!n)return;
var st=d.createElement('style');st.id='bssc-header-offset-fix';st.textContent='nav[data-ux="Block"][data-nav-measure]{position:fixed!important;top:0!important;left:0!important;width:100%!important;background:#000!important;background-image:none!important;backdrop-filter:none!important;z-index:10000!important}html{scroll-padding-top:calc(var(--bssc-header-height,246px) + 20px)}';d.head.appendChild(st);
function size(){var h=n.getBoundingClientRect().height;n.parentElement.style.minHeight=h+'px';d.documentElement.style.setProperty('--bssc-header-height',h+'px');}
size();new w.ResizeObserver(size).observe(n);w.addEventListener('resize',size);
}catch(e){}})();

/* Count approved public giving totals when visitors reach them. */
(function(){
document.querySelectorAll('[data-bssc-metric="lifetime"]').forEach(function(el){
if(el.dataset.bsscCountup)return;el.dataset.bsscCountup='true';
var finalText=el.textContent,target=Number(finalText.replace(/[^0-9.]/g,'')),from=Math.min(432000,target);
if(!Number.isFinite(target)||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
function run(){var start=null;function tick(now){if(start===null)start=now;var t=Math.min(1,(now-start)/5200),eased=1-Math.pow(1-t,4);el.textContent=(from+(target-from)*eased).toLocaleString('en-US',{style:'currency',currency:'USD',minimumFractionDigits:2,maximumFractionDigits:2});if(t<1)requestAnimationFrame(tick);else el.textContent=finalText;}requestAnimationFrame(tick);}
if('IntersectionObserver'in window){var io=new IntersectionObserver(function(entries){if(entries.some(function(e){return e.isIntersecting})){io.disconnect();run()}},{threshold:.4});io.observe(el);}else run();
});
})();

(function(){try{var d=parent.document;if(!d.getElementById('bssc-compact-spacing')){var s=d.createElement('style');s.id='bssc-compact-spacing';s.textContent='nav[data-nav-measure] > [data-ux="Container"] > [data-ux="Container"]{padding-top:4px!important;padding-bottom:4px!important}section[data-aid="HTML_SECTION_RENDERED"]{padding-top:16px!important}';d.head.appendChild(s)}}catch(e){}})();

(function(){try{var d=parent.document,s=d.getElementById('bssc-compact-spacing-v2');if(!s){s=d.createElement('style');s.id='bssc-compact-spacing-v2';d.head.appendChild(s)}s.textContent='nav[data-nav-measure] > [data-ux="Container"] > [data-ux="Container"]{padding-top:4px!important;padding-bottom:4px!important}img[data-aid="NAV_LOGO_IMAGE_RENDERED"]{width:128px!important;height:128px!important;max-height:128px!important;object-fit:contain!important}section[data-aid="HTML_SECTION_RENDERED"]{padding-top:0!important}@media(max-width:767px){img[data-aid="NAV_LOGO_IMAGE_RENDERED"]{width:88px!important;height:88px!important;max-height:88px!important}}';}catch(e){}})();

(function(){try{var d=parent.document,s=d.getElementById('bssc-no-double-header-gap');if(!s){s=d.createElement('style');s.id='bssc-no-double-header-gap';d.head.appendChild(s)}s.textContent='body section[data-aid="HTML_SECTION_RENDERED"]{padding-top:0!important}body section[data-aid="HTML_SECTION_RENDERED"]::before{content:none!important;display:none!important;height:0!important}';}catch(e){}})();
