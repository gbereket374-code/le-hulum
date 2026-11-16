// NFR-A11Y-01: Language, theme, menu, and the learner settings sheet.
import { mountShell } from "./shell.js";

const NEEDS = [["sign", "Sign language", "ምልክት ቋንቋ"], ["cap", "Captions", "ግርጌ ጽሑፍ"], ["ad", "Audio description", "የድምፅ መግለጫ"], ["hear", "Hearing support", "የመስማት ድጋፍ"], ["data", "Data saver", "ዳታ ቆጣቢ"]];
const SIZES = [["100", "Text 100%", "ጽሑፍ 100%"], ["125", "Text 125%", "ጽሑፍ 125%"], ["150", "Text 150%", "ጽሑፍ 150%"]];
const KEY = "db-demo:prefs";

function prefs() {
  try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (error) { return {}; }
}
function save(next) { localStorage.setItem(KEY, JSON.stringify(next)); }
function am() { return document.documentElement.lang === "am"; }
function paintTheme() {
  const name = document.documentElement.dataset.theme || "dark";
  document.querySelectorAll("#themes button").forEach((button) => {
    button.setAttribute("aria-current", button.dataset.theme === name ? "true" : "false");
  });
}
function apply(stored) {
  document.documentElement.dataset.size = stored.size || "100";
  if (stored.motion === "reduce") document.documentElement.dataset.motion = "reduce";
  else document.documentElement.removeAttribute("data-motion");
}

mountShell();
const stored = prefs();
apply(stored);
paintTheme();
const pill = document.querySelector(".pill");
const onScroll = () => pill?.classList.toggle("scrolled", window.scrollY > 24);
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

document.getElementById("lang")?.addEventListener("click", () => {
  const next = am() ? "en" : "am";
  document.documentElement.lang = next;
  localStorage.setItem("db-demo:lang", next);
});
document.getElementById("theme")?.addEventListener("click", () => {
  const open = document.getElementById("themes").hidden;
  document.getElementById("themes").hidden = !open;
  document.getElementById("theme").setAttribute("aria-expanded", open ? "true" : "false");
});
document.getElementById("themes")?.addEventListener("click", (event) => {
  const theme = event.target.closest("button")?.dataset.theme;
  if (!theme) return;
  document.documentElement.dataset.theme = theme;
  localStorage.setItem("db-demo:theme", theme);
  document.getElementById("themes").hidden = true;
  document.getElementById("theme").setAttribute("aria-expanded", "false");
  paintTheme();
});
document.getElementById("menu")?.addEventListener("click", () => {
  const nav = document.getElementById("nav-menu");
  const open = nav.hidden;
  nav.hidden = !open;
  document.getElementById("menu").setAttribute("aria-expanded", open ? "true" : "false");
});
document.getElementById("ann-x")?.addEventListener("click", () => {
  document.querySelector(".ann").hidden = true;
  sessionStorage.setItem("lh-ann", "off");
});

const needs = stored.needs || { sign: true, cap: true, ad: false, hear: false, data: false };
const needBox = document.getElementById("needs");
for (const [id, en, amLabel] of NEEDS) {
  const button = document.createElement("button");
  button.type = "button";
  button.setAttribute("aria-pressed", needs[id] ? "true" : "false");
  button.dataset.need = id;
  button.innerHTML = `<span class="en-only">${en}</span><span class="am-only" lang="am">${amLabel}</span>`;
  button.addEventListener("click", () => {
    const on = button.getAttribute("aria-pressed") !== "true";
    button.setAttribute("aria-pressed", on ? "true" : "false");
    const next = prefs();
    next.needs = { ...needs, ...(next.needs || {}), [id]: on };
    save(next);
  });
  needBox.append(button);
}
const sizeBox = document.getElementById("sizes");
for (const [id, en, amLabel] of SIZES) {
  const button = document.createElement("button");
  button.type = "button";
  button.dataset.size = id;
  button.setAttribute("aria-pressed", (stored.size || "100") === id ? "true" : "false");
  button.innerHTML = `<span class="en-only">${en}</span><span class="am-only" lang="am">${amLabel}</span>`;
  button.addEventListener("click", () => {
    sizeBox.querySelectorAll("button").forEach((item) => item.setAttribute("aria-pressed", item === button ? "true" : "false"));
    const next = prefs();
    next.size = id;
    save(next);
    apply(next);
  });
  sizeBox.append(button);
}
const sheet = document.getElementById("settings");
const opener = document.getElementById("a11y");
opener?.addEventListener("click", () => { sheet.showModal(); });
document.getElementById("set-close")?.addEventListener("click", () => sheet.close());
sheet?.addEventListener("close", () => opener.focus());
document.getElementById("motion")?.addEventListener("click", (event) => {
  const next = prefs();
  next.motion = next.motion === "reduce" ? "system" : "reduce";
  event.currentTarget.setAttribute("aria-pressed", next.motion === "reduce" ? "true" : "false");
  save(next);
  apply(next);
});
document.getElementById("reset")?.addEventListener("click", () => {
  localStorage.removeItem(KEY);
  document.documentElement.dataset.size = "100";
  document.documentElement.removeAttribute("data-motion");
  needBox.querySelectorAll("button").forEach((button) => button.setAttribute("aria-pressed", button.dataset.need === "sign" || button.dataset.need === "cap" ? "true" : "false"));
  sizeBox.querySelectorAll("button").forEach((button) => button.setAttribute("aria-pressed", button.dataset.size === "100" ? "true" : "false"));
});
document.getElementById("copy")?.addEventListener("click", async () => {
  const code = document.getElementById("install")?.textContent || "";
  try { await navigator.clipboard.writeText(code); } catch (error) { return; }
  const status = document.getElementById("copied");
  if (status) status.textContent = am() ? "ተቀድቷል" : "Copied";
});
