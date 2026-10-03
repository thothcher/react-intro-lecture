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
  blocks: svg('<path d="M3.5 3.5h7v7h-7zM13.5 3.5h7v7h-7zM3.5 13.5h7v7h-7zM13.5 13.5h7v7h-7z"/>'),
  equals: svg('<path d="M3.5 7.5h6M6.5 4.5v6M3.5 16.5h6M14.5 9h6M14.5 15h6"/>'),
  diff: svg('<path d="M6 3.5v17M18 3.5v17M6 8h4M6 12h4M6 16h4M14 12h4"/><path d="M14 12l2-2M14 12l2 2"/>'),
  shield: svg('<path d="M12 3l7.5 3v5.5c0 4.5-3.2 8.2-7.5 9.5-4.3-1.3-7.5-5-7.5-9.5V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>'),
  cycle: svg('<path d="M19.5 12a7.5 7.5 0 0 1-13 5.1M4.5 12a7.5 7.5 0 0 1 13-5.1"/><path d="M17.5 3.5v3.4h-3.4M6.5 20.5v-3.4h3.4"/>'),
  network: svg('<path d="M12 4.5v5M12 14.5v5M6 12h4M14 12h4"/><path d="M10 9.5h4v5h-4zM10 2.5h4v2h-4zM10 19.5h4v2h-4zM2.5 10.5h3.5v3h-3.5zM18 10.5h3.5v3H18z"/>'),
  server: svg('<path d="M4 3.5h16v6H4zM4 14.5h16v6H4z"/><path d="M7 6.5h1M7 17.5h1M11 6.5h6M11 17.5h6"/>'),
  monitor: svg('<path d="M3 4h18v12H3z"/><path d="M9 20h6M12 16v4"/>'),
  build: svg('<path d="M3.5 7.5L12 3l8.5 4.5v9L12 21l-8.5-4.5z"/><path d="M3.5 7.5L12 12l8.5-4.5M12 12v9"/>'),
  clock: svg('<path d="M12 20.5a8.5 8.5 0 1 0 0-17 8.5 8.5 0 0 0 0 17z"/><path d="M12 7v5l3.5 2"/>'),
  bot: svg('<path d="M10.5 16a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11zM14.5 14.5l6 6"/>'),
};
