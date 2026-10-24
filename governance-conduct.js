/* Event metadata and document images remain in the private operations workbook. */
(() => {
  const book='1unxFrG3TJfEbJpucQVPveVO1y9NUTdboqhED2HMueV4';
  let generation=0;
  const safe=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const href=v=>{try{const u=new URL(v);return u.protocol==='https:'&&['drive.google.com','docs.google.com'].includes(u.hostname)?u.href:'';}catch{return '';}};
  const picture=v=>/^data:image\/(?:jpeg|png|webp);base64,[a-z0-9+/=]+$/i.test(v||'')?v:'';
  const date=v=>{if(!v)return 'Date not recorded';if(/^\d{4}$/.test(v))return v;const d=new Date(v+'T12:00:00');return Number.isNaN(+d)?v:d.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});};
  const docTitle=v=>String(v||'Document').replace(/\.(pdf|docx?|xlsx?|png|jpe?g)$/i,'').replace(/\(1\)$/,'').replace(/^\d{1,2}\.\s+/,'').replace(/_/g,' ').trim();
  const type=v=>/\.(png|jpe?g|webp)$/i.test(v)?'IMG':/\.docx?$/i.test(v)?'DOC':/\.xlsx?$/i.test(v)?'XLS':'PDF';
  const marks={
    rally:'<path d="M30 151 116 49l84 102M116 49v102M74 151l42-53 42 53"/><path d="M5 178h280M198 151h71M232 151V88m-27 30 27-45 28 45M212 98l20-35 21 35"/><circle cx="224" cy="35" r="17"/><path d="M14 36q125 55 264-2"/><path d="M42 46v12m39-1v12m42-6v12m43-14v12m42-23v12m40-32v12"/>',
    social:'<rect x="38" y="38" width="188" height="116" rx="18"/><path d="m74 154-10 29 48-29M74 76h111M74 99h83M74 123h57"/><circle cx="229" cy="143" r="31"/><path d="m215 143 10 10 20-23"/>',
    decision:'<path d="m104 44 56 56m-38-72 56 56m-75-39 19-17m38 72 18-16M86 122l48-48M47 163l39-41m35 50h120m-105 0v-15h90v15"/><circle cx="201" cy="55" r="29"/><path d="m190 55 8 8 15-18"/>',
    review:'<path d="M61 169V34h112l40 40v95M173 34v40h40M88 91h72M88 115h72M88 140h40"/><circle cx="195" cy="137" r="29"/><path d="m216 158 30 30"/>',
    policy:'<path d="M146 22 225 52v57c0 40-39 63-79 82-39-19-79-42-79-82V52Z"/><path d="m107 105 27 27 49-58"/><path d="M27 65h17M249 65h17M17 107h25m211 0h24M36 149h14m193 0h16"/>',
    leadership:'<path d="M39 167V63l106-39 106 39v104M64 167V81h161v86M95 81v86m50-86v86m50-86v86M25 181h240"/><path d="m130 53 15-9 16 9"/>',
    timeline:'<path d="M68 40h155v143H68Z M68 71h155M102 31v18m86-18v18M95 98h22m19 0h22m19 0h22M95 123h22m19 0h22M95 149h22"/><circle cx="215" cy="151" r="31"/><path d="M215 133v20l14 8"/>',
    conduct:'<path d="M146 22 225 52v57c0 40-39 63-79 82-39-19-79-42-79-82V52Z"/><path d="M119 78h54M119 103h54M119 129h35"/><circle cx="145" cy="158" r="3"/>'
  };
  function artwork(style){return '<svg class="gc-event-art" viewBox="0 0 290 210" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(marks[style]||marks.review)+'</svg>';}
  const sections=[
    {name:'Member Cases',eyebrow:'PERSON → CONTEXT → RECORDED OUTCOME',description:'One file per person. Review the context, recorded outcome, and all supporting documents together.'},
    {name:'Club Incidents',eyebrow:'EVENTS & HISTORICAL REFERENCE',description:'Multi-person club incidents and historical overviews. Each incident keeps its reports, correspondence, and related statements together.'},
    {name:'Club Communications',eyebrow:'ANNOUNCEMENTS & PUBLIC DISCUSSIONS',description:'Official club messages, policy explanations, and public discussions retained for context. These are separate from individual member cases.'},
    {name:'Board Decisions & Governance',eyebrow:'DECISIONS, PROCESS & CONTINUITY',description:'Records explaining Board decisions, governance concerns, and nomination planning.'}
  ];
  function group(rows){
    const map=new Map();
    for(const r of rows){if(r[1]==='Restricted Members')continue;const id=r[8]||r[2]||r[0];if(!map.has(id))map.set(id,{id,title:r[9]||r[2]||r[3],summary:r[10]||'Related documents and supporting records.',category:r[1],art:r[11]||'review',date:r[13]||r[4]||'',outcome:r[15]||'',context:r[16]||'',rows:[],image:''});const e=map.get(id);e.rows.push(r);e.image=e.image||picture(r[14]);}
    return [...map.values()].sort((a,b)=>String(b.date).localeCompare(String(a.date))||a.title.localeCompare(b.title));
  }
  window.openGovernanceConduct=async function(initialSection='Member Cases',initialFile=null){
    const host=document.getElementById('recordsWorkspace'),ticket=++generation;
    let selected=sections.some(s=>s.name===initialSection)?initialSection:'Member Cases',references=[];
    let css=document.getElementById('gcStyles');
    if(!css){css=document.createElement('link');css.id='gcStyles';css.rel='stylesheet';document.head.append(css);}
    css.href='governance-conduct.css?v=20261024-files';
    host.innerHTML=`<section class="gc-shell gc-sectioned"><header class="gc-hero"><div class="gc-hero-top"><button class="gc-quiet" data-gc-back>← Club Records</button><span class="gc-private"><span></span> CONFIDENTIAL · LEADERSHIP</span><button class="gc-quiet" data-gc-refresh>Refresh records ↻</button></div><div class="gc-hero-main"><div><div class="gc-eyebrow">BONESHAKERS SOCIAL CLUB / BOARD CONTINUITY RECORDS</div><h2>Governance <span>&amp; Conduct.</span></h2><p>Member files, club incidents, communications, and Board records.</p></div><img class="gc-crest" src="assets/club-skull.webp" alt="BoneShakers Social Club"></div><div class="gc-hero-bottom"><div class="gc-stats"><div><strong data-gc-people>—</strong><span>PERSON FILES</span></div><div><strong data-gc-incidents>—</strong><span>CLUB INCIDENTS</span></div><div><strong data-gc-documents>—</strong><span>DOCUMENTS</span></div></div><button class="gc-register-button" data-gc-register>Restricted Members <span aria-hidden="true">→</span></button></div></header><nav class="gc-section-tabs" role="tablist" aria-label="Governance record sections">${sections.map((s,i)=>'<button type="button" role="tab" id="gcTab'+i+'" data-gc-section="'+safe(s.name)+'" aria-controls="gcSectionPanel" aria-selected="'+(s.name===selected)+'" tabindex="'+(s.name===selected?'0':'-1')+'">'+safe(s.name)+'<span data-gc-tab-count="'+i+'">—</span></button>').join('')}</nav><div class="gc-columns"><section class="gc-events" id="gcSectionPanel" role="tabpanel"><div data-gc-list><div class="gc-section-heading"><div class="gc-eyebrow" data-gc-section-eyebrow></div><h3 data-gc-section-title></h3><p data-gc-section-description></p></div><div class="gc-controls"><label class="gc-search"><span>Search this section</span><input type="search" data-gc-search placeholder="Person, document, or year…"></label></div><p class="gc-result-count" data-gc-count role="status">Loading private records…</p><div class="gc-event-grid" data-gc-grid></div></div><div data-gc-file hidden></div></section></div><footer class="gc-footer">CONFIDENTIAL CLUB RECORDS <span>Original documents retain their titles. Unrecorded outcomes are identified explicitly.</span></footer></section>`;
    const updateSection=()=>{
      const meta=sections.find(s=>s.name===selected),index=sections.indexOf(meta);
      host.querySelector('[data-gc-section-eyebrow]').textContent=meta.eyebrow;
      host.querySelector('[data-gc-section-title]').textContent=meta.name;
      host.querySelector('[data-gc-section-description]').textContent=meta.description;
      host.querySelector('#gcSectionPanel').setAttribute('aria-labelledby','gcTab'+index);
      host.querySelectorAll('[data-gc-section]').forEach(b=>{const active=b.dataset.gcSection===selected;b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1;});
    };updateSection();
    host.querySelector('[data-gc-back]').onclick=recordsHome;
    host.querySelector('[data-gc-refresh]').onclick=()=>openGovernanceConduct(selected);
    host.querySelector('[data-gc-register]').onclick=()=>{
      ++generation;
      if(window.openRestrictedMembersRegister)window.openRestrictedMembersRegister({onBack:()=>openGovernanceConduct(selected),references});
    };
    const grid=host.querySelector('[data-gc-grid]'),count=host.querySelector('[data-gc-count]');
    try{
      if(!accessToken)throw new Error('Sign in with your authorized Google account, then select Refresh records.');
      const raw=await getSheetValues("'Governance & Conduct'!A1:Q200",book);
      if(ticket!==generation||!host.contains(grid))return;
      const normalize=r=>Array.from({length:17},(_,i)=>String(r[i]??''));
      let snapshot=raw.map(normalize),rows=[],events=[],activeFile=null,busy=false;
      const rebuild=()=>{rows=snapshot.slice(1).map((r,i)=>Object.assign([...r],{sheetRow:i+2})).filter(r=>r[0]);events=group(rows);};rebuild();
      references=rows.filter(r=>r[1]==='Restricted Members'&&href(r[6])).map(r=>({title:docTitle(r[3]),url:href(r[6])}));
      host.querySelector('[data-gc-people]').textContent=events.filter(e=>e.category==='Member Cases').length;
      host.querySelector('[data-gc-incidents]').textContent=events.filter(e=>e.category==='Club Incidents').length;
      host.querySelector('[data-gc-documents]').textContent=rows.length;
      sections.forEach((s,i)=>{host.querySelector('[data-gc-tab-count="'+i+'"]').textContent=events.filter(e=>e.category===s.name).length;});

      const base='https://sheets.googleapis.com/v4/spreadsheets/'+book;
      const sheetRange="'Governance & Conduct'!A1:Q200";
      const rowRange=n=>"'Governance & Conduct'!A"+n+':Q'+n;
      const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
      function alive(){return !!accessToken&&host.contains(grid);}
      function updateCounts(){
        host.querySelector('[data-gc-people]').textContent=events.filter(e=>e.category==='Member Cases').length;
        host.querySelector('[data-gc-incidents]').textContent=events.filter(e=>e.category==='Club Incidents').length;
        host.querySelector('[data-gc-documents]').textContent=rows.length;
        sections.forEach((s,i)=>host.querySelector('[data-gc-tab-count="'+i+'"]').textContent=events.filter(e=>e.category===s.name).length);
      }
      // Re-read before each write so another Board member's changes are never silently overwritten.
      async function persist(changes,action){
        const fresh=(await getSheetValues(sheetRange,book)).map(normalize);
        if(!alive())throw new Error('This screen changed. Reopen the file before saving.');
        if(!same(fresh,snapshot))throw new Error('Records changed since this page opened. Refresh records before saving.');
        const data=changes.map(c=>({range:rowRange(c.row),values:[normalize(c.values)]}));
        await writePortalSheetRequest(base+'/values:batchUpdate',{method:'POST',headers:{Authorization:'Bearer '+accessToken,'Content-Type':'application/json'},body:JSON.stringify({valueInputOption:'RAW',data}),signal:AbortSignal.timeout(20000)},action,'Governance & Conduct',changes.length);
        const verified=(await getSheetValues(sheetRange,book)).map(normalize);
        if(!changes.every(c=>same(normalize(verified[c.row-1]||[]),normalize(c.values))))throw new Error('Save could not be verified. Refresh to check the current records before retrying.');
        snapshot=verified;rebuild();updateCounts();
      }
      function previewURL(link){
        const valid=href(link);if(!valid)return '';
        const u=new URL(valid),id=u.pathname.match(/\/d\/([a-zA-Z0-9_-]+)/)?.[1]||u.searchParams.get('id');
        return id&&/^[a-zA-Z0-9_-]+$/.test(id)?'https://drive.google.com/file/d/'+id+'/preview':'';
      }
      function documentCard(r){
        const link=href(r[6]),preview=previewURL(r[6]),image=picture(r[14]);
        return '<article class="gc-doc-card"><div class="gc-doc-toolbar"><span>'+type(r[3])+'</span><div><button type="button" data-gc-doc-edit="'+safe(r[0])+'" aria-label="Edit '+safe(docTitle(r[3]))+'">Edit</button><button type="button" data-gc-doc-delete="'+safe(r[0])+'" aria-label="Delete '+safe(docTitle(r[3]))+'">Delete</button></div></div>'+(link?'<a class="gc-preview" href="'+safe(link)+'" target="_blank" rel="noopener" aria-label="Open '+safe(docTitle(r[3]))+'">'+(image?'<img src="'+image+'" alt="Document preview" loading="lazy">':preview?'<iframe title="Preview of '+safe(docTitle(r[3]))+'" src="'+safe(preview)+'" loading="lazy" tabindex="-1" referrerpolicy="strict-origin-when-cross-origin"></iframe>':'<span>Preview unavailable</span>')+'<span class="gc-preview-open">Open document ↗</span></a>':'<div class="gc-preview gc-preview-missing">Add a document link using Edit.</div>')+'<div class="gc-doc-caption"><h4>'+safe(docTitle(r[3]))+'</h4><p>'+safe(r[5]||'On file')+(r[4]?' · '+safe(date(r[4])):'')+'</p>'+(r[7]?'<p class="gc-doc-note">'+safe(r[7])+'</p>':'')+(link?'<a href="'+safe(link)+'" target="_blank" rel="noopener">View full document ↗</a>':'')+'</div></article>';
      }
      function openFile(id){
        const e=events.find(e=>e.id===id);if(!e){closeFile();return;}
        activeFile=id;selected=e.category;updateSection();
        host.querySelector('[data-gc-list]').hidden=true;
        const detail=host.querySelector('[data-gc-file]');detail.hidden=false;detail.dataset.fileId=id;
        detail.innerHTML='<div class="gc-file-top"><button type="button" class="gc-action" data-gc-file-back>← '+safe(e.category)+'</button><div><button type="button" class="gc-action" data-gc-file-edit>Edit file</button><button type="button" class="gc-action gc-danger" data-gc-file-delete>Delete file</button></div></div><div class="gc-file-intro" tabindex="-1"><div class="gc-eyebrow">'+safe(e.category)+' · '+safe(date(e.date))+'</div><h3>'+safe(e.title)+'</h3>'+(e.context?'<p class="gc-context">'+safe(e.context)+'</p>':'')+'<p>'+safe(e.summary)+'</p></div><div class="gc-outcome"><strong>Recorded outcome</strong><p>'+safe(e.outcome||'No outcome recorded.')+'</p></div><div class="gc-doc-heading"><div><h3>Documents</h3><p>Click a preview to open the full document.</p></div><button type="button" class="gc-action" data-gc-doc-add>+ Add document</button></div><p class="gc-preview-help">Previews use your Google access. If a preview cannot display, use View full document.</p><div class="gc-doc-grid">'+e.rows.map(documentCard).join('')+'</div>';
        detail.querySelector('[data-gc-file-back]').onclick=closeFile;
        detail.querySelector('[data-gc-file-edit]').onclick=()=>editFile(e);
        detail.querySelector('[data-gc-file-delete]').onclick=()=>deleteFile(e);
        detail.querySelector('[data-gc-doc-add]').onclick=()=>editDocument(e,null);
        detail.querySelectorAll('[data-gc-doc-edit]').forEach(b=>b.onclick=()=>editDocument(e,e.rows.find(r=>r[0]===b.dataset.gcDocEdit)));
        detail.querySelectorAll('[data-gc-doc-delete]').forEach(b=>b.onclick=()=>deleteDocument(e,e.rows.find(r=>r[0]===b.dataset.gcDocDelete)));
        host.querySelector('[data-gc-refresh]').onclick=()=>openGovernanceConduct(selected,activeFile);
        detail.querySelector('.gc-file-intro').focus({preventScroll:true});
        detail.scrollIntoView({block:'start',behavior:'instant'});
      }
      function closeFile(){
        activeFile=null;host.querySelector('[data-gc-file]').hidden=true;host.querySelector('[data-gc-file]').innerHTML='';
        host.querySelector('[data-gc-list]').hidden=false;paint();
        host.querySelector('[data-gc-refresh]').onclick=()=>openGovernanceConduct(selected);
      }
      function editor(title,body,submitLabel,onSubmit){
        if(busy)return;
        const currentDetail=host.querySelector('[data-gc-file]');activeFile=currentDetail.hidden?null:currentDetail.dataset.fileId;
        selected=host.querySelector('[data-gc-section][aria-selected=true]')?.dataset.gcSection||selected;
        const dialog=document.createElement('dialog');dialog.className='gc-editor';
        dialog.innerHTML='<form><header><h3>'+safe(title)+'</h3><button type="button" data-close aria-label="Close editor">×</button></header>'+body+'<p data-message role="status" aria-live="polite"></p><footer><button type="button" data-cancel>Cancel</button><button type="submit">'+safe(submitLabel)+'</button></footer></form>';
        host.querySelector('.gc-shell').append(dialog);
        dialog.querySelectorAll('[data-close],[data-cancel]').forEach(b=>b.onclick=()=>dialog.close());
        dialog.onclose=()=>dialog.remove();dialog.oncancel=event=>{if(busy)event.preventDefault();};
        dialog.querySelector('form').onsubmit=async event=>{
          event.preventDefault();if(busy)return;
          const form=dialog.querySelector('form'),fields=new FormData(form),message=dialog.querySelector('[data-message]');
          busy=true;form.querySelectorAll('button,input,textarea,select').forEach(el=>el.disabled=true);message.textContent='Saving…';
          try{await onSubmit(fields);dialog.close();if(activeFile)openFile(activeFile);else closeFile();}
          catch(error){message.textContent=error.message;}
          finally{busy=false;form.querySelectorAll('button,input,textarea,select').forEach(el=>el.disabled=false);}
        };
        dialog.showModal();return dialog;
      }
      function field(label,name,value='',multiline=false){return '<label>'+safe(label)+(multiline?'<textarea name="'+name+'" rows="3">'+safe(value)+'</textarea>':'<input name="'+name+'" value="'+safe(value)+'"'+(['title','url'].includes(name)?' required':'')+' maxlength="'+(name==='url'?'3000':'1000')+'">')+'</label>';}
      const val=(f,key)=>String(f.get(key)||'').trim();
      function editFile(e){
        if(!e)return;
        editor('Edit '+e.title,field('Name / file title','title',e.title)+'<fieldset><legend>Section</legend>'+sections.map(s=>'<label class="gc-radio"><input type="radio" name="section" value="'+safe(s.name)+'" '+(s.name===e.category?'checked':'')+'> '+safe(s.name)+'</label>').join('')+'</fieldset>'+field('Summary','summary',e.summary,true)+field('People / context','context',e.context,true)+field('Recorded outcome','outcome',e.outcome,true)+field('File date (YYYY-MM-DD or year)','date',e.date), 'Save changes',async f=>{
          const title=val(f,'title'),category=val(f,'section');if(!title||!sections.some(s=>s.name===category))throw new Error('Enter a name and choose a section.');
          const changes=e.rows.map(r=>{const values=[...r];values[1]=category;values[2]=title;values[9]=title;values[10]=val(f,'summary');values[13]=val(f,'date');values[15]=val(f,'outcome');values[16]=val(f,'context');return {row:r.sheetRow,values};});
          await persist(changes,'Edited governance file');selected=category;
        });
      }
      async function previewImage(file){
        if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>15000000)throw new Error('Choose a PNG, JPEG or WebP image under 15 MB.');
        const bitmap=await createImageBitmap(file),canvas=document.createElement('canvas');
        const ratio=Math.min(1,610/bitmap.width,790/bitmap.height);canvas.width=Math.max(1,Math.round(bitmap.width*ratio));canvas.height=Math.max(1,Math.round(bitmap.height*ratio));
        const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();
        for(const quality of [.6,.45,.3,.15]){const image=canvas.toDataURL('image/jpeg',quality);if(image.length<49000)return image;}
        throw new Error('This preview image is too detailed. Choose a smaller screenshot.');
      }
      function editDocument(e,r){
        editor(r?'Edit document':'Add document',field('Document title','title',r?.[3])+field('Google Drive / Docs document link','url',r?.[6])+field('Document date','date',r?.[4])+field('Status','status',r?.[5]||'On file')+field('Notes','notes',r?.[7],true)+'<label>Document preview image (optional)<input type="file" name="preview" accept="image/png,image/jpeg,image/webp"></label><p>Use a first-page screenshot or image. This preview stays with the private file.</p>'+(picture(r?.[14])?'<label class="gc-radio"><input type="checkbox" name="clearPreview"> Remove current preview image</label>':''),'Save document',async f=>{
          const link=href(val(f,'url')),title=val(f,'title');if(!link||!title)throw new Error('Enter a title and a valid HTTPS Google Drive or Docs link.');
          const values=r?[...r]:normalize(e.rows[0]);let row=r?.sheetRow;
          if(!r){row=Array.from({length:199},(_,i)=>i+2).find(n=>!normalize(snapshot[n-1]||[]).some(Boolean));if(!row)throw new Error('The record index is full. Contact the portal administrator.');values[0]='GC-'+Array.from(crypto.getRandomValues(new Uint32Array(4)),n=>n.toString(16).padStart(8,'0')).join('');values[14]='';}
          if(r&&values[6]!==link||f.get('clearPreview'))values[14]='';
          const preview=f.get('preview');if(preview?.size)values[14]=await previewImage(preview);
          values[3]=title;values[4]=val(f,'date');values[5]=val(f,'status');values[6]=link;values[7]=val(f,'notes');
          await persist([{row,values}],'Saved governance document');
        });
      }
      function deleteFile(e){
        editor('Delete '+e.title+'?','<p>This removes this file and its '+e.rows.length+' document entries from the portal. The original Google Drive documents remain in Drive. Restricted Members is managed separately.</p>','Delete file',async()=>{
          await persist(e.rows.map(r=>({row:r.sheetRow,values:[]})),'Deleted governance file');activeFile=null;
        });
      }
      function deleteDocument(e,r){
        const last=e.rows.length===1;
        editor('Delete document?','<p>Remove <strong>'+safe(docTitle(r[3]))+'</strong> from this file? The original Google Drive document remains in Drive.</p>'+(last?'<p>This is the last document entry. Removing it will also remove this file from the portal.</p>':''),'Delete document',async()=>{
          await persist([{row:r.sheetRow,values:[]}],'Deleted governance document');if(last)activeFile=null;
        });
      }
      const paint=()=>{
        updateSection();
        const q=host.querySelector('[data-gc-search]').value.trim().toLowerCase(),all=events.filter(e=>e.category===selected),list=all.filter(e=>[e.title,e.summary,e.context,e.outcome,e.date,...e.rows.flatMap(r=>[r[3],r[7]])].join(' ').toLowerCase().includes(q));
        count.textContent=list.length+' of '+all.length+' '+(selected==='Member Cases'?'person files':'records')+' · newest first';
        grid.innerHTML=list.map(e=>'<article class="gc-event-card gc-art-'+safe(e.art)+'"><div class="gc-event-cover">'+artwork(e.art)+'<div class="gc-cover-top"><span>'+safe(e.category)+'</span><button type="button" class="gc-corner" data-gc-edit="'+safe(e.id)+'" aria-label="Edit '+safe(e.title)+'">Edit</button></div><div class="gc-cover-label"><span>'+safe(date(e.date))+'</span><h4><button type="button" class="gc-name" data-gc-open="'+safe(e.id)+'">'+safe(e.title)+'</button></h4></div></div><div class="gc-event-body"><p class="gc-event-summary">'+safe(e.summary)+'</p><button type="button" class="gc-open-file" data-gc-open="'+safe(e.id)+'">Open file <span>'+e.rows.length+' documents →</span></button></div></article>').join('')||'<div class="gc-empty"><h4>No matching records</h4><p>Try a person’s name, a year, or a shorter search.</p></div>';
        grid.querySelectorAll('[data-gc-open]').forEach(b=>b.onclick=()=>openFile(b.dataset.gcOpen));
        grid.querySelectorAll('[data-gc-edit]').forEach(b=>b.onclick=()=>editFile(events.find(e=>e.id===b.dataset.gcEdit)));

      };
      host.querySelector('[data-gc-search]').oninput=paint;
      const select=b=>{selected=b.dataset.gcSection;host.querySelector('[data-gc-search]').value='';closeFile();};
      const buttons=[...host.querySelectorAll('[data-gc-section]')];
      buttons.forEach((b,index)=>{b.onclick=()=>select(b);b.onkeydown=event=>{let next;if(event.key==='ArrowRight')next=(index+1)%buttons.length;else if(event.key==='ArrowLeft')next=(index+buttons.length-1)%buttons.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=buttons.length-1;else return;event.preventDefault();select(buttons[next]);buttons[next].focus();};});paint();
      if(initialFile)openFile(initialFile);
    }catch(error){if(host.contains(grid)){count.textContent='Unable to load records. '+error.message;grid.innerHTML='<p class="gc-empty">Select Refresh records to retry. Restricted Members opens independently using the button above.</p>';}}
  };
})();
