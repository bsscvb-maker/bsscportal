'use strict';

const demoBirthday = '2005-01-01';
const criteria = ['Service and initiative', 'Support for fellow members', 'Reliability and follow-through', 'Positive impact'];
const labels = ['0 — No verified evidence', '1 — Routine contribution', '2 — Beyond expectations', '3 — Exceptional contribution'];
const demoMembers = [
  { id: 'morgan', name: 'Morgan Example' },
  { id: 'casey', name: 'Casey Example' }
];
const reviewYear = new Date().getFullYear() - 1;
const $ = id => document.getElementById(id);
const nomination = $('nominate');
const review = $('score');
let nominations;
let reviews;

function configureNomination() {
  nomination.elements.member.replaceChildren(new Option('Choose a member', ''),
    ...demoMembers.map(member => new Option(member.name, member.id)));
  for (const field of ['date1', 'date2']) {
    nomination.elements[field].min = reviewYear + '-01-01';
    nomination.elements[field].max = reviewYear + '-12-31';
  }
}

function showEvidence() {
  const record = nominations.get(review.elements.member.value);
  const detail = $('evidence');
  detail.replaceChildren();
  if (!record) return;
  for (const item of record.examples) {
    const note = document.createElement('p');
    note.textContent = [item.date, item.description, 'Verification: ' + item.source].join(' · ');
    detail.append(note);
  }
}

function configureReview() {
  review.elements.member.replaceChildren(new Option('Choose a nomination', ''),
    ...Array.from(nominations, ([id, record]) => record.byDemo ? null :
      new Option(demoMembers.find(member => member.id === id).name, id)).filter(Boolean));
  showEvidence();
}

criteria.forEach((name, index) => {
  const field = document.createElement('fieldset');
  const legend = document.createElement('legend');
  legend.textContent = name;
  const score = document.createElement('select');
  score.name = 'rating' + index;
  score.required = true;
  score.setAttribute('aria-label', name + ' score');
  score.add(new Option('Choose a score', ''));
  labels.forEach((label, value) => score.add(new Option(label, value)));
  const evidence = document.createElement('input');
  evidence.name = 'reason' + index;
  evidence.required = true;
  evidence.maxLength = 500;
  evidence.placeholder = 'Evidence for this score';
  evidence.setAttribute('aria-label', name + ' evidence');
  field.append(legend, score, evidence);
  $('criteria').append(field);
});

$('login').addEventListener('submit', event => {
  event.preventDefault();
  if (event.currentTarget.elements.birthday.value !== demoBirthday) {
    $('notice').textContent = 'That date does not match the Big Lick demo.';
    return;
  }
  nominations = new Map([['morgan', { examples: [
    { date: reviewYear + '-05-10', description: 'Organized volunteer assignments for a fictional community event.', source: 'Demo event lead' },
    { date: reviewYear + '-08-20', description: 'Helped new members complete their first volunteer shifts.', source: 'Demo shift notes' }
  ] }]]);
  reviews = new Map();
  event.currentTarget.reset();
  $('demo').open = false;
  $('workspace').hidden = false;
  $('review').hidden = false;
  $('identity').textContent = 'Big Lick · Demo · ' + reviewYear + ' service';
  $('notice').textContent = 'Signed in to the demo as Big Lick.';
  configureNomination();
  configureReview();
  nomination.elements.member.focus();
});

$('logout').addEventListener('click', () => {
  nominations = null;
  reviews = null;
  nomination.reset();
  review.reset();
  $('workspace').hidden = true;
  $('notice').textContent = 'Signed out of the demo.';
  $('demo').querySelector('summary').focus();
});

nomination.addEventListener('submit', event => {
  event.preventDefault();
  if (!nominations) return;
  const data = new FormData(nomination);
  const examples = [1, 2].map(index => ({
    date: data.get('date' + index),
    description: data.get('example' + index).trim(),
    source: data.get('source' + index).trim()
  }));
  if (examples.some(item => !item.description || !item.source)) {
    $('notice').textContent = 'Enter a description and verification source for both examples.';
    return;
  }
  const id = data.get('member');
  if (nominations.has(id)) {
    $('notice').textContent = 'There is already a demo nomination for that member.';
    return;
  }
  nominations.set(id, { examples, byDemo: true });
  nomination.reset();
  $('notice').textContent = 'Demo nomination recorded. No club records were changed.';
});

