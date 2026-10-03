// Minimal tween engine driven by the scene's render loop (no extra dependency).
// Durations collapse to zero when the user prefers reduced motion.

export const ease = {
  linear: (t) => t,
  outCubic: (t) => 1 - (1 - t) ** 3,
  inOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2),
  outQuint: (t) => 1 - (1 - t) ** 5,
};

export const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export class Tweens {
  constructor() { this.list = []; }

  get active() { return this.list.length > 0; }

  /**
   * Animate a 0→1 progress value.
   * @returns {Promise<void>} resolves when finished (or immediately under reduced motion).
   */
  run({ duration = 400, delay = 0, easing = ease.outCubic, onUpdate, key } = {}) {
    if (key) this.cancel(key);
    if (reducedMotion()) duration = 0;
    const scale = globalThis.__timeScale || 1;
    duration *= scale;
    delay *= scale;
    return new Promise((resolve) => {
      this.list.push({ start: performance.now() + (reducedMotion() ? 0 : delay), duration, easing, onUpdate, resolve, key });
    });
  }

  /** Tween numeric props of an object (e.g. a position or a uniform holder). */
  to(target, props, opts = {}) {
    const from = {};
    Object.keys(props).forEach((k) => { from[k] = target[k]; });
    return this.run({
      ...opts,
      onUpdate: (p) => {
        Object.keys(props).forEach((k) => { target[k] = from[k] + (props[k] - from[k]) * p; });
        opts.onUpdate?.(p);
      },
    });
  }

  cancel(key) {
    this.list = this.list.filter((t) => {
      if (t.key !== key) return true;
      t.resolve();
      return false;
    });
  }

  update(now = performance.now()) {
    if (!this.list.length) return;
    this.list = this.list.filter((t) => {
      if (now < t.start) return true;
      const raw = t.duration <= 0 ? 1 : Math.min(1, (now - t.start) / t.duration);
      t.onUpdate?.(t.easing(raw));
      if (raw >= 1) { t.resolve(); return false; }
      return true;
    });
  }

  clear() { this.list.forEach((t) => t.resolve()); this.list = []; }
}

export const wait = (ms) => new Promise((r) => setTimeout(r, reducedMotion() ? 0 : ms));
