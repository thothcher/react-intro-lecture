// 07 / ORDEAL → the reward: TypeScript. Bugs reached the screen on the previous slide — here is the tool
// that finds a whole class of them while you type. Every error message is the real output of tsc.
import { head } from './helpers.js';
import { highlightLines } from '../components/code.js';
import { icons } from '../components/icons.js';
import { logo, logoTile } from '../components/brands.js';
import { TypeFlow, SCENARIOS } from '../explain/TypeFlow.js';
import { reducedMotion } from '../scene/tween.js';

const STAGE = '07 / ORDEAL';

// ------------------------------------------------------------------ slide 1: the editor

const CODE = `type Product = {
  id: number;
  name: string;
  price: number;
  vegetarian: boolean;
};

export function ProductCard({ p }: { p: Product }) {
  return <strong>{}</strong>;
}`;
const TYPED_LINE = 9;
const FIELDS = [['id', 'number'], ['name', 'string'], ['price', 'number'], ['vegetarian', 'boolean']];

const REASONS = [
  ['shield', 'Mistakes found while typing', 'Typos, wrong types and missing values are underlined before you even save.'],
  ['cursor', 'Autocomplete everywhere', 'The editor knows every field of your data and every prop of every component.'],
  ['blocks', 'Props become a contract', '<span class="mono">&lt;ProductCard p={…} /&gt;</span> must get a real <span class="mono">Product</span> — or it doesn\'t build.'],
  ['shuffle', 'Safe refactoring', 'Rename <span class="mono">price</span> → <span class="mono">unitPrice</span>: every place that needs a change lights up.'],
  ['network', 'The React standard', 'Vite has a <span class="mono">react-ts</span> template, <span class="mono">create-next-app</span> uses TypeScript by default.'],
];

/** The code lines; the typed line gets a live slot between "{" and "}". */
function editorLines() {
  const lines = highlightLines(CODE, 'tsx');
  return lines.map((html, i) => {
    const n = i + 1;
    let body = html || '​';
    if (n === TYPED_LINE) {
      // built by hand: the live slot sits between { and }
      body = '  <span class="tok t-keyword">return</span> <span class="tok t-tag">&lt;strong&gt;</span><span class="tok t-punctuation">{</span>'
        + '<span class="te-typed" data-typed></span><span class="te-caret"></span>'
        + '<span class="tok t-punctuation">}</span><span class="tok t-tag">&lt;/strong&gt;</span>;';
    }
    return `<span class="te-line" data-l="${n}"><span class="te-n">${n}</span><span class="te-c">${body}</span></span>`;
  }).join('');
}

const typedHtml = (text, state) => {
  const m = /^(p)(\.)?([a-z]*)(.*)$/.exec(text);
  if (!m) return text;
  const [, v, dot = '', prop = '', rest = ''] = m;
  const propCls = state === 'error' && prop === 'prise' ? 'te-prop te-squiggle' : 'te-prop';
  return `<span class="te-var">${v}</span>${dot}${prop ? `<span class="${propCls}" data-prop>${prop}</span>` : ''}<span class="te-rest">${rest.replace(/toFixed/, '<span class="te-fn">toFixed</span>').replace(/\((\d)\)/, '(<span class="te-num">$1</span>)')}</span>`;
};

// ------------------------------------------------------------------ slide 2: the lanes

const FILES = {
  js: [
    ['api.js', ['toProduct(raw) {', '  price: raw.price,']],
    ['cart.js', ['cartTotal(product) {', '  return product.price + 2;']],
    ['CartSummary.jsx', ['CartSummary({ total = 0 })', '  {total.toLocaleString(…)}']],
  ],
  ts: [
    ['api.ts', ['toProduct(raw): <t>Product</t> {', '  price: raw.price,']],
    ['cart.ts', ['cartTotal(product: <t>Product</t>) {', '  return product.price + 2;']],
    ['CartSummary.tsx', ['CartSummary({ total = 0 }: <t>Props</t>)', '  {total.toLocaleString(…)}']],
  ],
};

const fileCard = ([name, lines], node) => `
  <div class="tf-file" data-node="${node}">
    <p class="tf-fname mono">${icons.file}<span>${name}</span></p>
    <pre class="tf-code mono">${lines.map((l) => l.replace(/</g, '&lt;').replace(/&lt;t>/g, '<em>').replace(/&lt;\/t>/g, '</em>')).join('\n')}</pre>
  </div>`;

