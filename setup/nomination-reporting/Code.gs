/** BSSC nomination notifications. Dedicated project; no ChatGPT automation. */
function bsscNominationInstall() {
  const p=PropertiesService.getScriptProperties();
  if(!p.getProperty('BSSC_REPORT_KEY'))throw Error('Set the BSSC_REPORT_KEY script property first.');
  bsscNominationRead_();
  ScriptApp.getProjectTriggers().filter(t=>t.getHandlerFunction()==='bsscNominationTick').forEach(t=>ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('bsscNominationTick').timeBased().everyMinutes(1).create();
  p.setProperty('BSSC_REPORT_INSTALLED','yes');
  console.log('Installed. New decision alerts checked every minute; daily report after 8:00 AM America/New_York.');
}
function bsscNominationTick() {
 const lock=LockService.getScriptLock();if(!lock.tryLock(1000))return;
 try{
  const p=PropertiesService.getScriptProperties(),records=bsscNominationRead_();
  records.filter(r=>['Accepted','Declined'].includes(r.status)&&r.respondedAt).forEach(r=>{
   const key='BSSC_ALERT_'+Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,r.name+'|'+r.respondedAt));
   if(p.getProperty(key))return;
   const stamp=Utilities.formatDate(new Date(r.respondedAt),'America/New_York','MMM d, yyyy h:mm a z');
   MailApp.sendEmail({to:'president@boneshakerssocialclub.com',subject:'BSSC 2027 Nomination — '+r.name+' '+r.status,body:r.name+' has '+r.status.toLowerCase()+' the 2027 Board nomination.\nReceived: '+stamp+'\n\nView Nominees & Decisions in the BSSC Management Portal.\nhttps://bsscvb-maker.github.io/bsscportal/',htmlBody:'<p><strong>'+bsscNominationEscape_(r.name)+'</strong> has <strong>'+bsscNominationEscape_(r.status.toLowerCase())+'</strong> the 2027 Board nomination.</p><p>Received: '+bsscNominationEscape_(stamp)+'</p><p><a href="https://bsscvb-maker.github.io/bsscportal/">Open BSSC Management Portal</a></p>',name:'BoneShakers Nomination Updates'});
   p.setProperty(key,new Date().toISOString());
  });
  const now=new Date(),day=Utilities.formatDate(now,'America/New_York','yyyy-MM-dd'),hour=Number(Utilities.formatDate(now,'America/New_York','H'));
  if(hour>=8&&p.getProperty('BSSC_REPORT_LAST_DATE')!==day){bsscNominationSendReport_(records,now);p.setProperty('BSSC_REPORT_LAST_DATE',day);}
 }finally{lock.releaseLock();}
}
function bsscNominationSendTestReport(){bsscNominationSendReport_(bsscNominationRead_(),new Date(),true);}
function bsscNominationRead_(){
 const p=PropertiesService.getScriptProperties(),key=p.getProperty('BSSC_REPORT_KEY');if(!key)throw Error('Reporting key is not configured.');
 const response=UrlFetchApp.fetch('https://bssc-nominee-responses.toddhumphrey931.chatgpt.site/api/report-feed',{headers:{Authorization:'Bearer '+key},muteHttpExceptions:true});
 if(response.getResponseCode()!==200)throw Error('Could not read the nomination response service: '+response.getResponseCode());
 const result=JSON.parse(response.getContentText());if(!Array.isArray(result.responses))throw Error('Unexpected nomination response data.');
 const book=SpreadsheetApp.openById('1G1GhywDG-FYEo00fY_FeWheScve333LIdBqZpqLbZZM'),sheet=book.getSheetByName('BOD Nominations 2027');
 if(!sheet)throw Error('BOD Nominations 2027 tab is missing.');const rows=sheet.getDataRange().getDisplayValues();
 const expected=['Submitted At','Reference','Member Key','Nominator','Nominee Count','Nominees','Candidate IDs'];if(expected.some((h,i)=>rows[0][i]!==h))throw Error('Nomination log headers changed.');
 const current=new Map(),norm=v=>String(v||'').trim().toLowerCase().replace(/\s+/g,' ');
 rows.slice(1).forEach(row=>{let ids;try{ids=JSON.parse(row[6]);}catch(e){return;}const names=String(row[5]||'').split(' | ').map(n=>n.trim()).filter(Boolean),n=Number(row[4]);if(!row[0]||!row[1]||!row[2]||!row[3]||!Array.isArray(ids)||!Number.isInteger(n)||n<1||names.length!==n||ids.length!==n||new Set(ids.map(String)).size!==n||new Set(names.map(norm)).size!==n)return;current.set(row[2],names);});
 const nominees=new Map();Array.from(current.values()).forEach(names=>names.forEach(name=>{const k=norm(name),r=nominees.get(k)||{name,count:0};r.count++;nominees.set(k,r);}));
 const statuses=new Map(result.responses.map(r=>[norm(r.name),r]));
 return Array.from(nominees.values()).map(n=>{const r=statuses.get(norm(n.name));return {name:n.name,count:n.count,status:r?r.status:'Invitation not yet sent',respondedAt:r&&r.responded_at||''};}).sort((a,b)=>a.name.localeCompare(b.name));
}
function bsscNominationSendReport_(records,now,test){
 const stamp=Utilities.formatDate(now,'America/New_York','EEEE, MMMM d, yyyy h:mm a z');
 const count=state=>records.filter(r=>r.status===state).length;
 const summary=records.length+' nominees · '+count('Accepted')+' accepted · '+count('Declined')+' declined · '+count('Awaiting Response')+' awaiting response · '+count('Invitation not yet sent')+' not yet invited';
 const rows=records.map(r=>'<tr><td style="padding:10px;border-bottom:1px solid #ddd">'+bsscNominationEscape_(r.name)+'</td><td style="padding:10px;border-bottom:1px solid #ddd">'+bsscNominationEscape_(r.status)+'</td><td style="padding:10px;border-bottom:1px solid #ddd">'+bsscNominationEscape_(r.respondedAt?Utilities.formatDate(new Date(r.respondedAt),'America/New_York','MMM d, h:mm a z'):'—')+'</td></tr>').join('');
 const html='<h2>BSSC 2027 Board Nomination Responses</h2><p>'+bsscNominationEscape_(stamp)+'</p><p>'+bsscNominationEscape_(summary)+'</p>'+(records.length?'<table style="border-collapse:collapse;font:14px Arial"><tr><th align="left" style="padding:10px">Nominee</th><th align="left" style="padding:10px">Decision</th><th align="left" style="padding:10px">Received</th></tr>'+rows+'</table>':'<p>No nominations have been submitted yet.</p>')+'<p><a href="https://bsscvb-maker.github.io/bsscportal/">Open BSSC Management Portal</a></p>';
 MailApp.sendEmail({to:'president@boneshakerssocialclub.com',subject:(test?'TEST — ':'')+'BSSC 2027 Board Nomination Responses — '+Utilities.formatDate(now,'America/New_York','yyyy-MM-dd'),body:stamp+'\n'+summary+'\n\n'+(records.map(r=>r.name+' — '+r.status).join('\n')||'No nominations have been submitted yet.'),htmlBody:html,name:'BoneShakers Nomination Updates'});
}
function bsscNominationEscape_(value){return String(value||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
