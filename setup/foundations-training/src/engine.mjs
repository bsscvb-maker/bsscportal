export class TrainingError extends Error {
  constructor(message, status=400) { super(message); this.status=status; }
}
export function initialState() {
  return { version:1, sections:Array.from({length:7},()=>({watched:0,position:0,watchComplete:false,passed:false,attempts:0,bestScore:0,lastScore:null,session:null,lastTickAt:null})),completion:null };
}
export function unlocked(state,index) {
  return Number.isInteger(index)&&index>=0&&index<7&&state.sections.slice(0,index).every(s=>s.passed);
}
export function startWatch(state,index,now,session) {
  if(!unlocked(state,index)) throw new TrainingError('Complete the previous section first.',403);
  const s=state.sections[index]; s.session=session;s.lastTickAt=now;
  s.position=Math.min(s.position,s.watched);return state;
}
export function recordWatch(state,index,input,now,duration) {
  if(!unlocked(state,index))throw new TrainingError('This section is still locked.',403);
  const s=state.sections[index];
  if(!s.session||input.session!==s.session)throw new TrainingError('Playback moved to another session. Press Play to reconnect.',409);
  if(!Number.isFinite(input.position)||input.position<0||input.position>duration+2)throw new TrainingError('Invalid playback position.');
  const elapsed=Math.max(0,Math.min((now-s.lastTickAt)/1000,12));
  if(elapsed<1.2&&!input.ended)throw new TrainingError('Playback is saving. Please wait a moment.',429);
  const position=Math.min(duration,input.position);
  if(position>s.watched+elapsed+1.5)throw new TrainingError('Finish watching the lesson before moving ahead.',409);
  if(input.playing===true&&input.visible===true)s.watched=Math.max(s.watched,Math.min(position,s.watched+elapsed));
  s.position=Math.min(position,s.watched);s.lastTickAt=now;
  if(input.ended===true&&input.visible===true&&s.watched>=duration-1&&position>=duration-1)s.watchComplete=true;
  return state;
}
export function gradeQuiz(state,index,answers,bank) {
  if(!unlocked(state,index)||!state.sections[index].watchComplete)throw new TrainingError('Watch the complete lesson before taking its quiz.',403);
  if(state.sections[index].passed)throw new TrainingError('This section has already been passed.',409);
  if(!Array.isArray(answers)||answers.length!==5||answers.some((a,i)=>!Number.isInteger(a)||a<0||a>=bank[index][i].options.length))throw new TrainingError('Answer all five questions.');
  const s=state.sections[index],score=answers.reduce((sum,a,i)=>sum+Number(a===bank[index][i].answer),0);
  s.attempts++;s.lastScore=score;s.bestScore=Math.max(s.bestScore,score);
  if(score>=4)s.passed=true;
  else if(!s.passed){s.watched=0;s.position=0;s.watchComplete=false;s.session=null;s.lastTickAt=null;}
  return {state,score,passed:score>=4,rewatchRequired:score<4&&!s.passed};
}
export function attest(state,name,accepted,now,id) {
  if(!state.sections.every(s=>s.passed))throw new TrainingError('Pass all seven section quizzes before completing the attestation.',403);
  if(accepted!==true||typeof name!=='string'||name.trim().length<2||name.trim().length>120)throw new TrainingError('Enter your full name and confirm the attestation.');
  if(!state.completion)state.completion={id,name:name.trim(),at:new Date(now).toISOString(),attestationVersion:'bssc-foundations-v1',scores:state.sections.map(s=>s.lastScore)};
  return state;
}
export function publicState(state) {
  return {version:state.version,sections:state.sections.map(({session,lastTickAt,...s})=>s),completion:state.completion};
}
