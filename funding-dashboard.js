/* Funding records are read only after portal sign-in, directly from private Sheets. */
(() => {
  'use strict';
  const ZONE='America/New_York';
  const norm=v=>String(v??'').trim().toLowerCase().replace(/\s+/g,' ');
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const money=v=>v===''||v===undefined||v===null?'—':new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(Number(String(v).replace(/[$,]/g,''))||0);
  function instant(value) {
    if(value===''||value===null||value===undefined)return null;
    if(typeof value==='string'&&/T.*(?:Z|[+-]\d\d:\d\d)$/.test(value)){const t=Date.parse(value);return Number.isFinite(t)?t:null;}
    let wall;
    if(typeof value==='number') wall=Math.round((value-25569)*86400000);
    else {const m=String(value).match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?: (\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);if(!m)return null;wall=Date.UTC(+m[3],+m[1]-1,+m[2],+m[4]||0,+m[5]||0,+m[6]||0);}
    let result=wall;
    for(let i=0;i<3;i++){const p=Object.fromEntries(new Intl.DateTimeFormat('en-US',{timeZone:ZONE,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).formatToParts(result).map(x=>[x.type,x.value]));const local=Date.UTC(+p.year,+p.month-1,+p.day,+p.hour,+p.minute,+p.second);result+=wall-local;}
    return result;
  }
  const date=t=>t===null?'Not recorded':new Intl.DateTimeFormat('en-US',{timeZone:ZONE,month:'short',day:'numeric',year:'numeric',hour:'numeric',minute:'2-digit',second:'2-digit',timeZoneName:'short'}).format(t);
  function duration(start,end){if(start===null||end===null||end<start)return 'Not recorded';let sec=Math.floor((end-start)/1000);const d=Math.floor(sec/86400);sec%=86400;const h=Math.floor(sec/3600);sec%=3600;const m=Math.floor(sec/60);sec%=60;return [d?d+'d':'',h?h+'h':'',m?m+'m':'',sec||(!d&&!h&&!m)?sec+'s':''].filter(Boolean).join(' ');}
  const titles={PRESIDENT_REVIEW:'President review',TREASURER_REVIEW:'Treasurer review',BOARD_REVIEW:'Board voting',BOARD_VOTING:'Board voting',DELETED:'Deleted',FULFILLMENT_PENDING:'Awaiting fulfillment',PRESIDENT_DENIED:'Denied by President',BOARD_DENIED:'Denied by Board',CLOSED:'Closed',COMPLETED:'Completed',PAID:'Completed'};
  const actionTitles={PORTAL_EDITED:'Request edited in portal',PORTAL_DELETED:'Request deleted in portal',SUBMITTED:'Request submitted',PRESIDENT_APPROVED:'President approved',PRESIDENT_DENIED:'President denied',TREASURER_EMAIL_SENT:'Sent to Treasurer',FUNDS_VERIFIED:'Treasurer confirmed funds',FUNDS_UNAVAILABLE:'Returned to President — funds unavailable',OFFICER_BOARD_VOTES:'Two officer approvals counted as Yes votes',BOARD_VOTE_EMAILS_SENT:'Board voting opened',BOARD_APPROVED:'Board approved — majority reached',BOARD_DENIED:'Board denied',FULFILLMENT_RECORDED:'Fulfillment recorded'};
  function build(requests,audit,votes,roster=[],officers=[]) {
    const rh=roster[0]||[];const col=label=>rh.findIndex(h=>norm(h)===norm(label));
    const active=roster.slice(1).filter(r=>norm(r[col('Status')])==='active');
    const oh=officers[0]||[];const year=String(new Date().getFullYear());const oi=oh.findIndex((h,i)=>i&&String(h).startsWith(year)&&officers.slice(1).some(r=>String(r[i]||'').trim()));
    const boardNames=new Set(officers.slice(1).filter(r=>/^(president|vice president|srg at arms|sgt\.? at arms|sergeant at arms|treasurer|secretary|director)$/i.test(String(r[0]||'').trim())).map(r=>norm(r[oi])));
    return requests.slice(1).filter(r=>r[0]).map(r=>{
      const id=String(r[0]);const contact=[r[3],r[4]].filter(Boolean).join(' ');const recipient=String(r[34]||'').trim();const subject=recipient||contact;
      const test=/AUTHORIZED_TEST/.test(audit.filter(a=>a[1]===id).map(a=>a[3]).join(' '))||/\btest\b/i.test([r[3],r[4],r[5],r[11]].join(' '));
      const matches=active.filter(m=>norm([m[col('First Name')],m[col('Last Name')]].join(' '))===norm(subject)||(!recipient&&norm(m[col('Email')])===norm(r[6])&&norm(r[6])));
      const member=matches.length===1?matches[0]:null;
      const memberName=member?norm([member[col('First Name')],member[col('Last Name')]].join(' ')):'';
      const position=member?String(member[col('Director Position')]||'').trim():'';
      const onBoard=member&&(boardNames.has(memberName)||/^(president|vice president|srg at arms|sgt\.? at arms|sergeant at arms|treasurer|secretary|director)$/i.test(position));
      const category=test?'Test request':!roster.length?'Unverified':onBoard?'Board member':member?'Club member':'Community applicant';
      const events=audit.slice(1).filter(a=>a[1]===id&&a[2]!=='BOARD_VOTE').map(a=>({action:a[2],title:actionTitles[a[2]]||String(a[2]).replace(/_/g,' ').toLowerCase(),by:a[3],time:instant(a[4]),details:a[5]||''}));
      if(!events.some(e=>e.action==='SUBMITTED'))events.push({action:'SUBMITTED',title:'Request submitted',by:r[14]||contact,time:instant(r[1]),details:'Submission timestamp from the request record.'});
      const ballots=votes.slice(1).filter(v=>v[1]===id).map(v=>{
        const cast=!!String(v[6]||'').trim();const matching=audit.slice(1).filter(a=>a[1]===id&&a[2]==='BOARD_VOTE'&&norm(a[3])===norm(v[4])&&norm(a[5])===norm(v[6]));
        const time=cast?(matching.length===1?instant(matching[0][4]):instant(v[7])):null;
        const ballot={name:[v[3],v[2]].filter(Boolean).join(' '),role:v[5],choice:v[6]||'',time,locked:v[9]==='FINALIZED'||v[9]==='LOCKED',officer:v[8]==='OFFICER_APPROVAL'};
        if(cast)events.push({action:'VOTE',title:(ballot.officer?'Officer Yes vote counted':'Board vote: '+v[6]),by:ballot.name+' · '+ballot.role,time,details:ballot.officer?'Counted from officer approval; no separate ballot required.':''});
        return ballot;
      });
      events.sort((a,b)=>(a.time??Infinity)-(b.time??Infinity));
      const historicalTally=String(r[25]||'').match(/Final tally:\s*(\d+)\s*approve,\s*(\d+)\s*deny/i);
      const voteYes=ballots.length?ballots.filter(v=>norm(v.choice)==='approve').length:Number(historicalTally?.[1]||0);
      const voteNo=ballots.length?ballots.filter(v=>norm(v.choice)==='deny').length:Number(historicalTally?.[2]||0);
      const state=String(r[2]||'');const closed=instant(r[30])??(/DENIED/.test(state)?(events.filter(e=>/DENIED/.test(e.action)).at(-1)?.time??null):null);
      const closedState=state==='DELETED'||closed!==null||/^(CLOSED|COMPLETED|PAID|PRESIDENT_DENIED|BOARD_DENIED)$/.test(state);
      const submitted=instant(r[1]);const decisionAt=instant(r[24])??events.find(e=>/BOARD_(APPROVED|DENIED)/.test(e.action))?.time??null;
      return {sourceRow:requests.indexOf(r)+1,raw:Array.from({length:35},(_,i)=>r[i]??''),headers:requests[0]||[],id,contact,recipient,subject,category,test,state,stateLabel:titles[state]||state.replace(/_/g,' ').toLowerCase(),purpose:r[11]||'No summary recorded',organization:r[5],benefit:r[12],justification:r[13],email:r[6],phone:r[7],requested:r[9],approved:r[33],paid:r[29],submitted,closed,closedState,decisionAt,events,ballots,voteYes,voteNo,president:r[17],presidentAt:instant(r[18]),presidentNotes:r[19],treasurer:r[20],treasurerAt:instant(r[21]),treasurerNotes:r[22],board:r[23],boardComments:r[25],paymentMethod:r[26],paymentRef:r[27],paidAt:instant(r[28])};
    }).sort((a,b)=>a.id.localeCompare(b.id,undefined,{numeric:true,sensitivity:'base'}));
  }
  function editBatch(original,next,row,headers,actor,at,sheets,voteRows=[]) {
    if(String(original[0])!==String(next[0]))throw new Error('The reference number cannot be changed.');
    const changed=[];for(let i=1;i<35;i++)if(i!==31&&i!==32&&String(original[i]??'')!==String(next[i]??''))changed.push(i);
    if(!changed.length)return null;
    next[31]=at;next[32]=actor;
    const cell=value=>typeof value==='number'?{userEnteredValue:{numberValue:value}}:{userEnteredValue:{stringValue:String(value??'')}};
    const requests=[...changed,31,32].map(i=>({updateCells:{range:{sheetId:sheets.Requests,startRowIndex:row-1,endRowIndex:row,startColumnIndex:i,endColumnIndex:i+1},rows:[{values:[cell(next[i])]}],fields:'userEnteredValue'}}));
    const deleting=next[2]==='DELETED'&&original[2]!=='DELETED';
    if(deleting)voteRows.slice(1).forEach((v,i)=>{if(String(v[1])===String(original[0]))requests.push({updateCells:{range:{sheetId:sheets.Votes,startRowIndex:i+1,endRowIndex:i+2,startColumnIndex:9,endColumnIndex:10},rows:[{values:[cell('FINALIZED')]}],fields:'userEnteredValue'}});});
    const changes=changed.map(i=>({field:headers[i]||'Column '+(i+1),before:original[i]??'',after:next[i]??''}));
    requests.push({appendCells:{sheetId:sheets.Audit,rows:[{values:[at+'-portal',original[0],deleting?'PORTAL_DELETED':'PORTAL_EDITED',actor,at,JSON.stringify({changes})].map(cell)}],fields:'userEnteredValue'}});
    return {requests};
  }
  function requestYear(r){if(r.submitted===null)return 'Undated';return new Intl.DateTimeFormat('en-US',{timeZone:ZONE,year:'numeric'}).format(r.submitted);}
  function yearSummary(all,year){const rows=all.filter(r=>requestYear(r)===String(year)&&r.state!=='DELETED'&&!r.test);return {count:rows.length,open:rows.filter(r=>!r.closedState).length,paid:rows.reduce((sum,r)=>sum+(Number(String(r.paid||0).replace(/[$,]/g,''))||0),0)};}
  window.BSSCFundingModel={build,instant,duration,date,editBatch,requestYear,yearSummary};
  if(typeof document==='undefined')return;
  const BOOK='1plh3eoqhZknnLLknAXQSH16h_ZEpRywa-SmF7XmgsR4';let generation=0;
  function open(hostId='recordsWorkspace') {
    const host=document.getElementById(hostId);if(!host)return;
    const ticket=++generation;
    host.innerHTML='<section class="fr-dashboard"><nav class="fr-nav"><button type="button" data-fr-back>← '+(hostId==='financeWorkspace'?'Finance':'Club Records')+'</button><button type="button" data-fr-refresh>Refresh requests</button></nav><header class="fr-hero"><div><span class="fr-eyebrow">FINANCE · FUNDING REQUESTS</span><h2>Funding Requests</h2><p>Track assistance from the first request through final fulfillment.</p></div><span class="fr-private">Private club records</span></header><p class="fr-sync" data-fr-sync role="status" aria-live="polite">Loading funding records…</p><div data-fr-body></div></section>';
    const sync=host.querySelector('[data-fr-sync]'),body=host.querySelector('[data-fr-body]');
    const current=()=>ticket===generation&&host.contains(body);
    host.querySelector('[data-fr-back]').onclick=()=>{++generation;if(hostId==='financeWorkspace')showModule('finance');else recordsHome();};
    host.querySelector('[data-fr-refresh]').onclick=()=>open(hostId);
    (async()=>{
      if(!accessToken)throw new Error('Sign in with Google to load private funding records, then select Refresh requests.');
      const [requests,audit,votes]=await Promise.all([getSheetValues("'Requests'!A1:AI",BOOK,'UNFORMATTED_VALUE'),getSheetValues("'Audit'!A1:F",BOOK,'UNFORMATTED_VALUE'),getSheetValues("'Votes'!A1:J",BOOK,'UNFORMATTED_VALUE')]);
      const membership=await Promise.allSettled([getSheetValues("'"+new Date().getFullYear()+"'!A1:V855",MEMBERSHIP_SPREADSHEET_ID),getSheetValues("'Officer List'!A1:AI20",MEMBERSHIP_SPREADSHEET_ID)]);
      if(!current())return;
      const roster=membership[0].status==='fulfilled'?membership[0].value:[],officers=membership[1].status==='fulfilled'?membership[1].value:[];
      const all=build(requests,audit,votes,roster,officers);sync.classList.add('fr-ready');sync.textContent='Updated '+date(Date.now())+(membership.some(r=>r.status==='rejected')?' · Membership verification is incomplete.':' · Membership labels use the current roster.');
      render(all);
    })().catch(error=>{if(current()){sync.classList.add('fr-error');sync.textContent='Could not load funding records. '+error.message;body.innerHTML='<p class="fr-empty">No records are shown until the private source can be read. Your funding data has not been changed.</p>';}});
    function render(all) {
      let selectedYear=null;
      body.innerHTML='<div class="fr-years" data-fr-years></div><button type="button" class="fr-year-back" data-fr-year-back hidden>← All request years</button><div data-fr-year-detail hidden><div class="fr-stats" data-fr-stats></div><div class="fr-filters"><label>Find a person or request<input data-fr-search type="search" placeholder="Name, reference, or request summary"></label><label>Status<select data-fr-state><option value="">All statuses</option><option value="open">Open requests</option><option value="closed">Closed requests</option><option value="DELETED">Deleted requests</option><option value="FULFILLMENT_PENDING">Awaiting fulfillment</option><option value="PRESIDENT_REVIEW">President review</option><option value="TREASURER_REVIEW">Treasurer review</option><option value="board">Board voting</option></select></label><label>Applicant type<select data-fr-category><option value="">All types</option><option>Board member</option><option>Club member</option><option>Community applicant</option><option>Unverified</option><option>Test request</option></select></label><label class="fr-check"><input data-fr-tests type="checkbox" checked>Show test requests</label></div><p data-fr-count class="fr-count"></p><div class="fr-grid" data-fr-cards></div><dialog class="fr-dialog" data-fr-dialog></dialog></div>';
      const paint=()=>{
        const years=[...new Set(['2026','2027',...all.filter(r=>r.state!=='DELETED').map(requestYear)])].sort((a,b)=>a.localeCompare(b,undefined,{numeric:true}));
        const yearHost=body.querySelector('[data-fr-years]');yearHost.hidden=selectedYear!==null;
        body.querySelector('[data-fr-year-detail]').hidden=selectedYear===null;
        body.querySelector('[data-fr-year-back]').hidden=selectedYear===null;
        yearHost.innerHTML=years.map(year=>{const summary=yearSummary(all,year);return '<button type="button" class="fr-year-card" data-fr-year="'+esc(year)+'"><span>Funding requests</span><h3>'+esc(year==='Undated'?'Undated requests':year+' Requests')+'</h3><dl><div><dt>Requests</dt><dd>'+summary.count+'</dd></div><div><dt>Open requests</dt><dd>'+summary.open+'</dd></div><div><dt>Total paid</dt><dd>'+money(summary.paid)+'</dd></div></dl><strong>View requests →</strong></button>';}).join('');
        yearHost.querySelectorAll('[data-fr-year]').forEach(button=>button.onclick=()=>{selectedYear=button.dataset.frYear;paint();});
        body.querySelector('[data-fr-year-back]').onclick=()=>{selectedYear=null;paint();};
        const includeTests=body.querySelector('[data-fr-tests]').checked;
        const selectedState=body.querySelector('[data-fr-state]').value;const pool=all.filter(r=>requestYear(r)===selectedYear&&(includeTests||!r.test)&&(selectedState==='DELETED'?r.state==='DELETED':r.state!=='DELETED'));const q=norm(body.querySelector('[data-fr-search]').value),state=body.querySelector('[data-fr-state]').value,category=body.querySelector('[data-fr-category]').value;
        const rows=pool.filter(r=>(!q||norm([r.subject,r.contact,r.id,r.purpose].join(' ')).includes(q))&&(!category||r.category===category)&&(!state||(state==='open'?!r.closedState:state==='closed'?r.closedState:state==='board'?/^BOARD_(VOTING|REVIEW)$/.test(r.state):r.state===state)));
        const closed=pool.filter(r=>r.closed!==null&&r.submitted!==null);const avg=closed.length?closed.reduce((s,r)=>s+r.closed-r.submitted,0)/closed.length:null;
        body.querySelector('[data-fr-stats]').innerHTML=[['Requests',pool.length],['In progress',pool.filter(r=>!r.closedState).length],['Awaiting fulfillment',pool.filter(r=>r.state==='FULFILLMENT_PENDING').length],['Average completion',avg===null?'—':duration(0,avg)]].map(([label,value])=>'<div><span>'+label+'</span><strong>'+esc(value)+'</strong></div>').join('');
        body.querySelector('[data-fr-count]').textContent=rows.length+' of '+pool.length+' requests · '+pool.filter(r=>r.test).length+' marked as tests';
        body.querySelector('[data-fr-cards]').innerHTML=rows.map(card).join('')||'<p class="fr-empty">'+(all.length?'No requests match these filters.':'No funding requests have been submitted yet.')+'</p>';
        body.querySelectorAll('[data-fr-open]').forEach(b=>b.onclick=()=>details(all.find(r=>r.id===b.dataset.frOpen),b));
      };
      body.querySelector('[data-fr-search]').oninput=paint;body.querySelectorAll('select,input[type="checkbox"]').forEach(e=>e.onchange=paint);paint();
    }
    function card(r){return '<article class="fr-card"><div class="fr-card-top"><span class="fr-badge '+(r.test?'fr-test':r.category==='Club member'?'fr-club':r.category==='Community applicant'?'fr-community':'')+'">'+esc(r.category)+'</span><span class="fr-badge '+(r.closedState?'fr-closed':'fr-pending')+'">'+esc(r.stateLabel)+'</span></div><p class="fr-ref">'+esc(r.id)+'</p><h3>'+esc(r.subject)+'</h3>'+(!r.recipient?'<p class="fr-muted">Recipient name not separately recorded</p>':'')+'<p class="fr-summary">'+esc(r.purpose)+'</p><div class="fr-amounts"><div><span>Requested</span><strong>'+money(r.requested)+'</strong></div><div><span>President approved</span><strong>'+money(r.approved)+'</strong></div></div><dl class="fr-meta"><dt>Submitted</dt><dd>'+date(r.submitted)+'</dd><dt>'+ (r.closedState?'Total duration':'Elapsed so far')+'</dt><dd>'+duration(r.submitted,r.closedState?r.closed:Date.now())+'</dd><dt>Board votes</dt><dd>'+r.voteYes+' Yes · '+r.voteNo+' No</dd></dl><button class="fr-primary" type="button" data-fr-open="'+esc(r.id)+'">View</button></article>';}
    function details(r,opener){
      const dialog=body.querySelector('[data-fr-dialog]');
      const detail=(label,value)=>'<dt>'+esc(label)+'</dt><dd>'+esc(value||'Not recorded')+'</dd>';
      dialog.innerHTML='<header><div><span class="fr-eyebrow">'+esc(r.id)+'</span><h2>'+esc(r.subject)+'</h2><p>'+esc(r.category)+' · '+esc(r.stateLabel)+'</p></div><div class="fr-detail-actions"><button type="button" data-fr-edit>Edit</button><button type="button" data-fr-delete class="fr-danger">Delete</button><button type="button" data-fr-close aria-label="Close request details">Close ×</button></div></header><section class="fr-detail-summary"><h3>Request summary</h3><p>'+esc(r.purpose)+'</p><dl>'+detail('Assistance is for',r.recipient||'Not separately recorded on this older request')+detail('Submitted by / contact',r.contact)+detail('Organization',r.organization)+detail('Email',r.email)+detail('Phone',r.phone)+detail('Who benefits',r.benefit)+detail('Reason for support',r.justification)+detail('Requested amount',money(r.requested))+detail('President-approved amount',money(r.approved))+detail('President decision',r.president)+detail('President notes',r.presidentNotes)+detail('Treasurer funds available',r.treasurer)+detail('Treasurer notes',r.treasurerNotes)+detail('Board outcome',r.boardComments||r.board)+detail('Fulfillment',r.paymentMethod?[money(r.paid),r.paymentMethod,r.paymentRef,date(r.paidAt)].filter(Boolean).join(' · '):'Not yet recorded')+'</dl></section><section><h3>Timing</h3><div class="fr-timing"><div><span>Submitted</span><strong>'+date(r.submitted)+'</strong></div><div><span>Board decision</span><strong>'+date(r.decisionAt)+'</strong></div><div><span>Time to Board decision</span><strong>'+duration(r.submitted,r.decisionAt)+'</strong></div><div><span>Closed</span><strong>'+(r.closedState?date(r.closed):'Still open')+'</strong></div><div><span>'+(r.closedState?'Total completion time':'Elapsed so far')+'</span><strong>'+duration(r.submitted,r.closedState?r.closed:Date.now())+'</strong></div></div></section><section><h3>Board responses</h3><p class="fr-muted">Officer approvals count as Yes votes. A majority closes voting; remaining responses are no longer required.</p><div class="fr-ballots">'+(r.ballots.map(v=>'<div><strong>'+esc(v.name)+'</strong><span>'+esc(v.role)+'</span><b>'+esc(v.choice||((v.locked||r.board)?'Not needed — voting closed':'Awaiting response'))+'</b><small>'+(v.choice?date(v.time):'No vote cast')+(v.officer?' · Officer approval':'')+'</small></div>').join('')||(r.boardComments?'<p>'+esc(r.boardComments)+'</p><p>Individual voter details not recorded.</p>':'<p>Board voting has not started.</p>'))+'</div></section><section><h3>Audit trail</h3><p class="fr-muted">All times Eastern. Events are ordered by their recorded timestamp.</p><ol class="fr-timeline">'+r.events.map((event,i)=>'<li><div class="fr-event-head"><strong>'+esc(event.title)+'</strong><time>'+date(event.time)+'</time></div><p>'+esc(event.by)+'</p>'+(event.details?'<p class="fr-event-notes">'+esc(event.details)+'</p>':'')+'<small>'+ (i?'Since previous action: '+duration(r.events[i-1].time,event.time):'Start of request')+'</small></li>').join('')+'</ol></section>';
      dialog.querySelector('[data-fr-close]').onclick=()=>dialog.close();
      dialog.querySelector('[data-fr-edit]').onclick=()=>edit(r,opener);
      dialog.querySelector('[data-fr-delete]').hidden=r.state==='DELETED';
      dialog.querySelector('[data-fr-delete]').onclick=()=>remove(r,opener);
      dialog.onclose=()=>{if(opener.isConnected)opener.focus();};if(!dialog.open)dialog.showModal();
    }
    async function save(r,next) {
      if(!accessToken)throw new Error('Sign in with Google before saving.');
      const range="'Requests'!A"+r.sourceRow+':AI'+r.sourceRow;
      const live=(await getSheetValues(range,BOOK,'UNFORMATTED_VALUE'))[0]||[];
      const same=(a,b)=>JSON.stringify(Array.from({length:35},(_,i)=>String(a[i]??'')))===JSON.stringify(Array.from({length:35},(_,i)=>String(b[i]??'')));
      if(!same(live,r.raw))throw new Error('This request changed since you opened it. Close this window and refresh requests before editing again.');
      const response=await fetch('https://sheets.googleapis.com/v4/spreadsheets/'+BOOK+'?fields=sheets.properties',{headers:{Authorization:'Bearer '+accessToken}});
      if(!response.ok)throw new Error('Could not verify the funding workbook.');
      const sheetIds=Object.fromEntries((await response.json()).sheets.map(s=>[s.properties.title,s.properties.sheetId]));
      if(['Requests','Audit','Votes'].some(name=>!Number.isInteger(sheetIds[name])))throw new Error('The funding workbook is missing a required sheet.');
      const deleting=next[2]==='DELETED'&&r.raw[2]!=='DELETED';
      const ballots=deleting?await getSheetValues("'Votes'!A1:J",BOOK,'UNFORMATTED_VALUE'):[];
      const batch=editBatch(r.raw,next,r.sourceRow,r.headers,await getPortalAuditActor(),new Date().toISOString(),sheetIds,ballots);
      if(!batch)return;
      await writePortalSheetRequest('https://sheets.googleapis.com/v4/spreadsheets/'+BOOK+':batchUpdate',{method:'POST',headers:{Authorization:'Bearer '+accessToken,'Content-Type':'application/json'},body:JSON.stringify(batch)},deleting?'Deleted funding request':'Edited funding request',r.id,1);
    }
    function edit(r,opener) {
      const dialog=body.querySelector('[data-fr-dialog]');
      const long=new Set([11,12,13,19,22,25]),amounts=new Set([9,29,33]);
      const stages=['PRESIDENT_REVIEW','TREASURER_REVIEW','BOARD_REVIEW','FULFILLMENT_PENDING','FULFILLED','PRESIDENT_DENIED','BOARD_DENIED','DELETED'];
      const fields=Array.from({length:35},(_,i)=>i).filter(i=>![0,31,32].includes(i));
      const input=i=>{
        const label=r.headers[i]||'Field '+(i+1),value=String(r.raw[i]??'');
        let control;
        if(i===2)control='<select data-fr-field="2">'+[...new Set([...stages,value])].filter(Boolean).map(v=>'<option value="'+esc(v)+'"'+(value===v?' selected':'')+'>'+esc(titles[v]||v.replace(/_/g,' '))+'</option>').join('')+'</select>';
        else if(long.has(i))control='<textarea data-fr-field="'+i+'" rows="3" maxlength="10000">'+esc(value)+'</textarea>';
        else control='<input data-fr-field="'+i+'" type="'+(amounts.has(i)?'number':i===6?'email':'text')+'"'+(amounts.has(i)?' min="0" step="0.01"':'')+' value="'+esc(value)+'">';
        return '<label class="'+(long.has(i)?'fr-editor-wide':'')+'">'+esc(label)+control+'</label>';
      };
      const requestFields=[34,3,4,5,6,7,8,9,10,11,12,13,14,15];
      const reviewFields=[2,33,17,18,19,20,21,22,23,24,25];
      const otherFields=fields.filter(i=>!requestFields.includes(i)&&!reviewFields.includes(i));
      dialog.innerHTML='<header><div><span class="fr-eyebrow">'+esc(r.id)+'</span><h2>Edit request</h2></div><button type="button" data-fr-cancel>Cancel</button></header><form class="fr-editor"><p>Update the request record here. Saving does not send approval emails, cast votes, or send a payment. The reference number and original audit trail are kept.</p><h3>Person &amp; request</h3><div class="fr-editor-grid">'+requestFields.map(input).join('')+'</div><details><summary>Reviews, decisions &amp; status</summary><div class="fr-editor-grid">'+reviewFields.map(input).join('')+'</div></details><details><summary>Payment, completion &amp; other dates</summary><p>For a date and time, use ISO format, for example 2026-10-23T19:00:00Z.</p><div class="fr-editor-grid">'+otherFields.map(input).join('')+'</div></details><p data-fr-save-status role="status" aria-live="polite"></p><footer><button type="button" data-fr-cancel-bottom>Cancel</button><button type="submit" class="fr-save">Save changes</button></footer></form>';
      const cancel=()=>details(r,opener);dialog.querySelector('[data-fr-cancel]').onclick=cancel;dialog.querySelector('[data-fr-cancel-bottom]').onclick=cancel;
      let busy=false;dialog.oncancel=event=>{if(busy)event.preventDefault();};
      dialog.querySelector('form').onsubmit=async event=>{
        event.preventDefault();if(busy)return;
        const next=r.raw.slice();dialog.querySelectorAll('[data-fr-field]').forEach(input=>{const i=Number(input.dataset.frField);next[i]=amounts.has(i)&&input.value!==''?Number(input.value):input.value;});
        if(!next[2])return;
        const button=dialog.querySelector('.fr-save'),status=dialog.querySelector('[data-fr-save-status]');busy=true;
        dialog.querySelectorAll('button').forEach(b=>b.disabled=true);button.textContent='Saving…';button.style.background='#9a6700';status.textContent='Saving your changes…';
        try{await save(r,next);button.style.background='#237a38';button.textContent='Saved';dialog.close();open(hostId);}
        catch(error){status.textContent='Could not save: '+error.message;button.textContent='Save changes';button.style.background='';dialog.querySelectorAll('button').forEach(b=>b.disabled=false);}
        finally{busy=false;}
      };
    }
    async function remove(r,opener) {
      if(!confirm('Delete '+r.id+'? It will move to Deleted requests. The audit trail is retained and its voting links will close.'))return;
      const dialog=body.querySelector('[data-fr-dialog]');let status=document.createElement('p');status.className='fr-delete-status';status.setAttribute('role','status');status.textContent='Deleting request…';dialog.append(status);
      dialog.querySelectorAll('button').forEach(b=>b.disabled=true);dialog.oncancel=event=>event.preventDefault();
      try{const next=r.raw.slice();next[2]='DELETED';await save(r,next);dialog.close();open(hostId);}
      catch(error){status.textContent='Could not delete: '+error.message;dialog.querySelectorAll('button').forEach(b=>b.disabled=false);dialog.oncancel=null;}
    }

  }
  window.openFundingDashboard=open;
  const previous=renderRecordCollection;
  renderRecordCollection=function(){if(recordsCategory==='Fund Requests'){open();return;}return previous.apply(this,arguments);};
  document.addEventListener('click',event=>{const button=event.target.closest('button');if(button?.closest('#financeWorkspace [data-record-shortcuts]')&&norm(button.textContent)==='fund requests'){event.preventDefault();event.stopImmediatePropagation();open('financeWorkspace');}},true);
})();
