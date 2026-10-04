import { head, IMG, bwImage, snippet } from './helpers.js';
import { flashLines } from '../components/code.js';
import { icons } from '../components/icons.js';
import { logo, logoTile } from '../components/brands.js';
import { monitorsSlide } from './monitors.js';

const STAGE = '04 / MENTOR';

const FRAMEWORKS = [
  { key: 'react', name: 'React', type: 'UI library', by: 'Meta (Facebook)', year: '2013', curve: 3, curveText: 'medium', use: 'SPAs and interfaces; React Native for mobile', pop: 44.7, ours: true },
  { key: 'angular', name: 'Angular', type: 'full framework', by: 'Google', year: '2016', yearNote: 'AngularJS 2010', curve: 5, curveText: 'high — TypeScript, DI, RxJS', use: 'large enterprise applications', pop: 18.2 },
  { key: 'vue', name: 'Vue', type: 'progressive framework', by: 'Evan You (community)', year: '2014', curve: 2, curveText: 'low–medium', use: 'SPAs; adding it step by step to an existing site', pop: 17.6 },
  { key: 'svelte', name: 'Svelte', type: 'compiler framework', by: 'Rich Harris', year: '2016', curve: 2, curveText: 'low', use: 'light, fast applications', pop: 7.2 },
  { key: 'next', name: 'Next.js', type: 'meta-framework on React', by: 'Vercel', year: '2016', curve: 4, curveText: 'medium–high', use: 'SSR / SSG, full-stack React', pop: 20.8 },
];
const dots = (n) => Array.from({ length: 5 }, (_, i) => `<i class="${i < n ? 'on' : ''}"></i>`).join('');

