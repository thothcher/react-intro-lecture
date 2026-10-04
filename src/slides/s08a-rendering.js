// Rendering strategies: a calm comparison, then the animated server ↔ browser explainer.
import { head } from './helpers.js';
import { icons } from '../components/icons.js';
import { RenderScene, MODES } from '../scene/RenderScene.js';

const STAGE = '08 / RETURN';

// Scores are 1–5 where MORE is always better (so "cheap hosting", not "server cost").
export const STRATEGIES = {
  csr: {
    acr: 'CSR', full: 'Client-Side Rendering', where: 'HTML is built in the browser',
    when: 'on every visit — on the user\'s device',
    meters: { speed: 2, seo: 2, fresh: 5, cheap: 5 },
    example: 'admin panels, dashboards · our restaurant-react', tool: 'Vite + React',
    steps: [
      'The browser asks for the page — <span class="mono">GET /product/34</span>',
      'The server returns almost empty HTML: <span class="mono">&lt;div id="root"&gt;</span>',
      'The SEO bot sees an empty page → low rank',
      'The JS bundle arrives (~320 KB)',
      'The browser runs the JS and builds the UI',
      '<span class="mono">fetch</span> → API → data',
      'The page is ready — but last of all',
    ],
    pros: ['static, cheap hosting (GitHub Pages)', 'very interactive once loaded'],
    cons: ['a blank screen until the JS loads', 'weak SEO and social previews'],
  },
  ssr: {
    acr: 'SSR', full: 'Server-Side Rendering', where: 'HTML is built on the server',
    when: 'on every request — again',
    meters: { speed: 4, seo: 5, fresh: 5, cheap: 2 },
    example: 'news, personalised pages, shops', tool: 'Next.js · React Router',
    steps: [
      'A request — <span class="mono">GET /product/34</span>',
      'The server fetches the data and runs React',
      'The server returns complete HTML',
      'The SEO bot sees the full content → high rank',
      'It shows up at once; JS "brings it to life" — <b>hydration</b>',
      'On every request the server works again',
    ],
    pros: ['a fast first screen', 'strong SEO', 'always fresh data'],
    cons: ['server cost on every request', 'needs a Node server'],
  },
  ssg: {
    acr: 'SSG', full: 'Static Site Generation', where: 'HTML is built at build time',
    when: 'once — before deploying',
    meters: { speed: 5, seo: 5, fresh: 2, cheap: 5 },
    example: 'documentation, blogs, landing pages', tool: 'Next.js · Astro',
    steps: [
      '<span class="mono">npm run build</span> — every page is created in advance',
      'The ready HTML files are stored in <span class="mono">dist/</span>',
      'A request — the ready file is sent instantly',
      'The SEO bot sees the full content → high rank',
      'The price changed in the DB — the page is stale until you rebuild',
    ],
    pros: ['the fastest', 'cheap, static hosting', 'strong SEO'],
    cons: ['data goes stale', 'slow builds with many pages'],
  },
  isr: {
    acr: 'ISR', full: 'Incremental Static Regeneration', where: 'HTML — at build + periodically',
    when: 'at build time and every N seconds, on demand',
    meters: { speed: 5, seo: 5, fresh: 4, cheap: 4 },
    example: 'product catalogues, menus, news', tool: 'Next.js',
    steps: [
      'build — pages in advance, <span class="mono">revalidate: 60</span>',
      'A request — instantly from the cache; high SEO',
      '60 seconds pass, the price changes in the DB',
      'The next visitor still gets the old page — the server rebuilds just this page in the background',
      'The following visitor already sees the new page',
    ],
    pros: ['SSG speed + periodic updates', 'only the page that needs it is rebuilt'],
    cons: ['one visitor still sees the old version', 'needs a framework (Next.js) and matching hosting'],
  },
};

const METERS = [['speed', 'first screen'], ['seo', 'SEO'], ['fresh', 'fresh data'], ['cheap', 'cheap hosting']];
const squares = (n) => Array.from({ length: 5 }, (_, i) => `<i class="${i < n ? 'on' : ''}"></i>`).join('');
const PIPE = {
  csr: [['server', 'server', 'empty HTML'], ['monitor', 'browser', 'builds it']],
  ssr: [['server', 'server', 'builds it'], ['monitor', 'browser', 'shows it']],
  ssg: [['build', 'build', 'builds it once'], ['monitor', 'browser', 'shows it']],
  isr: [['build', 'build', '+ every 60 s'], ['monitor', 'browser', 'shows it']],
};

