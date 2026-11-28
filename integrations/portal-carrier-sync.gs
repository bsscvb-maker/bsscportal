const SHIPMENT_WORKBOOKS = [
  '1a6DfwnnNmy0ykQi7S8DKAt1RhauTh7ISwxSXm59b5NU',
  '1uC1tKyX4DnBKXH-4pIz8tm3zAvxdWr6ecrxrwUS9Hts'
];
const SHIP24_COURIERS = {UPS:'ups', FedEx:'fedex', USPS:'usps'};

function syncPortalCarrierScans() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(1000)) return;
  try {
    const properties = PropertiesService.getScriptProperties();
    const key = properties.getProperty('SHIP24_API_KEY');
    if (!key || properties.getProperty('SHIP24_FREE_PLAN') !== 'confirmed') {
      throw new Error('Set the free per-shipment Ship24 API key and confirm the free plan in Script Properties.');
    }
    let failures = 0;
    const deadline = Date.now() + 240000;
    for (const workbook of SHIPMENT_WORKBOOKS) {
      const sheet = SpreadsheetApp.openById(workbook).getSheetByName('Shipments');
      const active = new Map();
      for (const row of sheet.getDataRange().getDisplayValues().slice(1)) {
        const [number, carrier, , action] = row;
        if (!/^[A-Z0-9]{8,40}$/.test(number)) continue;
        if (action === 'remove') active.delete(number);
        if (action === 'save' && !active.has(number)) active.set(number,{carrier,scan:[]});
        const shipment = active.get(number);
        if (shipment && action === 'carrier') shipment.carrier = carrier;
        if (shipment && action === 'scan') shipment.scan = row.slice(5,10);
      }
      for (const [number, shipment] of active) {
        if (Date.now() >= deadline) return;
        if (!Object.hasOwn(SHIP24_COURIERS, shipment.carrier) || shipment.scan[0] === 'delivered') continue;
        try {
          const tracker = findOrRegisterTracker(key, properties, number, shipment.carrier);
          if (!tracker) continue;
          const path = '/trackers/' + encodeURIComponent(tracker) + '/results';
          const result = ship24Request(key, path)?.trackings?.[0];
          const scan = normalizeCarrierScan(result, shipment.scan);
          if (!scan || scan.every((value,index) => value === (shipment.scan[index] || ''))) continue;
          const values = [number,shipment.carrier,'','scan',new Date().toISOString(),...scan];
          sheet.appendRow(values.map(value => /^[=+\-@]/.test(value) ? "'" + value : value));
        } catch (error) {
          failures++;
          console.warn(error.message);
        }
      }
    }
    if (failures) throw new Error('Carrier updates failed for ' + failures + ' shipments. See execution logs.');
  } finally {
    lock.releaseLock();
  }
}

function findOrRegisterTracker(key, properties, number, carrier) {
  const clientTrackerId = 'portal-' + carrier.toLowerCase() + '-' + number;
  const property = 'tracker_' + clientTrackerId;
  const cached = properties.getProperty(property);
  if (cached) return cached;
  const lookup = ship24Request(key, '/trackers/' + encodeURIComponent(clientTrackerId) + '?searchBy=clientTrackerId', null, true);
  if (lookup?.tracker?.trackerId) {
    properties.setProperty(property, lookup.tracker.trackerId);
    return lookup.tracker.trackerId;
  }
  const month = Utilities.formatDate(new Date(),'UTC','yyyy-MM');
  const quota = 'ship24_attempts_' + month;
  const used = Number(properties.getProperty(quota) || 0);
  if (used >= 10) return null;
  properties.setProperty(quota, String(used + 1));
  const data = ship24Request(key,'/trackers',{trackingNumber:number, courierCode:[SHIP24_COURIERS[carrier]], clientTrackerId});
  const trackerId = data?.tracker?.trackerId;
  if (!trackerId) throw new Error('Ship24 did not return a tracker ID.');
  properties.setProperty(property, trackerId);
  return trackerId;
}

function ship24Request(key, path, payload, allowMissing) {
  const options = {headers:{Authorization:'Bearer '+key},muteHttpExceptions:true,followRedirects:false};
  if (payload) Object.assign(options,{method:'post',contentType:'application/json',payload:JSON.stringify(payload)});
  const response = UrlFetchApp.fetch('https://api.ship24.com/public/v1' + path, options);
  const status = response.getResponseCode();
  if (status === 404 && allowMissing) return null;
  if (status < 200 || status >= 300) throw new Error('Ship24 returned HTTP ' + status + '.');
  return JSON.parse(response.getContentText()).data;
}

function normalizeCarrierScan(result, previous) {
  if (!result) return null;
  const shipment = result.shipment || {};
  const event = (result.events || []).find(entry => entry.occurrenceDatetime) || {};
  const time = event.occurrenceDatetime || '';
  const oldTime = Date.parse(previous[3]);
  const newTime = Date.parse(time);
  if (Number.isFinite(oldTime) && Number.isFinite(newTime) && newTime < oldTime) return null;
  const milestone = shipment.statusMilestone || event.statusMilestone;
  const status = milestone === 'info_received' ? 'pre_transit' : milestone;
  const location = typeof event.location === 'string' ? event.location : '';
  const eta = shipment.delivery?.estimatedDeliveryDate;
  const detail = event.status || '';
  if ((!status || status === 'pending') && !time && !eta && !location && !detail) return null;
  return [status && status !== 'pending' ? status : previous[0],location || previous[1],eta || previous[2],time || previous[3],detail || previous[4]]
    .map(value => typeof value === 'string' ? value.trim() : '');
}

function installPortalCarrierSync() {
  syncPortalCarrierScans();
  if (!ScriptApp.getProjectTriggers().some(trigger => trigger.getHandlerFunction() === 'syncPortalCarrierScans')) {
    ScriptApp.newTrigger('syncPortalCarrierScans').timeBased().everyMinutes(15).create();
  }
}
