// "Data on its way": the same value travels api → cart → CartSummary → screen in two lanes.
// JavaScript lane: nothing checks the value, so a wrong one reaches the screen (wrong price, blank page, $0.00).
// TypeScript lane: type filters between the files compare what arrives with what is expected and stop
// a wrong value at the border — with the real compiler message, while the code is being written.
// All messages below were produced by the TypeScript compiler (tsc 7) on these exact files.
import { reducedMotion } from '../scene/tween.js';
import { icons } from '../components/icons.js';

const CANCEL = Symbol('cancel');
const EASE = 'cubic-bezier(0.45, 0.05, 0.35, 1)';
const speed = () => (reducedMotion() ? 0 : (globalThis.__timeScale || 1));

const pkt = (top, main, cls = '') => ({ top, main, cls });

export const SCENARIOS = [
  {
    tab: 'correct data',
    what: 'The API returns the product as expected.',
    chip: '{ name: "Margherita", price: 12 }',
    start: pkt('Margherita', 'price: <b>12</b>'),
    afterCart: { js: pkt('cartTotal()', 'total: <b>14</b>'), ts: pkt('cartTotal()', 'total: <b>14</b>') },
    prop: pkt('&lt;CartSummary', 'total={14}'),
    js: { screen: 'ok', total: '$14.00', console: ['ok', 'no errors'], found: '' },
    ts: { gateA: ['Product', 'Product', true], gateB: ['total?: number', 'total: 14', true], screen: 'ok', total: '$14.00' },
  },
  {
    tab: 'price sent as text',
    what: 'The API sends money as text — and nobody converted it with Number().',
    chip: '"price": "15.50"',
    start: pkt('Funghi', 'price: <b class="is-str">"15.50"</b>', 'is-bad'),
    afterCart: { js: pkt('"15.50" + 2', 'total: <b class="is-str">"15.502"</b>', 'is-bad') },
    prop: pkt('&lt;CartSummary', 'total="15.502"', 'is-bad'),
    js: { screen: 'wrong', total: '15.502', tag: 'wrong price', console: ['warn', 'no errors — the bug is silent'], found: 'found by: a customer · in production' },
    ts: {
      stopAt: 'gateA', gateA: ['price: number', 'price: "15.50"', false],
      problem: { file: 'api.ts:5', code: '    return { name: raw.name, price: <u>raw.price</u> };', msg: "Type 'string' is not assignable to type 'number'.", code2: 'ts(2322)' },
    },
  },
  {
    tab: 'product not found',
    what: 'The API answered 404, so getProduct() returned null.',
    chip: 'getProduct(999) → null',
    start: pkt('getProduct(999)', '<b class="is-null">null</b>', 'is-bad'),
    js: { crashAt: 'cart', screen: 'blank', tag: 'blank page', console: ['err', 'Uncaught TypeError: Cannot read properties of null (reading \'price\')', 'at cartTotal (cart.js:4)'], found: 'found by: a customer · blank page' },
    ts: {
      stopAt: 'gateA', gateA: ['Product', 'null', false],
      problem: { file: 'CartPage.tsx:7', code: '  const total = cartTotal(<u>product</u>);', msg: "Argument of type 'Product | null' is not assignable to parameter of type 'Product'. Type 'null' is not assignable to type 'Product'.", code2: 'ts(2345)' },
    },
  },
  {
    tab: 'a typo in a prop',
    what: 'One letter is missing in a prop name — CartSummary never gets the total.',
    chip: '<CartSummary totl={total} />',
    start: pkt('Margherita', 'price: <b>12</b>'),
    afterCart: { js: pkt('cartTotal()', 'total: <b>14</b>'), ts: pkt('cartTotal()', 'total: <b>14</b>') },
    prop: pkt('&lt;CartSummary', '<b class="is-typo">totl</b>={14}', 'is-bad'),
    js: { screen: 'zero', total: '$0.00', tag: 'free pizza', console: ['warn', 'no errors — total fell back to its default 0'], found: 'found by: a customer · in production' },
    ts: {
      stopAt: 'gateB', gateA: ['Product', 'Product', true], gateB: ['total?: number', 'totl', false],
      problem: { file: 'CartPage.tsx:8', code: '  return &lt;CartSummary <u>totl</u>={total} /&gt;;', msg: "Property 'totl' does not exist on type 'IntrinsicAttributes &amp; { total?: number | undefined; }'. Did you mean 'total'?", code2: 'ts(2322)' },
    },
  },
];

