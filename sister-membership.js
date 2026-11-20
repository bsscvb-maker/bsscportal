/* Membership workspace view. Vote intake is not enabled by this view. */
window.BSSCSisterMembership = (() => {
  const norm = value => String(value ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let sequence = 0;
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
      const rosters = await getSheetRanges(years.map(year => "'"+year+"'!A1:AZ1500"), MEMBERSHIP_SPREADSHEET_ID);
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
      target.innerHTML = `<section class="workspace-card"><div class="club-toolbar"><h2>Sister Patches</h2><button type="button" class="membership-tab" data-sister-refresh>Refresh</button><a class="open-btn" href="https://boneshakerssocialclub.com/sister-patch" target="_blank" rel="noopener">Open Sister Patch page</a></div><p>Club recognition, recipient history, and selection oversight.</p></section><section class="workspace-card"><h3>Results &amp; participation</h3><p><strong>Vote collection is not connected yet.</strong> The public page currently shows member comparisons. No vote totals or participation records are being received here.</p></section><section class="workspace-card"><h3>Recipient history · ${people.length} recorded sisters</h3>${unavailableYears.length ? '<p>Historical rosters without Sister Patch fields: '+unavailableYears.map(escape).join(', ')+'. Those years cannot confirm additional recipients.</p>' : ''}<p>Recipients marked Yes in the annual rosters. Roster years do not establish an award date; this list does not infer when a patch was awarded.</p>${people.length ? `<ul>${people.map(p => `<li><strong>${escape(p.name)}</strong>${p.road ? ' (“'+escape(p.road)+'”)' : ''}</li>`).join('')}</ul>` : '<p>No recipients are marked in the source rosters.</p>'}</section>`;
      target.querySelector('[data-sister-refresh]').onclick = load;
      status.textContent = 'Sister Patches · live recipient history from the membership workbook';
    } catch (error) {
      if (request !== sequence || currentMembershipSheet !== 'Sister Patches') return;
      status.textContent = 'Sister Patch history could not be loaded.';
      target.innerHTML = `<section class="workspace-card"><h2>Sister Patches</h2><p role="alert">${escape(error.message)}</p><button type="button" class="membership-tab" data-sister-refresh>Try again</button></section>`;
      target.querySelector('[data-sister-refresh]').onclick = load;
    }
  }
  return {load};
})();
