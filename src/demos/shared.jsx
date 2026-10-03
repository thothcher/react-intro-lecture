// Shared bits for the live "vanilla vs React" demos.
export const PATH = {
  utensils: 'M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2 M7 2v20 M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7',
  bag: 'M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z M3 6h18 M16 10a4 4 0 0 1-8 0',
  user: 'M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
};

export const svgString = (d) =>
  `<svg class="mh-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="${d}"/></svg>`;

export function Svg({ d }) {
  return (
    <svg className="mh-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d={d} />
    </svg>
  );
}

export const escapeHtml = (v) =>
  String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** Pop a small "+N" label next to an element (click feedback in the demos). */
export function popLabel(anchor, text, cls = '') {
  const host = anchor.closest('[data-pop-host]') || anchor.parentElement;
  const a = anchor.getBoundingClientRect();
  const h = host.getBoundingClientRect();
  const el = document.createElement('span');
  el.className = `pop-label ${cls}`;
  el.textContent = text;
  el.style.left = `${a.left - h.left + a.width / 2}px`;
  el.style.top = `${a.top - h.top}px`;
  host.append(el);
  setTimeout(() => el.remove(), 1100);
}
