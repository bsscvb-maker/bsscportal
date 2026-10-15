/* Shared receipt collections in Club Records. */
(() => {
  const seed={id:'bft-2026-cleaned-receipts',program:'Bikes for Tykes',year:'2026',title:'Bikes for Tykes 2026 — Charity Account Receipts',date:'2026-10-14',url:'https://drive.google.com/file/d/1z7rgYW8mkHi2YsZlrhQarTRpWjLivIzP/view?usp=drivesdk',notes:'Cleaned receipt collection',amount:''};
  const importedReceipts=[{"id":"bft-2026-import-1hFKolilTcKvZt0DrKzKYXNIH142ayUm3","program":"Bikes for Tykes","year":"2026","title":"ALDI - $18.12","vendor":"ALDI","amount":"18.12","date":"","notes":"Imported receipt","url":"https://drive.google.com/file/d/1hFKolilTcKvZt0DrKzKYXNIH142ayUm3/view?usp=drivesdk","kind":"receipt"},{"id":"bft-2026-import-1Y7lKKqA1hR7KFjupHjiVLjg047-cfOie","program":"Bikes for Tykes","year":"2026","title":"Dollar Tree - $5.30","vendor":"Dollar Tree","amount":"5.30","date":"","notes":"Imported receipt","url":"https://drive.google.com/file/d/1Y7lKKqA1hR7KFjupHjiVLjg047-cfOie/view?usp=drivesdk","kind":"receipt"},{"id":"bft-2026-import-1z6An8-xiLVK9a0MZk1UwpvawLtWokBr0","program":"Bikes for Tykes","year":"2026","title":"Dollar Tree - $7.95","vendor":"Dollar Tree","amount":"7.95","date":"","notes":"Imported receipt","url":"https://drive.google.com/file/d/1z6An8-xiLVK9a0MZk1UwpvawLtWokBr0/view?usp=drivesdk","kind":"receipt"},{"id":"bft-2026-import-1_vrOoEjxN0imH_oYcgdVkxWXhoWCZWOY","program":"Bikes for Tykes","year":"2026","title":"Dollar Tree - $18.02","vendor":"Dollar Tree","amount":"18.02","date":"","notes":"Imported receipt","url":"https://drive.google.com/file/d/1_vrOoEjxN0imH_oYcgdVkxWXhoWCZWOY/view?usp=drivesdk","kind":"receipt"},{"id":"bft-2026-import-1-VKL41FaO0TzMUVL2Et-9MMD83wT3sbx","program":"Bikes for Tykes","year":"2026","title":"Dollar Tree - $21.20","vendor":"Dollar Tree","amount":"21.20","date":"","notes":"Imported receipt","url":"https://drive.google.com/file/d/1-VKL41FaO0TzMUVL2Et-9MMD83wT3sbx/view?usp=drivesdk","kind":"receipt"},{"id":"bft-2026-import-18uniTe0dQEZqv4ES8UcGbrQDLX3mcudw","program":"Bikes for Tykes","year":"2026","title":"Five Below - $10.60","vendor":"Five Below","amount":"10.60","date":"","notes":"Imported receipt","url":"https://drive.google.com/file/d/18uniTe0dQEZqv4ES8UcGbrQDLX3mcudw/view?usp=drivesdk","kind":"receipt"},{"id":"bft-2026-import-1lPutUa1UrkVDp6apkDT_gdz52VuCl2sK","program":"Bikes for Tykes","year":"2026","title":"Hobby Lobby - $23.30","vendor":"Hobby Lobby","amount":"23.30","date":"","notes":"Imported receipt","url":"https://drive.google.com/file/d/1lPutUa1UrkVDp6apkDT_gdz52VuCl2sK/view?usp=drivesdk","kind":"receipt"},{"id":"bft-2026-import-1l6UIYruanh7dArBihC_RqHuMiKNcniHl","program":"Bikes for Tykes","year":"2026","title":"Kroger - $18.46","vendor":"Kroger","amount":"18.46","date":"","notes":"Imported receipt","url":"https://drive.google.com/file/d/1l6UIYruanh7dArBihC_RqHuMiKNcniHl/view?usp=drivesdk","kind":"receipt"},{"id":"bft-2026-import-1fTa9A7IW7rMtZqQ_7KWqVf0_md-rrG3j","program":"Bikes for Tykes","year":"2026","title":"Virginia ABC - $30.73","vendor":"Virginia ABC","amount":"30.73","date":"","notes":"Imported receipt","url":"https://drive.google.com/file/d/1fTa9A7IW7rMtZqQ_7KWqVf0_md-rrG3j/view?usp=drivesdk","kind":"receipt"},{"id":"bft-2026-import-1Tl8r9ueEoTwMx9QYWUVFuuVjNr3PElUW","program":"Bikes for Tykes","year":"2026","title":"Virginia ABC - $87.97","vendor":"Virginia ABC","amount":"87.97","date":"","notes":"Imported receipt","url":"https://drive.google.com/file/d/1Tl8r9ueEoTwMx9QYWUVFuuVjNr3PElUW/view?usp=drivesdk","kind":"receipt"},{"id":"bft-2026-import-1Zj3x6MsDEwjXE1pPZ7yAxada3kIIdClg","program":"Bikes for Tykes","year":"2026","title":"Walmart - $6.41","vendor":"Walmart","amount":"6.41","date":"","notes":"Imported receipt","url":"https://drive.google.com/file/d/1Zj3x6MsDEwjXE1pPZ7yAxada3kIIdClg/view?usp=drivesdk","kind":"receipt"},{"id":"bft-2026-import-1vcE-hVtonA9EA_GXT_incM3arKryGnY8","program":"Bikes for Tykes","year":"2026","title":"Walmart - $71.21","vendor":"Walmart","amount":"71.21","date":"","notes":"Imported receipt","url":"https://drive.google.com/file/d/1vcE-hVtonA9EA_GXT_incM3arKryGnY8/view?usp=drivesdk","kind":"receipt"}];
  let program='',year='',query='';
  const host=()=>document.getElementById('recordsWorkspace');
  const meta=r=>{try{return JSON.parse(r[7]||'{}')}catch{return {}}};
  const shared=()=> (clubCache['Club Records']||[]).slice(1).filter(r=>r[2]==='Receipts').map(r=>({...meta(r),id:r[0],title:r[1],date:r[3],url:r[6],row:r}));
  const receipts=()=>{const saved=shared().filter(r=>r.kind==='receipt'),ids=new Set(saved.map(r=>r.id));return [...[seed,...importedReceipts].filter(r=>!ids.has(r.id)),...saved].filter(r=>!r.deleted)};
  const card=(title,desc,attr)=>'<button class="collection-card" '+attr+'><span class="collection-icon" aria-hidden="true">▤</span><h3>'+esc(title)+'</h3><p>'+esc(desc)+'</p><span><b>Open →</b></span></button>';

  const priorArt=recordsCollectionArt;
  const artParts={
    'Bylaws':['#2f7860','#e4f1eb','<rect x="68" y="21" width="89" height="119" rx="7" fill="#fff" stroke="#accbbd" stroke-width="2"/><path d="M82 40h42M82 51h57M82 62h48M82 104h55M82 116h42" stroke="#b6c9bf" stroke-width="4" stroke-linecap="round"/><circle cx="113" cy="84" r="12" fill="#2f7860"/><path d="m107 84 4 4 7-8" fill="none" stroke="#fff" stroke-width="3"/><g transform="rotate(-32 57 82)"><rect x="40" y="40" width="34" height="24" rx="4" fill="#2f7860"/><rect x="48" y="65" width="18" height="55" rx="4" fill="#53947c"/><path d="M43 43v18M70 43v18" stroke="#a1c6b4" stroke-width="3"/></g><rect x="27" y="137" width="61" height="8" rx="4" fill="#2f7860"/>'],
    'Policies & appendices':['#a16d26','#fff0d8','<rect x="46" y="37" width="111" height="106" rx="8" fill="#e4c897"/><rect x="39" y="29" width="111" height="106" rx="8" fill="#f3deba" stroke="#c7a570" stroke-width="2"/><rect x="33" y="22" width="105" height="106" rx="7" fill="#fff" stroke="#c7a570" stroke-width="2"/><path d="M48 22v106" stroke="#a16d26" stroke-width="8"/><path d="M61 43h55M61 57h44M61 82h52M61 95h52M61 108h35" stroke="#d4bc94" stroke-width="4" stroke-linecap="round"/><path d="M138 37h20v22h-20z" fill="#a16d26"/><path d="M138 67h20v22h-20z" fill="#d39b48"/><path d="M138 97h20v22h-20z" fill="#ecc782"/><circle cx="48" cy="45" r="4" fill="#fff"/><circle cx="48" cy="104" r="4" fill="#fff"/>'],
    'Committee records':['#3c698e','#e6eef7','<ellipse cx="100" cy="118" rx="69" ry="27" fill="#3c698e"/><ellipse cx="100" cy="111" rx="69" ry="24" fill="#6795b8"/><circle cx="100" cy="36" r="14" fill="#3c698e"/><path d="M76 84V71a24 24 0 0 1 48 0v13" fill="#3c698e"/><circle cx="44" cy="61" r="12" fill="#507f9f"/><path d="M23 101V92a21 21 0 0 1 42 0v9" fill="#507f9f"/><circle cx="156" cy="61" r="12" fill="#507f9f"/><path d="M135 101V92a21 21 0 0 1 42 0v9" fill="#507f9f"/><rect x="83" y="99" width="35" height="22" rx="2" fill="#fff" transform="rotate(-8 100 110)"/><path d="M89 106h22M89 112h16" stroke="#a4bdd0" stroke-width="2"/><path d="M47 135v13M153 135v13" stroke="#3c698e" stroke-width="6" stroke-linecap="round"/>'],
    'Receipts':['#a23f4d','#fae6e9','<path d="M63 16h76v132l-10-7-10 7-9-7-10 7-9-7-10 7-9-7-9 7z" fill="#fff" stroke="#d6a7ae" stroke-width="2"/><circle cx="101" cy="42" r="15" fill="#a23f4d"/><path d="M106 36c-9-5-16 3-5 6s3 12-6 7M101 31v23" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/><path d="M77 70h47M77 82h33M77 94h47M77 113h47" stroke="#d6a7ae" stroke-width="4" stroke-linecap="round"/><rect x="127" y="92" width="40" height="55" rx="5" fill="#a23f4d"/><rect x="133" y="98" width="28" height="12" rx="2" fill="#f8dade"/><path d="M136 119h3m9 0h3m-15 10h3m9 0h3m-15 10h3m9 0h3" stroke="#fff" stroke-width="4" stroke-linecap="round"/>'],
    'Code of conduct':['#765184','#efe5f3','<path d="m100 18 54 20v43c0 34-29 54-54 66-25-12-54-32-54-66V38z" fill="#765184"/><path d="m100 31 41 15v34c0 26-20 42-41 53-21-11-41-27-41-53V46z" fill="none" stroke="#bba1c6" stroke-width="2"/><path d="m76 80 17 17 33-36" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>']
  };
  recordsCollectionArt=function(id,label,rows){
    const key=Object.keys(artParts).find(k=>k.toLowerCase()===String(id).toLowerCase());
    if(!key)return priorArt(id,label,rows);
    const [color,bg,shape]=artParts[key];
    return '<div class="dashboard-art" aria-hidden="true" style="--collection-accent:'+color+';--collection-bg:'+bg+';display:flex;align-items:center;justify-content:center"><svg viewBox="0 0 200 164" width="200" height="164" style="max-width:100%;position:relative;z-index:1;filter:drop-shadow(0 6px 7px #00000012)"><ellipse cx="100" cy="148" rx="66" ry="6" fill="'+color+'" opacity=".10"/>'+shape+'</svg></div>';
  };

  const dashboard=renderRecordsDashboard;
  renderRecordsDashboard=function(){
    dashboard();
    const grid=host().querySelector('.records-dashboard-cards');
    grid.querySelector('[data-record-collection="Receipts"]')?.remove();
    const b=document.createElement('button');b.className='collection-card records-dashboard-card';b.innerHTML=recordsCollectionArt('Receipts','Receipts',[])+'<div class="dashboard-card-body"><h3>Receipts</h3><div class="dashboard-card-footer"><span>'+receipts().length+' documents</span><b>Explore →</b></div></div>';
    b.onclick=()=>{program='';year='';query='';draw()};grid.append(b);
  };
  async function save(row){
    if(!accessToken)throw new Error('Sign in before saving receipts.');
    const url='https://sheets.googleapis.com/v4/spreadsheets/'+MEMBERSHIP_SPREADSHEET_ID+'/values/'+encodeURIComponent("'Club Records'!A:I")+':append?valueInputOption=RAW&insertDataOption=INSERT_ROWS';
    await writePortalSheetRequest(url,{method:'POST',headers:{Authorization:'Bearer '+accessToken,'Content-Type':'application/json'},body:JSON.stringify({values:[row]}),signal:AbortSignal.timeout(20000)},'Added receipt record','Club Records',1);
    clubCache['Club Records'].push(row);
  }

  async function updateReceipt(entry,row){
    if(!accessToken)throw new Error('Sign in before saving receipts.');
    const live=await getSheetValues("'Club Records'!A1:I2000",MEMBERSHIP_SPREADSHEET_ID);
    const index=live.findIndex(r=>r[0]===entry.id);
    if(index<0&&entry.row)throw new Error('This receipt was removed. Close and refresh before trying again.');
    if(index>=0){
      if(!entry.row||JSON.stringify(live[index])!==JSON.stringify(entry.row))throw new Error('This receipt changed since you opened it. Close, refresh, and reopen it.');
      const url='https://sheets.googleapis.com/v4/spreadsheets/'+MEMBERSHIP_SPREADSHEET_ID+'/values/'+encodeURIComponent("'Club Records'!A"+(index+1)+':I'+(index+1))+'?valueInputOption=RAW';
      await writePortalSheetRequest(url,{method:'PUT',headers:{Authorization:'Bearer '+accessToken,'Content-Type':'application/json'},body:JSON.stringify({values:[row]}),signal:AbortSignal.timeout(20000)},'Updated receipt record','Club Records',1);
      live[index]=row;clubCache['Club Records']=live;
    }else{await save(row)}
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

  async function deleteReceipt(entry,button){
    if(!confirm('Delete "'+entry.title+'" from Receipts? The original PDF will remain in Google Drive.'))return;
    button.disabled=true;
    try{
      const row=record(entry.title,{...(entry.row?meta(entry.row):entry),kind:'receipt',program:entry.program,year:entry.year,deleted:true},entry.url,entry.date);
      row[0]=entry.id;row[4]='Archived';
      await updateReceipt(entry,row);draw();return true;
    }catch(error){alert('Receipt was not deleted: '+error.message);button.disabled=false}
  }

  function addReceipt(existing=null){
    const dialog=document.createElement('dialog');dialog.className='club-dialog';
    dialog.innerHTML='<form><h2>Add receipt — '+esc(program)+' '+esc(year)+'</h2><div class="club-form"><label>Title<input name="title" required maxlength="200"></label><label>Receipt date<input type="date" name="date"></label><label>Vendor<input name="vendor"></label><label>Amount (optional)<input name="amount" type="number" min="0" step="0.01"></label><label>Upload PDF or photo<input name="file" type="file" accept=".pdf,.jpg,.jpeg,.png,.webp"></label><label>Or paste a document link<input name="url" type="url" placeholder="https://drive.google.com/…"></label><label>Items purchased<textarea name="items" rows="5" placeholder="Item descriptions and prices"></textarea></label><label>Notes<textarea name="notes" rows="3"></textarea></label><label data-scan-page hidden>PDF page<select name="scanPage"></select></label><button class="sponsor-tab" type="button" data-scan-again>Read receipt again</button><details><summary>Extracted receipt text</summary><pre data-scan-text style="white-space:pre-wrap;overflow-wrap:anywhere;max-height:250px;overflow:auto"></pre></details></div><p role="status"></p><div class="club-toolbar"><button class="open-btn" type="submit">Save receipt</button><button class="sponsor-tab" type="button" data-cancel>Cancel</button></div></form>';
    document.body.append(dialog);dialog.showModal();dialog.onclose=()=>dialog.remove();dialog.querySelector('[data-cancel]').onclick=()=>dialog.close();
    const form=dialog.querySelector('form');
    if(existing){dialog.querySelector('h2').textContent='Edit receipt — '+program+' '+year;for(const key of ['title','date','vendor','amount','url','items','notes'])form.elements[key].value=existing[key]??'';form.querySelector('[type=submit]').textContent='Save changes';const remove=document.createElement('button');remove.type='button';remove.className='sponsor-tab';remove.textContent='Delete receipt';remove.style.cssText='color:#b42318;border-color:#e4b4b4;margin-left:auto';remove.onclick=async()=>{if(await deleteReceipt(existing,remove))dialog.close()};form.querySelector('.club-toolbar').append(remove);}
    let scanId=0,scanning=false;const autoFilled={};
    const scanAgain=form.querySelector('[data-scan-again]'),status=form.querySelector('[role=status]'),saveButton=form.querySelector('[type=submit]');
    async function scanFile(page=1){
      const file=form.elements.file.files[0];if(!file){status.textContent='Choose a receipt file to read.';return}
      const id=++scanId,before=Object.fromEntries(['title','vendor','date','amount','items'].map(k=>[k,form.elements[k].value]));
      scanning=true;saveButton.disabled=true;scanAgain.disabled=true;status.textContent='Reading receipt…';
      try{
        const {readReceipt}=await import('./receipt-scan.js?v=20261014-1');
        const result=await readReceipt(file,{page,progress:message=>{if(id===scanId&&dialog.isConnected)status.textContent=message}});
        if(id!==scanId||!dialog.isConnected)return;
        for(const key of ['title','vendor','date','amount','items'])if(form.elements[key].value===before[key]&&(!before[key]||before[key]===autoFilled[key])){form.elements[key].value=result[key]||'';autoFilled[key]=result[key]||'';}
        form.querySelector('[data-scan-text]').textContent=result.text;
        const pageLabel=form.querySelector('[data-scan-page]');pageLabel.hidden=result.pages===1;
        form.elements.scanPage.innerHTML=Array.from({length:result.pages},(_,i)=>'<option value="'+(i+1)+'" '+(result.page===i+1?'selected':'')+'>Page '+(i+1)+'</option>').join('');
        status.textContent=(result.pages>1?'Read page '+result.page+' of '+result.pages+'. Choose another page for another receipt. ':'')+'Review the suggested vendor, date, total and items before saving.'+(result.confidence<70?' Some text was unclear.':'')+(!result.amount?' Total could not be identified; enter it manually.':'');
      }catch(error){if(id===scanId&&dialog.isConnected)status.textContent='Could not read receipt: '+error.message+' You can enter the fields manually.'}
      finally{if(id===scanId){scanning=false;saveButton.disabled=false;scanAgain.disabled=false}}
    }
    form.elements.file.onchange=()=>{++scanId;form.querySelector('[data-scan-text]').textContent='';form.querySelector('[data-scan-page]').hidden=true;if(form.elements.file.files[0])scanFile();else{scanning=false;saveButton.disabled=false;scanAgain.disabled=false}};
    scanAgain.onclick=()=>scanFile(Number(form.elements.scanPage.value)||1);
    form.elements.scanPage.onchange=()=>scanFile(Number(form.elements.scanPage.value)||1);

    form.onsubmit=async e=>{
      e.preventDefault();if(scanning)return;const button=form.querySelector('[type=submit]'),status=form.querySelector('[role=status]');button.disabled=true;
      try{
        if(!accessToken)throw new Error('Sign in before saving receipts.');
        const data=new FormData(form),file=form.elements.file.files[0];let url=data.get('url').trim();
        if(file&&url&&url!==existing?.url)throw new Error('Choose either an upload or a document link.');
        if(!file&&!clubSafeLink(url))throw new Error('Upload a receipt or enter a secure https:// document link.');
        if(file){status.textContent='Uploading receipt…';const token=await authorizeMinutesUpload();url=await upload(file,token);form.elements.url.value=url;form.elements.file.value='';}
        status.textContent='Saving receipt…';
        const row=record(data.get('title').trim(),{...(existing?.row?meta(existing.row):{}),kind:'receipt',program,year,vendor:data.get('vendor').trim(),amount:data.get('amount'),notes:data.get('notes').trim(),items:data.get('items').trim()},url,data.get('date'));
        if(existing){row[0]=existing.id;await updateReceipt(existing,row)}else await save(row);
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
      const rows=all.filter(r=>r.program===program&&r.year===year&&(!query||[r.title,r.vendor,r.items,r.notes,r.date].join(' ').toLowerCase().includes(query.toLowerCase()))).sort((a,b)=>String(b.date).localeCompare(String(a.date)));
      body='<label style="display:block;margin:18px 0">Search receipts<input type="search" data-receipt-search value="'+esc(query)+'" placeholder="Title, vendor, date or notes" style="display:block;width:100%;padding:12px"></label><div class="records-card-grid">'+rows.map(r=>'<article class="record-card"><h3>'+esc(r.title)+'</h3><p>'+esc([r.date,r.vendor,r.amount!==''&&r.amount!=null?'$'+Number(r.amount).toFixed(2):''].filter(Boolean).join(' · '))+'</p><p style="white-space:pre-line">'+esc(r.items||'')+'</p><p>'+esc(r.notes||'')+'</p><div class="record-card-actions"><a class="open-btn" href="'+esc(clubSafeLink(r.url))+'" target="_blank" rel="noopener">View receipt ↗</a><button type="button" class="sponsor-tab" data-receipt-edit="'+esc(r.id)+'">Edit</button></div></article>').join('')+'</div>'+(rows.length?'':'<div class="empty-state">No receipts to show. Add a receipt above.</div>');
    }
    host().innerHTML='<nav class="minutes-breadcrumb"><button class="sponsor-tab" data-receipt-back>← Back</button><button class="sponsor-tab" data-receipt-home>Club Records</button></nav><section class="records-hero"><div><h2>'+esc(program?(year?program+' — Receipts '+year:program):'Receipts')+'</h2><p>'+(year?'Charity account receipts and supporting documents.':'Choose a '+(program?'year':'receipt collection')+'.')+'</p></div><div class="records-hero-actions"><button class="open-btn" data-receipt-add>'+ (year?'Add receipt':program?'Add year':'Add collection')+'</button><button class="sponsor-tab" data-receipt-refresh>Refresh</button></div></section>'+body;
    host().querySelector('[data-receipt-home]').onclick=recordsHome;
    host().querySelector('[data-receipt-back]').onclick=()=>{if(year)year='';else if(program)program='';else return recordsHome();query='';draw()};
    host().querySelector('[data-receipt-add]').onclick=year?()=>addReceipt():addFolder;
    host().querySelectorAll('[data-receipt-edit]').forEach(button=>button.onclick=()=>{const entry=receipts().find(r=>r.id===button.dataset.receiptEdit);if(entry)addReceipt(entry)});
    host().querySelector('[data-receipt-refresh]').onclick=async()=>{try{clubCache['Club Records']=await getSheetValues("'Club Records'!A1:I2000",MEMBERSHIP_SPREADSHEET_ID);draw()}catch(e){alert('Refresh failed: '+e.message)}};
    host().querySelectorAll('[data-receipt-program]').forEach(b=>b.onclick=()=>{program=b.dataset.receiptProgram;year='';query='';draw()});
    host().querySelectorAll('[data-receipt-year]').forEach(b=>b.onclick=()=>{year=b.dataset.receiptYear;query='';draw()});
    const input=host().querySelector('[data-receipt-search]');if(input)input.oninput=()=>{const pos=input.selectionStart;query=input.value;draw();const next=host().querySelector('[data-receipt-search]');next.focus();try{next.setSelectionRange(pos,pos)}catch{}};
  }
})();