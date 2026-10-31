(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.BSSCBodNominations = api;
})(typeof window === 'undefined' ? globalThis : window, function () {
  'use strict';
  const SHEET = 'BOD Nominations 2027';
  let selectedYear=2027, discoveredSheets=[];
  function selectYear(value){selectedYear=yearSheets(value).year;return load();}
  function yearSheets(year) {
    year=Number(year);
    if(!Number.isInteger(year)||year<2000||year>2100)throw Error('Choose a valid nomination year.');
    return {year,nominations:'BOD Nominations '+year,candidates:'BOD Candidates '+year,audit:'BOD Nomination Changes '+year};
  }
  function availableYears(sheets=[]) {
    const years=new Set();
    Object.keys((typeof window!=='undefined'?window:globalThis).BSSCBodElectionHistoryData||{}).forEach(year=>years.add(Number(year)));
    sheets.forEach(entry=>{const match=/^BOD Nominations (20[0-9]{2}|2100)$/.exec(entry.properties?.title||'');if(match)years.add(Number(match[1]));});
    return [...years].filter(year=>Number.isInteger(year)&&year<=2027).sort((a,b)=>b-a);
  }
  function yearSelector(year,years) {
    return `<label class="bod-year-picker">Board service year <select data-bod-year aria-label="Board service year">${years.map(value=>`<option value="${value}" ${value===year?'selected':''}>${value}</option>`).join('')}</select></label>`;
  }
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

  const initials = name => String(name).trim().split(/\s+/).filter(Boolean).filter(word=>word!== '"').map(word=>word[0]).filter(Boolean).filter((_,i,list)=>i===0||i===list.length-1).join('').toUpperCase();
  const icon = name => {
    const paths={people:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M22 21v-2a4 4 0 0 0-3-3.87"/><circle cx="9" cy="7" r="4"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',nominees:'<path d="m9 12 2 2 4-4M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9Z"/><path d="M14 3v6h6"/>',total:'<path d="M4 19V9M12 19V5M20 19v-8M2 22h20"/>',refresh:'<path d="M20 7v5h-5M4 17v-5h5"/><path d="M6 6a8 8 0 0 1 13 2l1 4M4 12l1 4a8 8 0 0 0 13 2"/>',arrow:'<path d="M5 12h14m-5-5 5 5-5 5"/>',download:'<path d="M12 3v12m-4-4 4 4 4-4M5 17v4h14v-4"/>',edit:'<path d="m16 3 5 5-12 12-6 1 1-6Z"/><path d="m14 5 5 5"/>',reset:'<path d="M3 4v6h6M4 10a8 8 0 1 1 1 8"/>',clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'};
    return `<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${paths[name]||paths.nominees}</svg>`;
  };

  function markup(model, updatedAt, sourceUrl, admin = false, year = 2027, years = availableYears()) {
    const top=model.nominees[0]?.count||0,tied=model.nominees.filter(person=>person.count===top).length;
    const stats=[['Submissions',model.submissions.length,'members have submitted','people','submissions'],['Members nominated',model.nominees.length,'members on the nomination list','nominees','totals'],['Total nominations',model.total,'across all member submissions','total','totals']];
    let rank=0,previous=-1;
    return `<section class="bod-results" aria-label="BOD nomination results">
      <header class="bod-hero">${yearSelector(year,years)}<div class="bod-hero-top"><p class="bod-results-kicker">BONESHAKERS · BOARD OF DIRECTORS</p><span class="bod-connection"><i aria-hidden="true"></i>Connected</span></div><div class="bod-hero-main"><div><h2>Nominations <span>${year}</span></h2><p>Your board. Your members. Every nomination in one place.</p></div><div class="bod-results-actions"><button type="button" data-bod-refresh>${icon('refresh')}<span>Refresh totals</span></button><button type="button" data-bod-export ${model.nominees.length?'':'disabled'}>${icon('download')}<span>Export CSV</span></button></div></div><div class="bod-hero-footer"><span>${icon('clock')}Updated ${html(updatedAt)}</span>${admin?'<button type="button" data-bod-jump="bod-submissions">Manage submissions '+icon('arrow')+'</button>':''}</div></header>
      <div class="bod-results-stats">${stats.map(([label,value,caption,symbol,jump],i)=>`<button type="button" class="bod-stat bod-stat-${i}" data-bod-jump="bod-${jump}"><span class="bod-stat-top"><span>${html(label)}</span><i>${icon(symbol)}</i></span><strong>${value}</strong><span class="bod-stat-caption">${html(caption)}</span></button>`).join('')}</div>
      ${model.excluded?`<p class="bod-results-note" role="alert">${model.excluded} incomplete or invalid log row(s) excluded from the totals. Review the source sheet before using these results.</p>`:''}
      ${model.duplicates?`<p class="bod-results-note">${model.duplicates} duplicate or superseded row(s) excluded. Each member is counted once.</p>`:''}
      <div class="bod-dashboard-grid"><section class="bod-results-panel" id="bod-totals"><div class="bod-panel-heading"><div><p class="bod-panel-eyebrow">THE NOMINEES</p><h3>Nomination totals</h3></div><span class="bod-total-badge">${model.nominees.length} member${model.nominees.length===1?'':'s'}</span></div>
      ${top?`<div class="bod-tally-context"><span class="bod-context-mark" aria-hidden="true"></span><span>Top count: <strong>${top} nomination${top===1?'':'s'}</strong>${tied>1?` · ${tied} members tied`:''}</span></div>`:''}
      <ol class="bod-leaderboard">${model.nominees.map((person,index)=>{if(person.count!==previous){rank=index+1;previous=person.count;}return `<li class="bod-leader" ${index>=8?'data-bod-more-nominee hidden':''}><span class="bod-rank" aria-label="Rank ${rank}">${String(rank).padStart(2,'0')}</span><div class="bod-leader-identity"><strong>${html(person.name)}</strong><div class="bod-tally-track" aria-hidden="true"><span style="width:${Math.max(5,Math.round(person.count/top*100))}%"></span></div></div><span class="bod-leader-count"><strong>${person.count}</strong><small>${person.count===1?'nomination':'nominations'}</small></span></li>`;}).join('')}</ol>
      ${model.nominees.length>8?`<button class="bod-panel-more" type="button" data-bod-totals-toggle aria-expanded="false">View all ${model.nominees.length} nominees ${icon('arrow')}</button>`:''}
      ${!model.nominees.length?`<div class="bod-empty">${icon('nominees')}<strong>${model.excluded?'No valid submissions are available.':'No nominations received yet.'}</strong><p>${model.excluded?'Review the source sheet.':'Member nominations will appear here after submission.'}</p></div>`:''}
      </section>
      <section class="bod-results-panel" id="bod-submissions"><div class="bod-panel-heading"><div><p class="bod-panel-eyebrow">MEMBER ACTIVITY</p><h3>Member submissions</h3></div><span class="bod-total-badge">${model.submissions.length}</span></div><p class="bod-panel-intro">${admin?'Tap a member to view or correct their choices.':'See which members have submitted and who they nominated.'}</p>
      <label class="bod-search-label"><span>Find a member</span><input type="search" data-bod-submitter-search placeholder="Search submitter’s name…" autocomplete="off"></label>
      <div class="bod-submission-list">${model.submissions.map((record,index)=>`<article class="bod-submission-card" data-bod-name="${html(normalize(record.nominator))}" data-bod-submission-index="${index}" ${index>=6?'hidden':''}><div class="bod-submission-head"><span class="bod-avatar" aria-hidden="true">${html(initials(record.nominator))}</span><div>${admin?`<button class="bod-member-name" type="button" data-bod-manage="${html(record.reference)}" aria-label="Manage nominations for ${html(record.nominator)}">${html(record.nominator)}</button>`:`<h4>${html(record.nominator)}</h4>`}<span class="bod-submission-time">${html(record.timestamp)}</span></div><span class="bod-submission-number">${record.names.length}<small>selected</small></span></div><div class="bod-choice-tags">${record.names.slice(0,3).map(name=>`<span>${html(name)}</span>`).join('')}${record.names.length>3?`<span class="bod-tag-more">+${record.names.length-3} more</span>`:''}</div>${admin?`<div class="bod-card-actions"><button type="button" data-bod-manage="${html(record.reference)}">${icon('edit')}Edit nominees</button><button type="button" data-bod-manage="${html(record.reference)}" data-bod-action="reset" class="bod-card-reset">${icon('reset')}Reset member</button></div>`:`<details class="bod-readonly-detail"><summary>View all ${record.names.length} nominee${record.names.length===1?'':'s'}</summary><ul>${record.names.map(name=>`<li>${html(name)}</li>`).join('')}</ul></details>`}</article>`).join('')}</div>
      ${model.submissions.length>6?`<button class="bod-panel-more" type="button" data-bod-submissions-toggle aria-expanded="false">View all ${model.submissions.length} submissions ${icon('arrow')}</button>`:''}<p class="bod-empty-search" data-bod-no-match hidden>No member matches that name.</p>${!model.submissions.length?`<div class="bod-empty">${icon('people')}<strong>No member submissions yet</strong><p>Submissions will appear here as members nominate.</p></div>`:''}</section></div>
      <footer class="bod-dashboard-footer"><a target="_blank" rel="noopener noreferrer" href="${html(sourceUrl)}">Open source sheet ↗</a></footer>
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
    return `<section class="bod-results bod-results-panel bod-history-panel" id="bod-history"><div class="bod-panel-heading"><div><h3>Change history</h3></div><span class="bod-total-badge">${history.length} change${history.length===1?'':'s'}</span></div><div class="bod-cleanup-actions"><label><input type="checkbox" data-bod-history-all> Select all changes</label><button type="button" data-bod-history-delete>Delete selected test history</button><button type="button" data-bod-history-restore>Restore deleted history</button><p>Deletes history entries only; nomination totals and member submissions stay as they are. Deleted entries can be restored.</p><p data-bod-cleanup-status role="status"></p></div><div class="bod-history-list">${history.map((item,index)=>`<article class="bod-history-row" ${index>=5?'data-bod-more-history hidden':''}><label><input type="checkbox" data-bod-history-select="${html(item.id)}" aria-label="Select history for ${html(item.name)}" ${item.id?'':'disabled'}></label><span class="bod-history-icon" aria-hidden="true">${icon(item.action==='reset'?'reset':'edit')}</span><div class="bod-history-copy"><div class="bod-history-top"><div><strong>${html(item.name)}</strong><span class="bod-history-kind ${item.action==='reset'?'reset':''}">${item.action==='reset'?'Member reset':'Selections updated'}</span></div><time>${html(formatHistoryTime(item.at))}</time></div><p>${html(item.reason)}</p><small>${html(item.actor)} · ${html(item.reference)}</small></div></article>`).join('')||'<p class="bod-history-empty">No corrections or resets yet. Each change will be recorded here.</p>'}</div>${history.length>5?'<button class="bod-panel-more" type="button" data-bod-history-toggle aria-expanded="false">View recent changes '+icon('arrow')+'</button>':''}</section>`;
  }
  function formatHistoryTime(value) {
    const date=new Date(value);
    return Number.isNaN(date.getTime())?value:date.toLocaleString('en-US',{timeZone:'America/New_York',year:'numeric',month:'short',day:'numeric',hour:'numeric',minute:'2-digit',timeZoneName:'short'});
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
    style.textContent=`
.bod-results{--bod-red:#c8102e;--bod-ink:#16191f;--bod-muted:#69717d;color:var(--bod-ink);font-family:Arial,Helvetica,sans-serif;max-width:1440px;margin:auto}
.bod-results *{box-sizing:border-box}.bod-results button,.bod-results input{font-family:inherit}.bod-results button{cursor:pointer}.bod-results button:disabled{opacity:.45;cursor:default}.bod-results svg{width:20px;height:20px;flex:0 0 20px}.bod-hero{position:relative;border-radius:20px;padding:24px 28px 48px;background:radial-gradient(ellipse at 100% 0,#66152955,transparent 55%),linear-gradient(115deg,#15161c,#24252d);color:#fff;overflow:hidden;border:1px solid #34353b;border-top:4px solid var(--bod-red)}.bod-hero-top{display:flex;align-items:center;justify-content:space-between;gap:12px}.bod-results-kicker{margin:0;font-size:10px;font-weight:800;letter-spacing:2px;color:#d2d4db}.bod-connection{display:inline-flex;gap:7px;align-items:center;padding:6px 9px;border:1px solid #ffffff24;border-radius:99px;font-size:10px;color:#dbe6df;white-space:nowrap}.bod-connection i{width:6px;height:6px;border-radius:50%;background:#53d48e;box-shadow:0 0 0 3px #53d48e15}.bod-hero-main{display:flex;justify-content:space-between;gap:22px;align-items:center;margin-top:20px}.bod-hero h2{margin:0;font-size:36px;font-weight:850;letter-spacing:-1.4px;line-height:1.1;color:#fff}.bod-hero h2 span{color:#ff6079}.bod-hero-main p{margin:10px 0 0;font-size:13px;line-height:1.5;color:#bfc2cb}.bod-results-actions{display:flex;gap:9px;flex-wrap:wrap}.bod-results-actions button{min-height:43px;display:inline-flex;align-items:center;justify-content:center;gap:8px;border:1px solid #ffffff35;border-radius:10px;padding:11px 14px;background:#ffffff09;color:#fff;font-size:12px;font-weight:700;white-space:nowrap}.bod-results-actions button[data-bod-refresh]{background:var(--bod-red);border-color:var(--bod-red)}.bod-results-actions button:hover{filter:brightness(1.1)}.bod-hero-footer{margin-top:24px;display:flex;justify-content:space-between;align-items:center;gap:14px}.bod-hero-footer>span{display:flex;gap:6px;align-items:center;font-size:10px;color:#9da3af}.bod-hero-footer svg{width:14px;height:14px;flex-basis:14px}.bod-hero-footer button{display:flex;align-items:center;gap:8px;border:0;background:transparent;color:#fff;font-size:11px;font-weight:700;padding:4px}.bod-results-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;margin:-23px 20px 23px;position:relative}.bod-stat{display:block;text-align:left;border:1px solid #e1e3e8;border-radius:14px;padding:17px 20px;background:#fff;color:var(--bod-ink);box-shadow:0 6px 18px #1d263b09}.bod-stat:hover{border-color:#d5a4ad}.bod-stat-top{display:flex;justify-content:space-between;align-items:center;gap:8px;font-size:12px;font-weight:700;color:#656d78}.bod-stat-top i{background:#fff0f3;color:var(--bod-red);border-radius:10px;display:grid;place-items:center;width:32px;height:32px;flex:0 0 32px}.bod-stat strong{font-size:38px;line-height:1;letter-spacing:-1.5px;display:block;margin:6px 0 9px}.bod-stat-caption{display:block;color:#727b88;font-size:11px;line-height:1.4}.bod-stat-2{background:#fff9fa;border-color:#efcdd4}.bod-stat-2 strong{color:#b4102b}.bod-dashboard-grid{display:grid;grid-template-columns:minmax(0,1.13fr) minmax(0,1fr);gap:20px;align-items:start}.bod-results-panel{min-width:0;background:#fff;border:1px solid #e0e3e8;border-radius:16px;padding:22px;box-shadow:0 3px 12px #1b243604;scroll-margin-top:100px}.bod-panel-heading{display:flex;justify-content:space-between;align-items:center;gap:12px}.bod-panel-eyebrow{font-size:10px;font-weight:800;letter-spacing:1.5px;color:#9299a4;margin:0 0 5px}.bod-panel-heading h3{font-size:20px;letter-spacing:-.5px;margin:0;color:#1b2028}.bod-total-badge{border-radius:8px;border:1px solid #e7e9ee;background:#f6f7f9;padding:6px 9px;color:#737b88;font-size:10px;white-space:nowrap}.bod-panel-intro{font-size:12px;line-height:1.5;color:#7e8592;margin:9px 0 13px}.bod-tally-context{display:flex;gap:7px;align-items:center;padding:10px 12px;border-radius:8px;background:#fcf0f3;color:#8f2036;margin:17px 0 7px;font-size:11px;line-height:1.5}.bod-context-mark{width:5px;height:5px;border-radius:50%;background:var(--bod-red);flex:0 0 5px}.bod-leaderboard{list-style:none;margin:0;padding:0}.bod-leader{display:flex;align-items:center;gap:12px;padding:17px 0;border-bottom:1px solid #f0f1f5}.bod-rank{font-size:11px;font-weight:800;color:#969eab;flex:0 0 24px}.bod-leader:first-child .bod-rank{color:var(--bod-red)}.bod-leader-identity{flex:1;min-width:0}.bod-leader-identity>strong{display:block;font-size:15px;overflow-wrap:anywhere;margin:0 0 9px;line-height:1.25}.bod-tally-track{height:5px;border-radius:8px;background:#f0f1f5;overflow:hidden;width:100%}.bod-tally-track span{display:block;height:100%;border-radius:8px;background:linear-gradient(90deg,#e96b80,#c8102e)}.bod-leader-count{text-align:right;min-width:62px;flex:0 0 62px}.bod-leader-count>strong{font-size:20px;letter-spacing:-.7px;display:block;line-height:1}.bod-leader-count small{display:block;margin-top:4px;font-size:10px;color:#9aa0ab}.bod-panel-footnote{font-size:11px;color:#9299a4;line-height:1.5;margin:15px 0 0}.bod-panel-more{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;border:1px solid #e4e7ed;border-radius:8px;margin-top:14px;padding:11px;background:#f8f9fb;color:#555f6e;font-size:11px;font-weight:700;min-height:42px}.bod-panel-more svg{width:14px;height:14px;flex-basis:14px}.bod-results .bod-search-label{display:block;max-width:none;margin:0 0 16px;font-size:10px;font-weight:700;color:#777f8c}.bod-results .bod-search-label>span{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)}.bod-results .bod-search-label input{display:block;box-sizing:border-box;width:100%;border:1px solid #e0e4ec;border-radius:9px;background:#f8f9fb;color:#263040;font:13px Arial,sans-serif;padding:12px 13px;min-height:41px;margin:0}.bod-submission-list{display:grid;gap:11px}.bod-submission-card{border:1px solid #e4e7ed;border-radius:12px;padding:14px;background:#fff}.bod-submission-card:hover{border-color:#d2d6e0}.bod-submission-head{display:flex;align-items:center;gap:10px}.bod-avatar{display:grid;place-items:center;width:35px;height:35px;flex:0 0 35px;border-radius:10px;background:#f3f1f5;border:1px solid #e9e4ec;color:#735969;font-size:11px;font-weight:800}.bod-submission-head>div{flex:1;min-width:0}.bod-member-name{border:0!important;background:transparent!important;color:#272d37!important;padding:0!important;min-height:0!important;text-align:left;font-size:14px!important;font-weight:800!important;line-height:1.4;overflow-wrap:anywhere}.bod-member-name:hover{text-decoration:underline}.bod-submission-head h4{font-size:14px;margin:0;overflow-wrap:anywhere}.bod-submission-time{display:block;font-size:11px;color:#9aa0aa;margin-top:4px;line-height:1.5}.bod-submission-number{font-size:17px;font-weight:800;text-align:center;flex:0 0 45px;color:#343b48}.bod-submission-number small{display:block;font-size:8px;font-weight:400;color:#9198a4;margin-top:3px}.bod-choice-tags{display:flex;flex-wrap:wrap;gap:5px;margin:12px 0}.bod-choice-tags>span{display:inline-block;border-radius:5px;background:#f4f5f8;color:#596474;padding:5px 8px;font-size:11px;line-height:1.3}.bod-choice-tags .bod-tag-more{color:#a42a41;background:#fff0f3}.bod-card-actions{display:flex;gap:8px;padding-top:10px;border-top:1px solid #f0f2f6}.bod-card-actions button{display:flex;align-items:center;justify-content:center;gap:5px;flex:1;min-height:40px;font-size:12px;font-weight:700;padding:8px;border-radius:7px;border:1px solid #dfe3eb;background:#fafbfc;color:#485466}.bod-card-actions button svg{width:12px;height:12px;flex-basis:12px}.bod-card-actions .bod-card-reset{flex:0 0 auto;background:#fff;border-color:#f0d8de;color:#a9364b}.bod-dashboard-footer{display:flex;justify-content:space-between;gap:14px;flex-wrap:wrap;margin:18px 0;color:#9299a4;font-size:10px;line-height:1.5}.bod-dashboard-footer a{color:#6d7786;text-decoration:none;font-weight:700}.bod-empty{text-align:center;padding:32px 12px;color:#8b94a1}.bod-empty>svg{width:30px;height:30px;display:block;margin:0 auto 12px;color:#bc7a88}.bod-empty strong{display:block;font-size:13px;color:#626d7d}.bod-empty p{font-size:11px;line-height:1.6;margin:7px 0}.bod-empty-search{font-size:12px;color:#8b94a1;padding:20px;text-align:center}.bod-results-note{background:#fff6df;border:1px solid #ead6a3;border-left:3px solid #c9a13e;border-radius:8px;font-size:12px;padding:13px;margin:12px 0;line-height:1.5}.bod-readonly-detail{font-size:10px;line-height:1.8;color:#657182}.bod-readonly-detail summary{cursor:pointer;font-weight:700}.bod-history-panel{margin-top:20px}.bod-history-list{display:grid;gap:0;margin-top:10px}.bod-history-row{display:flex;gap:12px;align-items:flex-start;padding:15px 0;border-top:1px solid #f0f1f5}.bod-history-icon{width:30px;height:30px;flex:0 0 30px;border:1px solid #e6e9ef;border-radius:8px;display:grid;place-items:center;background:#fafbfc;color:#7a8493}.bod-history-icon svg{width:14px;height:14px;flex-basis:14px}.bod-history-copy{flex:1;min-width:0}.bod-history-top{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}.bod-history-top strong{font-size:12px}.bod-history-top time{font-size:9px;color:#969eaa}.bod-history-copy p{font-size:11px;color:#6d7787;margin:6px 0;line-height:1.5}.bod-history-copy small{font-size:9px;color:#9aa1ad;overflow-wrap:anywhere}.bod-history-kind{font-size:8px;padding:3px 6px;border-radius:5px;background:#f1f4f8;color:#707d90;margin-left:7px;white-space:nowrap}.bod-history-kind.reset{background:#fff0f3;color:#b04358}.bod-history-empty{font-size:12px;line-height:1.5;color:#959daa;padding:14px 0}.bod-results [hidden]{display:none!important}.bod-results button:focus-visible,.bod-results a:focus-visible,.bod-results input:focus-visible,.bod-results summary:focus-visible{outline:3px solid #2867ad;outline-offset:3px}
@media(max-width:1100px){.bod-hero-main{align-items:flex-start}.bod-results-actions{flex-direction:column}.bod-results-actions button{min-height:38px}.bod-hero h2{font-size:31px}.bod-dashboard-grid{gap:14px}.bod-results-panel{padding:18px}.bod-stat{padding:16px}.bod-card-actions{gap:5px}}
@media(max-width:800px){.bod-dashboard-grid{grid-template-columns:1fr}.bod-results-actions{flex-direction:row}.bod-hero-main{flex-wrap:wrap}.bod-hero{padding:20px 20px 43px;border-radius:15px}.bod-results-stats{margin:-21px 12px 18px;gap:9px}.bod-stat{padding:12px}.bod-stat strong{font-size:31px}.bod-stat-top{font-size:10px}.bod-stat-top i{width:26px;height:26px;flex-basis:26px;border-radius:8px}.bod-stat-top svg{width:15px;height:15px;flex-basis:15px}.bod-stat-caption{font-size:9px}.bod-panel-heading h3{font-size:20px}.bod-card-actions button{min-height:43px}.bod-member-name{min-height:32px!important}.bod-panel-more{min-height:44px}.bod-leader-identity>strong{font-size:14px}.bod-submission-head h4,.bod-member-name{font-size:15px!important}}
@media(max-width:460px){.bod-hero{padding:17px 16px 42px}.bod-hero-top{align-items:flex-start}.bod-results-kicker{font-size:8px;letter-spacing:1.3px;line-height:1.6;max-width:165px}.bod-connection{font-size:8px;padding:5px 7px}.bod-hero-main{margin-top:17px;gap:17px}.bod-hero h2{font-size:30px;letter-spacing:-1px}.bod-hero-main p{font-size:11px;max-width:250px;line-height:1.6}.bod-results-actions{width:100%}.bod-results-actions button{font-size:11px;min-height:43px;flex:1;padding:10px}.bod-results-actions button svg{width:16px;height:16px;flex-basis:16px}.bod-hero-footer{margin-top:17px;align-items:flex-start;flex-direction:column;gap:13px}.bod-hero-footer>span{font-size:8px}.bod-hero-footer button{font-size:10px;padding:3px 0}.bod-results-stats{gap:6px;margin-left:8px;margin-right:8px}.bod-stat{padding:11px 9px;border-radius:10px}.bod-stat-top{font-size:10px;line-height:1.5;align-items:flex-start}.bod-stat-top i{display:none}.bod-stat strong{font-size:29px;margin:9px 0 6px}.bod-stat-caption{display:none}.bod-results-panel{padding:16px;border-radius:13px}.bod-panel-eyebrow{font-size:8px}.bod-panel-heading h3{font-size:18px}.bod-total-badge{font-size:9px}.bod-leader{gap:8px}.bod-rank{flex-basis:21px;font-size:10px}.bod-leader-count{min-width:55px;flex-basis:55px}.bod-leader-count small{font-size:9px}.bod-submission-card{padding:12px}.bod-avatar{width:32px;height:32px;flex-basis:32px}.bod-choice-tags>span{font-size:11px}.bod-card-actions button{font-size:12px;min-height:44px}.bod-dashboard-footer{font-size:9px}.bod-history-row{gap:9px}.bod-history-icon{width:26px;height:26px;flex-basis:26px}}
    `;

    style.textContent += '.bod-year-picker{display:flex;align-items:center;gap:12px;font-size:14px;font-weight:700;color:#fff;margin-bottom:20px}.bod-year-picker select{font:inherit;color:#fff;background:#292929;border:1px solid #aaa;border-radius:8px;min-height:44px;padding:8px 36px 8px 12px}' + '.bod-admin-choice[hidden],.bod-admin-other[hidden]{display:none!important}.bod-search-label{display:block;max-width:460px;font-weight:700;font-size:14px;margin:16px 0}.bod-search-label input,.bod-admin-dialog input[type=search],.bod-admin-dialog textarea,.bod-admin-dialog select{display:block;width:100%;margin-top:7px;padding:12px;border:1px solid #9ba3ad;border-radius:8px;background:#fff;color:#161616;font:inherit}.bod-manage-actions{padding:0 14px 16px}.bod-manage-actions button{min-height:44px}.bod-admin-dialog{color:#161616;background:#f8f9fa;border:1px solid #707984;border-radius:16px;width:min(680px,calc(100vw - 24px));max-height:88dvh;padding:0;box-shadow:0 14px 60px #0007}.bod-admin-dialog::backdrop{background:#0008}.bod-admin-dialog header{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:18px;border-bottom:3px solid #c8102e;background:#111;color:#fff}.bod-admin-dialog header h2{margin:0 0 5px;font-size:23px}.bod-admin-dialog header p{font-size:12px;margin:0;color:#ddd;overflow-wrap:anywhere}.bod-admin-dialog button{min-height:44px;border:1px solid #888;border-radius:8px;padding:10px 15px;font:700 14px Arial,sans-serif;cursor:pointer;background:#fff;color:#161616}.bod-admin-dialog button:disabled{opacity:.6;cursor:wait}.bod-admin-dialog [data-bod-close]{flex:0 0 auto;background:transparent;color:#fff;border-color:#aaa}.bod-admin-body{padding:18px}.bod-admin-candidates{display:grid;grid-template-columns:1fr 1fr;gap:8px;max-height:32dvh;overflow:auto;padding:3px;margin:12px -3px}.bod-admin-choice{display:flex;gap:10px;align-items:center;padding:12px;border:1px solid #aeb6c0;border-radius:8px;background:#fff;font-size:14px;min-height:52px}.bod-admin-choice:has(input:checked){border-color:#c8102e;background:#fff0f2}.bod-admin-choice input{width:22px;height:22px;accent-color:#c8102e;flex:0 0 22px}.bod-admin-choice small{display:block;color:#555;margin-top:3px}.bod-admin-reason{display:block;margin-top:14px;font-size:14px;font-weight:700}.bod-admin-dialog textarea{resize:vertical;min-height:72px}.bod-admin-count{font-size:13px;font-weight:700;margin:10px 0}.bod-admin-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:18px}.bod-admin-dialog .bod-admin-save{background:#176c39;color:#fff;border-color:#176c39}.bod-admin-dialog .bod-admin-reset{color:#a10d25;border-color:#a10d25}.bod-admin-reset-check{background:#fff0f2;border:1px solid #a10d25;padding:14px;border-radius:8px;margin-top:14px;line-height:1.5}.bod-admin-status{line-height:1.5;font-size:14px;margin:12px 0 0;white-space:pre-wrap}.bod-admin-status:empty{display:none}.bod-admin-status[data-state=busy]{color:#6b4b00;background:#fff0b7;padding:10px;border-radius:7px}.bod-admin-status[data-state=error]{color:#a10d25}.bod-admin-status[data-state=saved]{color:#176c39}.bod-admin-dialog :focus-visible{outline:3px solid #2867ad;outline-offset:3px}[data-bod-name][hidden]{display:none!important}.bod-admin-toast{padding:12px;background:#dcf3e4;border-left:4px solid #176c39;border-radius:6px;color:#145c30}@media(max-width:600px){.bod-admin-dialog{width:calc(100vw - 16px);max-height:94dvh;border-radius:12px}.bod-admin-dialog header,.bod-admin-body{padding:14px}.bod-admin-candidates{grid-template-columns:1fr;max-height:35dvh}.bod-admin-actions>*{flex:1}.bod-admin-dialog button{min-height:48px}}';
    style.textContent += '.bod-cleanup-actions{margin:16px 0;padding:14px;border:1px solid #e0e3e8;border-radius:10px;background:#f8f9fb}.bod-cleanup-actions button,#bod-invitations button{min-height:44px;padding:10px 14px;margin:6px;border:1px solid #b8bec7;border-radius:8px;background:#fff;color:#333;font-weight:700}.bod-cleanup-actions p,#bod-invitations p{font-size:13px;line-height:1.6}.bod-cleanup-actions input,.bod-history-row input{width:20px;height:20px;accent-color:#c8102e}.bod-admin-dialog input[type=date]{display:block;padding:10px;border:1px solid #888;border-radius:6px;font:inherit;margin:8px 0}.bod-admin-dialog li{margin:12px 0;overflow-wrap:anywhere}.bod-cleanup-actions label{display:flex;align-items:center;gap:8px}';
    style.textContent += '.bod-response-table{width:100%;border-collapse:collapse;margin-top:18px;font-size:14px}.bod-response-table th,.bod-response-table td{text-align:left;padding:14px 10px;border-bottom:1px solid #e6e8ed}.bod-response-badge{display:inline-block;padding:6px 10px;border-radius:6px;font-size:12px;font-weight:700}.bod-response-badge.accepted{background:#def3e7;color:#17643b}.bod-response-badge.declined{background:#fce3e6;color:#a51f2e}.bod-response-badge.waiting{background:#eef0f4;color:#5c6674}.bod-email-preview{max-height:48vh;overflow:auto;border:1px solid #dce0e7;border-radius:10px;margin:18px 0;background:#f2f3f5}.bod-response-table td{overflow-wrap:anywhere}@media(max-width:600px){.bod-response-table{font-size:12px}.bod-response-table th,.bod-response-table td{padding:12px 5px}}';
    document.head.appendChild(style);
  }

  async function commitAdminChange(record,action,ids,reason,context) {
    const session=accessToken;
    if(!session)throw Error('Sign in again before changing nominations.');
    const actor=normalize(await getPortalAuditActor());
    if(!ADMIN_EMAILS.includes(actor))throw Error('Use the President or bsscvb Google account to manage nominations.');
    const fresh=await getSheetValues("'"+context.nominationSheet+"'!A:G",MEMBERSHIP_SPREADSHEET_ID);
    const operationId=crypto.randomUUID();
    const mutation=buildAdminMutation({rows:fresh,record,action,ids,reason,actor,candidates:context.candidates,nominationSheetId:context.nominationSheetId,auditSheetId:context.auditSheetId,at:new Date().toISOString(),operationId});
    if(accessToken!==session)throw Error('Your Google session changed. Refresh results before saving.');
    let response;
    try {
      response=await fetch('https://sheets.googleapis.com/v4/spreadsheets/'+MEMBERSHIP_SPREADSHEET_ID+':batchUpdate',{method:'POST',headers:{Authorization:'Bearer '+session,'Content-Type':'application/json'},body:JSON.stringify({requests:mutation.requests}),signal:AbortSignal.timeout(30000)});
    } catch(error) {
      // Never blindly repeat a possibly committed write after a connection failure.
      const history=await getSheetValues("'"+context.auditSheet+"'!A:I",MEMBERSHIP_SPREADSHEET_ID).then(parseHistory).catch(()=>[]);
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
    if(context.initialReset){$('[data-bod-reset-check]').hidden=false;$('[data-bod-reason-choice]').focus();}
  }

  function bindDashboard(target,model,context,onSaved=load) {
    target.querySelectorAll('[data-bod-jump]').forEach(button=>button.addEventListener('click',()=>{
      const panel=target.querySelector('#'+button.dataset.bodJump);if(!panel)return;
      panel.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
    }));
    const totalsToggle=target.querySelector('[data-bod-totals-toggle]');
    totalsToggle?.addEventListener('click',()=>{const expand=totalsToggle.getAttribute('aria-expanded')!=='true';totalsToggle.setAttribute('aria-expanded',String(expand));target.querySelectorAll('[data-bod-more-nominee]').forEach(row=>{row.hidden=!expand;});totalsToggle.innerHTML=(expand?'Show fewer nominees':'View all '+model.nominees.length+' nominees')+' '+icon('arrow');});
    let allSubmissions=false;
    const search=target.querySelector('[data-bod-submitter-search]'),submissionsToggle=target.querySelector('[data-bod-submissions-toggle]');
    function filterSubmissions(){const q=normalize(search.value);let matches=0;target.querySelectorAll('[data-bod-name]').forEach(card=>{const match=card.dataset.bodName.includes(q);if(match)matches++;card.hidden=!match||(!q&&!allSubmissions&&Number(card.dataset.bodSubmissionIndex)>=6);});target.querySelector('[data-bod-no-match]').hidden=matches>0||!model.submissions.length;if(submissionsToggle)submissionsToggle.hidden=!!q;}
    search.addEventListener('input',filterSubmissions);
    submissionsToggle?.addEventListener('click',()=>{allSubmissions=!allSubmissions;submissionsToggle.setAttribute('aria-expanded',String(allSubmissions));submissionsToggle.innerHTML=(allSubmissions?'Show fewer submissions':'View all '+model.submissions.length+' submissions')+' '+icon('arrow');filterSubmissions();});
    target.querySelectorAll('[data-bod-manage]').forEach(button=>button.addEventListener('click',()=>{const record=model.submissions.find(record=>record.reference===button.dataset.bodManage);if(record&&context)openManager(record,{...context,returnFocus:button,initialReset:button.dataset.bodAction==='reset'},onSaved);}));
    const historyToggle=target.querySelector('[data-bod-history-toggle]');
    historyToggle?.addEventListener('click',()=>{const expand=historyToggle.getAttribute('aria-expanded')!=='true';historyToggle.setAttribute('aria-expanded',String(expand));target.querySelectorAll('[data-bod-more-history]').forEach(row=>{row.hidden=!expand;});historyToggle.innerHTML=(expand?'Show fewer changes':'View recent changes')+' '+icon('arrow');});
  }

  const RESPONSE_ORIGIN='https://bssc-nominee-responses.toddhumphrey931.chatgpt.site';
  const INVITE_HEADERS=['Nominee','Email','Status','Updated At','Sender','Gmail Message ID','Body'];
  const REQUIREMENTS_URL='https://boneshakerssocialclub.com/requirements-to-serve';
  const sheetRange=(name,range)=>"'"+name.replace(/'/g,"''")+"'!"+range;
  const cellRows=values=>({values:values.map(value=>({userEnteredValue:{stringValue:String(value??'')}}))});
  function cleanupRequests(rows,ids,auditId,archiveId,actor,at) {
    parseHistory(rows);
    const wanted=new Set(ids),found=new Set(),requests=[],archive=[];
    rows.slice(1).forEach((row,index)=>{if(!wanted.has(String(row[8]||'')))return;if(found.has(row[8]))throw Error('Duplicate change IDs. Review the source sheet.');found.add(row[8]);archive.push(cellRows([...Array.from({length:9},(_,i)=>row[i]||''),at,actor]));requests.push({repeatCell:{range:{sheetId:auditId,startRowIndex:index+1,endRowIndex:index+2,startColumnIndex:0,endColumnIndex:9},cell:{},fields:'userEnteredValue'}});});
    if(!wanted.size||found.size!==wanted.size)throw Error('Selected history changed. Refresh before deleting.');
    return [{appendCells:{sheetId:archiveId,rows:archive,fields:'userEnteredValue'}},...requests];
  }
  function invitationText(name,year,deadline,links) {
    return `Hello ${name},\n\nCongratulations! You were nominated at our November general membership meeting to serve on the BoneShakers Social Club Board of Directors for ${year}. Your fellow members recognize the contribution you could make to our club and community.\n\nWe would like to know whether you are interested in accepting this nomination and being considered in the December election. Before deciding, please review the Board Service Requirements and Expectations:\n${REQUIREMENTS_URL}\n\nBoard service includes:\n• Meeting the membership, good-standing, renewal and attendance qualifications verified by the Secretary.\n• Preparing for and attending Board and general membership meetings.\n• Supporting club events, community service and fundraising.\n• Completing assigned work and communicating between meetings.\n• Protecting confidential information, disclosing conflicts and following our bylaws and operating policies.\n\nPlease respond${deadline?' by '+deadline:''} using one of the buttons below. You will confirm your choice on a secure page, and your response will be recorded for club leadership.\n\nDo you accept the ${year} BoneShakers Social Club Board of Directors nomination?\nYes, I Accept${links?': '+links.yes:''}\nNo, I Decline${links?': '+links.no:''}\n\nYou are welcome to reply to this email with questions about the responsibilities or time commitment.\n\nAccepting a nomination places your name into consideration; it does not mean you have been elected or assigned an officer position. Voting will take place at our December general membership meeting.\n\nThank you for considering this opportunity to serve. We appreciate everything you do to support BoneShakers.\n\nWith appreciation,\nTodd Humphrey\nPresident, BoneShakers Social Club`;
  }
  function invitationRecipients(model,roster) {
    const headers=(roster[0]||[]).map(normalize),first=headers.indexOf('first name'),last=headers.indexOf('last name'),email=headers.indexOf('email');
    if([first,last,email].some(i=>i<0))throw Error('Roster First Name, Last Name and Email columns are required.');
    return model.nominees.map(person=>{
      const matches=roster.slice(1).filter(row=>normalize([row[first],row[last]].map(v=>String(v||'').trim()).join(' '))===normalize(person.name));
      const address=matches.length===1?String(matches[0][email]||'').trim().toLowerCase():'';
      return {name:person.name,email:address,error:matches.length!==1?'No unique roster match':!/^[a-z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(address)?'Missing or invalid roster email':''};
    });
  }
  function invitationHtml(name,year,deadline,links) {
    const text=invitationText(name,year,deadline,links);
    const intro=text.split('Please respond')[0];
    const outro=text.split('You are welcome to reply')[1];
    const paragraphs=value=>value.split('\n\n').map(p=>'<p style="margin:0 0 18px;line-height:1.65">'+html(p).replace(/\n/g,'<br>')+'</p>').join('');
    const button=(url,label,color)=>`<a href="${html(url)}" style="display:inline-block;background:${color};border:1px solid ${color};border-radius:7px;color:#fff;text-decoration:none;padding:14px 23px;font:bold 16px Arial;min-width:130px;text-align:center">${label}</a>`;
    return `<html><body style="margin:0;background:#f2f3f5;font:16px Arial,sans-serif;color:#252932"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:28px 12px"><table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#fff;border:1px solid #dde1e6;border-radius:12px"><tr><td style="padding:28px"><p style="font-size:12px;font-weight:bold;letter-spacing:2px;color:#596372">BONESHAKERS SOCIAL CLUB</p><h1 style="font-size:24px;line-height:1.4;margin:20px 0">Do you accept the ${year} BoneShakers Social Club Board of Directors nomination?</h1><p style="line-height:1.65">Hello ${html(name)}, please let us know whether you would like to be considered in our December election.</p>${deadline?'<p>Please respond by <strong>'+html(deadline)+'</strong>.</p>':''}<table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="padding:10px 12px 24px 0">${button(links.yes,'Yes, I Accept','#187447')}</td><td style="padding:10px 0 24px">${button(links.no,'No, I Decline','#b82835')}</td></tr></table><p style="font-size:14px;color:#657080">You will confirm your choice on the next page. Your response will be recorded for club leadership.</p><hr style="border:0;border-top:1px solid #e4e7ec;margin:24px 0">${paragraphs(intro)}<p><a href="${REQUIREMENTS_URL}" style="color:#9f1930">Read the requirements to serve</a></p>${paragraphs('You are welcome to reply'+outro)}</td></tr></table></td></tr></table></body></html>`;
  }
  function invitationPanel(year) {
    return `<section class="bod-results bod-results-panel bod-history-panel" id="bod-invitations"><div class="bod-panel-heading"><h3>Invite nominees to serve · ${year}</h3></div><button type="button" data-bod-invite-preview>Review nominee invitations</button><button type="button" data-bod-response-refresh>Refresh responses</button><p data-bod-invite-summary role="status"></p><div data-bod-response-list></div></section>`;
  }
  async function responseApi(path,year,data) {
    const response=await fetch(RESPONSE_ORIGIN+'/api/admin/'+path+'?year='+year,{method:data?'POST':'GET',headers:{Authorization:'Bearer '+accessToken,...(data?{'Content-Type':'application/json'}:{})},...(data?{body:JSON.stringify(data)}:{}),signal:AbortSignal.timeout(30000)});
    const result=await response.json();if(!response.ok)throw Error(result.error||'Responses could not be loaded.');return result;
  }
  function responseMarkup(model,records){
    const byName=new Map(records.map(r=>[normalize(r.name),r]));
    return model.nominees.length?'<table class="bod-response-table"><thead><tr><th>Nominee</th><th>Response</th><th>Received</th></tr></thead><tbody>'+model.nominees.map(person=>{const record=byName.get(normalize(person.name)),state=record?.status||'Not sent';return '<tr><td>'+html(person.name)+'</td><td><span class="bod-response-badge '+(state==='Accepted'?'accepted':state==='Declined'?'declined':'waiting')+'">'+html(state)+'</span></td><td>'+html(record?.responded_at?formatHistoryTime(record.responded_at):'—')+'</td></tr>';}).join('')+'</tbody></table>':'';
  }
  async function adminBatch(requests) {
    const actor=normalize(await getPortalAuditActor());
    if(!ADMIN_EMAILS.includes(actor)||!accessToken)throw Error('Sign in with the President or bsscvb account.');
    const response=await fetch('https://sheets.googleapis.com/v4/spreadsheets/'+MEMBERSHIP_SPREADSHEET_ID+':batchUpdate',{method:'POST',headers:{Authorization:'Bearer '+accessToken,'Content-Type':'application/json'},body:JSON.stringify({requests}),signal:AbortSignal.timeout(30000)});
    if(!response.ok){const data=await response.json().catch(()=>({}));throw Error(data.error?.message||'Could not save. Refresh to check the current records before trying again.');}
  }
  async function ensureAdminSheet(name,headers) {
    let metadata=await fetchSheetRead('https://sheets.googleapis.com/v4/spreadsheets/'+MEMBERSHIP_SPREADSHEET_ID+'?fields=sheets.properties');
    let sheet=metadata.sheets.find(s=>s.properties.title===name);
    if(!sheet){const id=crypto.getRandomValues(new Uint32Array(1))[0]%2000000000;await adminBatch([{addSheet:{properties:{sheetId:id,title:name}}},{updateCells:{start:{sheetId:id,rowIndex:0,columnIndex:0},rows:[cellRows(headers)],fields:'userEnteredValue'}}]);sheet={properties:{sheetId:id,title:name}};}
    const rows=await getSheetValues(sheetRange(name,'A:K'),MEMBERSHIP_SPREADSHEET_ID);
    if(headers.some((h,i)=>rows[0]?.[i]!==h))throw Error('Unexpected headers in '+name+'. Review the source sheet.');
    return {id:sheet.properties.sheetId,rows};
  }
  function bindNextStep(target,model,context) {
    const panel=target.querySelector('#bod-invitations'),list=panel.querySelector('[data-bod-response-list]');
    let refreshing=false;
    async function refreshResponses(){if(refreshing||!panel.isConnected)return;refreshing=true;try{const result=await responseApi('responses',context.year);if(panel.isConnected)list.innerHTML=responseMarkup(model,result.responses);}catch(error){if(panel.isConnected)list.textContent=error.message;}finally{refreshing=false;}}
    panel.querySelector('[data-bod-response-refresh]').onclick=refreshResponses;
    refreshResponses();
    const poll=()=>setTimeout(async()=>{if(!panel.isConnected)return;await refreshResponses();poll();},30000);poll();
    const status=target.querySelector('[data-bod-cleanup-status]');
    target.querySelector('[data-bod-history-all]').onchange=e=>target.querySelectorAll('[data-bod-history-select]:not(:disabled)').forEach(c=>c.checked=e.target.checked);
    let cleaning=false;
    async function cleanup(restore) {
      if(cleaning)return;
      const ids=[...target.querySelectorAll('[data-bod-history-select]:checked')].map(c=>c.dataset.bodHistorySelect);
      if(!restore&&!ids.length){status.textContent='Select the test history entries you want to delete.';return;}
      if(!window.confirm(restore?'Restore all deleted history for '+context.year+'?':'Delete the '+ids.length+' selected history entries? Submissions and totals will stay unchanged. You can restore this history later.'))return;
      cleaning=true;status.textContent=restore?'Restoring history…':'Deleting selected history…';
      try {
        const actor=normalize(await getPortalAuditActor()),archiveName='BOD Deleted Changes '+context.year;
        const archive=await ensureAdminSheet(archiveName,[...AUDIT_HEADERS,'Deleted At','Deleted By']);
        const rows=await getSheetValues(sheetRange(context.auditSheet,'A:I'),MEMBERSHIP_SPREADSHEET_ID);
        let requests;
        if(restore){const history=parseHistory(rows),existing=new Set(history.map(h=>h.id)),restoreRows=[];requests=[];
          archive.rows.slice(1).forEach((row,i)=>{if(!row[8])return;if(!existing.has(row[8])){restoreRows.push(cellRows(row.slice(0,9)));existing.add(row[8]);}requests.push({repeatCell:{range:{sheetId:archive.id,startRowIndex:i+1,endRowIndex:i+2,startColumnIndex:0,endColumnIndex:11},cell:{},fields:'userEnteredValue'}});});
          if(!requests.length){status.textContent='No deleted history to restore.';return;}
          if(restoreRows.length)requests.unshift({appendCells:{sheetId:context.auditSheetId,rows:restoreRows,fields:'userEnteredValue'}});
        }else{const fresh=parseHistory(rows);for(const id of ids){if(JSON.stringify(fresh.find(h=>h.id===id))!==JSON.stringify(context.history.find(h=>h.id===id)))throw Error('History changed. Refresh before deleting.');}requests=cleanupRequests(rows,ids,context.auditSheetId,archive.id,actor,new Date().toISOString());}
        await adminBatch(requests);await load(restore?'Deleted history restored.':'Selected test history deleted. Nomination totals were unchanged.');
      }catch(error){status.textContent=error.message;}finally{cleaning=false;}
    }
    target.querySelector('[data-bod-history-delete]').onclick=()=>cleanup(false);
    target.querySelector('[data-bod-history-restore]').onclick=()=>cleanup(true);
    target.querySelector('[data-bod-invite-preview]').onclick=async event=>{
      event.target.disabled=true;const summary=target.querySelector('[data-bod-invite-summary]');summary.textContent='Loading roster and invitation history…';
      try{const roster=await getSheetValues(sheetRange(String(context.year),'A:AZ'),MEMBERSHIP_SPREADSHEET_ID),recipients=invitationRecipients(model,roster);if(!recipients.length)throw Error('No nominees yet. Invitations will be available once members are nominated.');
        const log=await ensureAdminSheet('BOD Invitations '+context.year,INVITE_HEADERS);openInvitations(recipients,model,context,log);summary.textContent='Review the email and recipients before sending.';
      }catch(error){summary.textContent=error.message;}finally{event.target.disabled=false;}
    };
  }
  function mailToken() {
    return new Promise((resolve,reject)=>{google.accounts.oauth2.initTokenClient({client_id:GOOGLE_CLIENT_ID,scope:'https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/userinfo.email',include_granted_scopes:false,callback:r=>{if(r.error)return reject(Error(r.error_description||r.error));if(!google.accounts.oauth2.hasGrantedAllScopes(r,'https://www.googleapis.com/auth/gmail.send','https://www.googleapis.com/auth/userinfo.email'))return reject(Error('Google mail permission was not granted. No invitations sent.'));resolve(r.access_token);},error_callback:()=>reject(Error('Google authorization was closed or blocked. No invitations sent.'))}).requestAccessToken({prompt:'select_account'});});
  }
  function openInvitations(recipients,model,context,log) {
    const prior=new Map(log.rows.slice(1).filter(r=>r[0]).map(r=>[normalize(r[0]),r]));
    const dialog=document.createElement('dialog');dialog.className='bod-admin-dialog';
    dialog.innerHTML=`<header><div><h2>Nominee invitations · ${context.year}</h2><p>Review the recipients and message. One email per nominee.</p></div><button type="button" data-close>Close</button></header><div class="bod-admin-body"><label>Reply deadline (optional)<input type="date" data-deadline></label><h3>Recipients</h3><ul>${recipients.map(r=>`<li><strong>${html(r.name)}</strong> — ${html(r.error||r.email)} <span>${html(prior.get(normalize(r.name))?.[2]||'Not sent')}</span></li>`).join('')}</ul><p>Fix missing or ambiguous email addresses in the ${context.year} roster, then reopen this preview. Previously attempted invitations are skipped; check your Sent folder before resolving an uncertain send in the source sheet.</p><label>Email preview<select data-person>${recipients.map((r,i)=>`<option value="${i}">${html(r.name)}</option>`).join('')}</select></label><p><strong>Subject:</strong> Your ${context.year} BoneShakers Board nomination — invitation to serve</p><div data-body class="bod-email-preview"></div><label style="display:flex;gap:10px;align-items:start"><input type="checkbox" data-closed style="width:22px;height:22px;flex:0 0 22px">I confirm nominations are closed and I have reviewed this recipient list and email.</label><p>This confirmation does not close the public nomination form. Close nominations there first. Google will ask you to select a club sender account and allow sending email.</p><div class="bod-admin-actions"><button type="button" class="bod-admin-save" data-send disabled>Send nominee invitations</button></div><p data-status class="bod-admin-status" role="status"></p></div>`;
    document.body.append(dialog);dialog.showModal();let sending=false;
    const $=s=>dialog.querySelector(s),deadline=()=>{const v=$('[data-deadline]').value;return v?new Date(v+'T12:00:00').toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'}):'';};
    const preview=()=>{$('[data-body]').innerHTML=invitationHtml(recipients[Number($('[data-person]').value)].name,context.year,deadline(),{yes:'#preview-yes',no:'#preview-no'});$('[data-body]').querySelectorAll('a').forEach(a=>a.onclick=e=>e.preventDefault());};preview();$('[data-person]').onchange=preview;$('[data-deadline]').onchange=preview;
    const pending=recipients.filter(r=>!prior.has(normalize(r.name)));const blocked=pending.some(r=>r.error);
    const ready=()=>{$('[data-send]').disabled=!$('[data-closed]').checked||blocked||!pending.length||sending;};$('[data-closed]').onchange=ready;
    if(blocked)$('[data-status]').textContent='Correct the roster email issues before sending.';else if(!pending.length)$('[data-status]').textContent='All nominees already have an invitation attempt on record.';
    $('[data-close]').onclick=()=>{if(!sending){dialog.close();dialog.remove();}};dialog.addEventListener('cancel',e=>{if(sending)e.preventDefault();else dialog.remove();});
    $('[data-send]').onclick=async()=>{
      if(sending||!$('[data-closed]').checked||blocked||!pending.length)return;
      sending=true;ready();$('[data-deadline]').disabled=true;$('[data-closed]').disabled=true;let sent=0;
      // Start consent directly from the button gesture so popup blockers do not interfere.
      const tokenPromise=mailToken();$('[data-status]').textContent='Waiting for Google email authorization…';
      try{const token=await tokenPromise;const info=await fetch('https://www.googleapis.com/oauth2/v2/userinfo',{headers:{Authorization:'Bearer '+token},signal:AbortSignal.timeout(15000)}).then(r=>r.json());const sender=normalize(info.email);if(!ADMIN_EMAILS.includes(sender))throw Error('Choose the President or bsscvb club account. No invitations sent.');
        const fresh=buildModel(await getSheetValues(sheetRange(context.nominationSheet,'A:G'),MEMBERSHIP_SPREADSHEET_ID));if(tallyCsv(fresh)!==tallyCsv(model))throw Error('Nomination totals changed. Close this window, refresh and review again.');
        const roster=await getSheetValues(sheetRange(String(context.year),'A:AZ'),MEMBERSHIP_SPREADSHEET_ID);if(JSON.stringify(invitationRecipients(fresh,roster))!==JSON.stringify(recipients))throw Error('Roster addresses changed. Reopen the preview.');
        for(const person of pending){
          const latest=await getSheetValues(sheetRange('BOD Invitations '+context.year,'A:G'),MEMBERSHIP_SPREADSHEET_ID);if(latest.slice(1).some(r=>normalize(r[0])===normalize(person.name)))continue;
          const at=new Date().toISOString();
          const links=await responseApi('issue',context.year,{name:person.name});if(links.email!==person.email)throw Error('Roster address changed. Reopen this preview.');
          const body=invitationText(person.name,context.year,deadline(),links);
          const row=[person.name,person.email,'Sending — check Sent before retry',at,sender,'',body];
          // Record before Gmail is called. A lost response never causes an automatic resend.
          await adminBatch([{appendCells:{sheetId:log.id,rows:[cellRows(row)],fields:'userEnteredValue'}}]);
          const reserved=await getSheetValues(sheetRange('BOD Invitations '+context.year,'A:G'),MEMBERSHIP_SPREADSHEET_ID);const matches=reserved.map((r,i)=>({r,i})).filter(x=>normalize(x.r[0])===normalize(person.name));if(matches.length!==1)throw Error('Another administrator may be sending this invitation. Check the invitation log and Sent folder.');const index=matches[0].i;
          $('[data-status]').textContent='Sending to '+person.name+'… '+sent+' sent.';
          const utf8=value=>btoa(Array.from(new TextEncoder().encode(value),b=>String.fromCharCode(b)).join(''));
          const mime=['To: '+person.email,'From: '+sender,'Subject: =?UTF-8?B?'+utf8('Your '+context.year+' BoneShakers Board nomination — invitation to serve')+'?=','MIME-Version: 1.0','Content-Type: text/html; charset=UTF-8','Content-Transfer-Encoding: base64','',utf8(invitationHtml(person.name,context.year,deadline(),links)).match(/.{1,76}/g).join('\r\n')].join('\r\n');
          const response=await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({raw:utf8(mime).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}),signal:AbortSignal.timeout(30000)});
          const result=await response.json().catch(()=>({}));
          if(!response.ok||!result.id)throw Error(result.error?.message||'Gmail did not confirm delivery. Check the Sent folder before retrying.');
          sent++;row[2]='Sent';row[3]=new Date().toISOString();row[5]=result.id;
          await adminBatch([{updateCells:{start:{sheetId:log.id,rowIndex:index,columnIndex:0},rows:[cellRows(row)],fields:'userEnteredValue'}}]);
        }
        $('[data-status]').textContent=sent+' invitation(s) sent. Accept and Decline responses will appear in this portal.';$('[data-send]').textContent='Invitations processed';
      }catch(error){$('[data-status]').textContent=sent+' confirmed sent. '+error.message+' Close and reopen this preview to refresh statuses. If Gmail access is blocked, the Google Cloud project may need Gmail API and gmail.send consent enabled.';}
      finally{sending=false;$('[data-send]').disabled=true;$('[data-closed]').disabled=true;$('[data-deadline]').disabled=true;}
    };
  }

  async function load(notice) {
    const request = ++sequence;
    const names=yearSheets(selectedYear),year=names.year;
    if (!accessToken) return;
    if(window.BSSCBodElectionHistoryData?.[year]) return window.BSSCBodElectionHistory.load(year,availableYears(discoveredSheets));
    currentMembershipSheet = SHEET;
    installStyle();
    const status = document.getElementById('membershipStatus'), target=document.getElementById('membershipContent');
    status.classList.remove('lifer-summary'); status.textContent='Loading BOD nominations from Google Sheets…';
    target.innerHTML='<div class="empty-state">Loading nomination results…</div>';
    const active = () => request===sequence && currentMembershipSheet===SHEET && moduleLoadingKey==='membership';
    try {
      const metadata = await fetchSheetRead('https://sheets.googleapis.com/v4/spreadsheets/'+MEMBERSHIP_SPREADSHEET_ID+'?fields=sheets.properties');
      discoveredSheets=metadata.sheets||[];
      const sheet = (metadata.sheets||[]).find(entry=>entry.properties?.title===names.nominations);
      // The public form creates this private tab when the first submission is saved.
      const rows = sheet ? await getSheetValues("'"+names.nominations+"'!A:G",MEMBERSHIP_SPREADSHEET_ID) : [];
      const model=buildModel(rows);
      let admin=false,adminError='',context=null,history=[];
      const actor=normalize(await getPortalAuditActor());
      if(ADMIN_EMAILS.includes(actor)&&sheet) {
        try {
          const candidateSheet=(metadata.sheets||[]).find(entry=>entry.properties?.title===names.candidates),auditSheet=(metadata.sheets||[]).find(entry=>entry.properties?.title===names.audit);
          if(!candidateSheet||!auditSheet)throw Error('Nomination admin setup is not complete.');
          const [candidateRows,auditRows]=await Promise.all([getSheetValues("'"+names.candidates+"'!A:D",MEMBERSHIP_SPREADSHEET_ID),getSheetValues("'"+names.audit+"'!A:I",MEMBERSHIP_SPREADSHEET_ID)]);
          if(!auditRows.length)throw Error('The nomination change-history header is missing.');history=parseHistory(auditRows);context={history,year,nominationSheet:names.nominations,auditSheet:names.audit,candidates:parseCandidates(candidateRows),nominationSheetId:sheet.properties.sheetId,auditSheetId:auditSheet.properties.sheetId};admin=true;
        } catch(error){adminError=error.message;}
      }
      if (!active()) return;
      const sourceUrl='https://docs.google.com/spreadsheets/d/'+MEMBERSHIP_SPREADSHEET_ID+'/edit'+(sheet?'#gid='+sheet.properties.sheetId:'');
      const updatedAt = new Date().toLocaleString('en-US',{timeZone:'America/New_York',timeZoneName:'short'});
      target.innerHTML=(typeof notice==='string'?'<p class="bod-admin-toast" role="status">'+html(notice)+'</p>':'')+markup(model,updatedAt,sourceUrl,admin,year,availableYears(metadata.sheets))+(admin?invitationPanel(year)+historyMarkup(history):'')+(adminError?'<p class="bod-results-note" role="alert">Results are available, but administrative controls could not load: '+html(adminError)+'</p>':'');
      status.textContent='BOD Nominations '+year+' · '+model.submissions.length+' member submission'+(model.submissions.length===1?'':'s');
      target.querySelector('[data-bod-refresh]').addEventListener('click',()=>load());
      target.querySelector('[data-bod-year]').addEventListener('change',event=>{selectedYear=yearSheets(event.target.value).year;load();});
      bindDashboard(target,model,context);
      if(admin)bindNextStep(target,model,context);
      target.querySelector('[data-bod-export]').addEventListener('click',()=>{
        const url=URL.createObjectURL(new Blob(['\ufeff'+tallyCsv(model)],{type:'text/csv;charset=utf-8'}));
        const link=document.createElement('a');link.href=url;link.download='BSSC_BOD_Nomination_Tally_'+year+'.csv';document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
      });
    } catch (error) {
      if (!active()) return;
      status.textContent='BOD nomination results could not be loaded.';
      target.innerHTML='<div class="empty-state"><p>'+html(error.message)+'</p><button type="button" class="membership-tab" data-bod-retry>Try again</button></div>';
      target.querySelector('[data-bod-retry]').addEventListener('click',()=>load());
    }
  }
  if(typeof document!=='undefined')document.getElementById('bodAdministrationLink')?.addEventListener('click',()=>{currentMembershipSheet=SHEET;showModule('membership');});
  return {invitationHtml,responseMarkup,invitationText,invitationRecipients,cleanupRequests,yearSheets,availableYears,yearSelector,selectYear,load,buildModel,tallyCsv,markup,buildAdminMutation,parseCandidates,parseHistory,historyMarkup,changeReason,CHANGE_REASONS,installStyle,bindDashboard};
});
