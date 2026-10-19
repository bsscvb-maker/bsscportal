/* Fillable browser-only templates for the proposed Draft 5 governance package. */
(() => {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const paths = [
    '<rect x="5" y="7" width="38" height="32" rx="4"/><path d="M5 15h38M12 24h10m-10 7h7M34 21v13m-4-10c8-5 9 4 4 4s-4 8 4 4"/>',
    '<path d="M7 16h30l-7-7m11 23H11l7 7"/><rect x="4" y="20" width="10" height="8" rx="2"/><rect x="34" y="20" width="10" height="8" rx="2"/>',
    '<path d="M24 40S6 29 6 17c0-10 13-13 18-4 5-9 18-6 18 4 0 12-18 23-18 23Z"/><path d="M15 23h6l3-7 4 14 3-7h5"/>',
    '<circle cx="16" cy="13" r="6"/><path d="M5 37v-5c0-10 22-10 22 0v5M31 20h12m-5-5 5 5-5 5M31 34h12"/>',
    '<circle cx="19" cy="13" r="7"/><path d="M5 40v-5c0-15 28-15 28 0v5m-3-20 5 5 9-10"/>',
    '<circle cx="15" cy="12" r="6"/><circle cx="33" cy="18" r="5"/><path d="M3 39V29c0-12 24-12 24 0v10m1-12c9-4 17 1 17 8v4M10 39V28m10 11V28"/>',
    '<rect x="6" y="9" width="36" height="33" rx="4"/><path d="M6 19h36M15 5v9M33 5v9m-17 16 6 6 12-13"/>',
    '<path d="M7 26h34v16H7Zm4 0 6-11h14l6 11M18 5h18v14H18Z"/><path d="m22 11 3 3 6-6"/>',
    '<path d="M12 6h24v19H12Zm-5 19h34v10H7Zm4 10v8m26-8v8M12 14h24"/>',
    '<path d="M7 7h34v26H23L11 42v-9H7Z"/><path d="M24 14v10m0 4v1"/>',
    '<ellipse cx="16" cy="12" rx="10" ry="5"/><path d="M6 12v14c0 7 20 7 20 0V12M6 19c0 7 20 7 20 0"/><path d="M20 37h23m-7-7 7 7-7 7M6 35h7"/>',
    '<circle cx="20" cy="19" r="13"/><path d="m30 29 12 13m-29-23 5 5 10-10"/>'
  ];
  const icon = n => '<svg viewBox="0 0 48 48" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">' + paths[n-1] + '</svg>';
  const descriptions = [
    'Request funding and record the approval and payment decision.', 'Track access, records and responsibilities during a handover.',
    'Request a hardship exception permitted by the proposed rules.', 'Authorize an attending member to hold a membership proxy.',
    'Track admission or reinstatement requirements and approvals.', 'Record enrollment, permissions and Board approval.',
    'Update participant information and record approved service.', 'Verify eligibility, results and election certification.',
    'Track Board seats, valid terms and the transition schedule.', 'Document a complaint, fair review, decision and appeal.',
    'Record money handoffs, deposits and donated items.', 'Acknowledge public-record review and track any clarification.'
  ];
  const host = () => document.getElementById('recordsWorkspace');
  const documents = () => window.BSSC_WORKING_FORMS || [];
  function field(f, label = f.label) {
    const control = f.type === 'textarea' ? '<textarea id="'+esc(f.id)+'" name="'+esc(f.id)+'" rows="3"></textarea>' : '<input id="'+esc(f.id)+'" name="'+esc(f.id)+'" type="'+esc(f.type||'text')+'"'+(/amount|total|yes$|no$|abstain|hours/i.test(label)?' inputmode="decimal"':'')+'>';
    return '<label class="ft-field'+(f.type==='textarea'?' ft-wide':'')+'" for="'+esc(f.id)+'"><span>'+esc(label)+'</span>'+control+'</label>';
  }
  function block(b) {
    if (b.kind === 'fields') return '<div class="ft-fields">'+b.fields.map(f=>field(f)).join('')+'</div>';
    if (b.kind === 'check') return '<label class="ft-check"><input type="checkbox" name="'+esc(b.id)+'" value="Confirmed"><span>'+esc(b.label)+'</span></label>';
    if (b.kind === 'choices') {
      const single = /^(?:Route|Age category|Media choice|Scope|Request type)$/i.test(b.label);
      return '<fieldset class="ft-choices"><legend>'+esc(b.label)+'</legend>'+b.options.map(o=>'<label class="ft-check"><input type="'+(single?'radio':'checkbox')+'" name="'+esc(b.id)+'" value="'+esc(o)+'"><span>'+esc(o)+'</span></label>').join('')+'</fieldset>';
    }
    if (b.kind === 'heading') return '<h3 class="ft-section-title">'+esc(b.text)+'</h3>';
    if (b.kind === 'seats') return '<section class="ft-seats"><h3>Director seats</h3><p>Complete only the seats authorized for this Board.</p>'+Array.from({length:11},(_,i)=>{
      const seat=String.fromCharCode(65+i),labels=['Occupant','Source of authority','Start date','End date','Officer role','Next action'];
      return '<details class="ft-seat"'+(i===0?' open':'')+'><summary>Seat '+seat+(i>=7?' · if authorized':'')+'</summary><div class="ft-fields">'+labels.map((label,j)=>field({id:'seat_'+seat+'_'+j,label,type:/date$/.test(label)?'date':'text'})).join('')+'</div></details>';
    }).join('')+'</section>';
    return '<p class="ft-instruction">'+esc(b.text)+'</p>';
  }
  window.renderFormsTools = function () {
    const el=host(); if(!el)return;delete el.dataset.meetingTheme;
    el.innerHTML='<nav class="minutes-breadcrumb"><button class="sponsor-tab" data-ft-home>← Club Records</button></nav><section class="records-hero"><div><h2>Forms and Tools</h2><p>Choose a form, fill it in on screen, and review your entries.</p></div></section><p class="forms-tools-notice"><strong>Proposed Draft 5 · Not adopted</strong><br>These working templates do not change current rules. No information is sent or saved.</p><div class="forms-tools-toolbar"><label for="forms-tools-search">Find a form</label><input id="forms-tools-search" type="search" placeholder="Search forms and tools…"><p data-ft-count role="status"></p></div><div class="records-card-grid forms-tools-grid" data-ft-grid></div>';
    el.querySelector('[data-ft-home]').onclick=()=>recordsHome();
    const search=el.querySelector('#forms-tools-search');
    const draw=()=>{
      const q=search.value.trim().toLowerCase(),matches=documents().filter(d=>(d.title+' '+descriptions[d.number-1]).toLowerCase().includes(q));
      el.querySelector('[data-ft-count]').textContent=matches.length+' of 12 forms';
      el.querySelector('[data-ft-grid]').innerHTML=matches.map(d=>'<button type="button" class="ft-card" data-ft-open="'+d.number+'"><div class="ft-card-art ft-tone-'+((d.number-1)%6)+'">'+icon(d.number)+'</div><div class="ft-card-body"><h3>'+esc(d.title)+'</h3><p>'+esc(descriptions[d.number-1])+'</p><span class="ft-card-link">Open form <span aria-hidden="true">→</span></span></div></button>').join('')||'<p>No matching forms. Try another search.</p>';
      el.querySelectorAll('[data-ft-open]').forEach(button=>button.onclick=()=>renderWorkingForm(Number(button.dataset.ftOpen)));
    };
    search.addEventListener('input',draw);draw();
  };
  function renderWorkingForm(number) {
    const doc=documents().find(d=>d.number===number);if(!doc)return;
    const el=host();
    el.innerHTML='<nav class="minutes-breadcrumb"><button class="sponsor-tab" data-ft-back>← Forms and Tools</button></nav><section class="ft-working"><header class="ft-working-header"><div class="ft-heading-icon ft-tone-'+((number-1)%6)+'">'+icon(number)+'</div><div><span class="ft-draft">Proposed Draft 5 · Not adopted</span><h2 tabindex="-1">'+esc(doc.title)+'</h2><p>'+esc(descriptions[number-1])+'</p></div></header><p class="ft-private-note">No submission is connected. Your entries stay on this page and clear when you leave or refresh.</p><form class="ft-form" autocomplete="off">'+doc.blocks.map(block).join('')+'<div class="ft-form-actions"><button type="button" class="open-btn" data-ft-review>Review entries</button><button type="reset" class="sponsor-tab">Clear form</button></div><p class="ft-feedback" role="status" data-ft-status></p></form><footer class="ft-reference"><h3>Reference form</h3><p>Read the complete proposed template and instructions.</p><a class="sponsor-tab" href="'+esc(doc.reference)+'" target="_blank" rel="noopener noreferrer">View reference form <span class="forms-tool-sr">(opens in a new tab)</span></a></footer></section><dialog class="ft-review-dialog"><h2>Review your entries</h2><p>Nothing has been submitted or saved. You can return to make changes.</p><div data-ft-review-content></div><div class="ft-form-actions"><button type="button" class="open-btn" data-ft-close>Continue editing</button><button type="button" class="sponsor-tab" data-ft-copy>Copy summary</button></div><p role="status" data-ft-copy-status></p></dialog>';
    el.querySelector('[data-ft-back]').onclick=()=>window.renderFormsTools();
    const form=el.querySelector('form'),dialog=el.querySelector('dialog');
    form.addEventListener('submit',e=>e.preventDefault());
    form.addEventListener('reset',()=>{el.querySelector('[data-ft-status]').textContent='Form cleared.';});
    let summary='';
    el.querySelector('[data-ft-review]').onclick=()=>{
      const lines=[],seen=new Set();
      for(const control of form.elements){
        if(!control.name||seen.has(control.name))continue;seen.add(control.name);
        const controls=Array.from(form.elements).filter(c=>c.name===control.name);
        const values=controls.filter(c=>!['checkbox','radio'].includes(c.type)||c.checked).map(c=>c.value.trim()).filter(Boolean);if(!values.length)continue;
        const label=control.closest('fieldset')?.querySelector('legend')?.textContent || control.closest('label')?.querySelector('span')?.textContent || control.name;
        const seat=control.closest('details')?.querySelector('summary')?.textContent;
        lines.push({label:(seat?seat+' — ':'')+label,value:values.join('; ')});
      }
      summary=doc.title+'\nProposed Draft 5 — not submitted\n\n'+lines.map(l=>l.label+': '+l.value).join('\n');
      el.querySelector('[data-ft-review-content]').innerHTML=lines.length?'<dl>'+lines.map(l=>'<div><dt>'+esc(l.label)+'</dt><dd>'+esc(l.value)+'</dd></div>').join('')+'</dl>':'<p>No entries yet. Continue editing to fill in this form.</p>';
      el.querySelector('[data-ft-copy-status]').textContent='';dialog.showModal();
    };
    el.querySelector('[data-ft-close]').onclick=()=>dialog.close();
    el.querySelector('[data-ft-copy]').onclick=async()=>{
      try{await navigator.clipboard.writeText(summary);el.querySelector('[data-ft-copy-status]').textContent='Summary copied. Nothing was sent.';}
      catch{el.querySelector('[data-ft-copy-status]').textContent='Copy is unavailable in this browser. You can select and copy the review text.';}
    };
    el.querySelector('.ft-working-header h2').focus({preventScroll:true});
    el.querySelector('.ft-working').scrollIntoView({block:'start',behavior:'smooth'});
  }
})();
