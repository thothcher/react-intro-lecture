// Trial 6 — listeners in an SPA. The #app container survives page changes.
//   vanilla: every visit to "Product" calls app.addEventListener(...). Without the cleanup line,
//            old listeners stay → one click on "+" runs N times. (A real bug we hit while building
//            the vanilla version; product.js now returns () => root.removeEventListener(...).)
//   React:   onClick on the element — React attaches and removes listeners itself.
import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { popLabel } from './shared.jsx';

function MiniApp({ onVisit }) {
  const [page, setPage] = useState('menu');
  const [qty, setQty] = useState(1);
  const go = (p) => { if (p === 'product' && page !== 'product') onVisit(); setPage(p); };
  return (
    <div className="la-app" data-pop-host>
      <nav className="la-nav">
        <button type="button" className={page === 'menu' ? 'is-on' : ''} onClick={() => go('menu')}>Menu</button>
        <button type="button" className={page === 'product' ? 'is-on' : ''} onClick={() => go('product')}>Product</button>
      </nav>
      {page === 'menu' ? (
        <div className="la-page"><h4>Menu</h4><p>Sfogliatelle · Affogato · Cassata</p></div>
      ) : (
        <div className="la-page">
          <h4>Pizza Prosciutto e Funghi</h4>
          <div className="la-step">
            <button type="button" onClick={(e) => { setQty((q) => Math.max(1, q - 1)); popLabel(e.currentTarget, '−1', 'is-good'); }}>−</button>
            <output>{qty}</output>
            <button type="button" onClick={(e) => { setQty((q) => q + 1); popLabel(e.currentTarget, '+1', 'is-good'); }}>+</button>
          </div>
        </div>
      )}
    </div>
  );
}

export function mountListenersDemo(el) {
  // ---------- vanilla ----------
  const nav = el.querySelector('[data-v-nav]');
  const app = el.querySelector('[data-v-app]');
  const cleanupBox = el.querySelector('[data-cleanup]');
  const $listeners = el.querySelector('[data-v-listeners]');
  const $visits = { v: el.querySelector('[data-v-visits]'), r: el.querySelector('[data-r-visits]') };
  let qty = 1;
  let listeners = 0;
  let visits = { v: 0, r: 0 };
  let dispose = null;
  let page = 'menu';
  let hits = 0;
  const attached = [];

  const paint = () => {
    $listeners.textContent = listeners;
    $listeners.closest('.la-metric').classList.toggle('is-bad', listeners > 1);
    nav.querySelectorAll('button').forEach((b) => b.classList.toggle('is-on', b.dataset.page === page));
  };

  function showMenu() {
    dispose?.();
    dispose = null;
    page = 'menu';
    app.innerHTML = '<div class="la-page"><h4>Menu</h4><p>Sfogliatelle · Affogato · Cassata</p></div>';
    paint();
  }

  function showProduct() {
    dispose?.();
    page = 'product';
    visits.v += 1;
    $visits.v.textContent = visits.v;
    app.innerHTML = `
      <div class="la-page">
        <h4>Pizza Prosciutto e Funghi</h4>
        <div class="la-step"><button type="button" data-step="-1">−</button><output data-qty>${qty}</output><button type="button" data-step="1">+</button></div>
      </div>`;
    const onClick = (e) => {
      const step = e.target.closest('[data-step]');
      if (!step) return;
      qty = Math.max(1, qty + Number(step.dataset.step));
      app.querySelector('[data-qty]').textContent = qty;
      hits += 1;
      if (hits === 1) setTimeout(() => { popLabel(step, `${step.dataset.step > 0 ? '+' : '−'}${hits}`, hits > 1 ? 'is-bad' : 'is-good'); hits = 0; }, 0);
    };
    app.addEventListener('click', onClick);
    attached.push(onClick);
    listeners += 1;
    dispose = cleanupBox.checked ? () => { app.removeEventListener('click', onClick); attached.splice(attached.indexOf(onClick), 1); listeners -= 1; } : null;
    paint();
  }

  const onNav = (e) => {
    const b = e.target.closest('[data-page]');
    if (!b || b.dataset.page === page) return;
    if (b.dataset.page === 'product') showProduct(); else showMenu();
  };
  const onReset = () => {
    attached.splice(0).forEach((fn) => app.removeEventListener('click', fn));
    listeners = 0;
    qty = 1;
    visits = { v: 0, r: 0 };
    $visits.v.textContent = '0';
    dispose = null;
    showMenu();
  };
  nav.addEventListener('click', onNav);
  cleanupBox.addEventListener('change', onReset);
  showMenu();

  // ---------- React ----------
  const root = createRoot(el.querySelector('[data-r-app]'));
  let rVisits = 0;
  root.render(<MiniApp onVisit={() => { rVisits += 1; $visits.r.textContent = rVisits; }} />);

  return {
    unmount() {
      nav.removeEventListener('click', onNav);
      cleanupBox.removeEventListener('change', onReset);
      attached.splice(0).forEach((fn) => app.removeEventListener('click', fn));
      root.unmount();
    },
  };
}
