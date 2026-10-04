// 06 / TRIALS opens with JSX: what the abbreviation means, what the build turns it into,
// and what finally lands in the DOM — two excerpts from ProductCard.jsx, revealed step by step.
import { head } from './helpers.js';
import { codeBlock, setLines } from '../components/code.js';
import { icons } from '../components/icons.js';

const STAGE = '06 / TRIALS';

const EXAMPLES = [
  {
    label: 'an element and an <span class="mono">{expression}</span>',
    from: 'from ProductCard.jsx',
    jsx: '<h3 className="card-title">\n  {p.name}\n</h3>',
    js: '_jsx("h3", {\n  className: "card-title",\n  children: p.name,\n})',
    html: '<h3 class="card-title">\n  Pizza Prosciutto e Funghi\n</h3>',
    hl: ['1', '2', '1'],
    caps: [
      'loaded straight into a browser → <span class="mono">SyntaxError</span>',
      'tag → function call · attributes → props · content → <span class="mono">children</span>',
      '<span class="mono">className</span> → <span class="mono">class</span> · <span class="mono">{p.name}</span> → real text',
    ],
  },
  {
    label: 'nested tags and <span class="mono">onClick</span>',
    from: 'from ProductCard.jsx, abridged',
    jsx: '<div className="card-foot">\n  <strong className="price">\n    {price(p.price)}\n  </strong>\n  <button onClick={() => add(p.id, 1)}>\n    Add\n  </button>\n</div>',
    js: '_jsxs("div", {\n  className: "card-foot",\n  children: [\n    _jsx("strong", {\n      className: "price", children: price(p.price) }),\n    _jsx("button", {\n      onClick: () => add(p.id, 1), children: "Add" }),\n  ],\n})',
    html: '<div class="card-foot">\n  <strong class="price">$15.50</strong>\n  <button>Add</button>\n</div>',
    hl: ['1-2', '2, 5', '1-2'],
    caps: [
      'one parent element; every tag is closed — like in XML',
      'nested tags → a <span class="mono">children</span> array · the result is an object <span class="mono">{ type, props }</span>',
      '<span class="mono">onClick</span> is not in the HTML — React attaches the listener itself',
    ],
  },
];

const LANGS = ['jsx', 'javascript', 'markup'];

const slot = (ex, col) => `
  <div class="jsx-slot" data-col="${col + 1}" data-hl="${ex.hl[col]}">
    ${col ? '<span class="jsx-mark">?</span>' : ''}
    ${codeBlock({ code: [ex.jsx, ex.js, ex.html][col], lang: LANGS[col], numbers: false, cls: 'code--jsx' })}
  </div>`;

const arrow = (col) => `<div class="jsx-arrow" data-col="${col}">${icons.arrow}</div>`;

const example = (ex, i) => `
  <p class="jsx-ex"><span class="kicker">example ${i + 1}</span><span>${ex.label}</span><span class="muted">${ex.from}</span></p>
  ${slot(ex, 0)}${arrow(2)}${slot(ex, 1)}${arrow(3)}${slot(ex, 2)}
  <p class="jsx-cap is-on">${ex.caps[0]}</p><span></span>
  <p class="jsx-cap" data-col="2">${ex.caps[1]}</p><span></span>
  <p class="jsx-cap" data-col="3">${ex.caps[2]}</p>`;

