const ROSTER_BOOK = '1G1GhywDG-FYEo00fY_FeWheScve333LIdBqZpqLbZZM';
const TZ = 'America/New_York';

function doPost(e) {
  try {
    const input = JSON.parse(e.postData.contents);
    if (input.action === 'details') return output(memberDetails(input));
    if (input.action === 'verify') return output(verify(input.birthday));
    if (input.action === 'castVote') return output(castSisterVote(input));
    if (input.action === 'voteStatus') return output(sisterVoteStatus(input));
    if (input.action === 'eligible') {
      if (!/^[0-9a-f-]{72}$/.test(String(input.token))) return output({ error: 'Verify your membership first.' });
      const cache = CacheService.getScriptCache();
      if (!cache.get('member:' + input.token)) return output({ error: 'Verification expired. Please start over.' });
      const identity = sisterIdentity(input.token);
      const result = comparisonData();
      result.ballot = findSisterVote(result.profiles[0]?.year || readRosters().year, identity.key);
      return output(result);
    }
    return output({error: 'Unknown request.'});
  } catch (error) {
    console.error(error.message);
    const message=String(error.message||'');
    const safe=/^(Verify |Verification expired|Your current membership|This sister|Another vote|More than one vote|The Sister Patch vote log|We could not confirm)/.test(message);
    return output({error:safe?message:inputActionError(e)});
  }
}

function verify(birthday) {
  const failure = {error: 'We could not verify that date of birth. Contact the club if you need help.'};
  if (typeof birthday !== 'string' || birthday === '2005-01-01' || !/^\d{4}-\d{2}-\d{2}$/.test(birthday)) return failure;
  const cache = CacheService.getScriptCache(), lock = LockService.getScriptLock();
  lock.waitLock(3000);
  try {
    const key = 'attempts:' + Math.floor(Date.now()/300000);
    const count = Number(cache.get(key) || 0);
    if (count >= 30) return {error:'Please wait a few minutes and try again.'};
    cache.put(key,String(count+1),320);
  } finally { lock.releaseLock(); }
  const matches = currentRosterOnly().filter(row => norm(row.status) === 'active' && fullName(row) && dateKey(row['date of birth']) === birthday);
  if (matches.length !== 1) return failure;
  const token = Utilities.getUuid() + Utilities.getUuid();
  cache.put('member:'+token,JSON.stringify({key:sisterVoterKey(fullName(matches[0]),birthday),name:fullName(matches[0])}),1800);
  return {name:fullName(matches[0]),token};
}

function readRosters() {
  const book = SpreadsheetApp.openById(ROSTER_BOOK);
  const years = book.getSheets().map(s=>s.getName()).filter(s=>/^20\d{2}$/.test(s)).map(Number).sort((a,b)=>b-a);
  const newest = years[0], year = newest-1;
  if (!newest) throw Error('No roster year available');
  const tabs = years.map(y=>({year:y, rows: table(book.getSheetByName(String(y)))}));
  const attendanceTab = book.getSheetByName(year+'-Attendance');
  if (!attendanceTab) throw Error('Attendance tab missing');
  return {year,current:tabs[0].rows,tabs,attendance:table(attendanceTab)};
}

