# Maths Drills

Interactive maths worksheets for iPads and print.
Live site: <https://amixorp.github.io/Maths-Drills/> (updates about a minute after each upload).

## Making changes with an AI chat

1. **Attach files** to the chat (see table) and ask for what you want.
2. **Upload** the file it gives you: **Add file → Upload files** (same name replaces the old file).
3. **New drill?** Add its link to `index.html` (press ✏️, paste the `<li>` the chat gave you).
4. **Wait for the green ✓** next to your commit. Red ✗ → click it → **Details** → paste the error into the chat and ask it to fix the file.
5. **Try it** on the live site, ideally on an iPad.

| To… | Attach |
|---|---|
| Add a new drill | `AGENTS.md` + `_template.html` |
| Change one drill | `AGENTS.md` + that drill |
| Change something every drill shares (buttons, dragging, printing) | `AGENTS.md` + `core/drill.js` and/or `core/drill.css` |
| Change word-problem names or items | Nothing — edit `banks.js` on GitHub with ✏️ |

**Prompts**

- New drill: *"Follow AGENTS.md. Using the template, make a drill on `<topic>`, e.g. `<example question>`. Give me the complete file and the index.html link."*
- Change: *"Follow AGENTS.md. `<describe the change>`. Give me the complete updated file."*

## Rules

- Always ask for **complete files**, never snippets.
- Never **rename** a drill file or change its `id` — links and QR codes would break.
- Big or risky change? Upload it to a new branch and open a pull request, so it's checked before going live.
- To undo: open the file → **History** → `<>` on a good version → download it → upload again.

## Using the site

- **Teacher mode:** tick it at the bottom of the home page (once per device) to get Print, answers, **Share to students** and **Check codes**.
- **Sharing:** **Share to students** gives a link and QR code for the exact sheet.
- **Results:** students get a code when they finish; paste codes into **Check codes** on the same sheet.
- **iPad app:** in Safari, **Share → Add to Home Screen**. Works offline after the first visit.
