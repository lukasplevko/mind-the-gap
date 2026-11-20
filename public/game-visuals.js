import {services,liveService,isCancelled} from './mission-logic.js';
export function staffPortrait(){return `<svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="59" fill="#d8e5cb"/><path d="M16 120V104Q22 78 60 78Q98 78 104 104V120Z" fill="#234f46"/><path d="M50 70H70V87L60 98 50 87Z" fill="#d7a37d"/><ellipse cx="60" cy="49" rx="26" ry="31" fill="#e4b48e"/><path d="M34 49V37Q34 13 60 14Q88 13 86 41L84 50 77 31Q56 43 36 35Z" fill="#4c433a"/><path d="M30 34Q30 12 60 10Q90 12 90 34L83 40H37Z" fill="#17364d"/><path d="M32 32h56v6H32z" fill="#dda748"/><path d="M35 38h51q-6 11-27 11t-24-11" fill="#142b3c"/><circle cx="60" cy="24" r="4" fill="#ffe4a1"/><circle cx="50" cy="53" r="2" fill="#403c33"/><circle cx="70" cy="53" r="2" fill="#403c33"/><path d="M53 64Q60 69 67 64" fill="none" stroke="#865e48" stroke-width="2" stroke-linecap="round"/><path d="M45 82L60 98 51 106 38 88M75 82L60 98 69 106 82 88" fill="#f5f2e7"/><path d="M60 99V120" stroke="#e7b579" stroke-width="4"/><rect x="77" y="100" width="19" height="11" rx="2" fill="#f5e2b5"/><path d="M80 104H92M80 107H88" stroke="#60705e"/></svg>`}
export const crew=[
 {id:'jordan',name:'Terézia',color:'#d0debd',shirt:'#e9adac',skin:'#eeb691',hair:'#855735',symbol:'clock',need:'McDonald’s in Reading',quote:'Can we stop at McDonald’s on Friar Street in Reading? I’d like 15 minutes for food.'},
 {id:'sam',name:'Natália',color:'#d6d0e5',shirt:'#6786a7',skin:'#f1c4ac',hair:'#c7944f',symbol:'clock',need:'London by 20:00',quote:'Ms Taylor is waiting at London Paddington’s information desk by 20:00. I’d feel better arriving early.'},
 {id:'alex',name:'Laura',color:'#e8d4ac',shirt:'#eedfdc',skin:'#e8b499',hair:'#3d2e2a',symbol:'wallet',need:'Keep a reserve',quote:'We have £120 for all four of us. Let’s keep £12 for emergencies — that leaves £108 for travel.'},
 {id:'mia',name:'Alena',color:'#c4d7db',shirt:'#2d3039',skin:'#edba98',hair:'#654737',symbol:'access',need:'Step-free + 15 min',quote:'I’m using crutches. I need a step-free route and at least 15 minutes to change services.'}
];
export function icon(name){const paths={clock:'<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>',wallet:'<path d="M3 7h17v14H3zM3 7V4h14v3M15 11h7v6h-7z"/><circle cx="18" cy="14" r=".7"/>',group:'<circle cx="8" cy="7" r="3"/><circle cx="18" cy="8" r="2"/><path d="M2 21v-5a6 6 0 0 1 12 0v5M15 13a5 5 0 0 1 8 4v4"/>',access:'<circle cx="12" cy="4" r="2"/><path d="M11 8v7h7l3 6M11 11h7M9 11a6 6 0 1 0 7 9"/>',pin:'<path d="M12 22s8-8 8-13A8 8 0 0 0 4 9c0 5 8 13 8 13Z"/><circle cx="12" cy="9" r="3"/>',train:'<rect x="4" y="2" width="16" height="17" rx="4"/><path d="M5 10h14M12 2v8M7 19l-2 4M17 19l2 4"/><circle cx="8" cy="15" r="1"/><circle cx="16" cy="15" r="1"/>',chat:'<path d="M3 3h18v14H9l-6 5Z"/><path d="M7 8h10M7 12h7"/>',check:'<path d="M4 12l5 5L21 4"/>',alert:'<path d="M12 2L1 22h22Z"/><path d="M12 8v6M12 18v1"/>',send:'<path d="M2 3l21 9-21 9 4-9Z M6 12h17"/>'};return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]||paths.chat}</svg>`}
const cartoonDetails={
 jordan:{
  back:'M32 31Q24 39 26 54T22 76Q20 88 29 96Q33 102 42 94L76 95Q89 105 96 94Q103 85 94 75T93 49Q93 28 79 21Z',
  fringe:'M29 55Q23 33 39 19Q49 11 61 16Q80 12 90 29Q100 45 87 65L83 48Q74 44 71 33Q60 42 42 42L36 55Z',
  extras:'<path d="M48 83l-9 10 12 5 9-10 9 10 12-5-9-10" fill="#f9ceca"/><path d="M57 91q3-3 5 0 4-3 4 1 0 3-5 6-6-4-4-7" fill="#fff7d9"/><path d="M43 55h1m3 3h1m3-4h1m16 0h1m3 3h1m4-2h1" stroke="#9b694d" stroke-width="1.5" stroke-linecap="round"/>',
 },
 sam:{
  back:'M33 31Q33 15 60 13Q86 13 90 34L96 98Q88 107 75 100L44 100Q28 105 25 97Z',
  fringe:'M30 56Q27 32 37 22Q47 11 63 16Q80 12 89 26Q96 38 88 56Q82 42 78 29Q58 34 39 58L32 72Z',
  extras:'<path d="M83 40l8 54m-56-36l-4 35" stroke="#eab66d" stroke-width="3" stroke-linecap="round"/><path d="M48 88q12 12 24 0" fill="none" stroke="#c0d4e3" stroke-width="2"/>',
 },
 alex:{
  back:'M31 33Q32 15 60 13Q88 14 90 39L94 103H26Z',
  fringe:'M31 64Q23 36 35 23Q45 12 60 15Q77 12 86 25Q98 39 87 61L81 49Q74 32 60 26Q45 36 36 63L29 89Z',
  extras:'<path d="M35 75l-3 20m52-22l4 23" stroke="#60443a" stroke-width="2.5" stroke-linecap="round"/><path d="M34 101h.1m10 9h.1m29-10h.1m13 8h.1" stroke="#b96e7c" stroke-width="6" stroke-linecap="round"/><circle cx="60" cy="97" r="3" fill="#b0504c"/>',
 },
 mia:{
  back:'M37 27Q43 12 63 15Q84 16 88 40L86 79Q79 89 70 83H45Q29 81 31 65Z',
  fringe:'M31 52Q27 36 39 23Q49 13 61 16Q83 12 89 36L86 53Q79 36 61 26Q49 31 34 53Z',
  extras:'<path d="M49 83q11 7 22 0l3 11q-14 6-28 0z" fill="#2d3039"/><circle cx="35" cy="61" r="2" fill="#eeca7e"/><circle cx="85" cy="61" r="2" fill="#eeca7e"/>',
 },
};
export function portrait(id){
 if(id==='casey')return staffPortrait();
 if(id==='you')return bearIcon(true);
 const person=crew.find(friend=>friend.id===id);
 if(!person)return '';
 const {back,fringe,extras}=cartoonDetails[id];
 return `<svg viewBox="0 0 120 120" aria-hidden="true">
  <circle cx="60" cy="60" r="60" fill="${person.color}"/>
  <path d="${back}" fill="${person.hair}"/>
  <path d="M16 120v-13q5-24 44-25 39 1 44 25v13" fill="${person.shirt}"/>
  <path d="M51 70h18v16q-9 9-18 0Z" fill="${person.skin}"/>
  <ellipse cx="60" cy="49" rx="25" ry="31" fill="${person.skin}"/>
  <path d="${fringe}" fill="${person.hair}"/>
  <path d="M44 45q5-3 10 0m12 0q5-3 10 0" fill="none" stroke="${person.hair}" stroke-width="2" stroke-linecap="round"/>
  <ellipse cx="50" cy="50" rx="2" ry="2.6" fill="#3d302b"/><ellipse cx="70" cy="50" rx="2" ry="2.6" fill="#3d302b"/>
  <ellipse cx="44" cy="59" rx="4" ry="2" fill="#dc8e85" opacity=".5"/><ellipse cx="76" cy="59" rx="4" ry="2" fill="#dc8e85" opacity=".5"/>
  <path d="M55 64q5.5 5 11 0" fill="none" stroke="#a25e52" stroke-width="2" stroke-linecap="round"/>
  ${extras}
 </svg>`;
}
export function stationScene(){return `<div class="station-scene"><svg viewBox="0 0 1000 370" role="img" aria-label="Oxford station at 16:50. Your 17:00 train to London has been cancelled. Four friends wait beside the platform."><defs><linearGradient id="stationSky" x2="0" y2="1"><stop stop-color="#d5e5f7"/><stop offset="1" stop-color="#f5f8fe"/></linearGradient></defs><rect width="1000" height="370" fill="url(#stationSky)"/><circle cx="839" cy="64" r="37" fill="#fff7ef"/><path d="M0 259l1000-58v169H0" fill="#d1dcec"/><path d="M0 317l1000-45M0 330l1000-45" stroke="#899ab4" stroke-width="3"/><path d="M50 285V47h901v183M26 47h952M231 47v215M762 47v185" stroke="#233e67" stroke-width="9" fill="none"/><path d="M50 49l180 59 176-59 179 59 178-59" stroke="#233e67" stroke-width="4" fill="none"/><rect x="312" y="68" width="370" height="110" rx="10" fill="#142a49"/><text x="338" y="102" fill="#dce9fa" font-family="system-ui" font-size="17" letter-spacing="2">17:00  →  LONDON PADDINGTON</text><text x="338" y="146" fill="#ffa7b3" font-family="system-ui" font-size="32" font-weight="700">CANCELLED</text><circle cx="126" cy="101" r="33" fill="#ffffff" stroke="#2b4a70" stroke-width="5"/><path d="M126 79v22l-21 11" stroke="#2b4a70" stroke-width="3" fill="none"/><path d="M590 252v-33q0-20 26-20h308q34 0 42 27l7 26Z" fill="#f5f7fd" stroke="#6d83a0" stroke-width="2"/><path d="M608 213h320l12 19H608Z" fill="#557097"/><path d="M590 241h378" stroke="#c7374e" stroke-width="5"/>${[650,917].map(x=>`<circle cx="${x}" cy="254" r="10" fill="#263f67"/>`).join('')}<rect x="55" y="190" width="140" height="42" rx="5" fill="#ffffff"/><text x="69" y="216" font-family="system-ui" font-size="16" fill="#2b4a70">OXFORD</text><path d="M55 232v44M195 232v38" stroke="#2b4a70" stroke-width="5"/>${crew.map((p,i)=>{const x=235+i*65;return `<g transform="translate(${x},234)"><path d="M-15 67V24Q-13 5 0 5Q13 5 15 24v43" fill="${p.shirt}"/><circle cy="-9" r="14" fill="${p.skin}"/><path d="M-14-10v-7q14-18 28 0v8q-14-2-20-9Z" fill="${p.hair}"/><path d="M-7 63v28M7 63v28" stroke="#293b59" stroke-width="7"/>${p.id==='mia'?'<path d="M22 20l7 71M20 28h12" stroke="#7e8da5" stroke-width="4"/>':''}</g>`}).join('')}<rect x="525" y="278" width="25" height="40" rx="5" fill="#9f5563"/><path d="M530 279v-9h15v9" stroke="#9f5563" stroke-width="4" fill="none"/></svg><div class="scene-stamp">${icon('pin')} OXFORD <span>16:50</span></div></div>`}
export function routeMap(ids,event){
 const chosen=ids.map(id=>services.find(x=>x.id===id)).filter(Boolean);
 const cancelled=services.filter(service=>isCancelled(service.id,event));
 const edges=[['Oxford','Reading',74,108,310,108],['Reading','London Paddington',310,108,546,108]];
 return `<div class="network-map"><svg viewBox="0 0 620 166" role="img" aria-label="Oxford, Reading and London Paddington. ${cancelled.map(l=>l.id+' is cancelled.').join(' ')}">${edges.map(([from,to,x,y,a,b])=>{const selected=chosen.some(l=>l.from===from&&l.to===to),blocked=chosen.some(l=>l.from===from&&l.to===to&&isCancelled(l.id,event));return `<path d="M${x} ${y}L${a} ${b}" fill="none" stroke="${blocked?'#bc3a50':selected?'#315b9c':'#ccd7ea'}" stroke-width="5" ${blocked?'stroke-dasharray="8 6"':''}/>`}).join('')}${[[74,108,'OXFORD'],[310,108,'READING'],[546,108,'PADDINGTON']].map(([x,y,label])=>`<circle cx="${x}" cy="${y}" r="11" fill="#ffffff" stroke="#2e4c80" stroke-width="3"/><text x="${x}" y="${y+29}" text-anchor="middle" font-family="system-ui" font-size="11" font-weight="700" fill="#2b4777">${label}</text>`).join('')}<rect x="39" y="57" width="82" height="25" rx="12" fill="#233e67"/><text x="80" y="74" text-anchor="middle" fill="#f0f5ff" font-size="10" font-family="system-ui">YOU ARE HERE</text></svg><div class="map-place">${paddingtonStop()}</div><span class="map-note">Your group is still at Oxford. ${cancelled.length?'Only '+cancelled.map(l=>l.id).join(', ')+' is cancelled; other services still run.':''}</span>${ids.length?'<div class="map-itinerary">'+chosen.map(base=>{const l=liveService(base,event);return `<span class="${isCancelled(l.id,event)?'cancelled-label':''}"><b>${l.id}${isCancelled(l.id,event)?' · CANCELLED':''}</b> ${l.from} ${l.departure} → ${l.to} ${l.arrival}</span>`}).join('')+'</div>':''}</div>`
}

function bearIcon(avatar=false,pose){
 return `<svg ${avatar?'viewBox="0 0 90 90"':'viewBox="0 0 84 90"'} aria-hidden="true">
  ${avatar?'<circle cx="45" cy="45" r="45" fill="#dce9fa"/><g transform="translate(8 5) scale(.87)">':''}
   <g stroke="#634430" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
    <path d="${pose?'M25 82l-3 5h15l2-5m7 0 3 5h15l-4-6':'M14 67q-8-7-12-2-3 5 9 10l8 2m6 5-3 5h15l2-5m7 0 3 5h15l-4-6'}" fill="#ad7951"/>
    <path d="M17 72q5-14 25-14 18 0 24 14l4 11q-28 6-56-1Z" fill="#366b9a"/>
    <path d="M29 62l13 9 13-9m-13 9v13" fill="none" stroke="#244c76"/>
    <circle cx="23" cy="38" r="9" fill="#ad7951"/><circle cx="61" cy="38" r="9" fill="#ad7951"/>
    <path d="M19 47q1-18 23-18t24 18q-2 15-24 16-23-1-23-16Z" fill="#bb885c"/>
    <path d="M29 52q3-8 13-7 11 0 13 7-1 8-13 8-12 0-13-8Z" fill="#edc393" stroke="none"/>
    <path d="${pose==='thinking'?'M36 44h.1m16 0h.1':'M34 45h.1m16 0h.1'}" stroke="#302a28" stroke-width="3"/>
    <path d="M39 51q3-2 6 0-2 4-3 4t-3-4Z" fill="#302a28" stroke="none"/>
    <path d="${pose==='thinking'?'M38 56q3-2 8-1':'M37 56q5 4 10-1'}" fill="none"/>
    <path d="M15 35q9-4 14-19 5-10 17-8 8 1 11 9l6 11 11 3q5 3-1 7-8 4-21-2-13-7-28 2-13 5-14 0Z" fill="#b74541" stroke="#763b34"/>
    <path d="M28 28q14-8 30 0" fill="none" stroke="#863b38"/>
    <path d="M36 73h11m-11 6h11" stroke="#f0ce8a" stroke-width="2.6"/>
    ${pose==='thinking'?'<path d="M56 66l-5-8-5 2 4 13" fill="#366b9a"/><ellipse cx="47" cy="58" rx="4" ry="4.5" fill="#bb885c"/>':''}
    ${pose==='clapping'?`<g class="bear-paw bear-paw-left"><path d="M23 70l11-6 4 7-10 7z" fill="#366b9a"/><ellipse cx="37" cy="67" rx="5" ry="6" fill="#bb885c"/></g>
    <g class="bear-paw bear-paw-right"><path d="M62 70l-11-6-4 7 10 7z" fill="#366b9a"/><ellipse cx="48" cy="67" rx="5" ry="6" fill="#bb885c"/></g>
    <path class="bear-clap-lines" d="M70 53l6-3m-4 9 7 1m-65-7-6-3m4 9-7 1" fill="none" stroke="#aa2841" stroke-width="2"/>`:''}
   </g>
  ${avatar?'</g>':''}
 </svg>`;
}
export function paddingtonThinking(){
 return `<div class="bear-thought">${bearIcon(false,'thinking')}<span>Hmm… which route?</span></div>`;
}
export function paddingtonApplause(){
 return `<div class="bear-applause" role="img" aria-label="Paddington claps for you.">${bearIcon(false,'clapping')}</div>`;
}
export function paddingtonStop(){
 return `<button type="button" class="paddington-stop" data-action="paddington">
  London Paddington
  <span class="station-bear">${bearIcon()}</span>
 </button>`;
}
export function landmarks(){
 return `<div class="sight-cards"><figure><svg viewBox="0 0 150 82" aria-hidden="true"><path d="M16 72h118M36 72V31h78v41M29 31h92M39 27Q75-14 111 27M75 9V2M30 49h90M53 72V55m22 17V55m22 17V55M52 45V35m23 10V35m23 10V35"/></svg><figcaption>Radcliffe Camera · Oxford</figcaption></figure><figure><svg viewBox="0 0 150 82" aria-hidden="true"><path d="M12 72h126M24 72V25h38v47M20 25h46M29 25V14h28v11M35 14V7m15 7V7M62 72V40h65v32M62 40l32-20 33 20M40 72V57h7v15m30-21h9m9 0h9m9 0h9"/></svg><figcaption>Bodleian Library · Oxford</figcaption></figure><figure><svg viewBox="0 0 150 82" aria-hidden="true"><circle cx="75" cy="41" r="26"/><path d="M32 36h86v10H32zM18 75h114"/></svg><figcaption>Piccadilly Circus · London</figcaption></figure></div>`;
}
