// FR-DEAF-02: Drag anywhere inside the stage, pinch, and the corner grip.
import { fromFractions, magnet, toFractions } from "./sign-geometry.js";

function limits(win) {
  if (!win.pinSize) return { lo: 0.18, hi: 0.55 };
  return { lo: Math.min(0.45, Number(win.minScale) || 0.1), hi: Number(win.maxScale) || 0.45 };
}

function boxOf(win, sw, sh) {
  if (!win.pinSize) return fromFractions(win.frac, sw, sh);
  const { lo, hi } = limits(win);
  let w = Math.min(sw * hi, Math.max(sw * lo, win.frac.w * sw));
  let h = w / 0.75;
  if (h > sh) { h = sh; w = h * 0.75; }
  return {
    w, h,
    x: Math.max(0, Math.min(win.frac.x * sw, sw - w)),
    y: Math.max(0, Math.min(win.frac.y * sh, sh - h))
  };
}

export function bindSignPointer(win) {
  const pts = new Map();
  let pinch = null;

  win.root.addEventListener("pointerdown", (event) => {
    if (!win.floating || event.target.closest(".sign-icon, .sign-menu")) return;
    win.root.setPointerCapture(event.pointerId);
    pts.set(event.pointerId, {
      ox: event.clientX, oy: event.clientY, lx: event.clientX, ly: event.clientY,
      grip: event.target.closest(".sign-grip")
    });
    pinch = null;
  });

  win.root.addEventListener("pointermove", (event) => {
    const point = pts.get(event.pointerId);
    if (!point || !win.frac) return;
    const sw = win.stage.clientWidth || 1;
    const sh = win.stage.clientHeight || 1;
    if (pts.size >= 2) {
      point.lx = event.clientX;
      point.ly = event.clientY;
      pinchTo();
      return;
    }
    if (point.grip) resize(point, event, sw, sh);
    else drag(point, event, sw, sh);
  });

  function finish(event) {
    const point = pts.get(event.pointerId);
    pts.delete(event.pointerId);
    if (!point || pts.size || !win.frac) return;
    const travel = Math.hypot(event.clientX - point.ox, event.clientY - point.oy);
    if (travel < 8 && event.pointerType === "touch" && !point.grip) { win.tap(); return; }
    if (travel < 8) return;
    const sw = win.stage.clientWidth || 1;
    const sh = win.stage.clientHeight || 1;
    win.frac = toFractions(magnet(boxOf(win, sw, sh), sw, sh, 12), sw, sh);
    win.userPlaced = true;
    win.place();
    win.hooks.save?.();
    const root = win.root.getRootNode();
    if (root.activeElement === win.root) win.root.blur();
  }

  win.root.addEventListener("pointerup", finish);
  win.root.addEventListener("pointercancel", finish);

  function pinchTo() {
    const [a, b] = [...pts.values()];
    const dist = Math.hypot(a.lx - b.lx, a.ly - b.ly) || 1;
    if (!pinch) pinch = { dist, w: win.frac.w };
    const { lo, hi } = limits(win);
    win.frac.w = Math.min(hi, Math.max(lo, pinch.w * dist / pinch.dist));
    win.userMoved = true;
    win.userPlaced = true;
    win.place();
  }

  function drag(point, event, sw, sh) {
    const box = boxOf(win, sw, sh);
    const moved = { x: box.x + event.clientX - point.lx, y: box.y + event.clientY - point.ly, w: box.w, h: box.h };
    point.lx = event.clientX;
    point.ly = event.clientY;
    win.userMoved = true;
    win.frac = toFractions(moved, sw, sh);
    win.place();
  }

  function resize(point, event, sw, sh) {
    const corner = [...point.grip.classList].find((name) => name.startsWith("grip-"))?.slice(5) || "br";
    const grow = (corner[1] === "l" ? -1 : 1) * (event.clientX - point.lx);
    point.lx = event.clientX;
    point.ly = event.clientY;
    const { lo, hi } = limits(win);
    const box = boxOf(win, sw, sh);
    win.frac.w = Math.min(hi, Math.max(lo, (box.w + grow) / sw));
    const next = boxOf(win, sw, sh);
    if (corner[1] === "l") win.frac.x = (box.x + box.w - next.w) / sw;
    if (corner[0] === "t") win.frac.y = (box.y + box.h - next.h) / sh;
    win.frac = toFractions(boxOf(win, sw, sh), sw, sh);
    win.userMoved = true;
    win.userPlaced = true;
    win.place();
  }
}
