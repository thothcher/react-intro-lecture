import { head, IMG, bwImage, snippet } from './helpers.js';
import { reducedMotion } from '../scene/tween.js';

const STAGE = '05 / THRESHOLD';

export default [
  {
    id: 'react-demo',
    stage: STAGE,
    title: 'იგივე დავალება — React-ში',
    time: '27:00 – 30:00 (1 წთ სლაიდი + 2 წთ live demo)',
    notes: `
      <p><b>Live demo:</b> გახსენით <code>Desktop/restaurant-react</code>, <code>npm run dev</code>.</p>
      <p>1) <code>src/components/Layout.jsx</code> → Header-ის <code>&lt;nav&gt;</code>-ში: <code>&lt;NavLink to="/about"&gt;About&lt;/NavLink&gt;</code> — <b>header-ის ცვლილება მთლიანად ესაა</b>.</p>
      <p>2) <code>src/pages/About.jsx</code> — ახალი კომპონენტი. 3) <code>src/App.jsx</code> — ერთი <code>&lt;Route&gt;</code>.</p>
      <p>აჩვენეთ ბრაუზერში: ლინკი <b>ყველა</b> გვერდზე გამოჩნდა, active ლინკს NavLink თვითონ ნიშნავს, გვერდი არ გადაიტვირთა.</p>
      <p>გულახდილად: ახალი გვერდისთვის route-იც სჭირდება — მაგრამ header-ის ცვლილება <b>ერთი ხაზია, ერთ ფაილში</b>.</p>`,
    html: () => `
      ${head('იგივე დავალება — React-ში', 'LIVE DEMO · Desktop/restaurant-react')}
      <div class="threshold">
        ${bwImage(IMG.towers, 'threshold-img')}
        <div class="threshold-code">
          <div class="step-row"><span class="step-n mono">1</span>${snippet('s17-layout', { file: 'src/components/Layout.jsx', tag: 'header — 1 ხაზი', add: 2 })}</div>
          <div class="step-row"><span class="step-n mono">2</span>${snippet('s17-about', { file: 'src/pages/About.jsx', tag: 'ახალი ფაილი', add: '1-8' })}</div>
          <div class="step-row"><span class="step-n mono">3</span>${snippet('s17-app', { file: 'src/App.jsx', tag: 'route', add: 3 })}</div>
        </div>
      </div>`,
  },

  {
    id: 'ten-vs-one',
    stage: STAGE,
    title: '10 ფაილი vs 1 ფაილი',
    time: '30:00 – 31:00 (1 წთ)',
    notes: `
      <p>ერთი რიცხვი, რომელიც უნდა დაიმახსოვრონ: header-ის შესაცვლელად კლასიკურ HTML-ში <b>10 ფაილი</b> (+ ახალი გვერდის ასლი), React-ში — <b>1</b>.</p>
      <p>ფრჩხილებში: ჩვენი vanilla SPA-ც 1 ადგილს ცვლის, მაგრამ ამის ფასი ~190 ხაზი საკუთარი router/store-ია (სლაიდი 8). React ამას მზად გვაძლევს და ათასობით პროექტში გამოცდილია.</p>`,
    html: () => `
      ${head('header-ის ცვლილება', 'ერთი და იგივე ამოცანა, ორი შედეგი.')}
      <div class="versus">
        <div class="versus-side">
          <span class="versus-num" data-count-to="10">10</span>
          <span class="versus-unit">ფაილი</span>
          <p>კლასიკურ HTML-ში — თითო გვერდზე header-ის ასლი.<br><span class="muted">+ მე-11: ახალი about.html, თავისი ასლით.</span></p>
        </div>
        <div class="versus-mid mono">vs</div>
        <div class="versus-side versus-side--react">
          <span class="versus-num">1</span>
          <span class="versus-unit">ფაილი</span>
          <p>React-ში — <span class="mono">&lt;Header /&gt;</span> ერთხელ, <span class="mono">Layout.jsx</span>-ში.<br><span class="muted">ყველა გვერდი ერთსა და იმავე კომპონენტს იყენებს.</span></p>
        </div>
      </div>
      <p class="versus-foot">ჩვენი vanilla SPA-ც 1 ადგილს ცვლის — მაგრამ ~190 ხაზი საკუთარი router-ისა და store-ის ფასად.</p>`,
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
