// NFR-A11Y-01: axe 0 violations on every v3 page in light, dark, hc.
const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

const BASE = process.env.LH_BASE || 'http://127.0.0.1:8080/demo';
const SPA = '/v3-design/LE%20HULUM.dc.html';
const PAGES = [
  SPA + '#home',
  SPA + '#lesson',
  SPA + '#studio',
  SPA + '#platforms',
  SPA + '#404',
];
const THEMES = ['light', 'dark', 'hc'];

for (const route of PAGES) {
  for (const theme of THEMES) {
    test(`axe ${route} theme=${theme}`, async ({ page }) => {
      await page.goto(`${BASE}${route}`, { waitUntil: 'domcontentloaded', timeout: 120000 });
      await page.waitForFunction(() => document.documentElement.lang);
      await page.evaluate((th) => {
        document.documentElement.dataset.theme = th;
        if (!document.documentElement.lang) document.documentElement.lang = 'en';
        try {
          const raw = JSON.parse(localStorage.getItem('lehulum.v1') || '{}');
          raw.theme = th;
          localStorage.setItem('lehulum.v1', JSON.stringify(raw));
        } catch (_) {}
      }, theme);
      await page.waitForTimeout(800);
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
        .analyze();
      expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
    });
  }
}
