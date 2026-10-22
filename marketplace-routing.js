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


/* Show the customers behind dashboard merchandise and color totals. */
(() => {
  const original=renderMarketplaceDashboard;
  const popup=document.createElement('div');
  popup.id='marketOrderCustomers';popup.role='tooltip';popup.hidden=true;
  const style=document.createElement('style');
  style.textContent='#marketOrderCustomers{position:fixed;z-index:10000;width:290px;max-width:calc(100vw - 24px);max-height:300px;overflow:auto;background:#171717;color:white;border:1px solid #777;border-top:3px solid #c8102e;border-radius:9px;padding:13px 15px;box-shadow:0 6px 24px #0006;font:14px/1.45 Arial}#marketOrderCustomers[hidden]{display:none}#marketOrderCustomers strong{display:block;margin-bottom:7px}#marketOrderCustomers ul{margin:0;padding-left:19px}#marketOrderCustomers li{margin:5px 0}.market-insight-row[data-customer-breakdown]{cursor:help}.market-insight-row[data-customer-breakdown]:focus-visible{outline:2px solid #256b9a;outline-offset:3px}';
  document.head.append(style);document.body.append(popup);
  let active=null,hideTimer;
  const hide=()=>{popup.hidden=true;if(active)active.removeAttribute('aria-describedby');active=null;};
  const scheduleHide=()=>{clearTimeout(hideTimer);hideTimer=setTimeout(hide,160);};
  popup.addEventListener('mouseenter',()=>clearTimeout(hideTimer));
  popup.addEventListener('mouseleave',scheduleHide);
  document.addEventListener('keydown',event=>{if(event.key==='Escape')hide();});
  document.addEventListener('click',event=>{if(active&&!active.contains(event.target)&&!popup.contains(event.target))hide();});
  window.addEventListener('resize',hide);
  renderMarketplaceDashboard=function(rows,ordersRows=[],salesRows=[],financialRows=[],period='all'){
    hide();
    const result=original.apply(this,arguments);
    const end=new Date();end.setHours(23,59,59,999);
    const start=new Date(end);start.setHours(0,0,0,0);
    if(period==='year')start.setMonth(0,1);
    if(period==='month')start.setDate(1);
    if(period==='90')start.setDate(start.getDate()-89);
    const orders=new Map(ordersRows.slice(1).filter(r=>{
      if(!r[1]||!r[4])return false;
      if(period==='all')return true;
      const date=new Date(String(r[0]||'').trim());
      return !Number.isNaN(date.getTime())&&date>=start&&date<=end;
    }).map(r=>[String(r[1]).trim(),r]));
    const products=new Map(),colors=new Map();
    const add=(map,key,name,qty)=>{
      if(!map.has(key))map.set(key,new Map());
      const names=map.get(key);names.set(name,(names.get(name)||0)+qty);
    };
    salesRows.slice(6).forEach(r=>{
      const order=orders.get(String(r[1]||'').trim());
      const item=String(r[2]||'').trim(),qty=Number(String(r[3]||'').replace(/,/g,''))||0;
      if(!order||!item||qty<=0)return;
      const product=item.replace(/\s*\([^()]*\)\s*$/,'').trim();
      const details=(item.match(/\(([^()]*)\)\s*$/)?.[1]||'').split(',').map(v=>v.trim());
      add(products,product,String(order[4]).trim(),qty);
      if(details.length>1)add(colors,details.slice(1).join(', '),String(order[4]).trim(),qty);
    });
    const host=document.getElementById('marketDashboard');
    host?.querySelectorAll('.market-action-card').forEach(card=>{
      const title=card.querySelector('h3')?.textContent;
      const map=title==='Top-Selling Merchandise'?products:title==='Top-Selling Colors'?colors:null;
      if(!map)return;
      card.querySelectorAll('.market-insight-row').forEach(row=>{
        const label=row.querySelector('span')?.textContent||'',names=map.get(label);
        if(!names?.size)return;
        row.dataset.customerBreakdown='true';row.tabIndex=0;
        row.setAttribute('aria-label',label+' — show who ordered');
        const show=()=>{
          clearTimeout(hideTimer);hide();active=row;row.setAttribute('aria-describedby',popup.id);
          const heading=document.createElement('strong');heading.textContent=label;
          const list=document.createElement('ul');
          [...names].sort((a,b)=>a[0].localeCompare(b[0])).forEach(([name,qty])=>{
            const li=document.createElement('li');li.textContent=name+' — '+qty;list.append(li);
          });
          popup.replaceChildren(heading,list);popup.hidden=false;
          const box=row.getBoundingClientRect(),width=popup.offsetWidth,height=popup.offsetHeight;
          let left=box.right+10;if(left+width>innerWidth-12)left=box.left-width-10;
          popup.style.left=Math.max(12,Math.min(left,innerWidth-width-12))+'px';
          popup.style.top=Math.max(12,Math.min(box.top,innerHeight-height-12))+'px';
        };
        row.addEventListener('mouseenter',show);row.addEventListener('mouseleave',scheduleHide);
        row.addEventListener('focus',show);row.addEventListener('blur',scheduleHide);
        row.addEventListener('click',show);
        row.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();show();}});
      });
    });
    return result;
  };
})();
