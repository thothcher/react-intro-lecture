// Trial 4 — the same header rendered two ways, measured with MutationObserver:
//   vanilla: $header.innerHTML = template(count)   (how our renderHeader() works)
//   React:   <Header count={count} />              (reconciliation keeps every node, patches one text)
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { PATH, Svg, svgString, escapeHtml } from './shared.jsx';

export function vanillaHeaderHTML(count) {
  return `
    <div class="mh-inner">
      <a class="mh-brand" href="#">${svgString(PATH.utensils)} Trattoria</a>
      <button class="mh-toggle" type="button"><span class="mh-bar"></span><span class="mh-bar"></span><span class="mh-bar"></span></button>
      <nav class="mh-nav">
        <a href="#">Menu</a>
        <a href="#" class="mh-cart">${svgString(PATH.bag)} Cart${count ? `<span class="mh-count">${count}</span>` : ''}</a>
        <a href="#">${svgString(PATH.user)} Nino</a>
        <button class="mh-btn" type="button">Sign out</button>
      </nav>
    </div>`;
}

function Header({ count }) {
  return (
    <div className="mh-inner">
      <a className="mh-brand" href="#"><Svg d={PATH.utensils} /> Trattoria</a>
      <button className="mh-toggle" type="button"><span className="mh-bar" /><span className="mh-bar" /><span className="mh-bar" /></button>
      <nav className="mh-nav">
        <a href="#">Menu</a>
        <a href="#" className="mh-cart"><Svg d={PATH.bag} /> Cart{count > 0 && <span className="mh-count">{count}</span>}</a>
        <a href="#"><Svg d={PATH.user} /> Nino</a>
        <button className="mh-btn" type="button">Sign out</button>
      </nav>
    </div>
  );
}

const countEls = (node) => (node.nodeType === 1 ? 1 + node.querySelectorAll('*').length : 0);

/** Read what the last update really did to the DOM. */
function measure(observer) {
  const added = new Set();
  const text = new Set();
  let addedCount = 0;
  let removedCount = 0;
  let textCount = 0;
  observer.takeRecords().forEach((r) => {
    if (r.type === 'childList') {
      r.addedNodes.forEach((n) => {
        if (n.nodeType === 1) { added.add(n); n.querySelectorAll('*').forEach((c) => added.add(c)); addedCount += countEls(n); }
      });
      r.removedNodes.forEach((n) => { removedCount += countEls(n); });
    } else if (r.type === 'characterData') {
      textCount += 1;
      if (r.target.parentElement) text.add(r.target.parentElement);
    }
  });
  return { added, text, addedCount, removedCount, textCount };
}

function treeHTML(rootEl, marks) {
  const rows = [];
  const walk = (el, depth) => {
    const cls = el.classList[0] ? `.${el.classList[0]}` : '';
    const own = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.nodeValue.trim()).filter(Boolean).join(' ');
    const state = marks.added.has(el) ? 'is-new' : marks.text.has(el) ? 'is-text' : '';
    rows.push(`<li class="${state}" style="--d:${depth}"><span class="tr-tag">${el.tagName.toLowerCase()}</span><span class="tr-cls">${cls}</span>${own ? `<span class="tr-txt">"${escapeHtml(own)}"</span>` : ''}</li>`);
    [...el.children].forEach((c) => walk(c, depth + 1));
  };
  [...rootEl.children].forEach((c) => walk(c, 0));
  return rows.join('');
}

export function mountReconcileDemo(el) {
  const vHost = el.querySelector('[data-v-header]');
  const rHost = el.querySelector('[data-r-header]');
  const vTree = el.querySelector('[data-v-tree]');
  const rTree = el.querySelector('[data-r-tree]');
  const $n = el.querySelector('[data-n]');
  const stat = { v: el.querySelector('[data-v-stat]'), r: el.querySelector('[data-r-stat]') };
  const same = { v: el.querySelector('[data-v-same]'), r: el.querySelector('[data-r-same]') };
  const total = { v: 0, r: 0 };
  let count = 2;

  const root = createRoot(rHost);
  vHost.innerHTML = vanillaHeaderHTML(count);
  flushSync(() => root.render(<Header count={count} />));
  const empty = { added: new Set(), text: new Set() };
  vTree.innerHTML = treeHTML(vHost, empty);
  rTree.innerHTML = treeHTML(rHost, empty);

  const opts = { childList: true, subtree: true, characterData: true };
  const vObs = new MutationObserver(() => {});
  const rObs = new MutationObserver(() => {});
  vObs.observe(vHost, opts);
  rObs.observe(rHost, opts);

  const describe = (m) => `შეიქმნა <b>${m.addedCount}</b> · წაიშალა <b>${m.removedCount}</b> · ტექსტი <b>${m.textCount}</b>`;

  function update(next) {
    count = Math.max(0, Math.min(99, next));
    $n.textContent = count;
    const vMenu = vHost.querySelector('.mh-nav a');
    const rMenu = rHost.querySelector('.mh-nav a');

    vHost.innerHTML = vanillaHeaderHTML(count);
    const mv = measure(vObs);
    flushSync(() => root.render(<Header count={count} />));
    const mr = measure(rObs);

    vTree.innerHTML = treeHTML(vHost, mv);
    rTree.innerHTML = treeHTML(rHost, mr);
    total.v += mv.addedCount + mv.removedCount + mv.textCount;
    total.r += mr.addedCount + mr.removedCount + mr.textCount;
    stat.v.innerHTML = `${describe(mv)} <span class="muted">· სულ ${total.v} ოპერაცია</span>`;
    stat.r.innerHTML = `${describe(mr)} <span class="muted">· სულ ${total.r} ოპერაცია</span>`;
    same.v.innerHTML = vMenu.isConnected ? 'Menu ლინკი — <b>იგივე</b> ელემენტი' : 'Menu ლინკი — <b>ახალი</b> ელემენტი (focus, hover, ანიმაცია იკარგება)';
    same.r.innerHTML = rMenu.isConnected ? 'Menu ლინკი — <b>იგივე</b> ელემენტი (არაფერი იკარგება)' : 'Menu ლინკი — <b>ახალი</b> ელემენტი';
    same.v.classList.toggle('is-bad', !vMenu.isConnected);
    same.r.classList.toggle('is-good', rMenu.isConnected);
  }

  const onClick = (e) => {
    const b = e.target.closest('[data-d]');
    if (b) update(count + Number(b.dataset.d));
    if (e.target.closest('.mh-inner a')) e.preventDefault();
  };
  el.addEventListener('click', onClick);

  return {
    unmount() {
      el.removeEventListener('click', onClick);
      vObs.disconnect();
      rObs.disconnect();
      root.unmount();
    },
  };
}
