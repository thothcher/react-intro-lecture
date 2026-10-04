// "How React thinks" — four animated explainers in the style of the rendering slide:
//   props   data flows down into the same component three times; read-only; events go up
//   state   memory → setter → re-render → only the changed text in the DOM; a plain variable can't
//   hooks   hooks are slots matched by call order; effects run after paint; never inside an if
//   vdom    old tree vs new tree → diff node by node → patch one text node
// Plain DOM + Web Animations. Every await is guarded by a token, so switching modes cancels cleanly.
import { reducedMotion } from '../scene/tween.js';
import { icons } from '../components/icons.js';
import { highlightLines } from '../components/code.js';

export const CONCEPT_MODES = ['props', 'state', 'hooks', 'vdom'];
const CANCEL = Symbol('cancel');
const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
const speed = () => (reducedMotion() ? 0 : (globalThis.__timeScale || 1));
const CURSOR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3l14 8-6.2 1.6L9.6 19z" fill="#0B1B3A" stroke="#fff" stroke-width="1.4" stroke-linejoin="round"/></svg>';

/** Code lines for the scene cards, highlighted with the deck's own highlighter. */
const codeLines = (code) => highlightLines(code, 'jsx')
  .map((html, i) => `<span class="cx-line" data-l="${i + 1}"><span class="cx-ln">${i + 1}</span><span class="cx-lc">${html.replace(/(useState|useEffect|useCart)/g, '<span class="cx-hook">$1</span>') || ' '}</span></span>`).join('');

export class ConceptScene {
  constructor(stage, { onMode, onStep, onDone } = {}) {
    this.stage = stage;
    this.onMode = onMode || (() => {});
    this.onStep = onStep || (() => {});
    this.onDone = onDone || (() => {});
    this.token = 0;
    this.mode = -1;
    this.timers = new Set();
    this.anims = new Set();
  }

  // ------------------------------------------------------------------ engine

  guard(t) { if (t !== this.token) throw CANCEL; }

  step(t, i) { this.guard(t); this.onStep(this.mode, i); }

  wait(t, ms) {
    return new Promise((res) => {
      const id = setTimeout(() => { this.timers.delete(id); res(); }, ms * speed());
      this.timers.add(id);
    }).then(() => this.guard(t));
  }

  anim(t, el, frames, { duration = 500, delay = 0, easing = EASE, fill = 'forwards' } = {}) {
    const a = el.animate(frames, { duration: duration * speed(), delay: delay * speed(), easing, fill });
    this.anims.add(a);
    return a.finished.catch(() => {}).then(() => { this.anims.delete(a); this.guard(t); });
  }

  /** Fire-and-forget animation (errors from cancelling are swallowed). */
  bg(promise) { promise.catch((e) => { if (e !== CANCEL) console.error(e); }); }

  show(t, el, { duration = 480, delay = 0, y = 14 } = {}) {
    el.classList.remove('cx-hidden');
    return this.anim(t, el, [{ opacity: 0, transform: `translateY(${y}px) scale(0.97)` }, { opacity: 1, transform: 'none' }], { duration, delay });
  }

  hide(t, el, duration = 300) {
    return this.anim(t, el, [{ opacity: 1 }, { opacity: 0 }], { duration }).then(() => el.classList.add('cx-hidden'));
  }

  pulse(t, el, scale = 1.06) {
    return this.anim(t, el, [{ transform: 'scale(1)' }, { transform: `scale(${scale})`, offset: 0.4 }, { transform: 'scale(1)' }], { duration: 520, fill: 'none' });
  }

  /** Centre of an element relative to the scene, in px. */
  at(el) {
    const s = this.root.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    return { x: r.left - s.left + r.width / 2, y: r.top - s.top + r.height / 2, w: r.width, h: r.height };
  }

