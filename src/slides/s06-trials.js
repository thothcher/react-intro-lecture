import { head, snippet } from './helpers.js';
import { codeBlock, flashLines } from '../components/code.js';
import { mountQuiz } from '../components/quiz.js';
import { icons } from '../components/icons.js';
import { logoTile } from '../components/brands.js';
import { quizHead } from './quizHead.js';

const STAGE = '06 / TRIALS';

/** One column of a vanilla-vs-React comparison, labelled with the JavaScript or React logo. */
export const side = (kind, label, body, points) => `
  <div class="trial-col trial-col--${kind}">
    <p class="trial-label"><span class="vs-chip vs-chip--${kind}">${logoTile(kind === 'vanilla' ? 'js' : 'react')}${kind === 'vanilla' ? 'VANILLA' : 'REACT'}</span>${label}</p>
    ${body}
    <ul class="trial-points">${points.map((p) => `<li>${p}</li>`).join('')}</ul>
  </div>`;

const quizSlide = ({ id, n, topic, title, min, notes, question, code, options, answer, explain }) => ({
  id,
  stage: STAGE,
  tone: 'quiz',
  title,
  min,
  notes,
  html: () => `${quizHead(n, topic)}<div class="quiz-wrap" data-quiz></div>`,
  mount: (el) => mountQuiz(el.querySelector('[data-quiz]'), {
    question, code: code ? codeBlock({ code, lang: 'jsx', numbers: false, cls: 'code--quiz' }) : '', options, answer, explain,
  }),
});

const PRICE = 15.5; // Pizza Prosciutto e Funghi — the product shown in the screenshots
const money = (n) => `$${n.toFixed(2)}`;

