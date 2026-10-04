import { head, IMG, bwImage, snippet } from './helpers.js';
import { reducedMotion } from '../scene/tween.js';
import { logoTile } from '../components/brands.js';

const STAGE = '05 / THRESHOLD';

export default [
  {
    id: 'react-demo',
    stage: STAGE,
    title: 'The same task — in React',
    min: 3,
    timeNote: '1 min slide + 2 min live demo',
    notes: `
      <p><b>Live demo:</b> open <code>Desktop/restaurant-react</code>, run <code>npm run dev</code>.</p>
      <p>1) <code>src/components/Layout.jsx</code> → in the Header's <code>&lt;nav&gt;</code>: <code>&lt;NavLink to="/about"&gt;About&lt;/NavLink&gt;</code> — <b>that is the entire header change</b>.</p>
      <p>2) <code>src/pages/About.jsx</code> — a new component. 3) <code>src/App.jsx</code> — one <code>&lt;Route&gt;</code>.</p>
      <p>Show it in the browser: the link appeared on <b>every</b> page, NavLink marks the active link itself, the page did not reload.</p>
      <p>To be fair: a new page also needs a route — but the header change is <b>one line in one file</b>.</p>`,
    html: () => `
      ${head('The same task — in React', 'LIVE DEMO · Desktop/restaurant-react')}
      <div class="threshold">
        ${bwImage(IMG.towers, 'threshold-img')}
        <div class="threshold-code">
          <div class="step-row"><span class="step-n mono">1</span><div class="step-body"><p class="step-what">Add the link — in the one and only header</p>${snippet('s17-layout', { file: 'src/components/Layout.jsx', tag: 'header — 1 line', add: 2 })}</div></div>
          <div class="step-row"><span class="step-n mono">2</span><div class="step-body"><p class="step-what">Create the page — a component</p>${snippet('s17-about', { file: 'src/pages/About.jsx', tag: 'new file', add: '1-8' })}</div></div>
          <div class="step-row"><span class="step-n mono">3</span><div class="step-body"><p class="step-what">Connect a URL to it</p>${snippet('s17-app', { file: 'src/App.jsx', tag: 'route', add: 3 })}</div></div>
        </div>
      </div>`,
  },

  {
    id: 'ten-vs-one',
    stage: STAGE,
    title: '10 files vs 1 file',
    min: 1,
    notes: `
      <p>One number to remember: to change the header, classic HTML needs <b>10 files</b> (+ a copy for the new page), React needs <b>1</b>.</p>
      <p>In brackets: our vanilla SPA also changes 1 place, but the price is ~190 lines of our own router/store (the mini-framework slide). React gives us that ready-made, tested in thousands of projects.</p>`,
    html: () => `
      ${head('Changing the header', 'The same job, two results.')}
      <div class="versus">
        <div class="versus-side">
          <span class="versus-tag">${logoTile('js')}<span class="mono">classic HTML</span></span>
          <span class="versus-num" data-count-to="10">10</span>
          <span class="versus-unit">files</span>
          <p>A copy of the header on every page.<br><span class="muted">+ an 11th: the new about.html, with its own copy.</span></p>
        </div>
        <div class="versus-mid mono">vs</div>
        <div class="versus-side versus-side--react">
          <span class="versus-tag">${logoTile('react')}<span class="mono">React</span></span>
          <span class="versus-num">1</span>
          <span class="versus-unit">file</span>
          <p><span class="mono">&lt;Header /&gt;</span> once, in <span class="mono">Layout.jsx</span>.<br><span class="muted">Every page uses the same component.</span></p>
        </div>
      </div>
      <p class="versus-foot">Our vanilla SPA also changes 1 place — but at the price of ~190 lines of our own router and store.</p>`,
    mount(el) {
      const num = el.querySelector('[data-count-to]');
      if (reducedMotion()) return null;
      let i = 1;
      num.textContent = '1';
      const t = setInterval(() => { i += 1; num.textContent = String(i); if (i >= 10) clearInterval(t); }, 55);
      return { unmount: () => clearInterval(t) };
    },
  },
];