export default [
  {
    id: 'jsx-intro',
    stage: STAGE,
    title: 'JSX — JavaScript XML',
    min: 3,
    steps: '→ #1: the build output (JavaScript) · → #2: the HTML in the browser · → #3: the question · → #4: the answer · ← steps back.',
    notes: `
      <p><b>JSX = JavaScript XML.</b> An HTML-like notation that we write inside JavaScript. It follows XML-like rules: every tag must be closed (<code>&lt;img /&gt;</code>), and a component returns one parent element.</p>
      <p>Browsers don't understand JSX — load it directly and you get a <code>SyntaxError</code>. That is why <code>npm run build</code> (Vite) turns every tag into a function call.</p>
      <p>→ #1: <code>&lt;h3 className="card-title"&gt;</code> becomes <code>_jsx("h3", { className: "card-title", children: p.name })</code>. Attributes → object properties (props), content → <code>children</code>. With several children — <code>_jsxs</code> and an array. Older code wrote the same as <code>React.createElement("h3", {…}, p.name)</code>.</p>
      <p><code>_jsx()</code> returns a plain object — <code>{ type: "h3", props: {…} }</code>. That is a "React element"; a tree of such objects = the virtual DOM (the animated explainer on the next slide shows how React compares them).</p>
      <p>→ #2: React creates the real DOM from these objects. <code>className</code> becomes <code>class</code> in HTML. <code>onClick</code> does not appear in the HTML at all — React attaches the listener itself.</p>
      <p>→ #3 the question: "Why <code>className</code> and not <code>class</code>?" Give 20–30 seconds. Hint: look at column 02 — what does JSX become in the end?</p>
      <p>→ #4: JSX becomes JavaScript, and attributes become properties of a JavaScript object. <code>class</code> is a reserved word in JavaScript (<code>class Cart {}</code>), so React uses the DOM property name: <code>element.className</code>. For the same reason <code>for</code> → <code>htmlFor</code>; events are written in camelCase: <code>onclick</code> → <code>onClick</code>.</p>`,
    html: () => `
      ${head('JSX — <span class="jsx-title"><b>J</b>ava<b>S</b>cript <b>X</b>ML</span>', 'An HTML-like notation inside JavaScript. Browsers don\'t understand it — the build turns it into JavaScript.')}
      <div class="jsx" data-jsx>
        <div class="jsx-head"><span class="jsx-num mono">01</span><b>JSX</b><small>what we write</small></div>
        <div class="jsx-pipe" data-col="2"><span class="mono">npm run build</span>${icons.arrow}</div>
        <div class="jsx-head"><span class="jsx-num mono">02</span><b>JavaScript</b><small>after the build · <span class="mono">react/jsx-runtime</span></small></div>
        <div class="jsx-pipe" data-col="3"><span class="mono">React</span>${icons.arrow}</div>
        <div class="jsx-head"><span class="jsx-num mono">03</span><b>HTML · DOM</b><small>what the browser shows</small></div>
        ${EXAMPLES.map(example).join('')}
        <div class="jsx-quiz" data-q>
          <span class="jsx-quiz-tag mono">question</span>
          <div>
            <p class="jsx-quiz-q">Why does JSX use <span class="mono">className</span> and not <span class="mono">class</span>?</p>
            <p class="jsx-quiz-a" data-a><b>Answer:</b> JSX ends up as JavaScript (02), and attributes become object properties. <span class="mono">class</span> is a reserved word in JavaScript — <span class="mono">class Cart {}</span> — so React uses the DOM name: <span class="mono">element.className</span>. For the same reason <span class="mono">for</span> → <span class="mono">htmlFor</span>.</p>
          </div>
          <span class="jsx-quiz-hint mono">→ answer</span>
        </div>
      </div>`,
    mount(el) {
      const root = el.querySelector('[data-jsx]');
      const quiz = root.querySelector('[data-q]');
      const answer = root.querySelector('[data-a]');
      let step = 0;
      const paint = () => {
        const upTo = Math.min(step, 2) + 1;
        root.querySelectorAll('[data-col]').forEach((n) => n.classList.toggle('is-on', Number(n.dataset.col) <= upTo));
        root.querySelectorAll('.jsx-slot').forEach((s) => {
          setLines(s, '1-20', 'is-hl', false);
          if (step >= 3) setLines(s, s.dataset.hl, 'is-hl', true);
        });
        quiz.classList.toggle('is-on', step >= 3);
        quiz.classList.toggle('is-answered', step >= 4);
        answer.classList.toggle('is-on', step >= 4);
      };
      paint();
      return {
        next() { if (step >= 4) return false; step += 1; paint(); return true; },
        prev() { if (step <= 0) return false; step -= 1; paint(); return true; },
      };
    },
  },
];
