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
]
;
const LMS_HTML="<!doctype html><html lang=\"en\"><head><script>window.BSSC_LMS_OFFICIAL=true;</script><meta charset=\"UTF-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><meta name=\"robots\" content=\"noindex,nofollow\"><meta name=\"referrer\" content=\"same-origin\"><title>BSSC Foundations Training \u2014 Prospect Test Drive</title><link rel=\"icon\" href=\"https://bsscvb-maker.github.io/bsscportal/bssc-favicon.png\">  <script type=\"module\" crossorigin src=\"https://bsscvb-maker.github.io/bsscportal/training/assets/index-wA6F1aJQ.js\"></script>\n  <link rel=\"stylesheet\" crossorigin href=\"https://bsscvb-maker.github.io/bsscportal/training/assets/index-DdlNaxH4.css\">\n</head><body><div id=\"root\"></div></body></html>\n\n";
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
function lmsUser_(book,email){const table=lmsTable_(book,'LMS Enrollments'),found=[];table.rows.slice(1).forEach((row,i)=>{if(String(row[3]).trim().toLowerCase()===email&&row[17]!==true&&String(row[17]).toLowerCase()!=='true')found.push({row,index:i+1})});if(found.length!==1)throw new TrainingError(found.length?'More than one active enrollment needs review. Contact the President.':'This Google account is not enrolled in BSSC Foundations. Choose the BSSC account assigned to your training, or contact the President for an enrollment.',403);const user=found[0];if(user.row[5]!==LMS_VERSION)throw new TrainingError('Your assigned course version is not available in this player. Contact the President.',409);return {...user,table};}
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
function lmsRequest(input){return lmsHandle_(input,null);}
function lmsHandle_(input,verifiedIdentity){
 let lock,email='';
 try{if(!input||typeof input!=='object'||Array.isArray(input)||JSON.stringify(input).length>8000)throw new TrainingError('Invalid training request.');email=verifiedIdentity?verifiedIdentity.email:lmsIdentity_();lock=LockService.getScriptLock();if(!lock.tryLock(15000))throw new TrainingError('Training records are busy. Please try again.',503);const book=SpreadsheetApp.openById(LMS_BOOK),user=lmsUser_(book,email),state=user.row[14]?JSON.parse(user.row[14]):initialState(),now=Date.now(),at=new Date(now).toISOString(),index=Number(input.section)-1;
 if(verifiedIdentity&&user.row[0]!==verifiedIdentity.enrollmentId)throw new TrainingError('The account and enrollment do not match.',403);
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
 }catch(error){return {error:error instanceof TrainingError?error.message:'The training service is temporarily unavailable. Please try again.',status:error.status||500,...(email?{signedInEmail:email}:{})}}
 finally{if(lock)lock.releaseLock();}
}
/** Run this once in the editor as the club administrator to authorize the record connection. */
function authorizeLmsService(){if(lmsIdentity_()!==LMS_OWNER)throw Error('Only the BSSC service owner can authorize this setup.');const response=Sheets.Spreadsheets.get(LMS_BOOK,{fields:'spreadsheetId'});if(response.spreadsheetId!==LMS_BOOK)throw Error('The membership workbook connection could not be verified.');console.log('LMS record connection authorized. No learners, grades, or certificates were changed.');}
function doGet(){let html=LMS_HTML;const enabled=PropertiesService.getScriptProperties().getProperty('LMS_MEMBER_AUTH_ENABLED')==='true';if(enabled){const c=memberConfig_();html=html.replace('<head>','<head><script>window.BSSC_LMS_AUTH_CONFIG='+JSON.stringify({enabled:true,apiKey:c.apiKey})+';</script>');}else lmsIdentity_();return HtmlService.createHtmlOutput(html).addMetaTag('viewport','width=device-width, initial-scale=1').setTitle('BSSC Foundations Training').setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);}


