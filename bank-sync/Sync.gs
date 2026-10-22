// Append to the private Apps Script setup code. No credentials belong in GitHub.
const BSSC_BOOK_ID = '1a6DfwnnNmy0ykQi7S8DKAt1RhauTh7ISwxSXm59b5NU';
const BSSC_PORTAL_CLIENT = '881518334290-kimg628u5oriddlrqoq6vb619m8gn13s.apps.googleusercontent.com';
const BSSC_BANK_HEADERS = ['Bank transaction ID','Account ending','Date','Description','Amount (inflow positive)','Bank status','Replaces pending ID','Merchant','Currency','Imported at','Removed at'];

function syncChaseNow() {
  const result = syncChase_('Apps Script administrator');
  console.log(JSON.stringify(result));
}

// A small minute timer starts the bank job at/after 03:30 Eastern once per day.
// Google time triggers can be delayed; the job retries during the 03:30–04:29 window.
function scheduledChaseSync() {
  const p=PropertiesService.getScriptProperties();
  const now=new Date();
  const day=Utilities.formatDate(now,'America/New_York','yyyy-MM-dd');
  const clock=Utilities.formatDate(now,'America/New_York','HHmm');
  if(clock<'0330' || clock>'0429' || p.getProperty('DAILY_SYNC_DATE')===day) return;
  if(Date.now()-Number(p.getProperty('DAILY_SYNC_ATTEMPT_MS')||0)<300000) return;
  p.setProperty('DAILY_SYNC_ATTEMPT_MS',String(Date.now()));
  const result=syncChase_('Daily 3:30 AM Eastern schedule');
  if(result.ok) p.setProperty('DAILY_SYNC_DATE',day);
}

function installDailySchedule() {
  const existing=ScriptApp.getProjectTriggers().filter(function(t){return t.getHandlerFunction()==='scheduledChaseSync';});
  if(!existing.length) ScriptApp.newTrigger('scheduledChaseSync').timeBased().everyMinutes(1).create();
  console.log('Daily 3:30 AM America/New_York schedule installed. Timer checks each minute.');
}

function syncChase_(actor) {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(1000)) throw new Error('A bank sync is already running. Try again shortly.');
  try {
    const p = PropertiesService.getScriptProperties();
    const last = Number(p.getProperty('LAST_SYNC_FINISHED_MS') || 0);
    if (Date.now() - last < 60000) return JSON.parse(p.getProperty('LAST_SYNC_RESULT') || '{}');
    const token = p.getProperty('PLAID_ACCESS_TOKEN');
    const map = JSON.parse(p.getProperty('PLAID_ACCOUNT_MAP') || '{}');
    if (!token || !map['7707'] || !map['8799']) throw new Error('Chase setup is incomplete.');
    const balances = plaidRequest_('/accounts/balance/get', {access_token: token, options: {account_ids: [map['7707'],map['8799']]}});
    const checked = {};
    ['7707','8799'].forEach(function(mask) {
      const a = balances.accounts.find(function(x) { return x.account_id === map[mask] && x.mask === mask; });
      if (!a || !a.balances || typeof a.balances.current !== 'number' || typeof a.balances.available !== 'number' || a.balances.iso_currency_code !== 'USD') throw new Error('Chase did not supply complete USD balances for ' + mask + '.');
      checked[mask] = a.balances;
    });
    const originalCursor = p.getProperty('PLAID_TRANSACTIONS_CURSOR') || '';
    let batch;
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        batch = {added: [], modified: [], removed: [], cursor: originalCursor};
        let more = true, pages = 0;
        while (more) {
          if (++pages > 40) throw new Error('Transaction import is too large for one run.');
          const request = {access_token: token, count: 500};
          if (batch.cursor) request.cursor = batch.cursor;
          const page = plaidRequest_('/transactions/sync', request);
          batch.added.push(...page.added); batch.modified.push(...page.modified); batch.removed.push(...page.removed);
          batch.cursor = page.next_cursor; more = page.has_more;
          batch.updateStatus = page.transactions_update_status || 'unknown';
        }
        break;
      } catch (error) {
        if (attempt === 0 && String(error.message).includes('TRANSACTIONS_SYNC_MUTATION_DURING_PAGINATION')) continue;
        throw error;
      }
    }
    const book = SpreadsheetApp.openById(BSSC_BOOK_ID);
    const bank = bankSheet_(book, 'Chase Bank Feed', BSSC_BANK_HEADERS);
    const status = bankSheet_(book, 'Bank Sync Status', ['Field','Value']);
    const control = book.getSheetByName('Control-2026');
    if (!control) throw new Error('Control-2026 was not found.');
    const now = new Date().toISOString();
    const existing = bank.getLastRow() > 1 ? bank.getRange(2,1,bank.getLastRow()-1,BSSC_BANK_HEADERS.length).getValues() : [];
    const rows = new Map(existing.map(function(row) { return [String(row[0]),row]; }));
    const accountMasks = {}; Object.keys(map).forEach(function(mask) { accountMasks[map[mask]] = mask; });
    batch.added.concat(batch.modified).forEach(function(t) {
      const mask = accountMasks[t.account_id]; if (!mask) return;
      if (!t.transaction_id || !Number.isFinite(t.amount)) throw new Error('Incomplete bank transaction.');
      rows.set(t.transaction_id, [t.transaction_id,mask,t.date,bankText_(t.name),-t.amount,t.pending?'Pending':'Posted',t.pending_transaction_id || '',bankText_(t.merchant_name || ''),t.iso_currency_code || '',now,'']);
    });
    batch.removed.forEach(function(t) { const row = rows.get(t.transaction_id); if (row) { row[5] = 'Removed'; row[10] = now; } });
    const allRows = [...rows.values()].sort(function(a,b) { return String(b[2]).localeCompare(String(a[2])) || String(a[0]).localeCompare(String(b[0])); });
    if (allRows.length) bank.getRange(2,1,allRows.length,BSSC_BANK_HEADERS.length).setValues(allRows);
    // Keep formulas and ledger classifications intact. Current balances are compared to cleared cash.
    control.getRange('E6:E8').setValues([[checked['7707'].available+checked['8799'].available],[checked['7707'].available],[checked['8799'].available]]);
    control.getRange('E34:E35').setValues([[checked['7707'].current],[checked['8799'].current]]);
    control.getRange('H34:H35').setValues([[0],[0]]);
    const result = {ok:true,lastSuccess:now,transactions:allRows.filter(function(row) {return row[5]!=='Removed';}).length,transactionUpdateStatus:batch.updateStatus};
    status.getRange(2,1,7,2).setValues([['Last successful sync',now],['Source','Chase via Plaid'],['Transactions',result.transactions],['Transaction update status',batch.updateStatus],['Triggered by',actor],['Bank freshness','Balances retrieved on request; transactions follow Plaid bank updates'],['Ledger handling','Bank feed imported; ledger classifications and cleared flags preserved']]);
    SpreadsheetApp.flush();
    // Commit the cursor only after all sheet writes succeed; retries upsert the same bank IDs.
    p.setProperties({PLAID_TRANSACTIONS_CURSOR:batch.cursor,LAST_SYNC_FINISHED_MS:String(Date.now()),LAST_SYNC_RESULT:JSON.stringify(result)});
    return result;
  } finally { lock.releaseLock(); }
}

