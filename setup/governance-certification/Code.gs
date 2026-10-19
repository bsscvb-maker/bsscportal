/** BSSC certification service. Deploy as web app: execute as owner, access Anyone.
 * Every request independently validates the caller's Google OAuth token.
 */
const CLIENT_ID = '881518334290-kimg628u5oriddlrqoq6vb619m8gn13s.apps.googleusercontent.com';
const ROOT = 'https://bsscvb-maker.github.io/bsscportal/assets/governance/';
function setupGovernanceCertification() {
  const president = 'REPLACE_WITH_PRESIDENT_GOOGLE_EMAIL';
  const secretary = 'REPLACE_WITH_SECRETARY_GOOGLE_EMAIL';
  if ([president,secretary].some(x=>x.indexOf('@')<1)||president===secretary) throw Error('Enter two different officer Google email addresses first.');
  const p=PropertiesService.getScriptProperties();
  p.setProperties({PRESIDENT_EMAIL:president.trim().toLowerCase(),SECRETARY_EMAIL:secretary.trim().toLowerCase()});
  if(!p.getProperty('FOLDER_ID'))p.setProperty('FOLDER_ID',DriveApp.createFolder('BSSC Governance Certifications').getId());
  console.log('Setup complete. Keep the records folder private.');
}
function doPost(e){try{return output_(handle_(JSON.parse(e.postData.contents)));}catch(err){return output_({ok:false,error:String(err.message||err)});}}
function output_(v){return ContentService.createTextOutput(JSON.stringify(v)).setMimeType(ContentService.MimeType.JSON);}
function identity_(token){
 if(!token||token.length>4096)throw Error('Sign in to the management portal first.');
 const opts={headers:{Authorization:'Bearer '+token},muteHttpExceptions:true};
 const info=UrlFetchApp.fetch('https://www.googleapis.com/oauth2/v2/userinfo',opts);
 if(info.getResponseCode()!==200)throw Error('Google sign-in expired. Sign out and sign in again.');
 const user=JSON.parse(info.getContentText());
 const ti=UrlFetchApp.fetch('https://oauth2.googleapis.com/tokeninfo?access_token='+encodeURIComponent(token),{muteHttpExceptions:true});
 if(ti.getResponseCode()!==200)throw Error('Google could not verify your session.');
 const t=JSON.parse(ti.getContentText());
 if((t.aud||t.issued_to)!==CLIENT_ID)throw Error('Use the BSSC Management Portal sign-in.');
 if(!user.verified_email)throw Error('A verified Google email is required.');
 const email=String(user.email||'').toLowerCase(),p=PropertiesService.getScriptProperties();
 let role=email===p.getProperty('PRESIDENT_EMAIL')?'President':email===p.getProperty('SECRETARY_EMAIL')?'Secretary':'';
 if(!role)throw Error('Only the configured President and Secretary may access certification records.');
 return {email,role};
}
function folder_(){const id=PropertiesService.getScriptProperties().getProperty('FOLDER_ID');if(!id)throw Error('Run setupGovernanceCertification first.');return DriveApp.getFolderById(id);}
function hash_(bytes){return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,bytes).map(b=>('0'+((b+256)%256).toString(16)).slice(-2)).join('');}
function find_(id){if(!/^[a-f0-9-]{36}$/.test(id||''))throw Error('Invalid certificate ID.');const files=folder_().getFilesByName(id+'.json');if(!files.hasNext())throw Error('Certificate not found.');return files.next();}
function handle_(req){
 const user=identity_(req.token),lock=LockService.getScriptLock();lock.waitLock(30000);
 try{
  if(req.action==='list'){const out=[],it=folder_().getFiles();while(it.hasNext()){const f=it.next();if(/\.json$/.test(f.getName())){const r=JSON.parse(f.getBlob().getDataAsString());out.push(r);}}return {ok:true,user,records:out.sort((a,b)=>b.createdAt.localeCompare(a.createdAt))};}
  if(req.action==='create'){
   if(!['bylaws','operating-policies'].includes(req.document))throw Error('Choose a current governance document.');
   for(const k of ['adoptedBy','adoptionDate','effectiveDate','version','minutes'])if(typeof req[k]!=='string'||!req[k].trim()||req[k].length>1000)throw Error('Complete all adoption details.');
   if(!/^\d{4}-\d{2}-\d{2}$/.test(req.adoptionDate)||!/^\d{4}-\d{2}-\d{2}$/.test(req.effectiveDate))throw Error('Use valid adoption and effective dates.');
   if(new Date(req.adoptionDate+'T12:00:00Z')>new Date())throw Error('Certify only an adoption that has already occurred.');
   const id=Utilities.getUuid(),p=PropertiesService.getScriptProperties(),record={id,document:req.document,title:req.document==='bylaws'?'BSSC Bylaws':'BSSC Operating Policies',adoptedBy:req.adoptedBy.trim(),adoptionDate:req.adoptionDate,effectiveDate:req.effectiveDate,version:req.version.trim(),minutes:req.minutes.trim(),createdAt:new Date().toISOString(),createdBy:user.email,requiredSigners:{President:p.getProperty('PRESIDENT_EMAIL'),Secretary:p.getProperty('SECRETARY_EMAIL')},snapshots:[],signatures:[],status:'Awaiting signatures'};
   for(const ext of ['docx','pdf']){const response=UrlFetchApp.fetch(ROOT+req.document+'.'+ext+'?snapshot='+Date.now());const blob=response.getBlob();const bytes=blob.getBytes(),file=folder_().createFile(blob.setName(id+'-'+req.document+'.'+ext));record.snapshots.push({format:ext,sha256:hash_(bytes),fileId:file.getId(),source:ROOT+req.document+'.'+ext});}
   folder_().createFile(id+'.json',JSON.stringify(record),MimeType.PLAIN_TEXT);return {ok:true,user,record};
  }
  if(req.action==='snapshot'){
   const record=JSON.parse(find_(req.id).getBlob().getDataAsString()),snapshot=record.snapshots.find(s=>s.format===req.format);
   if(!snapshot)throw Error('Snapshot not found.');
   const blob=DriveApp.getFileById(snapshot.fileId).getBlob(),bytes=blob.getBytes();
   if(hash_(bytes)!==snapshot.sha256)throw Error('Snapshot fingerprint mismatch. Do not sign; ask the records owner to investigate.');
   return {ok:true,user,data:Utilities.base64Encode(bytes),format:snapshot.format,title:record.title,id:record.id};
  }
  if(req.action==='sign'){
   const file=find_(req.id),record=JSON.parse(file.getBlob().getDataAsString());
   if(req.confirm!==true||typeof req.name!=='string'||req.name.trim().length<2||req.name.length>120)throw Error('Enter your full name and confirm the certification.');
   if(record.requiredSigners[user.role]!==user.email)throw Error('You are not the assigned signer for this certificate.');
   if(record.signatures.some(s=>s.role===user.role))throw Error('This officer has already signed.');
   for(const snapshot of record.snapshots){if(hash_(DriveApp.getFileById(snapshot.fileId).getBlob().getBytes())!==snapshot.sha256)throw Error('Snapshot fingerprint mismatch. Do not sign; ask the records owner to investigate.');}
   record.signatures.push({role:user.role,email:user.email,name:req.name.trim(),signedAt:new Date().toISOString(),statement:'I certify that the identified document was duly adopted after required notice, with a quorum and the required approving vote. I intend my typed name to be my electronic signature.'});
   if(record.signatures.length===2){record.status='Certified';record.completedAt=new Date().toISOString();}
   file.setContent(JSON.stringify(record));return {ok:true,user,record};
  }
  throw Error('Unknown action.');
 }finally{lock.releaseLock();}
}
