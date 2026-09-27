# Maths Drills

Interactive maths worksheets for the classroom. Every drill makes fresh
questions from a **seed** (a number), so the same seed always gives the same
sheet. Students answer on iPads by tapping or dragging and get instant
feedback; teachers can print the same sheet on A4 with an answer key.

**Live site:** <https://amixorp.github.io/Maths-Drills/>
Anything uploaded to `main` goes live for students about a minute later.

This README is for the people who look after the site. AI coding tools read
[`AGENTS.md`](AGENTS.md) instead — you'll attach it to AI chats, but you don't
need to edit it.

---

## How the site is organised

| File or folder | What it is |
|---|---|
| `index.html` | The home page **and the list of drills**. A drill only appears on the site once it has a link here. |
| `Something_Drill.html` | One file per drill. It holds only that drill's maths. |
| `_template.html` | A small working example drill. Start new drills from this. |
| `core/drill.js`, `core/drill.css` | The shared engine every drill uses: buttons, tapping and dragging, scoring, printing, sharing, the end-of-sheet summary. Fix something here and it's fixed in every drill. |
| `banks.js` | Names and objects for word problems (plain lists — safe to edit by hand). |
| `worksheets.html`, `pdf-worksheets/` | The printable PDF worksheets. |
| `katex/`, `vendor/`, `icons/`, `sw.js`, `manifest.webmanifest` | Maths typesetting, QR codes, app icons and offline support. Leave these alone. |
| `tests/`, `.github/` | Automatic checks that run on GitHub after every upload. |

---

## Working with an AI chat in the browser

AI chats (ChatGPT, Claude.ai, Gemini, …) can't see the website's files, so
you attach the ones they need. Each drill is a single file, so it's never
more than two or three.

| You want to… | Attach | Then |
|---|---|---|
| **Add a new drill** | `AGENTS.md` + `_template.html` (or the most similar existing drill) | Use the "new drill" prompt below. Upload the file it gives you, then add its link in `index.html`. |
| **Fix or change one drill** | `AGENTS.md` + that drill's file | Ask for the **complete updated file**, then upload it (it replaces the old one). |
| **Change something every drill shares** (buttons, dragging, printing, summary) | `AGENTS.md` + `core/drill.js` and/or `core/drill.css` | Ask for the complete file, then check a few different drills afterwards. |
| **Word-problem names or items** | `banks.js` | It's plain data, so you can edit it directly on GitHub with ✏️. |

### Prompts to copy

**New drill** — attach `AGENTS.md` and `_template.html`:

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

**Change a drill** — attach `AGENTS.md` and the drill:

```
You are working on the Maths Drills website. Follow AGENTS.md exactly.
In the attached drill, <describe the change>.
Keep everything else the same. Reply with the COMPLETE updated file.
```

**Change the shared engine** — attach `AGENTS.md` and `core/drill.js` (and/or `core/drill.css`):

```
You are working on the Maths Drills website. Follow AGENTS.md exactly.
In the attached core file, <describe the change>. It is used by every drill,
so don't change how existing drills call it. Reply with the COMPLETE updated file.
```

**Fix a failing check** — attach `AGENTS.md`, the drill named in the error, and paste the error:

```
You are working on the Maths Drills website. Follow AGENTS.md exactly.
GitHub's automatic check failed with this message:
<paste the error text>
Fix the attached drill. Reply with the COMPLETE updated file.
```

### Rules that keep the site working

- **Always ask for whole files, never snippets.** Pasting pieces into a file is
  where most AI edits go wrong.
- **Never rename a drill file, and never change its `id`.** Shared links,
  QR codes and printed seeds depend on them.
- **Don't let the AI add its own dragging, toolbar or print code to a drill.**
  If it does, reply: *"Follow AGENTS.md — core/drill.js already does this."*
- **Don't let it change the questions an existing drill makes** unless you're
  fixing a wrong answer — teachers reprint old seeds.

---

## Getting files in and out of GitHub

- **Download a file to give the AI:** open it on GitHub, then press
  **Download raw file** (the ⬇ icon), or **Copy raw file** and paste it in.
- **Upload a new or changed file:** on the repository's front page,
  **Add file → Upload files**. Use exactly the same file name to replace a file.
  Type a short message saying what changed, e.g. *"Add angles in triangles drill"*.
- **Add a drill to the home page:** open `index.html`, press ✏️, and paste the
  new link next to the others:

  ```html
  <li>
    <a class="ws-link" href="Angles_In_Triangles.html">
      Angles in Triangles
      <span>Find the missing angle in a triangle.</span>
    </a>
  </li>
  ```

- **Undo a bad change:** open the file and press **History**. Next to the last
  good version, press **`<>`** (browse the files at that point), open the file,
  press **Download raw file**, then upload it again.

---

## After every upload: the automatic checks

A few minutes after each upload, GitHub checks every drill: thousands of
generated sheets for maths mistakes (no correct answer, two identical answers,
`NaN`, …), plus every drill opened in Chrome and in Safari on iPad and phone
sizes (tapping, dragging, sharing, printing, offline).

- **Green ✓** next to your commit — all good.
- **Red ✗** — something's wrong. Click it, then **Details**, and scroll to the
  red lines. They name the drill and the problem. Copy that text into the
  "fix a failing check" prompt above.
- **Yellow ●** — still running.

The checks can't judge whether questions are *pedagogically* good, so still
look at a new drill yourself:

1. Press **New questions** about ten times — do the questions and wrong answers make sense?
2. Try every option in the toolbar.
3. **Print** preview — nothing cut off, no question split across pages.
4. Make the browser window narrow (phone size), and try it on a real iPad if you can.

---

## Bigger changes: test before they go live

For changes to `core/`, or anything you're unsure about, don't upload straight
to `main`:

1. On GitHub, open the branch menu (says **main**), type a new name such as
   `fix-printing`, and choose **Create branch**.
2. Upload your files while that branch is selected.
3. GitHub offers **Compare & pull request** — open one. The checks run on it.
4. Try it on any device at
   `https://raw.githack.com/amixorp/Maths-Drills/<branch-name>/index.html`
5. When happy, press **Merge pull request**. It goes live a minute later.

---

## Using the site (quick reference)

- **Teacher mode:** tick **Teacher mode on this device** at the bottom of the home
  page (once per device). Drills then show Seed, Print, Show answers,
  **Share to students** and **Check codes**. Leave it off on student iPads.
- **Sharing a sheet:** **Share to students** shows a link and a QR code. Students
  get exactly the same questions, with no answers, settings or reset button.
- **Results:** when a student finishes, they get a summary and a **results code**.
  Open the same sheet, press **Check codes** and paste the codes to see everyone's
  results.
- **iPad app:** in Safari, **Share → Add to Home Screen**. After opening it once
  online, it also works on patchy or no wi-fi, and updates itself when online.

---

## Running the checks on your own computer (optional)

Needs [Node.js](https://nodejs.org). In a terminal:

```
cd tests
npm install
npx playwright install chromium webkit
npm test
```
