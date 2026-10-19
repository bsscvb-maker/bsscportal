(()=>{
'use strict';
const pdfIcon='<svg viewBox="0 0 32 32" aria-hidden="true"><rect x="2" y="2" width="28" height="28" rx="4" fill="#e5252a"/><path d="M17 6c-4 0 0 11 5 15 6 5 8 1 3 0-6-2-15 1-19 4-4 4 2 3 5-2 4-6 9-17 6-17Z" fill="none" stroke="white" stroke-width="1.5"/></svg>';
window.renderHistoricalBylaws=function(){
 const host=document.getElementById('recordsWorkspace'),files=window.BSSC_HISTORICAL_BYLAWS;let active=files[0]?.id;
 host.innerHTML='<nav class="minutes-breadcrumb"><button class="sponsor-tab" data-record-home>← Club Records</button><button class="sponsor-tab" data-archive-home>← Archive</button></nav><section class="records-hero"><div><h2>Archived Bylaws</h2><p>Historical versions organized by year. Original PDF wording and page layout are preserved.</p></div><button class="sponsor-tab" data-previous-portal>Previous portal version</button></section><div class="bylaws-shell"><aside class="bylaws-toc"><input type="search" data-history-search placeholder="Search year or filename…" aria-label="Search archived bylaws"><h3>Historical Versions</h3><div data-history-nav></div></aside><main class="bylaws-reader" data-history-reader></main></div>';
 const nav=host.querySelector('[data-history-nav]'),reader=host.querySelector('[data-history-reader]'),input=host.querySelector('[data-history-search]');
 function render(){
  const q=input.value.trim().toLowerCase(),matches=files.filter(f=>(f.year+' '+f.title).toLowerCase().includes(q));const file=matches.find(f=>f.id===active)||matches[0];if(file)active=file.id;
  nav.innerHTML=matches.map(f=>'<button class="'+(file?.id===f.id?'gov-active':'')+'" data-history-id="'+esc(f.id)+'"><strong>'+esc(f.year)+'</strong><small>'+esc(f.title)+'</small></button>').join('')||'<p>No matching versions.</p>';
  reader.innerHTML=file?'<article class="bylaws-article"><div class="appendix-reader-head"><div><span>HISTORICAL BYLAWS</span><h2>'+esc(file.title)+'</h2></div><a class="governance-export" href="'+esc(file.url)+'" target="_blank" rel="noopener">'+pdfIcon+'<span>Original PDF</span></a></div><iframe title="'+esc(file.title)+' original PDF" src="https://drive.google.com/file/d/'+encodeURIComponent(file.id)+'/preview" style="width:100%;height:76vh;min-height:500px;border:1px solid #d9dfe6;border-radius:8px" allow="fullscreen"></iframe><p class="minutes-muted">If the preview asks you to sign in or does not load, use Original PDF to open it in Google Drive.</p></article>':'<div class="workspace-card">No matching archived bylaws.</div>';
  nav.querySelectorAll('[data-history-id]').forEach(b=>b.onclick=()=>{active=b.dataset.historyId;render();});
 }
 input.oninput=render;host.querySelector('[data-record-home]').onclick=recordsHome;host.querySelector('[data-archive-home]').onclick=window.renderGovernanceArchive;host.querySelector('[data-previous-portal]').onclick=renderArchivedBylaws;render();
};
const priorArchive=window.renderGovernanceArchive;
window.renderGovernanceArchive=function(){priorArchive();const host=document.getElementById('recordsWorkspace'),card=host.querySelector('[data-archive-bylaws]');if(card){card.querySelector('h3').textContent='Bylaws';card.querySelector('p').textContent=window.BSSC_HISTORICAL_BYLAWS.length+' historical PDF versions · Browse by year';card.onclick=window.renderHistoricalBylaws;}};
})();
