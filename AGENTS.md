# AGENTS.md — Maths Drills

Instructions for any AI agent or AI chat that changes this repository
(Claude Code reads it through `CLAUDE.md`). Read all of it before editing.

## What this is

Interactive maths worksheets for UK secondary maths lessons.
Each drill generates questions from a **seed**. Students answer on iPads by
tapping or dragging and get instant feedback; the teacher can print the same
sheet on A4 with an answer key.

- Live site: <https://amixorp.github.io/Maths-Drills/> (GitHub Pages, published from `main`).
- **Merging to `main` publishes to students within about a minute.**
- The owner edits through GitHub's website ("Add files via upload") and AI chats
  in the browser. Every change must work as **whole files uploaded as they are**:
  no build step, no generated files, nothing to run first.

## Hard rules

1. **No build step and no dependencies in the website.** Plain HTML, CSS and
   JavaScript. No bundlers, frameworks, npm packages or CDN links.
2. **Works from anywhere.** Every page must work when double-clicked from disk
   (`file://`), from a school server and from GitHub Pages. Use classic
   `<script src="...">` tags only — no ES modules (`type="module"`, `import`)
   and no `fetch()` of local files.
3. **Seeded randomness only.** Every random choice that affects the questions
   must use the drill's seeded `rng`. `Math.random` is allowed only for things
   that never change the questions (praise messages, picking a new seed).
   The same seed and settings must always give the same sheet: teachers reprint
   old seeds and students open shared links.
4. **Don't change what an existing seed produces** unless that is the purpose of
   the change (for example, fixing a wrong answer). Say so in the commit message.
5. **Never rename or delete a published drill file.** Bookmarks, links and QR
   codes point to it. (`MN_to_IP.html` and `IP_to_MN.html` are named the wrong
   way round for their content — leave the names alone.)
6. **Offline-safe.** Third-party code is copied into the repo (like `katex/`),
   never loaded from the internet.
7. **British English and UK maths conventions:** "maths", "practise" (verb),
   × and ÷ signs, − (true minus sign) in displayed maths, small gaps between
   groups of three digits (`2 400`), "1 dp", "2 sf".
8. **Don't copy shared code into a drill.** Toolbar, seeding, tapping and
   dragging, scoring, printing and sharing live in `core/`. A drill file holds
   only its maths. If several drills need something new, add it to `core/`.

## Repository map

```
index.html            Home page — and THE list of drills. Every drill needs a link here.
                      Also has the "Teacher mode on this device" switch.
worksheets.html       List of printable PDF worksheets.
<Drill_Name>.html     One file per interactive drill: its maths + Drill.define({...}).
_template.html        A small, complete example drill. Copy it to start a new one.
core/drill.js         Shared engine: toolbar, seed, settings, student/teacher modes,
                      tap and drag, scoring, answer key, share link + QR code.
core/drill.css        Shared look. Drills tune it with CSS variables (see below).
banks.js              Shared names, countable items and currencies for word problems. Data only.
katex/                KaTeX 0.18.9 for typesetting maths (copied in, not linked).
vendor/qrcode.js      QR code generator (MIT licence), loaded only when sharing.
pdf-worksheets/       Stand-alone printable worksheets with their own PDF writer (not core-based).
tests/                Automated checks. The website never loads anything from here.
```

## How a drill is built

A drill is **one HTML file**. `_template.html` is the reference; copy it.

```html
<link rel="stylesheet" href="core/drill.css">
<!-- if it uses LaTeX: <link rel="stylesheet" href="katex/katex.min.css"> -->
<style> :root{ --lhs-size:40px; } /* optional tuning + CSS for your question body */ </style>
...
<main class="sheet" id="sheet"></main>
<!-- if it uses LaTeX: <script src="katex/katex.min.js"></script> -->
<!-- if it uses word-problem data: <script src="banks.js"></script> -->
<script src="core/drill.js"></script>
<script>
(function () {
  'use strict';
  let rng = Math.random;            // replaced by the seeded rng in build()
  /* ...question generator code... */
  Drill.define({ ... });
})();
</script>
```

### `Drill.define({...})`

