const test=require('node:test');
const assert=require('node:assert/strict');
const {invitationRecipients,invitationText,cleanupRequests}=require('../bod-nominations-results.js');
const headers=['Changed At','Actor','Action','Member','Reference','Reason','Before JSON','After JSON','Change ID'];
test('history cleanup archives exact evidence and clears only selected history cells',()=>{
 const a=['now','admin','reset','Test member','ref','Test','[1]','[]','a'],b=['now','admin','edit','Real member','ref2','Correction','[2]','[3]','b'];
 const requests=cleanupRequests([headers,a,b],['a'],20,30,'president','later');
 assert.equal(requests.length,2);assert.equal(requests[0].appendCells.sheetId,30);
 assert.deepEqual(requests[0].appendCells.rows[0].values.map(c=>c.userEnteredValue.stringValue),[...a,'later','president']);
 assert.deepEqual(requests[1].repeatCell.range,{sheetId:20,startRowIndex:1,endRowIndex:2,startColumnIndex:0,endColumnIndex:9});
 assert.throws(()=>cleanupRequests([headers,a],['missing'],20,30,'p','now'),/changed/);
});
test('recipient matching requires exact unique roster identity and valid address',()=>{
 const model={nominees:[{name:'Test One'},{name:'Test Two'},{name:'Test Three'}]};
 const roster=[['First Name','Last Name','Email'],['Test','One','one@example.com'],['Test','Two','two@example.com'],['Test','Two','other@example.com'],['Test','Three','bad\r\nBcc:bad@example.com']];
 const result=invitationRecipients(model,roster);assert.equal(result[0].error,'');assert.equal(result[1].error,'No unique roster match');assert.equal(result[2].error,'Missing or invalid roster email');
 assert.throws(()=>invitationRecipients(model,[['Name','Email']]),/columns/);
});
test('invitation asks for interest before election and links to requirements',()=>{
 const body=invitationText('Test One',2027,'November 20, 2026');
 assert.match(body,/Hello Test One/);assert.match(body,/November general membership meeting/);assert.match(body,/by November 20, 2026/);assert.match(body,/https:\/\/boneshakerssocialclub.com\/requirements-to-serve/);assert.match(body,/does not mean you have been elected/);assert.match(body,/December general membership meeting/);assert.doesNotMatch(invitationText('Test',2027,''),/ by \n/);
});
