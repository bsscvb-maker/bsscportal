/* Review first. This request only opens a server-rendered preview; Yes is required to send. */
(() => {
  submitMarketplaceVendorOrder = function(){
    const button=document.getElementById('marketplaceSendVendorOrder');
    if(!accessToken){alert('Sign in as President or Treasurer first.');return;}
    const target='bsscVendorOrder_'+Date.now(),popup=window.open('about:blank',target);
    if(!popup){alert('Allow pop-ups to review the two fulfillment lists.');return;}
    const requestId='vendor-order-'+Date.now()+'-'+Math.random().toString(36).slice(2);
    const form=document.createElement('form');form.method='POST';form.action=MARKETPLACE_AUTOMATION_URL;form.target=target;form.hidden=true;
    [['action','previewFulfillment'],['accessToken',accessToken],['requestId',requestId]].forEach(([name,value])=>{const input=document.createElement('input');input.type='hidden';input.name=name;input.value=value;form.append(input);});
    marketplaceVendorOrderPopup=popup;marketplaceVendorOrderRequestId=requestId;
    document.body.append(form);form.submit();form.remove();
    const note=document.querySelector('.market-vendor-action-note');if(note)note.textContent='Review both lists in the new tab. Nothing sends until you choose Yes — Send.';
  };
  const host=document.getElementById('marketDashboard');
  function label(){
    const note=host?.querySelector('.market-vendor-action-note');
    if(note&&!note.dataset.routing){note.dataset.routing='true';note.textContent='Review first: vendor-made items go to the vendor; in-house items go to President and Treasurer. In-house items do not count toward the vendor total or minimum.';}
    const button=host?.querySelector('#marketplaceSendVendorOrder');
    if(button?.textContent==='Vendor Order Sent')button.textContent='Fulfillment Requests Sent';
  }
  if(host)new MutationObserver(label).observe(host,{childList:true,subtree:true});label();
})();