export class TypeFlow {
  constructor(root, { onScenario, onDone } = {}) {
    this.root = root;
    this.onScenario = onScenario || (() => {});
    this.onDone = onDone || (() => {});
    this.token = 0;
    this.current = -1;
    this.timers = new Set();
    this.anims = new Set();
    this.lanes = Object.fromEntries(['js', 'ts'].map((k) => {
      const lane = root.querySelector(`[data-lane="${k}"]`);
      const q = (s) => lane.querySelector(s);
      return [k, { lane, pipe: q('[data-pipe]'), api: q('[data-node="api"]'), cart: q('[data-node="cart"]'), summary: q('[data-node="summary"]'), gateA: q('[data-node="gateA"]'), gateB: q('[data-node="gateB"]'), screen: q('[data-node="screen"]'), out: q('[data-out-body]'), found: q('[data-found]') }];
    }));
  }

  // ------------------------------------------------------------------ engine

  guard(t) { if (t !== this.token) throw CANCEL; }

  wait(t, ms) {
    return new Promise((res) => {
      const id = setTimeout(() => { this.timers.delete(id); res(); }, ms * speed());
      this.timers.add(id);
    }).then(() => this.guard(t));
  }

  anim(t, el, frames, { duration = 500, easing = EASE, fill = 'forwards' } = {}) {
    const a = el.animate(frames, { duration: duration * speed(), easing, fill });
    this.anims.add(a);
    return a.finished.catch(() => {}).then(() => { this.anims.delete(a); this.guard(t); });
  }

  /** x of an element's centre inside the lane's pipe (px). */
  cx(L, el) {
    const p = L.pipe.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    return r.left - p.left + r.width / 2;
  }

  packet(L, p) {
    const n = document.createElement('div');
    n.className = `tf-pkt ${p.cls}`;
    n.innerHTML = `<small class="mono">${p.top}</small><span class="mono">${p.main}</span>`;
    L.pipe.appendChild(n);
    n.style.setProperty('--x', `${this.cx(L, L.api)}px`);
    return n;
  }

  async moveTo(t, L, n, el, duration = 700) {
    const from = parseFloat(n.style.getPropertyValue('--x'));
    const to = this.cx(L, el);
    n.style.setProperty('--x', `${to}px`);
    await this.anim(t, n, [{ transform: `translateX(${from}px) translateX(-50%)` }, { transform: `translateX(${to}px) translateX(-50%)` }], { duration });
  }

  async morph(t, n, p) {
    await this.anim(t, n, [{ opacity: 1, transform: `translateX(${n.style.getPropertyValue('--x')}) translateX(-50%) scale(1)` }, { opacity: 0, transform: `translateX(${n.style.getPropertyValue('--x')}) translateX(-50%) scale(0.85)` }], { duration: 160 });
    n.className = `tf-pkt ${p.cls}`;
    n.innerHTML = `<small class="mono">${p.top}</small><span class="mono">${p.main}</span>`;
    await this.anim(t, n, [{ opacity: 0, transform: `translateX(${n.style.getPropertyValue('--x')}) translateX(-50%) scale(1.15)` }, { opacity: 1, transform: `translateX(${n.style.getPropertyValue('--x')}) translateX(-50%) scale(1)` }], { duration: 220 });
  }

