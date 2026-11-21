// FR-IN-04, NFR-A11Y: Hover never signs. Only the Sign button sends text and plays.
// Run: PW_MODULE=/path/to/node_modules/playwright/index.js PW_CHROME=/path/to/chrome node --test tests/e2e/sign-pin-hover.test.mjs
import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { after, before, beforeEach, afterEach, test } from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const PW = process.env.PW_MODULE || "/tmp/pwv3/node_modules/playwright/index.js";
const TYPES = { ".js": "text/javascript", ".json": "application/json", ".woff2": "font/woff2", ".html": "text/html" };
const PAGE = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Pin test</title>
<style>main{margin:80px 120px;max-width:640px}p,h2{margin:0 0 48px}</style></head><body><main>
<h2 id="head">A heading to read</h2>
<p id="one">First sentence here. Second sentence here.</p>
<p id="two">Another paragraph with <a id="link" href="#x">a link</a> inside.</p>
<p id="three">The last paragraph.</p>
</main><db-sign-pin api="/api/v1" lang="en" scope="main"></db-sign-pin>
<script type="module" src="/module/sign-pin.js"></script></body></html>`;

let browser;
let server;
let base;
let context;
let page;
let sent;

const state = () => page.evaluate(() => {
  const root = document.querySelector("db-sign-pin").shadowRoot;
  const sign = root.querySelector(".sign");
  return {
    button: !sign.hidden,
    label: sign.getAttribute("aria-label"),
    icon: sign.dataset.state,
    window: !root.querySelector(".sign-window").hidden,
    area: !root.querySelector(".area").hidden,
    highlight: Boolean(window.CSS?.highlights?.has("lh-sentence")),
    focused: root.activeElement?.className || ""
  };
});
const signButton = () => page.locator("db-sign-pin .sign");
const until = async (check, label) => {
  for (let i = 0; i < 60; i += 1) {
    if (check(await state())) return state();
    await page.waitForTimeout(50);
  }
  assert.fail(label + ": " + JSON.stringify(await state()));
};

const sentOnce = async () => {
  for (let i = 0; i < 60 && !sent.length; i += 1) await page.waitForTimeout(50);
  assert.equal(sent.length, 1);
};

before(async () => {
  const { chromium } = (await import(pathToFileURL(PW).href)).default;
  browser = await chromium.launch(process.env.PW_CHROME ? { executablePath: process.env.PW_CHROME } : {});
  server = http.createServer((req, res) => {
    const url = decodeURIComponent(new URL(req.url, "http://x").pathname);
    if (url === "/") { res.writeHead(200, { "content-type": "text/html" }); res.end(PAGE); return; }
    const file = path.join(ROOT, url);
    if (!file.startsWith(path.join(ROOT, "module")) || !fs.existsSync(file)) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { "content-type": TYPES[path.extname(file)] || "application/octet-stream" });
    res.end(fs.readFileSync(file));
  });
  await new Promise((ready) => server.listen(0, "127.0.0.1", ready));
  base = `http://127.0.0.1:${server.address().port}/`;
});

after(async () => {
  await browser?.close();
  server?.close();
});

async function open(options = {}) {
  context = await browser.newContext({ viewport: { width: 1000, height: 700 }, ...options });
  page = await context.newPage();
  sent = [];
  page.on("request", (request) => { if (/\/sign\/translate|\/ask/.test(request.url())) sent.push(request.url()); });
  await page.route("**/api/v1/**", async (route) => {
    await new Promise((wait) => setTimeout(wait, 150));
    await route.fulfill({ json: { layer: "none", gloss: [], playlist: [], nonmanual: [] } });
  });
  await page.goto(base);
  await page.waitForFunction(() => document.querySelector("db-sign-pin")?.shadowRoot?.querySelector(".launch span")?.textContent);
}

beforeEach(async () => { await open(); });
afterEach(async () => { await context?.close(); });

test("hovering a paragraph for 3 s only shows the Sign button", async () => {
  const before = await page.locator("#one").boundingBox();
  await page.hover("#one");
  await page.waitForTimeout(3000);
  const now = await state();
  assert.deepEqual(sent, []);
  assert.equal(now.window, false);
  assert.equal(now.area, false);
  assert.equal(now.highlight, false);
  assert.equal(now.button, true);
  assert.equal(now.label, "Sign this paragraph");
  assert.deepEqual(await page.locator("#one").boundingBox(), before);
});

test("the button hides about 300 ms after leaving, and survives moving onto it", async () => {
  await page.hover("#one");
  await until((row) => row.button, "button shows");
  await signButton().hover();
  await page.waitForTimeout(500);
  assert.equal((await state()).button, true);
  await page.mouse.move(990, 690);
  await page.waitForTimeout(150);
  assert.equal((await state()).button, true);
  await until((row) => !row.button, "button hides");
  assert.deepEqual(sent, []);
});

