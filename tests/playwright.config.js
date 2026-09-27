// Browser tests: every drill in desktop Chrome and in Safari's engine
// (WebKit) at iPad and phone sizes. Pages are opened straight from disk,
// the same way a teacher double-clicking a file would.
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: '.',
  testMatch: /.*\.spec\.js/,
  timeout: 30000,
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  projects: [
    { name: 'desktop-chrome', use: { ...devices['Desktop Chrome'] } },
    // touch.spec.js (real touch input) and offline.spec.js (service worker) need Chromium: run them once, here.
    { name: 'ipad-safari', use: { ...devices['iPad (gen 7)'] }, testIgnore: /(touch|offline)\.spec\.js/ },
    { name: 'phone-safari', use: { ...devices['iPhone SE'] }, testIgnore: /(touch|offline)\.spec\.js/ }
  ]
});
