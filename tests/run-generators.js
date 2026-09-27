/*
 * Maths checks for every drill — no browser needed.
 *
 *   node run-generators.js            all drills
 *   node run-generators.js Surds      only drills whose file name contains "Surds"
 *
 * Each drill page is loaded the way a browser would (its <script src> files,
 * then its inline script) and its question generator is run for many seeds
 * and every setting. A sheet FAILS if:
 *   - build() throws, or returns the wrong number of questions
 *   - a question doesn't have exactly one correct option
 *   - two options look the same once displayed
 *   - text shows NaN, undefined, null, Infinity or [object ...]
 *   - the question body has no ? box, or more than one
 *   - the same seed and settings give a different sheet (randomness leak)
 * It WARNS (without failing) about repeated questions within a sheet and
 * questions that don't have 4 options.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const NOT_DRILLS = new Set(['index.html', 'worksheets.html']);
const DEFAULT_SEEDS = 1000;     // with the default settings
const VARIATION_SEEDS = 100;    // for every other count / setting

/* ---------------- loading a drill page in Node ---------------- */
const fileCache = new Map();
function read(rel) {
  if (!fileCache.has(rel)) fileCache.set(rel, fs.readFileSync(path.join(ROOT, rel), 'utf8'));
  return fileCache.get(rel);
}

function loadDrill(file) {
  const html = read(file);
  if (!/Drill\.define\s*\(/.test(html)) return null;         // an old stand-alone page
  const ctx = vm.createContext({ console });
  ctx.window = ctx;
  const re = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html))) {
    const src = /\bsrc\s*=\s*"([^"]+)"/i.exec(m[1]);
    const code = src ? read(src[1]) : m[2];
    vm.runInContext(code, ctx, { filename: src ? src[1] : file + ' (inline script)' });
  }
  const cfg = ctx.Drill && ctx.Drill.defined;
  if (!cfg) throw new Error('Drill.define was not called');
  return { Drill: ctx.Drill, cfg };
}

/* ---------------- which settings to try ---------------- */
function plans(Drill, cfg) {
  const specs = Drill.normSettings(cfg);
  const defaults = Drill.defaultSettings(specs);
  const out = [{ label: 'defaults', settings: {}, seeds: DEFAULT_SEEDS }];
  for (const sp of specs) {
    const vary = [];
    if (sp.type === 'select') {
      sp.options.forEach(o => { if (o.value !== sp.default) vary.push(o.value); });
    } else if (sp.type === 'checkbox') {
      vary.push(!sp.default);
    } else if (sp.type === 'checkboxes') {
      const all = sp.options.map(o => o.value);
      all.forEach(v => vary.push([v]));                                   // each on its own
      if (all.length > 2) all.forEach(v => vary.push(all.filter(x => x !== v)));   // all but one
      if (String(sp.default) !== String(all)) vary.push(all);
    }
    vary.forEach(v => out.push({ label: sp.key + '=' + JSON.stringify(v), settings: { [sp.key]: v }, seeds: VARIATION_SEEDS }));
  }
  void defaults;
  return out;
}