const gate = (kind, node, label) => (kind === 'js'
  ? `<div class="tf-gate tf-gate--off" data-node="${node}"><span class="tf-gate-bar"></span><span class="tf-gate-lbl mono">no check</span></div>`
  : `<div class="tf-gate" data-node="${node}"><span class="tf-gate-bar"></span><span class="tf-gate-lbl mono">${label}</span></div>`);

const lane = (kind) => `
  <section class="tf-lane tf-lane--${kind}" data-lane="${kind}">
    <header class="tf-lane-h">
      ${logoTile(kind)}
      <b>${kind === 'js' ? 'JavaScript' : 'TypeScript'}</b>
      <small>${kind === 'js' ? 'nothing is checked until the code runs' : 'type filters between files, checked while you type'}</small>
    </header>
    <div class="tf-pipe" data-pipe>
      ${fileCard(FILES[kind][0], 'api')}
      ${gate(kind, 'gateA', 'Product')}
      ${fileCard(FILES[kind][1], 'cart')}
      ${gate(kind, 'gateB', 'Props')}
      ${fileCard(FILES[kind][2], 'summary')}
      <div class="tf-screen" data-node="screen">
        <div class="tf-screen-bar"><i></i><i></i><i></i><span class="mono">/cart</span></div>
        <div class="tf-screen-body"><p class="tf-total">Total: <b data-total>—</b></p><span class="tf-tag mono" data-tag></span></div>
      </div>
    </div>
    <div class="tf-out">
      <p class="tf-out-h mono">${kind === 'js' ? `${icons.terminal}browser console` : `${icons.code}editor · problems`}<span class="tf-found" data-found></span></p>
      <div class="tf-out-body" data-out-body></div>
    </div>
  </section>`;

