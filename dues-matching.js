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
    const panel=document.createElement('section');panel.className='dues-manager-launch';
    panel.innerHTML='<div><strong>2027 Membership Dues</strong><span>'+unpaid2027Dues(context).length+' unpaid · '+pending.length+' online payments to review</span></div><button type="button" class="dashboard-edit-btn" data-manage-dues>Manage Dues</button><span role="status" class="dues-review-status"></span>';
    target.prepend(panel);
    const header=target.querySelector('table thead tr:last-child');
    if(header) { const th=document.createElement('th');th.textContent='2027 Dues Status';const renewalHeader=[...header.children].find(cell=>cell.textContent==='Renewed On');header.insertBefore(th,renewalHeader||null); }
    const bodyRows=[...target.querySelectorAll('table tbody tr')];
    context.people.forEach((p,i)=>{
      const tr=bodyRows.find(row=>Number(row.dataset.rosterSourceRow)===p.row)||bodyRows[i];if(!tr)return;
      const td=document.createElement('td');const contribution=context.ledger.slice(1).some(r=>duesNorm(r[duesHeader(context.ledger,'Status')])==='reconciled' && Number(r[duesHeader(context.ledger,'Membership Year')])===2027 && duesNorm(r[duesHeader(context.ledger,'Member Name')])===duesNorm(p.name) && String(r[duesHeader(context.ledger,'Notes')]||'').includes('[VOLUNTARY_CONTRIBUTION_RECEIVED]'));td.textContent=(duesExemption(p,context.previous,context.presidents)||(/^(yes|paid)$/.test(duesNorm(p.values[p.cols['Dues Paid']]))?'Paid':'Payment Required'))+(contribution?' · Voluntary contribution received':'');const renewedOnIndex=[...header.children].findIndex(cell=>cell.textContent==='Renewed On');tr.insertBefore(td,renewedOnIndex>=0?tr.children[renewedOnIndex-1]||null:null);
    });
    const open=()=>open2027DuesManager(panel.querySelector('.dues-review-status'));
    panel.querySelector('button').addEventListener('click',open);
    if(pending.length && !tableEditModes.membershipContent) open();
  } catch(error) {
    if(currentMembershipSheet==='2027') target.insertAdjacentHTML('afterbegin','<div class="membership-system-note" role="alert">Payment review could not load: '+esc(error.message)+'. Refresh the roster to retry.</div>');
  }
}
function open2027PaymentMatching(context,status,host=null) {
  if(!host && document.getElementById('duesMatchingModal'))return;
  const pending=duesPending(context.ledger);
  if(!pending.length){status.textContent=' No unmatched renewal payments.';return;}
  const dialog=host || document.createElement('dialog');if(!host){dialog.id='duesMatchingModal';dialog.className='attendance-entry-dialog';dialog.style.cssText='max-height:85vh;overflow:auto;border:1px solid #555;color:#172033;background:#fff;width:min(1000px,95vw);padding:28px;box-sizing:border-box';}
  dialog.innerHTML='<header class="attendance-entry-header"><h2>Match 2027 Renewal Payments</h2><button type="button" data-close aria-label="Close payment review">×</button></header><p>Choose whose renewal each payment covers. A similar name is a suggestion; nothing is marked paid until you confirm. Alternate PayPal emails are remembered in the payment log.</p><div data-payments></div><button type="button" data-close class="dashboard-edit-btn">Review Later</button>';
  if(!host)document.body.appendChild(dialog);const close=()=>host ? (host.hidden=true) : dialog.remove();dialog.querySelectorAll('[data-close]').forEach(b=>b.onclick=close);dialog.addEventListener('cancel',e=>{e.preventDefault();close();});
  const col=name=>duesHeader(context.ledger,name);
  const members=context.people.filter(p=>['active','prospect'].includes(p.status));
  for(const payment of pending){
    const row=payment.values,payer=String(row[col('Buyer Name')]||''),email=duesNorm(row[col('Buyer Email')]);
    const eligible=members;
    const exact=eligible.filter(p=>p.email===email);
    const aliases=context.ledger.slice(1).filter(r=>duesNorm(r[col('Status')])==='reconciled' && duesNorm(r[col('Buyer Email')])===email).map(r=>duesMatchRecord(r[col('Notes')])).filter(Boolean);
    const remembered=eligible.filter(p=>aliases.some(a=>a.memberEmail===p.email && duesNorm(a.memberName)===duesNorm(p.name)));
    const suggested=exact.length===1?exact[0]:remembered.length===1?remembered[0]:null;
    const card=document.createElement('section');card.className='membership-system-note';
    card.innerHTML='<h3>'+esc(money(Number(row[col('Gross Amount')])))+' from '+esc(payer)+'</h3><p>'+esc(email)+' · '+esc(row[col('Payment Date')])+'<br>Transaction: '+esc(row[col('Transaction ID')])+'</p><label>Whose 2027 renewal does this cover? <select style="display:block;width:100%;min-height:54px;margin-top:12px;padding:12px 16px;font-size:18px;background:#252527;color:#fff;border:2px solid #777;border-radius:8px;box-sizing:border-box" aria-label="Member for '+esc(payer)+'"><option value="">Choose a member…</option>'+eligible.map(p=>'<option value="'+p.row+'" '+(p===suggested?'selected':'')+'>'+esc(p.name)+' — '+esc(p.email)+(duesExemption(p,context.previous,context.presidents)?' — Exempt / covered':'')+'</option>').join('')+'</select></label><p>For exempt or covered members, confirm a voluntary contribution. Their existing dues exemption or coverage stays unchanged.</p><button type="button" class="dashboard-edit-btn">Confirm Match</button><p role="status" data-result></p>';
    dialog.querySelector('[data-payments]').appendChild(card);
    const button=card.querySelector('button'),select=card.querySelector('select'),result=card.querySelector('[data-result]');
    const updateAction=()=>{const p=eligible.find(p=>p.row===Number(select.value));button.textContent=p&&duesExemption(p,context.previous,context.presidents)?'Confirm Voluntary Contribution':'Confirm Match';};
    select.addEventListener('change',updateAction);updateAction();
    button.onclick=async()=>{
      const selected=eligible.find(p=>p.row===Number(select.value));if(!selected){result.textContent='Choose a member first.';return;}
      const voluntary=Boolean(duesExemption(selected,context.previous,context.presidents));
      if(!window.confirm('Confirm '+money(Number(row[col('Gross Amount')]))+' from '+payer+' for '+selected.name+(voluntary?' as a voluntary contribution? Their dues exemption or coverage will stay unchanged.':'’s 2027 renewal?')))return;
      button.disabled=true;select.disabled=true;button.textContent='Processing…';button.style.cssText='background:#facc15;color:#1a1a1a;border-color:#facc15;opacity:1';card.style.border='2px solid #facc15';result.style.color='#854d0e';result.textContent='Processing — checking and saving this payment…';
      try { const outcome=await confirm2027PaymentMatch(payment,selected);result.textContent=outcome.voluntary?'✓ Voluntary contribution received from '+selected.name+'. Existing dues exemption or coverage preserved. Select Done below to close and refresh the roster.':'✓ Matched to '+selected.name+'. Dues marked paid and alternate PayPal email saved. Select Done below to close and refresh the roster.';button.textContent=outcome.voluntary?'✓ Voluntary Contribution Received':'✓ Match Complete';button.style.cssText='background:#22c55e;color:#071b0d;border-color:#22c55e;opacity:1';card.style.border='2px solid #22c55e';result.style.color='#166534';status.textContent=' Payment matched successfully.';const done=dialog.querySelector('button[data-close].dashboard-edit-btn');done.textContent='Done — Close & Refresh Roster';done.onclick=async()=>{if(host)host.closest('dialog').remove();else close();if(currentMembershipSheet==='2027')await loadMembershipSheet('2027',true);}; }
      catch(error){result.textContent='Could not complete the match: '+error.message;result.style.color='#b91c1c';card.style.border='2px solid #f87171';button.textContent='Retry Match';button.style.cssText='';button.disabled=false;select.disabled=false;}
    };
  }
  if(!host)dialog.showModal();else host.hidden=false;
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
  const person=people[0],voluntary=Boolean(duesExemption(person,context.previous,context.presidents));
  if(!voluntary && /^(yes|paid)$/.test(duesNorm(person.values[person.cols['Dues Paid']])))throw new Error('This member is already paid. Review this possible duplicate payment.');
  const already=ledger.slice(1).some(r=>duesNorm(r[col('Status')])==='reconciled' && Number(r[col('Membership Year')])===2027 && duesNorm(r[col('Member Name')])===duesNorm(person.name) && Number(r[col('Dues Credit')])>0);
  if(!voluntary && already)throw new Error('This member already has a credited renewal payment. Review before applying another payment.');
  const record={memberName:person.name,memberEmail:person.email,payerEmail:duesNorm(current.values[col('Buyer Email')])};
  const note=String(current.values[col('Notes')]||'')+' | Confirmed in portal '+new Date().toISOString()+' [PAYMENT_MATCH:'+JSON.stringify(record)+']'+(voluntary?' | Voluntary contribution received: $52 gross; $0 required dues credit; existing exemption or initial-payment coverage preserved. [VOLUNTARY_CONTRIBUTION_RECEIVED]':'');
  const updates=[['Member Name',person.name],['Dues Credit',voluntary?0:50],['Status','Reconciled'],['Receipt Status','Pending'],['Notes',note]].map(([header,value])=>({range:"'Dues Payments'!"+columnNumberToLetters(col(header)+1)+current.row,majorDimension:'ROWS',values:[[value]]}));
  if(!voluntary) updates.push({range:"'2027'!"+columnNumberToLetters(person.cols['Dues Paid']+1)+person.row,majorDimension:'ROWS',values:[['Yes']]});
  // RAW keeps payer names and email data from being interpreted as formulas.
  await writePortalSheetRequest('https://sheets.googleapis.com/v4/spreadsheets/'+MEMBERSHIP_SPREADSHEET_ID+'/values:batchUpdate',{method:'POST',headers:{Authorization:'Bearer '+accessToken,'Content-Type':'application/json'},body:JSON.stringify({valueInputOption:'RAW',data:updates}),signal:AbortSignal.timeout(15000)},'Confirmed renewal payment','2027 / Dues Payments',updates.length);
  const verify=await getSheetValues("'Dues Payments'!A"+current.row+':O'+current.row,MEMBERSHIP_SPREADSHEET_ID);
  const paid=await getSheetValues("'2027'!"+columnNumberToLetters(person.cols['Dues Paid']+1)+person.row,MEMBERSHIP_SPREADSHEET_ID);
  if(verify[0]?.[col('Status')]!=='Reconciled'||(voluntary?String(paid[0]?.[0]??'')!==String(person.values[person.cols['Dues Paid']]??''):paid[0]?.[0]!=='Yes'))throw new Error('Save could not be verified. Refresh before retrying.');
  return {voluntary};
}


