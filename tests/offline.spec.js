// Offline / Home Screen app: serve the site like GitHub Pages does (under
// /Maths-Drills/), let the service worker save it, then go offline.
const { test, expect } = require('@playwright/test');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PREFIX = '/Maths-Drills/';
const TYPES = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png',
  '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.webmanifest': 'application/manifest+json',
  '.json': 'application/json'
};

let server, origin;
test.beforeAll(async () => {
  server = http.createServer((req, res) => {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (!p.startsWith(PREFIX)) { res.writeHead(404); return res.end(); }
    p = p.slice(PREFIX.length) || 'index.html';
    const file = path.join(ROOT, p);
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  origin = 'http://127.0.0.1:' + server.address().port;
});
test.afterAll(() => server && new Promise(r => server.close(r)));

// playwright.config.js runs this file in the Chromium project only.

test('manifest and icons are valid', async ({ request }) => {
  const res = await request.get(origin + PREFIX + 'manifest.webmanifest');
  expect(res.ok()).toBe(true);
  const m = await res.json();
  expect(m.start_url).toBe('./index.html');
  expect(m.display).toBe('standalone');
  for (const icon of m.icons) {
    const r = await request.get(origin + PREFIX + icon.src);
    expect(r.ok(), icon.src).toBe(true);
  }
  expect(m.icons.some(i => i.purpose === 'maskable')).toBe(true);
  expect((await request.get(origin + PREFIX + 'apple-touch-icon.png')).ok()).toBe(true);
});

test('after one visit, drills work with no network', async ({ page, context }) => {
  await page.goto(origin + PREFIX + 'index.html');
  await expect(page.locator('link[rel="manifest"]')).toHaveCount(1);
  // wait until the service worker controls the page and has saved the site
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) {
      await new Promise(r => navigator.serviceWorker.addEventListener('controllerchange', r, { once: true }));
    }
  });
  await expect.poll(async () => page.evaluate(async () => {
    const c = await caches.open('maths-drills');
    return (await c.keys()).length;
  }), { timeout: 20000 }).toBeGreaterThan(40);

  await context.setOffline(true);
  for (const drill of ['Surds_Drill.html?seed=5&n=8', 'Ratio_Sharing.html?seed=9', 'Rounding.html']) {
    await page.goto(origin + PREFIX + drill);
    await expect(page.locator('.q').first()).toBeVisible();
    await expect(page.locator('.error-box')).toHaveCount(0);
  }
  // KaTeX fonts come from the cache too (Surds uses the Size fonts for √)
  await page.goto(origin + PREFIX + 'Surds_Drill.html?seed=5&n=8');
  await expect(page.locator('.q .katex').first()).toBeVisible();
  const fontsOk = await page.evaluate(async () => {
    await document.fonts.ready;
    return [...document.fonts].filter(f => f.family.includes('KaTeX')).every(f => f.status !== 'error');
  });
  expect(fontsOk).toBe(true);
  await page.goto(origin + PREFIX + 'pdf-worksheets/Perc_Of_Amount.html');
  await expect(page.locator('.tb-home')).toBeVisible();
  await context.setOffline(false);
});
