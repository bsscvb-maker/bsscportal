/* Read-only review of original sponsor and donation records. */
(()=>{'use strict';
const key='sponsorsnew';modules[key]={title:'Sponsorships New',description:'Gifts, sponsor profiles, and source records · Duplicates combined · Review conflicts',tasks:[]};
const sourceSpecs=[
 {name:'Contribution history',book:SPREADSHEET_ID,tab:'Sponsor Contributions',range:'A1:R2000',header:0,kind:'gifts'},
 {name:'Current sponsor register',book:SPREADSHEET_ID,tab:'Sponsors - Current',range:'A1:Z200',header:0,kind:'register'},
 {name:'Prospective sponsor register',book:SPREADSHEET_ID,tab:'Sponsors - Prospective',range:'A1:Z200',header:0,kind:'register'},
 {name:'Sponsor request form',book:SPREADSHEET_ID,tab:'Requests',range:'A1:Z1000',header:0,kind:'requests'},
 {name:'BFT original donation tracker',book:BFT_SPREADSHEET_ID,tab:'Tracking Tab',range:'A1:AB1000',header:2,kind:'bft'}
];
// Ticket sales, processing fees, and listed expenses are finance activity, excluded from this sponsorship review only.
const excludedFinanceReceiptIds=new Set(["BFTCC-0034","BFTCC-0019","BFTCC-0002","BFTCC-0012","BFTCC-0013","BFTCC-0007","BFTCC-0018","BFTCC-0063","BFTCC-0030","BFTCC-0014","BFTCC-0016","BFTCC-0020","BFTCC-0060","BFTCC-0015","BFTCC-0017","BFTCC-0009","BFTCC-0038","BFTCC-0064","BFTCC-0035","BFTCC-0008","BFTCC-0025","BFTCC-0027","BFTCC-0006","BFTCC-0010","BFTCC-0037","BFTCC-0039","BFTCC-0041","BFTCC-0043","BFTCC-0045","BFTCC-0051","BFTCC-0053","BFTCC-0055","BFTCC-0057","BFTCC-0059","BFTCC-0004","BFTCC-0003","BFTCC-0061","BFTCC-0048","BFTCC-0046","BFTIK-0040","BFTIK-0041","BFTIK-0047","BFTIK-0046","BFTIK-0024","BFTIK-0036"]);
const excludedSponsorEntries=[
 {tab:'Sponsors - Prospective',name:'Arthur Murray'},
 {tab:'Sponsors - Current',name:'Boujiee Dogs & Cocktails'},
 {tab:'Sponsors - Current',name:'Custom Chic'},
 {tab:'Requests',name:'JPMorgan Chase'},
 {tab:'Sponsors - Prospective',name:'Sea Hills SPA'}
];
function includeSponsorRecord(spec,row){
 if(spec.kind==='bft'&&excludedFinanceReceiptIds.has(text(row[0])))return false;
 const name=text(spec.kind==='requests'?row[3]||row[1]:row[1]||row[3]).toLowerCase();
 return !excludedSponsorEntries.some(entry=>entry.tab===spec.tab&&entry.name.toLowerCase()===name);
}
let records=[],loaded=false,loading=false,failed=[],selected='',q='',type='',year='',version=0;
const host=document.createElement('section');host.id='sponsorshipsNewWorkspace';host.hidden=true;document.querySelector('.detail-shell').append(host);
const css=document.createElement('style');css.textContent=`#sponsorshipsNewWorkspace{padding:20px;color:#f4f4f5;background:#101013;border-radius:12px}#sponsorshipsNewWorkspace[hidden]{display:none}.sn-head{display:flex;justify-content:space-between;gap:20px;align-items:start;margin-bottom:15px}.sn-head h2{font-size:22px;margin:0 0 5px}.sn-head p,.sn-note{font-size:12px;color:#b8b8c4;line-height:1.7}.sn-controls{display:flex;gap:9px;flex-wrap:wrap;margin:16px 0}.sn-controls input,.sn-controls select{background:#1d1d23;color:#fff;border:1px solid #484851;border-radius:8px;padding:10px;font:inherit;font-size:12px;min-width:0}.sn-controls input{flex:1;min-width:200px}.sn-table-wrap{overflow:auto;max-height:72vh;border:1px solid #3e3e47;border-radius:10px}.sn-table{border-collapse:collapse;width:100%;font-size:12px;min-width:2150px}.sn-table th{position:sticky;top:0;background:#282830;color:#fff;text-align:left;padding:12px;z-index:1;white-space:nowrap}.sn-table td{padding:12px;border-bottom:1px solid #34343c;vertical-align:top;max-width:300px;white-space:pre-wrap;overflow-wrap:anywhere}.sn-table tbody tr:nth-child(even){background:#19191e}.sn-table tbody tr:hover{background:#25252d}.sn-table td:first-child{min-width:200px;font-weight:700}.sn-source{font-size:10px;color:#bcbcca}.sn-amount{white-space:nowrap!important;text-align:right;font-variant-numeric:tabular-nums}.sn-status{font-size:12px;color:#ddd;margin:12px 0}.sn-warn{color:#ffbfcb}.sn-raw{background:#16161b;color:#fff;border:1px solid #555;border-radius:12px;max-width:90vw;width:760px;max-height:85vh;overflow:auto;padding:22px}.sn-raw::backdrop{background:#000a}.sn-raw dl{display:grid;grid-template-columns:minmax(130px,1fr) 3fr;gap:0}.sn-raw dt,.sn-raw dd{padding:10px;border-bottom:1px solid #3d3d45;white-space:pre-wrap;overflow-wrap:anywhere;margin:0;font-size:12px}.sn-raw dt{color:#bcbcca}.sn-actions button{padding:7px 9px;background:#282830;color:#fff;border:1px solid #555;border-radius:7px;cursor:pointer}.sn-empty{padding:35px;color:#aaa}@media(max-width:650px){#sponsorshipsNewWorkspace{padding:12px}.sn-head{display:block}.sn-head button{margin-top:10px}.sn-controls select{width:100%}.sn-raw dl{grid-template-columns:1fr}.sn-raw dt{font-weight:700;padding-bottom:0;border:0}}`;document.head.append(css);
const nav=document.querySelector('[data-module="sponsors"]').cloneNode(true);nav.dataset.module=key;nav.lastChild.textContent='Sponsorships New';nav.onclick=()=>showModule(key);document.querySelector('[data-module="sponsors"]').after(nav);
const originalCard=document.querySelector('[data-module-card="sponsors"]');if(originalCard){const card=originalCard.cloneNode(true);card.dataset.moduleCard=key;card.querySelector('h2').textContent='Sponsorships New';card.querySelector('p').textContent='Every sponsor, contribution, date, and original source record.';card.querySelector('[data-module-status]')?.remove();card.querySelectorAll('[data-open]').forEach(b=>{b.dataset.open=key;b.textContent='View raw data';b.onclick=()=>showModule(key)});const art=card.querySelector('.home-tile-art');if(art){art.setAttribute('aria-label','Open Sponsorships New');art.onclick=()=>showModule(key)}originalCard.after(card)}
function text(v){return String(v??'').trim()}
function rowRecord(spec,row,index,headers){const r=row,record={id:spec.name+':'+index,source:spec.name,book:spec.book,tab:spec.tab,row:index,headers,raw:r,name:'',cash:'',inKind:'',date:'',status:'',level:'',contact:'',email:'',phone:'',program:'',description:'',kind:'',quantity:'',method:'',notes:'',reference:'',owner:'',expiration:''};
 if(spec.kind==='gifts')Object.assign(record,{name:r[1],contact:r[2],email:r[3],phone:r[4],kind:r[5],method:r[6],date:r[7],cash:r[8],inKind:r[9],quantity:r[10],description:r[11],program:r[12],status:r[14],owner:r[15],notes:r[16],reference:r[17]});
 if(spec.kind==='register')Object.assign(record,{name:r[1]||r[3],email:r[2],contact:r[3],phone:r[4],level:r[5],kind:r[6],cash:r[7],method:r[6],date:r[13],status:[r[19],r[10],r[14]?'Paid: '+r[14]:''].filter(Boolean).join(' · '),description:r[21],inKind:r[22],owner:r[23],expiration:r[16],reference:r[9],notes:['Record date: '+(r[0]||'Not recorded'),'Start date: '+(r[15]||'Not recorded'),'Invoice date: '+(r[11]||'Not recorded'),'Contact stage: '+(r[20]||'Not recorded')].join('\n')});
 if(spec.kind==='requests')Object.assign(record,{name:r[3]||r[1],contact:r[1],email:r[2],phone:r[4],level:r[5],cash:r[6],date:r[13],status:[r[10],r[14]?'Paid: '+r[14]:''].filter(Boolean).join(' · '),notes:['Submitted: '+(r[0]||'Not recorded'),'Requested documentation: '+(r[7]||'Not recorded'),r[8]||''].join('\n'),reference:r[9],kind:'Request / pledge — not confirmed received'});
 if(spec.kind==='bft')Object.assign(record,{name:r[1]||r[23],contact:r[2],email:r[3],description:r[4],cash:r[5],inKind:r[6],kind:[r[7],r[19]].filter(Boolean).join(' · '),date:r[8],notes:[r[9],r[20],r[27]].filter(Boolean).join('\n'),owner:r[10],method:r[19],quantity:r[21],program:'Bikes for Tykes',reference:[r[0],r[23]?'Business / source: '+r[23]:'',r[26]?'Certificate: '+r[26]:''].filter(Boolean).join(' · '),status:r[13],expiration:r[25]});
 Object.keys(record).forEach(k=>{if(!['raw','headers','row'].includes(k))record[k]=text(record[k])});record.name||='Name not recorded';return record}

function amount(v){const s=text(v).replace(/^'/,'').replace(/[$,\s]/g,'');return s!==''&&Number.isFinite(Number(s))?Number(s):null}
function money(v){const n=amount(v);return n===null?'Not recorded':new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(n)}
function norm(v){return text(v).toLowerCase().replace(/[^a-z0-9]/g,'')}
function missingName(v){return /^(donor not recorded|name not recorded|no name|unknown buyer|cash|cash donor|paypal|chase credit card)$/i.test(text(v))}

const supportCategories=['Club sponsorship payment','Cash donation','Fundraiser proceeds','Cash + noncash support','Gift card / gift certificate','Service','Experience / admission','Class / training','Item','Ongoing partner support','Noncash support — details missing','Support not specified'];
function supportCategory(r){
 const description=text(r.description),d=description.toLowerCase(),k=text(r.kind).toLowerCase();
 const hasCash=amount(r.cash)>0,hasNoncash=amount(r.inKind)>0||/in.kind/.test(k);
 if(hasCash&&hasNoncash)return 'Cash + noncash support';
 if(hasCash){
  if(/sponsor|renewal/.test(d+' '+text(r.program).toLowerCase()))return 'Club sponsorship payment';
  if(/raffle|auction|ticket|cash deposit|cash donations.*(?:pink ride|ballyhoo)|pink ride.*cash|ballyhoo.*cash/.test(d))return 'Fundraiser proceeds';
  return 'Cash donation';
 }
 if(/details (?:not yet recorded|to verify)|in.kind support/.test(d)||!description){
  return /club sponsorship|community partner/i.test(r.program+' '+r.level)?'Ongoing partner support':hasNoncash?'Noncash support — details missing':'Support not specified';
 }
 if(/cleaning|come.?clean|haircut|hair.?style|styling|photograph(?:y|er) service|maintenance|repair service|design service|printing service|storage space|meeting (?:space|room)|venue use/.test(d+' '+k))return 'Service';
 if(/course|session|training|lesson|muay thai|framework.*package|fitness|wellness/.test(d+' '+k))return 'Class / training';
 if(/admission|golf|bowling|pinboys|charter|experience|outing|tour\b/.test(d+' '+k))return 'Experience / admission';
 if(/gift.?card|gift.?cert|certificate|voucher|restaurant|dining|meal|food.*(?:credit|card)/.test(d+' '+k))return 'Gift card / gift certificate';
 // A restaurant name alone describes the tracker certificate, rather than a physical product.
 if(/icehouse restaurant|the atlantic|yard house|shadowlawn eats|murphy.s irish pub|quemar cocina|surf rider|hoss.s deli|21st street seafood|side street cantina|salt & honey|scotty quixx|local beach/.test(d)&&norm(description)===norm(r.business))return 'Gift card / gift certificate';
 if(hasNoncash||/shirt|purse|bag|backpack|whiskey|whisky|bourbon|beer|stool|bike|axe|canvas|basket|print|sunglass|jacket|tank top|dress|clock|sign|wallet|blaster/.test(d))return 'Item';
 return 'Support not specified';
}

function prepare(r){
 r.originalName=r.name;r.business=r.tab==='Tracking Tab'?text(r.raw[23]):'';
 r.review=[];r.nameBasis='Recorded donor';
 if(missingName(r.name)){
  const match=r.description.match(/donation\s*[-–—]\s*(.+)$/i);
  if(match&&!missingName(match[1])){r.name=text(match[1]);r.nameBasis='Named in donation description'}
  else{r.name='Donor unconfirmed';r.nameBasis='Donor missing in source'}
 }
 // A named business can be the donor without an individual contact.
 if(r.name==='Donor unconfirmed'&&r.business&&(
 norm(r.business)===norm(r.description)||/^Big Ugly Brewing$/i.test(r.business)
 )){
 r.name=r.business;r.nameBasis='Business donor'; 
 }
 r.support=supportCategory(r);
 if(r.name==='Donor unconfirmed')r.review.push('Confirm who donated; business / brand is context only');
 if(r.tab==='Tracking Tab'&&/^chase credit card$/i.test(r.originalName))r.method='Credit card (source: Chase)';
 if(r.tab==='Tracking Tab'&&/^paypal$/i.test(r.originalName))r.method='PayPal';
 r.members=[{...r}];return r;
}
function giftToken(r){const m=r.reference.match(/BFTIK-(\d+)/i)||r.reference.match(/BFT Charity Tracker item\s*(\d+)/i);return m?'BFTIK-'+m[1].padStart(4,'0'):''}

function receivedDateKey(value){
 const s=text(value),us=s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/),iso=s.match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T].*)?$/);
 if(us)return us[3]+'-'+us[1].padStart(2,'0')+'-'+us[2].padStart(2,'0');
 if(iso)return iso[1]+'-'+iso[2]+'-'+iso[3];
 return s;
}
function donorKey(name){
 const n=norm(name);
 if(/stuart/i.test(name)&&/s[yi]l[vb][ai]/i.test(name)&&/jordan/i.test(name))return 'stuartandsylviajordan';
 return n;
}
const excludedReviewDescriptions=new Set(["Ballyhoo’s – Cash Donations","Cash Deposit","Pink Ride – Raffle Basket – Cash Donations","1•SEA California Polarized Sunglasses – Round","1•SEA California Polarized Sunglasses – Wraparound","BoneShakers Bikes for Tykes Handmade Wooden Sign","BoneShakers Harley-Davidson Handmade Wall Clock","Buckshot stool","Framed Jeff Gordon / DuPont No. 24 NASCAR collectible print"].map(norm));
function excludeUnusableGift(r){
 if(excludedReviewDescriptions.has(norm(r.description)))return true;
 if(/^(?:teresa|theresa)\s+stevens$/i.test(text(r.name)))return true;
 return r.name==='Donor unconfirmed'&&/^(?:bikes?\s+(?:for\s+tykes|protect)\s+donation|cash donation received)(?:\s*[-–—]\s*(?:no name|unknown))?$/i.test(text(r.description));
}

