import { head, snippet } from './helpers.js';
import { setLines } from '../components/code.js';

const STAGE = '07 / ORDEAL';

const STEPS = [
  { bug: null },
  {
    bug: '7-9',
    title: 'ბაგი 1 — state-ის მუტაცია',
    text: '<span class="mono">list.items.push(…)</span> ცვლის <b>არსებულ</b> ობიექტს, ხოლო <span class="mono">setList(list)</span> React-ს <b>იმავე</b> ობიექტს აძლევს. React ძველსა და ახალს ადარებს (<span class="mono">Object.is</span>) → "არაფერი შეცვლილა" → re-render არ ხდება. ახალი პროდუქტები ეკრანზე არ ჩანს.',
  },
  {
    bug: '14',
    title: 'ბაგი 2 — key აკლია',
    text: '<span class="mono">.map()</span>-ში თითო ელემენტს სტაბილური <span class="mono">key</span> სჭირდება. მის გარეშე React ბარათებს ვერ არჩევს ერთმანეთისგან: კონსოლში warning-ია, ხოლო სიის შეცვლისას შეიძლება არასწორი ბარათი განახლდეს.',
  },
  {
    fix: true,
    title: 'გამოსწორება',
    text: 'ახალი ობიექტი და ახალი მასივი (<span class="mono">[...l.items, ...res.products]</span>) + <span class="mono">key={p.id}</span>. ზუსტად ასეა ჩვენს <span class="mono">src/pages/Menu.jsx</span>-ში.',
  },
];

export default [
  {
    id: 'spot-the-bug',
    stage: STAGE,
    title: 'იპოვე ბაგი',
    time: '49:00 – 52:00 (3 წთ)',
    steps: '→ #1: ბაგი 1 · → #2: ბაგი 2 · → #3: გამოსწორებული კოდი · ← უკან ნაბიჯით.',
    notes: `
      <p>სცენარი: "Load more"-ზე დაჭერისას ახალი პროდუქტები <b>არ ჩნდება</b>. კოდში <b>ორი</b> შეცდომაა.</p>
      <p>მიეცით 60–90 წამი, წყვილებში განიხილონ. მინიშნება, თუ საჭიროა: "რას ადარებს React, როცა <code>setList</code>-ს იძახებთ?"</p>
      <p>→ ბაგი 1: მუტაცია + იგივე reference → re-render არ ხდება. → ბაგი 2: key. → გამოსწორება (ჩვენი რეალური Menu.jsx-ის მსგავსად).</p>
      <p>წესი, რომელიც უნდა დაიმახსოვრონ: <b>state-ს არ ვცვლით — ვქმნით ახალს.</b></p>`,
    html: () => `
      ${head('იპოვე ბაგი', '"Load more"-ზე დაჭერისას ახალი პროდუქტები არ ჩნდება. კოდში ორი შეცდომაა — იპოვეთ ორივე.')}
      <div class="ordeal">
        <div class="ordeal-code">
          <div data-bug>${snippet('s25-bug', { file: 'src/pages/Menu.jsx', tag: 'ბაგით' })}</div>
          <div data-fix hidden>${snippet('s25-fix', { file: 'src/pages/Menu.jsx', tag: 'გამოსწორებული', add: '7, 12' })}</div>
        </div>
        <aside class="ordeal-side">
          <ol class="ordeal-steps" data-steps>
            ${STEPS.slice(1).map((s, i) => `
              <li data-step="${i + 1}" class="${s.fix ? 'is-fix' : ''}">
                <span class="mono ordeal-n">${s.fix ? 'FIX' : `0${i + 1}`}</span>
                <div><h3>${s.title}</h3><p>${s.text}</p></div>
              </li>`).join('')}
          </ol>
          <p class="ordeal-prompt mono" data-prompt>იფიქრეთ 60 წამი — შემდეგ → პასუხისთვის</p>
        </aside>
      </div>`,
    mount(el) {
      let step = 0;
      const bug = el.querySelector('[data-bug]');
      const fix = el.querySelector('[data-fix]');
      const items = [...el.querySelectorAll('[data-steps] li')];
      const prompt = el.querySelector('[data-prompt]');
      const paint = () => {
        setLines(bug, '1-20', 'is-bad', false);
        STEPS.slice(1, step + 1).forEach((s) => { if (s.bug) setLines(bug, s.bug, 'is-bad', true); });
        const fixed = step >= 3;
        bug.hidden = fixed;
        fix.hidden = !fixed;
        items.forEach((li, i) => li.classList.toggle('is-shown', i < step));
        prompt.hidden = step > 0;
      };
      paint();
      return {
        next() { if (step >= 3) return false; step += 1; paint(); return true; },
        prev() { if (step <= 0) return false; step -= 1; paint(); return true; },
      };
    },
  },
];
