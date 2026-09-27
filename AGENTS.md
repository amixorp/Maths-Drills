# AGENTS.md — Maths Drills

Rules for AI agents writing code for this repository (Claude Code reads this
through `CLAUDE.md`; browser chats get it as an attachment). Read it all before
editing. Maintainer and workflow guidance is in `README.md`.

## Context

Interactive maths worksheets for UK secondary lessons. Each drill generates
multiple-choice questions from a seed; students answer on iPads (tap or drag),
teachers print the same sheet on A4.

- Live on GitHub Pages at <https://amixorp.github.io/Maths-Drills/>, published
  from `main` about a minute after each merge.
- The owner uploads whole files through GitHub's website, often written by a
  browser AI chat. **If you can't write to the repo, reply with complete files,
  never fragments or diffs.**

## Hard rules

1. **No build step, no dependencies.** Plain HTML/CSS/JS. No bundlers,
   frameworks, npm packages or CDN links in the website.
2. **Works from `file://`, a school server and GitHub Pages.** Classic
   `<script src>` only — no ES modules, no `fetch()` of local files.
3. **Seeded randomness only.** Everything that affects questions uses the drill's
   `rng`. `Math.random` only for things that never change questions (praise,
   new seeds). Same seed + settings ⇒ identical sheet.
4. **Don't change what an existing seed produces** unless that's the point
   (e.g. fixing a wrong answer); say so in the commit message.
5. **Never rename or delete a published drill file, its `id`, or a setting
   `key`.** Links, QR codes, printed seeds and results codes depend on them.
   (`MN_to_IP.html`/`IP_to_MN.html` are named the wrong way round — leave them.)
6. **Offline-safe.** Third-party code is vendored (`katex/`, `vendor/`).
7. **British English, UK conventions:** "maths", "practise" (verb), × ÷,
   − (U+2212) in displayed maths, digit-group gaps (`2 400`), "1 dp", "2 sf".
8. **Drills contain only their maths.** Toolbar, seeding, tap/drag, scoring,
   printing, sharing, summary and saved progress live in `core/`. Never copy
   them into a drill; never add pointer/touch/mouse/drag handlers to a drill.
   If several drills need something new, add it to `core/`.

## Repository map

```
index.html            Home page and THE list of drills (every drill needs a link here).
<Drill_Name>.html     One file per drill: its maths + Drill.define({...}).
_template.html        Reference drill. Copy it for new drills.
core/drill.js         Shared engine.          core/drill.css   Shared styles.
banks.js              Word-problem data (window.BANKS). Data only.
katex/                KaTeX 0.18.9.           vendor/qrcode.js QR generator (MIT).
pdf-worksheets/       Stand-alone PDF worksheets (not core-based). Listed in worksheets.html.
sw.js                 Service worker.         manifest.webmanifest, icons/, apple-touch-icon.png
tests/                Node + Playwright checks, run by .github/workflows/tests.yml.
```

## How a drill is built

One HTML file; follow `_template.html`:

```html
<link rel="stylesheet" href="core/drill.css">
<!-- LaTeX: <link rel="stylesheet" href="katex/katex.min.css"> -->
<style> :root{ --lhs-size:40px; }  /* tuning + CSS for this drill's body only */ </style>
...
<main class="sheet" id="sheet"></main>
<!-- LaTeX: <script src="katex/katex.min.js"></script> -->
<!-- word problems: <script src="banks.js"></script> -->
<script src="core/drill.js"></script>
<script>
(function () {
  'use strict';
  let rng = Math.random;            // build() replaces it with the seeded rng
  /* ...generator... */
  Drill.define({ ... });
})();
</script>
```

### `Drill.define({...})`

| Field | Req. | Meaning |
|---|---|---|
| `id` | ✓ | Unique, lowercase, permanent (e.g. `'angles-in-triangles'`). |
| `title` | ✓ | Sheet heading (HTML). |
| `build(rng, settings)` | ✓ | Returns the questions. Store `rng`; use only it. `settings.n` = question count. |
| `toolbarTitle` | | Emoji + short name. |
| `instructions` | | HTML under the title. Core appends the tap/drag sentence. |
| `counts`, `defaultCount` | | "Questions" choices; default `[6, 8, 10, 12, 15]`, `8`. |
| `settings` | | Extra options (below). |
| `renderPrompt(q, i)` | | Default `q.prompt`. |
| `renderBody(q, i)` | | Default `q.lhs` + `q.eq` (or `=`) + ? box. Custom bodies must contain `Drill.slot()` exactly once. |
| `renderOption(o, q)` | | Default `o.html`, else `o.text` (inserted as HTML). |

### Question object

```js
{
  sig: '7x3',                  // identity used to avoid repeats
  prompt: 'Work out',
  lhs: '7 × 3',                // for the default body
  options: [                   // normally 4, shuffled with rng
    { text: '21', ok: true },
    { text: '24', ok: false }, // comment which misconception each wrong answer is
    ...
  ]
}
```

