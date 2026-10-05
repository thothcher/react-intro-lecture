# Vanilla JS → React — lecture deck

**Present it online:** https://thothcher.github.io/react-intro-lecture/ (full screen with F, speaker notes with S)

42 slides in English, structured as a Hero's Journey:
01 ORDINARY WORLD · 02 CALL · 03 REFUSAL · 04 MENTOR · 05 THRESHOLD · 06 TRIALS · 07 ORDEAL · 08 RETURN.
About 80 minutes of theory (timings are computed per slide and shown in the speaker notes), then a 10-minute break and 45 minutes of practice.

Every stage has its own colour; code is shown in large, dark editor panels so it can be read from the back of the room;
quizzes are a dark "game show"; the area around the 16:9 stage always takes the slide's colour, so there are no side bars.

## Run

```bash
npm install
npm run dev        # http://localhost:5180
npm run build      # dist/index.html: one self-contained file, opens by double-click, no internet needed
npm run capture    # re-take the screenshots of both live sites (uses the installed Microsoft Edge)
npm run deploy     # build and publish dist/ to the gh-pages branch (GitHub Pages)
```

## Presenting

| Key | Action |
| --- | --- |
| → · Space · PgDn | next (stepped slides advance their own steps first) |
| ← · PgUp | previous |
| Home / End | first / last slide |
| S | speaker notes in a separate window (keys there also drive the deck) |
| Shift + S | speaker notes on the same screen |
| B | coffee break: 10:00 countdown with pause / reset; chime + visual signal at 00:00 |
| F | full screen |
| 1–4 | answer a quiz |
| R | vocabulary slide: a random flashcard |
| ? | keyboard help |

`#/15` in the URL opens a given slide; `?nogl` previews the static fallback of the 3D monitor slide.
Without WebGL, slide 37 keeps its steps panel and shows a short notice instead of the scene.

Interactive slides:
- **5**: → adds "About" to all 10 files, one at a time.
- **13**: + / − changes the state; the imperative lines light up on the left.
- **15**: the 3D monitors. Click links on the screens, → for the React monitor, then "Side view" and "Add a link to the header".
- **16**: the framework map — React, Angular, Vue, Svelte and Next.js as cards with their logos.
- **19** (JSX): → shows what the build turns two ProductCard.jsx excerpts into, → the resulting HTML.
- **20** (JSX in a real component): our real `Header` code next to the same JSX running live in React (sign in / out, + cart, the burger). → highlights one JSX feature at a time — attributes, `{ }` expressions, conditions, components & events, Fragment — then the question (why `className` and not `class`?) and the answer.
- **21** (How React thinks): four animated explainers — **Props** (one component, three results; read-only; events go up), **State** (memory → setter → re-render → one text node), **Hooks** (slots matched by call order; what breaks inside an `if`; custom hooks), **Virtual DOM** (two trees, a diff, one patch vs 18 operations with innerHTML). Tabs or → switch; "Replay" repeats.
- **24**: the steppers under the code.
- **28** (Trial 4, reconciliation): + / − changes the cart count; a real MutationObserver counts what each side deletes and recreates (vanilla 36 DOM operations, React 1 text change).
- **29** (Trial 5, XSS): a normal or a malicious product name; the vanilla card runs the injected script unless you tick `esc()`, the React card shows it as text.
- **30** (Trial 6, listeners, optional): Menu → Product a few times, then +; leaked listeners make one click count several times.
- **7, 23, 25, 27, 31**: quizzes (1–4 or click).
- **33**: → reveals bug 1, bug 2, then the fix; ← steps back.
- **34** (TypeScript): what it is and why React projects use it. → types `p.` in an editor (autocomplete), → a typo gets a red line while typing (the real tsc message), → the quick fix, → what the build does with the types.
- **35** (Data on its way): the same three files in a JavaScript lane and a TypeScript lane; a value travels api → cart → CartSummary → screen. Four real-world cases — correct data, a price sent as text, a product not found (`null`), a typo in a prop. JavaScript shows the bug on the screen (wrong price, blank page, $0.00); the TypeScript type filters stop it with the real compiler message. → plays the next case.
- **36**: CSR · SSR · SSG · ISR side by side.
- **37**: animated rendering strategies in 3D: server with `dist/` and a database on the left, browser on the right, an SEO bot grading the first HTML.
- **39** (Vocabulary): a flashcard game — click a card to flip it, or press **R** for a random card in the spotlight, ask "what is it?", → flips it, → again puts it back. Shuffle / Reset.
- **40**: Start your own React app — Node.js → Vite → `npm install` / `npm run dev` → the three files → components, props, state → `npm run build` and publish.
- **41**: the students' task (Trattoria Lite): five timed steps, a "done when" checklist and bonus goals.

## Structure

```
src/
  deck/        slide engine (navigation, chrome, transitions) + presenter window
  components/  code blocks (Prism, line highlights), quiz, flashcards, coffee timer, icons, brand logos
  explain/     ConceptScene — the animated props / state / hooks / virtual DOM explainers
  scene/       Three.js scenes: the monitors (MonitorScene) and the rendering strategies (RenderScene)
  demos/       live vanilla-vs-React demos for Trials 4–6 (real React 19 roots, measured DOM changes)
  slides/      one file per Hero's-Journey stage (index.js computes the timings); snippets/ holds the real code excerpts
  styles/      tokens, deck chrome, code theme, slide layouts, theme (stage colours), refresh (per-slide polish)
  assets/      screens/: captured screenshots · img/: Unsplash photos + credits.json
scripts/capture-screens.mjs
```

## Sources

- Code excerpts: `Desktop/restaurant` (vanilla) and `Desktop/restaurant-react`, quoted verbatim or marked as abridged.
- Popularity figures: Stack Overflow Developer Survey 2025, "Web frameworks and technologies", all respondents.
- Logos: [simple-icons](https://simpleicons.org) (CC0 icon data; the marks belong to their owners).
- Photos (Unsplash License): Ricardo Gomez Angel, Thanos Pal, Andrew Kliatskyi, Colin Lloyd, Mike Hindle.
- Fonts: FiraGO and JetBrains Mono, bundled locally (OFL).
