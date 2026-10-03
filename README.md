# Vanilla JS → React — lecture deck

29 slides in Georgian (technical terms in English), structured as a Hero's Journey:
01 ORDINARY WORLD · 02 CALL · 03 REFUSAL · 04 MENTOR · 05 THRESHOLD · 06 TRIALS · 07 ORDEAL · 08 RETURN.
About 45 min of theory (timing is in the speaker notes), then a 10-minute break and 45 min of practice.

## Run

```bash
npm install
npm run dev        # http://localhost:5180
npm run build      # dist/index.html: one self-contained file, opens by double-click, no internet needed
npm run capture    # re-take the screenshots of both live sites (uses the installed Microsoft Edge)
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
| ? | keyboard help |

`#/15` in the URL opens a given slide; `?nogl` previews the static fallback of the 3D slide.

Interactive slides:
- **5**: → adds "About" to all 10 files, one at a time.
- **13**: + / − changes the state.
- **15**: the 3D monitors. Click links on the screens, → for the React monitor, then "Side view" and "Add link to header".
- **21**: the steppers under the code.
- **25**: → reveals bug 1, bug 2, then the fix; ← steps back.

## Structure

```
src/
  deck/        slide engine (navigation, chrome, transitions) + presenter window
  components/  code blocks (Prism, line highlights), quiz, coffee timer, icons
  scene/       Three.js monitor scene: model, page shader, tweens, screenshot loading
  slides/      one file per Hero's-Journey stage; snippets/ holds the real code excerpts
  styles/      tokens (palette, fonts), deck chrome, code theme, slide layouts
  assets/      screens/: captured screenshots · img/: black-and-white Unsplash photos + credits.json
scripts/capture-screens.mjs
```

## Sources

- Code excerpts: `Desktop/restaurant` (vanilla) and `Desktop/restaurant-react`, quoted verbatim or marked as abridged.
- Popularity figures: Stack Overflow Developer Survey 2025, "Web frameworks and technologies", all respondents.
- Photos (Unsplash License): Ricardo Gomez Angel, Thanos Pal, Andrew Kliatskyi, Colin Lloyd, Mike Hindle.
- Fonts: FiraGO (Georgian + Latin) and JetBrains Mono, bundled locally (OFL).
