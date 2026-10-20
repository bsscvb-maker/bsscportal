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
/* Document cards and navigation. Document contents remain in private Drive. */
(() => {
  'use strict';
  const descriptions={
    'Corporate & Tax Documents':'Tax status, registrations, certificates, and organization records.',
    'Club History':'Founding records, past leadership, news coverage, and earlier programs.',
    'Ride Safety':'Incident procedures and blank forms for rides and guests.',
    'Approved Artwork':'Logo and patch references, production files, and ownership records.',
    'Contracts & Agreements':'Storage, media permissions, and partnership agreements.',
    'Sponsorship Resources':'Sponsor packets, outreach materials, pledge forms, and grant references.',
    'Fund Requests':'Funding request workflows and approval records.',
    'Financial Reports':'Year-end statements and historical financial reports.',
    'Event Documents':'Applications, event instructions, signups, and supporting event records.',
    'Donation Evidence':'Acknowledgments and payment documents supporting recorded assistance.',
    'Purchase Evidence':'Invoices and supplier documents supporting club purchases.',
    'Accounts & Access':'Private account details and access methods.',
    'Restricted Members':'Private restriction decisions and review information.',
    'Bylaws':'The club’s governing document.',
    'Archive':'Previous bylaws and operating documents.',
    'Operating Policies':'Procedures for the club’s day-to-day work.',
    'Code of Conduct':'Standards for conduct and representing the club.',
    'Forms and Tools':'Working forms, checklists, and reference templates.',
    'Minutes':'Meeting summaries and links to original minutes.',
    'Receipts':'Supporting receipts organized by program and year.',
    'Bikes for Tykes':'Program and fundraiser reference records.',
    'Committee records':'Committee planning and operating references.'
  };
  const arts={
    'Corporate & Tax Documents':'bylaws-official-v1.webp','Club History':'archive-records-v1.webp',
    'Ride Safety':'conduct-official-v1.webp','Approved Artwork':'operating-policies-v2.webp',
    'Contracts & Agreements':'bylaws-official-v1.webp','Sponsorship Resources':'committee-roundtable-v1.webp',
    'Fund Requests':'forms-tools-desk-v1.webp','Financial Reports':'receipts-desk-v1.webp',
    'Event Documents':'minutes-journal-v1.webp','Donation Evidence':'receipts-desk-v1.webp',
    'Purchase Evidence':'receipts-desk-v1.webp','Accounts & Access':'archive-records-v1.webp',
    'Restricted Members':'conduct-official-v1.webp','Bylaws':'bylaws-official-v1.webp',
    'Archive':'archive-records-v1.webp','Operating Policies':'operating-policies-v2.webp',
    'Code of Conduct':'conduct-official-v1.webp','Forms and Tools':'forms-tools-desk-v1.webp',
    'Minutes':'minutes-journal-v1.webp','Receipts':'receipts-desk-v1.webp',
    'Bikes for Tykes':'bikes-for-tykes-records-v2.webp','Committee records':'committee-roundtable-v1.webp'
  };
  const managed=new Set(Object.keys(descriptions).slice(0,11));
  const mimeTypes={"1HjwdQmtFSxGm2AvDzyo6QfAjyGsVzwZ9":"application/pdf","1YWv-OGgNZNpx7fJBYtqr4AKxXrHXk4ZU":"application/pdf","1RSutxT0tNItmtJzglJvGiBbdtmk3PC0P":"application/pdf","1hiIYLTO_2Q_hBzv6PMK1JBTCm55COJy8":"application/pdf","1NEoN-QE7ytkAJKr_Pn_N_HxvfcwH4AAp":"application/pdf","1c4oUvHQtfcXtrQoYcLoSEEd4OiBiRNfg":"application/pdf","1q6PlTazU38idB7mzQ_qp6n7bIzI3DlKN":"application/pdf","16NG18oMEwIwt9eWiUzur1ibjR6avx4fZ":"application/pdf","1Gukfugq7ysoa2wUUK9B9Te0P-OWW6LWp":"application/pdf","1pw_rnmSfUCHlTboy2BQ7yQmP8Ij-OiIo":"application/pdf","1g1sjXG5m5ujR_-y0ImqCrEZDIs37KCzX":"application/pdf","1rI4MX1afxJSZFXLRYnIyv0JctttwKDvH":"text/html","1bFfSAx_azwIQtr7PqgLqpcB90DjVwT8j":"application/vnd.openxmlformats-officedocument.presentationml.presentation","1vVohrx0qovNOsijpj3rnem4XaU21AlyW":"application/vnd.openxmlformats-officedocument.wordprocessingml.document","1dmhGOHc1rX771nogDARTY23fL3amkSC8":"application/vnd.openxmlformats-officedocument.wordprocessingml.document","1W0BYy8I6AU4dI0xSXjJC70FGbxLWx85t":"application/pdf","1s2g8gINDMXfojsnSsFgDkpQEpCc5WSRx":"application/pdf","1Sl54KL784t5com7mFaJr-8uSI0dnHCsK":"application/pdf","1wKA50KAUWIo_P9BbKcP7azNCGY99S7xL":"application/pdf","1jwwvsGEMgTNV1c8rjssisxs3704WZ_oD":"application/pdf","1J-7V9QYz_B5u1aQba9aceIJuwajnCouj":"application/pdf","1ZpsTmP-l_Cr27_fzGUVgZdsoypjHV2SX":"application/pdf","18cgSpRtMoo5368e8hf9Pkg680SCrj5Vf":"application/pdf","1KWndJUYg145N0MmEAZX90fHQAT7gMYIS":"application/vnd.openxmlformats-officedocument.wordprocessingml.document","1CKMT5ho5KW4QWiUfefwM3h99GyTcPXB5":"application/pdf","1ZBn14nVCv-It0dftg1iAeIby5y2i7B3w":"application/pdf","1yqIEVHjEaUW98s__JxcIn54Wn8t1l1E_":"application/pdf","1GDZyLsmQjSY74lI-KqFpk8xf9szSKCoD":"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet","1plh3eoqhZknnLLknAXQSH16h_ZEpRywa-SmF7XmgsR4":"application/vnd.google-apps.spreadsheet","1Zw6zIlT5_f06Xcovj-JqVGI-q_rZaRZHut3xGbv_DFk":"application/vnd.google-apps.spreadsheet","1NKBEbbRa_nSuDeL5c7Abe6p2lYS4474Hp5CEfaSS_dQ":"application/vnd.google-apps.spreadsheet","1BllO5dydFET5N_sW5MZ6PO2OoeJYo04L":"application/pdf","15zRbBWpPfqmqg6TNxSC2tojj0KncEF_-":"application/pdf","1kEOCSZ43Jhtuya6z09gwtoq_paC9Mpvw":"application/pdf","1d02_qC16wukcg5cuSU0EWttrV-IkuMVm":"application/pdf","1K8GoPo37Yk6H8BHMbhffZDpJ0LmdTWDMLggJGqicGh4":"application/vnd.google-apps.spreadsheet","1JS6_61jkJdB46WtN8jUrLyChI-b5UvFgR0RHMJuSwm0":"application/vnd.google-apps.spreadsheet","1gAGwPsup2WH_By4ae5dmp33IKZ8zVLTU":"application/pdf","1jn8W3m1yeczdlYHIpEc_f1g8Byc0PpNo":"application/pdf","1_QXfQyxD0JFuJUowD00PgxbtwqsOajd9":"application/pdf","1AatEiUG6qM02KmR2PK3v5TpwCXPpJusR":"application/pdf","18hvNcFZGYt0gGunG_itp4saArdbDmDAj":"application/pdf","1caO2trHHICvd9D7m8EsU7qBIs8Rw-DgU":"application/pdf","14s8kdjgiR6Z2-pXHHRtc6ySq2BWfyCYr":"application/pdf","1dwzORoUequwXh7BNo2ypPKucmljlaLCV":"application/pdf"};
  const mimeLabels={
    'application/pdf':'PDF','application/vnd.google-apps.document':'Google Doc',
    'application/vnd.google-apps.spreadsheet':'Google Sheet','application/vnd.google-apps.presentation':'Google Slides',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document':'Word',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':'Excel',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation':'PowerPoint','text/html':'HTML','text/plain':'Text'
  };
  const idOf=url=>String(url||'').match(/\/d\/([^/?#]+)/)?.[1]||'';
  function fileInfo(v){
    const url=clubSafeLink(v[6]),id=idOf(url),mime=mimeTypes[id]||(/\.pdf\b/i.test(v[1])?'application/pdf':'');
    const native={
      'application/vnd.google-apps.document':['document','docx','Word'],
      'application/vnd.google-apps.spreadsheet':['spreadsheets','xlsx','Excel'],
      'application/vnd.google-apps.presentation':['presentation','pptx','PowerPoint']
    }[mime];
    const download=id?(native?'https://docs.google.com/'+native[0]+'/d/'+encodeURIComponent(id)+(native[0]==='presentation'?'/export/'+native[1]:'/export?format='+native[1]):'https://drive.google.com/uc?export=download&id='+encodeURIComponent(id)):'';
    return {url,id,mime,label:mimeLabels[mime]||'Document',download,downloadLabel:native?'Download '+native[2]:'Download file'};
  }
  function purpose(v){
    const t=String(v[1]).toLowerCase();
    const rules=[
      [/501\(c\)\(3\)/,'IRS letter recognizing BSSC C3’s federal charitable tax exemption.'],
      [/501\(c\)\(7\)/,'Historical IRS determination for the former social-club organization.'],
      [/ein/,'Federal employer identification number confirmation for BSSC C3.'],
      [/incorporation/,'Certificate and filing records documenting the organization’s incorporation.'],
      [/good standing/,'Virginia certificate confirming corporate standing on its issue date.'],
      [/w-9/,'Taxpayer identification form for sponsors, vendors, and other requesters.'],
      [/sales tax/,'Virginia certificate used for eligible club purchases without sales tax.'],
      [/charitable registration/,'State charitable-registration correspondence for the club.'],
      [/charter.*photograph/,'Photograph of the original charter club in January 2005.'],
      [/news-herald/,'Historical newspaper coverage of BoneShakers Social Club.'],
      [/presidential/,'Saved reference covering the club’s past presidents.'],
      [/presentation.*2018/,'Historical presentation about the Bikes for Tykes program.'],
      [/incident response/,'Steps for responding to a ride incident, notifying officers, and keeping records.'],
      [/incident documentation/,'Blank form for recording the facts and supporting details of a ride incident.'],
      [/guest ride waiver/,'Printable guest waiver reference for club rides.'],
      [/production handoff/,'Artwork and production guidance for the specified club patch.'],
      [/copyright assignment/,'Document transferring rights in the club logo artwork.'],
      [/big lick artwork/,'Big Lick design reference for reviewing artwork and production.'],
      [/patch artwork/,'Reference artwork for club patch design and production.'],
      [/cubesmart/,'Storage rental terms and agreement for the club’s storage unit.'],
      [/nexstar/,'Agreement covering Nexstar’s use of submitted club media content.'],
      [/partnership agreement/,'Reference agreement for fundraising arrangements with outside partners.'],
      [/sponsorship packet/,'Sponsor introduction and partnership information from the August 2026 packet.'],
      [/impact.*flyer/,'Outreach flyer describing the club’s community impact and sponsorship opportunities.'],
      [/pledge/,'Form for recording a sponsor’s proposed support or commitment.'],
      [/walmart spark/,'Saved grant-application reference for Walmart Spark.'],
      [/fund request/,'Existing funding-request workbook. Its role in the current workflow needs confirmation.'],
      [/2025 income/,'Historical report of club income and expenses for 2025.'],
      [/2024 year-end/,'Historical financial statement for the 2024 reporting year.'],
      [/holiday parade/,'Parade application and participant guidelines for the 2026 holiday event.'],
      [/silent.auction bid/,'Completed bid sheets supporting the October 2026 auction results.'],
      [/honoring jr donation tracker/,'Historical donation-tracking workbook for the Honoring JR event.'],
      [/potluck/,'Biker Bash food, supply, and participant signup records.'],
      [/mutts/,'Acknowledgment of the club’s $1,300 donation to Mutts With a Mission.'],
      [/utility assistance/,'Receipt for the community utility-assistance payment recorded March 5, 2026.'],
      [/cashier check/,'Bank customer copy supporting the named JR benefit payout.'],
      [/sanmar/,'Supplier order showing 225 shirts purchased for the JR benefit.'],
      [/statement 881321/,'Scanned supplier statement for officer and year patches.']
    ];
    return rules.find(([r])=>r.test(t))?.[1]||descriptions[v[2]]||'Original club document and supporting reference.';
  }
  const style=document.createElement('style');
  style.textContent=`
  #recordsWorkspace .records-dashboard-cards{grid-template-columns:repeat(auto-fit,minmax(260px,1fr));align-items:stretch;gap:18px}
  #recordsWorkspace .records-dashboard-card{display:flex!important;flex-direction:column;min-width:0;text-align:left;border-radius:13px;background:#e6e9ec!important;border:1px solid #b8bec6!important;order:0!important}
  #recordsWorkspace .records-dashboard-card .dashboard-art{height:180px!important;min-height:180px;border:0!important;background:#2d211b!important;width:100%;position:relative}
  #recordsWorkspace .records-dashboard-card .dashboard-art:after{display:none}
  #recordsWorkspace .records-dashboard-card .dashboard-art img{width:100%;height:100%;object-fit:cover;display:block}
  #recordsWorkspace .records-dashboard-card .dashboard-card-body{padding:18px!important;display:flex!important;flex-direction:column;flex:1;min-height:162px}
  #recordsWorkspace .records-dashboard-card h3{font-size:22px!important;line-height:1.2;color:#191a1e!important;margin:0 0 10px!important}
  #recordsWorkspace .records-dashboard-card .rx-description{font-size:14px;line-height:1.5;color:#3c4149;margin:0 0 12px;display:block}
  #recordsWorkspace .records-dashboard-card .dashboard-card-footer{margin-top:auto;color:#4a4f59;gap:10px;font-size:13px}
  #recordsWorkspace .records-dashboard-card .dashboard-card-footer b{color:#a00927}
  .rx-toolbar{display:flex;gap:12px;flex-wrap:wrap;align-items:end;margin:18px 0}.rx-toolbar label{display:grid;gap:6px;font-weight:700;color:#252830}.rx-toolbar input,.rx-toolbar select{font:inherit;padding:11px 12px;border:1px solid #aeb5bf;border-radius:8px;background:#fff;color:#1d232b}.rx-toolbar .rx-search{flex:1;min-width:200px}
  #recordsWorkspace .rx-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:18px;align-items:stretch}
  #recordsWorkspace .rx-card{padding:0!important;overflow:hidden;display:flex;flex-direction:column;border:1px solid #bcc3cc;border-radius:12px;background:#f4f5f6!important;color:#20252d!important}
  .rx-document-art{padding:18px;background:linear-gradient(135deg,#d8dde2,#eceff1);border-bottom:1px solid #c5cbd2;display:flex;align-items:center;gap:15px;min-height:116px}
  .rx-sheet{width:60px;height:76px;background:#fff;border:1px solid #bcc3cc;border-radius:4px 14px 4px 4px;box-shadow:3px 4px 0 #afb8c34d;display:flex;flex-direction:column;justify-content:center;padding:10px;flex-shrink:0;gap:6px}.rx-sheet i{height:3px;background:#d6dbe1;display:block}.rx-sheet i:first-child{height:8px;background:#a4102d;width:75%}
  .rx-document-art strong{font-size:14px;line-height:1.4;color:#252b33}.rx-document-art small{display:block;margin-top:5px;color:#4a5563;font-size:12px}
  .rx-card-body{padding:18px;display:flex;flex-direction:column;flex:1;gap:12px}.rx-card-body h3{margin:0!important;font-size:19px!important;line-height:1.35;color:#1d232b!important}.rx-card-body p{margin:0!important;line-height:1.55;color:#424a56!important;font-size:14px}.rx-card-body details{font-size:13px;line-height:1.5;color:#505965}.rx-card-body summary{cursor:pointer;font-weight:700}.rx-card-body details p{margin-top:8px!important;white-space:pre-wrap;font-size:13px}.rx-card-body .record-chip{align-self:start}.rx-card-actions{display:flex;gap:9px;flex-wrap:wrap;margin-top:auto;padding-top:8px}.rx-card-actions a,.rx-card-actions button{font:700 14px/1.2 Arial,sans-serif;text-decoration:none;border-radius:7px;padding:11px 13px;cursor:pointer}.rx-primary{background:#ae1231;color:white!important;border:1px solid #ae1231}.rx-secondary{background:#fff;color:#282e38!important;border:1px solid #aeb7c3}.rx-edit{background:transparent;color:#46515d;border:0;font-size:12px!important;padding-left:0!important}
  .rx-dialog{width:min(1100px,96vw);height:92vh;padding:0;border:1px solid #7b8797;border-radius:12px;background:#eff1f3;color:#1d232b}.rx-dialog::backdrop{background:#000b}.rx-preview-head{display:flex;justify-content:space-between;align-items:center;gap:14px;padding:16px;border-bottom:1px solid #c5cbd2}.rx-preview-head h2{font-size:19px;margin:0}.rx-preview-actions{display:flex;gap:8px;flex-wrap:wrap;padding:12px 16px}.rx-preview-actions a,.rx-preview-actions button{padding:10px 12px;text-decoration:none;border-radius:7px;font:700 14px Arial,sans-serif}.rx-dialog iframe{width:100%;height:calc(100% - 170px);border:0;background:#fff}.rx-preview-help{font:13px Arial,sans-serif;margin:0;padding:0 16px 12px;color:#515a68}
  #recordsWorkspace [hidden]{display:none!important}@media(max-width:600px){#recordsWorkspace .records-dashboard-cards,#recordsWorkspace .rx-grid{grid-template-columns:1fr}.rx-toolbar label{width:100%}.rx-dialog{height:94vh;width:98vw}.rx-preview-head h2{font-size:16px}}
  `;
  document.head.append(style);
  function preview(v){
    const f=fileInfo(v);if(!f.id){window.open(f.url,'_blank','noopener');return;}
    document.querySelector('.rx-dialog')?.remove();
    const dialog=document.createElement('dialog');dialog.className='rx-dialog';
    dialog.innerHTML='<header class="rx-preview-head"><h2>'+esc(v[1])+'</h2><button type="button" class="rx-secondary" data-preview-close aria-label="Close document preview">Close</button></header><div class="rx-preview-actions"><a class="rx-secondary" href="'+esc(f.url)+'" target="_blank" rel="noopener">Open in Drive</a><a class="rx-primary" href="'+esc(f.download)+'" target="_blank" rel="noopener">'+esc(f.downloadLabel)+'</a></div><p class="rx-preview-help">Use your authorized Google account. If preview or download is unavailable, open the document in Drive.</p><iframe title="'+esc(v[1])+' preview" src="https://drive.google.com/file/d/'+encodeURIComponent(f.id)+'/preview" allow="fullscreen"></iframe>';
    document.body.append(dialog);dialog.querySelector('[data-preview-close]').onclick=()=>dialog.close();dialog.addEventListener('close',()=>dialog.remove());dialog.showModal();
  }
  const priorDashboard=renderRecordsDashboard;
  renderRecordsDashboard=function(){
    priorDashboard.apply(this,arguments);
    const host=document.getElementById('recordsWorkspace'),grid=host.querySelector('.records-dashboard-cards');if(!grid)return;
    [...grid.children].forEach(card=>{
      const label=card.querySelector('h3')?.textContent?.trim();if(!label)return;
      const art=card.querySelector('.dashboard-art'),file=arts[label]||'archive-records-v1.webp';
      if(art)art.innerHTML='<img src="assets/club-records/'+file+'" alt="" loading="lazy" decoding="async">';
      const body=card.querySelector('.dashboard-card-body');if(!body)return;
      const p=document.createElement('p');p.className='rx-description';p.textContent=descriptions[label]||'Club documents and original reference files.';body.querySelector('h3').after(p);
      const footer=body.querySelector('.dashboard-card-footer');if(footer){const b=document.createElement('b');b.textContent='Open collection →';footer.append(b);}
      card.dataset.collectionTitle=label.toLowerCase();card.setAttribute('aria-label','Open '+label);
    });
    const toolbar=document.createElement('div');toolbar.className='rx-toolbar';toolbar.innerHTML='<label class="rx-search">Find a collection<input type="search" placeholder="Search records, tax, safety, artwork…" data-collection-find></label>';
    grid.before(toolbar);toolbar.querySelector('input').oninput=event=>{const q=event.target.value.toLowerCase().trim();[...grid.children].forEach(c=>c.hidden=!c.textContent.toLowerCase().includes(q));};
  };
  const priorCollection=renderRecordCollection;
  renderRecordCollection=function(){
    if(!managed.has(recordsCategory))return priorCollection.apply(this,arguments);
    const host=document.getElementById('recordsWorkspace'),category=recordsCategory;
    const rows=(clubCache['Club Records']||[]).slice(1).map((v,i)=>({v,row:i+2})).filter(r=>r.v[0]&&r.v[2]===category);
    host.innerHTML='<nav class="minutes-breadcrumb"><button class="sponsor-tab" data-doc-back>← Club Records</button><button class="sponsor-tab" data-doc-refresh>Refresh</button></nav><section class="records-hero"><div><h2>'+esc(category)+'</h2><p style="display:block">'+esc(descriptions[category])+'</p></div></section><div class="rx-toolbar"><label class="rx-search">Find a document<input data-doc-query type="search" placeholder="Search titles, descriptions, or notes"></label><label>Status<select data-doc-status><option value="">All statuses</option>'+[...new Set(rows.map(r=>r.v[4]||'Needs review'))].sort().map(s=>'<option>'+esc(s)+'</option>').join('')+'</select></label><label>Sort<select data-doc-sort><option value="title">Title A–Z</option><option value="newest">Newest date first</option><option value="oldest">Oldest date first</option></select></label></div><p data-doc-count role="status"></p><div class="rx-grid" data-doc-results></div><div data-club-editor></div>';
    const paint=()=>{
      const q=host.querySelector('[data-doc-query]').value.trim().toLowerCase(),status=host.querySelector('[data-doc-status]').value,sort=host.querySelector('[data-doc-sort]').value;
      const selected=rows.filter(({v})=>(!status||(v[4]||'Needs review')===status)&&[v[1],v[7],purpose(v)].join(' ').toLowerCase().includes(q)).sort((a,b)=>{
        if(sort==='title')return String(a.v[1]).localeCompare(String(b.v[1]),undefined,{numeric:true});
        if(!a.v[3])return b.v[3]?1:0;if(!b.v[3])return -1;
        return sort==='newest'?String(b.v[3]).localeCompare(a.v[3]):String(a.v[3]).localeCompare(b.v[3]);
      });
      host.querySelector('[data-doc-count]').textContent=selected.length+' of '+rows.length+' documents';
      host.querySelector('[data-doc-results]').innerHTML=selected.map(({v,row})=>{
        const f=fileInfo(v),state=String(v[4]||'Needs review'),chip=state==='Needs review'?'review':state.toLowerCase();
        return '<article class="rx-card"><div class="rx-document-art" aria-hidden="true"><span class="rx-sheet"><i></i><i></i><i></i><i></i></span><div><strong>'+esc(f.label)+'</strong><small>'+esc(category)+'</small></div></div><div class="rx-card-body"><span class="record-chip '+esc(chip)+'">'+esc(state)+'</span><h3>'+esc(v[1])+'</h3><p>'+esc(purpose(v))+'</p>'+(v[3]?'<p><strong>Document date:</strong> '+esc(v[3])+'</p>':'')+(v[7]?'<details><summary>Record details</summary><p>'+esc(v[7])+'</p></details>':'')+'<div class="rx-card-actions">'+(f.url?'<button class="rx-primary" type="button" data-doc-view="'+row+'" aria-label="View '+esc(v[1])+'">View document</button>':'')+(f.download?'<a class="rx-secondary" href="'+esc(f.download)+'" target="_blank" rel="noopener" aria-label="'+esc(f.downloadLabel+' — '+v[1])+'">'+esc(f.downloadLabel)+'</a>':'')+'</div><button class="rx-edit" type="button" data-doc-edit="'+row+'">Edit record</button></div></article>';
      }).join('')||'<div class="workspace-card"><h3>No matching documents</h3><p>Try a shorter search or choose All statuses.</p></div>';
      host.querySelectorAll('[data-doc-edit]').forEach(b=>b.onclick=()=>editClubRecord('records',Number(b.dataset.docEdit)));
      host.querySelectorAll('[data-doc-view]').forEach(b=>b.onclick=()=>preview(rows.find(r=>r.row===Number(b.dataset.docView)).v));
    };
    host.querySelector('[data-doc-query]').oninput=paint;host.querySelector('[data-doc-status]').onchange=paint;host.querySelector('[data-doc-sort]').onchange=paint;
    host.querySelector('[data-doc-back]').onclick=recordsHome;host.querySelector('[data-doc-refresh]').onclick=()=>loadClubFramework('records');paint();
  };
})();

