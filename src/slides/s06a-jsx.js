// 06 / TRIALS opens with JSX: what the abbreviation means, what the build turns it into,
// and what finally lands in the DOM — two excerpts from ProductCard.jsx, revealed step by step.
import { head } from './helpers.js';
import { codeBlock, setLines } from '../components/code.js';
import { icons } from '../components/icons.js';

const STAGE = '06 / TRIALS';

const EXAMPLES = [
  {
    label: 'ელემენტი და <span class="mono">{გამოსახულება}</span>',
    from: 'ProductCard.jsx-დან',
    jsx: '<h3 className="card-title">{p.name}</h3>',
    js: '_jsx("h3", {\n  className: "card-title",\n  children: p.name,\n})',
    html: '<h3 class="card-title">Pizza Prosciutto e Funghi</h3>',
    hl: ['1', '2', '1'],
    caps: [
      'ბრაუზერში პირდაპირ → <span class="mono">SyntaxError</span>',
      'ტეგი → ფუნქციის გამოძახება · ატრიბუტები → props · შიგთავსი → <span class="mono">children</span>',
      '<span class="mono">className</span> → <span class="mono">class</span> · <span class="mono">{p.name}</span> → ნამდვილი ტექსტი',
    ],
  },
  {
    label: 'ჩადგმული ტეგები და <span class="mono">onClick</span>',
    from: 'ProductCard.jsx-დან, შემოკლებული',
    jsx: '<div className="card-foot">\n  <strong className="price">{price(p.price)}</strong>\n  <button onClick={() => add(p.id, 1)}>Add</button>\n</div>',
    js: '_jsxs("div", {\n  className: "card-foot",\n  children: [\n    _jsx("strong", { className: "price", children: price(p.price) }),\n    _jsx("button", { onClick: () => add(p.id, 1), children: "Add" }),\n  ],\n})',
    html: '<div class="card-foot">\n  <strong class="price">$15.50</strong>\n  <button>Add</button>\n</div>',
    hl: ['1-2', '2, 4', '1-2'],
    caps: [
      'ერთი მშობელი ელემენტი; ყველა ტეგი იხურება — როგორც XML-ში',
      'ჩადგმული ტეგები → <span class="mono">children</span> მასივი · შედეგი — ობიექტი <span class="mono">{ type, props }</span>',
      '<span class="mono">onClick</span> HTML-ში არ ჩანს — listener-ს React თვითონ ამაგრებს',
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
  <p class="jsx-ex"><span class="kicker">მაგალითი ${i + 1}</span><span>${ex.label}</span><span class="muted">${ex.from}</span></p>
  ${slot(ex, 0)}${arrow(2)}${slot(ex, 1)}${arrow(3)}${slot(ex, 2)}
  <p class="jsx-cap is-on">${ex.caps[0]}</p><span></span>
  <p class="jsx-cap" data-col="2">${ex.caps[1]}</p><span></span>
  <p class="jsx-cap" data-col="3">${ex.caps[2]}</p>`;

export default [
  {
    id: 'jsx-intro',
    stage: STAGE,
    title: 'JSX — JavaScript XML',
    time: '31:00 – 34:00 (3 წთ)',
    steps: '→ #1: build-ის შედეგი (JavaScript) · → #2: HTML ბრაუზერში · → #3: კითხვა · → #4: პასუხი · ← უკან ნაბიჯით.',
    notes: `
      <p><b>JSX = JavaScript XML.</b> HTML-ის მსგავსი ჩანაწერი, რომელსაც JavaScript-ის შიგნით ვწერთ. XML-ს ჰგავს წესებით: ყველა ტეგი უნდა დაიხუროს (<code>&lt;img /&gt;</code>), ხოლო კომპონენტი ერთ მშობელ ელემენტს აბრუნებს.</p>
      <p>ბრაუზერს JSX არ ესმის — პირდაპირ რომ ჩავტვირთოთ, <code>SyntaxError</code>-ს მივიღებთ. ამიტომ <code>npm run build</code> (Vite) თითოეულ ტეგს ფუნქციის გამოძახებად აქცევს.</p>
      <p>→ #1: <code>&lt;h3 className="card-title"&gt;</code> ხდება <code>_jsx("h3", { className: "card-title", children: p.name })</code>. ატრიბუტები → ობიექტის თვისებები (props), შიგთავსი → <code>children</code>. რამდენიმე შვილზე — <code>_jsxs</code> და მასივი. ძველ კოდში იგივე იწერებოდა <code>React.createElement("h3", {…}, p.name)</code>.</p>
      <p><code>_jsx()</code> აბრუნებს ჩვეულებრივ ობიექტს — <code>{ type: "h3", props: {…} }</code>. ეს არის "React element"; ასეთი ობიექტების ხე = virtual DOM (Trial 4-ში ვნახავთ, როგორ ადარებს მათ React).</p>
      <p>→ #2: React ამ ობიექტებისგან ქმნის ნამდვილ DOM-ს. <code>className</code> HTML-ში <code>class</code> ხდება. <code>onClick</code> HTML-ში საერთოდ არ ჩანს — listener-ს React თვითონ ამაგრებს.</p>
      <p>→ #3 კითხვა: "რატომ <code>className</code> და არა <code>class</code>?" მიეცით 20–30 წამი. მინიშნება: შეხედეთ 02 სვეტს — რად იქცევა JSX ბოლოს?</p>
      <p>→ #4: JSX JavaScript-ად იქცევა, ატრიბუტები კი JavaScript-ის ობიექტის თვისებები ხდება. <code>class</code> JavaScript-ში დარეზერვებული სიტყვაა (<code>class Cart {}</code>), ამიტომ React DOM property-ის სახელს იყენებს: <code>element.className</code>. იგივე მიზეზით <code>for</code> → <code>htmlFor</code>; event-ები კი camelCase-ით იწერება: <code>onclick</code> → <code>onClick</code>.</p>`,
    html: () => `
      ${head('JSX — <span class="jsx-title"><b>J</b>ava<b>S</b>cript <b>X</b>ML</span>', 'HTML-ის მსგავსი ჩანაწერი JavaScript-ში. ბრაუზერს ის არ ესმის — build მას JavaScript-ად აქცევს.')}
      <div class="jsx" data-jsx>
        <div class="jsx-head"><span class="jsx-num mono">01</span><b>JSX</b><small>ვწერთ ჩვენ</small></div>
        <div class="jsx-pipe" data-col="2"><span class="mono">npm run build</span>${icons.arrow}</div>
        <div class="jsx-head"><span class="jsx-num mono">02</span><b>JavaScript</b><small>build-ის შემდეგ · <span class="mono">react/jsx-runtime</span></small></div>
        <div class="jsx-pipe" data-col="3"><span class="mono">React</span>${icons.arrow}</div>
        <div class="jsx-head"><span class="jsx-num mono">03</span><b>HTML · DOM</b><small>რასაც ბრაუზერი აჩვენებს</small></div>
        ${EXAMPLES.map(example).join('')}
        <div class="jsx-quiz" data-q>
          <span class="jsx-quiz-tag mono">კითხვა</span>
          <div>
            <p class="jsx-quiz-q">რატომ წერია JSX-ში <span class="mono">className</span> და არა <span class="mono">class</span>?</p>
            <p class="jsx-quiz-a" data-a><b>პასუხი:</b> JSX ბოლოს JavaScript-ად იქცევა (02), ატრიბუტები კი ობიექტის თვისებები ხდება. <span class="mono">class</span> JavaScript-ში დარეზერვებული სიტყვაა — <span class="mono">class Cart {}</span>, ამიტომ React DOM-ის სახელს იყენებს: <span class="mono">element.className</span>. იგივე მიზეზით <span class="mono">for</span> → <span class="mono">htmlFor</span>.</p>
          </div>
          <span class="jsx-quiz-hint mono">→ პასუხი</span>
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
