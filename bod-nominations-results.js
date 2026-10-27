(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.BSSCBodNominations = api;
})(typeof window === 'undefined' ? globalThis : window, function () {
  'use strict';
  const SHEET = 'BOD Nominations 2027';
  const CANDIDATE_SHEET = 'BOD Candidates 2027';
  const AUDIT_SHEET = 'BOD Nomination Changes 2027';
  const ADMIN_EMAILS = ['president@boneshakerssocialclub.com','bsscvb@boneshakerssocialclub.com'];
  const AUDIT_HEADERS = ['Changed At','Actor','Action','Member','Reference','Reason','Before JSON','After JSON','Change ID'];
  const CHANGE_REASONS = [
    ['wrong_selection','Correct an incorrect nominee selection'],
    ['add_nominee','Add a nominee the member missed'],
    ['remove_nominee','Remove an unintended nominee'],
    ['member_request','Member requested different nominees'],
    ['unfinished','Submitted before finishing selections'],
    ['accidental','Submitted by mistake'],
    ['start_over','Member requested a fresh start'],
    ['admin_correction','Correct an administrative entry error'],
    ['other','Other']
  ];
  let sequence = 0;
  const html = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const normalize = value => String(value ?? '').trim().toLocaleLowerCase().replace(/\s+/g, ' ');

  function buildModel(rows) {
    if (!rows.length) return {submissions:[], nominees:[], total:0, excluded:0, duplicates:0};
    const headers = rows[0].map(normalize);
    const required = ['submitted at','reference','member key','nominator','nominee count','nominees','candidate ids'];
    const columns = required.map(name => headers.indexOf(name));
    if (columns.some(i => i < 0)) throw new Error('The nomination log headers do not match the expected format. Open the source sheet to review them.');
    const members = new Map(), references = new Set();
    let excluded = 0, duplicates = 0;
    rows.slice(1).forEach((row, index) => {
      if (row.every(value => !String(value ?? '').trim())) return;
      const [timestamp, reference, memberKey, nominator, countText, namesText, idsText] = columns.map(i => String(row[i] ?? '').trim());
      let ids;
      try { ids = JSON.parse(idsText); } catch (_) { excluded++; return; }
      const names = namesText.split(' | ').map(name => name.trim()).filter(Boolean);
      const count = Number(countText);
      if (!reference || !memberKey || !nominator || !timestamp || !Array.isArray(ids) ||
          !Number.isInteger(count) || count < 1 || count !== names.length || count !== ids.length ||
          new Set(ids.map(String)).size !== count || new Set(names.map(normalize)).size !== count) {
        excluded++; return;
      }
      if (references.has(reference)) { duplicates++; return; }
      references.add(reference);
      if (members.has(memberKey)) duplicates++;
      // The append-only log's last valid row is the current submission for a member.
      members.set(memberKey, {timestamp, reference, memberKey, nominator, names, ids:ids.map(String), row:index + 2});
    });
    const submissions = [...members.values()].sort((a,b) => b.row-a.row);
    submissions.forEach(record => { record.sourceRows = memberRows(rows,record.memberKey,columns[2]); });
    const tally = new Map();
    submissions.forEach(record => record.names.forEach(name => {
      const key = normalize(name);
      const entry = tally.get(key) || {name, count:0};
      entry.count++; tally.set(key,entry);
    }));
    const nominees = [...tally.values()].sort((a,b) => b.count-a.count || a.name.localeCompare(b.name));
    return {submissions, nominees, total:submissions.reduce((sum,record) => sum + record.names.length,0), excluded, duplicates};
  }

  function tallyCsv(model) {
    const cell = value => {
      const text = String(value ?? '');
      return '"' + (/^[\s]*[=+@-]/.test(text) ? "'" + text : text).replace(/"/g,'""') + '"';
    };
    return [['Nominee','Nominations'],...model.nominees.map(p => [p.name,p.count])].map(row => row.map(cell).join(',')).join('\r\n') + '\r\n';
  }

  function markup(model, updatedAt, sourceUrl, admin = false) {
    const cards = [['Member submissions',model.submissions.length],['Members nominated',model.nominees.length],['Total nominations',model.total]];
    return `<section class="bod-results" aria-label="BOD nomination results">
      <div class="bod-results-head"><div><p class="bod-results-kicker">2027 BOARD OF DIRECTORS</p><h2>BOD Nomination Results</h2><p>Nomination counts and member submissions. These are nominations, not election votes.</p></div><div class="bod-results-actions"><button class="membership-tab" type="button" data-bod-refresh>Refresh results</button><button class="membership-tab" type="button" data-bod-export ${model.nominees.length?'':'disabled'}>Download tally CSV</button><a class="membership-tab" target="_blank" rel="noopener noreferrer" href="${html(sourceUrl)}">Open source sheet</a></div></div>
      <p class="bod-results-updated">Updated ${html(updatedAt)} · Reads directly from the membership workbook.</p>
      <div class="bod-results-stats">${cards.map(([label,value]) => `<div><strong>${value}</strong><span>${label}</span></div>`).join('')}</div>
      ${model.excluded?`<p class="bod-results-note" role="alert">${model.excluded} incomplete or invalid log row(s) excluded from the totals. Review the source sheet before using these results.</p>`:''}
      ${model.duplicates?`<p class="bod-results-note">${model.duplicates} duplicate or superseded row(s) excluded. Each member is counted once.</p>`:''}
      <section class="bod-results-panel"><h3>Nomination totals</h3><p>Highest totals first. Members tied on nominations are listed alphabetically.</p>${model.nominees.length?`<div class="bod-results-scroll"><table><thead><tr><th scope="col">Member</th><th scope="col">Nominations</th></tr></thead><tbody>${model.nominees.map(person=>`<tr><td>${html(person.name)}</td><td><strong>${person.count}</strong></td></tr>`).join('')}</tbody></table></div>`:`<div class="empty-state">${model.excluded?'No valid submissions are available. Review the source sheet.':'No nominations received yet. Results will appear here after the first member submits the nomination form.'}</div>`}</section>
      <section class="bod-results-panel"><h3>Individual submissions (${model.submissions.length})</h3><p>${admin?'Tap a member’s name to edit their nominees or reset their submission.':'Newest first. Open a submission to see the members nominated.'}</p><label class="bod-search-label">Find a submitter<input type="search" data-bod-submitter-search placeholder="Search member name" autocomplete="off"></label>${model.submissions.map(record=>`<details class="bod-results-submission" data-bod-name="${html(normalize(record.nominator))}"><summary><strong>${html(record.nominator)}</strong><span>${record.names.length} nominated · ${html(record.timestamp)}</span></summary><p class="bod-results-reference">Reference: ${html(record.reference)}</p><ul>${record.names.map(name=>`<li>${html(name)}</li>`).join('')}</ul>${admin?`<div class="bod-manage-actions"><button type="button" class="membership-tab" data-bod-manage="${html(record.reference)}">Edit nominees / reset member</button></div>`:''}</details>`).join('')||'<p>No submissions to display.</p>'}<p data-bod-no-match hidden>No matching submitter.</p></section>
    </section>`;
  }

  const rowValues = row => Array.from({length:7},(_,i)=>String(row?.[i] ?? ''));
  function memberRows(rows,key,column=2) {
    return rows.slice(1).map((row,i)=>({row:i+2,values:rowValues(row)})).filter(item=>String(item.values[column]).trim()===key);
  }
  function parseCandidates(rows) {
    if (!rows.length || rows[0].slice(0,4).map(normalize).join('|')!=='candidate id|name|road name|start date') throw Error('The private BOD candidate list is unavailable.');
    const seen=new Set(), names=new Set();
    const candidates=rows.slice(1).filter(row=>row.some(value=>String(value??'').trim())).map(row=>{
      const [id,name,roadName]=row.map(value=>String(value??'').trim());
      if(!/^[1-9][0-9]*$/.test(id)||!name||seen.has(id)||names.has(normalize(name)))throw Error('The private BOD candidate list has invalid or duplicate entries.');
      seen.add(id);names.add(normalize(name));return {id,name,roadName:roadName||''};
    });
    if(!candidates.length)throw Error('The private BOD candidate list is empty.');
    return candidates;
  }
  function parseHistory(rows) {
    if(!rows.length)return [];
    if(AUDIT_HEADERS.some((header,i)=>normalize(rows[0][i])!==normalize(header)))throw Error('The nomination change-history headers are invalid. No administrative changes can be saved.');
    return rows.slice(1).filter(row=>row.some(value=>String(value??'').trim())).map(row=>({at:String(row[0]||''),actor:String(row[1]||''),action:String(row[2]||''),name:String(row[3]||''),reference:String(row[4]||''),reason:String(row[5]||''),before:String(row[6]||'[]'),after:String(row[7]||'[]'),id:String(row[8]||'')})).reverse();
  }
  function historyMarkup(history) {
    return `<section class="bod-results-panel"><h3>Change history</h3>${history.length?history.slice(0,50).map(item=>`<details class="bod-results-submission"><summary><strong>${html(item.name)}</strong><span>${item.action==='reset'?'Reset to submit again':'Nominees edited'} · ${html(item.at)}</span></summary><p class="bod-results-reference">${html(item.actor)}<br>${html(item.reason)}<br>Reference: ${html(item.reference)}</p></details>`).join(''):'<p>No administrative changes yet.</p>'}</section>`;
  }
  function changeReason(choice,details='') {
    const reason=CHANGE_REASONS.find(([value])=>value===choice);
    if(!reason)throw Error('Select a reason for this change.');
    if(choice!=='other')return reason[1];
    details=String(details).trim();
    if(!details)throw Error('Enter a brief explanation for Other.');
    if(details.length>293)throw Error('Keep the explanation to 293 characters or fewer.');
    return 'Other: '+details;
  }
  function buildAdminMutation({rows,record,action,ids,reason,actor,candidates,nominationSheetId,auditSheetId,at,operationId}) {
    if(!ADMIN_EMAILS.includes(normalize(actor)))throw Error('Use the President or bsscvb Google account to manage nominations.');
    if(!['edit','reset'].includes(action))throw Error('Invalid nomination action.');
    reason=String(reason||'').trim();if(!reason||reason.length>300)throw Error('Enter a reason for this change (up to 300 characters).');
    const headers=['submitted at','reference','member key','nominator','nominee count','nominees','candidate ids'];
    if(headers.some((header,i)=>normalize(rows[0]?.[i])!==header))throw Error('The nomination log layout changed. Refresh before editing.');
    const current=buildModel(rows).submissions.find(item=>item.reference===record.reference&&item.memberKey===record.memberKey);
    if(!current||JSON.stringify(current.sourceRows)!==JSON.stringify(record.sourceRows))throw Error('This member’s submission changed since you opened it. Close this window, refresh results, and try again.');
    if(!Number.isInteger(nominationSheetId)||!Number.isInteger(auditSheetId)||!operationId||!at)throw Error('Administrative records are not ready. Refresh results.');
    const selected=action==='edit'?Array.from(new Set((ids||[]).map(String))).sort((a,b)=>Number(a)-Number(b)):[];
    const pool=new Map(candidates.map(candidate=>[candidate.id,candidate]));
    if(action==='edit'&&(!selected.length||selected.some(id=>!pool.has(id))))throw Error('Select at least one valid nominee, or use Reset member to remove the submission.');
    if(action==='edit'&&JSON.stringify(selected)===JSON.stringify([...current.ids].sort((a,b)=>Number(a)-Number(b))))throw Error('No nominee changes selected.');
    const after=action==='edit'?[{row:current.row,values:[...current.sourceRows.find(item=>item.row===current.row).values.slice(0,4),String(selected.length),selected.map(id=>pool.get(id).name).join(' | '),JSON.stringify(selected)]}]:[];
    const entry=[at,normalize(actor),action,current.nominator,current.reference,reason,JSON.stringify(current.sourceRows),JSON.stringify(after),operationId];
    const cells=values=>values.map(value=>({userEnteredValue:typeof value==='number'?{numberValue:value}:{stringValue:String(value)}}));
    // Audit snapshot and live-row changes succeed or fail together in one Sheets batch.
    const requests=[{appendCells:{sheetId:auditSheetId,rows:[{values:cells(entry)}],fields:'userEnteredValue'}}];
    current.sourceRows.forEach(item=>{
      const keep=action==='edit'&&item.row===current.row;
      const values=keep?[selected.length,selected.map(id=>pool.get(id).name).join(' | '),JSON.stringify(selected)]:Array(7).fill('');
      requests.push({updateCells:{range:{sheetId:nominationSheetId,startRowIndex:item.row-1,endRowIndex:item.row,startColumnIndex:keep?4:0,endColumnIndex:7},rows:[{values:cells(values)}],fields:'userEnteredValue'}});
    });
    return {requests,entry,selected};
  }

  function installStyle() {
    if (document.getElementById('bod-results-style')) return;
    const style = document.createElement('style'); style.id='bod-results-style';
    style.textContent='.bod-results{color:var(--ink,#161616)}.bod-results-head{display:flex;justify-content:space-between;gap:18px;flex-wrap:wrap}.bod-results-head h2{margin:4px 0;font-size:27px}.bod-results-head p{margin:5px 0;line-height:1.5}.bod-results-kicker{font-size:11px;font-weight:800;letter-spacing:1.5px;color:#a80d27}.bod-results-actions{display:flex;gap:8px;align-items:flex-start;flex-wrap:wrap}.bod-results-actions a{text-decoration:none}.bod-results-updated{font-size:12px;line-height:1.5;color:#555}.bod-results-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin:18px 0}.bod-results-stats>div{border:1px solid #b9bec4;border-top:3px solid #c8102e;border-radius:12px;padding:18px;background:#f7f8fa}.bod-results-stats strong{display:block;font-size:31px}.bod-results-stats span{display:block;font-size:13px;margin-top:5px}.bod-results-panel{background:#f8f9fa;border:1px solid #bcc2c8;border-radius:12px;padding:20px;margin-top:18px}.bod-results-panel h3{margin:0 0 8px}.bod-results-panel>p{color:#555;font-size:13px;line-height:1.5}.bod-results-scroll{overflow-x:auto}.bod-results table{border-collapse:collapse;width:100%}.bod-results th,.bod-results td{text-align:left;padding:12px;border-bottom:1px solid #d1d5db}.bod-results th:last-child,.bod-results td:last-child{text-align:right}.bod-results th{background:#151517;color:#fff}.bod-results-note{background:#eaf1fa;border-left:4px solid #2867ad;padding:12px;line-height:1.5}.bod-results-submission{border:1px solid #c3c8ce;border-radius:8px;margin-top:10px;background:#fff}.bod-results-submission summary{display:flex;flex-wrap:wrap;justify-content:space-between;gap:8px;padding:14px;cursor:pointer}.bod-results-submission summary span{font-size:12px;color:#555}.bod-results-submission ul{line-height:1.9;margin:0 18px 16px;padding-left:20px}.bod-results-reference{font-size:12px;padding:0 14px;overflow-wrap:anywhere}.bod-results button:focus-visible,.bod-results a:focus-visible,.bod-results summary:focus-visible{outline:3px solid #2867ad;outline-offset:3px}@media(max-width:600px){.bod-results-stats{grid-template-columns:1fr}.bod-results-panel{padding:14px}.bod-results-actions{width:100%}.bod-results-actions>*{flex:1;text-align:center}}';
    style.textContent += '.bod-admin-choice[hidden],.bod-admin-other[hidden]{display:none!important}.bod-search-label{display:block;max-width:460px;font-weight:700;font-size:14px;margin:16px 0}.bod-search-label input,.bod-admin-dialog input[type=search],.bod-admin-dialog textarea,.bod-admin-dialog select{display:block;width:100%;margin-top:7px;padding:12px;border:1px solid #9ba3ad;border-radius:8px;background:#fff;color:#161616;font:inherit}.bod-manage-actions{padding:0 14px 16px}.bod-manage-actions button{min-height:44px}.bod-admin-dialog{color:#161616;background:#f8f9fa;border:1px solid #707984;border-radius:16px;width:min(680px,calc(100vw - 24px));max-height:88dvh;padding:0;box-shadow:0 14px 60px #0007}.bod-admin-dialog::backdrop{background:#0008}.bod-admin-dialog header{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:18px;border-bottom:3px solid #c8102e;background:#111;color:#fff}.bod-admin-dialog header h2{margin:0 0 5px;font-size:23px}.bod-admin-dialog header p{font-size:12px;margin:0;color:#ddd;overflow-wrap:anywhere}.bod-admin-dialog button{min-height:44px;border:1px solid #888;border-radius:8px;padding:10px 15px;font:700 14px Arial,sans-serif;cursor:pointer;background:#fff;color:#161616}.bod-admin-dialog button:disabled{opacity:.6;cursor:wait}.bod-admin-dialog [data-bod-close]{flex:0 0 auto;background:transparent;color:#fff;border-color:#aaa}.bod-admin-body{padding:18px}.bod-admin-candidates{display:grid;grid-template-columns:1fr 1fr;gap:8px;max-height:32dvh;overflow:auto;padding:3px;margin:12px -3px}.bod-admin-choice{display:flex;gap:10px;align-items:center;padding:12px;border:1px solid #aeb6c0;border-radius:8px;background:#fff;font-size:14px;min-height:52px}.bod-admin-choice:has(input:checked){border-color:#c8102e;background:#fff0f2}.bod-admin-choice input{width:22px;height:22px;accent-color:#c8102e;flex:0 0 22px}.bod-admin-choice small{display:block;color:#555;margin-top:3px}.bod-admin-reason{display:block;margin-top:14px;font-size:14px;font-weight:700}.bod-admin-dialog textarea{resize:vertical;min-height:72px}.bod-admin-count{font-size:13px;font-weight:700;margin:10px 0}.bod-admin-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:18px}.bod-admin-dialog .bod-admin-save{background:#176c39;color:#fff;border-color:#176c39}.bod-admin-dialog .bod-admin-reset{color:#a10d25;border-color:#a10d25}.bod-admin-reset-check{background:#fff0f2;border:1px solid #a10d25;padding:14px;border-radius:8px;margin-top:14px;line-height:1.5}.bod-admin-status{line-height:1.5;font-size:14px;margin:12px 0 0;white-space:pre-wrap}.bod-admin-status:empty{display:none}.bod-admin-status[data-state=busy]{color:#6b4b00;background:#fff0b7;padding:10px;border-radius:7px}.bod-admin-status[data-state=error]{color:#a10d25}.bod-admin-status[data-state=saved]{color:#176c39}.bod-admin-dialog :focus-visible{outline:3px solid #2867ad;outline-offset:3px}[data-bod-name][hidden]{display:none!important}.bod-admin-toast{padding:12px;background:#dcf3e4;border-left:4px solid #176c39;border-radius:6px;color:#145c30}@media(max-width:600px){.bod-admin-dialog{width:calc(100vw - 16px);max-height:94dvh;border-radius:12px}.bod-admin-dialog header,.bod-admin-body{padding:14px}.bod-admin-candidates{grid-template-columns:1fr;max-height:35dvh}.bod-admin-actions>*{flex:1}.bod-admin-dialog button{min-height:48px}}';
    document.head.appendChild(style);
  }

  async function commitAdminChange(record,action,ids,reason,context) {
    const session=accessToken;
    if(!session)throw Error('Sign in again before changing nominations.');
    const actor=normalize(await getPortalAuditActor());
    if(!ADMIN_EMAILS.includes(actor))throw Error('Use the President or bsscvb Google account to manage nominations.');
    const fresh=await getSheetValues("'BOD Nominations 2027'!A:G",MEMBERSHIP_SPREADSHEET_ID);
    const operationId=crypto.randomUUID();
    const mutation=buildAdminMutation({rows:fresh,record,action,ids,reason,actor,candidates:context.candidates,nominationSheetId:context.nominationSheetId,auditSheetId:context.auditSheetId,at:new Date().toISOString(),operationId});
    if(accessToken!==session)throw Error('Your Google session changed. Refresh results before saving.');
    let response;
    try {
      response=await fetch('https://sheets.googleapis.com/v4/spreadsheets/'+MEMBERSHIP_SPREADSHEET_ID+':batchUpdate',{method:'POST',headers:{Authorization:'Bearer '+session,'Content-Type':'application/json'},body:JSON.stringify({requests:mutation.requests}),signal:AbortSignal.timeout(30000)});
    } catch(error) {
      // Never blindly repeat a possibly committed write after a connection failure.
      const history=await getSheetValues("'"+AUDIT_SHEET+"'!A:I",MEMBERSHIP_SPREADSHEET_ID).then(parseHistory).catch(()=>[]);
      if(history.some(item=>item.id===operationId))return;
      throw Error('The connection ended before saving could be confirmed. Refresh results and check Change history before trying again.');
    }
    if(!response.ok){const payload=await response.json().catch(()=>({}));throw Error(response.status===401?'Google access expired. Sign in again before saving.':response.status===403?'This Google account does not have permission to edit the membership workbook.':payload.error?.message||'Google Sheets could not save the change. Nothing was changed.');}
  }

  function openManager(record,context,onSaved) {
    document.querySelectorAll('.bod-admin-dialog').forEach(dialog=>dialog.remove());
    const dialog=document.createElement('dialog');dialog.className='bod-admin-dialog';dialog.setAttribute('aria-labelledby','bod-admin-title');
    const selected=new Set(record.ids);
    dialog.innerHTML=`<header><div><h2 id="bod-admin-title">${html(record.nominator)}</h2><p>Reference: ${html(record.reference)}</p></div><button type="button" data-bod-close aria-label="Close nomination editor">Close</button></header><div class="bod-admin-body"><label class="bod-search-label">Find a nominee<input type="search" data-bod-candidate-search placeholder="Name or road name" autocomplete="off"></label><p class="bod-admin-count" data-bod-admin-count></p><div class="bod-admin-candidates">${context.candidates.map(candidate=>`<label class="bod-admin-choice" data-bod-candidate-name="${html(normalize(candidate.name+' '+candidate.roadName))}"><input type="checkbox" value="${html(candidate.id)}" aria-label="Nominate ${html(candidate.name)}" ${selected.has(candidate.id)?'checked':''}><span><strong>${html(candidate.name)}</strong>${candidate.roadName?`<small>${html(candidate.roadName)}</small>`:''}</span></label>`).join('')}</div><label class="bod-admin-reason">Reason for this change<select data-bod-reason-choice required><option value="">Select a reason</option>${CHANGE_REASONS.map(([value,label])=>`<option value="${html(value)}">${html(label)}</option>`).join('')}</select></label><label class="bod-admin-reason bod-admin-other" data-bod-other-field hidden>Other reason<textarea data-bod-reason-detail maxlength="293" placeholder="Briefly explain the correction or reset"></textarea></label><div class="bod-admin-actions"><button class="bod-admin-save" type="button" data-bod-save>Save changes</button><button class="bod-admin-reset" type="button" data-bod-reset>Reset member</button></div><div class="bod-admin-reset-check" data-bod-reset-check hidden><strong>Remove this submission and let ${html(record.nominator)} submit again?</strong><p>Their current nominees will be removed from the live totals. The original submission stays in Change history.</p><div class="bod-admin-actions"><button class="bod-admin-reset" type="button" data-bod-confirm-reset>Yes, reset member</button><button type="button" data-bod-cancel-reset>Cancel reset</button></div></div><p class="bod-admin-status" data-bod-admin-status role="status" aria-live="polite"></p></div>`;
    document.body.appendChild(dialog);dialog.showModal();
    let saving=false;
    const $=selector=>dialog.querySelector(selector),status=(text,state='')=>{$('[data-bod-admin-status]').textContent=text;$('[data-bod-admin-status]').dataset.state=state;};
    const count=()=>{$('[data-bod-admin-count]').textContent=selected.size+' nominee'+(selected.size===1?'':'s')+' selected';};count();
    dialog.querySelectorAll('input[type=checkbox]').forEach(input=>input.addEventListener('change',()=>{input.checked?selected.add(input.value):selected.delete(input.value);count();$('[data-bod-reset-check]').hidden=true;}));
    $('[data-bod-candidate-search]').addEventListener('input',event=>{const q=normalize(event.target.value);dialog.querySelectorAll('[data-bod-candidate-name]').forEach(label=>{label.hidden=!label.dataset.bodCandidateName.includes(q);});});
    const close=()=>{if(saving)return;dialog.close();dialog.remove();context.returnFocus?.focus();};
    $('[data-bod-close]').addEventListener('click',close);dialog.addEventListener('cancel',event=>{if(saving)event.preventDefault();else{event.preventDefault();close();}});
    $('[data-bod-reason-choice]').addEventListener('change',()=>{const other=$('[data-bod-reason-choice]').value==='other';$('[data-bod-other-field]').hidden=!other;$('[data-bod-reason-detail]').required=other;if(other)$('[data-bod-reason-detail]').focus();status('');});
    $('[data-bod-reset]').addEventListener('click',()=>{$('[data-bod-reset-check]').hidden=false;$('[data-bod-confirm-reset]').focus();});
    $('[data-bod-cancel-reset]').addEventListener('click',()=>{$('[data-bod-reset-check]').hidden=true;$('[data-bod-reset]').focus();});
    async function save(action) {
      if(saving)return;
      let reason;
      try { reason=changeReason($('[data-bod-reason-choice]').value,$('[data-bod-reason-detail]').value); }
      catch(error){status(error.message,'error');$($('[data-bod-reason-choice]').value==='other'?'[data-bod-reason-detail]':'[data-bod-reason-choice]').focus();return;}
      if(action==='edit'&&!selected.size){status('Select at least one nominee, or choose Reset member.','error');return;}
      saving=true;dialog.querySelectorAll('button,input,textarea,select').forEach(control=>{control.disabled=true;});status(action==='reset'?'Resetting member…':'Saving changes…','busy');
      try {await commitAdminChange(record,action,[...selected],reason,context);status(action==='reset'?'Member reset. They can submit again.':'Nominees updated.','saved');dialog.close();dialog.remove();await onSaved(action==='reset'?record.nominator+' was reset and can submit again.':'Nominees updated for '+record.nominator+'.');}
      catch(error){saving=false;dialog.querySelectorAll('button,input,textarea,select').forEach(control=>{control.disabled=false;});status(error.message,'error');}
    }
    $('[data-bod-save]').addEventListener('click',()=>save('edit'));$('[data-bod-confirm-reset]').addEventListener('click',()=>save('reset'));
  }

  async function load(notice) {
    const request = ++sequence;
    if (!accessToken) return;
    currentMembershipSheet = SHEET;
    installStyle();
    const status = document.getElementById('membershipStatus'), target=document.getElementById('membershipContent');
    status.classList.remove('lifer-summary'); status.textContent='Loading BOD nominations from Google Sheets…';
    target.innerHTML='<div class="empty-state">Loading nomination results…</div>';
    const active = () => request===sequence && currentMembershipSheet===SHEET && moduleLoadingKey==='membership';
    try {
      const metadata = await fetchSheetRead('https://sheets.googleapis.com/v4/spreadsheets/'+MEMBERSHIP_SPREADSHEET_ID+'?fields=sheets.properties');
      const sheet = (metadata.sheets||[]).find(entry=>entry.properties?.title===SHEET);
      // The public form creates this private tab when the first submission is saved.
      const rows = sheet ? await getSheetValues("'BOD Nominations 2027'!A:G",MEMBERSHIP_SPREADSHEET_ID) : [];
      const model=buildModel(rows);
      let admin=false,adminError='',context=null,history=[];
      const actor=normalize(await getPortalAuditActor());
      if(ADMIN_EMAILS.includes(actor)&&sheet) {
        try {
          const candidateSheet=(metadata.sheets||[]).find(entry=>entry.properties?.title===CANDIDATE_SHEET),auditSheet=(metadata.sheets||[]).find(entry=>entry.properties?.title===AUDIT_SHEET);
          if(!candidateSheet||!auditSheet)throw Error('Nomination admin setup is not complete.');
          const [candidateRows,auditRows]=await Promise.all([getSheetValues("'"+CANDIDATE_SHEET+"'!A:D",MEMBERSHIP_SPREADSHEET_ID),getSheetValues("'"+AUDIT_SHEET+"'!A:I",MEMBERSHIP_SPREADSHEET_ID)]);
          if(!auditRows.length)throw Error('The nomination change-history header is missing.');history=parseHistory(auditRows);context={candidates:parseCandidates(candidateRows),nominationSheetId:sheet.properties.sheetId,auditSheetId:auditSheet.properties.sheetId};admin=true;
        } catch(error){adminError=error.message;}
      }
      if (!active()) return;
      const sourceUrl='https://docs.google.com/spreadsheets/d/'+MEMBERSHIP_SPREADSHEET_ID+'/edit'+(sheet?'#gid='+sheet.properties.sheetId:'');
      const updatedAt = new Date().toLocaleString('en-US',{timeZone:'America/New_York',timeZoneName:'short'});
      target.innerHTML=(typeof notice==='string'?'<p class="bod-admin-toast" role="status">'+html(notice)+'</p>':'')+markup(model,updatedAt,sourceUrl,admin)+(admin?historyMarkup(history):'')+(adminError?'<p class="bod-results-note" role="alert">Results are available, but administrative controls could not load: '+html(adminError)+'</p>':'');
      status.textContent='BOD Nominations 2027 · '+model.submissions.length+' member submission'+(model.submissions.length===1?'':'s');
      target.querySelector('[data-bod-refresh]').addEventListener('click',()=>load());
      target.querySelector('[data-bod-submitter-search]').addEventListener('input',event=>{const q=normalize(event.target.value);let matches=0;target.querySelectorAll('[data-bod-name]').forEach(details=>{details.hidden=!details.dataset.bodName.includes(q);if(!details.hidden)matches++;});target.querySelector('[data-bod-no-match]').hidden=matches>0||!model.submissions.length;});
      target.querySelectorAll('[data-bod-manage]').forEach(button=>button.addEventListener('click',()=>{const record=model.submissions.find(record=>record.reference===button.dataset.bodManage);if(record)openManager(record,{...context,returnFocus:button},load);}));
      target.querySelector('[data-bod-export]').addEventListener('click',()=>{
        const url=URL.createObjectURL(new Blob(['\ufeff'+tallyCsv(model)],{type:'text/csv;charset=utf-8'}));
        const link=document.createElement('a');link.href=url;link.download='BSSC_BOD_Nomination_Tally_2027.csv';document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
      });
    } catch (error) {
      if (!active()) return;
      status.textContent='BOD nomination results could not be loaded.';
      target.innerHTML='<div class="empty-state"><p>'+html(error.message)+'</p><button type="button" class="membership-tab" data-bod-retry>Try again</button></div>';
      target.querySelector('[data-bod-retry]').addEventListener('click',()=>load());
    }
  }
  if(typeof document!=='undefined')document.getElementById('bodAdministrationLink')?.addEventListener('click',()=>{currentMembershipSheet=SHEET;showModule('membership');});
  return {load,buildModel,tallyCsv,markup,buildAdminMutation,parseCandidates,parseHistory,historyMarkup,changeReason,CHANGE_REASONS};
});
