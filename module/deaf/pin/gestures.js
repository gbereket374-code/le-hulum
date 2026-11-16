// FR-IN-04, FR-DEAF-02, FR-DEAF-09: Drag the pin, pick a selection, and tap a glossary word.
import { blocksIn, pointIn, sentencesIn, skipped, wordAt } from "./page.js";

function intersects(outer, inner) {
  try {
    return outer.compareBoundaryPoints(Range.END_TO_START, inner) < 0 && outer.compareBoundaryPoints(Range.START_TO_END, inner) > 0;
  } catch (error) {
    return false;
  }
}

function signTip(host) {
  const tip = host.refs.tip.getBoundingClientRect();
  const hit = pointIn(tip.left + tip.width / 2, tip.bottom + 2, host.scope());
  if (!hit) return;
  const blocks = blocksIn(host.scope());
  const index = blocks.findIndex((block) => block.node === hit.block || block.node.contains(hit.block));
  host.closePanel(false);
  if (index < 0) host.session.start([{ sentences: hit.sentences }], hit.index);
  else host.session.start(blocks.slice(index), hit.index);
}

function signSelection(host) {
  const sel = document.getSelection();
  if (!sel || sel.isCollapsed || !sel.rangeCount) return false;
  const range = sel.getRangeAt(0);
  const scope = host.scope();
  if (!scope.contains(range.commonAncestorContainer) || skipped(range.startContainer)) return false;
  const blocks = blocksIn(scope).map((block) => ({
    ...block,
    sentences: block.sentences.filter((sentence) => intersects(range, sentence.range))
  })).filter((block) => block.sentences.length);
  if (!blocks.length) {
    const sentences = sentencesIn(scope).filter((sentence) => intersects(range, sentence.range));
    if (!sentences.length) return false;
    host.session.start([{ sentences }]);
  } else host.session.start(blocks);
  host.refs.pick.hidden = true;
  host.closePanel(false);
  return true;
}

function showPick(host) {
  const sel = document.getSelection();
  const range = sel && !sel.isCollapsed && sel.rangeCount ? sel.getRangeAt(0) : null;
  const node = range?.startContainer;
  const inside = node && host.scope().contains(node) && !skipped(node) && !host.shadowRoot.contains(node);
  if (!inside) { host.refs.pick.hidden = true; return; }
  const rect = range.getBoundingClientRect();
  if (!rect.width && !rect.height) { host.refs.pick.hidden = true; return; }
  host.refs.pick.hidden = false;
  host.refs.pick.style.left = Math.max(8, Math.min(rect.left, window.innerWidth - 180)) + "px";
  host.refs.pick.style.top = Math.max(8, rect.bottom + 6) + "px";
}

async function glossary(host) {
  if (host.terms) return host.terms;
  try {
    const response = await fetch("/demo/data/glossary.json");
    host.terms = response.ok ? (await response.json()).terms || [] : [];
  } catch (error) { host.terms = []; }
  return host.terms;
}

async function word(host, event) {
  if (!host.dataset.sentence || event.composedPath().includes(host)) return;
  const hit = pointIn(event.clientX, event.clientY, host.scope());
  if (!hit || hit.sentences[hit.index]?.text !== host.dataset.sentence) return;
  const text = wordAt(event.clientX, event.clientY);
  if (!text) return;
  let best = null;
  for (const term of await glossary(host)) {
    for (const form of [...(term.forms_am || []), term.am].filter(Boolean)) {
      if (text.includes(form) && (!best || form.length > best.form.length)) best = { term, form };
    }
  }
  if (!best?.term.sign) return;
  event.preventDefault();
  host.session.playWord({ src: best.term.sign, from: best.term.from || 0, to: best.term.to || 0 });
}

export function bindGestures(host) {
  let origin = null;
  let moved = false;
  const pin = host.refs.pin;
  pin.addEventListener("pointerdown", (event) => {
    moved = false;
    pin.setPointerCapture(event.pointerId);
    const rect = pin.getBoundingClientRect();
    origin = { x: event.clientX, y: event.clientY, left: rect.left, top: rect.top };
  });
  pin.addEventListener("pointermove", (event) => {
    if (!origin || !pin.hasPointerCapture(event.pointerId)) return;
    const dx = event.clientX - origin.x;
    const dy = event.clientY - origin.y;
    if (Math.hypot(dx, dy) > 4) moved = true;
    pin.style.left = origin.left + dx + "px";
    pin.style.top = origin.top + dy + "px";
    pin.style.right = "auto";
    pin.style.bottom = "auto";
  });
  pin.addEventListener("pointerup", () => { if (moved) signTip(host); origin = null; });
  pin.addEventListener("click", () => { if (!moved) signTip(host); });
  host.refs.pick.addEventListener("mousedown", (event) => event.preventDefault());
  host.refs.pick.addEventListener("click", () => signSelection(host));
  host.onKey = (event) => {
    if (event.key === "Escape" && host.refs.panel.open) {
      event.preventDefault();
      host.closePanel(true);
      return;
    }
    const field = event.target?.closest?.("input, textarea, select, [contenteditable='true']");
    if (field) return;
    if (event.altKey && event.shiftKey && event.key.toLowerCase() === "s" && signSelection(host)) event.preventDefault();
  };
  host.onSelect = () => showPick(host);
  host.onClick = (event) => word(host, event);
  host.onResize = () => {
    let tries = 0;
    clearTimeout(host.later);
    const tick = () => {
      host.session?.repark();
      if (tries++ < 4) host.later = setTimeout(tick, 120);
    };
    tick();
  };
  host.onScroll = () => {
    if (host.tick) return;
    host.tick = requestAnimationFrame(() => { host.tick = 0; host.session?.repark(); });
  };
  document.addEventListener("keydown", host.onKey);
  document.addEventListener("selectionchange", host.onSelect);
  document.addEventListener("click", host.onClick);
  window.addEventListener("resize", host.onResize);
  window.addEventListener("scroll", host.onScroll, true);
}