  /** A small card that flies along a bent path from one element to another. */
  async fly(t, { html, cls = '', from, to, duration = 950, lift = 0.16 }) {
    const node = document.createElement('div');
    node.className = `cx-fly ${cls}`;
    node.innerHTML = html;
    this.root.appendChild(node);
    const w = node.offsetWidth;
    const h = node.offsetHeight;
    const a = this.at(from);
    const b = this.at(to);
    const mx = (a.x + b.x) / 2;
    const my = Math.min(a.y, b.y) - this.root.clientHeight * lift;
    const tr = (x, y, s = 1) => `translate(${x - w / 2}px, ${y - h / 2}px) scale(${s})`;
    await this.anim(t, node, [
      { transform: tr(a.x, a.y, 0.8), opacity: 0 },
      { transform: tr(a.x, a.y), opacity: 1, offset: 0.12 },
      { transform: tr(mx, my, 1.06), offset: 0.55 },
      { transform: tr(b.x, b.y, 0.96), opacity: 1 },
    ], { duration, easing: 'cubic-bezier(0.45, 0.05, 0.35, 1)' });
    return node;
  }

  async cursorTo(t, el, duration = 750) {
    const c = this.root.querySelector('[data-cursor]');
    const p = this.at(el);
    const from = this.cur || { x: p.x + 90, y: p.y + 110 };
    c.style.opacity = '1';
    await this.anim(t, c, [{ transform: `translate(${from.x}px, ${from.y}px)` }, { transform: `translate(${p.x}px, ${p.y}px)` }], { duration });
    this.cur = p;
  }

  async click(t, el) {
    const p = this.at(el);
    const r = document.createElement('span');
    r.className = 'cx-ripple';
    r.style.left = `${p.x}px`;
    r.style.top = `${p.y}px`;
    this.root.appendChild(r);
    this.bg(this.anim(t, r, [{ transform: 'translate(-50%, -50%) scale(0.2)', opacity: 0.9 }, { transform: 'translate(-50%, -50%) scale(2.6)', opacity: 0 }], { duration: 600 }));
    await this.anim(t, el, [{ transform: 'scale(1)' }, { transform: 'scale(0.92)', offset: 0.35 }, { transform: 'scale(1)' }], { duration: 300, fill: 'none' });
  }

