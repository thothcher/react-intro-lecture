// Shared bits for slide modules: images (+ photographer credits), code snippets, layout helpers.
import credits from '../assets/img/credits.json';
import architecture from '../assets/img/architecture-curves.webp';
import workspace from '../assets/img/workspace-desk.webp';
import abstract from '../assets/img/abstract-lines.webp';
import facade from '../assets/img/facade-pattern.webp';
import towers from '../assets/img/towers.webp';
import bundle from './snippets/snippets.txt?raw';
import { codeBlock } from '../components/code.js';

export const IMG = {
  architecture: { src: architecture, ...credits['architecture-curves'] },
  workspace: { src: workspace, ...credits['workspace-desk'] },
  abstract: { src: abstract, ...credits['abstract-lines'] },
  facade: { src: facade, ...credits['facade-pattern'] },
  towers: { src: towers, ...credits.towers },
};

/** Real code excerpts, kept verbatim in snippets.txt ("=== name lang" sections). */
const SNIPPETS = {};
bundle.split(/^=== /m).filter(Boolean).forEach((section) => {
  const nl = section.indexOf('\n');
  const [name, lang] = section.slice(0, nl).trim().split(/\s+/);
  SNIPPETS[name] = { lang, code: section.slice(nl + 1).replace(/\n+$/, '') };
});

/** codeBlock() for a named snippet. */
export function snippet(name, opts = {}) {
  const s = SNIPPETS[name];
  if (!s) throw new Error(`snippet "${name}" not found`);
  return codeBlock({ code: s.code, lang: s.lang, ...opts });
}

export const head = (title, sub = '') => `
  <header class="s-head">
    <h2>${title}</h2>
    ${sub ? `<p>${sub}</p>` : ''}
  </header>`;

export const credit = (img) => `<span class="credit mono">Photo: ${img.author} / Unsplash</span>`;

export const bwImage = (img, cls = '') => `
  <figure class="bw ${cls}">
    <img src="${img.src}" alt="" decoding="async">
    <figcaption>${credit(img)}</figcaption>
  </figure>`;
