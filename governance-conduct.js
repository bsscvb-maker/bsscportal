/* Confidential records are fetched from the existing private operations workbook. */
(() => {
  const book='1unxFrG3TJfEbJpucQVPveVO1y9NUTdboqhED2HMueV4';
  const sections=['Member Cases','Leadership Statements','Board Decisions','Restricted Members'];
  let generation=0;
  const safe=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function link(v){try{const u=new URL(v);return u.protocol==='https:'&&['drive.google.com','docs.google.com'].includes(u.hostname)?u.href:'';}catch{return '';}}
  window.openGovernanceConduct=async function(section='',topic=''){
    const host=document.getElementById('recordsWorkspace'),ticket=++generation;
    host.innerHTML=`<style>
      .gc-shell{background:#161719;color:#f7f7f7;border:1px solid #46474a;border-radius:16px;padding:clamp(16px,3vw,28px)}
      .gc-shell h2,.gc-shell h3{color:#fff}.gc-shell p{color:#d2d3d5}.gc-top,.gc-actions{display:flex;align-items:center;gap:12px;flex-wrap:wrap}.gc-top h2{flex:1;margin:10px 0}.gc-shell button,.gc-shell a.gc-button{font:inherit;cursor:pointer;border:1px solid #8d8f94;border-radius:8px;padding:11px 15px;background:#292b2e;color:#fff;text-decoration:none}.gc-shell button:hover,.gc-shell a:hover{border-color:#ed5266}.gc-shell :focus-visible{outline:3px solid #fff;outline-offset:3px}.gc-shell .gc-primary{background:#a71d32;border-color:#dd5268}.gc-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,245px),1fr));gap:16px;margin-top:20px}.gc-shell .gc-card{text-align:left;min-height:145px;border-top:4px solid #bf2940;padding:20px}.gc-card h3{margin:0 0 12px}.gc-card small{color:#ddd}.gc-search{display:block;margin:20px 0}.gc-search input{box-sizing:border-box;width:100%;padding:12px;border:1px solid #aaa;border-radius:8px;font:inherit;margin-top:8px;background:#fff;color:#111}.gc-doc{background:#242629;border:1px solid #515359;border-radius:12px;padding:20px;overflow-wrap:anywhere}.gc-doc h3{font-size:1.05rem;margin-top:0}.gc-doc small{color:#e6c4ca}.gc-meta{font-size:.85rem}.gc-notice{border-left:4px solid #c72d47;padding:10px 15px;background:#292326}
    </style><section class="gc-shell"><div class="gc-top"><button data-gc-back>← ${topic?safe(section):section?'Governance &amp; Conduct':'Club Records'}</button><h2>${safe(topic||section||'Governance & Conduct')}</h2><button data-gc-refresh>Refresh</button></div><p>Confidential club records · Authorized leadership access required.</p><p class="gc-notice">${section==='Restricted Members'?'The live register holds current restrictions. Historical documents remain available for reference.':'Member cases, leadership communications, and the records behind club decisions.'}</p><div data-gc-content><p role="status">Loading private records…</p></div></section>`;
    host.querySelector('[data-gc-back]').onclick=()=>topic?openGovernanceConduct(section):section?openGovernanceConduct():recordsHome();
    host.querySelector('[data-gc-refresh]').onclick=()=>openGovernanceConduct(section,topic);
    const content=host.querySelector('[data-gc-content]');
    try{
      if(!accessToken)throw new Error('Sign in with your authorized Google account, then select Refresh.');
      const raw=await getSheetValues("'Governance & Conduct'!A1:H200",book);
      if(ticket!==generation||!host.contains(content))return;
      const rows=raw.slice(1).filter(r=>r[0]);
      if(!section){
        content.innerHTML='<div class="gc-grid">'+sections.map((s,i)=>'<button class="gc-card" data-gc-section="'+i+'"><h3>'+safe(s)+'</h3><p>'+safe(['Incident files and related supporting documents.','Official statements and explanations of club policy.','Governance reviews and records supporting Board decisions.','Current restrictions and historical register documents.'][i])+'</p><small>'+rows.filter(r=>r[1]===s).length+' documents'+(s==='Restricted Members'?' · Live register':'')+'</small></button>').join('')+'</div>';
        content.querySelectorAll('[data-gc-section]').forEach(b=>b.onclick=()=>openGovernanceConduct(sections[Number(b.dataset.gcSection)]));return;
      }
      const selected=rows.filter(r=>r[1]===section&&(!topic||r[2]===topic));
      const topics=[...new Set(selected.map(r=>r[2]||'Other records'))].sort();
      content.innerHTML=(section==='Restricted Members'?'<p><button class="gc-primary" data-gc-register>Open Live Restricted Members Register</button></p>':'')+'<label class="gc-search">Find a record<input data-gc-search type="search" placeholder="Search titles, dates, or notes"></label><p data-gc-count role="status"></p><div class="gc-grid" data-gc-grid></div>';
      content.querySelector('[data-gc-register]')?.addEventListener('click',()=>{window.openRestrictedMembersRegister();const back=host.querySelector('[data-rm-back]');if(back){back.textContent='← Restricted Members';back.onclick=()=>openGovernanceConduct('Restricted Members');}});
      const paint=()=>{
        const q=content.querySelector('[data-gc-search]').value.trim().toLowerCase(),matching=selected.filter(r=>r.slice(2).join(' ').toLowerCase().includes(q)),grid=content.querySelector('[data-gc-grid]');
        content.querySelector('[data-gc-count]').textContent=matching.length+' of '+selected.length+' documents';
        if(!topic){grid.innerHTML=topics.filter(t=>matching.some(r=>(r[2]||'Other records')===t)).map(t=>'<button class="gc-card" data-gc-topic="'+safe(t)+'"><h3>'+safe(t)+'</h3><small>'+matching.filter(r=>(r[2]||'Other records')===t).length+' documents · View</small></button>').join('')||'<p>No matching records.</p>';grid.querySelectorAll('[data-gc-topic]').forEach(b=>b.onclick=()=>openGovernanceConduct(section,b.dataset.gcTopic));}
        else grid.innerHTML=matching.map(r=>'<article class="gc-doc"><h3>'+safe(r[3])+'</h3><small>'+safe(r[5]||'On file')+'</small><p class="gc-meta">'+safe(r[4]||'Date not specified')+'</p>'+(r[7]?'<p>'+safe(r[7])+'</p>':'')+(link(r[6])?'<a class="gc-button" target="_blank" rel="noopener" href="'+safe(link(r[6]))+'">View document ↗</a>':'<p>Document link needs review.</p>')+'</article>').join('')||'<p>No matching records.</p>';
      };content.querySelector('[data-gc-search]').oninput=paint;paint();
    }catch(error){if(host.contains(content))content.textContent='Unable to load confidential records. '+error.message;}
  };
})();
