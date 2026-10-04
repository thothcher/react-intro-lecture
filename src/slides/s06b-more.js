// More trials: three live "vanilla vs React" demos (real DOM code next to real React),
// a quiz, and a summary of what React gives us — with numbers from our two projects.
import { head } from './helpers.js';
import { codeBlock } from '../components/code.js';
import { mountQuiz } from '../components/quiz.js';
import { icons } from '../components/icons.js';
import { logoTile } from '../components/brands.js';
import { mountReconcileDemo } from '../demos/reconcile.jsx';
import { mountXssDemo } from '../demos/xss.jsx';
import { mountListenersDemo } from '../demos/listeners.jsx';
import { quizHead } from './quizHead.js';

const STAGE = '06 / TRIALS';
const code = (c, opts = {}) => codeBlock({ code: c, lang: 'jsx', numbers: false, cls: 'code--strip', ...opts });
const label = (kind, how) => `<p class="trial-label"><span class="vs-chip vs-chip--${kind}">${logoTile(kind === 'vanilla' ? 'js' : 'react')}${kind === 'vanilla' ? 'VANILLA' : 'REACT'}</span><span class="mono demo-how">${how}</span></p>`;

export default [
  {
    id: 'trial-reconcile',
    stage: STAGE,
    title: 'Trial 4 — only what changed',
    min: 2.5,
    notes: `
      <p>Both headers <b>really</b> work: on the left — <code>innerHTML</code> (exactly like our <code>renderHeader()</code>), on the right — a real React component. The numbers are measured by a <b>MutationObserver</b> — this is not a simulation.</p>
      <p>Press <b>+ add to cart</b>: on the left the whole tree lights up red — 18 elements were deleted and created again. On the right — just one text: "2" → "3".</p>
      <p>Why it matters: a new element = lost focus, hover, animation, text typed into an input. The bottom line checks it: "the Menu link — is it the same element?"</p>
      <p>This is <b>reconciliation</b>: React compares the new JSX with the previous one (the virtual DOM) and changes only the difference. Go down to 0: React removes 1 element (the badge), vanilla — 18 again.</p>`,
    html: () => `
      ${head('Trial 4 — only what changed', 'Adding to the cart changes one digit. What does the browser delete and recreate? A MutationObserver measures it.')}
      <div class="demo-ctrl">
        <span class="kicker mono">state</span>
        <button type="button" class="btn" data-d="-1" aria-label="decrease">${icons.minus}</button>
        <span class="mono demo-val">cartCount = <b data-n>2</b></span>
        <button type="button" class="btn btn-solid" data-d="1">${icons.plus}<span>add to cart</span></button>
      </div>
      <div class="demo-cols">
        <section class="demo-col">
          ${label('vanilla', '$header.innerHTML = template')}
          <div class="mh" data-v-header></div>
          <p class="demo-stat" data-v-stat>press "add to cart"</p>
          <ul class="tree-live mono" data-v-tree></ul>
          <p class="demo-same" data-v-same></p>
          ${code('store.subscribe(renderHeader);   // on every change → $header.innerHTML = `…`', { lang: 'javascript', cls: 'code--strip code--bottom' })}
        </section>
        <section class="demo-col">
          ${label('react', 'reconciliation')}
          <div class="mh" data-r-header></div>
          <p class="demo-stat" data-r-stat>press "add to cart"</p>
          <ul class="tree-live mono" data-r-tree></ul>
          <p class="demo-same" data-r-same></p>
          ${code('Cart{cartCount > 0 && <span className="count">{cartCount}</span>}', { cls: 'code--strip code--bottom' })}
        </section>
      </div>`,
    mount: (el) => mountReconcileDemo(el),
  },

  {
    id: 'trial-xss',
    stage: STAGE,
    title: 'Trial 5 — safe by default',
    min: 2,
    notes: `
      <p>The scenario: a product arrives from the API whose name someone filled with HTML. This is <b>XSS</b> (cross-site scripting).</p>
      <p>On the left — <code>innerHTML</code> without esc(): the browser reads the name as HTML and the <code>onerror</code> script <b>really runs</b> (here it only turns the panel red; in a real attack it would steal the token).</p>
      <p>Turn on "esc()" — vanilla becomes safe. In our vanilla project esc() is written <b>37 times</b>: one omission is enough.</p>
      <p>On the right — real React: <code>{p.name}</code> is always text. The dangerous path exists, but its name warns you: <code>dangerouslySetInnerHTML</code>.</p>`,
    html: () => `
      ${head('Trial 5 — safe by default', 'Someone put HTML into a product name that came from the API. What happens on the screen?')}
      <div class="xss-ctrl">
        <label class="xss-input"><span class="kicker mono">p.name (from the API)</span><input type="text" data-name spellcheck="false"></label>
        <div class="xss-presets">
          <button type="button" class="btn" data-preset="ok">normal name</button>
          <button type="button" class="btn btn-solid" data-preset="bad">malicious name</button>
        </div>
      </div>
      <div class="demo-cols">
        <section class="demo-col xss-side" data-v-side>
          ${label('vanilla', 'innerHTML')}
          <div class="xss-stage"><div data-v-card></div><div class="xss-alarm mono">XSS · someone else's script ran on your page</div></div>
          <div class="xss-row"><span class="xss-chip" data-v-chip></span>
            <label class="xss-toggle"><input type="checkbox" data-esc> turn on <span class="mono">esc()</span></label></div>
          ${code('card.innerHTML = `<h3>${p.name}</h3>`;   // forgot esc()?', { lang: 'javascript' })}
          <p class="demo-note">In our vanilla project <span class="mono">esc()</span> is written <b>37 times</b>. Miss it once — and the hole is open.</p>
        </section>
        <section class="demo-col xss-side">
          ${label('react', '{p.name}')}
          <div class="xss-stage"><div data-r-card></div></div>
          <div class="xss-row"><span class="xss-chip is-good">always text — safe</span></div>
          ${code('<h3>{p.name}</h3>')}
          <p class="demo-note">Escaping is automatic. The dangerous path warns you by its name: <span class="mono">dangerouslySetInnerHTML</span>.</p>
        </section>
      </div>`,
    mount: (el) => mountXssDemo(el),
  },

  {
    id: 'trial-listeners',
    stage: STAGE,
    title: 'Trial 6 — event listeners: who cleans up?',
    min: 2,
    timeNote: 'optional',
    notes: `
      <p><b>A real bug</b> from building our vanilla version: in an SPA the <code>#app</code> container stays while pages change. On every visit the product page called <code>addEventListener</code>, and the old one was never removed.</p>
      <p>On the left (cleanup off): Menu → Product → Menu → Product… every visit adds one more listener. Then press <b>+</b> — the quantity grows not by 1 but <b>by N</b>.</p>
      <p>Turn on "cleanup" — that is the line that is now in our <code>product.js</code>: <code>return () =&gt; root.removeEventListener(...)</code>.</p>
      <p>On the right — React: <code>onClick</code> sits on the element; React adds and removes listeners itself. Always +1. If short on time, skip this slide.</p>`,
    html: () => `
      ${head('Trial 6 — event listeners: who cleans up?', 'In an SPA the pages change but #app stays. If old listeners are not removed, one click runs several times.')}
      <div class="demo-cols">
        <section class="demo-col">
          ${label('vanilla', 'app.addEventListener')}
          <div class="la-app" data-pop-host>
            <nav class="la-nav" data-v-nav><button type="button" data-page="menu">Menu</button><button type="button" data-page="product">Product</button></nav>
            <div data-v-app></div>
          </div>
          <div class="la-metrics">
            <span class="la-metric">listeners on #app: <b data-v-listeners>0</b></span>
            <span class="la-metric">visits to Product: <b data-v-visits>0</b></span>
          </div>
          <label class="xss-toggle"><input type="checkbox" data-cleanup> turn on cleanup <span class="mono">(return () =&gt; removeEventListener)</span></label>
          ${code("app.addEventListener('click', onClick);\nreturn () => app.removeEventListener('click', onClick);   // forgot?", { lang: 'javascript', hl: 2 })}
        </section>
        <section class="demo-col">
          ${label('react', 'onClick')}
          <div data-r-app></div>
          <div class="la-metrics">
            <span class="la-metric is-good">listeners: <b>managed by React</b></span>
            <span class="la-metric">visits to Product: <b data-r-visits>0</b></span>
          </div>
          <p class="demo-note">Subscribing and cleaning up is React's job — our code only says <b>what</b> should happen on click.</p>
          ${code('<button onClick={() => setQty((q) => q + 1)}>+</button>')}
        </section>
      </div>`,
    mount: (el) => mountListenersDemo(el),
  },

  {
    id: 'quiz-reconcile',
    stage: STAGE,
    tone: 'quiz',
    title: 'Quiz: reconciliation',
    min: 1,
    notes: '<p>Correct: <b>B</b>. React compares the new JSX with the previous one and changes only the difference in the DOM — here one text node. In Trial 4 the MutationObserver measured it: 1 change versus 18.</p>',
    html: () => `${quizHead(5, 'reconciliation')}<div class="quiz-wrap" data-quiz></div>`,
    mount: (el) => mountQuiz(el.querySelector('[data-quiz]'), {
      question: '<span class="mono">cartCount</span> changed from 2 to 3. What does React change <b>in the DOM</b>?',
      options: [
        'it recreates the whole header',
        'only the text: "2" → "3"',
        'it reloads the page',
        'it removes the badge and adds it again',
      ],
      answer: 1,
      explain: 'This is <b>reconciliation</b>: React compares the new JSX with the previous one (the virtual DOM) and changes only the difference in the real DOM — one text node. Every other element stays the same.',
    }),
  },

  {
    id: 'why-react',
    stage: STAGE,
    title: 'Why React — the summary',
    min: 1.5,
    notes: `
      <p>Six advantages — each comes with a number from our two projects (the bottom line of every card).</p>
      <p>Emphasise: React is not "magic". It does what we hand-wrote in vanilla (router, re-render, escaping, cleanup) — but once, correctly, and tested in thousands of projects.</p>`,
    html: () => `
      ${head('Why React — the summary', 'What we saw in our two projects — and what lies beyond them.')}
      <div class="powers">
        ${[
          ['blocks', 'Components', 'Describe it once — use it everywhere, with props.', '<Field /> — used 22 times in 6 forms'],
          ['equals', 'Declarative UI', 'You describe the result: UI = f(state). React changes the DOM.', 'vanilla: 34 innerHTML writes by hand'],
          ['diff', 'Reconciliation', 'Only what changed is updated — focus and state survive.', 'header: 18 elements → 1 text node'],
          ['shield', 'Safety', 'Escaping is automatic — XSS is closed by default.', 'vanilla: esc() written 37 times'],
          ['cycle', 'Lifecycle', 'Cleaning up listeners and effects has a standard place.', 'vanilla: cleanup by hand on every page'],
          ['network', 'Ecosystem', 'React Router, Next.js, React Native, DevTools — one skill, many platforms.', 'Stack Overflow 2025: used by 44.7%'],
        ].map(([ico, t, d, ev], i) => `
          <article class="power">
            <span class="power-n mono">0${i + 1}</span>
            <span class="power-ico">${icons[ico]}</span>
            <h3>${t}</h3>
            <p>${d}</p>
            <span class="power-ev mono">${ev.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</span>
          </article>`).join('')}
      </div>`,
  },
];