| Field | Required | Meaning |
|---|---|---|
| `id` | yes | Unique lowercase id, e.g. `'angles-in-triangles'`. Never change it once published. |
| `title` | yes | Heading on the sheet. |
| `build(rng, settings)` | yes | Returns the array of questions. Store `rng` and use only it for randomness. `settings.n` is the number of questions. |
| `toolbarTitle` | | Toolbar text, usually an emoji plus a short name. |
| `instructions` | | HTML shown under the title. Core adds the "tap or drag" sentence itself. |
| `counts`, `defaultCount` | | Choices for "Questions" (default `[6, 8, 10, 12, 15]` and `8`). |
| `settings` | | Extra options — see below. |
| `renderPrompt(q, i)` | | Prompt HTML. Default `q.prompt`. |
| `renderBody(q, i)` | | Question body HTML. Default: `q.lhs`, then `q.eq` (or `=`), then the **?** box. A custom body **must** include `Drill.slot()` exactly once. |
| `renderOption(o, q)` | | Answer HTML. Default `o.html`, else `o.text`. |

### A question

```js
{
  sig: '7x3',                        // identity for "no repeats" (your choice of format)
  prompt: 'Work out',                // or use renderPrompt
  lhs: '7 × 3',                      // used by the default body
  options: [                         // 4 options, shuffled with rng
    { text: '21', ok: true },
    { text: '24', ok: false },       // ...each wrong answer from a named mistake
    ...
  ]
}
```

Instead of `ok` flags you may give `answer: <index of the correct option>`.

### Settings

Every drill automatically gets `n` (number of questions). Add others with:

```js
settings: [
  { key: 'topic', label: 'Topic', type: 'select', default: 'mixed',
    options: [{ value: 'mixed', label: 'Mixed' }, { value: 'add', label: 'Addition only' }] },
  { key: 'neg', label: 'Include negatives', type: 'checkbox', default: true },
  { key: 'types', label: 'Round to', type: 'checkboxes', min: 1,
    options: [{ value: 'dp1', label: '1 dp' }, { value: 'sf1', label: '1 sf' }] }
]
```

`build` receives them as `settings.topic` (a value), `settings.neg` (true/false)
and `settings.types` (an array of ticked values). They are stored in the page
address, so shared links reproduce the exact sheet. Keys are short and never
renamed once published.

### Helpers from core

`Drill.slot()` — the **?** box. `Drill.tex(latex)` — render LaTeX with KaTeX.
`Drill.shuffle(rng, array)`, `Drill.pick(rng, array)` — seeded helpers.
`Drill.escape(text)` — make text safe to put inside HTML.

### Styling

Style only your question body (its own class names). Tune the shared layout
with these variables in `:root`, rather than overriding core rules:

| Variable | Default | Controls |
|---|---|---|
| `--q-min` | `440px` | Narrowest question card before the grid drops a column |
| `--lhs-size` / `--eq-size` | `46px` | The expression / the "=" |
| `--opt-size` | `30px` | Answer text |
| `--slot-min-w` / `--slot-min-h` / `--slot-font` | `170px` / `84px` / `34px` | The **?** box |
| `--diagram-min-h` | `130px` | Height of the default body |

## Student and teacher modes

- **Student mode** (the default): questions, score, **New questions**, **Reset**
  and an **Options** menu. No answer key, seed or print button.
- **Teacher mode**: seed, all settings, **Print**, **Show answers** and
  **Share to students**. It is on when the *Teacher mode on this device* switch
  on `index.html` is ticked, or the address has `?mode=teacher`.
- **Share to students** gives a link and QR code with `lock=1`: exactly the same
  questions, and the student can't change the seed or settings.

## What makes a good drill (maths quality)

- **Exactly one correct answer** among the options, normally four options (A–D).
- **Wrong answers come from real misconceptions**, not random numbers — and a
  comment names the mistake each one represents (e.g. "added the denominators",
  "place value slipped by one column").
- Wrong answers are **all different as displayed**, in the **same format and
  precision** as the correct answer, and never secretly equal to it
  (`0.5` vs `0.50`, `2/4` vs `1/2` when "simplest form" is not asked).
- **Difficulty rises down the sheet**: early questions are the easiest.
- **No repeated questions** within one sheet.
- **Exact arithmetic** for correct answers: integers, fractions as
  numerator/denominator, or digit strings — not floating point
  (`0.1 + 0.2 !== 0.3`).
