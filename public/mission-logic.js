export const services=[
 {id:'B12',from:'Brookford',to:'Hillford',departure:'17:15',arrival:'17:45',fare:5,mode:'Bus',bay:'Bay 1',seats:8,stepFree:true},
 {id:'B14',from:'Brookford',to:'Hillford',departure:'17:30',arrival:'18:00',fare:4,mode:'Bus',bay:'Bay 1',seats:6,stepFree:true},
 {id:'H20',from:'Hillford',to:'London Central',departure:'18:00',arrival:'19:00',fare:20,mode:'Train',bay:'Platform 3',seats:8,stepFree:false},
 {id:'H22',from:'Hillford',to:'London Central',departure:'18:05',arrival:'19:10',fare:21,mode:'Train',bay:'Platform 1',seats:6,stepFree:true},
 {id:'H24',from:'Hillford',to:'London Central',departure:'18:20',arrival:'19:25',fare:18,mode:'Train',bay:'Platform 1',seats:8,stepFree:true},
 {id:'H26',from:'Hillford',to:'London Central',departure:'18:35',arrival:'19:35',fare:25,mode:'Train',bay:'Platform 1',seats:8,stepFree:true},
 {id:'R7',from:'Brookford',to:'Riverside',departure:'17:20',arrival:'18:00',fare:7,mode:'Bus',bay:'Bay 2',seats:8,stepFree:true},
 {id:'R9',from:'Brookford',to:'Riverside',departure:'17:25',arrival:'18:05',fare:8,mode:'Bus',bay:'Bay 2',seats:8,stepFree:true},
 {id:'R40',from:'Riverside',to:'London Central',departure:'18:15',arrival:'19:20',fare:17,mode:'Train',bay:'Platform 2',seats:8,stepFree:true},
 {id:'R42',from:'Riverside',to:'London Central',departure:'18:30',arrival:'19:40',fare:15,mode:'Train',bay:'Platform 2',seats:8,stepFree:true},
 {id:'C90',from:'Brookford',to:'London Central',departure:'17:40',arrival:'19:10',fare:23,mode:'Coach',bay:'Bay 3',seats:3,stepFree:true}
];
export const minute=t=>Number(t.slice(0,2))*60+Number(t.slice(3));
export const words=t=>(t.trim().match(/\S+/g)||[]).length;
export function eventFor(ids){return {type:'service-cancelled',cancelled:[ids[0]]}}
export function isCancelled(id,event){return Boolean(event?.cancelled?.includes(id))}
export function liveService(service,event){const x={...service};if(event==='riverside-delay'&&x.id==='R7'){x.departure='17:50';x.arrival='18:30'}return x}
export function evaluateRoute(ids,event=null){
 const legs=ids.map(id=>services.find(x=>x.id===id));
 if(!legs.length)return {ok:false,errors:['Add services to your route, starting at Brookford.']};
 if(legs.some(x=>!x))return {ok:false,errors:['Unknown service. Select a service from the departure board.']};
 const live=legs.map(x=>liveService(x,event)),errors=[];
 if(live[0].from!=='Brookford')errors.push('Your journey must start at Brookford.');
 if(live[live.length-1].to!=='London Central')errors.push('Your route does not yet reach London Central. Add a connecting service.');
 if(live[0].from==='Brookford'&&minute(live[0].departure)<1030)errors.push('Allow at least 10 minutes to reach the departure bay.');
 live.forEach((l,i)=>{if(l.seats<4)errors.push(`${l.id} has only ${l.seats} seats left. The four travellers must stay together.`);if(!l.stepFree)errors.push(`${l.id} uses Platform 3 at Hillford. Its lift is out of service, so this route is not step-free.`);if(isCancelled(l.id,event))errors.push(`${l.id} has been cancelled. Choose another service; all other listed services keep their original status.`);if(i){const previous=live[i-1];if(previous.to!==l.from)errors.push(`${previous.id} ends at ${previous.to}, but ${l.id} starts at ${l.from}.`);else {const gap=minute(l.departure)-minute(previous.arrival);if(gap<0)errors.push(`${l.id} leaves ${l.from} before ${previous.id} arrives.`);else if(gap<15)errors.push(`The transfer at ${l.from} is ${gap} minutes. Mia needs at least 15 minutes.`)}}});
 const total=live.reduce((sum,l)=>sum+l.fare*4,0),arrival=live[live.length-1].arrival;
 if(total>108)errors.push(`The journey costs £${total}. Keep £12 of the £120 as an emergency reserve: spend at most £108.`);
 if(minute(arrival)>1200)errors.push('Your arrival is after the 20:00 deadline.');
 return {ok:errors.length===0,errors:[...new Set(errors)],legs:live,total,remaining:120-total,arrival,duration:minute(arrival)-minute(live[0].departure),transfer:live.length>1?minute(live[1].departure)-minute(live[0].arrival):0};
}
