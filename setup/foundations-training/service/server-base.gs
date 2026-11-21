/** BSSC LMS: Workspace-only learner service. Deploy as owner; restrict access to the BSSC domain. */
const LMS_BOOK='1G1GhywDG-FYEo00fY_FeWheScve333LIdBqZpqLbZZM';
const LMS_DOMAIN='boneshakerssocialclub.com';
const LMS_OWNER='bsscvb@boneshakerssocialclub.com';
const LMS_VERSION='bssc-foundations-2026-11-v1';
const LMS_ATTESTATION='I confirm I completed all seven lessons, earned at least 80% on each quiz, and understand my responsibility to follow BSSC standards and ask leadership when I need clarification.';
function lmsIdentity_(){const email=String(Session.getActiveUser().getEmail()||'').trim().toLowerCase();if(!email||!email.endsWith('@'+LMS_DOMAIN))throw new TrainingError('Sign in with your BSSC Google Workspace account to open your training record.',401);return email;}
function lmsTable_(book,name){const sheet=book.getSheetByName(name);if(!sheet)throw new TrainingError('The training record store needs setup.',503);const width=LMS_SCHEMA[name].length,rows=sheet.getRange(1,1,Math.max(1,sheet.getLastRow()),width).getValues();if(LMS_SCHEMA[name].some((h,i)=>rows[0][i]!==h))throw new TrainingError('The training record headings need review.',503);return {sheet,rows,width};}
function lmsUser_(book,email){const table=lmsTable_(book,'LMS Enrollments'),found=[];table.rows.slice(1).forEach((row,i)=>{if(String(row[3]).trim().toLowerCase()===email&&row[17]!==true&&String(row[17]).toLowerCase()!=='true')found.push({row,index:i+1})});if(found.length!==1)throw new TrainingError(found.length?'More than one active enrollment needs review. Contact the President.':'You do not have an active training enrollment. Contact the President to be enrolled.',403);const user=found[0];if(user.row[5]!==LMS_VERSION)throw new TrainingError('Your assigned course version is not available in this player. Contact the President.',409);return {...user,table};}
function lmsCell_(value){return {userEnteredValue:typeof value==='boolean'?{boolValue:value}:typeof value==='number'?{numberValue:value}:{stringValue:String(value??'')}}}
function lmsUpdate_(sheetId,row,values){return {updateCells:{range:{sheetId,startRowIndex:row,endRowIndex:row+1,startColumnIndex:0,endColumnIndex:values.length},rows:[{values:values.map(lmsCell_)}],fields:'userEnteredValue'}}}
function lmsAppend_(sheetId,values){return {appendCells:{sheetId,rows:[{values:values.map(lmsCell_)}],fields:'userEnteredValue'}}}
function lmsSave_(book,user,state,index,now,attempt,completion){
 const at=new Date(now).toISOString(),row=user.row.slice();row[10]=row[10]||state.startedAt||'';row[11]=at;row[12]=state.completion?.at||'';row[14]=JSON.stringify(state);row[15]=at;row[18]=Number(row[18]||0)+1;
 const requests=[lmsUpdate_(user.table.sheet.getSheetId(),user.index,row)];
 if(Number.isInteger(index)&&index>=0&&index<7){const table=lmsTable_(book,'LMS Progress'),matches=[];table.rows.slice(1).forEach((r,i)=>{if(r[0]===row[0]&&Number(r[1])===index+1)matches.push(i+1)});if(matches.length>1)throw new TrainingError('Duplicate section progress needs review.',409);const s=state.sections[index],values=[row[0],index+1,LMS_COURSE[index].title,s.watched,LMS_COURSE[index].duration,s.watchComplete,s.passed,s.attempts?s.bestScore:'',s.lastScore??'',s.attempts,Boolean(s.attempts&&!s.passed&&!s.watchComplete),s.startedAt||'',s.passedAt||'',at,LMS_VERSION,s.position];requests.push(matches.length?lmsUpdate_(table.sheet.getSheetId(),matches[0],values):lmsAppend_(table.sheet.getSheetId(),values));}
 if(attempt){const table=lmsTable_(book,'LMS Attempts');requests.push(lmsAppend_(table.sheet.getSheetId(),attempt));}
 if(completion){const table=lmsTable_(book,'LMS Completions');requests.push(lmsAppend_(table.sheet.getSheetId(),completion));}
 try{Sheets.Spreadsheets.batchUpdate({requests},LMS_BOOK)}catch(error){throw new TrainingError('Your latest progress could not be saved. No partial record was committed. Please try again.',503);}
}
function lmsRequest(input){
 let lock;
 try{if(!input||typeof input!=='object'||Array.isArray(input)||JSON.stringify(input).length>8000)throw new TrainingError('Invalid training request.');const email=lmsIdentity_();lock=LockService.getScriptLock();if(!lock.tryLock(15000))throw new TrainingError('Training records are busy. Please try again.',503);const book=SpreadsheetApp.openById(LMS_BOOK),user=lmsUser_(book,email),state=user.row[14]?JSON.parse(user.row[14]):initialState(),now=Date.now(),at=new Date(now).toISOString(),index=Number(input.section)-1;
 if(input.action==='load')return {user:{email,name:user.row[2]},progress:publicState(state),recordType:user.row[6]};
 if(input.action==='getQuiz'){if(!unlocked(state,index)||!state.sections[index].watchComplete)throw new TrainingError('Watch the complete lesson to unlock this quiz.',403);return {questions:LMS_BANK[index].map(q=>({q:q.q,options:q.options}))};}
 let extra={},attempt=null,completion=null;
 if(input.action==='start'){extra.session=Utilities.getUuid();startWatch(state,index,now,extra.session);state.startedAt=state.startedAt||at;state.sections[index].startedAt=state.sections[index].startedAt||at;}
 else if(input.action==='tick')recordWatch(state,index,input,now,LMS_COURSE[index]?.duration||0);
 else if(input.action==='quiz'){
  if(typeof input.requestId!=='string'||!/^[0-9a-f-]{36}$/i.test(input.requestId))throw new TrainingError('The quiz submission needs a request reference.');
  if(state.lastQuiz?.requestId===input.requestId)return {...state.lastQuiz.result,progress:publicState(state)};
  const graded=gradeQuiz(state,index,input.answers,LMS_BANK),s=state.sections[index];if(graded.passed)s.passedAt=s.passedAt||at;
  const feedback=LMS_BANK[index].map((q,i)=>({question:q.q,chosen:q.options[input.answers[i]],correct:q.options[q.answer],isCorrect:input.answers[i]===q.answer,explanation:q.explanation}));s.lastFeedback=feedback;
  extra={score:graded.score,passed:graded.passed,rewatchRequired:graded.rewatchRequired,feedback};state.lastQuiz={requestId:input.requestId,result:extra};
  attempt=[Utilities.getUuid(),user.row[0],index+1,s.attempts,graded.score,5,graded.score*20,graded.passed,at,JSON.stringify(input.answers),JSON.stringify(LMS_BANK[index]),LMS_VERSION,JSON.stringify(state),input.requestId,graded.rewatchRequired];
 }else if(input.action==='attest'){
  if(String(input.name||'').trim().toLowerCase()!==String(user.row[2]).trim().toLowerCase())throw new TrainingError('Enter your enrolled full name: '+user.row[2]);
  const wasComplete=Boolean(state.completion);attest(state,String(user.row[2]),input.accepted,now,'BSSC-'+Utilities.getUuid().toUpperCase());state.completion.recordType=user.row[6];state.completion.courseVersion=LMS_VERSION;state.completion.verified=user.row[6]==='Official';
  if(!wasComplete)completion=[state.completion.id,user.row[0],state.completion.name,state.completion.at,LMS_ATTESTATION,LMS_VERSION,JSON.stringify(state.completion.scores),user.row[6],user.row[6]==='Official'?'Verified':'Practice',at];
 }else throw new TrainingError('Unknown training action.');
 lmsSave_(book,user,state,index,now,attempt,completion);return {...extra,progress:publicState(state)};
 }catch(error){return {error:error instanceof TrainingError?error.message:'The training service is temporarily unavailable. Please try again.',status:error.status||500}}
 finally{if(lock)lock.releaseLock();}
}
/** Run this once in the editor as the club administrator to authorize the record connection. */
function authorizeLmsService(){if(lmsIdentity_()!==LMS_OWNER)throw Error('Only the BSSC service owner can authorize this setup.');const response=Sheets.Spreadsheets.get(LMS_BOOK,{fields:'spreadsheetId'});if(response.spreadsheetId!==LMS_BOOK)throw Error('The membership workbook connection could not be verified.');console.log('LMS record connection authorized. No learners, grades, or certificates were changed.');}
function doGet(){lmsIdentity_();return HtmlService.createHtmlOutput(LMS_HTML).addMetaTag('viewport','width=device-width, initial-scale=1').setTitle('BSSC Foundations Training').setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);}
