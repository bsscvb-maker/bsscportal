const test=require('node:test');
const assert=require('node:assert/strict');
const {buildModel,buildAdminMutation,parseCandidates,parseHistory,historyMarkup,markup}=require('./bod-nominations-results.js');
const headers=['Submitted At','Reference','Member Key','Nominator','Nominee Count','Nominees','Candidate IDs'];
const candidates=[{id:'1',name:'Test One',roadName:''},{id:'2',name:'Test Two',roadName:'Road'},{id:'3',name:'=literal name',roadName:''}];
const row=(ref,key,ids)=>['10/27/2026 03:00:00',ref,key,'Test Member',ids.length,ids.map(id=>candidates.find(c=>c.id===id).name).join(' | '),JSON.stringify(ids)];
function setup(rows=[headers,row('r1','member1',['1']),row('r2','member2',['2'])]){
 return {rows,record:buildModel(rows).submissions.find(r=>r.memberKey==='member1'),action:'edit',ids:['2','3'],reason:'Member requested correction',actor:'president@boneshakerssocialclub.com',candidates,nominationSheetId:100,auditSheetId:200,at:'2026-10-27T10:00:00Z',operationId:'test-operation'};
}
function apply(rows,requests){
 const copy=rows.map(row=>[...row]);
 for(const {updateCells:u} of requests){if(!u)continue;const r=u.range.startRowIndex;u.rows[0].values.forEach((cell,i)=>{const value=cell.userEnteredValue;copy[r][u.range.startColumnIndex+i]=value.stringValue??value.numberValue;});}
 return copy;
}
test('editing saves a complete audit snapshot and nominee change in one atomic batch',()=>{
 const input=setup(),result=buildAdminMutation(input);
 assert.equal(result.requests[0].appendCells.sheetId,200);assert.equal(result.requests.length,2);
 assert.equal(result.entry[1],input.actor);assert.equal(result.entry[2],'edit');assert.equal(result.entry[5],input.reason);
 assert.deepEqual(JSON.parse(result.entry[6]),input.record.sourceRows);
 const updated=buildModel(apply(input.rows,result.requests));assert.equal(updated.total,3);
 const changed=updated.submissions.find(r=>r.memberKey==='member1');assert.deepEqual(changed.ids,['2','3']);assert.equal(changed.reference,'r1');
 const cells=result.requests[1].updateCells.rows[0].values;assert.equal(cells[1].userEnteredValue.stringValue,'Test Two | =literal name');
});
test('reset clears every row for that member, preserves others and audit, and removes counts',()=>{
 const input=setup([headers,row('old','member1',['1']),row('current','member1',['2']),row('other','member2',['1'])]);input.action='reset';
 const result=buildAdminMutation(input),updated=apply(input.rows,result.requests),model=buildModel(updated);
 assert.equal(result.requests.length,3);assert.equal(model.total,1);assert.equal(model.submissions.length,1);assert.equal(model.submissions[0].memberKey,'member2');
 assert.deepEqual(JSON.parse(result.entry[7]),[]);assert.equal(JSON.parse(result.entry[6]).length,2);
 assert.equal(updated.slice(1).some(r=>r[2]==='member1'),false);assert.equal(model.excluded,0);
});
test('stale rows and reset records cannot silently overwrite newer submissions',()=>{
 const input=setup();input.rows[1]=row('r1','member1',['2']);assert.throws(()=>buildAdminMutation(input),/changed since/);
 const missing=setup();missing.rows=[headers,row('r2','member2',['2'])];assert.throws(()=>buildAdminMutation(missing),/changed since/);
});
test('admin actions reject unauthorized users, missing reasons, empty edits and invalid nominees',()=>{
 assert.throws(()=>buildAdminMutation({...setup(),actor:'other@example.com'}),/President or bsscvb/);
 assert.throws(()=>buildAdminMutation({...setup(),reason:''}),/reason/);
 assert.throws(()=>buildAdminMutation({...setup(),ids:[]}),/at least one/);
 assert.throws(()=>buildAdminMutation({...setup(),ids:['999']}),/valid nominee/);
 assert.throws(()=>buildAdminMutation({...setup(),ids:['1']}),/No nominee changes/);
 assert.throws(()=>buildAdminMutation({...setup(),action:'delete-everyone'}),/Invalid nomination action/);
});
test('candidate configuration is private input with strict headers and stable unique IDs',()=>{
 const rows=[['Candidate ID','Name','Road Name','Start Date'],['1','Test One','','2005-01-01'],['2','Test Two','Road','2022-01-01']];
 assert.equal(parseCandidates(rows).length,2);assert.throws(()=>parseCandidates([['Wrong']]),/unavailable/);
 assert.throws(()=>parseCandidates([...rows,rows[1]]),/duplicate/);
});
test('history preserves before and after snapshots and escapes text in the portal',()=>{
 const result=buildAdminMutation({...setup(),reason:'<img src=x onerror=alert(1)>'}),auditHeaders=['Changed At','Actor','Action','Member','Reference','Reason','Before JSON','After JSON','Change ID'];
 const history=parseHistory([auditHeaders,result.entry]);assert.equal(history[0].id,'test-operation');
 assert.doesNotMatch(historyMarkup(history),/<img/);assert.match(historyMarkup(history),/&lt;img/);
 assert.throws(()=>parseHistory([['wrong']]),/headers/);
});
test('read-only users see results while admin users can open editing controls',()=>{
 const model=buildModel(setup().rows);assert.doesNotMatch(markup(model,'now','https://docs.google.com/'),/data-bod-manage=/);
 assert.match(markup(model,'now','https://docs.google.com/',true),/data-bod-manage=/);
});
