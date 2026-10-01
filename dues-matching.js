// The payment ledger is shared between the portal and the PayPal automation.
function duesNorm(value) { return String(value ?? '').trim().toLowerCase(); }
function duesHeader(rows, name) { const index = (rows[0] || []).findIndex(v => duesNorm(v) === duesNorm(name)); if (index < 0) throw new Error('Missing '+name+' column.'); return index; }
function duesPeople(rows) {
  const fields = ['First Name','Last Name','Email','Status','Membership Type','Dues Paid','Start Date'];
  const cols = Object.fromEntries(fields.map(f => [f,duesHeader(rows,f)]));
  cols['Lifer Clock Start Year']=(rows[0]||[]).findIndex(v=>duesNorm(v)==='lifer clock start year');
  return rows.slice(1).map((row,i) => ({row:i+2,values:row,cols,name:[row[cols['First Name']],row[cols['Last Name']]].map(v=>String(v||'').trim()).join(' '),email:duesNorm(row[cols.Email]),status:duesNorm(row[cols.Status])})).filter(p=>p.name.trim());
}
function duesSamePerson(a,b) { return duesNorm(a.name) === duesNorm(b.name) && a.email && a.email === b.email; }
function duesExemption(person, previous, presidents) {
  const type=duesNorm(person.values[person.cols['Membership Type']]);
  const clock=Number(person.values[(person.cols['Lifer Clock Start Year'] ?? -1)]);
  if (Number.isInteger(clock) && clock>1900 && clock<=2017) return 'Dues Exempt — Life Member';
  if (/^(lifer|life member)$/.test(type)) return 'Dues Exempt — Life Member';
  if (/^(honorary|honorary member)$/.test(type)) return 'Dues Exempt — Honorary Member';
  if (type === 'past president') {
    const first=duesHeader(presidents,'First Name'),last=duesHeader(presidents,'Last Name'),eligible=duesHeader(presidents,'Dues Exemption');
    const entries=presidents.slice(1).filter(r=>duesNorm([r[first],r[last]].map(v=>String(v||'').trim()).join(' '))===duesNorm(person.name));
    if (entries.length && entries.every(r=>duesNorm(r[eligible])==='eligible')) return 'Dues Exempt — Past President';
  }
  const prior=previous.filter(p=>duesSamePerson(person,p));
  if (prior.length===1) {
    const p=prior[0],date=String(p.values[p.cols['Start Date']]||'').match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    const afterAugust=date && Number(date[3])===2026 && (Number(date[1])>8 || (Number(date[1])===8 && Number(date[2])>1));
    if (afterAugust && /^(yes|1\/2|half|paid)$/.test(duesNorm(p.values[p.cols['Dues Paid']]))) return '2027 Dues Covered — Initial Payment';
  }
  if (duesNorm(person.values[person.cols['Dues Paid']])==='exempt') return 'Dues Exempt — Recorded in Roster';
  return '';
}
function duesPending(ledger) {
  const status=duesHeader(ledger,'Status'),year=duesHeader(ledger,'Membership Year'),description=duesHeader(ledger,'Payment Description');
  return ledger.slice(1).map((values,i)=>({values,row:i+2})).filter(p=>Number(p.values[year])===2027 && /2027.*membership.*renewal.*dues/i.test(String(p.values[description]||'')) && /^(needs review|review needed|unmatched)$/.test(duesNorm(p.values[status])));
}
function duesMatchRecord(notes) {
  const match=String(notes||'').match(/\[PAYMENT_MATCH:(\{[^\n]*?\})\]/);
  try { return match ? JSON.parse(match[1]) : null; } catch { return null; }
}
async function duesReadContext(roster) {
  const [ledger,prior,presidents]=await Promise.all([getSheetValues("'Dues Payments'!A1:O1000",MEMBERSHIP_SPREADSHEET_ID),getSheetValues("'2026'!A1:AK900",MEMBERSHIP_SPREADSHEET_ID),getSheetValues("'Past Presidents'!A1:I1000",MEMBERSHIP_SPREADSHEET_ID)]);
  return {roster,people:duesPeople(roster),ledger,previous:duesPeople(prior),presidents};
}
async function setup2027DuesReview(rows) {
  const target=document.getElementById('membershipContent');
  try {
    const context=await duesReadContext(rows);
    if (currentMembershipSheet!=='2027') return;
    const pending=duesPending(context.ledger);
    const panel=document.createElement('section');panel.className='membership-system-note';
    panel.innerHTML='<strong>2027 Dues Review</strong><p>Exemptions and initial-payment coverage are shown separately from payments. Renewal, waiver and Code of Conduct are still required.</p><button type="button" class="dashboard-edit-btn">Review Payments ('+pending.length+')</button> <button type="button" class="dashboard-edit-btn" data-print-unpaid-dues>Print Unpaid Dues List</button><span role="status" class="dues-review-status"></span>';
    target.prepend(panel);
    panel.querySelector('[data-print-unpaid-dues]').addEventListener('click',()=>print2027UnpaidDues(context));
    const header=target.querySelector('table thead tr:last-child');
    if(header) { const th=document.createElement('th');th.textContent='2027 Dues Status';header.appendChild(th); }
    const bodyRows=[...target.querySelectorAll('table tbody tr')];
    context.people.forEach((p,i)=>{
      const tr=bodyRows[i];if(!tr)return;
      const td=document.createElement('td');td.textContent=duesExemption(p,context.previous,context.presidents)||(/^(yes|paid)$/.test(duesNorm(p.values[p.cols['Dues Paid']]))?'Paid':'Payment Required');tr.appendChild(td);
    });
    const open=()=>open2027PaymentMatching(context,panel.querySelector('.dues-review-status'));
    panel.querySelector('button').addEventListener('click',open);
    if(pending.length && !tableEditModes.membershipContent) open();
  } catch(error) {
    if(currentMembershipSheet==='2027') target.insertAdjacentHTML('afterbegin','<div class="membership-system-note" role="alert">Payment review could not load: '+esc(error.message)+'. Refresh the roster to retry.</div>');
  }
}
function open2027PaymentMatching(context,status) {
  if(document.getElementById('duesMatchingModal'))return;
  const pending=duesPending(context.ledger);
  if(!pending.length){status.textContent=' No unmatched renewal payments.';return;}
  const dialog=document.createElement('dialog');dialog.id='duesMatchingModal';dialog.className='attendance-entry-dialog';dialog.style.cssText='max-height:85vh;overflow:auto;border:1px solid #555;color:#172033;background:#fff;width:min(1000px,95vw);padding:28px;box-sizing:border-box';
  dialog.innerHTML='<header class="attendance-entry-header"><h2>Match 2027 Renewal Payments</h2><button type="button" data-close aria-label="Close payment review">×</button></header><p>Choose whose renewal each payment covers. A similar name is a suggestion; nothing is marked paid until you confirm. Alternate PayPal emails are remembered in the payment log.</p><div data-payments></div><button type="button" data-close class="dashboard-edit-btn">Review Later</button>';
  document.body.appendChild(dialog);const close=()=>dialog.remove();dialog.querySelectorAll('[data-close]').forEach(b=>b.onclick=close);dialog.addEventListener('cancel',e=>{e.preventDefault();close();});
  const col=name=>duesHeader(context.ledger,name);
  const members=context.people.filter(p=>['active','prospect'].includes(p.status));
  for(const payment of pending){
    const row=payment.values,payer=String(row[col('Buyer Name')]||''),email=duesNorm(row[col('Buyer Email')]);
    const eligible=members.filter(p=>!duesExemption(p,context.previous,context.presidents));
    const exact=eligible.filter(p=>p.email===email);
    const aliases=context.ledger.slice(1).filter(r=>duesNorm(r[col('Status')])==='reconciled' && duesNorm(r[col('Buyer Email')])===email).map(r=>duesMatchRecord(r[col('Notes')])).filter(Boolean);
    const remembered=eligible.filter(p=>aliases.some(a=>a.memberEmail===p.email && duesNorm(a.memberName)===duesNorm(p.name)));
    const suggested=exact.length===1?exact[0]:remembered.length===1?remembered[0]:null;
    const card=document.createElement('section');card.className='membership-system-note';
    card.innerHTML='<h3>'+esc(money(Number(row[col('Gross Amount')])))+' from '+esc(payer)+'</h3><p>'+esc(email)+' · '+esc(row[col('Payment Date')])+'<br>Transaction: '+esc(row[col('Transaction ID')])+'</p><label>Whose 2027 renewal does this cover? <select style="display:block;width:100%;min-height:54px;margin-top:12px;padding:12px 16px;font-size:18px;background:#252527;color:#fff;border:2px solid #777;border-radius:8px;box-sizing:border-box" aria-label="Member for '+esc(payer)+'"><option value="">Choose a member…</option>'+eligible.map(p=>'<option value="'+p.row+'" '+(p===suggested?'selected':'')+'>'+esc(p.name)+' — '+esc(p.email)+'</option>').join('')+'</select></label><p>Exempt members and members with initial-payment coverage are excluded. If this payment belongs to one of them, leave it for review.</p><button type="button" class="dashboard-edit-btn">Confirm Match</button><p role="status" data-result></p>';
    dialog.querySelector('[data-payments]').appendChild(card);
    const button=card.querySelector('button'),select=card.querySelector('select'),result=card.querySelector('[data-result]');
    button.onclick=async()=>{
      const selected=eligible.find(p=>p.row===Number(select.value));if(!selected){result.textContent='Choose a member first.';return;}
      if(!window.confirm('Confirm '+money(Number(row[col('Gross Amount')]))+' from '+payer+' is for '+selected.name+'’s 2027 renewal?'))return;
      button.disabled=true;select.disabled=true;button.textContent='Processing…';button.style.cssText='background:#facc15;color:#1a1a1a;border-color:#facc15;opacity:1';card.style.border='2px solid #facc15';result.style.color='#854d0e';result.textContent='Processing — checking and saving this payment…';
      try { await confirm2027PaymentMatch(payment,selected);result.textContent='✓ Matched to '+selected.name+'. Dues marked paid and alternate PayPal email saved. Select Done below to close and refresh the roster.';button.textContent='✓ Match Complete';button.style.cssText='background:#22c55e;color:#071b0d;border-color:#22c55e;opacity:1';card.style.border='2px solid #22c55e';result.style.color='#166534';status.textContent=' Payment matched successfully.';const done=dialog.querySelector('button[data-close].dashboard-edit-btn');done.textContent='Done — Close & Refresh Roster';done.onclick=async()=>{close();if(currentMembershipSheet==='2027')await loadMembershipSheet('2027',true);}; }
      catch(error){result.textContent='Could not complete the match: '+error.message;result.style.color='#b91c1c';card.style.border='2px solid #f87171';button.textContent='Retry Match';button.style.cssText='';button.disabled=false;select.disabled=false;}
    };
  }
  dialog.showModal();
}
async function confirm2027PaymentMatch(payment,selected) {
  const roster=await getSheetValues("'2027'!A1:AK900",MEMBERSHIP_SPREADSHEET_ID),context=await duesReadContext(roster),ledger=context.ledger;
  const col=name=>duesHeader(ledger,name),id=String(payment.values[col('Transaction ID')]||'').trim();
  const matches=ledger.slice(1).map((values,i)=>({values,row:i+2})).filter(p=>String(p.values[col('Transaction ID')]||'').trim()===id);
  if(!id||matches.length!==1)throw new Error('Missing or duplicate transaction ID. Review the payment log.');
  const current=matches[0];
  if(JSON.stringify(current.values)!==JSON.stringify(payment.values))throw new Error('This payment changed. Close this window and refresh the roster.');
  if(!duesPending(ledger).some(p=>p.row===current.row))throw new Error('This payment is already handled or is not a reviewable 2027 renewal.');
  if(Number(current.values[col('Gross Amount')])!==52||duesNorm(current.values[col('Currency')])!=='usd')throw new Error('This is not a standard $52 USD renewal. Review it separately.');
  const people=context.people.filter(p=>duesSamePerson(p,selected));
  if(people.length!==1||!['active','prospect'].includes(people[0].status))throw new Error('Member identity changed or is ambiguous. Refresh the roster.');
  const person=people[0];if(duesExemption(person,context.previous,context.presidents))throw new Error('This member is exempt or already covered. Leave the payment for review.');
  if(/^(yes|paid)$/.test(duesNorm(person.values[person.cols['Dues Paid']])))throw new Error('This member is already paid. Review this possible duplicate payment.');
  const already=ledger.slice(1).some(r=>duesNorm(r[col('Status')])==='reconciled' && Number(r[col('Membership Year')])===2027 && duesNorm(r[col('Member Name')])===duesNorm(person.name) && Number(r[col('Dues Credit')])>0);
  if(already)throw new Error('This member already has a credited renewal payment. Review before applying another payment.');
  const record={memberName:person.name,memberEmail:person.email,payerEmail:duesNorm(current.values[col('Buyer Email')])};
  const note=String(current.values[col('Notes')]||'')+' | Confirmed in portal '+new Date().toISOString()+' [PAYMENT_MATCH:'+JSON.stringify(record)+']';
  const updates=[['Member Name',person.name],['Dues Credit',50],['Status','Reconciled'],['Receipt Status','Pending'],['Notes',note]].map(([header,value])=>({range:"'Dues Payments'!"+columnNumberToLetters(col(header)+1)+current.row,majorDimension:'ROWS',values:[[value]]}));
  updates.push({range:"'2027'!"+columnNumberToLetters(person.cols['Dues Paid']+1)+person.row,majorDimension:'ROWS',values:[['Yes']]});
  // RAW keeps payer names and email data from being interpreted as formulas.
  await writePortalSheetRequest('https://sheets.googleapis.com/v4/spreadsheets/'+MEMBERSHIP_SPREADSHEET_ID+'/values:batchUpdate',{method:'POST',headers:{Authorization:'Bearer '+accessToken,'Content-Type':'application/json'},body:JSON.stringify({valueInputOption:'RAW',data:updates}),signal:AbortSignal.timeout(15000)},'Confirmed renewal payment','2027 / Dues Payments',updates.length);
  const verify=await getSheetValues("'Dues Payments'!A"+current.row+':O'+current.row,MEMBERSHIP_SPREADSHEET_ID);
  const paid=await getSheetValues("'2027'!"+columnNumberToLetters(person.cols['Dues Paid']+1)+person.row,MEMBERSHIP_SPREADSHEET_ID);
  if(verify[0]?.[col('Status')]!=='Reconciled'||paid[0]?.[0]!=='Yes')throw new Error('Save could not be verified. Refresh before retrying.');
}

