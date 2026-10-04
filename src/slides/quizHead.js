// The badge above every quiz: "QUIZ n / 5" + the topic, game-show style.
export const QUIZ_TOTAL = 5;
export const quizHead = (n, topic) => `
  <div class="quiz-top">
    <span class="quiz-badge">QUIZ ${n} / ${QUIZ_TOTAL}</span>
    <span class="quiz-topic">${topic}</span>
  </div>`;