function reconcile(input){
 const profiles=[],gifts=[];let excluded=0;
 input.forEach(source=>{
 const r=prepare({...source,raw:source.raw.slice()});
 if(excludeUnusableGift(r)){excluded++;return}
 if(/register|request form/i.test(r.source)){profiles.push(r);return}
 if(/\bVOID\b|bank interest|club.funded prize|planned club purchase|^club purchase$/i.test([r.description,r.method,r.name].join(' '))||amount(r.cash)<0){excluded++;return}
 const token=giftToken(r);
 const same=gifts.find(g=>{
 if(g.members.some(x=>x.source===r.source))return false;
 if(token&&giftToken(g)===token)return true;
 const sameDonor=donorKey(g.name)===donorKey(r.name)&&g.name!=='Donor unconfirmed';
 const sameCash=amount(g.cash)>0&&amount(g.cash)===amount(r.cash)&&g.date&&receivedDateKey(g.date)===receivedDateKey(r.date);
 const sameItem=norm(g.description)===norm(r.description)&&amount(g.inKind)>0&&amount(g.inKind)===amount(r.inKind)&&(!g.date||!r.date||receivedDateKey(g.date)===receivedDateKey(r.date));
 return sameDonor&&(sameCash||sameItem);
 });
 if(!same){gifts.push(r);return}
 const before={...same};same.members.push(r);
 const fieldPairs=[['name','Donor'],['cash','Money amount'],['inKind','Item / service value'],['date','Received date']];
 fieldPairs.forEach(([field,label])=>{
 const a=text(before[field]),b=text(r[field]);
 const hasA=field==='cash'||field==='inKind'?amount(a)>0:!!a;
 const hasB=field==='cash'||field==='inKind'?amount(b)>0:!!b;
 if(hasA&&hasB&&(field==='cash'||field==='inKind'?amount(a)!==amount(b):field==='date'?receivedDateKey(a)!==receivedDateKey(b):donorKey(a)!==donorKey(b)))same.review.push(label+' differs between sources: '+a+' / '+b);
 });
 // The original item tracker supplies the item identity. Preserve disagreements for review.
 if(r.tab==='Tracking Tab'&&token){['name','originalName','nameBasis','description','cash','inKind','business','method','quantity'].forEach(k=>same[k]=r[k]);}
 ['date','contact','email','phone','program','level','expiration','owner','business'].forEach(k=>{if(!text(same[k]))same[k]=r[k]});
 same.review=[...new Set([...same.review,...r.review])];
 });
 gifts.forEach(g=>{g.support=supportCategory(g);if(!g.date)g.review.push('Received date not recorded');g.review=[...new Set(g.review)];});
 return {gifts,profiles,excluded};
}
let view='gifts';
function reviewData(){return reconcile(records)}
function classify(r){return r.support||prepare({...r,raw:r.raw||[]}).support}
function visibleRecords(){
 const data=reviewData();return (view==='profiles'?data.profiles:data.gifts).filter(r=>
 (!selected||r.members.some(m=>m.source===selected))&&
 (!type||(type==='Needs review'?r.review.length>0:r.support===type))&&
 (!year||r.date.includes(year))&&
 (!q||[r.name,r.business,r.nameBasis,...r.members.flatMap(m=>[...m.raw,m.name,m.description,m.reference,m.source]),...r.review].join(' ').toLowerCase().includes(q.toLowerCase()))
 ).sort((a,b)=>a.name.localeCompare(b.name,undefined,{sensitivity:'base'})||a.description.localeCompare(b.description));
}
function exportCsv(){
 const headers=['Donor / business','Contact person','Email','Phone','Support given','Money received (recorded)','Items / services estimated value','Date received','What they gave','Quantity','Program','Payment method'];
 const data=visibleRecords().map(r=>[r.name==='Donor unconfirmed'?'':r.name,r.contact,r.email,r.phone,r.support,r.cash,r.inKind,r.date,r.description,r.quantity,r.program,r.method]);
 const cell=v=>{v=String(v??'');if(/^\s*[=+@-]/.test(v)&&!/^\s*-?\d+(\.\d+)?\s*$/.test(v))v="'"+v;return '"'+v.replace(/"/g,'""')+'"'};
 const csv='\uFEFF'+[headers,...data].map(row=>row.map(cell).join(',')).join('\r\n');
 const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8;'}));const a=document.createElement('a');a.href=url;a.download='BSSC-Sponsorships-New-'+view+'-'+new Date().toLocaleDateString('en-CA',{timeZone:'America/New_York'})+'.csv';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function draw(){
 host.innerHTML='<div class="sn-head"><div><h2>Sponsorships New</h2><p>Gifts are separate from sponsor profiles. Matching copies of a gift appear once.</p></div><div><button class="sponsor-tab" data-sn-export '+(loading?'disabled':'')+'>Export CSV</button> <button class="sponsor-tab" data-sn-refresh '+(loading?'disabled':'')+'>Refresh records</button></div></div>'+
 '<div class="sn-controls"><button class="sponsor-tab" data-sn-view="gifts" '+(view==='gifts'?'style="background:#8a1735;color:white"':'')+'>Gifts received</button><button class="sponsor-tab" data-sn-view="profiles" '+(view==='profiles'?'style="background:#8a1735;color:white"':'')+'>Sponsor profiles / requests</button></div>'+
 '<p class="sn-note">Support given describes the contribution: sponsorship payment, cash donation, fundraiser proceeds, item, service, certificate, experience, training, or partner support. Categories use the recorded description and contribution type. Item and service values are estimates, not money received. “Not recorded” is not zero. Named business donors do not require an individual contact. A product brand alone does not identify its donor. Conflicting names or values are flagged rather than silently corrected. Source details retain every original entry. Ticket sales, listed expenses, voids, bank interest and club-funded prizes are excluded from gifts.</p>'+
 '<div class="sn-controls"><input data-sn-search aria-label="Search" placeholder="Search donor, business, item or notes…" value="'+esc(q)+'"><select data-sn-source aria-label="Source"><option value="">All sources</option>'+sourceSpecs.map(s=>'<option '+(selected===s.name?'selected':'')+'>'+esc(s.name)+'</option>').join('')+'</select><select data-sn-type aria-label="Support given"><option value="">All support</option>'+[...supportCategories,'Needs review'].map(t=>'<option '+(type===t?'selected':'')+'>'+t+'</option>').join('')+'</select><select data-sn-year aria-label="Year"><option value="">All years / unknown dates</option>'+[...new Set(records.map(r=>(r.date.match(/\b20\d{2}\b/)||[])[0]).filter(Boolean))].sort().reverse().map(y=>'<option '+(year===y?'selected':'')+'>'+y+'</option>').join('')+'</select></div><p class="sn-status" data-sn-status role="status"></p><div class="sn-table-wrap"><table class="sn-table" style="min-width:1500px"><thead><tr>'+['Donor / business','Contact person','Support given','Money recorded','Item / service value','Received date','What they gave','Quantity','Review notes','Source details'].map(t=>'<th>'+t+'</th>').join('')+'</tr></thead><tbody data-sn-body></tbody></table></div>';
 host.querySelector('[data-sn-export]').onclick=exportCsv;
 host.querySelector('[data-sn-refresh]').onclick=()=>load(true);
 host.querySelectorAll('[data-sn-view]').forEach(b=>b.onclick=()=>{view=b.dataset.snView;draw()});
 host.querySelector('[data-sn-search]').oninput=e=>{q=e.target.value;drawRows()};
 host.querySelector('[data-sn-source]').onchange=e=>{selected=e.target.value;drawRows()};
 host.querySelector('[data-sn-type]').onchange=e=>{type=e.target.value;drawRows()};
 host.querySelector('[data-sn-year]').onchange=e=>{year=e.target.value;drawRows()};drawRows();
}
function drawRows(){
 const visible=visibleRecords(),data=reviewData();
 host.querySelector('[data-sn-status]').textContent=loading?'Loading records…':visible.length+' visible '+(view==='gifts'?'gifts':'profiles / requests')+' · '+data.gifts.length+' gift records after combining '+(records.length-data.profiles.length-data.excluded-data.gifts.length)+' duplicate copies · '+(sourceSpecs.length-failed.length)+' of '+sourceSpecs.length+' sources loaded'+(failed.length?' · Unavailable: '+failed.join(', '):'');
 host.querySelector('[data-sn-body]').innerHTML=visible.map((r,i)=>'<tr><td>'+esc(r.name)+'<div class="sn-source">'+esc(r.nameBasis)+'</div></td><td>'+esc(r.contact||'—')+'</td><td>'+esc(r.support)+(view==='profiles'?'<div class="sn-source">Profile amount; not an additional gift</div>':'')+'</td><td class="sn-amount">'+(amount(r.cash)>0?esc(money(r.cash)):amount(r.cash)===0?'$0.00 recorded':'Not recorded')+'</td><td class="sn-amount">'+esc(money(r.inKind))+'</td><td>'+esc(r.date||'Not recorded')+'</td><td>'+esc(r.description||r.level||'Details not recorded')+'</td><td>'+esc(r.quantity||'—')+'</td><td class="'+(r.review.length?'sn-warn':'')+'">'+esc(r.review.join('\n')||'—')+'</td><td class="sn-actions"><button data-sn-raw="'+i+'">View '+r.members.length+' source '+(r.members.length===1?'record':'records')+'</button></td></tr>').join('')||'<tr><td colspan="10" class="sn-empty">'+(loading?'Loading…':'No matching records.')+'</td></tr>';
 host.querySelectorAll('[data-sn-raw]').forEach(b=>b.onclick=()=>showRaw(visible[Number(b.dataset.snRaw)]));
}
function showRaw(r){
 const dialog=document.createElement('dialog');dialog.className='sn-raw';
 dialog.innerHTML='<div class="sn-head"><div><h2>'+esc(r.name)+'</h2><p>'+esc(r.description)+'</p></div><button class="sponsor-tab" data-close>Close</button></div><p class="sn-warn">'+esc(r.review.join(' · '))+'</p>'+r.members.map(m=>'<h3>'+esc(m.source)+' · '+esc(m.tab)+' · row '+m.row+'</h3><dl>'+Array.from({length:Math.max(m.headers.length,m.raw.length)},(_,i)=>'<dt>'+esc(m.headers[i]||'Column '+(i+1))+'</dt><dd>'+esc(text(m.raw[i])||'Not recorded')+'</dd>').join('')+'</dl>').join('');
 document.body.append(dialog);dialog.querySelector('[data-close]').onclick=()=>dialog.close();dialog.onclose=()=>dialog.remove();dialog.showModal();
}
async function load(force=false){if(loading||loaded&&!force)return;loading=true;draw();const current=++version;const results=await Promise.allSettled(sourceSpecs.map(s=>getSheetValues("'"+s.tab+"'!"+s.range,s.book)));if(current!==version)return;records=[];failed=[];results.forEach((r,i)=>{const spec=sourceSpecs[i];if(r.status!=='fulfilled'){failed.push(spec.name);return}const rows=r.value,headers=rows[spec.header]||[];rows.slice(spec.header+1).forEach((row,j)=>{if(row.some(v=>text(v))&&(spec.kind!=='bft'||text(row[0]))&&includeSponsorRecord(spec,row))records.push(rowRecord(spec,row,spec.header+j+2,headers))})});loading=false;loaded=true;draw()}
const originalShow=showModule;showModule=function(moduleKey){host.hidden=true;originalShow(moduleKey);if(moduleKey===key){document.getElementById('detailTasks').innerHTML='';host.hidden=false;load()}};
})();
