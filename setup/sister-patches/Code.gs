// Deploy as a standalone Apps Script application with access to the private workbook.
const MEMBER_BOOK = '1G1GhywDG-FYEo00fY_FeWheScve333LIdBqZpqLbZZM';
const TZ = 'America/New_York';
const DEMO_DOB = '2005-01-01';

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    if (!lock.tryLock(5000)) return reply({ error: 'The form is busy. Try again shortly.' });
    const data = JSON.parse(e.postData.contents);
    const book = SpreadsheetApp.openById(MEMBER_BOOK);
    const config = PropertiesService.getScriptProperties();
    const year = Number(config.getProperty('REVIEW_YEAR'));
    const open = new Date(config.getProperty('NOMINATIONS_OPEN'));
    const close = new Date(config.getProperty('NOMINATIONS_CLOSE'));
    const now = new Date();
    if (year < 2026 || !Number.isInteger(year) || !(close - open >= 14 * 86400000) || !(now >= open && now < close)) {
      return reply({ error: 'Live Sister Patch nominations are closed.' });
    }
    const rosterTab = config.getProperty('ROSTER_TAB');
    const roster = records(book, rosterTab, ['status','first name','last name','sex','start date','date of birth','dues paid','sister patch']);
    const checks = records(book, 'Sister Patch Verification', ['review year','roster name','attendance cleared','discipline cleared','membership verified','prior award cleared']);
    const nominations = book.getSheetByName('Sister Patch Nominations');
    if (!nominations || nominations.getLastRow() < 1) throw new Error('Missing private nominations log');
    const cache = CacheService.getScriptCache();
    if (data.action === 'login') {
      const failed = Number(cache.get('sister.failed') || 0);
      if (failed >= 20) return reply({ error: 'Sign-in is temporarily unavailable. Try again later.' });
      const matches = data.birthday === DEMO_DOB ? [] : roster.filter(member =>
        active(member) && dateKey(member['date of birth']) === data.birthday);
      if (matches.length !== 1 || !uniqueName(roster, matches[0])) {
        cache.put('sister.failed', String(failed + 1), 600);
        return reply({ error: 'We could not verify that birthday. Contact the club Secretary if you need help.' });
      }
      const member = matches[0];
      const token = Utilities.getUuid() + Utilities.getUuid();
      cache.put('sister.session.' + token, JSON.stringify({ member: name(member), year }), 900);
      return reply({ token, year, name: name(member), members: candidates(roster, checks, year, member) });
    }
    if (data.action !== 'nominate' || !/^[0-9a-f-]{72}$/.test(String(data.token))) {
      return reply({ error: 'Sign in again to continue.' });
    }
    const session = JSON.parse(cache.get('sister.session.' + data.token) || 'null');
    const matches = session && session.year === year ? roster.filter(member =>
      active(member) && name(member) === session.member) : [];
    if (matches.length !== 1) return reply({ error: 'Sign in again to continue.' });
    const member = matches[0];
    const target = candidates(roster, checks, year, member).find(item => item.id === data.member);
    if (!target) return reply({ error: 'This member is no longer available for nomination.' });
    if (!Array.isArray(data.examples) || data.examples.length !== 2 || data.examples.some(item =>
      !item || !validDate(item.date, year) || !validText(item.description, 1500) || !validText(item.source, 250))) {
      return reply({ error: 'Provide two examples within the service year and a verification source for each.' });
    }
    const key = [year, name(member), target.id].join('|');
    if (nominations.getRange(1, 1, nominations.getLastRow(), 1).getValues().some(row => row[0] === key)) {
      return reply({ error: 'You have already submitted a nomination for this member in this cycle.' });
    }
    nominations.appendRow([literal(key), now, year, literal(name(member)), literal(target.id),
      ...data.examples.flatMap(item => [item.date, literal(item.description.trim()), literal(item.source.trim())])]);
    SpreadsheetApp.flush();
    return reply({ saved: true });
  } catch (error) {
    console.error(String(error));
    return reply({ error: 'The live form is unavailable. Contact the club Secretary.' });
  } finally {
    if (lock.hasLock()) lock.releaseLock();
  }
}

function records(book, tab, required) {
  const sheet = book.getSheetByName(tab);
  if (!sheet) throw new Error('Missing configured tab');
  const [headers, ...rows] = sheet.getDataRange().getValues();
  const keys = headers.map(value => normalize(value));
  if (required.some(key => keys.indexOf(key) < 0 || keys.indexOf(key) !== keys.lastIndexOf(key))) {
    throw new Error('Missing or duplicate required header');
  }
  return rows.map(row => Object.fromEntries(keys.map((key, index) => [key, row[index]])));
}

function candidates(roster, checks, year, nominator) {
  const cutoff = (year - 1) + '-12-31';
  return roster.filter(member => {
    const id = name(member);
    const matches = checks.filter(check => Number(check['review year']) === year && normalize(check['roster name']) === normalize(id));
    const check = matches[0];
    const start = dateKey(member['start date']);
    return id !== name(nominator) && uniqueName(roster, member) && active(member) &&
      ['female','f','woman'].includes(normalize(member.sex)) &&
      !!start && start <= cutoff && ['no','false','0',''].includes(normalize(member['sister patch'])) &&
      matches.length === 1 && ['attendance cleared','discipline cleared','membership verified','prior award cleared']
        .every(key => ['yes','true'].includes(normalize(check[key])));
  }).map(member => ({ id: name(member), name: name(member) })).sort((a, b) => a.name.localeCompare(b.name));
}

function active(member) {
  return normalize(member.status) === 'active' &&
    ['yes','paid','exempt','waived','true','1'].includes(normalize(member['dues paid']));
}
function name(member) {
  return [member['first name'], member['last name']].map(value => String(value || '').trim()).filter(Boolean).join(' ');
}
function uniqueName(roster, member) {
  const id = normalize(name(member));
  return !!id && roster.filter(item => normalize(name(item)) === id).length === 1;
}
function normalize(value) {
  return String(value == null ? '' : value).trim().toLowerCase();
}
function dateKey(value) {
  if (value instanceof Date && Number.isFinite(value.getTime())) return Utilities.formatDate(value, TZ, 'yyyy-MM-dd');
  const input = String(value || '').trim();
  const us = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(input);
  const iso = us ? [us[3], us[1].padStart(2, '0'), us[2].padStart(2, '0')].join('-') : input;
  return validDate(iso, Number(iso.slice(0, 4))) ? iso : '';
}
function validDate(input, year) {
  if (typeof input !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(input) || Number(input.slice(0, 4)) !== year) return false;
  const parsed = new Date(input + 'T00:00:00Z');
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === input;
}
function validText(text, max) {
  return typeof text === 'string' && text.trim().length > 0 && text.length <= max;
}
function literal(text) {
  return /^[=+@\-]/.test(text) ? "'" + text : text;
}
function reply(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
