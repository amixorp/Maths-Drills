// End of sheet: summary, results code, saved progress, and the teacher's "Check codes".
const { test, expect } = require('@playwright/test');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const url = (file, query = '') => 'file:///' + path.join(ROOT, file).split(path.sep).join('/') + query;

for (const file of ['Multiplication_Drill_1.html', 'Indices.html', 'Shape_Pattern_Recognition_V3.html']) {
  test(file + ': finish a shared sheet, get a code, teacher checks it', async ({ page }, info) => {
    const tap = info.project.use.hasTouch ? 'tap' : 'click';
    await page.goto(url(file, '?seed=321&n=8&mode=teacher'));
    await expect(page.locator('.q').first()).toBeVisible();
    const key = await page.locator('.key-grid b').evaluateAll(bs => bs.map(b => 'ABCDEFGH'.indexOf(b.textContent.trim())));
    const shared = url(file, '?seed=321&n=8&lock=1');

    // Student: one wrong try on Q1, then everything right, with a reload part-way.
    await page.goto(shared);
    await expect(page.locator('.q').first()).toBeVisible();
    await expect(page.locator('#resetBtn')).toBeHidden();
    const opt = (q, i) => page.locator('.q[data-q="' + q + '"] .option[data-opt="' + i + '"]');
    await opt(0, (key[0] + 1) % 4)[tap]();
    await opt(0, key[0])[tap]();
    await page.reload();
    await expect(page.locator('#scoreTag')).toHaveText('1 / 8 correct');
    await expect(page.locator('.q[data-q="0"] .qmark')).toHaveClass(/filled/);
    for (let i = 1; i < key.length; i++) await opt(i, key[i])[tap]();

    const summary = page.locator('#summaryDlg');
    await expect(summary).toBeVisible({ timeout: 5000 });
    await expect(page.locator('#sumTitle')).toContainText('complete');
    await expect(page.locator('#sumScore')).toHaveText('8 / 8');
    await expect(page.locator('#sumFirst')).toHaveText('7');
    const code = (await page.locator('#sumCode').textContent()).trim();
    expect(code).toMatch(/^[0-9A-Z]{4}(-[0-9A-Z]{1,4})+$/);
    await page.locator('#sumClose').click();
    await expect(summary).toBeHidden();

    // Teacher: same sheet decodes; a different sheet is flagged.
    await page.goto(url(file, '?seed=321&n=8&mode=teacher'));
    await page.locator('#checkBtn').click();
    await page.locator('#checkInput').fill('Sam — code ' + code + '\nNOT-A-REAL-CODE1');
    await page.locator('#checkRun').click();
    const rows = page.locator('.check-table tbody tr');
    await expect(rows).toHaveCount(2);
    await expect(rows.nth(0)).toContainText('8 / 8');
    await expect(rows.nth(0)).not.toContainText('different');
    await expect(rows.nth(1)).toContainText('Not a valid code');

    await page.goto(url(file, '?seed=322&n=8&mode=teacher'));
    await page.locator('#checkBtn').click();
    await page.locator('#checkInput').fill(code);
    await page.locator('#checkRun').click();
    await expect(page.locator('.check-table tbody tr').first()).toContainText('different sheet');
  });
}

test('the "I\'ve finished" button shows a part-done summary', async ({ page }, info) => {
  const tap = info.project.use.hasTouch ? 'tap' : 'click';
  await page.goto(url('Rounding.html', '?seed=11'));
  await expect(page.locator('.q').first()).toBeVisible();
  await page.locator('#finishBtn')[tap]();
  await expect(page.locator('#summaryDlg')).toBeVisible();
  await expect(page.locator('#sumTitle')).toContainText('0 of');
  await expect(page.locator('#sumMarks .mk-0')).toHaveCount(await page.locator('.q').count());
});
