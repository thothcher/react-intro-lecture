// Slide order = the Hero's Journey. Timings are derived from each slide's length (min), in order.
import ordinary from './s01-ordinary.js';
import call from './s02-call.js';
import refusal from './s03-refusal.js';
import mentor from './s04-mentor.js';
import threshold from './s05-threshold.js';
import jsx from './s06a-jsx.js';
import concepts from './s06c-concepts.js';
import trials from './s06-trials.js';
import moreTrials from './s06b-more.js';
import ordeal from './s07-ordeal.js';
import typescript from './s07b-typescript.js';
import rendering from './s08a-rendering.js';
import ret from './s08-return.js';
import { meta } from './meta.js';

const all = [...ordinary, ...call, ...refusal, ...mentor, ...threshold, ...jsx, ...concepts, ...trials, ...moreTrials, ...ordeal, ...typescript, ...rendering, ...ret];

const clock = (m) => `${Math.floor(m)}:${String(Math.round((m % 1) * 60)).padStart(2, '0')}`;
let at = 0;
all.forEach((s) => {
  if (s.min == null) return;
  const from = at;
  at += s.min;
  s.time = `${clock(from)} – ${clock(at)} (${s.min} min)${s.timeNote ? ` · ${s.timeNote}` : ''}`;
});
meta.theoryMin = Math.round(at);
meta.slideCount = all.length;
export const slides = all;
