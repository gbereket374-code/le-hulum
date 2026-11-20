// FR-IN-04, FR-DEAF-05, FR-DEAF-09, FR-SL-09: Sign each sentence, then the next block.
import { translateText } from "./cache.js";
import { clearHighlight, reveal, showHighlight } from "./highlight.js";
import { placeSigner, placeTray } from "./place.js";
import { createPlayback } from "./play.js";
import { createQueue } from "./queue.js";
import { paintResult } from "./render.js";

function glossOf(result) {
  return (result.gloss || []).filter((item) => item.kind !== "pause").map((item) => item.gloss).filter(Boolean).join(" ");
}

export function createSession(refs, hooks) {
  const playback = createPlayback(refs.win);
  const voted = new Set();
  let queue = createQueue([]);
  let token = 0;
  let held = false;
  let waiting = null;
  let timer = 0;
  let rect = null;
  let current = null;
  let announced = -1;
  let focusOnce = false;
  let trayFrame = 0;

  function t(key, vars) { return hooks.t(key, vars); }

  function park(range) {
    rect = range?.getBoundingClientRect?.() || null;
    placeSigner(refs.win, rect);
    if (!refs.win.root.hidden) placeTray(refs.tray, refs.win.root.getBoundingClientRect(), rect);
  }

  function later(mine, run) {
    waiting = () => {
      waiting = null;
      if (mine === token && !held) run();
    };
    clearTimeout(timer);
    timer = setTimeout(() => { if (waiting) waiting(); }, 1500);
  }

  function advance() {
    if (held) return;
    if (queue.next(hooks.continueOn())) step();
    else stop(false);
  }

  function show(result, sentence, mine) {
    refs.win.show("");
    refs.tray.hidden = false;
    park(sentence.range);
    paintResult(refs, result, sentence, t, {
      voted: voted.has(sentence.text),
      playClip: (item) => playback.play([{ src: item.clip, from: item.from || 0, to: item.to || 0 }], () => {
        if (mine === token) step();
      }),
      request: () => post(sentence, result, "missing"),
      vote: (verdict, button) => {
        if (voted.has(sentence.text)) return;
        voted.add(sentence.text);
        button.setAttribute("aria-pressed", "true");
        refs.yes.disabled = true;
        refs.no.disabled = true;
        post(sentence, result, verdict);
      }
    });
    if (focusOnce) { focusOnce = false; refs.pause.focus(); }
    const clips = (result.playlist || []).filter((item) => item.src);
    if (result.layer === "none" || !clips.length) later(mine, advance);
    else playback.play(result.playlist, () => { if (mine === token && !held) advance(); });
  }

  async function step() {
    token += 1;
    const mine = token;
    held = false;
    waiting = null;
    clearTimeout(timer);
    current = queue.current();
    if (!current) { stop(false); return; }
    const sentence = current.item;
    if (current.block !== announced) {
      announced = current.block;
      refs.live.textContent = t("pin_block", {
        block: current.block + 1, sentence: current.sentence + 1, total: current.sentenceCount
      });
    }
    if (showHighlight(sentence.range)) hooks.outline(null);
    else hooks.outline(sentence.range);
    reveal(sentence.range);
    park(sentence.range);
    let result = { layer: "none", gloss: [], playlist: [], nonmanual: [] };
    try { result = await translateText(hooks.api(), sentence.text, hooks.lang()); }
    catch (error) { result = { layer: "none", gloss: [], playlist: [], nonmanual: [] }; }
    if (mine !== token) return;
    hooks.mark({
      sentence: sentence.text,
      translation: result.text_en || "",
      layer: result.layer || "",
      gloss: (result.gloss || []).map((item) => item.gloss).filter(Boolean).join(" "),
      clips: String((result.playlist || []).filter((item) => item.src).length)
    });
    show(result, sentence, mine);
  }

  function post(sentence, result, verdict) {
    fetch(hooks.api() + "/sign/review", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text_am: sentence.text, gloss: glossOf(result), verdict, note: "" })
    }).then(() => {
      if (verdict === "missing") {
        refs.request.disabled = true;
        refs.request.textContent = t("pin_requested");
      } else refs.thanks.hidden = false;
    }).catch(() => {});
  }

  function stop(focus) {
    refs.pin.hidden = true;
    token += 1;
    waiting = null;
    clearTimeout(timer);
    playback.stop();
    clearHighlight();
    hooks.outline(null);
    refs.tray.hidden = true;
    current = null;
    announced = -1;
    if (focus) hooks.focusLauncher();
  }

  refs.pause.addEventListener("click", () => {
    if (!current) return;
    if (held) {
      held = false;
      refs.pause.setAttribute("aria-pressed", "false");
      refs.pause.textContent = t("pin_pause");
      if (waiting) waiting();
      else playback.resume();
      return;
    }
    held = true;
    clearTimeout(timer);
    playback.pause();
    refs.pause.setAttribute("aria-pressed", "true");
    refs.pause.textContent = t("pin_resume");
  });
  refs.prev.addEventListener("click", () => { if (queue.prev()) step(); });
  refs.next.addEventListener("click", () => { if (queue.next(true)) step(); else stop(true); });
  refs.stop.addEventListener("click", () => stop(true));

  return {
    start(blocks, sentence = 0, focus = false) {
      queue = createQueue(blocks);
      queue.sentence = sentence;
      announced = -1;
      focusOnce = focus;
      refs.tray.hidden = false;
      step();
    },
    repark() {
      if (!current?.item?.range) return;
      if (showHighlight(current.item.range)) hooks.outline(null);
      else hooks.outline(current.item.range);
      reveal(current.item.range);
      park(current.item.range);
    },
    moved() {
      cancelAnimationFrame(trayFrame);
      trayFrame = requestAnimationFrame(() => {
        if (refs.win.root.hidden) return;
        const live = current?.item?.range?.getBoundingClientRect?.() || rect;
        placeTray(refs.tray, refs.win.root.getBoundingClientRect(), live);
      });
    },
    rate() {
      hooks.announce("signer_speed_value", { value: playback.toggleRate() + "×" });
    },
    stop,
    playWord(item) {
      const mine = token;
      playback.play([item], () => { if (mine === token) step(); });
    }
  };
}
