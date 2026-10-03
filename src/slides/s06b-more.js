// More trials: three live "vanilla vs React" demos (real DOM code next to real React),
// a quiz, and a summary of what React gives us — with numbers from our two projects.
import { head } from './helpers.js';
import { codeBlock } from '../components/code.js';
import { mountQuiz } from '../components/quiz.js';
import { icons } from '../components/icons.js';
import { mountReconcileDemo } from '../demos/reconcile.jsx';
import { mountXssDemo } from '../demos/xss.jsx';
import { mountListenersDemo } from '../demos/listeners.jsx';

const STAGE = '06 / TRIALS';
const code = (c, opts = {}) => codeBlock({ code: c, lang: 'jsx', numbers: false, cls: 'code--strip', ...opts });

export default [
  {
    id: 'trial-reconcile',
    stage: STAGE,
    title: 'Trial 4 — მხოლოდ ის, რაც შეიცვალა',
    time: '40:00 – 42:30 (2.5 წთ)',
    notes: `
      <p>ორივე header <b>ნამდვილად</b> მუშაობს: მარცხნივ — <code>innerHTML</code> (ზუსტად ისე, როგორც ჩვენი <code>renderHeader()</code>), მარჯვნივ — ნამდვილი React კომპონენტი. ციფრებს <b>MutationObserver</b> ზომავს — ეს არ არის სიმულაცია.</p>
      <p>დააჭირეთ <b>+ კალათაში</b>: მარცხნივ წითლად ინათება მთელი ხე — 18 ელემენტი წაიშალა და თავიდან შეიქმნა. მარჯვნივ — მხოლოდ ერთი ტექსტი: "2" → "3".</p>
      <p>რატომ არის ეს მნიშვნელოვანი: ახალი ელემენტი = დაკარგული focus, hover, ანიმაცია, input-ში ჩაწერილი ტექსტი. ქვედა ხაზი ამას ამოწმებს: "Menu ლინკი — იგივე ელემენტია?"</p>
      <p>ეს არის <b>reconciliation</b>: React ადარებს ახალ JSX-ს წინას (virtual DOM) და მხოლოდ განსხვავებას ცვლის. ჩამოიყვანეთ 0-მდე: React შლის 1 ელემენტს (badge), vanilla — ისევ 18-ს.</p>`,
    html: () => `
      ${head('Trial 4 — მხოლოდ ის, რაც შეიცვალა', 'კალათაში დამატებისას იცვლება ერთი ციფრი. რას შლის და ქმნის ბრაუზერი? ზომავს MutationObserver.')}
      <div class="demo-ctrl">
        <span class="kicker mono">state</span>
        <button type="button" class="btn" data-d="-1" aria-label="შემცირება">${icons.minus}</button>
        <span class="mono demo-val">cartCount = <b data-n>2</b></span>
        <button type="button" class="btn btn-solid" data-d="1">${icons.plus}<span>კალათაში</span></button>
      </div>
      <div class="demo-cols">
        <section class="demo-col">
          <p class="trial-label"><span class="mono">VANILLA</span><span class="mono demo-how">$header.innerHTML = template</span></p>
          <div class="mh" data-v-header></div>
          <p class="demo-stat" data-v-stat>დააჭირეთ "კალათაში"</p>
          <ul class="tree-live mono" data-v-tree></ul>
          <p class="demo-same" data-v-same></p>
          ${code('store.subscribe(renderHeader);   // ყოველ ცვლილებაზე → $header.innerHTML = `…`', { lang: 'javascript', cls: 'code--strip code--bottom' })}
        </section>
        <section class="demo-col">
          <p class="trial-label"><span class="mono">REACT</span><span class="mono demo-how">reconciliation</span></p>
          <div class="mh" data-r-header></div>
          <p class="demo-stat" data-r-stat>დააჭირეთ "კალათაში"</p>
          <ul class="tree-live mono" data-r-tree></ul>
          <p class="demo-same" data-r-same></p>
          ${code('Cart{cartCount > 0 && <span className="count">{cartCount}</span>}', { cls: 'code--strip code--bottom' })}
        </section>
      </div>`,
    mount: (el) => mountReconcileDemo(el),
  },

  {
    id: 'trial-xss',
    stage: STAGE,
    title: 'Trial 5 — უსაფრთხოება ნაგულისხმევად',
    time: '42:30 – 44:30 (2 წთ)',
    notes: `
      <p>სცენარი: API-დან მოვიდა პროდუქტი, რომლის სახელშიც ვიღაცამ HTML ჩაწერა. ეს <b>XSS</b>-ია (cross-site scripting).</p>
      <p>მარცხნივ — <code>innerHTML</code> esc()-ის გარეშე: ბრაუზერი სახელს HTML-ად კითხულობს და <code>onerror</code> სკრიპტი <b>ნამდვილად სრულდება</b> (აქ ის მხოლოდ პანელს აწითლებს, რეალურ თავდასხმაში token-ს მოიპარავდა).</p>
      <p>ჩართეთ "esc()" — vanilla უსაფრთხო ხდება. ჩვენს vanilla პროექტში esc() <b>37-ჯერ</b> წერია: ერთი გამოტოვება საკმარისია.</p>
      <p>მარჯვნივ — ნამდვილი React: <code>{p.name}</code> ყოველთვის ტექსტია. საშიში გზა არსებობს, მაგრამ სახელითვე გაფრთხილებს: <code>dangerouslySetInnerHTML</code>.</p>`,
    html: () => `
      ${head('Trial 5 — უსაფრთხოება ნაგულისხმევად', 'API-დან მოსულ პროდუქტის სახელში ვიღაცამ HTML ჩაწერა. რა მოხდება ეკრანზე?')}
      <div class="xss-ctrl">
        <label class="xss-input"><span class="kicker mono">p.name (API-დან)</span><input type="text" data-name spellcheck="false"></label>
        <div class="xss-presets">
          <button type="button" class="btn" data-preset="ok">ჩვეულებრივი სახელი</button>
          <button type="button" class="btn btn-solid" data-preset="bad">მავნე სახელი</button>
        </div>
      </div>
      <div class="demo-cols">
        <section class="demo-col xss-side" data-v-side>
          <p class="trial-label"><span class="mono">VANILLA</span><span class="mono demo-how">innerHTML</span></p>
          <div class="xss-stage"><div data-v-card></div><div class="xss-alarm mono">XSS · სხვისი სკრიპტი შესრულდა თქვენს გვერდზე</div></div>
          <div class="xss-row"><span class="xss-chip" data-v-chip></span>
            <label class="xss-toggle"><input type="checkbox" data-esc> <span class="mono">esc()</span> ჩართვა</label></div>
          ${code('card.innerHTML = `<h3>${p.name}</h3>`;   // esc() დაგავიწყდა?', { lang: 'javascript' })}
          <p class="demo-note">ჩვენს vanilla პროექტში <span class="mono">esc()</span> <b>37-ჯერ</b> წერია. ერთი გამოტოვება — და ხვრელი მზადაა.</p>
        </section>
        <section class="demo-col xss-side">
          <p class="trial-label"><span class="mono">REACT</span><span class="mono demo-how">{p.name}</span></p>
          <div class="xss-stage"><div data-r-card></div></div>
          <div class="xss-row"><span class="xss-chip is-good">ყოველთვის ტექსტია — უსაფრთხო</span></div>
          ${code('<h3>{p.name}</h3>')}
          <p class="demo-note">escaping ავტომატურია. საშიში გზა სახელითვე გაფრთხილებს: <span class="mono">dangerouslySetInnerHTML</span>.</p>
        </section>
      </div>`,
    mount: (el) => mountXssDemo(el),
  },

  {
    id: 'trial-listeners',
    stage: STAGE,
    title: 'Trial 6 — event listener-ები: ვინ ასუფთავებს?',
    time: '44:30 – 46:30 (2 წთ) · სურვილისამებრ',
    notes: `
      <p><b>რეალური ბაგი</b> ჩვენი vanilla ვერსიის აწყობიდან: SPA-ში <code>#app</code> კონტეინერი რჩება, გვერდები იცვლება. ყოველ ვიზიტზე პროდუქტის გვერდი <code>addEventListener</code>-ს იძახებდა, ძველი კი არ იშლებოდა.</p>
      <p>მარცხნივ (cleanup გამორთულია): Menu → Product → Menu → Product… ყოველი ვიზიტი კიდევ ერთ listener-ს ამატებს. მერე დააჭირეთ <b>+</b> — რაოდენობა 1-ით კი არა, <b>N-ით</b> იზრდება.</p>
      <p>ჩართეთ "cleanup" — ეს არის ხაზი, რომელიც ახლა ჩვენს <code>product.js</code>-შია: <code>return () =&gt; root.removeEventListener(...)</code>.</p>
      <p>მარჯვნივ — React: <code>onClick</code> ელემენტზეა; listener-ებს React თვითონ ამატებს და შლის. ყოველთვის +1. დროის ნაკლებობისას ეს სლაიდი შეიძლება გამოტოვოთ.</p>`,
    html: () => `
      ${head('Trial 6 — event listener-ები: ვინ ასუფთავებს?', 'SPA-ში გვერდები იცვლება, #app კი რჩება. თუ ძველი listener-ები არ მოიხსნა, ერთი click რამდენჯერმე სრულდება.')}
      <div class="demo-cols">
        <section class="demo-col">
          <p class="trial-label"><span class="mono">VANILLA</span><span class="mono demo-how">app.addEventListener</span></p>
          <div class="la-app" data-pop-host>
            <nav class="la-nav" data-v-nav><button type="button" data-page="menu">Menu</button><button type="button" data-page="product">Product</button></nav>
            <div data-v-app></div>
          </div>
          <div class="la-metrics">
            <span class="la-metric">listener-ები #app-ზე: <b data-v-listeners>0</b></span>
            <span class="la-metric">Product-ზე შესვლა: <b data-v-visits>0</b></span>
          </div>
          <label class="xss-toggle"><input type="checkbox" data-cleanup> cleanup ჩართვა <span class="mono">(return () =&gt; removeEventListener)</span></label>
          ${code("app.addEventListener('click', onClick);\nreturn () => app.removeEventListener('click', onClick);   // დაგავიწყდა?", { lang: 'javascript', hl: 2 })}
        </section>
        <section class="demo-col">
          <p class="trial-label"><span class="mono">REACT</span><span class="mono demo-how">onClick</span></p>
          <div data-r-app></div>
          <div class="la-metrics">
            <span class="la-metric is-good">listener-ები: <b>React მართავს</b></span>
            <span class="la-metric">Product-ზე შესვლა: <b data-r-visits>0</b></span>
          </div>
          <p class="demo-note">გამოწერა და გასუფთავება React-ის საქმეა — ჩვენი კოდი მხოლოდ ამბობს, <b>რა</b> უნდა მოხდეს click-ზე.</p>
          ${code('<button onClick={() => setQty((q) => q + 1)}>+</button>')}
        </section>
      </div>`,
    mount: (el) => mountListenersDemo(el),
  },

  {
    id: 'quiz-reconcile',
    stage: STAGE,
    title: 'Quiz: reconciliation',
    time: '46:30 – 47:30 (1 წთ)',
    notes: '<p>სწორი: <b>B</b>. React ადარებს ახალ JSX-ს წინას და DOM-ში მხოლოდ განსხვავებას ცვლის — აქ ერთ ტექსტურ კვანძს. Trial 4-ში ეს MutationObserver-მა გაზომა: 1 ცვლილება 18-ის წინააღმდეგ.</p>',
    html: () => `${head('Quiz')}<div class="quiz-wrap" data-quiz></div>`,
    mount: (el) => mountQuiz(el.querySelector('[data-quiz]'), {
      question: '<span class="mono">cartCount</span> 2-დან 3-ზე შეიცვალა. რას შეცვლის React <b>DOM-ში</b>?',
      options: [
        'მთელ header-ს შექმნის თავიდან',
        'მხოლოდ ტექსტს: "2" → "3"',
        'გვერდს გადატვირთავს',
        'badge-ს წაშლის და თავიდან დაამატებს',
      ],
      answer: 1,
      explain: 'ეს არის <b>reconciliation</b>: React ადარებს ახალ JSX-ს წინას (virtual DOM) და რეალურ DOM-ში მხოლოდ განსხვავებას ცვლის — ერთ ტექსტურ კვანძს. ყველა სხვა ელემენტი იგივე რჩება.',
    }),
  },

  {
    id: 'why-react',
    stage: STAGE,
    title: 'რატომ React — ჯამი',
    time: '47:30 – 49:00 (1.5 წთ)',
    notes: `
      <p>ექვსი უპირატესობა — თითოეულს ჩვენი ორი პროექტიდან ციფრი ახლავს (ქვედა ხაზი თითო ბარათზე).</p>
      <p>ხაზი გაუსვით: React არ არის "ჯადოქრობა". ის აკეთებს იმას, რასაც ჩვენ vanilla-ში ხელით ვწერდით (router, re-render, escaping, cleanup) — ოღონდ ერთხელ, სწორად და ათასობით პროექტში გამოცდილად.</p>`,
    html: () => `
      ${head('რატომ React — ჯამი', 'ის, რაც ჩვენს ორ პროექტზე ვნახეთ — და ის, რაც მათ მიღმაა.')}
      <div class="powers">
        ${[
          ['blocks', 'კომპონენტები', 'ერთხელ აღწერე — ყველგან გამოიყენე, props-ით.', '<Field /> — 22-ჯერ, 6 ფორმაში'],
          ['equals', 'დეკლარაციული UI', 'აღწერ შედეგს: UI = f(state). DOM-ს React ცვლის.', 'vanilla: 34 innerHTML ჩაწერა ხელით'],
          ['diff', 'Reconciliation', 'იცვლება მხოლოდ ის, რაც შეიცვალა — focus და state რჩება.', 'header: 18 ელემენტი → 1 ტექსტი'],
          ['shield', 'უსაფრთხოება', 'escaping ავტომატურია — XSS ნაგულისხმევად დახურულია.', 'vanilla: esc() 37-ჯერ'],
          ['cycle', 'Lifecycle', 'listener-ების და effect-ების გასუფთავება სტანდარტულ ადგილასაა.', 'vanilla: cleanup ყოველ გვერდზე ხელით'],
          ['network', 'ეკოსისტემა', 'React Router, Next.js, React Native, DevTools — ერთი ცოდნა, ბევრი პლატფორმა.', 'Stack Overflow 2025: 44.7% იყენებს'],
        ].map(([ico, t, d, ev], i) => `
          <article class="power">
            <span class="power-n mono">0${i + 1}</span>
            <span class="power-ico">${icons[ico]}</span>
            <h3>${t}</h3>
            <p>${d}</p>
            <span class="power-ev mono">${ev.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</span>
          </article>`).join('')}
      </div>`,
  },
];