export default [
  {
    id: 'ts-intro',
    stage: STAGE,
    title: 'TypeScript — JavaScript that checks itself',
    min: 2,
    steps: '→ #1: type "p." — autocomplete · → #2: a typo — the red line appears while typing · → #3: the quick fix · → #4: what the build does with the types · ← steps back.',
    notes: `
      <p>Bridge from the previous slide: "Bugs reach the screen. Some of them — wrong types, typos, missing values — can be caught much earlier, while you type." That is <b>TypeScript</b>: JavaScript + types. React projects write it in <code>.tsx</code> files.</p>
      <p>→ #1: type <code>p.</code> — the editor lists every field of <code>Product</code> with its type. It knows the shape of the data.</p>
      <p>→ #2: a typo, <code>prise</code>. The red line appears <b>immediately</b> — the real message from tsc: "Property 'prise' does not exist on type 'Product'. Did you mean 'price'?" In plain JavaScript there is no warning; the user gets "Cannot read properties of undefined (reading 'toFixed')".</p>
      <p>→ #3: one click on the quick fix. → #4: the build <b>removes</b> the types — the browser only ever runs plain JavaScript. TypeScript costs nothing at runtime.</p>
      <p>Why React teams use it: the five points on the right. Honest note: TypeScript adds a little typing work and a learning curve — that is why we start with plain JS in this course.</p>`,
    html: () => `
      ${head(`<span class="ts-title">${logoTile('ts')}TypeScript</span> — JavaScript that checks itself`, 'JavaScript + types. Most new React projects are written in it (.tsx) — the editor checks the code while you type.')}
      <div class="ti">
        <div class="ti-left">
          <div class="te" data-editor>
            <div class="te-tab mono"><span class="te-tab-file">${logo('ts', { size: '1.1em', color: '#3178C6' })}ProductCard.tsx</span><span class="te-tab-hint">your editor (VS Code)</span></div>
            <pre class="te-code mono" data-code>${editorLines()}</pre>
            <div class="te-popup mono" data-popup hidden>${FIELDS.map(([k, ty], i) => `<div class="${i === 0 ? 'is-on' : ''}"><i>${icons.blocks}</i><span>${k}</span><small>${ty}</small></div>`).join('')}</div>
            <div class="te-tip" data-tip hidden>
              <p><span>Property <b class="mono">'prise'</b> does not exist on type <b class="mono">'Product'</b>. Did you mean <b class="mono">'price'</b>?</span> <span class="mono te-tip-code">ts(2551)</span></p>
              <p class="te-fix mono" data-fix>${icons.bolt}Quick fix: change spelling to 'price'</p>
            </div>
            <div class="te-status mono" data-status><span data-problems>${icons.check}0 problems</span><span>TypeScript · TSX</span></div>
          </div>
          <div class="ti-when" data-when hidden>
            <div class="ti-when-js">${logoTile('js')}<div><b>JavaScript</b><span>no warning here. In the browser, later:</span><code class="mono">TypeError: Cannot read properties of undefined (reading 'toFixed')</code><small>found by: a user</small></div></div>
            <div class="ti-when-ts">${logoTile('ts')}<div><b>TypeScript</b><span>a red line — right now, while you type.</span><code class="mono">ts(2551) · Did you mean 'price'?</code><small>found by: you · 0 seconds later</small></div></div>
          </div>
        </div>
        <div class="ti-right">
          <p class="ti-h mono">why React projects use it</p>
          <ol class="ti-reasons">${REASONS.map(([ico, t, d]) => `<li><span class="icon-tile">${icons[ico]}</span><div><h3>${t}</h3><p>${d}</p></div></li>`).join('')}</ol>
        </div>
      </div>
      <div class="ti-build" data-build>
        <div><span class="ti-b-n mono">.tsx</span><code class="mono">({ p }<em>: { p: Product }</em>) =&gt; …</code><small>you write — with types</small></div>
        <span class="ti-b-arrow">${icons.arrow}<small class="mono">npm run build</small></span>
        <div><span class="ti-b-n mono">types removed</span><code class="mono">({ p }<s>: { p: Product }</s>) =&gt; …</code><small>checked, then erased</small></div>
        <span class="ti-b-arrow">${icons.arrow}</span>
        <div>${logoTile('js')}<code class="mono">({ p }) =&gt; …</code><small>the browser runs plain JavaScript</small></div>
      </div>`,
    mount(el) {
      const $ = (s) => el.querySelector(s);
      const typed = $('[data-typed]');
      const popup = $('[data-popup]');
      const tip = $('[data-tip]');
      const when = $('[data-when]');
      const problems = $('[data-problems]');
      const build = $('[data-build]');
      const editor = $('[data-editor]');
      const typedLine = el.querySelector(`[data-l="${TYPED_LINE}"]`);
      let step = 0;
      let timers = [];
      const clear = () => { timers.forEach(clearTimeout); timers = []; };
      const at = (ms, fn) => timers.push(setTimeout(fn, reducedMotion() ? 0 : ms));

      const place = (box, below = true) => {
        const e = editor.getBoundingClientRect();
        const anchor = (typed.querySelector('[data-prop]') || typed).getBoundingClientRect();
        const left = anchor.left - e.left;
        box.style.left = `${left}px`;
        box.style.top = below ? `${anchor.bottom - e.top + 6}px` : '';
        box.style.bottom = below ? '' : `${e.bottom - anchor.top + 8}px`;
      };
      const setProblems = (n) => {
        problems.className = n ? 'is-bad' : '';
        problems.innerHTML = n ? `${icons.cross}${n} problem` : `${icons.check}0 problems`;
      };
      const type = (from, to, state, delay = 70, done) => {
        for (let k = from.length; k <= to.length; k += 1) {
          at((k - from.length) * delay, () => {
            typed.innerHTML = typedHtml(to.slice(0, k), k >= 'p.prise'.length + 1 ? state : 'typing');
            if (k === to.length && done) done();
          });
        }
      };

      const paint = (animate) => {
        clear();
        popup.hidden = true;
        tip.hidden = true;
        when.hidden = step < 2;
        build.classList.toggle('is-on', step >= 4);
        editor.classList.toggle('is-erased', step >= 4);
        typedLine.classList.toggle('is-err', step === 2);
        if (step === 0) { typed.innerHTML = ''; setProblems(0); return; }
        if (step === 1) {
          setProblems(0);
          if (animate) type('', 'p.', 'typing', 160, () => { popup.hidden = false; place(popup); });
          else { typed.innerHTML = typedHtml('p.', 'typing'); popup.hidden = false; place(popup); }
          return;
        }
        if (step === 2) {
          const show = () => { setProblems(1); tip.hidden = false; place(tip, false); };
          if (animate) type('p.', 'p.prise.toFixed(2)', 'error', 75, show);
          else { typed.innerHTML = typedHtml('p.prise.toFixed(2)', 'error'); show(); }
          return;
        }
        // 3 and 4: fixed
        typed.innerHTML = typedHtml('p.price.toFixed(2)', 'ok');
        setProblems(0);
        if (animate && step === 3) {
          const prop = typed.querySelector('[data-prop]');
          prop.animate([{ background: 'rgba(79, 211, 154, 0.55)' }, { background: 'transparent' }], { duration: 1200 * (reducedMotion() ? 0 : 1) });
        }
      };
      paint(false);
      return {
        next() { if (step >= 4) return false; step += 1; paint(true); return true; },
        prev() { if (step <= 0) return false; step -= 1; paint(false); return true; },
        unmount: clear,
        get step() { return step; },
      };
    },
  },

  {
    id: 'ts-flow',
    stage: STAGE,
    title: 'Data on its way — JavaScript vs TypeScript',
    min: 4,
    steps: 'Starts with "correct data". → plays the next case: price sent as text, product not found, a typo in a prop. Click a case to replay it. After the last case → next slide.',
    notes: `
      <p>The same three files in both lanes: <code>api</code> turns the API answer into a product, <code>cart</code> adds $2 delivery, <code>CartSummary</code> shows the total. The cards between the files in the TypeScript lane are the <b>types</b> — each border says what may pass.</p>
      <p><b>1 · correct data:</b> both lanes show $14.00. TypeScript adds nothing visible — it only checks.</p>
      <p><b>2 · price sent as text</b> (very common: many APIs send money as a string). JavaScript: <code>"15.50" + 2</code> is <code>"15.502"</code> — the customer sees a wrong total and there is <b>no error anywhere</b>. TypeScript: the border after <code>api.ts</code> expects <code>price: number</code> — tsc: "Type 'string' is not assignable to type 'number'." The fix: <code>Number(raw.price)</code>.</p>
      <p><b>3 · product not found:</b> <code>getProduct</code> returns <code>null</code> on a 404. JavaScript: "Cannot read properties of null (reading 'price')" — the most common JavaScript error — and a blank page. TypeScript: you must handle <code>null</code> before calling <code>cartTotal</code> (ts2345).</p>
      <p><b>4 · a typo in a prop:</b> <code>totl</code> instead of <code>total</code>. JavaScript: the prop is ignored, the default 0 is used — "Total: $0.00", free pizza. TypeScript: "Property 'totl' does not exist … Did you mean 'total'?"</p>
      <p>Be precise if asked: TypeScript checks the <b>code</b> in the editor and during <code>npm run build</code> (<code>tsc -b</code>); it does not run in the browser. Data coming from the network is still checked at runtime (for example with Zod). Every message on the slide is the real tsc output for these files.</p>`,
    html: () => `
      ${head('Data on its way — JavaScript vs TypeScript', 'The same three files, the same data. Where is the bug found — and by whom?')}
      <div class="tf-scn">
        <div class="tf-tabs" role="tablist">${SCENARIOS.map((s, i) => `<button type="button" role="tab" data-scenario="${i}"><b class="mono">${i + 1}</b><span>${s.tab}</span></button>`).join('')}</div>
        <p class="tf-what"><span data-what></span><code class="mono" data-chip></code></p>
        <button type="button" class="btn" data-replay>${icons.reset}<span>Replay</span></button>
      </div>
      <div class="tf" data-tf>
        ${lane('js')}
        ${lane('ts')}
      </div>
      <div class="tf-foot">
        <span class="tf-score tf-score--js">${logoTile('js')}bugs that reached users: <b data-score-js>0</b></span>
        <span class="tf-score tf-score--ts">${logoTile('ts')}caught while typing: <b data-score-ts>0</b></span>
        <p class="tf-note">TypeScript checks the code you write — in the editor and at build time. Data from the network is still checked at runtime (e.g. with Zod).</p>
      </div>`,
    mount(el, deck) {
      const $ = (s) => el.querySelector(s);
      const tabs = [...el.querySelectorAll('[data-scenario]')];
      const seen = new Set();
      const flow = new TypeFlow($('[data-tf]'), {
        onScenario: (i) => {
          tabs.forEach((b, j) => b.setAttribute('aria-selected', String(j === i)));
          $('[data-what]').textContent = SCENARIOS[i].what;
          $('[data-chip]').textContent = SCENARIOS[i].chip;
        },
        onDone: (i) => {
          seen.add(i);
          const bugs = [...seen].filter((k) => SCENARIOS[k].js.found).length;
          $('[data-score-js]').textContent = bugs;
          $('[data-score-ts]').textContent = bugs;
        },
      });
      const start = setTimeout(() => flow.play(0), reducedMotion() ? 0 : 500);
      const onClick = (e) => {
        const tab = e.target.closest('[data-scenario]');
        if (tab) flow.play(Number(tab.dataset.scenario));
        if (e.target.closest('[data-replay]')) flow.replay();
      };
      el.addEventListener('click', onClick);
      return {
        next: () => { if (flow.current < 0) { flow.play(0); return true; } return flow.next(); },
        unmount: () => { clearTimeout(start); el.removeEventListener('click', onClick); flow.unmount(); },
        flow,
        get scenario() { return flow.current; },
      };
    },
  },
];
