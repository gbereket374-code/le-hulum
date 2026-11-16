// NFR-A11Y-01: Lesson page chrome. Seeks the existing player. Does not change its engine.
const player = document.querySelector("db-player");
const am = () => document.documentElement.lang === "am";
const STOP = new Set("the a an and of to in is we you your this that it for on with as".split(" "));
let cues = [];
let index = 0;

function root() { return player?.shadowRoot; }
function video() { return root()?.querySelector("video"); }
function gloss(text) {
  const parts = text.replace(/[“”".,!?።፣]/g, "").split(/\s+/).filter(Boolean);
  const pick = am() ? parts.slice(0, 3) : parts.filter((word) => !STOP.has(word.toLowerCase())).slice(0, 4);
  return pick.map((word) => (am() ? word : word.toUpperCase()));
}
function showLine(i) {
  if (!cues.length) return;
  index = Math.max(0, Math.min(cues.length - 1, i));
  const cue = cues[index];
  const line = document.getElementById("line-text");
  line.textContent = cue.text;
  line.lang = am() ? "am" : "en";
  document.getElementById("now-t").textContent = am()
    ? `አሁን በምልክት · መስመር ${index + 1} ከ ${cues.length}`
    : `Now signing · Line ${index + 1} of ${cues.length}`;
  const list = document.getElementById("line-gloss");
  list.replaceChildren(...gloss(cue.text).map((word) => {
    const item = document.createElement("li");
    item.textContent = word;
    return item;
  }));
  document.querySelectorAll(".tx-line").forEach((button, n) => button.setAttribute("aria-current", n === index ? "true" : "false"));
}
function seek(time) {
  const node = video();
  if (!node) return;
  node.currentTime = time;
  node.play().catch(() => {});
  document.getElementById("poster-card").hidden = true;
}
function onTime() {
  const time = video()?.currentTime || 0;
  let next = 0;
  cues.forEach((cue, i) => { if (time >= cue.start - 0.05) next = i; });
  if (cues.length) showLine(next);
  const code = document.getElementById("code-now");
  const empty = document.getElementById("code-empty");
  const on = time >= 24;
  code.hidden = !on;
  empty.hidden = on;
  if (on) code.textContent = time >= 40 ? 'name = "Abebe"\nprint(name)' : 'name = "Abebe"';
}
function parse(vtt) {
  const blocks = vtt.replace(/\r/g, "").split(/\n\n+/);
  return blocks.flatMap((block) => {
    const lines = block.split("\n").filter((line) => line && !line.startsWith("WEBVTT") && !line.startsWith("NOTE"));
    const stamp = lines.find((line) => line.includes("-->"));
    if (!stamp) return [];
    const start = stamp.split("-->")[0].trim().split(":").reduce((sum, part) => sum * 60 + Number(part), 0);
    const text = lines.slice(lines.indexOf(stamp) + 1).join(" ").replace(/<[^>]+>/g, "").trim();
    return text ? [{ start, text }] : [];
  });
}
async function loadCues() {
  const lang = am() ? "am" : "en";
  const vtt = await fetch(`data/lesson.${lang}.vtt`).then((response) => response.text());
  cues = parse(vtt);
  const box = document.getElementById("transcript");
  box.replaceChildren();
  cues.forEach((cue, i) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "tx-line";
    const minute = Math.floor(cue.start / 60);
    const second = String(Math.floor(cue.start % 60)).padStart(2, "0");
    button.innerHTML = `<time>${minute}:${second}</time><span></span>`;
    button.querySelector("span").textContent = cue.text;
    button.addEventListener("click", () => seek(cue.start));
    box.append(button);
  });
  showLine(0);
  const meta = document.getElementById("poster-meta");
  if (meta) meta.textContent = am()
    ? `1:00 · ${cues.length} መስመሮች · ግርጌ ጽሑፍ እና የድምፅ መግለጫ`
    : `1:00 · ${cues.length} lines · captions and audio description`;
}
function tabs() {
  const names = ["chapters", "words", "transcript"];
  const buttons = [...document.querySelectorAll(".ptabs [role=tab]")];
  function select(i) {
    buttons.forEach((button, n) => {
      const on = n === i;
      button.setAttribute("aria-selected", on ? "true" : "false");
      button.tabIndex = on ? 0 : -1;
      document.getElementById(names[n]).hidden = !on;
    });
    document.getElementById("panel-body").setAttribute("aria-labelledby", buttons[i].id);
  }
  buttons.forEach((button, i) => button.addEventListener("click", () => select(i)));
}
async function words() {
  const data = await fetch("data/glossary.json").then((response) => response.json());
  const box = document.getElementById("words");
  data.terms.forEach((term) => {
    const row = document.createElement("div");
    row.className = "word";
    row.innerHTML = `<span class="swatch" aria-hidden="true"></span><span><b></b><i lang="am"></i></span><button type="button" class="show-sign"></button>`;
    row.querySelector("b").textContent = term.en;
    row.querySelector("i").textContent = term.am;
    const button = row.querySelector("button");
    button.textContent = am() ? "ምልክት አሳይ" : "Show sign";
    button.addEventListener("click", () => root()?.querySelector("[data-id=glossary]")?.click());
    box.append(row);
  });
}
function ready(fn) {
  const timer = setInterval(() => { if (video()) { clearInterval(timer); fn(); } }, 40);
}
document.getElementById("poster-play")?.addEventListener("click", () => ready(() => root().querySelector("[data-id=play]")?.click()));
document.querySelectorAll(".chapter").forEach((button) => button.addEventListener("click", () => seek(Number(button.dataset.t))));
document.getElementById("line-prev")?.addEventListener("click", () => seek(cues[Math.max(0, index - 1)]?.start || 0));
document.getElementById("line-next")?.addEventListener("click", () => seek(cues[Math.min(cues.length - 1, index + 1)]?.start || 0));
document.getElementById("line-again")?.addEventListener("click", () => seek(cues[index]?.start || 0));
document.getElementById("save-off")?.addEventListener("click", (event) => {
  const on = event.currentTarget.getAttribute("aria-pressed") !== "true";
  event.currentTarget.setAttribute("aria-pressed", on ? "true" : "false");
  localStorage.setItem("db-demo:lesson-saved", on ? "1" : "0");
  document.getElementById("lesson-status").textContent = on
    ? (am() ? "በዚህ መሣሪያ ላይ ተቀምጧል" : "Saved on this device")
    : (am() ? "ከዚህ መሣሪያ ተወግዷል" : "Removed from this device");
});
document.getElementById("share")?.addEventListener("click", async () => {
  try { await navigator.clipboard.writeText(location.href); } catch (error) {}
  document.getElementById("lesson-status").textContent = am() ? "ሊንኩ ተቀድቷል" : "Link copied";
});
document.getElementById("copy-code")?.addEventListener("click", async () => {
  try { await navigator.clipboard.writeText(document.getElementById("code-now").textContent); } catch (error) {}
  document.getElementById("lesson-status").textContent = am() ? "ተቀድቷል" : "Copied";
});
if (localStorage.getItem("db-demo:lesson-saved") === "1") document.getElementById("save-off")?.setAttribute("aria-pressed", "true");
tabs();
loadCues();
words();
ready(() => {
  const node = video();
  node.addEventListener("play", () => { document.getElementById("poster-card").hidden = true; });
  node.addEventListener("timeupdate", onTime);
});
document.getElementById("lang")?.addEventListener("click", () => loadCues());
