(function(root){
'use strict';
const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const summaryLayoutStyle=".bod-history #bod-history-ballot .bod-results-stats{margin:18px 0 22px;position:static;gap:14px}.bod-history #bod-history-ballot .bod-panel-heading{display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap}.bod-history #bod-history-ballot .bod-panel-heading h3{margin:0;min-width:0;flex:1 1 240px}.bod-history #bod-history-ballot [data-history-export]{flex:0 0 auto}.bod-history #bod-history-ballot .bod-stat{min-width:0}@media(max-width:460px){.bod-history #bod-history-ballot .bod-results-stats{gap:8px}.bod-history #bod-history-ballot .bod-stat{padding:12px 9px}.bod-history #bod-history-ballot .bod-stat>span{font-size:12px}}";
let year=2026,snapshotIndex=0,selectionYears=null;
function leadershipMarkup(record,index=0){
 const snapshots=record.leadershipSnapshots||[],snapshot=snapshots[index]||snapshots[0];
 const rows=snapshot?.rows||record.officers||[];
 const names=rows.filter(r=>!r.additional),additional=rows.filter(r=>r.additional);
 const table=items=>`<div class="bod-history-table"><table><thead><tr><th scope="col">Position</th><th scope="col">Board member / status</th></tr></thead><tbody>${items.map(r=>`<tr><th scope="row">${escape(r.position)}</th><td>${r.status?escape(r.name):`<button type="button" class="board-record-name" data-board-record-name="${escape(r.name.replace(/\s*\(.*$/,''))}" data-board-record-year="${record.year}">${escape(r.name)}</button>`}</td></tr>`).join('')}</tbody></table></div>`;
 return `<section class="bod-results-panel" id="bod-history-officers"><div class="bod-panel-heading"><h3>Officer selections</h3><span class="bod-total-badge">${record.year} Board</span></div>${snapshots.length>1?`<label>Board lineup <select data-history-snapshot aria-label="Board lineup">${snapshots.map((v,i)=>`<option value="${i}" ${v===snapshot?'selected':''}>${i===0?'Original selections':'Update '+i}</option>`).join('')}</select></label>`:''}${names.length?table(names):'<p>Officer selections are not available for this year.</p>'}${additional.length?`<details><summary>Additional club roles</summary>${table(additional)}</details>`:''}</section>`;
}
function markup(data,selected,snapshot=0){
 const record=data[selected],candidates=record.candidates||[];
 return `<section class="bod-results bod-history" aria-label="Board election history"><header class="bod-hero"><label class="bod-year-picker">Board service year <select data-history-year aria-label="Board service year">${(selectionYears||Object.keys(data)).slice().sort((a,b)=>b-a).map(y=>`<option value="${y}" ${Number(y)===Number(selected)?'selected':''}>${y}</option>`).join('')}</select></label><p class="bod-results-kicker">BONESHAKERS · BOARD OF DIRECTORS</p><h2>Board Elections <span>${selected}</span></h2><p>Officers, candidates and election totals.</p></header>
 ${leadershipMarkup(record,snapshot)}
 <section class="bod-results-panel" id="bod-history-ballot"><div class="bod-panel-heading"><h3>Candidate nominations &amp; ballot totals</h3><button type="button" data-history-export ${candidates.length?'':'disabled'}>Export CSV</button></div>
 <div class="bod-results-stats">${[['Candidates',candidates.length||'—'],['Ballots counted',record.ballots??'—'],['Valid ballots',record.ballots!==undefined&&record.invalid!==undefined?record.ballots:'—']].map(([label,value])=>`<div class="bod-stat"><span>${label}</span><strong>${value}</strong></div>`).join('')}</div>
 ${record.date?`<p>Election held ${escape(record.date)}${record.eligible!==undefined?' · '+record.eligible+' eligible members':''}${record.invalid!==undefined?' · '+record.invalid+' invalid ballots':''}</p>`:''}
 ${candidates.length?`<div class="bod-history-table"><table><thead><tr><th scope="col">Candidate / nominee</th><th scope="col">Nominations</th><th scope="col">Ballot votes</th><th scope="col">Outcome</th></tr></thead><tbody>${candidates.map(c=>`<tr><th scope="row">${escape(c.name)}</th><td>${c.nominations??'—'}</td><td>${c.votes??'—'}</td><td>${c.outcome==='Elected'?'✓ ':''}${escape(c.outcome==='Unconfirmed'?'Not available':c.outcome)}</td></tr>`).join('')}</tbody></table></div><p>— = total not available.</p>`:'<p>Candidate nomination and ballot totals are not available for this year.</p>'}
 ${record.retained?`<p><strong>Retained Board seat:</strong> ${record.retained.map(escape).join('; ')}</p>`:''}${record.declined?`<h4>Declined nomination</h4><ul>${record.declined.map(n=>`<li>${escape(n)}</li>`).join('')}</ul>`:''}</section></section>`;
}
function csv(record){const cell=v=>'"'+String(v??'').replace(/"/g,'""')+'"';return [['Year','Candidate','Nominations','Ballot votes','Outcome'],...record.candidates.map(c=>[record.year,c.name,c.nominations,c.votes,c.outcome])].map(r=>r.map(cell).join(',')).join('\r\n');}
function load(selected,years){
 if(selected!==undefined){year=Number(selected);snapshotIndex=0;}
 if(years)selectionYears=years;
 if(typeof accessToken==='undefined'||!accessToken)return;
 currentMembershipSheet='BOD Nominations 2027';root.BSSCBodNominations.installStyle();
 if(!document.getElementById('bod-history-style')){const style=document.createElement('style');style.id='bod-history-style';style.textContent=summaryLayoutStyle+'.bod-history .bod-results-panel{margin:18px 0;padding:24px}.bod-history-table{overflow-x:auto}.bod-history table{width:100%;border-collapse:collapse;color:inherit}.bod-history th,.bod-history td{text-align:left;padding:13px;border-bottom:1px solid #cbd0d6}.bod-history button,.bod-history select,.bod-history summary{min-height:44px}.bod-history .bod-stat strong{font-size:clamp(22px,4vw,38px)}.bod-history label{display:block;margin:12px 0}.bod-history select{margin-left:8px;padding:8px}.bod-history details{margin-top:20px}.bod-history summary{cursor:pointer;padding:10px 0}';document.head.appendChild(style);}
 const target=document.getElementById('membershipContent');target.innerHTML=markup(root.BSSCBodElectionHistoryData,year,snapshotIndex);
 const status=document.getElementById('membershipStatus');status.classList.remove('lifer-summary');status.textContent='Board Elections · '+year;
 target.querySelector('[data-history-year]').addEventListener('change',e=>{root.BSSCBodNominations.selectYear(e.target.value);});
 target.querySelector('[data-history-snapshot]')?.addEventListener('change',e=>{snapshotIndex=Number(e.target.value);load();});
 target.querySelector('[data-history-export]').addEventListener('click',()=>{const url=URL.createObjectURL(new Blob(['\ufeff'+csv(root.BSSCBodElectionHistoryData[year])],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='BSSC_BOD_Election_'+year+'.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
}
root.BSSCBodElectionHistory={summaryLayoutStyle,markup,leadershipMarkup,csv,load};
})(typeof window==='undefined'?globalThis:window);