function lists({year,current,tabs,attendance}) {
 const past=new Map();
 for(const tab of tabs) for(const row of tab.rows){const id=norm(fullName(row));if(id&&norm(row['sister patch'])==='yes'&&!past.has(id))past.set(id,{name:display(row)});}
 const members=[],ineligible=[],seen=new Set();
 for(const row of current){
  const id=norm(fullName(row));if(!id||!['f','female','woman'].includes(norm(row.sex))||past.has(id)||seen.has(id))continue;
  seen.add(id);const reasons=[],start=dateKey(row['start date']);
  if(norm(row.status)!=='active')reasons.push('Inactive');
  if(!['yes','paid','exempt'].includes(norm(row['dues paid'])))reasons.push('Dues');
  if(norm(row['sister patch'])!=='no')reasons.push('Award status unconfirmed');
  if(!start)reasons.push('Start date unconfirmed');
  else if(start>(year-1)+'-12-31')reasons.push('Under 12 months');
  const match=attendance.filter(entry=>norm(fullName(entry))===id);
  if(match.length!==1)reasons.push('Attendance unconfirmed');
  else {
   let meetings=0,events=0;
   for(const [heading,value] of Object.entries(match[0])){
    if(norm(value)!=='yes'||!/\d{1,2}[-/]\d{1,2}[-/]\d{2,4}\s*$/.test(heading))continue;
    if(heading.startsWith('general meeting'))meetings++;else events++;
   }
   if(meetings<3)reasons.push('Attendance');
   if(events<2)reasons.push('Attendance');
  }
  const summary=norm(row.status)==='prospect'?['Prospect']:[...new Set(reasons)];
  (summary.length?ineligible:members).push(summary.length?{name:display(row),reasons:summary}:{id,name:display(row)});
 }
 const byName=(a,b)=>a.name.localeCompare(b.name);
 return {members:members.sort(byName),ineligible:ineligible.sort(byName),pastRecipients:[...past.values()].sort(byName)};
}

function table(sheet) {
  const [header,...rows]=sheet.getDataRange().getValues();
  return rows.map(row=>Object.fromEntries(header.map((key,i)=>[norm(key),row[i]])));
}
function norm(v){return String(v??'').trim().toLowerCase();}
function fullName(r){const a=String(r['first name']??'').trim(),b=String(r['last name']??'').trim();return a&&b?a+' '+b:'';}
function display(r){const road=String(r['road name']??'').trim();return fullName(r)+(road?' (“'+road+'”)':'');}
function dateKey(v){
  if(v instanceof Date && Number.isFinite(v.getTime()))return Utilities.formatDate(v,TZ,'yyyy-MM-dd');
  const s=String(v??'').trim(),m=/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(s);
  return m?[m[3],m[1].padStart(2,'0'),m[2].padStart(2,'0')].join('-'):/^\d{4}-\d{2}-\d{2}$/.test(s)?s:'';
}
function output(data){return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);}
function checkRosterConnection(){
  const result=lists(readRosters());
  Logger.log(JSON.stringify({eligible:result.members.length,pastRecipients:result.pastRecipients.length}));
}
function currentRosterOnly() {
 const cache=CacheService.getScriptCache(), saved=cache.get('sister:verify-roster:v1');if(saved)return JSON.parse(saved);
 const book=SpreadsheetApp.openById(ROSTER_BOOK);
 const names=book.getSheets().map(sheet=>sheet.getName()).filter(name=>/^20\d{2}$/.test(name)).sort().reverse();
 if(!names.length)throw Error('Membership roster unavailable');
 const rows=table(book.getSheetByName(names[0])).map(row=>({status:row.status,'first name':row['first name'],'last name':row['last name'],'date of birth':dateKey(row['date of birth'])}));
 const encoded=JSON.stringify(rows);if(encoded.length<90000)cache.put('sister:verify-roster:v1',encoded,60);return rows;
}

