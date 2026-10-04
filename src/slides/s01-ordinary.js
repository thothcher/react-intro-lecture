import { head, IMG, bwImage, snippet } from './helpers.js';
import { url, PAGES } from '../scene/assets.js';
import { icons } from '../components/icons.js';
import { logo, logoTile } from '../components/brands.js';
import { meta } from './meta.js';

const STAGE = '01 / ORDINARY WORLD';

export default [
  {
    id: 'title',
    stage: STAGE,
    title: 'Vanilla JS → React',
    min: 1,
    notes: `
      <p>Welcome. Today we look at a <b>real problem</b> in vanilla JS and how React solves it.</p>
      <p>Structure: theory (the Hero's Journey — the current stage is shown in the top-left corner), a 10-minute break, then ~45 minutes of practice.</p>
      <p>The main idea in one sentence: <b>"When a UI grows, managing the DOM by hand stops scaling."</b></p>`,
    html: () => `
      <div class="title-slide">
        <div class="title-text">
          <p class="kicker mono">FRONTEND · INTRODUCTION TO REACT</p>
          <h1><span class="title-brand">${logoTile('js')}Vanilla JS</span> <span class="title-arrow">${icons.arrow}</span> <span class="title-brand">${logoTile('react')}React</span></h1>
          <p class="lead">One restaurant, two approaches — and the moment React becomes essential.</p>
          <dl class="meta">
            <div><dt class="mono">theory</dt><dd>~${meta.theoryMin} min</dd></div>
            <div><dt class="mono">break</dt><dd>10 min</dd></div>
            <div><dt class="mono">practice</dt><dd>~45 min</dd></div>
          </dl>
        </div>
        ${bwImage(IMG.architecture, 'title-img')}
      </div>`,
  },

  {
    id: 'site',
    stage: STAGE,
    title: 'You can already build this',
    min: 1,
    notes: `
      <p>This is our restaurant website. It is built <b>twice</b>: with vanilla JS and with React — same design, same Swagger API.</p>
      <p>Both are live on GitHub Pages (addresses on the slide). You can show them in the browser for 20 seconds.</p>
      <p>Emphasise: "<b>You</b> could already build this with vanilla JS. The question is — at what cost?"</p>`,
    html: () => `
      ${head('You can already build this', 'The same restaurant, built twice: with vanilla JS and with React. Same design, same API.')}
      <div class="site-grid">
        <figure class="browser">
          <div class="browser-bar"><i></i><i></i><i></i><span class="mono">thothcher.github.io/restaurant-vanilla-js</span></div>
          <img src="${url('vanilla', 'home')}" alt="The restaurant home page">
        </figure>
        <dl class="spec">
          <div><dt class="mono">${icons.file}pages</dt><dd>10 — home, menu, product, cart, profile, sign-in…</dd></div>
          <div><dt class="mono">${icons.network}API</dt><dd>Swagger · <span class="mono">restaurantapi.stepacademy.ge</span></dd></div>
          <div><dt class="mono">${icons.key}auth</dt><dd>JWT — access + refresh token</dd></div>
          <div><dt class="mono">${icons.blocks}features</dt><dd>filters, cart, checkout, profile</dd></div>
          <div><dt class="mono">${icons.target}quality</dt><dd>responsive, dark mode, SEO, form validation</dd></div>
          <div class="spec-live"><dt class="mono">${icons.globe}live</dt><dd><span class="live-chip">${logo('js', { size: '1.1em' })}<span class="mono">/restaurant-vanilla-js</span></span><span class="live-chip">${logo('react', { size: '1.1em', color: '#149ECA' })}<span class="mono">/restaurant-react</span></span></dd></div>
        </dl>
      </div>
      <ol class="thumbs">
        ${PAGES.map((p) => `<li><img src="${url('vanilla', p.key)}" alt="" loading="lazy"><span class="mono">${p.route}</span></li>`).join('')}
      </ol>`,
  },

  {
    id: 'recap',
    stage: STAGE,
    title: 'What you already know',
    min: 1,
    notes: `
      <p>A quick recap — everyone knows these five things. The code comes from our vanilla project.</p>
      <p>Emphasise number 4: <b>changing the DOM by hand</b>. Today exactly this becomes the problem.</p>
      <p>React replaces none of them — it sits <b>on top</b> of all of this.</p>`,
    html: () => `
      ${head('What you already know', 'The tools the vanilla version was built with. React replaces none of them — it sits on top.')}
      <ol class="recap">
        ${[
          ['HTML', 'structure', 's3-html', 'html'],
          ['CSS', 'appearance', 's3-css', 'css'],
          ['JavaScript', 'logic', 's3-js', 'js'],
          ['DOM', 'updating the screen by hand', 's3-dom', 'dom', true],
          ['fetch', 'talking to the server', 's3-fetch', 'fetch'],
        ].map(([term, desc, sn, ico, key], i) => `
          <li class="${key ? 'is-key' : ''}">
            <div class="recap-top"><span class="recap-ico recap-ico--${ico}">${ico === 'js' ? logo('js', { color: '#1E1E1E' }) : ico === 'dom' ? icons.tree : ico === 'fetch' ? icons.network : `<b class="mono">${ico === 'html' ? '&lt;/&gt;' : '{ }'}</b>`}</span><span class="recap-n mono">0${i + 1}</span></div>
            <h3>${term}</h3>
            <p>${desc}</p>
            ${snippet(sn, { numbers: false, cls: 'code--mini' })}
          </li>`).join('')}
      </ol>
      <p class="recap-foot"><span class="kicker mono">today's topic</span><span>React changes none of them — it changes only <b class="accent">04</b>: <b>how</b> the screen is updated when data changes.</span></p>`,
  },
];
