const LMS_SCHEMA={
  "LMS Enrollments": [
    "Enrollment ID",
    "Member Key",
    "Full Name",
    "Email",
    "Membership Status",
    "Course Version",
    "Record Type",
    "Assigned At",
    "Due At",
    "Assigned By",
    "First Started At",
    "Last Active At",
    "Completed At",
    "Google Subject",
    "State JSON",
    "Updated At",
    "Notes",
    "Archived",
    "Revision"
  ],
  "LMS Progress": [
    "Enrollment ID",
    "Section",
    "Section Title",
    "Watched Seconds",
    "Video Seconds",
    "Video Complete",
    "Quiz Passed",
    "Best Score",
    "Last Score",
    "Attempts",
    "Rewatch Required",
    "Started At",
    "Passed At",
    "Last Active At",
    "Course Version",
    "Last Position"
  ],
  "LMS Attempts": [
    "Attempt ID",
    "Enrollment ID",
    "Section",
    "Attempt Number",
    "Score",
    "Question Count",
    "Percent",
    "Passed",
    "Submitted At",
    "Answers JSON",
    "Questions JSON",
    "Course Version",
    "State After JSON",
    "Request ID",
    "Rewatch Required"
  ],
  "LMS Completions": [
    "Certificate ID",
    "Enrollment ID",
    "Full Name",
    "Completed At",
    "Attestation",
    "Course Version",
    "Scores JSON",
    "Record Type",
    "Verification Status",
    "Issued At"
  ],
  "LMS Settings": [
    "Setting",
    "Value",
    "Updated At",
    "Updated By"
  ]
}
;
const LMS_COURSE=[{"id": 1, "title": "Our roots and purpose", "duration": 540.0}, {"id": 2, "title": "Colors, conduct and reputation", "duration": 429.905}, {"id": 3, "title": "Board and leadership", "duration": 612.719}, {"id": 4, "title": "Shared standards and reporting", "duration": 667.0}, {"id": 5, "title": "Membership and participation", "duration": 199.0}, {"id": 6, "title": "Rides and event responsibilities", "duration": 395.52}, {"id": 7, "title": "Fundraising and club resources", "duration": 563.67}];
const LMS_BANK=[
  [
    {
      "q": "Where and when did BoneShakers Social Club begin?",
      "options": [
        "At the original BoneShakers Saloon in 2005",
        "At Elevation 27 in 2025",
        "As a chapter of another club in 2010"
      ],
      "answer": 0,
      "explanation": "BoneShakers began in 2005 at the original BoneShakers Saloon. That history connects the club to its founders and its continuing purpose."
    },
    {
      "q": "What does a complete Bikes for Tykes set include?",
      "options": [
        "A bicycle and a club shirt",
        "A bicycle, a helmet and a lock",
        "A helmet and a gift card"
      ],
      "answer": 1,
      "explanation": "Each Bikes for Tykes set includes a bicycle, helmet, and lock so the child receives the full intended package."
    },
    {
      "q": "What must happen before someone commits club funds?",
      "options": [
        "A member announces the expense in GroupMe",
        "Someone checks the bank balance alone",
        "The Treasurer provides the financial information and the proper approval is obtained"
      ],
      "answer": 2,
      "explanation": "A bank balance can include restricted or committed money. The Treasurer checks the financial position, and the appropriate approval must come before anyone promises club funds."
    },
    {
      "q": "Who was the founding President, and what inspired Big Lick?",
      "options": [
        "Big John Wilkerson; a tattoo he already had",
        "Godfather Gordon; an event poster",
        "A local business owner; a motorcycle brand"
      ],
      "answer": 0,
      "explanation": "Big John Wilkerson was the founding President. His existing tattoo, connected with Roanoke’s Big Lick history, inspired the original club artwork."
    },
    {
      "q": "How can a member who does not ride a motorcycle contribute?",
      "options": [
        "Only by paying dues",
        "Through friendships, volunteering and community service",
        "Only by buying a motorcycle"
      ],
      "answer": 1,
      "explanation": "Riders and nonriders both belong. Friendship, dependable volunteering, and community service are meaningful contributions."
    }
  ],
  [
    {
      "q": "What should you do before adding or moving a club-related patch?",
      "options": [
        "Ask any friend to approve it",
        "Add it if you bought it yourself",
        "Ask club leadership about approval and placement"
      ],
      "answer": 2,
      "explanation": "Club-related patches carry specific permissions and placement rules. Leadership should confirm approval before you add or move one."
    },
    {
      "q": "Another organization asks you to promise that BSSC will cohost an event. What is the right response?",
      "options": [
        "Refer the request to leadership before making any commitment",
        "Agree if enough friends want to attend",
        "Post the event as official and ask for approval later"
      ],
      "answer": 0,
      "explanation": "An individual member cannot promise official BSSC participation. Refer the proposal to leadership before making a commitment."
    },
    {
      "q": "Someone asks for private fundraising arrangements and club business contacts. What should you do?",
      "options": [
        "Share screenshots to explain the arrangement",
        "Celebrate the success and refer private business questions to the President",
        "Give them every contact because it is for charity"
      ],
      "answer": 1,
      "explanation": "You can celebrate the fundraiser and thank supporters while referring private arrangements and business contacts to the President."
    },
    {
      "q": "Who owns club-issued membership patches?",
      "options": [
        "The person who wears the vest",
        "The sponsor who presents them",
        "BSSC; they must be returned when the governing documents require it"
      ],
      "answer": 2,
      "explanation": "BSSC owns its issued membership patches. The governing documents determine when those patches must be returned and any approved exceptions."
    },
    {
      "q": "How should you introduce the organization?",
      "options": [
        "BoneShakers Social Club",
        "BoneShakers Motorcycle Club",
        "An unofficial chapter of another club"
      ],
      "answer": 0,
      "explanation": "Use the full name BoneShakers Social Club. Members cannot independently rename the organization or present it as an MC, RC, or another club’s chapter."
    }
  ],
  [
    {
      "q": "How are directors and core officers selected?",
      "options": [
        "The President appoints everyone without an election",
        "Eligible members elect directors, and the directors choose core officers through the officer-election process",
        "The longest-serving member automatically takes each role"
      ],
      "answer": 1,
      "explanation": "Eligible members elect directors for the open seats. Those directors then select core officers through the officer-election process."
    },
    {
      "q": "Which pairing correctly describes the Secretary and Treasurer?",
      "options": [
        "Secretary: ride routes; Treasurer: conduct decisions alone",
        "Secretary: social invitations; Treasurer: event artwork",
        "Secretary: minutes and records; Treasurer: club funds and financial information"
      ],
      "answer": 2,
      "explanation": "The Secretary maintains minutes and official records. The Treasurer maintains financial records, reports, and information about available funds."
    },
    {
      "q": "A routine concern remains unresolved. What should happen next?",
      "options": [
        "Use the established review process so the Board can consider facts and an appropriate outcome",
        "Turn it into a public argument",
        "Assume that an individual member can issue a final Board decision"
      ],
      "answer": 0,
      "explanation": "Unresolved routine concerns should go through the established review process with facts and the outcome requested. A public argument does not produce a valid Board decision."
    },
    {
      "q": "Why does BSSC use staggered two-year director terms?",
      "options": [
        "To eliminate future elections",
        "To retain experience and continuity while welcoming new directors",
        "To give some directors extra votes"
      ],
      "answer": 1,
      "explanation": "Staggered terms preserve experience and unfinished work while allowing new directors to join. They do not change each director’s one Board vote."
    },
    {
      "q": "What is the appropriate role of the Sergeant-at-Arms in conduct matters?",
      "options": [
        "Ignore safety issues until the next election",
        "Make every disciplinary decision without review",
        "Help maintain order and safety while formal discipline follows the club's review process"
      ],
      "answer": 2,
      "explanation": "The Sergeant at Arms helps restore order and address immediate safety issues. Formal discipline still follows the club’s review process."
    }
  ],
  [
    {
      "q": "Someone says that an interaction is unwanted and asks you to stop. What should you do?",
      "options": [
        "Stop immediately and respect the boundary",
        "Continue if you meant it as a joke",
        "Wait until someone else agrees with the complaint"
      ],
      "answer": 0,
      "explanation": "Respect a personal boundary the first time it is expressed. Good intentions, jokes, and alcohol do not excuse unwanted behavior."
    },
    {
      "q": "How should you report a concern when the President is involved or has a conflict?",
      "options": [
        "Post the allegation to the public immediately",
        "Drop the concern because leadership is involved",
        "Use the Vice President, Board or an unconflicted director through the proper process"
      ],
      "answer": 2,
      "explanation": "A complaint involving the President goes to the Vice President for the Board’s attention. Use an unconflicted director if the Vice President is also involved."
    },
    {
      "q": "What is the appropriate way to handle screenshots or evidence related to a club concern?",
      "options": [
        "Share it widely to gather opinions",
        "Preserve it privately and use appropriate good-faith reporting channels",
        "Delete it before the concern can be reviewed"
      ],
      "answer": 1,
      "explanation": "Preserve relevant evidence privately and share it through appropriate good-faith reporting channels. Confidentiality does not require hiding misconduct or preventing reports to authorities."
    },
    {
      "q": "How should you participate in a club meeting?",
      "options": [
        "Follow the chair's process, wait your turn and stay on the topic",
        "Interrupt whenever you disagree",
        "Hold side conversations while someone else is speaking"
      ],
      "answer": 0,
      "explanation": "Follow the chair’s process, wait your turn, and keep discussion focused. Side conversations and interruptions prevent others from following the meeting."
    },
    {
      "q": "You can no longer fulfill an event commitment. What should you do?",
      "options": [
        "Assume someone else will notice",
        "Tell the organizer promptly so coverage can be arranged",
        "Wait until after the event to explain"
      ],
      "answer": 1,
      "explanation": "Tell the organizer promptly when your availability changes so coverage and a clear handoff can be arranged."
    }
  ],
  [
    {
      "q": "What should a prospect's sponsor help with?",
      "options": [
        "Guaranteeing a Board position",
        "Bypassing the Foundations class",
        "Introductions, expectations and meaningful participation"
      ],
      "answer": 2,
      "explanation": "Sponsors help prospects meet people, understand expectations, and participate. They cannot guarantee office or bypass admission requirements."
    },
    {
      "q": "Which description of member communication and access is correct?",
      "options": [
        "Prospects use the approved GroupMe access; full-member Facebook and private website access follow the club's approval process",
        "Creating any website account automatically grants all private access",
        "Every prospect receives Board-level access"
      ],
      "answer": 0,
      "explanation": "Prospect GroupMe access and full-member Facebook and website access follow different approval rules. Creating a website account does not automatically grant private access."
    },
    {
      "q": "What should you do about a missing attendance record or a participation hardship?",
      "options": [
        "Wait until the end of the year",
        "Raise record issues promptly and discuss hardship circumstances with the President early",
        "Change your membership status on your own"
      ],
      "answer": 1,
      "explanation": "Report missing attendance promptly while the details can be checked. Raise participation hardships early with the President so the proper review can occur."
    },
    {
      "q": "When must a prospect complete BSSC Foundations training?",
      "options": [
        "Only after serving on the Board",
        "It is optional for prospects",
        "Before patching in as a full member"
      ],
      "answer": 2,
      "explanation": "Every prospect must complete BSSC Foundations before patching in as a full member. The training establishes shared expectations at the start of membership."
    },
    {
      "q": "What is part of taking responsibility for your membership?",
      "options": [
        "Keeping contact information, renewals and dues current as applicable",
        "Assuming someone else will update your information",
        "Ignoring requirements after receiving your cut"
      ],
      "answer": 0,
      "explanation": "Membership responsibilities continue after patching in. Keep contact details, required renewals, acknowledgments, and dues current unless an approved exemption applies."
    }
  ],
  [
    {
      "q": "How do the Road Captain and Tail Gunner support a group ride?",
      "options": [
        "The Road Captain plans and briefs the ride; the Tail Gunner takes the rear position and helps communicate problems",
        "They replace each rider's responsibility for safe riding",
        "The Tail Gunner chooses a new route without telling the group"
      ],
      "answer": 0,
      "explanation": "The Road Captain plans and briefs the ride. The Tail Gunner works from the rear to communicate problems. Each rider remains responsible for safe and lawful riding."
    },
    {
      "q": "A rider becomes separated, or someone is too impaired to ride. What is the safe response?",
      "options": [
        "Race to catch up, or let the person decide to ride anyway",
        "Use the agreed regrouping plan; arrange safe transport and involve appropriate leadership for an impaired person",
        "Ignore both situations so the group stays on schedule"
      ],
      "answer": 1,
      "explanation": "Use the agreed regrouping plan instead of racing to catch up. An impaired person needs safe transportation, with the appropriate leadership involved."
    },
    {
      "q": "You need to leave an assigned volunteer station. What should you do?",
      "options": [
        "Leave the money and supplies for whoever arrives next",
        "Ask a guest to watch the station without telling anyone",
        "Tell the coordinator, arrange relief and make a clear handoff"
      ],
      "answer": 2,
      "explanation": "Notify the coordinator, arrange relief, and hand over money, keys, supplies, and unfinished work clearly before leaving a station."
    },
    {
      "q": "What belongs in a pre-ride briefing?",
      "options": [
        "The route, signals, stops, regrouping plan and how to leave safely",
        "Only the final destination",
        "Only the names of people who have ridden before"
      ],
      "answer": 0,
      "explanation": "A briefing should cover the route, signals, stops, regrouping plan, and how to leave safely. Familiarity with the destination does not replace listening to the briefing."
    },
    {
      "q": "When should you report for an event assignment?",
      "options": [
        "Whenever the public event starts",
        "At the assigned time, checking in with the coordinator",
        "Only after someone calls to ask where you are"
      ],
      "answer": 1,
      "explanation": "Report at your assigned time and check in with the coordinator. Volunteer reporting and setup times can differ from the public event start."
    }
  ],
  [
    {
      "q": "What should an event or fundraising proposal include?",
      "options": [
        "Only a catchy event name",
        "The purpose, beneficiary, timing, location, costs and people doing the work, submitted through the President for review",
        "A public announcement before any review"
      ],
      "answer": 1,
      "explanation": "A useful proposal identifies the purpose, beneficiary, timing, location, costs, and people doing the work. Submit it through the President before public commitments are made."
    },
    {
      "q": "An event is approved. What else must happen before distributing a club-branded flyer or shirt?",
      "options": [
        "Nothing; every design is automatically approved",
        "The person paying for it can choose any design",
        "The final design and intended use must receive the required approval"
      ],
      "answer": 2,
      "explanation": "Event approval does not automatically approve every flyer, shirt, or other branded item. The final design and intended use need the required approval."
    },
    {
      "q": "How should a request for financial assistance be handled?",
      "options": [
        "Keep circumstances private, bring it through the approved process, and let the Treasurer and Board review resources and approval",
        "Promise the money first and check funds later",
        "Share the person's circumstances with everyone"
      ],
      "answer": 0,
      "explanation": "Protect the person’s privacy and use the approved request process. The Treasurer checks resources and restrictions, and the Board reviews the request before assistance is promised."
    },
    {
      "q": "Who should handle official sponsorship commitments and media questions?",
      "options": [
        "Any member who happens to be present",
        "The President or the person with the appropriate official authority",
        "Only the person who first heard the request"
      ],
      "answer": 1,
      "explanation": "Official commitments and media responses belong with the President or another person with the appropriate authority. A friendly conversation does not authorize a member to speak for the club."
    },
    {
      "q": "What should you do if borrowed club equipment is damaged or incomplete?",
      "options": [
        "Return it without mentioning the problem",
        "Keep it until somebody asks",
        "Report the problem promptly and coordinate its return or repair"
      ],
      "answer": 2,
      "explanation": "Report damage or missing pieces promptly and coordinate return or repair. Another volunteer should not have to discover the problem at the next event."
    }
  ]
];
const LMS_HTML="<!doctype html><html lang=\"en\"><head><script>window.BSSC_LMS_OFFICIAL=true;</script><meta charset=\"UTF-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><meta name=\"robots\" content=\"noindex,nofollow\"><meta name=\"referrer\" content=\"same-origin\"><title>BSSC Foundations Training \u2014 Prospect Test Drive</title><link rel=\"icon\" href=\"https://bsscvb-maker.github.io/bsscportal/bssc-favicon.png\">  <script type=\"module\" crossorigin src=\"https://bsscvb-maker.github.io/bsscportal/training/assets/index-BhmZY0Q6.js\"></script>\n  <link rel=\"stylesheet\" crossorigin href=\"https://bsscvb-maker.github.io/bsscportal/training/assets/index-DLlOkL8k.css\">\n</head><body><div id=\"root\"></div></body></html>\n";
class TrainingError extends Error {
  constructor(message, status=400) { super(message); this.status=status; }
}
function initialState() {
  return { version:1, sections:Array.from({length:7},()=>({watched:0,position:0,watchComplete:false,passed:false,attempts:0,bestScore:0,lastScore:null,session:null,lastTickAt:null})),completion:null };
}
function unlocked(state,index) {
  return Number.isInteger(index)&&index>=0&&index<7&&state.sections.slice(0,index).every(s=>s.passed);
}
function startWatch(state,index,now,session) {
  if(!unlocked(state,index)) throw new TrainingError('Complete the previous section first.',403);
  const s=state.sections[index]; s.session=session;s.lastTickAt=now;
  s.position=Math.min(s.position,s.watched);return state;
}
function recordWatch(state,index,input,now,duration) {
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
function gradeQuiz(state,index,answers,bank) {
  if(!unlocked(state,index)||!state.sections[index].watchComplete)throw new TrainingError('Watch the complete lesson before taking its quiz.',403);
  if(state.sections[index].passed)throw new TrainingError('This section has already been passed.',409);
  if(!Array.isArray(answers)||answers.length!==5||answers.some((a,i)=>!Number.isInteger(a)||a<0||a>=bank[index][i].options.length))throw new TrainingError('Answer all five questions.');
  const s=state.sections[index],score=answers.reduce((sum,a,i)=>sum+Number(a===bank[index][i].answer),0);
  s.attempts++;s.lastScore=score;s.bestScore=Math.max(s.bestScore,score);
  if(score>=4)s.passed=true;
  else if(!s.passed){s.watched=0;s.position=0;s.watchComplete=false;s.session=null;s.lastTickAt=null;}
  return {state,score,passed:score>=4,rewatchRequired:score<4&&!s.passed};
}
function attest(state,name,accepted,now,id) {
  if(!state.sections.every(s=>s.passed))throw new TrainingError('Pass all seven section quizzes before completing the attestation.',403);
  if(accepted!==true||typeof name!=='string'||name.trim().length<2||name.trim().length>120)throw new TrainingError('Enter your full name and confirm the attestation.');
  if(!state.completion)state.completion={id,name:name.trim(),at:new Date(now).toISOString(),attestationVersion:'bssc-foundations-v1',scores:state.sections.map(s=>s.lastScore)};
  return state;
}
function publicState(state) {
  return {version:state.version,sections:state.sections.map(({session,lastTickAt,...s})=>s),completion:state.completion};
}

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
