// 06 / TRIALS opens with JSX: what the abbreviation means, what the build turns it into,
// and what finally lands in the DOM — two excerpts from ProductCard.jsx, revealed step by step.
import { head } from './helpers.js';
import { codeBlock, setLines } from '../components/code.js';
import { icons } from '../components/icons.js';
import { mountHeaderDemo } from '../demos/header.jsx';

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

const HEADER = `function Header() {
  const { accessToken, user, cartCount } = useStore();
  const [open, setOpen] = useState(false);
  const logout = () => { store.clear(); navigate('/'); };

  return (
    <header className="site-header">
      <Link className="brand" to="/"><Icon name="utensils" /> Trattoria</Link>
      <button className="nav-toggle" onClick={() => setOpen((o) => !o)}>
        <span className="bar" /><span className="bar" /><span className="bar" />
      </button>
      <nav className={\`nav \${open ? 'open' : ''}\`}>
        <NavLink to="/menu">Menu</NavLink>
        {accessToken ? (
          <>
            <NavLink to="/cart">
              <Icon name="bag" /> Cart
              {cartCount > 0 && <span className="count">{cartCount}</span>}
            </NavLink>
            <NavLink to="/profile">{user?.firstName || 'Profile'}</NavLink>
            <button className="btn" onClick={logout}>Sign out</button>
          </>
        ) : (
          <NavLink to="/login">Sign in</NavLink>
        )}
      </nav>
    </header>
  );
}`;

// [title, text, highlighted lines in HEADER]
const HEADER_FEATURES = [
  ['Attributes', 'Like HTML, but <span class="mono">className</span>. Every tag is closed: <span class="mono">&lt;span className="bar" /&gt;</span>.', '7-10'],
  ['{ } — any JavaScript', 'A template string for the class, <span class="mono">{cartCount}</span>, <span class="mono">{user?.firstName || \'Profile\'}</span>.', '12, 18, 20'],
  ['Conditions', '<span class="mono">? :</span> — signed in or guest. <span class="mono">&amp;&amp;</span> — the badge only when the cart isn\'t empty.', '14, 18, 23-25'],
  ['Components &amp; events', 'Capital letter = a component: <span class="mono">&lt;Link&gt;</span>, <span class="mono">&lt;NavLink&gt;</span>, <span class="mono">&lt;Icon /&gt;</span>. Events in camelCase: <span class="mono">onClick={logout}</span>.', '8, 9, 13, 17, 21'],
  ['Fragment <span class="mono">&lt;&gt;…&lt;/&gt;</span>', 'Several elements without an extra <span class="mono">&lt;div&gt;</span> in the DOM.', '15, 22'],
];
const CLASSNAME_LINES = '7, 8, 9, 10, 12, 18, 21';

