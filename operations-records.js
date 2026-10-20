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

/* Collections use the existing private Club Records index. */
(() => {
  const collections=new Set(['Corporate & Tax Documents','Club History','Ride Safety','Approved Artwork','Contracts & Agreements','Sponsorship Resources','Fund Requests','Financial Reports','Event Documents','Donation Evidence','Purchase Evidence']);
  const original=renderRecordCollection;
  renderRecordCollection=function(){
    if(!collections.has(recordsCategory))return original.apply(this,arguments);
    const host=document.getElementById('recordsWorkspace'),category=recordsCategory;
    const rows=(clubCache['Club Records']||[]).slice(1).map((v,i)=>({v,row:i+2})).filter(r=>r.v[0]&&r.v[2]===category);
    host.innerHTML='<nav class="minutes-breadcrumb"><button class="sponsor-tab" data-doc-back>Club Records</button><button class="sponsor-tab" data-doc-refresh>Refresh</button></nav><section class="records-hero"><div><h2>'+esc(category)+'</h2><p>Open the original document. Review labels identify historical records and copies requiring verification.</p></div></section><label>Search this collection<input data-doc-query type="search" style="width:100%;padding:12px;margin:12px 0" placeholder="Search titles and notes"></label><p data-doc-count role="status"></p><div class="records-card-grid" data-doc-results></div><div data-club-editor></div>';
    const paint=()=>{
      const q=host.querySelector('[data-doc-query]').value.toLowerCase();
      const selected=rows.filter(r=>[r.v[1],r.v[4],r.v[7]].join(' ').toLowerCase().includes(q));
      host.querySelector('[data-doc-count]').textContent=selected.length+' of '+rows.length+' documents';
      host.querySelector('[data-doc-results]').innerHTML=selected.map(({v,row})=>'<article class="record-card"><h3>'+esc(v[1])+'</h3><p><strong>'+esc(v[4]||'Needs review')+'</strong>'+(v[3]?' · '+esc(v[3]):'')+'</p><p style="white-space:pre-wrap;overflow-wrap:anywhere">'+esc(v[7]||'')+'</p><div class="record-card-actions">'+minutesDocumentLinks(v,parseMinutesNotes(v[7]))+'<button class="sponsor-tab" data-doc-edit="'+row+'">Edit record</button></div></article>').join('')||'<p>No matching documents.</p>';
      host.querySelectorAll('[data-doc-edit]').forEach(b=>b.onclick=()=>editClubRecord('records',Number(b.dataset.docEdit)));
    };
    host.querySelector('[data-doc-query]').oninput=paint;
    host.querySelector('[data-doc-back]').onclick=recordsHome;
    host.querySelector('[data-doc-refresh]').onclick=()=>loadClubFramework('records');paint();
  };
  function go(category){recordsDashboard=true;recordsCategory=category;clubFramework.records.active='Club Records';showModule('records');}
  const targets={
    financeWorkspace:[['Fund requests','Fund Requests'],['Donation evidence','Donation Evidence'],['Purchase evidence','Purchase Evidence'],['Financial reports','Financial Reports']],
    sponsorshipsNewWorkspace:[['Sponsorship resources','Sponsorship Resources'],['Corporate documents','Corporate & Tax Documents']],
    volunteersWorkspace:[['Event documents','Event Documents'],['Ride safety','Ride Safety']],
    bftWorkspace:[['Event documents','Event Documents']],
    storageWorkspace:[['Storage agreement and contracts','Contracts & Agreements']],
    marketplaceWorkspace:[['Artwork and production files','Approved Artwork']],
    membershipWorkspace:[['Ride safety and blank waiver','Ride Safety']]
  };
  function shortcuts(){
    for(const [id,links] of Object.entries(targets)){
      const host=document.getElementById(id);if(!host||host.querySelector('[data-record-shortcuts]'))continue;
      const bar=document.createElement('nav');bar.dataset.recordShortcuts='true';bar.className='club-toolbar';bar.setAttribute('aria-label','Related club documents');bar.style.cssText='display:flex;gap:8px;flex-wrap:wrap;margin:0 0 16px';
      links.forEach(([label,category])=>{const b=document.createElement('button');b.type='button';b.className='sponsor-tab';b.textContent=label;b.onclick=()=>go(category);bar.append(b);});host.prepend(bar);
    }
  }
  const shell=document.querySelector('.detail-shell');if(shell)new MutationObserver(shortcuts).observe(shell,{childList:true,subtree:true});shortcuts();
})();
