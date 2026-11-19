(() => {
  const knownPages = ["/", "/%E2%9D%A4%EF%B8%8F-our-impact", "/%F0%9F%8F%85-hall-of-honor", "/%F0%9F%91%A5-our-leadership", "/%F0%9F%93%96-our-story-and-mission", "/%F0%9F%95%B0%EF%B8%8F-history-%26-legacy", "/%F0%9F%96%BC%EF%B8%8F-gallery", "/%F0%9F%9B%A1%EF%B8%8F-club-code-of-conduct", "/bft-donation-thank-you", "/bike-night", "/bikes-for-tykes", "/board-service-2027", "/bod-nominations", "/club-event-request", "/contact", "/election-2027", "/event-calendar", "/guest-waiver", "/join-the-boneshakers-1", "/legacy-membership", "/marketplace", "/meet-the-candidates", "/patch-vote", "/pictures", "/renew-membership", "/request-event-support", "/request-funding", "/requirements-to-serve", "/ride-incident-report-form", "/ride-partners", "/signature-rides", "/sponsor", "/volunteer-with-bssc", "/we-salute-you-1"];
  const property = '565139028';
  const scope = 'https://www.googleapis.com/auth/analytics.readonly';
  const clubAccount = 'bsscvb@boneshakerssocialclub.com';
  const analyticsUrl = 'https://analytics.google.com/analytics/web/?authuser=bsscvb%40boneshakerssocialclub.com#/a416966110p565139028/reports/intelligenthome';
  const hostFilter = {filter:{fieldName:'hostName',inListFilter:{values:['boneshakerssocialclub.com','www.boneshakerssocialclub.com']}}};
  const actionLabels = {
    candidate_open_austin_reiter:'Austin Reiter interview',
    candidate_open_debby_farland:'Debby Farland interview',
    candidate_open_toni_biffle:'Toni Biffle interview',
    bssc_event_open:'Open event',
    bssc_donate_click:'Donate',
    bssc_marketplace_item_open:'Open Marketplace item',
    bssc_support_request_start:'Start support request',
    bssc_support_request_complete:'Complete support request'
  };
  const number = new Intl.NumberFormat('en-US');
  let grant;

  function authorize(session) {
    if (grant?.session === session && grant.expiresAt > Date.now()) return Promise.resolve(grant.token);
    return new Promise((resolve, reject) => {
      google.accounts.oauth2.initTokenClient({
        client_id:GOOGLE_CLIENT_ID, scope, hint:clubAccount, include_granted_scopes:false,
        callback(result) {
          if (result.error || !google.accounts.oauth2.hasGrantedAllScopes(result, scope)) {
            reject(Error('Authorize read-only Analytics access with the club Google account.'));
            return;
          }
          if (accessToken !== session) { reject(Error('Your portal session changed.')); return; }
          grant = {session, token:result.access_token, expiresAt:Date.now() + Math.max(0, Number(result.expires_in) - 60) * 1000};
          resolve(grant.token);
        },
        error_callback:() => reject(Error('Google authorization was closed or blocked.'))
      }).requestAccessToken({prompt:''});
    });
  }

  async function fetchReport(token, settings) {
    const response = await fetch('https://analyticsdata.googleapis.com/v1beta/properties/' + property + ':runReport', {
      method:'POST',
      headers:{Authorization:'Bearer ' + token, 'Content-Type':'application/json'},
      body:JSON.stringify(settings),
      signal:AbortSignal.timeout(20000)
    });
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        grant = undefined;
        throw Error('Google denied this request. Check access to the club Analytics property and try again.');
      }
      throw Error('Google Analytics could not load the report. Try again.');
    }
    return response.json();
  }

  function report(dateRanges, dimensions, metrics, dimensionFilter=hostFilter) {
    return {dateRanges, dimensions:dimensions.map(name=>({name})), metrics:metrics.map(name=>({name})), dimensionFilter, limit:10000};
  }

  function pagePath(value) {
    try { return encodeURI(decodeURIComponent(value)).replace(/\/$/, '') || '/'; }
    catch { return value.replace(/\/$/, '') || '/'; }
  }

  function labelForPage(path) {
    if (path === '/') return 'Home';
    try { return decodeURIComponent(path).slice(1).replace(/-/g,' '); }
    catch { return path; }
  }

  function cell(parent, tag, value) {
    const element = document.createElement(tag);
    element.textContent = value;
    parent.append(element);
    return element;
  }

  function render(target) {
    target.innerHTML = `<section class="website-analytics" aria-label="Website analytics report">
      <style>
        .website-analytics{grid-column:1/-1;min-width:0;background:#fff;color:#171a20;padding:clamp(14px,2vw,25px);border:1px solid #cad0d7;border-radius:12px}
        .website-analytics h2,.website-analytics h3{margin:.35em 0}
        .website-analytics form{display:flex;flex-wrap:wrap;align-items:end;gap:14px;margin:0 0 14px}
        .website-analytics label{display:grid;gap:5px;font-weight:700}
        .website-analytics button,.website-analytics select{padding:8px 12px;border-radius:7px;border:1px solid #adb5bf;background:#fff;color:#171a20}
        .website-analytics button{background:#a70e2b;color:white;border-color:#a70e2b;font-weight:700}
        .website-analytics button:disabled{opacity:.55}
        .website-analytics .wa-cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin:15px 0}
        .website-analytics .wa-cards>div{padding:12px 15px;border-radius:8px;background:#f1f3f5}
        .website-analytics .wa-cards strong{display:block;font-size:1.5rem}
        .website-analytics .wa-table{overflow:auto;margin-bottom:22px}
        .website-analytics table{width:100%;border-collapse:collapse;font-size:.91rem}
        .website-analytics th,.website-analytics td{padding:9px;border-bottom:1px solid #e1e5e9;text-align:left}
        .website-analytics th{white-space:nowrap;background:#f1f3f5}
        .website-analytics .wa-path{font-size:.8rem;color:#535b66;display:block;overflow-wrap:anywhere}
      </style>
      <form><label>Date range<select><option value="7">Last 7 completed days</option><option value="30" selected>Last 30 completed days</option><option value="90">Last 90 completed days</option><option value="today">Today so far</option></select></label>
      <button type="submit">Refresh report</button><a href="${analyticsUrl}" target="_blank" rel="noopener">Open Google Analytics</a></form>
      <p role="status">Refresh the report to load the club’s website activity.</p>
      <div data-report hidden>
        <div class="wa-cards" data-totals></div>
        <h2>Pages</h2><p>Click totals cover measured actions. A dash means no clicks were reported or configured for that page.</p>
        <div class="wa-table"><table><thead><tr><th>Page</th><th>Views</th><th>Previous views</th><th>Visitors</th><th>Measured clicks</th></tr></thead><tbody data-pages></tbody></table></div>
        <h2>Clicks and actions</h2><p>Destination links and the site actions configured for measurement.</p>
        <div class="wa-table"><table><thead><tr><th>Page</th><th>Action or destination</th><th>Count</th></tr></thead><tbody data-actions></tbody></table></div>
        <h2>Where visitors came from</h2>
        <div class="wa-table"><table><thead><tr><th>Source / medium</th><th>Sessions</th></tr></thead><tbody data-sources></tbody></table></div>
      </div>
    </section>`;
    const section = target.querySelector('.website-analytics');
    const form = section.querySelector('form');
    const button = form.querySelector('button');
    const range = form.querySelector('select');
    const status = section.querySelector('[role=status]');
    const output = section.querySelector('[data-report]');
    form.onsubmit = async event => {
      event.preventDefault();
      const session = accessToken;
      if (!session) { status.textContent = 'Sign in to the portal to load Analytics.'; return; }
      button.disabled = true;
      output.hidden = true;
      status.textContent = 'Loading website activity…';
      try {
        const token = await authorize(session);
        const days = Number(range.value);
        const current = {name:'current',startDate:days ? days+'daysAgo' : 'today',endDate:days ? 'yesterday' : 'today'};
        const previous = {name:'previous',startDate:days ? 2*days+'daysAgo' : 'yesterday',endDate:days ? (days+1)+'daysAgo' : 'yesterday'};
        const actionFilter = {andGroup:{expressions:[hostFilter,{filter:{fieldName:'eventName',inListFilter:{values:['click',...Object.keys(actionLabels)]}}}]}};
        const [totals,pages,actions,sources] = await Promise.all([
          fetchReport(token, report([current,previous],[],['screenPageViews','totalUsers','sessions'])),
          fetchReport(token, report([current,previous],['pagePath'],['screenPageViews','totalUsers'])),
          fetchReport(token, report([current],['pagePath','eventName','linkDomain'],['eventCount'],actionFilter)),
          fetchReport(token, report([current],['sessionSourceMedium'],['sessions']))
        ]);
        if (!section.isConnected || accessToken !== session) return;
        fillReport(section, {totals,pages,actions,sources}, Boolean(days));
        output.hidden = false;
        status.textContent = (pages.rows?.length ? 'Activity loaded. Google Analytics processing can lag.' : 'Google Analytics has no processed page views for this period.') +
          (days ? '' : ' Today’s in-progress totals are compared with all of yesterday.');
      } catch (error) {
        if (section.isConnected && accessToken === session) status.textContent = error.message;
      } finally { button.disabled = false; }
    };
  }

  function fillReport(section, {totals,pages,actions,sources}, compareFullPeriod) {
    const get = attribute => {
      const element = section.querySelector('[data-'+attribute+']');
      element.replaceChildren();
      return element;
    };
    const totalRows = new Map((totals.rows || []).map(row=>[row.dimensionValues[0]?.value,row.metricValues.map(x=>Number(x.value))]));
    const cards = get('totals');
    ['Page views','Visitors','Sessions'].forEach((label,i)=>{
      const card = cell(cards,'div','');
      cell(card,'span',label);
      cell(card,'strong',number.format(totalRows.get('current')?.[i] || 0));
      cell(card,'small',number.format(totalRows.get('previous')?.[i] || 0)+(compareFullPeriod ? ' previous period' : ' yesterday'));
    });
    const pageRows = new Map(knownPages.map(path=>[pagePath(path),{views:0,previous:0,users:0}]));
    for (const row of pages.rows || []) {
      const [path,period] = row.dimensionValues.map(x=>x.value);
      if (!path.startsWith('/') || path.startsWith('/m/')) continue;
      const key = pagePath(path);
      const rowData = pageRows.get(key) || {views:0,previous:0,users:0};
      const [views,users] = row.metricValues.map(x=>Number(x.value));
      if (period === 'current') { rowData.views += views; rowData.users += users; }
      else if (period === 'previous') rowData.previous += views;
      pageRows.set(key,rowData);
    }
    const actionRows = new Map(Object.entries(actionLabels).filter(([name])=>name.startsWith('candidate_open_')).map(([name,label])=>[
      '/meet-the-candidates|'+name,{path:'/meet-the-candidates',label,count:0}
    ]));
    for (const row of actions.rows || []) {
      const [path,event,domain] = row.dimensionValues.map(x=>x.value);
      if (!path.startsWith('/') || path.startsWith('/m/')) continue;
      const page = pagePath(path);
      const key = page+'|'+event+(event === 'click' ? '|'+domain : '');
      const current = actionRows.get(key) || {path:page,label:actionLabels[event] || ('Outbound link · '+domain),count:0};
      current.count += Number(row.metricValues[0].value);
      actionRows.set(key,current);
    }
    const clickTotals = new Map();
    const actionTable = get('actions');
    for (const action of [...actionRows.values()].sort((a,b)=>b.count-a.count||a.label.localeCompare(b.label))) {
      const row = cell(actionTable,'tr','');
      cell(row,'td',labelForPage(action.path));
      cell(row,'td',action.label);
      cell(row,'td',number.format(action.count));
      clickTotals.set(action.path,(clickTotals.get(action.path)||0)+action.count);
    }
    const pageTable = get('pages');
    for (const [path,data] of [...pageRows].sort((a,b)=>b[1].views-a[1].views||a[0].localeCompare(b[0]))) {
      const row = cell(pageTable,'tr','');
      const title = cell(row,'td',labelForPage(path));
      cell(title,'span',path).className='wa-path';
      for (const value of [data.views,data.previous,data.users]) cell(row,'td',number.format(value));
      cell(row,'td',clickTotals.has(path)?number.format(clickTotals.get(path)):'—');
    }
    const sourceTable = get('sources');
    const sourceRows = [...(sources.rows || [])].sort((a,b)=>Number(b.metricValues[0].value)-Number(a.metricValues[0].value));
    for (const source of sourceRows) {
      const row = cell(sourceTable,'tr','');
      cell(row,'td',source.dimensionValues[0].value);
      cell(row,'td',number.format(Number(source.metricValues[0].value)));
    }
    if (!sourceRows.length) cell(cell(sourceTable,'tr',''),'td','No traffic sources reported.').colSpan=2;
  }

  document.getElementById('signOut')?.addEventListener('click',()=>{grant=undefined;});
  window.BSSCWebsiteAnalytics = {render};
})();
