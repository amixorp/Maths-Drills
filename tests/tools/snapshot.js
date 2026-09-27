/*
 * Records what every drill generates for a fixed set of seeds and settings,
 * so a refactor can be checked to produce exactly the same worksheets.
 *
 *   node tools/snapshot.js <outDir> [drillFile ...]
 *
 * For each drill page it discovers the toolbar controls, then for the default
 * settings plus each single-control variation and each seed, it records the
 * prompt, the question body (minus the drop slot), the answer options and
 * the answer key.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { chromium } = require('@playwright/test');

const ROOT = path.resolve(__dirname, '..', '..');
const SEEDS = [1, 2, 3, 7, 42, 100, 2024, 5555, 12345, 999999];
const SKIP = new Set(['index.html', 'worksheets.html']);

function drillFiles() {
  return fs.readdirSync(ROOT).filter(f => f.endsWith('.html') && !SKIP.has(f)).sort();
}

/* Runs in the page: list the settings controls in the toolbar. */
function discoverControls() {
  const ignore = new Set(['seedInput', 'answersChk']);
  const out = [];
  document.querySelectorAll('.toolbar select, .toolbar input[type=checkbox], [data-setting]').forEach(el => {
    const key = el.dataset.setting || el.id;
    if (!key || ignore.has(key) || out.some(c => c.key === key)) return;
    if (el.tagName === 'SELECT') {
      out.push({ key, type: 'select', values: [...el.options].map(o => o.value), def: el.value });
    } else {
      out.push({ key, type: 'checkbox', def: el.checked });
    }
  });
  return out;
}

/* Runs in the page: canonical description of the rendered sheet. */
function extract() {
  const clean = el => {
    if (!el) return null;
    const c = el.cloneNode(true);
    c.querySelectorAll('.drop-zone, .slot, .qmark').forEach(z => z.remove());
    return c.innerHTML.replace(/\s+/g, ' ').trim();
  };
  const qs = [...document.querySelectorAll('.q')].map(q => {
    const prompt = q.querySelector('.q-prompt');
    /* The body is everything between the header and the options. */
    const body = q.cloneNode(true);
    body.querySelectorAll('.q-head, .options, .q-feedback').forEach(e => e.remove());
    const wrap = body.querySelector(':scope > .q-body');
    return {
      prompt: prompt ? prompt.innerHTML.replace(/\s+/g, ' ').trim() : null,
      body: clean(wrap || body),
      options: [...q.querySelectorAll('.option')].map(o =>
        clean(o.querySelector('.opt-visual, .item-visual') || o))
    };
  });
  const key = document.querySelector('.key-grid, #keySection');
  return { count: qs.length, questions: qs, key: key ? key.textContent.replace(/\s+/g, ' ').trim() : null };
}

/* Runs in the page: apply settings, then re-seed so generation starts fresh. */
function applySettings([settings, seed]) {
  for (const [key, val] of Object.entries(settings)) {
    const el = document.querySelector('[data-setting="' + key + '"]') || document.getElementById(key);
    if (!el) throw new Error('missing control ' + key);
    if (el.type === 'checkbox') el.checked = val; else el.value = val;
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }
  const s = document.getElementById('seedInput');
  s.value = String(seed);
  s.dispatchEvent(new Event('change', { bubbles: true }));
}

function variations(controls) {
  const out = [{}];
  for (const c of controls) {
    if (c.type === 'select') {
      for (const v of c.values) if (v !== c.def) out.push({ [c.key]: v });
    } else {
      out.push({ [c.key]: !c.def });
    }
  }
  return out;
}

/*
 * Replay mode:  node tools/snapshot.js <outDir> --replay <beforeDir> [drillFile ...]
 * Re-runs exactly the settings recorded in <beforeDir>, translating the old
 * control ids with tools/legacy-ids.json, so the two folders can be diffed.
 */
async function main() {
  const args = process.argv.slice(2);
  const outDir = path.resolve(args.shift() || 'snapshots');
  let replay = null;
  if (args[0] === '--replay') { args.shift(); replay = path.resolve(args.shift()); }
  const only = args;
  const idMap = JSON.parse(fs.readFileSync(path.join(__dirname, 'legacy-ids.json'), 'utf8'));
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));

  for (const file of (only.length ? only : drillFiles())) {
    const url = 'file:///' + path.join(ROOT, file).replace(/\\/g, '/');
    await page.goto(url + '?seed=1');
    await page.waitForSelector('.q', { timeout: 10000 });
    let controls, plan;
    if (replay) {
      const before = JSON.parse(fs.readFileSync(path.join(replay, file.replace(/\.html$/, '.json')), 'utf8'));
      controls = before.controls;
      plan = before.runs.map(r => ({ settings: r.settings, seed: r.seed }));
    } else {
      controls = await page.evaluate(discoverControls);
      plan = [];
      for (const settings of variations(controls)) for (const seed of SEEDS) plan.push({ settings, seed });
    }
    const map = (replay && idMap[file]) || {};
    const result = { file, controls, runs: [] };
    for (const { settings, seed } of plan) {
      const mapped = {};
      for (const [k, v] of Object.entries(settings)) mapped[map[k] || k] = v;
      await page.evaluate(applySettings, [mapped, seed]);
      result.runs.push({ settings, seed, sheet: await page.evaluate(extract) });
    }
    fs.writeFileSync(path.join(outDir, file.replace(/\.html$/, '.json')), JSON.stringify(result, null, 1));
    const qTotal = result.runs.reduce((a, r) => a + r.sheet.count, 0);
    console.log(file.padEnd(40), 'variations', String(result.runs.length / SEEDS.length).padStart(3),
      ' questions', qTotal, errors.length ? ' ERRORS: ' + errors.join(' | ') : '');
    errors.length = 0;
  }
  await browser.close();
}

main().catch(e => { console.error(e); process.exit(1); });