function print2027UnpaidDues(context) {
  const unpaid=context.people.filter(person=>person.status==='active' && !/^(yes|paid|exempt|waived)$/.test(duesNorm(person.values[person.cols['Dues Paid']])) && !duesExemption(person,context.previous,context.presidents)).sort((a,b)=>String(a.values[a.cols['Last Name']]).localeCompare(String(b.values[b.cols['Last Name']])) || a.name.localeCompare(b.name));
  const printWindow=window.open('','_blank');
  if(!printWindow){alert('Allow pop-ups for this portal to print the dues list.');return;}
  const date=new Date().toLocaleDateString('en-US');
  printWindow.document.write('<!doctype html><html><head><title>2027 Unpaid Dues Collection List</title><style>@page{size:letter;margin:.5in}body{font:12pt Arial,sans-serif;color:#111}h1{font-size:19pt;margin-bottom:8px}p{line-height:1.4}table{width:100%;border-collapse:collapse;margin-top:20px}th,td{border:1px solid #777;padding:12px 8px;text-align:left}th{background:#eee;font-size:10pt}td{height:42px}.print{padding:10px 16px}@media print{.print{display:none}}</style></head><body><button class="print" onclick="window.print()">Print List</button><h1>BoneShakers — 2027 Dues Collection</h1><p>Prepared '+esc(date)+' · '+unpaid.length+' unpaid members · $50 dues per member</p><p>Mark payments only after collection. Record the amount, date, and method, then return this sheet so Dues Paid can be updated to Yes. Signed waivers are tracked separately.</p><table><thead><tr><th>Member</th><th>Collected ✓</th><th>Amount</th><th>Date</th><th>Method / Notes</th></tr></thead><tbody>'+unpaid.map(person=>'<tr><td>'+esc(person.name)+'</td><td></td><td></td><td></td><td></td></tr>').join('')+'</tbody></table><p>Expected collection: '+esc(money(unpaid.length*50))+'. This lists all active unpaid members, regardless of their planned payment method.</p></body></html>');
  printWindow.document.close();
  printWindow.focus();
}
