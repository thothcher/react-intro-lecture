import { head, snippet } from './helpers.js';
import { setLines } from '../components/code.js';
import { mountQuiz } from '../components/quiz.js';
import { PAGES } from '../scene/assets.js';
import { reducedMotion } from '../scene/tween.js';

const STAGE = '03 / REFUSAL';

export default [
  {
    id: 'ten-files',
    stage: STAGE,
    title: '10 ფაილი, ერთი და იგივე header',
    time: '7:00 – 9:00 (2 წთ)',
    steps: '→ ერთხელ: About ემატება 10 ფაილს, სათითაოდ. შემდეგი → გადადის მომდევნო სლაიდზე.',
    notes: `
      <p>კლასიკური მიდგომა (ის, რითაც ყველამ დავიწყეთ): ყოველი გვერდი ცალკე <code>.html</code> ფაილია და <b>header-ის საკუთარ ასლს</b> ატარებს.</p>
      <p>დააჭირეთ <b>→</b>: ვუყურებთ, როგორ ემატება <code>About</code> ფაილიდან ფაილში — 10-ჯერ. ერთი და იგივე ცვლილება, ხელით.</p>
      <p>იკითხეთ: "რა მოხდება, თუ ხვალ ლინკის სახელი შეიცვლება? ან კიდევ ერთი გვერდი დაემატება?"</p>`,
    html: () => `
      ${head('10 ფაილი. ერთი და იგივე header.', 'კლასიკური მიდგომა: ყოველი გვერდი ცალკე HTML ფაილია და header-ის საკუთარ ასლს ატარებს.')}
      <div class="files-meta">
        <span class="mono files-count">შესწორებულია: <b data-count>0</b> / 10</span>
        <span class="files-hint mono" data-hint>→ დავიწყოთ: About ყველა ფაილში</span>
      </div>
      <div class="files">
        ${PAGES.map((p) => `<div class="file-card">${snippet('s5-nav', { file: p.file, hide: 2, numbers: false, cls: 'code--mini' })}</div>`).join('')}
      </div>
      <p class="files-foot">ერთი და იგივე ცვლილება × 10 ფაილი. და ახალ <span class="mono">about.html</span>-საც დასჭირდება header-ის <b class="accent">მე-11 ასლი</b>.</p>`,
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
          $hint.textContent = 'ერთი და იგივე ცვლილება — ხელით, 10-ჯერ';
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
    title: 'სად შეიძლება შეცდეთ',
    time: '9:00 – 10:30 (1.5 წთ)',
    notes: `
      <p>სამი ტიპური შეცდომა, რომელიც copy-paste-ს თან ახლავს. ყველა რეალურია — ასეთი რამ ყველა სტუდენტის პროექტში მინახავს.</p>
      <p><b>1.</b> დავიწყებული ფაილი — ერთ გვერდზე ლინკი უბრალოდ აკლია, და ამას დიდხანს ვერავინ ამჩნევს.</p>
      <p><b>2.</b> Typo — <code>abuot.html</code> → 404.</p>
      <p><b>3.</b> active ლინკი — ფაილი სხვა ფაილიდან დაკოპირდა და <code>class="active"</code> მასთან ერთად "ჩამოყვა".</p>
      <p>დასკვნა: <b>რაც უფრო მეტი ასლია, მით მეტი ადგილია შეცდომისთვის.</b></p>`,
    html: () => `
      ${head('სად შეიძლება შეცდეთ', 'ყოველი ასლი — კიდევ ერთი ადგილი შეცდომისთვის.')}
      <div class="risks">
        <article class="risk">
          <span class="risk-n mono">01</span>
          <h3>დავიწყებული ფაილი</h3>
          ${snippet('s6-forgot', { numbers: false, bad: 3, cls: 'code--mini' })}
          <p>მონიშნულ ადგილას <span class="mono">About</span> უნდა ყოფილიყო — verify.html-ზე ლინკი უბრალოდ არ ჩანს, და ამას დიდხანს ვერავინ ამჩნევს.</p>
        </article>
        <article class="risk">
          <span class="risk-n mono">02</span>
          <h3>Typo</h3>
          ${snippet('s6-typo', { numbers: false, bad: 3, cls: 'code--mini' })}
          <p><span class="mono">abuot.html</span> — ლინკი 404-ზე მიდის.</p>
        </article>
        <article class="risk">
          <span class="risk-n mono">03</span>
          <h3>არასწორი active ლინკი</h3>
          ${snippet('s6-active', { numbers: false, bad: 3, cls: 'code--mini' })}
          <p>Cart-ის გვერდზე მონიშნულია Menu — კლასი კოპირებასთან ერთად "ჩამოყვა".</p>
        </article>
      </div>`,
  },

  {
    id: 'quiz-files',
    stage: STAGE,
    title: 'Quiz: რამდენი ფაილი?',
    time: '10:30 – 12:00 (1.5 წთ)',
    notes: `
      <p>მიეცით 20 წამი. სთხოვეთ ხელის აწევა თითოეულ ვარიანტზე, მერე დააჭირეთ პასუხს (ან კლავიში 1–4).</p>
      <p>სწორი: <b>11</b> — 10 არსებულ ფაილში ლინკი + ახალი <code>about.html</code>, რომელსაც <b>ასევე</b> სჭირდება header-ის ასლი.</p>
      <p>ხშირი პასუხია 10 — სწორედ ეს ფარული მე-11 ფაილი არის პრობლემის არსი.</p>`,
    html: () => `${head('Quiz')}<div class="quiz-wrap" data-quiz></div>`,
    mount(el) {
      return mountQuiz(el.querySelector('[data-quiz]'), {
        question: 'კლასიკურ HTML საიტზე About-ის დასამატებლად <b>რამდენი ფაილის</b> შეცვლა მოგვიწია?',
        options: ['1', '2', '10', '11'],
        answer: 3,
        explain: '10 არსებულ გვერდში ლინკის დამატება + ახალი <span class="mono">about.html</span>, რომელსაც header-ის <b>საკუთარი ასლი</b> სჭირდება. სულ 11 — და გვერდების რაოდენობასთან ერთად ეს რიცხვიც იზრდება.',
      });
    },
  },

  {
    id: 'mini-framework',
    stage: STAGE,
    title: 'ვცადეთ JS-ით: საკუთარი mini-framework',
    time: '12:00 – 13:30 (1.5 წთ)',
    notes: `
      <p>გულახდილი მომენტი: <b>ჩვენი</b> vanilla პროექტი ასე არ არის აწყობილი — მასში header ერთ ადგილასაა (<code>renderHeader()</code> app.js-ში).</p>
      <p>მაგრამ ამის მისაღწევად ხელით დავწერეთ: router, store + subscribe, header-ის თავიდან დახატვა, active ლინკი, escaping, cleanup. სულ <b>~190 ხაზი</b> (app.js 151 + store.js 38) — და About-ისთვის მაინც 4 ადგილის შეცვლა დაგვჭირდა.</p>
      <p>ფრაზა: <b>"ჩვენ უნებლიედ დავწერეთ პატარა, ცუდი React."</b> React არსებობს ზუსტად იმიტომ, რომ ეს ყველამ ცალ-ცალკე არ წეროს.</p>`,
    html: () => `
      ${head('ვცადეთ JS-ით: საკუთარი mini-framework', 'ჩვენს vanilla პროექტში header ერთ ადგილასაა. მაგრამ ამისთვის ხელით დავწერეთ ის, რასაც React მზად გვაძლევს.')}
      <div class="bridge">
        <ul class="bridge-list">
          <li><span class="mono">js/app.js</span><span><b>Router</b> — regex მარშრუტები, <span class="mono">history.pushState</span></span></li>
          <li><span class="mono">js/app.js</span><span><b>renderHeader()</b> — მთელი header ერთ სტრიქონად</span></li>
          <li><span class="mono">js/store.js</span><span><b>Store + subscribe</b> — საკუთარი pub/sub</span></li>
          <li><span class="mono">js/app.js</span><span><b>ხელახლა დახატვა</b> — ყოველ ცვლილებაზე header თავიდან</span></li>
          <li><span class="mono">js/app.js</span><span><b>markActiveNav()</b> — active ლინკი ხელით</span></li>
          <li><span class="mono">js/ui.js</span><span><b>esc()</b> — XSS-ისგან დაცვა ხელით</span></li>
        </ul>
        ${snippet('s8-header', { file: 'js/app.js', tag: 'შემოკლებული', hl: '3, 10, 13, 16', cls: 'code--compact' })}
      </div>
      <div class="bridge-sum">
        <span class="bridge-num mono">≈190</span>
        <p>ხაზი "ინფრასტრუქტურა" (<span class="mono">app.js</span> 151 + <span class="mono">store.js</span> 38) — და About-ისთვის მაინც <b>4 ადგილი</b> შევცვალეთ.<br><span class="muted">ჩვენ უნებლიედ დავწერეთ პატარა React. მოდით, ნამდვილს გავეცნოთ.</span></p>
      </div>`,
  },
];
