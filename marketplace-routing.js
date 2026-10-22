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


/* Keep each customer's separate orders together without changing fulfillment records. */
(() => {
  const originalRender=renderMerchandiseReceiving;
  const normalize=value=>String(value||'').trim().toLocaleLowerCase().replace(/\s+/g,' ');
  const nameTokens=value=>normalize(value).split(' ').sort().join(' ');
  const dateValue=value=>{
    if(typeof value==='number')return new Date((value-25569)*86400000);
    return new Date(value);
  };
  const style=document.createElement('style');
  style.textContent='.receive-customer-group{margin:24px 0;border:1px solid #bfc2c6;border-radius:14px;overflow:hidden;background:#f6f6f6}.receive-customer-heading{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px 20px;background:#171717;color:#fff;border-left:5px solid #c8102e}.receive-customer-heading h3{margin:0;color:#fff;font-size:1.2rem}.receive-customer-heading span{color:#eee;font-size:.9rem}.receive-customer-orders{padding:0 12px}.receive-customer-orders .receive-order{margin:12px 0}';
  document.head.append(style);
  function groupCustomerOrders(){
    const target=document.getElementById('marketReceiving');if(!target)return;
    const cards=[...target.querySelectorAll(':scope > .receive-order')];if(!cards.length)return;
    const orders=merchandiseOrders.slice(1).filter(row=>row[1]&&row[4]);
    const byId=new Map(orders.map(row=>[String(row[1]),row]));
    const groups=new Map();
    cards.forEach(card=>{
      const id=card.querySelector('[data-manage-order]')?.dataset.order;
      const row=byId.get(id);const name=String(row?.[4]||card.querySelector('h3')?.textContent||'Unknown customer').trim();
      // A shared contact plus reversed name identifies the same customer (e.g. Russell Burghard).
      const alias=row?orders.find(other=>nameTokens(other[4])===nameTokens(name)&&(
        (normalize(row[5])&&normalize(row[5])===normalize(other[5]))||
        (String(row[6]||'').replace(/\D/g,'')&&String(row[6]).replace(/\D/g,'')===String(other[6]||'').replace(/\D/g,'')))):null;
      const key=normalize(alias?.[4]||name);
      if(!groups.has(key))groups.set(key,{name:String(alias?.[4]||name),orders:[]});
      groups.get(key).orders.push({card,row,id});
    });
    [...groups.values()].sort((a,b)=>a.name.localeCompare(b.name,undefined,{sensitivity:'base'})).forEach(group=>{
      const section=document.createElement('section');section.className='receive-customer-group';
      const header=document.createElement('header');header.className='receive-customer-heading';
      const heading=document.createElement('h3');heading.textContent=group.name;
      const count=document.createElement('span');count.textContent=group.orders.length+' '+(group.orders.length===1?'order':'orders')+' shown';
      header.append(heading,count);section.append(header);
      const body=document.createElement('div');body.className='receive-customer-orders';
      group.orders.sort((a,b)=>(dateValue(a.row?.[0]).getTime()||0)-(dateValue(b.row?.[0]).getTime()||0)||String(a.id).localeCompare(String(b.id))).forEach(({card,row,id})=>{
        const title=card.querySelector('h3'),date=dateValue(row?.[0]);
        if(title)title.textContent=Number.isNaN(date.getTime())?'Order '+id:'Ordered '+date.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
        body.append(card);
      });
      section.append(body);target.append(section);
    });
  }
  renderMerchandiseReceiving=function(...args){const result=originalRender.apply(this,args);groupCustomerOrders();return result;};
  groupCustomerOrders();
})();
