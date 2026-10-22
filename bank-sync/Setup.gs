/** BSSC Bank Sync. All permanent tokens remain server-side. */
function plaidRequest_(path, payload) {
  const p = PropertiesService.getScriptProperties();
  const clientId = p.getProperty('PLAID_CLIENT_ID');
  const secret = p.getProperty('PLAID_SECRET');
  if (!clientId || !secret) throw new Error('Missing Plaid configuration.');
  const r = UrlFetchApp.fetch('https://production.plaid.com' + path, {
    method: 'post', contentType: 'application/json', muteHttpExceptions: true,
    payload: JSON.stringify(Object.assign({}, payload, {client_id: clientId, secret: secret}))
  });
  const data = JSON.parse(r.getContentText());
  if (r.getResponseCode() !== 200) throw new Error('Plaid: ' + (data.error_code || r.getResponseCode()));
  return data;
}
function checkPlaidConnection() {
  const r = plaidRequest_('/link/token/create', linkOptions_());
  if (!r.link_token) throw new Error('Plaid did not return a Link token.');
  console.log('SUCCESS: Plaid Production credentials accepted.');
}
function linkOptions_() {
  return {client_name: 'BoneShakers Social Club', language: 'en',
    country_codes: ['US'], products: ['transactions'],
    account_filters: {depository: {account_subtypes: ['checking', 'savings']}},
    user: {client_user_id: 'bssc-finance-admin'}};
}
function startChaseConnection() {
  const p = PropertiesService.getScriptProperties();
  if (p.getProperty('PLAID_ACCESS_TOKEN')) throw new Error('An account is already connected.');
  const options = linkOptions_();
  options.hosted_link = {url_lifetime_seconds: 1800};
  const r = plaidRequest_('/link/token/create', options);
  if (!r.hosted_link_url || !r.link_token) throw new Error('Hosted Link unavailable.');
  p.setProperty('PLAID_SETUP_LINK_TOKEN', r.link_token);
  p.setProperty('PLAID_SETUP_EXPIRES', r.expiration);
  console.log('Open this temporary connection page: ' + r.hosted_link_url);
}

function finishChaseConnection() {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const p = PropertiesService.getScriptProperties();
    let accessToken = p.getProperty('PLAID_ACCESS_TOKEN');
    if (!accessToken) {
      const linkToken = p.getProperty('PLAID_SETUP_LINK_TOKEN');
      if (!linkToken) throw new Error('No setup session found.');
      const result = plaidRequest_('/link/token/get', {link_token: linkToken});
      const tokens = [];
      (result.link_sessions || []).forEach(function(session) {
        const items = session.results && session.results.item_add_results || [];
        items.forEach(function(item) { if (item.public_token) tokens.push(item.public_token); });
        if (!items.length && session.on_success && session.on_success.public_token) tokens.push(session.on_success.public_token);
      });
      const uniqueTokens = [...new Set(tokens)];
      if (uniqueTokens.length !== 1) throw new Error('Expected one completed bank connection; found ' + uniqueTokens.length + '.');
      const exchange = plaidRequest_('/item/public_token/exchange', {public_token: uniqueTokens[0]});
      if (!exchange.access_token || !exchange.item_id) throw new Error('Incomplete token exchange.');
      p.setProperties({PLAID_ACCESS_TOKEN: exchange.access_token, PLAID_ITEM_ID: exchange.item_id});
      accessToken = exchange.access_token;
    }
    const result = plaidRequest_('/accounts/get', {access_token: accessToken});
    if (!result.item || result.item.institution_id !== 'ins_56') throw new Error('Expected a Chase connection.');
    const mapping = {};
    ['7707', '8799'].forEach(function(mask) {
      const matches = (result.accounts || []).filter(function(a) { return a.mask === mask && a.type === 'depository'; });
      if (matches.length !== 1) throw new Error('Expected one club account ending ' + mask + '.');
      mapping[mask] = matches[0].account_id;
    });
    p.setProperty('PLAID_ACCOUNT_MAP', JSON.stringify(mapping));
    p.setProperty('PLAID_CONNECTED_AT', new Date().toISOString());
    p.deleteProperty('PLAID_SETUP_LINK_TOKEN');
    p.deleteProperty('PLAID_SETUP_EXPIRES');
    console.log('SUCCESS: Chase connected. Verified club accounts ending 7707 and 8799. Permanent tokens saved privately.');
  } finally { lock.releaseLock(); }
}
