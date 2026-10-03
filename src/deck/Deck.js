// Minimal slide engine: one slide mounted at a time (resources are released on leave),
// keyboard navigation, stage label, counter, progress line, coffee break, speaker notes.
//
// A slide is { id, stage, title, time, notes, tone?, steps?, html?, mount?(el, deck) }.
// mount() may return { next?(): boolean, prev?(): boolean, unmount?() } — next()/prev()
// return true when they consumed the key press (stepped slides such as the 3D scene).
import { mountCoffee } from '../components/coffee.js';
import { Presenter } from './presenter.js';
import { reducedMotion } from '../scene/tween.js';

const LEAVE_MS = 450;

export class Deck {
  constructor(stage, slides) {
    this.stage = stage;
    this.slides = slides;
    this.index = -1;
    this.current = null;
    this.token = 0;
  }

  init() {
    const chrome = document.createElement('div');
    chrome.className = 'chrome';
    chrome.innerHTML = `
      <div class="progress" aria-hidden="true"><span></span></div>
      <div class="stage-label" data-label></div>
      <div class="counter mono" data-counter></div>
      <div class="help" hidden data-help>
        <p class="mono help-title">KEYS</p>
        <dl>
          <dt>→ · Space · PgDn</dt><dd>შემდეგი (ან სლაიდის შემდეგი ნაბიჯი)</dd>
          <dt>← · PgUp</dt><dd>წინა</dd>
          <dt>Home · End</dt><dd>პირველი / ბოლო</dd>
          <dt>S</dt><dd>speaker notes ცალკე ფანჯარაში</dd>
          <dt>Shift + S</dt><dd>notes იგივე ეკრანზე</dd>
          <dt>B</dt><dd>ყავის შესვენება (10:00)</dd>
          <dt>F</dt><dd>full screen</dd>
          <dt>1–4</dt><dd>ქვიზის პასუხი</dd>
          <dt>?</dt><dd>ეს დახმარება</dd>
        </dl>
      </div>`;
    this.slidesEl = document.createElement('div');
    this.slidesEl.className = 'slides';
    this.stage.append(this.slidesEl, chrome);
    this.$progress = chrome.querySelector('.progress span');
    this.$label = chrome.querySelector('[data-label]');
    this.$counter = chrome.querySelector('[data-counter]');
    this.$help = chrome.querySelector('[data-help]');

    this.coffee = mountCoffee(this.stage);
    this.presenter = new Presenter(this);

    this.onKey = (e) => this.handleKey(e);
    window.addEventListener('keydown', this.onKey);
    window.addEventListener('hashchange', () => {
      const i = this.hashIndex();
      if (i !== this.index) this.go(i, { dir: i > this.index ? 1 : -1 });
    });
    this.go(this.hashIndex(), { instant: true });
  }

  hashIndex() {
    const n = parseInt(location.hash.replace(/^#\/?/, ''), 10);
    return Number.isFinite(n) ? Math.min(Math.max(n - 1, 0), this.slides.length - 1) : 0;
  }

  async go(i, { dir = 1, instant = false } = {}) {
    i = Math.min(Math.max(i, 0), this.slides.length - 1);
    if (i === this.index && this.current) return;
    const token = ++this.token;
    const slide = this.slides[i];
    const prev = this.current;
    this.index = i;
    this.current = null;
    history.replaceState(null, '', `#/${i + 1}`);
    this.paintChrome(slide);

    const el = document.createElement('section');
    el.className = 'slide';
    el.dataset.id = slide.id;
    if (slide.tone) el.dataset.tone = slide.tone;
    el.setAttribute('aria-roledescription', 'slide');
    el.setAttribute('aria-label', `${i + 1} / ${this.slides.length}: ${slide.title}`);
    el.style.setProperty('--dir', dir);
    if (slide.html) el.innerHTML = typeof slide.html === 'function' ? slide.html() : slide.html;
    this.slidesEl.append(el);

    // leave the previous slide (its resources are released after the fade)
    if (prev) {
      prev.el.style.setProperty('--dir', dir);
      prev.el.classList.remove('is-active');
      prev.el.classList.add('is-leaving');
      const done = () => { try { prev.ctrl?.unmount?.(); } catch (err) { console.error(err); } prev.el.remove(); };
      if (instant || reducedMotion()) done(); else setTimeout(done, LEAVE_MS);
    }

    let ctrl = null;
    try {
      ctrl = (await slide.mount?.(el, this)) || null;
    } catch (err) {
      console.error(err);
      el.insertAdjacentHTML('beforeend', `<p class="slide-error mono">${String(err.message || err)}</p>`);
    }
    if (token !== this.token) { ctrl?.unmount?.(); el.remove(); return; } // superseded by a newer navigation

    this.current = { el, ctrl, slide };
    requestAnimationFrame(() => el.classList.add('is-active'));
    if (instant) el.classList.add('is-active', 'no-anim');
    this.presenter.update();
  }

  paintChrome(slide) {
    const n = this.slides.length;
    this.$progress.style.transform = `scaleX(${n > 1 ? this.index / (n - 1) : 1})`;
    this.$label.textContent = slide.stage;
    this.$counter.textContent = `${String(this.index + 1).padStart(2, '0')} / ${n}`;
    this.stage.dataset.tone = slide.tone || 'light';
  }

  next() {
    if (this.current?.ctrl?.next?.()) { this.presenter.update(); return; }
    if (this.index < this.slides.length - 1) this.go(this.index + 1, { dir: 1 });
  }

  prev() {
    if (this.current?.ctrl?.prev?.()) { this.presenter.update(); return; }
    if (this.index > 0) this.go(this.index - 1, { dir: -1 });
  }

  handleKey(e) {
    if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
    const t = e.target;
    if (t?.closest?.('input, textarea, select, [contenteditable]')) return;
    const k = e.key;
    const onButton = t?.closest?.('button');

    if (k === 'Escape') {
      if (this.coffee.open) this.coffee.close();
      else if (!this.$help.hidden) this.$help.hidden = true;
      else if (this.presenter.overlay && !this.presenter.overlay.hidden) this.presenter.toggleOverlay(false);
      return;
    }
    if (this.coffee.open && k === ' ') { e.preventDefault(); this.coffee.toggleRun(); return; }

    if (['ArrowRight', 'PageDown'].includes(k) || (k === ' ' && !e.shiftKey && !onButton)) { e.preventDefault(); this.next(); return; }
    if (['ArrowLeft', 'PageUp'].includes(k) || (k === ' ' && e.shiftKey && !onButton)) { e.preventDefault(); this.prev(); return; }
    if (k === 'Home') { e.preventDefault(); this.go(0, { dir: -1 }); return; }
    if (k === 'End') { e.preventDefault(); this.go(this.slides.length - 1); return; }
    if (k === 's' || k === 'ს') { this.presenter.open(); return; }
    if (k === 'S' || k === 'შ') { this.presenter.toggleOverlay(); return; }
    if (k === 'b' || k === 'B' || k === 'ბ') { this.coffee.toggle(); return; }
    if (k === 'f' || k === 'F' || k === 'ფ') { this.toggleFullscreen(); return; }
    if (k === '?') { this.$help.hidden = !this.$help.hidden; }
  }

  toggleFullscreen() {
    if (document.fullscreenElement) document.exitFullscreen?.();
    else document.documentElement.requestFullscreen?.().catch(() => {});
  }
}