function memberDetails(input, context) {
 const cache=CacheService.getScriptCache();
 if(!context && (!/^[0-9a-f-]{72}$/.test(String(input.token))||!cache.get('member:'+input.token)))return {error:'Verification expired. Please start over.'};
 const data=context?context.data:readRosters(), eligible=context?context.eligible:lists(data).members;
 const person=eligible.find(p=>p.id===input.member);
 if(!person)return {error:'This member is no longer eligible. Refresh the list.'};
 const row=data.current.find(r=>norm(fullName(r))===input.member);
 const record=data.attendance.find(r=>norm(fullName(r))===input.member)||{};
 const attended=[];let meetings=0,events=0,rides=0,bikeNights=0,otherEvents=0,tracked=0,available=0,meetingTracked=0,rideTracked=0;
 const today=Utilities.formatDate(new Date(),TZ,'yyyy-MM-dd'), start=dateKey(row['start date']);
 for(const [heading,value] of Object.entries(record)){
  const match=heading.match(/(\d{1,2})[-/](\d{1,2})[-/](\d{2,4})\s*$/);
  if(!match)continue;
  const year=match[3].length===2?'20'+match[3]:match[3];
  const day=year+'-'+match[1].padStart(2,'0')+'-'+match[2].padStart(2,'0');
  if(Number(year)!==data.year||day>today||(start&&day<start))continue;
  available++;
  const status=norm(value), meeting=heading.startsWith('general meeting'), bikeNight=heading.includes('bike night'), ride=!meeting&&!bikeNight;
  if(!['yes','no'].includes(status))continue;
  tracked++;if(meeting)meetingTracked++;if(ride)rideTracked++;
  if(status!=='yes')continue;
  if(meeting)meetings++;else{events++;if(bikeNight)bikeNights++;else if(ride)rides++;else otherEvents++;}
  attended.push({name:heading.replace(/\s*\d{1,2}[-/]\d{1,2}[-/]\d{2,4}\s*$/,'').replace(/\s+/g,' ').trim(),date:day,type:meeting?'Meeting':bikeNight?'Bike night':ride?'Ride':'Other event'});
 }
 const book=SpreadsheetApp.openById(ROSTER_BOOK), completed=[],scheduled=[],seen=new Set();
 for(const tab of ['Volunteer Assignments','BFT '+data.year+' Volunteers']){
  const sheet=context?null:book.getSheetByName(tab);if(!context&&!sheet)continue;
  for(const assignment of context?context.volunteers[tab]:table(sheet)){
   if(norm(assignment.member||assignment.name)!==norm(fullName(row)))continue;
   const status=norm(assignment.status||assignment['check-in']);
   const event=String(assignment['event id']||'');
   if(!event.includes(String(data.year)))continue;
   const key=event+'|'+norm(assignment.role||'');
   if(seen.has(key))continue;seen.add(key);
   const item={event,role:String(assignment.role||'Volunteer'),status:String(assignment.status||assignment['check-in']||'Unconfirmed')};
   if(['completed','complete','checked in','checked-in','attended','yes'].includes(status))completed.push(item);
   else if(['expected','scheduled','assigned','confirmed'].includes(status))scheduled.push(item);
  }
 }
 return {id:person.id,name:person.name,year:data.year,startDate:dateKey(row['start date']),meetings,events,rides,bikeNights,otherEvents,tracked,available,meetingTracked,rideTracked,attendancePercent:tracked?Math.round((meetings+events)*100/tracked):null,total:meetings+events,attended:attended.sort((a,b)=>b.date.localeCompare(a.date)),volunteerCompleted:completed.length,volunteerScheduled:scheduled.length,completed,scheduled};
}

function comparisonData(){
 const cache=CacheService.getScriptCache(), key='sister:comparison:v14';
 const saved=cache.get(key);if(saved)return JSON.parse(saved);
 const data=readRosters(), result=lists(data), book=SpreadsheetApp.openById(ROSTER_BOOK), volunteers={};
 for(const tab of ['Volunteer Assignments','BFT '+data.year+' Volunteers']){const sheet=book.getSheetByName(tab);volunteers[tab]=sheet?table(sheet):[];}
 result.profiles=result.members.map(person=>memberDetails({member:person.id}, {data,eligible:result.members,volunteers}));
 const encoded=JSON.stringify(result);if(encoded.length<90000)cache.put(key,encoded,60);
 return result;
}

const SISTER_VOTE_SHEET = 'Sister Patch Votes';
const SISTER_VOTE_HEADERS = ['Review Year','Voter Key','Voter Name','Nominee Key','Nominee Name','Submitted At','Receipt'];

