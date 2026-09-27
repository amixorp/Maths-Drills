/* ============================================================
   core/drill.js — the shared engine behind every drill page
   ------------------------------------------------------------
   Loaded as a CLASSIC script (not a module) so a drill works
   when it is double-clicked from disk, served from a school
   server, or served from GitHub Pages.

   A drill page is ONE html file that loads, in this order:
       core/drill.css
       (katex/katex.min.css + katex/katex.min.js, if it uses LaTeX)
       core/drill.js
       an inline <script> that calls Drill.define({...})

   The drill supplies only the maths: its settings, a build()
   function that makes the questions, and how to draw one
   question body. Everything else — toolbar, seed, student and
   teacher modes, sharing, drag/tap answering, scoring, the
   answer key and print layout — lives here, so a fix made here
   reaches every drill at once. The full contract is in
   AGENTS.md; _template.html is a small working example.
   ============================================================ */
(function (global) {
  'use strict';

  const Drill = global.Drill = global.Drill || {};
  const HAS_DOM = typeof document !== 'undefined';
  const LETTERS = 'ABCDEFGH';

  /* Where core/ lives relative to the page, for loading extras. */
  const BASE = (HAS_DOM && document.currentScript && document.currentScript.src)
    ? document.currentScript.src.replace(/core\/drill\.js(?:[?#].*)?$/, '')
    : '';

  /* ============================================================
     SEEDED RANDOM  (same seed => same worksheet)
     Every random choice that affects the questions MUST use the
     rng passed to build(). Math.random is only for things that
     never change the questions (praise messages, new seeds).
     ============================================================ */
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function rngFromSeed(seed) {
    const s = parseInt(seed, 10);
    return mulberry32(isNaN(s) ? 1 : (s >>> 0));
  }
  function randomSeed() {
    if (global.crypto && typeof global.crypto.getRandomValues === 'function') {
      const buf = new Uint32Array(1);
      global.crypto.getRandomValues(buf);
      return buf[0] % 1000000000;
    }
    return Math.floor(Math.random() * 1000000000);
  }
  Drill.mulberry32 = mulberry32;
  Drill.rngFromSeed = rngFromSeed;
  Drill.randomSeed = randomSeed;

  /* Small helpers drills may use. Each takes the rng explicitly. */
  Drill.pick = (rng, a) => a[Math.floor(rng() * a.length)];
  Drill.shuffle = function (rng, a) {
    a = a.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  };
  Drill.escape = s => String(s).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  /* Render LaTeX with KaTeX (falls back to code text if KaTeX is missing). */
  Drill.tex = function (latex) {
    if (typeof katex === 'undefined') return '<code>' + Drill.escape(latex) + '</code>';
    try {
      return katex.renderToString(latex, { throwOnError: false, displayMode: false });
    } catch (e) {
      return '<code>' + Drill.escape(latex) + '</code>';
    }
  };
  /* The "?" box a student drops an answer into. Every question body needs one. */
  Drill.slot = cls => '<div class="drop-zone' + (cls ? ' ' + cls : '') + '"><div class="qmark">?</div></div>';

  /* ============================================================
     SETTINGS
     Every drill gets "n" (number of questions). Extra settings:
       { key, label, type: 'select',     options: [v | {value,label}], default }
       { key, label, type: 'checkbox',   default: true|false }
       { key, label, type: 'checkboxes', options: [...], default: [values], min: 1 }
     Values are kept in the URL (only when not the default), so a
     shared link reproduces the exact sheet.
     ============================================================ */
  function normSettings(cfg) {
    const counts = cfg.counts || [6, 8, 10, 12, 15];
    const list = [{
      key: 'n', type: 'select', label: 'Questions',
      options: counts.map(v => ({ value: v, label: String(v) })),
      default: cfg.defaultCount || 8
    }];
    (cfg.settings || []).forEach(s => {
      const o = Object.assign({}, s);
      if (o.options) o.options = o.options.map(x => (x !== null && typeof x === 'object') ? x : { value: x, label: String(x) });
      if (o.type === 'select' && o.default === undefined) o.default = o.options[0].value;
      if (o.type === 'checkbox') o.default = !!o.default;
      if (o.type === 'checkboxes') {
        if (!Array.isArray(o.default)) o.default = o.options.map(x => x.value);
        if (o.min === undefined) o.min = 1;
      }
      list.push(o);
    });
    return list;
  }
  function defaultSettings(specs) {
    const s = {};
    specs.forEach(sp => { s[sp.key] = Array.isArray(sp.default) ? sp.default.slice() : sp.default; });
    return s;
  }
  function settingsFromParams(specs, params) {
    const s = defaultSettings(specs);
    specs.forEach(sp => {
      const raw = params.get(sp.key);
      if (raw === null) return;
      if (sp.type === 'select') {
        const m = sp.options.find(o => String(o.value) === raw);
        if (m) s[sp.key] = m.value;
      } else if (sp.type === 'checkbox') {
        s[sp.key] = raw === '1';
      } else if (sp.type === 'checkboxes') {
        const want = raw.split(',');
        const vals = sp.options.filter(o => want.indexOf(String(o.value)) >= 0).map(o => o.value);
        if (vals.length >= sp.min) s[sp.key] = vals;
      }
    });
    return s;
  }
  function settingsToParams(specs, settings, params) {
    specs.forEach(sp => {
      const v = settings[sp.key];
      let str, def;
      if (sp.type === 'checkbox') { str = v ? '1' : '0'; def = sp.default ? '1' : '0'; }
      else if (sp.type === 'checkboxes') { str = v.join(','); def = sp.default.join(','); }
      else { str = String(v); def = String(sp.default); }
      if (str === def) params.delete(sp.key); else params.set(sp.key, str);
    });
  }

  /* ============================================================
     BUILDING QUESTIONS
     build(rng, settings) returns an array of questions:
       { prompt: html, options: [{ ..., ok: true|false }], ... }
     Exactly one option per question has ok: true.
     ============================================================ */
  function buildSheet(cfg, seed, settings) {
    const qs = cfg.build(rngFromSeed(seed), settings) || [];
    qs.forEach(q => {
      if (typeof q.answer === 'number' && q.options && !q.options.some(o => o.ok)) {
        q.options.forEach((o, j) => { o.ok = (j === q.answer); });
      }
    });
    return qs;
  }
  /* For tests: generate a sheet without a browser. */
  Drill.generate = function (cfg, seed, settings) {
    const specs = normSettings(cfg);
    return buildSheet(cfg, seed, Object.assign(defaultSettings(specs), settings || {}));
  };
  Drill.normSettings = normSettings;
  Drill.defaultSettings = defaultSettings;

  /* The HTML for one question's prompt, body and options, using the
     drill's render hooks or the defaults. Shared by the page and tests. */
  function defaultBody(q) {
    return '<div class="diagram">' +
      '<span class="lhs">' + q.lhs + '</span>' +
      '<span class="eq">' + (q.eq !== undefined ? q.eq : '=') + '</span>' +
      Drill.slot() +
    '</div>';
  }
  function questionParts(cfg, q, i) {
    return {
      prompt: cfg.renderPrompt ? cfg.renderPrompt(q, i) : (q.prompt || ''),
      body: cfg.renderBody ? cfg.renderBody(q, i) : defaultBody(q),
      options: q.options.map(o => cfg.renderOption ? cfg.renderOption(o, q) : (o.html !== undefined ? o.html : o.text))
    };
  }
  Drill.questionParts = questionParts;

  /* ============================================================
     DEFINE — the one call a drill page makes
     ============================================================ */
  Drill.define = function (cfg) {
    ['id', 'title', 'build'].forEach(k => {
      if (!cfg[k]) throw new Error('Drill.define: missing "' + k + '"');
    });
    Drill.defined = cfg;
    if (!HAS_DOM) return cfg;              // loaded by the tests in Node
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => start(cfg), { once: true });
    } else {
      start(cfg);
    }
    return cfg;
  };

  /* Show a readable error on the page instead of a blank sheet. */
  Drill.fail = function (title, html) {
    if (!HAS_DOM) throw new Error(title);
    const show = () => {
      const box = '<div class="error-box"><h2>' + Drill.escape(title) + '</h2>' + (html || '') + '</div>';
      const sheet = document.getElementById('sheet');
      if (sheet) sheet.outerHTML = box; else document.body.insertAdjacentHTML('beforeend', box);
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', show, { once: true });
    else show();
  };

  /* ============================================================
     RESULTS CODE
     A short code a student can show or send their teacher, e.g.
     "4K7P-QX9M-2TZ8-A". It packs: which drill, which sheet (seed +
     settings), minutes taken and, for every question, how many
     tries it took (0 = not done, 1, 2, 3 = three or more), plus a
     check value so a mistyped or edited code is spotted. It is a
     deterrent, not security. Teachers decode codes on the drill
     page with "Check codes".
     ============================================================ */
  function fnv(str) {
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
    return h >>> 0;
  }
  const B32 = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';    // Crockford: no I, L, O, U
  const CODE_SALT = 'maths-drills/1:';
  const CODE_VERSION = 1;

  /* Stable text for "this exact sheet": the seed plus non-default settings. */
  function sheetId(specs, seed, settings) {
    const p = new URLSearchParams();
    settingsToParams(specs, settings, p);
    p.sort();
    return seed + '?' + p.toString();
  }
  const drillHash = cfg => fnv(cfg.id) & 1023;
  const sheetHash = (specs, seed, settings) => fnv(sheetId(specs, seed, settings)) & 0xFFFF;

  function encodeResult(r) {       // r = { drill, sheet, minutes, marks: [0..3] }
    let bits = 0n, len = 0;
    const put = (v, w) => { bits = (bits << BigInt(w)) | BigInt(v & ((1 << w) - 1)); len += w; };
    put(CODE_VERSION, 2); put(r.drill, 10); put(r.sheet, 16);
    put(r.marks.length, 5); put(Math.min(63, Math.max(0, r.minutes)), 6);
    r.marks.forEach(m => put(Math.min(3, m), 2));
    put(fnv(CODE_SALT + bits.toString(36) + ':' + len) & 1023, 10);
    const pad = (5 - len % 5) % 5;
    bits <<= BigInt(pad); len += pad;
    let s = '';
    for (let i = len - 5; i >= 0; i -= 5) s += B32[Number((bits >> BigInt(i)) & 31n)];
    return s.replace(/(.{4})(?=.)/g, '$1-');
  }

  function decodeResult(code) {
    const clean = String(code).toUpperCase().replace(/O/g, '0').replace(/[IL]/g, '1').replace(/[^0-9A-Z]/g, '');
    if (clean.length < 10) return null;
    let bits = 0n;
    for (const ch of clean) {
      const v = B32.indexOf(ch);
      if (v < 0) return null;
      bits = (bits << 5n) | BigInt(v);
    }
    const total = clean.length * 5;
    let pos = total;
    const take = w => {
      pos -= w;
      if (pos < 0) throw new Error('short');
      return Number((bits >> BigInt(pos)) & ((1n << BigInt(w)) - 1n));
    };
    try {
      if (take(2) !== CODE_VERSION) return null;
      const drill = take(10), sheet = take(16), n = take(5), minutes = take(6);
      const marks = [];
      for (let i = 0; i < n; i++) marks.push(take(2));
      const dataLen = total - pos;
      const data = bits >> BigInt(pos);
      const check = take(10);
      if (pos >= 5) return null;                         // extra characters
      if ((fnv(CODE_SALT + data.toString(36) + ':' + dataLen) & 1023) !== check) return null;
      return { drill, sheet, minutes, marks };
    } catch (e) {
      return null;
    }
  }
  Drill.encodeResult = encodeResult;
  Drill.decodeResult = decodeResult;

  if (!HAS_DOM) {
    if (typeof module === 'object' && module.exports) module.exports = Drill;
    return;
  }

  /* ============================================================
     EVERYTHING BELOW RUNS IN THE BROWSER ONLY
     ============================================================ */
  const store = {
    get(k) { try { return global.localStorage.getItem('mathsDrills.' + k); } catch (e) { return null; } },
    set(k, v) { try { global.localStorage.setItem('mathsDrills.' + k, v); } catch (e) { /* private mode */ } }
  };
  Drill.store = store;

  const PRAISE = ['Correct! 🎉', 'Yes! Well done.', "That's right! ⭐", 'Great job! 👏', 'Perfect! ✅'];

  let S = null;   // page state
  const $ = id => document.getElementById(id);

  function start(cfg) {
    const params = new URLSearchParams(global.location.search);
    const specs = normSettings(cfg);
    const locked = params.get('lock') === '1';
    let mode = params.get('mode');
    if (locked) mode = 'student';
    else if (mode !== 'teacher' && mode !== 'student') mode = store.get('teacher') === '1' ? 'teacher' : 'student';

    S = {
      cfg, specs, mode, locked,
      settings: settingsFromParams(specs, params),
      seed: null,
      questions: [],
      qState: []
    };

    document.body.classList.add('mode-' + mode);
    if (locked) document.body.classList.add('locked');
    buildChrome();

    const urlSeed = parseInt(params.get('seed'), 10);
    setSeed(isNaN(urlSeed) ? randomSeed() : urlSeed);
    regenerate();
  }

  /* ---------------- toolbar + sheet skeleton ---------------- */
  function settingControl(sp) {
    const id = 'set-' + sp.key;
    if (sp.type === 'select') {
      return '<label>' + sp.label + ' <select id="' + id + '" data-setting="' + sp.key + '">' +
        sp.options.map(o => '<option value="' + Drill.escape(o.value) + '">' + o.label + '</option>').join('') +
        '</select></label>';
    }
    if (sp.type === 'checkbox') {
      return '<label class="chk"><input type="checkbox" id="' + id + '" data-setting="' + sp.key + '"><span>' + sp.label + '</span></label>';
    }
    return '<div class="tb-group" role="group" aria-label="' + Drill.escape(sp.label) + '">' +
      '<span class="group-label">' + sp.label + '</span>' +
      sp.options.map(o =>
        '<label class="chk"><input type="checkbox" id="' + id + '-' + Drill.escape(o.value) + '" data-setting="' + sp.key +
        '" value="' + Drill.escape(o.value) + '"><span>' + o.label + '</span></label>').join('') +
      '</div>';
  }

  function buildChrome() {
    const cfg = S.cfg;
    const tb = document.createElement('header');
    tb.className = 'toolbar no-print';
    tb.id = 'toolbar';
    tb.innerHTML =
      '<a class="tb-home" href="index.html" title="All drills" aria-label="All drills">🏠</a>' +
      '<div class="tb-title">' + (cfg.toolbarTitle || cfg.title) + '</div>' +
      '<label class="teacher-only">Seed <input id="seedInput" type="number" min="0" step="1" inputmode="numeric"></label>' +
      '<div class="tb-settings unlocked-only" id="tbSettings">' + S.specs.map(settingControl).join('') + '</div>' +
      '<button type="button" id="optionsBtn" class="student-only unlocked-only" aria-expanded="false" aria-controls="tbSettings">⚙️<span class="btn-text"> Options</span></button>' +
      '<button type="button" id="regenBtn" class="primary unlocked-only">🎲<span class="btn-text"> New questions</span></button>' +
      '<button type="button" id="resetBtn" class="unlocked-only">↺<span class="btn-text"> Reset</span></button>' +
      '<button type="button" id="printBtn" class="teacher-only">🖨️<span class="btn-text"> Print</span></button>' +
      '<button type="button" id="shareBtn" class="teacher-only">📲<span class="btn-text"> Share to students</span></button>' +
      '<button type="button" id="checkBtn" class="teacher-only">🔎<span class="btn-text"> Check codes</span></button>' +
      '<label class="chk teacher-only"><input type="checkbox" id="answersChk"><span>Show answers</span></label>' +
      '<span class="score-chip" id="scoreTag" aria-live="polite"></span>';
    document.body.insertBefore(tb, document.body.firstChild);

    let sheet = $('sheet');
    if (!sheet) {
      sheet = document.createElement('main');
      sheet.id = 'sheet';
      document.body.appendChild(sheet);
    }
    sheet.classList.add('sheet');

    syncControls();

    $('tbSettings').addEventListener('change', onSettingChange);
    $('optionsBtn').addEventListener('click', () => {
      const open = $('tbSettings').classList.toggle('open');
      $('optionsBtn').setAttribute('aria-expanded', String(open));
    });
    $('regenBtn').addEventListener('click', () => { setSeed(randomSeed()); regenerate(); });
    $('resetBtn').addEventListener('click', resetAnswers);
    $('printBtn').addEventListener('click', () => global.print());
    $('shareBtn').addEventListener('click', openShare);
    $('checkBtn').addEventListener('click', openCheck);
    $('answersChk').addEventListener('change', toggleKey);
    $('seedInput').addEventListener('change', () => { setSeed($('seedInput').value); regenerate(); });
  }

  function syncControls() {
    S.specs.forEach(sp => {
      const v = S.settings[sp.key];
      if (sp.type === 'select') $('set-' + sp.key).value = String(v);
      else if (sp.type === 'checkbox') $('set-' + sp.key).checked = !!v;
      else document.querySelectorAll('[data-setting="' + sp.key + '"]').forEach(cb => {
        cb.checked = v.map(String).indexOf(cb.value) >= 0;
      });
    });
    enforceMinimums();
  }

  /* A checkbox group can't drop below its minimum: lock the last boxes. */
  function enforceMinimums() {
    S.specs.forEach(sp => {
      if (sp.type !== 'checkboxes') return;
      const boxes = [...document.querySelectorAll('[data-setting="' + sp.key + '"]')];
      const checked = boxes.filter(b => b.checked).length;
      boxes.forEach(b => { b.disabled = b.checked && checked <= sp.min; });
    });
  }

  function onSettingChange(e) {
    const key = e.target && e.target.dataset && e.target.dataset.setting;
    if (!key) return;
    const sp = S.specs.find(x => x.key === key);
    if (sp.type === 'select') {
      const m = sp.options.find(o => String(o.value) === e.target.value);
      S.settings[key] = m ? m.value : sp.default;
    } else if (sp.type === 'checkbox') {
      S.settings[key] = e.target.checked;
    } else {
      const on = [...document.querySelectorAll('[data-setting="' + key + '"]')].filter(b => b.checked).map(b => b.value);
      S.settings[key] = sp.options.filter(o => on.indexOf(String(o.value)) >= 0).map(o => o.value);
    }
    enforceMinimums();
    regenerate();          // same seed, new settings
  }

  function setSeed(seed) {
    const s = parseInt(seed, 10);
    S.seed = isNaN(s) ? 1 : s;
    $('seedInput').value = String(S.seed);
  }

  function pageUrl(extra) {
    const url = new URL(global.location.href);
    url.searchParams.set('seed', String(S.seed));
    settingsToParams(S.specs, S.settings, url.searchParams);
    if (extra) Object.keys(extra).forEach(k => {
      if (extra[k] === null) url.searchParams.delete(k); else url.searchParams.set(k, extra[k]);
    });
    return url;
  }
  function updateUrl() {
    try { global.history.replaceState(null, '', pageUrl()); } catch (e) { /* file:// in some browsers */ }
  }

  /* ---------------- render ---------------- */
  function renderQuestion(q, i) {
    const parts = questionParts(S.cfg, q, i);
    const opts = parts.options.map((visual, j) =>
      '<div class="option" data-opt="' + j + '" role="button" tabindex="0" aria-label="Answer ' + LETTERS[j] + '">' +
        (q.hideLetters ? '' : '<span class="opt-letter">' + LETTERS[j] + '</span>') +
        '<span class="opt-visual">' + visual + '</span>' +
      '</div>').join('');
    return '<article class="q" data-q="' + i + '">' +
      '<div class="q-head">' +
        '<span class="q-num">' + (i + 1) + '</span>' +
        '<span class="q-prompt">' + parts.prompt + '</span>' +
      '</div>' +
      '<div class="q-body">' + parts.body + '</div>' +
      '<div class="options">' + opts + '</div>' +
      '<div class="q-feedback" aria-live="polite"></div>' +
    '</article>';
  }

  function regenerate() {
    cancelPress();
    const cfg = S.cfg;
    const sheet = $('sheet');
    try {
      S.questions = buildSheet(cfg, S.seed, S.settings);
    } catch (err) {
      sheet.innerHTML = '<div class="error-box"><h2>Something went wrong making the questions</h2>' +
        '<p>Try <b>New questions</b>. If it keeps happening, copy this message into your AI chat:</p>' +
        '<pre>' + Drill.escape(err && err.stack || err) + '</pre></div>';
      if (global.console) console.error(err);
      return;
    }
    S.qState = S.questions.map(() => ({ solved: false, attempts: 0 }));

    const keyGrid = S.questions.map((q, i) => {
      const idx = q.options.findIndex(o => o.ok);
      return '<span>' + (i + 1) + '. <b>' + (LETTERS[idx] || '?') + '</b></span>';
    }).join('');

    sheet.innerHTML =
      '<header class="sheet-head">' +
        '<h1>' + cfg.title + '</h1>' +
        '<div class="meta">' +
          '<span>Name: <span class="line"></span></span>' +
          '<span>Date: <span class="line short"></span></span>' +
          '<span>Score: <span class="line tiny"></span></span>' +
        '</div>' +
      '</header>' +
      '<p class="instructions">' +
        (cfg.instructions ? cfg.instructions + ' ' : '') +
        '<span class="screen-only">Tap an answer, or press and drag it into the <b>?</b> box. ' +
        'You’ll find out straight away if you’re right.</span>' +
        '<span class="print-only">Write the letter of the correct answer in each box.</span>' +
        ' <span class="seed-note">(Seed: ' + S.seed + ')</span>' +
      '</p>' +
      '<div class="questions">' + S.questions.map(renderQuestion).join('') + '</div>' +
      '<div class="finish-row no-print"><button type="button" class="btn primary" id="finishBtn">✅ I’ve finished</button></div>' +
      '<section class="key" id="keySection">' +
        '<h2>Answer Key</h2>' +
        '<div class="key-grid">' + keyGrid + '</div>' +
      '</section>';
    $('finishBtn').addEventListener('click', () => openSummary(false));

    S.startedAt = Date.now();
    S.finished = false;
    restoreProgress();
    toggleKey();
    updateScore();
    updateUrl();
    fitAll();
    if (typeof S.cfg.afterRender === 'function') S.cfg.afterRender(sheet);
  }

  /* ------------------------------------------------------------
     Shrink-to-fit: a long number or a tall fraction that is wider
     than its box is scaled down (to no less than FIT_MIN of its
     size) rather than cut off. Re-run on resize, after fonts
     load, and cleared while printing so print sizes apply.
     ------------------------------------------------------------ */
  const FIT_SEL = '.lhs, .opt-visual, .sequence, .qmark.filled';
  const FIT_MIN = 0.55;
  function fit(el) {
    el.style.fontSize = '';
    if (el.scrollWidth <= el.clientWidth + 1) return;
    const base = parseFloat(global.getComputedStyle(el).fontSize);
    let size = base;
    for (let i = 0; i < 3 && el.scrollWidth > el.clientWidth + 1; i++) {
      size = Math.max(base * FIT_MIN, size * (el.clientWidth / el.scrollWidth) * 0.97);
      el.style.fontSize = size.toFixed(1) + 'px';
      if (size <= base * FIT_MIN) break;
    }
  }
  function fitAll() {
    const sheet = $('sheet');
    if (sheet) sheet.querySelectorAll(FIT_SEL).forEach(fit);
  }
  let fitTimer = 0;
  global.addEventListener('resize', () => { clearTimeout(fitTimer); fitTimer = setTimeout(fitAll, 120); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitAll);
  global.addEventListener('beforeprint', () => {
    document.querySelectorAll(FIT_SEL).forEach(el => { el.style.fontSize = ''; });
  });
  global.addEventListener('afterprint', fitAll);

  function toggleKey() {
    const key = $('keySection');
    if (key) key.style.display = (S.mode === 'teacher' && $('answersChk').checked) ? '' : 'none';
  }

  function updateScore() {
    const solved = S.qState.filter(s => s.solved).length;
    $('scoreTag').textContent = solved + ' / ' + S.qState.length + ' correct';
  }

  /* ---------------- answering ---------------- */
  function choose(qEl, idx) {
    if (qEl.dataset.locked === '1') return;
    const qi = parseInt(qEl.dataset.q, 10);
    const q = S.questions[qi];
    const opt = qEl.querySelector('.option[data-opt="' + idx + '"]');
    if (!q || !opt) return;
    qEl.querySelectorAll('.option').forEach(o => o.classList.remove('correct', 'wrong'));
    const state = S.qState[qi];
    state.attempts++;
    const ok = !!q.options[idx].ok;
    const slot = qEl.querySelector('.drop-zone .qmark');
    if (slot) {
      const vis = opt.querySelector('.opt-visual');
      slot.innerHTML = vis ? vis.innerHTML : '';
      slot.classList.add('filled');
      fit(slot);
    }
    if (ok) {
      markSolved(qEl, idx, PRAISE[Math.floor(Math.random() * PRAISE.length)]);
    } else {
      opt.classList.add('wrong');
      setFeedback(qEl, 'no', 'Not quite — try again!');
    }
    updateScore();
    saveProgress();
    if (ok && !S.finished && S.qState.every(s => s.solved)) {
      S.finished = true;
      saveProgress();
      celebrate().then(() => openSummary(true));
    }
  }

  function markSolved(qEl, idx, msg) {
    const qi = parseInt(qEl.dataset.q, 10);
    S.qState[qi].solved = true;
    qEl.dataset.locked = '1';
    qEl.classList.add('solved');
    const opt = qEl.querySelector('.option[data-opt="' + idx + '"]');
    if (opt) opt.classList.add('correct');
    const slot = qEl.querySelector('.drop-zone .qmark');
    const vis = opt && opt.querySelector('.opt-visual');
    if (slot && vis && !slot.classList.contains('filled')) {
      slot.innerHTML = vis.innerHTML;
      slot.classList.add('filled');
      fit(slot);
    }
    setFeedback(qEl, 'ok', msg);
  }

  function setFeedback(qEl, cls, msg) {
    const fb = qEl.querySelector('.q-feedback');
    if (!fb) return;
    fb.className = 'q-feedback' + (cls ? ' ' + cls : '');
    fb.textContent = msg || '';
  }

  function resetAnswers() {
    cancelPress();
    document.querySelectorAll('.q').forEach(qEl => {
      delete qEl.dataset.locked;
      qEl.classList.remove('solved');
      qEl.querySelectorAll('.option').forEach(o => o.classList.remove('correct', 'wrong'));
      const slot = qEl.querySelector('.drop-zone .qmark');
      if (slot) { slot.textContent = '?'; slot.classList.remove('filled'); slot.style.fontSize = ''; }
      setFeedback(qEl, '', '');
    });
    S.qState = S.qState.map(() => ({ solved: false, attempts: 0 }));
    S.startedAt = Date.now();
    S.finished = false;
    clearProgress();
    updateScore();
  }

  /* ============================================================
     SAVED PROGRESS
     Answers are kept in this browser for each exact sheet, so a
     refresh or an accidental swipe back doesn't lose a student's
     work. Only the most recent sheets are kept.
     ============================================================ */
  const MAX_SAVED = 30;
  function progressKey() {
    return 'progress.' + S.cfg.id + '.' + sheetId(S.specs, S.seed, S.settings);
  }
  function saveProgress() {
    const key = progressKey();
    store.set(key, JSON.stringify({
      t: S.startedAt,
      f: S.finished ? 1 : 0,
      q: S.qState.map(s => [s.solved ? 1 : 0, s.attempts])
    }));
    let keys = [];
    try { keys = JSON.parse(store.get('progressKeys') || '[]'); } catch (e) { keys = []; }
    keys = keys.filter(k => k !== key).concat(key);
    while (keys.length > MAX_SAVED) {
      try { global.localStorage.removeItem('mathsDrills.' + keys.shift()); } catch (e) { keys.shift(); }
    }
    store.set('progressKeys', JSON.stringify(keys));
  }
  function clearProgress() {
    try { global.localStorage.removeItem('mathsDrills.' + progressKey()); } catch (e) { /* storage blocked */ }
  }
  function restoreProgress() {
    let saved = null;
    try { saved = JSON.parse(store.get(progressKey()) || 'null'); } catch (e) { saved = null; }
    if (!saved || !Array.isArray(saved.q) || saved.q.length !== S.questions.length) return;
    S.startedAt = saved.t || S.startedAt;
    S.finished = !!saved.f;
    saved.q.forEach(([solved, attempts], i) => {
      S.qState[i].attempts = attempts || 0;
      if (!solved) return;
      const qEl = document.querySelector('.q[data-q="' + i + '"]');
      const idx = S.questions[i].options.findIndex(o => o.ok);
      if (qEl && idx >= 0) markSolved(qEl, idx, 'Correct!');
    });
  }

  /* ============================================================
     END OF SHEET — a short celebration, then the summary
     ============================================================ */
  function celebrate() {
    const reduce = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !document.createElement('canvas').getContext) return Promise.resolve();
    return new Promise(resolve => {
      const c = document.createElement('canvas');
      c.className = 'confetti';
      const dpr = Math.min(2, global.devicePixelRatio || 1);
      const W = global.innerWidth, H = global.innerHeight;
      c.width = W * dpr; c.height = H * dpr;
      document.body.appendChild(c);
      const ctx = c.getContext('2d');
      ctx.scale(dpr, dpr);
      const colours = ['#2563eb', '#16a34a', '#f59e0b', '#ef4444', '#a855f7', '#14b8a6'];
      const bits = [];
      for (let i = 0; i < 90; i++) {
        bits.push({
          x: W / 2 + (Math.random() - 0.5) * W * 0.3, y: H * 0.35,
          vx: (Math.random() - 0.5) * 14, vy: -6 - Math.random() * 9,
          r: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.3,
          w: 6 + Math.random() * 6, h: 4 + Math.random() * 4,
          c: colours[i % colours.length]
        });
      }
      const t0 = performance.now();
      const DURATION = 1500;
      (function frame(now) {
        const t = now - t0;
        ctx.clearRect(0, 0, W, H);
        ctx.globalAlpha = Math.max(0, 1 - Math.max(0, t - DURATION * 0.6) / (DURATION * 0.4));
        bits.forEach(b => {
          b.vy += 0.35; b.vx *= 0.99; b.x += b.vx; b.y += b.vy; b.r += b.vr;
          ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.r);
          ctx.fillStyle = b.c; ctx.fillRect(-b.w / 2, -b.h / 2, b.w, b.h);
          ctx.restore();
        });
        if (t < DURATION) global.requestAnimationFrame(frame);
        else { c.remove(); resolve(); }
      })(t0);
    });
  }

  function formatTime(ms) {
    const s = Math.max(0, Math.round(ms / 1000));
    return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  }

  /* 0 = not solved, 1 = first try, 2 = second try, 3 = three or more */
  const markOf = s => (!s.solved ? 0 : Math.min(3, s.attempts));

  function currentResult() {
    return {
      drill: drillHash(S.cfg),
      sheet: sheetHash(S.specs, S.seed, S.settings),
      minutes: Math.round((Date.now() - S.startedAt) / 60000),
      marks: S.qState.map(markOf)
    };
  }

  function markHTML(m, i) {
    const label = ['not done', 'right first time', 'right on the 2nd try', 'right after 3+ tries'][m];
    return '<li class="mk mk-' + m + '" title="Q' + (i + 1) + ': ' + label + '">' +
      '<span class="mk-n">' + (i + 1) + '</span><span class="mk-s">' + (m === 0 ? '–' : m === 1 ? '✓' : '✓' + m) + '</span></li>';
  }

  function openSummary(complete) {
    let dlg = $('summaryDlg');
    if (!dlg) {
      dlg = document.createElement('dialog');
      dlg.id = 'summaryDlg';
      dlg.className = 'dlg';
      dlg.innerHTML =
        '<div class="dlg-body">' +
          '<h2 id="sumTitle"></h2>' +
          '<label class="sum-name">Your name <input id="sumName" maxlength="40" autocomplete="name"></label>' +
          '<div class="sum-stats">' +
            '<div><b id="sumScore"></b><span>correct</span></div>' +
            '<div><b id="sumFirst"></b><span>right first time</span></div>' +
            '<div><b id="sumTime"></b><span>time taken</span></div>' +
          '</div>' +
          '<ol class="sum-marks" id="sumMarks" aria-label="Each question"></ol>' +
          '<p class="sum-code">Results code <b id="sumCode"></b></p>' +
          '<p class="sum-help">Show this to your teacher, or press <b>Copy results</b> and send it to them.</p>' +
          '<div class="dlg-actions">' +
            '<button type="button" class="btn" id="sumCopy">Copy results</button>' +
            '<button type="button" class="btn primary" id="sumClose">Back to the sheet</button>' +
          '</div>' +
        '</div>';
      document.body.appendChild(dlg);
      $('sumName').value = store.get('name') || '';
      $('sumName').addEventListener('input', () => store.set('name', $('sumName').value.trim()));
      $('sumClose').addEventListener('click', () => closeDialog(dlg));
      $('sumCopy').addEventListener('click', () => {
        const r = currentResult();
        const solved = r.marks.filter(m => m > 0).length;
        const text = ($('sumName').value.trim() || 'No name') + ' — ' + stripTags(S.cfg.title) +
          ' — ' + solved + '/' + r.marks.length + ' correct, ' + r.marks.filter(m => m === 1).length +
          ' first time — ' + $('sumTime').textContent + ' — code ' + $('sumCode').textContent;
        copyText(text, $('sumCopy'));
      });
    }
    const r = currentResult();
    const solved = r.marks.filter(m => m > 0).length;
    $('sumTitle').textContent = complete ? 'Sheet complete! 🎉' :
      (solved === r.marks.length ? 'All done! 🎉' : 'You’ve answered ' + solved + ' of ' + r.marks.length);
    $('sumScore').textContent = solved + ' / ' + r.marks.length;
    $('sumFirst').textContent = r.marks.filter(m => m === 1).length;
    $('sumTime').textContent = formatTime(Date.now() - S.startedAt);
    $('sumMarks').innerHTML = r.marks.map(markHTML).join('');
    $('sumCode').textContent = encodeResult(r);
    showDialog(dlg);
  }

  /* ============================================================
     CHECK CODES (teacher mode) — decode students' results codes
     for the sheet that is open.
     ============================================================ */
  function openCheck() {
    let dlg = $('checkDlg');
    if (!dlg) {
      dlg = document.createElement('dialog');
      dlg.id = 'checkDlg';
      dlg.className = 'dlg dlg-wide';
      dlg.innerHTML =
        '<div class="dlg-body">' +
          '<h2>Check results codes</h2>' +
          '<p>Paste or type students’ codes, one per line (copied messages are fine — the codes are found in the text). ' +
          'They are checked against the sheet that is open now.</p>' +
          '<textarea id="checkInput" rows="5" spellcheck="false" placeholder="4K7P-QX9M-2TZ8-A"></textarea>' +
          '<div id="checkOut"></div>' +
          '<div class="dlg-actions">' +
            '<button type="button" class="btn" id="checkRun">Check</button>' +
            '<button type="button" class="btn primary" id="checkClose">Done</button>' +
          '</div>' +
        '</div>';
      document.body.appendChild(dlg);
      $('checkClose').addEventListener('click', () => closeDialog(dlg));
      $('checkRun').addEventListener('click', runCheck);
    }
    showDialog(dlg);
  }

  function runCheck() {
    const lines = $('checkInput').value.split(/\n+/).map(l => l.trim()).filter(Boolean);
    const myDrill = drillHash(S.cfg), mySheet = sheetHash(S.specs, S.seed, S.settings);
    const rows = lines.map(line => {
      /* A code as shown (groups of 4 joined by "-"), else the longest run of
         letters and digits (a code typed without dashes). */
      const dashed = line.match(/\b[0-9A-Z]{4}(?:-[0-9A-Z]{1,4}){2,5}\b/gi);
      const runs = (line.match(/[0-9A-Z]{10,}/gi) || []).sort((a, b) => b.length - a.length);
      const code = dashed ? dashed[dashed.length - 1] : (runs[0] || line);
      const who = line.replace(code, '').split('—')[0].replace(/code\s*$/i, '').trim().slice(0, 40);
      const r = decodeResult(code);
      let status = '';
      if (!r) status = '<span class="bad">Not a valid code — check for typos</span>';
      else if (r.drill !== myDrill) status = '<span class="bad">From a different drill</span>';
      else if (r.sheet !== mySheet) status = '<span class="warn-t">A different sheet (other seed or settings)</span>';
      const body = r ? (
        '<td>' + r.marks.filter(x => x > 0).length + ' / ' + r.marks.length + '</td>' +
        '<td>' + r.marks.filter(x => x === 1).length + '</td>' +
        '<td>' + (r.minutes >= 63 ? '63+' : r.minutes) + ' min</td>' +
        '<td><ol class="sum-marks small">' + r.marks.map(markHTML).join('') + '</ol>' + status + '</td>'
      ) : '<td colspan="4">' + status + '</td>';
      return '<tr><td>' + Drill.escape(who || '—') + '<div class="code">' + Drill.escape(code) + '</div></td>' + body + '</tr>';
    });
    $('checkOut').innerHTML = rows.length
      ? '<div class="table-wrap"><table class="check-table"><thead><tr><th>Student</th><th>Correct</th><th>First time</th><th>Time</th><th>Questions</th></tr></thead><tbody>' +
        rows.join('') + '</tbody></table></div>'
      : '';
  }

  /* ---------------- small dialog helpers ---------------- */
  function showDialog(dlg) { if (dlg.showModal) { if (!dlg.open) dlg.showModal(); } else dlg.setAttribute('open', ''); }
  function closeDialog(dlg) { if (dlg.close) dlg.close(); else dlg.removeAttribute('open'); }
  function stripTags(html) { const d = document.createElement('div'); d.innerHTML = html; return d.textContent; }
  function copyText(text, btn) {
    const done = () => { const old = btn.textContent; btn.textContent = 'Copied ✓'; setTimeout(() => { btn.textContent = old; }, 1500); };
    const fallback = () => {
      const ta = document.createElement('textarea');
      ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { if (document.execCommand('copy')) done(); } catch (e) { /* ignore */ }
      ta.remove();
    };
    if (navigator.clipboard && global.isSecureContext) navigator.clipboard.writeText(text).then(done, fallback);
    else fallback();
  }

  /* ============================================================
     TAP AND DRAG
     ------------------------------------------------------------
     - Tap (or click) an answer to choose it.
     - Mouse/pen: drag straight away.
     - Touch: press and hold briefly (HOLD_MS) to pick an answer
       up, then drag. A quick swipe that starts on an answer
       scrolls the page as normal, so a sheet full of answer
       cards can still be scrolled on an iPad.
     - The dragged copy floats above the finger so it isn't
       hidden, and is positioned in page coordinates so it stays
       put when the page is zoomed or auto-scrolls.
     - Dropping anywhere near the ? box counts (HIT_PAD), using
       the box's position measured when the drag starts.
     - The page scrolls by itself when dragging near the top or
       bottom edge.
     ============================================================ */
  const HOLD_MS = 110;
  const TOUCH_SLOP = 10;
  const MOUSE_SLOP = 6;
  const HIT_PAD = { touch: 36, mouse: 16 };
  const LIFT = 56;                 // px the ghost floats above a finger
  const EDGE = 64;                 // auto-scroll zone height
  const MAX_SCROLL = 16;           // px per frame

  let press = null;

  function onPointerDown(e) {
    if (press) return;                                      // ignore a second finger
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    const opt = e.target && e.target.closest ? e.target.closest('.option') : null;
    if (!opt) return;
    const qEl = opt.closest('.q');
    if (!qEl || qEl.dataset.locked === '1') return;
    const touch = e.pointerType === 'touch';
    press = {
      opt, qEl, id: e.pointerId, touch,
      x0: e.clientX, y0: e.clientY, cx: e.clientX, cy: e.clientY,
      armed: !touch, dragging: false, timer: 0, ghost: null, zone: null, rect: null, over: false, raf: 0
    };
    if (touch) press.timer = setTimeout(arm, HOLD_MS);
    else { try { opt.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ } }
  }

  function arm() {
    if (!press || press.dragging) return;
    press.armed = true;
    press.opt.classList.add('lifted');
  }

  function moved(p) { return Math.hypot(p.cx - p.x0, p.cy - p.y0); }

  function onPointerMove(e) {
    if (!press || e.pointerId !== press.id) return;
    press.cx = e.clientX; press.cy = e.clientY;
    if (!press.dragging) {
      if (!press.armed) {
        if (moved(press) > TOUCH_SLOP) cancelPress();       // a swipe: let the page scroll
        return;
      }
      if (moved(press) < (press.touch ? 3 : MOUSE_SLOP)) return;
      beginDrag();
    }
    trackDrag();
  }

  /* While an answer is held, stop the finger from scrolling the page. */
  function onTouchMove(e) {
    if (press && press.armed) e.preventDefault();
  }

  function beginDrag() {
    const p = press;
    p.dragging = true;
    clearTimeout(p.timer);
    p.zone = p.qEl.querySelector('.drop-zone');
    if (p.zone) {
      const r = p.zone.getBoundingClientRect();
      p.rect = { left: r.left + global.scrollX, top: r.top + global.scrollY, right: r.right + global.scrollX, bottom: r.bottom + global.scrollY };
    }
    const g = document.createElement('div');
    g.className = 'drag-ghost';
    const src = p.opt.querySelector('.opt-visual');
    g.innerHTML = src ? src.innerHTML : '';
    document.body.appendChild(g);
    p.ghost = g;
    p.opt.classList.remove('lifted');
    p.opt.classList.add('dragging');
    p.qEl.classList.add('drag-source');
    document.body.classList.add('dragging-active');
    p.raf = global.requestAnimationFrame(autoScroll);
  }

  function distToRect(x, y, r) {
    const dx = Math.max(r.left - x, 0, x - r.right);
    const dy = Math.max(r.top - y, 0, y - r.bottom);
    return Math.hypot(dx, dy);
  }

  function trackDrag() {
    const p = press;
    const px = p.cx + global.scrollX;
    const py = p.cy + global.scrollY;
    const gy = p.touch ? py - LIFT : py;
    p.ghost.style.left = px + 'px';
    p.ghost.style.top = gy + 'px';
    const pad = p.touch ? HIT_PAD.touch : HIT_PAD.mouse;
    const over = !!p.rect && (distToRect(px, gy, p.rect) <= pad || distToRect(px, py, p.rect) <= pad);
    if (over !== p.over) {
      p.over = over;
      p.zone.classList.toggle('over', over);
    }
  }

  function autoScroll() {
    if (!press || !press.dragging) return;
    const tb = $('toolbar');
    const top = (tb ? tb.getBoundingClientRect().bottom : 0) + EDGE;
    const bottom = global.innerHeight - EDGE;
    let v = 0;
    if (press.cy < top) v = -MAX_SCROLL * Math.min(1, (top - press.cy) / EDGE);
    else if (press.cy > bottom) v = MAX_SCROLL * Math.min(1, (press.cy - bottom) / EDGE);
    if (v) { global.scrollBy(0, v); trackDrag(); }
    press.raf = global.requestAnimationFrame(autoScroll);
  }

  function onPointerUp(e) {
    if (!press || e.pointerId !== press.id) return;
    const p = press;
    const drop = p.dragging && p.over;
    const tap = !p.dragging && moved(p) <= (p.touch ? TOUCH_SLOP : MOUSE_SLOP);
    cancelPress();
    if (drop || tap) choose(p.qEl, parseInt(p.opt.dataset.opt, 10));
  }

  function cancelPress() {
    const p = press;
    if (!p) return;
    press = null;
    clearTimeout(p.timer);
    if (p.raf) global.cancelAnimationFrame(p.raf);
    if (p.ghost) p.ghost.remove();
    if (p.zone) p.zone.classList.remove('over');
    p.opt.classList.remove('lifted', 'dragging');
    p.qEl.classList.remove('drag-source');
    document.body.classList.remove('dragging-active');
    try { p.opt.releasePointerCapture(p.id); } catch (err) { /* ignore */ }
  }

  document.addEventListener('pointerdown', onPointerDown);
  global.addEventListener('pointermove', onPointerMove);
  global.addEventListener('pointerup', onPointerUp);
  global.addEventListener('pointercancel', cancelPress);
  document.addEventListener('touchmove', onTouchMove, { passive: false });
  global.addEventListener('resize', cancelPress);
  global.addEventListener('orientationchange', cancelPress);
  global.addEventListener('blur', cancelPress);
  /* No long-press menu or text selection on answer cards (iOS). */
  document.addEventListener('contextmenu', e => {
    if (e.target && e.target.closest && e.target.closest('.option')) e.preventDefault();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { cancelPress(); return; }
    if (e.key !== 'Enter' && e.key !== ' ' && e.key !== 'Spacebar') return;
    const opt = e.target && e.target.closest ? e.target.closest('.option') : null;
    if (!opt) return;
    e.preventDefault();
    const qEl = opt.closest('.q');
    if (qEl) choose(qEl, parseInt(opt.dataset.opt, 10));
  });

  /* ============================================================
     SHARE TO STUDENTS (teacher mode)
     A link and QR code for this exact sheet, in locked student
     mode: no answers, no seed, no settings.
     ============================================================ */
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = () => reject(new Error('Could not load ' + src));
      document.head.appendChild(s);
    });
  }

  function openShare() {
    let dlg = $('shareDlg');
    if (!dlg) {
      dlg = document.createElement('dialog');
      dlg.id = 'shareDlg';
      dlg.className = 'dlg';
      dlg.innerHTML =
        '<div class="dlg-body">' +
          '<h2>Share this sheet with students</h2>' +
          '<p>Students scan the code with their iPad camera, or open the link. They get exactly these questions, with the answers and settings hidden.</p>' +
          '<p class="warn" id="shareWarn" hidden>This page is open from a file on this computer, so the link only works here. Open the drill from the website to share it.</p>' +
          '<div class="qr" id="shareQr"></div>' +
          '<div class="link-row"><input id="shareUrl" readonly aria-label="Student link"><button type="button" class="btn" id="copyBtn">Copy</button></div>' +
          '<div class="dlg-actions"><button type="button" class="btn primary" id="closeShare">Done</button></div>' +
        '</div>';
      document.body.appendChild(dlg);
      $('closeShare').addEventListener('click', () => dlg.close ? dlg.close() : dlg.removeAttribute('open'));
      $('copyBtn').addEventListener('click', () => {
        const input = $('shareUrl');
        input.select();
        const done = () => { $('copyBtn').textContent = 'Copied'; setTimeout(() => { $('copyBtn').textContent = 'Copy'; }, 1500); };
        if (navigator.clipboard) navigator.clipboard.writeText(input.value).then(done, () => document.execCommand('copy') && done());
        else if (document.execCommand('copy')) done();
      });
    }
    const url = pageUrl({ lock: '1', mode: null }).href;
    $('shareUrl').value = url;
    $('shareWarn').hidden = global.location.protocol !== 'file:';
    $('shareQr').innerHTML = '';
    const draw = () => {
      const qr = global.qrcode(0, 'M');
      qr.addData(url);
      qr.make();
      $('shareQr').innerHTML = qr.createSvgTag({ cellSize: 6, margin: 2, scalable: true, alt: 'QR code for the student link' });
    };
    (typeof global.qrcode === 'function' ? Promise.resolve() : loadScript(BASE + 'vendor/qrcode.js'))
      .then(draw)
      .catch(() => { $('shareQr').textContent = 'QR code unavailable — use the link instead.'; });
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
  }
})(typeof window !== 'undefined' ? window : globalThis);
