import {reviewPanel,languageSummary,languagePortfolio} from './language-review.js';
import {services,timetableSource,words,minute,evaluateRoute,eventFor,liveService,isCancelled} from './mission-logic.js';
import {crew,portrait,icon,stationScene,routeMap,paddingtonThinking,paddingtonApplause} from './game-visuals.js';
import {caseySteps,caseyReply,caseySignals} from './casey-dialogue.js';
const main=document.querySelector('#game'),side=document.querySelector('#side'),hud=document.querySelector('#hud'),modal=document.querySelector('#modal');
const s={stage:0,met:new Set(),activeFriend:null,requests:[],known:new Set(),question:'',updateFields:{},updateSubmitted:false,editing:[],routeName:'',drafts:[],selected:0,event:null,revised:null,routeFeedback:null,review:null,mode:'solo',startedAt:null,finishedAt:null,stationAt:null,lateStations:new Set()};
const esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const btn=(text,a,cls='primary',extra='')=>`<button class="${cls}" data-action="${a}" ${extra}>${text}</button>`;
const language={busy:false,current:null,history:[],attempts:new Map(),available:null};
const languageKey=()=> 'casey-'+s.requests.length;
const caseyDone=()=>s.requests.length>=caseySteps.length;
const stages=['Station entrance','Meet your friends','Information desk','Route studio','Service alert','Route studio · revised','Group update','Ready to depart','Review'];
const requirementData=[
 ['group','Travel together','Keep all four travellers on the same services.'],
 ['clock','Paddington by 20:00','Arrive at London Paddington’s information desk by 20:00.'],
 ['access','Step-free access','Alena needs step-free access at every station.'],
 ['pin','McDonald’s in Reading','Terézia wants to stop at McDonald’s on Friar Street near Reading station.'],
 ['clock','At least 30 min in Reading','Allow 15 minutes to change trains and 15 more to get to McDonald’s and pick up food.'],
 ['wallet','£108 ticket budget','Spend no more than £108 on tickets for four and keep £12 for emergencies.'],
];
function show(title,html){document.querySelector('#modal-title').textContent=title;document.querySelector('#modal-body').innerHTML=html;if(!modal.open)modal.showModal()}
let screenScrollFrame;
function scrollToStart(){
 window.scrollTo(0,0);
 if(document.scrollingElement)document.scrollingElement.scrollTop=0;
}
function go(stage){
 if(s.stationAt&&Date.now()-s.stationAt>180000)s.lateStations.add(s.stage);
 s.stationAt=Date.now();
 s.stage=stage;
 document.activeElement?.blur();
 render();
 main.focus({preventScroll:true});
 scrollToStart();
 // The new screen and any keyboard dismissal can move the page during layout.
 cancelAnimationFrame(screenScrollFrame);
 screenScrollFrame=requestAnimationFrame(()=>{
  scrollToStart();
  screenScrollFrame=requestAnimationFrame(scrollToStart);
 });
}
function screenPaddington(){
 return `<div class="screen-paddington" role="img" aria-label="Paddington Bear">${portrait('you')}</div>`;
}
function bubble(who,text,{outgoing=false,html=false}={}){const name=who==='you'?'You · Paddington':who==='casey'?'Casey · Station staff':who==='teacher'?'Ms Taylor':crew.find(p=>p.id===who)?.name||who;return `<div class="conversation-line ${outgoing?'outgoing':''}"><div class="chat-avatar">${portrait(who==='teacher'?'casey':who)}</div><div class="speech"><span class="speaker">${name}</span><div>${html?text:esc(text)}</div></div></div>`}
function requirementsTiles({compact=false}={}){
 return `<div class="requirement-tiles ${compact?'compact':''}">${requirementData.map(([i,t,desc])=>`<button class="requirement-tile" data-action="requirements" aria-label="${esc(t+': '+desc)}">${icon(i)}<span><strong>${t}</strong>${compact?'':`<small>${desc}</small>`}</span></button>`).join('')}</div>`;
}
function routeChecklist(ids){
 const route=evaluateRoute(ids,s.event);
 const legs=route.legs||[];
 const complete=legs.length>1&&legs.at(-1).to==='London Paddington';
 const minimumSeats=legs.length?Math.min(...legs.map(leg=>leg.seats)):0;
 const stopsInReading=legs.some(leg=>leg.to==='Reading');
 const checks=[
  [legs.length?minimumSeats>=4:null,legs.length?`${minimumSeats} seats on the train with the fewest available.`:'Select a train to check seats.'],
  [complete?minute(route.arrival)<=1200:null,complete?`Scheduled arrival ${route.arrival}.`:'Add a connection to check the arrival time.'],
  [legs.length?legs.every(leg=>leg.stepFree):null,legs.length?(legs.every(leg=>leg.stepFree)?'All selected trains have step-free access.':'A selected train does not have step-free access.'):'Select a train to check access.'],
  [stopsInReading?true:complete?false:null,stopsInReading?'Your route stops in Reading, near McDonald’s.':'Choose a route that stops in Reading.'],
  [complete?route.transfer>=30:null,complete?`${route.transfer} min in Reading · 30 min needed.`:'Add a connection to check the time in Reading.'],
  [legs.length?route.total<=108:null,legs.length?`£${route.total} in tickets · £${route.remaining} left.`:'Select a train to check the ticket cost.'],
 ];
 return `<ul class="route-checklist">${checks.map(([met,detail],i)=>{
  const status=met===null?'Pending':met?(complete?'Met':'Met so far'):'Not met';
  return `<li class="${met===false?'route-check-failed':''}"><div><b>${requirementData[i][1]}</b><small>${detail}</small></div><span>${met===null?'○':met?'✓':'✕'} ${status}</span></li>`;
 }).join('')}</ul>`;
}
function teamRail(){return `<div class="side-heading">YOUR CREW ${btn('View all','group','text-button')}</div><div class="crew-rail">${crew.map(p=>`<button class="crew-mini" data-action="friend-details" data-id="${p.id}"><div class="mini-portrait">${portrait(p.id)}</div><b>${p.name}</b></button>`).join('')}</div>`}
function journeyBrief(){
 return `<dl class="journey-brief">
  <div><dt>From</dt><dd>Oxford station</dd></div>
  <div><dt>To</dt><dd>Information desk at London Paddington</dd></div>
  <div><dt>Cancelled</dt><dd>17:00 train from Oxford to London Paddington</dd></div>

 </dl>`;
}
function missionSteps(){const phase=s.stage<2?0:s.stage===2?1:s.stage<6?2:3;return `<nav class="mission-steps" aria-label="Mission progress">${[['pin','Station'],['chat','Casey'],['train','Plan'],['check','Group update']].map(([ic,t],i)=>`<div class="${i===phase?'here':i<phase?'done':''}" ${i===phase?'aria-current="step"':''}><span>${icon(i<phase?'check':ic)}</span><b>${t}</b></div>`).join('')}</nav>`}
function renderHUD(){hud.innerHTML=`<div class="hud-inner"><span class="location">${icon('pin')}<span><small>${s.stage===8?'MISSION COMPLETE':`STEP ${s.stage+1}/8 · OXFORD`}</small><b>${stages[s.stage]}</b></span></span><div class="hud-tools"><span class="mission-timer" id="mission-timer">15:00</span>${s.stage>=3?btn('Map + all routes','atlas','hud-button'):''}${(s.stage===8||(s.stage>1&&s.stage<7&&s.stage!==4))?btn('← Back','back','hud-button'):''}${btn(icon('group')+'<span>Friends</span>','group','hud-button')}${btn(icon('check')+'<span>Requirements</span>','requirements','hud-button emphasis',`id="requirements-trigger" aria-haspopup="dialog"`)}</div></div>`}
function composer(){
 const step=caseySteps[s.requests.length];
 return `<section class="compose-section" aria-label="Your message to Casey">
  <div class="casey-turn"><span class="eyebrow">YOUR TURN · ${s.requests.length+1}/4</span>
   <h3>${step.instruction}</h3><p>${step.prompt}</p>
   ${s.requests.length===1?`<div class="casey-journey-brief">${journeyBrief()}</div>`: ''}${step.grammar?`<p class="tense-note">${step.grammar}</p>`:''}
  </div>
  <div class="conversation-line outgoing composer"><div class="chat-avatar">${portrait('you')}</div>
   <div class="speech"><label class="speaker" for="question">YOU (PADDINGTON) → CASEY</label>
    <textarea id="question" maxlength="3000" spellcheck="false" lang="en-GB" placeholder="Write your message in your own words.">${esc(s.question)}</textarea>
    <div class="live-writing-checklist" id="question-checklist">${checklist(s.question)}</div>
    <div class="composer-bottom"><span id="question-count">${words(s.question)} words</span>${btn('Check & send','send','send-button')}</div>
    <p id="question-feedback" role="status"></p>
   </div>
  </div>
 </section>`;
}
function crewCards(){return `<div class="friend-grid">${crew.map(p=>`<button class="friend-card ${s.met.has(p.id)?'met':''}" data-action="meet" data-id="${p.id}"><div class="friend-portrait">${portrait(p.id)}</div><strong>${p.name}</strong><span class="friend-need">${icon(p.symbol)}${p.need}</span><small>${s.met.has(p.id)?'HEARD ✓':'TAP TO TALK'}</small></button>`).join('')}</div>`}
function caseyFacts(keys){const values={seats:[['Group','4 seats needed']],access:[['Route','Step-free access']],times:[['Reading','30 min including McDonald’s']]};return `<div class="casey-facts">${keys.map(k=>`<div class="fact-pair">${(values[k]||[]).map(([a,b])=>`<span><small>${a}</small><b>${b}</b></span>`).join('')}</div>`).join('')}</div>`}

