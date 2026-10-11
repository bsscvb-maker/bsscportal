/* Shared BFT operations; records stay in the existing private Google workbook. */
(() => {
'use strict';
const EVENT='BFT-2026-1011';
const configs={
Stations:{headers:['Station ID','Event ID','Position','Volunteer 1','Volunteer 2','Responsibility','Item range','Status','Notes','Updated At'],title:'Stations'},
Volunteers:{headers:['Volunteer ID','Event ID','Name','Check-in','Notes','Updated At'],title:'Volunteers'},
Prizes:{headers:['Prize ID','Event ID','Category','Number','Prize name','Contents','Estimated value','Starting bid','Station ID','Related donor IDs','Winner','Phone','Winning amount','Payment status','Release status','Notes','Updated At'],title:'Prizes'},
Donors:{headers:['Donation ID','Event ID','Source number','Assigned','Collected By','Business / Item','Type','From (Donor)','Where It Is From','Qty','Value Each','Expiration / Valid Through','Stated Total','Card / Certificate ID','Restrictions / Notes','Review status','Updated At'],title:'Donors'},
Review:{headers:['Review ID','Event ID','Subject','Issue','Status','Resolution','Updated At'],title:'Review'},
Documents:{headers:['Document ID','Event ID','Title','Type','URL','Notes','Updated At'],title:'Documents'}
};
const tabs=['Overview','Stations','Volunteers','Prizes','Donors','Sponsors','Documents','Review'];
const labels={Overview:'Today',Stations:'Stations',Volunteers:'Crew',Prizes:'Prizes & winners',Donors:'Donors',Sponsors:'Sponsors',Documents:'Documents',Review:'Review'};
const state={tab:'Overview',data:{},query:'',filter:'',busy:false,generation:0,loadedAt:null,sponsorTab:'Sponsors - Current',sponsors:{},sponsorHeaders:{},notice:''};
const legacyLoad=loadClubFramework;
const H=()=>document.getElementById('volunteersWorkspace');
const html=v=>esc(String(v??''));
const pad=(row,n)=>Array.from({length:n},(_,i)=>String(row?.[i]??''));
const equal=(a,b,n)=>JSON.stringify(pad(a,n))===JSON.stringify(pad(b,n));
const records=k=>(state.data[k]||[]).slice(1).map((v,i)=>({v,row:i+2})).filter(r=>r.v[0]&&r.v[1]===EVENT);
const col=n=>columnNumberToLetters(n);
const sheet=k=>'BFT 2026 '+k;
const range=(k,row)=>`'${sheet(k)}'!A${row}:${col(configs[k].headers.length)}${row}`;
const used=()=>new Set(records('Stations').flatMap(r=>r.v.slice(3,5)).filter(Boolean));
const available=()=>records('Volunteers').filter(r=>!used().has(r.v[2]));
const station=id=>records('Stations').find(s=>s.v[0]===id)?.v[2]||'No station';
const chip=(txt,kind='')=>`<span class="hq-chip ${kind}">${html(txt)}</span>`;
const btn=(label,attrs='',cls='')=>`<button type="button" class="${cls}" ${attrs}>${html(label)}</button>`;
const details=(headers,v,indices)=>`<dl>${indices.map(i=>`<dt>${html(headers[i])}</dt><dd>${html(v[i]||'Not recorded')}</dd>`).join('')}</dl>`;
const safeURL=url=>{try{const u=new URL(url);return u.protocol==='https:'?u.href:'';}catch{return '';}};
const error=e=>e?.message||String(e);
function matching(list){return list.filter(r=>(!state.query||r.v.join(' ').toLowerCase().includes(state.query.toLowerCase()))&&(!state.filter||(state.filter==='Needs coverage'?!r.v[3]&&!r.v[4]:state.filter==='Unassigned'?!used().has(r.v[2]):state.filter==='Awaiting release'?r.v[10]&&r.v[14]!=='Released':r.v.includes(state.filter))));}
function status(msg,isError=false){const el=H().querySelector('[data-hq-status]');if(el){el.textContent=msg;el.classList.toggle('error',isError);}}
function retainFocus(){const el=document.activeElement;return el?.dataset.hqSearch!==undefined?{query:el.value,start:el.selectionStart}:null;}
async function load(){
 const gen=++state.generation;
 if(!accessToken){H().innerHTML='<div class="bft-hq"><div class="hq-empty">Sign in with Google to open the shared event command center.</div></div>';return;}
 H().innerHTML='<div class="bft-hq"><div class="hq-empty" role="status">Loading the Bikes for Tykes event command center…</div></div>';
 try{
  const keys=Object.keys(configs),rows=await getSheetRanges(keys.map(k=>`'${sheet(k)}'!A1:${col(configs[k].headers.length)}2000`),MEMBERSHIP_SPREADSHEET_ID);
  if(gen!==state.generation)return;
  keys.forEach((k,i)=>{if(!equal(rows[i][0],configs[k].headers,configs[k].headers.length))throw Error('Unexpected columns in '+sheet(k)+'. No records were changed.');state.data[k]=rows[i];});
  state.loadedAt=new Date();state.notice='';render();
 }catch(e){H().innerHTML=`<div class="bft-hq"><div class="hq-warning" role="alert">${html(error(e))}</div>${btn('Retry','data-hq-retry')}</div>`;H().querySelector('[data-hq-retry]').onclick=load;}
}
loadClubFramework=async function(key){if(key==='volunteers')return load();return legacyLoad(key);};
function master(){return records('Documents').find(r=>r.v[3]==='Editable master')?.v[4];}
function go(t,query=''){state.tab=t;state.query=query;state.filter='';render();if(t==='Sponsors')loadSponsors();}
function render(){
 const focus=retainFocus(),ss=records('Stations'),vv=records('Volunteers'),pp=records('Prizes'),open=records('Review').filter(r=>r.v[4]==='Open').length;
 const full=ss.filter(r=>r.v[3]||r.v[4]).length,checked=vv.filter(r=>r.v[3]==='Here').length;
 H().innerHTML=`<div class="bft-hq hq-daymode"><header class="hq-day-header"><div><div class="hq-kicker">BSSC · EVENT DAY</div><h2>Bikes for Tykes</h2><p>Oct 11 · Elevation 27 · 1–6 PM</p></div><div class="hq-header-tools">${btn('Refresh','data-hq-refresh')}${master()?`<a class="hq-btn" target="_blank" rel="noopener" href="${html(safeURL(master()))}">Master document ↗</a>`:''}</div></header><nav class="hq-tabs" aria-label="Event workspace">${tabs.slice(0,4).map(t=>btn(labels[t],`data-hq-tab="${t}" aria-pressed="${state.tab===t}"`,state.tab===t?'selected':'')).join('')}<details class="hq-more"><summary>More${tabs.slice(4).includes(state.tab)?' · '+labels[state.tab]:''}</summary><div>${tabs.slice(4).map(t=>btn(labels[t]+(t==='Review'&&open?' ('+open+')':''),`data-hq-tab="${t}" aria-pressed="${state.tab===t}"`,state.tab===t?'selected':'')).join('')}</div></details></nav><div class="hq-status" data-hq-status role="status">${html(state.notice||'Shared records · Updated '+(state.loadedAt?.toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})||'—'))}</div><div data-hq-body></div><details class="hq-admin-tools"><summary>Documents, exports & other events</summary><div class="hq-toolbar">${btn('Other club events','data-hq-legacy')}${btn('Print live event packet','data-hq-print')}${btn('Export all event records','data-hq-export-all')}</div></details></div>`;
 const body=H().querySelector('[data-hq-body]');
 if(state.tab==='Overview')overview(body);else if(state.tab==='Documents')documents(body);else if(state.tab==='Sponsors')sponsors(body);else list(body);
 H().querySelectorAll('[data-hq-tab]').forEach(b=>b.onclick=()=>go(b.dataset.hqTab));
 H().querySelector('[data-hq-refresh]').onclick=()=>{if(!state.busy){state.sponsors={};load();}};
 H().querySelector('[data-hq-legacy]').onclick=async()=>{await legacyLoad('volunteers');const b=document.createElement('button');b.className='open-btn';b.textContent='← Bikes for Tykes Event Command Center';b.onclick=load;H().prepend(b);};
 H().querySelector('[data-hq-print]').onclick=printPacket;
 H().querySelector('[data-hq-export-all]').onclick=()=>download('BFT_2026_All_Event_Records.json',JSON.stringify({event:EVENT,exportedAt:new Date().toISOString(),...state.data},null,2),'application/json');
 if(focus&&H().querySelector('[data-hq-search]')){const q=H().querySelector('[data-hq-search]');q.focus();q.setSelectionRange(focus.start,focus.start);}
}
function overview(body){
 const stations=records('Stations'),crew=records('Volunteers'),prizes=records('Prizes');
 const gaps=stations.filter(r=>!r.v[3]&&!r.v[4]),free=available(),here=crew.filter(r=>r.v[3]==='Here'),waiting=prizes.filter(r=>r.v[10]&&r.v[14]!=='Released'),released=prizes.filter(r=>r.v[14]==='Released');
 body.innerHTML=`<div class="hq-day-stats">${[['Stations',stations.length-gaps.length+'/'+stations.length,'stations staffed'],['Volunteers',here.length+'/'+crew.length,'crew checked in'],['Prizes',waiting.length,'winners awaiting release']].map(([t,n,txt])=>`<button data-hq-go="${t}"><strong>${n}</strong><span>${txt}</span><small>Open ${labels[t]} →</small></button>`).join('')}</div><div class="hq-day-actions"><button data-hq-go="Stations"><span class="hq-action-symbol" aria-hidden="true">↔</span><strong>Assign or move crew</strong><span>${free.length} available · ${gaps.length} unstaffed stations</span></button><button data-hq-go="Prizes"><span class="hq-action-symbol" aria-hidden="true">✓</span><strong>Find a prize / record winner</strong><span>${prizes.length} prizes · ${released.length} released</span></button><button data-hq-go="Volunteers"><span class="hq-action-symbol" aria-hidden="true">＋</span><strong>Check in a volunteer</strong><span>Tap a name, then check in</span></button></div><section class="hq-day-panel"><div class="hq-section-title"><h3>Needs attention</h3>${btn('Station board','data-hq-go="Stations"')}</div>${gaps.map(r=>`<button class="hq-attention-row" data-hq-station-find="${html(r.v[2])}"><span class="hq-attention-dot"></span><span><strong>${html(r.v[2])}</strong><small>No volunteer assigned</small></span><b>Assign →</b></button>`).join('')}${free.map(r=>`<button class="hq-attention-row" data-hq-go="Stations"><span class="hq-attention-dot silver"></span><span><strong>${html(r.v[2])}</strong><small>Available for a station</small></span><b>Place →</b></button>`).join('')}${waiting.slice(0,6).map(r=>`<button class="hq-attention-row" data-hq-direct-winner="${r.row}"><span class="hq-attention-dot silver"></span><span><strong>#${html(r.v[3])} · ${html(r.v[4])}</strong><small>${html(r.v[10])} · ${html(r.v[13]||'Payment not recorded')}</small></span><b>Checkout →</b></button>`).join('')}${!gaps.length&&!free.length&&!waiting.length?'<p class="hq-note">No unstaffed stations, unassigned crew or winners awaiting release.</p>':''}<p class="hq-note">Raffle table 6 begins with one volunteer. Todd and Tracy are event leads; Kristen handles photography.</p></section><div class="hq-day-secondary">${[['Donors','Donation lookup'],['Sponsors','Sponsor contacts'],['Documents','Source documents'],['Review','Source questions']].map(([t,l])=>btn(l+(t==='Review'?' · '+records('Review').filter(r=>r.v[4]==='Open').length:''),`data-hq-go="${t}"`)).join('')}</div><details class="hq-day-panel"><summary>Event instructions & original tracker totals</summary><p>Everyone except Kristen helps with setup and cleanup. No dedicated attendants for the stool, mini bike or charter displays.</p><p>Confirm payment with Tracy before releasing auction items. Silent-auction winners need not be present; contact them by phone.</p><p>Source workbook estimates: $8,228.98 ($7,009.19 in-kind + $1,219.79 club funded). These are source estimates, not event income. Check Review for unresolved values and possible duplicates.</p></details>`;
 body.querySelectorAll('[data-hq-go]').forEach(b=>b.onclick=()=>go(b.dataset.hqGo));
 body.querySelectorAll('[data-hq-station-find]').forEach(b=>b.onclick=()=>go('Stations',b.dataset.hqStationFind));
 body.querySelectorAll('[data-hq-direct-winner]').forEach(b=>b.onclick=()=>edit('Prizes',Number(b.dataset.hqDirectWinner),'winner'));
}

function toolbar(body,key){
 const filterOptions=key==='Stations'?['Needs coverage']:key==='Prizes'?['Awaiting release','Live auction','Large raffle','Silent auction','Regular raffle']:key==='Volunteers'?['Unassigned','Expected','Here','Left']:key==='Donors'?['Review','Listed','Confirmed duplicate','Resolved']:key==='Review'?['Open','Resolved']:[];
 body.innerHTML=`<div class="hq-toolbar"><input type="search" data-hq-search aria-label="Search ${key.toLowerCase()}" placeholder="Search ${key.toLowerCase()}, names, contents…" value="${html(state.query)}">${filterOptions.length?`<select data-hq-filter aria-label="Filter ${key}"><option value="">All ${key.toLowerCase()}</option>${filterOptions.map(v=>`<option ${v===state.filter?'selected':''}>${v}</option>`).join('')}</select>`:''}${key==='Stations'?btn('Move a volunteer','data-hq-move'):btn('Add '+({Volunteers:'volunteer',Prizes:'prize',Donors:'donation',Review:'review item'}[key]||'record'),'data-hq-add')}${btn('Export CSV','data-hq-export')}</div><div class="hq-status" data-hq-count></div><div data-hq-list></div>`;
 body.querySelector('[data-hq-search]').oninput=e=>{state.query=e.target.value;paintList(body,key);};
 body.querySelector('[data-hq-filter]')?.addEventListener('change',e=>{state.filter=e.target.value;paintList(body,key);});
 body.querySelector('[data-hq-add]')?.addEventListener('click',()=>edit(key));
 body.querySelector('[data-hq-move]')?.addEventListener('click',moveVolunteer);
 body.querySelector('[data-hq-export]').onclick=()=>exportCSV(key);
}
function list(body){toolbar(body,state.tab);paintList(body,state.tab);}
function paintList(body,key){
 const rs=matching(records(key)),target=body.querySelector('[data-hq-list]');body.querySelector('[data-hq-count]').textContent=rs.length+' shown / '+records(key).length+' records'+(key==='Stations'?' · '+available().length+' volunteers available — selecting a name removes it from other slots':'');
 target.className=key==='Volunteers'?'hq-roster':'hq-grid';target.innerHTML=rs.map(r=>card(key,r)).join('')||'<div class="hq-empty">No matching records.</div>';
 target.querySelectorAll('[data-hq-edit]').forEach(b=>b.onclick=()=>edit(key,Number(b.dataset.hqEdit)));
 target.querySelectorAll('[data-hq-winner]').forEach(b=>b.onclick=()=>edit('Prizes',Number(b.dataset.hqWinner),'winner'));
 target.querySelectorAll('[data-hq-slot]').forEach(s=>s.onchange=async()=>{const old=s.dataset.old;s.disabled=true;try{await assign(Number(s.dataset.row),Number(s.dataset.hqSlot),s.value);render();}catch(e){s.value=old;s.disabled=false;status(error(e),true);}});
 target.querySelectorAll('[data-hq-check]').forEach(b=>b.onclick=async()=>{b.disabled=true;try{await save('Volunteers',Number(b.dataset.row),{3:b.dataset.hqCheck});render();}catch(e){b.disabled=false;status(error(e),true);}});
 target.querySelectorAll('[data-hq-linked-prize]').forEach(b=>b.onclick=()=>go('Prizes',b.dataset.hqLinkedPrize));
 target.querySelectorAll('[data-hq-donor-link]').forEach(b=>b.onclick=()=>go('Donors',b.dataset.hqDonorLink));
}
function card(key,{v,row}){
 const editButton=btn('Edit',`data-hq-edit="${row}"`);
 if(key==='Stations'){
  const u=used(),names=records('Volunteers').map(r=>r.v[2]).sort((a,b)=>a.localeCompare(b));
  const prizes=records('Prizes').filter(p=>p.v[8]===v[0]);
  return `<article class="hq-card"><div class="hq-card-head">${chip(v[0])}${chip(v[3]||v[4]?'Staffed':'Needs coverage',v[3]||v[4]?'green':'amber')}</div><h3>${html(v[2])}</h3><div class="hq-slots">${[3,4].map((c,i)=>`<label>Volunteer ${i+1}<select data-hq-slot="${c}" data-row="${row}" data-old="${html(v[c]||'')}" aria-label="${html(v[2])}, volunteer ${i+1}"><option value="">Unassigned</option>${[...new Set([...names,v[c]].filter(Boolean))].filter(n=>n===v[c]||!u.has(n)).map(n=>`<option ${n===v[c]?'selected':''}>${html(n)}</option>`).join('')}</select></label>`).join('')}</div>${v[6]?chip('Items '+v[6]):''}${prizes.length?`<details><summary>${prizes.length} prizes at this station</summary>${prizes.map(p=>btn('#'+p.v[3]+' '+p.v[4],`data-hq-linked-prize="${html(p.v[4])}"`,'hq-text-link')).join('')}</details>`:''}<details><summary>Responsibilities & station notes</summary><p>${html(v[5]||'Responsibility not recorded')}</p><p class="hq-note">${html(v[7]||'Planned')}${v[8]?' · '+html(v[8]):''}</p>${editButton}</details></article>`;
 }
 if(key==='Volunteers'){
  const assigned=records('Stations').filter(s=>s.v.slice(3,5).includes(v[2]));
  return `<article class="hq-card"><div class="hq-card-head">${chip(v[3]||'Expected',v[3]==='Here'?'green':'')}${chip(assigned.length?'Assigned':'Unassigned',assigned.length?'':'amber')}</div><h3>${html(v[2])}</h3><p>${html(assigned.map(s=>s.v[2]).join('\n')||'Available for a station')}</p>${v[4]?`<p class="hq-note">${html(v[4])}</p>`:''}<div class="hq-row-actions">${btn(v[3]==='Here'?'Mark left':'Check in',`data-hq-check="${v[3]==='Here'?'Left':'Here'}" data-row="${row}"`,v[3]==='Here'?'':'hq-primary')}${editButton}</div></article>`;
 }
 if(key==='Prizes'){
  const donors=String(v[9]||'').split(',').map(s=>s.trim()).filter(Boolean);
  return `<article class="hq-card"><div class="hq-card-head">${chip(v[2])}${chip(v[14]||'Not released',v[14]==='Released'?'green':'')}</div><div class="hq-prize-head" style="margin-top:14px"><div class="hq-prize-number">${html(v[3])}</div><h3>${html(v[4])}</h3></div><details><summary>Prize contents & value</summary><p>${html(v[5])}</p><div class="hq-money">${html(v[6]||'TBD')} <span class="hq-note">estimated value</span></div></details>${v[7]!==''&&v[7]!=null?`<p>${chip('Starting bid $'+v[7])}</p>`:''}<p class="hq-note">Station: ${html(station(v[8]))}</p>${v[10]?`<p class="hq-winner-line"><strong>${html(v[10])}</strong> · ${html(v[13]||'Payment not recorded')}${v[11]?' · '+html(v[11]):''}</p>`:''}<details><summary>${v[10]?'Winner: '+html(v[10]):'Winner & payment details'}</summary>${details(configs.Prizes.headers,v,[10,11,12,13,14,15])}</details>${donors.length?`<details><summary>Related donor records (${donors.length})</summary><p class="hq-note">Lookup links only; verify the individual card allocation and source notes.</p>${donors.map(id=>btn(id,`data-hq-donor-link="${html(id)}"`,'hq-text-link')).join('')}</details>`:''}<div class="hq-row-actions">${btn('Winner / checkout',`data-hq-winner="${row}"`,'hq-primary')}${editButton}</div></article>`;
 }
 if(key==='Donors')return `<article class="hq-card"><div class="hq-card-head">${chip(v[0]+' · source #'+v[2])}${chip(v[15]||'Listed',v[15]==='Review'?'amber':'')}</div><h3>${html(v[5])}</h3><p>${html(v[7]||'Donor not recorded')} · ${html(v[6])}</p><details><summary>Collection, values & expiration</summary>${details(configs.Donors.headers,v,[3,4,8,9,10,12,11])}</details><details><summary>Restrictions, certificate IDs and original notes</summary>${details(configs.Donors.headers,v,[13,14])}</details>${editButton}</article>`;
 if(key==='Review')return `<article class="hq-card"><div class="hq-card-head">${chip(v[0])}${chip(v[4],v[4]==='Open'?'amber':'green')}</div><h3>${html(v[2])}</h3><p>${html(v[3])}</p>${v[5]?`<p><strong>Resolution:</strong> ${html(v[5])}</p>`:''}${editButton}</article>`;
 return '';
}
function documents(body){body.className='hq-grid';body.innerHTML=records('Documents').sort((a,b)=>(b.v[3]==='Editable master')-(a.v[3]==='Editable master')).map(({v,row})=>`<article class="hq-card hq-doc-card">${chip(v[3])}<h3>${html(v[2])}</h3><p>${html(v[5])}</p><div class="hq-actions">${safeURL(v[4])?`<a class="hq-btn hq-primary" href="${html(safeURL(v[4]))}" target="_blank" rel="noopener">Open document ↗</a>`:''}${btn('Edit link',`data-hq-doc-edit="${row}"`)}</div></article>`).join('')+`<div>${btn('Add document link','data-hq-doc-add')}</div>`;body.querySelectorAll('[data-hq-doc-edit]').forEach(b=>b.onclick=()=>edit('Documents',Number(b.dataset.hqDocEdit)));body.querySelector('[data-hq-doc-add]').onclick=()=>edit('Documents');}
async function loadSponsors(){
 const t=state.sponsorTab;
 if(state.sponsors[t]){if(state.tab==='Sponsors')sponsors(H().querySelector('[data-hq-body]'));return;}
 try{const limit=t.startsWith('Sponsors - ')?200:2000;const r=await getSheetValues(`'${t}'!A1:Z${limit}`,SPREADSHEET_ID);state.sponsors[t]=r;state.sponsorHeaders[t]=r[0]||[];if(state.tab==='Sponsors')sponsors(H().querySelector('[data-hq-body]'));}catch(e){status('Sponsor records could not load: '+error(e),true);}
}
function sponsors(body){
 const stabs=['Sponsors - Current','Sponsors - Prospective','Sponsor Contributions','Sponsor Contact Log'];
 body.innerHTML=`<div class="hq-warning">These are live club-wide sponsor records. Expired, pending and previous-year entries are retained. Amounts are not automatically attributed to this concert.</div><div class="hq-toolbar">${stabs.map(t=>btn(t.replace('Sponsors - ',''),`data-hq-sponsor-tab="${t}"`,state.sponsorTab===t?'hq-primary':'')).join('')}${btn('Open sponsorship module','data-hq-sponsor-module')}</div><div class="hq-toolbar"><input type="search" data-hq-sponsor-search aria-label="Search sponsor records" placeholder="Search sponsor, contact, notes…" value="${html(state.query)}"></div><div class="hq-grid" data-hq-sponsor-list></div>`;
 body.querySelectorAll('[data-hq-sponsor-tab]').forEach(b=>b.onclick=()=>{state.sponsorTab=b.dataset.hqSponsorTab;state.query='';sponsors(body);loadSponsors();});body.querySelector('[data-hq-sponsor-module]').onclick=()=>document.querySelector('.sidebar [data-module="sponsors"]')?.click();
 const paint=()=>{const hs=state.sponsorHeaders[state.sponsorTab]||[],rows=state.sponsors[state.sponsorTab];const list=body.querySelector('[data-hq-sponsor-list]');if(!rows){list.innerHTML='<div class="hq-empty">Loading shared sponsor records…</div>';return;}list.innerHTML=rows.slice(1).map((v,i)=>({v,row:i+2})).filter(r=>r.v.some(v=>String(v||'').trim())&&(!state.query||r.v.join(' ').toLowerCase().includes(state.query.toLowerCase()))).map(({v,row})=>`<article class="hq-card">${chip(state.sponsorTab)}<h3>${html(v[hs.indexOf('Company / Supporter')]||v[hs.indexOf('Contact Name')]||v[1]||v[0]||'Sponsor record')}</h3><details><summary>Contact details & sponsor record</summary>${details(hs,v,hs.map((h,i)=>h?i:-1).filter(i=>i>=0))}</details>${btn('Edit sponsor record',`data-hq-sponsor-edit="${row}"`)}</article>`).join('')||'<div class="hq-empty">No matching sponsor records.</div>';list.querySelectorAll('[data-hq-sponsor-edit]').forEach(b=>b.onclick=()=>editSponsor(Number(b.dataset.hqSponsorEdit)));};body.querySelector('[data-hq-sponsor-search]').oninput=e=>{state.query=e.target.value;paint();};paint();
}
async function writeValues(data,action){
 if(!navigator.onLine)throw Error('You are offline. Reconnect before saving; no shared record was changed.');
 if(!accessToken)throw Error('Your Google session expired. Sign in again before saving.');
 return writePortalSheetRequest(`https://sheets.googleapis.com/v4/spreadsheets/${MEMBERSHIP_SPREADSHEET_ID}/values:batchUpdate`,{method:'POST',headers:{Authorization:'Bearer '+accessToken,'Content-Type':'application/json'},body:JSON.stringify({valueInputOption:'RAW',data}),signal:AbortSignal.timeout(20000)},action,'BFT 2026 Event Command Center',data.length);
}
async function save(key,row,patch){
 if(state.busy)throw Error('Another save is in progress. Please wait.');state.busy=true;
 try{const n=configs[key].headers.length,original=state.data[key][row-1],live=await getSheetValues(range(key,row),MEMBERSHIP_SPREADSHEET_ID);if(!equal(live[0],original,n))throw Error('This record changed on another device. Refresh shared data and reopen it before saving.');const v=pad(original,n);Object.entries(patch).forEach(([i,val])=>v[Number(i)]=String(val));v[n-1]=new Date().toISOString();await writeValues([{range:range(key,row),values:[v]}],'Updated '+key);state.data[key][row-1]=v;state.notice='Saved to shared Google Sheets · '+new Date().toLocaleTimeString();}
 finally{state.busy=false;}
}
async function stationChange(change){
 if(state.busy)throw Error('Another save is in progress.');state.busy=true;
 try{const rs=records('Stations'),r=`'${sheet('Stations')}'!A1:J2000`,live=await getSheetValues(r,MEMBERSHIP_SPREADSHEET_ID);if(JSON.stringify(live)!==JSON.stringify(state.data.Stations))throw Error('Station assignments changed on another device. Refresh and try again.');const next=rs.map(s=>({row:s.row,v:pad(s.v,10)}));change(next);const names=next.flatMap(s=>s.v.slice(3,5)).filter(Boolean);if(new Set(names).size!==names.length)throw Error('A volunteer is already assigned. Use Move a volunteer to transfer them.');const updates=next.filter(s=>!equal(s.v,state.data.Stations[s.row-1],10));if(!updates.length)return;const stamp=new Date().toISOString();updates.forEach(s=>s.v[9]=stamp);await writeValues(updates.map(s=>({range:range('Stations',s.row),values:[s.v]})),'Updated volunteer assignment');updates.forEach(s=>state.data.Stations[s.row-1]=s.v);state.notice='Assignment saved across devices.';}
 finally{state.busy=false;}
}
async function assign(row,c,name){return stationChange(rs=>{rs.find(s=>s.row===row).v[c]=name;});}
function dialog(title){const d=document.createElement('dialog');d.className='hq-dialog bft-hq';d.setAttribute('aria-label',title);d.innerHTML=`<form><h2>${html(title)}</h2><div class="hq-form" data-fields></div><div class="hq-form-help">Changes save to shared records. The editable master document remains a reference snapshot; print a live packet for the latest records.</div><div class="hq-form-error" role="alert"></div><div class="hq-actions"><button type="submit" class="hq-primary">Save changes</button><button type="button" data-cancel>Cancel</button></div></form>`;document.body.append(d);d.addEventListener('close',()=>d.remove());d.querySelector('[data-cancel]').onclick=()=>d.close();d.showModal();return d;}
const optionSets={Category:['Live auction','Large raffle','Silent auction','Regular raffle'],'Check-in':['Expected','Here','Left'],'Payment status':['Unrecorded','Pending','Confirmed paid','Donation / no payment due'],'Release status':['Not released','Ready for pickup','Released'],'Review status':['Listed','Review','Confirmed duplicate','Resolved']};
function field(label,index,value,opts){const wide=/Contents|Notes|Issue|Resolution|Responsibility|Restrictions/i.test(label);const choices=opts||optionSets[label];return `<label class="${wide?'wide':''}">${html(label)}${choices?`<select name="f${index}">${[...new Set([String(value||''),...choices])].map(v=>`<option value="${html(v)}">${html(v||'Not recorded')}</option>`).join('')}</select>`:wide?`<textarea name="f${index}">${html(value)}</textarea>`:`<input name="f${index}" type="${label==='Phone'?'tel':/URL/.test(label)?'url':'text'}" ${label==='Phone'?'inputmode="tel"':''} value="${html(value)}">`}</label>`;}
function edit(key,row,mode){
 const hs=configs[key].headers,original=row?pad(state.data[key][row-1],hs.length):Array(hs.length).fill('');let indices=hs.map((_,i)=>i).filter(i=>i>1&&i<hs.length-1);
 if(key==='Stations')indices=indices.filter(i=>![3,4].includes(i));
 if(mode==='winner')indices=[10,11,12,13,14,15];
 if(key==='Review'&&row)indices=[2,3,4,5];
 const d=dialog((row?'Edit ':'Add ')+key+(mode?' · checkout':''));d.querySelector('[data-fields]').innerHTML=indices.map(i=>{let choices;if(hs[i]==='Status')choices=key==='Review'?['Open','Resolved']:['Planned','Ready','Active','Closed'];if(hs[i]==='Station ID')choices=records('Stations').map(r=>r.v[0]);return field(hs[i],i,original[i],choices);}).join('');
 d.querySelector('form').onsubmit=async e=>{e.preventDefault();const b=d.querySelector('[type=submit]');b.disabled=true;const patch={};indices.forEach(i=>patch[i]=d.querySelector(`[name=f${i}]`).value.trim());
 try{
  if(key==='Volunteers'){
   if(!patch[2])throw Error('Enter a volunteer name.');
   if(row&&patch[2]!==original[2])throw Error('Volunteer names cannot be renamed here because they identify station assignments. Keep the existing name; use Notes for corrections.');
   if(!row&&records(key).some(r=>r.v[2].toLowerCase()===patch[2].toLowerCase()))throw Error('That volunteer is already on the roster.');
  }
  if(key==='Prizes'&&patch[14]==='Released'&&!(patch[10]||original[10]))throw Error('Record the winner before releasing this prize.');
  if(key==='Prizes'&&patch[14]==='Released'&&!['Confirmed paid','Donation / no payment due'].includes(patch[13]||original[13]))throw Error('Record confirmed payment or no payment due before marking a prize released.');
  if(key==='Prizes'&&mode==='winner'&&patch[12]&&!/^\$?\d+(\.\d{1,2})?$/.test(patch[12]))throw Error('Enter a valid winning amount, such as 125.00.');
  if(key==='Documents'&&patch[4]&&!safeURL(patch[4]))throw Error('Use an HTTPS document link.');
  if(row)await save(key,row,patch);else await add(key,patch);
  d.close();render();
 }catch(err){d.querySelector('.hq-form-error').textContent=error(err);b.disabled=false;}
 };
}
async function add(key,patch){
 if(state.busy)throw Error('Another save is in progress.');state.busy=true;
 try{const n=configs[key].headers.length,v=Array(n).fill('');v[0]=key.slice(0,3).toUpperCase()+'-'+crypto.randomUUID();v[1]=EVENT;Object.entries(patch).forEach(([i,val])=>v[Number(i)]=val);v[n-1]=new Date().toISOString();if(!Object.values(patch).some(v=>v))throw Error('Enter record details before saving.');
 const url=`https://sheets.googleapis.com/v4/spreadsheets/${MEMBERSHIP_SPREADSHEET_ID}/values/${encodeURIComponent("'"+sheet(key)+"'!A:"+col(n))}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`;
 await writePortalSheetRequest(url,{method:'POST',headers:{Authorization:'Bearer '+accessToken,'Content-Type':'application/json'},body:JSON.stringify({values:[v]}),signal:AbortSignal.timeout(20000)},'Added event record',key,1);
 state.data[key]=await getSheetValues(`'${sheet(key)}'!A1:${col(n)}2000`,MEMBERSHIP_SPREADSHEET_ID);state.notice='New record saved to shared Google Sheets.';
 }finally{state.busy=false;}
}
function moveVolunteer(){
 const d=dialog('Move a volunteer'),ns=records('Volunteers').map(r=>r.v[2]).sort();d.querySelector('[data-fields]').innerHTML=`<label class="wide">Volunteer<select name="name"><option value="">Choose a name</option>${ns.map(n=>`<option>${html(n)}</option>`).join('')}</select></label><label>Destination station<select name="station">${records('Stations').map(s=>`<option value="${s.row}">${html(s.v[2])}</option>`).join('')}</select></label><label>Slot<select name="slot"><option value="3">Volunteer 1</option><option value="4">Volunteer 2</option></select></label><p class="hq-form-help wide">The previous assignment is cleared in the same save. If the destination slot is occupied, choose its empty slot or clear it first.</p>`;
 d.querySelector('form').onsubmit=async e=>{e.preventDefault();const b=d.querySelector('[type=submit]');b.disabled=true;try{const f=d.querySelector('form'),n=f.elements.name.value,row=Number(f.elements.station.value),c=Number(f.elements.slot.value);if(!n)throw Error('Choose a volunteer.');await stationChange(rs=>{const dest=rs.find(s=>s.row===row);if(dest.v[c]&&dest.v[c]!==n)throw Error('That slot is occupied. Choose an empty slot.');rs.forEach(s=>[3,4].forEach(i=>{if(s.v[i]===n)s.v[i]='';}));dest.v[c]=n;});d.close();render();}catch(err){d.querySelector('.hq-form-error').textContent=error(err);b.disabled=false;}};
}
async function editSponsor(row){
 const t=state.sponsorTab,hs=state.sponsorHeaders[t],rg=`'${t}'!A${row}:${col(hs.length)}${row}`;
 try{
 const meta=await fetchSheetRead(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}?includeGridData=true&ranges=${encodeURIComponent(rg)}&fields=sheets(data(rowData(values(userEnteredValue,dataValidation,formattedValue))))`);
 const cells=meta.sheets?.[0]?.data?.[0]?.rowData?.[0]?.values||[];
 const original=cells.map(c=>c.userEnteredValue?.formulaValue??c.userEnteredValue?.stringValue??c.userEnteredValue?.numberValue??c.userEnteredValue?.boolValue??'');
 const d=dialog('Edit '+t),indices=hs.map((h,i)=>h&&!cells[i]?.userEnteredValue?.formulaValue?i:-1).filter(i=>i>=0);
 d.querySelector('[data-fields]').innerHTML=indices.map(i=>field(hs[i],i,cells[i]?.formattedValue||original[i],cells[i]?.dataValidation?.condition?.type==='ONE_OF_LIST'?cells[i].dataValidation.condition.values.map(v=>v.userEnteredValue):undefined)).join('');
 d.querySelector('.hq-form-help').textContent='Computed fields remain managed by the sponsor sheet. Save changes only to the fields you edit.';
 d.querySelector('form').onsubmit=async e=>{e.preventDefault();const b=d.querySelector('[type=submit]');b.disabled=true;try{
 if(state.busy)throw Error('Another save is in progress.');state.busy=true;
 const live=await getSheetValues(rg,SPREADSHEET_ID,'FORMULA');if(!equal(live[0],original,hs.length))throw Error('Sponsor record changed. Refresh and reopen.');
 const updates=indices.filter(i=>d.querySelector(`[name=f${i}]`).value!==String(cells[i]?.formattedValue||original[i]||'')).map(i=>({range:`'${t}'!${col(i+1)}${row}`,values:[[d.querySelector(`[name=f${i}]`).value]]}));
 if(updates.length)await writePortalSheetRequest(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values:batchUpdate`,{method:'POST',headers:{Authorization:'Bearer '+accessToken,'Content-Type':'application/json'},body:JSON.stringify({valueInputOption:'RAW',data:updates}),signal:AbortSignal.timeout(20000)},'Updated sponsor record',t,updates.length);
 delete state.sponsors[t];d.close();render();await loadSponsors();status('Sponsor record saved.');
 }catch(err){d.querySelector('.hq-form-error').textContent=error(err);b.disabled=false;}finally{state.busy=false;}};
 }catch(e){status('Could not open sponsor editor: '+error(e),true);}
}
function download(name,data,mime){const a=document.createElement('a'),url=URL.createObjectURL(new Blob([data],{type:mime}));a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);}
function exportCSV(key){const cell=v=>'"'+String(v??'').replace(/^[=+\-@]/,"'$&").replace(/"/g,'""')+'"';const rows=[configs[key].headers,...matching(records(key)).map(r=>r.v)];download('BFT_2026_'+key+'.csv','\ufeff'+rows.map(r=>r.map(cell).join(',')).join('\r\n'),'text/csv;charset=utf-8');}
function printPacket(){let p=document.getElementById('hq-print');if(!p){p=document.createElement('section');p.id='hq-print';p.style.display='none';document.body.append(p);}p.innerHTML=`<h1>Bikes for Tykes · Live Event Packet</h1><p>October 11, 2026 · Elevation 27<br>Generated ${html(new Date().toLocaleString())}</p>`+Object.keys(configs).map(k=>`<h2>${html(k)}</h2>`+records(k).map(({v})=>`<section class="hq-print-record"><h3>${html(v[k==='Prizes'?4:k==='Stations'||k==='Volunteers'||k==='Review'||k==='Documents'?2:5])}</h3>${configs[k].headers.map((h,i)=>i>1&&v[i]?`<p><strong>${html(h)}:</strong> ${html(v[i])}</p>`:'').join('')}</section>`).join('')).join('');window.print();}
window.addEventListener('offline',()=>{if(H().classList.contains('active'))status('Offline. Loaded records remain visible; reconnect before saving.',true);});
})();