/* Managed email/password gateway. Disabled until owner configures LMS_MEMBER_AUTH_ENABLED. */
function memberConfig_(){const p=PropertiesService.getScriptProperties(),apiKey=p.getProperty('LMS_FIREBASE_API_KEY'),projectId=p.getProperty('LMS_FIREBASE_PROJECT');if(p.getProperty('LMS_MEMBER_AUTH_ENABLED')!=='true'||!apiKey||!projectId)throw new TrainingError('Member email login is not active yet.',503);return {p,apiKey,projectId};}
function memberFetch_(path,payload,admin){const c=memberConfig_(),url='https://identitytoolkit.googleapis.com/v1/'+(admin?'projects/'+encodeURIComponent(c.projectId)+'/':'')+path+(admin?'':'?key='+encodeURIComponent(c.apiKey)),options={method:'post',contentType:'application/json',payload:JSON.stringify(payload),muteHttpExceptions:true};if(admin)options.headers={Authorization:'Bearer '+ScriptApp.getOAuthToken(),'X-Goog-User-Project':c.projectId};const response=UrlFetchApp.fetch(url,options),status=response.getResponseCode();let data;try{data=JSON.parse(response.getContentText())}catch(e){throw new TrainingError('The account service could not be reached.',503)}if(status<200||status>=300){const error=new TrainingError('The account service could not complete this request. Check your sign-in or contact the President.',status===400||status===401?401:503);error.providerStatus=status;error.providerConsumer=String(data.error?.details?.find(d=>d.metadata?.consumer)?.metadata?.consumer||'').replace(/[^a-zA-Z0-9_/-]/g,'').slice(0,80);error.providerCode=String(data.error?.message||data.error?.status||'REQUEST_FAILED').split(':')[0].replace(/[^A-Z_]/g,'').slice(0,80);throw error;}return data;}
function memberDigest_(value){return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,value,Utilities.Charset.UTF_8).map(b=>(b&255).toString(16).padStart(2,'0')).join('');}
function memberError_(error){return {error:error instanceof TrainingError?error.message:'The account service is temporarily unavailable. Please try again.',status:error.status||500};}
function memberIdentity_(input,allowTemporary){if(!input||typeof input.idToken!=='string'||input.idToken.length<100||input.idToken.length>6000)throw new TrainingError('Sign in with your training email and password.',401);const c=memberConfig_(),response=memberFetch_('accounts:lookup',{idToken:input.idToken},false);if(response.users?.length!==1)throw new TrainingError('Sign in again to continue.',401);const u=response.users[0],raw=c.p.getProperty('LMS_MEMBER_'+u.localId);if(!raw||u.disabled)throw new TrainingError('This account is not enrolled in Foundations. Contact the President.',403);const account=JSON.parse(raw),email=String(u.email||'').trim().toLowerCase();if(account.email!==email||account.archived||!account.enrollmentId)throw new TrainingError('Your account enrollment needs review. Contact the President.',403);if(account.mustChangePassword){const wasReset=Number(u.passwordUpdatedAt)>Number(account.initialPasswordUpdatedAt);if(!wasReset&&Date.now()>Date.parse(account.temporaryExpiresAt))throw new TrainingError('Your temporary password has expired. Use Forgot password, then choose a new training password.',401);if(!allowTemporary)throw new TrainingError('Change your temporary password before opening your training.',428);}return {email,uid:u.localId,enrollmentId:account.enrollmentId,account};}
function memberSession(input){try{const identity=memberIdentity_(input,true),book=SpreadsheetApp.openById(LMS_BOOK),user=lmsUser_(book,identity.email);if(user.row[0]!==identity.enrollmentId)throw new TrainingError('The account and enrollment do not match. Contact the President.',403);if(!identity.account.firstLoginAt){identity.account.firstLoginAt=new Date().toISOString();memberConfig_().p.setProperty('LMS_MEMBER_'+identity.uid,JSON.stringify(identity.account));}if(typeof memberSaveAccount_==='function')memberSaveAccount_(identity.account,user.row[2]);return {email:identity.email,name:user.row[2],requiresPasswordChange:Boolean(identity.account.mustChangePassword)};}catch(error){return memberError_(error)}}
function memberLmsRequest(input){try{const identity=memberIdentity_(input,false);return lmsHandle_(input,identity);}catch(error){return memberError_(error)}}
function memberChangePassword(input){let lock;try{const identity=memberIdentity_(input,true),password=input.newPassword;if(typeof password!=='string'||password.length<12||password.length>128)throw new TrainingError('Choose a password from 12 to 128 characters.');const account=identity.account;if(account.initialDigest&&memberDigest_(account.salt+password)===account.initialDigest)throw new TrainingError('Choose a password different from your temporary password.');lock=LockService.getScriptLock();if(!lock.tryLock(15000))throw new TrainingError('Your account is busy. Please try again.',503);const response=memberFetch_('accounts:update',{idToken:input.idToken,password,returnSecureToken:true},false);account.mustChangePassword=false;account.passwordChangedAt=new Date().toISOString();delete account.initialDigest;delete account.salt;delete account.initialPasswordUpdatedAt;memberConfig_().p.setProperty('LMS_MEMBER_'+identity.uid,JSON.stringify(account));if(typeof memberSaveAccount_==='function')memberSaveAccount_(account,account.name);return {email:identity.email,idToken:response.idToken,refreshToken:response.refreshToken,expiresIn:response.expiresIn};}catch(error){return memberError_(error)}finally{if(lock)lock.releaseLock()}}
// Owner-only provisioner; callers cannot bind themselves to another enrollment.
function memberProvision_(enrollmentId){if(lmsIdentity_()!==LMS_OWNER)throw new TrainingError('Only the BSSC account owner can provision training accounts.',403);const c=memberConfig_(),book=SpreadsheetApp.openById(LMS_BOOK),table=lmsTable_(book,'LMS Enrollments'),matches=table.rows.slice(1).filter(r=>r[0]===enrollmentId);if(matches.length!==1||matches[0][17]===true)throw new TrainingError('Select one active enrollment.');const row=matches[0],email=String(row[3]||'').trim().toLowerCase();if(!/^\S+@\S+\.\S+$/.test(email))throw new TrainingError('The enrollment needs a deliverable email.');const emailKey='LMS_MEMBER_EMAIL_'+memberDigest_(email),existing=c.p.getProperty(emailKey);if(existing)throw new TrainingError('This email already has a managed account. Review it instead of creating another.');const password=Utilities.getUuid().replace(/-/g,'')+Utilities.getUuid().slice(0,8)+'!aB7',created=memberFetch_('accounts',{email,password,displayName:String(row[2])},true);if(!created.localId)throw new TrainingError('The account was not created.',503);const now=Date.now(),salt=Utilities.getUuid(),account={email,name:String(row[2]),enrollmentId,uid:created.localId,mustChangePassword:true,createdAt:new Date(now).toISOString(),temporaryExpiresAt:new Date(now+7*86400000).toISOString(),initialPasswordUpdatedAt:Number(created.passwordUpdatedAt||now),salt,initialDigest:memberDigest_(salt+password)};c.p.setProperty('LMS_MEMBER_'+created.localId,JSON.stringify(account));c.p.setProperty(emailKey,created.localId);return {account,temporaryPassword:password,name:row[2]};}
function configureManagedAccounts(){if(lmsIdentity_()!==LMS_OWNER)throw Error('Only the BSSC service owner can configure managed accounts.');const p=PropertiesService.getScriptProperties();p.setProperties({LMS_FIREBASE_PROJECT:'bssc-foundations-training',LMS_FIREBASE_API_KEY:'AIzaSyB4KpAvJFa8SIXg08ecRPMP0JF-DEIZX8g',LMS_MEMBER_AUTH_ENABLED:'true'});try{memberFetch_('accounts:lookup',{localId:['__BSSC_AUTH_PROBE__']},true);const quota=MailApp.getRemainingDailyQuota();if(typeof memberTable_==='function'){memberTable_('LMS Accounts',MEMBER_ACCOUNT_HEADERS,true);memberTable_('LMS Outbox',MEMBER_OUTBOX_HEADERS,true);}console.log('Managed account access authorized. Mail capacity: '+quota+'. No learner accounts or emails were created. Roster automation remains paused.');}catch(error){p.setProperty('LMS_MEMBER_AUTH_ENABLED','false');console.log('Account configuration detail: '+String(error.message).slice(0,400));console.log('Account authorization status: '+(error.providerStatus||error.status||'unavailable')+' '+(error.providerCode||'')+' '+(error.providerConsumer||''));throw Error('Managed account authorization could not be verified. No learner accounts or messages were created.');}}
function sendOwnerManagedLoginTest(){if(lmsIdentity_()!==LMS_OWNER)throw Error('Only the BSSC service owner may send this test.');const p=PropertiesService.getScriptProperties();if(p.getProperty('LMS_OWNER_LOGIN_TEST'))throw Error('The owner welcome test was already reserved or sent. Review its delivery before retrying.');p.setProperty('LMS_OWNER_LOGIN_TEST','Reserved');try{const provisioned=memberProvision_('LMS-PRACTICE-TODD-20261120'),email=trainingEmail({kind:'invitation',name:provisioned.name,email:LMS_OWNER,dueDay:dueDay(Date.now()),temporaryPassword:provisioned.temporaryPassword}),banner='<p style="padding:14px;background:#fff0cd;font:14px Arial">BSSC LMS PRACTICE TEST — This invitation is for Todd’s existing Practice record. It is not an official membership deadline.</p>';MailApp.sendEmail({to:LMS_OWNER,subject:'[BSSC LMS TEST] '+email.subject,body:'PRACTICE TEST — no official membership deadline.\n\n'+email.text,htmlBody:email.html.replace('<body ', '<body ').replace('<div style="display:none;',banner+'<div style="display:none;'),name:'BoneShakers Social Club',replyTo:'president@boneshakerssocialclub.com'});p.setProperty('LMS_OWNER_LOGIN_TEST','Sent '+new Date().toISOString());console.log('One Practice welcome test sent to the BSSC service owner. No other invitations or reminders were sent.');}catch(error){p.setProperty('LMS_OWNER_LOGIN_TEST','Needs review');throw Error('The welcome test needs delivery review before another attempt. No passwords have been logged.');}}

