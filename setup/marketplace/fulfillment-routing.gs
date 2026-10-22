// Item-level routing: in-house products never appear in vendor emails or cost totals.
function isInHouseMarketplaceItem_(value) {
  const name=String(value||'').toLowerCase().replace(/[’']/g,'').replace(/[^a-z0-9]+/g,' ').trim();
  return /\blapel pin\b/.test(name)||/\bcelebrating 20 years patch\b/.test(name)||/\bbikes for tykes challenge coin\b/.test(name)||/\bbssc ring\b/.test(name)||/\bbssc logo sticker\b/.test(name);
}
function getVendorLines_(){return getAllManufacturerLines_().filter(line=>!isInHouseMarketplaceItem_(line.type));}
function getInHousePullLines_() {
  const book=getSpreadsheet_(), orders=book.getSheetByName(SHEETS.ORDERS).getDataRange().getValues().slice(1);
  const events=book.getSheetByName('Merchandise Activity');
  const activity=events?events.getDataRange().getValues().slice(1):[];
  const props=PropertiesService.getScriptProperties();
  const yes=v=>/^(true|yes|1)$/i.test(String(v||''));
  const result=[];
  orders.forEach(order=>{
    const id=String(order[1]||'');
    if(!id||yes(order[14])||yes(order[15])||/cancelled|deleted/i.test(String(order[19]||''))||activity.some(e=>String(e[2])===id&&['Cancelled','Deleted'].includes(e[1])))return;
    const combined=new Map();
    String(order[8]||'').split(/\s*\|\s*/).forEach(part=>{
      const match=part.match(/^(.*?)\s+x(\d+)\s*$/i);
      if(!match) return;
      const item=match[1].trim();if(!isInHouseMarketplaceItem_(item))return;
      combined.set(item,(combined.get(item)||0)+Number(match[2]));
    });
    combined.forEach((ordered,item)=>{
      const received=activity.filter(e=>String(e[2])===id&&String(e[3])===item&&['Received','Damaged'].includes(e[1])).reduce((n,e)=>n+(e[1]==='Damaged'?-1:1)*Number(e[4]||0),0);
      const quantity=Math.max(0,ordered-Math.max(0,received));if(!quantity)return;
      const key='INHOUSE_NOTICE_'+Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,id+'|'+item)).replace(/=+$/,'');
      const notified=Number(props.getProperty(key)||0);
      if(quantity<=notified)return;
      result.push({orderId:id,customer:String(order[4]||''),item,quantity:quantity-notified,payment:String(order[12]||''),key,noticeQuantity:quantity});
    });
  });
  return result;
}
function buildInHousePullEmail_(lines){
  const rows=lines.map(line=>'<tr><td>'+escapeHtml_(line.customer)+'<br><small>'+escapeHtml_(line.orderId)+'</small></td><td>'+escapeHtml_(line.item)+'</td><td>'+line.quantity+'</td><td>'+escapeHtml_(line.payment)+'</td></tr>').join('');
  return {subject:'BSSC Marketplace — pull '+lines.reduce((n,l)=>n+l.quantity,0)+' in-house items',htmlBody:emailShell_('Pull from In-House Inventory','Please pull and set aside the following items for these customers. These items were excluded from the vendor order and vendor cost.','<table width="100%" cellpadding="10" style="border-collapse:collapse;color:white"><tr style="background:#c8102e"><th>Customer / Order</th><th>Item / Size</th><th>Qty</th><th>Payment</th></tr>'+rows+'</table><p>Record each item as received/pulled in Marketplace Order Management after setting it aside. Do not mark the entire order handed out until the customer receives it. Collect any cash due before handout.</p>','Open Marketplace Workbook')};
}
function sendVendorOrderEmail(options){
  const settings=options||{},lock=LockService.getScriptLock();lock.waitLock(10000);
  try{
    assertInternalRecipients_();
    const props=PropertiesService.getScriptProperties(),vendor=getVendorStatus_(),lines=getInHousePullLines_();
    const vendorLines=getVendorLines_();
    const requestKey=settings.requestId?'FULFILLMENT_REQUEST_'+String(settings.requestId).slice(0,100):'';
    const previous=requestKey?JSON.parse(props.getProperty(requestKey)||'{}'):{};
    let vendorSent=Boolean(previous.vendorSent),inHouseSent=Boolean(previous.inHouseSent);
    if(!settings.internalOnly&&vendorLines.length&&!vendorSent){
      sendVendorOnlyEmail_(settings);vendorSent=true;
      if(requestKey)props.setProperty(requestKey,JSON.stringify({vendorSent,inHouseSent}));
    }
    if(lines.length&&!inHouseSent){
      try{const email=buildInHousePullEmail_(lines);sendEmail_(CONFIG.PRESIDENT_EMAIL,CONFIG.TREASURER_EMAIL,email.subject,email.htmlBody);}
      catch(error){throw new Error((vendorSent?'Vendor email WAS sent. ':'')+'In-house email failed: '+String(error.message||error));}
      lines.forEach(line=>props.setProperty(line.key,String(line.noticeQuantity)));
      inHouseSent=true;if(requestKey)props.setProperty(requestKey,JSON.stringify({vendorSent,inHouseSent}));
    }
    return {message:(vendorSent?'Vendor order sent: '+money_(vendor.currentCost)+'. ':vendorLines.length?'Vendor order held; not sent. ':'No vendor-made items to send. ')+(inHouseSent?'In-house pull list emailed to President and Treasurer.':'No new in-house items awaiting notification.')};
  }finally{lock.releaseLock();}
}
function previewFulfillmentRouting(){
  const vendor=getVendorStatus_(),inHouse=getInHousePullLines_();
  console.log(JSON.stringify({previewOnly:true,noEmailsSent:true,vendorRecipient:CONFIG.VENDOR_EMAIL,vendorCost:vendor.currentCost,vendorMinimum:vendor.minimum,vendorLines:getVendorLines_(),inHouseRecipient:CONFIG.PRESIDENT_EMAIL,inHouseCc:CONFIG.TREASURER_EMAIL,inHouseLines:inHouse.map(l=>({customer:l.customer,orderId:l.orderId,item:l.item,quantity:l.quantity}))}));
}
function fulfillmentHash_(vendor,inHouse){
  return Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,JSON.stringify({vendor:vendor,currentCost:vendor.reduce((n,l)=>n+l.total,0),minimum:getVendorStatus_().minimum,inHouse:inHouse.map(l=>({orderId:l.orderId,customer:l.customer,item:l.item,quantity:l.quantity,payment:l.payment}))}))).replace(/=+$/,'');
}
function fulfillmentPreview_(token,requestId,actor){
  const vendor=getVendorStatus_(),lines=getVendorLines_(),inHouse=getInHousePullLines_();
  const hash=fulfillmentHash_(lines,inHouse);
  PropertiesService.getScriptProperties().setProperty('FULFILLMENT_PREVIEW_'+requestId,JSON.stringify({hash,actor,at:Date.now()}));
  const cell=v=>'<td>'+escapeHtml_(v)+'</td>';
  const vendorRows=lines.map(l=>'<tr>'+cell(l.type)+cell(l.size)+cell(l.color)+cell(l.qty)+cell(money_(l.price))+cell(money_(l.total))+'</tr>').join('');
  const houseRows=inHouse.map(l=>'<tr>'+cell(l.customer)+cell(l.orderId)+cell(l.item)+cell(l.quantity)+cell(l.payment)+'</tr>').join('');
  const hidden=(n,v)=>'<input type="hidden" name="'+n+'" value="'+escapeHtml_(v)+'">';
  const html='<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>Review Marketplace Fulfillment</title><style>body{font:16px Arial;background:#111;color:#fff;max-width:1100px;margin:24px auto;padding:20px}h1{border-top:6px solid #c8102e;padding-top:20px}section{background:#202020;border:1px solid #555;border-radius:12px;padding:20px;margin:20px 0}table{width:100%;border-collapse:collapse}td,th{padding:10px;border-bottom:1px solid #555;text-align:left}th{background:#a9102c}.scroll{overflow:auto}button{font:inherit;font-weight:bold;padding:14px 22px;border:0;border-radius:8px;cursor:pointer;margin:8px 12px 8px 0}button[type=submit]{background:#c8102e;color:white}input[type=text],input[type=password]{font:inherit;padding:10px;display:block;margin:8px 0 18px;width:min(90%,600px)}small{color:#ccc}.warning{color:#ffd471}label{display:block;margin:16px 0}</style></head><body><h1>Review Before Sending</h1><p><strong>No emails have been sent.</strong> Check both lists, then choose Yes or No below.</p>'+ 
    '<section><h2>Vendor Order</h2><p>To: '+escapeHtml_(CONFIG.VENDOR_EMAIL)+'<br><small>Copy: President and Treasurer</small></p><p><strong>Vendor cost: '+money_(vendor.currentCost)+'</strong> · Minimum: '+money_(vendor.minimum)+'</p><div class="scroll"><table><tr><th>Item</th><th>Size</th><th>Color</th><th>Qty</th><th>Unit cost</th><th>Total</th></tr>'+vendorRows+'</table></div>'+(!lines.length?'<p>No vendor items to send.</p>':'')+'<p>In-house products are excluded from this list, the vendor total, and the minimum calculation.</p></section>'+ 
    '<section><h2>In-House Inventory Pull</h2><p>To: '+escapeHtml_(CONFIG.PRESIDENT_EMAIL)+'<br>Copy: '+escapeHtml_(CONFIG.TREASURER_EMAIL)+'</p><div class="scroll"><table><tr><th>Customer</th><th>Order</th><th>Item / Size</th><th>Qty to pull</th><th>Payment</th></tr>'+houseRows+'</table></div>'+(!inHouse.length?'<p>No new in-house pull requests to send.</p>':'')+'<p>This requests a stock pull. It does not mark items pulled, handed out, or paid.</p></section>'+ 
    '<form method="post" action="'+escapeHtml_(ScriptApp.getService().getUrl())+'">'+hidden('action','sendVendorOrder')+hidden('accessToken',token)+hidden('requestId',requestId)+hidden('previewHash',hash)+ 
    (lines.length?'<label><input type="checkbox" name="sendVendor" value="yes" '+(vendor.minimumMet?'checked':'')+'> Send the vendor order'+(!vendor.minimumMet?' below its minimum':'')+'</label>':'')+ 
    (!vendor.minimumMet&&lines.length?'<p class="warning">Vendor is below minimum. Leave the box unchecked to send only the in-house request. To include the vendor, check the box and provide the override reason and password.</p><label>Override reason<input type="text" name="overrideReason"></label><label>Override password<input type="password" name="overridePassword" autocomplete="off"></label>':'')+ 
    '<button type="submit">Yes — Send</button><button type="button" onclick="document.body.innerHTML=\'<h1>Not sent</h1><p>No emails were sent. You can close this tab.</p>\';if(window.opener)window.opener.postMessage({type:\'bssc-marketplace-vendor-order-result\',requestId:'+escapeHtml_(JSON.stringify(requestId))+',success:false,message:\'Cancelled. No emails were sent.\'},\'*\');">No — Do Not Send</button></form><script>document.querySelector("form").addEventListener("submit",function(){this.querySelectorAll("button").forEach(function(b){b.disabled=true});});</script></body></html>';
  return HtmlService.createHtmlOutput(html).setTitle('Review Marketplace Fulfillment');
}
