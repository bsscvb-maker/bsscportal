function doPost(e) {
  const params=e&&e.parameter||{},requestId=String(params.requestId||''),action=String(params.action||'');
  if(!['previewFulfillment','sendVendorOrder'].includes(action)||!/^vendor-order-[0-9]+-[a-z0-9]+$/.test(requestId))return marketplaceResponse_('Request not recognized. Nothing sent.',false,requestId);
  const token=String(params.accessToken||''),actor=getMarketplacePortalEmail_(token);
  const allowed=[CONFIG.PRESIDENT_EMAIL,CONFIG.TREASURER_EMAIL].map(v=>v.toLowerCase());
  if(!actor||!allowed.includes(actor.toLowerCase()))return marketplaceResponse_('Sign in as President or Treasurer. Nothing sent.',false,requestId);
  try{
    if(action==='previewFulfillment')return fulfillmentPreview_(token,requestId,actor);
    const props=PropertiesService.getScriptProperties(),key='FULFILLMENT_PREVIEW_'+requestId;
    const preview=JSON.parse(props.getProperty(key)||'{}');
    if(preview.actor!==actor||Date.now()-preview.at>900000)throw new Error('Review expired. Open a new review from the dashboard.');
    if(preview.result)return marketplaceResponse_(preview.result,true,requestId);
    const hash=fulfillmentHash_(getVendorLines_(),getInHousePullLines_());
    if(!params.previewHash||params.previewHash!==preview.hash||hash!==preview.hash)throw new Error('Order details changed. Nothing new sent. Return to the dashboard and review again.');
    const vendor=getVendorStatus_(),internalOnly=params.sendVendor!=='yes';
    let overrideReason=String(params.overrideReason||'').trim();
    if(!internalOnly&&vendor.currentCost>0&&!vendor.minimumMet){
      if(String(params.overridePassword||'').trim()!==CONFIG.MANUAL_VENDOR_OVERRIDE_PASSWORD)throw new Error('Below-minimum override password missing or incorrect. Nothing sent.');
      if(!overrideReason)throw new Error('Override reason required. Nothing sent.');
    }
    const result=sendVendorOrderEmail({internalOnly,requestId,allowBelowMinimum:!vendor.minimumMet,overrideReason,overrideBy:actor});
    preview.result=result.message;props.setProperty(key,JSON.stringify(preview));
    return marketplaceResponse_(result.message,true,requestId);
  }catch(error){return marketplaceResponse_('Submission result: '+String(error.message||error),false,requestId);}
}

