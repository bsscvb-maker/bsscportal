const test=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const crypto=require('node:crypto');

function fixture(){
 const rows=[['Review Year','Voter Key','Voter Name','Nominee Key','Nominee Name','Submitted At','Receipt']];
 const cache=new Map(),props=new Map([['SISTER_VOTE_KEY_SECRET','test-secret']]);let locked=false,eligible=true,active=true,failRead=false;
 const sheet={getDataRange:()=>({getDisplayValues:()=>{if(failRead){failRead=false;throw Error('Simulated read failure');}return rows.map(r=>r.map(String));}}),appendRow:r=>rows.push(r)};
 const ctx={console,Map,Set,Date,JSON,Error,Number,String,RegExp,PropertiesService:{getScriptProperties:()=>({getProperty:k=>props.get(k),setProperty:(k,v)=>props.set(k,v)})},CacheService:{getScriptCache:()=>({get:k=>cache.get(k),put:(k,v)=>cache.set(k,v)})},LockService:{getScriptLock:()=>({waitLock:()=>{assert.equal(locked,false);locked=true;},tryLock:()=>{if(locked)return false;locked=true;return true;},releaseLock:()=>locked=false})},Utilities:{getUuid:()=>crypto.randomUUID(),computeHmacSha256Signature:(v,key)=>[...crypto.createHmac('sha256',key).update(v).digest()],formatDate:()=>new Date().toISOString()},SpreadsheetApp:{openById:()=>({getSheetByName:()=>sheet}),flush:()=>{}},ContentService:{MimeType:{JSON:'json'},createTextOutput:value=>({value,setMimeType(){return this;}})}};
 vm.createContext(ctx);vm.runInContext(fs.readFileSync(__dirname+'/Code.gs','utf8'),ctx);
 const voter={'first name':'Test','last name':'Member','date of birth':'1980-01-01',status:'active'};
 ctx.readRosters=()=>({year:2026,current:[{...voter,status:active?'active':'suspended'}]});
 ctx.lists=()=>({members:eligible?[{id:'test sister',name:'Test Sister'}]:[]});
 const key=ctx.sisterVoterKey('Test Member','1980-01-01'),token=crypto.randomUUID()+crypto.randomUUID();cache.set('member:'+token,JSON.stringify({key,name:'Test Member'}));
 return {ctx,rows,token,setEligible:v=>eligible=v,setActive:v=>active=v,expire:()=>cache.delete('member:'+token),lock:()=>locked=true,failRead:()=>failRead=true};
}
test('saves one confirmed vote and returns the same receipt on retry or changed choice',()=>{
 const f=fixture(),first=f.ctx.castSisterVote({token:f.token,nominee:'test sister'});assert.equal(first.saved,true);assert.match(first.receipt,/^BSSC-SP-2026-/);assert.equal(f.rows.length,2);
 const retry=f.ctx.castSisterVote({token:f.token,nominee:'another sister'});assert.equal(retry.receipt,first.receipt);assert.equal(retry.alreadyVoted,true);assert.equal(f.rows.length,2);
 assert.equal(f.ctx.sisterVoteStatus({token:f.token}).receipt,first.receipt);
});
test('rejects expired identity, inactive member, and ineligible selection without a write',()=>{
 for(const change of [f=>f.expire(),f=>f.setActive(false),f=>f.setEligible(false)]){const f=fixture();change(f);assert.throws(()=>f.ctx.castSisterVote({token:f.token,nominee:'test sister'}));assert.equal(f.rows.length,1);}
});
test('concurrent request cannot bypass the lock',()=>{const f=fixture();f.lock();assert.throws(()=>f.ctx.castSisterVote({token:f.token,nominee:'test sister'}),/Another vote/);assert.equal(f.rows.length,1);});
test('read failure returns no false success and leaves no second vote',()=>{const f=fixture();f.failRead();assert.throws(()=>f.ctx.castSisterVote({token:f.token,nominee:'test sister'}));assert.equal(f.rows.length,1);assert.equal(f.ctx.castSisterVote({token:f.token,nominee:'test sister'}).saved,true);assert.equal(f.rows.length,2);});
test('duplicate stored rows are flagged instead of silently counted',()=>{const f=fixture();f.ctx.castSisterVote({token:f.token,nominee:'test sister'});f.rows.push([...f.rows[1]]);assert.throws(()=>f.ctx.sisterVoteStatus({token:f.token}),/More than one vote/);});
