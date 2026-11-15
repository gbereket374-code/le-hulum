// FR-DEAF-01, FR-DEAF-05, FR-DEAF-07, FR-DEAF-08: Open the sign window and keep captions clear.
import { attachSignSync, nextRate } from "./sign-sync.js";
import { CSS, SignWindow } from "./sign-window.js";

const KEY = "db-player:prefs";

function prefs() {
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (error) { return {}; }
}

function store(player, patch) {
  const next = { ...prefs(), ...patch };
  player.prefs = { ...player.prefs, ...next };
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch (error) { /* private mode */ }
}

export function attachSign(player) {
  if (player.sign) return player.sign;
  const style = document.createElement("style");
  style.dataset.sign = "1";
  style.textContent = CSS;
  player.shadow.append(style);
  const saved = prefs();
  const profile = saved.profile ?? "";
  const wants = Array.isArray(profile) ? profile.includes("sign") : String(profile).split(/[\s,]+/).includes("sign");
  const stage = player.shadow.querySelector(".stage");
  let open = false;
  const none = document.createElement("p");
  none.className = "sign-none";
  none.setAttribute("role", "status");
  none.hidden = true;
  player.slots.below.append(none);
  const bus = {};
  const win = new SignWindow(stage, {
    t: (key, vars) => player.t(key, vars),
    announce: (key, vars) => player.announce(key, vars),
    close: () => api.close(),
    layout: (next) => api.setLayout(next),
    save: () => save(),
    moved: () => player.captions?.relayout?.(),
    speed() {
      win.rate = nextRate(win.rate);
      win.paint();
      player.announce("signer_speed_value", { value: win.rate + "×" });
      save();
      sync.follow();
    }
  });
  win.layout = saved.signLayout || (wants ? "sign-first" : "lesson-first");
  win.opacity = [1, 0.8, 0.6].includes(saved.signOpacity) ? saved.signOpacity : 1;
  win.rate = [1, 0.85, 0.75].includes(saved.signRate) ? saved.signRate : 1;
  const width = Number(saved.signW ?? saved.signScale);
  if (saved.signX != null && width >= 0.18 && width <= 0.55) {
    win.frac = { x: Number(saved.signX), y: Number(saved.signY) || 0, w: width };
    win.userPlaced = true;
  }
  const sync = attachSignSync(player, () => (open && none.hidden ? win.video : null), () => win.rate);
  function save() {
    store(player, {
      signLayout: win.layout, signOpacity: win.opacity, signRate: win.rate,
      signX: win.frac?.x, signY: win.frac?.y, signW: win.frac?.w
    });
  }
  function emit(name) { for (const fn of bus[name] || []) fn(); }
  const api = {
    get layout() { return win.layout; },
    get video() { return open && none.hidden ? win.video : null; },
    isOpen: () => open,
    open() {
      const src = player.host.getAttribute("sign") || "";
      open = true;
      none.textContent = player.t("sign_none");
      none.hidden = !!src;
      if (src) { win.show(src); sync.start(); } else win.hide();
      player.captions?.relayout?.();
      player._paintAll();
      emit("open");
    },
    close() {
      open = false;
      none.hidden = true;
      win.hide();
      sync.stop();
      player.captions?.relayout?.();
      player._paintAll();
      player.shadow.querySelector("[data-id=sign]")?.focus();
      emit("close");
    },
    setLayout(next) {
      win.layout = next === "lesson-first" ? "lesson-first" : "sign-first";
      if (open && none.hidden) win.place();
      player.announce(win.layout === "sign-first" ? "layout_sign_first" : "layout_lesson_first");
      save();
      player.captions?.relayout?.();
    },
    play(src, opts = {}) {
      if (!open) api.open();
      none.hidden = true;
      if (src) win.show(src);
      if (opts.from != null) win.video.currentTime = Number(opts.from) || 0;
      sync.start();
    },
    on(name, fn) { (bus[name] ||= []).push(fn); }
  };
  const setLang = player.setLang.bind(player);
  player.setLang = async (lang) => {
    await setLang(lang);
    if (open) { none.textContent = player.t("sign_none"); win.paint(); }
  };
  player.sign = api;
  return api;
}