  pulse(t, el) {
    el.classList.remove('is-busy');
    void el.offsetWidth;
    el.classList.add('is-busy');
    return this.wait(t, 380);
  }

  // ------------------------------------------------------------------ lanes

  reset() {
    Object.values(this.lanes).forEach((L) => {
      L.pipe.querySelectorAll('.tf-pkt, .tf-check').forEach((n) => n.remove());
      [L.api, L.cart, L.summary].forEach((n) => n.classList.remove('is-busy', 'is-crash'));
      [L.gateA, L.gateB].forEach((g) => g.classList.remove('is-pass', 'is-fail', 'is-scan'));
      L.screen.className = 'tf-screen';
      L.screen.querySelector('[data-total]').textContent = '—';
      L.screen.querySelector('[data-tag]').textContent = '';
      L.out.innerHTML = '<p class="tf-idle mono">…</p>';
      L.found.textContent = '';
      L.lane.classList.remove('is-hit', 'is-safe');
    });
  }

  /** The filter between two files: shows what it expects and what arrived, then opens or closes. */
  async gate(t, L, gateEl, [expects, got, ok]) {
    gateEl.classList.add('is-scan');
    const box = document.createElement('div');
    box.className = `tf-check ${ok ? 'is-ok' : 'is-no'}`;
    box.innerHTML = `<span><small>expects</small><b class="mono">${expects}</b></span><span><small>got</small><b class="mono">${got}</b></span><i>${ok ? icons.check : icons.cross}</i>`;
    box.style.setProperty('--x', `${this.cx(L, gateEl)}px`);
    L.pipe.appendChild(box);
    await this.anim(t, box, [{ opacity: 0, transform: 'translateX(-50%) translateY(8px)' }, { opacity: 1, transform: 'translateX(-50%)' }], { duration: 260 });
    await this.wait(t, 620);
    gateEl.classList.remove('is-scan');
    gateEl.classList.add(ok ? 'is-pass' : 'is-fail');
    if (ok) this.bg(this.wait(t, 700).then(() => box.remove()));
    return ok;
  }

  bg(p) { p.catch((e) => { if (e !== CANCEL) console.error(e); }); }

  showScreen(L, kind, total, tag = '') {
    L.screen.className = `tf-screen is-${kind}`;
    L.screen.querySelector('[data-total]').textContent = total;
    L.screen.querySelector('[data-tag]').textContent = tag;
  }

  console(L, [level, ...lines]) {
    const ico = level === 'ok' ? icons.check : level === 'err' ? icons.cross : icons.eye;
    L.out.innerHTML = `<p class="tf-log tf-log--${level}">${ico}<span>${lines.map((l, i) => (i ? `<small class="mono">${l}</small>` : `<span class="mono">${l}</span>`)).join('')}</span></p>`;
  }

  problem(L, p) {
    if (!p) {
      L.out.innerHTML = `<p class="tf-log tf-log--ok">${icons.check}<span class="mono">No problems — and npm run build passes</span></p>`;
      return;
    }
    L.out.innerHTML = `
      <div class="tf-prob">
        <p class="tf-prob-loc mono">${icons.cross}<span>${p.file}</span></p>
        <pre class="tf-prob-code mono">${p.code}</pre>
        <p class="tf-prob-msg"><span>${p.msg}</span> <span class="mono">${p.code2}</span></p>
      </div>`;
  }

