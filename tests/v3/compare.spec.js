// NFR-A11Y-01: Playwright screenshots at 1280 and 390 for v3 design compare.
const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

const OUT = process.env.LH_COMPARE_OUT
  ? path.resolve(process.env.LH_COMPARE_OUT)
  : path.join(__dirname, '../../docs/design/compare/v3');
const BASE = process.env.LH_BASE || 'http://127.0.0.1:8080/demo';
const SPA = '/v3-design/LE%20HULUM.dc.html';

const PAGES = [
  { name: 'home', path: SPA + '#home' },
  { name: 'lesson', path: SPA + '#lesson' },
  { name: 'asayegn', path: SPA + '#studio' },
  { name: 'platforms', path: SPA + '#platforms' },
  { name: 'notfound', path: SPA + '#404' },
];

const VIEWPORTS = [
  { name: '1280', width: 1280, height: 800 },
  { name: '390', width: 390, height: 844 },
];

test.beforeAll(() => {
  fs.mkdirSync(OUT, { recursive: true });
});

for (const page of PAGES) {
  for (const vp of VIEWPORTS) {
    test(`${page.name} @ ${vp.name}`, async ({ browser }) => {
      const ctx = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        colorScheme: 'light',
      });
      const p = await ctx.newPage();
      await p.goto(`${BASE}${page.path}`, { waitUntil: 'networkidle', timeout: 60000 });
      await p.waitForTimeout(600);
      const file = path.join(OUT, `${page.name}-${vp.name}.png`);
      await p.screenshot({ path: file, fullPage: true });
      expect(fs.existsSync(file)).toBeTruthy();
      await ctx.close();
    });
  }
}
