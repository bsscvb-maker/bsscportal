/* Seven-day welcome entry; password-setting codes remain short-lived and single-use. */
const MEMBER_LOGIN_URL='https://script.google.com/a/macros/boneshakerssocialclub.com/s/AKfycbz5mh45avqAvKNf7b-0OFvU46_MllMjwXyfGOJwtW0qUwpAA5rQZyKAImq5NAGDSniu/exec';
const MEMBER_LINK_MESSAGE='If an invited training account matches, a fresh password link has been emailed. Check your inbox and spam folder. Wait at least a minute before requesting another link.';
function memberWelcome_(account){
 const p=memberConfig_().p,token=Utilities.getUuid().replace(/-/g,'')+Utilities.getUuid().replace(/-/g,''),digest=memberDigest_(token),expiresAt=new Date(Date.now()+7*86400000).toISOString();
 if(account.welcomeDigest)p.deleteProperty('LMS_WELCOME_'+account.welcomeDigest);
 p.setProperty('LMS_WELCOME_'+digest,JSON.stringify({uid:account.uid,expiresAt}));account.welcomeDigest=digest;account.welcomeExpiresAt=expiresAt;p.setProperty('LMS_MEMBER_'+account.uid,JSON.stringify(account));
 return MEMBER_LOGIN_URL+'?welcome='+encodeURIComponent(token);
}
function memberWelcomeAccount_(token){
 if(typeof token!=='string'||!/^[a-f0-9]{64}$/i.test(token))throw new TrainingError('This welcome link has expired or is unavailable. Request a fresh setup email below.',410);
 const p=memberConfig_().p,digest=memberDigest_(token),raw=p.getProperty('LMS_WELCOME_'+digest);if(!raw)throw new TrainingError('This welcome link has expired or was already completed. Use sign in or request a fresh password email.',410);
 const invite=JSON.parse(raw),accountRaw=p.getProperty('LMS_MEMBER_'+invite.uid);if(!accountRaw||Date.now()>Date.parse(invite.expiresAt))throw new TrainingError('This seven-day welcome link has expired. Request a fresh password email below.',410);
 const account=JSON.parse(accountRaw);if(account.archived||account.welcomeDigest!==digest)throw new TrainingError('This welcome link is unavailable. Request a fresh password email below.',410);
 memberLinkEnrollment_(account);return {account,expiresAt:invite.expiresAt};
}
function memberLinkEnrollment_(account){const book=SpreadsheetApp.openById(LMS_BOOK),user=lmsUser_(book,account.email);if(user.row[0]!==account.enrollmentId)throw new TrainingError('This account needs administrator review.',403);return user;}
function memberWelcomeInfo(input){try{const {account,expiresAt}=memberWelcomeAccount_(input?.welcome);const parts=account.email.split('@');return {expiresAt,emailHint:parts[0].slice(0,2)+'…@'+parts[1]};}catch(error){return memberError_(error);}}
function memberPasswordEmail_(account,link){
 const setup=Boolean(account.mustSetupPassword||account.mustChangePassword),subject=setup?'Create your BSSC training password':'Reset your BSSC training password',label=setup?'Create My Password':'Reset My Password';
 const html='<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><meta charset="utf-8"></head><body style="margin:0;background:#edf0f4;font-family:Arial,Helvetica,sans-serif;color:#252a33"><table role="presentation" width="100%"><tr><td align="center" style="padding:28px 12px"><table role="presentation" style="width:100%;max-width:600px;background:white;border-radius:14px;overflow:hidden" cellpadding="0" cellspacing="0"><tr><td style="background:#17191d;padding:28px;border-bottom:4px solid #b72c3d"><img src="'+LOGO+'" alt="BoneShakers Social Club" width="76" height="76"><h2 style="color:white">BoneShakers Social Club</h2></td></tr><tr><td style="padding:30px 28px"><p style="color:#a72c3a;letter-spacing:2px;font-size:12px;font-weight:bold">YOUR TRAINING ACCOUNT</p><h1 style="font-size:28px">'+esc(subject)+'</h1><p>Hi '+esc(account.name||'member')+',</p><p style="line-height:1.8">Use the secure button below to choose and confirm your own password. Then sign in with <strong>'+esc(account.email)+'</strong> and your new password.</p><a href="'+esc(link)+'" style="display:block;padding:18px;text-align:center;background:#ad2838;color:white;font-weight:bold;text-decoration:none;border-radius:9px">'+label+'</a><p style="padding:16px;background:#f6f1e5;line-height:1.7">This password link can be used once and is valid for up to <strong>60 minutes</strong>. If it expires, request another link from the training sign-in page.</p><p style="line-height:1.8">Your training progress, grades and attestation stay saved. If you did not request this email, you can ignore it; your password has not changed.</p><p style="font-size:13px;line-height:1.7;color:#626a75">Please do not forward this email. Questions? Reply to the President.</p></td></tr><tr><td style="padding:22px 28px;background:#17191d;color:white">STRONGER TOGETHER<br><small>We ride together. We serve together. We stand together.</small></td></tr></table></td></tr></table></body></html>';
 return {subject,html,text:subject+'\n\nHi '+(account.name||'member')+',\n\nChoose your own password: '+link+'\n\nThis single-use link is valid for up to 60 minutes. After saving your password, sign in with '+account.email+' and your new password.\n\nExpired? Request another link from '+HOME+'\nYour training progress, grades and attestation remain saved. If you did not request this, ignore this email; your password has not changed.\n\nBoneShakers Social Club — Stronger Together'};
}
function memberSendPasswordLink_(account){
 const c=memberConfig_(),p=c.p,now=Date.now(),key='LMS_LINK_RATE_'+memberDigest_(account.email),day=new Date(now).toISOString().slice(0,10),old=JSON.parse(p.getProperty(key)||'{}'),global=JSON.parse(p.getProperty('LMS_LINK_RATE_TOTAL')||'{}');
 if(now-Number(old.last||0)<60000||old.day===day&&old.count>=5||global.day===day&&global.count>=60||MailApp.getRemainingDailyQuota()<11)return;
 p.setProperty(key,JSON.stringify({day,last:now,count:old.day===day?Number(old.count||0)+1:1}));p.setProperty('LMS_LINK_RATE_TOTAL',JSON.stringify({day,count:global.day===day?Number(global.count||0)+1:1}));
 const entry=memberOutbox_({key:'password-link:'+Utilities.getUuid(),enrollmentId:account.enrollmentId,name:account.name,email:account.email,kind:account.mustSetupPassword||account.mustChangePassword?'Password setup link':'Password reset link'});
 try{
  const generated=memberFetch_('accounts:sendOobCode',{requestType:'PASSWORD_RESET',email:account.email,returnOobLink:true},true);let code=generated.oobCode;
  if(!code&&typeof generated.oobLink==='string'){const match=generated.oobLink.match(/[?&]oobCode=([^&#]+)/);if(match)code=decodeURIComponent(match[1]);}
  if(typeof code!=='string'||!/^[a-zA-Z0-9_-]{20,1024}$/.test(code))throw Error('RESET_CODE_UNAVAILABLE');
  const digest=memberDigest_(code);if(account.resetDigest)p.deleteProperty('LMS_RESET_'+account.resetDigest);
  p.setProperty('LMS_RESET_'+digest,JSON.stringify({uid:account.uid,expiresAt:now+3600000}));account.resetDigest=digest;p.setProperty('LMS_MEMBER_'+account.uid,JSON.stringify(account));
  const mail=memberPasswordEmail_(account,MEMBER_LOGIN_URL+'?reset='+encodeURIComponent(code));
  MailApp.sendEmail({to:account.email,subject:mail.subject,body:mail.text,htmlBody:mail.html,name:'BoneShakers Social Club',replyTo:'president@boneshakerssocialclub.com'});memberOutboxFinish_(entry,'Sent');
 }catch(error){memberOutboxFinish_(entry,'Needs review','PASSWORD_LINK_DELIVERY_REQUIRES_REVIEW');}
}
function requestMemberPasswordLink(input){
 let lock;try{
  if(!input||typeof input!=='object'||JSON.stringify(input).length>1500)return {message:MEMBER_LINK_MESSAGE};
  lock=LockService.getScriptLock();if(!lock.tryLock(10000))return {message:MEMBER_LINK_MESSAGE};let account;
  if(input.welcome){try{account=memberWelcomeAccount_(input.welcome).account;}catch(error){return {message:MEMBER_LINK_MESSAGE};}}
  else {const email=String(input.email||'').trim().toLowerCase();if(email.length>254||!/^\S+@\S+\.\S+$/.test(email))return {message:MEMBER_LINK_MESSAGE};const p=memberConfig_().p,uid=p.getProperty('LMS_MEMBER_EMAIL_'+memberDigest_(email)),raw=uid&&p.getProperty('LMS_MEMBER_'+uid);if(!raw)return {message:MEMBER_LINK_MESSAGE};account=JSON.parse(raw);if(account.archived||account.email!==email)return {message:MEMBER_LINK_MESSAGE};memberLinkEnrollment_(account);}
  memberSendPasswordLink_(account);
 }catch(error){/* Uniform response; never disclose whether an address is enrolled. */}finally{if(lock)lock.releaseLock();}
 return {message:MEMBER_LINK_MESSAGE};
}
function memberResetAccount_(code){
 if(typeof code!=='string'||!/^[a-zA-Z0-9_-]{20,1024}$/.test(code))throw new TrainingError('This password link is invalid, expired or already used. Sign in or request a fresh link.',410);
 const p=memberConfig_().p,digest=memberDigest_(code),raw=p.getProperty('LMS_RESET_'+digest);if(!raw)throw new TrainingError('This password link is invalid, expired or already used. Sign in or request a fresh link.',410);
 const issued=JSON.parse(raw),saved=p.getProperty('LMS_MEMBER_'+issued.uid);if(!saved||Date.now()>Number(issued.expiresAt))throw new TrainingError('This password link has expired. Request a fresh link.',410);
 const account=JSON.parse(saved);if(account.archived||account.resetDigest!==digest)throw new TrainingError('This password link is unavailable. Request a fresh link.',410);memberLinkEnrollment_(account);
 const verified=memberFetch_('accounts:resetPassword',{oobCode:code},false);if(String(verified.email||'').toLowerCase()!==account.email)throw new TrainingError('This password link does not match the invited account.',403);
 return {account,digest};
}
function memberResetInfo(input){try{const {account}=memberResetAccount_(input?.code);return {email:account.email,setup:Boolean(account.mustSetupPassword||account.mustChangePassword)};}catch(error){return memberError_(error);}}
function memberConfirmPasswordReset(input){
 let lock;try{memberValidatePassword_(input?.newPassword);lock=LockService.getScriptLock();if(!lock.tryLock(15000))throw new TrainingError('Your account is busy. Try again.',503);
  const {account,digest}=memberResetAccount_(input.code);memberFetch_('accounts:resetPassword',{oobCode:input.code,newPassword:input.newPassword},false);
  const at=new Date().toISOString(),p=memberConfig_().p;if(account.mustSetupPassword||account.mustChangePassword)account.passwordSetupAt=at;account.mustSetupPassword=false;account.mustChangePassword=false;account.passwordChangedAt=at;account.passwordResetAt=at;account.minimumAuthTime=Math.floor(Date.now()/1000);
  delete account.initialDigest;delete account.salt;delete account.initialPasswordUpdatedAt;delete account.resetDigest;
  p.deleteProperty('LMS_RESET_'+digest);if(account.welcomeDigest)p.deleteProperty('LMS_WELCOME_'+account.welcomeDigest);delete account.welcomeDigest;
  p.setProperty('LMS_MEMBER_'+account.uid,JSON.stringify(account));memberSaveAccount_(account,account.name);
  const event=memberOutbox_({key:'password-changed:'+Utilities.getUuid(),enrollmentId:account.enrollmentId,name:account.name,email:account.email,kind:'Password updated'});memberOutboxFinish_(event,'Completed');
  return {passwordSaved:true,email:account.email,message:'Your password is saved. Sign in with your email and new password.'};
 }catch(error){return memberError_(error);}finally{if(lock)lock.releaseLock();}
}
/* One authorized replacement of the owner's pending in-person welcome. Does not reset a chosen password. */
function sendOwnerRosterWelcomeUpdate(){return memberSendOwnerWelcome_('setup-welcome-update:',false);}
function sendOwnerRosterWelcomeRoutingCorrection(){return memberSendOwnerWelcome_('setup-route-correction-v1:',true);}
function sendOwnerFirstVisitWelcome(){return memberSendOwnerWelcome_('first-visit-welcome-20261122:',false,'Welcome to BSSC Foundations — set up your account');}
function memberSendOwnerWelcome_(eventPrefix,corrected,subjectOverride){
 if(lmsIdentity_()!==LMS_OWNER)throw Error('Only the BSSC service owner can send this update.');const lock=LockService.getScriptLock();if(!lock.tryLock(15000))throw Error('Training records are busy.');
 try{const book=SpreadsheetApp.openById(LMS_BOOK),rows=lmsTable_(book,'LMS Attendance').rows.slice(1).filter(r=>r[2]==='Todd Humphrey'&&r[6]===LMS_OWNER&&r[9]==='Attestation pending');if(rows.length!==1)throw Error('Select one pending owner attendance record before sending.');const r=rows[0],p=memberConfig_().p,raw=p.getProperty('LMS_MEMBER_'+r[14]);if(!raw)throw Error('The owner account needs review.');const account=JSON.parse(raw);if(account.email!==r[3]||account.enrollmentId!==r[1])throw Error('The owner account binding needs review.');if(!account.mustChangePassword&&!account.mustSetupPassword)throw Error('A password is already chosen. Use the ordinary self-service reset if needed.');
  const entry=memberOutbox_({key:eventPrefix+r[1],enrollmentId:r[1],name:r[2],email:r[3],kind:corrected?'Corrected setup welcome':'Seven-day account setup welcome'});if(!entry)throw Error('The updated welcome was already reserved or sent. Do not resend blindly.');
  try{account.mustSetupPassword=true;account.mustChangePassword=false;p.setProperty('LMS_MEMBER_'+account.uid,JSON.stringify(account));const welcomeUrl=memberWelcome_(account),mail=inPersonEmail_({name:r[2],email:r[3],welcomeUrl,trainingDate:r[4],instructor:r[5]});memberSaveAccount_(account,account.name);MailApp.sendEmail({to:account.email,subject:subjectOverride||(corrected?'Corrected BSSC setup link — choose your password':'Your updated BSSC account setup — choose your own password'),body:mail.text,htmlBody:mail.html,name:'BoneShakers Social Club',replyTo:'president@boneshakerssocialclub.com'});memberOutboxFinish_(entry,'Sent');console.log(corrected?'One corrected setup welcome sent using the club-specific address. No password or attestation changed.':'One updated seven-day setup welcome sent to the owner roster account. No password or attestation was changed.');}catch(error){memberOutboxFinish_(entry,'Needs review','SETUP_WELCOME_REQUIRES_REVIEW');throw Error('The updated welcome needs delivery review; do not repeat the send.');}
 }finally{lock.releaseLock();}
}

/* Todd-authorized fresh onboarding test. Preserve the earlier signed certificate in History. */
function restartOwnerOnboarding20261122(){
 if(lmsIdentity_()!==LMS_OWNER)throw Error('Only the club administrator can restart this owner test.');
 const lock=LockService.getScriptLock();if(!lock.tryLock(20000))throw Error('Training records are busy.');
 try{const p=memberConfig_().p,book=SpreadsheetApp.openById(LMS_BOOK),enrollments=lmsTable_(book,'LMS Enrollments'),old=enrollments.rows.map((row,index)=>({row,index})).filter(x=>x.index>0&&String(x.row[3]).toLowerCase()==='ramhdcui@gmail.com'&&x.row[17]!==true);if(old.length!==1)throw Error('Review the owner enrollment before restarting.');const original=old[0],attendance=lmsTable_(book,'LMS Attendance'),prior=attendance.rows.find(r=>r[1]===original.row[0]&&r[9]==='Signed');if(!prior||prior[2]!=='Todd Humphrey')throw Error('The earlier signed owner record could not be verified.');const uid=p.getProperty('LMS_MEMBER_EMAIL_'+memberDigest_('ramhdcui@gmail.com')),raw=uid&&p.getProperty('LMS_MEMBER_'+uid);if(!raw)throw Error('Owner account needs review.');const account=JSON.parse(raw);if(account.enrollmentId!==original.row[0]||account.email!=='ramhdcui@gmail.com')throw Error('Account binding needs review.');
 const at=new Date().toISOString(),enrollmentId='LMS-'+Utilities.getUuid(),attendanceId='ATT-'+Utilities.getUuid(),entry=memberOutbox_({key:'owner-onboarding-restart-20261122',enrollmentId,name:prior[2],email:account.email,kind:'Account onboarding restarted'});if(!entry)throw Error('This restart was already reserved or completed; review History.');
 try{const archived=original.row.slice();archived[17]=true;archived[15]=at;archived[16]=String(archived[16]||'')+' | Owner-requested onboarding restart; signed certificate retained.';const next=[enrollmentId,original.row[1],prior[2],account.email,original.row[4],LMS_VERSION,'Official',at,'',LMS_OWNER,'','','','','',at,'Owner-requested onboarding retest. Earlier enrollment '+original.row[0]+' remains archived with its signed certificate.',false,0],nextAttendance=[attendanceId,enrollmentId,prior[2],account.email,prior[4]||'',prior[5]||'',LMS_OWNER,at,LMS_VERSION,'Inviting','','','','',uid,'','Owner requested a fresh setup and unsigned attestation; original attendance '+prior[0]+' retained.'];
 Sheets.Spreadsheets.batchUpdate({requests:[lmsUpdate_(enrollments.sheet.getSheetId(),original.index,archived),lmsAppend_(enrollments.sheet.getSheetId(),next),lmsAppend_(attendance.sheet.getSheetId(),nextAttendance)]},LMS_BOOK);
 if(account.resetDigest)p.deleteProperty('LMS_RESET_'+account.resetDigest);delete account.resetDigest;account.enrollmentId=enrollmentId;account.mustSetupPassword=true;account.mustChangePassword=false;account.minimumAuthTime=Math.floor(Date.now()/1000)+1;account.onboardingRestartedAt=at;const welcomeUrl=memberWelcome_(account);memberSaveAccount_(account,prior[2]);const mail=inPersonEmail_({name:prior[2],email:account.email,welcomeUrl,trainingDate:prior[4],instructor:prior[5]});MailApp.sendEmail({to:account.email,subject:'Welcome to BSSC Foundations — start your account setup',body:mail.text,htmlBody:mail.html,name:'BoneShakers Social Club',replyTo:'president@boneshakerssocialclub.com'});
 const refreshed=lmsTable_(book,'LMS Attendance'),index=refreshed.rows.findIndex(r=>r[0]===attendanceId);if(index<1)throw Error('Restart attendance needs review.');nextAttendance[9]='Attestation pending';nextAttendance[10]=new Date().toISOString();refreshed.sheet.getRange(index+1,1,1,nextAttendance.length).setValues([nextAttendance]);memberOutboxFinish_(entry,'Sent');console.log('Owner account setup restarted and one welcome sent to ramhdcui@gmail.com. Earlier signed attestation and certificate preserved in History. New attestation is unsigned.');
 }catch(error){memberOutboxFinish_(entry,'Needs review','OWNER_RESTART_REQUIRES_REVIEW');throw Error('The restart needs administrator review. Do not repeat it.');}
 }finally{lock.releaseLock();}
}
// Manual delivery trigger: processInPersonInvitations, Head, every five minutes; configured in the Apps Script Triggers UI.