  /** Change a value with a roll: the old value leaves upwards, the new one drops in. */
  async roll(t, el, value) {
    await this.anim(t, el, [{ transform: 'none', opacity: 1 }, { transform: 'translateY(-60%)', opacity: 0 }], { duration: 220 });
    el.textContent = value;
    await this.anim(t, el, [{ transform: 'translateY(60%)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 260 });
  }

  lines(card, ...ns) {
    card.querySelectorAll('.cx-line').forEach((l) => l.classList.toggle('is-on', ns.includes(Number(l.dataset.l))));
  }

  clearAsync() {
    this.timers.forEach(clearTimeout);
    this.timers.clear();
    this.anims.forEach((a) => a.cancel());
    this.anims.clear();
  }

  play(i) {
    const t = ++this.token;
    this.clearAsync();
    this.mode = i;
    this.cur = null;
    this.stage.innerHTML = '';
    this.root = document.createElement('div');
    this.root.className = `cx-scene cx-${CONCEPT_MODES[i]}`;
    this.stage.appendChild(this.root);
    this.onMode(i);
    this[CONCEPT_MODES[i]](t)
      .then(() => { if (t === this.token) this.onDone(i); })
      .catch((e) => { if (e !== CANCEL) console.error(e); });
  }

  next() {
    if (this.mode >= CONCEPT_MODES.length - 1) return false;
    this.play(this.mode + 1);
    return true;
  }

  replay() { this.play(this.mode); }

  unmount() {
    this.token += 1;
    this.clearAsync();
    this.stage.innerHTML = '';
  }

  // ------------------------------------------------------------------ 1. props

  async props(t) {
    const P = [
      ['Margherita', 12, '#F2C46B', '#3E7B3A'],
      ['Diavola', 13.5, '#C2412C', '#3A2618'],
      ['Funghi', 15.5, '#E3A99C', '#A88462'],
    ];
    const X = [17, 50, 83];
    this.root.innerHTML = `
      <svg class="cx-wires" aria-hidden="true"></svg>
      <div class="cx-comp cxp-parent cx-hidden">
        <div class="cx-comp-h"><span class="cx-tag mono">&lt;Menu /&gt;</span><span class="cx-own mono">state · cart: <b data-cart>0</b></span></div>
        <div class="cxp-data mono"><span class="cxp-var">items = [</span>${P.map(([n, pr, c], i) => `<span class="cxp-chip cx-hidden" data-chip="${i}" style="--p:${c}">${n} · $${pr.toFixed(2)}</span>`).join('')}<span class="cxp-var">]</span></div>
      </div>
      ${P.map(([n, pr, c, c2], i) => `
        <div class="cxp-child cx-hidden" data-child="${i}" style="--x:${X[i]}%">
          <p class="cxp-call mono">&lt;ProductCard p={items[${i}]} /&gt;</p>
          <div class="cx-comp cxp-card" data-card>
            <div class="cxp-pizza" style="--p:${c}; --q:${c2}"></div>
            <p class="cxp-name" data-name></p>
            <div class="cxp-row"><b data-price></b><span class="cxp-btn" data-btn>Add</span></div>
            <p class="cxp-props mono" data-props>props: { }</p>
          </div>
        </div>`).join('')}
      <div class="cx-note cxp-same cx-hidden" data-same>${icons.blocks}<span><b>1 component</b> · 3 different results</span></div>
      <div class="cx-note cx-note--bad cxp-lock cx-hidden" data-lock>${icons.lock}<span class="mono">p.price = 0</span><b>props are read-only</b></div>
      <div class="cx-note cxp-flow cx-hidden" data-flow><span>${icons.arrowDown}data flows down</span><span>${icons.arrowUp}events go up</span></div>
      <div class="cx-cursor" data-cursor>${CURSOR}</div>`;
    const $ = (s) => this.root.querySelector(s);
    const $$ = (s) => [...this.root.querySelectorAll(s)];

    // wires from the parent to each child, measured from the real layout (px), so they meet exactly
    const svg = $('.cx-wires');
    svg.setAttribute('viewBox', `0 0 ${this.root.clientWidth} ${this.root.clientHeight}`);
    const pa = this.at($('.cxp-parent'));
    const y1 = pa.y + pa.h / 2;
    svg.innerHTML = $$('.cxp-call').map((call, i) => {
      const c = this.at(call);
      const y2 = c.y - c.h / 2 - 6;
      const dy = (y2 - y1) / 2;
      return `<path data-wire="${i}" d="M${pa.x} ${y1} C${pa.x} ${y1 + dy}, ${c.x} ${y2 - dy}, ${c.x} ${y2}" pathLength="1"/>`;
    }).join('');

    this.step(t, 0);
    await this.show(t, $('.cxp-parent'));
    for (const chip of $$('[data-chip]')) await this.show(t, chip, { duration: 320, y: 8 });
    await this.wait(t, 700);

    this.step(t, 1);
    $$('[data-wire]').forEach((w, i) => this.bg(this.anim(t, w, [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: 700, delay: i * 120 })));
    await Promise.all($$('[data-child]').map((c, i) => this.show(t, c, { delay: 200 + i * 160 })));
    await this.wait(t, 900);

    this.step(t, 2);
    for (let i = 0; i < 3; i += 1) {
      const [n, pr] = P[i];
      const card = $(`[data-child="${i}"] [data-card]`);
      const fly = await this.fly(t, { html: `<span class="mono">p = { name: "${n}", price: ${pr} }</span>`, cls: 'cx-fly--props', from: $(`[data-chip="${i}"]`), to: card, duration: 1000 });
      fly.remove();
      card.querySelector('[data-name]').textContent = n;
      card.querySelector('[data-price]').textContent = `$${pr.toFixed(2)}`;
      card.querySelector('[data-props]').textContent = `props: { p: { name: "${n}" … } }`;
      card.classList.add('is-filled');
      await this.pulse(t, card);
    }
    await this.wait(t, 500);

    this.step(t, 3);
    await this.show(t, $('[data-same]'));
    await Promise.all($$('[data-card]').map((c) => this.pulse(t, c, 1.04)));
    await this.wait(t, 1500);

    this.step(t, 4);
    const victim = $('[data-child="1"] [data-card]');
    await this.show(t, $('[data-lock]'));
    victim.classList.add('is-bad');
    await this.anim(t, victim, [{ transform: 'none' }, { transform: 'translateX(-8px)' }, { transform: 'translateX(8px)' }, { transform: 'translateX(-5px)' }, { transform: 'none' }], { duration: 480, fill: 'none' });
    await this.wait(t, 1700);
    victim.classList.remove('is-bad');
    await this.hide(t, $('[data-lock]'));

    this.step(t, 5);
    const btn = $('[data-child="2"] [data-btn]');
    await this.cursorTo(t, btn);
    await this.click(t, btn);
    const pill = await this.fly(t, { html: '<span class="mono">onAdd(3)</span>', cls: 'cx-fly--event', from: btn, to: $('[data-cart]'), duration: 1000, lift: 0.04 });
    pill.remove();
    await this.roll(t, $('[data-cart]'), '1');
    await this.pulse(t, $('.cxp-parent'), 1.03);
    await this.show(t, $('[data-flow]'));
  }

  // ------------------------------------------------------------------ 2. state

  async state(t) {
    const CODE = 'function Counter() {\n  const [qty, setQty] = useState(1);\n  const plus = () => setQty(qty + 1);\n  return <button onClick={plus}>Add · {qty}</button>;\n}';
    this.root.innerHTML = `
      <div class="cx-code cxs-code cx-hidden" data-code>
        <div class="cx-code-h mono"><span>Counter.jsx</span><span class="cx-badge" data-render>render #1</span></div>
        <pre class="cx-lines mono">${codeLines(CODE)}</pre>
        <span class="cx-inline mono cx-hidden" data-inline>qty = 2</span>
      </div>
      <div class="cx-mem cxs-mem cx-hidden" data-mem>
        <div class="cx-mem-h mono">${icons.memory}React's memory</div>
        <div class="cx-slot"><span class="cx-slot-k mono">qty</span><span class="cx-slot-v mono"><span data-v>1</span></span></div>
        <p class="cx-mem-note">kept between renders</p>
      </div>
      <div class="cx-screen cxs-screen cx-hidden" data-screen>
        <div class="cx-screen-bar"><i></i><i></i><i></i><span class="mono">localhost:5173/product/34</span></div>
        <div class="cxs-ui">
          <div class="cxp-pizza" style="--p:#E3A99C; --q:#A88462"></div>
          <div>
            <p class="cxs-title">Pizza Prosciutto e Funghi</p>
            <span class="cxs-btn" data-btn>Add · <b data-q>1</b></span>
          </div>
        </div>
        <span class="cx-tag-note mono cx-hidden" data-still>the screen: still 1</span>
        <span class="cx-tag-note cx-tag-note--good mono cx-hidden" data-ops>1 text node changed</span>
      </div>
      <div class="cxs-timeline cx-hidden" data-tl><p class="mono">each render is a snapshot</p><ol data-snaps></ol></div>
      <div class="cx-note cx-note--bad cxs-plain cx-hidden" data-plain>
        <span class="mono">let qty = 1;</span>${icons.arrow}<span class="mono">qty = qty + 1;</span>
        <span>the variable is 2 — but React doesn't know: <b>no re-render</b>, and on the next render it starts at 1 again.</span>
      </div>
      <div class="cx-cursor" data-cursor>${CURSOR}</div>`;
    const $ = (s) => this.root.querySelector(s);
    const code = $('[data-code]');
    const snap = (n, q) => { const li = document.createElement('li'); li.innerHTML = `<b class="mono">#${n}</b><span class="mono">qty = ${q}</span>`; $('[data-snaps]').appendChild(li); return this.show(t, li, { y: 6 }); };

    this.step(t, 0);
    await this.show(t, code);
    this.lines(code, 2);
    await this.wait(t, 500);
    await this.show(t, $('[data-mem]'));
    await this.pulse(t, $('.cx-slot'));
    await this.wait(t, 700);

    this.step(t, 1);
    this.lines(code, 4);
    await this.show(t, $('[data-screen]'));
    await this.show(t, $('[data-tl]'));
    await snap(1, 1);
    await this.wait(t, 900);

    this.step(t, 2);
    await this.cursorTo(t, $('[data-btn]'));
    await this.click(t, $('[data-btn]'));
    this.lines(code, 3);
    await this.wait(t, 600);

    this.step(t, 3);
    await this.roll(t, $('[data-v]'), '2');
    await this.pulse(t, $('.cx-slot'), 1.08);
    await this.show(t, $('[data-still]'), { y: 6 });
    await this.wait(t, 1300);

    this.step(t, 4);
    await this.hide(t, $('[data-still]'), 200);
    $('[data-render]').textContent = 'render #2';
    code.classList.add('is-running');
    this.lines(code, 2);
    await this.show(t, $('[data-inline]'), { y: 4 });
    await snap(2, 2);
    await this.wait(t, 900);
    code.classList.remove('is-running');

    this.step(t, 5);
    this.lines(code, 4);
    await this.roll(t, $('[data-q]'), '2');
    $('[data-btn]').classList.add('is-flash');
    await this.show(t, $('[data-ops]'), { y: 6 });
    await this.wait(t, 1500);

    this.step(t, 6);
    this.lines(code);
    await this.show(t, $('[data-plain]'));
  }

  // ------------------------------------------------------------------ 3. hooks

  async hooks(t) {
    const CODE = 'function ProductCard({ p }) {\n  const [qty, setQty] = useState(1);\n  const [liked, setLiked] = useState(false);\n  useEffect(() => {\n    document.title = p.name;\n  }, [p.name]);\n  return <Card … />;\n}';
    const SLOTS = [['useState', 'qty', '1'], ['useState', 'liked', 'false'], ['useEffect', 'effect', 'title']];
    this.root.innerHTML = `
      <div class="cx-code cxh-code cx-hidden" data-code>
        <div class="cx-code-h mono"><span>ProductCard.jsx</span><span class="cx-badge" data-render>render #1</span></div>
        <pre class="cx-lines mono" data-lines>${codeLines(CODE)}<span class="cx-pointer" data-ptr>${icons.arrow}</span></pre>
      </div>
      <div class="cx-mem cxh-mem cx-hidden" data-mem>
        <div class="cx-mem-h mono">${icons.memory}hooks list · in React's memory</div>
        ${SLOTS.map(([hook, k, v], i) => `<div class="cx-slot cx-slot--empty" data-slot="${i}"><span class="cx-slot-i mono">[${i}]</span><span class="cx-slot-hook mono">${hook}</span><span class="cx-slot-k mono">${k}</span><span class="cx-slot-v mono" data-v>${v}</span></div>`).join('')}
        <div class="cxh-bracket cx-hidden" data-bracket><span class="mono">useCart()</span></div>
      </div>
      <div class="cx-screen cxh-tab cx-hidden" data-tab>
        <div class="cxh-tabbar"><span class="cxh-favicon"></span><span class="mono" data-title>Vite + React</span></div>
        <p class="cxh-tabnote mono">document.title</p>
      </div>
      <div class="cx-note cx-note--bad cxh-rule cx-hidden" data-rule>${icons.cross}<span><b>The order changed.</b> React matches hooks by their position — so useEffect got the slot that belongs to <span class="mono">liked</span>.</span></div>
      <div class="cx-note cxh-custom cx-hidden" data-custom>${icons.blocks}<span>Your own hook = a function that calls hooks: <span class="mono">useCart()</span>, <span class="mono">useFetch()</span>.</span></div>`;
    const $ = (s) => this.root.querySelector(s);
    const code = $('[data-code]');
    const ptr = $('[data-ptr]');
    const slot = (i) => $(`[data-slot="${i}"]`);
    const point = async (line, dur = 380) => {
      const l = code.querySelector(`[data-l="${line}"]`);
      this.lines(code, line);
      await this.anim(t, ptr, [{ transform: getComputedStyle(ptr).transform === 'none' ? `translateY(${l.offsetTop}px)` : getComputedStyle(ptr).transform }, { transform: `translateY(${l.offsetTop}px)` }], { duration: dur });
    };

    this.step(t, 0);
    await this.show(t, code);
    code.classList.add('is-glow');
    await this.wait(t, 1400);
    code.classList.remove('is-glow');

    this.step(t, 1);
    await this.show(t, $('[data-mem]'));
    ptr.classList.add('is-on');
    for (const [line, i] of [[2, 0], [3, 1], [4, 2]]) {
      await point(line);
      slot(i).classList.remove('cx-slot--empty');
      await this.pulse(t, slot(i), 1.05);
      await this.wait(t, 350);
    }
    await this.wait(t, 500);

    this.step(t, 2);
    await this.show(t, $('[data-tab]'));
    await point(5);
    slot(2).classList.add('is-run');
    await this.wait(t, 400);
    await this.roll(t, $('[data-title]'), 'Pizza Prosciutto e Funghi');
    await this.wait(t, 1100);
    slot(2).classList.remove('is-run');

    this.step(t, 3);
    $('[data-render]').textContent = 'render #2';
    code.classList.add('is-running');
    for (const [line, i] of [[2, 0], [3, 1], [4, 2]]) {
      await point(line, 260);
      slot(i).classList.add('is-read');
      if (i === 0) await this.roll(t, slot(0).querySelector('[data-v]'), '2');
      await this.wait(t, 200);
    }
    code.classList.remove('is-running');
    await this.wait(t, 900);
    [0, 1, 2].forEach((i) => slot(i).classList.remove('is-read'));

    this.step(t, 4);
    const l3 = code.querySelector('[data-l="3"] .cx-lc');
    const original = l3.innerHTML;
    l3.innerHTML = `<span class="cx-bad">if (qty &lt; 2) { const [liked] = <span class="cx-hook">useState</span>(false); }</span>`;
    $('[data-render]').textContent = 'render #3';
    await this.pulse(t, l3, 1.02);
    await this.wait(t, 700);
    await point(2, 300);
    slot(0).classList.add('is-read');
    await this.wait(t, 300);
    code.querySelector('[data-l="3"]').classList.add('is-skip');
    await point(3, 300);
    await this.wait(t, 500);
    await point(4, 300);
    slot(1).classList.add('is-wrong');
    await this.anim(t, slot(1), [{ transform: 'none' }, { transform: 'translateX(-7px)' }, { transform: 'translateX(7px)' }, { transform: 'none' }], { duration: 420, fill: 'none' });
    await this.show(t, $('[data-rule]'));
    await this.wait(t, 2200);

    this.step(t, 5);
    await this.hide(t, $('[data-rule]'));
    l3.innerHTML = original;
    code.querySelector('[data-l="3"]').classList.remove('is-skip');
    [0, 1, 2].forEach((i) => slot(i).classList.remove('is-read', 'is-wrong'));
    this.lines(code, 2, 3);
    ptr.classList.remove('is-on');
    await this.show(t, $('[data-bracket]'));
    await this.show(t, $('[data-custom]'));
  }

  // ------------------------------------------------------------------ 4. virtual DOM

  async vdom(t) {
    const ROWS = [['header', 0, ''], ['b', 1, '"Trattoria"'], ['nav', 1, ''], ['a', 2, '"Menu"'], ['a', 2, '"Cart"'], ['i', 3, '"2"']];
    const tree = (cls, title, badge) => `
      <div class="cx-tree ${cls} cx-hidden" data-tree="${cls}">
        <p class="cx-tree-h mono">${title}</p>
        <ul>${ROWS.map(([tag, d, txt], i) => `<li class="cx-hidden" data-r="${i}" style="--d:${d}"><span class="cx-tagname">&lt;${tag}&gt;</span>${txt ? `<span class="cx-txt" ${i === 5 ? 'data-badge-txt' : ''}>${i === 5 ? `"${badge}"` : txt}</span>` : ''}<span class="cx-mark"></span></li>`).join('')}</ul>
      </div>`;
    this.root.innerHTML = `
      <div class="cxv-state cx-hidden" data-state><span class="mono">state · cartCount =</span> <b class="mono" data-count>2</b></div>
      ${tree('cxv-old', 'previous render', 2)}
      ${tree('cxv-new', 'next render', 3)}
      <div class="cx-screen cxv-dom cx-hidden" data-dom>
        <div class="cx-screen-bar"><i></i><i></i><i></i><span class="mono">the real DOM</span></div>
        <div class="cxv-hdr" data-hdr><b>Trattoria</b><span>Menu</span><span>Cart <i data-badge>2</i></span></div>
        <p class="cxv-ops mono">DOM operations: <b data-ops>0</b></p>
        <p class="cxv-alt mono cx-hidden" data-alt>with innerHTML: <b>18</b></p>
      </div>
      <div class="cx-note cxv-diff cx-hidden" data-diff>${icons.diff}<span><b>1 difference</b> · "2" → "3"</span></div>
      <div class="cxv-bars cx-hidden" data-bars>
        <p class="mono">DOM operations for one click</p>
        <div class="cxv-bar"><span class="mono">virtual DOM + patch</span><span class="cxv-track"><i class="is-good" data-bar1 style="--w:5.6%"></i></span><b class="mono">1</b></div>
        <div class="cxv-bar cx-hidden" data-bar2row><span class="mono">innerHTML</span><span class="cxv-track"><i class="is-bad" data-bar2 style="--w:100%"></i></span><b class="mono">18</b></div>
      </div>`;
    const $ = (s) => this.root.querySelector(s);
    const rows = (cls) => [...this.root.querySelectorAll(`[data-tree="${cls}"] li`)];

    this.step(t, 0);
    await this.show(t, $('[data-state]'));
    await this.show(t, $('[data-tree="cxv-old"]'));
    for (const li of rows('cxv-old')) await this.show(t, li, { duration: 260, y: 6 });
    await this.show(t, $('[data-dom]'));
    await this.wait(t, 800);

    this.step(t, 1);
    await this.roll(t, $('[data-count]'), '3');
    await this.pulse(t, $('[data-state]'));
    await this.show(t, $('[data-tree="cxv-new"]'));
    for (const li of rows('cxv-new')) await this.show(t, li, { duration: 260, y: 6 });
    await this.wait(t, 700);

    this.step(t, 2);
    const oldR = rows('cxv-old');
    const newR = rows('cxv-new');
    for (let i = 0; i < ROWS.length - 1; i += 1) {
      oldR[i].classList.add('is-scan');
      newR[i].classList.add('is-scan');
      await this.wait(t, 340);
      oldR[i].classList.replace('is-scan', 'is-same');
      newR[i].classList.replace('is-scan', 'is-same');
    }
    oldR[5].classList.add('is-scan');
    newR[5].classList.add('is-scan');
    await this.wait(t, 420);

    this.step(t, 3);
    oldR[5].classList.replace('is-scan', 'is-diff');
    newR[5].classList.replace('is-scan', 'is-diff');
    await this.show(t, $('[data-diff]'));
    await this.wait(t, 1200);

    this.step(t, 4);
    const chip = await this.fly(t, { html: '<span class="mono">textContent = "3"</span>', cls: 'cx-fly--patch', from: newR[5], to: $('[data-badge]'), duration: 1000, lift: 0.08 });
    chip.remove();
    await this.roll(t, $('[data-badge]'), '3');
    await this.pulse(t, $('[data-badge]'), 1.4);
    await this.roll(t, $('[data-ops]'), '1');
    await this.show(t, $('[data-bars]'));
    await this.anim(t, $('[data-bar1]'), [{ width: '0%' }, { width: '5.6%' }], { duration: 600 });
    await this.wait(t, 1100);

    this.step(t, 5);
    const hdr = $('[data-hdr]');
    hdr.classList.add('is-rebuild');
    await this.show(t, $('[data-alt]'), { y: 6 });
    await this.show(t, $('[data-bar2row]'), { y: 6 });
    await this.anim(t, $('[data-bar2]'), [{ width: '0%' }, { width: '100%' }], { duration: 900 });
    await this.wait(t, 1600);
    hdr.classList.remove('is-rebuild');
  }
}
