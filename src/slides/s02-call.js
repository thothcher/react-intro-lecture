import { IMG, bwImage } from './helpers.js';
import { icons } from '../components/icons.js';

const STAGE = '02 / CALL';

export default [
  {
    id: 'task',
    stage: STAGE,
    title: 'დავალება: ახალი გვერდი და ლინკი header-ში',
    time: '3:00 – 7:00 (1 წთ სლაიდი + 3 წთ live demo)',
    notes: `
      <p><b>აქ იწყება live demo.</b> გადადით რედაქტორში და გახსენით <code>Desktop/restaurant</code> (vanilla).</p>
      <p>ჩვენს vanilla პროექტში About-ის დასამატებლად <b>4 ადგილი</b> უნდა შეიცვალოს:</p>
      <p>1) ახალი ფაილი <code>js/pages/about.js</code>:<br><code>App.pages.about = ({ root }) =&gt; { root.innerHTML = '&lt;div class="container"&gt;&lt;h1&gt;About&lt;/h1&gt;&lt;/div&gt;'; };</code></p>
      <p>2) <code>index.html</code> — <code>&lt;script src="js/pages/about.js"&gt;&lt;/script&gt;</code> (app.js-მდე! რიგს აქვს მნიშვნელობა).</p>
      <p>3) <code>js/app.js</code> → routes: <code>{ path: /^\\/about$/, page: 'about', seo: { title: 'About' } }</code></p>
      <p>4) <code>js/app.js</code> → <code>renderHeader()</code>: <code>&lt;a href="about" data-nav="/about"&gt;About&lt;/a&gt;</code></p>
      <p>კითხვა აუდიტორიას: "ეს ჯერ კიდევ კარგად გამოიყურება. მაგრამ როგორ აეწყობოდა ეს <b>ჩვეულებრივი HTML გვერდებით</b>, როგორც ყველამ დავიწყეთ?" → შემდეგი სლაიდი.</p>`,
    html: () => `
      <div class="call">
        ${bwImage(IMG.workspace, 'call-img')}
        <div class="call-body">
          <p class="kicker mono">დავალება · LIVE DEMO</p>
          <h2 class="call-title">დაამატეთ ახალი გვერდი <span class="accent">About</span><br>და მისი ლინკი header-ის ნავიგაციაში.</h2>
          <ul class="criteria">
            <li><span class="box"></span><span>ლინკი ჩანს <b>ყველა</b> გვერდზე</span></li>
            <li><span class="box"></span><span>აქტიური ლინკი სწორად მოინიშნება</span></li>
            <li><span class="box"></span><span>არცერთი არსებული გვერდი არ გატყდა</span></li>
          </ul>
          <p class="call-go mono">${icons.arrow}<span>რედაქტორში: Desktop/restaurant (vanilla)</span></p>
        </div>
      </div>`,
  },
];
