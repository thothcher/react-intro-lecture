import { head, snippet } from './helpers.js';
import { setLines } from '../components/code.js';
import { mountQuiz } from '../components/quiz.js';
import { PAGES } from '../scene/assets.js';
import { reducedMotion } from '../scene/tween.js';
import { quizHead } from './quizHead.js';

const STAGE = '03 / REFUSAL';

export default [
  {
    id: 'ten-files',
    stage: STAGE,
    title: '10 files, the same header',
    min: 2,
    steps: '→ once: About is added to all 10 files, one by one. The next → moves on to the next slide.',
    notes: `
      <p>The classic approach (the one we all started with): every page is a separate <code>.html</code> file and carries <b>its own copy of the header</b>.</p>
      <p>Press <b>→</b>: watch <code>About</code> being added file by file — 10 times. The same change, by hand.</p>
      <p>Ask: "What happens if the link name changes tomorrow? Or one more page is added?"</p>`,
    html: () => `
      ${head('10 files. The same header.', 'The classic approach: every page is a separate HTML file and carries its own copy of the header.')}
      <div class="files-meta">
        <span class="mono files-count">edited: <b data-count>0</b> / 10</span>
        <span class="files-hint mono" data-hint>→ let's start: About in every file</span>
      </div>
      <div class="files">
        ${PAGES.map((p) => `<div class="file-card">${snippet('s5-nav', { file: p.file, hide: 2, numbers: false, cls: 'code--mini' })}</div>`).join('')}
      </div>
      <p class="files-foot">The same change × 10 files. And the new <span class="mono">about.html</span> needs an <b class="accent">11th copy</b> of the header too.</p>`,
    mount(el) {
      const cards = [...el.querySelectorAll('.file-card')];
      const $count = el.querySelector('[data-count]');
      const $hint = el.querySelector('[data-hint]');
      const timers = [];
      let started = false;
      return {
        next() {
          if (started) return false;
          started = true;
          $hint.textContent = 'the same change — by hand, 10 times';
          cards.forEach((card, i) => {
            timers.push(setTimeout(() => {
              setLines(card, 2, 'is-hidden', false);
              setLines(card, 2, 'is-add', true);
              card.classList.add('is-edited');
              $count.textContent = String(i + 1);
            }, reducedMotion() ? 0 : 150 + i * 260));
          });
          return true;
        },
        unmount() { timers.forEach(clearTimeout); },
      };
    },
  },

  {
    id: 'risks',
    stage: STAGE,
    title: 'Where it goes wrong',
    min: 1.5,
    notes: `
      <p>Three typical mistakes that come with copy-paste. All are real — I have seen each of them in student projects.</p>
      <p><b>1.</b> A forgotten file — the link is simply missing on one page, and nobody notices for a long time.</p>
      <p><b>2.</b> A typo — <code>abuot.html</code> → 404.</p>
      <p><b>3.</b> The active link — a file was copied from another one and <code>class="active"</code> "came along".</p>
      <p>Conclusion: <b>the more copies, the more places for mistakes.</b></p>`,
    html: () => `
      ${head('Where it goes wrong', 'Every copy is one more place for a mistake.')}
      <div class="risks">
        <article class="risk">
          <span class="risk-n mono">01</span>
          <h3>A forgotten file</h3>
          ${snippet('s6-forgot', { numbers: false, bad: 3, cls: 'code--mini' })}
          <p>The highlighted spot should contain <span class="mono">About</span> — on verify.html the link is simply missing, and nobody notices for a long time.</p>
        </article>
        <article class="risk">
          <span class="risk-n mono">02</span>
          <h3>A typo</h3>
          ${snippet('s6-typo', { numbers: false, bad: 3, cls: 'code--mini' })}
          <p><span class="mono">abuot.html</span> — the link goes to a 404.</p>
        </article>
        <article class="risk">
          <span class="risk-n mono">03</span>
          <h3>The wrong active link</h3>
          ${snippet('s6-active', { numbers: false, bad: 3, cls: 'code--mini' })}
          <p>On the Cart page Menu is highlighted — the class "came along" with the copy.</p>
        </article>
      </div>`,
  },

  {
    id: 'quiz-files',
    stage: STAGE,
    tone: 'quiz',
    title: 'Quiz: how many files?',
    min: 1.5,
    notes: `
      <p>Give 20 seconds. Ask for a show of hands for each option, then click the answer (or press 1–4).</p>
      <p>Correct: <b>11</b> — the link in the 10 existing files + the new <code>about.html</code>, which <b>also</b> needs a copy of the header.</p>
      <p>A common answer is 10 — that hidden 11th file is exactly the heart of the problem.</p>`,
    html: () => `${quizHead(1, 'multi-page HTML')}<div class="quiz-wrap" data-quiz></div>`,
    mount(el) {
      return mountQuiz(el.querySelector('[data-quiz]'), {
        question: 'On a classic HTML site, <b>how many files</b> did we have to change to add About?',
        options: ['1', '2', '10', '11'],
        answer: 3,
        explain: 'Adding the link to the 10 existing pages + the new <span class="mono">about.html</span>, which needs <b>its own copy</b> of the header. 11 in total — and the number grows with every page.',
      });
    },
  },

  {
    id: 'mini-framework',
    stage: STAGE,
    title: 'We tried with JS: our own mini-framework',
    min: 1.5,
    notes: `
      <p>An honest moment: <b>our</b> vanilla project is not built like that — its header lives in one place (<code>renderHeader()</code> in app.js).</p>
      <p>But to get there we wrote by hand: a router, a store + subscribe, re-drawing the header, the active link, escaping, cleanup. <b>~190 lines</b> in total (app.js 151 + store.js 38) — and adding About still meant changing 4 places.</p>
      <p>The line to say: <b>"Without meaning to, we wrote a small, bad React."</b> React exists exactly so that everyone doesn't write this on their own.</p>`,
    html: () => `
      ${head('We tried with JS: our own mini-framework', 'In our vanilla project the header lives in one place. But to get there we hand-wrote what React gives us for free.')}
      <div class="bridge">
        <ul class="bridge-list">
          <li><span class="mono">js/app.js</span><span><b>Router</b> — regex routes, <span class="mono">history.pushState</span></span></li>
          <li><span class="mono">js/app.js</span><span><b>renderHeader()</b> — the whole header as one string</span></li>
          <li><span class="mono">js/store.js</span><span><b>Store + subscribe</b> — a home-made pub/sub</span></li>
          <li><span class="mono">js/app.js</span><span><b>Re-drawing</b> — the header again on every change</span></li>
          <li><span class="mono">js/app.js</span><span><b>markActiveNav()</b> — the active link by hand</span></li>
          <li><span class="mono">js/ui.js</span><span><b>esc()</b> — XSS protection by hand</span></li>
        </ul>
        ${snippet('s8-header', { file: 'js/app.js', tag: 'abridged', hl: '3, 10, 13, 16', cls: 'code--compact' })}
      </div>
      <div class="bridge-sum">
        <span class="bridge-num mono">≈190</span>
        <p>lines of "infrastructure" (<span class="mono">app.js</span> 151 + <span class="mono">store.js</span> 38) — and About still meant changing <b>4 places</b>.<br><span class="muted">Without meaning to, we wrote a small React. Let's meet the real one.</span></p>
      </div>`,
  },
];
