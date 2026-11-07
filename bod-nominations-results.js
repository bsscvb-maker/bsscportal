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
  const ELECTION_EMAIL = 'bsscvb@boneshakerssocialclub.com';
  const ELECTION_SENDER = 'BoneShakers Board Elections';
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
    const members = new Map(), references = new Set(), receivedTimestamps = [];
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
      receivedTimestamps.push(timestamp);
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
    return {submissions, nominees, receivedTimestamps, total:submissions.reduce((sum,record) => sum + record.names.length,0), excluded, duplicates};
  }

  function csvRows(rows) {
    const cell = value => {
      const text = String(value ?? '');
      return '"' + (/^[\s]*[=+@-]/.test(text) ? "'" + text : text).replace(/"/g,'""') + '"';
    };
    return rows.map(row => row.map(cell).join(',')).join('\r\n') + '\r\n';
  }

  function tallyCsv(model) {
    return csvRows([['Nominee','Nominations'],...model.nominees.map(person => [person.name,person.count])]);
  }

  function nominatorsFor(model, name) {
    const key = normalize(name);
    return model.submissions.filter(record => record.names.some(choice => normalize(choice) === key))
      .sort((a,b) => a.nominator.localeCompare(b.nominator));
  }

  const easternSubmissionTime = new Intl.DateTimeFormat('en-US', {
    timeZone:'America/New_York', year:'numeric', month:'short', day:'numeric',
    hour:'numeric', minute:'2-digit', second:'2-digit', timeZoneName:'short'
  });

  function submissionInstant(value, sourceZone) {
    // Formatted Sheets dates represent wall time in the spreadsheet's time zone.
    const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})[ ,]+(\d{1,2}):(\d{2})(?::(\d{2}))?(?:\s*([AP]M))?$/i.exec(value);
    if (match && sourceZone) {
      const [,month,day,year,hour,minute,second='0',meridiem] = match;
      const hours = meridiem ? Number(hour)%12 + (meridiem.toUpperCase()==='PM'?12:0) : Number(hour);
      const wall = Date.UTC(Number(year),Number(month)-1,Number(day),hours,Number(minute),Number(second));
      const sourceOffset = new Intl.DateTimeFormat('en-US',{timeZone:sourceZone,timeZoneName:'longOffset'});
      let instant = wall;
      // Recheck the offset at the converted instant for daylight-saving transitions.
      for (let pass=0; pass<3; pass++) {
        const zone = sourceOffset.formatToParts(instant).find(part=>part.type==='timeZoneName').value;
        const offset = /^GMT([+-])(\d{2}):(\d{2})$/.exec(zone);
        const minutes = offset ? (offset[1]==='-'?-1:1)*(Number(offset[2])*60+Number(offset[3])) : 0;
        instant = wall - minutes*60000;
      }
      return instant;
    }
    return /^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d{2}:?\d{2})$/i.test(value) ? Date.parse(value) : NaN;
  }

  function formatSubmissionTime(value, sourceZone) {
    const instant=submissionInstant(value,sourceZone);
    return Number.isFinite(instant)?easternSubmissionTime.format(instant):value;
  }

  function nominationTimeline(model,year,sourceZone) {
    const instants=(model.receivedTimestamps||[]).map(value=>submissionInstant(value,sourceZone)).filter(Number.isFinite).sort((a,b)=>a-b);
    const received=index=>instants.length?easternSubmissionTime.format(instants[index]):'No timestamp recorded';
    const cutoff=Number(year)===2027?easternSubmissionTime.format(Date.parse('2026-11-05T08:00:00Z')):'Schedule unavailable';
    const milestones=[
      ['Nominations opened',Number(year)===2027?'Form published Oct 27, 2026 · exact opening time unverified':'Schedule unavailable'],
      ['First nomination received',received(0)],
      ['Last nomination received',received(instants.length-1)],
      ['Nominations ended · submission cutoff',cutoff],
      ['Nominee reply deadline',Number(year)===2027?DEFAULT_2027_DEADLINE:'Schedule unavailable']
    ];
    return '<section class="bod-timeline" aria-label="Nomination timeline"><h3>Nomination Timeline</h3><dl>'+milestones.map(([label,value])=>`<div><dt>${html(label)}</dt><dd>${html(value)}</dd></div>`).join('')+'</dl></section>';

  }

  function detailCsv(model, year) {
    return csvRows([['Board service year','Nominee','Nominated by','Submitted at'],
      ...model.nominees.flatMap(person => nominatorsFor(model,person.name)
        .map(record => [year,person.name,record.nominator,(record.displayTimestamp ?? record.timestamp)]))]);
  }

  function downloadCsv(csv, filename) {
    const url = URL.createObjectURL(new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8'}));
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url),1000);
  }

  const initials = name => String(name).trim().split(/\s+/).filter(Boolean).filter(word=>word!== '"').map(word=>word[0]).filter(Boolean).filter((_,i,list)=>i===0||i===list.length-1).join('').toUpperCase();
  const icon = name => {
    const paths={people:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M22 21v-2a4 4 0 0 0-3-3.87"/><circle cx="9" cy="7" r="4"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',nominees:'<path d="m9 12 2 2 4-4M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9Z"/><path d="M14 3v6h6"/>',total:'<path d="M4 19V9M12 19V5M20 19v-8M2 22h20"/>',refresh:'<path d="M20 7v5h-5M4 17v-5h5"/><path d="M6 6a8 8 0 0 1 13 2l1 4M4 12l1 4a8 8 0 0 0 13 2"/>',arrow:'<path d="M5 12h14m-5-5 5 5-5 5"/>',download:'<path d="M12 3v12m-4-4 4 4 4-4M5 17v4h14v-4"/>',edit:'<path d="m16 3 5 5-12 12-6 1 1-6Z"/><path d="m14 5 5 5"/>',reset:'<path d="M3 4v6h6M4 10a8 8 0 1 1 1 8"/>',clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'};
    return `<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${paths[name]||paths.nominees}</svg>`;
  };

  function markup(model, updatedAt, sourceUrl, admin = false, year = 2027, years = availableYears(), canExportDetails = admin, sourceZone) {
    const top=model.nominees[0]?.count||0,tied=model.nominees.filter(person=>person.count===top).length;
    const stats=[['Submissions',model.submissions.length,'members have submitted','people','submissions'],['Members nominated',model.nominees.length,'members on the nomination list','nominees','totals'],['Total nominations',model.total,'across all member submissions','total','totals']];
    let rank=0,previous=-1;
    return `<section class="bod-results" aria-label="BOD nomination results">
      <header class="bod-hero">${yearSelector(year,years)}<div class="bod-hero-top"><p class="bod-results-kicker">BONESHAKERS · BOARD OF DIRECTORS</p><span class="bod-connection"><i aria-hidden="true"></i>Connected</span></div><div class="bod-hero-main"><div><h2>Nominations <span>${year}</span></h2><p>Your board. Your members. Every nomination in one place.</p></div><div class="bod-results-actions"><button type="button" data-bod-refresh>${icon('refresh')}<span>Refresh totals</span></button><button type="button" data-bod-export ${model.nominees.length?'':'disabled'}>${icon('download')}<span>Export totals CSV</span></button>${canExportDetails?`<button type="button" data-bod-export-details ${model.total?'':'disabled'}>${icon('download')}<span>Export nominations CSV</span></button>`:''}</div></div><div class="bod-hero-footer"><span class="bod-updated">${icon('clock')}Updated ${html(updatedAt)}</span>${admin?'<button type="button" data-bod-jump="bod-submissions">Manage submissions '+icon('arrow')+'</button>':''}</div></header>
      ${nominationTimeline(model,year,sourceZone)}
      <div class="bod-results-stats">${stats.map(([label,value,caption,symbol,jump],i)=>`<button type="button" class="bod-stat bod-stat-${i}" data-bod-jump="bod-${jump}"><span class="bod-stat-top"><span>${html(label)}</span><i>${icon(symbol)}</i></span><strong>${value}</strong><span class="bod-stat-caption">${html(caption)}</span></button>`).join('')}</div>
      ${model.excluded?`<p class="bod-results-note" role="alert">${model.excluded} incomplete or invalid log row(s) excluded from the totals. Review the source sheet before using these results.</p>`:''}
      ${model.duplicates?`<p class="bod-results-note">${model.duplicates} duplicate or superseded row(s) excluded. Each member is counted once.</p>`:''}
      <div class="bod-dashboard-grid"><section class="bod-results-panel" id="bod-totals"><div class="bod-panel-heading"><div><p class="bod-panel-eyebrow">THE NOMINEES</p><h3>Nomination totals</h3></div><span class="bod-total-badge">${model.nominees.length} member${model.nominees.length===1?'':'s'}</span></div>
      ${top?`<div class="bod-tally-context"><span class="bod-context-mark" aria-hidden="true"></span><span>Top count: <strong>${top} nomination${top===1?'':'s'}</strong>${tied>1?` · ${tied} members tied`:''}</span></div>`:''}
      <ol class="bod-leaderboard">${model.nominees.map((person,index)=>{if(person.count!==previous){rank=index+1;previous=person.count;}return `<li class="bod-leader" ${index>=8?'data-bod-more-nominee hidden':''}><span class="bod-rank" aria-label="Rank ${rank}">${String(rank).padStart(2,'0')}</span><div class="bod-leader-identity"><details class="bod-nominator-detail"><summary><strong>${html(person.name)}</strong></summary><p class="bod-nominator-label" id="bod-nominators-${index}"><strong>${html(person.name)}</strong> nominated by</p><ul aria-labelledby="bod-nominators-${index}">${nominatorsFor(model,person.name).map(record=>`<li>${html(record.nominator)}</li>`).join('')}</ul></details><div class="bod-tally-track" aria-hidden="true"><span style="width:${Math.max(5,Math.round(person.count/top*100))}%"></span></div></div><span class="bod-leader-count"><strong>${person.count}</strong><small>${person.count===1?'nomination':'nominations'}</small></span></li>`;}).join('')}</ol>
      ${model.nominees.length>8?`<button class="bod-panel-more" type="button" data-bod-totals-toggle aria-expanded="false">View all ${model.nominees.length} nominees ${icon('arrow')}</button>`:''}
      ${!model.nominees.length?`<div class="bod-empty">${icon('nominees')}<strong>${model.excluded?'No valid submissions are available.':'No nominations received yet.'}</strong><p>${model.excluded?'Review the source sheet.':'Member nominations will appear here after submission.'}</p></div>`:''}
      </section>
      <section class="bod-results-panel" id="bod-submissions"><div class="bod-panel-heading"><div><p class="bod-panel-eyebrow">MEMBER ACTIVITY</p><h3>Member submissions</h3></div><span class="bod-total-badge">${model.submissions.length}</span></div><p class="bod-panel-intro">${admin?'Tap a member to view or correct their choices.':'See which members have submitted and who they nominated.'}</p>
      <label class="bod-search-label"><span>Find a member</span><input type="search" data-bod-submitter-search placeholder="Search submitter’s name…" autocomplete="off"></label>
      <div class="bod-submission-list">${model.submissions.map((record,index)=>`<article class="bod-submission-card" data-bod-name="${html(normalize(record.nominator))}" data-bod-submission-index="${index}" ${index>=6?'hidden':''}><div class="bod-submission-head"><span class="bod-avatar" aria-hidden="true">${html(initials(record.nominator))}</span><div>${admin?`<button class="bod-member-name" type="button" data-bod-manage="${html(record.reference)}" aria-label="Manage nominations for ${html(record.nominator)}">${html(record.nominator)}</button>`:`<h4>${html(record.nominator)}</h4>`}<span class="bod-submission-time">${html(record.displayTimestamp ?? record.timestamp)}</span></div><span class="bod-submission-number">${record.names.length}<small>selected</small></span></div><div class="bod-choice-tags">${record.names.map(name=>`<span>${html(name)}</span>`).join('')}</div>${admin?`<div class="bod-card-actions"><button type="button" data-bod-manage="${html(record.reference)}">${icon('edit')}Edit nominees</button><button type="button" data-bod-manage="${html(record.reference)}" data-bod-action="reset" class="bod-card-reset">${icon('reset')}Reset member</button></div>`:''}</article>`).join('')}</div>
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
.bod-election-column li.bod-has-evidence{position:relative;padding-right:38px}
.bod-results .bod-evidence-bubble[data-bod-view-response-evidence]{position:absolute;top:8px;right:0;display:grid;place-items:center;width:28px;height:28px;min-width:0;min-height:0;margin:0;padding:0;background:#b91c32;color:#fff;border:1px solid #fc8494;border-radius:50%;cursor:pointer}
.bod-evidence-bubble svg{width:16px;height:16px}
.bod-evidence-dialog{box-sizing:border-box;width:min(460px,calc(100% - 24px));max-height:90dvh;overflow:auto;padding:18px;border:1px solid #59616b;border-radius:12px;background:#1b1f24;color:#fff}
.bod-evidence-dialog::backdrop{background:#000a}
.bod-evidence-dialog header{display:flex;gap:12px;align-items:center;justify-content:space-between}
.bod-evidence-dialog h2{font-size:1.1rem;margin:0}
.bod-evidence-dialog img{display:block;width:auto;max-width:100%;max-height:65dvh;object-fit:contain;margin:0 auto}

.bod-results{--bod-red:#c8102e;--bod-ink:#16191f;--bod-muted:#69717d;color:var(--bod-ink);font-family:Arial,Helvetica,sans-serif;max-width:1440px;margin:auto}
.bod-results *{box-sizing:border-box}.bod-results button,.bod-results input{font-family:inherit}.bod-results button{cursor:pointer}.bod-results button:disabled{opacity:.45;cursor:default}.bod-results svg{width:20px;height:20px;flex:0 0 20px}.bod-hero{position:relative;border-radius:20px;padding:24px 28px 48px;background:radial-gradient(ellipse at 100% 0,#66152955,transparent 55%),linear-gradient(115deg,#15161c,#24252d);color:#fff;overflow:hidden;border:1px solid #34353b;border-top:4px solid var(--bod-red)}.bod-hero-top{display:flex;align-items:center;justify-content:space-between;gap:12px}.bod-results-kicker{margin:0;font-size:10px;font-weight:800;letter-spacing:2px;color:#d2d4db}.bod-connection{display:inline-flex;gap:7px;align-items:center;padding:6px 9px;border:1px solid #ffffff24;border-radius:99px;font-size:10px;color:#dbe6df;white-space:nowrap}.bod-connection i{width:6px;height:6px;border-radius:50%;background:#53d48e;box-shadow:0 0 0 3px #53d48e15}.bod-hero-main{display:flex;justify-content:space-between;gap:22px;align-items:center;margin-top:20px}.bod-hero h2{margin:0;font-size:36px;font-weight:850;letter-spacing:-1.4px;line-height:1.1;color:#fff}.bod-hero h2 span{color:#ff6079}.bod-hero-main p{margin:10px 0 0;font-size:13px;line-height:1.5;color:#bfc2cb}.bod-results-actions{display:flex;gap:9px;flex-wrap:wrap}.bod-results-actions button{min-height:43px;display:inline-flex;align-items:center;justify-content:center;gap:8px;border:1px solid #ffffff35;border-radius:10px;padding:11px 14px;background:#ffffff09;color:#fff;font-size:12px;font-weight:700;white-space:nowrap}.bod-results-actions button[data-bod-refresh]{background:var(--bod-red);border-color:var(--bod-red)}.bod-results-actions button:hover{filter:brightness(1.1)}.bod-hero-footer{margin-top:24px;display:flex;justify-content:space-between;align-items:center;gap:14px}.bod-hero-footer>span{display:flex;gap:6px;align-items:center;font-size:10px;color:#9da3af}.bod-hero-footer svg{width:14px;height:14px;flex-basis:14px}.bod-hero-footer button{display:flex;align-items:center;gap:8px;border:0;background:transparent;color:#fff;font-size:11px;font-weight:700;padding:4px}.bod-results-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;margin:-23px 20px 23px;position:relative}.bod-stat{display:block;text-align:left;border:1px solid #e1e3e8;border-radius:14px;padding:17px 20px;background:#fff;color:var(--bod-ink);box-shadow:0 6px 18px #1d263b09}.bod-stat:hover{border-color:#d5a4ad}.bod-stat-top{display:flex;justify-content:space-between;align-items:center;gap:8px;font-size:12px;font-weight:700;color:#656d78}.bod-stat-top i{background:#fff0f3;color:var(--bod-red);border-radius:10px;display:grid;place-items:center;width:32px;height:32px;flex:0 0 32px}.bod-stat strong{font-size:38px;line-height:1;letter-spacing:-1.5px;display:block;margin:6px 0 9px}.bod-stat-caption{display:block;color:#727b88;font-size:11px;line-height:1.4}.bod-stat-2{background:#fff9fa;border-color:#efcdd4}.bod-stat-2 strong{color:#b4102b}.bod-dashboard-grid{display:grid;grid-template-columns:minmax(0,1.13fr) minmax(0,1fr);gap:20px;align-items:start}.bod-results-panel{min-width:0;background:#fff;border:1px solid #e0e3e8;border-radius:16px;padding:22px;box-shadow:0 3px 12px #1b243604;scroll-margin-top:100px}.bod-panel-heading{display:flex;justify-content:space-between;align-items:center;gap:12px}.bod-panel-eyebrow{font-size:10px;font-weight:800;letter-spacing:1.5px;color:#9299a4;margin:0 0 5px}.bod-panel-heading h3{font-size:20px;letter-spacing:-.5px;margin:0;color:#1b2028}.bod-total-badge{border-radius:8px;border:1px solid #e7e9ee;background:#f6f7f9;padding:6px 9px;color:#737b88;font-size:10px;white-space:nowrap}.bod-panel-intro{font-size:12px;line-height:1.5;color:#7e8592;margin:9px 0 13px}.bod-tally-context{display:flex;gap:7px;align-items:center;padding:10px 12px;border-radius:8px;background:#fcf0f3;color:#8f2036;margin:17px 0 7px;font-size:11px;line-height:1.5}.bod-context-mark{width:5px;height:5px;border-radius:50%;background:var(--bod-red);flex:0 0 5px}.bod-leaderboard{list-style:none;margin:0;padding:0}.bod-leader{display:flex;align-items:center;gap:12px;padding:17px 0;border-bottom:1px solid #f0f1f5}.bod-rank{font-size:11px;font-weight:800;color:#969eab;flex:0 0 24px}.bod-leader:first-child .bod-rank{color:var(--bod-red)}.bod-leader-identity{flex:1;min-width:0}.bod-leader-identity>strong{display:block;font-size:15px;overflow-wrap:anywhere;margin:0 0 9px;line-height:1.25}.bod-tally-track{height:5px;border-radius:8px;background:#f0f1f5;overflow:hidden;width:100%}.bod-tally-track span{display:block;height:100%;border-radius:8px;background:linear-gradient(90deg,#e96b80,#c8102e)}.bod-leader-count{text-align:right;min-width:62px;flex:0 0 62px}.bod-leader-count>strong{font-size:20px;letter-spacing:-.7px;display:block;line-height:1}.bod-leader-count small{display:block;margin-top:4px;font-size:10px;color:#9aa0ab}.bod-panel-footnote{font-size:11px;color:#9299a4;line-height:1.5;margin:15px 0 0}.bod-panel-more{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;border:1px solid #e4e7ed;border-radius:8px;margin-top:14px;padding:11px;background:#f8f9fb;color:#555f6e;font-size:11px;font-weight:700;min-height:42px}.bod-panel-more svg{width:14px;height:14px;flex-basis:14px}.bod-results .bod-search-label{display:block;max-width:none;margin:0 0 16px;font-size:10px;font-weight:700;color:#777f8c}.bod-results .bod-search-label>span{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)}.bod-results .bod-search-label input{display:block;box-sizing:border-box;width:100%;border:1px solid #e0e4ec;border-radius:9px;background:#f8f9fb;color:#263040;font:13px Arial,sans-serif;padding:12px 13px;min-height:41px;margin:0}.bod-submission-list{display:grid;gap:11px}.bod-submission-card{border:1px solid #e4e7ed;border-radius:12px;padding:14px;background:#fff}.bod-submission-card:hover{border-color:#d2d6e0}.bod-submission-head{display:flex;align-items:center;gap:10px}.bod-avatar{display:grid;place-items:center;width:35px;height:35px;flex:0 0 35px;border-radius:10px;background:#f3f1f5;border:1px solid #e9e4ec;color:#735969;font-size:11px;font-weight:800}.bod-submission-head>div{flex:1;min-width:0}.bod-member-name{border:0!important;background:transparent!important;color:#272d37!important;padding:0!important;min-height:0!important;text-align:left;font-size:14px!important;font-weight:800!important;line-height:1.4;overflow-wrap:anywhere}.bod-member-name:hover{text-decoration:underline}.bod-submission-head h4{font-size:14px;margin:0;overflow-wrap:anywhere}.bod-submission-time{display:block;font-size:11px;color:#9aa0aa;margin-top:4px;line-height:1.5}.bod-submission-number{font-size:17px;font-weight:800;text-align:center;flex:0 0 45px;color:#343b48}.bod-submission-number small{display:block;font-size:8px;font-weight:400;color:#9198a4;margin-top:3px}.bod-choice-tags{display:flex;flex-wrap:wrap;gap:5px;margin:12px 0}.bod-choice-tags>span{display:inline-block;border-radius:5px;background:#f4f5f8;color:#596474;padding:5px 8px;font-size:11px;line-height:1.3}.bod-card-actions{display:flex;gap:8px;padding-top:10px;border-top:1px solid #f0f2f6}.bod-card-actions button{display:flex;align-items:center;justify-content:center;gap:5px;flex:1;min-height:40px;font-size:12px;font-weight:700;padding:8px;border-radius:7px;border:1px solid #dfe3eb;background:#fafbfc;color:#485466}.bod-card-actions button svg{width:12px;height:12px;flex-basis:12px}.bod-card-actions .bod-card-reset{flex:0 0 auto;background:#fff;border-color:#f0d8de;color:#a9364b}.bod-dashboard-footer{display:flex;justify-content:space-between;gap:14px;flex-wrap:wrap;margin:18px 0;color:#9299a4;font-size:10px;line-height:1.5}.bod-dashboard-footer a{color:#6d7786;text-decoration:none;font-weight:700}.bod-empty{text-align:center;padding:32px 12px;color:#8b94a1}.bod-empty>svg{width:30px;height:30px;display:block;margin:0 auto 12px;color:#bc7a88}.bod-empty strong{display:block;font-size:13px;color:#626d7d}.bod-empty p{font-size:11px;line-height:1.6;margin:7px 0}.bod-empty-search{font-size:12px;color:#8b94a1;padding:20px;text-align:center}.bod-results-note{background:#fff6df;border:1px solid #ead6a3;border-left:3px solid #c9a13e;border-radius:8px;font-size:12px;padding:13px;margin:12px 0;line-height:1.5}.bod-history-panel{margin-top:20px}.bod-history-list{display:grid;gap:0;margin-top:10px}.bod-history-row{display:flex;gap:12px;align-items:flex-start;padding:15px 0;border-top:1px solid #f0f1f5}.bod-history-icon{width:30px;height:30px;flex:0 0 30px;border:1px solid #e6e9ef;border-radius:8px;display:grid;place-items:center;background:#fafbfc;color:#7a8493}.bod-history-icon svg{width:14px;height:14px;flex-basis:14px}.bod-history-copy{flex:1;min-width:0}.bod-history-top{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}.bod-history-top strong{font-size:12px}.bod-history-top time{font-size:9px;color:#969eaa}.bod-history-copy p{font-size:11px;color:#6d7787;margin:6px 0;line-height:1.5}.bod-history-copy small{font-size:9px;color:#9aa1ad;overflow-wrap:anywhere}.bod-history-kind{font-size:8px;padding:3px 6px;border-radius:5px;background:#f1f4f8;color:#707d90;margin-left:7px;white-space:nowrap}.bod-history-kind.reset{background:#fff0f3;color:#b04358}.bod-history-empty{font-size:12px;line-height:1.5;color:#959daa;padding:14px 0}.bod-results [hidden]{display:none!important}.bod-results button:focus-visible,.bod-results a:focus-visible,.bod-results input:focus-visible,.bod-results summary:focus-visible{outline:3px solid #2867ad;outline-offset:3px}
@media(max-width:1100px){.bod-hero-main{align-items:flex-start}.bod-results-actions{flex-direction:column}.bod-results-actions button{min-height:38px}.bod-hero h2{font-size:31px}.bod-dashboard-grid{gap:14px}.bod-results-panel{padding:18px}.bod-stat{padding:16px}.bod-card-actions{gap:5px}}
.bod-nominator-label{margin:8px 0 3px;font-size:12px;color:#475569}
[data-bod-gallery][hidden],[data-bod-back][hidden],[data-bod-nomination-content][hidden],[data-bod-history-content][hidden],#bod-invitations[hidden],#bod-invitations>[hidden]{display:none!important}.bod-stage-cards{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;margin:0 0 20px}.bod-stage-cards button{display:grid;gap:8px;justify-items:start;overflow:hidden;min-width:0;padding:0 0 16px;border:1px solid #d2d6df;border-radius:14px;background:#fff;color:#171b24;text-align:left;cursor:pointer}.bod-stage-cards button[aria-pressed=true]{border-color:#c8102e;box-shadow:inset 0 0 0 1px #c8102e}.bod-stage-cards button:focus-visible{outline:3px solid #c8102e;outline-offset:3px}.bod-stage-art{display:block;width:100%;margin:0;background:#171a25;height:auto;aspect-ratio:1000 / 440;object-fit:cover;object-position:center}.bod-stage-cards strong{font-size:clamp(24px,3vw,34px);justify-self:center}[data-bod-back]{margin:0 0 16px}@media(max-width:760px){.bod-stage-cards{grid-template-columns:1fr}}
@media(max-width:800px){.bod-dashboard-grid{grid-template-columns:1fr}.bod-results-actions{flex-direction:row}.bod-hero-main{flex-wrap:wrap}.bod-hero{padding:20px 20px 43px;border-radius:15px}.bod-results-stats{margin:-21px 12px 18px;gap:9px}.bod-stat{padding:12px}.bod-stat strong{font-size:31px}.bod-stat-top{font-size:10px}.bod-stat-top i{width:26px;height:26px;flex-basis:26px;border-radius:8px}.bod-stat-top svg{width:15px;height:15px;flex-basis:15px}.bod-stat-caption{font-size:9px}.bod-panel-heading h3{font-size:20px}.bod-card-actions button{min-height:43px}.bod-member-name{min-height:32px!important}.bod-panel-more{min-height:44px}.bod-leader-identity>strong{font-size:14px}.bod-submission-head h4,.bod-member-name{font-size:15px!important}}
@media(max-width:460px){.bod-hero{padding:17px 16px 42px}.bod-hero-top{align-items:flex-start}.bod-results-kicker{font-size:8px;letter-spacing:1.3px;line-height:1.6;max-width:165px}.bod-connection{font-size:8px;padding:5px 7px}.bod-hero-main{margin-top:17px;gap:17px}.bod-hero h2{font-size:30px;letter-spacing:-1px}.bod-hero-main p{font-size:11px;max-width:250px;line-height:1.6}.bod-results-actions{width:100%}.bod-results-actions button{font-size:11px;min-height:43px;flex:1;padding:10px}.bod-results-actions button svg{width:16px;height:16px;flex-basis:16px}.bod-hero-footer{margin-top:17px;align-items:flex-start;flex-direction:column;gap:13px}.bod-hero-footer>span{font-size:8px}.bod-hero-footer button{font-size:10px;padding:3px 0}.bod-results-stats{gap:6px;margin-left:8px;margin-right:8px}.bod-stat{padding:11px 9px;border-radius:10px}.bod-stat-top{font-size:10px;line-height:1.5;align-items:flex-start}.bod-stat-top i{display:none}.bod-stat strong{font-size:29px;margin:9px 0 6px}.bod-stat-caption{display:none}.bod-results-panel{padding:16px;border-radius:13px}.bod-panel-eyebrow{font-size:8px}.bod-panel-heading h3{font-size:18px}.bod-total-badge{font-size:9px}.bod-leader{gap:8px}.bod-rank{flex-basis:21px;font-size:10px}.bod-leader-count{min-width:55px;flex-basis:55px}.bod-leader-count small{font-size:9px}.bod-submission-card{padding:12px}.bod-avatar{width:32px;height:32px;flex-basis:32px}.bod-choice-tags>span{font-size:11px}.bod-card-actions button{font-size:12px;min-height:44px}.bod-dashboard-footer{font-size:9px}.bod-history-row{gap:9px}.bod-history-icon{width:26px;height:26px;flex-basis:26px}}
    `;

    style.textContent += '.bod-results .bod-hero-footer .bod-updated{color:#78efa5;font-weight:800}.bod-timeline{margin:16px 0;padding:16px 20px;border:1px solid #535961;border-left:4px solid #cc2441;border-radius:12px;background:#202329;color:#fff}.bod-timeline h3{margin:0 0 10px;font-size:1.15rem}.bod-timeline dl{display:grid;grid-template-columns:repeat(auto-fit,minmax(175px,1fr));gap:12px;margin:0}.bod-timeline dl div{background:#14161a;border-radius:8px;padding:10px}.bod-timeline dt{color:#e1e4ea;font-weight:700;font-size:.85rem}.bod-timeline dd{margin:4px 0 0;color:#fff;font-weight:700}';
    style.textContent += '@media(prefers-reduced-motion:no-preference){.bod-election-rehearsal details[open] .bod-vote-headline{animation:bod-vote-slide 3.2s ease-in-out 2,bod-vote-pulse 3.2s ease-in-out 2}@keyframes bod-vote-slide{0%{transform:translateX(-24%);opacity:0}16%,83%{transform:translateX(0);opacity:1}98%{transform:translateX(24%);opacity:0}99%{transform:translateX(0);opacity:0}100%{transform:translateX(0);opacity:1}}@keyframes bod-vote-pulse{0%,17%,29%,41%,53%,65%,77%,100%{text-shadow:none}23%,35%,47%,59%,71%{text-shadow:0 0 10px #ff4d65,0 0 22px #ff4d65}}}';
    style.textContent += '.bod-vote-board{margin:16px 0 24px;padding:clamp(15px,3vw,28px);background:linear-gradient(150deg,#272029,#14151b 58%);color:#f8f6f8;border-radius:15px;border:1px solid #3e333d;border-top:4px solid #bb243e;box-shadow:0 12px 28px #17101b22}.bod-vote-board h4{margin:4px 0 7px;font-size:clamp(1.35rem,3vw,2rem);color:#fff}.bod-vote-board p{color:#e5dce5;margin:5px 0 12px}.bod-vote-kicker{color:#ffb3c0;font-size:.75rem;font-weight:850;letter-spacing:.14em;text-transform:uppercase}.bod-vote-scroll{overflow-x:auto;scrollbar-color:#7e6673 #201b23}.bod-vote-chart{list-style:none;margin:0;padding:8px 0 4px;display:grid;grid-auto-flow:column;grid-auto-columns:minmax(118px,1fr);gap:clamp(8px,2vw,22px)}.bod-vote-row{display:grid;grid-template-rows:28px 190px minmax(45px,auto);text-align:center;min-width:0;--vote-fill:#4e5261;--vote-top:#9d9fae;--vote-ink:#ebebf1}.bod-vote-row.lead-first{--vote-fill:#146646;--vote-top:#57d79c;--vote-ink:#a6f1cd}.bod-vote-row.lead-second{--vote-fill:#926010;--vote-top:#f5c75c;--vote-ink:#ffe2a0}.bod-vote-row.place-third{--vote-fill:#92243c;--vote-top:#f36b83;--vote-ink:#ffd0da}.bod-vote-row.seat-tie{--vote-fill:#633c9b;--vote-top:#bc9afb;--vote-ink:#e1ccff}.bod-vote-badge{color:var(--vote-ink);font-size:.7rem;font-weight:850;text-transform:uppercase;letter-spacing:.07em}.bod-vote-track{position:relative;display:block;border-bottom:1px solid #6f6371;background:repeating-linear-gradient(to top,transparent 0,transparent calc(25% - 1px),#54495755 calc(25% - 1px),#54495755 25%)}.bod-vote-fill{position:absolute;bottom:0;left:19%;width:62%;min-height:2px;border-radius:8px 8px 0 0;background:linear-gradient(to top,var(--vote-fill),var(--vote-top));transition:height .3s ease}.bod-vote-count{position:absolute;left:0;right:0;z-index:1;font-size:clamp(1rem,2vw,1.45rem);line-height:1;color:#fff;text-shadow:0 1px 3px #000;transition:bottom .3s ease}.bod-vote-label{padding:10px 2px 0;font-weight:750;overflow-wrap:anywhere;color:#fff}@media(prefers-reduced-motion:reduce){.bod-vote-fill,.bod-vote-count{transition:none}}';
    style.textContent += '.bod-vote-board{padding:0;overflow:hidden;background:#15151a}.bod-vote-hero{min-height:230px;display:flex;align-items:flex-end;position:relative;padding:clamp(18px,4vw,44px);background:linear-gradient(90deg,#0b080cf0 0%,#0d0a10c9 39%,#0d0a1026 85%),linear-gradient(0deg,#0c0b11b0,transparent 72%),url(assets/board-elections-card.webp) center 49%/cover}.bod-vote-hero h4{font-size:clamp(2.25rem,6vw,4.5rem);line-height:.94;max-width:11ch;margin:12px 0;font-weight:900;letter-spacing:-.035em;text-transform:uppercase}.bod-vote-live-label{display:inline-block;padding:6px 11px;border:1px solid #ffb3c073;border-radius:40px;background:#180910aa}.bod-vote-ballot-count{position:absolute;right:clamp(14px,3vw,36px);bottom:clamp(14px,3vw,36px);display:grid;gap:3px;padding:11px 15px;border:1px solid #ffffff55;border-radius:10px;background:#111017da;text-align:center;font-size:.72rem;text-transform:uppercase;letter-spacing:.08em}.bod-vote-ballot-count strong{font-size:2rem;line-height:1;color:white;letter-spacing:0}.bod-vote-content{padding:clamp(14px,3vw,30px)}.bod-vote-seat-cards{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-bottom:26px}.bod-vote-seat-card{padding:clamp(12px,2.6vw,23px);min-width:0;border:1px solid #3a6052;border-left:5px solid #6cdaa6;border-radius:11px;background:linear-gradient(120deg,#143429,#222528 72%)}.bod-vote-seat-card.second{border-color:#645539;border-left-color:#f3bf54;background:linear-gradient(120deg,#392a18,#252127 72%)}.bod-vote-seat-card.tied{border-color:#72549e;border-left-color:#be9cfa;background:linear-gradient(120deg,#33234d,#272331 72%)}.bod-vote-seat-card.empty{border-color:#4d4650;border-left-color:#9d929e;background:#252127}.bod-vote-seat-card small{display:block;color:#a1f4cd;font-weight:850;text-transform:uppercase;letter-spacing:.1em}.bod-vote-seat-card.second small{color:#ffda93}.bod-vote-seat-card.tied small{color:#dfcaff}.bod-vote-seat-card.empty small{color:#d0c4d0}.bod-vote-seat-card strong{display:block;margin-top:7px;color:#fff;font-size:clamp(1.1rem,2.6vw,2rem);line-height:1.12;overflow-wrap:anywhere}.bod-vote-seat-card p{margin:6px 0 0;line-height:1.35;font-size:.87rem}.bod-vote-content h5{margin:0 0 5px;font-size:1.16rem;color:#fff}.bod-vote-row{grid-template-rows:28px 210px minmax(45px,auto)}@media(max-width:460px){.bod-vote-hero{min-height:0;padding-bottom:16px;display:block}.bod-vote-hero h4{max-width:none}.bod-vote-ballot-count{position:static;display:inline-flex;align-items:baseline;gap:8px;padding:6px 10px}.bod-vote-ballot-count strong{font-size:1.2rem}.bod-vote-seat-cards{grid-template-columns:1fr}.bod-vote-row{grid-template-rows:28px 145px minmax(45px,auto)}}';
    style.textContent += '.bod-certification{margin:14px 0;padding:16px;border:1px solid #c4c8cf;border-radius:10px}.bod-cert-light{display:inline-flex;align-items:center;gap:8px;font-weight:800;color:#8b1934}.bod-cert-light:before{content:"";width:12px;height:12px;border-radius:50%;background:#bd2346}.bod-cert-light.certified{color:#155c3c}.bod-cert-light.certified:before{background:#168b56}.bod-cert-list{max-height:260px;overflow:auto;padding:10px 24px}.bod-cert-names label{display:block;margin:6px 0}.bod-cert-actions{display:flex;flex-wrap:wrap;align-items:center;gap:12px}';
    style.textContent += '.bod-election-header{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}.bod-election-header h3,.bod-election-header p{margin:0}.bod-election-columns{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;margin:12px 0 24px}.bod-election-column{background:#1c1f24;color:#fff;border:1px solid #525760;border-top:4px solid #b88831;border-radius:12px;padding:14px;min-width:0}.bod-election-column.accepted{border-top-color:#38a471}.bod-election-column.declined{border-top-color:#d65366}.bod-election-column h5{display:flex;justify-content:space-between;align-items:center;gap:8px;margin:0;font-size:1rem}.bod-election-column h5 span{background:#353a43;border-radius:30px;padding:2px 9px}.bod-election-column ul{list-style:none;margin:10px 0 0;padding:0}.bod-election-column li{border-top:1px solid #525760;padding:9px 0;overflow-wrap:anywhere}.bod-election-column small{display:block;color:#d3d7de}.bod-election-column p{margin:8px 0 0}.bod-election-rehearsal{border-top:1px solid #525760;padding-top:14px}.bod-election-rehearsal button{margin:4px 4px 4px 0}@media(max-width:680px){.bod-election-columns{grid-template-columns:1fr}}';
    style.textContent += '.bod-mail-footer{position:sticky;bottom:0;padding:14px 0 4px;background:#fff;border-top:1px solid #d3d6da}.bod-mail-footer .bod-admin-actions button{font-weight:800;border:1px solid transparent}.bod-mail-footer button[data-mail-state=locked]{background:#d5d8dd;color:#4d535d}.bod-mail-footer button[data-mail-state=ready]{background:#b41933;color:#fff}.bod-mail-footer button[data-mail-state=working]{background:#f7ca42;color:#1b1b1b;opacity:1}.bod-mail-footer button[data-mail-state=done]{background:#19734a;color:#fff;opacity:1;cursor:default}.bod-mail-footer button[data-mail-state=locked]{cursor:default}.bod-mail-footer .bod-admin-status{margin:8px 0 0;color:#252932;min-height:1.5em}';
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
  const DEFAULT_2027_DEADLINE='Tuesday, November 10, 2026, at 11:59 p.m. Eastern';
  function invitationText(name,year,deadline,links) {
    deadline=deadline||(Number(year)===2027?DEFAULT_2027_DEADLINE:'');
    return `Hi ${name},\n\nYou’ve been nominated to serve on the ${year} BoneShakers Social Club Board of Directors. Thank you for considering the opportunity to help lead our club.\n\nBefore responding, please review the requirements to serve:\n${REQUIREMENTS_URL}\n\nWould you like to accept your nomination and be considered in December’s election?\n\nYes, I Accept${links?': '+links.yes:''}\nNo, I Decline${links?': '+links.no:''}\n\n${deadline?'Please respond by '+deadline+'. ':''}If we do not receive your acceptance before the deadline, your nomination will be treated as declined and your name will not appear on the ballot. Questions? Simply reply to this email.\n\nThank you,\nBoneShakers Social Club\nBoard Elections`;
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
    deadline=deadline||(Number(year)===2027?DEFAULT_2027_DEADLINE:'');
    const button=(url,label,color)=>`<a href="${html(url)}" style="display:inline-block;background:${color};border:1px solid ${color};border-radius:7px;color:#fff;text-decoration:none;padding:14px 23px;font:bold 16px Arial;text-align:center">${label}</a>`;
    return electionEmail(`Your ${year} Board Nomination`,name,`<p style="line-height:1.65">You’ve been nominated to serve on the <strong>${year} BoneShakers Social Club Board of Directors</strong>. Thank you for considering the opportunity to help lead our club.</p><p style="line-height:1.65">Before responding, please review the <a href="${REQUIREMENTS_URL}" style="color:#ff8395">requirements to serve</a>.</p><p style="font-weight:bold;line-height:1.65;margin-top:24px">Would you like to accept your nomination and be considered in December’s election?</p><table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="padding:10px 12px 20px 0">${button(links.yes,'Yes, I Accept','#187447')}</td><td style="padding:10px 0 20px">${button(links.no,'No, I Decline','#b82835')}</td></tr></table><p style="line-height:1.65">${deadline?'Please respond by <strong>'+html(deadline)+'</strong>. ':''}If we do not receive your acceptance before the deadline, your nomination will be treated as declined and your name will not appear on the ballot. Questions? Simply reply to this email.</p>`);
  }
  function electionEmail(title,name,content,ballotYear) {
    return `<html><body style="margin:0;background:#000;font:16px Arial,sans-serif;color:#fff"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:28px 12px"><table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#101010;color:#fff;border:1px solid #555;border-top:5px solid #ba1731;border-radius:12px"><tr><td style="padding:28px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:22px"><tr><td width="${ballotYear?'26%':'45%'}" align="left"><img src="https://bsscvb-maker.github.io/bsscportal/assets/election-email-boneshakers.png" width="112" alt="BoneShakers Social Club" style="display:block;width:112px;max-width:100%;height:auto;border:0;color:#fff"></td>${ballotYear?`<td width="48%" align="center" style="padding:0 5px;color:#fff"><strong style="display:block;font-size:40px;font-size:clamp(28px,7vw,48px);line-height:1">${html(ballotYear)}</strong><strong style="display:block;font-size:12px;letter-spacing:1px;margin-top:7px">BOARD ELECTIONS</strong></td>`: ''}<td width="${ballotYear?'26%':'55%'}" align="right"><img src="https://bsscvb-maker.github.io/bsscportal/assets/election-email-bikes-for-tykes.png" width="180" alt="Bikes for Tykes" style="display:block;width:180px;max-width:100%;height:auto;border:0;color:#fff"></td></tr></table>${ballotYear?'':`<p style="font-size:12px;font-weight:bold;letter-spacing:2px;color:#fff">BONESHAKERS SOCIAL CLUB</p>`}<h1${ballotYear?' class="bod-vote-headline"':''} style="${ballotYear?'color:#ff4d65!important;font-size:40px;font-weight:900;line-height:1.12;text-align:center;margin:24px 0;':'font-size:24px;line-height:1.4;margin:20px 0'}">${html(title)}</h1>${name?`<p style="line-height:1.65">Hi ${html(name)},</p>`:''}${content}${ballotYear?'':`<p style="line-height:1.65;margin-top:24px">Thank you,<br><strong>BoneShakers Social Club</strong><br>Board Elections</p>`}</td></tr></table></td></tr></table></body></html>`;
  }
  function voterEmailHtml(year,url='https://boneshakerssocialclub.com/election-'+year,rehearsal=false) {
    const buttonStyle='display:inline-block;background:#ba1731;color:#fff;border-radius:8px;padding:16px 28px;min-width:200px;font-size:20px;font-weight:800;text-align:center;text-decoration:none';
    const action=url?`<a href="${html(url)}" style="${buttonStyle}">Open ballot</a>`:`<span style="${buttonStyle}">Open ballot</span>`;
    return electionEmail('TIME TO VOTE','',`<p style="line-height:1.65">Two seats are open on the BoneShakers Board. Your vote helps choose who will lead the club, support our rides and events, and carry our work in the community forward.</p><p style="line-height:1.65">Open the ballot, verify your membership, and choose one or two candidates. Then review your choices and submit your private vote.</p><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:12px 0 18px">${action}</td></tr></table><p style="line-height:1.65">Thanks for showing up for the club and making your voice heard.</p>${Number(year)===2027?'<p>Official voting opens November 24, 2026 at 6:30 p.m. ET and closes December 1, 2026 at 6:30 p.m. ET.</p>':''}${rehearsal?'<p style="border-top:1px solid #555;padding-top:12px;color:#c9c9c9;font-size:12px">Rehearsal email · Sent to Purchasing for review.</p>':''}`,year);
  }
  function responseReceiptHtml(name,year,accepted) {
    if(!accepted)return electionEmail('Your nomination response is confirmed',name,`<p>Thank you for taking the time to consider serving on the ${year} Board of Directors. We’ve recorded your decision to decline the nomination.</p><p>We appreciate your continued dedication to BoneShakers and everything you do for the club. We look forward to seeing you at upcoming rides, meetings, and events.</p>`);
    return electionEmail('Your nomination acceptance is confirmed',name,`<p>Thank you for accepting your nomination to serve on the ${year} BoneShakers Social Club Board of Directors. We’ve recorded your acceptance, and <strong>your name will appear on the ballot at the December election.</strong></p><p>We appreciate your willingness to step up for the club. Here’s the Board service guide to read before the election.</p><section style="line-height:1.6;background:#202020;color:#fff;border-left:4px solid #ba1731;padding:18px"><h2>Board Service Requirements and Expectations</h2><h3 style="color:#ff9ca9;margin:22px 0 6px">Can I serve?</h3><ul><li><strong>Membership:</strong> Eligible voting full member in good standing, with one completed year of active full membership by taking office.</li><li><strong>Renewal:</strong> Meet the applicable renewal qualification.</li><li><strong>Attendance:</strong> At least 75% of general meetings actually held from January 1 through the close of nominations, rounded up. This also applies to Lifer and Past President candidates.</li><li><strong>Commitment:</strong> Demonstrate leadership and support the club’s purposes.</li></ul><p>The Secretary verifies qualifications from official records. Appointees meet the same attendance qualification through appointment consideration. A documented attendance hardship exception requires the bylaw vote; it does not waive the one-year membership rule.</p><h3 style="color:#ff9ca9;margin:22px 0 6px">Time and attendance</h3><ul><li><strong>Board meetings:</strong> Normally the last Tuesday of each month.</li><li><strong>General meetings:</strong> Normally the first Tuesday. Confirm announced times and locations.</li><li><strong>Between meetings:</strong> Read reports, respond to club communications and finish the work you accept.</li><li><strong>Events:</strong> Help with assigned rides, fundraisers and community activities.</li></ul><p>Plan for meeting time plus preparation and tasks. Officer duties and major events can take more time; there is no hourly minimum created by this guide.</p><p>Notify both the President and Vice President at least 24 hours before an absence when practicable, or as soon as possible in a true emergency. Attendance review and any resulting action follow the adopted bylaws.</p><h3 style="color:#ff9ca9;margin:22px 0 6px">Your work as a director</h3><ul><li>Read the agenda, budget and supporting reports before voting.</li><li>Ask what a proposal will accomplish, what it costs and who will carry it out.</li><li>Cast your own Board vote. A director cannot give that vote to a proxy.</li><li>Lead or support assigned committees, projects and events.</li><li>Report progress early and ask for help before a deadline is missed.</li></ul><p><strong>Example:</strong> When a member requests assistance, use the approved process, confirm available funds, disclose any conflict and record the authorized decision before promising payment.</p><h3 style="color:#ff9ca9;margin:22px 0 6px">Conduct and confidentiality</h3><ul><li>Disagree respectfully. Avoid personal attacks, threats, intimidation and disruption.</li><li>Follow meeting procedures and support authorized decisions.</li><li>Protect private member, Board and financial information during and after service.</li><li>Disclose personal, family, business or financial conflicts and follow recusal rules.</li><li>Use approved club accounts and protect records and access.</li></ul><p>Confidentiality does not prevent required disclosures, good-faith reports to appropriate authorities or confidential professional advice. Corrective action follows the bylaws and fair process.</p><h3 style="color:#ff9ca9;margin:22px 0 6px">Money and fundraising</h3><ul><li>Follow spending and contract approval limits.</li><li>Keep receipts, protect designated funds and document money transfers.</li><li>Do not make unauthorized commitments in the club’s name.</li><li>Support fundraising through time, promotion and practical work.</li><li>Complete any required conflict-of-interest disclosure.</li></ul><p>Personal contributions are encouraged when able. This guide creates no required donation amount.</p><h3 style="color:#ff9ca9;margin:22px 0 6px">Offices and handover</h3><p>Election to the Board gives you a director seat. Officer selection is a separate process; no particular title is guaranteed.</p><ul><li><strong>President:</strong> Chairs meetings and coordinates authorized operations.</li><li><strong>Vice President:</strong> Supports the President and provides continuity.</li><li><strong>Secretary:</strong> Keeps minutes, notices and official records.</li><li><strong>Treasurer:</strong> Maintains financial records, receipts, reports and budgets.</li><li><strong>Sergeant at Arms:</strong> Supports meeting order and safety within approved authority.</li><li><strong>Directors:</strong> Share voting responsibility and support assigned work.</li></ul><p>Ordinary directors serve staggered two-year terms beginning January 1. Confirm the actual seat and term on the election record, including any shorter unexpired term. The President serves two years; the other four core officers serve one year under the current portal bylaws. Core officer qualifications and exceptions follow the bylaws.</p><p>When your role ends, transfer essential access at succession and remaining club records and property within seven calendar days using a jointly acknowledged handover checklist. Document external provider delays.</p><h3 style="color:#ff9ca9;margin:22px 0 6px">After you are elected</h3><ol><li>Confirm your seat and term dates with the Secretary.</li><li>Read the current bylaws, operating policies, recent minutes and budget.</li><li>Complete your own online Board acceptance. Returning directors complete a fresh annual acknowledgment too.</li><li>Review open work and records with the outgoing director or officer.</li><li>Agree on your first assignments and who will help you learn the role.</li></ol><p>If workload or availability changes, tell the President or an appropriate unconflicted director promptly. Any resignation, review or removal follows the bylaws.</p><p>The adopted bylaws and operating policies govern Board service.</p></section>`);
  }

  function electionCards() {
    return `<nav data-bod-gallery class="bod-stage-cards" aria-label="Board Elections"><button type="button" data-bod-section="nominations"><img class="bod-stage-art" src="assets/board-nominations-form.webp" alt="" width="1000" height="440"><strong>Nominations</strong></button><button type="button" data-bod-section="election"><img class="bod-stage-art" src="assets/board-elections-card.webp" alt="" width="1000" height="440"><strong>Elections</strong></button></nav><button type="button" class="membership-tab" data-bod-back hidden>← Back to Board Elections</button>`;
  }
  function invitationPanel(year) {
    return `<section class="bod-results bod-results-panel bod-history-panel" id="bod-invitations"><div class="bod-panel-heading"><h3>Nominees &amp; Decisions · ${year}</h3></div><button type="button" data-bod-invite-preview>Review nominee invitations</button><button type="button" data-bod-invite-rehearsal>Preview as closed</button><button type="button" data-bod-response-refresh>Refresh responses</button><p data-bod-invite-summary role="status"></p><div data-bod-response-list></div><section data-bod-election hidden><header class="bod-election-header"><div><h3>${year} Board Election</h3><p>Two open seats · Up to two choices per ballot</p></div><button type="button" data-bod-election-refresh>Refresh responses</button></header>${Number(year)===2027?'<section class="bod-certification" data-bod-certification><div class="bod-cert-actions"><span class="bod-cert-light" data-bod-cert-light>Not certified</span><button type="button" data-bod-cert-review disabled>Review and certify</button></div><p data-bod-cert-status role="status"></p><div data-bod-cert-details></div></section>':''}<label>Responses to show <select data-bod-response-mode><option value="official" selected>Live Data</option><option value="rehearsal">Test Responses</option></select></label><h4 data-bod-response-heading>Official nominee responses</h4><p data-bod-response-note>Accepted nominees are pending qualification review.</p><div data-bod-real-slate role="status">Loading nominee responses…</div><section class="bod-election-rehearsal" hidden><h4>Ballot rehearsal</h4><p>Send a test voter email to Purchasing to check the link to the club’s Election page.</p><section data-bod-test-slate aria-live="polite" hidden><h4>Test ballot results</h4><p>Loading test tally…</p></section><button type="button" data-bod-reset-test-ballots>Reset test ballots</button> <p data-bod-receipt-status role="status"></p><button type="button" data-bod-test-ballot-mail>Send test voter email to Purchasing</button><p data-bod-ballot-status role="status"></p><details><summary>Draft voter email</summary><p>Subject: Vote in the ${year} BoneShakers Board Election</p>${voterEmailHtml(year)}</details></section></section></section>`;
  }
  async function responseApi(path,year,data) {
    const response=await fetch(RESPONSE_ORIGIN+'/api/admin/'+path+'?year='+year,{method:data?'POST':'GET',headers:{Authorization:'Bearer '+accessToken,...(data?{'Content-Type':'application/json'}:{})},...(data?{body:JSON.stringify(data)}:{}),signal:AbortSignal.timeout(30000)});
    const result=await response.json();if(!response.ok)throw Error(result.error||'Responses could not be loaded.');return result;
  }
  function responseMarkup(model,records){
    const byName=new Map(records.map(r=>[normalize(r.name),r]));
    const nominees=model.nominees.length?'<table class="bod-response-table"><thead><tr><th>Nominee</th><th>Response</th><th>Received</th></tr></thead><tbody>'+[...model.nominees].sort((a,b)=>a.name.localeCompare(b.name)).map(person=>{const record=byName.get(normalize(person.name)),state=record?.status||'Not sent';return '<tr><td>'+html(person.name)+'</td><td><span class="bod-response-badge '+(state==='Accepted'?'accepted':state==='Declined'?'declined':'waiting')+'">'+html(state)+'</span></td><td>'+html(record?.responded_at?formatHistoryTime(record.responded_at):'—')+'</td></tr>';}).join('')+'</tbody></table>':'<p class="bod-panel-intro">Nominated members and their decisions will appear here.</p>';
    return nominees;
  }
  function electionResponseColumns(model,records,rehearsal=false){
    const byName=new Map(records.map(record=>[normalize(record.name),record]));
    const groups=[
      {key:'accepted',label:'Accepted',people:[]},
      {key:'declined',label:'Declined',people:[]},
      {key:'waiting',label:'Yet to Reply',people:[]}
    ];
    for(const person of [...model.nominees].sort((a,b)=>a.name.localeCompare(b.name))){
      const record=byName.get(normalize(person.name));
      const group=record?.status==='Accepted'?groups[0]:record?.status==='Declined'?groups[1]:groups[2];
      const hasEvidence=!rehearsal&&record?.hasEvidence;
      const responseTime=hasEvidence&&normalize(person.name)==='gene lindsey'?'2026-11-07T01:55:00Z':record?.responded_at;
      group.people.push({name:person.name,note:rehearsal?'':record?.evidenceNote,hasEvidence,detail:responseTime&&group.key!=='waiting'?formatHistoryTime(responseTime):group.key==='waiting'?(record?'Awaiting reply':rehearsal?'Test invitation not sent':'Invitation not sent'):''});
    }
    return '<div class="bod-election-columns">'+groups.map(({key,label,people})=>
      `<section class="bod-election-column ${key}"><h5>${label} <span>${people.length}</span></h5>${people.length?'<ul>'+people.map(({name,detail,note,hasEvidence})=>`<li${hasEvidence?' class="bod-has-evidence"':''}><strong>${html(name)}</strong>${detail?'<small>'+html(detail)+'</small>':''}${note&&!hasEvidence?'<small>'+html(note)+'</small>':''}${hasEvidence?`<button type="button" class="bod-evidence-bubble" data-bod-view-response-evidence="${html(note||'')}" aria-label="View evidence for ${html(name)}" title="View evidence" aria-haspopup="dialog"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 5h16v11h-8l-5 4v-4H4z"/><path d="M8 9h8m-8 3h6"/></svg></button>`:''}</li>`).join('')+'</ul>':'<p>None yet</p>'}</section>`
    ).join('')+'</div>';
  }
  async function adminBatch(requests,signal=AbortSignal.timeout(30000)) {
    const actor=normalize(await getPortalAuditActor());
    if(!ADMIN_EMAILS.includes(actor)||!accessToken)throw Error('Sign in with the President or bsscvb account.');
    const response=await fetch('https://sheets.googleapis.com/v4/spreadsheets/'+MEMBERSHIP_SPREADSHEET_ID+':batchUpdate',{method:'POST',headers:{Authorization:'Bearer '+accessToken,'Content-Type':'application/json'},body:JSON.stringify({requests}),signal});
    if(!response.ok){const data=await response.json().catch(()=>({}));throw Error(data.error?.message||'Could not save. Refresh to check the current records before trying again.');}
  }
  async function ensureAdminSheet(name,headers) {
    let metadata=await fetchSheetRead('https://sheets.googleapis.com/v4/spreadsheets/'+MEMBERSHIP_SPREADSHEET_ID+'?fields=properties(timeZone),sheets.properties');
    let sheet=metadata.sheets.find(s=>s.properties.title===name);
    if(!sheet){const id=crypto.getRandomValues(new Uint32Array(1))[0]%2000000000;await adminBatch([{addSheet:{properties:{sheetId:id,title:name}}},{updateCells:{start:{sheetId:id,rowIndex:0,columnIndex:0},rows:[cellRows(headers)],fields:'userEnteredValue'}}]);sheet={properties:{sheetId:id,title:name}};}
    const rows=await getSheetValues(sheetRange(name,'A:K'),MEMBERSHIP_SPREADSHEET_ID);
    if(headers.some((h,i)=>rows[0]?.[i]!==h))throw Error('Unexpected headers in '+name+'. Review the source sheet.');
    return {id:sheet.properties.sheetId,rows};
  }
  function bindNextStep(target,model,context,membershipStatus,summary,initialView) {
    const panel=target.querySelector('#bod-invitations'),list=panel.querySelector('[data-bod-response-list]');
    let refreshing=false,testResponses=[];
    const certification=panel.querySelector('[data-bod-certification]');
    async function refreshCertification(){
      if(!certification)return;
      const light=certification.querySelector('[data-bod-cert-light]'),button=certification.querySelector('[data-bod-cert-review]'),status=certification.querySelector('[data-bod-cert-status]');
      try{
        const state=await responseApi('election-certification',context.year);
        const approved=state.certified;
        light.textContent=approved?'Certified':'Not certified';
        light.classList.toggle('certified',Boolean(approved));
        button.disabled=!state.closed||Boolean(approved);
        status.textContent=approved?'Approved by '+approved.actor+' · '+approved.slate.length+' candidates · '+approved.voters.length+' eligible voters':
          state.closed?'Review the accepted nominees and eligible voter list before certifying.':'Review opens November 11 at midnight Eastern, after nominee responses close.';
        if(approved){
          const details=certification.querySelector('[data-bod-cert-details]');
          details.innerHTML='<details><summary>View certified slate and voter list</summary><h5>Candidate slate</h5><ul>'+
            approved.slate.map(name=>'<li>'+html(name)+'</li>').join('')+'</ul><h5>Eligible voters</h5><ul class="bod-cert-list">'+
            approved.voters.map(voter=>'<li>'+html(voter.name)+' · '+html(voter.email)+'</li>').join('')+'</ul></details>';
        }
      }catch(error){status.textContent=error.message;button.disabled=true;}
    }
    if(certification){
      const button=certification.querySelector('[data-bod-cert-review]'),details=certification.querySelector('[data-bod-cert-details]');
      button.onclick=async()=>{
        button.disabled=true;details.textContent='Preparing the review…';
        try{
          const review=await responseApi('election-certification',context.year,{action:'review'});
          details.innerHTML='<form><fieldset class="bod-cert-names"><legend>Accepted nominees · select the qualified candidates</legend>'+
            review.nominees.map(name=>'<label><input type="checkbox" name="nominee" value="'+html(name)+'" checked> '+html(name)+'</label>').join('')+
            '</fieldset><details><summary>Review '+review.voters.length+' eligible voters</summary><ul class="bod-cert-list">'+
            review.voters.map(voter=>'<li>'+html(voter.name)+' · '+html(voter.email)+'</li>').join('')+'</ul></details>'+
            (review.issues.length?'<ul>'+review.issues.map(issue=>'<li>'+html(issue)+'</li>').join('')+'</ul>':'')+
            '<p><label><input type="checkbox" name="approved" required> I approve the selected candidates and the eligible voter list.</label></p>'+
            '<button type="submit" '+(review.issues.length||review.nominees.length<2||!review.voters.length?'disabled':'')+'>Certify slate and voter list</button> <button type="button" data-bod-cert-cancel>Cancel</button><p role="status"></p></form>';
          const form=details.querySelector('form'),status=form.querySelector('[role=status]'),submit=form.querySelector('[type=submit]');
          form.querySelector('[data-bod-cert-cancel]').onclick=()=>{details.replaceChildren();button.disabled=false;};
          form.onsubmit=async event=>{
            event.preventDefault();submit.disabled=true;
            try{
              const slate=new FormData(form).getAll('nominee');
              await responseApi('election-certification',context.year,{action:'certify',revision:review.revision,slate});
              details.replaceChildren();await refreshCertification();
            }catch(error){status.textContent=error.message;submit.disabled=false;}
          };
        }catch(error){details.textContent=error.message;button.disabled=false;}
      };
    }
    const election=panel.querySelector('[data-bod-election]');
    const responseColumns=panel.querySelector('[data-bod-real-slate]');
    const responseMode=panel.querySelector('[data-bod-response-mode]');
    responseColumns.addEventListener('click',async event=>{
      const button=event.target.closest('[data-bod-view-response-evidence]');
      if(!button)return;
      const dialog=document.createElement('dialog');
      dialog.className='bod-evidence-dialog';
      dialog.setAttribute('aria-label','Nominee response evidence');
      dialog.innerHTML='<header><h2>Nominee response evidence</h2><form method="dialog"><button type="submit">Close</button></form></header><p></p><div role="status">Loading evidence…</div>';
      dialog.querySelector('p').textContent=button.dataset.bodViewResponseEvidence;
      const result=dialog.querySelector('[role=status]');
      const request=new AbortController();
      dialog.addEventListener('close',()=>{request.abort();dialog.remove();button.focus();},{once:true});
      document.body.append(dialog);
      dialog.showModal();
      let objectUrl;
      try{
        const response=await fetch(RESPONSE_ORIGIN+'/api/admin/response-evidence?year='+context.year,{headers:{Authorization:'Bearer '+accessToken},signal:AbortSignal.any([request.signal,AbortSignal.timeout(30000)])});
        if(!response.ok||!response.headers.get('Content-Type')?.startsWith('image/png'))throw Error('Evidence could not be loaded. Refresh your session and retry.');
        objectUrl=URL.createObjectURL(await response.blob());
        const screenshot=new Image();
        screenshot.alt='iMessage screenshot showing James relaying Gene Lindsey’s decision';
        screenshot.src=objectUrl;
        await screenshot.decode();
        result.replaceChildren(screenshot);
      }catch(error){if(!request.signal.aborted)result.textContent=error.message;}
      finally{if(objectUrl)URL.revokeObjectURL(objectUrl);}
    });
    let officialResults=null,rehearsalResults=null,officialError='',rehearsalError='';
    function renderElectionResponses(){
      const rehearsal=responseMode.value==='rehearsal';
      panel.querySelector('[data-bod-response-heading]').textContent=rehearsal?'Test nomination responses':'Official nominee responses';
      panel.querySelector('[data-bod-response-note]').textContent=rehearsal?'Test nominee responses and ballot totals.':'Accepted nominees are pending qualification review.';
      const results=rehearsal?rehearsalResults:officialResults;
      const error=rehearsal?rehearsalError:officialError;
      if(error||!results){responseColumns.textContent=error||'Loading nominee responses…';return;}
      const nominees=rehearsal?[...new Map([...model.nominees,...results].map(person=>[normalize(person.name),person])).values()]:model.nominees;
      responseColumns.innerHTML=electionResponseColumns({nominees},results,rehearsal);
    }
    function updateElectionResponseMode(){
      const showTestResponses=responseMode.value==='rehearsal';
      election.querySelector('.bod-election-rehearsal').hidden=!showTestResponses;
      election.querySelector('[data-bod-test-slate]').hidden=!showTestResponses;
      renderElectionResponses();
    }
    responseMode.onchange=updateElectionResponseMode;
    const gallery=target.querySelector('[data-bod-gallery]');
    const back=target.querySelector('[data-bod-back]');
    const cards=gallery.querySelectorAll('[data-bod-section]');
    const nominations=target.querySelector('[data-bod-nomination-content]');
    const history=target.querySelector('[data-bod-history-content]');
    let selectedCard;
    function showView(card, moveFocus) {
      selectedCard=card;
      const showElection=card?.dataset.bodSection==='election';
      gallery.hidden=Boolean(card);
      back.hidden=!card;
      back.dataset.bodView=card?.dataset.bodSection||'';
      membershipStatus.textContent=card&&!showElection?summary:'';
      panel.hidden=!card;
      election.hidden=!showElection;
      nominations.hidden=history.hidden=!card||showElection;
      for(const child of panel.children)if(child!==election)child.hidden=showElection;
      if(moveFocus) {
        const destination=card?back:gallery;
        destination.scrollIntoView({block:'nearest'});
        (card?back:returnCard).focus({preventScroll:true});
      }
      if(showElection){
        responseMode.value='official';
        updateElectionResponseMode();
        refreshResponses();
        refreshCertification();
      }
    }
    let returnCard;
    cards.forEach(button=>button.onclick=()=>showView(button,true));
    back.onclick=()=>{returnCard=selectedCard;showView(null,true);};
    async function issuePrivateBallot() {
      const result=await responseApi('issue-rehearsal-ballot',context.year,{});
      const url=new URL(result.url);
      if(url.origin!==RESPONSE_ORIGIN||url.pathname!=='/rehearsal-ballot'||url.searchParams.get('year')!==String(context.year)||!(/^[a-f0-9]{64}$/).test(url.searchParams.get('token')||''))throw Error('The test ballot link is invalid.');
      return url.href;
    }
    const sendBallot=panel.querySelector('[data-bod-test-ballot-mail]');
    const ballotStatus=panel.querySelector('[data-bod-ballot-status]');
    let ballotMailBusy=false;
    const updateBallotMail=()=>{sendBallot.disabled=ballotMailBusy;};
    sendBallot.onclick=async()=>{
      if(ballotMailBusy)return;
      ballotMailBusy=true;updateBallotMail();
      ballotStatus.textContent='Sending test voter email to Purchasing…';
      try{
        const token=await mailToken();
        const body=voterEmailHtml(context.year,await issuePrivateBallot(),true);
        await sendInvitationMail(token,'purchasing@boneshakerssocialclub.com','[TEST] Vote in the '+context.year+' BoneShakers Board Election',body);
        ballotStatus.textContent='Test voter email sent to Purchasing.';
      }catch(error){ballotStatus.textContent=error.message;}
      finally{ballotMailBusy=false;updateBallotMail();}
    };
    updateBallotMail();
    showView([...cards].find(card=>card.dataset.bodSection===initialView),false);
    const testTally=panel.querySelector('[data-bod-test-slate]');
    const receiptStatus=panel.querySelector('[data-bod-receipt-status]');
    panel.querySelector('[data-bod-reset-test-ballots]').onclick=async event=>{
      if(!window.confirm('Reset the test tally and retire its old ballot links? Send a new test voter email to start again.'))return;
      const button=event.currentTarget;
      button.disabled=true;
      try{
        await responseApi('reset-test-ballots',context.year,{});
        ballotStatus.textContent='Test ballots reset. Send a new test voter email to start again.';
        await refreshResponses();
      }catch(error){ballotStatus.textContent=error.message;}finally{button.disabled=false;}
    };
    async function deliverTestReceipt(){
      if(election.hidden)return;
      const token=currentElectionMailToken();
      if(!token){receiptStatus.textContent='Send a test voter email to authorize delivery, then keep Elections open for the receipt.';return;}
      const receipt=await responseApi('test-ballot-receipt',context.year,{action:'claim'});
      if(!receipt.id)return;
      try{
        const body=electionEmail('Your vote was recorded',receipt.firstName,'<p><strong>Thank you for voting. Your voice was heard.</strong></p><p>By showing up today, you’re helping shape the BoneShakers of tomorrow. Thank you for taking an active part in the club.</p><p>This is your confirmation that your test ballot was recorded.</p>',context.year);
        await sendInvitationMail(token,'purchasing@boneshakerssocialclub.com','[TEST] Thank you for voting · '+context.year+' Board Election',body);
      }catch(error){
        await responseApi('test-ballot-receipt',context.year,{action:'failed',id:receipt.id});
        throw error;
      }
      await responseApi('test-ballot-receipt',context.year,{action:'sent',id:receipt.id});
      receiptStatus.textContent='Test vote confirmation sent to Purchasing.';
    }
    async function refreshResponses(){
      updateBallotMail();
      if(refreshing||!panel.isConnected)return;refreshing=true;
      try{
        const result=await responseApi('responses',context.year);
        if(panel.isConnected){list.innerHTML=responseMarkup(model,result.responses);officialResults=result.responses;officialError='';renderElectionResponses();}
      }catch(error){if(panel.isConnected){list.textContent=error.message;officialError=error.message;renderElectionResponses();}}
      try{
        const result=await responseApi('rehearsals',context.year);
        testResponses=result.responses;
        rehearsalResults=testResponses;rehearsalError='';renderElectionResponses();
        const resultsByName=new Map(result.totals.map(row=>[row.name,Number(row.votes)]));
        const accepted=result.responses.filter(row=>row.status==='Accepted');
        if(accepted.length>=2)for(const row of accepted)if(!resultsByName.has(row.name))resultsByName.set(row.name,0);
        const totals=[...resultsByName].sort(([a,av],[b,bv])=>bv-av||a.localeCompare(b));
        const maxVotes=Math.max(1,totals[0]?.[1]||0);
        const cutoff=totals[1]?.[1]||0;
        const tiedForSeat=cutoff>0&&totals[2]?.[1]===cutoff;
        const chart=totals.map(([name,votes],index)=>{
          const tied=tiedForSeat&&votes===cutoff;
          const leader=votes>0&&index<2&&!tied;
          const tone=tied?' seat-tie':leader?(index===0?' lead-first':' lead-second'):index===2&&votes>0?' place-third':'';
          const label=tied?'Tied at cutoff':leader?(totals[0][1]===cutoff?'Joint lead':index===0?'Leading seat 1':'Leading seat 2'):'';
          const height=Math.round(votes/maxVotes*82);
          return '<li class="bod-vote-row'+tone+'"><span class="bod-vote-badge">'+label+'</span><span class="bod-vote-track"><span aria-hidden="true" class="bod-vote-fill" style="height:'+height+'%"></span><strong class="bod-vote-count" style="bottom:calc('+height+'% + 5px)">'+votes+'</strong></span><span class="bod-vote-label">'+html(name)+'</span></li>';
        }).join('');
        const tiedNames=tiedForSeat?totals.filter(([,votes])=>votes===cutoff).map(([name])=>name):[];
        const seatCards=[0,1].map(index=>{
          const row=totals[index];
          const tied=Boolean(row&&tiedForSeat&&row[1]===cutoff);
          const hasVotes=Boolean(row?.[1]);
          const tone=tied?' tied':!hasVotes?' empty':index===1?' second':'';
          const title=tied?'Undecided':hasVotes?row[0]:'Awaiting votes';
          const detail=tied?tiedNames.join(' · '):hasVotes?row[1]+' '+(row[1]===1?'test vote':'test votes'):'';
          return '<article class="bod-vote-seat-card'+tone+'"><small>Seat '+(index+1)+(tied?' · Tied':hasVotes?' · Current leader':'')+'</small><strong>'+html(title)+'</strong>'+(detail?'<p>'+html(detail)+'</p>':'')+'</article>';
        }).join('');
        testTally.innerHTML='<div class="bod-vote-board"><div class="bod-vote-hero"><div><div class="bod-vote-kicker bod-vote-live-label">Test results · Two seats</div><h4>'+Number(context.year)+' Election</h4></div><div class="bod-vote-ballot-count"><strong>'+Number(result.ballots||0)+'</strong> Test ballots</div></div><div class="bod-vote-content"><div class="bod-vote-seat-cards">'+seatCards+'</div><h5>Candidate standings</h5>'+
          (chart?'<div class="bod-vote-scroll" tabindex="0" aria-label="Election leaderboard"><ol class="bod-vote-chart" aria-label="Candidates ranked by test votes">'+chart+'</ol></div>':'<p>Waiting for the first test ballot.</p>')+'</div></div>';
        if(result.ballots)election.querySelector('.bod-election-header').after(testTally);
        else panel.querySelector('[data-bod-reset-test-ballots]').before(testTally);
        try{if(result.ballots)await deliverTestReceipt();}catch(error){receiptStatus.textContent='Test receipt could not be confirmed: '+error.message;}
      }catch(error){rehearsalError=error.message;renderElectionResponses();testTally.textContent=error.message;}
      finally{refreshing=false;}
    }
    panel.querySelector('[data-bod-response-refresh]').onclick=refreshResponses;
    panel.querySelector('[data-bod-election-refresh]').onclick=()=>{refreshResponses();refreshCertification();};
    refreshResponses();
    const poll=()=>setTimeout(async()=>{if(!panel.isConnected)return;await refreshResponses();poll();},election.hidden?30000:5000);poll();
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
    panel.querySelector('[data-bod-invite-rehearsal]').onclick=async event=>{
      const button=event.currentTarget,summary=panel.querySelector('[data-bod-invite-summary]');
      button.disabled=true;summary.textContent='Loading the nominee roster for the closed preview…';
      try{
        const roster=await getSheetValues(sheetRange(String(context.year),'A:AZ'),MEMBERSHIP_SPREADSHEET_ID);
        const recipients=invitationRecipients(model,roster);
        if(!recipients.length)throw Error('No nominees are available to preview.');
        openInvitations(recipients,model,context,{rows:[]},true);
        summary.textContent='Closed preview opened. Test messages go only to Purchasing.';
      }catch(error){summary.textContent=error.message;}finally{button.disabled=false;}
    };
    target.querySelector('[data-bod-invite-preview]').onclick=async event=>{
      event.target.disabled=true;const summary=target.querySelector('[data-bod-invite-summary]');summary.textContent='Loading roster and invitation history…';
      try{const roster=await getSheetValues(sheetRange(String(context.year),'A:AZ'),MEMBERSHIP_SPREADSHEET_ID),recipients=invitationRecipients(model,roster);if(!recipients.length)throw Error('No nominees yet. Invitations will be available once members are nominated.');
        const log=await ensureAdminSheet('BOD Invitations '+context.year,INVITE_HEADERS);openInvitations(recipients,model,context,log);summary.textContent='Review the email and recipients before sending.';
      }catch(error){summary.textContent=error.message;}finally{event.target.disabled=false;}
    };
  }
  let electionMailGrant;
  function currentElectionMailToken() {
    return electionMailGrant?.portalToken===accessToken && electionMailGrant.expiresAt>Date.now()?electionMailGrant.token:null;
  }
  async function mailToken() {
    const current=currentElectionMailToken();
    if(current)return current;
    const portalToken=accessToken;
    const sendScope='https://www.googleapis.com/auth/gmail.send', identityScope='https://www.googleapis.com/auth/userinfo.email';
    const grant=await new Promise((resolve,reject)=>{
      google.accounts.oauth2.initTokenClient({
        client_id:GOOGLE_CLIENT_ID,
        scope:sendScope+' '+identityScope,
        hint:ELECTION_EMAIL,
        include_granted_scopes:false,
        callback:result=>{
          if(result.error)return reject(Error(result.error_description||result.error));
          if(!google.accounts.oauth2.hasGrantedAllScopes(result,sendScope,identityScope))return reject(Error('Allow Gmail sending for '+ELECTION_EMAIL+' to continue.'));
          resolve(result);
        },
        error_callback:()=>reject(Error('Google authorization was closed or blocked. No invitations sent.'))
      }).requestAccessToken({prompt:''});
    });
    const identity=await fetch('https://www.googleapis.com/oauth2/v2/userinfo',{headers:{Authorization:'Bearer '+grant.access_token},signal:AbortSignal.timeout(15000)});
    if(!identity.ok)throw Error('Google could not verify the election sender. Try authorizing Gmail again.');
    if(normalize((await identity.json()).email)!==ELECTION_EMAIL)throw Error('Sign in to '+ELECTION_EMAIL+' in Google before sending. No invitations sent.');
    if(portalToken!==accessToken)throw Error('The portal session changed. Reopen the invitation review.');
    electionMailGrant={token:grant.access_token,portalToken,expiresAt:Date.now()+Math.max(0,Number(grant.expires_in||0)-60)*1000};
    return grant.access_token;
  }
  async function sendInvitationMail(token,email,subject,body) {
    const utf8=value=>btoa(Array.from(new TextEncoder().encode(value),b=>String.fromCharCode(b)).join(''));
    const mime=['To: '+email,'From: '+ELECTION_SENDER+' <'+ELECTION_EMAIL+'>','Reply-To: '+ELECTION_EMAIL,'Subject: =?UTF-8?B?'+utf8(subject)+'?=','MIME-Version: 1.0','Content-Type: text/html; charset=UTF-8','Content-Transfer-Encoding: base64','',utf8(body).match(/.{1,76}/g).join('\r\n')].join('\r\n');
    const response=await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({raw:utf8(mime).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}),signal:AbortSignal.timeout(30000)});
    const result=await response.json().catch(()=>({}));
    if(response.status===401)electionMailGrant=undefined;
    if(!response.ok||!result.id)throw Error('Gmail send: '+(result.error?.message||'No message ID returned. Check Sent before retrying.'));
    return result;
  }
  function openInvitations(recipients,model,context,log,rehearsal=false) {
    const exclusionReasons=['Declined in person','Declined by phone','Declined by text','Declined by email','Asked not to be contacted','Confirmed ineligible','Other administrative reason'];
    const prior=new Map(log.rows.slice(1).filter(r=>r[0]).map(r=>[normalize(r[0]),r]));
    const dialog=document.createElement('dialog');dialog.className='bod-admin-dialog bod-invitation-dialog';
    dialog.innerHTML=`<header><div><h2>Nominee invitations · ${context.year}</h2><p>${rehearsal?'Rehearsal only. Nominations are treated as closed. Test invitations go only to Purchasing and responses are kept separate from the actual election.':'Review the recipients and message. One email per nominee.'}</p></div><button type="button" data-close>Close</button></header><div class="bod-admin-body"><label>Reply deadline (11:59 p.m. Eastern)<input type="date" data-deadline value="${context.year===2027?'2026-11-10':''}" ${context.year===2027?'readonly':''} required></label><h3>Recipients</h3><p>Choose a reason to exclude someone, then save exclusions. A saved exclusion prevents an invitation from being sent. The preview only changes whose email you see.</p><ul>${recipients.map((r,i)=>`<li><label style="display:flex;gap:8px;align-items:center"><input type="checkbox" data-recipient="${i}" ${r.error||prior.has(normalize(r.name))?'disabled':'checked'}><span><strong>${html(r.name)}</strong> — ${html(r.error||r.email)} <span>${html(prior.get(normalize(r.name))?.[2]||'Not sent')}</span></span></label>${prior.has(normalize(r.name))?'':`<label>Exclusion reason for ${html(r.name)}<select data-exclusion="${i}"><option value="">None</option>${exclusionReasons.map(reason=>`<option>${html(reason)}</option>`).join('')}</select></label>`}</li>`).join('')}</ul><p>Fix missing or ambiguous email addresses in the ${context.year} roster, then reopen this preview. Previously attempted invitations are skipped; check your Sent folder before resolving an uncertain send in the source sheet.</p><label>Email preview<select data-person>${recipients.map((r,i)=>`<option value="${i}">${html(r.name)}</option>`).join('')}</select></label><p><strong>From:</strong> ${html(ELECTION_SENDER)} &lt;${html(ELECTION_EMAIL)}&gt;<br><strong>Reply to:</strong> ${html(ELECTION_EMAIL)}<br><strong>Subject:</strong> Your ${context.year} BoneShakers Board nomination — invitation to serve</p>${rehearsal?'<label>Test email scenario<select data-email-scenario><option value="invitation">Nomination invitation</option><option value="accepted">Acceptance confirmation</option><option value="declined">Decline confirmation</option></select></label>':''}<div data-body class="bod-email-preview"></div><label style="display:flex;gap:10px;align-items:start"><input type="checkbox" data-closed ${rehearsal?'checked':''} style="width:22px;height:22px;flex:0 0 22px">${rehearsal?'Simulate closed nominations for this rehearsal':'I confirm nominations are closed and I have reviewed this recipient list and email.'}</label><p>${rehearsal?'Preview as Closed checks this box for the rehearsal.':'Close the public nomination form before confirming here.'} Review your exclusions, then save them even if there are none. Google may ask you to authorize Gmail for bsscvb@boneshakerssocialclub.com.</p><div class="bod-mail-footer"><div class="bod-admin-actions"><button type="button" data-save-exclusions>Save Exclusions</button><button type="button" data-send disabled>Send nominee invitations</button></div><p data-status class="bod-admin-status" role="status" aria-live="polite">Review and save exclusions to unlock Send.</p></div></div>`;
    document.body.append(dialog);dialog.showModal();let sending=false;
    const $=s=>dialog.querySelector(s),deadline=()=>{const v=$('[data-deadline]').value;return v?new Date(v+'T12:00:00Z').toLocaleDateString('en-US',{timeZone:'America/New_York',weekday:'long',year:'numeric',month:'long',day:'numeric'})+' at 11:59 p.m. Eastern':'';};
    const scenario=()=> $('[data-email-scenario]')?.value||'invitation';
    const preview=()=>{const name=recipients[Number($('[data-person]').value)].name;$('[data-body]').innerHTML=scenario()==='invitation'?invitationHtml(name,context.year,deadline(),{yes:'#preview-yes',no:'#preview-no'}):responseReceiptHtml(name,context.year,scenario()==='accepted');$('[data-body]').querySelectorAll('a').forEach(a=>a.onclick=e=>e.preventDefault());};preview();$('[data-person]').onchange=preview;$('[data-deadline]').onchange=preview;
    let saving=false, exclusionsSaved=false, liveAttempted=false;
    const sentScenarios=new Set();
    const exclusions=()=>Array.from(dialog.querySelectorAll('[data-exclusion]:not(:disabled)')).filter(input=>input.value);
    const selected=()=>Array.from(dialog.querySelectorAll('[data-recipient]:checked:not(:disabled)'),input=>recipients[Number(input.dataset.recipient)]);
    const buttonState=(button,state,label,disabled)=>{
      button.dataset.mailState=state;
      button.textContent=label;
      button.disabled=disabled;
    };
    const ready=()=>{
      const key=scenario(), receipt=key!=='invitation', count=receipt?1:selected().length;
      const label=receipt?'Send test '+(key==='accepted'?'acceptance':'decline')+' confirmation to Purchasing':
        'Send '+count+' selected '+(rehearsal?'test ':'')+'invitation'+(count===1?'':'s')+(rehearsal?' to Purchasing':'');
      buttonState($('[data-save-exclusions]'),saving?'working':exclusionsSaved?'done':sending||liveAttempted?'locked':'ready',
        saving?'Saving Exclusions…':exclusionsSaved?'Exclusions Saved':'Save Exclusions',saving||sending||exclusionsSaved||liveAttempted);
      const done=sentScenarios.has(key);
      const locked=saving||!exclusionsSaved||!count||liveAttempted||(!receipt&&(!$('[data-closed]').checked||!$('[data-deadline]').value));
      buttonState($('[data-send]'),sending?'working':done?'done':locked?'locked':'ready',
        sending?'Sending…':done?(rehearsal?'Test Email Sent':'Invitations Sent'):label,sending||done||locked);
      if(rehearsal)$('[data-email-scenario]').disabled=saving||sending;
    };
    dialog.querySelectorAll('[data-recipient], [data-closed], [data-deadline]').forEach(input=>input.addEventListener('change',ready));
    dialog.querySelectorAll('[data-exclusion]').forEach(input=>input.addEventListener('change',()=>{
      exclusionsSaved=false;
      $('[data-status]').textContent='Exclusions changed. Save them before sending.';
      const checkbox=$('[data-recipient="'+input.dataset.exclusion+'"]');
      if(input.value)checkbox.checked=false;
      checkbox.disabled=Boolean(input.value)||Boolean(recipients[Number(input.dataset.exclusion)].error);
      ready();
    }));
    if(rehearsal)$('[data-email-scenario]').onchange=()=>{preview();ready();};
    ready();
    $('[data-save-exclusions]').onclick=async()=>{
      if(saving||sending||exclusionsSaved||liveAttempted)return;
      const chosen=exclusions();
      saving=true;ready();
      dialog.querySelectorAll('[data-exclusion]').forEach(input=>{input.disabled=true;});
      try{
        if(rehearsal||!chosen.length){
          await new Promise(resolve=>setTimeout(resolve,120));
          chosen.forEach(input=>{input.dataset.saved='true';});
          exclusionsSaved=true;
          $('[data-status]').textContent=chosen.length?'Rehearsal exclusions saved for this preview.':'Exclusions reviewed. None to save. You can now send.';
          return;
        }
        const signal=AbortSignal.timeout(5000);
        const range=sheetRange('BOD Invitations '+context.year,'A:G');
        const response=await fetch('https://sheets.googleapis.com/v4/spreadsheets/'+MEMBERSHIP_SPREADSHEET_ID+'/values/'+encodeURIComponent(range),{headers:{Authorization:'Bearer '+accessToken},signal});
        if(!response.ok)throw Error('Could not verify the current exclusions. Reopen the review and try again.');
        const latest=(await response.json()).values||[];
        const actor=normalize(await getPortalAuditActor());
        const recorded=new Set(latest.slice(1).map(row=>normalize(row[0])));
        const at=new Date().toISOString();
        const rows=chosen.map(input=>{
          const person=recipients[Number(input.dataset.exclusion)];
          if(recorded.has(normalize(person.name)))throw Error('An invitation record changed. Reopen this review before saving.');
          return cellRows([person.name,person.email,'Excluded: '+input.value,at,actor,'','']);
        });
        await adminBatch([{appendCells:{sheetId:log.id,rows,fields:'userEnteredValue'}}],signal);
        chosen.forEach(input=>{input.dataset.saved='true';});
        exclusionsSaved=true;
        $('[data-status]').textContent='Exclusions saved. These nominees will not receive invitations.';
      }catch(error){$('[data-status]').textContent=error.name==='TimeoutError'?'Google Sheets took too long to confirm the save. Reopen the review to check what was saved.':error.message;}
      finally{
        dialog.querySelectorAll('[data-exclusion]').forEach(input=>{input.disabled=input.dataset.saved==='true';});
        saving=false;ready();
        if(exclusionsSaved&&!$('[data-send]').disabled){
          $('[data-send]').scrollIntoView({block:'nearest'});
          $('[data-send]').focus({preventScroll:true});
        }
      }
    };
    $('[data-close]').onclick=()=>{if(!sending&&!saving){dialog.close();dialog.remove();}};dialog.addEventListener('cancel',e=>{if(sending||saving)e.preventDefault();else dialog.remove();});
    if(rehearsal)$('[data-send]').onclick=async()=>{
      if($('[data-send]').disabled)return;
      const emailScenario=scenario();
      if(emailScenario!=='invitation'){
        if(sending||saving)return;
        const name=recipients[Number($('[data-person]').value)].name;
        sending=true;ready();
        $('[data-status]').textContent='Waiting for Google email authorization for '+ELECTION_EMAIL+'…';
        try{
          const token=await mailToken();
          const accepted=emailScenario==='accepted';
          const body=responseReceiptHtml(name,context.year,accepted).replace('<h1 style=','<p><strong>TEST ONLY · Sample response receipt.</strong></p><h1 style=');
          await sendInvitationMail(token,'purchasing@boneshakerssocialclub.com','[TEST] '+(accepted?'Acceptance':'Decline')+' confirmation · '+context.year+' BoneShakers Board nomination',body);
          sentScenarios.add(emailScenario);
          $('[data-status]').textContent='Test confirmation sent to purchasing@boneshakerssocialclub.com.';
        }catch(error){$('[data-status]').textContent=error.message;}
        finally{sending=false;ready();}
        return;
      }
      const pending=selected();
      if(sending||saving||exclusions().length||!$('[data-closed]').checked||!pending.length||!$('[data-deadline]').value)return;
      const button=$('[data-send]');
      sending=true;button.disabled=true;ready();let sent=0;
      $('[data-status]').textContent='Waiting for Google email authorization for '+ELECTION_EMAIL+'…';
      try{
        const token=await mailToken();
        for(const person of pending){
          $('[data-status]').textContent='Preparing test links for '+person.name+'… '+sent+' sent.';
          const links=await responseApi('issue-rehearsal',context.year,{name:person.name});
          const body=invitationHtml(person.name,context.year,deadline(),links).replace('<h1 style=', '<p><strong>TEST ONLY · This message uses rehearsal responses.</strong></p><h1 style=');
          $('[data-status]').textContent='Sending test invitation for '+person.name+' to Purchasing… '+sent+' sent.';
          await sendInvitationMail(token,'purchasing@boneshakerssocialclub.com','[TEST] '+person.name+' · '+context.year+' BoneShakers Board nomination',body);
          sent++;
          $('[data-recipient="'+recipients.indexOf(person)+'"]').checked=false;
        }
        sentScenarios.add(emailScenario);
        $('[data-status]').textContent=sent+' test invitation(s) sent to purchasing@boneshakerssocialclub.com.';
      }catch(error){$('[data-status]').textContent=sent+' confirmed sent. '+error.message;}
      finally{sending=false;button.disabled=false;ready();}
    };
    else $('[data-send]').onclick=async()=>{
      if($('[data-send]').disabled)return;
      const pending=selected();
      if(sending||saving||exclusions().length||!$('[data-closed]').checked||!$('[data-deadline]').value||!pending.length)return;
      sending=true;liveAttempted=true;ready();dialog.querySelectorAll('[data-recipient], [data-exclusion]').forEach(input=>{input.disabled=true;});$('[data-deadline]').disabled=true;$('[data-closed]').disabled=true;let sent=0;
      // Start consent directly from the button gesture so popup blockers do not interfere.
      const tokenPromise=mailToken();$('[data-status]').textContent='Waiting for Google email authorization…';
      try{const token=await tokenPromise;const sender=ELECTION_EMAIL;
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
          const result=await sendInvitationMail(token,person.email,'Your '+context.year+' BoneShakers Board nomination — invitation to serve',invitationHtml(person.name,context.year,deadline(),links));
          sent++;row[2]='Sent';row[3]=new Date().toISOString();row[5]=result.id;
          await adminBatch([{updateCells:{start:{sheetId:log.id,rowIndex:index,columnIndex:0},rows:[cellRows(row)],fields:'userEnteredValue'}}]);
        }
        $('[data-status]').textContent=sent+' invitation(s) sent. Accept and Decline responses will appear in this portal.';if(sent>0)sentScenarios.add('invitation');
      }catch(error){$('[data-status]').textContent=sent+' confirmed sent. '+error.message+' Close and reopen this preview to refresh statuses. If Gmail access is blocked, the Google Cloud project may need Gmail API and gmail.send consent enabled.';}
      finally{sending=false;ready();}
    };
  }

  async function load(notice, view) {
    const request = ++sequence;
    const names=yearSheets(selectedYear),year=names.year;
    if (!accessToken) return;
    if(window.BSSCBodElectionHistoryData?.[year]) return window.BSSCBodElectionHistory.load(year,availableYears(discoveredSheets));
    currentMembershipSheet = SHEET;
    installStyle();
    const status = document.getElementById('membershipStatus'), target=document.getElementById('membershipContent');
    const initialView=view??(typeof notice==='string'?target.querySelector('[data-bod-back]')?.dataset.bodView:'');
    status.classList.remove('lifer-summary'); status.textContent='Loading BOD nominations from Google Sheets…';
    target.innerHTML='<div class="empty-state">Loading nomination results…</div>';
    const active = () => request===sequence && currentMembershipSheet===SHEET && moduleLoadingKey==='membership';
    try {
      const metadata = await fetchSheetRead('https://sheets.googleapis.com/v4/spreadsheets/'+MEMBERSHIP_SPREADSHEET_ID+'?fields=properties(timeZone),sheets.properties');
      discoveredSheets=metadata.sheets||[];
      const sheet = (metadata.sheets||[]).find(entry=>entry.properties?.title===names.nominations);
      // The public form creates this private tab when the first submission is saved.
      const rows = sheet ? await getSheetValues("'"+names.nominations+"'!A:G",MEMBERSHIP_SPREADSHEET_ID) : [];
      const model=buildModel(rows);
      for (const record of model.submissions) {
        record.displayTimestamp = formatSubmissionTime(record.timestamp, metadata.properties?.timeZone);
      }
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
      target.innerHTML=(typeof notice==='string'?'<p class="bod-admin-toast" role="status">'+html(notice)+'</p>':'')+(admin?electionCards():'')+'<div data-bod-nomination-content '+(admin?'hidden':'')+'>'+markup(model,updatedAt,sourceUrl,admin,year,availableYears(metadata.sheets),ADMIN_EMAILS.includes(actor),metadata.properties?.timeZone)+'</div>'+(admin?invitationPanel(year)+'<div data-bod-history-content hidden>'+historyMarkup(history)+'</div>':'')+(adminError?'<p class="bod-results-note" role="alert">Results are available, but administrative controls could not load: '+html(adminError)+'</p>':'');
      status.textContent='BOD Nominations '+year+' · '+model.submissions.length+' member submission'+(model.submissions.length===1?'':'s');
      target.querySelector('[data-bod-refresh]').addEventListener('click',()=>load(undefined,'nominations'));
      target.querySelector('[data-bod-year]').addEventListener('change',event=>{selectedYear=yearSheets(event.target.value).year;load();});
      bindDashboard(target,model,context);
      if(admin)bindNextStep(target,model,context,status,status.textContent,initialView);
      target.querySelector('[data-bod-export]').addEventListener('click',()=>
        downloadCsv(tallyCsv(model),'BSSC_BOD_Nomination_Tally_'+year+'.csv'));
      target.querySelector('[data-bod-export-details]')?.addEventListener('click',()=>
        downloadCsv(detailCsv(model,year),'BSSC_BOD_Nominations_'+year+'.csv'));
    } catch (error) {
      if (!active()) return;
      status.textContent='BOD nomination results could not be loaded.';
      target.innerHTML='<div class="empty-state"><p>'+html(error.message)+'</p><button type="button" class="membership-tab" data-bod-retry>Try again</button></div>';
      target.querySelector('[data-bod-retry]').addEventListener('click',()=>load());
    }
  }
  if(typeof document!=='undefined')document.getElementById('bodAdministrationLink')?.addEventListener('click',()=>{currentMembershipSheet=SHEET;showModule('membership');});
  return {invitationHtml,voterEmailHtml,responseReceiptHtml,responseMarkup,electionResponseColumns,invitationText,invitationRecipients,cleanupRequests,yearSheets,availableYears,yearSelector,selectYear,load,buildModel,formatSubmissionTime,tallyCsv,detailCsv,markup,buildAdminMutation,parseCandidates,parseHistory,historyMarkup,changeReason,CHANGE_REASONS,installStyle,bindDashboard};
});
