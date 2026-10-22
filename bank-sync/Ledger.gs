// Bank imports are identified by bank IDs, not amounts. No bank credentials here.
function bankLedgerDay_(value) {
  if (value instanceof Date) return Utilities.formatDate(value,'America/New_York','yyyy-MM-dd');
  if (typeof value === 'number') return new Date(Math.round((value-25569)*86400000)).toISOString().slice(0,10);
  const d=new Date(value); return isNaN(d.getTime())?'':Utilities.formatDate(d,'America/New_York','yyyy-MM-dd');
}
function bankLedgerPlan_(ledger,bankRows,today) {
  const changes=new Map(), additions=[], claimed=new Set();
  const cents=v=>Math.round(Number(v||0)*100);
  const note=r=>String(r[16]||'');
  const active=r=>![3,4,5,12,14,16].some(i=>/\bvoid(?:ed)?\b/i.test(String(r[i]||'')));
  const fund=b=>String(b[1])==='8799'?'Bikes For Tykes':'General Fund';
  const nearby=(r,b)=>{const a=bankLedgerDay_(r[0]),d=bankLedgerDay_(b[2]);return a&&d&&Math.abs(Date.parse(a)-Date.parse(d))<=10*86400000;};
  const hasId=(r,id)=>id&&note(r).includes('[BANK-ID:'+id+']');
  const tag=(r,b)=>{let n=note(r);[b[0],b[6]].filter(Boolean).forEach(id=>{const t='[BANK-ID:'+id+']';if(!n.includes(t))n+=' '+t;});return n.trim();};
  const stamp=(i,b)=>{
    const r=(changes.get(i)||ledger[i]).slice();
    // Reconciliation remains an explicit review: posted imports are not auto-cleared.
    if(String(r[14]).toLowerCase()!=='yes')r[14]=b[5]==='Pending'?'Pending at Chase':'No';
    r[16]=tag(r,b);
    if(note(r).includes('[BANK-AUTO]')){r[0]=bankLedgerDay_(b[2]);r[1]=new Date(r[0]+'T12:00:00Z').toLocaleString('en-US',{month:'long',timeZone:'UTC'});r[2]=Number(r[0].slice(0,4));r[3]=String(b[3]);r[9]=Number(b[4]);}
    changes.set(i,r);claimed.add(i);
  };
  const live=bankRows.filter(b=>b[5]!=='Removed');
  live.forEach(b=>{
    const linked=ledger.map((r,i)=>({r,i})).filter(x=>hasId(x.r,b[0])||hasId(x.r,b[6]));
    if(linked.length){linked.forEach(x=>stamp(x.i,b));return;}
    // Start automatic importing now; do not recreate the existing historical ledger.
    if(bankLedgerDay_(b[2])<'2026-10-22')return;
    const processor=/paypal|paymentech/i.test(String(b[3]));
    const candidates=ledger.map((r,i)=>({r,i})).filter(x=>!claimed.has(x.i)&&active(x.r)&&x.r[6]===fund(b)&&nearby(x.r,b)&&cents(x.r[9])===cents(b[4]));
    if(processor){
      const summaries=candidates.filter(x=>x.r[12]==='Settlement Summary');
      if(summaries.length===1){
        const payout=note(summaries[0].r).match(/payout\s+([A-Z0-9]{10,})/i)?.[1];
        const parts=payout?ledger.map((r,i)=>({r,i})).filter(x=>active(x.r)&&x.r[6]===fund(b)&&note(x.r).includes(payout)&&/^Transfer (In|Out)$/.test(x.r[12])):[];
        if(parts.length&&parts.reduce((s,x)=>s+cents(x.r[9]),0)===cents(b[4])){parts.forEach(x=>stamp(x.i,b));return;}
        // The payout is already represented; keep the summary visible for review, never add duplicate income.
        return;
      }
    }
    const words=String(b[7]||b[3]).toLowerCase().split(/[^a-z0-9]+/).filter(w=>w.length>=4&&!['orig','name','debit','store','payment','transfer','purchase','paypal','entry','descr','online','from','bank'].includes(w));
    const matches=candidates.filter(x=>x.r[12]!=='Settlement Summary'&&(/online transfer/i.test(b[3])?/^Transfer (In|Out)$/.test(x.r[12]):processor?/^Transfer (In|Out)$/.test(x.r[12])&&/paypal|chase payments/i.test(x.r[13]):words.some(w=>(String(x.r[3])+' '+String(x.r[8])).toLowerCase().includes(w))));
    if(matches.length===1){stamp(matches[0].i,b);return;}
    // Ambiguous existing matches stay for review rather than duplicating their amounts.
    if(matches.length>1)return;
    const date=bankLedgerDay_(b[2]),amount=Number(b[4]),transfer=processor||/online transfer (to|from)/i.test(b[3]);
    const r=Array(17).fill('');
    r[0]=date;r[1]=new Date(date+'T12:00:00Z').toLocaleString('en-US',{month:'long',timeZone:'UTC'});r[2]=Number(date.slice(0,4));r[3]=String(b[3]);r[4]='Uncategorized';r[5]='Bank import — review';r[6]=fund(b);r[7]='Bank import — review';r[8]=String(b[7]||b[3]);r[9]=amount;r[12]=transfer?(amount<0?'Transfer Out':'Transfer In'):(amount<0?'Expense':'Income');r[13]=processor?(/paypal/i.test(b[3])?'PayPal':'Chase Payments'):'ACH / Bank Transfer';r[14]=b[5]==='Pending'?'Pending at Chase':'No';r[15]=false;r[16]=tag(r,b)+' [BANK-AUTO] Imported from Chase account …'+b[1]+'. Review category and fund; fund defaults to the bank account. '+(transfer?'Bank movement only; do not count as new income/expense.':'');
    additions.push(r);
  });
  bankRows.filter(b=>b[5]==='Removed').forEach(b=>{
    ledger.forEach((r,i)=>{
      if(!hasId(r,b[0])||live.some(t=>hasId(changes.get(i)||r,t[0])||t[6]===b[0]))return;
      const next=(changes.get(i)||r).slice();
      if(note(r).includes('[BANK-AUTO]')&&String(r[14]).toLowerCase()!=='yes'){next[16]+=' | Voided bank import; bank removed this transaction. Original amount: '+r[9];next[9]=0;next[14]='No';}
      else {next[16]+=' | Bank removed this item; review existing accounting entry.';if(next[14]==='Pending at Chase')next[14]='No';}
      changes.set(i,next);
    });
  });
  return {changes:[...changes].map(([index,row])=>({index,row})),additions};
}
function importBankLedger_(book,bankRows) {
  const sheet=book.getSheetByName('Transactions-2026');
  if(!sheet)throw new Error('Transactions-2026 not found.');
  const all=sheet.getRange(1,1,sheet.getLastRow(),17).getValues();
  if(all[0][9]!=='Amount'||all[0][14]!=='Cleared'||all[0][16]!=='Note')throw new Error('Ledger columns changed; stopped to protect records.');
  const plan=bankLedgerPlan_(all.slice(1),bankRows,Utilities.formatDate(new Date(),'America/New_York','yyyy-MM-dd'));
  plan.changes.forEach(x=>{
    const n=x.index+2,old=all[n-1];
    if(String(old[14])!==String(x.row[14]))sheet.getRange(n,15).setValue(x.row[14]);
    if(String(old[16])!==String(x.row[16]))sheet.getRange(n,17).setValue(x.row[16]);
    if(String(old[16]).includes('[BANK-AUTO]')){sheet.getRange(n,1,1,4).setValues([x.row.slice(0,4)]);sheet.getRange(n,10).setValue(x.row[9]);}
  });
  let last=1;all.forEach((r,i)=>{if(r[0]||r[3])last=i+1;});
  plan.additions.forEach(r=>{
    const n=++last;
    if(n>sheet.getMaxRows())sheet.insertRowsAfter(sheet.getMaxRows(),100);
    sheet.getRange(n-1,1,1,17).copyTo(sheet.getRange(n,1,1,17),SpreadsheetApp.CopyPasteType.PASTE_FORMAT,false);
    sheet.getRange(n,1,1,17).setValues([r]);
    sheet.getRange(n,1).setNumberFormat('yyyy-mm-dd');
    sheet.getRange(n,11,1,2).setFormulas([['=IF(J'+n+'="","",J'+n+'+K'+(n-1)+')','=K'+n]]);
    sheet.getRange(n,18).setFormula('=IF(O'+n+'="Yes",IF(LEFT(M'+n+',8)="Transfer",0,J'+n+'),0)');
  });
  return {added:plan.additions.length,matched:plan.changes.length};
}
