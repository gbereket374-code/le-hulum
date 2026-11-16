// FR-SL-08, FR-SL-09: Sign a typed sentence in the sign window.
import { loadStrings, t } from "/module/core/i18n.js";
import { CSS, SignWindow } from "/module/deaf/sign-window.js";
import { attachSignPlay } from "/module/deaf/sign-play.js";
import { renderResult } from "./sign-try-view.js";

const EXAMPLES = [
  "ኮምፒውተሩን ክፈቱ፣ አሁን ትምህርቱን ጀምሩ።", "ኤዲተሩን ክፈቱ፣ ኮድ ጻፉ።",
  "ኮዱን አስኪዱ፣ እሴቱን በስክሪኑ ላይ አረጋግጡ።", "ኮዱ ካልሰራ፣ ስህተቱን አረጋግጡ።",
  "ቀጥሎ ተለዋዋጭ፣ መረጃ እና ድግግሞሽ ተማሩ።", "ጥሩ ኮድ ጥሩ ሥራ ይፈጥራል።",
  "ኮዱ አልሰራም።", "መምህሩ ምን ያሳያል?", "ዛሬ ኮምፒውተሩን አትክፈቱ።", "ፕላኔቱ ዙሪያ ዞረ።"
];
const field = document.getElementById("am-text");
const error = document.getElementById("try-error");
const out = document.getElementById("try-out");
let last = [];
let full = [];
let active = [];
let rate = 1;
const voted = new Map();
const state = { segments: [], index: 0, item: 0, front: 0, base: "data/", stall: 0, pauseAt: 0, armed: false, want: 0 };

function sentences(text) {
  const rows = [];
  let buf = "";
  for (const part of String(text || "").split(/([።?!])/)) {
    buf += part;
    if (/[።?!]/.test(part) && buf.trim()) { rows.push(buf.trim()); buf = ""; }
  }
  if (buf.trim()) rows.push(buf.trim());
  return rows;
}

function start(list) {
  active = list.filter((item) => item.src || item.pause != null);
  state.segments = [{ playlist: active, source: "auto" }];
  state.index = 0;
  state.item = 0;
  if (!active.length) return;
  play.playItem(active[0], active[0].from || 0);
}

const style = document.createElement("style");
style.textContent = CSS;
document.head.append(style);
const win = new SignWindow(document.getElementById("try-stage"), {
  t, announce(key) { error.textContent = t(key); }, close() { win.hide(); }, layout() {}, save() {}, moved() {}
});
win.layout = "sign-first";
const play = attachSignPlay(win, state, {
  items: () => active, rate: () => rate, paused: () => false, started() {}, next: () => null,
  fail() { error.textContent = t("sign_failed"); }, ended() {}
});

function reveal() {
  document.querySelector(".try-grid").classList.add("has-result");
  document.getElementById("try-empty").hidden = true;
  document.getElementById("try-stage").hidden = false;
  document.getElementById("try-controls").hidden = false;
  const heading = document.getElementById("try-heading");
  heading.hidden = false;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  heading.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  heading.focus();
}

function paintLabels() {
  document.getElementById("try-empty-text").textContent = t("try_empty");
  document.getElementById("try-heading").textContent = t("try_result");
  document.getElementById("replay").textContent = t("replay");
  document.getElementById("rate-1").textContent = t("speed_1");
  document.getElementById("rate-75").textContent = t("speed_75");
  document.getElementById("rate-1").setAttribute("aria-pressed", rate === 1 ? "true" : "false");
  document.getElementById("rate-75").setAttribute("aria-pressed", rate === 0.75 ? "true" : "false");
  win.paint();
}

async function sign(text) {
  error.textContent = "";
  const parts = sentences(text);
  if (!parts.length) { error.textContent = t("sign_empty"); return; }
  try {
    const results = [];
    for (const part of parts) {
      const res = await fetch("/api/v1/sign/translate", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: part, lang: "am" })
      });
      if (!res.ok) throw new Error("sign");
      results.push(await res.json());
    }
    last = results;
    renderResult(out, results, start, voted);
    reveal();
    win.show("");
    full = [];
    results.forEach((result, index) => {
      if (index) full.push({ pause: 0.4 });
      full.push(...(result.playlist || []));
    });
    start(full);
  } catch (err) {
    error.textContent = t("sign_failed");
  }
}

document.getElementById("try-form").addEventListener("submit", (event) => { event.preventDefault(); sign(field.value); });
document.getElementById("replay").addEventListener("click", () => start(full));
document.getElementById("rate-1").addEventListener("click", () => { rate = 1; play.applyRate(); paintLabels(); });
document.getElementById("rate-75").addEventListener("click", () => { rate = 0.75; play.applyRate(); paintLabels(); });
for (const sample of EXAMPLES) {
  const button = document.createElement("button");
  button.type = "button";
  button.lang = "am";
  button.textContent = sample;
  button.addEventListener("click", () => { field.value = sample; sign(sample); });
  document.getElementById("example-list").append(button);
}
await loadStrings(document.documentElement.lang === "am" ? "am" : "en");
paintLabels();
document.getElementById("lang")?.addEventListener("click", async () => {
  await loadStrings(document.documentElement.lang === "am" ? "am" : "en");
  paintLabels();
  if (last.length) renderResult(out, last, start, voted);
});