/* ---------------- checks ---------------- */
function visibleText(html) {
  return String(html)
    .replace(/<span class="katex-mathml">[\s\S]*?<\/math><\/span>/g, '')   // KaTeX's hidden copy (contains the LaTeX source)
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;| |​/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
/* What a student actually sees, for spotting two identical options.
   Maths typeset by KaTeX is compared by its LaTeX source (flattened text
   can't tell 10/17 from 101/7, or 8√5 from √85); pictures by their SVG. */
function displayKey(html) {
  html = String(html);
  if (/<svg/i.test(html)) return html;
  const tex = [];
  html.replace(/<annotation encoding="application\/x-tex">([\s\S]*?)<\/annotation>/g, (m, t) => { tex.push(t.trim()); return m; });
  return visibleText(html) + (tex.length ? ' ⟨' + tex.join(' ⟩⟨') + '⟩' : '');
}
const BAD_TEXT = /\b(NaN|undefined|null|Infinity)\b|\[object /;

function checkSheet(Drill, cfg, seed, settings, n, problems, warnings, recheck) {
  const where = 'seed ' + seed + (Object.keys(settings).length ? ' ' + JSON.stringify(settings) : '');
  let qs;
  try {
    qs = Drill.generate(cfg, seed, settings);
  } catch (e) {
    problems.push(where + ': build() threw ' + (e && e.stack ? e.stack.split('\n').slice(0, 3).join(' | ') : e));
    return;
  }
  if (!Array.isArray(qs) || qs.length !== n) {
    problems.push(where + ': expected ' + n + ' questions, got ' + (qs && qs.length));
    return;
  }
  if (recheck) {
    const again = JSON.stringify(Drill.generate(cfg, seed, settings));
    if (again !== JSON.stringify(qs)) problems.push(where + ': same seed gave a different sheet (randomness not from rng)');
  }

  const seenQ = new Map();
  qs.forEach((q, i) => {
    const at = where + ' Q' + (i + 1);
    if (!q || !Array.isArray(q.options)) { problems.push(at + ': no options array'); return; }
    let parts;
    try { parts = Drill.questionParts(cfg, q, i); } catch (e) { problems.push(at + ': render threw ' + e.message); return; }
    const correct = q.options.filter(o => o && o.ok).length;
    if (correct !== 1) problems.push(at + ': ' + correct + ' correct options');
    if (q.options.length !== 4) warnings.push(at + ': ' + q.options.length + ' options');
    const shown = parts.options.map(displayKey);
    const dup = shown.find((t, k) => shown.indexOf(t) !== k);
    if (dup !== undefined) problems.push(at + ': two options both show "' + visibleText(dup).slice(0, 60) + '"');
    if (shown.some(t => !t)) problems.push(at + ': an option is blank');
    const all = [parts.prompt, parts.body].concat(parts.options).map(visibleText).join(' | ');
    if (BAD_TEXT.test(all)) problems.push(at + ': bad text: ' + all.slice(0, 160));
    const slots = (parts.body.match(/class="[^"]*\bdrop-zone\b/g) || []).length;
    if (slots !== 1) problems.push(at + ': body has ' + slots + ' ? boxes (needs exactly 1 — use Drill.slot())');
    const key = parts.prompt + ' || ' + parts.body;
    if (seenQ.has(key)) warnings.push(at + ': repeats Q' + (seenQ.get(key) + 1));
    else seenQ.set(key, i);
  });
}

/* ---------------- main ---------------- */
function main() {
  const filter = process.argv[2];
  const files = fs.readdirSync(ROOT)
    .filter(f => f.endsWith('.html') && !NOT_DRILLS.has(f) && (!filter || f.includes(filter)))
    .sort();
  let failed = 0;
  const ids = new Map();
  const t0 = Date.now();
  for (const file of files) {
    let loaded;
    try { loaded = loadDrill(file); } catch (e) {
      console.log('FAIL  ' + file + ': could not load: ' + e.message);
      failed++; continue;
    }
    if (!loaded) { console.log('skip  ' + file + ' (not built on core/drill.js)'); continue; }
    const { Drill, cfg } = loaded;
    if (ids.has(cfg.id)) { console.log('FAIL  ' + file + ': id "' + cfg.id + '" is also used by ' + ids.get(cfg.id)); failed++; }
    ids.set(cfg.id, file);

    const specs = Drill.normSettings(cfg);
    const counts = specs[0].options.map(o => o.value);
    const problems = [], warnings = [];
    let sheets = 0;
    const tDrill = Date.now();
    for (const plan of plans(Drill, cfg)) {
      for (let k = 0; k < plan.seeds; k++) {
        const seed = k < 5 ? [0, 1, 42, 12345, 999999999][k] : (k * 2654435761) % 1000000000;
        const n = plan.settings.n !== undefined ? plan.settings.n : counts[k % counts.length];
        checkSheet(Drill, cfg, seed, Object.assign({ n }, plan.settings), n, problems, warnings, k % 10 === 0);
        sheets++;
        if (problems.length > 50) break;
      }
    }
    const status = problems.length ? 'FAIL' : 'ok  ';
    console.log(status + '  ' + file.padEnd(36) + String(sheets).padStart(6) + ' sheets' +
      ('  ' + ((Date.now() - tDrill) / 1000).toFixed(1) + 's').padStart(8) +
      (warnings.length ? '   (' + warnings.length + ' warnings)' : ''));
    problems.slice(0, 8).forEach(p => console.log('        ✗ ' + p));
    if (problems.length > 8) console.log('        … ' + (problems.length - 8) + ' more');
    if (process.env.VERBOSE) warnings.slice(0, 8).forEach(w => console.log('        ! ' + w));
    if (problems.length) failed++;
  }
  console.log('\n' + (failed ? failed + ' drill(s) FAILED' : 'All drills passed') +
    ' in ' + ((Date.now() - t0) / 1000).toFixed(1) + 's');
  process.exit(failed ? 1 : 0);
}

main();
