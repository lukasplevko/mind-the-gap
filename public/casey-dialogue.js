export const caseySteps=[
 {label:'Greet',instruction:'Greet Casey.'},
 {label:'Explain',instruction:'Explain what happened to your group.'},
 {label:'Describe needs',instruction:'Explain your group’s travel requirements.'},
 {label:'Say goodbye',instruction:'Thank Casey and say goodbye.'}
];
export function caseyReply(step){return [
 {text:'Hello! How can I help you today?',covered:[]},
 {text:'I’m sorry your train was cancelled. I’ll help you find another way back. What does your group need for the journey?',covered:[]},
 {text:'Thank you for explaining. You can take a bus to Hillford or Riverside and then a train to London. Please avoid H20 because its platform has stairs and the lift is broken. The direct coach C90 has only three seats, so it cannot take all four travellers. All other listed services are step-free and have at least four seats. Allow at least 15 minutes to change services. Fares are per person: your travel budget is £108 for four, leaving £12 for emergencies. Check the timetable to reach London Central by 20:00. I’ve added these details to your mission board.',covered:['routes','seats','access','times','budget']},
 {text:'You’re very welcome! I hope the rest of your journey goes smoothly. Goodbye, and have a safe trip!',covered:[]}
 ][step]}
export function caseySignals(step,text){const has=re=>re.test(text);return [
 [['Greet Casey',has(/\b(hello|hi|hey|good (morning|afternoon|evening)|greetings)\b/i)]],
 [['Explain the disruption',has(/cancel|not running|not coming|no (train|service)|train.*(stopped|broken)|missed/i)],['Mention your group',has(/\b(we|our|us|group|classmates|friends)\b/i)]],
 [['Four travellers together',has(/\b(four|4|together|whole group)\b/i)],['Step-free access',has(/step.?free|crutch|Mia|access|stairs|lift/i)],['15-minute change',has(/\b(15|fifteen)\b/i)],['Arrival by 20:00',has(/20[.:]00|8\s*(p\.?m\.?|o.clock)|eight/i)],['Budget and reserve',has(/108|120|12|budget|reserve|emergenc/i)]],
 [['Thank Casey',has(/thank|thanks|appreciate|grateful/i)],['Say goodbye',has(/bye|goodbye|see you|take care|have a (good|nice|lovely)/i)]]
 ][step]}
