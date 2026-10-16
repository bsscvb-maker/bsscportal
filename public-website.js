/* BoneShakers public website content. Update values and events here once for all connected pages. */
(function(){
"use strict";
var d={lifetime:"$443,898.20",bicycles:"2,100+",since:"2005",bikeCost:"$150",ytd:"$53,076.00",asOf:"October 15, 2026"};
var events=[
{date:"2026-10-17",title:"YMCA Greenbrier Trunk or Treat",time:"Time: see event details",place:"Greenbrier Family YMCA · 1033 Greenbrier Parkway, Chesapeake"},
{date:"2026-10-20",title:"BoneShakers Bike Night",time:"7–9 PM",place:"AJ Gators · 1993 Sandbridge Road, Virginia Beach"},
{date:"2026-10-24",title:"CVMA VA 27-14 Chili Cook Off",time:"11:45 AM–4 PM",place:"Meet-up: Wawa · 720 Woodlake Drive, Chesapeake"},
{date:"2026-10-30",title:"Plan Bee Academy Trunk or Treat",time:"Time: see event details",place:"Plan Bee Academy · 4500 Peek Trail, Chesapeake"},
{date:"2026-11-03",title:"General Meeting",time:"6:30–8:30 PM",place:"AJ Gators · 1993 Sandbridge Road, Virginia Beach"},
{date:"2026-11-11",title:"Veterans Day Parade",time:"Time and staging: see event details",place:"See the event calendar"},
{date:"2026-11-28",title:"PACH Stuff the Ambulance",time:"Time: see event details",place:"See the event calendar"},
{date:"2026-12-01",title:"General Meeting",time:"6:30–8:30 PM",place:"AJ Gators · 1993 Sandbridge Road, Virginia Beach"},
{date:"2026-12-05",title:"VB Holiday Parade",time:"3–8 PM",place:"See the event calendar"}
];
document.querySelectorAll("[data-bssc-metric]").forEach(function(el){var v=d[el.dataset.bsscMetric];if(v)el.textContent=v;});
var today=new Intl.DateTimeFormat("en-CA",{timeZone:"America/New_York",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
document.querySelectorAll("[data-bssc-events]").forEach(function(el){
var n=Number(el.dataset.bsscEvents)||3;
var list=events.filter(function(e){return e.date>=today;}).slice(0,n);
if(!list.length){el.innerHTML='<p>Visit our event calendar for the latest rides and opportunities.</p>';return;}
el.innerHTML=list.map(function(e){var dt=new Date(e.date+"T12:00:00");return '<article class="tile"><p class="event-date">'+dt.toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})+'</p><h3>'+e.title+'</h3><p>'+e.time+'</p><p class="muted">'+e.place+'</p><a class="btn secondary" target="_top" href="https://boneshakerssocialclub.com/event-calendar">Event details</a></article>';}).join("");
});
})();