`answer: <index>` may replace the `ok` flags. `hideLetters: true` hides A–D.

### Settings

```js
settings: [
  { key: 'topic', label: 'Topic', type: 'select', default: 'mixed',
    options: [{ value: 'mixed', label: 'Mixed' }, { value: 'add', label: 'Addition only' }] },
  { key: 'neg', label: 'Include negatives', type: 'checkbox', default: true },
  { key: 'types', label: 'Round to', type: 'checkboxes', min: 1,
    options: [{ value: 'dp1', label: '1 dp' }, { value: 'sf1', label: '1 sf' }] }
]
```

`build` gets `settings.topic` (value), `settings.neg` (boolean),
`settings.types` (array, in option order). Non-default values are kept in the
URL (`?seed=…&topic=add`), so shared links reproduce the sheet.

### Core helpers

`Drill.slot()` ? box · `Drill.tex(latex)` KaTeX · `Drill.shuffle(rng, a)`,
`Drill.pick(rng, a)` · `Drill.escape(text)` · `Drill.fail(title, html)` shows
an error instead of the sheet (e.g. a missing dependency).

### Styling

Style only your body's own classes. Tune shared layout with `:root` variables:
`--q-min` (440px, min card width), `--lhs-size`/`--eq-size` (46px),
`--opt-size` (30px), `--slot-min-w`/`--slot-min-h`/`--slot-font`
(170/84/34px), `--diagram-min-h` (130px). Long phrases should wrap
(`white-space:normal`); core shrinks overlong expressions automatically.

## What core already does (don't rebuild)

- **Modes:** student by default; teacher when `localStorage['mathsDrills.teacher']`
  is `'1'` (switch on `index.html`) or `?mode=teacher`; `?lock=1` = shared sheet
  (no seed/settings/reset). Teacher-only UI uses class `teacher-only`.
- **Share:** link + QR (`vendor/qrcode.js`, loaded on demand).
- **End of sheet:** confetti (respects reduced motion), summary, results code
  (`Drill.encodeResult`/`decodeResult`; encodes a hash of `id` and of seed +
  settings), teacher **Check codes**, progress saved per sheet in localStorage.
- **Layout/print:** 320px to desktop with no sideways scroll; A4 print hides
  toolbar, feedback and (unless ticked) the answer key.
- **Offline:** over http(s), core adds the manifest/icons and registers `sw.js`.
  `sw.js` precaches pages linked from `index.html`/`worksheets.html`; pages and
  `core/` are network-first (no cache version to bump). `katex/`, `vendor/`,
  `icons/` are cache-first — replace files there under a **new name**.
- Every page keeps a 🏠 link: a Home Screen app has no Back button.

## Maths quality

- Exactly one correct option; normally four.
- Wrong answers come from named misconceptions, are all different **as
  displayed**, share the correct answer's format and precision, and are never
  secretly equal to it (`0.5`/`0.50`, `2/4`/`1/2`).
- Difficulty rises down the sheet (pass position 0→1 into generators).
- No repeated questions in a sheet (dedupe on `sig`).
- Exact arithmetic for answers (integers, numerator/denominator, digit strings),
  not floating point.
- Avoid degenerate cases (× 1, + 0, zero answers, already-simplified ratios)
  unless intended. Word problems use `banks.js` and sensible quantities.
- Must work for every question count and every settings combination.

## Adding a drill

1. Copy `_template.html` to `Clear_Name.html` (no spaces); new unique `id`.
2. Write the generator following the rules above.
3. Add an `<li><a class="ws-link" href="Clear_Name.html">Title<span>One line.</span></a></li>`
   to `index.html`.
4. Run the tests if you can (below); otherwise CI runs them on push.

## Tests

`.github/workflows/tests.yml` runs on pushes to `main` and on PRs. Drills are
discovered automatically.

- `tests/run-generators.js` (Node, no browser): loads each drill as a page would
  and generates 1,000 default sheets + 100 per count/setting variation. Fails on:
  wrong count, ≠1 correct option, duplicate-looking options, `NaN`/`undefined`
  text, missing/extra ? box, non-reproducible seed. Repeats are warnings.
- `tests/*.spec.js` (Playwright; desktop Chrome, iPad and phone WebKit): loads,
  no overflow, tap right/wrong, reset, reproducible reload, locked share link,
  print layout, results flow, real touch gestures, offline via the service worker,
  and `index.html` links every drill.

```
cd tests && npm install && npx playwright install chromium webkit
npm test                      # everything
node run-generators.js Surds  # maths checks for one drill
```

To prove a refactor doesn't change questions: `node tools/snapshot.js <dir>`
before, `node tools/snapshot.js <dir2> --replay <dir>` after, then
`node tools/compare.js <dir> <dir2>` (map renamed control ids in
`tools/legacy-ids.json`).

## Commits

Small and focused; the message says what changed and why, and flags any change
to the questions produced for existing seeds.