function unpaid2027Dues(context) {
  return context.people.filter(p=>['active','prospect'].includes(p.status) && !/^(yes|paid|exempt|waived)$/.test(duesNorm(p.values[p.cols['Dues Paid']])) && !duesExemption(p,context.previous,context.presidents)).sort((a,b)=>String(a.values[a.cols['Last Name']]).localeCompare(String(b.values[b.cols['Last Name']])) || a.name.localeCompare(b.name));
}
function duesLocalDate() {
  return new Intl.DateTimeFormat('en-CA',{timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
}
async function open2027DuesManager(status) {
  if(document.getElementById('duesManagerModal'))return;
  status.textContent='Loading dues…';
  let context;
  try { context=await duesReadContext(await getSheetValues("'2027'!A1:AK900",MEMBERSHIP_SPREADSHEET_ID)); }
  catch(error){status.textContent='Could not load dues: '+error.message;return;}
  status.textContent='';
  const unpaid=unpaid2027Dues(context),pending=duesPending(context.ledger);
  const dialog=document.createElement('dialog');dialog.id='duesManagerModal';dialog.className='dues-manager-dialog';
  dialog.innerHTML='<header class="dues-manager-head"><div><small>MEMBERSHIP · 2027</small><h2>Manage Dues</h2></div><button type="button" data-dues-close aria-label="Close dues manager">×</button></header><div class="dues-manager-body"><div class="dues-manager-actions"><button type="button" class="dashboard-edit-btn" data-dues-print>Print Collection List</button><button type="button" class="dashboard-edit-btn" data-dues-online>Review Online Payments ('+pending.length+')</button></div><section data-dues-online-panel hidden></section><section data-dues-meeting><div class="dues-manager-section"><div><h3>Record meeting payments</h3><p>Select the members who paid and their payment methods.</p></div><label>Payment date<input type="date" data-dues-date value="'+duesLocalDate()+'" required></label></div><div class="table-wrap"><table class="dues-collection-table"><thead><tr><th>Paid</th><th>Member</th><th>Amount owed</th><th>Payment method</th></tr></thead><tbody>'+unpaid.map(p=>'<tr><td><input type="checkbox" data-dues-person="'+p.row+'" aria-label="Record payment for '+esc(p.name)+'"></td><td>'+esc(p.name)+'</td><td><strong>$50.00</strong></td><td><select data-dues-method="'+p.row+'" aria-label="Payment method for '+esc(p.name)+'">'+['Cash','Check','Credit Card','Debit Card','Zelle'].map(method=>'<option>'+method+'</option>').join('')+'</select></td></tr>').join('')+'</tbody></table></div>'+(unpaid.length?'':'<p>All renewed members are paid or exempt.</p>')+'<footer class="dues-manager-footer"><strong data-dues-summary>0 selected · $0.00</strong><button type="button" class="dashboard-edit-btn" data-dues-save disabled>Record Selected Payments</button></footer><p role="status" data-dues-result></p><p class="dues-manager-note">Saving records the payment, marks dues paid, and adds the income to Finance. Bank clearing is handled through normal reconciliation.</p></section></div>';
  document.body.appendChild(dialog);
  let saving=false;
  const close=()=>{if(!saving)dialog.remove();};
  dialog.querySelector('[data-dues-close]').onclick=close;dialog.addEventListener('cancel',e=>{e.preventDefault();close();});
  dialog.querySelector('[data-dues-print]').onclick=()=>print2027UnpaidDues(context);
  dialog.querySelector('[data-dues-online]').onclick=()=>open2027PaymentMatching(context,dialog.querySelector('[data-dues-result]'),dialog.querySelector('[data-dues-online-panel]'));
  const selected=()=>[...dialog.querySelectorAll('[data-dues-person]:checked')].map(box=>unpaid.find(p=>p.row===Number(box.dataset.duesPerson)));
  dialog.querySelectorAll('[data-dues-person]').forEach(box=>box.addEventListener('change',()=>{
    const count=selected().length;dialog.querySelector('[data-dues-summary]').textContent=count+' selected · '+money(count*50);dialog.querySelector('[data-dues-save]').disabled=!count;
  }));
  dialog.querySelector('[data-dues-save]').onclick=async()=>{
    const people=selected(),date=dialog.querySelector('[data-dues-date]').value,result=dialog.querySelector('[data-dues-result]');
    if(!people.length || !/^\d{4}-\d{2}-\d{2}$/.test(date)){result.textContent='Select members and enter the payment date.';return;}
    const payments=people.map(person=>({person,method:dialog.querySelector('[data-dues-method="'+person.row+'"]').value}));
    saving=true;dialog.querySelectorAll('button,input,select').forEach(el=>el.disabled=true);result.textContent='Recording payments…';result.className='';
    let completed=0;
    try {
      for(const payment of payments){await record2027MeetingDues(payment.person,date,payment.method);completed++;result.textContent=completed+' of '+payments.length+' payments saved…';}
      result.textContent='✓ '+completed+' payments recorded. Dues and Finance updated.';result.className='dues-manager-success';
      loadedFinanceTabs.delete('transactions2026');loadedFinanceTabs.delete('dashboard');loadedFinanceTabs.delete('control');
      dialog.querySelector('[data-dues-save]').textContent='Done — Close & Refresh';dialog.querySelector('[data-dues-save]').disabled=false;
      dialog.querySelector('[data-dues-save]').onclick=async()=>{dialog.remove();await loadMembershipSheet('2027',true);};
    } catch(error) {
      result.textContent=completed+' payments completed. '+error.message+' Close and reopen Manage Dues before retrying; existing entries will be reused.';
      result.className='dues-manager-error';
    } finally {saving=false;dialog.querySelector('[data-dues-close]').disabled=false;}
  };
  dialog.showModal();
}
function duesMappedRow(headers,values) {
  return headers.map(header=>values[String(header || '').trim()] ?? '');
}
async function duesAppendRaw(spreadsheetId,sheet,values) {
  const range="'"+sheet+"'!A:Q";
  return writePortalSheetRequest('https://sheets.googleapis.com/v4/spreadsheets/'+spreadsheetId+'/values/'+encodeURIComponent(range)+':append?valueInputOption=RAW&insertDataOption=INSERT_ROWS',{
    method:'POST',headers:{Authorization:'Bearer '+accessToken,'Content-Type':'application/json'},body:JSON.stringify({range,majorDimension:'ROWS',values:[values]}),signal:AbortSignal.timeout(15000)
  },'Recorded meeting dues',sheet,1);
}
async function record2027MeetingDues(selected,date,method) {
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!['Cash','Check','Credit Card','Debit Card','Zelle'].includes(method))throw new Error('Choose a valid date and payment method.');
  if(date.slice(0,4)!=='2026')throw new Error('This collection screen currently records payments received in 2026.');
  const roster=await getSheetValues("'2027'!A1:AK900",MEMBERSHIP_SPREADSHEET_ID),context=await duesReadContext(roster);
  const people=context.people.filter(p=>duesSamePerson(p,selected));
  if(people.length!==1)throw new Error('Member identity changed. Refresh the roster.');
  const person=people[0];
  const id='MEETING-DUES-2027-'+encodeURIComponent(person.email);
  const lc=name=>duesHeader(context.ledger,name);
  const logs=context.ledger.slice(1).filter(row=>String(row[lc('Transaction ID')]||'')===id);
  if(logs.length>1)throw new Error('Duplicate payment record for '+person.name+'. Review Dues Payments.');
  if(duesExemption(person,context.previous,context.presidents))throw new Error(person.name+' is exempt or already covered.');
  const otherCredit=context.ledger.slice(1).some(row=>String(row[lc('Transaction ID')]||'')!==id && Number(row[lc('Membership Year')])===2027 && duesNorm(row[lc('Member Name')])===duesNorm(person.name) && Number(row[lc('Dues Credit')])>0);
  if(otherCredit || /^(yes|paid)$/.test(duesNorm(person.values[person.cols['Dues Paid']])))throw new Error(person.name+' is already paid. Refresh the list.');
  if(logs.length && (String(logs[0][lc('Payment Date')])!==date || Number(logs[0][lc('Gross Amount')])!==50 || !String(logs[0][lc('Notes')]||'').includes('Method: '+method+' |')))throw new Error('An earlier collection record has different details for '+person.name+'. Use its original date and method to finish saving.');
  let finance=await getSheetValues("'Transactions-2026'!A1:Q",FINANCE_SPREADSHEET_ID);
  const fc=name=>duesHeader(finance,name);
  const marker='[DUES_COLLECTION:'+id+']';
  const transactions=finance.slice(1).map((row,i)=>({row,index:i+2})).filter(item=>String(item.row[fc('Note')]||'').includes(marker));
  if(transactions.length>1)throw new Error('Duplicate finance entry for '+person.name+'. Review Finance.');
  if(transactions.length && (Number(String(transactions[0].row[fc('Amount')]).replace(/[$,]/g,''))!==50 || String(transactions[0].row[fc('Payment Method')])!==method))throw new Error('Existing finance entry differs for '+person.name+'. Review Finance.');
  if(!logs.length) {
    await duesAppendRaw(MEMBERSHIP_SPREADSHEET_ID,'Dues Payments',duesMappedRow(context.ledger[0],{
      'Transaction ID':id,'Payment Date':date,'Buyer Name':person.name,'Buyer Email':person.email,'Payment Description':'2027 Membership Renewal Dues','Gross Amount':50,'Currency':'USD','Member Name':person.name,'Membership Year':2027,'Dues Credit':50,'Status':'Recording','Receipt Status':'Not requested','Notes':'Meeting collection | Method: '+method+' | '+marker
    }));
  }
  let sourceRow;
  if(!transactions.length) {
    const parts=date.split('-').map(Number),displayDate=parts[1]+'/'+parts[2]+'/'+parts[0];
    const result=await duesAppendRaw(FINANCE_SPREADSHEET_ID,'Transactions-2026',duesMappedRow(finance[0],{
      'Date':displayDate,'Month':new Date(parts[0],parts[1]-1,parts[2]).toLocaleString('en-US',{month:'long'}),'Year':parts[0],
      'Description':'2027 Membership Renewal Dues','Category':'Membership','Subcategory':'Dues','Fund':'General Fund','Activity':'General Meeting','Payee/Payer':person.name,'Amount':50,'Type':'Income','Payment Method':method,'Cleared':'No','Community Impact':'FALSE','Note':marker
    }));
    await restoreAppendedTransactionBalances(result);
    sourceRow=Number(result?.updates?.updatedRange?.match(/!A(\d+):/)?.[1]);
  } else {
    sourceRow=transactions[0].index;
    await restoreAppendedTransactionBalances({updates:{updatedRange:"'Transactions-2026'!A"+sourceRow+':Q'+sourceRow}});
  }
  const ledger=await getSheetValues("'Dues Payments'!A1:O1000",MEMBERSHIP_SPREADSHEET_ID);
  const matches=ledger.slice(1).map((row,i)=>({row,index:i+2})).filter(item=>String(item.row[duesHeader(ledger,'Transaction ID')]||'')===id);
  if(matches.length!==1)throw new Error('Could not verify the collection record for '+person.name+'.');
  const paymentRow=matches[0].index;
  const updates=[
    {range:"'Dues Payments'!"+columnNumberToLetters(duesHeader(ledger,'Status')+1)+paymentRow,values:[['Reconciled']]},
    {range:"'2027'!"+columnNumberToLetters(person.cols['Dues Paid']+1)+person.row,values:[['Yes']]}
  ];
  await writePortalSheetRequest('https://sheets.googleapis.com/v4/spreadsheets/'+MEMBERSHIP_SPREADSHEET_ID+'/values:batchUpdate',{method:'POST',headers:{Authorization:'Bearer '+accessToken,'Content-Type':'application/json'},body:JSON.stringify({valueInputOption:'RAW',data:updates}),signal:AbortSignal.timeout(15000)},'Completed meeting dues payment','2027 / Dues Payments',2);
  const paid=await getSheetValues("'2027'!"+columnNumberToLetters(person.cols['Dues Paid']+1)+person.row,MEMBERSHIP_SPREADSHEET_ID);
  if(paid[0]?.[0]!=='Yes')throw new Error('Could not verify dues status for '+person.name+'. Refresh the roster.');
}
function print2027UnpaidDues(context) {
  const unpaid=unpaid2027Dues(context),printWindow=window.open('','_blank');
  if(!printWindow){alert('Allow pop-ups for this portal to print the collection list.');return;}
  const pages=[];
  for(let i=0;i<unpaid.length;i+=7)pages.push(unpaid.slice(i,i+7));
  if(!pages.length)pages.push([]);
  const checkbox=label=>'<span class="method"><span class="box"></span>'+label+'</span>';
  const sheets=pages.map((members,index)=>`<section class="sheet">
    <header><div class="club">BONESHAKERS SOCIAL CLUB</div><h1>2027 Dues Collection</h1>
      <p>${unpaid.length} members / $50 each / ${esc(money(unpaid.length*50))} total outstanding</p></header>
    <div class="collection"><span>Collection date: <span class="write-line">${esc(duesLocalDate())}</span></span><span>Collected by: <span class="write-line"></span></span></div>
    <p class="instruction">Check PAID only after receiving payment. Select the method used.</p>
    <table><colgroup><col style="width:34.5%"><col style="width:10.5%"><col style="width:11%"><col style="width:27%"><col style="width:17%"></colgroup>
      <thead><tr><th>Member</th><th>Due</th><th>Paid</th><th>Method</th><th>Date</th></tr></thead>
      <tbody>${members.map(person=>`<tr><td class="name">${esc(person.name)}</td><td>$50</td><td class="paid"><span class="box"></span></td><td><div class="methods">${['Cash','Check','Card','Other'].map(checkbox).join('')}</div></td><td><span class="date-line"></span></td></tr>`).join('') || '<tr><td colspan="5">No outstanding dues.</td></tr>'}</tbody>
    </table>
    <div class="tally"><h2>End-of-night tally${pages.length>1?' - this page':''}</h2><div class="totals"><span>Cash: $ <i></i></span><span>Checks: $ <i></i></span><span>Card / other: $ <i></i></span></div><div class="totals two"><span>Total received: $ <i></i></span><span>Members paid: <i></i></span></div></div>
    <div class="notes"><strong>Notes / check numbers:</strong><div></div><div></div></div>
    <footer><span>Enter collected payments in Manage Dues after the event.</span><span>${index+1} of ${pages.length}</span></footer>
  </section>`).join('');
  printWindow.document.write(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>2027 Dues Collection</title><style>
    @page{size:letter portrait;margin:.5in}*{box-sizing:border-box}body{margin:0;background:#e9edf1;color:#111;font:11pt Arial,sans-serif}
    .toolbar{padding:16px;text-align:center}.toolbar button{padding:12px 28px;font-size:16px;cursor:pointer}.sheet{width:7.5in;min-height:10in;margin:0 auto 24px;background:white;padding:0}
    .club{font-size:11pt;font-weight:bold;letter-spacing:1px;padding-top:6px}h1{font-size:25pt;margin:16px 0 10px}header p{margin:0;font-size:11pt}
    .collection{display:flex;justify-content:space-between;gap:24px;margin-top:25px;font-size:10pt;font-weight:bold}.collection>span{display:flex;align-items:end;flex:1;gap:8px;white-space:nowrap}.write-line{display:inline-block;flex:1;height:20px;border-bottom:1px solid #aaa;font-weight:normal}
    .instruction{font-size:10pt;margin:22px 0 14px}table{width:100%;border-collapse:collapse;table-layout:fixed}thead{display:table-header-group}th{background:#edf0f3;text-transform:uppercase;font-size:9pt;letter-spacing:.5px;text-align:left;height:28px;padding:7px 8px}td{border:1px solid #b7bdc5;padding:8px;font-size:12pt;height:68px}tr{break-inside:avoid}.name{font-weight:bold;overflow-wrap:anywhere}.paid{text-align:center}.box{display:inline-block;width:15px;height:15px;border:1px solid #111;flex-shrink:0;vertical-align:middle}.paid .box{width:19px;height:19px}.methods{display:grid;grid-template-columns:1fr 1fr;gap:10px 8px}.method{display:flex;align-items:center;gap:6px;font-size:9pt;white-space:nowrap}.date-line{display:block;border-bottom:1px solid #aaa;height:24px}
    h2{font-size:11pt;text-transform:uppercase;letter-spacing:.6px;margin:23px 0 16px}.totals{display:flex;gap:20px;margin-bottom:20px}.totals>span{display:flex;gap:6px;flex:1;white-space:nowrap;font-size:10pt}.totals i{flex:1;min-width:25px;border-bottom:1px solid #aaa}.two{gap:65px}.notes{font-size:10pt}.notes div{height:27px;border-bottom:1px solid #aaa}footer{display:flex;justify-content:space-between;gap:12px;font-size:9pt;margin-top:24px}
    @media screen{.sheet{padding:24px;width:8.5in;max-width:100%}}@media print{body{background:white}.toolbar{display:none}.sheet{margin:0;width:100%;min-height:0;break-after:page}.sheet:last-child{break-after:auto}th{print-color-adjust:exact;-webkit-print-color-adjust:exact}}
  </style></head><body><div class="toolbar"><button onclick="window.print()">Print collection sheet</button></div>${sheets}</body></html>`);
  printWindow.document.close();printWindow.focus();
}
