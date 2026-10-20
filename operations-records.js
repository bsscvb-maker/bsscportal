/* Operations records stay in private Google Sheets, never in site source. */
(() => {
  const spreadsheet='1unxFrG3TJfEbJpucQVPveVO1y9NUTdboqhED2HMueV4';
  const tabs={accounts:{title:'Accounts & Access',range:"'Accounts & Access'!A1:G2000",gid:1777343977,host:'recordsWorkspace'},restricted:{title:'Restricted Members',range:"'Restricted Members'!A2:G2000",gid:1297188057,host:'recordsWorkspace'},patches:{title:'Patches',range:"'Patches'!A1:N2000",gid:506966162,host:'storageWorkspace'}};
  let version=0;
  const e=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  async function open(key){
    const tab=tabs[key],host=document.getElementById(tab.host),ticket=++version;
    host.innerHTML='<section class="workspace-card"><div class="club-toolbar"><button class="sponsor-tab" data-ops-back>Back</button><h2>'+e(tab.title)+'</h2><button class="sponsor-tab" data-ops-refresh>Refresh</button><a class="sponsor-tab" target="_blank" rel="noopener" href="https://docs.google.com/spreadsheets/d/'+spreadsheet+'/edit#gid='+tab.gid+'">Edit source</a></div><label>Search '+e(tab.title)+'<input type="search" data-ops-search style="width:100%;padding:12px;margin:12px 0" autocomplete="off"></label><p role="status" data-ops-status>Loading private records…</p><div data-ops-results></div></section>';
    host.querySelector('[data-ops-back]').onclick=()=>{++version;key==='patches'?renderStorage():recordsHome();};
    host.querySelector('[data-ops-refresh]').onclick=()=>open(key);
    const results=host.querySelector('[data-ops-results]'),status=host.querySelector('[data-ops-status]');
    try {
      if(!accessToken)throw new Error('Sign in with Google to view these records.');
      const raw=await getSheetValues(tab.range,spreadsheet);
      if(ticket!==version||!host.querySelector('[data-ops-results]'))return;
      let headers=raw[0]||[],rows=raw.slice(1).filter(r=>r.some(v=>v!==''&&v!=null));
      if(key==='patches'){
        rows=[0,3,6,9,12].flatMap(c=>raw.slice(1).filter(r=>r[c]!==''&&r[c]!=null).map(r=>[headers[c],r[c],r[c+1]??'']));
        headers=['Category','Patch','On Hand'];
      }
      const paint=()=>{
        const q=host.querySelector('[data-ops-search]').value.toLowerCase();
        const filtered=rows.filter(r=>r.some((v,i)=>!(key==='accounts'&&i===4)&&String(v??'').toLowerCase().includes(q)));
        status.textContent=filtered.length+' of '+rows.length+' records';
        results.innerHTML='<div class="table-wrap"><table class="data-table"><thead><tr>'+headers.map(h=>'<th>'+e(h)+'</th>').join('')+'</tr></thead><tbody>'+filtered.map(r=>'<tr>'+headers.map((h,i)=>{
          const value=r[i]??'';
          if(key==='accounts'&&i===4&&value)return '<td><details><summary>Show access details</summary><span style="white-space:pre-wrap">'+e(value)+'</span></details></td>';
          if(key==='accounts'&&i===2&&value){try{const u=new URL(/^https?:/.test(value)?value:'https://'+value);if(u.protocol==='https:')return '<td><a target="_blank" rel="noopener" href="'+e(u.href)+'">Open website</a></td>';}catch{}}
          return '<td style="white-space:pre-wrap;min-width:100px;max-width:360px;overflow-wrap:anywhere">'+e(value)+'</td>';
        }).join('')+'</tr>').join('')+'</tbody></table></div>'+(filtered.length?'':'<p>No matching records.</p>');
      };
      host.querySelector('[data-ops-search]').oninput=paint;paint();
    }catch(error){if(ticket===version)status.textContent='Unable to load private records. '+error.message+' Your Google account must have access to the source spreadsheet.';}
  }
  const originalRecords=renderRecordsDashboard;
  renderRecordsDashboard=function(){originalRecords.apply(this,arguments);const grid=document.querySelector('#recordsWorkspace .records-collections');if(!grid)return;
    ['accounts','restricted'].forEach(key=>{const b=document.createElement('button');b.className='collection-card records-dashboard-card';b.dataset.operations=key;b.innerHTML='<div class="dashboard-art" aria-hidden="true"><div class="dashboard-book"><small>BONESHAKERS<br>SOCIAL CLUB</small><strong>'+e(tabs[key].title)+'</strong><span>PRIVATE RECORDS</span></div></div><div class="dashboard-card-body"><h3>'+e(tabs[key].title)+'</h3><div class="dashboard-card-footer"><span>Google access required</span></div></div>';b.onclick=()=>open(key);grid.append(b);});
    [...grid.children].sort((a,b)=>a.querySelector('h3').textContent.localeCompare(b.querySelector('h3').textContent)).forEach(b=>grid.append(b));
  };
  const originalStorage=renderStorage;
  renderStorage=function(){originalStorage.apply(this,arguments);const host=document.getElementById('storageWorkspace');const b=document.createElement('button');b.className='open-btn';b.style.margin='0 0 16px';b.textContent='Patches — View Inventory';b.onclick=()=>open('patches');host.prepend(b);};
})();
