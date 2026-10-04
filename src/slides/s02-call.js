import { IMG, bwImage } from './helpers.js';
import { icons } from '../components/icons.js';

const STAGE = '02 / CALL';

export default [
  {
    id: 'task',
    stage: STAGE,
    title: 'The task: a new page and a link in the header',
    min: 4,
    timeNote: '1 min slide + 3 min live demo',
    notes: `
      <p><b>The live demo starts here.</b> Switch to the editor and open <code>Desktop/restaurant</code> (vanilla).</p>
      <p>To add About to our vanilla project, <b>4 places</b> have to change:</p>
      <p>1) A new file <code>js/pages/about.js</code>:<br><code>App.pages.about = ({ root }) =&gt; { root.innerHTML = '&lt;div class="container"&gt;&lt;h1&gt;About&lt;/h1&gt;&lt;/div&gt;'; };</code></p>
      <p>2) <code>index.html</code> — <code>&lt;script src="js/pages/about.js"&gt;&lt;/script&gt;</code> (before app.js — the order matters!).</p>
      <p>3) <code>js/app.js</code> → routes: <code>{ path: /^\\/about$/, page: 'about', seo: { title: 'About' } }</code></p>
      <p>4) <code>js/app.js</code> → <code>renderHeader()</code>: <code>&lt;a href="about" data-nav="/about"&gt;About&lt;/a&gt;</code></p>
      <p>Ask the audience: "This still looks fine. But how would it look with <b>plain HTML pages</b>, the way we all started?" → next slide.</p>`,
    html: () => `
      <div class="call">
        ${bwImage(IMG.workspace, 'call-img')}
        <div class="call-body">
          <p class="kicker mono">THE TASK · LIVE DEMO</p>
          <h2 class="call-title">Add a new <span class="accent">About</span> page<br>and a link to it in the header navigation.</h2>
          <ul class="criteria">
            <li><span class="box"></span><span>the link appears on <b>every</b> page</span></li>
            <li><span class="box"></span><span>the active link is highlighted correctly</span></li>
            <li><span class="box"></span><span>no existing page breaks</span></li>
          </ul>
          <p class="call-go mono">${icons.arrow}<span>to the editor: Desktop/restaurant (vanilla)</span></p>
        </div>
      </div>`,
  },
];