function bankSheet_(book, title, headers) {
  let sheet = book.getSheetByName(title);
  if (!sheet) {sheet=book.insertSheet(title);sheet.getRange(1,1,1,headers.length).setValues([headers]);sheet.setFrozenRows(1);}
  const actual = sheet.getRange(1,1,1,headers.length).getValues()[0];
  if (JSON.stringify(actual)!==JSON.stringify(headers)) throw new Error(title+' headers do not match; sync stopped.');
  return sheet;
}
function bankText_(value) {const text=String(value);return /^[=+@-]/.test(text)?"'"+text:text;}

function doPost(e) {
  try {
    if (!e || !e.postData || e.postData.contents.length > 12000) throw new Error('Invalid request.');
    const request = JSON.parse(e.postData.contents);
    if (request.action !== 'sync') throw new Error('Unsupported action.');
    const actor = verifyPortalUser_(request.token);
    return bankJson_(syncChase_(actor));
  } catch (error) {return bankJson_({ok:false,error:String(error.message).slice(0,180)});}
}
function doGet() {return bankJson_({ok:true,service:'BSSC bank sync',requiresAuthentication:true});}
function bankJson_(value) {return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);}
function verifyPortalUser_(token) {
  if (typeof token !== 'string' || token.length < 20 || token.length > 6000) throw new Error('Sign in to the portal first.');
  const check=UrlFetchApp.fetch('https://oauth2.googleapis.com/tokeninfo?access_token='+encodeURIComponent(token),{muteHttpExceptions:true});
  const info=JSON.parse(check.getContentText());
  const client=info.issued_to || info.azp || info.aud || info.audience;
  if(check.getResponseCode()!==200 || client!==BSSC_PORTAL_CLIENT || Number(info.expires_in)<=0) throw new Error('Your portal sign-in has expired.');
  const userResponse=UrlFetchApp.fetch('https://www.googleapis.com/oauth2/v2/userinfo',{headers:{Authorization:'Bearer '+token},muteHttpExceptions:true});
  const user=JSON.parse(userResponse.getContentText());
  const email=String(user.email||'').toLowerCase();
  if(userResponse.getResponseCode()!==200 || user.verified_email!==true || !['bsscvb@boneshakerssocialclub.com','president@boneshakerssocialclub.com','treasurer@boneshakerssocialclub.com'].includes(email)) throw new Error('Bank sync is restricted to club finance administrators.');
  return email;
}
