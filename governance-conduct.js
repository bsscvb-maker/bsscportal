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
  window.openGovernanceConduct=async function(initialSection='Member Cases'){
    const host=document.getElementById('recordsWorkspace'),ticket=++generation;
    let selected=sections.some(s=>s.name===initialSection)?initialSection:'Member Cases',references=[];
    let css=document.getElementById('gcStyles');
    if(!css){css=document.createElement('link');css.id='gcStyles';css.rel='stylesheet';document.head.append(css);}
    css.href='governance-conduct.css?v=20261024-sections';
    host.innerHTML=`<section class="gc-shell gc-sectioned"><header class="gc-hero"><div class="gc-hero-top"><button class="gc-quiet" data-gc-back>← Club Records</button><span class="gc-private"><span></span> CONFIDENTIAL · LEADERSHIP</span><button class="gc-quiet" data-gc-refresh>Refresh records ↻</button></div><div class="gc-hero-main"><div><div class="gc-eyebrow">BONESHAKERS SOCIAL CLUB / BOARD CONTINUITY RECORDS</div><h2>Governance <span>&amp; Conduct.</span></h2><p>Member files, club incidents, communications, and Board records.</p></div><img class="gc-crest" src="assets/club-skull.webp" alt="BoneShakers Social Club"></div><div class="gc-hero-bottom"><div class="gc-stats"><div><strong data-gc-people>—</strong><span>PERSON FILES</span></div><div><strong data-gc-incidents>—</strong><span>CLUB INCIDENTS</span></div><div><strong data-gc-documents>—</strong><span>DOCUMENTS</span></div></div><button class="gc-register-button" data-gc-register>Restricted Members <span aria-hidden="true">→</span></button></div></header><nav class="gc-section-tabs" role="tablist" aria-label="Governance record sections">${sections.map((s,i)=>'<button type="button" role="tab" id="gcTab'+i+'" data-gc-section="'+safe(s.name)+'" aria-controls="gcSectionPanel" aria-selected="'+(s.name===selected)+'" tabindex="'+(s.name===selected?'0':'-1')+'">'+safe(s.name)+'<span data-gc-tab-count="'+i+'">—</span></button>').join('')}</nav><div class="gc-columns"><section class="gc-events" id="gcSectionPanel" role="tabpanel"><div class="gc-section-heading"><div class="gc-eyebrow" data-gc-section-eyebrow></div><h3 data-gc-section-title></h3><p data-gc-section-description></p></div><div class="gc-controls"><label class="gc-search"><span>Search this section</span><input type="search" data-gc-search placeholder="Person, document, or year…"></label></div><p class="gc-result-count" data-gc-count role="status">Loading private records…</p><div class="gc-event-grid" data-gc-grid></div></section></div><footer class="gc-footer">CONFIDENTIAL CLUB RECORDS <span>Original documents retain their titles. Unrecorded outcomes are identified explicitly.</span></footer></section>`;
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
      const rows=raw.slice(1).filter(r=>r[0]),events=group(rows);
      references=rows.filter(r=>r[1]==='Restricted Members'&&href(r[6])).map(r=>({title:docTitle(r[3]),url:href(r[6])}));
      host.querySelector('[data-gc-people]').textContent=events.filter(e=>e.category==='Member Cases').length;
      host.querySelector('[data-gc-incidents]').textContent=events.filter(e=>e.category==='Club Incidents').length;
      host.querySelector('[data-gc-documents]').textContent=rows.length;
      sections.forEach((s,i)=>{host.querySelector('[data-gc-tab-count="'+i+'"]').textContent=events.filter(e=>e.category===s.name).length;});
      const paint=()=>{
        updateSection();
        const q=host.querySelector('[data-gc-search]').value.trim().toLowerCase(),all=events.filter(e=>e.category===selected),list=all.filter(e=>[e.title,e.summary,e.context,e.outcome,e.date,...e.rows.flatMap(r=>[r[3],r[7]])].join(' ').toLowerCase().includes(q));
        count.textContent=list.length+' of '+all.length+' '+(selected==='Member Cases'?'person files':'records')+' · newest first';
        grid.innerHTML=list.map(e=>'<article class="gc-event-card gc-art-'+safe(e.art)+'"><div class="gc-event-cover">'+artwork(e.art)+(e.image?'<img class="gc-evidence-picture" src="'+e.image+'" alt="Supporting screenshot for '+safe(e.title)+'" loading="lazy" decoding="async">':'')+'<div class="gc-cover-top"><span>'+safe(e.category)+'</span></div><div class="gc-cover-label"><span>'+safe(date(e.date))+'</span><h4>'+safe(e.title)+'</h4></div></div><div class="gc-event-body">'+(e.context?'<div class="gc-context">'+safe(e.context)+'</div>':'')+'<p class="gc-event-summary">'+safe(e.summary)+'</p>'+(e.outcome?'<div class="gc-outcome"><strong>Recorded outcome</strong><p>'+safe(e.outcome)+'</p></div>':'')+e.rows.filter(r=>/Date follows the supplied filename/i.test(r[7]||'')).map(r=>'<p class="gc-record-note">'+safe(r[7])+'</p>').join('')+'<div class="gc-document-heading"><strong>SUPPORTING DOCUMENTS</strong><span>'+e.rows.length+' document'+(e.rows.length===1?'':'s')+'</span></div><div class="gc-document-list">'+e.rows.map(r=>href(r[6])?'<a class="gc-document" target="_blank" rel="noopener" href="'+safe(href(r[6]))+'"><span class="gc-file-type">'+type(r[3])+'</span><span><strong>'+safe(docTitle(r[3]))+'</strong><small>'+safe(r[5]||'On file')+(r[4]?' · '+safe(date(r[4])):'')+'</small></span><span class="gc-document-arrow" aria-hidden="true">↗</span></a>':'<p class="gc-document">'+safe(docTitle(r[3]))+' — link needs review</p>').join('')+'</div></div></article>').join('')||'<div class="gc-empty"><h4>No matching records</h4><p>Try a person’s name, a year, or a shorter search.</p></div>';
      };
      host.querySelector('[data-gc-search]').oninput=paint;
      const select=b=>{selected=b.dataset.gcSection;host.querySelector('[data-gc-search]').value='';paint();};
      const buttons=[...host.querySelectorAll('[data-gc-section]')];
      buttons.forEach((b,index)=>{b.onclick=()=>select(b);b.onkeydown=event=>{let next;if(event.key==='ArrowRight')next=(index+1)%buttons.length;else if(event.key==='ArrowLeft')next=(index+buttons.length-1)%buttons.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=buttons.length-1;else return;event.preventDefault();select(buttons[next]);buttons[next].focus();};});paint();
    }catch(error){if(host.contains(grid)){count.textContent='Unable to load records. '+error.message;grid.innerHTML='<p class="gc-empty">Select Refresh records to retry. Restricted Members opens independently using the button above.</p>';}}
  };
})();
