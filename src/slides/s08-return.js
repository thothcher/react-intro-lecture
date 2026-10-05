import { head, IMG, bwImage, snippet } from './helpers.js';
import { codeBlock } from '../components/code.js';
import { icons } from '../components/icons.js';
import { logo, logoTile } from '../components/brands.js';
import { mountFlashcards } from '../components/flashcards.js';

const STAGE = '08 / RETURN';

// [term, category, definition, example]
const CATS = {
  core: ['Core', '#2B62C4'],
  render: ['Rendering', '#7B4FD1'],
  arch: ['Architecture', '#1C807A'],
  deliver: ['Delivery', '#C27A1A'],
  safety: ['Safety', '#B8332A'],
};
const VOCAB = [
  ['Component', 'core', 'A reusable function that returns a piece of UI.', '<ProductCard p={p} />'],
  ['Props', 'core', 'Inputs passed into a component, like function arguments. Read-only.', 'p={pizza}'],
  ['State', 'core', 'Data a component remembers between renders; changing it updates the UI.', 'useState(1)'],
  ['Hook', 'core', 'A function starting with "use" that plugs React features into a component.', 'useState · useEffect'],
  ['useState', 'core', 'A hook that returns [value, setValue]; calling setValue triggers a re-render.', 'const [qty, setQty] = …'],
  ['useEffect', 'core', 'A hook for side effects after render — for example, fetching data.', 'useEffect(() => {…}, [id])'],
  ['JSX', 'core', 'HTML-like syntax inside JavaScript that compiles to React elements.', '<h1>{title}</h1>'],
  ['key', 'core', 'A stable id for list items, so React can tell them apart between renders.', 'key={p.id}'],
  ['Re-render', 'render', 'React calling a component again to compute its new UI after state or props change.', 'setQty → render #2'],
  ['Virtual DOM', 'render', 'An in-memory description of the UI as plain objects; React compares versions of it.', '{ type: "h1", props }'],
  ['Reconciliation', 'render', 'Comparing the new UI description with the previous one and changing only the differences in the DOM.', '"2" → "3": 1 change'],
  ['Declarative', 'render', 'Describing what the UI should look like for a given state, not the steps to change it.', 'UI = f(state)'],
  ['Imperative', 'render', 'Writing every DOM change step by step yourself.', 'el.textContent = …'],
  ['Hydration', 'render', 'React attaching state and event handlers to HTML that was already rendered on the server.', 'hydrateRoot()'],
  ['Single source of truth', 'arch', 'Each piece of data lives in one place; everything else reads from it.', 'store.cartCount'],
  ['Routing', 'arch', 'Mapping a URL to the content that should be shown.', '/menu → <Menu />'],
  ['SPA', 'arch', 'Single-page application: one HTML page; the content changes without full page reloads.', 'index.html + JS'],
  ['Client-side routing', 'arch', 'Changing the URL and the view in the browser (History API) without asking the server for a new page.', 'history.pushState'],
  ['Library vs framework', 'arch', 'Your code calls a library (React); a framework calls your code and sets the structure (Angular).', 'React · Angular'],
  ['Meta-framework', 'arch', 'A framework on top of a library that adds routing, server rendering and build tools.', 'Next.js'],
  ['CSR', 'deliver', 'Client-side rendering: the browser builds the page with JavaScript.', 'Vite + React'],
  ['SSR', 'deliver', 'Server-side rendering: the server builds the HTML on every request.', 'Next.js'],
  ['SSG', 'deliver', 'Static site generation: every page is built once, at build time.', 'npm run build'],
  ['ISR', 'deliver', 'Incremental static regeneration: static pages are rebuilt in the background after a set time.', 'revalidate: 60'],
  ['XSS', 'safety', 'Cross-site scripting: injected HTML/JS that runs inside your page. React escapes text by default.', 'dangerouslySetInnerHTML'],
];

