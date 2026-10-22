/* Operations records stay in private Google Sheets, never in site source. */
(() => {
  const spreadsheet='1unxFrG3TJfEbJpucQVPveVO1y9NUTdboqhED2HMueV4';
  const tabs={accounts:{title:'Accounts & Access',range:"'Accounts & Access'!A1:G2000",gid:1777343977,host:'recordsWorkspace'},restricted:{title:'Restricted Members',range:"'Restricted Members'!A2:G2000",gid:1297188057,host:'recordsWorkspace'},patches:{title:'Patches',range:"'Patches'!A1:N2000",gid:506966162,host:'storageWorkspace'}};
  let version=0;
  const e=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  async function openAccounts(){
    const host=document.getElementById('recordsWorkspace'),ticket=++version;
    host.innerHTML=`<style>
      .aa-shell{background:#101010;color:#fff;border:1px solid #393939;border-radius:18px;padding:clamp(16px,3vw,30px)}
      .aa-shell h2,.aa-shell h3{color:#fff;margin:0 0 10px}.aa-shell p{color:#d0d0d0}.aa-top,.aa-actions{display:flex;gap:10px;flex-wrap:wrap;align-items:center}.aa-top h2{flex:1}.aa-shell button,.aa-shell a.aa-button{background:#252525;color:#fff;border:1px solid #777;border-radius:8px;padding:11px 16px;cursor:pointer;text-decoration:none;font:inherit}.aa-shell .aa-primary{background:#b01d26;border-color:#ed6972}.aa-shell button:disabled{opacity:.55;cursor:wait}.aa-shell input,.aa-shell textarea{box-sizing:border-box;width:100%;background:#fff;color:#161616;border:1px solid #aaa;border-radius:8px;padding:12px;font:inherit}.aa-search{display:block;margin:22px 0 12px}.aa-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,310px),1fr));gap:16px}.aa-card{min-width:0;background:#1e1e1e;border:1px solid #444;border-top:4px solid #c42330;border-radius:12px;padding:20px;overflow-wrap:anywhere}.aa-card dl{margin:16px 0}.aa-card dt{font-size:.82rem;color:#aaa;margin-top:12px}.aa-card dd{margin:4px 0;white-space:pre-wrap}.aa-shell .aa-remove{color:#ffabb1;border-color:#99555a}.aa-editor{background:#171717;color:#fff;border:1px solid #777;border-radius:14px;width:min(620px,calc(100% - 32px));max-height:85vh;padding:24px;box-sizing:border-box}.aa-editor::backdrop{background:#000b}.aa-editor label{display:block;margin:14px 0}.aa-editor input,.aa-editor textarea{width:100%;box-sizing:border-box;padding:10px;font:inherit}.aa-editor h3{color:#fff}.aa-editor button{padding:10px 15px;margin-right:8px;cursor:pointer}.aa-message{min-height:24px}.aa-card summary{cursor:pointer;color:#fff;padding:6px 0}
    </style><section class="aa-shell"><div class="aa-top"><button data-back>← Club Records</button><h2>Accounts & Access</h2><button data-refresh>Refresh</button><button class="aa-primary" data-add disabled>+ Add account</button></div><p>Find a club account, open its website, or manage its access information.</p><label class="aa-search">Find an account<input type="search" data-search placeholder="Search account, contact, or notes" autocomplete="off"></label><p class="aa-message" role="status" aria-live="polite" data-status>Loading private accounts…</p><div class="aa-grid" data-cards></div><dialog class="aa-editor" data-editor></dialog></section>`;
    host.querySelector('[data-back]').onclick=()=>{++version;recordsHome();};
    host.querySelector('[data-refresh]').onclick=openAccounts;
    const status=host.querySelector('[data-status]'),grid=host.querySelector('[data-cards]'),dialog=host.querySelector('[data-editor]');
    let headers=[],records=[],busy=false,selectedWebsite=null;
    const current=()=>ticket===version&&host.contains(grid);
    const normalize=r=>Array.from({length:7},(_,i)=>String(r[i]??''));
    const base='https://sheets.googleapis.com/v4/spreadsheets/'+spreadsheet;
    async function load(){
      if(!accessToken)throw new Error('Use the portal’s Google sign-in, then select Refresh.');
      const raw=await getSheetValues("'Accounts & Access'!A1:G",spreadsheet);
      if(!current())return;
      if(!raw.length||!raw[0].some(Boolean))throw new Error('The account sheet has no column headings. Open the source sheet to check its setup.');
      headers=Array.from({length:7},(_,i)=>raw[0][i]||'Field '+(i+1));
      records=raw.slice(1).map((v,i)=>({row:i+2,v:normalize(v)})).filter(r=>r.v.some(Boolean));
      host.querySelector('[data-add]').disabled=false;paint();
    }
    function websiteKey(record){
      const value=record.v[2].trim();
      try{
        const url=new URL(/^https?:\/\//i.test(value)?value:'https://'+value);
        if(value&&['http:','https:'].includes(url.protocol)&&url.hostname)return url.hostname.toLowerCase().replace(/^www\./,'');
      }catch{}
      return 'record:'+record.row;
    }
    function accountCard(r,insideGroup=false){
      let link='';try{const u=new URL(/^https?:\/\//i.test(r.v[2])?r.v[2]:'https://'+r.v[2]);if(r.v[2]&&['https:','http:'].includes(u.protocol))link='<a class="aa-button" target="_blank" rel="noopener noreferrer" href="'+e(u.href)+'">Open website ↗</a>';}catch{}
      const title=insideGroup?(r.v[3]||r.v[1]||r.v[0]||'Account'):(r.v[0]||r.v[1]||'Untitled account');
      const body='<dl>'+headers.map((h,i)=>!r.v[i]||i===0?'':'<dt>'+e(h)+'</dt><dd>'+(i===4?'<details><summary>Show access details</summary><span>'+e(r.v[i])+'</span></details>':e(r.v[i]))+'</dd>').join('')+'</dl><div class="aa-actions">'+link+'<button data-edit="'+r.row+'">Edit</button></div>';
      return '<article class="aa-card">'+(insideGroup?'<details><summary><strong>'+e(title)+'</strong></summary>'+body+'</details>':'<h3>'+e(title)+'</h3>'+body)+'</article>';
    }
    function paint(){
      const q=host.querySelector('[data-search]').value.trim().toLowerCase();
      const groups=new Map();
      records.forEach(r=>{const key=websiteKey(r);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(r);});
      const matches=r=>r.v.some((v,i)=>i!==4&&v.toLowerCase().includes(q));
      if(selectedWebsite&&!groups.has(selectedWebsite))selectedWebsite=null;
      if(selectedWebsite){
        const group=groups.get(selectedWebsite),list=group.filter(matches).sort((a,b)=>(a.v[3]||a.v[1]).localeCompare(b.v[3]||b.v[1]));
        status.innerHTML='<button data-websites>← All websites</button> <strong>'+e(selectedWebsite)+'</strong> · '+list.length+' of '+group.length+' logins';
        status.querySelector('[data-websites]').onclick=()=>{selectedWebsite=null;paint();};
        grid.innerHTML=list.map(r=>accountCard(r,true)).join('')||'<p>No logins match your search.</p>';
      }else{
        const list=[...groups.entries()].filter(([,rs])=>rs.some(matches)).sort(([a,ar],[b,br])=>(a.startsWith('record:')?ar[0].v[0]:a).localeCompare(b.startsWith('record:')?br[0].v[0]:b));
        status.textContent=list.length+' website cards · '+records.length+' accounts';
        grid.innerHTML=list.map(([key,rs])=>rs.length===1?accountCard(rs[0]):'<article class="aa-card"><h3>'+e(key)+'</h3><p>'+rs.length+' logins</p><div class="aa-actions"><button data-website="'+e(key)+'">View accounts →</button></div></article>').join('')||'<p>'+(records.length?'No accounts match your search.':'No accounts yet. Select Add account to get started.')+'</p>';
        grid.querySelectorAll('[data-website]').forEach(b=>b.onclick=()=>{selectedWebsite=b.dataset.website;paint();});
      }
      grid.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>edit(records.find(r=>r.row===Number(b.dataset.edit))));
    }
    async function verify(record){
      const fresh=await getSheetValues("'Accounts & Access'!A"+record.row+':G'+record.row,spreadsheet);
      if(JSON.stringify(normalize(fresh[0]||[]))!==JSON.stringify(record.v))throw new Error('This account changed since it was loaded. Refresh and try again.');
    }
    function edit(record){
      if(busy)return;
      dialog.innerHTML='<form><h3>'+ (record?'Edit account':'Add account')+'</h3><p>Changes save to the club’s private account sheet.</p>'+headers.map((h,i)=>'<label>'+e(h)+(i===4?' (private)':'')+(i===0?' *':'')+'<'+(i>=5?'textarea':'input')+' name="field'+i+'" '+(i===0?'required ':'')+(i===4?'type="password" autocomplete="new-password"':'autocomplete="off"')+'>'+(i>=5?e(record?.v[i]||'')+'</textarea>':'')+'</label>').join('')+'<p role="status" data-form-status></p><button type="submit">Save account</button><button type="button" data-cancel>Cancel</button>'+(record?'<button type="button" data-delete style="color:#a00016">Delete account</button>':'')+'</form>';
      headers.forEach((_,i)=>{dialog.querySelector('[name="field'+i+'"]').value=record?.v[i]||'';});
      dialog.querySelector('[data-cancel]').onclick=()=>dialog.close();
      if(record)dialog.querySelector('[data-delete]').onclick=()=>remove(record);
      dialog.querySelector('form').onsubmit=async event=>{
        event.preventDefault();if(busy)return;
        const values=headers.map((_,i)=>dialog.querySelector('[name="field'+i+'"]').value);
        if(!values[0].trim()){dialog.querySelector('[data-form-status]').textContent='Enter an account name.';return;}
        busy=true;dialog.querySelectorAll('button').forEach(b=>b.disabled=true);
        const preventClose=ev=>ev.preventDefault();dialog.addEventListener('cancel',preventClose);
        try{
          if(!accessToken)throw new Error('Sign in with Google again before saving.');
          if(record)await verify(record);
          const range="'Accounts & Access'!"+(record?'A'+record.row+':G'+record.row:'A:G');
          const url=base+'/values/'+encodeURIComponent(range)+(record?'?valueInputOption=RAW':':append?valueInputOption=RAW&insertDataOption=INSERT_ROWS');
          await writePortalSheetRequest(url,{method:record?'PUT':'POST',headers:{Authorization:'Bearer '+accessToken,'Content-Type':'application/json'},body:JSON.stringify({values:[values]}),signal:AbortSignal.timeout(20000)},record?'Edited private account':'Added private account','Accounts & Access',1);
          dialog.close();await load();if(current())status.textContent='Account saved. '+records.length+' accounts.';
        }catch(error){dialog.querySelector('[data-form-status]').textContent='Could not finish: '+error.message+' Refresh before retrying to check whether the save completed.';}
        finally{busy=false;dialog.removeEventListener('cancel',preventClose);dialog.querySelectorAll('button').forEach(b=>b.disabled=false);}
      };
      dialog.showModal();
    }
    async function remove(record){
      if(busy||!confirm('Remove “'+(record.v[0]||record.v[1]||'this account')+'” from Accounts & Access?\n\nThis deletes its saved information from the club sheet. It does not close the actual account or revoke anyone’s access to that service.'))return;
      busy=true;dialog.querySelectorAll('button').forEach(b=>b.disabled=true);const preventClose=ev=>ev.preventDefault();dialog.addEventListener('cancel',preventClose);status.textContent='Removing account…';
      try{
        if(!accessToken)throw new Error('Sign in with Google again before removing an account.');
        await verify(record);
        await writePortalSheetRequest(base+'/values:batchClear',{method:'POST',headers:{Authorization:'Bearer '+accessToken,'Content-Type':'application/json'},body:JSON.stringify({ranges:["'Accounts & Access'!A"+record.row+':G'+record.row]}),signal:AbortSignal.timeout(20000)},'Removed private account','Accounts & Access',1);
        dialog.close();await load();if(current())status.textContent='Account removed. '+records.length+' accounts remain.';
      }catch(error){if(current())status.textContent='Could not finish removing: '+error.message+' Refresh to check the current records.';if(dialog.open)dialog.querySelector('[data-form-status]').textContent='Could not delete: '+error.message;}
      finally{busy=false;dialog.removeEventListener('cancel',preventClose);dialog.querySelectorAll('button').forEach(b=>b.disabled=false);}
    }
    host.querySelector('[data-search]').oninput=paint;
    host.querySelector('[data-add]').onclick=()=>edit(null);
    try{await load();}catch(error){if(current()){status.textContent='Unable to load accounts. '+error.message;grid.innerHTML='<a class="aa-button" target="_blank" rel="noopener" href="https://docs.google.com/spreadsheets/d/'+spreadsheet+'/edit#gid=1777343977">Open source sheet ↗</a>';}}
  }

  async function openRestricted(){
    const host=document.getElementById('recordsWorkspace'),ticket=++version;
    host.innerHTML=`<style>
      .rm-shell{background:#141416;color:#f7f7f8;border:1px solid #48484e;border-radius:18px;overflow:hidden}
      .rm-head{padding:26px;background:#300d15;border-top:6px solid #e22246}.rm-kicker{font-size:12px;font-weight:800;letter-spacing:.12em;color:#ffb9c5}.rm-head h2{font-size:clamp(26px,3vw,38px);color:#fff;margin:10px 0}.rm-head p{color:#f4d4da;max-width:850px;line-height:1.6;margin:8px 0}
      .rm-toolbar{display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-bottom:22px}.rm-shell button,.rm-shell a.rm-button{background:#29292e;color:#fff;border:1px solid #73737d;border-radius:9px;padding:10px 15px;font:inherit;text-decoration:none;cursor:pointer}
      .rm-warning{padding:16px 20px;border:1px solid #d9516b;background:#43131f;border-radius:10px;margin-top:20px;color:#fff;line-height:1.5}
      .rm-body{padding:24px}.rm-counts{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:22px}.rm-counts span{padding:12px 16px;border-radius:10px;background:#25252b;border:1px solid #51515b;color:#eee}.rm-counts strong{font-size:24px;margin-right:8px}
      .rm-controls{display:flex;gap:14px;align-items:end;flex-wrap:wrap}.rm-controls label{display:block;flex:1;min-width:200px;color:#eee;font-weight:700}.rm-controls input,.rm-controls select{display:block;width:100%;box-sizing:border-box;padding:13px;background:#fff;color:#171719;border:1px solid #aaa;border-radius:8px;margin-top:8px;font:inherit}
      .rm-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,380px),1fr));gap:18px}.rm-card{padding:22px;border:1px solid #6b3b47;border-left:6px solid #ef3d60;border-radius:12px;background:#221a1e;min-width:0;overflow-wrap:anywhere}.rm-card.conditional{border-color:#806132;border-left-color:#edb146;background:#252018}
      .rm-card.cleared{border-color:#47715e;border-left-color:#70c49c;background:#18251f}.cleared .rm-directive{color:#b5efd2}.cleared .rm-badge{background:#153d2b;color:#d7ffe9;border-color:#70c49c}.rm-badge{display:inline-block;border:1px solid #ef718a;background:#58182a;color:#ffe5eb;font-size:12px;font-weight:850;letter-spacing:.04em;border-radius:6px;padding:7px 10px}.conditional .rm-badge{background:#503b12;color:#ffe8ae;border-color:#d6a647}
      .rm-card h3{font-size:25px;color:#fff;margin:18px 0 9px;line-height:1.25}.rm-directive{font-size:17px;font-weight:800;color:#ffb9c8;margin:0 0 20px}.conditional .rm-directive{color:#ffe1a1}
      .rm-card dl{margin:0}.rm-card dt{font-size:12px;letter-spacing:.04em;text-transform:uppercase;font-weight:750;color:#c6bdc1;margin-top:17px}.rm-card dd{color:#fff;margin:6px 0;line-height:1.55;white-space:pre-wrap}.rm-card details{margin-top:18px;border-top:1px solid #66515a;padding-top:14px}.rm-card summary{cursor:pointer;font-weight:700;color:#eee}.rm-status{color:#d0ccd1;margin:18px 0}.rm-empty{color:#eee;padding:20px}.rm-confidential{font-size:12px;color:#c9bac0!important;margin-top:18px!important}
      .rm-edit-actions{margin-top:20px;display:flex;justify-content:flex-end}.rm-name-editor{width:min(520px,calc(100% - 32px));box-sizing:border-box;max-height:85vh;overflow:auto;background:#19191d;color:#fff;border:1px solid #777;border-radius:14px;padding:24px}.rm-name-editor::backdrop{background:#000b}.rm-name-editor h3{color:#fff;margin-top:0}.rm-name-editor label{display:block;margin:16px 0;font-weight:700}.rm-name-editor input,.rm-name-editor select,.rm-name-editor textarea{display:block;width:100%;box-sizing:border-box;margin-top:8px;padding:12px;background:#fff;color:#171719;border:1px solid #aaa;border-radius:8px;font:inherit}.rm-name-editor button{padding:11px 16px;border-radius:8px;border:1px solid #777;background:#29292e;color:#fff;font:inherit;cursor:pointer}.rm-name-editor button[type=submit]{background:#a92039;border-color:#ef718a}.rm-name-editor button:disabled{opacity:.55;cursor:wait}.rm-name-editor .rm-edit-help{font-size:13px;color:#d0ccd1;line-height:1.5}.rm-name-editor .rm-remove{color:#ffb9c5;border-color:#c55}.rm-name-editor [data-rm-error]{color:#ffb9c5;white-space:pre-wrap}
    </style><section class="rm-shell"><header class="rm-head"><div class="rm-toolbar"><button data-rm-back>← Club Records</button><button data-rm-refresh>Refresh</button><a class="rm-button" target="_blank" rel="noopener" href="https://docs.google.com/spreadsheets/d/${spreadsheet}/edit#gid=${tabs.restricted.gid}">Edit restriction records ↗</a></div><div class="rm-kicker">LEADERSHIP REFERENCE · MEMBERSHIP ELIGIBILITY</div><h2>Restricted Members</h2><p>Review these records before considering a person for membership or reinstatement. Each card shows the recorded restriction and the conditions, if any, for review.</p><div class="rm-warning"><strong>STOP — check the restriction before proceeding.</strong><br>Permanent restriction: not eligible for membership. Conditional restriction: remains restricted unless leadership reviews the circumstances and formally changes the decision.</div><p class="rm-confidential">Confidential club records · For authorized leadership use.</p></header><div class="rm-body"><div class="rm-counts" data-rm-counts></div><div class="rm-controls"><label>Find a person or reason<input type="search" data-rm-search placeholder="Name, restriction, reason, or notes" autocomplete="off"></label><label>Show restrictions<select data-rm-filter><option value="all">All restrictions</option><option value="permanent">Permanent restrictions</option><option value="conditional">Conditional restrictions</option><option value="cleared">Cleared records</option></select></label></div><p class="rm-status" role="status" aria-live="polite" data-rm-status>Loading private restriction records…</p><div class="rm-grid" data-rm-grid></div></div><dialog class="rm-name-editor" data-rm-editor aria-label="Edit restriction record"></dialog></section>`;
    host.querySelector('[data-rm-back]').onclick=()=>{++version;recordsHome()};
    host.querySelector('[data-rm-refresh]').onclick=openRestricted;
    const grid=host.querySelector('[data-rm-grid]'),status=host.querySelector('[data-rm-status]');
    try{
      if(!accessToken)throw new Error('Sign in with Google to view these records.');
      const raw=await getSheetValues(tabs.restricted.range,spreadsheet);
      if(ticket!==version||!host.contains(grid))return;
      const headers=(raw[0]||[]).map(x=>String(x).trim().toLowerCase());
      const at=(row,title,fallback)=>String(row[headers.indexOf(title)>=0?headers.indexOf(title):fallback]??'').trim();
      const rows=raw.slice(1).map((v,i)=>({v,row:i+3})).filter(({v})=>v.some(x=>x!==''&&x!=null)).map(({v:r,row})=>({row,original:Array.from({length:7},(_,i)=>String(r[i]??'')),first:at(r,'first name',1),last:at(r,'last name',0),name:[at(r,'first name',1),at(r,'last name',0)].filter(Boolean).join(' '),state:at(r,'status',2),date:at(r,'effective date',3),reason:at(r,'reason category',4),review:at(r,'review eligibility',5),notes:at(r,'notes',6)})).map(r=>({...r,kind:/permanent/i.test(r.state)?'permanent':/conditional/i.test(r.state)?'conditional':/^(cleared|lifted|inactive|removed|eligible|unrestricted)$/i.test(r.state)?'cleared':'other'})).sort((a,b)=>(a.kind==='permanent'?0:1)-(b.kind==='permanent'?0:1)||a.name.localeCompare(b.name));
      host.querySelector('[data-rm-counts]').innerHTML='<span><strong>'+rows.length+'</strong> restriction records</span><span><strong>'+rows.filter(r=>r.kind==='permanent').length+'</strong> permanent</span><span><strong>'+rows.filter(r=>r.kind==='conditional').length+'</strong> conditional</span>';
      function paint(){
        const q=host.querySelector('[data-rm-search]').value.trim().toLowerCase(),filter=host.querySelector('[data-rm-filter]').value;
        const list=rows.filter(r=>(filter==='all'||r.kind===filter)&&[r.name,r.state,r.date,r.reason,r.review,r.notes].some(v=>v.toLowerCase().includes(q)));
        status.textContent=list.length+' of '+rows.length+' restriction records shown · Permanent restrictions appear first.';
        grid.innerHTML=list.map(r=>'<article class="rm-card '+r.kind+'"><span class="rm-badge">'+e(r.kind==='permanent'?'PERMANENTLY RESTRICTED':r.kind==='conditional'?'CONDITIONALLY RESTRICTED':r.state||'RESTRICTION RECORDED')+'</span><h3>'+e(r.name||'Name not recorded')+'</h3><p class="rm-directive">'+e(r.kind==='permanent'?'Not eligible for membership':r.kind==='conditional'?'Restricted — leadership review required':r.kind==='cleared'?'Restriction lifted — normal membership checks apply':'Review the recorded decision before proceeding')+'</p><dl><dt>Recorded reason</dt><dd>'+e(r.reason||'No reason recorded. Consult leadership.')+'</dd><dt>Effective date</dt><dd>'+e(r.date||'Not recorded')+'</dd><dt>Review eligibility</dt><dd>'+e(r.review||'Not recorded — consult leadership')+'</dd></dl>'+(r.notes?'<details><summary>Decision notes</summary><p style="white-space:pre-wrap;color:#eee">'+e(r.notes)+'</p></details>':'')+'<div class="rm-edit-actions"><button type="button" data-rm-edit="'+r.row+'" aria-label="Edit restriction for '+e(r.name)+'">Edit</button></div></article>').join('')||'<p class="rm-empty">No restriction records match this search.</p>';
        grid.querySelectorAll('[data-rm-edit]').forEach(button=>button.onclick=()=>editName(rows.find(r=>r.row===Number(button.dataset.rmEdit))));
      }
      const dialog=host.querySelector('[data-rm-editor]');
      let saving=false;
      const normalize=row=>Array.from({length:7},(_,i)=>String(row[i]??''));
      const base='https://sheets.googleapis.com/v4/spreadsheets/'+spreadsheet;
      const rangeFor=record=>"'Restricted Members'!A"+record.row+':G'+record.row;
      async function verifyRecord(record){
        if(!accessToken)throw new Error('Sign in with Google again before saving.');
        const fresh=await getSheetValues(rangeFor(record),spreadsheet);
        if(JSON.stringify(normalize(fresh[0]||[]))!==JSON.stringify(record.original))throw new Error('This record changed. Refresh and review it before saving.');
        if(JSON.stringify(headers)!==JSON.stringify(['last name','first name','status','effective date','reason category','review eligibility','notes']))throw new Error('The record columns do not match the expected layout. Check the source sheet.');
        const currentHeaders=await getSheetValues("'Restricted Members'!A2:G2",spreadsheet);
        if(JSON.stringify((currentHeaders[0]||[]).map(x=>String(x).trim().toLowerCase()))!==JSON.stringify(headers))throw new Error('The record columns changed. Refresh before saving.');
      }
      function editName(record){
        if(saving||!record)return;
        const states=[...new Set([record.state,'Permanently Restricted','Restricted – Conditional','Cleared'].filter(Boolean))];
        dialog.innerHTML='<form><h3>Edit restriction record</h3><p>Update the person’s details and the recorded restriction decision.</p><label>First name<input name="first" required maxlength="100" autocomplete="off"></label><label>Last name<input name="last" required maxlength="100" autocomplete="off"></label><label>Status<select name="state" required>'+states.map(s=>'<option value="'+e(s)+'">'+e(s)+'</option>').join('')+'</select></label><label>Effective date<input name="date" placeholder="MM/DD/YYYY" autocomplete="off"></label><label>Reason category<textarea name="reason" rows="3"></textarea></label><label>Review eligibility<input name="review" autocomplete="off"></label><label>Notes<textarea name="notes" rows="4"></textarea></label><p class="rm-edit-help">Cleared lifts this restriction. Remove restriction takes the person off this list. Other membership requirements still apply.</p><p role="status" aria-live="polite" data-rm-error></p><div class="rm-edit-actions"><button type="button" class="rm-remove" data-rm-remove>Remove restriction</button><button type="button" data-rm-cancel>Cancel</button><button type="submit">Save changes</button></div></form>';
        ['first','last','state','date','reason','review','notes'].forEach(key=>{dialog.querySelector('[name="'+key+'"]').value=record[key];});
        dialog.querySelector('[data-rm-cancel]').onclick=()=>dialog.close();
        const lock=()=>{saving=true;dialog.querySelectorAll('button,input,select,textarea').forEach(el=>el.disabled=true);};
        const unlock=()=>{saving=false;dialog.querySelectorAll('button,input,select,textarea').forEach(el=>el.disabled=false);};
        const preventClose=event=>event.preventDefault();
        async function finish(message){
          dialog.close();await openRestricted();
          const updated=host.querySelector('[data-rm-status]');if(updated)updated.textContent=message+' '+updated.textContent;
        }
        dialog.querySelector('form').onsubmit=async event=>{
          event.preventDefault();if(saving)return;
          const get=key=>dialog.querySelector('[name="'+key+'"]').value.trim(),message=dialog.querySelector('[data-rm-error]');
          const first=get('first'),last=get('last'),state=get('state');
          if(!first||!last||!state){message.textContent='Enter first name, last name, and status.';return;}
          const values=[last,first,state,get('date'),get('reason'),get('review'),get('notes')];
          lock();dialog.addEventListener('cancel',preventClose);message.textContent='Saving changes…';
          try{
            await verifyRecord(record);
            await writePortalSheetRequest(base+'/values/'+encodeURIComponent(rangeFor(record))+'?valueInputOption=RAW',{method:'PUT',headers:{Authorization:'Bearer '+accessToken,'Content-Type':'application/json'},body:JSON.stringify({values:[values]}),signal:AbortSignal.timeout(20000)},'Edited restricted member record','Restricted Members',1);
            const check=await getSheetValues(rangeFor(record),spreadsheet);
            if(JSON.stringify(normalize(check[0]||[]))!==JSON.stringify(values))throw new Error('The saved record could not be verified. Refresh before retrying.');
            await finish('Changes saved.');
          }catch(error){message.textContent='Could not finish: '+error.message+' Refresh before retrying to check whether the save completed.';}
          finally{dialog.removeEventListener('cancel',preventClose);unlock();}
        };
        dialog.querySelector('[data-rm-remove]').onclick=async()=>{
          if(saving||!confirm('Remove the restriction for '+record.name+'?\n\nThis takes the person off the Restricted Members list and removes this restriction from join and renewal checks. Other membership requirements still apply.'))return;
          const message=dialog.querySelector('[data-rm-error]');lock();dialog.addEventListener('cancel',preventClose);message.textContent='Removing restriction…';
          try{
            await verifyRecord(record);
            await writePortalSheetRequest(base+'/values:batchClear',{method:'POST',headers:{Authorization:'Bearer '+accessToken,'Content-Type':'application/json'},body:JSON.stringify({ranges:[rangeFor(record)]}),signal:AbortSignal.timeout(20000)},'Removed restricted member record','Restricted Members',1);
            const check=await getSheetValues(rangeFor(record),spreadsheet);
            if(normalize(check[0]||[]).some(Boolean))throw new Error('Removal could not be verified. Refresh before retrying.');
            await finish('Restriction removed.');
          }catch(error){message.textContent='Could not finish removing: '+error.message+' Refresh before retrying.';}
          finally{dialog.removeEventListener('cancel',preventClose);unlock();}
        };
        dialog.showModal();
      }
      host.querySelector('[data-rm-search]').oninput=paint;host.querySelector('[data-rm-filter]').onchange=paint;paint();
    }catch(error){if(ticket===version)status.textContent='Unable to load restriction records. '+error.message+' Refresh after signing in with an authorized account.';}
  }

  async function open(key){
    if(key==='accounts')return openAccounts();
    if(key==='restricted')return openRestricted();
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
    'Vendor Receipts':'Individual vendor invoices, receipts, order sheets, and production references.',
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
    'Vendor Receipts':'purchase-evidence-unique-v1.webp',
    'Corporate & Tax Documents':'corporate-tax-unique-v1.webp','Club History':'club-history-unique-v1.webp',
    'Ride Safety':'ride-safety-unique-v1.webp','Approved Artwork':'approved-artwork-unique-v1.webp',
    'Contracts & Agreements':'contracts-agreements-unique-v1.webp','Sponsorship Resources':'sponsorship-resources-unique-v1.webp',
    'Fund Requests':'fund-requests-unique-v1.webp','Financial Reports':'financial-reports-unique-v1.webp',
    'Event Documents':'event-documents-unique-v1.webp','Donation Evidence':'donation-evidence-unique-v1.webp',
    'Purchase Evidence':'purchase-evidence-unique-v1.webp','Accounts & Access':'accounts-access-unique-v1.webp',
    'Restricted Members':'restricted-members-unique-v1.webp','Bylaws':'bylaws-official-v1.webp',
    'Archive':'archive-records-v1.webp','Operating Policies':'operating-policies-v2.webp',
    'Code of Conduct':'conduct-official-v1.webp','Forms and Tools':'forms-tools-desk-v1.webp',
    'Minutes':'minutes-journal-v1.webp','Receipts':'receipts-desk-v1.webp',
    'Bikes for Tykes':'bikes-for-tykes-records-v2.webp','Committee records':'committee-roundtable-v1.webp'
  };
  let selectedVendor='';
  const managed=new Set([...Object.keys(descriptions).slice(0,11),'Vendor Receipts']);
  const mimeTypes={"1HjwdQmtFSxGm2AvDzyo6QfAjyGsVzwZ9":"application/pdf","1YWv-OGgNZNpx7fJBYtqr4AKxXrHXk4ZU":"application/pdf","1RSutxT0tNItmtJzglJvGiBbdtmk3PC0P":"application/pdf","1hiIYLTO_2Q_hBzv6PMK1JBTCm55COJy8":"application/pdf","1NEoN-QE7ytkAJKr_Pn_N_HxvfcwH4AAp":"application/pdf","1c4oUvHQtfcXtrQoYcLoSEEd4OiBiRNfg":"application/pdf","1q6PlTazU38idB7mzQ_qp6n7bIzI3DlKN":"application/pdf","16NG18oMEwIwt9eWiUzur1ibjR6avx4fZ":"application/pdf","1Gukfugq7ysoa2wUUK9B9Te0P-OWW6LWp":"application/pdf","1pw_rnmSfUCHlTboy2BQ7yQmP8Ij-OiIo":"application/pdf","1g1sjXG5m5ujR_-y0ImqCrEZDIs37KCzX":"application/pdf","1rI4MX1afxJSZFXLRYnIyv0JctttwKDvH":"text/html","1bFfSAx_azwIQtr7PqgLqpcB90DjVwT8j":"application/vnd.openxmlformats-officedocument.presentationml.presentation","1vVohrx0qovNOsijpj3rnem4XaU21AlyW":"application/vnd.openxmlformats-officedocument.wordprocessingml.document","1dmhGOHc1rX771nogDARTY23fL3amkSC8":"application/vnd.openxmlformats-officedocument.wordprocessingml.document","1W0BYy8I6AU4dI0xSXjJC70FGbxLWx85t":"application/pdf","1s2g8gINDMXfojsnSsFgDkpQEpCc5WSRx":"application/pdf","1Sl54KL784t5com7mFaJr-8uSI0dnHCsK":"application/pdf","1wKA50KAUWIo_P9BbKcP7azNCGY99S7xL":"application/pdf","1jwwvsGEMgTNV1c8rjssisxs3704WZ_oD":"application/pdf","1J-7V9QYz_B5u1aQba9aceIJuwajnCouj":"application/pdf","1ZpsTmP-l_Cr27_fzGUVgZdsoypjHV2SX":"application/pdf","18cgSpRtMoo5368e8hf9Pkg680SCrj5Vf":"application/pdf","1KWndJUYg145N0MmEAZX90fHQAT7gMYIS":"application/vnd.openxmlformats-officedocument.wordprocessingml.document","1CKMT5ho5KW4QWiUfefwM3h99GyTcPXB5":"application/pdf","1ZBn14nVCv-It0dftg1iAeIby5y2i7B3w":"application/pdf","1yqIEVHjEaUW98s__JxcIn54Wn8t1l1E_":"application/pdf","1GDZyLsmQjSY74lI-KqFpk8xf9szSKCoD":"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet","1plh3eoqhZknnLLknAXQSH16h_ZEpRywa-SmF7XmgsR4":"application/vnd.google-apps.spreadsheet","1Zw6zIlT5_f06Xcovj-JqVGI-q_rZaRZHut3xGbv_DFk":"application/vnd.google-apps.spreadsheet","1NKBEbbRa_nSuDeL5c7Abe6p2lYS4474Hp5CEfaSS_dQ":"application/vnd.google-apps.spreadsheet","1BllO5dydFET5N_sW5MZ6PO2OoeJYo04L":"application/pdf","15zRbBWpPfqmqg6TNxSC2tojj0KncEF_-":"application/pdf","1kEOCSZ43Jhtuya6z09gwtoq_paC9Mpvw":"application/pdf","1d02_qC16wukcg5cuSU0EWttrV-IkuMVm":"application/pdf","1K8GoPo37Yk6H8BHMbhffZDpJ0LmdTWDMLggJGqicGh4":"application/vnd.google-apps.spreadsheet","1JS6_61jkJdB46WtN8jUrLyChI-b5UvFgR0RHMJuSwm0":"application/vnd.google-apps.spreadsheet","1gAGwPsup2WH_By4ae5dmp33IKZ8zVLTU":"application/pdf","1jn8W3m1yeczdlYHIpEc_f1g8Byc0PpNo":"application/pdf","1_QXfQyxD0JFuJUowD00PgxbtwqsOajd9":"application/pdf","1AatEiUG6qM02KmR2PK3v5TpwCXPpJusR":"application/pdf","18hvNcFZGYt0gGunG_itp4saArdbDmDAj":"application/pdf","1caO2trHHICvd9D7m8EsU7qBIs8Rw-DgU":"application/pdf","14s8kdjgiR6Z2-pXHHRtc6ySq2BWfyCYr":"application/pdf","1dwzORoUequwXh7BNo2ypPKucmljlaLCV":"application/pdf"};
  const mimeLabels={
    'image/png':'Image','image/jpeg':'Image','image/webp':'Image','application/pdf':'PDF','application/vnd.google-apps.document':'Google Doc',
    'application/vnd.google-apps.spreadsheet':'Google Sheet','application/vnd.google-apps.presentation':'Google Slides',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document':'Word',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':'Excel',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation':'PowerPoint','text/html':'HTML','text/plain':'Text'
  };
  const idOf=url=>String(url||'').match(/\/d\/([^/?#]+)/)?.[1]||'';
  function fileInfo(v){
    const url=clubSafeLink(v[6]),id=idOf(url),mime=mimeTypes[id]||(/\.pdf\b/i.test(v[1])?'application/pdf':/\.docx$/i.test(v[1])?'application/vnd.openxmlformats-officedocument.wordprocessingml.document':/\.xlsx$/i.test(v[1])?'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':/\.(png|jpe?g|webp)$/i.test(v[1])?'image/png':'');
    const native={
      'application/vnd.google-apps.document':['document','docx','Word'],
      'application/vnd.google-apps.spreadsheet':['spreadsheets','xlsx','Excel'],
      'application/vnd.google-apps.presentation':['presentation','pptx','PowerPoint']
    }[mime];
    const download=id?(native?'https://docs.google.com/'+native[0]+'/d/'+encodeURIComponent(id)+(native[0]==='presentation'?'/export/'+native[1]:'/export?format='+native[1]):'https://drive.google.com/uc?export=download&id='+encodeURIComponent(id)):'';
    return {url,id,mime,label:mimeLabels[mime]||'Document',download,downloadLabel:native?'Download '+native[2]:'Download file'};
  }
  let savedPreviewToken='',savedPreviewPromise=null;
  const savedPreviewImages=new Map();
  async function loadSavedPreviews(){
    if(!accessToken)throw new Error('Sign in to load document images.');
    if(savedPreviewToken!==accessToken){savedPreviewToken=accessToken;savedPreviewPromise=null;savedPreviewImages.clear();}
    if(!savedPreviewPromise)savedPreviewPromise=getSheetValues("'Document Previews'!A2:D100",MEMBERSHIP_SPREADSHEET_ID).then(rows=>{
      rows.forEach(r=>{if(r[0]&&/^data:image\/webp;base64,[A-Za-z0-9+/=]+$/.test(r[2]||''))savedPreviewImages.set(r[0],r[2]);});
      return savedPreviewImages;
    }).catch(error=>{savedPreviewPromise=null;throw error;});
    return savedPreviewPromise;
  }
  function fillDocumentImages(host){
    loadSavedPreviews().then(images=>{
      host.querySelectorAll('.rx-drive-thumbnail[data-preview-id]').forEach(img=>{
        const source=images.get(img.dataset.previewId),box=img.parentNode,label=box.querySelector('.rx-preview-loading');
        if(!source){if(label)label.textContent='Click to open document';return;}
        img.onload=()=>{img.hidden=false;if(label)label.remove();};
        img.onerror=()=>{if(label)label.textContent='Click to open document';};
        img.src=source;
      });
    }).catch(()=>{host.querySelectorAll('.rx-preview-loading').forEach(label=>label.textContent='Preview unavailable — click to open document');});
  }
  function purpose(v){
    if(v[2]==='Vendor Receipts')return String(v[7]||'').split('\n')[0]||'Vendor receipt or ordering reference';
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
  .rx-card-body{padding:18px;display:flex;flex-direction:column;flex:1;gap:12px}.rx-card-body h3{margin:0!important;font-size:19px!important;line-height:1.35;color:#1d232b!important}.rx-card-body p{margin:0!important;line-height:1.55;color:#424a56!important;font-size:14px}.rx-card-body details{font-size:13px;line-height:1.5;color:#505965}.rx-card-body summary{cursor:pointer;font-weight:700}.rx-card-body details p{margin-top:8px!important;white-space:pre-wrap;font-size:13px}.rx-card-body .record-chip{align-self:start}.rx-card-actions{display:flex;gap:9px;flex-wrap:wrap;margin-top:auto;padding-top:8px}.rx-card-actions a,.rx-card-actions button{font:700 14px/1.2 Arial,sans-serif;text-decoration:none;border-radius:7px;padding:11px 13px;cursor:pointer}.rx-primary{background:#ae1231;color:white!important;border:1px solid #ae1231}.rx-secondary{background:#fff;color:#282e38!important;border:1px solid #aeb7c3}.rx-manage-actions{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap}.rx-remove{color:#a00;background:#fff5f5;border:1px solid #bd7a7a;border-radius:6px;padding:8px 10px;cursor:pointer;font-size:13px}.rx-remove:disabled{opacity:.6;cursor:wait}.rx-remove-status:empty{display:none}.rx-remove-status{color:#a00!important}.rx-edit{background:#a91930!important;color:#fff!important;border:2px solid #791022!important;border-radius:8px;font-size:15px!important;font-weight:800!important;padding:11px 18px!important;cursor:pointer}.rx-edit:hover{background:#791022!important}.rx-picture-panel{padding:18px;border:2px solid #a91930;border-radius:10px;margin:18px 0}.rx-picture-panel img{max-height:180px;max-width:100%;display:block;margin:12px 0}
  #recordsWorkspace .rx-live-preview{height:290px;min-height:290px;padding:12px;position:relative;display:block;background:#cfd4da;overflow:hidden}.rx-live-preview .rx-drive-thumbnail{display:block;width:100%;height:100%;object-fit:contain;object-position:top center;background:#f7f7f7;box-shadow:0 2px 8px #0002}.rx-preview-fallback{position:absolute;inset:0;width:100%;height:100%;border:0;pointer-events:none;background:#fff}.rx-open-preview{position:absolute;inset:0;width:100%;height:100%;border:0;background:transparent;cursor:pointer;z-index:2}.rx-open-preview:hover{background:#00000008}.rx-open-preview:focus-visible{outline:4px solid #ae1231;outline-offset:-4px}.rx-file-badge{position:absolute;bottom:16px;right:16px;padding:5px 9px;border-radius:5px;background:#1c2535e8;color:white;font-size:12px;font-weight:700;z-index:3;pointer-events:none}.rx-title-open{padding:0;border:0;background:transparent;color:inherit;font:inherit;text-align:left;cursor:pointer}.rx-title-open:hover{text-decoration:underline}.rx-title-open:focus-visible{outline:2px solid #ae1231;outline-offset:3px}
  .rx-preview-loading{position:absolute;inset:0;display:grid;place-items:center;padding:30px;color:#4a5563;font-size:14px;text-align:center}.rx-live-preview .rx-drive-thumbnail[hidden]{display:none!important}
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
    selectedVendor='';priorDashboard.apply(this,arguments);
    const host=document.getElementById('recordsWorkspace'),grid=host.querySelector('.records-dashboard-cards');if(!grid)return;
    [...grid.children].forEach(card=>{
      const label=card.querySelector('h3')?.textContent?.trim();if(!label)return;
      if(label==='Vendor Receipts')card.querySelector('h3').textContent='Vendors';
      const art=card.querySelector('.dashboard-art'),file=arts[label]||'archive-records-v1.webp';
      if(art)art.innerHTML='<img src="assets/club-records/'+file+'" alt="" loading="lazy" decoding="async">';
      const body=card.querySelector('.dashboard-card-body');if(!body)return;
      const p=document.createElement('p');p.className='rx-description';p.textContent=descriptions[label]||'Club documents and original reference files.';body.querySelector('h3').after(p);
      const footer=body.querySelector('.dashboard-card-footer');if(footer)footer.querySelectorAll('b').forEach(b=>b.remove());
      card.dataset.collectionTitle=label.toLowerCase();card.setAttribute('aria-label','Open '+label);
    });
    const toolbar=document.createElement('div');toolbar.className='rx-toolbar';toolbar.innerHTML='<label class="rx-search">Find a collection<input type="search" placeholder="Search records, tax, safety, artwork…" data-collection-find></label>';
    grid.before(toolbar);toolbar.querySelector('input').oninput=event=>{const q=event.target.value.toLowerCase().trim();[...grid.children].forEach(c=>c.hidden=!c.textContent.toLowerCase().includes(q));};
  };
  async function removeDocument(record,button){
    const message=button.closest('dialog').querySelector('[data-doc-remove-status]');
    if(!accessToken){message.textContent='Sign in before removing a document.';return;}
    if(!confirm('Remove “'+record[1]+'” from the portal?\n\nThe original Drive file will stay intact.'))return;
    button.disabled=true;button.textContent='Removing…';message.textContent='';
    try{
      const live=await getSheetValues("'Club Records'!A1:I2000",MEMBERSHIP_SPREADSHEET_ID);
      const matches=live.map((v,i)=>({v,row:i+1})).filter(r=>r.v[0]===record[0]);
      const normalize=v=>JSON.stringify(Array.from({length:9},(_,i)=>String(v[i]??'')));
      if(matches.length!==1||normalize(matches[0].v)!==normalize(record))throw new Error('This record changed. Refresh the collection and review it before removing.');
      const row=matches[0].row;
      await writePortalSheetRequest('https://sheets.googleapis.com/v4/spreadsheets/'+MEMBERSHIP_SPREADSHEET_ID+'/values:batchClear',{method:'POST',headers:{Authorization:'Bearer '+accessToken,'Content-Type':'application/json'},body:JSON.stringify({ranges:["'Club Records'!A"+row+':I'+row]})},'Removed document from portal','Club Records',1);
      button.closest('dialog').close();
      await loadClubFramework('records');
    }catch(error){message.textContent='Unable to finish removing: '+error.message+' Refresh before retrying.';button.disabled=false;button.textContent='Remove from portal';}
  }
  const priorEditRecord=editClubRecord;
  editClubRecord=function(key,rowNumber){
    priorEditRecord.apply(this,arguments);
    if(key!=='records'||!rowNumber||clubFramework.records.active!=='Club Records')return;
    const record=clubCache['Club Records']?.[rowNumber-1];
    const dialog=document.querySelector('#recordsWorkspace [data-club-editor] dialog');
    if(!record?.[0]||!dialog)return;
    attachCardPictureEditor(dialog,record);
    const toolbar=dialog.querySelector('.club-toolbar');
    const button=document.createElement('button');button.type='button';button.className='rx-remove';button.textContent='Remove from portal';
    const message=document.createElement('p');message.className='rx-remove-status';message.dataset.docRemoveStatus='true';message.setAttribute('role','status');
    toolbar.after(message);toolbar.append(button);
    button.onclick=()=>removeDocument(record.slice(),button);
  };
  function renderVendorFolders(host,rows){
    const names=[...new Set(rows.map(r=>String(r.v[7]||'').split(' · ')[0]))].filter(Boolean).sort();
    host.innerHTML='<nav class="minutes-breadcrumb"><button class="sponsor-tab" data-vendors-home>← Club Records</button></nav><section class="records-hero"><div><h2>Vendors</h2><p style="display:block">Choose a vendor to view individual receipts, order sheets, and artwork.</p></div></section><div class="rx-grid">'+names.map((name,i)=>{const count=rows.filter(r=>String(r.v[7]||'').split(' · ')[0]===name).length;const pin=/pin people/i.test(name),cover=pin?'data:image/png;base64,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':'assets/club-records/approved-artwork-unique-v1.webp';return '<button class="record-card" data-vendor-folder="'+i+'" style="text-align:left;padding:24px;cursor:pointer;border-top:5px solid #ac1931"><img src="'+cover+'" alt="'+esc(name)+' vendor picture" style="width:100%;height:180px;object-fit:contain;border-radius:8px;background:#fff"><h3>'+esc(name)+'</h3><p>'+count+' individual receipts and files</p><strong>View vendor →</strong></button>';}).join('')+'</div>';
    host.querySelector('[data-vendors-home]').onclick=recordsHome;
    host.querySelectorAll('[data-vendor-folder]').forEach(b=>b.onclick=()=>{selectedVendor=names[Number(b.dataset.vendorFolder)];renderRecordCollection();});
  }
  async function encodeCardPicture(file){
    if(!file||!file.type.startsWith('image/'))throw new Error('Choose an image file.');
    if(file.size>20000000)throw new Error('Choose an image smaller than 20 MB.');
    const bitmap=await createImageBitmap(file);const canvas=document.createElement('canvas');let scale=Math.min(1,620/bitmap.width,800/bitmap.height),data='';
    do{canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));canvas.getContext('2d').drawImage(bitmap,0,0,canvas.width,canvas.height);data=canvas.toDataURL('image/webp',.65);scale*=.8;}while(data.length>44000);bitmap.close();return data;
  }
  function attachCardPictureEditor(dialog,record){
    const id=fileInfo(record).id;if(!id)return;
    const panel=document.createElement('section');panel.className='rx-picture-panel';
    panel.innerHTML='<h3>Card picture</h3><p>Upload a replacement thumbnail for this card. The original document stays intact.</p><label>Choose a new picture<input type="file" accept="image/*" data-card-picture-file></label><img data-card-picture-preview alt="Selected card picture" hidden><button type="button" class="rx-primary" data-card-picture-save disabled>Save picture</button><p role="status" data-card-picture-status></p>';
    dialog.querySelector('.club-toolbar').before(panel);let data='';const input=panel.querySelector('input'),button=panel.querySelector('button'),status=panel.querySelector('[data-card-picture-status]'),image=panel.querySelector('img');
    input.onchange=async()=>{button.disabled=true;status.textContent='Preparing picture…';try{data=await encodeCardPicture(input.files[0]);image.src=data;image.hidden=false;button.disabled=false;status.textContent='Ready. Select Save picture.';}catch(error){status.textContent=error.message;}};
    button.onclick=async()=>{button.disabled=true;input.disabled=true;status.textContent='Saving picture…';const prevent=event=>event.preventDefault();dialog.addEventListener('cancel',prevent);
      try{if(!accessToken)throw new Error('Sign in again before saving.');const rows=await getSheetValues("'Document Previews'!A1:E100",MEMBERSHIP_SPREADSHEET_ID);const index=rows.findIndex(r=>r[0]===id);const range=index>=0?"'Document Previews'!A"+(index+1)+':E'+(index+1):"'Document Previews'!A:E";
      const url='https://sheets.googleapis.com/v4/spreadsheets/'+MEMBERSHIP_SPREADSHEET_ID+'/values/'+encodeURIComponent(range)+(index>=0?'?valueInputOption=RAW':':append?valueInputOption=RAW&insertDataOption=INSERT_ROWS');
      await writePortalSheetRequest(url,{method:index>=0?'PUT':'POST',headers:{Authorization:'Bearer '+accessToken,'Content-Type':'application/json'},body:JSON.stringify({values:[[id,'image/webp',data,new Date().toISOString(),record[1]]]}),signal:AbortSignal.timeout(20000)},'Updated document card picture','Document Previews',1);
      savedPreviewImages.set(id,data);savedPreviewPromise=null;fillDocumentImages(document.getElementById('recordsWorkspace'));status.textContent='Picture saved. You can close this editor or save other changes.';
      }catch(error){status.textContent='Could not save picture: '+error.message;button.disabled=false;}finally{input.disabled=false;dialog.removeEventListener('cancel',prevent);}
    };
  }
  const priorCollection=renderRecordCollection;
  renderRecordCollection=function(){
    if(!managed.has(recordsCategory))return priorCollection.apply(this,arguments);
    const host=document.getElementById('recordsWorkspace'),category=recordsCategory;
    const allRows=(clubCache['Club Records']||[]).slice(1).map((v,i)=>({v,row:i+2})).filter(r=>r.v[0]&&r.v[2]===category);
    if(category==='Vendor Receipts'&&!selectedVendor){renderVendorFolders(host,allRows);return;}
    const rows=allRows.filter(r=>category!=='Vendor Receipts'||String(r.v[7]||'').split(' · ')[0]===selectedVendor);
    host.innerHTML='<nav class="minutes-breadcrumb"><button class="sponsor-tab" data-doc-back>← Club Records</button><button class="sponsor-tab" data-doc-refresh>Refresh</button></nav><section class="records-hero"><div><h2>'+esc(category==='Vendor Receipts'?selectedVendor+' — Receipts & Files':category)+'</h2><p style="display:block">'+esc(descriptions[category])+'</p></div></section><div class="rx-toolbar"><label class="rx-search">Find a document<input data-doc-query type="search" placeholder="Search titles, descriptions, or notes"></label><label>Status<select data-doc-status><option value="">All statuses</option>'+[...new Set(rows.map(r=>r.v[4]||'Needs review'))].sort().map(s=>'<option>'+esc(s)+'</option>').join('')+'</select></label><label>Sort<select data-doc-sort><option value="title">Title A–Z</option><option value="newest">Newest date first</option><option value="oldest">Oldest date first</option></select></label></div><p data-doc-count role="status"></p><div class="rx-grid" data-doc-results></div><div data-club-editor></div>';
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
        return '<article class="rx-card"><div class="rx-document-art rx-live-preview"><img class="rx-drive-thumbnail" data-preview-id="'+esc(f.id)+'" alt="First-page preview of '+esc(v[1])+'" hidden><span class="rx-preview-loading" role="status">Loading document image…</span><button class="rx-open-preview" type="button" data-doc-view="'+row+'" aria-label="Open '+esc(v[1])+'"></button><span class="rx-file-badge">'+esc(f.label)+'</span></div><div class="rx-card-body"><span class="record-chip '+esc(chip)+'">'+esc(state)+'</span><h3><button class="rx-title-open" type="button" data-doc-view="'+row+'">'+esc(v[1])+'</button></h3><p>'+esc(purpose(v))+'</p>'+(v[3]?'<p><strong>Document date:</strong> '+esc(v[3])+'</p>':'')+(v[7]?'<details><summary>Record details</summary><p>'+esc(v[7])+'</p></details>':'')+'<div class="rx-card-actions">'+(f.url?'<button class="rx-primary" type="button" data-doc-view="'+row+'" aria-label="View '+esc(v[1])+'">View document</button>':'')+(f.download?'<a class="rx-secondary" href="'+esc(f.download)+'" target="_blank" rel="noopener" aria-label="'+esc(f.downloadLabel+' — '+v[1])+'">'+esc(f.downloadLabel)+'</a>':'')+'</div><div class="rx-manage-actions"><button class="rx-edit" type="button" data-doc-edit="'+row+'">Edit / Change Picture</button></div></div></article>';
      }).join('')||'<div class="workspace-card"><h3>No matching documents</h3><p>Try a shorter search or choose All statuses.</p></div>';
      host.querySelectorAll('[data-doc-edit]').forEach(b=>b.onclick=()=>editClubRecord('records',Number(b.dataset.docEdit)));
      host.querySelectorAll('[data-doc-view]').forEach(b=>b.onclick=()=>preview(rows.find(r=>r.row===Number(b.dataset.docView)).v));
      fillDocumentImages(host);
    };
    host.querySelector('[data-doc-query]').oninput=paint;host.querySelector('[data-doc-status]').onchange=paint;host.querySelector('[data-doc-sort]').onchange=paint;
    host.querySelector('[data-doc-back]').textContent=category==='Vendor Receipts'?'← Vendors':'← Club Records';host.querySelector('[data-doc-back]').onclick=()=>{if(category==='Vendor Receipts'){selectedVendor='';renderRecordCollection();}else recordsHome();};host.querySelector('[data-doc-refresh]').onclick=()=>loadClubFramework('records');paint();
  };
})();


/* Remove portal collections without deleting source Drive files. */
(() => {
  const removable=new Set(['Vendor Receipts','Corporate & Tax Documents','Club History','Ride Safety','Approved Artwork','Contracts & Agreements','Sponsorship Resources','Fund Requests','Financial Reports','Event Documents','Donation Evidence','Purchase Evidence','Accounts & Access','Restricted Members','Patches']);
  const settingsTab='Portal Collection Settings';
  const removed=new Set();let settingsPromise=null,settingsExists=false;
  const base=()=> 'https://sheets.googleapis.com/v4/spreadsheets/'+MEMBERSHIP_SPREADSHEET_ID;
  async function settings(force=false){
    if(!accessToken)return;
    if(force)settingsPromise=null;
    if(!settingsPromise)settingsPromise=(async()=>{
      const response=await fetch(base()+'?fields=sheets.properties.title',{headers:{Authorization:'Bearer '+accessToken}});
      if(!response.ok)throw new Error('Unable to check collection settings. Refresh and try again.');
      settingsExists=(await response.json()).sheets.some(s=>s.properties.title===settingsTab);
      removed.clear();
      if(settingsExists){const rows=await getSheetValues("'"+settingsTab+"'!A1:C200",MEMBERSHIP_SPREADSHEET_ID);rows.slice(1).forEach(r=>{if(r[1]==='Removed')removed.add(r[0]);});}
    })().catch(e=>{settingsPromise=null;throw e;});
    return settingsPromise;
  }
  function filterCards(){
    document.querySelectorAll('#recordsWorkspace .records-dashboard-card').forEach(card=>{if(removed.has(card.querySelector('h3')?.textContent.trim()))card.remove();});
    if(removed.has('Patches'))document.querySelectorAll('#storageWorkspace button').forEach(b=>{if(b.textContent==='Patches — View Inventory')b.remove();});
    const shortcuts={'Fund requests':'Fund Requests','Donation evidence':'Donation Evidence','Purchase evidence':'Purchase Evidence','Financial reports':'Financial Reports','Sponsorship resources':'Sponsorship Resources','Corporate documents':'Corporate & Tax Documents','Event documents':'Event Documents','Ride safety':'Ride Safety','Storage agreement and contracts':'Contracts & Agreements','Artwork and production files':'Approved Artwork','Ride safety and blank waiver':'Ride Safety'};
    document.querySelectorAll('[data-record-shortcuts] button').forEach(b=>{if(removed.has(shortcuts[b.textContent]))b.remove();});
  }
  async function removeCollection(category,button){
    if(!removable.has(category)||!accessToken)return;
    const ordinary=!['Accounts & Access','Restricted Members','Patches'].includes(category);
    const cached=(clubCache['Club Records']||[]).slice(1).filter(r=>r[0]&&r[2]===category);
    const explanation=ordinary?'This removes '+cached.length+' document links from the portal.':'This removes this collection from the portal.';
    if(!confirm('Delete “'+category+'”?\n\n'+explanation+' Original Drive files and source workbooks are kept.'))return;
    button.disabled=true;const old=button.textContent;button.textContent='Deleting…';
    const host=button.closest('#recordsWorkspace,#storageWorkspace');let message=host.querySelector('[data-collection-delete-status]');
    if(!message){message=document.createElement('p');message.dataset.collectionDeleteStatus='true';message.setAttribute('role','status');button.parentNode.after(message);}
    try{
      await settings(true);
      let ranges=[];
      if(ordinary){
        const live=await getSheetValues("'Club Records'!A1:I2000",MEMBERSHIP_SPREADSHEET_ID);
        const current=live.slice(1).filter(r=>r[0]&&r[2]===category);
        const normalize=rows=>JSON.stringify(rows.map(r=>Array.from({length:9},(_,i)=>String(r[i]??''))).sort((a,b)=>a[0].localeCompare(b[0])));
        if(normalize(current)!==normalize(cached))throw new Error('This collection changed. Refresh it and review the documents before deleting.');
        ranges=live.map((r,i)=>r[0]&&r[2]===category?"'Club Records'!A"+(i+1)+':I'+(i+1):null).filter(Boolean);
      }
      if(!settingsExists){
        await writePortalSheetRequest(base()+':batchUpdate',{method:'POST',headers:{Authorization:'Bearer '+accessToken,'Content-Type':'application/json'},body:JSON.stringify({requests:[{addSheet:{properties:{title:settingsTab,gridProperties:{rowCount:200,columnCount:3,frozenRowCount:1}}}}]})},'Created collection settings',settingsTab,1);
        settingsExists=true;
        await writePortalSheetRequest(base()+'/values/'+encodeURIComponent("'"+settingsTab+"'!A1:C1")+'?valueInputOption=RAW',{method:'PUT',headers:{Authorization:'Bearer '+accessToken,'Content-Type':'application/json'},body:JSON.stringify({values:[['Collection','Status','Updated At']]})},'Initialized collection settings',settingsTab,1);
      }
      if(ranges.length)await writePortalSheetRequest(base()+'/values:batchClear',{method:'POST',headers:{Authorization:'Bearer '+accessToken,'Content-Type':'application/json'},body:JSON.stringify({ranges})},'Deleted portal collection links','Club Records',ranges.length);
      await writePortalSheetRequest(base()+'/values/'+encodeURIComponent("'"+settingsTab+"'!A:C")+':append?valueInputOption=RAW&insertDataOption=INSERT_ROWS',{method:'POST',headers:{Authorization:'Bearer '+accessToken,'Content-Type':'application/json'},body:JSON.stringify({values:[[category,'Removed',new Date().toISOString()]]})},'Removed portal collection',settingsTab,1);
      removed.add(category);filterCards();
      if(category==='Patches'){renderStorage();}
      else {recordsDashboard=true;recordsCategory='';clubFramework.records.active='Club Records';await loadClubFramework('records');}
    }catch(error){message.textContent='Unable to finish deleting: '+error.message+' Original files have not been deleted. Refresh before retrying.';button.disabled=false;button.textContent=old;settingsPromise=null;}
  }
  function control(category,container){
    if(!removable.has(category)||!container||container.querySelector('[data-delete-collection]'))return;
    const b=document.createElement('button');b.type='button';b.className='sponsor-tab';b.dataset.deleteCollection=category;b.style.cssText='color:#a00;border-color:#bd7a7a;margin-left:auto';b.textContent='Delete collection';b.onclick=()=>removeCollection(category,b);container.append(b);
  }
  const dashboard=renderRecordsDashboard;
  renderRecordsDashboard=function(){dashboard.apply(this,arguments);filterCards();settings(true).then(filterCards).catch(()=>{});};
  const storageRenderer=renderStorage;
  renderStorage=function(){storageRenderer.apply(this,arguments);filterCards();settings().then(filterCards).catch(()=>{});};
  const collection=renderRecordCollection;
  renderRecordCollection=function(){collection.apply(this,arguments);control(recordsCategory,document.querySelector('#recordsWorkspace .minutes-breadcrumb'));};
  let queued=false;
  const observer=new MutationObserver(()=>{if(queued)return;queued=true;queueMicrotask(()=>{queued=false;filterCards();for(const id of ['recordsWorkspace','storageWorkspace']){const host=document.getElementById(id);if(!host?.querySelector('[data-ops-back]'))continue;const category=host.querySelector('h2')?.textContent.trim();control(category,host.querySelector('.club-toolbar'));}});});
  const shell=document.querySelector('.detail-shell');if(shell)observer.observe(shell,{childList:true,subtree:true});
})();


