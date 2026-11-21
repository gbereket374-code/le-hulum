// STEP 10 FIX 3: Learner settings write db-player:prefs; lesson reload reflects them.
import pw from "/tmp/pwv3/node_modules/playwright/index.js";
const { chromium } = pw;

const BASE = process.env.LH_HOST || "http://127.0.0.1:8080";
const SPA = BASE + "/demo/v3-design/LE%20HULUM.dc.html";

const launchOpts = {
  headless: true,
  args: ["--disk-cache-size=1", "--disable-http-cache"],
};
if (process.env.LH_PW_CHANNEL) launchOpts.channel = process.env.LH_PW_CHANNEL;

const browser = await chromium.launch(launchOpts);
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, bypassCSP: true });
const page = await ctx.newPage();

async function openSettings() {
  await page.getByRole("button", { name: /Learner settings|Settings|የተማሪ ቅንብሮች|ቅንብሮች/i }).first().click();
  await page.getByRole("heading", { name: /Learner settings|የተማሪ ቅንብሮች/i }).waitFor({ timeout: 10000 });
}

async function pickInGroup(labelRe, optionRe) {
  const group = page.getByRole("group", { name: labelRe });
  await group.getByRole("button", { name: optionRe }).click();
}

let failed = false;
const errors = [];

try {
  await page.goto(SPA + "#home", { waitUntil: "networkidle", timeout: 90000 });
  await page.waitForSelector("main", { timeout: 30000 });
  await openSettings();

  await pickInGroup(/Signer size|የአስተርጓሚ መጠን/i, /Large|ትልቅ/i);
  await pickInGroup(/Signer speed|የአስተርጓሚ ፍጥነት/i, /0\.75/);
  await pickInGroup(/Pacing|ቆም ማለት/i, /Smooth|ለስላሳ/i);
  await pickInGroup(/Caption colours|የጽሑፍ ቀለሞች/i, /Yellow|ቢጫ/i);
  await page.locator("#cap-size").fill("150");
  await page.getByRole("button", { name: /Done|ጨርሻለሁ/i }).click();

  const prefsAfter = await page.evaluate(() => JSON.parse(localStorage.getItem("db-player:prefs") || "{}"));
  const checks = [
    ["signW", prefsAfter.signW >= 0.4, prefsAfter.signW],
    ["signRate", prefsAfter.signRate === 0.75, prefsAfter.signRate],
    ["signPacing", prefsAfter.signPacing === "smooth", prefsAfter.signPacing],
    ["captionStyle.fg", (prefsAfter.captionStyle || {}).fg === "#ffe14d", (prefsAfter.captionStyle || {}).fg],
    ["captionStyle.size", (prefsAfter.captionStyle || {}).size === 150 || prefsAfter.capSize === 150, (prefsAfter.captionStyle || {}).size],
  ];
  for (const [name, ok, val] of checks) {
    if (!ok) {
      failed = true;
      errors.push(`${name}=${JSON.stringify(val)}`);
    }
  }

  await page.goto(SPA + "#lesson", { waitUntil: "networkidle", timeout: 90000 });
  await page.waitForFunction(() => !!document.querySelector("db-player"), null, { timeout: 60000 });
  await page.reload({ waitUntil: "networkidle", timeout: 90000 });
  await page.waitForFunction(() => !!document.querySelector("db-player"), null, { timeout: 60000 });
  await page.waitForTimeout(1500);

  const reflected = await page.evaluate(() => {
    const prefs = JSON.parse(localStorage.getItem("db-player:prefs") || "{}");
    const host = document.querySelector("db-player");
    const player = host && host._player;
    const win = player && player.sign && (player.sign.window || player.sign.win);
    const rate = win ? win.rate : prefs.signRate;
    const pacing = win ? win.pacing : prefs.signPacing;
    const w = win && win.frac ? win.frac.w : prefs.signW;
    const cap = (player && player.prefs && player.prefs.captionStyle) || prefs.captionStyle || {};
    return { prefs, rate, pacing, w, cap };
  });

  if (reflected.prefs.signRate !== 0.75) {
    failed = true;
    errors.push("reload signRate=" + reflected.prefs.signRate);
  }
  if (reflected.prefs.signPacing !== "smooth") {
    failed = true;
    errors.push("reload signPacing=" + reflected.prefs.signPacing);
  }
  if (!(reflected.prefs.signW >= 0.4)) {
    failed = true;
    errors.push("reload signW=" + reflected.prefs.signW);
  }
  if ((reflected.cap.fg || "").toLowerCase() !== "#ffe14d") {
    failed = true;
    errors.push("reload caption fg=" + reflected.cap.fg);
  }
  if (reflected.rate != null && Number(reflected.rate) !== 0.75) {
    failed = true;
    errors.push("player rate=" + reflected.rate);
  }
  if (reflected.pacing != null && reflected.pacing !== "smooth") {
    failed = true;
    errors.push("player pacing=" + reflected.pacing);
  }
} catch (e) {
  failed = true;
  errors.push(String(e && e.stack || e));
}

await browser.close();
if (failed) {
  console.error("SETTINGS PREFS FAIL:\n" + errors.join("\n"));
  process.exit(1);
}
console.log("SETTINGS PREFS OK");