const RECAP = [
  ['03', 'REFUSAL', '#B4473A', 'explain why a copy-pasted header does not scale — and what "our own framework" costs'],
  ['04', 'MENTOR', '#5B4DB5', 'tell client-side routing from a full page load; explain UI = f(state)'],
  ['06', 'TRIALS · JSX', '#2B62C4', 'read JSX, split the UI into components and pass data with <span class="mono">props</span>'],
  ['06', 'TRIALS · state', '#2B62C4', 'keep data in <span class="mono">useState</span> and rely on re-rendering; know what hooks are'],
  ['06', 'TRIALS · lists', '#2B62C4', 'turn API data into components with <span class="mono">.map()</span> — with a <span class="mono">key</span>'],
  ['06', 'TRIALS · 4–6', '#2B62C4', 'explain reconciliation and the virtual DOM, built-in XSS protection and listener cleanup'],
  ['07', 'ORDEAL', '#B8332A', 'spot state-mutation and missing-<span class="mono">key</span> bugs; explain what TypeScript checks — and when'],
  ['08', 'RETURN', '#2E7D4F', 'compare CSR, SSR, SSG and ISR — where the HTML is built and what it means for SEO'],
];

const TERMINAL = `$ node -v
v22.11.0
$ npm create vite@latest trattoria -- --template react
$ cd trattoria
$ npm install
$ npm run dev
  ➜  Local:   http://localhost:5173/`;

const FIRST_APP = `import { useState } from 'react';

function Hello({ name }) {
  return <h1>Hello, {name}!</h1>;
}

export default function App() {
  const [count, setCount] = useState(0);
  return (
    <main>
      <Hello name="Trattoria" />
      <button onClick={() => setCount(count + 1)}>
        Clicked {count} times
      </button>
    </main>
  );
}`;

