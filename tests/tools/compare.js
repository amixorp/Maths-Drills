/*
 * Compare two snapshot folders made by snapshot.js.
 *   node tools/compare.js <beforeDir> <afterDir> [drillFile ...]
 * Exits non-zero if any recorded sheet differs.
 */
'use strict';
const fs = require('fs');
const path = require('path');

const [beforeDir, afterDir, ...only] = process.argv.slice(2);
const files = only.length
  ? only.map(f => f.replace(/\.html$/, '.json'))
  : fs.readdirSync(afterDir).filter(f => f.endsWith('.json'));

let bad = 0;
for (const f of files) {
  const a = JSON.parse(fs.readFileSync(path.join(beforeDir, f), 'utf8'));
  const b = JSON.parse(fs.readFileSync(path.join(afterDir, f), 'utf8'));
  let diffs = 0, first = null;
  a.runs.forEach((ra, i) => {
    const rb = b.runs[i];
    const sa = JSON.stringify(ra.sheet), sb = JSON.stringify(rb && rb.sheet);
    if (sa !== sb) {
      diffs++;
      if (!first) {
        const qa = ra.sheet.questions, qb = rb ? rb.sheet.questions : [];
        const qi = qa.findIndex((q, k) => JSON.stringify(q) !== JSON.stringify(qb[k]));
        first = { settings: ra.settings, seed: ra.seed, question: qi,
          before: qi >= 0 ? qa[qi] : ra.sheet.key, after: qi >= 0 ? qb[qi] : rb && rb.sheet.key };
      }
    }
  });
  console.log(f.padEnd(40), diffs ? 'DIFFERENT in ' + diffs + ' / ' + a.runs.length + ' runs' : 'identical (' + a.runs.length + ' runs)');
  if (first) console.log(JSON.stringify(first, null, 1).slice(0, 3000));
  if (diffs) bad++;
}
process.exit(bad ? 1 : 0);