function conversation(){return s.requests.map(r=>bubble('you',r.text,{outgoing:true})+bubble('casey',r.reply)+(r.covered.length?caseyFacts(r.covered):'')).join('')}
function summary(d,{small=false}={}){return `<div class="trip-ticket ${small?'small':''}"><div class="ticket-label">${icon('train')}<b>${esc(d.name)}</b><span>4 TRAVELLERS</span></div><div class="ticket-legs">${d.result.legs.map(l=>`<div><b>${l.id}</b><span>${l.from} → ${l.to}</span><strong>${l.departure}–${l.arrival}</strong></div>`).join('')}</div><div class="ticket-totals"><span>${icon('wallet')}<b>£${d.result.total}</b> total</span><span><b>£${d.result.remaining}</b> left</span><span>${icon('clock')}<b>${d.result.transfer} min</b> waiting at change</span><span><b>${d.result.duration} min</b> whole journey</span></div></div>`}
function draftCards(){return `<div class="draft-grid">${s.drafts.map((d,i)=>`<div class="draft-card ${s.selected===i?'selected':''}">${summary(d,{small:true})}<div class="draft-actions">${btn(s.selected===i?'Selected ✓':'Choose this plan','choose','text-button',`data-id="${i}"`)}${btn('Replace','replace','text-button',`data-id="${i}"`)}</div></div>`).join('')}</div>`}
function usedOxfordTrain(id){
 return s.stage===3&&s.drafts.some(plan=>plan.ids[0]===id);
}
function routeBuilder(revision=false){const event=s.event;const last=s.editing.length?services.find(x=>x.id===s.editing.at(-1)):null,from=last?.to||'Oxford',candidates=services.filter(x=>x.from===from);const selectedLegs=s.editing.map(id=>liveService(services.find(x=>x.id===id),event));const total=s.editing.reduce((v,id)=>v+services.find(x=>x.id===id).fare*4,0);return `<section class="route-workbench">${routeMap(s.editing,event)}<div class="route-strip"><b>Your route</b><div>${s.editing.length?s.editing.map((id,i)=>`<span class="leg-token">${id} · ${selectedLegs[i].from} ${selectedLegs[i].departure} → ${selectedLegs[i].to} ${selectedLegs[i].arrival}${btn(i===0?'Change Oxford train':'Change Reading connection','remove','change-train',`data-id="${i}"`)}</span>`).join('<span class="route-arrow">→</span>'):'<span class="muted">Choose a departure below.</span>'}</div><span class="cost-meter ${total>108?'over-budget':''}">£${120-total} left <small>£${total} spent · £12 protected</small></span>${s.editing.length?btn('Start over','clear-route','text-button'):''}</div><div class="planning-budget">${budgetTimeline(selectedLegs)}${candidates.length?paddingtonThinking():''}</div>${candidates.length?`<div class="board-heading"><h3 id="service-picker" tabindex="-1">${s.editing.length?'Connect from '+from:'Leave Oxford'}</h3><span>FARES PER PERSON</span></div><div class="service-cards">${candidates.map(base=>{const l=liveService(base,event),cancelled=isCancelled(l.id,event),used=usedOxfordTrain(l.id),unavailable=cancelled||used;return `<button class="service-card ${unavailable?'unavailable':''}" data-action="add" data-id="${l.id}" ${unavailable?'disabled':''}><span class="service-code">${icon('train')}${l.id}<small>${l.mode}</small></span><b>${l.to}</b><span class="service-times"><span>Departs ${l.from} <b>${l.departure}</b></span><span>${l.to==='Reading'?'Reading (timetable time)':'Arrives '+l.to} <b>${l.arrival}</b></span></span><span class="service-badges"><span class="${l.seats<4?'badge-warning':''}">${icon('group')}${l.seats} seats</span><span class="${l.stepFree?'':'badge-warning'}">${icon('access')}${l.stepFree?'Step-free':'Step-free boarding unavailable'}</span></span><span class="service-bottom"><b>£${l.fare} each · £${l.fare*4} group</b><small>${cancelled?'CANCELLED':used?'ALREADY IN YOUR OTHER PLAN':'ADD TO ROUTE +'}</small></span></button>`}).join('')}</div>`:'<div class="destination-banner">'+icon('pin')+'<b>Route to London Paddington selected.</b> Review the checklist or use a Change button above to pick a different train.</div>'}<section class="route-checklist-panel" aria-label="Live route checklist"><h3>Live route checklist</h3>${routeChecklist(s.editing)}</section><div class="plan-controls"><span class="auto-plan-name">${revision?'Your revised route':'Plan '+(s.drafts.length+1)}</span>${btn('Check route','check-route','secondary')}${btn(revision?'Save revised plan →':'Save alternative +',revision?'save-revision':'save-draft')}</div>${s.routeFeedback?`<div class="feedback ${s.routeFeedback.ok?'good':''}" role="status">${s.routeFeedback.html}</div>`:''}</section>`}
function eventBrief(){const id=s.event?.cancelled?.[0],l=services.find(x=>x.id===id);return {title:`Your ${l?.departure||''} train from Oxford has been cancelled.`,text:l?`${id}: ${l.from} ${l.departure} → ${l.to} ${l.arrival} will not run. Only ${id} is cancelled. All other services keep their original times, seats and access.`:'Choose a new route from the available services.',icon:'alert'}}