export default [
  {
    id: 'jsx-intro',
    stage: STAGE,
    title: 'JSX — JavaScript XML',
    min: 2,
    steps: '→ #1: the build output (JavaScript) · → #2: the HTML in the browser · ← steps back. The question comes on the next slide, after a real component.',
    notes: `
      <p><b>JSX = JavaScript XML.</b> An HTML-like notation that we write inside JavaScript. It follows XML-like rules: every tag must be closed (<code>&lt;img /&gt;</code>), and a component returns one parent element.</p>
      <p>Browsers don't understand JSX — load it directly and you get a <code>SyntaxError</code>. That is why <code>npm run build</code> (Vite) turns every tag into a function call.</p>
      <p>→ #1: <code>&lt;h3 className="card-title"&gt;</code> becomes <code>_jsx("h3", { className: "card-title", children: p.name })</code>. Attributes → object properties (props), content → <code>children</code>. With several children — <code>_jsxs</code> and an array. Older code wrote the same as <code>React.createElement("h3", {…}, p.name)</code>.</p>
      <p><code>_jsx()</code> returns a plain object — <code>{ type: "h3", props: {…} }</code>. That is a "React element"; a tree of such objects = the virtual DOM (the animated explainer on the next slide shows how React compares them).</p>
      <p>→ #2: React creates the real DOM from these objects. <code>className</code> becomes <code>class</code> in HTML. <code>onClick</code> does not appear in the HTML at all — React attaches the listener itself.</p>
      <p>Next slide: the same rules in a real component — our Header — and then the question about <code>className</code>.</p>`,
    html: () => `
      ${head('JSX — <span class="jsx-title"><b>J</b>ava<b>S</b>cript <b>X</b>ML</span>', 'An HTML-like notation inside JavaScript. Browsers don\'t understand it — the build turns it into JavaScript.')}
      <div class="jsx" data-jsx>
        <div class="jsx-head"><span class="jsx-num mono">01</span><b>JSX</b><small>what we write</small></div>
        <div class="jsx-pipe" data-col="2"><span class="mono">npm run build</span>${icons.arrow}</div>
        <div class="jsx-head"><span class="jsx-num mono">02</span><b>JavaScript</b><small>after the build · <span class="mono">react/jsx-runtime</span></small></div>
        <div class="jsx-pipe" data-col="3"><span class="mono">React</span>${icons.arrow}</div>
        <div class="jsx-head"><span class="jsx-num mono">03</span><b>HTML · DOM</b><small>what the browser shows</small></div>
        ${EXAMPLES.map(example).join('')}
        <p class="jsx-next mono">${icons.arrow}<span>next: the same rules in a real component — our Header</span></p>
      </div>`,
    mount(el) {
      const root = el.querySelector('[data-jsx]');
      let step = 0;
      const paint = () => {
        root.querySelectorAll('[data-col]').forEach((n) => n.classList.toggle('is-on', Number(n.dataset.col) <= step + 1));
        root.querySelectorAll('.jsx-slot').forEach((s) => {
          setLines(s, '1-20', 'is-hl', false);
          if (step >= 2) setLines(s, s.dataset.hl, 'is-hl', true);
        });
        root.querySelector('.jsx-next').classList.toggle('is-on', step >= 2);
      };
      paint();
      return {
        next() { if (step >= 2) return false; step += 1; paint(); return true; },
        prev() { if (step <= 0) return false; step -= 1; paint(); return true; },
      };
    },
  },
  {
    id: 'jsx-header',
    stage: STAGE,
    title: 'JSX in a real component — our Header',
    min: 3,
    steps: '→ #1–#5: one JSX feature at a time (lines light up, the live header reacts) · → #6: the question · → #7: the answer · ← steps back.',
    notes: `
      <p>The real <code>Header</code> from our project (<code>src/components/Layout.jsx</code>, abridged: the router hooks and aria attributes are left out). On the right it <b>actually runs</b> as a React component — click Sign out / Sign in, + cart, or the burger.</p>
      <p>→ #1 <b>attributes</b>: like HTML, but <code>className</code>; every tag must be closed — <code>&lt;span className="bar" /&gt;</code>.</p>
      <p>→ #2 <b>{ } = any JavaScript expression</b>: a template string for the class, <code>{cartCount}</code>, <code>{user?.firstName || 'Profile'}</code>.</p>
      <p>→ #3 <b>conditions</b>: <code>? :</code> picks one of two blocks (signed in / guest), <code>&amp;&amp;</code> shows the badge only when the cart is not empty. Press "sign out" and "−" on the right to show it.</p>
      <p>→ #4 <b>components and events</b>: a capital letter means a component (<code>Link</code>, <code>NavLink</code>, <code>Icon</code>); events are props in camelCase: <code>onClick={logout}</code> — a function, not a string.</p>
      <p>→ #5 <b>Fragment</b> <code>&lt;&gt;…&lt;/&gt;</code>: returns several elements without an extra <code>&lt;div&gt;</code> in the DOM.</p>
      <p>→ #6 the question: "Why <code>className</code> and not <code>class</code>?" Give 20–30 seconds. Hint: remember the previous slide — what does JSX become?</p>
      <p>→ #7: JSX becomes JavaScript, and attributes become properties of an object. <code>class</code> is a reserved word in JavaScript (<code>class Cart {}</code>), so React uses the DOM property name: <code>element.className</code>. For the same reason <code>for</code> → <code>htmlFor</code>; events are camelCase: <code>onclick</code> → <code>onClick</code>.</p>`,
    html: () => `
      ${head('JSX in a real component — our Header', 'The header of our restaurant: everything from the previous slide in one real component. On the right it runs.')}
      <div class="jh" data-jh>
        <div class="jh-code" data-code>${codeBlock({ code: HEADER, lang: 'jsx', file: 'src/components/Layout.jsx', tag: 'Header · abridged', cls: 'code--header' })}</div>
        <div class="jh-side">
          <section class="jh-live">
            <p class="jh-live-h mono"><span class="jh-dot"></span>live · this JSX running in React</p>
            <div data-demo></div>
          </section>
          <ol class="jh-feats" data-feats>
            ${HEADER_FEATURES.map(([title, text, lines], i) => `<li data-hl="${lines}"><span class="jh-n mono">0${i + 1}</span><div><h3>${title}</h3><p>${text}</p></div></li>`).join('')}
          </ol>
          <div class="jsx-quiz jh-quiz" data-q>
            <span class="jsx-quiz-tag mono">question</span>
            <div>
              <p class="jsx-quiz-q">Why does JSX use <span class="mono">className</span> and not <span class="mono">class</span>?</p>
              <p class="jsx-quiz-a" data-a><b>Answer:</b> JSX ends up as JavaScript, and attributes become object properties. <span class="mono">class</span> is a reserved word in JavaScript — <span class="mono">class Cart {}</span> — so React uses the DOM name: <span class="mono">element.className</span>. For the same reason <span class="mono">for</span> → <span class="mono">htmlFor</span>.</p>
            </div>
            <span class="jsx-quiz-hint mono">→ answer</span>
          </div>
        </div>
      </div>`,
    mount(el) {
      const unmountDemo = mountHeaderDemo(el.querySelector('[data-demo]'));
      const code = el.querySelector('[data-code]');
      const feats = [...el.querySelectorAll('[data-feats] li')];
      const quiz = el.querySelector('[data-q]');
      const answer = el.querySelector('[data-a]');
      const last = feats.length;
      let step = 0;
      const paint = () => {
        setLines(code, '1-40', 'is-hl', false);
        feats.forEach((li, i) => {
          li.classList.toggle('is-now', i === step - 1);
          li.classList.toggle('is-done', i < step - 1 || step > last);
        });
        if (step >= 1 && step <= last) setLines(code, feats[step - 1].dataset.hl, 'is-hl', true);
        if (step > last) setLines(code, CLASSNAME_LINES, 'is-hl', true);
        quiz.classList.toggle('is-on', step > last);
        quiz.classList.toggle('is-answered', step > last + 1);
        answer.classList.toggle('is-on', step > last + 1);
      };
      paint();
      return {
        next() { if (step > last) { if (step > last + 1) return false; } step += 1; paint(); return true; },
        prev() { if (step <= 0) return false; step -= 1; paint(); return true; },
        unmount: unmountDemo,
      };
    },
  },
];
