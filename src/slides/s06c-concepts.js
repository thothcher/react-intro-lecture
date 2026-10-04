// "How React thinks" — props, state, hooks and the virtual DOM, animated in the same layout as the
// rendering slide: the scene on the left, tabs + steps + key ideas on the right.
import { icons } from '../components/icons.js';
import { logo } from '../components/brands.js';
import { ConceptScene, CONCEPT_MODES } from '../explain/ConceptScene.js';

const STAGE = '06 / TRIALS';

export const CONCEPTS = {
  props: {
    acr: 'Props', full: 'data flows down',
    where: 'A parent passes data to its children — read-only.',
    steps: [
      '<span class="mono">Menu</span> owns the data: an array of three pizzas',
      'It renders the <b>same</b> component three times: <span class="mono">&lt;ProductCard p={…} /&gt;</span>',
      'Each card receives its own <b>props</b> — like function arguments',
      'Same component, different data → different UI',
      'Props are <b>read-only</b>: a card never changes its own price',
      'To change data, the child calls a function prop — <span class="mono">onAdd()</span> — and the parent updates',
    ],
    ideas: ['props = function arguments', 'one-way data flow: down', 'children never change props', 'callbacks send events up'],
  },
  state: {
    acr: 'State', full: 'memory + re-render',
    where: 'Data React remembers — changing it redraws the component.',
    steps: [
      'First render: <span class="mono">useState(1)</span> creates a memory slot for <span class="mono">qty</span>',
      'The component returns JSX → React draws <span class="mono">Add · 1</span>',
      'The user clicks the button',
      '<span class="mono">setQty(2)</span> writes the new value into React\'s memory — the screen hasn\'t changed yet',
      'React <b>re-renders</b>: it runs <span class="mono">Counter()</span> again, now with qty = 2',
      'Only the changed text is updated in the DOM',
      'A plain variable can\'t do this — React never hears about it',
    ],
    ideas: ['state = data kept between renders', 'change it only through the setter', 'setter → re-render → new UI', 'every render is a snapshot'],
  },
  hooks: {
    acr: 'Hooks', full: 'functions that plug into React',
    where: 'useState, useEffect… — slots React matches by call order.',
    steps: [
      'Hooks are functions whose names start with <span class="mono">use</span> — they connect a component to React',
      'Render #1: every hook call takes the <b>next slot</b> in React\'s list',
      'After the screen updates, <span class="mono">useEffect</span> runs — here it sets the tab title',
      'Render #2: the same calls in the same order → React hands back the same slots',
      'The rule: call hooks only at the <b>top level</b> — never inside <span class="mono">if</span> or loops',
      'Your own hooks bundle hooks for reuse: <span class="mono">useCart()</span>, <span class="mono">useFetch()</span>',
    ],
    ideas: ['use… = a hook', 'order is identity', 'top level only', 'useState = memory · useEffect = after-render work'],
  },
  vdom: {
    acr: 'Virtual DOM', full: 'diff, then patch',
    where: 'The UI as plain objects — React compares them, then touches the DOM once.',
    steps: [
      'A component returns a description of the UI — plain objects: the <b>virtual DOM</b>',
      'State changes (<span class="mono">cartCount 2 → 3</span>): the component returns a <b>new</b> tree',
      'React compares the two trees node by node — <b>diffing</b>',
      'It finds exactly one difference: the badge text',
      '<b>Patch</b>: only that change is applied to the real DOM — 1 operation',
      'Without diffing (<span class="mono">innerHTML</span>), the whole header would be rebuilt — 18 elements',
    ],
    ideas: ['virtual DOM = UI as JS objects', 'diff old vs new', 'patch only the difference', 'focus, typing and animations survive'],
  },
};

