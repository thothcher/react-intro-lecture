import { head, snippet } from './helpers.js';
import { setLines } from '../components/code.js';

const STAGE = '07 / ORDEAL';

const STEPS = [
  { bug: null },
  {
    bug: '7-9',
    title: 'Bug 1 — mutating state',
    text: '<span class="mono">list.items.push(…)</span> changes the <b>existing</b> object, and <span class="mono">setList(list)</span> hands React the <b>same</b> object. React compares old and new (<span class="mono">Object.is</span>) → "nothing changed" → no re-render. The new products never appear.',
  },
  {
    bug: '14',
    title: 'Bug 2 — the missing key',
    text: 'Every element in a <span class="mono">.map()</span> needs a stable <span class="mono">key</span>. Without it React cannot tell the cards apart: there is a warning in the console, and when the list changes the wrong card may update.',
  },
  {
    fix: true,
    title: 'The fix',
    text: 'A new object and a new array (<span class="mono">[...l.items, ...res.products]</span>) + <span class="mono">key={p.id}</span>. Exactly as in our <span class="mono">src/pages/Menu.jsx</span>.',
  },
];

export default [
  {
    id: 'spot-the-bug',
    stage: STAGE,
    title: 'Spot the bug',
    min: 3,
    steps: '→ #1: bug 1 · → #2: bug 2 · → #3: the fixed code · ← steps back.',
    notes: `
      <p>The scenario: clicking "Load more" <b>does not show</b> the new products. There are <b>two</b> mistakes in the code.</p>
      <p>Give 60–90 seconds to discuss in pairs. Hint, if needed: "What does React compare when you call <code>setList</code>?"</p>
      <p>→ bug 1: mutation + the same reference → no re-render. → bug 2: key. → the fix (like our real Menu.jsx).</p>
      <p>The rule to remember: <b>we don't change state — we create a new one.</b></p>`,
    html: () => `
      ${head('Spot the bug', 'Clicking "Load more" does not show the new products. There are two mistakes in the code — find both.')}
      <div class="ordeal">
        <div class="ordeal-code">
          <div data-bug>${snippet('s25-bug', { file: 'src/pages/Menu.jsx', tag: 'with bugs' })}</div>
          <div data-fix hidden>${snippet('s25-fix', { file: 'src/pages/Menu.jsx', tag: 'fixed', add: '7, 12' })}</div>
        </div>
        <aside class="ordeal-side">
          <ol class="ordeal-steps" data-steps>
            ${STEPS.slice(1).map((s, i) => `
              <li data-step="${i + 1}" class="${s.fix ? 'is-fix' : ''}">
                <span class="mono ordeal-n">${s.fix ? 'FIX' : `0${i + 1}`}</span>
                <div><h3>${s.title}</h3><p>${s.text}</p></div>
              </li>`).join('')}
          </ol>
          <p class="ordeal-prompt mono" data-prompt>Think for 60 seconds — then → for the answer</p>
        </aside>
      </div>`,
    mount(el) {
      let step = 0;
      const bug = el.querySelector('[data-bug]');
      const fix = el.querySelector('[data-fix]');
      const items = [...el.querySelectorAll('[data-steps] li')];
      const prompt = el.querySelector('[data-prompt]');
      const paint = () => {
        setLines(bug, '1-20', 'is-bad', false);
        STEPS.slice(1, step + 1).forEach((s) => { if (s.bug) setLines(bug, s.bug, 'is-bad', true); });
        const fixed = step >= 3;
        bug.hidden = fixed;
        fix.hidden = !fixed;
        items.forEach((li, i) => li.classList.toggle('is-shown', i < step));
        prompt.hidden = step > 0;
      };
      paint();
      return {
        next() { if (step >= 3) return false; step += 1; paint(); return true; },
        prev() { if (step <= 0) return false; step -= 1; paint(); return true; },
      };
    },
  },
];
