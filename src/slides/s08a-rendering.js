// Rendering strategies: a calm comparison, then the animated server ↔ browser explainer.
import { head } from './helpers.js';
import { icons } from '../components/icons.js';
import { RenderScene, MODES } from '../scene/RenderScene.js';

const STAGE = '08 / RETURN';

// Scores are 1–5 where MORE is always better (so "cheap hosting", not "server cost").
export const STRATEGIES = {
  csr: {
    acr: 'CSR', full: 'Client-Side Rendering', where: 'HTML იქმნება ბრაუზერში',
    when: 'ყოველ ვიზიტზე — მომხმარებლის მოწყობილობაზე',
    meters: { speed: 2, seo: 2, fresh: 5, cheap: 5 },
    example: 'admin პანელი, dashboard · ჩვენი restaurant-react', tool: 'Vite + React',
    steps: [
      'ბრაუზერი ითხოვს გვერდს — <span class="mono">GET /product/34</span>',
      'სერვერი აბრუნებს თითქმის ცარიელ HTML-ს: <span class="mono">&lt;div id="root"&gt;</span>',
      'SEO ბოტი ცარიელ გვერდს ხედავს → დაბალი რეიტინგი',
      'მოდის JS bundle (~320 KB)',
      'ბრაუზერი ასრულებს JS-ს და აწყობს UI-ს',
      '<span class="mono">fetch</span> → API → მონაცემი',
      'გვერდი მზადაა — მაგრამ ყველაზე გვიან',
    ],
    pros: ['სტატიკური, იაფი ჰოსტინგი (GitHub Pages)', 'ჩატვირთვის შემდეგ — ძალიან ინტერაქტიული'],
    cons: ['ცარიელი ეკრანი, სანამ JS ჩაიტვირთება', 'სუსტი SEO და social preview'],
  },
  ssr: {
    acr: 'SSR', full: 'Server-Side Rendering', where: 'HTML იქმნება სერვერზე',
    when: 'ყოველ მოთხოვნაზე — თავიდან',
    meters: { speed: 4, seo: 5, fresh: 5, cheap: 2 },
    example: 'ახალი ამბები, პერსონალური გვერდები, მაღაზია', tool: 'Next.js · React Router',
    steps: [
      'მოთხოვნა — <span class="mono">GET /product/34</span>',
      'სერვერი იღებს მონაცემს და ასრულებს React-ს',
      'სერვერი აბრუნებს სრულ HTML-ს',
      'SEO ბოტი სრულ კონტენტს ხედავს → მაღალი რეიტინგი',
      'ეკრანზე მაშინვე ჩანს; JS "აცოცხლებს" — <b>hydration</b>',
      'ყოველ მოთხოვნაზე სერვერი თავიდან მუშაობს',
    ],
    pros: ['სწრაფი პირველი ეკრანი', 'ძლიერი SEO', 'ყოველთვის ახალი მონაცემი'],
    cons: ['სერვერის ხარჯი ყოველ მოთხოვნაზე', 'საჭიროა Node სერვერი'],
  },
  ssg: {
    acr: 'SSG', full: 'Static Site Generation', where: 'HTML იქმნება build-ის დროს',
    when: 'ერთხელ — deploy-მდე',
    meters: { speed: 5, seo: 5, fresh: 2, cheap: 5 },
    example: 'დოკუმენტაცია, ბლოგი, landing გვერდი', tool: 'Next.js · Astro',
    steps: [
      '<span class="mono">npm run build</span> — ყველა გვერდი წინასწარ იქმნება',
      'მზა HTML ფაილები ინახება <span class="mono">dist/</span>-ში',
      'მოთხოვნა — მზა ფაილი მყისიერად იგზავნება',
      'SEO ბოტი სრულ კონტენტს ხედავს → მაღალი რეიტინგი',
      'DB-ში ფასი შეიცვალა — გვერდი ძველია, სანამ თავიდან არ ააგებ',
    ],
    pros: ['ყველაზე სწრაფი', 'იაფი, სტატიკური ჰოსტინგი', 'ძლიერი SEO'],
    cons: ['მონაცემი ძველდება', 'ბევრ გვერდზე build ნელია'],
  },
  isr: {
    acr: 'ISR', full: 'Incremental Static Regeneration', where: 'HTML — build-ზე + პერიოდულად',
    when: 'build-ზე და ყოველ N წამში, საჭიროებისამებრ',
    meters: { speed: 5, seo: 5, fresh: 4, cheap: 4 },
    example: 'პროდუქტების კატალოგი, მენიუ, სიახლეები', tool: 'Next.js',
    steps: [
      'build — გვერდები წინასწარ, <span class="mono">revalidate: 60</span>',
      'მოთხოვნა — cache-დან მყისიერად; SEO მაღალი',
      '60 წამი გავიდა, DB-ში ფასი შეიცვალა',
      'შემდეგი ვიზიტორი ჯერ ძველს იღებს — სერვერი ფონურად აახლებს მხოლოდ ამ გვერდს',
      'მომდევნო ვიზიტორი უკვე ახალ გვერდს ხედავს',
    ],
    pros: ['SSG-ის სიჩქარე + პერიოდული განახლება', 'ახლდება მხოლოდ საჭირო გვერდი'],
    cons: ['ერთი ვიზიტორი ჯერ ძველ ვერსიას ხედავს', 'სჭირდება framework (Next.js) და შესაბამისი ჰოსტინგი'],
  },
};

