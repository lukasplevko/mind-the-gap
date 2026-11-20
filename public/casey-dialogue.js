export const caseySteps=[
 {label:'Greet',instruction:'Say hello to Casey.',prompt:'Start with a polite greeting.'},
 {label:'Explain',instruction:'Explain why you need help.',prompt:'Tell Casey that your train was cancelled and where your group needs to go.',grammar:'Use the past simple for what happened and the present simple for what you need now.'},
 {label:'Describe needs',instruction:'Tell Casey what your group needs.',prompt:'In two or three sentences, cover the group size, step-free access, Reading stop, arrival deadline and budget.',grammar:'Use the present simple for requirements, for example “We need …” or “One of us wants …”.'},
 {label:'Say goodbye',instruction:'Thank Casey and say goodbye.',prompt:'Thank Casey for the help, then end the conversation politely.',grammar:'Use the present simple to express thanks, for example “I appreciate …”. A short “Thank you” is fine too.'}
];
export function caseyReply(step){return [
 {text:'Hello! How can I help you today?',covered:[]},
 {text:'I’m sorry your train was cancelled. I’ll help you find another way back. What does your group need for the journey?',covered:[]},
 {text:'Thank you for explaining. Take a Great Western Railway train to Reading and change for London Paddington. McDonald’s is on Friar Street, near Reading station. Allow at least 30 minutes there: 15 to change trains and another 15 to walk to McDonald’s, pick up food and get back. Give yourselves longer if it’s busy. Your travel budget is £108 for four, leaving £12 for emergencies. Arrive at London Paddington by 20:00. I’ve added these details to your mission board.',covered:['routes','seats','access','times','budget']},
 {text:'You’re very welcome! I hope the rest of your journey goes smoothly. Goodbye, and have a safe trip!',covered:[]}
 ][step]}
export function caseySignals(step,text){const has=re=>re.test(text);return [
 [['Greet Casey',has(/\b(hello|hi|hey|good (morning|afternoon|evening)|greetings)\b/i)]],
 [['Say that your train was cancelled',has(/cancel|not running|not coming|no (train|service)/i)],['Say where your group needs to go',has(/london|paddington/i)]],
 [['Four travellers together',has(/\b(four|4|together|whole group)\b/i)],['Arrival by 20:00',has(/20[.:]00|8\s*(p\.?m\.?|o.clock)|eight/i)],['Step-free access',has(/step.?free|crutch|Alena|access|stairs|lift/i)],['McDonald’s stop',has(/mcdonald|friar street/i)],['30 minutes in Reading',has(/\b(30|thirty)\b|(?:15|fifteen).*(?:15|fifteen)/i)],['Budget and reserve',has(/108|120|12|budget|reserve|emergenc/i)]],
 [['Thank Casey',has(/thank|thanks|appreciate|grateful/i)],['Say goodbye',has(/bye|goodbye|see you|take care|have a (good|nice|lovely)/i)]]
 ][step]}
