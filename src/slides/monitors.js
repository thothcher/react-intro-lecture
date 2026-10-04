// "Behind the screen": the 3D monitor scene with its HTML overlay.
import { MonitorScene } from '../scene/MonitorScene.js';
import { url } from '../scene/assets.js';

const ROUTES = {
  vanilla: [['home', 'index.html'], ['menu', 'menu.html'], ['product', 'product.html'], ['cart', 'cart.html'], ['profile', 'profile.html']],
  react: [['home', '/'], ['menu', '/menu'], ['product', '/product/34'], ['cart', '/cart'], ['profile', '/profile']],
};

const arrow = '<svg viewBox="0 0 16 16" width="1em" height="1em" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>';

function column(kind) {
  const isReact = kind === 'react';
  return `
    <div class="mon-col mon-col--${kind}" data-col="${kind}" ${isReact ? 'hidden' : ''}>
      <div class="mon-tag">
        <span class="mono">${isReact ? 'B · REACT' : 'A · VANILLA'}</span>
        <span>${isReact ? 'one HTML, many routes (SPA)' : 'a separate HTML file per page'}</span>
      </div>
      <nav class="mon-routes" aria-label="${isReact ? 'React routes' : 'Vanilla files'}">
        ${ROUTES[kind].map(([key, label]) => `<button type="button" data-go="${key}">${label}</button>`).join('')}
      </nav>
      <p class="mon-stat" data-stat></p>
      <div class="mon-actions">
        <button type="button" class="btn" data-side aria-pressed="false">Side view</button>
        <button type="button" class="btn btn-solid" data-edit hidden>Add a link to the header</button>
      </div>
    </div>`;
}

function fallback() {
  return `
    <div class="mon-fallback">
      <figure>
        <div class="mon-fallback-frame"><img src="${url('vanilla', 'menu')}" alt="Vanilla: the full page"></div>
        <figcaption><b class="mono">A · VANILLA</b> every link loads a new HTML file: the header, main and footer are all created again. The header is copied into 10 files.</figcaption>
      </figure>
      <figure>
        <div class="mon-fallback-frame mon-fallback-frame--react">
          <img src="${url('react', 'header')}" alt="React header">
          <img src="${url('react', 'main-menu')}" alt="React main">
          <img src="${url('react', 'footer')}" alt="React footer">
        </div>
        <figcaption><b class="mono">B · REACT</b> the header and footer stay, only &lt;main&gt; changes. The header is one component that serves every page at once.</figcaption>
      </figure>
    </div>`;
}

export const monitorsSlide = {
  id: 'monitors',
  stage: '04 / MENTOR',
  title: 'Behind the screen',
  notes: `
    <p>The central slide — this is where the idea "clicks".</p>
    <p><b>A — Vanilla.</b> Click Menu on the screen, then Cart. Show: the whole strip moves — header, main and footer change together. The counter below: the header was built from scratch every time. This is the classic multi-page approach students already know.</p>
    <p>Note: our vanilla project has this header only once (app.js → renderHeader), but for that we wrote our own router and store — the mini-framework slide.</p>
    <p><b>B — "Next: React"</b> (or the → key). The same links: the header and footer stay in place, only main moves. This is client-side routing. Counter: Header mounted ×1.</p>
    <p><b>C — Side view.</b> Vanilla: 10 files, each with its own copy of the header. "Add a link to the header" → the change 10 times, file by file. React: one &lt;Header /&gt; (Layout.jsx) with beams into every route — one change, every page at once.</p>
    <p>Ask the audience: "In which one is it easier to make a mistake?"</p>`,

  async mount(el) {
    el.classList.add('mon');
    el.innerHTML = `
      <header class="mon-head">
        <h1>${this.title}</h1>
        <p>What happens when we click a navigation link?</p>
      </header>
      <div class="mon-canvas" data-canvas></div>
      ${column('vanilla')}
      ${column('react')}
      <div class="mon-next" data-next>
        <span class="mono mon-next-step">STEP B</span>
        <p>Same site, same link.<br>What changes in React?</p>
        <button type="button" class="btn btn-solid" data-next-btn>Next: React ${arrow}</button>
      </div>
      <p class="mon-hint" data-hint>Click a link on the screen — <span class="mono">Menu</span>, <span class="mono">Cart</span>, <span class="mono">Nino</span> — or an address below</p>`;

    // ?nogl previews the static fallback that is shown when WebGL is unavailable
    if (!MonitorScene.supported() || new URLSearchParams(location.search).has('nogl')) {
      el.querySelector('[data-canvas]').innerHTML = fallback();
      el.querySelectorAll('.mon-col, [data-next], [data-hint]').forEach((n) => n.remove());
      return { next: () => false, unmount: () => { el.innerHTML = ''; } };
    }

    const cols = {
      vanilla: el.querySelector('[data-col="vanilla"]'),
      react: el.querySelector('[data-col="react"]'),
    };

    const render = (kind, s) => {
      const col = cols[kind];
      col.hidden = !s.visible;
      col.classList.toggle('is-in', s.visible);
      col.querySelectorAll('[data-go]').forEach((b) => {
        const on = b.dataset.go === s.page;
        b.toggleAttribute('aria-current', on);
        if (on) b.setAttribute('aria-current', 'page');
        b.disabled = s.side || s.busy;
      });
      const side = col.querySelector('[data-side]');
      side.setAttribute('aria-pressed', String(s.side));
      side.disabled = s.busy;
      const edit = col.querySelector('[data-edit]');
      edit.hidden = !s.side;
      edit.disabled = s.busy;
      edit.textContent = s.edited && !s.busy ? 'Reset' : 'Add a link to the header';

      const stat = col.querySelector('[data-stat]');
      if (kind === 'vanilla') {
        stat.innerHTML = s.side
          ? `files changed: <b>${s.edits} / 10</b> <span>— the same change, by hand, in each file</span>`
          : `header built from scratch: <b>×${s.rebuilds}</b> <span>— every link = a full page load</span>`;
      } else {
        stat.innerHTML = s.side
          ? `files changed: <b>${s.edits} / 1</b> <span>— ${s.edits ? '10 pages updated at once' : 'one &lt;Header /&gt; for every route'}</span>`
          : `Header mounted: <b>×1</b> <span>— only &lt;main&gt; changes (client-side routing)</span>`;
      }
      if (kind === 'react' && s.visible) el.querySelector('[data-next]').classList.add('is-gone');
    };

    const scene = new MonitorScene(el.querySelector('[data-canvas]'), { onState: render });
    await scene.mount();

    const onClick = (e) => {
      const col = e.target.closest('[data-col]');
      if (e.target.closest('[data-next-btn]')) { scene.next(); return; }
      if (!col) return;
      const kind = col.dataset.col;
      const go = e.target.closest('[data-go]');
      if (go) scene.goTo(kind, go.dataset.go);
      if (e.target.closest('[data-side]')) scene.toggleSide(kind);
      if (e.target.closest('[data-edit]')) scene.editHeader(kind);
    };
    el.addEventListener('click', onClick);

    return {
      next: () => scene.next(),
      unmount: () => {
        el.removeEventListener('click', onClick);
        scene.unmount();
        el.innerHTML = '';
      },
      scene,
    };
  },
};