export default [
  {
    id: 'recap',
    stage: STAGE,
    title: 'What you can do now',
    min: 1,
    notes: `
      <p>Let's walk the journey back: each line matches one stage (the stage number on the left).</p>
      <p>Ask one student to explain in their own words <b>why</b> the screen did not update on the "Spot the bug" slide.</p>`,
    html: () => `
      ${head('What you can do now', 'Things you could not do at the start of this lecture.')}
      <ol class="recap-list">
        ${RECAP.map(([n, stage, c, text]) => `<li style="--c:${c}"><span class="recap-stage"><b class="mono">${n}</b><span class="mono">${stage}</span></span><p>${text}</p><span class="recap-check">${icons.check}</span></li>`).join('')}
      </ol>`,
  },

  {
    id: 'vocabulary',
    stage: STAGE,
    tone: 'game',
    title: 'Vocabulary — flashcards',
    min: 2,
    steps: 'Click a card to flip it · R or "Random card" puts one card in the spotlight · → flips it, → again closes it · after the last card → moves on.',
    notes: `
      <p><b>A game.</b> Press <b>R</b> (or "Random card"): one card comes to the centre with only the term visible. Ask a student "What is it?" — then press <b>→</b> to flip it and read the definition. → again puts it back (it stays revealed in the grid).</p>
      <p>You can also click any card to flip it in place. "Shuffle" mixes the deck; "Reset" turns everything face down.</p>
      <p>The colour = the topic: core, rendering, architecture, delivery, safety. These are the words students will meet in the official docs (react.dev).</p>`,
    html: () => `
      ${head('Vocabulary — flashcards', 'Name it before you flip it. Click a card — or press R for a random one.')}
      <div class="fc-bar">
        <div class="fc-legend">${Object.values(CATS).map(([name, c]) => `<span style="--c:${c}"><i></i>${name}</span>`).join('')}</div>
        <span class="fc-score mono">revealed <b data-score>0</b> / ${VOCAB.length}</span>
        <button type="button" class="btn btn-solid" data-random>${icons.dice}<span>Random card</span><kbd>R</kbd></button>
        <button type="button" class="btn btn-ghost" data-shuffle>${icons.shuffle}<span>Shuffle</span></button>
        <button type="button" class="btn btn-ghost" data-reset>${icons.reset}<span>Reset</span></button>
      </div>
      <div class="fc-grid" data-grid>
        ${VOCAB.map(([term, cat, def, ex], i) => `
          <button type="button" class="fc" data-i="${i}" style="--c:${CATS[cat][1]}" aria-label="${term} — flip">
            <span class="fc-inner">
              <span class="fc-face fc-front">
                <span class="fc-n mono">${String(i + 1).padStart(2, '0')}</span>
                <span class="fc-term">${term}</span>
                <span class="fc-cat mono">${CATS[cat][0]}</span>
              </span>
              <span class="fc-face fc-back">
                <span class="fc-bterm mono">${term}</span>
                <span class="fc-def">${def}</span>
                <span class="fc-ex mono">${ex.replace(/</g, '&lt;')}</span>
              </span>
            </span>
          </button>`).join('')}
      </div>
      <div class="fc-spot" data-spot hidden>
        <div class="fc-spot-card" data-spot-card></div>
        <p class="fc-spot-hint mono" data-spot-hint>What is it? · → flip</p>
      </div>`,
    mount: (el) => mountFlashcards(el, VOCAB.length),
  },

  {
    id: 'getting-started',
    stage: STAGE,
    title: 'Start your own React app',
    min: 2,
    notes: `
      <p>The whole path from an empty folder to a published site — what students will do in the practice part and at home.</p>
      <p>1) Node.js LTS from nodejs.org (it brings npm). 2) Vite creates the project. 3) <code>npm install</code> once, <code>npm run dev</code> every time you work. 4) Where things live: <code>index.html</code> has <code>&lt;div id="root"&gt;</code>, <code>src/main.jsx</code> mounts <code>&lt;App /&gt;</code> there, you write in <code>src/App.jsx</code>. 5) Components, props, useState — exactly what we saw today. 6) <code>npm run build</code> makes the static <code>dist/</code> folder that GitHub Pages, Netlify or Vercel can host.</p>
      <p>Mention: create-react-app is deprecated — use Vite (or a framework like Next.js).</p>`,
    html: () => `
      ${head('Start your own React app', 'From an empty folder to a live site — six steps.')}
      <div class="gs">
        <ol class="gs-steps">
          <li>${logoTile('node')}<div><h3>Install Node.js <small class="mono">LTS</small></h3><p>From <span class="mono">nodejs.org</span> — it brings <span class="mono">npm</span>. Check with <span class="mono">node -v</span>.</p></div></li>
          <li>${logoTile('vite')}<div><h3>Create the project</h3><p><span class="mono">npm create vite@latest trattoria -- --template react</span><br><small>with TypeScript: <span class="mono">--template react-ts</span></small></p></div></li>
          <li>${logoTile('npm')}<div><h3>Install &amp; start</h3><p><span class="mono">npm install</span> once, <span class="mono">npm run dev</span> every time → <span class="mono">localhost:5173</span></p></div></li>
          <li><span class="logo-tile gs-ico">${icons.folder}</span><div><h3>Know the three files</h3><p><span class="mono">index.html</span> → <span class="mono">src/main.jsx</span> <small>(createRoot)</small> → <span class="mono">src/App.jsx</span> <small>(your code)</small></p></div></li>
          <li>${logoTile('react')}<div><h3>Components, props, state</h3><p>One function per piece of UI, data in through props, memory with <span class="mono">useState</span>.</p></div></li>
          <li><span class="logo-tile gs-ico gs-ico--go">${icons.rocket}</span><div><h3>Build &amp; publish</h3><p><span class="mono">npm run build</span> → <span class="mono">dist/</span> → GitHub Pages · Netlify · Vercel</p></div></li>
        </ol>
        <div class="gs-code">
          ${codeBlock({ code: TERMINAL, lang: 'bash', file: 'terminal', numbers: false, hl: '3, 6' })}
          ${codeBlock({ code: FIRST_APP, lang: 'jsx', file: 'src/App.jsx', tag: 'your first component', hl: '3-5, 8' })}
        </div>
      </div>`,
  },

  {
    id: 'practice',
    stage: STAGE,
    title: 'Your task — Trattoria Lite',
    min: 1,
    timeNote: 'then a 10 min break (B) · then 45 min of practice',
    notes: `
      <p>Start the <b>coffee break</b> here: B or the cup icon in the top-right corner (10:00).</p>
      <p>The practice rhythm: 5 / 10 / 10 / 10 / 10 min. At the end of every step — one student's screen on the projector.</p>
      <p><code>API_KEY</code> — the lecturer hands it out (from <code>src/config.js</code> in our project). Use <code>useEffect</code> as a template today — the details come in the next lecture.</p>
      <p>For those who finish early: the bonus list on the right.</p>`,
    html: () => `
      ${head('Your task — Trattoria Lite', 'Your own small restaurant in React, using the same API. 45 minutes, in five steps.')}
      <div class="task">
        <ol class="task-steps">
          <li><span class="task-min mono">05′</span><div><h3>Create the project</h3><p>Vite + React, <span class="mono">npm run dev</span> — see the starter page.</p></div></li>
          <li><span class="task-min mono">10′</span><div><h3><span class="mono">&lt;Header /&gt;</span></h3><p>Logo + 3 links; use it in <span class="mono">App</span>.</p></div></li>
          <li><span class="task-min mono">10′</span><div><h3><span class="mono">&lt;ProductCard /&gt;</span> with props</h3><p>name, price, image; 3 cards from an array with <span class="mono">.map()</span> — and a <span class="mono">key</span>.</p></div></li>
          <li><span class="task-min mono">10′</span><div><h3><span class="mono">useState</span></h3><p>A quantity counter (+ / −) and the total price.</p></div></li>
          <li><span class="task-min mono">10′</span><div><h3>Real data</h3><p><span class="mono">/api/categories</span> → a list of categories. Then the products.</p></div></li>
        </ol>
        <div class="task-side">
          <section class="task-card task-card--done">
            <h3>${icons.check}Done when…</h3>
            <ul>
              <li>at least 3 components: <span class="mono">App</span>, <span class="mono">Header</span>, <span class="mono">ProductCard</span></li>
              <li>cards get their data <b>only</b> through props</li>
              <li>the list is rendered with <span class="mono">.map()</span> and a stable <span class="mono">key</span></li>
              <li>quantity and total come from <span class="mono">useState</span></li>
              <li>no <span class="mono">querySelector</span> / <span class="mono">innerHTML</span> anywhere</li>
            </ul>
          </section>
          <section class="task-card task-card--bonus">
            <h3>${icons.bolt}Bonus</h3>
            <ul>
              <li>a Vegetarian filter — <span class="mono">/api/products/filter?Vegetarian=true</span></li>
              <li>loading and error states</li>
              <li>publish it: <span class="mono">npm run build</span> → GitHub Pages</li>
            </ul>
          </section>
          ${snippet('s28-fetch', { file: 'src/App.jsx', tag: 'template', hl: '5', cls: 'code--compact' })}
          <p class="task-hand mono">${logo('github', { size: '1.2em', color: '#0B1B3A' })}<span>hand in: the GitHub repo link + the live link</span></p>
        </div>
      </div>`,
  },

  {
    id: 'thanks',
    stage: STAGE,
    tone: 'image',
    title: 'Thank you',
    notes: `
      <p>Thanks + questions. Share the live links and GitHub repositories so students can compare the two versions at home.</p>
      <p>Next lecture: <code>useEffect</code>, forms and routing in practice.</p>`,
    html: () => `
      <div class="thanks">
        ${bwImage(IMG.facade, 'thanks-img')}
        <div class="thanks-text">
          <h1>Thank you.</h1>
          <p class="thanks-q">Questions?</p>
          <dl class="thanks-links mono">
            <div><dt>${logo('js', { size: '1.2em' })}vanilla</dt><dd>thothcher.github.io/restaurant-vanilla-js</dd></div>
            <div><dt>${logo('react', { size: '1.2em', color: '#149ECA' })}react</dt><dd>thothcher.github.io/restaurant-react</dd></div>
            <div><dt>${logo('github', { size: '1.2em', color: '#0B1B3A' })}code</dt><dd>github.com/thothcher</dd></div>
          </dl>
          <p class="thanks-credits">Photos (Unsplash): ${[IMG.architecture, IMG.workspace, IMG.abstract, IMG.towers, IMG.facade].map((i) => i.author).join(' · ')}</p>
        </div>
      </div>`,
  },
];
