import { head, snippet } from './helpers.js';
import { codeBlock, flashLines } from '../components/code.js';
import { mountQuiz } from '../components/quiz.js';
import { icons } from '../components/icons.js';

const STAGE = '06 / TRIALS';

const side = (kind, label, file, body, points) => `
  <div class="trial-col trial-col--${kind}">
    <p class="trial-label"><span class="mono">${kind === 'vanilla' ? 'VANILLA' : 'REACT'}</span>${label}</p>
    ${body}
    <ul class="trial-points">${points.map((p) => `<li>${p}</li>`).join('')}</ul>
  </div>`;

const quizSlide = ({ id, title, time, notes, question, code, options, answer, explain }) => ({
  id,
  stage: STAGE,
  title,
  time,
  notes,
  html: () => `${head('Quiz')}<div class="quiz-wrap" data-quiz></div>`,
  mount: (el) => mountQuiz(el.querySelector('[data-quiz]'), {
    question, code: code ? codeBlock({ code, lang: 'jsx', numbers: false, cls: 'code--quiz' }) : '', options, answer, explain,
  }),
});

const PRICE = 15.5; // Pizza Prosciutto e Funghi — the product shown in the screenshots
const money = (n) => `$${n.toFixed(2)}`;

export default [
  {
    id: 'trial-cards',
    stage: STAGE,
    title: 'Trial 1 — განმეორებადი UI',
    time: '34:00 – 36:00 (2 წთ)',
    notes: `
      <p>ერთი ბარათი — 12 პროდუქტი. მარცხნივ ჩვენი vanilla <code>ui.productCard()</code>, მარჯვნივ React-ის <code>&lt;ProductCard /&gt;</code>.</p>
      <p>Vanilla-ში ბარათი <b>სტრიქონია</b>: escaping ხელით (<code>esc()</code>), ხოლო ღილაკის ქცევა <b>სხვა ფაილშია</b> — app.js-ში, document-ზე (<code>data-add</code>).</p>
      <p>React-ში markup და ქცევა ერთ ადგილასაა; მონაცემი <b>props</b>-ით შემოდის; <code>{p.name}</code> ავტომატურად escaped-ია.</p>`,
    html: () => `
      ${head('Trial 1 — განმეორებადი UI', 'პროდუქტის ბარათი: ერთი შაბლონი, 12 ბარათი.')}
      <div class="trial">
        ${side('vanilla', 'სტრიქონი-შაბლონი', '', snippet('s19-vanilla', { file: 'js/ui.js + js/app.js', tag: 'შემოკლებული', hl: '2, 4-5, 7, 12-13' }), [
          'HTML — სტრიქონია; ეკრანზე <span class="mono">innerHTML</span>-ით ხვდება',
          'XSS-ისგან დაცვა ხელით: <span class="mono">esc()</span> ყველგან',
          'ღილაკის ქცევა სხვა ფაილშია: <span class="mono">data-add</span> + document click',
        ])}
        ${side('react', 'კომპონენტი props-ით', '', snippet('s19-react', { file: 'src/components/ProductCard.jsx', tag: 'შემოკლებული', hl: '1, 5-6, 9' }), [
          'მონაცემი შემოდის <b>props</b>-ით: <span class="mono">{ p }</span>',
          'escaping ავტომატურია: <span class="mono">{p.name}</span>',
          'markup და ქცევა ერთ ადგილას: <span class="mono">onClick</span>',
        ])}
      </div>`,
  },

  quizSlide({
    id: 'quiz-props',
    title: 'Quiz: props',
    time: '36:00 – 37:00 (1 წთ)',
    notes: '<p>სწორი: <b>B</b>. props = კომპონენტის "არგუმენტები". ProductCard იღებს <code>{ p }</code>-ს და მისგან ხატავს ბარათს. props მხოლოდ წასაკითხია — კომპონენტი მათ არ ცვლის.</p>',
    question: 'რას აკეთებს <span class="mono">p={p}</span> ამ ჩანაწერში?',
    code: '{items.map((p) => <ProductCard key={p.id} p={p} />)}',
    options: [
      'ქმნის გლობალურ ცვლადს <span class="mono">p</span>',
      'კომპონენტს გადასცემს მონაცემს — <b>props</b>-ის სახით',
      'API-დან ითხოვს პროდუქტს',
      'ამატებს CSS კლასს <span class="mono">p</span>',
    ],
    answer: 1,
    explain: 'props = კომპონენტის "არგუმენტები". <span class="mono">ProductCard</span> იღებს <span class="mono">{ p }</span>-ს და მისგან ხატავს ბარათს — ერთი კომპონენტი, 12 სხვადასხვა პროდუქტი.',
  }),

  {
    id: 'trial-state',
    stage: STAGE,
    title: 'Trial 2 — State',
    time: '37:00 – 39:00 (2 წთ)',
    notes: `
      <p>პროდუქტის გვერდის რაოდენობის მთვლელი — ორივე პროექტიდან.</p>
      <p>დააჭირეთ <b>+</b> მარცხენა მინი-მთვლელზე: ინათება ხაზები 6–10 — event, მნიშვნელობის გამოთვლა და <b>ორი</b> ხელით DOM ჩაწერა (<code>qtyEl</code>, <code>totalEl</code>). დაგავიწყდებათ ერთი — ეკრანი "იცრუებს".</p>
      <p>მარჯვნივ: <code>setQty</code> → React <b>თავიდან არენდერებს</b> კომპონენტს → <code>{qty}</code> და ჯამი თვითონ განახლდება. ერთი წყარო: <code>qty</code>.</p>`,
    html: () => `
      ${head('Trial 2 — State', 'რაოდენობის მთვლელი პროდუქტის გვერდზე. სცადეთ ქვემოთ — და უყურეთ, რომელი ხაზები მუშაობს.')}
      <div class="trial">
        ${side('vanilla', 'ცვლადი + ხელით DOM', '', `
          <div data-code>${snippet('s21-vanilla', { file: 'js/pages/product.js', tag: 'შემოკლებული', hl: '9-10' })}</div>
          <div class="stepper-demo" data-demo="vanilla">
            <div class="sd-stepper"><button type="button" data-step="-1" aria-label="−">${icons.minus}</button><output data-q>1</output><button type="button" data-step="1" aria-label="+">${icons.plus}</button></div>
            <span class="sd-add">Add to cart · <b data-t>${money(PRICE)}</b></span>
            <span class="sd-note mono">ხელით: <b data-ops>0</b> DOM ჩაწერა</span>
          </div>`, [
          '<span class="mono">qty</span> — უბრალო ცვლადი; ეკრანმა მის შესახებ არაფერი იცის',
          'ყოველ ცვლილებაზე <b>ორივე</b> ადგილი ხელით უნდა განახლდეს',
        ])}
        ${side('react', 'useState + re-render', '', `
          <div data-code>${snippet('s21-react', { file: 'src/pages/Product.jsx', tag: 'შემოკლებული', hl: '1, 4, 8' })}</div>
          <div class="stepper-demo" data-demo="react">
            <div class="sd-stepper"><button type="button" data-step="-1" aria-label="−">${icons.minus}</button><output data-q>1</output><button type="button" data-step="1" aria-label="+">${icons.plus}</button></div>
            <span class="sd-add">Add to cart · <b data-t>${money(PRICE)}</b></span>
            <span class="sd-note mono">re-render: <b data-ops>0</b></span>
          </div>`, [
          '<span class="mono">useState</span> აბრუნებს <span class="mono">[მნიშვნელობა, setter]</span>',
          '<span class="mono">setQty</span> → React თავიდან ხატავს; ეკრანი ყოველთვის <span class="mono">qty</span>-ს ემთხვევა',
        ])}
      </div>`,
    mount(el) {
      const demos = [...el.querySelectorAll('[data-demo]')].map((demo) => ({
        kind: demo.dataset.demo, demo, code: demo.previousElementSibling, q: 1, ops: 0,
      }));
      const timers = [];
      const onClick = (e) => {
        const b = e.target.closest('[data-step]');
        if (!b) return;
        const d = demos.find((x) => x.demo.contains(b));
        const step = Number(b.dataset.step);
        d.q = Math.min(99, Math.max(1, d.q + step));
        if (d.kind === 'vanilla') {
          flashLines(d.code, '6-10');
          d.ops += 2;
          d.demo.querySelector('[data-q]').textContent = d.q;
          d.demo.querySelector('[data-t]').textContent = money(PRICE * d.q);
        } else {
          flashLines(d.code, step > 0 ? 5 : 3);
          timers.push(setTimeout(() => {
            flashLines(d.code, '4, 8', 'is-flash-soft');
            d.demo.querySelector('[data-q]').textContent = d.q;
            d.demo.querySelector('[data-t]').textContent = money(PRICE * d.q);
            d.demo.classList.remove('is-render'); void d.demo.offsetWidth; d.demo.classList.add('is-render');
          }, 260));
          d.ops += 1;
        }
        d.demo.querySelector('[data-ops]').textContent = d.ops;
      };
      el.addEventListener('click', onClick);
      return { unmount: () => { el.removeEventListener('click', onClick); timers.forEach(clearTimeout); } };
    },
  },

  quizSlide({
    id: 'quiz-state',
    title: 'Quiz: state',
    time: '39:00 – 40:00 (1 წთ)',
    notes: '<p>სწორი: <b>C</b>. setter-ის გამოძახება React-ს ეუბნება: "state შეიცვალა" → კომპონენტი თავიდან სრულდება და JSX ახალ მნიშვნელობას აჩვენებს. ხელით DOM-ს არ ვეხებით.</p>',
    question: 'რა ხდება <span class="mono">setQty((q) =&gt; q + 1)</span>-ის გამოძახების შემდეგ?',
    options: [
      'არაფერი, სანამ გვერდს არ განაახლებ',
      '<span class="mono">textContent</span> ხელით უნდა შეცვალო',
      'React თავიდან არენდერებს კომპონენტს — <span class="mono">{qty}</span> და ჯამი თვითონ განახლდება',
      'იტვირთება ახალი HTML გვერდი',
    ],
    answer: 2,
    explain: 'setter React-ს ატყობინებს, რომ state შეიცვალა. React კომპონენტს თავიდან "გაუშვებს", ახალ JSX-ს ძველს შეადარებს და DOM-ში მხოლოდ განსხვავებას შეცვლის.',
  }),

  {
    id: 'trial-api',
    stage: STAGE,
    title: 'Trial 3 — API მონაცემები',
    time: '40:00 – 42:00 (2 წთ)',
    notes: `
      <p>მენიუს ჩატვირთვა API-დან. Vanilla-ში ყოველი მდგომარეობა — loading, empty, error, data — <b>ცალკე innerHTML ბრძანებაა</b> (მონიშნული ხაზები).</p>
      <p>React-ში: fetch → <b>state</b> → JSX. ყველა მდგომარეობა ერთ ადგილას ჩანს, როგორც პირობა. <code>.map()</code> აბრუნებს <b>კომპონენტების მასივს</b>.</p>
      <p>შეამჩნიეთ <code>key={p.id}</code> — ქვიზში დავუბრუნდებით.</p>`,
    html: () => `
      ${head('Trial 3 — API მონაცემები', 'მენიუ API-დან: loading → მონაცემი / ცარიელი / შეცდომა.')}
      <div class="trial">
        ${side('vanilla', 'fetch + innerHTML სტრიქონები', '', snippet('s23-vanilla', { file: 'js/pages/menu.js', tag: 'შემოკლებული', hl: '1, 5-8, 11' }), [
          'ყოველი მდგომარეობა — ცალკე <span class="mono">innerHTML</span> ჩაწერა',
          'HTML იწყობა სტრიქონებად და <span class="mono">join(\'\')</span>-ით',
        ])}
        ${side('react', 'fetch → state → .map()', '', snippet('s23-react', { file: 'src/pages/Menu.jsx', tag: 'შემოკლებული', hl: '2-4, 8-11' }), [
          'მონაცემი → <b>state</b> → JSX; ეკრანი ყოველთვის state-ს ემთხვევა',
          '<span class="mono">.map()</span> აბრუნებს კომპონენტების მასივს',
        ])}
      </div>`,
  },

  quizSlide({
    id: 'quiz-key',
    title: 'Quiz: key',
    time: '42:00 – 43:00 (1 წთ)',
    notes: '<p>სწორი: <b>C</b>. key-ით React ცნობს, რომელი ელემენტი რომელია ორ რენდერს შორის — სიაში დამატებისას, წაშლისას თუ გადალაგებისას. key უნდა იყოს სტაბილური და უნიკალური (id), არა მასივის index, თუ სია იცვლება.</p>',
    question: 'რატომ ვწერთ <span class="mono">key={p.id}</span>-ს?',
    code: '{items.map((p) => <ProductCard key={p.id} p={p} />)}',
    options: [
      'CSS სტილისთვის',
      'ასე მოითხოვს API',
      'რომ React-მა რენდერებს შორის გაარჩიოს სიის ელემენტები',
      'რომ fetch უფრო სწრაფი იყოს',
    ],
    answer: 2,
    explain: 'key ელემენტის "პირადობის მოწმობაა". მისით React ხვდება, რომელი ბარათი დაემატა, წაიშალა თუ გადაადგილდა — და მხოლოდ მათ ცვლის. საუკეთესოა სტაბილური id.',
  }),
];
