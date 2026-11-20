// FR-DEAF-05, FR-DEAF-06: Wall-clock sync of captions and the signer.
import pw from "/tmp/pw/node_modules/playwright-core/index.js";
import { inSentence } from "../../module/deaf/sign-schedule.js";

const browser = await pw.chromium.launch({
  channel: "chrome",
  args: ["--no-sandbox", "--autoplay-policy=no-user-gesture-required"]
});

function num(id) {
  const match = String(id || "").match(/A(\d+)/i);
  return match ? Number(match[1]) : 0;
}

function report(name, snap) {
  const lines = ["cue | caption wall | signer wall | lag"];
  let max = 0;
  for (const row of snap.cues) {
    const lag = row.lag == null ? "" : row.lag.toFixed(2);
    if (row.lag != null) max = Math.max(max, row.lag);
    lines.push(`${row.id} | ${row.caption == null ? "" : row.caption.toFixed(2)} | ${row.signer == null ? "" : row.signer.toFixed(2)} | ${lag}`);
  }
  const holds = snap.holds.map((row) => {
    const where = row.inside ? " INSIDE" : "";
    return `${row.wall.toFixed(2)}s wall @ lesson ${row.lesson.toFixed(2)}s caption ${row.caption || "-"} for ${row.length.toFixed(2)}s${where}`;
  });
  return { name, lines, holds, max, inside: snap.holds.some((row) => row.inside), ahead: snap.ahead, same: snap.same, wall: snap.wall, frozen: snap.frozen, ended: snap.ended, sources: snap.sources };
}

