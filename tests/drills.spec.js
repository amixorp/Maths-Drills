// Browser checks for every drill page. Run with: npx playwright test
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const NOT_DRILLS = new Set(['index.html', 'worksheets.html']);
const DRILLS = fs.readdirSync(ROOT)
  .filter(f => f.endsWith('.html') && !NOT_DRILLS.has(f))
  .filter(f => /Drill\.define\s*\(/.test(fs.readFileSync(path.join(ROOT, f), 'utf8')))
  .sort();
const url = (file, query = '') => 'file:///' + path.join(ROOT, file).split(path.sep).join('/') + query;

/* Collect uncaught errors so every test can assert there were none. */
function watchErrors(page) {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  return errors;
}

test.describe('site', () => {
  test('index.html links to every drill, and every link works', async () => {
    const index = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
    const links = [...index.matchAll(/href="([^"#?]+\.html)"/g)].map(m => m[1]);
    for (const l of links) expect(fs.existsSync(path.join(ROOT, l)), 'broken link ' + l).toBe(true);
    for (const d of DRILLS) {
      if (d.startsWith('_')) continue;             // _template.html is not a real drill
      expect(links, d + ' is not linked from index.html').toContain(d);
    }
  });
});

for (const file of DRILLS) {
  test.describe(file, () => {
    test('loads with no errors and fits the screen', async ({ page }) => {
      const errors = watchErrors(page);
      await page.goto(url(file, '?seed=42'));
      await expect(page.locator('.q').first()).toBeVisible();
      const n = await page.locator('.q').count();
      expect(n).toBeGreaterThan(0);
      await expect(page.locator('#scoreTag')).toHaveText('0 / ' + n + ' correct');
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow, 'page scrolls sideways').toBeLessThanOrEqual(0);
      // student mode: no answers or teacher controls
      await expect(page.locator('#keySection')).toBeHidden();
      await expect(page.locator('#seedInput')).toBeHidden();
      await expect(page.locator('#printBtn')).toBeHidden();
      expect(errors).toEqual([]);
    });

    test('tapping the right answer and a wrong answer', async ({ page }, info) => {
      const errors = watchErrors(page);
      await page.goto(url(file, '?seed=7&mode=teacher'));
      await expect(page.locator('.q').first()).toBeVisible();
      const n = await page.locator('.q').count();
      // The answer key says which letter is right for question 1.
      const letter = (await page.locator('.key-grid b').first().textContent()).trim();
      const right = 'ABCDEFGH'.indexOf(letter);
      const q1 = page.locator('.q[data-q="0"]');
      const wrong = right === 0 ? 1 : 0;
      const tap = info.project.use.hasTouch ? 'tap' : 'click';
      await q1.locator('.option[data-opt="' + wrong + '"]')[tap]();
      await expect(q1.locator('.q-feedback')).toHaveClass(/no/);
      await expect(page.locator('#scoreTag')).toHaveText('0 / ' + n + ' correct');
      await q1.locator('.option[data-opt="' + right + '"]')[tap]();
      await expect(q1.locator('.q-feedback')).toHaveClass(/ok/);
      await expect(q1.locator('.qmark')).toHaveClass(/filled/);
      await expect(page.locator('#scoreTag')).toHaveText('1 / ' + n + ' correct');
      // A solved question can't be changed.
      await q1.locator('.option[data-opt="' + wrong + '"]')[tap]();
      await expect(q1.locator('.q-feedback')).toHaveClass(/ok/);
      // Reset clears it.
      await page.locator('#resetBtn').click();
      await expect(page.locator('#scoreTag')).toHaveText('0 / ' + n + ' correct');
      expect(errors).toEqual([]);
    });

    test('same seed and settings give the same sheet; share link locks it', async ({ page, browser }) => {
      await page.goto(url(file, '?seed=1234&mode=teacher'));
      await expect(page.locator('.q').first()).toBeVisible();
      // change the first extra setting, if there is one, to prove settings travel in the link
      const extra = page.locator('#tbSettings [data-setting]:not([data-setting="n"])').first();
      if (await extra.count()) {
        const tag = await extra.evaluate(e => e.tagName);
        if (tag === 'SELECT') {
          const values = await extra.locator('option').evaluateAll(os => os.map(o => o.value));
          await extra.selectOption(values[values.length - 1]);
        } else if (!(await extra.isDisabled())) {
          await extra.click();
        }
      }
      const sheet = () => page.locator('.questions').innerHTML();
      const before = await sheet();
      await page.reload();
      await expect(page.locator('.q').first()).toBeVisible();
      expect(await sheet(), 'reload changed the sheet').toBe(before);

      await page.locator('#shareBtn').click();
      await expect(page.locator('#shareQr svg')).toBeVisible();
      const link = await page.locator('#shareUrl').inputValue();
      expect(link).toContain('lock=1');
      const student = await browser.newPage();
      await student.goto(link);
      await expect(student.locator('.q').first()).toBeVisible();
      expect(await student.locator('.questions').innerHTML(), 'student sheet differs').toBe(before);
      for (const id of ['#seedInput', '#printBtn', '#answersChk', '#regenBtn', '#optionsBtn', '#keySection']) {
        await expect(student.locator(id), id + ' visible to student').toBeHidden();
      }
      await student.close();
    });

    test('print layout hides the toolbar and the answers', async ({ page }) => {
      await page.goto(url(file, '?seed=5&mode=teacher'));
      await expect(page.locator('.q').first()).toBeVisible();
      await page.emulateMedia({ media: 'print' });
      await expect(page.locator('#toolbar')).toBeHidden();
      await expect(page.locator('#keySection')).toBeHidden();
      await expect(page.locator('.q-feedback').first()).toBeHidden();
    });
  });
}
