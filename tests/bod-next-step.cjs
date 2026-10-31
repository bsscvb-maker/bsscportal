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
test('HTML invitations include professional green and red response buttons with personal links',()=>{
 const {invitationHtml}=require('../bod-nominations-results.js');
 const value=invitationHtml('<Test Member>',2027,'November 20, 2026',{yes:'https://example.com/respond?token=abc&choice=yes',no:'https://example.com/respond?token=abc&choice=no'});
 assert.match(value,/Yes, I Accept/);assert.match(value,/No, I Decline/);assert.match(value,/#187447/);assert.match(value,/#b82835/);assert.match(value,/token=abc&amp;choice=yes/);assert.match(value,/&lt;Test Member&gt;/);assert.doesNotMatch(value,/<Test Member>/);assert.match(value,/confirm your choice/);
});
test('portal distinguishes pending, accepted and declined responses and escapes names',()=>{
 const {responseMarkup}=require('../bod-nominations-results.js');const output=responseMarkup({nominees:[{name:'A'},{name:'B'},{name:'C'},{name:'<D>'}]},[{name:'A',status:'Accepted',responded_at:'2026-11-04T15:00:00Z'},{name:'B',status:'Declined'},{name:'C',status:'Awaiting Response'}]);
 assert.match(output,/accepted/);assert.match(output,/declined/);assert.match(output,/Awaiting Response/);assert.match(output,/Not sent/);assert.match(output,/&lt;D&gt;/);
});
