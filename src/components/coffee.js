// Coffee break: a line icon fixed top-right on every slide. Opens a 10:00 countdown with
// Pause/Resume, Reset and Close. When it hits 00:00: a soft two-tone chime + a visual pulse.
// The timer keeps running when the overlay is closed; the icon then shows the remaining time.
import { icons } from './icons.js';

const TOTAL = 10 * 60 * 1000;
const fmt = (ms) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
};

function chime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [[660, 0], [880, 0.28]].forEach(([freq, at]) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, ctx.currentTime + at);
      gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + at + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + at + 1.2);
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime + at);
      osc.stop(ctx.currentTime + at + 1.3);
    });
    setTimeout(() => ctx.close(), 2000);
  } catch { /* audio unavailable: the visual signal still runs */ }
}

export function mountCoffee(stage) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'coffee-btn';
  btn.setAttribute('aria-label', 'ყავის შესვენება (B)');
  btn.title = 'ყავის შესვენება — B';
  btn.innerHTML = `${icons.coffee}<span class="coffee-mini mono" hidden></span>`;

  const overlay = document.createElement('div');
  overlay.className = 'coffee';
  overlay.hidden = true;
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-label', 'ყავის შესვენება');
  overlay.innerHTML = `
    <div class="coffee-panel">
      <span class="coffee-kicker mono">COFFEE BREAK</span>
      <div class="coffee-icon">${icons.coffee}</div>
      <p class="coffee-title">შესვენება</p>
      <div class="coffee-time mono" data-time>10:00</div>
      <div class="coffee-bar"><span data-bar></span></div>
      <p class="coffee-msg" data-msg>ვბრუნდებით 10 წუთში — შემდეგ პრაქტიკა.</p>
      <div class="coffee-actions">
        <button type="button" class="btn btn-solid" data-toggle>${icons.pause}<span>პაუზა</span></button>
        <button type="button" class="btn" data-reset>${icons.reset}<span>თავიდან</span></button>
        <button type="button" class="btn" data-close>${icons.close}<span>დახურვა</span></button>
      </div>
    </div>`;

  stage.append(btn, overlay);
  const $time = overlay.querySelector('[data-time]');
  const $bar = overlay.querySelector('[data-bar]');
  const $toggle = overlay.querySelector('[data-toggle]');
  const $msg = overlay.querySelector('[data-msg]');
  const $mini = btn.querySelector('.coffee-mini');

  let remaining = TOTAL;
  let endAt = 0;
  let running = false;
  let started = false;
  let timer = 0;

  function paint() {
    if (running) remaining = Math.max(0, endAt - Date.now());
    $time.textContent = fmt(remaining);
    $bar.style.transform = `scaleX(${remaining / TOTAL})`;
    $toggle.innerHTML = running ? `${icons.pause}<span>პაუზა</span>` : `${icons.play}<span>${started && remaining < TOTAL && remaining > 0 ? 'გაგრძელება' : 'დაწყება'}</span>`;
    const showMini = started && overlay.hidden && remaining > 0;
    $mini.hidden = !showMini;
    $mini.textContent = fmt(remaining);
    btn.classList.toggle('is-running', running);
    if (running && remaining === 0) finish();
  }

  function finish() {
    running = false;
    clearInterval(timer);
    overlay.classList.add('is-done');
    btn.classList.add('is-done');
    $msg.textContent = 'დრო ამოიწურა — ვბრუნდებით!';
    chime();
    paint();
  }

  function start() {
    if (remaining <= 0) return;
    started = true;
    running = true;
    endAt = Date.now() + remaining;
    clearInterval(timer);
    timer = setInterval(paint, 250);
    paint();
  }
  function pause() { running = false; clearInterval(timer); paint(); }
  function reset() {
    pause();
    remaining = TOTAL;
    started = false;
    overlay.classList.remove('is-done');
    btn.classList.remove('is-done');
    $msg.textContent = 'ვბრუნდებით 10 წუთში — შემდეგ პრაქტიკა.';
    paint();
  }
  function open() {
    overlay.hidden = false;
    btn.setAttribute('aria-expanded', 'true');
    if (!started) start();
    paint();
    $toggle.focus({ preventScroll: true });
  }
  function close() {
    overlay.hidden = true;
    btn.setAttribute('aria-expanded', 'false');
    paint();
  }

  btn.addEventListener('click', () => (overlay.hidden ? open() : close()));
  $toggle.addEventListener('click', () => (running ? pause() : start()));
  overlay.querySelector('[data-reset]').addEventListener('click', reset);
  overlay.querySelector('[data-close]').addEventListener('click', close);
  paint();

  return {
    get open() { return !overlay.hidden; },
    toggle: () => (overlay.hidden ? open() : close()),
    close,
    toggleRun: () => (running ? pause() : start()),
  };
}
