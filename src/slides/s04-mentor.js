import { head, IMG, bwImage, snippet } from './helpers.js';
import { flashLines } from '../components/code.js';
import { icons } from '../components/icons.js';
import { monitorsSlide } from './monitors.js';

const STAGE = '04 / MENTOR';

export default [
  {
    id: 'mentor',
    stage: STAGE,
    tone: 'dark',
    title: 'მენტორი: React',
    time: '13:30 – 14:00 (0.5 წთ)',
    notes: `
      <p>გადასვლა: "პრობლემა ვნახეთ. ახლა — მენტორი."</p>
      <p>React-ის ოფიციალური განმარტება: <b>"The library for web and native user interfaces"</b> (react.dev). ხაზი გაუსვით: <b>ბიბლიოთეკა</b>, არა framework — ამას ცხრილში დავუბრუნდებით.</p>`,
    html: () => `
      <div class="opener">
        ${bwImage(IMG.abstract, 'opener-img')}
        <div class="opener-text">
          <p class="kicker mono">THE MENTOR · მენტორი</p>
          <h1>React</h1>
          <p class="lead">ბიბლიოთეკა, რომელიც ინტერფეისს <b>მონაცემებიდან</b> აგებს.</p>
          <p class="opener-quote mono">"The library for web and native user interfaces" — react.dev</p>
        </div>
      </div>`,
  },

  {
    id: 'history',
    stage: STAGE,
    title: 'საიდან გაჩნდა React',
    time: '14:00 – 15:30 (1.5 წთ)',
    notes: `
      <p><b>2011</b> — Jordan Walke (Facebook) ქმნის პროტოტიპს FaxJS; React პირველად News Feed-ში ჩნდება. <b>2012</b> — Instagram.com.</p>
      <p><b>2013 მაისი</b> — open source, JSConf US. თავიდან ბევრმა გააკრიტიკა: "HTML JavaScript-ში?!" (JSX).</p>
      <p><b>2015</b> React Native, <b>2019</b> Hooks (16.8), <b>2024 დეკემბერი</b> React 19.</p>
      <p>პრობლემა, რომელმაც ეს გამოიწვია: ერთი და იგივე მონაცემი ეკრანის <b>რამდენიმე ადგილას</b> ჩანდა (მაგ. წაუკითხავი შეტყობინებების მრიცხველი) და ხელით სინქრონიზაცია ცდებოდა. გამოსავალი: აღწერე, <b>რა</b> უნდა ჩანდეს — <b>როგორ</b> შეიცვალოს DOM, React გადაწყვეტს.</p>`,
    html: () => `
      ${head('საიდან გაჩნდა React', 'Facebook-ის ინტერფეისი იმდენად გართულდა, რომ DOM-ის ხელით განახლება ვეღარ ასწრებდა.')}
      <ol class="timeline">
        <li><span class="tl-year mono">2011</span><p>Jordan Walke-ის პროტოტიპი (FaxJS) — Facebook News Feed</p></li>
        <li><span class="tl-year mono">2012</span><p>Instagram.com — React-ით</p></li>
        <li class="is-key"><span class="tl-year mono">2013</span><p>მაისი: <b>open source</b>, JSConf US</p></li>
        <li><span class="tl-year mono">2015</span><p>React Native — იგივე იდეა მობილურზე</p></li>
        <li><span class="tl-year mono">2019</span><p>Hooks (React 16.8): <span class="mono">useState</span>, <span class="mono">useEffect</span></p></li>
        <li><span class="tl-year mono">2024</span><p>React 19</p></li>
      </ol>
      <div class="problem">
        <span class="kicker mono">პრობლემა</span>
        <p>ერთი და იგივე მონაცემი — მაგალითად, წაუკითხავი შეტყობინებების რაოდენობა — ეკრანის რამდენიმე ადგილას ჩანდა და ხელით განახლებისას ხშირად <b>არ ემთხვეოდა</b> ერთმანეთს.</p>
        <span class="kicker mono">იდეა</span>
        <p>აღწერე, <b>რა</b> უნდა ჩანდეს მოცემული მონაცემისთვის. <b>როგორ</b> შეიცვალოს DOM — React გადაწყვეტს.</p>
      </div>`,
  },

  {
    id: 'components',
    stage: STAGE,
    title: 'იდეა 1 — კომპონენტები',
    time: '15:30 – 17:00 (1.5 წთ)',
    notes: `
      <p>კომპონენტი = <b>ფუნქცია, რომელიც UI-ს ნაწილს აბრუნებს</b>. სახელი დიდი ასოთი იწყება: <code>ProductCard</code>.</p>
      <p>ხე ჩვენი React პროექტიდანაა: <code>Layout</code> შეიცავს <code>Header</code>-ს ერთხელ; ყველა გვერდი <code>&lt;Outlet /&gt;</code>-ის ადგილას ჩნდება.</p>
      <p>Menu ერთ <code>ProductCard</code>-ს 12-ჯერ იყენებს, სხვადასხვა მონაცემით — props-ით (ამას Trial 1-ში ვნახავთ).</p>`,
    html: () => `
      ${head('იდეა 1 — კომპონენტები', 'UI = დამოუკიდებელი ნაწილების ხე. თითოეული ნაწილი ფუნქციაა, რომელიც UI-ს აბრუნებს.')}
      <div class="comp">
        <ul class="tree mono">
          <li><span class="node">&lt;App /&gt;</span><span class="tree-file">App.jsx</span>
            <ul>
              <li><span class="node">&lt;Layout /&gt;</span><span class="tree-file">components/Layout.jsx</span>
                <ul>
                  <li><span class="node node--key">&lt;Header /&gt;</span><span class="tree-note">ერთხელ — ყველა გვერდისთვის</span></li>
                  <li><span class="node">&lt;Outlet /&gt;</span><span class="tree-note">აქ ჩნდება მიმდინარე route</span>
                    <ul>
                      <li><span class="node">&lt;Menu /&gt;</span><span class="tree-file">pages/Menu.jsx</span>
                        <ul><li><span class="node node--key">&lt;ProductCard /&gt;</span><span class="tree-note">× 12, სხვადასხვა მონაცემით</span></li></ul>
                      </li>
                    </ul>
                  </li>
                  <li><span class="node">&lt;footer&gt;</span></li>
                </ul>
              </li>
            </ul>
          </li>
        </ul>
        ${snippet('s11-card', { file: 'src/components/ProductCard.jsx', tag: 'შემოკლებული', hl: '1, 8' })}
      </div>
      <p class="idea-foot"><span class="kicker mono">წესი</span><span><b>კომპონენტი</b> = JavaScript ფუნქცია, რომელიც JSX-ს აბრუნებს. სახელი იწყება დიდი ასოთი: <span class="mono">Header</span>, <span class="mono">ProductCard</span>.</span></p>`,
  },

  {
    id: 'single-source',
    stage: STAGE,
    title: 'იდეა 2 — ერთი წყარო (single source of truth)',
    time: '17:00 – 18:30 (1.5 წთ)',
    notes: `
      <p>ყოველ მონაცემს <b>ერთი სახლი</b> აქვს. ვინც მას აჩვენებს, იქიდან კითხულობს — ასლები არ არსებობს, ამიტომ ვერ "აირევა".</p>
      <p>მაგალითი ჩვენი პროექტიდან: კალათის რაოდენობა ცხოვრობს store-ში; Header-ის badge მას <code>useStore()</code>-ით კითხულობს. შეიცვალა store → ყველა მომხმარებელი განახლდა.</p>
      <p>იგივე header-ზე: <code>&lt;Header /&gt;</code> ერთხელაა აღწერილი და ყველა გვერდი მას იყენებს — 10 ასლის ნაცვლად.</p>`,
    html: () => `
      ${head('იდეა 2 — ერთი წყარო', 'ყოველ მონაცემს ერთი "სახლი" აქვს. ვინც მას აჩვენებს, იქიდან კითხულობს — ასლები არ არსებობს, ამიტომ ვერ აირევა.')}
      <div class="ssot">
        <div class="ssot-diagram">
          <div class="ssot-source"><span class="kicker mono">store</span><b class="mono">cartCount = 4</b></div>
          <svg class="ssot-lines" viewBox="0 0 300 120" preserveAspectRatio="none" aria-hidden="true">
            <path d="M150 0 V40 M50 40 H250 M50 40 V120 M150 40 V120 M250 40 V120" fill="none" stroke="currentColor" stroke-width="1" vector-effect="non-scaling-stroke"/>
          </svg>
          <div class="ssot-readers">
            <div><span class="mono">&lt;Header /&gt;</span><small>badge: Cart 4</small></div>
            <div><span class="mono">&lt;Cart /&gt;</span><small>Items: 4</small></div>
            <div><span class="mono">Checkout</span><small>4 ერთეული</small></div>
          </div>
        </div>
        ${snippet('s12-store', { file: 'src/components/Layout.jsx', tag: 'შემოკლებული', hl: '2, 5' })}
      </div>
      <p class="idea-foot"><span class="kicker mono">vs vanilla</span><span>vanilla-ში ცვლილებაზე ხელით ვიძახებთ <span class="mono">renderHeader()</span>-ს (<span class="mono">store.subscribe</span>). React-ში <span class="mono">useStore()</span> — და Header თვითონ განახლდება.</span></p>`,
  },

  {
    id: 'declarative',
    stage: STAGE,
    title: 'იდეა 3 — დეკლარაციული UI',
    time: '18:30 – 20:00 (1.5 წთ)',
    notes: `
      <p><b>UI = f(state)</b> — ინტერფეისი მდგომარეობის ფუნქციაა.</p>
      <p>დააჭირეთ <b>+</b> / <b>−</b>: მარცხნივ "ინათება" ის ხაზები, რომლებიც <b>თქვენ</b> უნდა დაწეროთ და გაუშვათ ყოველ ცვლილებაზე (იმპერატიული). მრიცხველი DOM ოპერაციებს ითვლის.</p>
      <p>მარჯვნივ კოდი <b>არასდროს</b> იცვლება — თქვენ მხოლოდ აღწერთ, რა უნდა ჩანდეს. DOM-ს React ცვლის.</p>
      <p>ჩავიდეთ 0-მდე: მარცხნივ სხვა branch მუშაობს (<code>hidden = true</code>) — ესეც თქვენ უნდა გაითვალისწინოთ. მარჯვნივ — იგივე ერთი ხაზი.</p>`,
    html: () => `
      ${head('იდეა 3 — დეკლარაციული UI', 'UI = f(state). აღწერე, რა უნდა ჩანდეს — და არა ის, როგორ შეიცვალოს DOM.')}
      <div class="decl">
        <div class="decl-state">
          <span class="kicker mono">state</span>
          <div class="decl-ctrl">
            <button type="button" class="btn" data-d="-1" aria-label="შემცირება">${icons.minus}</button>
            <span class="mono decl-val">cartCount = <b data-n>2</b></span>
            <button type="button" class="btn" data-d="1" aria-label="გაზრდა">${icons.plus}</button>
          </div>
        </div>
        <div class="decl-col">
          <p class="decl-label"><span class="mono">IMPERATIVE</span> იმპერატიული — vanilla</p>
          <div class="mini-header"><span>Trattoria</span><span class="mini-cart">Cart <i data-badge-a>2</i></span></div>
          <div data-imp>${snippet('s13-imperative', { file: 'ყოველ ცვლილებაზე — თქვენ', numbers: true })}</div>
          <p class="decl-count">თქვენი DOM ოპერაციები: <b class="mono" data-ops>0</b></p>
        </div>
        <div class="decl-col">
          <p class="decl-label"><span class="mono">DECLARATIVE</span> დეკლარაციული — React</p>
          <div class="mini-header"><span>Trattoria</span><span class="mini-cart">Cart <i data-badge-b>2</i></span></div>
          <div data-dec>${snippet('s13-declarative', { file: 'ერთხელ აღწერილი', numbers: true })}</div>
          <p class="decl-count">თქვენი DOM ოპერაციები: <b class="mono">0</b> <span class="muted">— DOM-ს React ცვლის</span></p>
        </div>
      </div>
      <p class="idea-foot"><span class="kicker mono">როგორ</span><span>React ინახავს UI-ს წინა "სურათს" (virtual DOM), ადარებს ახალს და რეალურ DOM-ში <b>მხოლოდ განსხვავებას</b> ცვლის.</span></p>`,
    mount(el) {
      let n = 2;
      let ops = 0;
      const $n = el.querySelector('[data-n]');
      const $ops = el.querySelector('[data-ops]');
      const $a = el.querySelector('[data-badge-a]');
      const $b = el.querySelector('[data-badge-b]');
      const imp = el.querySelector('[data-imp]');
      const dec = el.querySelector('[data-dec]');
      const paint = () => {
        $n.textContent = n;
        [$a, $b].forEach((b) => { b.textContent = n; b.hidden = n === 0; });
      };
      const onClick = (e) => {
        const b = e.target.closest('[data-d]');
        if (!b) return;
        n = Math.max(0, Math.min(9, n + Number(b.dataset.d)));
        paint();
        if (n > 0) { flashLines(imp, '1-4'); ops += 3; } else { flashLines(imp, '1, 5-6'); ops += 2; }
        $ops.textContent = ops;
        flashLines(dec, '1-3', 'is-flash-soft');
      };
      el.addEventListener('click', onClick);
      paint();
      return { unmount: () => el.removeEventListener('click', onClick) };
    },
  },

  {
    id: 'routing',
    stage: STAGE,
    title: 'იდეა 4 — Routing (SPA)',
    time: '20:00 – 21:30 (1.5 წთ)',
    notes: `
      <p><b>SPA</b> — single-page application: ერთი HTML; URL იცვლება History API-ით, სერვერისგან ახალი გვერდი არ მოდის.</p>
      <p>React Router: URL → კომპონენტი. <code>&lt;Layout /&gt;</code> (header + footer) რჩება, <code>&lt;Outlet /&gt;</code>-ის ადგილას იცვლება მხოლოდ გვერდი.</p>
      <p>"ახლა ამას ჩვენი თვალით ვნახავთ" → შემდეგი სლაიდი (3D).</p>`,
    html: () => `
      ${head('იდეა 4 — Routing (SPA)', 'URL → კომპონენტი. ბრაუზერი სერვერისგან ახალ HTML-ს აღარ ითხოვს — იცვლება მხოლოდ გვერდის შიგთავსი.')}
      <div class="routing">
        ${snippet('s14-routes', { file: 'src/App.jsx', tag: 'შემოკლებული', hl: '2, 4' })}
        <div class="flows">
          <div class="flow">
            <span class="kicker mono">კლასიკური HTML</span>
            <ol class="mono">
              <li>click: Menu</li><li>GET /menu.html</li><li>სერვერი → ახალი HTML</li><li class="is-bad">header, main, footer — თავიდან</li>
            </ol>
          </div>
          <div class="flow flow--spa">
            <span class="kicker mono">SPA · React Router</span>
            <ol class="mono">
              <li>click: Menu</li><li>history.pushState('/menu')</li><li>Router → &lt;Menu /&gt;</li><li class="is-good">header რჩება, იცვლება მხოლოდ main</li>
            </ol>
          </div>
          <p class="flows-next mono">${icons.arrow}<span>შემდეგ სლაიდზე — 3D-ში</span></p>
        </div>
      </div>`,
  },

  {
    ...monitorsSlide,
    time: '21:30 – 25:30 (4 წთ)',
    steps: 'A: დააჭირეთ ლინკს ეკრანზე · → ან "შემდეგი: React" ამატებს მეორე მონიტორს · "გვერდითი ხედი" + "header-ში ლინკის დამატება" ორივეზე · შემდეგი → ახალ სლაიდზე.',
  },

  {
    id: 'landscape',
    stage: STAGE,
    title: 'Framework-ების რუკა',
    time: '25:30 – 27:00 (1.5 წთ)',
    notes: `
      <p>React ერთადერთი არ არის. განსხვავება <b>ტიპშია</b>: <b>ბიბლიოთეკა</b> (შენი კოდი იძახებს მას — React), <b>framework</b> (ის განსაზღვრავს სტრუქტურას და იძახებს შენს კოდს — Angular, Vue, Svelte), <b>meta-framework</b> (framework ბიბლიოთეკის თავზე: routing, server rendering, build — Next.js).</p>
      <p>პოპულარობა: Stack Overflow Developer Survey 2025 — "Web frameworks and technologies", ყველა რესპონდენტი (23 678 პასუხი). ციფრები = ვინც ბოლო წელს <b>იყენებდა</b>.</p>
      <p>ნეიტრალურად: არცერთი არ არის "საუკეთესო". React-ს ვსწავლობთ, რადგან ყველაზე გავრცელებულია და მისი იდეები (კომპონენტები, state, props) ყველგან გამოგადგებათ.</p>`,
    html: () => `
      ${head('Framework-ების რუკა', 'იდეები მსგავსია — კომპონენტები და state. განსხვავება ტიპში, ზომასა და იმაშია, რამდენს წყვეტს თავად.')}
      <table class="fw">
        <thead>
          <tr><th></th><th>ტიპი</th><th>შემქმნელი</th><th>წელი</th><th>სწავლის სირთულე</th><th>ტიპური გამოყენება</th><th>პოპულარობა*</th></tr>
        </thead>
        <tbody>
          <tr class="is-key"><th>React</th><td>ბიბლიოთეკა (UI library)</td><td>Meta (Facebook)</td><td class="mono">2013</td><td>საშუალო</td><td>SPA, ინტერფეისები; React Native — მობილური</td><td class="mono"><span class="bar" style="--v:44.7"></span>44.7%</td></tr>
          <tr><th>Angular</th><td>სრული framework</td><td>Google</td><td class="mono">2016<small> (AngularJS — 2010)</small></td><td>მაღალი — TypeScript, DI, RxJS</td><td>დიდი კორპორატიული აპლიკაციები</td><td class="mono"><span class="bar" style="--v:18.2"></span>18.2%</td></tr>
          <tr><th>Vue</th><td>progressive framework</td><td>Evan You (community)</td><td class="mono">2014</td><td>დაბალი–საშუალო</td><td>SPA; არსებულ საიტში ეტაპობრივი დანერგვა</td><td class="mono"><span class="bar" style="--v:17.6"></span>17.6%</td></tr>
          <tr><th>Svelte</th><td>framework-კომპილატორი</td><td>Rich Harris</td><td class="mono">2016</td><td>დაბალი</td><td>მსუბუქი, სწრაფი აპლიკაციები</td><td class="mono"><span class="bar" style="--v:7.2"></span>7.2%</td></tr>
          <tr><th>Next.js</th><td>meta-framework (React-ზე)</td><td>Vercel</td><td class="mono">2016</td><td>საშუალო–მაღალი</td><td>SSR / SSG, full-stack React</td><td class="mono"><span class="bar" style="--v:20.8"></span>20.8%</td></tr>
        </tbody>
      </table>
      <p class="fw-src mono">* Stack Overflow Developer Survey 2025 · Web frameworks and technologies · ყველა რესპონდენტი · survey.stackoverflow.co/2025</p>`,
  },
];