export default [
  {
    id: 'mentor',
    stage: STAGE,
    tone: 'dark',
    title: 'The mentor: React',
    min: 0.5,
    notes: `
      <p>Transition: "We have seen the problem. Now — the mentor."</p>
      <p>React's official definition: <b>"The library for web and native user interfaces"</b> (react.dev). Emphasise: a <b>library</b>, not a framework — we come back to this in the comparison.</p>`,
    html: () => `
      <div class="opener">
        ${bwImage(IMG.abstract, 'opener-img')}
        <div class="opener-text">
          <p class="kicker mono">THE MENTOR</p>
          <h1><span class="opener-logo">${logo('react')}</span>React</h1>
          <p class="lead">A library that builds the interface <b>from data</b>.</p>
          <p class="opener-quote mono">"The library for web and native user interfaces" — react.dev</p>
        </div>
      </div>`,
  },

  {
    id: 'history',
    stage: STAGE,
    title: 'Where React came from',
    min: 1.5,
    notes: `
      <p><b>2011</b> — Jordan Walke (Facebook) builds a prototype, FaxJS; React first ships in the News Feed. <b>2012</b> — Instagram.com.</p>
      <p><b>May 2013</b> — open source at JSConf US. At first many criticised it: "HTML inside JavaScript?!" (JSX).</p>
      <p><b>2015</b> React Native, <b>2019</b> Hooks (16.8), <b>December 2024</b> React 19.</p>
      <p>The problem behind it: the same data appeared in <b>several places</b> on the screen (for example the unread-messages counter), and syncing it by hand kept going wrong. The answer: describe <b>what</b> should be visible — React decides <b>how</b> to change the DOM.</p>`,
    html: () => `
      ${head('Where React came from', 'Facebook\'s interface became so complex that updating the DOM by hand could no longer keep up.')}
      <ol class="timeline">
        <li><span class="tl-year mono">2011</span><p>Jordan Walke's prototype (FaxJS) — Facebook News Feed</p></li>
        <li><span class="tl-year mono">2012</span><p>Instagram.com — built with React</p></li>
        <li class="is-key"><span class="tl-year mono">2013</span><p>May: <b>open source</b>, JSConf US</p></li>
        <li><span class="tl-year mono">2015</span><p>React Native — the same idea on mobile</p></li>
        <li><span class="tl-year mono">2019</span><p>Hooks (React 16.8): <span class="mono">useState</span>, <span class="mono">useEffect</span></p></li>
        <li><span class="tl-year mono">2024</span><p>React 19</p></li>
      </ol>
      <div class="problem">
        <div class="problem-card problem-card--bad">
          <span class="icon-tile">${icons.cross}</span>
          <span class="kicker mono">the problem</span>
          <p>The same data — for example the number of unread messages — appeared in several places on the screen, and when updated by hand the places often <b>disagreed</b>.</p>
        </div>
        <div class="problem-card problem-card--good">
          <span class="icon-tile">${icons.check}</span>
          <span class="kicker mono">the idea</span>
          <p>Describe <b>what</b> should be visible for the given data. <b>How</b> the DOM changes — React decides.</p>
        </div>
      </div>`,
  },

  {
    id: 'components',
    stage: STAGE,
    title: 'Idea 1 — components',
    min: 1.5,
    notes: `
      <p>A component = <b>a function that returns a piece of UI</b>. Its name starts with a capital letter: <code>ProductCard</code>.</p>
      <p>The tree comes from our React project: <code>Layout</code> contains <code>Header</code> once; every page appears in place of <code>&lt;Outlet /&gt;</code>.</p>
      <p>Menu uses one <code>ProductCard</code> 12 times with different data — via props (we will see this in Trial 1).</p>`,
    html: () => `
      ${head('Idea 1 — components', 'The UI is a tree of independent pieces. Each piece is a function that returns UI.')}
      <div class="comp">
        <ul class="tree mono">
          <li><span class="node">&lt;App /&gt;</span><span class="tree-file">App.jsx</span>
            <ul>
              <li><span class="node">&lt;Layout /&gt;</span><span class="tree-file">components/Layout.jsx</span>
                <ul>
                  <li><span class="node node--key">&lt;Header /&gt;</span><span class="tree-note">once — for every page</span></li>
                  <li><span class="node">&lt;Outlet /&gt;</span><span class="tree-note">the current route appears here</span>
                    <ul>
                      <li><span class="node">&lt;Menu /&gt;</span><span class="tree-file">pages/Menu.jsx</span>
                        <ul><li><span class="node node--key">&lt;ProductCard /&gt;</span><span class="tree-note">× 12, with different data</span></li></ul>
                      </li>
                    </ul>
                  </li>
                  <li><span class="node">&lt;footer&gt;</span></li>
                </ul>
              </li>
            </ul>
          </li>
        </ul>
        ${snippet('s11-card', { file: 'src/components/ProductCard.jsx', tag: 'abridged', hl: '1, 8' })}
      </div>
      <p class="idea-foot"><span class="kicker mono">the rule</span><span>A <b>component</b> is a JavaScript function that returns JSX. Its name starts with a capital letter: <span class="mono">Header</span>, <span class="mono">ProductCard</span>.</span></p>`,
  },

  {
    id: 'single-source',
    stage: STAGE,
    title: 'Idea 2 — a single source of truth',
    min: 1.5,
    notes: `
      <p>Every piece of data has <b>one home</b>. Whoever shows it reads it from there — there are no copies, so nothing can drift apart.</p>
      <p>An example from our project: the cart count lives in the store; the Header badge reads it with <code>useStore()</code>. The store changes → every reader updates.</p>
      <p>The same with the header: <code>&lt;Header /&gt;</code> is described once and every page uses it — instead of 10 copies.</p>`,
    html: () => `
      ${head('Idea 2 — a single source of truth', 'Every piece of data has one home. Whoever shows it reads it from there — no copies, so nothing drifts apart.')}
      <div class="ssot">
        <div class="ssot-diagram">
          <div class="ssot-source"><span class="kicker mono">store</span><b class="mono">cartCount = 4</b></div>
          <svg class="ssot-lines" viewBox="0 0 300 120" preserveAspectRatio="none" aria-hidden="true">
            <path d="M150 0 V40 M50 40 H250 M50 40 V120 M150 40 V120 M250 40 V120" fill="none" stroke="currentColor" stroke-width="1.5" vector-effect="non-scaling-stroke"/>
          </svg>
          <div class="ssot-readers">
            <div><span class="mono">&lt;Header /&gt;</span><small>badge: Cart 4</small></div>
            <div><span class="mono">&lt;Cart /&gt;</span><small>Items: 4</small></div>
            <div><span class="mono">Checkout</span><small>4 items</small></div>
          </div>
        </div>
        ${snippet('s12-store', { file: 'src/components/Layout.jsx', tag: 'abridged', hl: '2, 5' })}
      </div>
      <p class="idea-foot"><span class="kicker mono">vs vanilla</span><span>In vanilla we call <span class="mono">renderHeader()</span> by hand on every change (<span class="mono">store.subscribe</span>). In React — <span class="mono">useStore()</span>, and the Header updates itself.</span></p>`,
  },

  {
    id: 'declarative',
    stage: STAGE,
    title: 'Idea 3 — declarative UI',
    min: 1.5,
    notes: `
      <p><b>UI = f(state)</b> — the interface is a function of the state.</p>
      <p>Press <b>+</b> / <b>−</b>: on the left, the lines <b>you</b> have to write and run on every change light up (imperative). The counter counts DOM operations.</p>
      <p>On the right the code <b>never</b> changes — you only describe what should be visible. React changes the DOM.</p>
      <p>Go down to 0: on the left another branch runs (<code>hidden = true</code>) — you have to think of that too. On the right — the same single line.</p>`,
    html: () => `
      ${head('Idea 3 — declarative UI', 'UI = f(state). Describe what should be visible — not how the DOM should change.')}
      <div class="decl">
        <div class="decl-state">
          <span class="kicker mono">state</span>
          <div class="decl-ctrl">
            <button type="button" class="btn" data-d="-1" aria-label="decrease">${icons.minus}</button>
            <span class="mono decl-val">cartCount = <b data-n>2</b></span>
            <button type="button" class="btn" data-d="1" aria-label="increase">${icons.plus}</button>
          </div>
        </div>
        <div class="decl-col">
          <p class="decl-label"><span class="vs-chip vs-chip--vanilla">${logoTile('js')}IMPERATIVE</span> vanilla — you change the DOM</p>
          <div class="mini-header"><span>Trattoria</span><span class="mini-cart">Cart <i data-badge-a>2</i></span></div>
          <div data-imp>${snippet('s13-imperative', { file: 'on every change — by you', numbers: true })}</div>
          <p class="decl-count">your DOM operations: <b class="mono" data-ops>0</b></p>
        </div>
        <div class="decl-col">
          <p class="decl-label"><span class="vs-chip vs-chip--react">${logoTile('react')}DECLARATIVE</span> React — you describe the result</p>
          <div class="mini-header"><span>Trattoria</span><span class="mini-cart">Cart <i data-badge-b>2</i></span></div>
          <div data-dec>${snippet('s13-declarative', { file: 'described once', numbers: true })}</div>
          <p class="decl-count">your DOM operations: <b class="mono">0</b> <span class="muted">— React changes the DOM</span></p>
        </div>
      </div>
      <p class="idea-foot"><span class="kicker mono">how</span><span>React keeps the previous "picture" of the UI (the virtual DOM), compares it with the new one and changes <b>only the difference</b> in the real DOM.</span></p>`,
    mount(el) {
      let n = 2;
      let ops = 0;
      const $n = el.querySelector('[data-n]');
      const $ops = el.querySelector('[data-ops]');
      const $a = el.querySelector('[data-badge-a]');
      const $b = el.querySelector('[data-badge-b]');
      const imp = el.querySelector('[data-imp]');
      const dec = el.querySelector('[data-dec]');
      const paint = () => {
        $n.textContent = n;
        [$a, $b].forEach((b) => { b.textContent = n; b.hidden = n === 0; });
      };
      const onClick = (e) => {
        const b = e.target.closest('[data-d]');
        if (!b) return;
        n = Math.max(0, Math.min(9, n + Number(b.dataset.d)));
        paint();
        if (n > 0) { flashLines(imp, '1-4'); ops += 3; } else { flashLines(imp, '1, 5-6'); ops += 2; }
        $ops.textContent = ops;
        flashLines(dec, '1-3', 'is-flash-soft');
      };
      el.addEventListener('click', onClick);
      paint();
      return { unmount: () => el.removeEventListener('click', onClick) };
    },
  },

  {
    id: 'routing',
    stage: STAGE,
    title: 'Idea 4 — routing (SPA)',
    min: 1.5,
    notes: `
      <p><b>SPA</b> — single-page application: one HTML page; the URL changes through the History API and no new page comes from the server.</p>
      <p>React Router: URL → component. <code>&lt;Layout /&gt;</code> (header + footer) stays, only the page in place of <code>&lt;Outlet /&gt;</code> changes.</p>
      <p>"Now let's see it with our own eyes" → next slide (3D).</p>`,
    html: () => `
      ${head('Idea 4 — routing (SPA)', 'URL → component. The browser no longer asks the server for new HTML — only the page content changes.')}
      <div class="routing">
        ${snippet('s14-routes', { file: 'src/App.jsx', tag: 'abridged', hl: '2, 4' })}
        <div class="flows">
          <div class="flow">
            <span class="kicker mono">classic HTML</span>
            <ol class="mono">
              <li>click: Menu</li><li>GET /menu.html</li><li>server → new HTML</li><li class="is-bad">header, main, footer — all over again</li>
            </ol>
          </div>
          <div class="flow flow--spa">
            <span class="kicker mono">${logo('router', { size: '1.2em' })} SPA · React Router</span>
            <ol class="mono">
              <li>click: Menu</li><li>history.pushState('/menu')</li><li>Router → &lt;Menu /&gt;</li><li class="is-good">the header stays, only main changes</li>
            </ol>
          </div>
          <p class="flows-next mono">${icons.arrow}<span>next slide — in 3D</span></p>
        </div>
      </div>`,
  },

  {
    ...monitorsSlide,
    min: 4,
    steps: 'A: click a link on the screen · → or "Next: React" adds the second monitor · "Side view" + "Add a link to the header" on both · the next → moves to a new slide.',
  },

  {
    id: 'landscape',
    stage: STAGE,
    title: 'The framework map',
    min: 1.5,
    notes: `
      <p>React is not the only one. The difference is in the <b>type</b>: a <b>library</b> (your code calls it — React), a <b>framework</b> (it sets the structure and calls your code — Angular, Vue, Svelte), a <b>meta-framework</b> (a framework on top of a library: routing, server rendering, build — Next.js).</p>
      <p>Popularity: Stack Overflow Developer Survey 2025 — "Web frameworks and technologies", all respondents. The numbers = who <b>used</b> it in the past year.</p>
      <p>Stay neutral: none of them is "the best". We learn React because it is the most widespread, and its ideas (components, state, props) carry over everywhere.</p>`,
    html: () => `
      ${head('The framework map', 'The ideas are similar — components and state. The difference is the type, the size, and how much each one decides for you.')}
      <div class="fwc">
        ${FRAMEWORKS.map((f) => `
          <article class="fwc-card ${f.ours ? 'is-ours' : ''}">
            ${f.ours ? '<span class="fwc-badge mono">today</span>' : ''}
            <div class="fwc-top">${logoTile(f.key, 'fwc-logo')}<div><h3>${f.name}</h3><p class="fwc-type mono">${f.type}</p></div></div>
            <dl class="fwc-facts">
              <div><dt>made by</dt><dd>${f.by}</dd></div>
              <div><dt>first release</dt><dd class="mono">${f.year}${f.yearNote ? `<small> · ${f.yearNote}</small>` : ''}</dd></div>
              <div><dt>learning curve</dt><dd><span class="fwc-dots">${dots(f.curve)}</span><small>${f.curveText}</small></dd></div>
              <div><dt>typical use</dt><dd>${f.use}</dd></div>
            </dl>
            <div class="fwc-pop"><span class="fwc-bar"><i style="width:${(f.pop / 44.7) * 100}%"></i></span><b class="mono">${f.pop}%</b><small>used it in 2025*</small></div>
          </article>`).join('')}
      </div>
      <p class="fw-src mono">* Stack Overflow Developer Survey 2025 · Web frameworks and technologies · all respondents · survey.stackoverflow.co/2025</p>`,
  },
];