test("click signs, pauses, resumes, and Escape stops", async () => {
  await page.hover("#one");
  await signButton().click();
  const busy = await page.evaluate(() => document.querySelector("db-sign-pin").shadowRoot.querySelector(".sign-window").getAttribute("aria-busy"));
  assert.equal(busy, "true");
  await until((row) => row.window && row.area && row.highlight && row.icon === "pause", "signing");
  await sentOnce();
  assert.equal((await state()).label, "Pause");
  await signButton().click();
  await until((row) => row.icon === "play" && row.label === "Play", "paused");
  await signButton().click();
  await until((row) => row.icon === "pause", "resumed");
  await page.keyboard.press("Escape");
  const stopped = await until((row) => !row.area && !row.highlight, "stopped");
  assert.equal(stopped.window, true);
  assert.equal(stopped.label, "Sign this paragraph");
});

test("hovering another block while signing moves the button and leaves signing alone", async () => {
  await page.hover("#one");
  await signButton().click();
  await until((row) => row.icon === "pause", "signing");
  await sentOnce();
  const count = sent.length;
  await page.hover("#three");
  const moved = await until((row) => row.label === "Sign this paragraph", "moved");
  assert.equal(moved.area, true);
  assert.equal(moved.highlight, true);
  assert.equal(sent.length, count);
});

test("Tab reaches the button and Enter signs", async () => {
  await page.hover("#one");
  await until((row) => row.button, "button shows");
  await page.keyboard.press("Tab");
  assert.equal((await state()).focused, "sign");
  assert.deepEqual(sent, []);
  await page.keyboard.press("Enter");
  await until((row) => row.window && row.area && row.icon === "pause", "signing");
  await sentOnce();
  await page.keyboard.press("Escape");
  await until((row) => !row.area, "stopped");
});

test("keyboard focus on a link shows the button, Tab visits it, and moves on", async () => {
  await page.keyboard.press("Tab");
  assert.equal(await page.evaluate(() => document.activeElement.id), "link");
  assert.equal((await state()).button, true);
  assert.deepEqual(sent, []);
  await page.keyboard.press("Tab");
  assert.equal((await state()).focused, "sign");
  await page.keyboard.press("Tab");
  assert.notEqual((await state()).focused, "sign");
  assert.deepEqual(sent, []);
});

test("Enter on a focused link follows it and does not sign", async () => {
  await page.focus("#link");
  await page.keyboard.press("Enter");
  await page.waitForTimeout(400);
  assert.ok(page.url().endsWith("#x"));
  assert.deepEqual(sent, []);
});

test("touch: first tap shows the button, tapping it signs", async () => {
  await context.close();
  await open({ hasTouch: true, viewport: { width: 390, height: 800 } });
  await page.tap("#two", { position: { x: 5, y: 5 } });
  const shown = await until((row) => row.button, "button shows");
  assert.equal(shown.window, false);
  assert.deepEqual(sent, []);
  await page.waitForTimeout(600);
  assert.equal((await state()).button, true);
  await signButton().tap();
  await until((row) => row.window && row.area, "signing");
  await sentOnce();
});

test("the launcher list still signs a block with Enter, and the drag pin stays hidden until chosen", async () => {
  const hidden = () => page.evaluate(() => document.querySelector("db-sign-pin").shadowRoot.querySelector(".pin").hidden);
  assert.equal(await hidden(), true);
  await page.locator("db-sign-pin .launch").click();
  await page.locator("db-sign-pin .list button", { hasText: "First sentence" }).focus();
  assert.deepEqual(sent, []);
  await page.keyboard.press("Enter");
  await until((row) => row.window && row.area, "signing");
  await sentOnce();
  assert.equal(await hidden(), true);
  await page.keyboard.press("Escape");
  await until((row) => !row.area, "stopped");
  await page.locator("db-sign-pin .launch").click();
  await page.locator("db-sign-pin .list button", { hasText: "Drag pin" }).click();
  assert.equal(await hidden(), false);
});

test("Sign selection still signs only when chosen", async () => {
  await page.evaluate(() => {
    const range = document.createRange();
    range.selectNodeContents(document.querySelector("#three"));
    getSelection().removeAllRanges();
    getSelection().addRange(range);
  });
  await page.locator("db-sign-pin .pick").waitFor();
  assert.deepEqual(sent, []);
  await page.locator("db-sign-pin .pick").click();
  await until((row) => row.window && row.highlight, "signing");
  await sentOnce();
});
