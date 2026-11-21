// FR-IN-04, FR-DEAF-01, NFR-A11Y: Hover, focus, or tap shows a Sign button. Only choosing it signs.
import { blockAt, blocksIn } from "./page.js";

const HIDE_MS = 300;
const GAP = 6;
const NS = "http://www.w3.org/2000/svg";
const ICONS = { play: "M8 5v14l11-7z", pause: "M7 5h3v14H7zm7 0h3v14h-3z" };

function icon(kind) {
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("aria-hidden", "true");
  const path = document.createElementNS(NS, "path");
  path.setAttribute("d", ICONS[kind]);
  svg.append(path);
  return svg;
}

export function bindSignButton(host) {
  const { sign, area, pause } = host.refs;
  let block = null;
  let lastLive = null;
  let origin = null;
  let over = false;
  let timer = 0;
  let frame = 0;
  let pointer = "";
  let drawn = "";

  const live = () => {
    const range = host.session?.range();
    return range ? blockAt(range.startContainer, host.scope()) : null;
  };

  function paint(current) {
    const mine = Boolean(block) && block === current;
    const paused = mine && host.session.status() === "paused";
    const kind = mine && !paused ? "pause" : "play";
    const label = !mine ? "Sign this paragraph" : host.t(paused ? "pin_resume" : "pin_pause");
    sign.setAttribute("aria-label", label);
    if (drawn !== kind) {
      sign.replaceChildren(icon(kind));
      sign.dataset.state = kind;
      drawn = kind;
    }
  }

  function place(current = live()) {
    area.hidden = !current;
    if (current) {
      const box = current.getBoundingClientRect();
      area.style.left = box.left - 4 + "px";
      area.style.top = box.top - 4 + "px";
      area.style.width = box.width + 8 + "px";
      area.style.height = box.height + 8 + "px";
    }
    if (!block?.isConnected) {
      block = null;
      sign.hidden = true;
      return;
    }
    const rect = block.getBoundingClientRect();
    const away = rect.bottom < 0 || rect.top > window.innerHeight;
    sign.hidden = away && !sign.matches(":focus");
    if (sign.hidden) return;
    const size = sign.offsetWidth;
    const room = rect.left - size - GAP >= 4;
    const left = room ? rect.left - size - GAP : Math.max(4, rect.left);
    const top = room ? rect.top : rect.top - size - GAP;
    sign.style.left = Math.min(left, window.innerWidth - size - 4) + "px";
    sign.style.top = Math.max(4, Math.min(top, window.innerHeight - size - 4)) + "px";
  }

  function sync() {
    const current = live();
    paint(current);
    place(current);
  }

  function showOn(next) {
    clearTimeout(timer);
    block = next;
    sync();
  }

  function settle() {
    if (sign.matches(":focus-visible") || block?.querySelector(":focus-visible")) return;
    block = live();
    sync();
  }

  function hideSoon() {
    clearTimeout(timer);
    timer = setTimeout(settle, HIDE_MS);
  }

  function choose() {
    if (!block) return;
    if (block === live()) { pause.click(); return; }
    const blocks = blocksIn(host.scope());
    const index = blocks.findIndex((row) => row.node === block);
    if (index < 0) return;
    host.closePanel(false);
    host.session.start(blocks.slice(index), 0, false);
  }

  const onOver = (event) => {
    if (event.pointerType === "touch" || event.buttons) return;
    const path = event.composedPath();
    if (path.includes(sign)) { over = true; clearTimeout(timer); return; }
    const next = path.includes(host) ? null : blockAt(path[0], host.scope());
    over = Boolean(next);
    if (next) showOn(next);
    else hideSoon();
  };
  const onOut = (event) => {
    if (event.pointerType === "touch" || event.relatedTarget) return;
    over = false;
    hideSoon();
  };
  const onDown = (event) => { pointer = event.pointerType; };
  const onTap = (event) => {
    if ((event.pointerType || pointer) !== "touch" || !event.detail) return;
    const path = event.composedPath();
    if (path.includes(host)) return;
    const next = blockAt(path[0], host.scope());
    if (next) showOn(next);
    else { block = live(); sync(); }
  };
  const onFocusIn = (event) => {
    const target = event.composedPath()[0];
    if (target === sign) { clearTimeout(timer); return; }
    if (event.composedPath().includes(host) || !target.matches?.(":focus-visible")) return;
    const next = blockAt(target, host.scope());
    if (next) { origin = target; showOn(next); }
    else hideSoon();
  };
  const onFocusOut = () => { if (!over) hideSoon(); };
  const onTab = (event) => {
    if (event.key !== "Tab" || sign.hidden) return;
    if (host.shadowRoot.activeElement === sign) {
      if (!origin?.isConnected) return;
      if (event.shiftKey) event.preventDefault();
      origin.focus();
      return;
    }
    if (event.shiftKey) return;
    const active = document.activeElement;
    const blank = !active || active === document.body;
    if (!blank && !block?.contains(active)) return;
    event.preventDefault();
    origin = blank ? null : active;
    sign.focus();
  };
  const onMove = () => {
    if (frame) return;
    frame = requestAnimationFrame(() => { frame = 0; place(); });
  };

  sign.addEventListener("click", choose);
  document.addEventListener("pointerover", onOver, { passive: true });
  document.addEventListener("pointerout", onOut, { passive: true });
  document.addEventListener("pointerdown", onDown, { capture: true, passive: true });
  document.addEventListener("click", onTap);
  document.addEventListener("focusin", onFocusIn);
  document.addEventListener("focusout", onFocusOut);
  document.addEventListener("keydown", onTab, true);
  window.addEventListener("scroll", onMove, { capture: true, passive: true });
  window.addEventListener("resize", onMove);

  return {
    changed() {
      const current = live();
      if (current && (!block || block === lastLive)) {
        if (block !== current) over = false;
        block = current;
      }
      lastLive = current;
      if (!current && !over) hideSoon();
      sync();
    },
    destroy() {
      clearTimeout(timer);
      cancelAnimationFrame(frame);
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerout", onOut);
      document.removeEventListener("pointerdown", onDown, true);
      document.removeEventListener("click", onTap);
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
      document.removeEventListener("keydown", onTab, true);
      window.removeEventListener("scroll", onMove, true);
      window.removeEventListener("resize", onMove);
    }
  };
}
