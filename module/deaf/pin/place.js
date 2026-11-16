// FR-DEAF-01, FR-IN-04: Park the signer so it does not cover the sentence.
const KEY = "db-player:prefs";
const ASPECT = 3 / 4;

function hits(box, rect) {
  if (!rect || !rect.width) return false;
  return !(box.x + box.w < rect.left || box.x > rect.right || box.y + box.h < rect.top || box.y > rect.bottom);
}

function prefs() {
  try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (e) { return {}; }
}

export function savePinSize(width) {
  const next = { ...prefs(), signPinSize: Math.round(width) };
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch (e) { /* private mode */ }
}

export function pinWidth(sw, saved) {
  const cap = sw * 0.45;
  if (sw < 30 * 16) return Math.min(cap, Math.max(120, sw * 0.42));
  const want = Number(saved) > 0 ? Number(saved) : 240;
  return Math.min(cap, Math.max(200, want));
}

function sizeOf(sw, sh, saved) {
  let w = pinWidth(sw, saved);
  let h = w / ASPECT;
  if (h > sh - 16) { h = Math.max(80, sh - 16); w = h * ASPECT; }
  return { w, h };
}

function furthest(sw, sh, w, h, rect) {
  const spots = [
    { x: 16, y: 16 },
    { x: Math.max(0, sw - w - 16), y: 16 },
    { x: 16, y: Math.max(0, sh - h - 16) },
    { x: Math.max(0, sw - w - 16), y: Math.max(0, sh - h - 16) }
  ];
  if (!rect || !rect.width) return { ...spots[1], w, h };
  const cx = (rect.left + rect.right) / 2;
  const cy = (rect.top + rect.bottom) / 2;
  const ranked = spots.map((spot) => {
    const box = { ...spot, w, h };
    return { box, hit: hits(box, rect), d: Math.hypot(spot.x + w / 2 - cx, spot.y + h / 2 - cy) };
  }).sort((a, b) => (a.hit - b.hit) || (b.d - a.d));
  return ranked[0].box;
}

function phoneBox(sw, sh, rect) {
  const fit = sizeOf(sw, sh, 0);
  const h = Math.min(fit.h, sh * 0.45);
  const w = h * ASPECT;
  const low = rect && rect.width && rect.bottom > sh * 0.45;
  const below = low ? sh - rect.bottom - 16 : 0;
  if (low && below >= 140) {
    const useH = Math.min(h, below);
    return { x: 8, y: rect.bottom + 8, w: useH * ASPECT, h: useH };
  }
  if (low) {
    const useH = Math.min(h, Math.max(120, rect.top - 24));
    return { x: 8, y: 8, w: useH * ASPECT, h: useH };
  }
  return { x: 8, y: Math.max(0, sh - h - 8), w, h };
}

function clearOf(box, rect, sw, sh) {
  if (!hits(box, rect)) return box;
  const below = sh - rect.bottom - 16;
  const above = rect.top - 16;
  if (below >= box.h) return { ...box, y: Math.min(sh - box.h, rect.bottom + 8) };
  if (above >= box.h) return { ...box, y: Math.max(0, rect.top - box.h - 8) };
  if (sw - rect.right - 16 >= box.w) return { ...box, x: rect.right + 8 };
  if (rect.left - 16 >= box.w) return { ...box, x: Math.max(0, rect.left - box.w - 8) };
  return box;
}

function apply(win, box, sw, sh) {
  win.frac = { x: box.x / sw, y: box.y / sh, w: box.w / sw };
  win.root.classList.toggle("menu-in", box.x + box.w / 2 > sw / 2);
  win.root.style.width = box.w + "px";
  win.root.style.height = box.h + "px";
  win.root.style.left = box.x + "px";
  win.root.style.top = box.y + "px";
  const cx = box.x + box.w / 2;
  const cy = box.y + box.h / 2;
  win.grip.className = "sign-grip grip-" + (cy > sh / 2 ? "t" : "b") + (cx > sw / 2 ? "l" : "r");
  win.paint();
  win.hooks.moved?.();
}

export function bindPinWindow(win) {
  win.pinSize = true;
  win._pinPx = Number(prefs().signPinSize) || 0;
  win.minScale = 200 / (window.innerWidth || 800);
  win.maxScale = 0.45;
  win.resize = (direction) => {
    const sw = win.stage.clientWidth || window.innerWidth;
    if (sw < 30 * 16) return;
    const current = win.root.offsetWidth || win._pinPx || 240;
    const next = pinWidth(sw, current + direction * 24);
    if (Math.round(next) === Math.round(current)) return;
    win._pinPx = next;
    win.userMoved = false;
    win.userPlaced = true;
    win.place();
    win.hooks.announce?.(direction > 0 ? "sign_larger" : "sign_smaller");
    win.hooks.save?.();
  };
  win.place = function pinPlace() {
    const sw = this.stage.clientWidth || window.innerWidth;
    const sh = this.stage.clientHeight || window.innerHeight;
    this.stage.classList.remove("sign-first");
    this.minScale = 200 / sw;
    this.maxScale = 0.45;
    const narrow = sw < 30 * 16;
    let box;
    if (narrow) box = phoneBox(sw, sh, this._sentence);
    else if (this.userMoved && this.frac) {
      const sized = sizeOf(sw, sh, this.frac.w * sw);
      box = clearOf({
        x: Math.max(0, Math.min(this.frac.x * sw, sw - sized.w)),
        y: Math.max(0, Math.min(this.frac.y * sh, sh - sized.h)),
        w: sized.w, h: sized.h
      }, this._sentence, sw, sh);
    } else {
      const sized = sizeOf(sw, sh, this._pinPx);
      box = clearOf(furthest(sw, sh, sized.w, sized.h, this._sentence), this._sentence, sw, sh);
    }
    apply(this, box, sw, sh);
  };
}

export function placeSigner(win, rect) {
  win._sentence = rect;
  win.userMoved = false;
  win.layout = "lesson-first";
  win.userPlaced = true;
  win.place();
}

export function placeTray(tray, frame, rect) {
  const narrow = window.innerWidth < 30 * 16;
  const width = Math.min(window.innerWidth - 16, Math.max(frame.width || 240, narrow ? 220 : 240));
  const left = Math.max(8, Math.min(narrow ? 8 : frame.left || 8, window.innerWidth - width - 8));
  let top = frame.bottom + 8;
  let height = narrow ? Math.min(180, window.innerHeight * 0.28) : 210;
  if (narrow && frame.top > 80) top = Math.max(8, frame.top - height - 8);
  else {
    let limit = window.innerHeight - 8;
    const hitsRow = rect && rect.left < left + width && rect.right > left;
    if (hitsRow && rect.top > top + 72) limit = rect.top - 8;
    height = Math.min(height, Math.max(96, limit - top));
  }
  const covers = rect && top < rect.bottom && top + height > rect.top && rect.left < left + width && rect.right > left;
  if (covers) {
    const gap = rect.top - (narrow ? 8 : frame.bottom + 8);
    if (gap > 72) {
      top = narrow ? Math.max(8, rect.top - height - 8) : frame.bottom + 8;
      height = Math.min(height, gap - 8);
    } else top = Math.min(window.innerHeight - height - 8, Math.max(8, rect.bottom + 8));
  }
  tray.style.boxSizing = "border-box";
  tray.style.width = width + "px";
  tray.style.maxHeight = height + "px";
  tray.style.left = left + "px";
  tray.style.top = Math.max(8, top) + "px";
}
