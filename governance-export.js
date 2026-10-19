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
 const response=await fetch('assets/governance/copy-watermark.png');if(!response.ok)throw new Error('Could not load the COPY watermark.');
 zip.file('word/media/bssc-copy-watermark.png',await response.arrayBuffer());
 const relNS='http://schemas.openxmlformats.org/package/2006/relationships';
 for(const [index,path] of headers.entries()){
  const d=xml(await zip.file(path).async('string')),relPath=path.replace('word/','word/_rels/')+'.rels';
  const rel=xml(zip.file(relPath)?await zip.file(relPath).async('string'):`<Relationships xmlns="${relNS}"/>`);
  const id='rIdBSSCExportWatermark',r=rel.createElementNS(relNS,'Relationship');r.setAttribute('Id',id);r.setAttribute('Type','http://schemas.openxmlformats.org/officeDocument/2006/relationships/image');r.setAttribute('Target','media/bssc-copy-watermark.png');rel.documentElement.appendChild(r);zip.file(relPath,serializer.serializeToString(rel));
  appendXml(d,`<w:p><w:pPr><w:spacing w:before="0" w:after="0" w:line="1" w:lineRule="exact"/></w:pPr><w:r><w:drawing xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><wp:anchor distT="0" distB="0" distL="0" distR="0" simplePos="0" relativeHeight="0" behindDoc="1" locked="0" layoutInCell="0" allowOverlap="1"><wp:simplePos x="0" y="0"/><wp:positionH relativeFrom="page"><wp:posOffset>0</wp:posOffset></wp:positionH><wp:positionV relativeFrom="page"><wp:posOffset>0</wp:posOffset></wp:positionV><wp:extent cx="7772400" cy="10058400"/><wp:effectExtent l="0" t="0" r="0" b="0"/><wp:wrapNone/><wp:docPr id="${9000+index}" name="COPY watermark" descr="Faint COPY watermark matching the PDF export"/><wp:cNvGraphicFramePr/><a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic><pic:nvPicPr><pic:cNvPr id="0" name="COPY"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="${id}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="7772400" cy="10058400"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:anchor></w:drawing></w:r></w:p>`);
  zip.file(path,serializer.serializeToString(d));
 }
 const content=xml(await zip.file('[Content_Types].xml').async('string'));
 if(!Array.from(content.getElementsByTagName('Default')).some(e=>e.getAttribute('Extension')==='png')){const el=content.createElementNS(content.documentElement.namespaceURI,'Default');el.setAttribute('Extension','png');el.setAttribute('ContentType','image/png');content.documentElement.appendChild(el);zip.file('[Content_Types].xml',serializer.serializeToString(content));}
 for(const path of footers){const d=xml(await zip.file(path).async('string'));while(d.documentElement.firstChild)d.documentElement.removeChild(d.documentElement.firstChild);
 appendXml(d,`<w:p><w:pPr><w:spacing w:before="0" w:after="0"/><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:color w:val="595959"/><w:sz w:val="16"/></w:rPr><w:t/></w:r></w:p>`);d.getElementsByTagNameNS(W,'t')[0].textContent=name;zip.file(path,serializer.serializeToString(d));}
 const main=xml(await zip.file('word/document.xml').async('string'));for(const margins of Array.from(main.getElementsByTagNameNS(W,'pgMar')))margins.setAttributeNS(W,'w:footer','240');zip.file('word/document.xml',serializer.serializeToString(main));
 return zip.generateAsync({type:'uint8array',compression:'DEFLATE'});
}
window.BSSCReferenceExport={filename,pdfCopy,wordCopy};
document.addEventListener('click',async event=>{
 const link=event.target.closest('.governance-export');if(!link)return;
 const match=(link.getAttribute('href')||'').match(/assets\/governance\/(bylaws|operating-policies)\.(docx|pdf)$/);if(!match)return;
 event.preventDefault();if(link.dataset.busy)return;link.dataset.busy='true';link.setAttribute('aria-busy','true');const label=link.querySelector('span'),before=label?.textContent;if(label)label.textContent='Preparing…';
 let status=document.getElementById('governance-export-status');if(!status){status=document.createElement('p');status.id='governance-export-status';status.setAttribute('role','status');link.closest('.records-hero').after(status);}status.textContent='Preparing your stamped copy…';
 try{const name=filename(match[1],match[2]),response=await fetch(link.getAttribute('href')+'?v=20261019-format2');if(!response.ok)throw new Error('Could not retrieve the document.');const bytes=await response.arrayBuffer(),result=await (match[2]==='pdf'?pdfCopy(bytes,name):wordCopy(bytes,name));const url=URL.createObjectURL(new Blob([result],{type:match[2]==='pdf'?'application/pdf':'application/vnd.openxmlformats-officedocument.wordprocessingml.document'})),a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);status.textContent='Copy prepared: '+name;
 }catch(error){status.textContent='Download failed. '+error.message+' Please try again.';}finally{delete link.dataset.busy;link.removeAttribute('aria-busy');if(label)label.textContent=before;}
});
})();