- **No accidental giveaways or degenerate cases** (× 1, + 0, answers of 0,
  ratios that are already simplified) unless the question is meant to test them.
- **Word problems use sensible quantities** — take names and items from `banks.js`.
- It must work for **every** question count and **every** combination of settings.

## Screens, touch and print

- Students use iPads, so everything must work with **touch**: tap to answer,
  or press, hold and drag into the **?** box. A swipe that starts on an answer
  must still scroll the page. `core/drill.js` does all of this — **never add
  your own pointer, touch, mouse or drag handlers to a drill.**
- Layouts must fit every width from a **320px phone** to a desktop, portrait and
  landscape, with **no sideways scrolling**. Long expressions shrink to fit;
  long phrases wrap.
- **Print** is A4 portrait. A question must never split across two pages.
  Things that only make sense on screen are hidden when printing.
- Feedback never relies on colour alone (there is always text too).

## Adding a new drill — checklist

1. Copy `_template.html` (or the most similar existing drill) and give the new
   file a clear name with no spaces (e.g. `Angles_In_Triangles.html`).
2. Write the question generator, following every rule above, and give it a
   new unique `id`.
3. Add a link to it in `index.html`.
4. Open the file in a browser and check: **New questions** about ten times,
   every setting, **Print** preview, a phone-sized window (browser developer
   tools) and, if possible, a real iPad.
5. Commit with a message that says what the drill practises. GitHub then runs
   the tests: wait for the **green tick** next to the commit. A **red cross**
   means something is wrong — click it, then **Details**, to see which drill
   and why.

## Tests

Tests live in `tests/` and run automatically on GitHub (Actions → *Tests*) for
every upload to `main` and every pull request. They find every drill by
itself — nothing to register.

- **Maths checks** (`tests/run-generators.js`, no browser): each drill is run
  for 1,000 seeds with its default settings and 100 seeds for every other
  question count and setting. A sheet fails if it has the wrong number of
  questions, a question without exactly one correct option, two options that
  look the same, `NaN`/`undefined` in the text, no **?** box, or if the same
  seed gives a different sheet. Repeated questions are reported as warnings.
- **Browser checks** (`tests/*.spec.js`, Playwright): every drill in desktop
  Chrome and in Safari's engine at iPad and phone sizes — loads without errors,
  no sideways scrolling, tapping right and wrong answers, reset, same seed after
  reload, share link reproduces the sheet with teacher controls hidden, print
  layout. `touch.spec.js` uses real touch input for swipe, tap and
  press-hold-drag.
- `index.html` must link to every drill (except `_template.html`), and every
  link must point to a file that exists.

To run them on a computer (needs Node.js):

```
cd tests
npm install
npx playwright install chromium webkit
npm test                 # everything
npm run test:maths       # maths only, fast; add a name to filter: node run-generators.js Surds
```

`tests/tools/snapshot.js` and `compare.js` record what every drill produces
for fixed seeds and compare two recordings — use them to prove a refactor
didn't change any questions.

## Using a browser AI chat (ChatGPT, Claude.ai, Gemini, …)

Browser chats can't see the repository, so give them the files they need:

- **New drill:** attach `AGENTS.md` and `_template.html` (or the most similar
  existing drill), then:

  ```
  You are working on the Maths Drills website. Follow AGENTS.md exactly.
  Using the attached drill as the pattern (same core/drill.js structure,
  only the maths and Drill.define change), make a new drill:
    Topic: <topic and year group>
    Example questions: <two or three examples>
    Common mistakes to use as wrong answers: <list>
  Reply with ONE complete HTML file called <File_Name>.html,
  and the <li> block to add to index.html.
  ```

- **Change a drill:** attach `AGENTS.md` and that drill, describe the change,
  and ask for the **complete updated file** (not a snippet).
- **Change something every drill shares** (buttons, dragging, printing,
  sharing, layout): that's `core/drill.js` or `core/drill.css`. Attach that
  file and `AGENTS.md`, ask for the complete updated file, and afterwards check
  several different drills.
- Upload the result with **Add file → Upload files** on GitHub, then add the
  link in `index.html` with the ✏️ edit button.

## Commits

- Small, focused commits whose message says what changed and why.
- Mention it whenever a change alters the questions produced for existing seeds.