  async runJs(t, s) {
    const L = this.lanes.js;
    const n = this.packet(L, s.start);
    await this.anim(t, n, [{ opacity: 0, transform: `translateX(${n.style.getPropertyValue('--x')}) translateX(-50%) translateY(-10px)` }, { opacity: 1, transform: `translateX(${n.style.getPropertyValue('--x')}) translateX(-50%)` }], { duration: 300 });
    await this.pulse(t, L.api);
    await this.moveTo(t, L, n, L.cart, 900);
    await this.pulse(t, L.cart);
    if (s.js.crashAt === 'cart') {
      L.cart.classList.add('is-crash');
      n.classList.add('is-boom');
      await this.anim(t, n, [{ opacity: 1 }, { opacity: 0, filter: 'blur(4px)' }], { duration: 420 });
      n.remove();
      this.showScreen(L, s.js.screen, '', s.js.tag);
    } else {
      await this.morph(t, n, s.afterCart.js);
      await this.moveTo(t, L, n, L.summary, 900);
      await this.morph(t, n, s.prop);
      await this.pulse(t, L.summary);
      await this.moveTo(t, L, n, L.screen, 700);
      await this.anim(t, n, [{ opacity: 1 }, { opacity: 0 }], { duration: 200 });
      n.remove();
      this.showScreen(L, s.js.screen, s.js.total, s.js.tag);
    }
    this.console(L, s.js.console);
    L.found.textContent = s.js.found;
    if (s.js.found) L.lane.classList.add('is-hit');
  }

  async runTs(t, s) {
    const L = this.lanes.ts;
    const n = this.packet(L, s.start);
    await this.anim(t, n, [{ opacity: 0, transform: `translateX(${n.style.getPropertyValue('--x')}) translateX(-50%) translateY(-10px)` }, { opacity: 1, transform: `translateX(${n.style.getPropertyValue('--x')}) translateX(-50%)` }], { duration: 300 });
    await this.pulse(t, L.api);
    const reject = async (gateEl) => {
      n.classList.add('is-rejected');
      const x = parseFloat(n.style.getPropertyValue('--x'));
      await this.anim(t, n, [
        { transform: `translateX(${x}px) translateX(-50%)` },
        { transform: `translateX(${x - 36}px) translateX(-50%)`, offset: 0.45 },
        { transform: `translateX(${x - 22}px) translateX(-50%)`, offset: 0.7 },
        { transform: `translateX(${x - 28}px) translateX(-50%)` },
      ], { duration: 520 });
      this.problem(L, s.ts.problem);
      L.found.textContent = 'found by: you · while typing';
      L.lane.classList.add('is-safe');
      this.showScreen(L, 'blocked', '', 'build stopped · nothing shipped');
      void gateEl;
    };
    await this.moveTo(t, L, n, L.gateA, 600);
    if (!(await this.gate(t, L, L.gateA, s.ts.gateA))) { await reject(L.gateA); return; }
    await this.moveTo(t, L, n, L.cart, 500);
    await this.pulse(t, L.cart);
    await this.morph(t, n, s.afterCart.ts);
    await this.moveTo(t, L, n, L.gateB, 600);
    await this.morph(t, n, s.prop);
    if (!(await this.gate(t, L, L.gateB, s.ts.gateB))) { await reject(L.gateB); return; }
    await this.moveTo(t, L, n, L.summary, 500);
    await this.pulse(t, L.summary);
    await this.moveTo(t, L, n, L.screen, 700);
    await this.anim(t, n, [{ opacity: 1 }, { opacity: 0 }], { duration: 200 });
    n.remove();
    this.showScreen(L, s.ts.screen, s.ts.total);
    this.problem(L, null);
  }

  play(i) {
    const t = ++this.token;
    this.timers.forEach(clearTimeout);
    this.timers.clear();
    this.anims.forEach((a) => a.cancel());
    this.anims.clear();
    this.current = i;
    this.reset();
    this.onScenario(i);
    const s = SCENARIOS[i];
    Promise.all([this.runJs(t, s), this.runTs(t, s)])
      .then(() => { if (t === this.token) this.onDone(i); })
      .catch((e) => { if (e !== CANCEL) console.error(e); });
  }

  next() {
    if (this.current >= SCENARIOS.length - 1) return false;
    this.play(this.current + 1);
    return true;
  }

  replay() { this.play(this.current); }

  unmount() {
    this.token += 1;
    this.timers.forEach(clearTimeout);
    this.anims.forEach((a) => a.cancel());
  }
}