export default [
  {
    id: 'trial-cards',
    stage: STAGE,
    title: 'Trial 1 — repeating UI',
    min: 2,
    notes: `
      <p>One card — 12 products. On the left our vanilla <code>ui.productCard()</code>, on the right React's <code>&lt;ProductCard /&gt;</code>.</p>
      <p>In vanilla the card is <b>a string</b>: escaping by hand (<code>esc()</code>), and the button's behaviour lives <b>in another file</b> — in app.js, on the document (<code>data-add</code>).</p>
      <p>In React, markup and behaviour live in one place; the data comes in through <b>props</b>; <code>{p.name}</code> is escaped automatically.</p>`,
    html: () => `
      ${head('Trial 1 — repeating UI', 'The product card: one template, 12 cards.')}
      <div class="trial">
        ${side('vanilla', 'a string template', snippet('s19-vanilla', { file: 'js/ui.js + js/app.js', tag: 'abridged', hl: '2, 4-5, 7, 12-13' }), [
          'the HTML is a string; it reaches the screen through <span class="mono">innerHTML</span>',
          'XSS protection by hand: <span class="mono">esc()</span> everywhere',
          'the button\'s behaviour is elsewhere: <span class="mono">data-add</span> + a document click handler',
        ])}
        ${side('react', 'a component with props', snippet('s19-react', { file: 'src/components/ProductCard.jsx', tag: 'abridged', hl: '1, 5-6, 9' }), [
          'data comes in through <b>props</b>: <span class="mono">{ p }</span>',
          'escaping is automatic: <span class="mono">{p.name}</span>',
          'markup and behaviour in one place: <span class="mono">onClick</span>',
        ])}
      </div>`,
  },

  quizSlide({
    id: 'quiz-props',
    n: 2,
    topic: 'props',
    title: 'Quiz: props',
    min: 1,
    notes: '<p>Correct: <b>B</b>. Props are the component\'s "arguments". ProductCard receives <code>{ p }</code> and draws the card from it. Props are read-only — the component does not change them.</p>',
    question: 'What does <span class="mono">p={p}</span> do in this line?',
    code: '{items.map((p) => <ProductCard key={p.id} p={p} />)}',
    options: [
      'creates a global variable <span class="mono">p</span>',
      'passes data to the component — as <b>props</b>',
      'requests the product from the API',
      'adds a CSS class <span class="mono">p</span>',
    ],
    answer: 1,
    explain: 'Props are the component\'s "arguments". <span class="mono">ProductCard</span> receives <span class="mono">{ p }</span> and draws the card from it — one component, 12 different products.',
  }),

  {
    id: 'trial-state',
    stage: STAGE,
    title: 'Trial 2 — state',
    min: 2,
    notes: `
      <p>The quantity counter on the product page — from both projects.</p>
      <p>Press <b>+</b> on the left mini counter: lines 6–10 light up — the event, computing the value and <b>two</b> manual DOM writes (<code>qtyEl</code>, <code>totalEl</code>). Forget one and the screen "lies".</p>
      <p>On the right: <code>setQty</code> → React <b>re-renders</b> the component → <code>{qty}</code> and the total update themselves. One source: <code>qty</code>.</p>`,
    html: () => `
      ${head('Trial 2 — state', 'The quantity counter on the product page. Try it below — and watch which lines run.')}
      <div class="trial">
        ${side('vanilla', 'a variable + the DOM by hand', `
          <div data-code>${snippet('s21-vanilla', { file: 'js/pages/product.js', tag: 'abridged', hl: '9-10' })}</div>
          <div class="stepper-demo" data-demo="vanilla">
            <div class="sd-stepper"><button type="button" data-step="-1" aria-label="−">${icons.minus}</button><output data-q>1</output><button type="button" data-step="1" aria-label="+">${icons.plus}</button></div>
            <span class="sd-add">Add to cart · <b data-t>${money(PRICE)}</b></span>
            <span class="sd-note mono">by hand: <b data-ops>0</b> DOM writes</span>
          </div>`, [
          '<span class="mono">qty</span> is a plain variable; the screen knows nothing about it',
          'on every change <b>both</b> places must be updated by hand',
        ])}
        ${side('react', 'useState + re-render', `
          <div data-code>${snippet('s21-react', { file: 'src/pages/Product.jsx', tag: 'abridged', hl: '1, 4, 8' })}</div>
          <div class="stepper-demo" data-demo="react">
            <div class="sd-stepper"><button type="button" data-step="-1" aria-label="−">${icons.minus}</button><output data-q>1</output><button type="button" data-step="1" aria-label="+">${icons.plus}</button></div>
            <span class="sd-add">Add to cart · <b data-t>${money(PRICE)}</b></span>
            <span class="sd-note mono">re-renders: <b data-ops>0</b></span>
          </div>`, [
          '<span class="mono">useState</span> returns <span class="mono">[value, setter]</span>',
          '<span class="mono">setQty</span> → React draws again; the screen always matches <span class="mono">qty</span>',
        ])}
      </div>`,
    mount(el) {
      const demos = [...el.querySelectorAll('[data-demo]')].map((demo) => ({
        kind: demo.dataset.demo, demo, code: demo.previousElementSibling, q: 1, ops: 0,
      }));
      const timers = [];
      const onClick = (e) => {
        const b = e.target.closest('[data-step]');
        if (!b) return;
        const d = demos.find((x) => x.demo.contains(b));
        const step = Number(b.dataset.step);
        d.q = Math.min(99, Math.max(1, d.q + step));
        if (d.kind === 'vanilla') {
          flashLines(d.code, '6-10');
          d.ops += 2;
          d.demo.querySelector('[data-q]').textContent = d.q;
          d.demo.querySelector('[data-t]').textContent = money(PRICE * d.q);
        } else {
          flashLines(d.code, step > 0 ? 5 : 3);
          timers.push(setTimeout(() => {
            flashLines(d.code, '4, 8', 'is-flash-soft');
            d.demo.querySelector('[data-q]').textContent = d.q;
            d.demo.querySelector('[data-t]').textContent = money(PRICE * d.q);
            d.demo.classList.remove('is-render'); void d.demo.offsetWidth; d.demo.classList.add('is-render');
          }, 260));
          d.ops += 1;
        }
        d.demo.querySelector('[data-ops]').textContent = d.ops;
      };
      el.addEventListener('click', onClick);
      return { unmount: () => { el.removeEventListener('click', onClick); timers.forEach(clearTimeout); } };
    },
  },

  quizSlide({
    id: 'quiz-state',
    n: 3,
    topic: 'state',
    title: 'Quiz: state',
    min: 1,
    notes: '<p>Correct: <b>C</b>. Calling the setter tells React "the state changed" → the component runs again and the JSX shows the new value. We never touch the DOM by hand.</p>',
    question: 'What happens after calling <span class="mono">setQty((q) =&gt; q + 1)</span>?',
    options: [
      'nothing, until you refresh the page',
      'you have to change <span class="mono">textContent</span> by hand',
      'React re-renders the component — <span class="mono">{qty}</span> and the total update themselves',
      'a new HTML page is loaded',
    ],
    answer: 2,
    explain: 'The setter tells React that the state changed. React "runs" the component again, compares the new JSX with the old one and changes only the difference in the DOM.',
  }),

  {
    id: 'trial-api',
    stage: STAGE,
    title: 'Trial 3 — API data',
    min: 2,
    notes: `
      <p>Loading the menu from the API. In vanilla every state — loading, empty, error, data — is <b>a separate innerHTML write</b> (the highlighted lines).</p>
      <p>In React: fetch → <b>state</b> → JSX. Every state is visible in one place, as a condition. <code>.map()</code> returns <b>an array of components</b>.</p>
      <p>Notice <code>key={p.id}</code> — we come back to it in the quiz.</p>`,
    html: () => `
      ${head('Trial 3 — API data', 'The menu from the API: loading → data / empty / error.')}
      <div class="trial">
        ${side('vanilla', 'fetch + innerHTML strings', snippet('s23-vanilla', { file: 'js/pages/menu.js', tag: 'abridged', hl: '1, 5-8, 11' }), [
          'every state is a separate <span class="mono">innerHTML</span> write',
          'the HTML is built from strings and <span class="mono">join(\'\')</span>',
        ])}
        ${side('react', 'fetch → state → .map()', snippet('s23-react', { file: 'src/pages/Menu.jsx', tag: 'abridged', hl: '2-4, 8-11' }), [
          'data → <b>state</b> → JSX; the screen always matches the state',
          '<span class="mono">.map()</span> returns an array of components',
        ])}
      </div>`,
  },

  quizSlide({
    id: 'quiz-key',
    n: 4,
    topic: 'lists & key',
    title: 'Quiz: key',
    min: 1,
    notes: '<p>Correct: <b>C</b>. With key React recognises which item is which between two renders — when adding, removing or reordering. A key must be stable and unique (an id), not the array index if the list changes.</p>',
    question: 'Why do we write <span class="mono">key={p.id}</span>?',
    code: '{items.map((p) => <ProductCard key={p.id} p={p} />)}',
    options: [
      'for CSS styling',
      'the API requires it',
      'so React can tell list items apart between renders',
      'to make fetch faster',
    ],
    answer: 2,
    explain: 'A key is an item\'s "ID card". With it React knows which card was added, removed or moved — and changes only those. A stable id is best.',
  }),
];
