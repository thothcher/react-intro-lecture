// Vocabulary as a game: click a card to flip it; R / "Random card" brings an unrevealed card into the
// spotlight with only the term showing — the lecturer asks, → flips it, → again puts it back.
import { reducedMotion } from '../scene/tween.js';

export function mountFlashcards(el, total) {
  const grid = el.querySelector('[data-grid]');
  const spot = el.querySelector('[data-spot]');
  const spotCard = el.querySelector('[data-spot-card]');
  const spotHint = el.querySelector('[data-spot-hint]');
  const scoreEl = el.querySelector('[data-score]');
  const cards = () => [...grid.querySelectorAll('.fc')];
  let current = null; // the grid card shown in the spotlight

  const score = () => { scoreEl.textContent = String(cards().filter((c) => c.classList.contains('is-flipped')).length); };

  function flip(card, on = !card.classList.contains('is-flipped')) {
    card.classList.toggle('is-flipped', on);
    score();
  }

  function openSpot(card) {
    current = card;
    spotCard.innerHTML = `<div class="fc fc--big" style="${card.getAttribute('style')}">${card.innerHTML}</div>`;
    spotHint.textContent = 'What is it? · → flip';
    spot.hidden = false;
    card.classList.add('is-picked');
    requestAnimationFrame(() => spot.classList.add('is-open'));
  }

  function flipSpot() {
    const big = spotCard.querySelector('.fc');
    big.classList.add('is-flipped');
    spotHint.textContent = '→ back to the table';
  }

  function closeSpot() {
    if (!current) return;
    flip(current, true);
    current.classList.remove('is-picked');
    current.classList.add('is-done');
    current = null;
    spot.classList.remove('is-open');
    setTimeout(() => { if (!current) spot.hidden = true; }, reducedMotion() ? 0 : 260);
  }

  function random() {
    if (current) return;
    const pool = cards().filter((c) => !c.classList.contains('is-flipped'));
    if (!pool.length) return;
    openSpot(pool[Math.floor(Math.random() * pool.length)]);
  }

  /** Shuffle with a FLIP animation: every card glides from its old place to the new one. */
  function shuffle() {
    const list = cards();
    const before = new Map(list.map((c) => [c, c.getBoundingClientRect()]));
    for (let i = list.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    list.forEach((c) => grid.appendChild(c));
    if (reducedMotion()) return;
    list.forEach((c) => {
      const a = before.get(c);
      const b = c.getBoundingClientRect();
      c.animate([{ transform: `translate(${a.left - b.left}px, ${a.top - b.top}px)` }, { transform: 'none' }], { duration: 520, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' });
    });
  }

  function reset() {
    cards().forEach((c) => c.classList.remove('is-flipped', 'is-done', 'is-picked'));
    score();
  }

  const onClick = (e) => {
    if (e.target.closest('[data-random]')) { random(); return; }
    if (e.target.closest('[data-shuffle]')) { shuffle(); return; }
    if (e.target.closest('[data-reset]')) { reset(); return; }
    if (spot.contains(e.target)) {
      const big = spotCard.querySelector('.fc');
      if (e.target.closest('.fc') && big && !big.classList.contains('is-flipped')) flipSpot();
      else closeSpot();
      return;
    }
    const card = e.target.closest('.fc');
    if (card && grid.contains(card)) flip(card);
  };
  const onKey = (e) => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.key === 'r' || e.key === 'R') { e.preventDefault(); random(); }
    if (e.key === 'Escape' && current) closeSpot();
  };
  el.addEventListener('click', onClick);
  document.addEventListener('keydown', onKey);
  score();

  return {
    next() {
      if (!current) return false;
      const big = spotCard.querySelector('.fc');
      if (big && !big.classList.contains('is-flipped')) flipSpot(); else closeSpot();
      return true;
    },
    unmount() {
      el.removeEventListener('click', onClick);
      document.removeEventListener('keydown', onKey);
    },
    get revealed() { return cards().filter((c) => c.classList.contains('is-flipped')).length; },
    total,
  };
}
