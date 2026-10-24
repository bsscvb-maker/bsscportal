/* Read-only review of original sponsor and donation records. */
(()=>{'use strict';
const key='sponsorsnew';modules[key]={title:'Sponsorships',description:'Donor directory · Giving history · Annual follow-up planning',tasks:[]};
const sourceSpecs=[
 {name:'Contribution history',book:SPREADSHEET_ID,tab:'Sponsor Contributions',range:'A1:R2000',header:0,kind:'gifts'},
 {name:'Current sponsor register',book:SPREADSHEET_ID,tab:'Sponsors - Current',range:'A1:Z200',header:0,kind:'register'},
 {name:'Prospective sponsor register',book:SPREADSHEET_ID,tab:'Sponsors - Prospective',range:'A1:Z200',header:0,kind:'register'},
 {name:'Sponsor request form',book:SPREADSHEET_ID,tab:'Requests',range:'A1:Z1000',header:0,kind:'requests'},
 {name:'BFT original donation tracker',book:BFT_SPREADSHEET_ID,tab:'Tracking Tab',range:'A1:AB1000',header:2,kind:'bft'}
];
// Ticket sales, processing fees, and listed expenses are finance activity, excluded from this sponsorship review only.
const excludedFinanceReceiptIds=new Set(["BFTCC-0034","BFTCC-0019","BFTCC-0002","BFTCC-0012","BFTCC-0013","BFTCC-0007","BFTCC-0018","BFTCC-0063","BFTCC-0030","BFTCC-0014","BFTCC-0016","BFTCC-0020","BFTCC-0060","BFTCC-0015","BFTCC-0017","BFTCC-0009","BFTCC-0038","BFTCC-0064","BFTCC-0035","BFTCC-0008","BFTCC-0025","BFTCC-0027","BFTCC-0006","BFTCC-0010","BFTCC-0037","BFTCC-0039","BFTCC-0041","BFTCC-0043","BFTCC-0045","BFTCC-0051","BFTCC-0053","BFTCC-0055","BFTCC-0057","BFTCC-0059","BFTCC-0004","BFTCC-0003","BFTCC-0061","BFTCC-0048","BFTCC-0046","BFTIK-0040","BFTIK-0041","BFTIK-0047","BFTIK-0046","BFTIK-0024","BFTIK-0036","BFTCC-0044"]);
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
const directoryStyles=document.createElement('style');directoryStyles.textContent="\n#sponsorshipsNewWorkspace{padding:0;background:transparent}\n.sn-command{padding:28px;background:linear-gradient(125deg,#24141c,#17171e 66%);border:1px solid #49303e;border-radius:18px}\n.sn-command .sn-head h2{font-size:32px;line-height:1.18;letter-spacing:-.7px;margin:10px 0}\n.sn-command .sn-head h2 span{color:#f1a0b5}\n.sn-eyebrow{font-size:10px;font-weight:800;letter-spacing:2px;color:#e3a5b7}\n.sn-top-actions{display:flex;gap:8px;flex-wrap:wrap}\n#sponsorshipsNewWorkspace .sponsor-tab{border:1px solid #59505c;border-radius:8px;background:#28232d;color:#fff;padding:10px 13px;cursor:pointer;font:inherit;font-size:12px}\n#sponsorshipsNewWorkspace button:focus-visible,#sponsorshipsNewWorkspace select:focus-visible,.sn-donor-dialog a:focus-visible{outline:3px solid #f1a0b5;outline-offset:3px}\n#sponsorshipsNewWorkspace button:disabled{cursor:default;opacity:.75}\n.sn-metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-top:24px}\n.sn-metric{background:#ffffff08;color:#fff;border:1px solid #ffffff16;text-align:left;padding:18px;border-radius:12px;min-width:0}\n.sn-metric span,.sn-metric small{display:block;font-size:11px;color:#c2b8c3;line-height:1.5}\n.sn-metric strong{display:block;font-size:27px;letter-spacing:-.5px;margin:8px 0;overflow-wrap:anywhere}\n.sn-metric[data-metric]{cursor:pointer}.sn-metric[data-metric]:hover{border-color:#d9859e;background:#ffffff10}\n.sn-nav{display:flex;gap:5px;padding:6px;background:#17171d;border:1px solid #34313b;border-radius:12px;margin:22px 0 16px;width:fit-content;max-width:100%;overflow:auto}\n.sn-nav button{background:transparent;border:0;color:#bab5c2;white-space:nowrap;padding:11px 20px;font:inherit;font-size:13px;cursor:pointer;border-radius:8px;font-weight:700}\n.sn-nav button[aria-pressed=\"true\"]{background:#8e2647;color:#fff}\n.sn-list-head{display:flex;justify-content:space-between;align-items:center;gap:12px;margin:24px 0 10px}\n.sn-list-head h3{font-size:20px;margin:0 0 4px}.sn-list-head p{color:#b5afbd;font-size:12px;margin:0}\n.sn-list-options{display:flex;gap:8px;flex-wrap:wrap}\n.sn-list-options select{border:1px solid #48434f;background:#1c1b23;color:#eee;border-radius:8px;padding:10px;font-size:12px;max-width:100%}\n.sn-directory{display:grid;gap:10px}\n.sn-donor-row{display:grid;grid-template-columns:minmax(210px,1.7fr) minmax(150px,1.1fr) minmax(130px,.8fr) minmax(165px,1fr) 92px;gap:18px;align-items:center;text-align:left;background:#1a191f;color:#f7f3f7;border:1px solid #38323e;border-radius:12px;padding:20px;cursor:pointer;font:inherit;width:100%}\n.sn-donor-row:hover{background:#242029;border-color:#a65a73}\n.sn-donor-name{display:flex;align-items:center;gap:12px;min-width:0}\n.sn-donor-row strong{display:block;font-size:14px;line-height:1.5}\n.sn-donor-row small{display:block;font-size:11px;color:#b6aebf;line-height:1.55;margin-top:5px;overflow-wrap:anywhere}\n.sn-monogram{flex-shrink:0;display:grid;place-items:center;width:40px;height:40px;border-radius:12px;background:#5b293d;color:#ffccdb;font-size:13px;font-weight:800}\n.sn-tag{display:inline-block;font-size:10px;border:1px solid #514554;border-radius:6px;padding:4px 7px;margin:2px 4px 2px 0;background:#302533;color:#f5dce5}\n.sn-donor-value strong{font-size:20px}\n.sn-follow{display:inline-block;padding:4px 8px;border-radius:5px;font-size:10px;font-weight:700;color:#a2dec1;background:#16342a;margin-bottom:4px}\n.sn-follow-due{color:#ffd4a3;background:#49321b}.sn-follow-missing{color:#ccc1dc;background:#342b40}\n.sn-open-label{font-size:11px;color:#eea3ba;text-align:right;font-weight:700}\n.sn-footnote{margin-top:20px;padding-top:15px;border-top:1px solid #38303b}\n.sn-donor-dialog{width:940px;max-width:93vw}\n.sn-donor-totals{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}\n.sn-donor-totals>div{padding:16px;border:1px solid #49404e;border-radius:10px;background:#231e29}\n.sn-donor-totals span{font-size:11px;color:#bfb3c7;display:block}.sn-donor-totals strong{font-size:20px;display:block;margin-top:7px}\n.sn-contact-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}\n.sn-contact{padding:14px;border:1px solid #423b49;border-radius:9px;overflow-wrap:anywhere}.sn-contact p{font-size:12px;color:#c8bfce}\n.sn-contact-actions{display:flex;gap:8px;flex-wrap:wrap}.sn-contact-actions a{color:#f4bdd0;background:#4b293d;border-radius:7px;padding:8px 12px;font-size:12px;text-decoration:none}\n.sn-history{display:grid;gap:10px}.sn-history article{padding:16px;border:1px solid #42394a;border-radius:10px;background:#201c26}.sn-history-heading{display:flex;align-items:center;justify-content:space-between;gap:10px;font-size:12px;color:#c0b4cb}.sn-history h4{margin:10px 0;font-size:14px}.sn-history p{font-size:12px;color:#bfb3c8;line-height:1.7}\n@media(max-width:1150px){.sn-donor-row{grid-template-columns:minmax(200px,1.5fr) 1fr 1fr}.sn-donor-support{grid-column:1}.sn-next-ask{grid-column:3;grid-row:1 / span 2}.sn-open-label{display:none}.sn-donor-value{grid-column:2;grid-row:1 / span 2}}\n@media(max-width:700px){.sn-command{padding:20px 15px}.sn-command .sn-head h2{font-size:27px}.sn-metrics{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.sn-metric{padding:12px}.sn-metric strong{font-size:23px}.sn-nav{width:100%}.sn-nav button{padding:10px 13px}.sn-list-head{align-items:start;flex-direction:column}.sn-donor-row{grid-template-columns:1fr 1fr;padding:15px;gap:12px}.sn-donor-name{grid-column:1 / -1}.sn-donor-support{grid-column:1 / -1}.sn-donor-value{grid-row:auto;grid-column:1}.sn-next-ask{grid-row:auto;grid-column:2}.sn-donor-totals{grid-template-columns:1fr}.sn-contact-grid{grid-template-columns:1fr}.sn-list-options{width:100%}.sn-list-options select{flex:1}.sn-top-actions{margin-top:12px}}\n";document.head.append(directoryStyles);
const simpleStyles=document.createElement('style');simpleStyles.textContent=".sn-metrics[hidden]{display:none!important}.sn-category-bar{display:flex;gap:8px;flex-wrap:wrap;margin:18px 0}.sn-category-bar button{padding:10px 17px;border:1px solid #514451;background:#211d26;color:#e8dfeb;border-radius:20px;cursor:pointer;font-size:12px}.sn-category-bar button[aria-pressed=\"true\"]{background:#8e2647;border-color:#c76a87;color:white}.sn-browse-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px;margin:16px 0 30px}.sn-browse-grid button{background:#211c28;border:1px solid #4a3b51;border-radius:12px;padding:20px 16px;color:#fff;text-align:left;cursor:pointer}.sn-browse-grid button:hover{border-color:#e29ab0}.sn-browse-grid strong,.sn-browse-grid span{display:block}.sn-browse-grid span{font-size:12px;color:#d4b3c6;margin-top:10px}.sn-donor-table{min-width:1050px!important}.sn-donor-table th:nth-child(5),.sn-donor-table th:nth-child(6){color:#ffd4e1}.sn-donor-table td:nth-child(5),.sn-donor-table td:nth-child(6){min-width:145px}.sn-donor-link{border:0;background:none;color:#ffc3d7;font:inherit;text-align:left;font-weight:700;padding:0;cursor:pointer}.sn-donor-link:hover{text-decoration:underline}.sn-donor-table .sn-source{display:block;margin-top:6px}.sn-donor-table .sn-follow{margin-top:7px}@media(max-width:700px){.sn-browse-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.sn-browse-grid button{padding:16px}}";document.head.append(simpleStyles);
const readableStyles=document.createElement('style');readableStyles.textContent="\n/* High contrast reading styles for donor dashboard, lists, and dialogs. */\n#sponsorshipsNewWorkspace{color:#fff;background:#080808;font-size:15px;line-height:1.6}\n#sponsorshipsNewWorkspace .sn-command{background:#111;border-color:#737373}\n#sponsorshipsNewWorkspace .sn-head h2,#sponsorshipsNewWorkspace .sn-head h2 span{color:#fff;font-size:30px}\n#sponsorshipsNewWorkspace .sn-eyebrow{color:#fff;font-size:12px;letter-spacing:1px}\n#sponsorshipsNewWorkspace .sn-head p,#sponsorshipsNewWorkspace .sn-note,#sponsorshipsNewWorkspace .sn-status,#sponsorshipsNewWorkspace .sn-list-head p{color:#eee;font-size:14px;line-height:1.7}\n#sponsorshipsNewWorkspace .sn-metric{background:#1b1b1b;color:#fff;border:1px solid #858585;opacity:1;padding:20px}\n#sponsorshipsNewWorkspace .sn-metric span,#sponsorshipsNewWorkspace .sn-metric small{color:#eee;font-size:13px}\n#sponsorshipsNewWorkspace .sn-metric strong{color:#fff;font-size:30px}\n#sponsorshipsNewWorkspace .sn-metric:hover,#sponsorshipsNewWorkspace .sn-browse-grid button:hover{background:#303030;border-color:#fff}\n#sponsorshipsNewWorkspace .sn-nav{background:#111;border-color:#777}\n#sponsorshipsNewWorkspace .sn-nav button{color:#fff;font-size:15px;padding:12px 20px}\n#sponsorshipsNewWorkspace .sn-nav button[aria-pressed=\"true\"],#sponsorshipsNewWorkspace .sn-category-bar button[aria-pressed=\"true\"]{background:#fff;color:#080808;border:2px solid #fff;font-weight:800}\n#sponsorshipsNewWorkspace .sn-category-bar button{background:#151515;color:#fff;border:2px solid #888;font-size:14px;padding:10px 17px}\n#sponsorshipsNewWorkspace .sn-category-bar button:hover{border-color:#fff}\n#sponsorshipsNewWorkspace .sn-browse-grid button{background:#181818;color:#fff;border:1px solid #888}\n#sponsorshipsNewWorkspace .sn-browse-grid strong{font-size:17px;color:#fff}\n#sponsorshipsNewWorkspace .sn-browse-grid span{font-size:14px;color:#eee}\n#sponsorshipsNewWorkspace .sn-controls input{background:#161616;color:#fff;border:1px solid #aaa;font-size:15px;padding:13px}\n#sponsorshipsNewWorkspace .sn-controls input::placeholder{color:#d0d0d0;opacity:1}\n#sponsorshipsNewWorkspace .sn-table-wrap{background:#111;border:1px solid #888}\n#sponsorshipsNewWorkspace .sn-table{font-size:15px;color:#fff}\n#sponsorshipsNewWorkspace .sn-table th,#sponsorshipsNewWorkspace .sn-donor-table th:nth-child(5),#sponsorshipsNewWorkspace .sn-donor-table th:nth-child(6){background:#333;color:#fff;font-size:15px;padding:16px 14px;border-bottom:2px solid #aaa}\n#sponsorshipsNewWorkspace .sn-table td{padding:18px 14px;border-bottom:1px solid #666;color:#fff}\n#sponsorshipsNewWorkspace .sn-table tbody tr:nth-child(odd){background:#101010}\n#sponsorshipsNewWorkspace .sn-table tbody tr:nth-child(even){background:#242424}\n#sponsorshipsNewWorkspace .sn-table tbody tr:hover{background:#363636}\n#sponsorshipsNewWorkspace .sn-donor-link{color:#fff;font-size:16px;text-decoration:underline;text-underline-offset:4px}\n#sponsorshipsNewWorkspace .sn-source{color:#e0e0e0;font-size:13px;line-height:1.6}\n#sponsorshipsNewWorkspace .sn-tag{background:#333;color:#fff;border:1px solid #aaa;font-size:13px;padding:5px 8px}\n#sponsorshipsNewWorkspace .sn-follow,.sn-donor-dialog .sn-follow{background:#fff;color:#111;border:1px solid #fff;font-size:12px;font-weight:800}\n#sponsorshipsNewWorkspace .sn-follow-due{background:#ffdf80;color:#111;border-color:#ffdf80}\n#sponsorshipsNewWorkspace .sn-follow-missing{background:#e1e1e1;color:#111;border-color:#e1e1e1}\n#sponsorshipsNewWorkspace .sn-actions button,#sponsorshipsNewWorkspace .sponsor-tab,.sn-raw .sponsor-tab{background:#fff;color:#111;border:2px solid #fff;border-radius:8px;font-size:14px;font-weight:700;padding:10px 13px;cursor:pointer}\n#sponsorshipsNewWorkspace .sponsor-tab:disabled{background:#333;color:#ccc;border-color:#777}\n#sponsorshipsNewWorkspace .sn-empty{color:#eee;font-size:15px}\n.sn-raw{background:#101010;color:#fff;border:2px solid #bbb;font-size:15px}\n.sn-raw .sn-head p,.sn-raw .sn-note,.sn-raw .sn-source{color:#eee;font-size:14px}\n.sn-raw h2,.sn-raw h3,.sn-raw h4{color:#fff}\n.sn-raw .sn-eyebrow{color:#fff;font-size:12px}\n.sn-raw .sn-donor-totals>div,.sn-raw .sn-contact,.sn-raw .sn-history article{background:#202020;border-color:#888}\n.sn-raw .sn-donor-totals span,.sn-raw .sn-contact p,.sn-raw .sn-history p,.sn-raw .sn-history-heading{color:#eee;font-size:14px}\n.sn-raw .sn-donor-totals strong{color:#fff;font-size:23px}\n.sn-raw .sn-contact-actions a{background:#fff;color:#111;font-size:14px;font-weight:700}\n.sn-raw .sn-tag{background:#333;color:#fff;border-color:#aaa;font-size:13px}\n.sn-raw dt{color:#eee;font-size:14px}.sn-raw dd{color:#fff;font-size:14px}\n.sn-raw .sn-warn{color:#ffe194;font-size:14px}\n#sponsorshipsNewWorkspace button:focus-visible,.sn-raw button:focus-visible,.sn-raw a:focus-visible{outline:3px solid #ffdf80;outline-offset:3px}\n@media(max-width:700px){#sponsorshipsNewWorkspace .sn-nav button{font-size:14px;padding:12px}#sponsorshipsNewWorkspace .sn-metric strong{font-size:25px}#sponsorshipsNewWorkspace .sn-command .sn-head h2{font-size:27px}}\n";document.head.append(readableStyles);
const nav=document.querySelector('[data-module="sponsors"]').cloneNode(true);nav.dataset.module=key;nav.lastChild.textContent='Sponsorships';nav.onclick=()=>showModule(key);document.querySelector('[data-module="sponsors"]').after(nav);
const originalCard=document.querySelector('[data-module-card="sponsors"]');if(originalCard){const card=originalCard.cloneNode(true);card.dataset.moduleCard=key;card.querySelector('h2').textContent='Sponsorships';card.querySelector('p').textContent='Donors, giving history, contacts, and the next annual ask.';card.querySelector('[data-module-status]')?.remove();card.querySelectorAll('[data-open]').forEach(b=>{b.dataset.open=key;b.textContent='View raw data';b.onclick=()=>showModule(key)});const art=card.querySelector('.home-tile-art');if(art){art.setAttribute('aria-label','Open Sponsorships');art.onclick=()=>showModule(key)}originalCard.after(card)}
function text(v){return String(v??'').trim()}
function rowRecord(spec,row,index,headers){const r=row,record={id:spec.name+':'+index,source:spec.name,book:spec.book,tab:spec.tab,row:index,headers,raw:r,name:'',cash:'',inKind:'',date:'',status:'',level:'',contact:'',email:'',phone:'',program:'',description:'',kind:'',quantity:'',method:'',notes:'',reference:'',owner:'',expiration:''};
 if(spec.kind==='gifts')Object.assign(record,{name:r[1],contact:r[2],email:r[3],phone:r[4],kind:r[5],method:r[6],date:r[7],cash:r[8],inKind:r[9],quantity:r[10],description:r[11],program:r[12],status:r[14],owner:r[15],notes:r[16],reference:r[17]});
 if(spec.kind==='register')Object.assign(record,{name:r[1]||r[3],email:r[2],contact:r[3],phone:r[4],level:r[5],kind:r[6],cash:r[7],method:r[6],date:r[13],status:[r[19],r[10],r[14]?'Paid: '+r[14]:''].filter(Boolean).join(' · '),description:r[21],inKind:r[22],owner:r[23],expiration:r[16],reference:r[9],notes:['Record date: '+(r[0]||'Not recorded'),'Start date: '+(r[15]||'Not recorded'),'Invoice date: '+(r[11]||'Not recorded'),'Contact stage: '+(r[20]||'Not recorded')].join('\n')});
 if(spec.kind==='requests')Object.assign(record,{name:r[3]||r[1],contact:r[1],email:r[2],phone:r[4],level:r[5],cash:r[6],date:r[13],status:[r[10],r[14]?'Paid: '+r[14]:''].filter(Boolean).join(' · '),notes:['Submitted: '+(r[0]||'Not recorded'),'Requested documentation: '+(r[7]||'Not recorded'),r[8]||''].join('\n'),reference:r[9],kind:'Request / pledge — not confirmed received'});
 if(spec.kind==='bft')Object.assign(record,{name:r[1]||r[23],contact:r[2],email:r[3],description:r[4],cash:r[5],inKind:r[6],kind:[r[7],r[19]].filter(Boolean).join(' · '),date:r[8],notes:[r[9],r[20],r[27]].filter(Boolean).join('\n'),owner:r[10],method:r[19],quantity:r[21],program:'Bikes for Tykes',reference:[r[0],r[23]?'Business / source: '+r[23]:'',r[26]?'Certificate: '+r[26]:''].filter(Boolean).join(' · '),status:r[13],expiration:r[25]});
 Object.keys(record).forEach(k=>{if(!['raw','headers','row'].includes(k))record[k]=text(record[k])});record.name||='Name not recorded';return record}

function amount(v){const s=text(v).replace(/^'/,'').replace(/[$,\s]/g,'');return s!==''&&Number.isFinite(Number(s))?Number(s):null}
function money(v){const n=amount(v);return n===null?'Not recorded':new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(n)}

function receivedMonthParts(value){
 const s=text(value);if(!s)return null;
 let m=s.match(/^(\d{4})-(\d{2})(?:-\d{2}(?:[ T].*)?)?$/);if(m)return {year:Number(m[1]),month:Number(m[2])};
 m=s.match(/^(\d{1,2})\/(?:\d{1,2}\/)?(\d{4})$/);if(m)return {year:Number(m[2]),month:Number(m[1])};
 m=s.match(/^([A-Za-z]+)\s+(\d{4})$/);if(m){const month=['january','february','march','april','may','june','july','august','september','october','november','december'].indexOf(m[1].toLowerCase());if(month>=0)return {year:Number(m[2]),month:month+1}}
 return null;
}
function receivedMonth(value){
 const p=receivedMonthParts(value);return p&&p.month>=1&&p.month<=12?new Intl.DateTimeFormat('en-US',{month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(Date.UTC(p.year,p.month-1,1))):text(value);
}
function renewalMonthEnd(value){
 const p=receivedMonthParts(value);if(!p||p.month<1||p.month>12)return '';
 return new Intl.DateTimeFormat('en-US',{month:'long',day:'numeric',year:'numeric',timeZone:'UTC'}).format(new Date(Date.UTC(p.year+1,p.month,0)));
}
function formatPhone(value){const original=text(value);let digits=original.replace(/\D/g,'');if(digits.length===11&&digits[0]==='1')digits=digits.slice(1);return digits.length===10?digits.slice(0,3)+'-'+digits.slice(3,6)+'-'+digits.slice(6):original}
function exportMoney(value){return amount(value)===null?'':money(value)}
function norm(v){return text(v).toLowerCase().replace(/[^a-z0-9]/g,'')}
function missingName(v){return /^(donor not recorded|name not recorded|no name|unknown buyer|cash|cash donor|paypal|chase credit card)$/i.test(text(v))}

const supportCategories=['Sponsor','Cash donation','Vouchers','Item','Services','Facilities','Other'];
function supportCategory(r){
 const description=text(r.description),d=description.toLowerCase(),k=text(r.kind).toLowerCase();
 const hasCash=amount(r.cash)>0,hasNoncash=amount(r.inKind)>0||/in.kind/.test(k);
 if(hasCash&&hasNoncash)return 'Other';
 if(hasCash){
  if(/sponsor|renewal/.test(d+' '+text(r.program).toLowerCase()))return 'Sponsor';
  if(/raffle|auction|ticket|cash deposit|cash donations.*(?:pink ride|ballyhoo)|pink ride.*cash|ballyhoo.*cash/.test(d))return 'Fundraiser proceeds';
  return 'Cash donation';
 }
 if(/details (?:not yet recorded|to verify)|in.kind support/.test(d)||!description){
  return /club sponsorship|community partner/i.test(r.program+' '+r.level)?'Other':hasNoncash?'Other':'Other';
 }
 if(/cleaning|come.?clean|haircut|hair.?style|styling|photograph(?:y|er) service|maintenance|repair service|design service|printing service|storage space|meeting (?:space|room)|venue use/.test(d+' '+k))return 'Services';
 if(/course|session|training|lesson|muay thai|framework.*package|fitness|wellness/.test(d+' '+k))return 'Vouchers';
 if(/admission|golf|bowling|pinboys|charter|experience|outing|tour\b/.test(d+' '+k))return 'Vouchers';
 if(/gift.?card|gift.?cert|certificate|voucher|restaurant|dining|meal|food.*(?:credit|card)/.test(d+' '+k))return 'Vouchers';
 // A restaurant name alone describes the tracker certificate, rather than a physical product.
 if(/icehouse restaurant|the atlantic|yard house|shadowlawn eats|murphy.s irish pub|quemar cocina|surf rider|hoss.s deli|21st street seafood|side street cantina|salt & honey|scotty quixx|local beach/.test(d)&&norm(description)===norm(r.business))return 'Vouchers';
 if(hasNoncash||/shirt|purse|bag|backpack|whiskey|whisky|bourbon|beer|stool|bike|axe|canvas|basket|print|sunglass|jacket|tank top|dress|clock|sign|wallet|blaster/.test(d))return 'Item';
 return 'Other';
}

const confirmedItemDonors=[{"id":"BFTIK-0022","name":"Debby and John Farland","description":"Buffalo Trace Bourbon Cream Liqueur — 750 mL"},{"id":"BFTIK-0014","name":"Ironclad Harley-Davidson","description":"Harley-Davidson 120th Anniversary Backpack / Cooler Bag – Black"},{"id":"BFTIK-0020","name":"Ironclad Harley-Davidson","description":"Harley-Davidson Embossed Bar & Shield Leather Billfold Wallet – Black"},{"id":"BFTIK-0052","name":"Ironclad Harley-Davidson","description":"Harley-Davidson Leather Bifold Clutch - Black"},{"id":"BFTIK-0019","name":"Ironclad Harley-Davidson","description":"Harley-Davidson Tabletop S'mores Kit"},{"id":"BFTIK-0016","name":"Ironclad Harley-Davidson","description":"Harley-Davidson Trade Cycles Leather-Texture Dealer Sign"},{"id":"BFTIK-0013","name":"Ironclad Harley-Davidson","description":"Harley-Davidson Women's Canvas & Leather Hobo Purse – Black"},{"id":"BFTIK-0018","name":"Ironclad Harley-Davidson","description":"Harley-Davidson Women's Studded Crossbody Bag – Black"},{"id":"BFTIK-0021","name":"Debby and John Farland","description":"Johnnie Walker Double Black Blended Scotch Whisky — 750 mL"},{"id":"BFTIK-0042","name":"SISSTR","description":"SISSTR Roamin Jacket – Army – Size S"},{"id":"BFTIK-0043","name":"SISSTR","description":"SISSTR Wave Lover Knit Tank Top – Multi"},{"id":"BFTIK-0044","name":"SISSTR","description":"SISSTR Wild at Heart Woven Mini Dress – Coconut"},{"id":"BFTIK-0017","name":"Viking Bags","description":"Viking Bags American Flag Motorcycle Backpack / Luggage Bag"},{"id":"BFTIK-0012","name":"Debby and John Farland","description":"Vintage 'The Legend Has Retired' 2026 Whiskey Gift Set"},{"id":"BFTIK-0015","name":"Debby and John Farland","description":"ZURU X-Shot Excel Ultimate Shootout Blaster Pack"}];
function applyConfirmedItemDonor(r){const id=(r.reference.match(/BFTIK-\d+/i)||[])[0];const correction=confirmedItemDonors.find(x=>(id&&x.id===id.toUpperCase())||norm(x.description)===norm(r.description));if(correction){r.name=correction.name;r.nameBasis='Donor confirmed by Todd';}}
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
 applyConfirmedItemDonor(r);
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
 if(donorKey(r.name)==='walkkulik'&&amount(r.cash)===20&&receivedDateKey(r.date)==='2026-09-27')return true;
 if(excludedReviewDescriptions.has(norm(r.description)))return true;
 if(/^(?:teresa|theresa)\s+stevens$/i.test(text(r.name)))return true;
 return r.name==='Donor unconfirmed'&&/^(?:bikes?\s+(?:for\s+tykes|protect)\s+donation|cash donation received)(?:\s*[-–—]\s*(?:no name|unknown))?$/i.test(text(r.description));
}


let reviewedRows=[],reviewedReady=false,reviewError='',personType='';
function applyReviewedGift(g){
 const keys=new Set(g.members.map(m=>m.tab+'|'+m.raw[0]));
 const match=reviewedRows.find(row=>{
  try{return JSON.parse(row[13]||'[]').some(key=>keys.has(key))}catch(e){return false}
 });
 if(!match)return;
 const fields=['name','personType','contact','email','phone','support','cash','inKind','date','description','quantity','program','method'];
 fields.forEach((field,i)=>g[field]=text(match[i]));
 g.fee=text(match[14]);g.net=text(match[15]);g.transactionId=text(match[16]);
 g.nameBasis='Todd’s reviewed file';
 g.review=g.review.filter(note=>!note.startsWith('Donor differs')&&!note.startsWith('Money amount differs')&&!note.startsWith('Item / service value differs')&&!note.startsWith('Received date differs')&&!note.startsWith('Confirm who donated'));
}
function applyReviewedProfile(p){
 const matches=reviewedRows.filter(row=>donorKey(row[0])===donorKey(p.name));
 if(!matches.length)return;
 p.personType=text(matches.find(row=>text(row[1]))?.[1]);
 const supports=[...new Set(matches.map(row=>text(row[5])))];
 if(supports.length===1)p.support=supports[0];
 for(const [field,column] of [['contact',2],['email',3],['phone',4]]){const value=matches.find(row=>text(row[column]));if(value)p[field]=text(value[column])}
}


function includeReviewedPaypal(gifts){
 const columns=['name','personType','contact','email','phone','support','cash','inKind','date','description','quantity','program','method'];
 reviewedRows.forEach(row=>{
 let keys=[];try{keys=JSON.parse(row[13]||'[]')}catch(e){return}
 const key=keys.find(k=>k.startsWith('PayPal|'));if(!key)return;
 const txn=key.slice(7);
 if(gifts.some(g=>g.transactionId===txn||g.members.some(m=>m.reference?.includes(txn))))return;
 const fields=Object.fromEntries(columns.map((field,i)=>[field,text(row[i])]));
 const headers=['Transaction ID',...columns,'Source keys','Processing fee','Net received','PayPal transaction ID'];
 const record=prepare({...fields,id:'PayPal:'+txn,source:'PayPal transaction history',book:SPREADSHEET_ID,tab:'PayPal',row:reviewedRows.indexOf(row)+2,headers,raw:[txn,...row],reference:txn,kind:'Donation',level:'',status:'Completed',notes:'Imported from Todd’s PayPal history. Amount given is gross, before processing fees.',owner:'',expiration:'',business:''});
 Object.assign(record,fields,{fee:text(row[14]),net:text(row[15]),transactionId:txn,nameBasis:'PayPal history confirmed by Todd'});
 gifts.push(record);
 });
}

function reconcile(input){
 const profiles=[],gifts=[];let excluded=0;
 input.forEach(source=>{
 const r=prepare({...source,raw:source.raw.slice()});
 if(excludeUnusableGift(r)||r.tab==='Sponsor Contributions'&&text(r.raw[0])==='SC-LEGACY-13'){excluded++;return}
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
 gifts.forEach(g=>{g.support=supportCategory(g);applyReviewedGift(g);if(!g.date)g.review.push('Received date not recorded');g.review=[...new Set(g.review)];});
 includeReviewedPaypal(gifts);
 profiles.forEach(applyReviewedProfile);
 return {gifts,profiles,excluded};
}
let view='dashboard';
function reviewData(){const data=reconcile(records);[...data.gifts,...data.profiles].forEach(r=>r.phone=formatPhone(r.phone));return data}
function classify(r){return r.support||prepare({...r,raw:r.raw||[]}).support}
function visibleRecords(){
 const data=reviewData();return (view==='profiles'?data.profiles:data.gifts).filter(r=>
 (!selected||r.members.some(m=>m.source===selected))&&(!personType||r.personType===personType)&&
 (!type||(type==='Needs review'?r.review.length>0:type==='Cash support'?amount(r.cash)>0:type==='Noncash'?['Item','Vouchers','Services','Facilities'].includes(r.support):r.support===type))&&
 (!year||r.date.includes(year))&&
 (!q||[r.name,r.business,r.nameBasis,r.contact,r.email,r.phone,r.personType,...r.members.flatMap(m=>[...m.raw,m.name,m.description,m.reference,m.source]),...r.review].join(' ').toLowerCase().includes(q.toLowerCase()))
 ).sort((a,b)=>a.name.localeCompare(b.name,undefined,{sensitivity:'base'})||a.description.localeCompare(b.description));
}
function exportCsv(){
 const headers=['Donor / business','Person/Business','Contact person','Email','Phone','Support given','Money given (before fees)','Items / services estimated value','Month received','What they gave','Quantity','Program','Payment method','Processing fee','Net received'];
 const data=visibleRecords().map(r=>[r.name==='Donor unconfirmed'?'':r.name,r.personType,r.contact,r.email,r.phone,r.support,exportMoney(r.cash),exportMoney(r.inKind),receivedMonth(r.date),r.description,r.quantity,r.program,r.method,exportMoney(r.fee),exportMoney(r.net)]);
 const cell=v=>{v=String(v??'');if(/^\s*[=+@-]/.test(v)&&!/^\s*-?\d+(\.\d+)?\s*$/.test(v))v="'"+v;return '"'+v.replace(/"/g,'""')+'"'};
 const csv='\uFEFF'+[headers,...data].map(row=>row.map(cell).join(',')).join('\r\n');
 const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8;'}));const a=document.createElement('a');a.href=url;a.download='BSSC-Sponsorships-New-'+view+'-'+new Date().toLocaleDateString('en-CA',{timeZone:'America/New_York'})+'.csv';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}

let followFilter='all',sortMode='name';
function planningToday(){const s=new Intl.DateTimeFormat('en-CA',{timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());return Date.parse(s+'T00:00:00Z')}
function dueKey(date){const p=receivedMonthParts(date);return p&&p.month>=1&&p.month<=12?Date.UTC(p.year+1,p.month,0):null}
function donorGroups(gifts){
 const groups=new Map();
 gifts.forEach(r=>{
 const key=donorKey(r.name)||r.id;
 if(!groups.has(key))groups.set(key,{key,name:r.name,personType:r.personType,gifts:[],cash:0,noncash:0,cashKnown:false,noncashKnown:false,categories:new Set(),contacts:[],lastDate:'',lastKey:0});
 const d=groups.get(key);d.gifts.push(r);d.categories.add(r.support);
 if(amount(r.cash)!==null){d.cash+=amount(r.cash);d.cashKnown=true}
 if(amount(r.inKind)!==null){d.noncash+=amount(r.inKind);d.noncashKnown=true}
 const p=receivedMonthParts(r.date),k=p?Date.UTC(p.year,p.month-1,1):0;if(k>d.lastKey){d.lastKey=k;d.lastDate=r.date}
 if(r.contact||r.email||r.phone){const signature=[norm(r.contact),norm(r.email),norm(r.phone)].join('|');if(!d.contacts.some(c=>c.signature===signature))d.contacts.push({signature,name:r.contact,email:r.email,phone:r.phone})}
 });
 return [...groups.values()].map(d=>{d.next=dueKey(d.lastDate);d.days=d.next===null?null:Math.ceil((d.next-planningToday())/86400000);d.follow=d.days===null?'Date needed':d.days<0?'Overdue':d.days<=30?'Due within 30 days':d.days<=90?'Due within 90 days':'Upcoming';return d});
}
function formatAsk(timestamp){return timestamp===null?'Date needed':new Intl.DateTimeFormat('en-US',{month:'long',year:'numeric',timeZone:'UTC'}).format(timestamp)}
function filteredDonors(){
 // Renewal timing always uses the latest known gift across the full history.
 const all=new Map(donorGroups(reviewData().gifts).map(d=>[d.key,d]));
 return donorGroups(visibleRecords()).map(d=>({...d,next:(all.get(d.key)||d).next,days:(all.get(d.key)||d).days,follow:(all.get(d.key)||d).follow,lastDate:(all.get(d.key)||d).lastDate}))
 .filter(d=>followFilter==='all'||followFilter==='due'&&d.days!==null&&d.days<=90||followFilter==='missing'&&d.next===null||followFilter==='upcoming'&&d.days>90)
 .sort((a,b)=>sortMode==='cash'?b.cash-a.cash||a.name.localeCompare(b.name):sortMode==='followup'?(a.next??Infinity)-(b.next??Infinity)||a.name.localeCompare(b.name):a.name.localeCompare(b.name));
}
function downloadCsv(headers,rows,label){
 const cell=value=>{let v=String(value??'');if(/^\s*[=+@-]/.test(v)&&!/^\s*-?\d+(\.\d+)?\s*$/.test(v))v="'"+v;return '"'+v.replace(/"/g,'""')+'"'};
 const url=URL.createObjectURL(new Blob(['\uFEFF'+[headers,...rows].map(r=>r.map(cell).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8;'}));
 const a=document.createElement('a');a.href=url;a.download='BSSC-'+label+'-'+new Date().toLocaleDateString('en-CA',{timeZone:'America/New_York'})+'.csv';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function exportDonors(){downloadCsv(['Donor / business','Person/Business','Contact people','Email','Phone','Cash given (before fees)','Noncash estimated value','Support given','Gift count','Latest known gift month','Ask again (month end)','Follow-up status'],filteredDonors().map(d=>[d.name,d.personType,[...new Set(d.contacts.map(c=>c.name).filter(Boolean))].join('; '),[...new Set(d.contacts.map(c=>c.email).filter(Boolean))].join('; '),[...new Set(d.contacts.map(c=>c.phone).filter(Boolean))].join('; '),d.cashKnown?money(d.cash):'',d.noncashKnown?money(d.noncash):'',[...d.categories].join('; '),d.gifts.length,receivedMonth(d.lastDate),formatAsk(d.next),d.follow]),'Donor-follow-up')}
function contactLinks(c){return (c.email&&/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(c.email)?'<a href="mailto:'+esc(c.email)+'">Email</a>':'')+(c.phone?'<a href="tel:'+esc(c.phone.replace(/[^\d+]/g,''))+'">Call '+esc(c.phone)+'</a>':'')}
function showDonor(d){
 const full=donorGroups(reviewData().gifts).find(x=>x.key===d.key)||d;
 const dialog=document.createElement('dialog');dialog.className='sn-raw sn-donor-dialog';
 dialog.innerHTML='<div class="sn-head"><div><div class="sn-eyebrow">DONOR HISTORY</div><h2>'+esc(d.name)+'</h2><p>'+esc(d.personType||'Supporter')+'</p></div><button class="sponsor-tab" data-close aria-label="Close donor details">Close</button></div>'+
 '<div class="sn-donor-totals"><div><span>Cash given · all years</span><strong>'+esc(full.cashKnown?money(full.cash):'Not recorded')+'</strong></div><div><span>Noncash value · all years</span><strong>'+esc(full.noncashKnown?money(full.noncash):'Not recorded')+'</strong></div><div><span>Ask again · month end</span><strong>'+esc(formatAsk(full.next))+'</strong></div></div>'+
 '<p class="sn-note">Annual ask uses the latest known gift month, plus one year, at month end. '+(full.gifts.some(g=>!g.date)?'Some gifts have no received date; confirm timing before contacting.':'')+'</p>'+
 '<h3>Who to contact</h3><div class="sn-contact-grid">'+(full.contacts.map(c=>'<div class="sn-contact"><strong>'+esc(c.name||'Contact details')+'</strong><p>'+esc(c.email||'Email not recorded')+'</p><div class="sn-contact-actions">'+contactLinks(c)+'</div></div>').join('')||'<p class="sn-note">No contact details recorded.</p>')+'</div><h3>What they gave</h3><div class="sn-history">'+full.gifts.slice().sort((a,b)=>(receivedMonthParts(b.date)?.year||0)-(receivedMonthParts(a.date)?.year||0)||String(b.date).localeCompare(a.date)).map((r,i)=>'<article><div class="sn-history-heading"><span class="sn-tag">'+esc(r.support)+'</span><span>'+esc(receivedMonth(r.date)||'Month not recorded')+'</span></div><h4>'+esc(r.description||r.support)+'</h4><p>'+[amount(r.cash)>0?'Cash: '+money(r.cash):'',amount(r.inKind)!==null?'Noncash value: '+money(r.inKind):'',r.quantity?'Quantity: '+r.quantity:'',r.program||''].filter(Boolean).map(esc).join(' · ')+'</p><button class="sponsor-tab" data-gift="'+i+'">Gift details</button></article>').join('')+'</div>';
 const sorted=full.gifts.slice().sort((a,b)=>(receivedMonthParts(b.date)?.year||0)-(receivedMonthParts(a.date)?.year||0)||String(b.date).localeCompare(a.date));
 document.body.append(dialog);dialog.querySelector('[data-close]').onclick=()=>dialog.close();dialog.onclose=()=>dialog.remove();dialog.querySelectorAll('[data-gift]').forEach(b=>b.onclick=()=>showRaw(sorted[Number(b.dataset.gift)]));dialog.showModal();
}

function selectDirectory(category='',ask=false){type=category;q='';year='';personType='';selected='';view=ask?'ask':'donors';followFilter=ask?'due':'all';sortMode=ask?'followup':'name';draw()}
function draw(){
 host.innerHTML='<div class="sn-command"><div class="sn-head"><div><div class="sn-eyebrow">BSSC · SPONSORSHIPS</div><h2>'+(view==='dashboard'?'Donor dashboard':view==='ask'?'Who to ask again':'All donors')+'</h2><p>Who gave. What they gave. When to ask again.</p></div><div class="sn-top-actions"><button class="sponsor-tab" data-sn-export '+(loading||!reviewedReady?'disabled':'')+'>Export donor list</button><button class="sponsor-tab" data-sn-refresh '+(loading?'disabled':'')+'>Refresh records</button></div></div><div class="sn-metrics" data-sn-metrics '+(view==='dashboard'?'':'hidden')+'></div></div>'+
 '<div class="sn-nav" role="group" aria-label="Sponsorship views">'+[['dashboard','Dashboard'],['donors','All donors'],['ask','Ask again']].map(([v,l])=>'<button type="button" data-sn-view="'+v+'" aria-pressed="'+(view===v)+'">'+l+'</button>').join('')+'</div>'+
 (view==='dashboard'?'':'<div class="sn-category-bar" role="group" aria-label="Donation category">'+[['','All'],['Sponsor','Sponsor'],['Cash donation','Cash donation'],['Vouchers','Vouchers'],['Item','Items'],['Facilities','Facilities'],['Noncash','All in-kind'],['Cash support','All cash']].map(([v,l])=>'<button type="button" data-category="'+v+'" aria-pressed="'+(type===v)+'">'+l+'</button>').join('')+'</div><div class="sn-controls"><input data-sn-search aria-label="Search donors" placeholder="Search a donor or contact…" value="'+esc(q)+'"></div>')+
 '<p class="sn-status" data-sn-status role="status"></p><div data-sn-results></div><p class="sn-note sn-footnote">Received and Ask again show month and year. Ask again means the end of that month next year, based on the latest dated gift. Click a donor’s name or View donor for their history and contacts.</p>';
 host.querySelector('[data-sn-export]').onclick=exportDonors;
 host.querySelector('[data-sn-refresh]').onclick=()=>load(true);
 host.querySelectorAll('[data-sn-view]').forEach(b=>b.onclick=()=>{view=b.dataset.snView;type='';q='';year='';personType='';selected='';followFilter=view==='ask'?'due':'all';sortMode=view==='ask'?'followup':'name';draw()});
 host.querySelectorAll('[data-category]').forEach(b=>b.onclick=()=>{type=b.dataset.category;draw()});
 const search=host.querySelector('[data-sn-search]');if(search)search.oninput=e=>{q=e.target.value;drawRows()};drawRows();
}
function directoryTable(donors){
 return '<div class="sn-table-wrap"><table class="sn-table sn-donor-table"><thead><tr>'+['Donor / business','Support given','Cash given','Noncash value','Received','Ask again',''].map(t=>'<th>'+t+'</th>').join('')+'</tr></thead><tbody>'+donors.map((d,i)=>'<tr><td><button class="sn-donor-link" data-donor="'+i+'">'+esc(d.name)+'</button><small class="sn-source">'+esc([...new Set(d.contacts.map(c=>c.name).filter(Boolean))].join(', ')||'Contact not recorded')+'</small></td><td>'+[...d.categories].map(t=>'<span class="sn-tag">'+esc(t)+'</span>').join('')+'</td><td class="sn-amount">'+esc(d.cashKnown?money(d.cash):'—')+'</td><td class="sn-amount">'+esc(d.noncashKnown?money(d.noncash):'—')+'</td><td>'+esc(receivedMonth(d.lastDate)||'Date needed')+'</td><td><strong>'+esc(formatAsk(d.next))+'</strong><br><span class="sn-follow '+(d.days!==null&&d.days<=90?'sn-follow-due':d.next===null?'sn-follow-missing':'')+'">'+esc(d.follow)+'</span></td><td class="sn-actions"><button data-donor="'+i+'">View donor</button></td></tr>').join('')+'</tbody></table></div>'+(donors.length?'':'<div class="sn-empty">No donors in this category'+(view==='ask'?' are overdue or due within 90 days':'')+'.</div>');
}
function drawRows(){
 const data=reviewData(),all=donorGroups(data.gifts),due=all.filter(d=>d.days!==null&&d.days<=90).sort((a,b)=>a.next-b.next),missing=all.filter(d=>d.next===null);
 host.querySelector('[data-sn-metrics]').innerHTML=[['Donors',all.length,'Click to see all donors','all'],['Cash given',money(data.gifts.reduce((s,r)=>s+(amount(r.cash)||0),0)),'All years · before fees','cash'],['Noncash value',money(data.gifts.reduce((s,r)=>s+(amount(r.inKind)||0),0)),'Items, vouchers and facilities','noncash'],['Ask again soon',due.length,'Overdue or due within 90 days','due']].map(([label,value,note,target])=>'<button type="button" class="sn-metric" data-summary="'+target+'"><span>'+label+'</span><strong>'+esc(value)+'</strong><small>'+note+'</small></button>').join('');
 host.querySelectorAll('[data-summary]').forEach(b=>b.onclick=()=>selectDirectory(b.dataset.summary==='cash'?'Cash support':b.dataset.summary==='noncash'?'Noncash':'',b.dataset.summary==='due'));
 const shown=filteredDonors();
 host.querySelector('[data-sn-status]').textContent=loading?'Loading donors…':(view==='dashboard'?all.length+' donors · '+data.gifts.length+' gifts':shown.length+' donors shown')+(failed.length?' · Some records unavailable. Refresh to retry.':'')+(reviewError?' · Reviewed updates unavailable. Refresh to retry.':'');
 const results=host.querySelector('[data-sn-results]');if(loading){results.innerHTML='<div class="sn-empty">Loading donor records…</div>';return}
 let tableDonors=shown;
 if(view==='dashboard'){
 const categories=[['Sponsor','Sponsors'],['Cash donation','Cash donations'],['Vouchers','Vouchers'],['Item','Items'],['Facilities','Facilities']];
 results.innerHTML='<h3>Browse donors by support</h3><div class="sn-browse-grid">'+categories.map(([key,label])=>{const gifts=data.gifts.filter(r=>r.support===key),count=donorGroups(gifts).length;return '<button type="button" data-home-category="'+key+'"><strong>'+label+'</strong><span>'+count+' '+(count===1?'donor':'donors')+' →</span></button>'}).join('')+'</div><div class="sn-list-head"><div><h3>Next requests</h3><p>Overdue or due within 90 days.</p></div><button class="sponsor-tab" data-open-queue>See who to ask</button></div><div data-dashboard-table></div>'+(missing.length?'<p class="sn-note">'+missing.length+' donors need a received month before an ask-again month can be calculated.</p>':'');
 tableDonors=due.slice(0,5);results.querySelector('[data-dashboard-table]').innerHTML=directoryTable(tableDonors);
 results.querySelectorAll('[data-home-category]').forEach(b=>b.onclick=()=>selectDirectory(b.dataset.homeCategory));
 results.querySelector('[data-open-queue]').onclick=()=>selectDirectory('',true);
 }else results.innerHTML=directoryTable(shown);
 results.querySelectorAll('[data-donor]').forEach(b=>b.onclick=()=>showDonor(tableDonors[Number(b.dataset.donor)]));
}

function showRaw(r){
 const dialog=document.createElement('dialog');dialog.className='sn-raw';
 dialog.innerHTML='<div class="sn-head"><div><h2>'+esc(r.name)+'</h2><p>'+esc(r.description)+'</p>'+(renewalMonthEnd(r.date)?'<p>Annual follow-up target: '+esc(renewalMonthEnd(r.date))+' (month-end planning)</p>':'')+'</div><button class="sponsor-tab" data-close>Close</button></div><p class="sn-warn">'+esc(r.review.join(' · '))+'</p>'+r.members.map(m=>'<h3>'+esc(m.source)+' · '+esc(m.tab)+' · row '+m.row+'</h3><dl>'+Array.from({length:Math.max(m.headers.length,m.raw.length)},(_,i)=>'<dt>'+esc(m.headers[i]||'Column '+(i+1))+'</dt><dd>'+esc(text(m.raw[i])||'Not recorded')+'</dd>').join('')+'</dl>').join('');
 document.body.append(dialog);dialog.querySelector('[data-close]').onclick=()=>dialog.close();dialog.onclose=()=>dialog.remove();dialog.showModal();
}

async function load(force=false){
 if(loading||loaded&&!force)return;
 loading=true;draw();const current=++version;
 const results=await Promise.allSettled([...sourceSpecs.map(s=>getSheetValues("'"+s.tab+"'!"+s.range,s.book)),getSheetValues("'Sponsorships New Reviewed'!A1:Q1000",SPREADSHEET_ID)]);
 if(current!==version)return;
 const reviewed=results.pop();reviewError='';reviewedReady=reviewed.status==='fulfilled';
 if(reviewedReady){reviewedRows=reviewed.value.slice(1).filter(row=>row[0]&&row[13]);}
 else{reviewError='Retry Refresh records';}
 records=[];failed=[];
 results.forEach((r,i)=>{
 const spec=sourceSpecs[i];if(r.status!=='fulfilled'){failed.push(spec.name);return}
 const rows=r.value,headers=rows[spec.header]||[];
 rows.slice(spec.header+1).forEach((row,j)=>{if(row.some(v=>text(v))&&(spec.kind!=='bft'||text(row[0]))&&includeSponsorRecord(spec,row))records.push(rowRecord(spec,row,spec.header+j+2,headers))});
 });
 loading=false;loaded=true;draw();
}
// Retire the original module after its replacement navigation has been built.
document.querySelectorAll('[data-module="sponsors"],[data-module-card="sponsors"],[data-mobile-module="sponsors"]').forEach(element=>element.remove());
window.portalViewAdapters=window.portalViewAdapters||{};
window.portalViewAdapters.sponsorships={module:'sponsorsnew',refresh:()=>load(),capture:()=>({selected,q,type,year,personType,view,followFilter,sortMode}),restore:s=>{selected=s.selected;q=s.q;type=s.type;year=s.year;personType=s.personType;view=s.view;followFilter=s.followFilter;sortMode=s.sortMode}};
const originalShow=showModule;showModule=function(moduleKey){if(moduleKey==='sponsors')moduleKey=key;host.hidden=true;originalShow(moduleKey);if(moduleKey===key){document.getElementById('detailTasks').innerHTML='';host.hidden=false;load()}};
})();
