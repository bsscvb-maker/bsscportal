/* Shared receipt collections in Club Records. */
(() => {
  const seed={id:'bft-2026-cleaned-receipts',program:'Bikes for Tykes',year:'2026',title:'Bikes for Tykes 2026 — Charity Account Receipts',date:'2026-10-14',url:'https://drive.google.com/file/d/1z7rgYW8mkHi2YsZlrhQarTRpWjLivIzP/view?usp=drivesdk',notes:'Cleaned receipt collection',amount:''};
  let program='',year='',query='';
  const host=()=>document.getElementById('recordsWorkspace');
  const meta=r=>{try{return JSON.parse(r[7]||'{}')}catch{return {}}};
  const shared=()=> (clubCache['Club Records']||[]).slice(1).filter(r=>r[2]==='Receipts').map(r=>({...meta(r),id:r[0],title:r[1],date:r[3],url:r[6],row:r}));
  const receipts=()=>[seed,...shared().filter(r=>r.kind==='receipt'&&r.id!==seed.id)];
  const card=(title,desc,attr)=>'<button class="collection-card" '+attr+'><span class="collection-icon" aria-hidden="true">▤</span><h3>'+esc(title)+'</h3><p>'+esc(desc)+'</p><span><b>Open →</b></span></button>';
  const dashboard=renderRecordsDashboard;
  renderRecordsDashboard=function(){
    dashboard();
    const grid=host().querySelector('.records-dashboard-cards');
    grid.querySelector('[data-record-collection="Receipts"]')?.remove();
    const b=document.createElement('button');b.className='collection-card records-dashboard-card';b.innerHTML='<div class="dashboard-art"><div class="dashboard-book"><small>CLUB RECORDS</small><strong>Receipts</strong><span>PROGRAMS · YEARS</span></div></div><div class="dashboard-card-body"><h3>Receipts</h3><div class="dashboard-card-footer"><span>'+receipts().length+' documents</span><b>Explore →</b></div></div>';
    b.onclick=()=>{program='';year='';query='';draw()};grid.append(b);
  };
  async function save(row){
    if(!accessToken)throw new Error('Sign in before saving receipts.');
    const url='https://sheets.googleapis.com/v4/spreadsheets/'+MEMBERSHIP_SPREADSHEET_ID+'/values/'+encodeURIComponent("'Club Records'!A:I")+':append?valueInputOption=RAW&insertDataOption=INSERT_ROWS';
    await writePortalSheetRequest(url,{method:'POST',headers:{Authorization:'Bearer '+accessToken,'Content-Type':'application/json'},body:JSON.stringify({values:[row]}),signal:AbortSignal.timeout(20000)},'Added receipt record','Club Records',1);
    clubCache['Club Records'].push(row);
  }
  const record=(title,data,url='',date='')=>[crypto.randomUUID(),title,'Receipts',date,'Current','',url,JSON.stringify(data),new Date().toISOString()];
  async function addFolder(){
    const isYear=!!program,value=prompt(isYear?'Receipt year (for example 2028):':'Receipt collection name (for example General Fund):');
    if(value===null||!value.trim())return;
    const name=value.trim();
    if(isYear&&!/^\d{4}$/.test(name)){alert('Enter a four-digit year.');return}
    try{await save(record(isYear?'Receipts '+name:name,{kind:'folder',program:isYear?program:name,year:isYear?name:''}));if(isYear)year=name;else program=name;query='';draw()}catch(e){alert('Unable to save: '+e.message)}
  }
  async function upload(file,token){
    if(!/^application\/pdf$|^image\/(jpeg|png|webp)$/.test(file.type))throw new Error('Choose a PDF, JPG, PNG, or WebP file.');
    if(file.size>20*1024*1024)throw new Error('Files must be under 20 MB. For larger files, paste a Google Drive link.');
    const headers={Authorization:'Bearer '+token},q="trashed = false and mimeType = 'application/vnd.google-apps.folder' and appProperties has { key='bsscReceipts' and value='portal' }";
    const listed=await fetch('https://www.googleapis.com/drive/v3/files?q='+encodeURIComponent(q)+'&fields=files(id)&pageSize=100',{headers});
    if(!listed.ok)throw new Error('Could not access receipt uploads. Retry or paste a Drive link.');
    let folder=(await listed.json()).files?.[0]?.id;
    if(!folder){
      const r=await fetch('https://www.googleapis.com/drive/v3/files?fields=id',{method:'POST',headers:{...headers,'Content-Type':'application/json'},body:JSON.stringify({name:'BSSC Portal Receipts',mimeType:'application/vnd.google-apps.folder',appProperties:{bsscReceipts:'portal'}})});
      if(!r.ok)throw new Error('Could not create receipt folder.');folder=(await r.json()).id;
    }
    const boundary='bssc_receipt_'+crypto.randomUUID();
    const body=new Blob(['--'+boundary+'\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n'+JSON.stringify({name:program+' '+year+' - '+file.name,parents:[folder]})+'\r\n--'+boundary+'\r\nContent-Type: '+file.type+'\r\n\r\n',file,'\r\n--'+boundary+'--\r\n']);
    const r=await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink,size',{method:'POST',headers:{...headers,'Content-Type':'multipart/related; boundary='+boundary},body,signal:AbortSignal.timeout(60000)});
    if(!r.ok)throw new Error('Receipt upload failed.');const saved=await r.json();
    if(Number(saved.size)!==file.size)throw new Error('Uploaded size could not be verified.');
    return saved.webViewLink||'https://drive.google.com/file/d/'+saved.id+'/view';
  }
  function addReceipt(){
    const dialog=document.createElement('dialog');dialog.className='club-dialog';
    dialog.innerHTML='<form><h2>Add receipt — '+esc(program)+' '+esc(year)+'</h2><div class="club-form"><label>Title<input name="title" required maxlength="200"></label><label>Receipt date<input type="date" name="date"></label><label>Vendor<input name="vendor"></label><label>Amount (optional)<input name="amount" type="number" min="0" step="0.01"></label><label>Upload PDF or photo<input name="file" type="file" accept=".pdf,.jpg,.jpeg,.png,.webp"></label><label>Or paste a document link<input name="url" type="url" placeholder="https://drive.google.com/…"></label><label>Notes<textarea name="notes" rows="3"></textarea></label></div><p role="status"></p><div class="club-toolbar"><button class="open-btn" type="submit">Save receipt</button><button class="sponsor-tab" type="button" data-cancel>Cancel</button></div></form>';
    document.body.append(dialog);dialog.showModal();dialog.onclose=()=>dialog.remove();dialog.querySelector('[data-cancel]').onclick=()=>dialog.close();
    const form=dialog.querySelector('form');
    form.onsubmit=async e=>{
      e.preventDefault();const button=form.querySelector('[type=submit]'),status=form.querySelector('[role=status]');button.disabled=true;
      try{
        if(!accessToken)throw new Error('Sign in before saving receipts.');
        const data=new FormData(form),file=form.elements.file.files[0];let url=data.get('url').trim();
        if(file&&url)throw new Error('Choose either an upload or a document link.');
        if(!file&&!clubSafeLink(url))throw new Error('Upload a receipt or enter a secure https:// document link.');
        if(file){status.textContent='Uploading receipt…';const token=await authorizeMinutesUpload();url=await upload(file,token);form.elements.url.value=url;form.elements.file.value='';}
        status.textContent='Saving receipt…';
        await save(record(data.get('title').trim(),{kind:'receipt',program,year,vendor:data.get('vendor').trim(),amount:data.get('amount'),notes:data.get('notes').trim()},url,data.get('date')));
        dialog.close();draw();
      }catch(error){status.textContent=error.message;button.disabled=false}
    };
  }
  function draw(){
    const all=receipts(),folders=shared().filter(r=>r.kind==='folder');
    let body='';
    if(!program){
      const names=[...new Set(['Bikes for Tykes',...all.map(r=>r.program),...folders.map(r=>r.program)])].filter(Boolean).sort();
      body='<div class="records-collections">'+names.map(p=>card(p,all.filter(r=>r.program===p).length+' receipts','data-receipt-program="'+esc(p)+'"')).join('')+'</div>';
    }else if(!year){
      const years=[...new Set(['2025','2026','2027',...all.filter(r=>r.program===program).map(r=>r.year),...folders.filter(r=>r.program===program).map(r=>r.year)])].filter(Boolean).sort().reverse();
      body='<div class="records-collections">'+years.map(y=>card('Receipts '+y,all.filter(r=>r.program===program&&r.year===y).length+' documents','data-receipt-year="'+esc(y)+'"')).join('')+'</div>';
    }else{
      const rows=all.filter(r=>r.program===program&&r.year===year&&(!query||[r.title,r.vendor,r.notes,r.date].join(' ').toLowerCase().includes(query.toLowerCase()))).sort((a,b)=>String(b.date).localeCompare(String(a.date)));
      body='<label style="display:block;margin:18px 0">Search receipts<input type="search" data-receipt-search value="'+esc(query)+'" placeholder="Title, vendor, date or notes" style="display:block;width:100%;padding:12px"></label><div class="records-card-grid">'+rows.map(r=>'<article class="record-card"><h3>'+esc(r.title)+'</h3><p>'+esc([r.date,r.vendor,r.amount!==''&&r.amount!=null?'$'+Number(r.amount).toFixed(2):''].filter(Boolean).join(' · '))+'</p><p>'+esc(r.notes||'')+'</p><div class="record-card-actions"><a class="open-btn" href="'+esc(clubSafeLink(r.url))+'" target="_blank" rel="noopener">View receipt ↗</a></div></article>').join('')+'</div>'+(rows.length?'':'<div class="empty-state">No receipts to show. Add a receipt above.</div>');
    }
    host().innerHTML='<nav class="minutes-breadcrumb"><button class="sponsor-tab" data-receipt-back>← Back</button><button class="sponsor-tab" data-receipt-home>Club Records</button></nav><section class="records-hero"><div><h2>'+esc(program?(year?program+' — Receipts '+year:program):'Receipts')+'</h2><p>'+(year?'Charity account receipts and supporting documents.':'Choose a '+(program?'year':'receipt collection')+'.')+'</p></div><div class="records-hero-actions"><button class="open-btn" data-receipt-add>'+ (year?'Add receipt':program?'Add year':'Add collection')+'</button><button class="sponsor-tab" data-receipt-refresh>Refresh</button></div></section>'+body;
    host().querySelector('[data-receipt-home]').onclick=recordsHome;
    host().querySelector('[data-receipt-back]').onclick=()=>{if(year)year='';else if(program)program='';else return recordsHome();query='';draw()};
    host().querySelector('[data-receipt-add]').onclick=year?addReceipt:addFolder;
    host().querySelector('[data-receipt-refresh]').onclick=async()=>{try{clubCache['Club Records']=await getSheetValues("'Club Records'!A1:I2000",MEMBERSHIP_SPREADSHEET_ID);draw()}catch(e){alert('Refresh failed: '+e.message)}};
    host().querySelectorAll('[data-receipt-program]').forEach(b=>b.onclick=()=>{program=b.dataset.receiptProgram;year='';query='';draw()});
    host().querySelectorAll('[data-receipt-year]').forEach(b=>b.onclick=()=>{year=b.dataset.receiptYear;query='';draw()});
    const input=host().querySelector('[data-receipt-search]');if(input)input.oninput=()=>{const pos=input.selectionStart;query=input.value;draw();const next=host().querySelector('[data-receipt-search]');next.focus();try{next.setSelectionRange(pos,pos)}catch{}};
  }
})();