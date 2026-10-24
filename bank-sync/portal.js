/* BSSC bank sync UI. Only a short-lived signed-in Google token goes to the backend. */
(() => {
  const endpoint = 'https://script.google.com/macros/s/AKfycbx5xu4u1PfQnB_wtMFyh1Cu0HHgueUZRaVtBFR5m7fYmbo7NqLN8gZ_FIBuis0eY5j9/exec';
  const bar = document.createElement('div');
  bar.id = 'bankSyncActions';
  bar.innerHTML = '<div class="bank-sync-buttons"><button type="button" id="bankSyncNow">Sync</button><button type="button" id="bankFeedOpen">Chase activity</button></div><small id="bankSyncLast" role="status" aria-live="polite">Last sync: checking…</small>';
  const admin = document.getElementById('financeAdminToggle');
  admin.before(bar);
  bar.querySelector('.bank-sync-buttons').prepend(admin);
  const button = document.getElementById('bankSyncNow');
  const label = document.getElementById('bankSyncLast');
  let busy = false, lastSuccess = '';
  const style=document.createElement('style');
  style.textContent=`#bankSyncActions{display:none;margin-left:auto;text-align:right;max-width:440px}#bankSyncActions.visible{display:block}.bank-sync-buttons{display:flex;justify-content:flex-end;gap:8px}#bankSyncActions button{padding:11px 18px;border:2px solid #cf1235;background:#cf1235;color:white;border-radius:9px;font-weight:800;cursor:pointer}#bankSyncActions #bankFeedOpen{background:#181818;border-color:#555}#bankSyncActions button:disabled{opacity:.65;cursor:wait}#bankSyncLast{display:block;margin-top:7px;color:#ccc;font-size:.76rem;line-height:1.4}#bankSyncLast.error{color:#ff8e9d}.detail-head:has(#bankSyncActions.visible){flex-wrap:wrap;gap:12px}#bankSyncActions.visible~#financeAdminToggle{margin-left:0}@media(max-width:900px){body.portal-authenticated #bankSyncActions.visible~#financeAdminToggle{position:static!important}#bankSyncActions{max-width:100%;margin-left:0;text-align:left}.bank-sync-buttons{justify-content:flex-start}}`;
  document.head.append(style);
  style.textContent += '#bankSyncActions #bankSyncNow.success{background:#16783b;border-color:#219b50}#bankSyncLast.success{color:#7ee5a1}';
  style.textContent += '#bankSyncActions #financeAdminToggle{margin:0!important;position:static!important;min-height:0!important;padding:11px 18px!important;box-shadow:none}.bank-sync-buttons{flex-wrap:wrap}';
  function showTimestamp() {
    if (!lastSuccess || Number.isNaN(new Date(lastSuccess).getTime())) {button.classList.remove('success');label.classList.remove('success');label.textContent='No successful bank sync recorded';return;}
    const date=new Date(lastSuccess);
    label.textContent='LAST SYNC · '+date.toLocaleDateString('en-US',{timeZone:'America/New_York',weekday:'short',month:'long',day:'numeric',year:'numeric'})+' at '+date.toLocaleTimeString('en-US',{timeZone:'America/New_York',hour:'numeric',minute:'2-digit',second:'2-digit',timeZoneName:'short'});
    label.classList.remove('error');
    button.classList.add('success');label.classList.add('success');
  }
  async function readStatus() {
    if(!accessToken)return;
    try{const rows=await getSheetValues("'Bank Sync Status'!A2:B8",FINANCE_SPREADSHEET_ID);lastSuccess=rows.find(row=>row[0]==='Last successful sync')?.[1]||'';if(!busy)showTimestamp();}
    catch(error){if(!busy){button.classList.remove('success');label.classList.remove('success');label.textContent='Last sync unavailable';label.classList.add('error');}}
  }
  function visibility(){const visible=admin.classList.contains('visible');bar.classList.toggle('visible',visible);if(visible)readStatus();}
  new MutationObserver(visibility).observe(admin,{attributes:true,attributeFilter:['class']});
  visibility();
  button.addEventListener('click',async()=>{
    if(busy)return;
    if(!accessToken){label.textContent='Sign in to the portal first.';return;}
    busy=true;button.disabled=true;button.textContent='Syncing…';button.classList.remove('success');label.classList.remove('error','success');label.textContent='Updating Chase balances and bank activity…';
    try {
      const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'text/plain;charset=UTF-8'},body:JSON.stringify({action:'sync',token:accessToken}),redirect:'follow',signal:AbortSignal.timeout(120000)});
      if(!response.ok)throw new Error('Bank sync service could not be reached.');
      const result=await response.json();
      if(!result.ok)throw new Error(result.error||'Bank sync did not complete.');
      lastSuccess=result.lastSuccess;
      label.textContent='Chase import complete. Refreshing Reconciliation and Control 2026…';
      loadedFinanceTabs.clear();
      // One batch provides a consistent ledger and control snapshot and avoids
      // repeating the full ledger read for each dependent view after bank import.
      const [transactions,control,dashboard,priorYear]=await getSheetRanges([
        "'Transactions-2026'!A1:Q",
        "'Control-2026'!A1:H40",
        "'Dashboard-2026'!A1:AF80",
        "'Transactions-2025'!A1:P1000"
      ],FINANCE_SPREADSHEET_ID);
      if(!transactions?.length || !control?.length || !dashboard?.length)throw new Error('Chase imported, but the finance refresh returned incomplete data.');
      financePriorYearRows=priorYear||[];
      renderFinanceReconciliation(transactions);
      renderFinanceControl(control,transactions);
      renderFinanceDashboard(dashboard,control,transactions);
      ['reconciliation','control','dashboard'].forEach(key=>loadedFinanceTabs.add(key));
      const active=document.querySelector('[data-finance-tab].active')?.dataset.financeTab;
      if(active && !['reconciliation','control','dashboard'].includes(active))await loadFinanceTab(active,true);
      showTimestamp();
      const details=document.createElement('span');details.style.display='block';details.textContent='Reconciliation, Control 2026 and Dashboard refreshed. '+(result.ledgerAdded||0)+' new ledger entries; '+(result.ledgerMatched||0)+' linked. Posted entries await reconciliation review. '+(result.refreshStatus||'');label.append(details);
    }catch(error){button.classList.remove('success');label.classList.remove('success');label.textContent='Sync incomplete: '+error.message+(lastSuccess?' Last success: '+new Date(lastSuccess).toLocaleString('en-US',{timeZone:'America/New_York'}):'');label.classList.add('error');}
    finally{busy=false;button.disabled=false;button.textContent='Sync';}
  });
  document.getElementById('bankFeedOpen').addEventListener('click',async()=>{
    const dialog=document.createElement('dialog');dialog.className='bank-feed-dialog';dialog.style.cssText='width:min(1150px,94vw);max-height:88vh;background:#111;color:#fff;border:1px solid #555;border-radius:14px;padding:22px;';
    dialog.innerHTML='<div style="display:flex;justify-content:space-between;gap:20px"><h2>Chase activity</h2><button type="button" style="padding:8px 14px">Close</button></div><p>Imported bank activity. Pending items remain pending. Ledger categories and cleared flags are reviewed separately.</p><div class="bank-feed-content">Loading…</div>';
    document.body.append(dialog);dialog.querySelector('button').onclick=()=>dialog.close();dialog.addEventListener('close',()=>dialog.remove());dialog.showModal();
    const body=dialog.querySelector('.bank-feed-content');
    try{
      const rows=await getSheetValues("'Chase Bank Feed'!A1:K",FINANCE_SPREADSHEET_ID);
      const active=rows.slice(1).filter(row=>row[5]!=='Removed').sort((a,b)=>Date.parse(b[2])-Date.parse(a[2]));
      body.innerHTML='<div style="overflow:auto;max-height:60vh"><table style="width:100%;border-collapse:collapse"><thead><tr>'+['Date','Account','Description','Amount','Status'].map(x=>'<th style="padding:10px;text-align:left;border-bottom:1px solid #555">'+x+'</th>').join('')+'</tr></thead><tbody>'+active.map(row=>'<tr>'+[row[2],'…'+row[1],row[3],Number(row[4]).toLocaleString('en-US',{style:'currency',currency:row[8]||'USD'}),row[5]].map(x=>'<td style="padding:10px;border-bottom:1px solid #333">'+esc(String(x||''))+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>';
    }catch(error){body.textContent='Chase activity could not load. Try refreshing the portal.';}
  });
})();
