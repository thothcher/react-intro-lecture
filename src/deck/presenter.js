// Speaker notes.
//  S        → separate presenter window (for a laptop + projector setup). Keys typed there drive the deck.
//  Shift+S  → notes panel on the same screen (also the fallback when pop-ups are blocked).
const PRESENTER_CSS = `
  body.presenter { margin: 0; background: #F6F7F9; color: #0B1B3A; font-family: 'FiraGO', system-ui, sans-serif; display: grid; grid-template-rows: auto 1fr auto; height: 100vh; }
  .p-top { display: flex; align-items: baseline; gap: 18px; padding: 18px 26px; border-bottom: 1px solid rgba(11,27,58,.14); background: #fff; }
  .p-count { font: 600 22px/1 'JetBrains Mono', monospace; }
  .p-stage { font: 500 12px/1 'JetBrains Mono', monospace; letter-spacing: .14em; color: #A4483A; text-transform: uppercase; }
  .p-title { font: 600 22px/1.2 'FiraGO', sans-serif; flex: 1; }
  .p-clock { font: 500 20px/1 'JetBrains Mono', monospace; color: #5B6577; }
  .p-clock b { color: #0B1B3A; font-weight: 600; }
  .p-body { overflow: auto; padding: 22px 26px; display: grid; grid-template-columns: 1fr 280px; gap: 26px; align-items: start; }
  .p-notes { font: 400 20px/1.6 'FiraGO', sans-serif; }
  .p-notes p { margin: 0 0 .8em; }
  .p-notes b { color: #A4483A; font-weight: 600; }
  .p-notes code { font: 500 .88em 'JetBrains Mono', monospace; background: rgba(11,27,58,.06); padding: 0 .25em; }
  .p-side { display: grid; gap: 14px; font: 400 14px/1.45 'FiraGO', sans-serif; color: #5B6577; }
  .p-side h3 { margin: 0 0 4px; font: 500 11px/1 'JetBrains Mono', monospace; letter-spacing: .14em; text-transform: uppercase; color: #8A93A3; }
  .p-side .p-box { border: 1px solid rgba(11,27,58,.14); background: #fff; padding: 12px 14px; }
  .p-time { font: 600 18px/1.2 'JetBrains Mono', monospace; color: #0B1B3A; }
  .p-keys { padding: 10px 26px; border-top: 1px solid rgba(11,27,58,.14); font: 400 12px/1 'JetBrains Mono', monospace; color: #8A93A3; }
  ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-thumb { background: #0B1B3A; } ::-webkit-scrollbar-track { background: transparent; }
`;

const two = (n) => String(n).padStart(2, '0');
const clock = (ms) => `${two(Math.floor(ms / 60000))}:${two(Math.floor(ms / 1000) % 60)}`;

export class Presenter {
  constructor(deck) {
    this.deck = deck;
    this.win = null;
    this.startedAt = 0;
    this.overlay = null;
    this.tick = 0;
  }

  open() {
    if (this.win && !this.win.closed) { this.win.focus(); return; }
    const w = window.open('', 'react-intro-presenter', 'width=1040,height=740');
    if (!w) { this.toggleOverlay(true); return; }
    this.win = w;
    const doc = w.document;
    doc.open();
    doc.write('<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Speaker notes — Vanilla JS → React</title></head><body class="presenter"></body></html>');
    doc.close();
    // reuse the deck's fonts (inlined @font-face rules) + presenter styles
    document.querySelectorAll('style').forEach((s) => { if (s.textContent.includes('@font-face')) doc.head.append(doc.importNode(s, true)); });
    const st = doc.createElement('style');
    st.textContent = PRESENTER_CSS;
    doc.head.append(st);
    doc.body.innerHTML = `
      <header class="p-top">
        <span class="p-count" data-p="count"></span>
        <span class="p-stage" data-p="stage"></span>
        <span class="p-title" data-p="title"></span>
        <span class="p-clock">lecture <b data-p="elapsed">00:00</b> · <span data-p="now"></span></span>
      </header>
      <main class="p-body">
        <div class="p-notes" data-p="notes"></div>
        <aside class="p-side">
          <div class="p-box"><h3>Time</h3><div class="p-time" data-p="time"></div></div>
          <div class="p-box"><h3>Next slide</h3><div data-p="next"></div></div>
          <div class="p-box"><h3>Steps</h3><div data-p="steps"></div></div>
        </aside>
      </main>
      <footer class="p-keys">→ / Space next · ← previous · B break · F full screen · 1–4 quiz answer</footer>`;
    w.addEventListener('keydown', (e) => this.deck.handleKey(e));
    if (!this.startedAt) this.startedAt = Date.now();
    clearInterval(this.tick);
    this.tick = setInterval(() => this.paintClock(), 1000);
    window.addEventListener('beforeunload', () => w.close(), { once: true });
    this.update();
  }

  paintClock() {
    if (!this.win || this.win.closed) { clearInterval(this.tick); return; }
    const $ = (k) => this.win.document.querySelector(`[data-p="${k}"]`);
    $('elapsed').textContent = clock(Date.now() - this.startedAt);
    const d = new Date();
    $('now').textContent = `${two(d.getHours())}:${two(d.getMinutes())}`;
  }

  update() {
    const { slides, index } = this.deck;
    const s = slides[index];
    const next = slides[index + 1];
    const fill = (root) => {
      const $ = (k) => root.querySelector(`[data-p="${k}"]`);
      if (!$('notes')) return;
      $('count').textContent = `${index + 1} / ${slides.length}`;
      $('stage').textContent = s.stage;
      $('title').textContent = s.title;
      $('notes').innerHTML = s.notes || '<p>—</p>';
      $('time').textContent = s.time || '—';
      if ($('next')) $('next').textContent = next ? `${next.stage} — ${next.title}` : 'last slide';
      if ($('steps')) $('steps').textContent = s.steps ? s.steps : 'one step';
    };
    if (this.win && !this.win.closed) { fill(this.win.document); this.paintClock(); }
    if (this.overlay && !this.overlay.hidden) fill(this.overlay);
  }

  toggleOverlay(force) {
    if (!this.overlay) {
      this.overlay = document.createElement('aside');
      this.overlay.className = 'notes-overlay';
      this.overlay.hidden = true;
      this.overlay.innerHTML = `
        <div class="notes-head"><span class="mono" data-p="count"></span><span class="mono notes-stage" data-p="stage"></span><b data-p="title"></b><span class="mono notes-time" data-p="time"></span></div>
        <div class="notes-body" data-p="notes"></div>`;
      this.deck.stage.append(this.overlay);
    }
    this.overlay.hidden = force === undefined ? !this.overlay.hidden : !force;
    this.update();
  }
}
