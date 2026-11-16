// FR-DEAF-06: Pause the lesson at a cue boundary without pausing the signer.
import { SCHEDULE, afterFailure, afterSkip, countsAsHold, gapHold, holdDecision, inSentence, itemSpan, itemsOf, mediaUntil, openRun, playbackCause, playedSpan, resumeSigner, signSpan, watchHold } from "./sign-schedule.js";

export function attachHold(player, state, hooks) {
  const media = player.media;
  const rawPause = media.pause.bind(media);
  const rawPlay = media.play.bind(media);
  const rawToggle = player.toggle.bind(player);
  player.state = player.state || {};
  function signerAt() { return state.play >= 0 ? state.play : state.done; }
  function intoNow() {
    const video = hooks.video();
    const list = itemsOf(state.queue[state.play] || null);
    const item = list[state.item];
    if (state.play < 0 || !video || !item) return signSpan(state.queue[signerAt()] || null);
    const into = item.pause == null ? (video.currentTime || 0) - Number(item.from) : Math.min(itemSpan(item), (performance.now() - (state.pauseAt || performance.now())) / 1000);
    return Math.max(0, Math.min(signSpan(state.queue[state.play]), playedSpan(list, state.item, into)));
  }
  function unfinished() {
    if (state.play >= 0 && state.broken === state.play) return true;
    if (state.play === state.holdTarget) return false;
    return (performance.now() - state.holdStart) / 1000 + 1e-3 < (state.holdFor || 0);
  }
  function paint(showPlay) {
    const button = player.shadow.querySelector("[data-id=play]");
    if (!button) return;
    button.dataset.state = showPlay ? "play" : "pause";
    button.textContent = player.t(showPlay ? "play" : "pause");
  }
  function own(kind, run) {
    const idle = kind === "pause" ? media.paused : !media.paused;
    state.ownKind = kind; state.internal = true; run(); state.internal = false;
    if (idle) state.ownKind = "";
  }
  function release(record, force) {
    if (!state.holding) return;
    const held = (performance.now() - state.holdStart) / 1000;
    if (record && countsAsHold("boundary")) {
      state.holds.push({ from: state.holdFrom || state.queue[state.holdTarget - 1]?.cue || "", to: state.holdTo || state.queue[state.holdTarget]?.cue || "", at: state.holdAt, length: held, signer: state.signerCue || "", signStart: state.signAt, signEnd: hooks.video()?.currentTime || 0, watch: !!state.holdWatch });
    }
    const resume = (force || !state.userPaused) && media.paused;
    if (force) state.userPaused = false;
    state.ownPlay = !!resume;
    own("play", () => { if (resume) rawPlay().catch(() => {}); });
    player.state.holding = false;
    state.holding = false;
    if (!state.ending && !hooks.demo) hooks.hidePill();
    if (resume) paint(false);
    hooks.after?.();
  }
  function startHold(index, boundary) {
    const over = (media.currentTime || 0) - boundary;
    if (over > -0.05 && over < 0.3 && Math.abs(over) > 0.001) { state.snap = true; media.currentTime = boundary; }
    if (inSentence(state.queue, media.currentTime || 0)) throw new Error("hold inside a sentence");
    state.holdTarget = index;
    state.holdAt = media.currentTime || boundary;
    state.holdStart = performance.now();
    state.signAt = hooks.video()?.currentTime || 0;
    state.pillOn = false;
    player.state.holding = true;
    state.holding = true;
    state.userIntent = false;
    own("pause", () => { if (!media.paused) rawPause(); });
    if (resumeSigner({ holding: true, userPaused: state.userPaused, signerPaused: !!hooks.video()?.paused })) hooks.playSign();
  }
  function pill() {
    if (state.pillOn || performance.now() - state.holdStart < SCHEDULE.pillAfter * 1000) return;
    state.pillOn = true; hooks.showPill(); if (!state.told) { player.announce("sign_waiting_first"); state.told = true; }
  }
  function freezeEnd() {
    if (state.ending || hooks.demo || !state.wait) return;
    state.ending = true; state.endStart = performance.now(); own("pause", () => { if (!media.paused) rawPause(); });
  }
  function finishEnd() {
    if (!state.ending) return;
    state.endWait = (performance.now() - state.endStart) / 1000; state.ending = false;
    if (!hooks.demo) hooks.hidePill();
    if (state.userPaused) return;
    state.ownPlay = true;
    const tail = Number.isFinite(media.duration) ? media.duration - (media.currentTime || 0) : 1;
    if (tail < 0.05) { state.snap = true; media.currentTime = Math.max(0, media.duration - 0.15); }
    own("play", () => rawPlay().catch(() => {})); hooks.after?.();
  }
  function arm(index, span, boundary) {
    const at = signerAt();
    state.holdFor = span; state.holdSegment = index - 1; state.holdWatch = false;
    state.signMark = hooks.video()?.currentTime || 0; state.signClock = performance.now();
    state.signerCue = state.queue[at]?.cue || "";
    state.holdFrom = state.queue[index - 1]?.cue || ""; state.holdTo = state.queue[index]?.cue || "";
    startHold(index, boundary);
  }
  function consider(time) {
    if (hooks.demo || !state.wait || state.holding || state.ending || media.paused) return;
    for (let index = 1; index < state.queue.length; index += 1) {
      if (state.decided[index]) continue;
      const prev = state.queue[index - 1];
      const next = state.queue[index];
      if (time + 0.05 < prev.end) break;
      if (!(next.start > prev.end + 1e-3) || time - prev.end >= 0.3) { state.decided[index] = true; continue; }
      const at = time < next.start ? Math.max(time, prev.end) : prev.end;
      let span = 0;
      for (const cue of openRun(state.queue, index)) {
        const remain = mediaUntil(state.queue, signerAt(), intoNow(), cue, state.skipped);
        const h = gapHold({ remain, signRate: hooks.rate(), captionIn: Math.max(0, state.queue[cue].start - at), lessonRate: media.playbackRate || 1 });
        if (h > span) span = h;
      }
      state.decided[index] = true;
      if (state.play >= 0 && state.broken === state.play) span = Math.max(span, 3);
      if (!holdDecision({ wait: true, time: at, boundary: prev.end, cues: state.queue, h: span, nextStart: next.start })) continue;
      arm(index, span, prev.end);
      return;
    }
  }
  function skip() {
    if (state.ending) { state.userPaused = false; finishEnd(); return; }
    if (state.holdTarget >= 0) state.decided[state.holdTarget] = true;
    state.userPaused = false;
    if (!afterSkip().holding) release(true);
  }
  function clear() { state.holding = false; state.ending = false; player.state.holding = false; }
  media.pause = () => {
    if ((state.holding || state.ending) && !state.internal && !state.userPaused) {
      state.userPaused = true;
      hooks.pauseSign();
      paint(true);
      return;
    }
    rawPause();
  };
  player.toggle = () => {
    if ((state.holding || state.ending) && !state.userPaused) {
      state.userPaused = true;
      hooks.pauseSign();
      paint(true);
      return;
    }
    state.userIntent = true;
    rawToggle();
  };
  function drop() {
    const step = afterFailure(state.play, state.cardOnce);
    if (step.skipped >= 0 && !state.skipped?.[step.skipped]) {
      state.skipped = state.skipped || [];
      state.skipped[step.skipped] = true;
      state.done = Math.max(state.done, step.done);
      state.play = step.play; state.hitTo = true; state.broken = -1; state.failed = false;
      if (step.card) { state.cardOnce = true; hooks.card?.(); }
    }
    state.holdWatch = true;
    console.warn("sign hold released", state.holdFrom || "", state.holdTo || "");
    release(true, true);
    state.holdWatch = false;
  }
  function guard() {
    if (!state.holding || state.userPaused || state.play < 0) return;
    const video = hooks.video();
    const stalled = state.broken === state.play;
    if (!stalled && resumeSigner({ holding: true, userPaused: false, signerPaused: !!video?.paused && !state.hitTo })) hooks.playSign();
    const now = performance.now();
    const at = video?.currentTime || 0;
    if (Math.abs(at - (state.signMark ?? -1)) > 0.02) { state.signMark = at; state.signClock = now; }
    const item = itemsOf(state.queue[state.play] || null)[state.item];
    if (!stalled && item && at >= Number(item.to) - 0.12) return;
    const remain = item && video ? Math.max(0, Number(item.to) - at) : 0;
    const held = (now - state.holdStart) / 1000;
    const quiet = (now - (state.signClock || state.holdStart)) / 1000;
    if (quiet >= 3) { drop(); return; }
    if (!stalled && watchHold({ held, remain, quiet })) release(true, true);
  }
  function cause(type) {
    const own = state.internal || state.ownKind === type;
    if (own) state.ownKind = "";
    return playbackCause({ type, own });
  }
  media.addEventListener("pause", (event) => {
    if (cause("pause") === "hold") { event.stopImmediatePropagation(); return; }
    state.userPaused = true;
    hooks.pauseSign();
  }, true);
  media.addEventListener("play", (event) => {
    if (cause("play") === "hold" || state.ownPlay) { state.ownPlay = false; event.stopImmediatePropagation(); return; }
    state.userPaused = false;
    hooks.playSign();
    const keep = state.ending ? hooks.busy() : state.holding && unfinished();
    if ((state.holding || state.ending) && keep) {
      event.stopImmediatePropagation();
      if (state.holding) player.state.holding = true;
      own("pause", () => { if (!media.paused) rawPause(); });
      paint(false);
    }
  }, true);
  const session = navigator.mediaSession;
  if (session?.setActionHandler) {
    const play = () => { state.userPaused = false; if (media.paused) rawPlay().catch(() => {}); else hooks.playSign(); };
    const pause = () => { if (!media.paused) rawPause(); else { state.userPaused = true; hooks.pauseSign(); } };
    try { session.setActionHandler("play", play); session.setActionHandler("pause", pause); } catch (error) { /* unsupported */ }
  }
  return { consider, release, freezeEnd, finishEnd, skip, clear, pill, guard, caughtUp: () => !unfinished() };
}
