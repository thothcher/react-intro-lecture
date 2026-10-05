// Syntax-highlighted code blocks rendered line by line (so lines can be highlighted,
// marked as added / buggy, or flashed during a demo). Prism tokenizes; we render.
import Prism from 'prismjs';
import 'prismjs/components/prism-jsx.js';
import 'prismjs/components/prism-bash.js';
import 'prismjs/components/prism-typescript.js';
import 'prismjs/components/prism-tsx.js';

const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/** "3, 5-7" | [3, '5-7'] -> Set {3,5,6,7} */
function lineSet(spec) {
  const set = new Set();
  if (spec == null) return set;
  const parts = Array.isArray(spec) ? spec : String(spec).split(',');
  parts.forEach((p) => {
    const [a, b] = String(p).trim().split('-').map(Number);
    if (!a) return;
    for (let i = a; i <= (b || a); i += 1) set.add(i);
  });
  return set;
}

function flatten(tokens, types = [], out = []) {
  for (const t of tokens) {
    if (typeof t === 'string') { out.push({ text: t, types }); continue; }
    const next = [...types, t.type, ...(t.alias ? [].concat(t.alias) : [])];
    if (typeof t.content === 'string') out.push({ text: t.content, types: next });
    else flatten(Array.isArray(t.content) ? t.content : [t.content], next, out);
  }
  return out;
}

/** Highlight `code` and return an array of per-line HTML strings. */
export function highlightLines(code, lang = 'jsx') {
  const grammar = Prism.languages[lang] || Prism.languages.javascript;
  const segments = flatten(Prism.tokenize(code, grammar));
  const lines = [[]];
  segments.forEach(({ text, types }) => {
    text.split('\n').forEach((part, i) => {
      if (i > 0) lines.push([]);
      if (part) lines[lines.length - 1].push(types.length ? `<span class="tok ${types.map((t) => `t-${t}`).join(' ')}">${esc(part)}</span>` : esc(part));
    });
  });
  return lines.map((l) => l.join(''));
}

/**
 * @param {object} o
 * @param {string} o.code
 * @param {string} [o.lang]   'jsx' | 'javascript' | 'markup' | 'css' | 'bash'
 * @param {string} [o.file]   file name shown in the tab
 * @param {string} [o.tag]    small note in the tab (e.g. "abridged")
 * @param {string|Array} [o.hl]   highlighted lines (changed / important)
 * @param {string|Array} [o.add]  added lines (+)
 * @param {string|Array} [o.bad]  buggy lines
 * @param {string|Array} [o.hide] lines hidden until revealed (for step animations)
 * @param {boolean} [o.numbers=true]
 */
export function codeBlock({ code, lang = 'jsx', file = '', tag = '', hl, add, bad, hide, numbers = true, cls = '' }) {
  const H = lineSet(hl);
  const A = lineSet(add);
  const B = lineSet(bad);
  const X = lineSet(hide);
  const rows = highlightLines(code.replace(/\n$/, ''), lang).map((html, i) => {
    const n = i + 1;
    const c = ['ln', H.has(n) && 'is-hl', A.has(n) && 'is-add', B.has(n) && 'is-bad', X.has(n) && 'is-hidden'].filter(Boolean).join(' ');
    return `<span class="${c}" data-line="${n}">${numbers ? `<span class="ln-no">${n}</span>` : ''}<span class="ln-code">${html || '\u200b'}</span></span>`;
  }).join('');
  return `
    <figure class="code ${cls}">
      ${file ? `<figcaption class="code-tab"><span class="code-file">${esc(file)}</span>${tag ? `<span class="code-tag">${esc(tag)}</span>` : ''}</figcaption>` : ''}
      <pre class="code-pre"><code>${rows}</code></pre>
    </figure>`;
}

/** Briefly flash some lines of a rendered code block (demo feedback). */
export function flashLines(root, lines, cls = 'is-flash') {
  const set = lineSet(lines);
  root.querySelectorAll('.ln').forEach((el) => {
    if (!set.has(Number(el.dataset.line))) return;
    el.classList.remove(cls);
    void el.offsetWidth; // restart the animation
    el.classList.add(cls);
  });
}

/** Toggle classes on lines of a rendered block (e.g. reveal hidden lines, mark bugs). */
export function setLines(root, lines, cls, on = true) {
  const set = lineSet(lines);
  root.querySelectorAll('.ln').forEach((el) => {
    if (set.has(Number(el.dataset.line))) el.classList.toggle(cls, on);
  });
}
