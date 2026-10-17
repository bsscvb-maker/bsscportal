/* Accessible public Cornerstone phone cards. */
(function(){
const cards=Array.from(document.querySelectorAll('[data-bssc-donor-art="Cornerstone Masonry"]'));
if(!cards.length)return;
const style=document.createElement('style');
style.textContent='[data-bssc-donor-art="Cornerstone Masonry"]{cursor:pointer;position:relative}.rp-phone-face{position:absolute;inset:0;z-index:3;background:#000;color:#fff;padding:22px 8px 6px;display:flex;flex-direction:column;justify-content:center;gap:8px;text-align:center;box-sizing:border-box}.rp-phone-face[hidden]{display:none!important}.rp-phone-face a{display:block;text-decoration:none;color:#fff;border:1px solid #444;border-radius:5px;padding:4px 2px;line-height:1.2}.rp-phone-face a:hover{border-color:#c1352e}.rp-phone-face strong{display:block;font:700 12px/1.3 Arial,sans-serif}.rp-phone-face a span{display:block;color:#ff9188;font:700 17px/1.3 Arial,sans-serif}.rp-phone-close{position:absolute;right:3px;top:2px;width:25px;height:24px;border:0;background:#000;color:#fff;font:22px/1 Arial,sans-serif;cursor:pointer}.rp-phone-face :focus-visible{outline:2px solid #ffaaa0;outline-offset:1px}@media(min-width:600px){.rp-phone-face strong{font-size:14px}.rp-phone-face a span{font-size:20px}}';
document.head.appendChild(style);
cards.forEach(card=>{
card.setAttribute('role','button');card.setAttribute('tabindex','0');card.setAttribute('aria-label','Show Cornerstone Masonry phone numbers');card.setAttribute('aria-expanded','false');
const panel=document.createElement('div');panel.className='rp-phone-face';panel.hidden=true;panel.setAttribute('role','group');panel.setAttribute('aria-label','Cornerstone Masonry phone numbers');
panel.innerHTML='<button type="button" class="rp-phone-close" aria-label="Close phone numbers">×</button><a href="tel:+17577293912"><strong>Jamie Crawford</strong><span>(757) 729-3912</span></a><a href="tel:+17573644462"><strong>Ray Bennet</strong><span>(757) 364-4462</span></a>';
card.appendChild(panel);
function open(){panel.hidden=false;card.setAttribute('aria-expanded','true');}
function close(){panel.hidden=true;card.setAttribute('aria-expanded','false');card.focus({preventScroll:true});}
card.addEventListener('click',e=>{if(!panel.contains(e.target))open();});
card.addEventListener('keydown',e=>{if(e.target===card&&(e.key==='Enter'||e.key===' ')){e.preventDefault();open();}if(e.key==='Escape'&&!panel.hidden){e.preventDefault();close();}});
panel.querySelector('button').addEventListener('click',e=>{e.stopPropagation();close();});
});
})();