function render(){document.body.classList.toggle('title-screen',s.stage===0);document.body.classList.toggle('story-screen',s.stage===0.5);renderHUD();let html='';
 if(s.stage===0)html=`<div class="cover-title cover-with-bear"><div class="cover-bear" role="img" aria-label="Paddington Bear">${portrait('you')}</div><h1>Mind the gap.<br>Make a plan.</h1></div>${stationScene()}<div class="cover-start">${btn('Start →','start')}</div>`;
 if(s.stage===0.5)html=`<section class="story-card"><h1>A day out. A cancelled train.</h1>
 <p>You’re on a school trip in London. On your day off, you and your friends decide to visit Oxford.</p>
 <p>Your 17:00 train from Oxford to London Paddington has been cancelled. You’re due to meet the rest of your class at London Paddington by <b>20:00</b>.</p>
 <p class="story-question">Find a new route that gets your whole group to the meeting point on time.</p>
 <div class="stage-action">${btn('Meet your group →','begin-mission')}</div></section>`;

 if(s.stage===1)html=`<span class="eyebrow">STATION CAFÉ · YOUR CREW</span><h1>Meet your group.</h1><p class="lead">Before you talk to Casey or choose any trains, tap all four friends to find out what they need on the journey back. You’ll explain their needs to Casey and use them to choose a route that works for everyone.</p>${crewCards()}${s.activeFriend?bubble(s.activeFriend,crew.find(p=>p.id===s.activeFriend).quote):'<div class="talk-prompt">'+icon('chat')+'Choose someone to talk to.</div>'}${s.met.size===4?`<div class="revealed-mission">${requirementsTiles({compact:true})}</div><div class="stage-action">${btn('Visit the information desk →','desk')}</div>`:`<div class="discovery-count">${s.met.size}/4 friends heard</div>`}`;
 if(s.stage===2)html=`<div class="scene-title"><span class="eyebrow">INFORMATION DESK</span><h1>Talk to Casey.</h1><span class="mission-count">${Math.min(4,s.requests.length)}/4 messages</span></div><div class="casey-scene"><div class="casey-portrait">${portrait('casey')}</div><div class="desk-counter"><b>CASEY</b><span>STATION TRAVEL ASSISTANT</span></div><div class="desk-plaque">i · INFORMATION</div></div><div class="dialogue-progress" aria-label="Conversation progress">${caseySteps.map((step,i)=>`<span class="${i<s.requests.length?'done':i===s.requests.length?'current':''}">${i<s.requests.length?'✓':i+1} ${step.label}</span>`).join('')}</div>${bubble('casey','Good afternoon! Welcome to the information desk.')}${conversation()}${caseyDone()?`<div class="stage-action">${btn('Open the route board →','design')}</div>`:composer()}`;

 if(s.stage===3)html=`<div class="scene-title"><div><span class="eyebrow">PLANNING TABLE</span><h1>Make two ways work.</h1></div><span class="mission-count">${s.drafts.length}/2 routes saved</span></div>${s.drafts.length<2?`<p class="lead">${s.drafts.length===0?'Choose a train to Reading and a connecting train to London Paddington. Save your first route.':'Build a second option with a different train from Oxford. Then compare both routes with your group and decide which works best for everyone.'}</p>${routeBuilder()}`:''}${s.drafts.length?draftCards():''}${s.drafts.length===2?`${bubble('sam','Which plan should we choose? I’d like to arrive early.')}${bubble('alex','And I’d like to keep more money aside. What do you think?')}${routeComparison()}<p class="lead">Choose your preferred plan above. Think of one reason for your choice. If you’re playing in pairs, discuss it with your partner.</p><div class="stage-action">${btn('Confirm '+esc(s.drafts[s.selected].name)+' →','confirm-plan')}</div>`:''}`;
 if(s.stage===4){const e=eventBrief();html=`<section class="oh-no-scene"><span class="eyebrow">SIMULATED SERVICE ALERT</span><h1>OH NO!</h1><div class="event-card">${icon('alert')}<div><h2>${e.title}</h2><p>${e.text}</p></div></div>${routeMap(s.drafts[s.selected].ids,s.event)}${bubble('casey','You’re still at Oxford. The first train in your chosen plan has been cancelled. Choose a different train from Oxford or use your other saved plan if it still works. You still have £120.')}<div class="stage-action">${btn('Choose a new route →','revise')}</div></section>`}
 if(s.stage===5){const e=eventBrief();html=`<span class="eyebrow">NEW PLAN · FROM OXFORD</span><h1>Find another way.</h1><div class="event-ribbon">${icon('alert')}<span>${e.text}</span></div>${s.drafts.map((d,i)=>evaluateRoute(d.ids,s.event).ok?btn('Load '+esc(d.name)+' · still running','load','secondary',`data-id="${i}"`):'').join('')}${routeBuilder(true)}`}

 if(s.stage===6)html=groupUpdateActivity();
 if(s.stage===7)html=endingHTML();
 if(s.stage===8)html=reviewHTML();
 main.innerHTML=`${missionSteps()}<section class="screen">${(s.stage===8||(s.stage>0&&s.stage<7))?screenPaddington():''}${html}</section><footer><span>Fictional journey · submitted text is sent to the AI language review when connected</span>${btn('For teachers & sources','teachers','text-button')}</footer>`;
 side.innerHTML=`${s.stage>=3?`<section class="persistent-map"><div class="side-heading">ROUTE MAP ${btn('All options','atlas','text-button')}</div>${routeMap(s.stage>=6?s.revised?.ids||[]:s.stage===3&&s.drafts.length===2?s.drafts[s.selected].ids:s.editing,s.event)}${s.drafts.length?btn('Compare saved plans','atlas','secondary'):''}</section>`:''}${teamRail()}<div class="side-heading">MISSION BOARD ${btn('Open','requirements','text-button')}</div>${journeyBrief()}${s.stage===3||s.stage===5?routeChecklist(s.stage===3&&s.drafts.length===2?s.drafts[s.selected].ids:s.editing):requirementsTiles({compact:true})}${s.known.size?`<div class="side-heading">CASEY’S NOTES</div>${caseyFacts([...s.known].filter(k=>['seats','access'].includes(k)))}`:''}`;
 mountLanguageReview();
 updateClock();
 document.querySelectorAll('[data-action="friend-details"]').forEach(b=>b.setAttribute('aria-haspopup','dialog'));
}
function mountLanguageReview(){
 const area=document.querySelector('.compose-section .speech');
 if(!area)return;
 const notice=document.createElement('p');notice.className='small-note';notice.textContent='Language review checks this message. When connected, your text is sent to the AI language review for feedback. Use only the fictional journey details.';area.append(notice);
 const panel=document.createElement('section');panel.className='language-feedback';panel.setAttribute('aria-live','polite');
 const entry=language.current;
 if(language.busy)panel.innerHTML='<p role="status">Reviewing your message…</p>';
 else if(entry&&entry.key===languageKey()){
 panel.innerHTML=reviewPanel(entry,esc);
 if(!entry.error&&!entry.blocked)panel.innerHTML+=btn('Continue with this message','accept-writing');
 }
 panel.innerHTML+=btn('Continue with teacher review','teacher-review','secondary');
 area.append(panel);
 const send=area.querySelector('[data-action="send"]');if(send){send.disabled=language.busy;send.textContent=entry&&!entry.error?'Check my revision':'Check & send';}
 const field=area.querySelector('textarea');if(field)field.disabled=language.busy;
}
async function reviewWriting(){
 if(language.busy)return;
 if(s.stage!==2||caseyDone())return;
 const text=s.question.trim();if(!text){show('Write your message','<p>Add your own message before sending it.</p>');return;}
 const key=languageKey(),previous=language.attempts.get(key)||[];
 if(previous.at(-1)?.text===text&&previous.at(-1)?.result){language.current=previous.at(-1);render();return;}
 const entry={key,text,attempt:previous.filter(x=>x.result).length+1,label:caseySteps[s.requests.length].instruction};
 language.busy=true;language.current=entry;const start=Date.now();render();
 try{
 const response=await fetch('/api/language-review',{method:'POST',headers:{'Content-Type':'application/json'},signal:AbortSignal.timeout(25000),body:JSON.stringify({step:s.requests.length,text})});
 const data=await response.json();if(!response.ok)throw Error(data.error||'Language review is unavailable. Retry or use teacher review.');
 entry.result=data;entry.blocked=data.corrections.some(c=>c.major);
 language.available=true;
 }catch(error){entry.error=error.name==='TimeoutError'?'Language review timed out. Your message has been kept. Retry or use teacher review.':error.message;}
 finally{
 // Waiting for the service does not consume the pupil's planning time.
 const elapsed=Date.now()-start;if(s.startedAt)s.startedAt+=elapsed;if(s.stationAt)s.stationAt+=elapsed;
 language.busy=false;previous.push(entry);language.attempts.set(key,previous);
 }
 if(s.stage!==2||languageKey()!==key)return;

 render();document.querySelector('.language-feedback')?.scrollIntoView({block:'center',behavior:'smooth'});
}
function acceptWriting(unreviewed){
 let entry=language.current;if(language.busy)return;
 const text=s.question.trim();
 if(!text){show('Write your message','<p>Add your message before continuing.</p>');return;}
 if(unreviewed){
  if(!entry||entry.key!==languageKey()||entry.text!==text){
   entry={key:languageKey(),text,label:caseySteps[s.requests.length].instruction,attempt:1};
   const attempts=language.attempts.get(entry.key)||[];
   attempts.push(entry);language.attempts.set(entry.key,attempts);
  }
 }else{
  if(!entry||languageKey()!==entry.key||text!==entry.text){show('Check your edited message','<p>Your text has changed. Check it again or continue with teacher review.</p>');return;}
  if(!entry.result||entry.blocked)return;
 }
 language.history.push({label:entry.label,finalText:entry.text,attempts:[...(language.attempts.get(entry.key)||[])],accepted:entry,unreviewed});
 language.current=null;sendCasey();
}

