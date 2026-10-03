import { head, IMG, bwImage, snippet } from './helpers.js';

const STAGE = '08 / RETURN';

const VOCAB = [
  ['Component', 'A reusable function that returns a piece of UI.'],
  ['Props', 'Inputs passed into a component, like function arguments. Read-only.'],
  ['State', 'Data a component remembers between renders; changing it updates the UI.'],
  ['Hook', 'A function starting with "use" that adds React features to a component.'],
  ['useState', 'A hook that returns [value, setValue]; calling setValue triggers a re-render.'],
  ['useEffect', 'A hook for side effects after render, e.g. fetching data (details next lecture).'],
  ['JSX', 'HTML-like syntax inside JavaScript that compiles to React elements.'],
  ['Re-render', 'React calling a component again to compute its new UI after state or props change.'],
  ['Virtual DOM', 'An in-memory description of the UI; React compares versions and applies only the differences to the real DOM.'],
  ['Declarative', 'Describing what the UI should look like for a given state, not the steps to change it.'],
  ['Imperative', 'Writing the DOM changes step by step yourself (querySelector, textContent…).'],
  ['key', 'A stable id for list items, so React can tell them apart between renders.'],
  ['Single source of truth', 'Each piece of data lives in one place; everything else reads from it.'],
  ['Routing', 'Mapping a URL to the content that should be shown.'],
  ['SPA', 'Single-page application: one HTML page; content changes without full page reloads.'],
  ['Client-side routing', 'Changing the URL and view in the browser (History API) without asking the server for a new page.'],
  ['Library vs framework', 'Your code calls a library (React); a framework calls your code and sets the structure (Angular).'],
  ['Meta-framework', 'A framework built on top of a library, adding routing, server rendering and build tools (Next.js).'],
];

