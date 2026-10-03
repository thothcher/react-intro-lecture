// Trial 5 — a product name from the API containing HTML.
//   vanilla: card.innerHTML = `<h3>${p.name}</h3>`  → the browser parses it, the inline handler runs
//   React:   <h3>{p.name}</h3>                       → always text
// The "attack" only adds a CSS class to its own demo panel — it is harmless, but it is real script execution.
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { escapeHtml } from './shared.jsx';

export const NORMAL = 'Pizza Margherita';
export const PAYLOAD = `<img src="x" onerror="this.closest('.xss-side').classList.add('is-pwned')">Pizza Margherita`;

function Card({ name }) {
  return (
    <article className="xcard">
      <div className="xcard-img" />
      <h3 className="xcard-title">{name}</h3>
      <div className="xcard-foot"><b>$15.50</b><span className="xcard-add">Add</span></div>
    </article>
  );
}

const vanillaCard = (name, safe) => `
  <article class="xcard">
    <div class="xcard-img"></div>
    <h3 class="xcard-title">${safe ? escapeHtml(name) : name}</h3>
    <div class="xcard-foot"><b>$15.50</b><span class="xcard-add">Add</span></div>
  </article>`;

export function mountXssDemo(el) {
  const input = el.querySelector('[data-name]');
  const escBox = el.querySelector('[data-esc]');
  const vSide = el.querySelector('[data-v-side]');
  const vHost = el.querySelector('[data-v-card]');
  const rHost = el.querySelector('[data-r-card]');
  const vChip = el.querySelector('[data-v-chip]');
  const root = createRoot(rHost);
  let timer = 0;

  function render() {
    const name = input.value;
    vSide.classList.remove('is-pwned');
    vHost.innerHTML = vanillaCard(name, escBox.checked);
    flushSync(() => root.render(<Card name={name} />));
    vChip.textContent = 'ვამოწმებთ…';
    vChip.className = 'xss-chip';
    clearTimeout(timer);
    timer = setTimeout(() => {
      const pwned = vSide.classList.contains('is-pwned');
      vChip.textContent = pwned ? 'სკრიპტი შესრულდა — XSS' : 'უსაფრთხო';
      vChip.className = `xss-chip ${pwned ? 'is-bad' : 'is-good'}`;
    }, 350);
  }

  const onClick = (e) => {
    const preset = e.target.closest('[data-preset]');
    if (preset) { input.value = preset.dataset.preset === 'bad' ? PAYLOAD : NORMAL; render(); }
  };
  input.addEventListener('input', render);
  escBox.addEventListener('change', render);
  el.addEventListener('click', onClick);
  input.value = PAYLOAD;
  render();

  return {
    unmount() {
      clearTimeout(timer);
      input.removeEventListener('input', render);
      escBox.removeEventListener('change', render);
      el.removeEventListener('click', onClick);
      root.unmount();
    },
  };
}