function sendCasey(){if(caseyDone())return;if(!s.question.trim()){document.querySelector('#question-feedback').textContent='Write your message before sending.';document.querySelector('#question').focus();return}const step=s.requests.length,reply=caseyReply(step);s.requests.push({text:s.question,reply:reply.text,covered:reply.covered,step});reply.covered.forEach(k=>s.known.add(k));s.question='';render();const target=document.querySelector('.compose-section')||document.querySelector('[data-action="design"]');target?.scrollIntoView({block:'center',behavior:'smooth'});document.querySelector('#question')?.focus({preventScroll:true})}

function requirementsDialog(){
 const planning=s.stage===3||s.stage===5;
 const ids=s.stage===3&&s.drafts.length===2?s.drafts[s.selected].ids:s.editing;
 show('Your mission',`${journeyBrief()}${planning?`<p>These checks update as you choose trains.</p>${routeChecklist(ids)}`:requirementsTiles()}`);
}
function friendDialog(id){const p=crew.find(x=>x.id===id);show(p.name+' · Your crew',`<div class="friend-dialog-portrait">${portrait(id)}</div>${bubble(id,p.quote)}<div class="friend-need big">${icon(p.symbol)}${p.need}</div>`)}
document.querySelector('#close-modal').addEventListener('click',()=>modal.close());modal.addEventListener('click',e=>{if(e.target===modal)modal.close()});
document.addEventListener('input',e=>{
 if(e.target.id!=='question')return;
 s.question=e.target.value;
 document.querySelector('#question-count').textContent=`${words(s.question)} words`;
 document.querySelector('#question-checklist').innerHTML=checklist(s.question);
});
document.addEventListener('change',e=>{
 const field=e.target.dataset.update;
 if(field&&s.stage===6){
  s.updateFields[field]=e.target.value;
  if(s.updateSubmitted){
   s.updateSubmitted=false;
   document.querySelectorAll('.update-hint').forEach(hint=>{hint.innerHTML=''});
   document.querySelector('#update-feedback').textContent='Answers changed. Confirm again to check them.';
   document.querySelector('#update-actions').innerHTML=btn('Confirm answers','check-update');
  }
 }
 if(e.target.id==='play-mode')s.mode=e.target.value;
});
document.addEventListener('click',e=>{const el=e.target.closest('[data-action]');if(!el)return;const a=el.dataset.action;
 if(a==='paddington'){
 const bear=el.querySelector('.station-bear');
 bear.classList.remove('jump');void bear.offsetWidth;bear.classList.add('jump');
 }
 if(a==='start')go(0.5);
 if(a==='begin-mission'){s.startedAt=Date.now();go(1)}
 if(a==='back'&&(s.stage===8||(s.stage>1&&s.stage<7&&s.stage!==4)))go(s.stage-1);
 if(a==='open-review'&&s.stage===7)go(8);
 if(a==='atlas'&&s.stage>=3)show('Map, timetable & your plans',atlasHTML());
 if(a==='meet'){s.met.add(el.dataset.id);s.activeFriend=el.dataset.id;render()}
 if(a==='friend-details')friendDialog(el.dataset.id);
 if(a==='group')show('Your four friends',`<div class="group-dialog">${crew.map(p=>`<div class="group-dialog-person"><div>${portrait(p.id)}</div><span><b>${p.name}</b><small>${p.quote}</small></span></div>`).join('')}</div>`);
 if(a==='requirements')requirementsDialog();
 if(a==='desk'&&s.met.size===4)go(2);
 if(a==='send')reviewWriting();
 if(a==='check-update'&&s.stage===6&&!s.updateSubmitted){
  const questions=updateChoices(s.revised.result);
  if(questions.some(q=>s.updateFields[q.id]===undefined)){
   const feedback=document.querySelector('#update-feedback');
   feedback.textContent='Answer all three questions before checking.';
   feedback.focus();
  }else{
   s.updateSubmitted=true;
   render();
   document.querySelector('#update-feedback')?.focus();
  }
 }
 if(a==='send-update'&&s.stage===6&&s.updateSubmitted&&evaluateRoute(s.revised.ids,s.event).ok&&updateChoices(s.revised.result).every(q=>Number(s.updateFields[q.id])===q.correct)){
  s.finishedAt=Date.now();
  go(7);
 }
 if(a==='accept-writing')acceptWriting(false);
 if(a==='teacher-review')acceptWriting(true);
 if(a==='confirm-plan'&&s.stage===3&&!s.event&&s.drafts.length===2){s.event=eventFor(s.drafts[s.selected].ids);go(4)}
 if(a==='design'&&caseyDone())go(s.event?5:3);
 if(['add','remove','clear-route','replace','choose','load'].includes(a)){s.routeFeedback=null}
 if(a==='add'&&(s.stage===3||s.stage===5)){if(!isCancelled(el.dataset.id,s.event)&&!usedOxfordTrain(el.dataset.id)&&s.editing.length<3&&!s.editing.includes(el.dataset.id))s.editing.push(el.dataset.id);render()}
 if(a==='remove'&&(s.stage===3||s.stage===5)){
  s.editing.splice(Number(el.dataset.id));
  render();
  document.querySelector('#service-picker')?.focus();
 }
 if(a==='clear-route'){s.editing=[];s.routeName='';render()}
 if((a==='check-route'&&(s.stage===3||s.stage===5))||(a==='save-draft'&&s.stage===3)||(a==='save-revision'&&s.stage===5)){const r=evaluateRoute(s.editing,s.event);if(!r.ok){s.routeFeedback={ok:false,html:icon('alert')+'<ul>'+r.errors.map(t=>`<li>${esc(t)}</li>`).join('')+'</ul>'};render();return}if(a==='check-route'){s.routeFeedback={ok:true,html:icon('check')+`This route works. £${r.total} total · £${r.remaining} left · arrives ${r.arrival}.`};render();return}const d={name:s.routeName.trim()||(a==='save-revision'?'Revised plan':'Plan '+(s.drafts.length+1)),ids:[...s.editing],result:r};if(a==='save-revision'){s.revised=d;s.updateFields={};s.updateSubmitted=false;go(6);return}if(s.drafts.length>=2||s.drafts.some(x=>x.ids[0]===d.ids[0])){s.routeFeedback={ok:false,html:'Choose a different train leaving Oxford for your second plan.'};render();return}s.drafts.push(d);s.editing=[];s.routeName='';render()}
 if(a==='replace'&&s.stage===3&&!s.event){const i=Number(el.dataset.id);s.editing=[];s.routeName='';s.drafts.splice(i,1);s.selected=0;render()}
 if(a==='choose'&&s.stage===3&&!s.event){s.selected=Number(el.dataset.id);render()}
 if(a==='revise'&&s.stage===4){s.editing=[];s.routeName='';go(5)}
 if(a==='load'&&s.stage===5){const d=s.drafts[Number(el.dataset.id)];if(d&&evaluateRoute(d.ids,s.event).ok){s.editing=[...d.ids];s.routeName=d.name+' revised';s.routeFeedback=null;render()}}
 if(a==='help')show('How to play','<div class="help-steps"><p><b>1.</b> Tap your friends to hear their needs.</p><p><b>2.</b> Talk to Casey in four messages: greet, explain the problem, describe your group’s needs, then thank Casey and say goodbye.</p><p><b>3.</b> Combine services into two routes. Discuss your choice, then confirm it.</p><p><b>4.</b> Adapt to a disruption, then correct an English message using the revised itinerary.</p></div><label>Play mode <select id="play-mode"><option value="solo" '+(s.mode==='solo'?'selected':'')+'>Solo</option><option value="pair" '+(s.mode==='pair'?'selected':'')+'>Pair: planner + critical friend</option></select></label><p class="small-note">In pairs, discuss choices aloud and swap roles after the alert. Refreshing this page clears your work.</p>');
 if(a==='teachers')show('Didaktický dizajn & zdroje',teacherHTML());
 if(a==='download')download();
 if(a==='restart')show('Start a new mission?','<p>Download your portfolio first if you want to keep it.</p>'+btn('Start again','reset'));
 if(a==='reset')location.reload();
});
function teacherHTML(){return `<h3>ANJ · B2 · gymnázium</h3><p>Hráč koordinuje cestu štyroch fiktívnych študentov. Informácie sa odhaľujú cez postavy a situácie, zostávajú dostupné v grafickom paneli požiadaviek.</p><h3>Ciele podľa Blooma</h3><ul><li><b>Analyzovať:</b> odlíšiť potreby od preferencií a prepojiť údaje z dialógu a cestovného poriadku.</li><li><b>Hodnotiť:</b> porovnať dve uskutočniteľné trasy a obhájiť kompromis.</li><li><b>Tvoriť:</b> vytvoriť štyri repliky situačného dialógu podľa pokynov k obsahu a slovesným časom.</li><li><b>Aplikovať:</b> upraviť riešenie podľa novej udalosti; používať dôvod, kontrast a podmienku.</li></ul><h3>Jazyková produkcia</h3><p>Štyri krátke repliky s Casey. Na záver žiak vyberie jazykovo a vecne správne formulácie do správy skupine. Precvičí si predprítomný čas v trpnom rode, slovosled nepriamej otázky a prvú podmienkovú vetu. Výsledok aj vysvetlenia sa zobrazia po potvrdení všetkých troch odpovedí. Po odoslaní je pripravená kontrola obsahu a jazyka cez jazykový model. Vyžaduje pripojené API. Pri nedostupnosti je odpoveď výslovne označená na kontrolu učiteľom. Porovnanie trás a obhájenie výberu prebieha ústne vo dvojici; písomný komentár pri prvom výbere sa nevyžaduje. Kvalitu jazyka posúdi učiteľ.</p><p>Hra má limit 15 minút od začatia. Po vypršaní možno dokončiť a opraviť texty, ale záver ukáže zmeškané herné rezervačné okno. Ide o herný plánovací čas, nie o reálny posun cestovného poriadku.</p><p>Casey je skriptovaná postava: reaguje podľa štyroch krokov rozhovoru. Po tretej správe poskytne obmedzenia spojov, po štvrtej sprístupní plánovanie. Checklist zachytáva jednoduché signály v texte. Krátke repliky nemajú dolný slovný limit. Pri jazykovej chybe žiak dostane najviac dva podnety na opravu. Pri druhom neúspešnom pokuse sa zobrazí oprava s vysvetlením. Záver a portfólio obsahujú pôvodné vety, opravené vety a vysvetlenia. Čakanie na API sa nepočíta do časového limitu. AI hodnotenie môže obsahovať chyby.</p><h3>Overenie učenia</h3><p>Portfólio obsahuje dialóg, odpovede, obe trasy, potvrdený výber, nový plán a opravenú správu pre skupinu. Kritériá učiteľa: presnosť informácií; odôvodnený kompromis; funkčná tvorivá adaptácia; jasný, súvislý a primeraný jazyk. Čas približne 15 minút treba overiť s cieľovou skupinou. V dvojici možno realizovať a osobitne hodnotiť ústnu interakciu.</p><h3>Zdroj a vlastné materiály</h3><p><a href="https://nivam.sk/wp-content/uploads/anglicky_jazyk-uroven_b2_g_4_5_r.pdf" target="_blank" rel="noopener">Vzdelávací štandard ANJ B2 pre gymnáziá ↗</a></p><p>Texty scenára, rozhranie, vektorové postavy a ilustrácie sú vlastné materiály vytvorené pre prototyp. Časy vychádzajú zo sobotného cestovného poriadku GWR. Pri príchode do Readingu hra na plánovanie prestupu konzervatívne používa publikovaný čas odchodu vlaku z Readingu. Ceny, dostupnosť miest a zrušenia sú súčasťou simulácie. Fonty Manrope a DM Sans: SIL Open Font License, Google Fonts; systémová náhrada pri nedostupnosti.</p>`}
function download(){const r=d=>`${d.name}: ${d.ids.join(' + ')}\n${d.result.legs.map(l=>`${l.from} ${l.departure} → ${l.to} ${l.arrival}`).join('\n')}\n£${d.result.total} total · £${d.result.remaining} reserve`;const text=`Mind the gap. Make a plan. · MISSION PORTFOLIO · B2\n\nMY CONVERSATION\n${s.requests.map(x=>`You: ${x.text}\nCasey: ${x.reply}`).join('\n\n')}\n\nMY ALTERNATIVES\n${s.drafts.map(r).join('\n\n')}\n\nMY CHOICE\n${s.drafts[s.selected].name}\n\nSERVICE ALERT\n${eventBrief().text}\n\nMY REVISED PLAN\n${r(s.revised)}\n\nMY GROUP UPDATE\n${completedUpdate()}\n\nMY LANGUAGE REVIEW\n${languagePortfolio(language.history)}\n\nOfficial curriculum: https://nivam.sk/wp-content/uploads/anglicky_jazyk-uroven_b2_g_4_5_r.pdf\nFictional simulation. No real messages were sent.\n`;const url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download='mind-the-gap-mission-portfolio.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
render();
setInterval(updateClock,1000);
function checklist(text){
 const checks=caseySignals(s.requests.length,text);
 return `<span class="checklist-caption">CHECKLIST · Make sure to include:</span>${checks.map(([label,done])=>`<span class="live-item ${done?'achieved':''}">${done?'✓':'○'} ${label}</span>`).join('')}`;
}
function routeComparison(){
 const rows=[
  ['Travel together',r=>Math.min(...r.legs.map(l=>l.seats))>=4,r=>Math.min(...r.legs.map(l=>l.seats))+' seats available on both trains'],
  ['Paddington by 20:00',r=>minute(r.arrival)<=1200,r=>r.arrival],
  ['Step-free access',r=>r.legs.every(l=>l.stepFree),r=>r.legs.every(l=>l.stepFree)?'Both trains':'Access gap'],
  ['McDonald’s in Reading',r=>r.legs.some(leg=>leg.to==='Reading'),r=>r.legs.some(leg=>leg.to==='Reading')?'Stops in Reading':'No stop in Reading'],
  ['At least 30 min in Reading',r=>r.transfer>=30,r=>r.transfer+' min in Reading'],
  ['£108 ticket budget',r=>r.total<=108,r=>`£${r.total} total · £${r.remaining} left`],
 ];
 return `<div class="route-comparison"><table><caption>Which requirements does each plan meet?</caption><thead><tr><th scope="col">Requirement</th>${s.drafts.map(d=>`<th scope="col">${esc(d.name)}</th>`).join('')}</tr></thead><tbody>${rows.map(([label,met,detail])=>`<tr><th scope="row">${label}</th>${s.drafts.map(({result})=>`<td><b class="route-status ${met(result)?'':'not-met'}">${met(result)?'✓ Met':'✕ Not met'}</b><span>${detail(result)}</span></td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}
function updateChoices(route){
 const departure=route.legs[0].departure;
 return [
  {id:'cancellation',topic:'Present perfect passive',label:'Report the cancellation and explain what it means for the group now.',correct:1,
   options:[
    [`Our original train has cancelled, so our replacement service leaves Oxford at ${departure}.`,'The train receives the action. Use the present perfect passive: has been + past participle.'],
    [`Our original train has been cancelled, so our replacement service leaves Oxford at ${departure}.`,'“Has been cancelled” reports a past event that affects the plan now. “Leaves” gives the scheduled departure.'],
    [`Our original train had been cancelled, so our replacement service leaves Oxford at ${departure}.`,'The past perfect needs another past event or point of reference. Here you’re updating the group about the current situation.'],
   ]},
  {id:'meeting',topic:'Indirect questions',label:'Ask the group politely to confirm the meeting point.',correct:2,
   options:[
    ['Could someone confirm where is the class meeting by 20:00?','Use statement word order after “confirm where”: subject before the verb.'],
    ['Could someone confirm where does the class meet by 20:00?','The embedded question does not need “does”. Use statement word order after “where”.'],
    ['Could someone confirm where the class is meeting by 20:00?','In an indirect question, “where” is followed by statement word order: “the class is meeting”.'],
   ]},
  {id:'contingency',topic:'First conditional',label:'Say what the group will do if another delay happens.',correct:1,
   options:[
    ['If the connection will be delayed, we’ll let Ms Taylor know.','For a real future possibility, use the present simple in the if-clause and “will” in the result.'],
    ['If the connection is delayed, we’ll let Ms Taylor know.','“Is delayed” is present simple passive in the if-clause. “We’ll let” gives the planned response.'],
    ['If the connection had been delayed, we’ll let Ms Taylor know.','“Had been delayed” puts the condition in the past. Use the present simple for this possible future delay.'],
   ]},
 ];
}
function grammarFeedback(q){
 const selected=s.updateFields[q.id];
 if(selected===undefined)return '';
 const [,explanation]=q.options[selected];
 if(Number(selected)===q.correct)return `<p><strong>✓ Correct.</strong> ${esc(explanation)}</p>`;
 return `<div class="grammar-correction">
  <p><strong>✕ Try again.</strong></p>
  <p><strong>Grammar rule</strong> · ${esc(explanation)}</p>
 </div>`;
}
function grammarScore(questions){
 return `${questions.filter(q=>Number(s.updateFields[q.id])===q.correct).length}/${questions.length} correct.`;
}
function completedUpdate(){return updateChoices(s.revised.result).map(q=>q.options[q.correct][0]).join(' ')}
function groupUpdateActivity(){
 const questions=updateChoices(s.revised.result);
 return `<span class="eyebrow">FINAL CHALLENGE · GROUP CHAT</span><h1>Write a grammatically correct group update.</h1>
 <p class="lead">Choose one sentence for each grammar topic. Confirm all three answers to see your score and the explanations. You can then change an answer directly and confirm again.</p>
 <details class="final-message"><summary>View your revised itinerary</summary>${summary(s.revised)}</details>
 <div class="update-cards">${questions.map((q,i)=>`<fieldset><legend>${i+1}. ${q.topic}</legend>
  <p>${q.label}</p>
  ${q.options.map(([option],index)=>`<label><input type="radio" name="update-${q.id}" data-update="${q.id}" value="${index}" ${s.updateFields[q.id]===String(index)?'checked':''}> ${option}</label>`).join('')}
  <div class="update-hint" id="grammar-${q.id}" aria-live="polite">${s.updateSubmitted?grammarFeedback(q):''}</div>
 </fieldset>`).join('')}</div>
 <p id="update-feedback" tabindex="-1" role="status" class="feedback">${s.updateSubmitted?grammarScore(questions):''}</p>
 <div class="stage-action" id="update-actions">${s.updateSubmitted&&questions.every(q=>Number(s.updateFields[q.id])===q.correct)
  ?btn('Send update','send-update')
  :s.updateSubmitted?'':btn('Confirm answers','check-update')}</div>`;
}
function budgetTimeline(legs){let left=120;return `<div class="budget-timeline"><span class="budget-start">Start <b>£120</b></span>${legs.map(l=>{left-=l.fare*4;return `<span>${l.id}: −£${l.fare*4}<b>£${left} left</b></span>`}).join('')}<span class="reserve-note">Keep £12 untouched</span></div>${legs.length?`<div class="journey-timing"><b>Departs ${legs[0].departure} · ${legs.at(-1).to==='Reading'?'Reading (timetable time) ':'arrives '}${legs.at(-1).arrival}</b><span>${minute(legs.at(-1).arrival)-minute(legs[0].departure)} min ${legs.length>1?'total travel time':'to the Reading (timetable time)'}${legs.length>1?' · '+(minute(legs[1].departure)-minute(legs[0].arrival))+' min available in '+legs[0].to:''}</span></div>`:''}`}
function atlasHTML(){return `${routeMap(s.editing,s.event)}<p>Your group is still at Oxford. You can rebuild via Reading; selecting a route does not buy tickets. Highlighted lines show your current draft.</p>${s.event?`<div class="event-ribbon">${eventBrief().text}</div>`:''}${s.drafts.length?`<h3>Your saved plans · original timetable</h3>${s.drafts.map(d=>summary(d)).join('')}`:''}${s.revised?'<h3>Revised plan</h3>'+summary(s.revised):''}<h3>GWR Saturday timetable · scenario board</h3><p>Selected services from the GWR Saturday timetable, 17 May to 12 December 2026. In real life, there are also direct trains. The game requires a stop in Reading for the food pick-up. GWR publishes when the first train leaves Reading, so the game counts the time available from that point as a conservative estimate. The 30-minute allowance, fares, seats, boarding restrictions and cancellations are part of the scenario. <a href="${timetableSource}" target="_blank" rel="noopener">GWR timetable</a> · <a href="https://www.nationalrail.co.uk/stations/reading/" target="_blank" rel="noopener">Reading station</a> · <a href="https://www.mcdonalds.com/gb/en-gb/location/reading/reading/128129-friar-street/8260102.html" target="_blank" rel="noopener">McDonald’s on Friar Street</a></p><div class="timetable-scroll"><table class="all-timetable"><thead><tr><th>Service</th><th>From → To</th><th>Departs</th><th>Arrival / Reading timetable time</th><th>Group fare</th><th>Access / seats</th></tr></thead><tbody>${services.map(b=>{const l=liveService(b,s.event),closed=isCancelled(l.id,s.event);return `<tr class="${closed?'cancelled-row':''}"><td><b>${l.id}</b>${closed?' CANCELLED':''}</td><td>${l.from} → ${l.to}</td><td>${l.departure}</td><td>${l.arrival}</td><td>£${l.fare*4}</td><td>${l.stepFree?'Step-free':'Step-free boarding unavailable'} · ${l.seats} seats</td></tr>`}).join('')}</tbody></table></div>`}
function updateClock(){const el=document.querySelector('#mission-timer');if(!el)return;const now=s.finishedAt||Date.now(),left=s.startedAt?900-Math.floor((now-s.startedAt)/1000):900;el.textContent=left>=0?`${Math.floor(left/60)}:${String(left%60).padStart(2,'0')}`:`+${Math.floor(-left/60)}:${String(-left%60).padStart(2,'0')} overtime`;if(s.startedAt&&!s.finishedAt&&left>0){const end=new Date(s.startedAt+900000);el.textContent+=' · Your time will be up at '+end.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'});}el.classList.toggle('time-warning',left<120);el.title='15 minutes for the mission. You can still finish and revise after the timer expires.'}
function endingHTML(){const late=s.finishedAt-s.startedAt>900000;return `<div class="win-mark ${late?'late-mark':''}">${late?'◔':icon('check')}</div><span class="eyebrow">${late?'MISSION FINISHED · TOO LATE':'MISSION COMPLETE · ON TIME'}</span><h1>${late?'A workable plan. A missed window.':'You got us moving. Thank you!'}</h1>${late?screenPaddington():paddingtonApplause()}<div class="celebration-crew ${late?'sad-crew':''}">${crew.map(p=>`<div>${portrait(p.id)}<b>${p.name}</b><span>${late?'☹':'☺'}</span></div>`).join('')}</div>${late?bubble('sam','Our plan works on paper, but we took too long to organise it. In this game, we missed our booking window. Ms Taylor needs to help us arrange a later journey.'):bubble('mia','Thank you for checking the access and giving me enough time to change. Now all four of us can travel together!')}${late?'<p class="outcome-note">The timer measures planning time, not the timetable clock. Review where you lost time, then try again. Your writing and route are available in the review.</p>':bubble('alex',`You kept £${s.revised.result.remaining} aside for emergencies. Let’s meet by the departure board!`)}<div class="stage-action">${btn('View review','open-review')}</div>`}
function reviewHTML(){
 const answers=updateChoices(s.revised.result);
 return `<h1>Mission review</h1>
 ${summary(s.revised)}
 <section class="language-summary"><h2>Grammar review</h2>
  ${answers.map(q=>{
   const [sentence,explanation]=q.options[q.correct];
   return `<article class="language-card"><h3>${q.topic}</h3><blockquote>${esc(sentence)}</blockquote><p>${esc(explanation)}</p></article>`;
  }).join('')}
 </section>
 ${languageSummary(language.history,esc)}
 <details class="final-message"><summary>Your message to the group</summary>${bubble('you',completedUpdate(),{outgoing:true})}</details>
 <div class="stage-action">${btn('Download mission portfolio ↓','download')}${btn('Play again','restart','secondary')}</div>`;
}
