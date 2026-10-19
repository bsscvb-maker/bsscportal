/* Timestamped reference copies; clean approved masters remain unchanged. */
(()=>{
'use strict';
const W='http://schemas.openxmlformats.org/wordprocessingml/2006/main';
const loaders={};
function library(name,path){if(window[name])return Promise.resolve(window[name]);return loaders[name]||(loaders[name]=new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=path;s.onload=()=>resolve(window[name]);s.onerror=()=>{delete loaders[name];s.remove();reject(new Error('Could not load export tools. Please try again.'));};document.head.appendChild(s);}));}
function filename(key,ext,now=new Date()){
 const parts=new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23',timeZoneName:'short'}).formatToParts(now),p=Object.fromEntries(parts.map(v=>[v.type,v.value]));
 return `BSSC ${key==='bylaws'?'Bylaws':'Operating Policies'} ${p.year}-${p.month}-${p.day} ${p.hour}-${p.minute}-${p.second} ${p.timeZoneName}.${ext}`;
}
async function pdfCopy(bytes,name){
 const P=await library('PDFLib','assets/vendor/pdf-lib-1.17.1.min.js');
 const doc=await P.PDFDocument.load(bytes),font=await doc.embedFont(P.StandardFonts.Helvetica),bold=await doc.embedFont(P.StandardFonts.HelveticaBold);
 for(const page of doc.getPages()){
  const {width,height}=page.getSize(),size=Math.min(width*.18,110),angle=Math.PI/4,tw=bold.widthOfTextAtSize('COPY',size),th=size*.7;
  page.drawText('COPY',{x:width/2-(tw*Math.cos(angle)-th*Math.sin(angle))/2,y:height/2-(tw*Math.sin(angle)+th*Math.cos(angle))/2,size,font:bold,color:P.rgb(.45,.45,.45),opacity:.14,rotate:P.degrees(45)});
  const fs=Math.min(8,(width-80)/font.widthOfTextAtSize(name,1));
  page.drawText(name,{x:(width-font.widthOfTextAtSize(name,fs))/2,y:18,size:fs,font,color:P.rgb(.35,.35,.35)});
 }
 doc.setTitle(name);return doc.save();
}
function xml(s){const d=new DOMParser().parseFromString(s,'application/xml');if(d.getElementsByTagName('parsererror').length)throw new Error('Invalid Word template');return d;}
function appendXml(d,markup){const el=xml(`<root xmlns:w="${W}" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">${markup}</root>`);for(const child of Array.from(el.documentElement.childNodes))d.documentElement.appendChild(d.importNode(child,true));}
async function wordCopy(bytes,name){
 const Zip=await library('JSZip','assets/vendor/jszip-3.10.1.min.js'),zip=await Zip.loadAsync(bytes),serializer=new XMLSerializer();
 const headers=Object.keys(zip.files).filter(n=>/^word\/header\d+\.xml$/.test(n)),footers=Object.keys(zip.files).filter(n=>/^word\/footer\d+\.xml$/.test(n));
 if(!headers.length||!footers.length)throw new Error('Word template needs page headers and footers.');
 for(const path of headers){const d=xml(await zip.file(path).async('string'));
 appendXml(d,`<w:p><w:pPr><w:spacing w:before="0" w:after="0" w:line="1" w:lineRule="exact"/></w:pPr><w:r><w:pict><v:shapetype id="_x0000_t136" coordsize="21600,21600" o:spt="136" adj="10800" path="m@7,l@8,m@5,21600l@6,21600e"><v:path textpathok="t"/><v:textpath on="t" fitshape="t"/></v:shapetype><v:shape id="BSSC_Copy_Watermark" type="#_x0000_t136" style="position:absolute;width:420pt;height:110pt;rotation:315;z-index:-251654144;mso-position-horizontal:center;mso-position-horizontal-relative:page;mso-position-vertical:center;mso-position-vertical-relative:page" fillcolor="#e0e0e0" stroked="f" o:allowincell="f"><v:textpath style="font-family:Arial;font-size:1pt;font-weight:bold" string="COPY"/></v:shape></w:pict></w:r></w:p>`);
 zip.file(path,serializer.serializeToString(d));}
 for(const path of footers){const d=xml(await zip.file(path).async('string'));const p=d.createElementNS(W,'w:p'),pr=d.createElementNS(W,'w:pPr'),jc=d.createElementNS(W,'w:jc');jc.setAttributeNS(W,'w:val','center');pr.appendChild(jc);p.appendChild(pr);const r=d.createElementNS(W,'w:r'),rp=d.createElementNS(W,'w:rPr'),sz=d.createElementNS(W,'w:sz');sz.setAttributeNS(W,'w:val','14');rp.appendChild(sz);r.appendChild(rp);const t=d.createElementNS(W,'w:t');t.textContent=name;r.appendChild(t);p.appendChild(r);d.documentElement.appendChild(p);zip.file(path,serializer.serializeToString(d));}
 return zip.generateAsync({type:'uint8array',compression:'DEFLATE'});
}
window.BSSCReferenceExport={filename,pdfCopy,wordCopy};
document.addEventListener('click',async event=>{
 const link=event.target.closest('.governance-export');if(!link)return;
 const match=(link.getAttribute('href')||'').match(/assets\/governance\/(bylaws|operating-policies)\.(docx|pdf)$/);if(!match)return;
 event.preventDefault();if(link.dataset.busy)return;link.dataset.busy='true';link.setAttribute('aria-busy','true');const label=link.querySelector('span'),before=label?.textContent;if(label)label.textContent='Preparing…';
 let status=document.getElementById('governance-export-status');if(!status){status=document.createElement('p');status.id='governance-export-status';status.setAttribute('role','status');link.closest('.records-hero').after(status);}status.textContent='Preparing your stamped copy…';
 try{const name=filename(match[1],match[2]),response=await fetch(link.getAttribute('href'));if(!response.ok)throw new Error('Could not retrieve the document.');const bytes=await response.arrayBuffer(),result=await (match[2]==='pdf'?pdfCopy(bytes,name):wordCopy(bytes,name));const url=URL.createObjectURL(new Blob([result],{type:match[2]==='pdf'?'application/pdf':'application/vnd.openxmlformats-officedocument.wordprocessingml.document'})),a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);status.textContent='Copy prepared: '+name;
 }catch(error){status.textContent='Download failed. '+error.message+' Please try again.';}finally{delete link.dataset.busy;link.removeAttribute('aria-busy');if(label)label.textContent=before;}
});
})();
