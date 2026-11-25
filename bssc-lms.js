/* Authenticated Membership > BSSC LMS. Learner data is read from the private membership workbook. */
window.BSSCLms=(()=>{
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const truth=v=>v===true||String(v).toLowerCase()==='true';
 const easternDue=day=>{if(!day)return '';const offset=new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',timeZoneName:'shortOffset'}).formatToParts(new Date(day+'T23:59:59Z')).find(p=>p.type==='timeZoneName').value;const hours=Number(offset.replace('GMT',''));return day+'T23:59:59'+(hours<0?'-':'+')+String(Math.abs(hours)).padStart(2,'0')+':00'};
 const date=v=>!v?'—':isNaN(new Date(v).getTime())?'Invalid date':new Date(v).toLocaleString('en-US',{timeZone:'America/New_York',month:'short',day:'numeric',year:'numeric',hour:'numeric',minute:'2-digit'});
 const sections=['Our roots and purpose','Colors, conduct and reputation','Board and leadership','Shared standards and reporting','Membership and participation','Rides and event responsibilities','Fundraising and club resources'];
 const tables=['LMS Enrollments','LMS Progress','LMS Attempts','LMS Completions','LMS Settings','LMS Accounts','LMS Outbox','LMS Attendance'];
 let model=null,selected=null,request=0,query='',filter='all',mode='Official',view='learners';
 function objects(rows,title){if(!rows.length)throw Error(title+' has no column headings.');const heads=rows[0];if(!heads.includes(title==='LMS Attendance'?'Attendance ID':title==='LMS Accounts'?'Account UID':title==='LMS Outbox'?'Event Key':title==='LMS Settings'?'Setting':title==='LMS Attempts'?'Attempt ID':title==='LMS Completions'?'Certificate ID':'Enrollment ID'))throw Error(title+' headings need review.');return rows.slice(1).filter(row=>row.some(v=>String(v).trim())).map(row=>Object.fromEntries(heads.map((h,i)=>[h,row[i]??''])))}
 function learner(e,progress,attempts,completions,attendance=[]){
  const rows=progress.filter(p=>p['Enrollment ID']===e['Enrollment ID']);const bySection=new Map();rows.forEach(p=>{const n=Number(p.Section);if(!Number.isInteger(n)||n<1||n>7)throw Error('Invalid section record for '+e['Full Name']+'.');if(n>=1&&n<=7){if(bySection.has(n))throw Error('Duplicate section records for '+e['Full Name']+'. Records need review.');bySection.set(n,p)}});
  const passed=[...bySection.values()].filter(p=>truth(p['Quiz Passed'])).length,allPassed=passed===7;
  const completion=completions.find(c=>c['Enrollment ID']===e['Enrollment ID']);
  const validCompletion=completion&&completion['Course Version']===e['Course Version']&&(e['Record Type']!=='Official'||completion['Verification Status']==='Verified'&&completion['Record Type']==='Official');
  const attendanceRows=attendance.filter(a=>a['Enrollment ID']===e['Enrollment ID']&&a['Course Version']===e['Course Version']&&['Attestation pending','Signed'].includes(a.Status));
  if(attendanceRows.length>1)throw Error('Duplicate attendance needs review for '+e['Full Name']+'.');
  const verified=attendance.find(a=>a['Enrollment ID']===e['Enrollment ID']&&a['Course Version']===e['Course Version']&&a.Status==='Leadership verified'&&a['Recorded By']&&a['Recorded At']&&a['Full Name']===e['Full Name']&&String(a.Email).toLowerCase()===String(e.Email).toLowerCase()&&e['Record Type']==='Official');
  const a=verified||attendanceRows[0],inPerson=Boolean(verified)||Boolean(a&&a['Recorded By']&&a['Recorded At']&&a['Invited At']&&String(a.Email).toLowerCase()===String(e.Email).toLowerCase()&&a['Full Name']===e['Full Name']&&e['Record Type']==='Official');
  const signedInPerson=inPerson&&a.Status==='Signed'&&a['Attested At']&&a.Attestation&&validCompletion&&completion['Certificate ID']===a['Certificate ID']&&completion['Completed At']===a['Attested At']&&completion.Attestation===a.Attestation;
  const next=sections.map((title,i)=>({title,n:i+1,p:bySection.get(i+1)})).find(x=>!truth(x.p?.['Quiz Passed']));
  let status=verified?'Complete':inPerson?(signedInPerson?'Complete':'Attestation pending'):validCompletion&&allPassed?'Complete':allPassed?'Attestation pending':next&&truth(next.p?.['Rewatch Required'])?'Rewatch required':e['First Started At']||rows.some(p=>Number(p['Watched Seconds'])>0)?'In progress':'Not started';
  const overdue=e['Due At']&&!isNaN(Date.parse(e['Due At']))&&Date.parse(e['Due At'])<Date.now()&&status!=='Complete';
  const remaining=sections.filter((_,i)=>!truth(bySection.get(i+1)?.['Quiz Passed']));
  const action=verified?'Verified by club leadership':inPerson?(signedInPerson?'Complete':'Submit in-person attestation'):validCompletion&&allPassed?'Complete':allPassed?'Submit final attestation':truth(next?.p?.['Rewatch Required'])?'Rewatch section '+next.n:truth(next?.p?.['Video Complete'])?'Take section '+next.n+' quiz':'Watch section '+next.n;
  return {...e,rows,bySection,passed,completion,status,inPerson,attendance:a,verified,signedInPerson,overdue,remaining,action,attempts:attempts.filter(a=>a['Enrollment ID']===e['Enrollment ID']).sort((a,b)=>Date.parse(b['Submitted At'])-Date.parse(a['Submitted At']))};
 }
 function pastFiveYears(value, now=new Date()){
  const parts=new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',year:'numeric',month:'numeric',day:'numeric'}).formatToParts(now);
  const today=Object.fromEntries(parts.map(part=>[part.type,Number(part.value)]));
  const date=String(value||'').trim();
  const us=date.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  const iso=date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if(!us&&!iso)return false;
  const [year,month,day]=(iso?iso.slice(1):[us[3],us[1],us[2]]).map(Number);
  const parsed=new Date(Date.UTC(year,month-1,day));
  if(parsed.getUTCFullYear()!==year||parsed.getUTCMonth()+1!==month||parsed.getUTCDate()!==day)return false;
  return year*10000+month*100+day<(today.year-5)*10000+today.month*100+today.day;
 }
 function rosterMatch(member,name,email){
  return member.name.toLowerCase()===String(name||'').trim().toLowerCase()&&
    (!member.email||member.email===String(email||'').trim().toLowerCase());
 }
 function manualTrainingExemptions(settings){
  const value=settings.find(row=>row.Setting==='Training exemptions')?.Value;
  return new Set(value?JSON.parse(value).map(name=>name.trim().toLowerCase()):[]);
 }
 async function readTrainingRoster(){
  const settings=await getSheetRanges(["'LMS Settings'!A1:D100"],MEMBERSHIP_SPREADSHEET_ID);
  const manual=manualTrainingExemptions(objects(settings[0],'LMS Settings'));
  const year=Number(new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',year:'numeric'}).format(new Date()));
  const ranges=[year,year+1].flatMap(y=>["'"+y+"'!A1:I2000","'"+y+"'!V1:V2000"]);
  const raw=await getSheetRanges(ranges,MEMBERSHIP_SPREADSHEET_ID);
  const byName=new Map();
  for(let j=0;j<raw.length;j+=2){
   const names=raw[j],emails=raw[j+1];
   if(names[0]?.slice(0,3).join('|')!=='Status|Last Name|First Name'||names[0]?.[8]!=='Start Date'||emails[0]?.[0]!=='Email')throw Error('Roster headings need review.');
   if(names.length>=2000)throw Error('The training roster range needs expansion.');
   names.slice(1).forEach((row,i)=>{
    const status=String(row[0]).trim().toLowerCase();
    if(!['active','prospect','pending'].includes(status))return;
    const name=[row[2],row[1]].filter(Boolean).join(' ').trim();
    if(!name)return;
    const address=String(emails[i+1]?.[0]||'').trim().toLowerCase();
    const email=/^\S+@\S+\.\S+$/.test(address)?address:'';
    const key=name.toLowerCase(),old=byName.get(key);
    if(!old)byName.set(key,{name,email,status,exempt:manual.has(key)||pastFiveYears(row[8])});
    else if(email&&old.email&&email!==old.email)old.conflict=true;
    else if(email&&!old.email)old.email=email;
   });
  }
  return [...byName.values()].sort((a,b)=>a.name.localeCompare(b.name));
 }
 function summaryCard(label,value,context,names,tone='',details=''){
  return `<div class="lms-summary-card ${tone}"><span>${esc(label)}</span><strong>${esc(value)}</strong><span>${esc(context)}</span>${names.length?`<button type="button" class="lms-name lms-summary-names" aria-expanded="false">View names</button><ul class="lms-summary-list">${names.map(name=>'<li>'+esc(name)+'</li>').join('')}</ul>`:''}${details}</div>`;
 }
 function trainingSummary(enrollments){
  const key=name=>String(name||'').trim().toLowerCase();
  const assigned=new Map();
  for(const e of enrollments){
   const name=key(e['Full Name']);
   if(!name)continue;
   const address=String(e.Email||'').trim().toLowerCase();
   const member=name+'|'+address;
   const prior=assigned.get(member);
   if(!prior||e.status==='Complete'||prior.status!=='Complete'&&String(e['Assigned At'])>String(prior['Assigned At']))assigned.set(member,e);
  }
  const records=[...assigned.values()].sort((a,b)=>String(a['Full Name']).localeCompare(String(b['Full Name'])));
  const byStatus=status=>records.filter(e=>e.status===status).map(e=>e['Full Name']);
  const roster=model.roster?.filter(m=>!m.exempt||m.conflict);
  const rosterAssigned=roster?.filter(m=>records.some(e=>key(e['Full Name'])===key(m.name)&&(!m.email||m.email===String(e.Email||'').trim().toLowerCase())));
  const needsAssignment=roster?.filter(m=>!rosterAssigned.includes(m)).map(m=>m.name);
  const exemptNames=JSON.parse(model.settings.find(row=>row.Setting==='Training exemptions')?.Value||'[]');
  const exemptionList=exemptNames.length?`<details><summary>Exempt from training (${exemptNames.length})</summary><ul>${exemptNames.map(name=>'<li>'+esc(name)+'</li>').join('')}</ul></details>`:'';
  const complete=byStatus('Complete');
  const cards=[
   summaryCard('Assigned',records.length,mode==='Practice'?'Practice records':roster?`${rosterAssigned.length} of ${roster.length} eligible roster members assigned`:'Eligible roster unavailable',records.map(e=>e['Full Name'])),
   ...(mode==='Official'?[summaryCard('Needs assignment',needsAssignment?.length??'—',roster?`of ${roster.length} eligible roster members`:'Eligible roster unavailable',needsAssignment||[],'lms-summary-attention',exemptionList)]:[]),
   summaryCard('Complete',complete.length,`of ${records.length} assigned · ${records.length?Math.round(100*complete.length/records.length):0}%`,complete,'lms-summary-complete'),
   ...['In progress','Attestation pending','Not started','Rewatch required'].map(status=>{
    const names=byStatus(status);
    return summaryCard(status,names.length,`of ${records.length} assigned`,names,status==='Attestation pending'?'lms-summary-attention':'');
   })
  ];
  return `<section class="lms-summary" aria-label="Training summary"><div class="lms-metrics">${cards.join('')}</div></section>`;
 }
 function render(){if(!model)return;const target=document.getElementById('membershipContent');const settings=Object.fromEntries(model.settings.map(x=>[x.Setting,x.Value]));const connected=settings['Connection Status']==='Connected'&&/^https:\/\//.test(settings['Learner Service URL']||'');
 const all=model.learners.filter(e=>!truth(e.Archived)&&String(e['Record Type']||'Official')===mode&&(mode!=='Official'||!model.roster?.some(m=>m.exempt&&!m.conflict&&rosterMatch(m,e['Full Name'],e.Email)))),visible=all.filter(e=>(!query||(e['Full Name']+' '+e.Email+' '+e['Member Key']).toLowerCase().includes(query.toLowerCase()))&&(filter==='all'||filter==='overdue'?filter==='all'||e.overdue:e.status===filter));
 target.innerHTML=`<div class="bssc-lms"><header class="lms-header"><h2>Foundations training</h2><div class="lms-toolbar"><nav class="lms-view-tabs" aria-label="LMS views"><button data-lms-view="learners" aria-pressed="${view==='learners'}" class="membership-tab ${view==='learners'?'active':''}">Member progress</button><button data-lms-view="attestations" aria-pressed="${view==='attestations'}" class="membership-tab ${view==='attestations'?'active':''}">Send attestations</button><button data-lms-view="history" aria-pressed="${view==='history'}" class="membership-tab ${view==='history'?'active':''}">History</button></nav><div class="lms-toolbar-actions"><button type="button" class="lms-tool lms-tool-primary" data-lms-enroll>Enrollment</button><a class="lms-tool" href="training/preview.html" target="_blank" rel="noopener">Preview training</a><details class="lms-tools-menu"><summary class="lms-tool">Advanced options</summary><div class="lms-tools-panel"><button type="button" data-lms-verified>Record verified completion</button><button type="button" data-lms-export>Export visible records</button></div></details></div></div></header>${!connected?'<div class="lms-connection" role="status"><strong>Record storage is ready. Automatic learner tracking is not connected yet.</strong><span>The current test drive saves progress in the learner’s browser. It does not populate official records here. Enrollment records can be prepared now.</span></div>':''}${view==='learners'?trainingSummary(all.filter(e=>!settings['Course Version']||e['Course Version']===settings['Course Version'])):''}<section class="workspace-card"><div class="lms-filters" ${view==='attestations'?'hidden':''}><label>Find member<input data-lms-search value="${esc(query)}" placeholder="Name, email, or member ID"></label><label ${view==='history'?'hidden':''}>Status<select data-lms-status>${['all','Not started','In progress','Rewatch required','Attestation pending','Complete','overdue'].map(v=>'<option value="'+v+'"'+(filter===v?' selected':'')+'>'+({all:'All statuses',overdue:'Overdue'}[v]||v)+'</option>').join('')}</select></label><label>Records<select data-lms-mode><option${mode==='Official'?' selected':''}>Official</option><option${mode==='Practice'?' selected':''}>Practice</option></select></label></div><p class="lms-small" ${view==='attestations'?'hidden':''}>Times shown in Eastern Time. Progress means section quizzes passed; video watch progress is shown inside each learner record.</p><div data-lms-console></div><div data-lms-history></div><div class="lms-table-wrap" data-lms-list><table class="data-table"><thead><tr><th>Member</th><th>Status</th><th>Course progress</th><th>Next step</th><th>Last activity</th><th>Due</th></tr></thead><tbody>${visible.map(e=>`<tr><td><button class="lms-name" data-lms-open="${esc(e['Enrollment ID'])}">${esc(e['Full Name'])}</button><small>${esc(e.Email)}</small><small>${esc(e['Membership Status'])}</small></td><td><span class="lms-tag ${e.status==='Complete'?'complete':e.status==='Rewatch required'?'rewatch':''}">${esc(e.status)}</span>${e.overdue?'<small class="lms-overdue">Overdue</small>':''}</td><td><strong>${e.inPerson?(e.status==='Complete'?'100':'Attendance recorded'):Math.round(e.passed/7*100)}${e.inPerson&&e.status!=='Complete'?'':'%'}</strong><progress max="7" value="${e.inPerson?(e.status==='Complete'?7:0):e.passed}"></progress><small>${e.inPerson?'In person · '+(e.verified?'verified by club leadership':e.status==='Complete'?'attestation signed':'attestation pending'):e.passed+' of 7 sections passed'}</small></td><td>${esc(e.action)}</td><td>${date(e['Last Active At'])}</td><td>${date(e['Due At'])}</td></tr>`).join('')||'<tr><td colspan="6">'+(all.length?'No members match these filters.':'No '+esc(mode.toLowerCase())+' enrollments yet. Normal enrollment starts from the member roster.')+'</td></tr>'}</tbody></table></div></section><div data-lms-detail></div></div>`;
 target.querySelectorAll('.lms-summary-names').forEach(button=>{
  button.onclick=()=>button.setAttribute('aria-expanded',String(button.getAttribute('aria-expanded')!=='true'));
  button.onkeydown=event=>{if(event.key==='Escape')button.setAttribute('aria-expanded','false')};
 });
 target.querySelector('[data-lms-verified]').onclick=recordVerifiedCompletion;target.querySelector('[data-lms-enroll]').onclick=enroll;target.querySelectorAll('[data-lms-view]').forEach(b=>b.onclick=()=>{view=b.dataset.lmsView;selected=null;render()});if(view==='history'){target.querySelector('[data-lms-list]').hidden=true;target.querySelector('[data-lms-history]').innerHTML=historyView();}
 target.querySelector('[data-lms-search]').onchange=e=>{query=e.target.value;render()};target.querySelector('[data-lms-status]').onchange=e=>{filter=e.target.value;render()};target.querySelector('[data-lms-mode]').onchange=e=>{mode=e.target.value;selected=null;render()};
 target.querySelectorAll('[data-lms-open]').forEach(b=>b.onclick=()=>{selected=b.dataset.lmsOpen;detail()});target.querySelector('[data-lms-export]').onclick=()=>exportList(visible);if(selected)detail();if(view==='attestations'){target.querySelector('[data-lms-list]').hidden=true;recordInPerson();}
 }
 function detail(){const e=model.learners.find(e=>e['Enrollment ID']===selected),target=document.querySelector('[data-lms-detail]');if(!e||!target)return;const completion=e.completion,account=(model.accounts||[]).find(a=>a['Enrollment ID']===e['Enrollment ID']);
 target.innerHTML=`<section class="workspace-card"><div class="lms-actions"><h3>${esc(e['Full Name'])} · Member training record</h3><button class="membership-tab" data-lms-close>Close record</button></div><dl class="lms-metadata">${[['Email',e.Email],['Member ID',e['Member Key']||'Not linked'],['Membership status',e['Membership Status']],['Course version',e['Course Version']],['Record type',e['Record Type']],['Training method',e.inPerson?'In person':'Online'],...(e.inPerson?[['Training date',e.attendance['Training Date']||'Not recorded'],['Instructor',e.attendance.Instructor||'Not recorded'],['Attendance recorded by',e.attendance['Recorded By']],['Attendance recorded',date(e.attendance['Recorded At'])],['Attestation status',e.verified?'Unsigned':e.attendance.Status]]:[]),['Assigned',date(e['Assigned At'])],['Assigned by',e['Assigned By']],['First started',date(e['First Started At'])],['Last activity',date(e['Last Active At'])],['Due',date(e['Due At'])],['Enrollment ID',e['Enrollment ID']],['Next step',e.action],['Countdown',e.inPerson?'Not applicable — personal attestation pending':e['Due At']?daysLeft(e['Due At'])+' days remaining':'Starts when invitation is sent'],['Training required for patch-in',e['Record Type']==='Official'&&e.status==='Complete'?'Completed':'Not complete'],['Login account',account?.Status||'Awaiting invitation'],['Account created',date(account?.['Created At'])],['First login',date(account?.['First Login At'])],['Password changed',date(account?.['Password Changed At'])]].map(([k,v])=>'<div><dt>'+k+'</dt><dd>'+esc(v||'—')+'</dd></div>').join('')}</dl><h4>${e.inPerson?'In-person attendance':'Section progress'}</h4>${e.inPerson?'<p>Attendance recorded. Online lessons and quizzes are not required for this record. Quiz scores remain unawarded.</p>':''}<div class="lms-table-wrap" ${e.inPerson?'hidden':''}><table class="data-table"><thead><tr><th>Section</th><th>Video watched</th><th>Quiz</th><th>Best grade</th><th>Attempts</th><th>Passed</th></tr></thead><tbody>${sections.map((title,i)=>{const p=e.bySection.get(i+1),watched=truth(p?.['Video Complete'])?100:Math.min(100,Math.floor(Number(p?.['Watched Seconds']||0)/Number(p?.['Video Seconds']||1)*100));return '<tr><td>'+(i+1)+'. '+esc(title)+'</td><td>'+watched+'%</td><td>'+(!p?'Not started':truth(p['Quiz Passed'])?'Passed':truth(p['Rewatch Required'])?'Rewatch required':truth(p['Video Complete'])?'Ready for quiz':'Watch in progress')+'</td><td>'+(p&&p['Best Score']!==''?Number(p['Best Score'])+'/5 ('+Number(p['Best Score'])*20+'%)':'—')+'</td><td>'+Number(p?.Attempts||0)+'</td><td>'+date(p?.['Passed At'])+'</td></tr>'}).join('')}</tbody></table></div>${messageHistory(e)}<h4>Quiz attempt history</h4><p>Every attempt stays in the record, including failed attempts and retakes.</p>${e.attempts.map(a=>attemptView(a)).join('')||'<p>No submitted quizzes recorded yet.</p>'}<h4>Attestation & certificate</h4>${completion?'<dl class="lms-metadata">'+[['Certificate reference',completion['Certificate ID']],['Completed',date(completion['Completed At'])],['Attested name',completion['Full Name']],['Record type',completion['Record Type']],['Verification',completion['Verification Status']],['Course version',completion['Course Version']]].map(([k,v])=>'<div><dt>'+k+'</dt><dd>'+esc(v)+'</dd></div>').join('')+'</dl><p>'+esc(completion.Attestation)+'</p>':'<p>'+ (e.verified?'Completion was verified by club leadership.':e.inPerson?'Your in-person attendance is recorded. Your personal attestation remains unsigned.':e.passed===7?'All seven quizzes passed. Final attestation remains.':'All seven quizzes and the final attestation are required before a certificate is issued.')+'</p>'}${e.Notes?'<h4>Enrollment notes</h4><p>'+esc(e.Notes)+'</p>':''}</section>`;target.querySelector('[data-lms-close]').onclick=()=>{selected=null;target.innerHTML=''};target.scrollIntoView({behavior:'smooth',block:'start'});
 }
 function attemptView(a){let questions=[],answers=[];try{questions=JSON.parse(a['Questions JSON']||'[]');answers=JSON.parse(a['Answers JSON']||'[]')}catch{}return `<details class="lms-attempt"><summary>Section ${Number(a.Section)} · Attempt ${Number(a['Attempt Number'])} · ${Number(a.Score)}/${Number(a['Question Count'])} (${Number(a.Percent)}%) · ${truth(a.Passed)?'Passed':'Failed'} · ${date(a['Submitted At'])}</summary><p class="lms-small">Attempt ${esc(a['Attempt ID'])} · Course ${esc(a['Course Version'])}</p>${questions.length?questions.map((q,i)=>{const picked=answers[i],correct=Number(q.answer),missed=picked!==correct;return '<div class="lms-question '+(missed?'missed':'correct')+'"><strong>'+(i+1)+'. '+esc(q.q)+'</strong><p>Your answer: '+esc(q.options?.[picked]??'No answer recorded')+(missed?' · Incorrect':' · Correct')+'</p>'+(missed?'<p>Correct answer: '+esc(q.options?.[correct]??'Not recorded')+'</p>':'')+(q.explanation?'<p>'+esc(q.explanation)+'</p>':'')+'</div>'}).join(''):'<p>Question-level details were not saved with this attempt.</p>'}</details>`}
 function exportList(rows){const fields=['Full Name','Email','Membership Status','Record Type','Course Version','Status','Sections Passed','Next Step','Assigned At','First Started At','Last Active At','Due At','Completed At','Enrollment ID'];const safe=v=>{let s=String(v??'');if(/^[=+@-]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"'};const csv=[fields,...rows.map(e=>[e['Full Name'],e.Email,e['Membership Status'],e['Record Type'],e['Course Version'],e.status,e.passed,e.action,e['Assigned At'],e['First Started At'],e['Last Active At'],e['Due At'],e['Completed At'],e['Enrollment ID']])].map(r=>r.map(safe).join(',')).join('\r\n');const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download='BSSC-LMS-learners.csv';a.click();URL.revokeObjectURL(url)}
 function recordVerifiedCompletion(){
  const modal=document.createElement('dialog');
  modal.className='lms-enroll-dialog';
  const members=(model.roster||[]).filter(member=>!member.exempt&&!member.conflict);
  modal.innerHTML=`<form><h3>Record verified completion</h3>
   <label>Member<select name="member" required><option value="">Select a member</option>${members.map((m,i)=>'<option value="'+i+'">'+esc(m.name)+'</option>').join('')}</select></label>
   <label>Class date, if known<input type="date" name="date"></label>
   <label><input name="confirmed" type="checkbox" required> I personally verified that this member attended Foundations training in person.</label>
   <p role="alert"></p><div class="lms-actions"><button type="button" data-close>Cancel</button><button type="submit">Record completion</button></div></form>`;
  document.body.append(modal);
  modal.addEventListener('close',()=>modal.remove());
  modal.querySelector('[data-close]').onclick=()=>modal.close();
  modal.showModal();
  modal.querySelector('form').onsubmit=async event=>{
   event.preventDefault();
   const button=modal.querySelector('[type=submit]');
   button.disabled=true;
   try{
    const form=new FormData(event.target),member=members[Number(form.get('member'))],day=String(form.get('date')||'');
    if(!form.get('member')||!member||!form.get('confirmed'))throw Error('Select a member and confirm attendance.');
    const today=new Intl.DateTimeFormat('en-CA',{timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
    if(day>today)throw Error('The class date cannot be in the future.');
    const version=model.settings.find(row=>row.Setting==='Course Version')?.Value;
    if(!version)throw Error('The current course version is missing.');
    const matches=model.learners.filter(e=>!truth(e.Archived)&&e['Record Type']==='Official'&&e['Course Version']===version&&rosterMatch(member,e['Full Name'],e.Email));
    if(matches.length>1)throw Error('Multiple active enrollments need review.');
    if(matches[0]?.status==='Complete')throw Error('This member already has a verified completion.');
    if((model.attendance||[]).some(a=>a['Course Version']===version&&rosterMatch(member,a['Full Name'],a.Email)&&['Requested','Inviting'].includes(a.Status)))throw Error('An attestation invitation is being processed. Try again after it finishes.');
    const actor=await getPortalAuditActor(),now=new Date().toISOString(),id=matches[0]?.['Enrollment ID']||'LMS-'+crypto.randomUUID();
    const append=(sheetId,values)=>({appendCells:{sheetId,rows:[{values:values.map(value=>({userEnteredValue:typeof value==='boolean'?{boolValue:value}:typeof value==='number'?{numberValue:value}:{stringValue:value}}))}],fields:'userEnteredValue'}});
    const requests=[append(392594894,['ATT-'+crypto.randomUUID(),id,member.name,member.email,day,'',actor,now,version,'Leadership verified','','','','','','','In-person attendance verified by club leadership.'])];
    if(!matches.length){
     requests.unshift(append(124888460,[id,'MEMBER-'+crypto.randomUUID(),member.name,member.email,'Member',version,'Official',now,'',actor,'','','','', '',now,'',false,0]));
    }else{
     const [enrollments,attendance]=await getSheetRanges(["'LMS Enrollments'!A1:S2000","'LMS Attendance'!A1:Q2000"],MEMBERSHIP_SPREADSHEET_ID);
     if(attendance.some(row=>row[1]===id&&['Leadership verified','Signed'].includes(row[9])))throw Error('This member already has a verified completion.');
     const rowIndex=enrollments.findIndex(row=>row[0]===id&&row[5]===version&&!truth(row[17]));
     if(rowIndex<1)throw Error('The enrollment changed. Refresh the training page and try again.');
     requests.push({updateCells:{start:{sheetId:124888460,rowIndex,columnIndex:8},rows:[{values:[{}]}],fields:'userEnteredValue'}});
    }
    const url='https://sheets.googleapis.com/v4/spreadsheets/'+MEMBERSHIP_SPREADSHEET_ID+':batchUpdate';
    await writePortalSheetRequest(url,{method:'POST',headers:{Authorization:'Bearer '+accessToken,'Content-Type':'application/json'},body:JSON.stringify({requests})},'Recorded leadership-verified training completion','LMS Attendance');
    modal.close();
    await load();
   }catch(error){modal.querySelector('[role=alert]').textContent=error.message;button.disabled=false;}
  };
 }
 function enroll(){
  const modal=document.createElement('dialog');
  modal.className='lms-enroll-dialog';
  const roster=model.roster||[];
  const emailCounts=new Map();
  for(const member of roster)emailCounts.set(member.email,(emailCounts.get(member.email)||0)+1);
  const enrolled=new Set(model.learners.filter(e=>!truth(e.Archived)&&e['Record Type']==='Official').map(e=>String(e.Email).trim().toLowerCase()));
  const members=roster.filter(m=>!m.exempt&&!m.conflict&&m.email&&emailCounts.get(m.email)===1&&!enrolled.has(m.email));
  modal.innerHTML=`<form><h3>Training enrollment</h3>
   <label>Find a member<input type="search" data-enroll-search placeholder="Type a name"></label>
   <label>Member<select name="member" required><option value="">Select a roster member</option>${members.map((m,i)=>'<option value="'+i+'">'+esc(m.name)+'</option>').join('')}</select></label>
   ${members.length?'':'<p>No unassigned members with a unique roster email are available.</p>'}
   <label>Due date, optional<input name="due" type="date"></label>
   <label>Notes, optional<textarea name="notes" maxlength="1000"></textarea></label>
   <p data-lms-enroll-error role="alert"></p>
   <div class="lms-actions"><button type="button" data-lms-cancel>Cancel</button><button type="submit" ${members.length?'':'disabled'} style="background:#a92537;color:#fff">Enroll and send invitation</button></div></form>`;
  document.body.append(modal);
  modal.addEventListener('close',()=>modal.remove());
  modal.querySelector('[data-lms-cancel]').onclick=()=>modal.close();
  modal.showModal();
  const picker=modal.querySelector('[name=member]');
  const search=modal.querySelector('[data-enroll-search]');
  search.oninput=()=>{
   const term=search.value.trim().toLowerCase();
   for(const option of picker.options)option.hidden=!!option.value&&!option.textContent.toLowerCase().includes(term);
   if(picker.selectedOptions[0]?.hidden)picker.value='';
   const visible=Array.from(picker.options).filter(option=>option.value&&!option.hidden);
   if(term&&visible.length===1)picker.value=visible[0].value;
  };
  let pendingId='';
  modal.querySelector('form').onsubmit=async event=>{
   event.preventDefault();
   const button=modal.querySelector('[type=submit]');
   button.disabled=true;
   button.textContent='Sending invitation…';
   button.style.background='#f2c94c';
   button.style.color='#242424';
   try{
    const form=new FormData(event.target),choice=form.get('member'),member=members[Number(choice)];
    if(!pendingId&&(choice===''||!member))throw Error('Select a roster member.');
    if(!pendingId){
    const [currentRoster,raw]=await Promise.all([readTrainingRoster(),getSheetRanges(["'LMS Enrollments'!A1:S2000"],MEMBERSHIP_SPREADSHEET_ID)]);
    const matches=currentRoster.filter(m=>m.email===member.email);
    if(matches.length!==1||matches[0].name!==member.name||matches[0].exempt||matches[0].conflict)throw Error('The roster record changed. Reopen Manual enrollment and try again.');
    if(objects(raw[0],'LMS Enrollments').some(e=>!truth(e.Archived)&&e['Record Type']==='Official'&&String(e.Email).trim().toLowerCase()===member.email))throw Error('This member already has an active official enrollment.');
    const course=model.settings.find(row=>row.Setting==='Course Version')?.Value;
    if(!course)throw Error('The active course version is missing.');
    const at=new Date().toISOString(),actor=await getPortalAuditActor();
    const status={active:'Active',prospect:'Prospect',pending:'Pending'}[matches[0].status];
    if(!['bsscvb@boneshakerssocialclub.com','president@boneshakerssocialclub.com'].includes(actor.toLowerCase()))throw Error('Sign in as the club president or BSSC training administrator to send invitations.');
    const row=['LMS-'+crypto.randomUUID(),'MEMBER-'+crypto.randomUUID(),member.name,member.email,status,course,'Official',at,easternDue(String(form.get('due')||'')),actor,'','','','','',at,['[Send video invitation now]',String(form.get('notes')).trim()].filter(Boolean).join(' '),false,0];
    const range="'LMS Enrollments'!A:S",url='https://sheets.googleapis.com/v4/spreadsheets/'+MEMBERSHIP_SPREADSHEET_ID+'/values/'+encodeURIComponent(range)+':append?valueInputOption=RAW&insertDataOption=INSERT_ROWS';
    await writePortalSheetRequest(url,{method:'POST',headers:{Authorization:'Bearer '+accessToken,'Content-Type':'application/json'},body:JSON.stringify({range,majorDimension:'ROWS',values:[row]})},'Enrolled training learner','LMS Enrollments');
    pendingId=row[0];
    picker.disabled=true;
    search.disabled=true;
    }
    const response=await fetch('https://script.google.com/macros/s/AKfycbz5mh45avqAvKNf7b-0OFvU46_MllMjwXyfGOJwtW0qUwpAA5rQZyKAImq5NAGDSniu/exec',{
     method:'POST',credentials:'omit',headers:{'Content-Type':'text/plain;charset=UTF-8'},
     body:JSON.stringify({action:'sendManualTrainingInvitation',id:pendingId,token:accessToken}),
     signal:AbortSignal.timeout(35000)
    });
    const delivery=await response.json();
    if(!response.ok||!delivery.ok)throw Error(delivery.error||'Invitation delivery could not be confirmed.');
    button.textContent='Done — invitation sent';
    button.style.background='#247345';
    button.style.color='#fff';
    modal.querySelector('[data-lms-enroll-error]').textContent='';
    modal.querySelector('[data-lms-cancel]').textContent='Close';
    await load();
   }catch(error){
    modal.querySelector('[data-lms-enroll-error]').textContent=error.message;
    button.textContent=pendingId?'Check or retry send':'Enroll and send invitation';
    button.style.background='#a92537';
    button.style.color='#fff';
    button.disabled=false;
   }
  };
 }
 async function load(){const seq=++request,target=document.getElementById('membershipContent'),status=document.getElementById('membershipStatus');if(!accessToken)return;status.classList.remove('lifer-summary');status.textContent='Loading private LMS records…';target.innerHTML='<section class="workspace-card"><h2>BSSC LMS</h2><p role="status">Loading learner records…</p></section>';try{const [raw,roster]=await Promise.all([getSheetRanges(["'LMS Enrollments'!A1:S2000","'LMS Progress'!A1:P14000","'LMS Attempts'!A1:O20000","'LMS Completions'!A1:J2000","'LMS Settings'!A1:D100","'LMS Accounts'!A1:I2000","'LMS Outbox'!A1:N10000","'LMS Attendance'!A1:Q2000"],MEMBERSHIP_SPREADSHEET_ID),readTrainingRoster().catch(()=>null)]);if(seq!==request||currentMembershipSheet!=='BSSC LMS')return;const [enrollments,progress,attempts,completions,settings,accounts,outbox,attendance]=raw.map((rows,i)=>objects(rows,tables[i]));if(enrollments.length>=1999||progress.length>=13999||attempts.length>=19999||completions.length>=1999||attendance.length>=1999)throw Error('The LMS record limit needs expansion before complete results can be shown.');model={learners:enrollments.map(e=>learner(e,progress,attempts,completions,attendance)),settings,accounts,outbox,attendance,roster};render();status.textContent=''}catch(error){if(seq!==request)return;status.textContent='LMS records could not be loaded.';target.innerHTML='<section class="workspace-card"><h2>BSSC LMS</h2><p role="alert">'+esc(error.message)+'</p><button class="membership-tab" data-lms-refresh>Try again</button></section>';target.querySelector('[data-lms-refresh]').onclick=load}}


 function historyEvents(){
  const events=[];for(const a of model.attendance||[]){if(mode!=='Official')continue;events.push({at:a['Recorded At'],name:a['Full Name'],email:a.Email,enrollment:a['Enrollment ID'],event:a.Status==='Leadership verified'?'Leadership verified completion':'In-person attendance recorded',status:a.Status==='Leadership verified'?'Complete':a.Status,detail:'Training date: '+(a['Training Date']||'Not recorded')+' · Instructor: '+(a.Instructor||'Not recorded')+' · Recorded by '+a['Recorded By'],reference:a['Attendance ID']});if(a['Attested At'])events.push({at:a['Attested At'],name:a['Full Name'],email:a.Email,enrollment:a['Enrollment ID'],event:'Personal attestation signed',status:'Complete',detail:a.Attestation,reference:a['Certificate ID']});}
  for(const e of model.learners.filter(e=>e['Record Type']===mode)){for(const a of e.attempts)events.push({at:a['Submitted At'],name:e['Full Name'],email:e.Email,enrollment:e['Enrollment ID'],event:'Section '+a.Section+' quiz · attempt '+a['Attempt Number'],status:truth(a.Passed)?'Passed':'Failed',detail:a.Score+'/'+a['Question Count']+' ('+a.Percent+'%)',reference:a['Attempt ID']});if(e.completion&&!e.inPerson)events.push({at:e.completion['Completed At'],name:e['Full Name'],email:e.Email,enrollment:e['Enrollment ID'],event:'Online completion attestation',status:e.status,detail:e.completion.Attestation,reference:e.completion['Certificate ID']});}
  for(const m of model.outbox||[]){const e=model.learners.find(e=>e['Enrollment ID']===m['Enrollment ID']);if(e&&e['Record Type']!==mode)continue;if(!e&&mode!=='Official')continue;events.push({at:m['Sent At']||m['Reserved At'],name:m['Full Name'],email:m.Email,enrollment:m['Enrollment ID'],event:m.Kind,status:m.Status,detail:m['Days Remaining']?m['Days Remaining']+' days remaining':m['Error Code']||'Email to roster address',reference:m['Event Key']});}
  return events.filter(e=>!query||(e.name+' '+e.email+' '+e.reference).toLowerCase().includes(query.toLowerCase())).sort((a,b)=>Date.parse(b.at)-Date.parse(a.at));
 }
 function historyView(){const events=historyEvents();return '<h3>LMS History</h3><p>Attendance, email delivery, quiz attempts and personally signed attestations. Times shown in Eastern Time.</p><div class="lms-table-wrap"><table class="data-table"><thead><tr><th>When</th><th>Member</th><th>Event</th><th>Status</th><th>Details</th></tr></thead><tbody>'+events.map(e=>'<tr><td>'+date(e.at)+'</td><td>'+(e.enrollment?'<button class="lms-name" data-lms-open="'+esc(e.enrollment)+'">'+esc(e.name)+'</button>':esc(e.name))+'<small>'+esc(e.email)+'</small></td><td>'+esc(e.event)+'</td><td><span class="lms-tag '+(e.status==='Complete'||e.status==='Signed'?'complete':'')+'">'+esc(e.status)+'</span></td><td>'+esc(e.detail)+'<small>'+esc(e.reference)+'</small></td></tr>').join('')+'</tbody></table></div>'+(events.length?'':'<p>No history matches these filters.</p>');}
 async function recordInPerson(){
  const target=document.querySelector('[data-lms-console]'),settings=Object.fromEntries(model.settings.map(x=>[x.Setting,x.Value]));if(!target)return;
  if(settings['In-person attestation']!=='Enabled'){target.innerHTML='<p role="alert">In-person attestations are awaiting service activation.</p>';return;}
  target.innerHTML=`<form class="lms-attestation-console"><p class="lms-eyebrow">MANUAL ATTESTATION INVITATIONS</p><h3>Send class attestations</h3><p>Select the people who attended, enter the class date, and request their personal attestation emails. Members sign for themselves and receive a certificate. Their online quiz scores stay unawarded.</p><div class="lms-console-fields"><label>Class date<input name="date" type="date" required></label><label>Instructor (optional)<input name="instructor" maxlength="120" autocomplete="off"></label></div><label>Find roster members<input data-lms-member-search type="search" placeholder="Search name or email"></label><p data-lms-roster-status role="status">Loading roster members…</p><div data-lms-members class="lms-member-picker"></div><p data-lms-selected>0 members selected</p><label>Notes (optional)<textarea name="notes" maxlength="1000"></textarea></label><label class="lms-attendance-confirm"><input name="confirmed" type="checkbox" required> I confirm the selected members attended BSSC Foundations on this class date. Each member must personally sign their attestation.</label><p data-lms-enroll-error role="alert"></p><div class="lms-actions"><button type="submit" disabled>Queue attestation emails</button></div><p class="lms-small">Queued invitations are processed within about five minutes. Delivery and signatures appear in History. Existing attendance records are shown below and cannot be sent twice here.</p></form>`;
  const form=target.querySelector('form'),button=form.querySelector('[type=submit]');let members=[];
  try{const roster=await readTrainingRoster(),counts=new Map();
   for(const m of roster.filter(m=>m.email))counts.set(m.email,(counts.get(m.email)||0)+1);
   members=roster.filter(m=>!m.exempt&&m.email&&!m.conflict&&counts.get(m.email)===1);
   form.querySelector('[data-lms-members]').innerHTML=members.map((m,i)=>{const existing=(model.attendance||[]).find(a=>String(a.Email).toLowerCase()===m.email&&a['Course Version']===settings['Course Version']&&a.Status!=='Cancelled');return '<label class="lms-roster-choice" data-search="'+esc((m.name+' '+m.email).toLowerCase())+'"><input type="checkbox" name="member" value="'+i+'"'+(existing?' disabled':'')+'><span><strong>'+esc(m.name)+'</strong><small>'+esc(m.email)+'</small>'+(existing?'<small>'+esc(existing.Status)+' · '+esc(existing['Training Date']||'Class date not recorded')+'</small>':'')+'</span></label>';}).join('');
   form.querySelector('[data-lms-roster-status]').textContent='Select one or more members using their verified roster email. Shared or conflicting addresses require review.';button.disabled=false;
   form.querySelector('[data-lms-member-search]').oninput=e=>{const q=e.target.value.toLowerCase();form.querySelectorAll('[data-search]').forEach(x=>x.hidden=!x.dataset.search.includes(q));};
   form.querySelector('[data-lms-members]').onchange=()=>{form.querySelector('[data-lms-selected]').textContent=form.querySelectorAll('[name=member]:checked').length+' members selected';};
  }catch(error){form.querySelector('[data-lms-enroll-error]').textContent=error.message;return;}
  form.onsubmit=async event=>{event.preventDefault();button.disabled=true;try{const data=new FormData(form),chosen=data.getAll('member').map(i=>members[Number(i)]),date=String(data.get('date')||''),at=new Date().toISOString();if(!chosen.length||chosen.some(m=>!m)||!data.get('confirmed'))throw Error('Choose at least one member and confirm their attendance.');if(!date||date>new Intl.DateTimeFormat('en-CA',{timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date()))throw Error('Choose the actual class date. It cannot be in the future.');for(const m of chosen)if((model.attendance||[]).some(a=>String(a.Email).toLowerCase()===m.email&&a['Course Version']===settings['Course Version']&&a.Status!=='Cancelled'))throw Error(m.name+' already has an attendance record. Review History.');const actor=await getPortalAuditActor(),rows=chosen.map(m=>['ATT-'+crypto.randomUUID(),'',m.name,m.email,date,String(data.get('instructor')||'').trim(),actor,at,settings['Course Version'],'Requested','','','','','','',String(data.get('notes')||'').trim()]),range="'LMS Attendance'!A:Q",url='https://sheets.googleapis.com/v4/spreadsheets/'+MEMBERSHIP_SPREADSHEET_ID+'/values/'+encodeURIComponent(range)+':append?valueInputOption=RAW&insertDataOption=INSERT_ROWS';await writePortalSheetRequest(url,{method:'POST',headers:{Authorization:'Bearer '+accessToken,'Content-Type':'application/json'},body:JSON.stringify({range,majorDimension:'ROWS',values:rows})},'Queued manual class attestation invitations','LMS Attendance',rows.length);view='history';mode='Official';query='';await load();const status=document.getElementById('membershipStatus');status.textContent=rows.length+' attestation invitation'+(rows.length===1?'':'s')+' queued. Delivery normally completes within five minutes; refresh History for results.';}catch(error){form.querySelector('[data-lms-enroll-error]').textContent=error.message;button.disabled=false;}};
 }
 function daysLeft(value){const day=v=>new Intl.DateTimeFormat('en-CA',{timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(v));return Math.max(0,Math.round((Date.parse(day(value))-Date.parse(day(Date.now())))/86400000));}
 function messageHistory(e){const rows=(model.outbox||[]).filter(m=>m['Enrollment ID']===e['Enrollment ID']);return '<h4>Invitations & countdown history</h4>'+(rows.length?'<div class="lms-table-wrap"><table class="data-table"><thead><tr><th>Message</th><th>Countdown</th><th>Recipient</th><th>Delivery</th><th>Sent</th></tr></thead><tbody>'+rows.map(m=>'<tr><td>'+esc(m.Kind)+'</td><td>'+esc(m['Days Remaining']?m['Days Remaining']+' days':'—')+'</td><td>'+esc(m.Email)+'</td><td>'+esc(m.Status)+'</td><td>'+date(m['Sent At'])+'</td></tr>').join('')+'</tbody></table></div>':'<p>No invitation or countdown messages recorded yet.</p>');}
 function patchTransitions(edits,cache){const rows=cache.rows||[],heads=rows[cache.headerRowIndex||0]||[],col=label=>heads.findIndex(h=>String(h).trim().toLowerCase()===label.toLowerCase()),status=col('Status'),type=col('Membership Type'),email=col('Email'),first=col('First Name'),last=col('Last Name'),group=new Map();for(const edit of edits){if(edit.column!==status&&edit.column!==type)continue;if(!group.has(edit.row))group.set(edit.row,(rows[edit.row-1-Number(cache.editOptions?.rowOffset||0)]||[]).slice());}const transitions=[];for(const [row,before] of group){const after=before.slice();for(const edit of edits.filter(e=>e.row===row))after[edit.column]=edit.value;const prospect=r=>[r[status],r[type]].some(v=>/prospect/i.test(String(v||'')));if(prospect(before)&&!prospect(after))transitions.push({row,email:String(after[email]||'').trim().toLowerCase(),name:[after[first],after[last]].filter(Boolean).join(' '),startDate:after[col('Start Date')]});}return transitions;}
 async function validateRosterEdits(edits,cache){const transitions=patchTransitions(edits,cache);if(!transitions.length)return;const raw=await getSheetRanges(["'LMS Enrollments'!A1:S2000","'LMS Progress'!A1:P14000","'LMS Completions'!A1:J2000","'LMS Settings'!A1:D100","'LMS Attendance'!A1:Q2000"],MEMBERSHIP_SPREADSHEET_ID),enrollments=objects(raw[0],'LMS Enrollments'),progress=objects(raw[1],'LMS Progress'),completions=objects(raw[2],'LMS Completions'),settings=objects(raw[3],'LMS Settings'),attendance=objects(raw[4]||[['Attendance ID']],'LMS Attendance'),version=settings.find(x=>x.Setting==='Course Version')?.Value;if(!version)throw Error('The current Foundations course version could not be verified.');for(const member of transitions){if(pastFiveYears(member.startDate)||manualTrainingExemptions(settings).has(member.name.trim().toLowerCase()))continue;const matches=enrollments.filter(e=>String(e.Email).toLowerCase()===member.email&&!truth(e.Archived)&&e['Record Type']==='Official'&&e['Course Version']===version);const e=matches.length===1?learner(matches[0],progress,[],completions,attendance):null;if(!e||e.status!=='Complete'||!e.inPerson&&e.rows.some(p=>p['Course Version']!==version||Number(p['Best Score'])<4||Number(p['Best Score'])>5))throw Error('BSSC Foundations must be completed before patch-in. '+(member.name||member.email)+' needs verified online completion or recorded in-person attendance and a personally signed final attestation.');}}
 return {load,learner,objects,easternDue,patchTransitions,validateRosterEdits,daysLeft};
})();

