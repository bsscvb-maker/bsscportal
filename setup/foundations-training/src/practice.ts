import course from './course.json';
import bank from './questions.json';
import {initialState,unlocked,startWatch,recordWatch,gradeQuiz,attest,publicState} from './engine.mjs';
const key='bssc-foundations-practice-v1';
function read(){const raw=localStorage.getItem(key);return raw?JSON.parse(raw):initialState()}
export async function practiceFetch(url:string,options?:any){
 try{let state=read(),body:any;const u=new URL(url,location.origin);
 if(!options){if(u.searchParams.has('quiz')){const i=Number(u.searchParams.get('quiz'))-1;if(!unlocked(state,i)||!state.sections[i].watchComplete)throw Error('Watch the complete lesson first.');body={questions:bank[i].map(({q,options})=>({q,options}))};}else body={user:{email:'Practice learner'},course,progress:publicState(state)};
 }else{const input=JSON.parse(options.body),i=Number(input.section)-1,now=Date.now();let extra:any={};
 if(input.action==='start'){extra.session=crypto.randomUUID();startWatch(state,i,now,extra.session)}
 else if(input.action==='tick')recordWatch(state,i,input,now,course[i]?.duration||0);
 else if(input.action==='quiz'){const r=gradeQuiz(state,i,input.answers,bank);extra={score:r.score,passed:r.passed,rewatchRequired:r.rewatchRequired}}
 else if(input.action==='attest')attest(state,input.name,input.accepted,now,'PRACTICE-'+crypto.randomUUID().slice(0,8).toUpperCase());
 else throw Error('Unknown action.');localStorage.setItem(key,JSON.stringify(state));body={...extra,progress:publicState(state)};
 }return {ok:true,json:async()=>body};
 }catch(e:any){return {ok:false,json:async()=>({error:e.message||'Unable to save practice progress on this browser.'})}}
}
