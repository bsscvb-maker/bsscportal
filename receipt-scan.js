// Receipt reading runs locally in the browser.
let ocrLoad;
async function ocr(image,progress){
  if(!window.Tesseract){
    if(!ocrLoad)ocrLoad=new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='https://cdn.jsdelivr.net/npm/tesseract.js@6.0.1/dist/tesseract.min.js';script.onload=resolve;script.onerror=()=>{ocrLoad=null;script.remove();reject(new Error('Receipt reader could not load. Retry or fill the fields manually.'))};document.head.append(script)});
    await ocrLoad;
  }
  const worker=await window.Tesseract.createWorker('eng',1,{logger:m=>{if(m.status==='recognizing text')progress('Reading receipt… '+Math.round(m.progress*100)+'%')}});
  try{const {data}=await worker.recognize(image);return {text:data.text,confidence:data.confidence}}finally{await worker.terminate()}
}
export function parseReceipt(text){
  const lines=String(text||'').split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
  const vendor=lines.slice(0,8).find(s=>/[a-z]{3}/i.test(s)&&!/\b(receipt|invoice|welcome|thank|cashier|store\s*#|tel|phone|www|https)\b/i.test(s)&&!/^\d/.test(s))||'';
  let date='';const match=String(text).match(/\b(20\d{2})[-/.](\d{1,2})[-/.](\d{1,2})\b/)||String(text).match(/\b(\d{1,2})[-/.](\d{1,2})[-/.](20\d{2}|\d{2})\b/);
  if(match){let y,m,d;if(match[1].length===4){[,y,m,d]=match}else{[,m,d,y]=match;if(y.length===2)y='20'+y}const value=y+'-'+m.padStart(2,'0')+'-'+d.padStart(2,'0');const dt=new Date(value+'T12:00:00Z');if(!isNaN(dt)&&dt.toISOString().slice(0,10)===value)date=value}
  const money=s=>[...s.matchAll(/(?:\$\s*)?(\d{1,3}(?:,\d{3})+|\d+)[.,](\d{2})(?!\d)/g)].map(m=>Number(m[1].replace(/,/g,'')+'.'+m[2]));
  const totals=lines.map((line,i)=>({line,i,values:money(line)})).filter(r=>/\b(?:total|amount\s+due|balance\s+due)\b/i.test(r.line)&&!/\b(?:sub\s*total|subtotal|tax|savings|discount|items|qty|quantity)\b/i.test(r.line));
  let amount='';const selected=totals.find(r=>/\b(?:grand\s+total|total\s+due|amount\s+due|balance\s+due)\b/i.test(r.line))||totals.at(-1);
  if(selected){const values=selected.values.length?selected.values:money(lines[selected.i+1]||'');if(values.length)amount=values.at(-1).toFixed(2)}
  const items=lines.filter(line=>money(line).length&&/[a-z]{2}/i.test(line)&&!/\b(?:total|tax|cash|change|visa|mastercard|debit|credit|balance|amount due|payment|tender|savings|discount|refund|phone|tel|auth|approval|card|transaction)\b/i.test(line)&&!/\d{1,2}[:/]\d{2}/.test(line)).join('\n');
  return {vendor,date,amount,items,title:vendor?vendor+' receipt':'',text:String(text||'')};
}
export async function readReceipt(file,{page=1,progress=()=>{}}={}){
  if(file.size>20*1024*1024)throw new Error('Choose a file under 20 MB.');
  let result,pages=1;
  if(file.type==='application/pdf'||/\.pdf$/i.test(file.name)){
    progress('Opening PDF…');
    const pdfjs=await import('https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.min.mjs');
    pdfjs.GlobalWorkerOptions.workerSrc='https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.worker.min.mjs';
    const task=pdfjs.getDocument({data:new Uint8Array(await file.arrayBuffer())});
    let doc;
    try{
      doc=await task.promise;pages=doc.numPages;
      const sheet=await doc.getPage(Math.min(page,pages));const content=await sheet.getTextContent();
      const lines=[];let y=null,line='';
      for(const item of content.items){if(!('str' in item))continue;const next=item.transform[5];if(y!==null&&Math.abs(next-y)>3){lines.push(line);line=''}line+=(line?' ':'')+item.str;y=next;if(item.hasEOL){lines.push(line);line='';y=null}}if(line)lines.push(line);
      const text=lines.join('\n');
      if(text.replace(/\s/g,'').length>80)result={text,confidence:100};
      else{const base=sheet.getViewport({scale:1}),scale=Math.min(2,2400/Math.max(base.width,base.height)),viewport=sheet.getViewport({scale});const canvas=document.createElement('canvas');canvas.width=Math.ceil(viewport.width);canvas.height=Math.ceil(viewport.height);await sheet.render({canvasContext:canvas.getContext('2d'),viewport}).promise;result=await ocr(canvas,progress);canvas.width=canvas.height=0;}
    }finally{if(doc)await doc.destroy();else await task.destroy()}
  }else if(file.type.startsWith('image/')){
    const bitmap=await createImageBitmap(file);
    try{const scale=Math.min(1,2600/Math.max(bitmap.width,bitmap.height)),canvas=document.createElement('canvas');canvas.width=Math.round(bitmap.width*scale);canvas.height=Math.round(bitmap.height*scale);const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);result=await ocr(canvas,progress);canvas.width=canvas.height=0}finally{bitmap.close()}
  }else throw new Error('Choose a PDF or receipt photo.');
  if(!result.text.trim())throw new Error('No readable text found. Try a clearer photo or enter the fields manually.');
  return {...parseReceipt(result.text),pages,confidence:result.confidence,page:Math.min(page,pages)};
}