async function run(how, block, playlist, auto) {
  const host = process.env.LH_HOST || "http://localhost:8080";
  const context = await browser.newContext();
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  // Keep HTTP cache on for remote hosts — free-tier CDN stalls look like freezes otherwise.
  const remote = /onrender\.com|hf\.space/i.test(host);
  await cdp.send("Network.setCacheDisabled", { cacheDisabled: !remote });
  if (block) await page.route("**/*A05.mp4*", (route) => route.abort());
  if (playlist) {
    await page.route("**/data/sign.json*", async (route) => {
      const doc = await (await route.fetch()).json();
      for (const seg of doc.segments || []) {
        if (!seg.src || !(seg.to > seg.from)) continue;
        const hold = Math.min(0.25, Math.max(0.05, (seg.to - seg.from) / 5));
        seg.playlist = [{ src: seg.src, from: seg.from, to: seg.to - hold }, { pause: hold }];
      }
      await route.fulfill({ contentType: "application/json", body: JSON.stringify(doc) });
    });
  }
  const pageUrl = auto ? `${host}/demo/lesson-auto.html?sign=on` : `${host}/demo/lesson-video.html?sign=on`;
  await page.goto(pageUrl, { waitUntil: "domcontentloaded", timeout: 120000 });
  await page.waitForFunction(() => {
    const player = document.querySelector("db-player")?._player;
    const ready = player?.media?.readyState >= 1 && player.sign?.isOpen?.() && player.captions?.getCues?.("am")?.length > 5;
    if (!ready) return false;
    return player.host.getAttribute("sign") ? true : (player.sign.plan || []).length > 5;
  }, { timeout: 180000 });
  await page.evaluate(() => {
    const player = document.querySelector("db-player")._player;
    window.__lh = { samples: [], t0: 0, frozen: false, still: 0, lastT: -1, lastS: -1 };
    window.__lh.timer = setInterval(() => {
      const media = player.media;
      const video = player.sign?.video;
      const cueId = player.shadow.querySelector(".sign-window")?.dataset.cue || "";
      const sign = (video?.currentSrc || "").match(/A\d+/i)?.[0] || cueId;
      const sample = {
        w: performance.now(), t: media.currentTime || 0, paused: !!media.paused, ended: !!media.ended,
        dur: media.duration || 0, caption: player.captions.cueAt(media.currentTime || 0)?.id || "",
        sign, signPaused: !!video?.paused
      };
      const box = window.__lh;
      if (!box.t0) box.t0 = sample.w;
      box.samples.push(sample);
      const stuck = Math.abs(sample.t - box.lastT) < 0.04 && Math.abs((video?.currentTime || 0) - box.lastS) < 0.04 && !sample.ended;
      box.still = stuck ? box.still + 1 : 0;
      box.lastT = sample.t; box.lastS = video?.currentTime || 0;
      if (box.still >= 120) box.frozen = true;
    }, 100);
  });
  const started = Date.now();
  await page.evaluate((mode) => {
    const player = document.querySelector("db-player")._player;
    player.media.muted = true;
    window.__lh.t0 = performance.now();
    if (mode === "button") player.shadow.querySelector("[data-id=play]").click();
    else player.media.play();
  }, how);
  let done = false;
  for (let i = 0; i < 240 && !done; i += 1) {
    await page.waitForTimeout(500);
    done = await page.evaluate(() => {
      const box = window.__lh;
      const last = box.samples[box.samples.length - 1] || {};
      return !!box.frozen || !!last.ended || (!!last.dur && last.t >= last.dur - 0.25);
    });
  }
  const raw = await page.evaluate(async () => {
    const player = document.querySelector("db-player")._player;
    const src = player.host.getAttribute("sign");
    const doc = src ? await fetch(src).then((res) => res.json()) : { segments: player.sign.plan || [] };
    const box = window.__lh;
    clearInterval(box.timer);
    const last = box.samples[box.samples.length - 1] || {};
    return {
      samples: box.samples, t0: box.t0, frozen: !!box.frozen,
      ended: !!last.ended || (!!last.dur && last.t >= last.dur - 0.25),
      cues: (doc.segments || []).map((cue) => ({ id: cue.cue, start: cue.start, end: cue.end, source: cue.source || "" })),
      sources: {
        auto: (doc.segments || []).filter((cue) => cue.source === "auto").length,
        none: (doc.segments || []).filter((cue) => cue.source === "none").length,
        memory: (doc.segments || []).filter((cue) => cue.source === "memory").length
      }
    };
  });
  await context.close();
  const cues = raw.cues.filter((cue) => cue.id);
  let open = null;
  const holds = [];
  let ahead = 0;
  let same = 0;
  let both = 0;
  for (const sample of raw.samples) {
    const pausing = sample.paused && !sample.ended && sample.t < (sample.dur || 99) - 0.3;
    if (pausing && !open) open = sample;
    if (!pausing && open) {
      const length = (sample.w - open.w) / 1000;
      if (length >= 0.2) holds.push({ wall: (open.w - raw.t0) / 1000, lesson: open.t, caption: open.caption, length, inside: inSentence(cues, open.t) });
      open = null;
    }
    if (!sample.caption || !sample.sign || sample.signPaused) continue;
    both += 1;
    if (num(sample.sign) > num(sample.caption)) ahead += 1;
    if (num(sample.sign) === num(sample.caption)) same += 1;
  }
  const rows = cues.filter((cue) => /^A\d+/.test(cue.id)).map((cue) => {
    const caption = raw.samples.find((sample) => sample.caption === cue.id);
    const signer = raw.samples.find((sample) => sample.sign === cue.id && !sample.signPaused);
    const captionAt = caption ? (caption.w - raw.t0) / 1000 : null;
    const signerAt = signer ? (signer.w - raw.t0) / 1000 : null;
    return { id: cue.id, caption: captionAt, signer: signerAt, lag: captionAt == null || signerAt == null ? null : signerAt - captionAt };
  });
  return { cues: rows, holds, ahead: both ? ahead / both : 0, same: both ? same / both : 0, wall: (Date.now() - started) / 1000, frozen: raw.frozen, ended: raw.ended && !raw.frozen, sources: raw.sources };
}

const results = [];
for (const [name, how, block, playlist, auto] of [["Play button", "button", false, false, false], ["media.play()", "media", false, false, false], ["A05 blocked", "button", true, false, false], ["playlist", "button", false, true, false], ["lesson-auto", "button", false, false, true]]) {
  results.push(report(name, await run(how, block, playlist, auto)));
}
await browser.close();
let failed = false;
for (const result of results) {
  console.log("\n== " + result.name + " ==");
  console.log(result.holds.length ? result.holds.join("\n") : "(no holds)");
  console.log(result.lines.join("\n"));
  if (result.sources) console.log("auto " + result.sources.auto + " | none " + result.sources.none + " | memory " + result.sources.memory);
  console.log([
    "ahead " + (result.ahead * 100).toFixed(1) + "%",
    "same " + (result.same * 100).toFixed(1) + "%",
    "max " + result.max.toFixed(2) + "s",
    "wall " + result.wall.toFixed(1) + "s",
    result.frozen ? "FROZEN" : "moving",
    result.ended ? "ended" : "open",
    result.inside ? "INSIDE" : "gaps"
  ].join(" | "));
  if (result.inside || result.ahead > 0 || result.max > 3.2 || result.frozen || !result.ended) failed = true;
}
if (failed) process.exitCode = 1;
