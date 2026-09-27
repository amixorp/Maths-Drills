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

## Repository map

```
index.html            Home page — and THE list of drills. Every drill needs a link here.
worksheets.html       List of printable PDF worksheets.
<Drill_Name>.html     One self-contained file per interactive drill.
banks.js              Shared names, countable items and currencies for word problems. Data only.
katex/                KaTeX 0.18.9 for typesetting maths (copied in, not linked).
pdf-worksheets/       Stand-alone printable worksheets with their own PDF writer.
```

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
  must still scroll the page.
- Layouts must fit every width from a **320px phone** to a desktop, portrait and
  landscape, with **no sideways scrolling**. Long expressions shrink to fit;
  long phrases wrap.
- **Print** is A4 portrait. A question must never split across two pages.
  Things that only make sense on screen are hidden when printing.
- Feedback never relies on colour alone (there is always text too).

## Adding a new drill — checklist

1. Start from the most similar existing drill and give the new file a clear
   name with no spaces (e.g. `Angles_In_Triangles.html`).
2. Write the question generator, following every rule above.
3. Add a link to it in `index.html`.
4. Open the file in a browser and check: **New questions** about ten times,
   every setting, **Print** preview, a phone-sized window (browser developer
   tools) and, if possible, a real iPad.
5. Commit with a message that says what the drill practises.

## Using a browser AI chat (ChatGPT, Claude.ai, Gemini, …)

Browser chats can't see the repository, so give them the files they need:

- **New drill:** attach `AGENTS.md` and the most similar existing drill, then:

  ```
  You are working on the Maths Drills website. Follow AGENTS.md exactly.
  Using the attached drill as the pattern, make a new drill:
    Topic: <topic and year group>
    Example questions: <two or three examples>
    Common mistakes to use as wrong answers: <list>
  Reply with ONE complete HTML file called <File_Name>.html,
  and the <li> block to add to index.html.
  ```

- **Change a drill:** attach `AGENTS.md` and that drill, describe the change,
  and ask for the **complete updated file** (not a snippet).
- Upload the result with **Add file → Upload files** on GitHub, then add the
  link in `index.html` with the ✏️ edit button.

## Commits

- Small, focused commits whose message says what changed and why.
- Mention it whenever a change alters the questions produced for existing seeds.
