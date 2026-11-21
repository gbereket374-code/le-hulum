// STEP 8: Capture fix-pass screenshots and fail on visible placeholder strings.
import pw from "/tmp/pwv3/node_modules/playwright/index.js";
import fs from "node:fs";
import path from "node:path";
const { chromium } = pw;

const BASE = process.env.LH_HOST || "http://127.0.0.1:8080";
const SPA = BASE + "/demo/v3-design/LE%20HULUM.dc.html";
const OUT = "docs/design/compare/fix-pass";
const VIEWS = ["home", "lesson", "studio", "platforms"];
const WIDTHS = [
  ["1280", 1280, 800],
  ["390", 390, 844],
];
const THEMES = ["light", "dark"];
const BAD = [
  { id: "bracket-placeholder", re: /\[[A-Z][A-Za-z ]{2,}\]/ },
  { id: "Placeholder", re: /Placeholder/ },
  { id: "HOST", re: /https?:\/\/HOST\b|\bHOST\/module/ },
  { id: "IMG", re: /\bIMG\b/ },
  { id: "SCREENSHOT", re: /SCREENSHOT/ },
  { id: "3:4", re: /\b3:4\b/ },
];

fs.mkdirSync(OUT, { recursive: true });

const launchOpts = {
  headless: true,
  args: ["--disk-cache-size=1", "--disable-http-cache"],
};
if (process.env.LH_PW_CHANNEL) launchOpts.channel = process.env.LH_PW_CHANNEL;
const browser = await chromium.launch(launchOpts);
let failed = false;
const report = [];

async function disableCache(page) {
  try {
    const client = await page.context().newCDPSession(page);
    await client.send("Network.enable");
    await client.send("Network.setCacheDisabled", { cacheDisabled: true });
  } catch (e) {}
}

for (const view of VIEWS) {
  for (const [vn, w, h] of WIDTHS) {
    for (const theme of THEMES) {
      const ctx = await browser.newContext({
        viewport: { width: w, height: h },
        bypassCSP: true,
      });
      const page = await ctx.newPage();
      await disableCache(page);
      await page.addInitScript((t) => {
        try {
          localStorage.setItem("lehulum.v1", JSON.stringify({ lang: "en", theme: t, prefs: {}, ann: false }));
        } catch (e) {}
      }, theme);
      await page.goto(SPA + "#" + view, { waitUntil: "networkidle", timeout: 90000 });
      await page.waitForSelector("main", { timeout: 30000 });
      // Wait until design imports finish and no bad tokens remain in visible text.
      await page.waitForFunction(() => {
        const t = document.body && document.body.innerText || "";
        return t.length > 200 && !/SCREENSHOT|Placeholder|\[Interpreter|\bIMG\b|\b3:4\b|HOST\/module/.test(t);
      }, null, { timeout: 20000 }).catch(() => {});
      await page.waitForTimeout(800);
      const file = path.join(OUT, `${view}-${vn}-${theme}.png`);
      await page.screenshot({ path: file, fullPage: false });
      const text = await page.evaluate(() => document.body.innerText || "");
      const hits = BAD.filter((rule) => rule.re.test(text)).map((rule) => rule.id);
      if (hits.length) {
        failed = true;
        report.push(`${view} ${vn} ${theme}: ${hits.join(", ")}`);
        for (const rule of BAD) {
          const m = text.match(rule.re);
          if (m) {
            const i = text.indexOf(m[0]);
            console.error("HIT", view, vn, theme, rule.id, JSON.stringify(text.slice(Math.max(0, i - 40), i + m[0].length + 40)));
          }
        }
        fs.writeFileSync(file.replace(/\.png$/, ".txt"), text.slice(0, 8000));
      }
      const scroll = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2);
      if (scroll) {
        failed = true;
        report.push(`${view} ${vn} ${theme}: horizontal scroll`);
      }
      await ctx.close();
      console.log("ok", file);
    }
  }
}

await browser.close();
if (failed) {
  console.error("PLACEHOLDER/LAYOUT FAIL\n" + report.join("\n"));
  process.exit(1);
}
console.log("STEP 8 checks passed");