// Pure enrollment/reminder rules. No scheduler, mail transport, or account provisioning is enabled here.
const MILESTONES=Object.freeze([45,30,15,10,5,3,2,1]);
const TIME_ZONE='America/New_York';
const COURSE_VERSION='bssc-foundations-2026-11-v1';
const DAY=86400000;
function localDay(value){const date=new Date(value);if(!Number.isFinite(date.getTime()))throw Error('A valid date is required.');return new Intl.DateTimeFormat('en-CA',{timeZone:TIME_ZONE,year:'numeric',month:'2-digit',day:'2-digit'}).format(date);}
function dayNumber(value){if(!/^\d{4}-\d{2}-\d{2}$/.test(value))throw Error('Expected an ISO calendar date.');const n=Date.parse(value+'T00:00:00Z');if(!Number.isFinite(n)||new Date(n).toISOString().slice(0,10)!==value)throw Error('Invalid calendar date.');return n/DAY;}
function dueDay(invitedAt){return new Date((dayNumber(localDay(invitedAt))+60)*DAY).toISOString().slice(0,10);}
function daysRemaining(enrollment,now){return dayNumber(enrollment.dueDay)-dayNumber(localDay(now));}
function verifiedComplete(enrollment){return enrollment.recordType==='Official'&&enrollment.courseVersion===COURSE_VERSION&&enrollment.sections?.length===7&&enrollment.sections.every((s,i)=>s.section===i+1&&s.passed===true&&Number(s.bestScore)>=4&&Number(s.bestScore)<=5)&&enrollment.completion?.verified===true&&enrollment.completion.courseVersion===COURSE_VERSION&&enrollment.completion.enrollmentId===enrollment.id;}
function patchDecision(enrollment){return verifiedComplete(enrollment)?{eligible:true,reason:'Foundations completed and attested.'}:{eligible:false,reason:'Complete all seven Foundations sections at 80% or higher and submit the final attestation before patch-in.'};}
function nextReminder(enrollment,now,ledger=[]){
 if(enrollment.recordType!=='Official'||enrollment.archived||['inactive','withdrawn','removed','deceased','non-renewal'].includes(String(enrollment.rosterStatus||'').toLowerCase())||enrollment.deliveryStatus!=='Sent'||!enrollment.invitedAt||verifiedComplete(enrollment))return null;
 const remaining=daysRemaining(enrollment,now);if(remaining<1||remaining>45)return null;
 // One current countdown, even after a missed job. Never dump old reminders into an inbox.
 const threshold=[...MILESTONES].reverse().find(n=>remaining<=n);if(!threshold)return null;
 const key=`${enrollment.id}:${enrollment.courseVersion}:${enrollment.dueDay}:remaining-${threshold}`;
 if(ledger.some(x=>x.key===key&&['Queued','Sending','Sent','Unknown'].includes(x.status)))return null;
 return {key,enrollmentId:enrollment.id,to:enrollment.email,kind:'reminder',milestone:threshold,daysRemaining:remaining,dueDay:enrollment.dueDay};
}
function rosterCandidates(members,baselineKeys,enrollments){
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
function countdownState(enrollment,now){const passed=enrollment.sections?.filter(s=>s.passed).length||0;return {daysRemaining:daysRemaining(enrollment,now),passed,percent:Math.round(passed/7*100),remainingWork:passed===7?'Submit your final completion attestation.':`Complete ${7-passed} remaining section${passed===6?'':'s'} and the final attestation.`};}

const LOGO='https://bsscvb-maker.github.io/bsscportal/bssc-favicon.png';
const HOME='https://bsscvb-maker.github.io/bsscportal/training/';
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function formatDue(day){return new Intl.DateTimeFormat('en-US',{timeZone:'UTC',month:'long',day:'numeric',year:'numeric'}).format(new Date(day+'T12:00:00Z'));}
function trainingEmail({kind='reminder',name,email,dueDay,daysRemaining=45,passed=0,temporaryPassword,loginUrl=HOME}){
 if(!/^https:\/\/(bsscvb-maker\.github\.io|[a-z0-9-]+\.web\.app|[a-z0-9-]+\.firebaseapp\.com)\//.test(loginUrl))throw Error('Use the approved BSSC training login address.');
 if(!Number.isInteger(passed)||passed<0||passed>7)throw Error('Invalid section progress.');
 if(kind==='invitation'&&!temporaryPassword)throw Error('A managed account must provide a temporary password for the invitation.');
 if(kind!=='invitation'&&(!Number.isInteger(daysRemaining)||daysRemaining<1||daysRemaining>45))throw Error('Invalid countdown.');
 const welcome=kind==='invitation',days=welcome?60:daysRemaining,date=formatDue(dueDay),percent=Math.round(passed/7*100),urgent=days<=5;
 const subject=welcome?'Welcome to BSSC Foundations — your 60-day training starts now':`BSSC Foundations: ${days} day${days===1?'':'s'} remaining`;
 const heading=welcome?'Your foundation starts here.':days===1?'One day left. Finish strong.':urgent?'You’re close to the deadline.':'Keep your Foundations moving.';
 const account=welcome?`<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5f7;border:1px solid #dfe2e8;border-radius:10px;margin:22px 0"><tr><td style="padding:20px"><p style="margin:0 0 6px;font-size:12px;font-weight:bold;letter-spacing:1px;color:#656c77">YOUR TRAINING LOGIN</p><p style="margin:8px 0;font-size:14px">Username<br><strong>${esc(email)}</strong></p><p style="margin:14px 0 8px;font-size:14px">Temporary password<br><strong style="font-family:monospace;font-size:18px;letter-spacing:1px">${esc(temporaryPassword)}</strong></p><p style="margin:12px 0 0;font-size:13px;color:#626a75;line-height:1.6">You must choose a new password at your first login. This password is for BSSC training only. Please don’t share it.</p></td></tr></table>`:`<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0"><tr><td style="font-size:14px;font-weight:bold;color:#343b45">${passed} of 7 sections passed</td><td align="right" style="font-size:14px;color:#6b727e">${percent}% complete</td></tr><tr><td colspan="2" style="padding-top:10px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#e7e9ee;border-radius:5px"><tr><td width="${Math.max(1,percent)}%" height="8" style="background:#b52c3c;border-radius:5px"></td><td></td></tr></table></td></tr></table><p style="font-size:14px;color:#626a75;line-height:1.7">${passed===7?'Your section quizzes are passed. Submit the final attestation to complete your training.':'Pick up where you left off—your progress is saved.'}</p>`;
 const body=welcome?'Your BSSC Foundations training account is ready. You have 60 days to complete all seven sections, pass each five-question quiz with at least 80%, and submit the final attestation.':`You have <strong>${days} day${days===1?'':'s'} remaining</strong> to complete BSSC Foundations. Your deadline is <strong>${esc(date)}</strong>.`;
 const html=`<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><meta charset="utf-8"><title>${esc(subject)}</title></head><body style="margin:0;background:#edf0f4;font-family:Arial,Helvetica,sans-serif;color:#252a33"><div style="display:none;max-height:0;overflow:hidden">${esc(welcome?'Your account, deadline, and next step.':`${days} day${days===1?'':'s'} remaining. Complete Foundations before patch-in.`)}</div><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:26px 12px"><table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:white;border-radius:14px;overflow:hidden"><tr><td style="background:#17191d;padding:27px 28px;border-bottom:4px solid #b72c3d"><img src="${LOGO}" alt="BoneShakers Social Club" width="68" height="68" style="display:block;margin:0 0 14px"><p style="margin:0;color:white;font-size:20px;font-weight:bold">BoneShakers Social Club</p><p style="margin:5px 0 0;color:#c3c8d1;font-size:13px">We ride together. We serve together. We stand together.</p></td></tr><tr><td style="padding:30px 28px 28px"><p style="color:#a72c3a;font-size:11px;letter-spacing:2px;font-weight:bold;margin:0 0 14px">BSSC FOUNDATIONS TRAINING</p><table role="presentation" cellpadding="0" cellspacing="0" style="background:${urgent?'#a92738':'#f6f1e5'};border-radius:10px;margin:0 0 24px"><tr><td style="padding:15px 23px;color:${urgent?'#ffffff':'#68532a'}"><strong style="font-size:38px;line-height:1">${days}</strong><span style="font-size:12px;font-weight:bold;letter-spacing:1px"> ${days===1?'DAY':'DAYS'} REMAINING</span></td></tr></table><h1 style="font-size:27px;line-height:1.2;letter-spacing:-.5px;margin:0 0 20px">${esc(heading)}</h1><p style="font-size:16px;line-height:1.7;margin:0 0 14px">Hi ${esc(name)},</p><p style="font-size:15px;line-height:1.75;margin:0 0 18px">${body}</p>${account}<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="background:#ad2838;border-radius:9px"><a href="${esc(loginUrl)}" style="display:block;padding:17px 14px;color:white;text-decoration:none;font-size:15px;font-weight:bold">${welcome?'Sign in & start Foundations':'Continue my training'}</a></td></tr></table><p style="font-size:13px;color:#626a75;line-height:1.7;margin:18px 0 0"><strong>Complete by ${esc(date)} at 11:59 p.m. Eastern.</strong><br>Training includes about 57 minutes of video, plus quizzes. You can complete it over several visits.</p><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e3e5eb;margin-top:24px"><tr><td style="padding-top:20px"><p style="margin:0;font-size:14px;line-height:1.7"><strong>Foundations must be completed before you can be fully patched in.</strong></p><p style="margin:12px 0 0;font-size:13px;line-height:1.7;color:#626a75">Questions or trouble signing in? Contact <a href="mailto:president@boneshakerssocialclub.com" style="color:#9b2938">the President</a> so we can help you keep moving.</p></td></tr></table></td></tr><tr><td style="padding:21px 28px;background:#17191d;color:#c1c6d0;font-size:11px;line-height:1.8"><strong style="color:white;letter-spacing:1px">STRONGER TOGETHER</strong><br>BoneShakers Social Club · Foundations Training<br>${welcome?'Your countdown begins with this invitation.':'Reminders stop when your verified training completion is recorded.'}</td></tr></table></td></tr></table></body></html>`;
 const text=`${subject}\n\nHi ${name},\n\n${welcome?'Your BSSC Foundations account is ready. You have 60 days to complete the course.':`You have ${days} day${days===1?'':'s'} remaining. ${passed} of 7 sections passed.`}\nComplete by ${date} at 11:59 p.m. Eastern.\n${welcome?`\nUsername: ${email}\nTemporary password: ${temporaryPassword}\nYou must change your password at first login.\n`:''}\nTraining: ${loginUrl}\n\nComplete all seven lessons, pass each quiz with at least 80%, and submit the final attestation. Foundations must be completed before full patch-in.\n\nQuestions: president@boneshakerssocialclub.com\nBoneShakers Social Club — Stronger Together`;
 return {subject,html,text};
}

/* Native roster workflow; activation captures existing members and never backfills them. */
const MEMBER_OUTBOX_HEADERS=['Event Key','Enrollment ID','Member Key','Full Name','Email','Kind','Milestone','Days Remaining','Due At','Status','Reserved At','Sent At','Message ID','Error Code'];
const MEMBER_ACCOUNT_HEADERS=['Account UID','Enrollment ID','Email','Full Name','Created At','First Login At','Password Changed At','Temporary Expires At','Status'];
function memberTable_(name,headers,create){const book=SpreadsheetApp.openById(LMS_BOOK);let sheet=book.getSheetByName(name);if(!sheet&&create)sheet=book.insertSheet(name);if(sheet&&create&&sheet.getLastRow()===0){sheet.getRange(1,1,1,headers.length).setValues([headers]);sheet.setFrozenRows(1);sheet.getRange(1,1,1,headers.length).setFontWeight('bold').setBackground('#202329').setFontColor('#ffffff');sheet.setColumnWidths(1,headers.length,170);SpreadsheetApp.flush();}if(!sheet)return null;const rows=sheet.getRange(1,1,Math.max(1,sheet.getLastRow()),headers.length).getValues();if(headers.some((h,i)=>rows[0][i]!==h))throw Error(name+' headings need review.');return {sheet,rows};}
function memberSaveAccount_(account,name){const table=memberTable_('LMS Accounts',MEMBER_ACCOUNT_HEADERS,false);if(!table)return;const row=table.rows.findIndex((r,i)=>i>0&&r[0]===account.uid),values=[account.uid,account.enrollmentId,account.email,name||account.name||'',account.createdAt||'',account.firstLoginAt||'',account.passwordChangedAt||'',account.temporaryExpiresAt||'',account.archived?'Archived':account.mustChangePassword?'Password change required':'Active'];if(row>0)table.sheet.getRange(row+1,1,1,values.length).setValues([values]);else table.sheet.appendRow(values);}
function memberRoster_(){const book=SpreadsheetApp.openById(LMS_BOOK),year=Number(Utilities.formatDate(new Date(),TIME_ZONE,'yyyy')),members=[];for(const title of [String(year),String(year+1)]){const sheet=book.getSheetByName(title);if(!sheet)continue;const values=sheet.getDataRange().getValues(),heads=values[0],index=label=>heads.indexOf(label);for(const field of ['Status','Last Name','First Name','Email','Start Date'])if(index(field)<0)throw Error('Roster '+title+' needs '+field+'.');for(const row of values.slice(1)){const first=String(row[index('First Name')]||'').trim(),last=String(row[index('Last Name')]||'').trim();if(!first&&!last)continue;const name=(first+' '+last).trim(),email=String(row[index('Email')]||'').trim().toLowerCase(),status=String(row[index('Status')]||'').trim();const nameKey=memberDigest_(name.toLowerCase().replace(/\s+/g,' ')),emailKey=memberDigest_(email);members.push({name,email,status,startDate:row[index('Start Date')],nameKey,emailKey,sourceYear:title});}}
 const unique=new Map();for(const member of members){const old=unique.get(member.nameKey);if(old&&old.email!==member.email){old.conflict=true;continue}if(!old||member.sourceYear===String(year))unique.set(member.nameKey,member);}return [...unique.values()];}
function memberDueTimestamp_(day){const offset=Utilities.formatDate(new Date(day+'T23:59:59Z'),TIME_ZONE,'Z');return new Date(day+'T23:59:59'+offset.slice(0,3)+':'+offset.slice(3)).toISOString();}
function memberOutbox_(event){const table=memberTable_('LMS Outbox',MEMBER_OUTBOX_HEADERS,true),row=table.rows.findIndex((r,i)=>i>0&&r[0]===event.key);if(row>0)return null;const values=[event.key,event.enrollmentId||'',event.memberKey||'',event.name||'',event.email||'',event.kind||'',event.milestone||'',event.daysRemaining||'',event.dueAt||'','Reserved',new Date().toISOString(),'','',''];table.sheet.appendRow(values);return {sheet:table.sheet,row:table.sheet.getLastRow(),values};}
function memberOutboxFinish_(entry,status,errorCode){if(!entry)return;entry.values[9]=status;if(status==='Sent')entry.values[11]=new Date().toISOString();entry.values[13]=errorCode||'';entry.sheet.getRange(entry.row,1,1,entry.values.length).setValues([entry.values]);}
function activateRosterTraining(){if(lmsIdentity_()!==LMS_OWNER)throw Error('Only the BSSC service owner can activate roster enrollment.');memberConfig_();const p=PropertiesService.getScriptProperties();if(p.getProperty('LMS_ROSTER_ACTIVATED_AT'))throw Error('Roster activation already has a baseline. Do not reset existing due dates.');const members=memberRoster_(),now=new Date().toISOString();memberTable_('LMS Outbox',MEMBER_OUTBOX_HEADERS,true);memberTable_('LMS Accounts',MEMBER_ACCOUNT_HEADERS,true);p.setProperties({LMS_ROSTER_BASELINE:JSON.stringify({names:members.map(m=>m.nameKey),emails:members.map(m=>m.emailKey)}),LMS_ROSTER_ACTIVATED_AT:now,LMS_ROSTER_AUTOMATIONS_ENABLED:'true'});console.log('Roster automation baseline captured for '+members.length+' existing people. No historical invitations or reminders sent. Install the hourly lmsRosterClock trigger to start monitoring.');}
function pauseRosterTraining(){if(lmsIdentity_()!==LMS_OWNER)throw Error('Only the BSSC service owner can pause this workflow.');PropertiesService.getScriptProperties().setProperty('LMS_ROSTER_AUTOMATIONS_ENABLED','false');console.log('New invitations and countdown messages are paused.');}
function lmsRosterClock(){if(lmsIdentity_()!==LMS_OWNER)throw Error('The roster clock requires the authorized club administrator.');return lmsRosterClock_();}
function lmsRosterClock_(){const p=PropertiesService.getScriptProperties();if(p.getProperty('LMS_ROSTER_AUTOMATIONS_ENABLED')!=='true')return;memberConfig_();let lock=LockService.getScriptLock();if(!lock.tryLock(20000))return;let sent=0,reviewed=0;try{const activated=p.getProperty('LMS_ROSTER_ACTIVATED_AT'),baseline=JSON.parse(p.getProperty('LMS_ROSTER_BASELINE')||'null');if(!activated||!baseline)throw Error('A verified roster baseline is required.');const members=memberRoster_(),book=SpreadsheetApp.openById(LMS_BOOK),table=lmsTable_(book,'LMS Enrollments'),emails=new Map();for(const m of members)emails.set(m.email,(emails.get(m.email)||0)+1);
 for(const m of members){if(baseline.names.includes(m.nameKey)||baseline.emails.includes(m.emailKey))continue;if(!['active','prospect','pending'].includes(m.status.toLowerCase()))continue;const key='roster:'+m.nameKey;if(table.rows.slice(1).some(r=>String(r[3]).toLowerCase()===m.email))continue;const started=m.startDate instanceof Date?localDay(m.startDate):'';const invalid=m.conflict||!m.name||!/^\S+@\S+\.\S+$/.test(m.email)||emails.get(m.email)!==1||!started||started<localDay(activated);if(invalid){const entry=memberOutbox_({key,name:m.name,email:m.email,kind:'Roster review'});memberOutboxFinish_(entry,'Needs review','IDENTITY_OR_START_DATE');if(entry)reviewed++;continue;}if(MailApp.getRemainingDailyQuota()<1)break;const enrollmentId='LMS-'+Utilities.getUuid(),memberKey='MEMBER-'+Utilities.getUuid(),due=dueDay(Date.now()),dueAt=memberDueTimestamp_(due),entry=memberOutbox_({key,enrollmentId,memberKey,name:m.name,email:m.email,kind:'Invitation',daysRemaining:60,dueAt});if(!entry)continue;
  const row=[enrollmentId,memberKey,m.name,m.email,m.status,LMS_VERSION,'Official','','',LMS_OWNER,'','','','','','',`Automatic roster enrollment (${m.sourceYear})`,false,0];table.sheet.appendRow(row);
  try{const provisioned=memberProvision_(enrollmentId),mail=trainingEmail({kind:'invitation',name:m.name,email:m.email,dueDay:due,temporaryPassword:provisioned.temporaryPassword});MailApp.sendEmail({to:m.email,subject:mail.subject,body:mail.text,htmlBody:mail.html,name:'BoneShakers Social Club',replyTo:'president@boneshakerssocialclub.com'});const at=new Date().toISOString(),enrollmentRow=table.sheet.getLastRow();table.sheet.getRange(enrollmentRow,8,1,2).setValues([[at,dueAt]]);memberSaveAccount_({...provisioned.account,name:m.name},m.name);memberOutboxFinish_(entry,'Sent');sent++;baseline.names.push(m.nameKey);baseline.emails.push(m.emailKey);p.setProperty('LMS_ROSTER_BASELINE',JSON.stringify(baseline));}catch(error){memberOutboxFinish_(entry,'Needs review','INVITATION_OUTCOME_REQUIRES_REVIEW');}
 }
 if(Number(Utilities.formatDate(new Date(),TIME_ZONE,'H'))>=9){const enrollments=lmsTable_(book,'LMS Enrollments'),outbox=memberTable_('LMS Outbox',MEMBER_OUTBOX_HEADERS,true),ledger=outbox.rows.slice(1).map(r=>({key:r[0],status:r[9]==='Reserved'?'Sending':r[9]==='Needs review'?'Unknown':r[9]}));for(const row of enrollments.rows.slice(1)){if(!outbox.rows.some(r=>r[1]===row[0]&&r[5]==='Invitation'&&r[9]==='Sent'))continue;if(row[6]!=='Official'||row[17]===true||!row[7]||!row[8])continue;const roster=members.find(m=>m.email===String(row[3]).toLowerCase());if(!roster||!['active','prospect','pending'].includes(roster.status.toLowerCase()))continue;const state=row[14]?JSON.parse(row[14]):initialState(),sections=state.sections.map((s,i)=>({section:i+1,passed:s.passed,bestScore:s.bestScore})),completion=state.completion?{...state.completion,enrollmentId:row[0],courseVersion:state.completion.courseVersion}:null,e={id:row[0],email:row[3],name:row[2],recordType:row[6],courseVersion:row[5],archived:row[17],deliveryStatus:'Sent',invitedAt:row[7],dueDay:localDay(row[8]),sections,completion};const event=nextReminder(e,Date.now(),ledger);if(!event||MailApp.getRemainingDailyQuota()<1)continue;const entry=memberOutbox_({...event,email:e.email,name:e.name,memberKey:row[1],dueAt:row[8]});if(!entry)continue;try{const mail=trainingEmail({kind:'reminder',name:e.name,email:e.email,dueDay:e.dueDay,daysRemaining:event.daysRemaining,passed:sections.filter(s=>s.passed).length});MailApp.sendEmail({to:e.email,subject:mail.subject,body:mail.text,htmlBody:mail.html,name:'BoneShakers Social Club',replyTo:'president@boneshakerssocialclub.com'});memberOutboxFinish_(entry,'Sent');sent++;}catch(error){memberOutboxFinish_(entry,'Needs review','SEND_OUTCOME_REQUIRES_REVIEW');}}}
 p.setProperty('LMS_ROSTER_LAST_CHECK',new Date().toISOString());console.log('Roster check completed. Messages sent: '+sent+'. Identities needing review: '+reviewed+'.');
 }finally{lock.releaseLock();}}