review.elements.member.addEventListener('change', () => {
  review.elements.conflict.checked = false;
  review.elements.conflict.dispatchEvent(new Event('change'));
  $('criteria').querySelectorAll('input,select').forEach(field => { field.value = ''; });
  showEvidence();
});
review.elements.conflict.addEventListener('change', event => {
  $('criteria').hidden = event.target.checked;
  $('criteria').querySelectorAll('input,select').forEach(field => { field.disabled = event.target.checked; });
});
review.addEventListener('submit', event => {
  event.preventDefault();
  if (!reviews) return;
  const data = new FormData(review);
  const conflict = data.has('conflict');
  const entries = criteria.map((_, index) => ({
    score: Number(data.get('rating' + index)),
    evidence: String(data.get('reason' + index) || '').trim()
  }));
  if (!conflict && entries.some(entry => !entry.evidence)) {
    $('notice').textContent = 'Enter your evidence for every score.';
    return;
  }
  reviews.set(data.get('member'), conflict ? { conflict } : { entries });
  $('notice').textContent = conflict ? 'Demo recusal recorded.' : 'Demo review saved. Three independent reviews are needed for a recommendation.';
});

const endpoint = window.BSSC_SISTER_PATCH_ENDPOINT;
let liveToken = '';

async function liveRequest(payload) {
  const response = await fetch(endpoint, { method: 'POST', body: JSON.stringify(payload), credentials: 'omit' });
  if (!response.ok) throw new Error('The live form is unavailable.');
  const result = await response.json();
  if (result.error) throw new Error(result.error);
  return result;
}

if (typeof endpoint === 'string' && /^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(endpoint)) {
  $('live-login').hidden = false;
  $('availability').textContent = 'Enter your birthday as it appears on the membership roster.';
}
$('login').addEventListener('submit', () => { liveToken = ''; });
$('logout').addEventListener('click', () => { liveToken = ''; });

$('live-login').addEventListener('submit', async event => {
  event.preventDefault();
  const form = event.currentTarget;
  const button = form.querySelector('button');
  button.disabled = true;
  $('logout').click();
  $('notice').textContent = 'Verifying your birthday…';
  try {
    const result = await liveRequest({ action: 'login', birthday: form.elements.birthday.value });
    liveToken = result.token;
    nomination.elements.member.replaceChildren(new Option('Choose a member', ''),
      ...result.members.map(member => new Option(member.name, member.id)));
    for (const field of ['date1', 'date2']) {
      nomination.elements[field].min = result.year + '-01-01';
      nomination.elements[field].max = result.year + '-12-31';
    }
    $('review').hidden = true;
    $('workspace').hidden = false;
    $('identity').textContent = result.name + ' · ' + result.year + ' service';
    $('notice').textContent = result.members.length ? 'Birthday verified.' : 'No eligible nominees are currently available.';
    nomination.elements.member.focus();
  } catch (error) {
    $('notice').textContent = error.message;
  } finally {
    form.reset();
    button.disabled = false;
  }
});

nomination.addEventListener('submit', async event => {
  if (!liveToken) return;
  event.preventDefault();
  const button = nomination.querySelector('button');
  const token = liveToken;
  const data = new FormData(nomination);
  const examples = [1, 2].map(index => ({
    date: data.get('date' + index), description: data.get('example' + index), source: data.get('source' + index)
  }));
  button.disabled = true;
  try {
    await liveRequest({ action: 'nominate', token, member: data.get('member'), examples });
    if (liveToken === token) {
      nomination.reset();
      $('notice').textContent = 'Your nomination was submitted.';
    }
  } catch (error) {
    if (liveToken === token) $('notice').textContent = error.message;
  } finally {
    button.disabled = false;
  }
});
