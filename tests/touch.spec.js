// Real touch gestures (Chrome DevTools protocol), on an iPad-sized touch screen.
// Checks the three things students do: swipe to scroll, tap, press-hold-drag.
const { test, expect, devices } = require('@playwright/test');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const url = (file, query = '') => 'file:///' + path.join(ROOT, file).split(path.sep).join('/') + query;

// Touch input through the DevTools protocol only exists in Chromium;
// playwright.config.js runs this file in the Chromium project only.
test.use({ ...devices['iPad Mini'], browserName: 'chromium' });

async function touchTools(page) {
  const cdp = await page.context().newCDPSession(page);
  const send = (type, x, y) => cdp.send('Input.dispatchTouchEvent',
    { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y }] });
  const centre = async loc => {
    await loc.scrollIntoViewIfNeeded();
    const r = await loc.boundingBox();
    return [r.x + r.width / 2, r.y + r.height / 2];
  };
  return { send, centre };
}

for (const file of ['Multiplication_Drill_1.html', 'Surds_Drill.html', 'Shape_Pattern_Recognition_V3.html', 'Perimeter_with_Algebra.html']) {
  test.describe(file, () => {
    test('swiping on an answer scrolls the page and does not answer', async ({ page }) => {
      await page.goto(url(file, '?seed=3'));
      await expect(page.locator('.q').first()).toBeVisible();
      const { send, centre } = await touchTools(page);
      await page.evaluate(() => scrollTo(0, 0));
      const [x, y] = await centre(page.locator('.q[data-q="0"] .option').first());
      const before = await page.evaluate(() => scrollY);
      await send('touchStart', x, y);
      for (let i = 1; i <= 10; i++) { await send('touchMove', x, y - i * 25); await page.waitForTimeout(8); }
      await send('touchEnd');
      await page.waitForTimeout(300);
      expect(await page.evaluate(() => scrollY)).toBeGreaterThan(before + 50);
      await expect(page.locator('.q[data-q="0"] .qmark.filled')).toHaveCount(0);
    });

    test('press, hold and drag an answer into the ? box', async ({ page }) => {
      await page.goto(url(file, '?seed=3'));
      await expect(page.locator('.q').first()).toBeVisible();
      const { send, centre } = await touchTools(page);
      const q = page.locator('.q[data-q="1"]');
      await q.scrollIntoViewIfNeeded();
      const [ox, oy] = await centre(q.locator('.option').nth(2));
      const [zx, zy] = await centre(q.locator('.drop-zone'));
      await send('touchStart', ox, oy);
      await page.waitForTimeout(200);                     // hold
      const steps = 12;
      for (let i = 1; i <= steps; i++) {
        // aim the finger so the lifted answer (drawn above the finger) lands on the box
        await send('touchMove', ox + (zx - ox) * i / steps, oy + (zy + 56 - oy) * i / steps);
        await page.waitForTimeout(16);
      }
      await expect(q.locator('.drop-zone')).toHaveClass(/over/);
      await send('touchEnd');
      await expect(q.locator('.qmark')).toHaveClass(/filled/);
      await expect(q.locator('.q-feedback')).not.toHaveText('');
      await expect(page.locator('.drag-ghost')).toHaveCount(0);
    });

    test('dropping away from the ? box does not answer', async ({ page }) => {
      await page.goto(url(file, '?seed=3'));
      await expect(page.locator('.q').first()).toBeVisible();
      const { send, centre } = await touchTools(page);
      const q = page.locator('.q[data-q="0"]');
      const [ox, oy] = await centre(q.locator('.option').first());
      await send('touchStart', ox, oy);
      await page.waitForTimeout(200);
      for (let i = 1; i <= 6; i++) { await send('touchMove', ox + i * 4, oy + i * 12); await page.waitForTimeout(16); }
      await send('touchEnd');
      await expect(q.locator('.qmark.filled')).toHaveCount(0);
      await expect(page.locator('.drag-ghost')).toHaveCount(0);
    });

    test('a quick tap answers', async ({ page }) => {
      await page.goto(url(file, '?seed=3'));
      await expect(page.locator('.q').first()).toBeVisible();
      const { send, centre } = await touchTools(page);
      const q = page.locator('.q[data-q="0"]');
      const [x, y] = await centre(q.locator('.option').nth(1));
      await send('touchStart', x, y);
      await page.waitForTimeout(50);
      await send('touchEnd');
      await expect(q.locator('.qmark')).toHaveClass(/filled/);
    });
  });
}
