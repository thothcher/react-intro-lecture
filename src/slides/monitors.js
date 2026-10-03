// Slide 15 — "ეკრანს მიღმა" (behind the screen): the 3D monitor scene with its HTML overlay.
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
        <span>${isReact ? 'ერთი HTML, ბევრი route (SPA)' : 'ცალკე HTML ფაილი თითო გვერდზე'}</span>
      </div>
      <nav class="mon-routes" aria-label="${isReact ? 'React routes' : 'Vanilla files'}">
        ${ROUTES[kind].map(([key, label]) => `<button type="button" data-go="${key}">${label}</button>`).join('')}
      </nav>
      <p class="mon-stat" data-stat></p>
      <div class="mon-actions">
        <button type="button" class="btn" data-side aria-pressed="false">გვერდითი ხედი</button>
        <button type="button" class="btn btn-solid" data-edit hidden>header-ში ლინკის დამატება</button>
      </div>
    </div>`;
}

function fallback() {
  return `
    <div class="mon-fallback">
      <figure>
        <div class="mon-fallback-frame"><img src="${url('vanilla', 'menu')}" alt="Vanilla: სრული გვერდი"></div>
        <figcaption><b class="mono">A · VANILLA</b> ყოველი ლინკი ტვირთავს ახალ HTML ფაილს: header, main და footer ყველა თავიდან იქმნება. header-ის ასლი 10 ფაილშია.</figcaption>
      </figure>
      <figure>
        <div class="mon-fallback-frame mon-fallback-frame--react">
          <img src="${url('react', 'header')}" alt="React header">
          <img src="${url('react', 'main-menu')}" alt="React main">
          <img src="${url('react', 'footer')}" alt="React footer">
        </div>
        <figcaption><b class="mono">B · REACT</b> header და footer რჩება, იცვლება მხოლოდ &lt;main&gt;. header ერთ კომპონენტშია და ყველა გვერდს ერთდროულად ემსახურება.</figcaption>
      </figure>
    </div>`;
}

export const monitorsSlide = {
  id: 'monitors',
  stage: '04 / MENTOR',
  title: 'ეკრანს მიღმა',
  notes: `
    <p>ცენტრალური სლაიდი — აქ "დაიჭერენ" იდეას.</p>
    <p><b>A — Vanilla.</b> დააჭირეთ ეკრანზე Menu-ს, მერე Cart-ს. აჩვენეთ: მთელი ზოლი მოძრაობს — header, main, footer ერთად იცვლება. ქვემოთ მრიცხველი: header ყოველ ჯერზე ნულიდან აიგო. ეს არის კლასიკური multi-page მიდგომა, რომელიც სტუდენტებმა უკვე იციან.</p>
    <p>შენიშვნა: ჩვენს vanilla პროექტში ეს header ერთხელ გვაქვს (app.js → renderHeader), მაგრამ ამისთვის საკუთარი router და store დავწერეთ — სლაიდი 8.</p>
    <p><b>B — "შემდეგი: React"</b> (ან → ღილაკი). იგივე ლინკები: header და footer ადგილზე რჩება, მოძრაობს მხოლოდ main. ეს არის client-side routing. მრიცხველი: Header-ის mount ×1.</p>
    <p><b>C — გვერდითი ხედი.</b> Vanilla: 10 ფაილი, თითოეულში header-ის საკუთარი ასლი. "header-ში ლინკის დამატება" → ცვლილება 10-ჯერ, ფაილი ფაილზე. React: ერთი &lt;Header /&gt; (Layout.jsx), სხივები ყველა route-ში — ერთი ცვლილება, ყველა გვერდი ერთდროულად.</p>
    <p>კითხვა აუდიტორიას: "რომელში უფრო ადვილია შეცდომის დაშვება?"</p>`,

  async mount(el) {
    el.classList.add('mon');
    el.innerHTML = `
      <header class="mon-head">
        <h1>${this.title}</h1>
        <p>რა ხდება, როცა ნავიგაციის ლინკს ვაჭერთ?</p>
      </header>
      <div class="mon-canvas" data-canvas></div>
      ${column('vanilla')}
      ${column('react')}
      <div class="mon-next" data-next>
        <span class="mono mon-next-step">STEP B</span>
        <p>იგივე საიტი, იგივე ლინკი.<br>რა შეიცვლება React-ში?</p>
        <button type="button" class="btn btn-solid" data-next-btn>შემდეგი: React ${arrow}</button>
      </div>
      <p class="mon-hint" data-hint>დააჭირეთ ლინკს ეკრანზე — <span class="mono">Menu</span>, <span class="mono">Cart</span>, <span class="mono">Nino</span> — ან მისამართს ქვემოთ</p>`;

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
      edit.textContent = s.edited && !s.busy ? 'თავიდან' : 'header-ში ლინკის დამატება';

      const stat = col.querySelector('[data-stat]');
      if (kind === 'vanilla') {
        stat.innerHTML = s.side
          ? `შეცვლილი ფაილები: <b>${s.edits} / 10</b> <span>— ერთი და იგივე ცვლილება, ხელით, თითო ფაილში</span>`
          : `header აიგო ნულიდან: <b>×${s.rebuilds}</b> <span>— ყოველი ლინკი = გვერდის სრული ჩატვირთვა</span>`;
      } else {
        stat.innerHTML = s.side
          ? `შეცვლილი ფაილები: <b>${s.edits} / 1</b> <span>— ${s.edits ? 'განახლდა 10 გვერდი ერთდროულად' : 'ერთი &lt;Header /&gt; ყველა route-ისთვის'}</span>`
          : `Header-ის mount: <b>×1</b> <span>— იცვლება მხოლოდ &lt;main&gt; (client-side routing)</span>`;
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