export default [
  {
    id: 'concepts',
    stage: STAGE,
    title: 'How React thinks — animated',
    min: 5,
    steps: 'Starts with Props. → or "Next" — State, Hooks, Virtual DOM. Click a tab for any mode; "Replay" repeats it. After Virtual DOM → moves on.',
    notes: `
      <p>Four ideas, each as a short animation on our pizza menu. Let each one play, then ask one question before moving on.</p>
      <p><b>Props:</b> the same <code>ProductCard</code> three times with different data; props are read-only; the child asks the parent to change data through a callback (<code>onAdd</code>). Ask: "Who owns the cart count?"</p>
      <p><b>State:</b> the important moment is step 4 — the memory already holds 2 but the screen still shows 1. Only the re-render updates the screen. Ask: "Why doesn't <code>let qty</code> work?"</p>
      <p><b>Hooks:</b> React does not know variable names — it only counts calls. Skipping one call (an <code>if</code>) shifts every following hook. Ask: "Why can't hooks go inside an if?"</p>
      <p><b>Virtual DOM:</b> two trees, a diff, one patch. Connect it to Trial 4, where we measured 1 change versus 18.</p>`,
    html: () => `
      <div class="rs cx">
        <header class="s-head rs-head">
          <h2>How React thinks</h2>
          <p>Props, state, hooks and the virtual DOM — step by step, on our pizza menu.</p>
        </header>
        <div class="cx-stage" data-stage></div>
        <aside class="rs-panel cx-panel">
          <div class="rs-tabs" role="tablist">${CONCEPT_MODES.map((k, i) => `<button type="button" role="tab" data-mode="${i}" class="mono">${k === 'vdom' ? 'V-DOM' : CONCEPTS[k].acr}</button>`).join('')}</div>
          <div class="rs-mode">
            <div class="rs-title"><span class="cx-logo">${logo('react')}</span><span class="rs-acr" data-acr></span><span class="rs-full mono" data-full></span></div>
            <p class="rs-where" data-where></p>
          </div>
          <ol class="rs-steps" data-steps></ol>
          <ul class="cx-ideas" data-ideas></ul>
          <div class="rs-actions">
            <button type="button" class="btn" data-replay>${icons.reset}<span>Replay</span></button>
            <button type="button" class="btn btn-solid" data-next><span data-next-label>Next</span>${icons.arrow}</button>
          </div>
        </aside>
      </div>`,
    async mount(el, deck) {
      const $ = (s) => el.querySelector(s);
      const tabs = [...el.querySelectorAll('[data-mode]')];
      let current = 0;
      let stepIndex = -1;

      const paintMode = (i) => {
        current = i;
        stepIndex = -1;
        const c = CONCEPTS[CONCEPT_MODES[i]];
        tabs.forEach((b, j) => b.setAttribute('aria-selected', String(j === i)));
        $('[data-acr]').textContent = c.acr;
        $('[data-full]').textContent = c.full;
        $('[data-where]').textContent = c.where;
        $('[data-steps]').innerHTML = c.steps.map((s, j) => `<li data-i="${j}"><span class="mono">${String(j + 1).padStart(2, '0')}</span><span>${s}</span></li>`).join('');
        $('[data-ideas]').innerHTML = c.ideas.map((s) => `<li>${icons.check}<span>${s}</span></li>`).join('');
        const next = CONCEPT_MODES[i + 1];
        $('[data-next-label]').textContent = next ? `Next: ${CONCEPTS[next].acr}` : 'Next slide';
        el.querySelector('.rs-panel').classList.remove('is-done');
      };
      const paintStep = (i) => {
        stepIndex = i;
        el.querySelectorAll('[data-steps] li').forEach((li, j) => {
          li.classList.toggle('is-now', j === i);
          li.classList.toggle('is-done', j < i);
        });
      };

      const scene = new ConceptScene($('[data-stage]'), {
        onMode: paintMode,
        onStep: (m, i) => { if (m === current) paintStep(i); },
        onDone: (m) => { if (m === current) { paintStep(CONCEPTS[CONCEPT_MODES[m]].steps.length); el.querySelector('.rs-panel').classList.add('is-done'); } },
      });
      scene.play(0);

      const onClick = (e) => {
        const tab = e.target.closest('[data-mode]');
        if (tab) scene.play(Number(tab.dataset.mode));
        if (e.target.closest('[data-replay]')) scene.replay();
        if (e.target.closest('[data-next]')) { if (!scene.next()) deck?.next(); }
      };
      el.addEventListener('click', onClick);
      return {
        next: () => scene.next(),
        unmount: () => { el.removeEventListener('click', onClick); scene.unmount(); },
        scene,
        get step() { return stepIndex; },
        get mode() { return current; },
      };
    },
  },
];
