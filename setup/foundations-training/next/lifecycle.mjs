// Pure enrollment/reminder rules. No scheduler, mail transport, or account provisioning is enabled here.
export const MILESTONES=Object.freeze([45,30,15,10,5,3,2,1]);
export const TIME_ZONE='America/New_York';
export const COURSE_VERSION='bssc-foundations-2026-11-v1';
const DAY=86400000;
export function localDay(value){const date=new Date(value);if(!Number.isFinite(date.getTime()))throw Error('A valid date is required.');return new Intl.DateTimeFormat('en-CA',{timeZone:TIME_ZONE,year:'numeric',month:'2-digit',day:'2-digit'}).format(date);}
function dayNumber(value){if(!/^\d{4}-\d{2}-\d{2}$/.test(value))throw Error('Expected an ISO calendar date.');const n=Date.parse(value+'T00:00:00Z');if(!Number.isFinite(n)||new Date(n).toISOString().slice(0,10)!==value)throw Error('Invalid calendar date.');return n/DAY;}
export function dueDay(invitedAt){return new Date((dayNumber(localDay(invitedAt))+60)*DAY).toISOString().slice(0,10);}
export function daysRemaining(enrollment,now){return dayNumber(enrollment.dueDay)-dayNumber(localDay(now));}
export function verifiedComplete(enrollment){return enrollment.recordType==='Official'&&enrollment.courseVersion===COURSE_VERSION&&enrollment.sections?.length===7&&enrollment.sections.every((s,i)=>s.section===i+1&&s.passed===true&&Number(s.bestScore)>=4&&Number(s.bestScore)<=5)&&enrollment.completion?.verified===true&&enrollment.completion.courseVersion===COURSE_VERSION&&enrollment.completion.enrollmentId===enrollment.id;}
export function patchDecision(enrollment){return verifiedComplete(enrollment)?{eligible:true,reason:'Foundations completed and attested.'}:{eligible:false,reason:'Complete all seven Foundations sections at 80% or higher and submit the final attestation before patch-in.'};}
export function nextReminder(enrollment,now,ledger=[]){
 if(enrollment.recordType!=='Official'||enrollment.archived||['inactive','withdrawn','removed','deceased','non-renewal'].includes(String(enrollment.rosterStatus||'').toLowerCase())||enrollment.deliveryStatus!=='Sent'||!enrollment.invitedAt||verifiedComplete(enrollment))return null;
 const remaining=daysRemaining(enrollment,now);if(remaining<1||remaining>45)return null;
 // One current countdown, even after a missed job. Never dump old reminders into an inbox.
 const threshold=[...MILESTONES].reverse().find(n=>remaining<=n);if(!threshold)return null;
 const key=`${enrollment.id}:${enrollment.courseVersion}:${enrollment.dueDay}:remaining-${threshold}`;
 if(ledger.some(x=>x.key===key&&['Queued','Sending','Sent','Unknown'].includes(x.status)))return null;
 return {key,enrollmentId:enrollment.id,to:enrollment.email,kind:'reminder',milestone:threshold,daysRemaining:remaining,dueDay:enrollment.dueDay};
}
export function rosterCandidates(members,baselineKeys,enrollments){
 if(!Array.isArray(baselineKeys))throw Error('Capture a roster baseline before turning on enrollment.');
 const seen=new Set([...baselineKeys,...enrollments.map(x=>x.memberKey)]),emails=new Map();
 for(const m of members){const e=String(m.email||'').trim().toLowerCase();emails.set(e,(emails.get(e)||0)+1);}
 const invite=[],review=[];
 for(const member of members){if(!member.memberKey||seen.has(member.memberKey))continue;seen.add(member.memberKey);
  const email=String(member.email||'').trim().toLowerCase();
  if(!member.name?.trim()||!/^\S+@\S+\.\S+$/.test(email)||emails.get(email)!==1){review.push({memberKey:member.memberKey,reason:'Check the name and a unique deliverable email before creating a login.'});continue;}
  invite.push({...member,email,recordType:'Official',courseVersion:COURSE_VERSION});
 }
 return {invite,review};
}
export function countdownState(enrollment,now){const passed=enrollment.sections?.filter(s=>s.passed).length||0;return {daysRemaining:daysRemaining(enrollment,now),passed,percent:Math.round(passed/7*100),remainingWork:passed===7?'Submit your final completion attestation.':`Complete ${7-passed} remaining section${passed===6?'':'s'} and the final attestation.`};}
