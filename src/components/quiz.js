// Quiz: one question, 3–4 options. Click (or press 1–4 / A–D) to answer; the correct option
// and a short explanation are revealed. One attempt per visit; re-entering the slide resets it.
import { icons } from './icons.js';

const LETTERS = ['A', 'B', 'C', 'D'];

export function mountQuiz(el, { question, code = '', options, answer, explain }) {
  el.innerHTML = `
    <div class="quiz">
      <p class="quiz-q">${question}</p>
      ${code}
      <div class="quiz-opts" role="group" aria-label="answers">
        ${options.map((o, i) => `
          <button type="button" class="quiz-opt" data-i="${i}">
            <span class="quiz-letter mono">${LETTERS[i]}</span>
            <span class="quiz-text">${o}</span>
            <span class="quiz-mark"></span>
          </button>`).join('')}
      </div>
      <div class="quiz-result" aria-live="polite" hidden></div>
    </div>`;

  const buttons = [...el.querySelectorAll('.quiz-opt')];
  const result = el.querySelector('.quiz-result');
  let done = false;

  function choose(i) {
    if (done || i < 0 || i >= options.length) return;
    done = true;
    const ok = i === answer;
    buttons.forEach((b, j) => {
      b.disabled = true;
      if (j === answer) { b.classList.add('is-correct'); b.querySelector('.quiz-mark').innerHTML = icons.check; }
      if (j === i && !ok) { b.classList.add('is-wrong'); b.querySelector('.quiz-mark').innerHTML = icons.cross; }
      if (j !== answer && j !== i) b.classList.add('is-dim');
    });
    result.hidden = false;
    result.className = `quiz-result ${ok ? 'is-ok' : 'is-no'}`;
    result.innerHTML = `
      <span class="quiz-verdict mono">${ok ? 'Correct!' : `Not quite — the right answer is ${LETTERS[answer]}`}</span>
      <p>${explain}</p>`;
  }

  const onClick = (e) => {
    const b = e.target.closest('.quiz-opt');
    if (b) choose(Number(b.dataset.i));
  };
  const onKey = (e) => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    const k = e.key.toUpperCase();
    const i = /^[1-4]$/.test(k) ? Number(k) - 1 : LETTERS.indexOf(k);
    if (i >= 0 && i < options.length) { e.preventDefault(); choose(i); }
  };
  el.addEventListener('click', onClick);
  document.addEventListener('keydown', onKey);

  return {
    unmount() {
      el.removeEventListener('click', onClick);
      document.removeEventListener('keydown', onKey);
    },
  };
}
