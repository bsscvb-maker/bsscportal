/* Individual reference documents for the proposed Draft 5 governance package. */
(() => {
  'use strict';
  const documents = [{"number": 1, "title": "Funding request and decision", "description": "Record funding requests, the required approval route and the final decision.", "url": "assets/forms-tools/form-01.html"}, {"number": 2, "title": "Officer and administrator handover", "description": "Track access, records, property and responsibilities during a handover.", "url": "assets/forms-tools/form-02.html"}, {"number": 3, "title": "Hardship or limited exception request", "description": "Document a hardship request or an exception allowed by the proposed rules.", "url": "assets/forms-tools/form-03.html"}, {"number": 4, "title": "Member proxy authorization", "description": "Record a member’s authorization for one attending member to hold their proxy.", "url": "assets/forms-tools/form-04.html"}, {"number": 5, "title": "Admission and reinstatement checklist", "description": "Check requirements and approvals for first-time and returning members.", "url": "assets/forms-tools/form-05.html"}, {"number": 6, "title": "Future Shakers enrollment and Board approval", "description": "Record Future Shakers enrollment, permissions and Board approval.", "url": "assets/forms-tools/form-06.html"}, {"number": 7, "title": "Future Shakers annual verification and service record", "description": "Verify Future Shakers information and record approved service.", "url": "assets/forms-tools/form-07.html"}, {"number": 8, "title": "Election certification and eligibility register", "description": "Record voter eligibility, ballot totals, reviewers and election certification.", "url": "assets/forms-tools/form-08.html"}, {"number": 9, "title": "Director seat and transition register", "description": "Track director seats, valid terms, continuity and the approved transition.", "url": "assets/forms-tools/form-09.html"}, {"number": 10, "title": "Complaint and fair review record", "description": "Record complaints, fair review, conflicts, decisions and appeal dates.", "url": "assets/forms-tools/form-10.html"}, {"number": 11, "title": "Funds handoff and donated item record", "description": "Record money handoffs, deposits and donated items.", "url": "assets/forms-tools/form-11.html"}, {"number": 12, "title": "Public record review consent", "description": "Record consent for volunteer public-record review and the opportunity to correct information.", "url": "assets/forms-tools/form-12.html"}];
  const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  window.renderFormsTools = function () {
    const host = document.getElementById('recordsWorkspace');
    if (!host) return;
    delete host.dataset.meetingTheme;
    host.innerHTML = '<nav class="minutes-breadcrumb"><button class="sponsor-tab" data-forms-home>← Club Records</button></nav>' +
      '<section class="records-hero"><div><h2>Forms and Tools</h2><p>Open each document separately. Use your existing approved online process when it captures the same information.</p></div></section>' +
      '<p class="forms-tools-notice"><strong>Proposed Draft 5 · Not adopted</strong><br>These 12 reference templates come from the governance review. They do not change current rules or replace working submission forms.</p>' +
      '<div class="forms-tools-toolbar"><label for="forms-tools-search">Find a document</label><input id="forms-tools-search" type="search" placeholder="Search forms and tools…"><p data-forms-count role="status"></p></div>' +
      '<div class="records-card-grid forms-tools-grid" data-forms-grid></div>';
    host.querySelector('[data-forms-home]').onclick = () => recordsHome();
    const input = host.querySelector('#forms-tools-search');
    function draw() {
      const query = input.value.trim().toLowerCase();
      const matches = documents.filter(d => ('form ' + d.number + ' ' + d.title + ' ' + d.description).toLowerCase().includes(query));
      host.querySelector('[data-forms-count]').textContent = matches.length + ' of 12 documents';
      host.querySelector('[data-forms-grid]').innerHTML = matches.map(d => '<article class="record-card forms-tool-card"><span class="forms-tool-number">FORM ' + d.number + '</span><h3>' + escape(d.title) + '</h3><p>' + escape(d.description) + '</p><div class="record-card-actions"><a class="open-btn" href="' + escape(d.url) + '" target="_blank" rel="noopener noreferrer">View document<span class="forms-tool-sr">: ' + escape(d.title) + ' (opens in a new tab)</span></a></div></article>').join('') || '<p>No matching documents. Try another search.</p>';
    }
    input.addEventListener('input', draw);
    draw();
  };
})();