function sisterIdentity(token) {
  if (!/^[0-9a-f-]{72}$/.test(String(token))) throw Error('Verify your membership again before voting.');
  const raw=CacheService.getScriptCache().get('member:'+token);
  let identity;try{identity=JSON.parse(raw||'null');}catch(_){}
  if (!identity || !/^[0-9a-f]{64}$/.test(identity.key||'') || !identity.name) throw Error('Verification expired. Please verify your membership again.');
  return identity;
}
function sisterVoterKey(name,birthday) {
  const properties=PropertiesService.getScriptProperties();
  let secret=properties.getProperty('SISTER_VOTE_KEY_SECRET');
  if(!secret){
    const lock=LockService.getScriptLock();lock.waitLock(10000);
    try{secret=properties.getProperty('SISTER_VOTE_KEY_SECRET');if(!secret){secret=Utilities.getUuid()+Utilities.getUuid();properties.setProperty('SISTER_VOTE_KEY_SECRET',secret);}}
    finally{lock.releaseLock();}
  }
  return Utilities.computeHmacSha256Signature(norm(name)+'|'+birthday,secret).map(byte=>('0'+((byte+256)%256).toString(16)).slice(-2)).join('');
}
function sisterVoteRows() {
  const sheet=SpreadsheetApp.openById(ROSTER_BOOK).getSheetByName(SISTER_VOTE_SHEET);
  if(!sheet)throw Error('The Sister Patch vote log is unavailable. Your vote has not been saved.');
  const rows=sheet.getDataRange().getDisplayValues();
  if(SISTER_VOTE_HEADERS.some((h,i)=>rows[0]?.[i]!==h))throw Error('The Sister Patch vote log needs an administrator to review its headings.');
  return {sheet,rows};
}
function findSisterVote(year,key) {
  const {rows}=sisterVoteRows();
  const matches=rows.slice(1).filter(row=>String(row[0])===String(year)&&row[1]===key);
  if(matches.length>1)throw Error('More than one vote was found for this member. Contact the club to review it.');
  const row=matches[0];
  return row?{saved:true,year:Number(row[0]),nomineeName:row[4],receipt:row[6],submittedAt:row[5]}:{saved:false,year:Number(year)};
}
function sisterVoteStatus(input) {
  const identity=sisterIdentity(input.token);
  return findSisterVote(readRosters().year,identity.key);
}
function castSisterVote(input) {
  const identity=sisterIdentity(input.token);
  const lock=LockService.getScriptLock();
  if(!lock.tryLock(20000))throw Error('Another vote is being saved. Please try again; duplicate votes are prevented.');
  try{
    const data=readRosters();
    const voter=data.current.filter(row=>norm(row.status)==='active'&&norm(fullName(row))===norm(identity.name)&&sisterVoterKey(fullName(row),dateKey(row['date of birth']))===identity.key);
    if(voter.length!==1)throw Error('Your current membership could not be confirmed. Please contact the club.');
    const previous=findSisterVote(data.year,identity.key);
    if(previous.saved)return {...previous,alreadyVoted:true};
    const nominee=lists(data).members.find(person=>person.id===String(input.nominee||''));
    if(!nominee)throw Error('This sister is no longer eligible. Refresh the list before choosing again.');
    const {sheet}=sisterVoteRows();
    const receipt='BSSC-SP-'+data.year+'-'+Utilities.getUuid();
    const submittedAt=Utilities.formatDate(new Date(),TZ,"yyyy-MM-dd'T'HH:mm:ssXXX");
    sheet.appendRow([data.year,identity.key,identity.name,nominee.id,nominee.name,submittedAt,receipt]);
    SpreadsheetApp.flush();
    const saved=findSisterVote(data.year,identity.key);
    if(!saved.saved||saved.receipt!==receipt)throw Error('We could not confirm the save. Retry to check your existing vote before another can be recorded.');
    return saved;
  }finally{lock.releaseLock();}
}

function inputActionError(e){try{return JSON.parse(e.postData.contents).action==='castVote'?'We could not confirm your vote. Try again; an existing vote will not be duplicated.':'Membership verification is temporarily unavailable.';}catch(_){return 'Membership verification is temporarily unavailable.';}}

