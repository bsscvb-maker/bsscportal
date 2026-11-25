/* In-person credit is administrator-recorded; only the authenticated learner can attest. */
const INPERSON_HEADERS=['Attendance ID','Enrollment ID','Full Name','Email','Training Date','Instructor','Recorded By','Recorded At','Course Version','Status','Invited At','Attested At','Certificate ID','Attestation','Account UID','Error Code','Notes'];
const INPERSON_ATTESTATION='I confirm that I attended BSSC Foundations training in person, understand the expectations covered, and know to contact club leadership if I need clarification. I acknowledge my responsibility to follow the club’s standards.';
function enableInPersonAttestations(){
 if(lmsIdentity_()!==LMS_OWNER)throw Error('Only the BSSC service owner can enable in-person attestations.');
 memberConfig_();memberTable_('LMS Attendance',INPERSON_HEADERS,true);
 const book=SpreadsheetApp.openById(LMS_BOOK),settings=lmsTable_(book,'LMS Settings'),at=new Date().toISOString(),row=settings.rows.findIndex(r=>r[0]==='In-person attestation');
 const values=['In-person attestation','Enabled',at,LMS_OWNER];
 Sheets.Spreadsheets.batchUpdate({requests:[row>0?lmsUpdate_(settings.sheet.getSheetId(),row,values):lmsAppend_(settings.sheet.getSheetId(),values)]},LMS_BOOK);
 PropertiesService.getScriptProperties().setProperty('LMS_INPERSON_ENABLED','true');
 console.log('In-person attendance store enabled. No invitations, signatures or completions created.');
}
function lmsAttendance_(book,user){
 const table=book.getSheetByName('LMS Attendance')?lmsTable_(book,'LMS Attendance'):null;if(!table)return null;
 const matches=table.rows.map((row,index)=>({row,index,table})).filter(x=>x.index>0&&x.row[1]===user.row[0]&&['Attestation pending','Signed'].includes(x.row[9]));
 if(matches.length>1)throw new TrainingError('Duplicate in-person attendance records need administrator review.',409);
 if(!matches.length)return null;const a=matches[0],r=a.row;
 if(r[8]!==LMS_VERSION||String(r[3]).toLowerCase()!==String(user.row[3]).toLowerCase()||String(r[2]).trim()!==String(user.row[2]).trim()||!r[0]||!r[6]||!r[7]||!r[10]||user.row[6]!=='Official')throw new TrainingError('Your recorded attendance needs administrator review.',409);
 return a;
}
function inPersonPublic_(a){if(!a)return null;const r=a.row;return {method:'In person',attendanceId:r[0],trainingDate:r[4]||null,instructor:r[5]||null,recordedAt:r[7],invitedAt:r[10],status:r[9],attestation:INPERSON_ATTESTATION};}
function inPersonSign_(user,state,attendance,input,now){
 const r=attendance.row.slice();
 if(input.accepted!==true||String(input.name||'').trim().toLowerCase()!==String(user.row[2]).trim().toLowerCase())throw new TrainingError('Enter your enrolled full name and confirm the attestation.');
 if(state.completion){if(state.completion.method!=='In person'||state.completion.attendanceId!==r[0]||state.completion.id!==r[12]||state.completion.at!==r[11]||r[9]!=='Signed')throw new TrainingError('Your completion record needs administrator review.',409);return {completion:null,update:null};}
 if(r[9]!=='Attestation pending')throw new TrainingError('Your attestation is not pending.',409);
 const at=new Date(now).toISOString(),id='BSSC-'+Utilities.getUuid().toUpperCase();
 state.completion={id,name:user.row[2],at,attestationVersion:'bssc-inperson-v1',attestation:INPERSON_ATTESTATION,scores:[],method:'In person',attendanceId:r[0],trainingDate:r[4]||null,instructor:r[5]||null,enrollmentId:user.row[0],courseVersion:LMS_VERSION,recordType:'Official',verified:true};
 r[9]='Signed';r[11]=at;r[12]=id;r[13]=INPERSON_ATTESTATION;
 return {completion:[id,user.row[0],user.row[2],at,INPERSON_ATTESTATION,LMS_VERSION,'[]','Official','Verified',at],update:lmsUpdate_(attendance.table.sheet.getSheetId(),attendance.index,r)};
}
function inPersonEmail_({name,email,welcomeUrl,trainingDate,instructor}){
 const subject=name+', complete your BSSC Foundations attestation',url='https://bsscvb-maker.github.io/bsscportal/training/';
 const detail=trainingDate?'Training date: '+formatDue(trainingDate):'Training date: not recorded';
 const credentials=welcomeUrl?'<p>Your seven-day welcome link lets you request a fresh secure password email when you are ready. Choose your own password, then sign in with your roster email. No temporary password is needed.</p><p>If this welcome link expires, use Set up / reset password on the training sign-in page at any time.</p>':'<p>Use your existing BSSC training password. If you have forgotten it, choose Set up / reset password on the sign-in page.</p>';
 const actionUrl=welcomeUrl||url,actionLabel=welcomeUrl?'Set Up My Training Account':'Complete My Attestation';
 const html='<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><meta charset="utf-8"></head><body style="margin:0;background:#edf0f4;font-family:Arial,Helvetica,sans-serif;color:#252a33"><table role="presentation" width="100%"><tr><td align="center" style="padding:28px 12px"><table role="presentation" style="width:100%;max-width:600px;background:#fff;border-radius:14px;overflow:hidden" cellpadding="0" cellspacing="0"><tr><td style="padding:28px;background:#17191d;border-bottom:4px solid #b72c3d"><img src="'+LOGO+'" width="76" height="76" alt="BoneShakers Social Club"><h2 style="color:white;margin-bottom:6px">BoneShakers Social Club</h2><p style="color:#c3c8d1;margin-top:0">We ride together. We serve together. We stand together.</p></td></tr><tr><td style="padding:30px 28px"><p style="font-size:12px;color:#a72c3a;letter-spacing:2px;font-weight:bold">IN-PERSON FOUNDATIONS TRAINING</p><h1 style="font-size:28px">One final acknowledgment.</h1><p>Hi '+esc(name)+',</p><p style="line-height:1.8">Your attendance at BSSC Foundations training in person has been recorded. Please sign your personal attestation to finalize your training record and unlock your printable certificate.</p><p style="padding:16px;background:#f6f1e5;line-height:1.7"><strong>You do not need to repeat the seven videos or online quizzes.</strong><br>'+esc(detail)+'<br>Instructor: '+esc(instructor||'not recorded')+'</p><div style="padding:18px;background:#f4f5f7;border:1px solid #dfe2e8;border-radius:10px;margin:22px 0"><p><strong>Your training username</strong><br>'+esc(email)+'</p>'+credentials+'</div><a href="'+esc(actionUrl)+'" style="display:block;text-align:center;background:#ad2838;color:white;text-decoration:none;padding:18px;border-radius:9px;font-weight:bold">'+actionLabel+'</a><p style="font-size:13px;line-height:1.7;color:#626a75">Sign in, review the acknowledgment and type your full name. Only your own submission signs the attestation. Questions? Reply to the President.</p></td></tr><tr><td style="padding:22px 28px;background:#17191d;color:#c3c8d1;font-size:12px"><strong style="color:white">STRONGER TOGETHER</strong><br>BoneShakers Social Club · Foundations Training</td></tr></table></td></tr></table></body></html>';
 const text=subject+'\n\nHi '+name+',\n\nYour in-person attendance has been recorded. Complete your personal attestation to finalize your record and unlock your printable certificate. You do not need to repeat the seven videos or online quizzes.\n'+detail+'\nInstructor: '+(instructor||'not recorded')+'\n\nUsername: '+email+'\n'+(welcomeUrl?'Seven-day account setup: '+welcomeUrl+'\nRequest a fresh secure password email, choose your own password, then sign in. If the welcome expires, use Set up / reset password from training home.':'Use your existing training password, or Set up / reset password.')+'\n\nComplete My Attestation: '+url+'\n\nQuestions: president@boneshakerssocialclub.com\nBoneShakers Social Club — Stronger Together';
 return {subject,html,text};
}
function inPersonInvitations_(book){
 if(PropertiesService.getScriptProperties().getProperty('LMS_INPERSON_ENABLED')!=='true')return {sent:0,reviewed:0};
 const attendance=lmsTable_(book,'LMS Attendance'),roster=memberRoster_();let sent=0,reviewed=0;
 for(let i=1;i<attendance.rows.length;i++){
  const row=attendance.rows[i].slice();if(row[9]!=='Requested')continue;
  let entry=null;
  try{
   if(MailApp.getRemainingDailyQuota()<1)break;
   const email=String(row[3]||'').trim().toLowerCase(),members=roster.filter(m=>m.email===email),match=members[0];
   if(!row[0]||!row[6]||!row[7]||row[8]!==LMS_VERSION||members.length!==1||match.conflict||!['active','prospect','pending'].includes(match.status.toLowerCase())||match.name.toLowerCase()!==String(row[2]).trim().toLowerCase())throw Error('ATTENDANCE_IDENTITY_REVIEW');
   if(memberTrainingExempt_(match)){attendance.sheet.getRange(i+1,10).setValue('Cancelled');continue;}
   if(row[4]&&(!/^\d{4}-\d{2}-\d{2}$/.test(row[4])||localDay(row[4]+'T12:00:00Z')!==row[4]||row[4]>localDay(Date.now())))throw Error('ATTENDANCE_DATE_REVIEW');
   if(attendance.rows.some((r,j)=>j!==i&&j>0&&String(r[3]).toLowerCase()===email&&r[8]===LMS_VERSION&&r[9]!=='Cancelled'))throw Error('DUPLICATE_ATTENDANCE_REVIEW');
   const enrollments=lmsTable_(book,'LMS Enrollments'),active=enrollments.rows.slice(1).filter(r=>String(r[3]).toLowerCase()===email&&r[17]!==true&&String(r[17]).toLowerCase()!=='true');
   if(active.length>1||active.some(r=>r[6]!=='Official'||r[5]!==LMS_VERSION||r[12]||r[14]&&JSON.parse(r[14]).completion))throw Error('EXISTING_ENROLLMENT_REVIEW');
   entry=memberOutbox_({key:'inperson:'+row[0],name:match.name,email,kind:'In-person attestation'});if(!entry)throw Error('INVITATION_ALREADY_RESERVED');
   row[9]='Inviting';attendance.sheet.getRange(i+1,1,1,row.length).setValues([row]);
   const at=new Date().toISOString();let enrollment=active[0];
   if(!enrollment){enrollment=['LMS-'+Utilities.getUuid(),'MEMBER-'+match.nameKey,match.name,email,match.status,LMS_VERSION,'Official',at,'',row[6],'','','','','',at,'In-person training; personal attestation required.',false,0];enrollments.sheet.appendRow(enrollment);}
   row[1]=enrollment[0];entry.values[1]=enrollment[0];entry.values[2]=enrollment[1];
   const c=memberConfig_(),uid=c.p.getProperty('LMS_MEMBER_EMAIL_'+memberDigest_(email));let account,welcomeUrl;
   if(uid){const raw=c.p.getProperty('LMS_MEMBER_'+uid);if(!raw)throw Error('ACCOUNT_REVIEW');account=JSON.parse(raw);if(account.archived||account.email!==email||account.enrollmentId!==enrollment[0])throw Error('ACCOUNT_REVIEW');if(account.mustChangePassword||account.mustSetupPassword)welcomeUrl=memberWelcome_(account);}
   else {const created=memberProvision_(enrollment[0]);account=created.account;welcomeUrl=created.welcomeUrl;}
   row[14]=account.uid;memberSaveAccount_(account,match.name);
   const mail=inPersonEmail_({name:match.name,email,welcomeUrl,trainingDate:row[4],instructor:row[5]});
   MailApp.sendEmail({to:email,subject:mail.subject,body:mail.text,htmlBody:mail.html,name:'BoneShakers Social Club',replyTo:'president@boneshakerssocialclub.com'});
   row[9]='Attestation pending';row[10]=new Date().toISOString();row[15]='';attendance.sheet.getRange(i+1,1,1,row.length).setValues([row]);memberOutboxFinish_(entry,'Sent');sent++;
  }catch(error){row[9]='Needs review';row[15]=entry?'INVITATION_OUTCOME_REQUIRES_REVIEW':'ATTENDANCE_REQUIRES_REVIEW';attendance.sheet.getRange(i+1,1,1,row.length).setValues([row]);if(entry)memberOutboxFinish_(entry,'Needs review',row[15]);reviewed++;}
 }
 return {sent,reviewed};
}
function processInPersonInvitations(){
 if(lmsIdentity_()!==LMS_OWNER)throw Error('Only the BSSC service owner can process invitations.');
 const lock=LockService.getScriptLock();if(!lock.tryLock(20000))throw Error('Training records are busy.');
 try{const result=inPersonInvitations_(SpreadsheetApp.openById(LMS_BOOK));console.log('In-person invitations processed. Sent: '+result.sent+'. Needs review: '+result.reviewed+'. No attestations signed.');}finally{lock.releaseLock();}
}
