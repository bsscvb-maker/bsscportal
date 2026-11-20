import course from './course.json';
export const officialMode=()=>Boolean((window as any).BSSC_LMS_OFFICIAL);
export async function trainingFetch(url:string,options?:any){
 if(!officialMode())return (await import('./practice')).practiceFetch(url,options);
 const parsed=new URL(url,window.location.href),input=options?JSON.parse(options.body):parsed.searchParams.has('quiz')?{action:'getQuiz',section:Number(parsed.searchParams.get('quiz'))}:{action:'load'};
 input.requestId=crypto.randomUUID();
 try{const d:any=await new Promise((resolve,reject)=>{const runner=(window as any).google?.script?.run;if(!runner){reject(Error('Open the course through your BSSC training sign-in.'));return}runner.withSuccessHandler(resolve).withFailureHandler(reject).lmsRequest(input)});return {ok:!d.error,json:async()=>input.action==='load'?{...d,course}:d}}catch(e:any){return {ok:false,json:async()=>({error:e.message||'The training record could not be saved. Please try again.'})}}
}
