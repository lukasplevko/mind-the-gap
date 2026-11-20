// GWR published Saturday timetable, 17 May to 12 December 2026.
export const timetableSource = 'https://www.gwr.com/-/media/gwr-sc-website/files/timetables/may-26-december-26/TS-train-times-17-May-to-12-December-2026-v2.pdf';
const leg = (id, from, to, departure, arrival, fare) => ({
  id, from, to, departure, arrival, fare, mode:'GWR train', bay:'departure board', seats:8, stepFree:true,
});
export const services = [
  leg('GWR 1732','Oxford','Reading','17:32','18:00',9),
  leg('GWR 1759','Oxford','Reading','17:59','18:30',10),
  {...leg('GWR 1802','Reading','London Paddington','18:02','18:25',14),seats:3},
  leg('GWR 1832','Reading','London Paddington','18:32','18:57',15),
  {...leg('GWR 1849','Reading','London Paddington','18:49','19:13',16),stepFree:false},
  leg('GWR 1900','Reading','London Paddington','19:00','19:24',13),
];
export const minute=t=>Number(t.slice(0,2))*60+Number(t.slice(3));
export const words=t=>(t.trim().match(/\S+/g)||[]).length;
export function eventFor(ids){return {type:'service-cancelled',cancelled:[ids[0]]}}
export function isCancelled(id,event){return Boolean(event?.cancelled?.includes(id))}
export const liveService=service=>service;
export function evaluateRoute(ids,event=null){
 const legs=ids.map(id=>services.find(x=>x.id===id));
 if(!legs.length)return {ok:false,errors:['Add services to your route, starting at Oxford.']};
 if(legs.some(x=>!x))return {ok:false,errors:['Unknown service. Select a service from the departure board.']};
 const live=legs.map(x=>liveService(x,event)),errors=[];
 if(live[0].from!=='Oxford')errors.push('Your journey must start at Oxford.');
 if(live[live.length-1].to!=='London Paddington')errors.push('Your route does not yet reach London Paddington. Add a connecting service.');
 if(live[0].from==='Oxford'&&minute(live[0].departure)<1030)errors.push('Allow at least 10 minutes to reach the platform.');
 live.forEach((l,i)=>{if(l.seats<4)errors.push(`${l.id} has only ${l.seats} seats left. The four travellers must stay together.`);if(!l.stepFree)errors.push(`${l.id} does not meet the step-free access requirement.`);if(isCancelled(l.id,event))errors.push(`${l.id} has been cancelled. Choose another service; all other listed services keep their original status.`);if(i){const previous=live[i-1];if(previous.to!==l.from)errors.push(`${previous.id} ends at ${previous.to}, but ${l.id} starts at ${l.from}.`);else {const gap=minute(l.departure)-minute(previous.arrival);if(gap<0)errors.push(`${l.id} leaves ${l.from} before ${previous.id} arrives.`);else if(gap<30)errors.push(`The Reading stop is ${gap} minutes. Allow 15 minutes to change trains and 15 more for McDonald’s.`)}}});
 const total=live.reduce((sum,l)=>sum+l.fare*4,0),arrival=live[live.length-1].arrival;
 if(total>108)errors.push(`The journey costs £${total}. Keep £12 of the £120 as an emergency reserve: spend at most £108.`);
 if(minute(arrival)>1200)errors.push('Your arrival is after the 20:00 deadline.');
 return {ok:errors.length===0,errors:[...new Set(errors)],legs:live,total,remaining:120-total,arrival,duration:minute(arrival)-minute(live[0].departure),transfer:live.length>1?minute(live[1].departure)-minute(live[0].arrival):0};
}
