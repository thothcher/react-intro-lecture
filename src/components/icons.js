// Custom line icons (no emoji). 24x24 grid, square caps, 1.5 stroke.
const svg = (body, cls = '') =>
  `<svg class="ico ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="square" stroke-linejoin="miter" aria-hidden="true" focusable="false">${body}</svg>`;

export const icons = {
  coffee: svg('<path d="M4.5 10.5h11v3.5a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5z"/><path d="M15.5 11.5h1.25a2.25 2.25 0 0 1 0 4.5H15.2"/><path d="M3.5 21h14"/><path d="M8.5 3.5c-.9.9-.9 1.8 0 2.7s.9 1.8 0 2.7M12 3.5c-.9.9-.9 1.8 0 2.7s.9 1.8 0 2.7"/>'),
  arrow: svg('<path d="M4 12h15M14 6l6 6-6 6"/>'),
  check: svg('<path d="M4.5 12.5l5 5 10-11"/>'),
  cross: svg('<path d="M6 6l12 12M18 6L6 18"/>'),
  pause: svg('<path d="M8.5 5v14M15.5 5v14"/>'),
  play: svg('<path d="M7 4.5v15l12-7.5z"/>'),
  reset: svg('<path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3"/><path d="M4.5 4v4.5H9"/>'),
  close: svg('<path d="M6 6l12 12M18 6L6 18"/>'),
  file: svg('<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/>'),
  node: svg('<path d="M4 6h16v5H4zM4 15h7v4H4zM13 15h7v4h-7z"/><path d="M12 11v2M7.5 13h9v2M7.5 13v2"/>'),
  minus: svg('<path d="M6 12h12"/>'),
  plus: svg('<path d="M12 6v12M6 12h12"/>'),
};
