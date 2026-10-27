(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.BSSCBodNominations = api;
})(typeof window === 'undefined' ? globalThis : window, function () {
  'use strict';
  const SHEET = 'BOD Nominations 2027';
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
      members.set(memberKey, {timestamp, reference, nominator, names, row:index + 2});
    });
    const submissions = [...members.values()].sort((a,b) => b.row-a.row);
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

  function markup(model, updatedAt, sourceUrl) {
    const cards = [['Member submissions',model.submissions.length],['Members nominated',model.nominees.length],['Total nominations',model.total]];
    return `<section class="bod-results" aria-label="BOD nomination results">
      <div class="bod-results-head"><div><p class="bod-results-kicker">2027 BOARD OF DIRECTORS</p><h2>BOD Nomination Results</h2><p>Nomination counts and member submissions. These are nominations, not election votes.</p></div><div class="bod-results-actions"><button class="membership-tab" type="button" data-bod-refresh>Refresh results</button><button class="membership-tab" type="button" data-bod-export ${model.nominees.length?'':'disabled'}>Download tally CSV</button><a class="membership-tab" target="_blank" rel="noopener noreferrer" href="${html(sourceUrl)}">Open source sheet</a></div></div>
      <p class="bod-results-updated">Updated ${html(updatedAt)} · Reads directly from the membership workbook.</p>
      <div class="bod-results-stats">${cards.map(([label,value]) => `<div><strong>${value}</strong><span>${label}</span></div>`).join('')}</div>
      ${model.excluded?`<p class="bod-results-note" role="alert">${model.excluded} incomplete or invalid log row(s) excluded from the totals. Review the source sheet before using these results.</p>`:''}
      ${model.duplicates?`<p class="bod-results-note">${model.duplicates} duplicate or superseded row(s) excluded. Each member is counted once.</p>`:''}
      <section class="bod-results-panel"><h3>Nomination totals</h3><p>Highest totals first. Members tied on nominations are listed alphabetically.</p>${model.nominees.length?`<div class="bod-results-scroll"><table><thead><tr><th scope="col">Member</th><th scope="col">Nominations</th></tr></thead><tbody>${model.nominees.map(person=>`<tr><td>${html(person.name)}</td><td><strong>${person.count}</strong></td></tr>`).join('')}</tbody></table></div>`:`<div class="empty-state">${model.excluded?'No valid submissions are available. Review the source sheet.':'No nominations received yet. Results will appear here after the first member submits the nomination form.'}</div>`}</section>
      <section class="bod-results-panel"><h3>Individual submissions (${model.submissions.length})</h3><p>Newest first. Open a submission to see the members nominated.</p>${model.submissions.map(record=>`<details class="bod-results-submission"><summary><strong>${html(record.nominator)}</strong><span>${record.names.length} nominated · ${html(record.timestamp)}</span></summary><p class="bod-results-reference">Reference: ${html(record.reference)}</p><ul>${record.names.map(name=>`<li>${html(name)}</li>`).join('')}</ul></details>`).join('')||'<p>No submissions to display.</p>'}</section>
    </section>`;
  }

  function installStyle() {
    if (document.getElementById('bod-results-style')) return;
    const style = document.createElement('style'); style.id='bod-results-style';
    style.textContent='.bod-results{color:var(--ink,#161616)}.bod-results-head{display:flex;justify-content:space-between;gap:18px;flex-wrap:wrap}.bod-results-head h2{margin:4px 0;font-size:27px}.bod-results-head p{margin:5px 0;line-height:1.5}.bod-results-kicker{font-size:11px;font-weight:800;letter-spacing:1.5px;color:#a80d27}.bod-results-actions{display:flex;gap:8px;align-items:flex-start;flex-wrap:wrap}.bod-results-actions a{text-decoration:none}.bod-results-updated{font-size:12px;line-height:1.5;color:#555}.bod-results-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin:18px 0}.bod-results-stats>div{border:1px solid #b9bec4;border-top:3px solid #c8102e;border-radius:12px;padding:18px;background:#f7f8fa}.bod-results-stats strong{display:block;font-size:31px}.bod-results-stats span{display:block;font-size:13px;margin-top:5px}.bod-results-panel{background:#f8f9fa;border:1px solid #bcc2c8;border-radius:12px;padding:20px;margin-top:18px}.bod-results-panel h3{margin:0 0 8px}.bod-results-panel>p{color:#555;font-size:13px;line-height:1.5}.bod-results-scroll{overflow-x:auto}.bod-results table{border-collapse:collapse;width:100%}.bod-results th,.bod-results td{text-align:left;padding:12px;border-bottom:1px solid #d1d5db}.bod-results th:last-child,.bod-results td:last-child{text-align:right}.bod-results th{background:#151517;color:#fff}.bod-results-note{background:#eaf1fa;border-left:4px solid #2867ad;padding:12px;line-height:1.5}.bod-results-submission{border:1px solid #c3c8ce;border-radius:8px;margin-top:10px;background:#fff}.bod-results-submission summary{display:flex;flex-wrap:wrap;justify-content:space-between;gap:8px;padding:14px;cursor:pointer}.bod-results-submission summary span{font-size:12px;color:#555}.bod-results-submission ul{line-height:1.9;margin:0 18px 16px;padding-left:20px}.bod-results-reference{font-size:12px;padding:0 14px;overflow-wrap:anywhere}.bod-results button:focus-visible,.bod-results a:focus-visible,.bod-results summary:focus-visible{outline:3px solid #2867ad;outline-offset:3px}@media(max-width:600px){.bod-results-stats{grid-template-columns:1fr}.bod-results-panel{padding:14px}.bod-results-actions{width:100%}.bod-results-actions>*{flex:1;text-align:center}}';
    document.head.appendChild(style);
  }

  async function load() {
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
      if (!active()) return;
      const sourceUrl='https://docs.google.com/spreadsheets/d/'+MEMBERSHIP_SPREADSHEET_ID+'/edit'+(sheet?'#gid='+sheet.properties.sheetId:'');
      const updatedAt = new Date().toLocaleString('en-US',{timeZone:'America/New_York',timeZoneName:'short'});
      target.innerHTML=markup(model,updatedAt,sourceUrl);
      status.textContent='BOD Nominations 2027 · '+model.submissions.length+' member submission'+(model.submissions.length===1?'':'s');
      target.querySelector('[data-bod-refresh]').addEventListener('click',load);
      target.querySelector('[data-bod-export]').addEventListener('click',()=>{
        const url=URL.createObjectURL(new Blob(['\ufeff'+tallyCsv(model)],{type:'text/csv;charset=utf-8'}));
        const link=document.createElement('a');link.href=url;link.download='BSSC_BOD_Nomination_Tally_2027.csv';document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
      });
    } catch (error) {
      if (!active()) return;
      status.textContent='BOD nomination results could not be loaded.';
      target.innerHTML='<div class="empty-state"><p>'+html(error.message)+'</p><button type="button" class="membership-tab" data-bod-retry>Try again</button></div>';
      target.querySelector('[data-bod-retry]').addEventListener('click',load);
    }
  }
  return {load,buildModel,tallyCsv,markup};
});