const METERS = [['speed', 'პირველი ეკრანი'], ['seo', 'SEO'], ['fresh', 'მონაცემის სიახლე'], ['cheap', 'იაფი ჰოსტინგი']];
const squares = (n) => Array.from({ length: 5 }, (_, i) => `<i class="${i < n ? 'on' : ''}"></i>`).join('');
const PIPE = {
  csr: [['server', 'სერვერი', 'ცარიელი HTML'], ['monitor', 'ბრაუზერი', 'აწყობს']],
  ssr: [['server', 'სერვერი', 'აწყობს'], ['monitor', 'ბრაუზერი', 'აჩვენებს']],
  ssg: [['build', 'build', 'აწყობს ერთხელ'], ['monitor', 'ბრაუზერი', 'აჩვენებს']],
  isr: [['build', 'build', '+ ყოველ 60 წამში'], ['monitor', 'ბრაუზერი', 'აჩვენებს']],
};

function fallbackPanel() {
  return `<div class="rs-fallback"><p>3D ანიმაცია ამ მოწყობილობაზე ხელმისაწვდომი არ არის. ნაბიჯები მარჯვნივ ჩანს — გამოიყენეთ ღილაკები.</p></div>`;
}

export default [
  {
    id: 'render-compare',
    stage: STAGE,
    title: 'სად იქმნება HTML? — CSR · SSR · SSG · ISR',
    time: '52:00 – 54:00 (2 წთ)',
    notes: `
      <p>React-ით აწყობილი საიტი მომხმარებლამდე ოთხნაირად შეიძლება მივიდეს. განსხვავება ერთ კითხვაშია: <b>სად და როდის იწყობა HTML?</b></p>
      <p><b>CSR</b> — ბრაუზერში (ჩვენი restaurant-react ზუსტად ასეა: GitHub Pages აძლევს ცარიელ index.html-ს და JS-ს). <b>SSR</b> — სერვერზე, ყოველ მოთხოვნაზე. <b>SSG</b> — ერთხელ, build-ის დროს. <b>ISR</b> — build-ზე და შემდეგ პერიოდულად, გვერდ-გვერდ.</p>
      <p>ციფრები 1–5, სადაც მეტი ყოველთვის უკეთესია. SEO-ზე სიზუსტისთვის: Google-ს JS-ის შესრულება შეუძლია, მაგრამ მოგვიანებით და შეზღუდულად; ბევრი სხვა ბოტი და social preview (Facebook, Slack) — არა. ამიტომ CSR = SEO-ს რისკი.</p>
      <p>SSR/SSG/ISR-ისთვის React-ს framework სჭირდება — ყველაზე ცნობილია <b>Next.js</b>. ეს შემდეგი ეტაპია.</p>`,
    html: () => `
      ${head('სად იქმნება HTML?', 'ერთი React აპლიკაცია მომხმარებლამდე ოთხნაირად მიდის. განსხვავება — სად და როდის იწყობა HTML.')}
      <div class="rc">
        ${MODES.map((k) => {
          const s = STRATEGIES[k];
          return `
          <article class="rc-col ${k === 'csr' ? 'is-ours' : ''}">
            ${k === 'csr' ? '<span class="rc-badge mono">ჩვენი პროექტი</span>' : ''}
            <h3 class="rc-acr">${s.acr}</h3>
            <p class="rc-full mono">${s.full}</p>
            <p class="rc-where">${s.where}</p>
            <div class="rc-pipe">
              ${PIPE[k].map(([ico, name, what], i) => `${i ? `<span class="rc-arrow">${icons.arrow}</span>` : ''}<span class="rc-node ${i === (k === 'csr' ? 1 : 0) ? 'is-maker' : ''}">${icons[ico]}<b>${name}</b><small>${what}</small></span>`).join('')}
            </div>
            <dl class="rc-meters">${METERS.map(([m, label]) => `<div><dt>${label}</dt><dd class="sq">${squares(s.meters[m])}</dd></div>`).join('')}</dl>
            <p class="rc-when"><span class="kicker mono">როდის</span>${s.when}</p>
            <p class="rc-ex"><span class="kicker mono">მაგალითი</span>${s.example}</p>
            <p class="rc-tool mono">${s.tool}</p>
          </article>`;
        }).join('')}
      </div>`,
  },

  {
    id: 'render-animated',
    stage: STAGE,
    title: 'რენდერინგი — ანიმაციით',
    time: '54:00 – 58:00 (4 წთ)',
    steps: 'ავტომატურად იწყება CSR-ით. → ან "შემდეგი" — SSR, SSG, ISR. ჩანართებზე დაჭერით — ნებისმიერი რეჟიმი; "თავიდან" — გამეორება. ISR-ის შემდეგ → გადადის მომდევნო სლაიდზე.',
    notes: `
      <p>მარცხნივ <b>სერვერი</b> (ზემოთ build-ის საქაღალდე <code>dist/</code>, გვერდით მონაცემთა ბაზა), მარჯვნივ <b>ბრაუზერი</b>. გამადიდებელი შუშა — <b>SEO ბოტი</b>, რომელიც პირველ HTML-ს აფასებს.</p>
      <p><b>CSR:</b> ცარიელი HTML → ბოტი ვერაფერს ხედავს (1/5). მერე "არეული" JS bundle მიფრინავს და ბრაუზერი მისგან აწყობს გვერდს, ბოლოს fetch-ით მონაცემი მოდის. ყველაზე გვიან მზადდება.</p>
      <p><b>SSR:</b> სერვერი თვითონ ასრულებს React-ს (ბორბალი ტრიალებს, CPU იზრდება) და აგზავნის სრულ HTML-ს → ბოტი 5/5. ეკრანი მაშინვე ჩანს, hydration-ის შემდეგ ხდება ინტერაქტიული. მეორე მოთხოვნაზე სერვერი ისევ მუშაობს.</p>
      <p><b>SSG:</b> <code>npm run build</code> ყველა გვერდს წინასწარ ქმნის → მოთხოვნაზე მზა ფაილი მყისიერად. მინუსი: DB-ში ფასი შეიცვალა, გვერდზე ძველი რჩება.</p>
      <p><b>ISR:</b> იგივე, ოღონდ revalidate ტაიმერით: 60 წამის შემდეგ პირველი ვიზიტორი ჯერ ძველს იღებს, სერვერი ფონურად მხოლოდ ამ ერთ გვერდს აახლებს, მომდევნო უკვე ახალს ხედავს.</p>`,
    html: () => `
      <div class="rs">
        <div class="rs-canvas" data-canvas></div>
        <header class="s-head rs-head">
          <h2>როგორ მიდის გვერდი მომხმარებლამდე</h2>
          <p>მარცხნივ სერვერი, მარჯვნივ ბრაუზერი. სად იქმნება HTML — და რას ხედავს SEO ბოტი?</p>
        </header>
        <aside class="rs-panel">
          <div class="rs-tabs" role="tablist">${MODES.map((k, i) => `<button type="button" role="tab" data-mode="${i}" class="mono">${STRATEGIES[k].acr}</button>`).join('')}</div>
          <div class="rs-mode">
            <div class="rs-title"><span class="rs-acr" data-acr></span><span class="rs-full mono" data-full></span></div>
            <p class="rs-where" data-where></p>
          </div>
          <ol class="rs-steps" data-steps></ol>
          <dl class="rs-meters" data-meters></dl>
          <div class="rs-pc">
            <ul class="rs-pros" data-pros></ul>
            <ul class="rs-cons" data-cons></ul>
          </div>
          <div class="rs-actions">
            <button type="button" class="btn" data-replay>${icons.reset}<span>თავიდან</span></button>
            <button type="button" class="btn btn-solid" data-next><span data-next-label>შემდეგი</span>${icons.arrow}</button>
          </div>
        </aside>
      </div>`,
    async mount(el, deck) {
      const $ = (s) => el.querySelector(s);
      const tabs = [...el.querySelectorAll('[data-mode]')];
      let current = 0;
      let stepIndex = -1;

      const paintMode = (i) => {
        current = i;
        stepIndex = -1;
        const s = STRATEGIES[MODES[i]];
        tabs.forEach((b, j) => b.setAttribute('aria-selected', String(j === i)));
        $('[data-acr]').textContent = s.acr;
        $('[data-full]').textContent = s.full;
        $('[data-where]').textContent = s.where;
        $('[data-steps]').innerHTML = s.steps.map((t, j) => `<li data-i="${j}"><span class="mono">${String(j + 1).padStart(2, '0')}</span><span>${t}</span></li>`).join('');
        $('[data-meters]').innerHTML = METERS.map(([m, label]) => `<div><dt>${label}</dt><dd class="sq">${squares(s.meters[m])}</dd></div>`).join('');
        $('[data-pros]').innerHTML = s.pros.map((p) => `<li>${icons.check}<span>${p}</span></li>`).join('');
        $('[data-cons]').innerHTML = s.cons.map((p) => `<li>${icons.cross}<span>${p}</span></li>`).join('');
        const next = MODES[i + 1];
        $('[data-next-label]').textContent = next ? `შემდეგი: ${STRATEGIES[next].acr}` : 'შემდეგი სლაიდი';
        el.querySelector('.rs-panel').classList.remove('is-done');
      };
      const paintStep = (i) => {
        stepIndex = i;
        el.querySelectorAll('[data-steps] li').forEach((li, j) => {
          li.classList.toggle('is-now', j === i);
          li.classList.toggle('is-done', j < i);
        });
      };

      paintMode(0);
      if (!RenderScene.supported()) {
        $('[data-canvas]').innerHTML = fallbackPanel();
        const onClick = (e) => {
          const tab = e.target.closest('[data-mode]');
          if (tab) paintMode(Number(tab.dataset.mode));
          if (e.target.closest('[data-next]') && current < 3) paintMode(current + 1);
        };
        el.addEventListener('click', onClick);
        return { next: () => { if (current >= 3) return false; paintMode(current + 1); return true; }, unmount: () => el.removeEventListener('click', onClick) };
      }

      const scene = new RenderScene($('[data-canvas]'), {
        onMode: paintMode,
        onStep: (m, i) => { if (m === current) paintStep(i); },
        onDone: (m) => { if (m === current) { paintStep(STRATEGIES[MODES[m]].steps.length); el.querySelector('.rs-panel').classList.add('is-done'); } },
      });
      await scene.mount();

      const onClick = (e) => {
        const tab = e.target.closest('[data-mode]');
        if (tab) scene.play(Number(tab.dataset.mode));
        if (e.target.closest('[data-replay]')) scene.replay();
        if (e.target.closest('[data-next]')) { if (!scene.next()) deck?.next(); }
      };
      el.addEventListener('click', onClick);
      return {
        next: () => scene.next(),
        unmount: () => { el.removeEventListener('click', onClick); scene.unmount(); },
        scene,
        get step() { return stepIndex; },
      };
    },
  },
];
