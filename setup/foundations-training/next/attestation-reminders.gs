function attestationReminderEmail_(name, test, trainingDate) {
 const day=trainingDate instanceof Date?localDay(trainingDate):String(trainingDate||'').trim();
 const dayMs=/^\d{4}-\d{2}-\d{2}$/.test(day)?Date.parse(day+'T00:00:00Z'):NaN;
 const todayMs=Date.parse(localDay(Date.now())+'T00:00:00Z');
 const days=(todayMs-dayMs)/86400000;
 const validDate=Number.isFinite(days)&&days>=0&&new Date(dayMs).toISOString().slice(0,10)===day;
 const classDate=validDate?new Intl.DateTimeFormat('en-US',{dateStyle:'long',timeZone:'UTC'}).format(new Date(dayMs)):'';
 const pending=validDate?(days===0?'Pending since class today':days+' '+(days===1?'day':'days')+' pending'):'';
 const attendance=validDate?'You attended in-person Foundations Training on '+classDate+'.':'Your attendance at in-person Foundations Training is on file.';
 const subject=(test?'[TEST] ':'')+'Action required today: Sign your BSSC training attestation';
 const url='https://bsscvb-maker.github.io/bsscportal/training/';
 const message='Your required attestation is still unsigned. Your training record remains incomplete, and your certificate will be available once you sign.';
 const steps='Sign in with your roster email, review the acknowledgment, and type your full name. If you need help signing in, choose Set up / reset password.';
 const testNote=test?'Test preview for the club president using a sample class date.':'';
 const html='<div style="background:#edf0f4;padding:24px 12px;font-family:Arial,sans-serif;color:#252a33"><table role="presentation" cellspacing="0" cellpadding="0" style="width:100%;max-width:600px;margin:auto;background:#fff"><tr><td style="background:#17191d;border-bottom:4px solid #b72c3d;padding:24px;color:#fff"><img src="'+esc(LOGO)+'" width="76" alt="BoneShakers Social Club"><h2>BoneShakers Social Club</h2><p>Foundations Training</p></td></tr><tr><td style="padding:28px;line-height:1.65">'+(test?'<p style="color:#a72c3a;font-weight:bold">'+testNote+'</p>':'')+'<p style="margin:0 0 6px;color:#a72c3a;font-size:13px;font-weight:bold;letter-spacing:1px">ACTION REQUIRED TODAY</p><h1 style="line-height:1.2;font-size:27px">Your training is still incomplete</h1><p>Hi '+esc(name)+',</p><p>'+attendance+'</p>'+(pending?'<p style="padding:12px 16px;background:#f9eef0;border-left:4px solid #ad2838;color:#842237;font-weight:bold">'+pending+'</p>':'')+'<p>'+message+'</p><p><strong>Please make this a priority and sign your attestation today.</strong></p><p>'+steps+'</p><p><a href="'+url+'" style="display:block;background:#ad2838;color:#fff;padding:14px;text-align:center;text-decoration:none;border-radius:8px;font-weight:bold">Sign My Attestation Now</a></p><p>Thank you for completing this requirement.<br>BSSC Training</p></td></tr><tr><td style="background:#17191d;color:#fff;padding:20px"><strong>STRONGER TOGETHER</strong><br>BoneShakers Social Club</td></tr></table></div>';
 return {subject,html,text:[testNote,'ACTION REQUIRED TODAY','Hi '+name+',',attendance,pending,message,'Please make this a priority and sign your attestation today.',steps,'Sign My Attestation Now: '+url,'Thank you for completing this requirement.\nBSSC Training'].filter(Boolean).join('\n\n')};
}

function sendAttestationReminders_(book,input) {
 const president='president@boneshakerssocialclub.com';
 const uuid='[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}';
 if(!new RegExp('^'+uuid+'$','i').test(input.requestId||''))throw Error('Invalid reminder request.');
 const test=input.test===true;
 const ids=test?['test']:Array.isArray(input.ids)?[...new Set(input.ids)]:[];
 const validId=new RegExp('^ATT-'+uuid+'$','i');
 if(!ids.length||ids.length>100||(!test&&ids.some(id=>!validId.test(id))))throw Error('Select pending attestations to remind.');
 const enrollments=test?[]:lmsTable_(book,'LMS Enrollments').rows.slice(1);
 const attendance=test?[]:lmsTable_(book,'LMS Attendance').rows.slice(1);
 const completions=test?[]:lmsTable_(book,'LMS Completions').rows.slice(1);
 const roster=test?[]:memberRoster_();
 const ledger=memberTable_('LMS Outbox',MEMBER_OUTBOX_HEADERS,true).rows;
 const recipients=new Set();
 let sent=0, skipped=0, needsReview=0;
 for(const id of ids){
  const key='attestation-reminder:'+input.requestId+':'+id;
  const existing=ledger.find(row=>row[0]===key);
  if(existing){if(existing[9]==='Sent')sent++;else needsReview++;continue;}
  const record=attendance.find(row=>row[0]===id);
  const enrollment=record&&enrollments.find(row=>row[0]===record[1]);
  const email=test?president:String(record?.[3]||'').trim().toLowerCase();
  const members=roster.filter(member=>member.email===email);
  const member=members[0];
  if(!test&&(!record||record[9]!=='Attestation pending'||!record[10]||record[11]||record[8]!==LMS_VERSION||!enrollment||enrollment[5]!==LMS_VERSION||enrollment[6]!=='Official'||String(enrollment[17]).toLowerCase()==='true'||enrollment[12]||completions.some(row=>row[1]===enrollment[0]&&row[8]==='Verified')||String(enrollment[3]).trim().toLowerCase()!==email||enrollment[2]!==record[2]||members.length!==1||member.conflict||memberTrainingExempt_(member)||!['active','prospect','pending'].includes(member.status.toLowerCase())||member.name.trim().toLowerCase()!==record[2].trim().toLowerCase()||recipients.has(email))){skipped++;continue;}
  if(MailApp.getRemainingDailyQuota()<1){needsReview++;continue;}
  const name=test?'Todd':record[2];
  const entry=memberOutbox_({key,enrollmentId:enrollment?.[0],memberKey:enrollment?.[1],name,email,kind:test?'Attestation reminder test':'Attestation reminder'});
  if(!entry){needsReview++;continue;}
  recipients.add(email);
  try{
   const message=attestationReminderEmail_(name,test,test?'2026-11-21':record[4]);
   MailApp.sendEmail({to:email,subject:message.subject,body:message.text,htmlBody:message.html,name:'BSSC Training',replyTo:president});
   memberOutboxFinish_(entry,'Sent');
   sent++;
  }catch(error){
   memberOutboxFinish_(entry,'Needs review','SEND_OUTCOME_REQUIRES_REVIEW');
   needsReview++;
  }
 }
 return {ok:true,sent,skipped,needsReview};
}

function sendPresidentAttestationReminderTest(){
 if(lmsIdentity_()!==LMS_OWNER)throw Error('Only the BSSC service owner can run this test.');
 const lock=LockService.getScriptLock();
 lock.waitLock(10000);
 try{
  const result=sendAttestationReminders_(null,{test:true,requestId:Utilities.getUuid()});
  if(result.sent!==1)throw Error('Test delivery could not be confirmed. Check the training outbox.');
  console.log('Sent the BSSC Training attestation reminder test to the club president.');
 }finally{lock.releaseLock();}
}
