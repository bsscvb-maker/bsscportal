const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const ctx={TrainingError:class extends Error{}};vm.createContext(ctx);vm.runInContext(fs.readFileSync(__dirname+'/../next/member-auth.gs','utf8'),ctx);
test('new passwords strictly require length, both letter cases, a digit and a non-whitespace symbol',()=>{
 for(const p of ['Aa1!short','abcdefgh1!','ABCDEFGH1!','Abcdefghi!','Abcdefghi1','Abcdefgh1 ','A1!'+ 'a'.repeat(126)])assert.throws(()=>ctx.memberValidatePassword_(p));
 for(const p of ['Abcdefgh1!','Longer passphrase 2!'])assert.doesNotThrow(()=>ctx.memberValidatePassword_(p));
});
test('President signature uses exactly one active President from the current roster and preserves issued snapshots',()=>{
 const c={console,Date,Utilities:{formatDate:()=> '2026'},publicState:s=>({...s})};vm.createContext(c);vm.runInContext(fs.readFileSync(__dirname+'/../service/server-base.gs','utf8'),c);
 const heads=['Status','First Name','Last Name','Director Position'];let rows=[heads,['Active','Jane','Vice','Vice President'],['Active','Test','President','President']];const book={getSheetByName:y=>y==='2026'?{getDataRange:()=>({getValues:()=>rows})}:null};
 assert.equal(c.lmsPresident_(book).name,'Test President');rows.push(['Active','Other','President','President']);assert.equal(c.lmsPresident_(book),null);rows.pop();rows[2][0]='Inactive';assert.equal(c.lmsPresident_(book),null);rows[2][0]='Active';const state={completion:{id:'fixture'}};assert.equal(c.lmsCertificateState_(state,book).completion.president.name,'Test President');assert.equal(state.completion.president,undefined);const issued={completion:{president:{name:'Previous President'}}};assert.equal(c.lmsCertificateState_(issued,book).completion.president.name,'Previous President');
});