function fallbackPanel() {
  return `<div class="rs-fallback"><p>The 3D animation is not available on this device. The steps are on the right — use the buttons.</p></div>`;
}

export default [
  {
    id: 'render-compare',
    stage: STAGE,
    title: 'Where is the HTML built? — CSR · SSR · SSG · ISR',
    min: 2,
    notes: `
      <p>A site built with React can reach the user in four ways. The difference is one question: <b>where and when is the HTML built?</b></p>
      <p><b>CSR</b> — in the browser (our restaurant-react works exactly like this: GitHub Pages serves an empty index.html and the JS). <b>SSR</b> — on the server, on every request. <b>SSG</b> — once, at build time. <b>ISR</b> — at build time and then periodically, page by page.</p>
      <p>Scores 1–5, where more is always better. To be precise about SEO: Google can run JavaScript, but later and with limits; many other bots and social previews (Facebook, Slack) cannot. So CSR = an SEO risk.</p>
      <p>For SSR/SSG/ISR React needs a framework — the best known is <b>Next.js</b>. That is the next step.</p>`,
    html: () => `
      ${head('Where is the HTML built?', 'One React app can reach the user in four ways. The difference: where and when the HTML is built.')}
      <div class="rc">
        ${MODES.map((k) => {
          const s = STRATEGIES[k];
          return `
          <article class="rc-col ${k === 'csr' ? 'is-ours' : ''}">
            ${k === 'csr' ? '<span class="rc-badge mono">our project</span>' : ''}
            <h3 class="rc-acr">${s.acr}</h3>
            <p class="rc-full mono">${s.full}</p>
            <p class="rc-where">${s.where}</p>
            <div class="rc-pipe">
              ${PIPE[k].map(([ico, name, what], i) => `${i ? `<span class="rc-arrow">${icons.arrow}</span>` : ''}<span class="rc-node ${i === (k === 'csr' ? 1 : 0) ? 'is-maker' : ''}">${icons[ico]}<b>${name}</b><small>${what}</small></span>`).join('')}
            </div>
            <dl class="rc-meters">${METERS.map(([m, label]) => `<div><dt>${label}</dt><dd class="sq">${squares(s.meters[m])}</dd></div>`).join('')}</dl>
            <p class="rc-when"><span class="kicker mono">when</span>${s.when}</p>
            <p class="rc-ex"><span class="kicker mono">for example</span>${s.example}</p>
            <p class="rc-tool mono">${s.tool}</p>
          </article>`;
        }).join('')}
      </div>`,
  },

  {
    id: 'render-animated',
    stage: STAGE,
    title: 'Rendering — animated',
    min: 4,
    steps: 'Starts with CSR automatically. → or "Next" — SSR, SSG, ISR. Click a tab for any mode; "Replay" repeats it. After ISR → moves to the next slide.',
    notes: `
      <p>On the left the <b>server</b> (its build folder <code>dist/</code> on top, the database beside it), on the right the <b>browser</b>. The magnifying glass is the <b>SEO bot</b>, which grades the first HTML.</p>
      <p><b>CSR:</b> empty HTML → the bot sees nothing (1/5). Then a "messy" JS bundle flies over and the browser builds the page from it; finally the data arrives with fetch. It is ready last of all.</p>
      <p><b>SSR:</b> the server runs React itself (the gear spins, the CPU rises) and sends complete HTML → the bot gives 5/5. The screen appears at once and becomes interactive after hydration. On the second request the server works again.</p>
      <p><b>SSG:</b> <code>npm run build</code> creates every page in advance → on request the ready file goes out instantly. The downside: the price changed in the DB, the page still shows the old one.</p>
      <p><b>ISR:</b> the same, but with a revalidate timer: after 60 seconds the first visitor still gets the old page, the server rebuilds just that one page in the background, and the next visitor sees the new one.</p>`,
    html: () => `
      <div class="rs">
        <div class="rs-canvas" data-canvas></div>
        <header class="s-head rs-head">
          <h2>How a page reaches the user</h2>
          <p>The server on the left, the browser on the right. Where is the HTML built — and what does the SEO bot see?</p>
        </header>
        <aside class="rs-panel">
          <div class="rs-tabs" role="tablist">${MODES.map((k, i) => `<button type="button" role="tab" data-mode="${i}" class="mono">${STRATEGIES[k].acr}</button>`).join('')}</div>
          <div class="rs-mode">
            <div class="rs-title"><span class="rs-acr" data-acr></span><span class="rs-full mono" data-full></span></div>
            <p class="rs-where" data-where></p>
          </div>
          <ol class="rs-steps" data-steps></ol>
          <dl class="rs-meters" data-meters></dl>
          <div class="rs-pc">
            <ul class="rs-pros" data-pros></ul>
            <ul class="rs-cons" data-cons></ul>
          </div>
          <div class="rs-actions">
            <button type="button" class="btn" data-replay>${icons.reset}<span>Replay</span></button>
            <button type="button" class="btn btn-solid" data-next><span data-next-label>Next</span>${icons.arrow}</button>
          </div>
        </aside>
      </div>`,
    async mount(el, deck) {
      const $ = (s) => el.querySelector(s);
      const tabs = [...el.querySelectorAll('[data-mode]')];
      let current = 0;
      let stepIndex = -1;

      const paintMode = (i) => {
        current = i;
        stepIndex = -1;
        const s = STRATEGIES[MODES[i]];
        tabs.forEach((b, j) => b.setAttribute('aria-selected', String(j === i)));
        $('[data-acr]').textContent = s.acr;
        $('[data-full]').textContent = s.full;
        $('[data-where]').textContent = s.where;
        $('[data-steps]').innerHTML = s.steps.map((t, j) => `<li data-i="${j}"><span class="mono">${String(j + 1).padStart(2, '0')}</span><span>${t}</span></li>`).join('');
        $('[data-meters]').innerHTML = METERS.map(([m, label]) => `<div><dt>${label}</dt><dd class="sq">${squares(s.meters[m])}</dd></div>`).join('');
        $('[data-pros]').innerHTML = s.pros.map((p) => `<li>${icons.check}<span>${p}</span></li>`).join('');
        $('[data-cons]').innerHTML = s.cons.map((p) => `<li>${icons.cross}<span>${p}</span></li>`).join('');
        const next = MODES[i + 1];
        $('[data-next-label]').textContent = next ? `Next: ${STRATEGIES[next].acr}` : 'Next slide';
        el.querySelector('.rs-panel').classList.remove('is-done');
      };
      const paintStep = (i) => {
        stepIndex = i;
        el.querySelectorAll('[data-steps] li').forEach((li, j) => {
          li.classList.toggle('is-now', j === i);
          li.classList.toggle('is-done', j < i);
        });
      };

      paintMode(0);
      if (!RenderScene.supported()) {
        $('[data-canvas]').innerHTML = fallbackPanel();
        const onClick = (e) => {
          const tab = e.target.closest('[data-mode]');
          if (tab) paintMode(Number(tab.dataset.mode));
          if (e.target.closest('[data-next]') && current < 3) paintMode(current + 1);
        };
        el.addEventListener('click', onClick);
        return { next: () => { if (current >= 3) return false; paintMode(current + 1); return true; }, unmount: () => el.removeEventListener('click', onClick) };
      }

      const scene = new RenderScene($('[data-canvas]'), {
        onMode: paintMode,
        onStep: (m, i) => { if (m === current) paintStep(i); },
        onDone: (m) => { if (m === current) { paintStep(STRATEGIES[MODES[m]].steps.length); el.querySelector('.rs-panel').classList.add('is-done'); } },
      });
      await scene.mount();

      const onClick = (e) => {
        const tab = e.target.closest('[data-mode]');
        if (tab) scene.play(Number(tab.dataset.mode));
        if (e.target.closest('[data-replay]')) scene.replay();
        if (e.target.closest('[data-next]')) { if (!scene.next()) deck?.next(); }
      };
      el.addEventListener('click', onClick);
      return {
        next: () => scene.next(),
        unmount: () => { el.removeEventListener('click', onClick); scene.unmount(); },
        scene,
        get step() { return stepIndex; },
      };
    },
  },
];
