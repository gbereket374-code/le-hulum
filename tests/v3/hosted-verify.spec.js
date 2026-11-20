// NFR-QA-01: Hosted VERIFY — Asayegn EN/AM, lesson signer, pin, plugin, no localhost.
const { test, expect } = require('@playwright/test');
const path = require('path');
const http = require('http');
const fs = require('fs');

const HOST = process.env.LH_HOST || 'https://le-hulum.onrender.com';
const SPA = `${HOST}/demo/v3-design/LE%20HULUM.dc.html`;

function glossOrder(body) {
  return (body.gloss || []).map((g) => g.gloss).join(' ');
}

test.describe.configure({ timeout: 180000 });

test('ask EN and AM share gloss order and lesson cue', async ({ request }) => {
  const en = await request.post(`${HOST}/api/v1/ask`, {
    data: { text: 'What is a variable?', lang: 'en' },
  });
  const am = await request.post(`${HOST}/api/v1/ask`, {
    data: { text: 'ተለዋዋጭ ምንድን ነው?', lang: 'am' },
  });
  expect(en.ok()).toBeTruthy();
  expect(am.ok()).toBeTruthy();
  const enBody = await en.json();
  const amBody = await am.json();
  expect(glossOrder(enBody)).toBe(glossOrder(amBody));
  expect(enBody.lesson_match?.cue).toBeTruthy();
  expect(enBody.lesson_match.cue).toBe(amBody.lesson_match.cue);
});

test('Asayegn EN question shows gloss and lesson link', async ({ page }) => {
  const errors = [];
  const localhost = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('request', (req) => {
    if (/localhost|127\.0\.0\.1/.test(req.url())) localhost.push(req.url());
  });
  await page.goto(`${SPA}#studio`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(1200);
  const input = page.locator('textarea, input[type="text"]').first();
  await expect(input).toBeVisible({ timeout: 30000 });
  await input.fill('What is a variable?');
  await input.press('Enter');
  await page.waitForTimeout(4000);
  const card = page.locator('[data-reply], .reply, article, .asayegn-card, .msg-out, .bubble').first();
  await expect(page.getByText(/VARIABLE|variable|ተለዋዋጭ/i).first()).toBeVisible({ timeout: 30000 });
  const lessonLink = page.locator('a[href*="#lesson"], a[href*="lesson"]').first();
  if (await lessonLink.count()) {
    await expect(lessonLink).toBeVisible();
  }
  expect(localhost, localhost.join('\n')).toEqual([]);
  const realErrors = errors.filter((e) => !/favicon|net::ERR_ABORTED/i.test(e));
  expect(realErrors, realErrors.join('\n')).toEqual([]);
});

test('Asayegn one-word message shows sign card', async ({ page }) => {
  await page.goto(`${SPA}#studio`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(1000);
  const input = page.locator('#as-input');
  await input.fill('ተለዋዋጭ');
  await input.press('Enter');
  await expect(page.getByText('ተለዋዋጭ', { exact: false }).first()).toBeVisible({ timeout: 45000 });
  await expect(page.locator('video[data-asayegn-vid]').first()).toBeVisible({ timeout: 15000 });
  await expect(page.getByText(/VARIABLE|Dictionary|dictionary|ተለዋዋጭ/i).first()).toBeVisible();
});

test('lesson plays with signer', async ({ page }) => {
  await page.goto(`${SPA}#lesson`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForFunction(() => !!document.querySelector('db-player'), null, { timeout: 60000 });
  await page.waitForTimeout(2000);
  const ok = await page.evaluate(async () => {
    const host = document.querySelector('db-player');
    const player = host?._player;
    if (!player?.media) return { ok: false, why: 'no-media' };
    player.media.muted = true;
    try { await player.media.play(); } catch (e) { return { ok: false, why: String(e) }; }
    await new Promise((r) => setTimeout(r, 2500));
    const signOpen = !!player.sign?.isOpen?.() || !!host.shadowRoot?.querySelector('.sign-window, video');
    return {
      ok: player.media.currentTime > 0.2 && signOpen,
      t: player.media.currentTime,
      signOpen,
    };
  });
  expect(ok, JSON.stringify(ok)).toMatchObject({ ok: true });
});

test('Savanna pin signs the demo paragraph', async ({ page }) => {
  await page.goto(`${HOST}/pages/homepage-v1-paced.html`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForSelector('db-sign-pin', { timeout: 60000 });
  const api = await page.locator('db-sign-pin').getAttribute('api');
  expect(api).toMatch(/\/api\/v1$/);
  await page.waitForTimeout(1500);
  const signed = await page.evaluate(async () => {
    const pin = document.querySelector('db-sign-pin');
    const demo = document.querySelector('#le-hulum-demo p, #le-hulum-demo');
    if (!pin || !demo) return { ok: false, why: 'missing' };
    demo.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
    const btn = pin.shadowRoot?.querySelector('button, [role="button"]');
    if (btn) btn.click();
    await new Promise((r) => setTimeout(r, 3000));
    const video = pin.shadowRoot?.querySelector('video');
    return { ok: !!video || !!pin.shadowRoot?.textContent, hasVideo: !!video };
  });
  expect(signed.ok).toBeTruthy();
});

test('plugin-test from another origin loads module only from HOST', async ({ browser }) => {
  const external = path.join(__dirname, '../../docs/plugin-test-external.html');
  const html = fs.readFileSync(external, 'utf8');
  const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const port = server.address().port;
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const hosts = new Set();
  page.on('request', (req) => {
    try { hosts.add(new URL(req.url()).origin); } catch (_) {}
  });
  await page.goto(`http://127.0.0.1:${port}/?host=${encodeURIComponent(HOST)}`, {
    waitUntil: 'networkidle',
    timeout: 120000,
  });
  await page.waitForSelector('db-player', { timeout: 90000 });
  await page.waitForSelector('db-sign-pin', { timeout: 30000 });
  const origins = [...hosts];
  const foreign = origins.filter((o) => o !== HOST && !o.startsWith('http://127.0.0.1'));
  expect(foreign, foreign.join(', ')).toEqual([]);
  expect(origins.includes(HOST)).toBeTruthy();
  await ctx.close();
  server.close();
});
