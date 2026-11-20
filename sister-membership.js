/* Authenticated results and recipient history for Sister Patch selection. */
window.BSSCSisterMembership = (() => {
  const norm = value => String(value ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let sequence = 0;
  function voteModel(rows, year) {
    const expected=['Review Year','Voter Key','Voter Name','Nominee Key','Nominee Name','Submitted At','Receipt'];
    if(expected.some((h,i)=>(rows[0]||[])[i]!==h))throw Error('The Sister Patch vote log headings need review.');
    const members=new Map();let excluded=0,duplicates=0;
    rows.slice(1).forEach(row=>{
      if(String(row[0])!==String(year))return;
      if(!row[1]||!row[2]||!row[3]||!row[4]||!row[5]||!row[6]){excluded++;return;}
      if(members.has(row[1])){duplicates++;members.set(row[1],null);return;}
      members.set(row[1],{name:row[2],nomineeKey:row[3],nominee:row[4]});
    });
    const participants=[...members.values()].filter(Boolean), totals=new Map();
    participants.forEach(vote=>{const item=totals.get(vote.nomineeKey)||{name:vote.nominee,count:0};item.count++;totals.set(vote.nomineeKey,item);});
    const tally=[...totals.values()].sort((a,b)=>b.count-a.count||a.name.localeCompare(b.name));
    return {participants:participants.sort((a,b)=>a.name.localeCompare(b.name)),tally,total:participants.length,excluded,duplicates};
  }
  function resultView(model,year){
    const tied=model.tally.length>1&&model.tally[0].count===model.tally[1].count;
    return `<section class="workspace-card"><h3>${year} selection · Results</h3><p><strong>${model.total} saved ${model.total===1?'vote':'votes'}</strong> · one per verified member</p>${model.excluded||model.duplicates?'<p role="alert">Records need review: '+model.excluded+' incomplete rows; '+model.duplicates+' duplicate voter rows. Duplicate voters are excluded from the tally until corrected.</p>':''}${model.tally.length?`<table class="data-table" style="min-width:0"><thead><tr><th>Sister</th><th>Votes</th></tr></thead><tbody>${model.tally.map(row=>'<tr><td>'+escape(row.name)+'</td><td>'+row.count+'</td></tr>').join('')}</tbody></table>${tied?'<p><strong>The current lead is tied.</strong></p>':''}<p>Current totals; no recipient is automatically awarded a patch.</p>`:'<p>No votes have been received yet.</p>'}<details><summary>Participation · ${model.total} members have voted</summary><p>Individual choices are not displayed here.</p>${model.participants.length?'<ul>'+model.participants.map(person=>'<li>'+escape(person.name)+'</li>').join('')+'</ul>':'<p>No participating members yet.</p>'}</details></section>`;
  }
  async function load() {
    const request = ++sequence;
    const target = document.getElementById('membershipContent');
    const status = document.getElementById('membershipStatus');
    status.classList.remove('lifer-summary');
    status.textContent = 'Loading Sister Patch recipient history…';
    target.innerHTML = '<section class="workspace-card"><h2>Sister Patches</h2><p role="status">Loading club records…</p></section>';
    try {
      const metadata = await fetchSheetRead('https://sheets.googleapis.com/v4/spreadsheets/'+MEMBERSHIP_SPREADSHEET_ID+'?fields=sheets.properties');
      const years = (metadata.sheets || []).map(s => s.properties.title).filter(name => /^20\d{2}$/.test(name)).sort().reverse();
      if (!years.length) throw Error('No annual rosters were found.');
      const resultRanges = await getSheetRanges([...years.map(year => "'"+year+"'!A1:AZ1500"),"'Sister Patch Votes'!A1:G10000"], MEMBERSHIP_SPREADSHEET_ID);
      const voteRows=resultRanges.pop(),rosters=resultRanges,reviewYear=Number(years[0])-1;
      const votes=voteModel(voteRows,reviewYear);
      if (request !== sequence || currentMembershipSheet !== 'Sister Patches') return;
      const recipients = new Map(), unavailableYears = [];
      rosters.forEach((rows, index) => {
        const headers = (rows[0] || []).map(norm);
        const first = headers.indexOf('first name'), last = headers.indexOf('last name');
        const patch = headers.findIndex(h => /^sister\s*patch/.test(h));
        const road = headers.findIndex(h => /road name/.test(h));
        if (first < 0 || last < 0 || patch < 0) { unavailableYears.push(years[index]); return; }
        rows.slice(1).forEach(row => {
          if (norm(row[patch]) !== 'yes') return;
          const name = [row[first], row[last]].filter(Boolean).join(' ').trim();
          if (!name || recipients.has(norm(name))) return;
          recipients.set(norm(name), {name, road:road >= 0 ? String(row[road] || '').toUpperCase() : ''});
        });
      });
      const people = [...recipients.values()].sort((a,b) => a.name.localeCompare(b.name));
      target.innerHTML = `<section class="workspace-card"><div class="club-toolbar"><h2>Sister Patches</h2><button type="button" class="membership-tab" data-sister-refresh>Refresh</button><a class="open-btn" href="https://boneshakerssocialclub.com/sister-patch" target="_blank" rel="noopener">Open Sister Patch page</a></div><p>Saved votes, club participation, and recipient history.</p></section>${resultView(votes,reviewYear)}<section class="workspace-card"><h3>Recipient history · ${people.length} recorded sisters</h3>${unavailableYears.length ? '<p>Historical rosters without Sister Patch fields: '+unavailableYears.map(escape).join(', ')+'. Those years cannot confirm additional recipients.</p>' : ''}<p>Recipients marked Yes in the annual rosters. Roster years do not establish an award date; this list does not infer when a patch was awarded.</p>${people.length ? `<ul>${people.map(p => `<li><strong>${escape(p.name)}</strong>${p.road ? ' (“'+escape(p.road)+'”)' : ''}</li>`).join('')}</ul>` : '<p>No recipients are marked in the source rosters.</p>'}</section>`;
      target.querySelector('[data-sister-refresh]').onclick = load;
      status.textContent = 'Sister Patches · results refreshed '+new Date().toLocaleTimeString();
    } catch (error) {
      if (request !== sequence || currentMembershipSheet !== 'Sister Patches') return;
      status.textContent = 'Sister Patch history could not be loaded.';
      target.innerHTML = `<section class="workspace-card"><h2>Sister Patches</h2><p role="alert">${escape(error.message)}</p><button type="button" class="membership-tab" data-sister-refresh>Try again</button></section>`;
      target.querySelector('[data-sister-refresh]').onclick = load;
    }
  }
  return {load,voteModel};
})();
