export function reviewPanel(entry,escape){
 if(entry.error)return `<p>${escape(entry.error)}</p>`;
 return '<p>Your message has been saved. You can read your grammar feedback in the final review.</p>';
}
function grammarChecks(result,e){
 const labels={tense:'Verb tense',articles:'Articles',wordForm:'Word forms and agreement',spelling:'Spelling'};
 const checks=(result?.grammarChecks||[]).map(c=>`<li><strong>${e(labels[c.area]||c.area)} · ${c.status==='correct'?'✓ Correct':c.status==='needs_work'?'Review':'Not needed here'}</strong>${e(c.explanation)}</li>`).join('');
 return checks?`<ul class="grammar-checks">${checks}</ul>`:'';
}
export function languageSummary(entries,escape){
 const e=escape;
 if(!entries.length)return '';
 let cards=entries.map(entry=>{
  const latest=entry.attempts.at(-1), checked=entry.accepted?.result;
  const grammar=grammarChecks(checked||latest?.result,e);
  const notes=[];
  for(const attempt of entry.attempts){for(const c of attempt.result?.corrections||[])if(!notes.some(n=>n.original===c.original&&n.corrected===c.corrected))notes.push({...c,sentence:attempt.text,correctedSentence:attempt.result.correctedSentence});}
  return `<article class="language-card"><h3>${e(entry.label)}</h3><p class="small-note">Your submitted message</p><blockquote>${e(entry.finalText)}</blockquote>${entry.unreviewed?'<p class="review-warning">Teacher review requested. Ask your teacher to check the submitted message.</p>':`<p>${e(checked?.feedback||latest.result?.feedback||'')}</p>`}${grammar}${(checked?.contentReview||latest.result?.contentReview)?`<h4>Meaning and task</h4><p>${e(checked?.contentReview||latest.result.contentReview)}</p>`:''}${notes.map(c=>`<div class="language-point"><p><strong>Your sentence</strong><br>${e(c.sentence)}</p><p><strong>Corrected sentence</strong><br>${e(c.correctedSentence)}</p><p><del>${e(c.original)}</del> → <strong>${e(c.corrected)}</strong></p><p>${e(c.explanation)}</p></div>`).join('')}${!notes.length&&!entry.unreviewed?'<p>No language corrections were identified in the reviewed attempts.</p>':''}</article>`;
 }).join('');
 return `<section class="language-summary"><span class="eyebrow">YOUR ENGLISH · REVIEW & LEARN</span><h2>Your writing, explained.</h2><p>Review your own sentences and the reasons for each correction. Earlier errors remain here even when you corrected them during the mission.</p><p class="small-note">AI feedback can make mistakes. Your teacher can review your original messages and corrections.</p>${cards}</section>`;
}
export function languagePortfolio(entries){return entries.map(entry=>`${entry.label}\nSubmitted: ${entry.finalText}\n${entry.unreviewed?'Not automatically reviewed. Teacher review needed.':''}\n${entry.attempts.map(a=>`Attempt ${a.attempt}: ${a.text}\n${a.result?`Corrected sentence: ${a.result.correctedSentence}\n${a.result.corrections.map(c=>`${c.original} -> ${c.corrected}\nWhy: ${c.explanation}`).join('\n')}\n${[...a.result.missing,...a.result.contradictions].join('\n')}`:'Review unavailable.'}`).join('\n\n')}`).join('\n\n');}