export default [
  {
    id: 'recap',
    stage: STAGE,
    title: 'რა შეგიძლიათ ახლა',
    time: '43:00 – 44:00 (1 წთ)',
    notes: `
      <p>გავიაროთ მოგზაურობა უკან: თითოეული ხაზი ერთ ეტაპს შეესაბამება (მარცხნივ ეტაპის ნომერი).</p>
      <p>სთხოვეთ ერთ-ერთ სტუდენტს, საკუთარი სიტყვებით ახსნას <b>რატომ</b> არ განახლდა ეკრანი "იპოვე ბაგი" სლაიდზე.</p>`,
    html: () => `
      ${head('რა შეგიძლიათ ახლა', 'რაც ლექციის დასაწყისში არ შეგეძლოთ.')}
      <ol class="recap-list">
        <li><span class="mono">03 / REFUSAL</span><p>აუხსნათ, რატომ არ მასშტაბირდება copy-paste header — და რა ფასი აქვს "საკუთარ framework-ს"</p></li>
        <li><span class="mono">04 / MENTOR</span><p>გაარჩიოთ client-side routing და გვერდის სრული ჩატვირთვა; ახსნათ UI = f(state)</p></li>
        <li><span class="mono">06 / TRIALS · 1</span><p>დაყოთ UI კომპონენტებად და გადასცეთ მონაცემი <span class="mono">props</span>-ით</p></li>
        <li><span class="mono">06 / TRIALS · 2</span><p>შეინახოთ მდგომარეობა <span class="mono">useState</span>-ით და დაეყრდნოთ re-render-ს</p></li>
        <li><span class="mono">06 / TRIALS · 3</span><p>API-ს მონაცემი <span class="mono">.map()</span>-ით აქციოთ კომპონენტებად — <span class="mono">key</span>-ით</p></li>
        <li><span class="mono">07 / ORDEAL</span><p>იპოვოთ state-ის მუტაციის და დაკარგული <span class="mono">key</span>-ის ბაგები</p></li>
      </ol>`,
  },

  {
    id: 'vocabulary',
    stage: STAGE,
    title: 'ლექსიკონი',
    time: '44:00 – 45:30 (1.5 წთ)',
    notes: `
      <p>ყველა ახალი ტერმინი ერთ გვერდზე, მოკლე ინგლისური განმარტებით — ასე შეხვდებიან მათ დოკუმენტაციაში (react.dev).</p>
      <p>შესთავაზეთ სტუდენტებს სლაიდის ფოტოს გადაღება.</p>`,
    html: () => `
      ${head('ლექსიკონი', 'ყველა ახალი ტერმინი — ისე, როგორც დოკუმენტაციაში შეხვდებით.')}
      <dl class="vocab">
        ${VOCAB.map(([t, d]) => `<div><dt class="mono">${t}</dt><dd>${d}</dd></div>`).join('')}
      </dl>`,
  },

  {
    id: 'practice',
    stage: STAGE,
    title: 'პრაქტიკა — 45 წუთი',
    time: '45:30 – 46:00 (0.5 წთ) · შემდეგ შესვენება 10 წთ (B) · შემდეგ პრაქტიკა 45 წთ',
    notes: `
      <p>აქ ჩართეთ <b>ყავის შესვენება</b>: B ან ზედა მარჯვენა კუთხის ხატულა (10:00).</p>
      <p>პრაქტიკის რიტმი: 5 / 10 / 10 / 10 / 10 წთ. ყოველი ეტაპის ბოლოს — ერთი სტუდენტის ეკრანი პროექტორზე.</p>
      <p><code>API_KEY</code> — ლექტორი აწვდის (ჩვენი პროექტის <code>src/config.js</code>-დან). <code>useEffect</code> დღეს გამოიყენეთ შაბლონად — დეტალურად შემდეგ ლექციაზე.</p>
      <p>ვინც ადრე დაასრულებს: Menu-ს გვერდი ფილტრით (Vegetarian) — <code>/api/products/filter?Vegetarian=true</code>.</p>`,
    html: () => `
      ${head('პრაქტიკა — 45 წუთი', 'საკუთარი პატარა რესტორანი React-ით. იგივე API.')}
      <div class="practice">
        <ol class="practice-steps">
          <li><span class="mono">05′</span><div><h3>პროექტის შექმნა</h3><p>Vite + React; <span class="mono">npm run dev</span></p></div></li>
          <li><span class="mono">10′</span><div><h3><span class="mono">&lt;Header /&gt;</span></h3><p>ლოგო + 3 ლინკი; გამოიყენეთ <span class="mono">App</span>-ში</p></div></li>
          <li><span class="mono">10′</span><div><h3><span class="mono">&lt;ProductCard /&gt;</span> props-ით</h3><p>name, price, image; 3 ბარათი მასივიდან <span class="mono">.map()</span>-ით — <span class="mono">key</span>-ით</p></div></li>
          <li><span class="mono">10′</span><div><h3><span class="mono">useState</span></h3><p>რაოდენობის მთვლელი (+ / −) და ჯამური ფასი</p></div></li>
          <li><span class="mono">10′</span><div><h3>API</h3><p><span class="mono">/api/categories</span> → კატეგორიების სია. ბონუსი: პროდუქტები</p></div></li>
        </ol>
        <div class="practice-code">
          ${snippet('s28-create', { file: 'terminal', numbers: false })}
          ${snippet('s28-fetch', { file: 'src/App.jsx', tag: 'შაბლონი', hl: '5' })}
        </div>
      </div>`,
  },

  {
    id: 'thanks',
    stage: STAGE,
    tone: 'image',
    title: 'მადლობა',
    time: 'ლექციის ბოლოს (პრაქტიკის შემდეგ)',
    notes: `
      <p>მადლობა + კითხვები. გაუზიარეთ live ბმულები და GitHub რეპოზიტორიები, რომ სახლში შეადარონ ორი ვერსია.</p>
      <p>შემდეგი ლექციის ანონსი: <code>useEffect</code>, ფორმები და routing პრაქტიკაში.</p>`,
    html: () => `
      <div class="thanks">
        ${bwImage(IMG.facade, 'thanks-img')}
        <div class="thanks-text">
          <h1>მადლობა.</h1>
          <p class="thanks-q">კითხვები?</p>
          <dl class="thanks-links mono">
            <div><dt>vanilla</dt><dd>thothcher.github.io/restaurant-vanilla-js</dd></div>
            <div><dt>react</dt><dd>thothcher.github.io/restaurant-react</dd></div>
            <div><dt>code</dt><dd>github.com/thothcher</dd></div>
          </dl>
          <p class="thanks-credits">ფოტოები (Unsplash): ${[IMG.architecture, IMG.workspace, IMG.abstract, IMG.towers, IMG.facade].map((i) => i.author).join(' · ')}</p>
        </div>
      </div>`,
  },
];

