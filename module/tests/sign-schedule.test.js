// FR-DEAF-05, FR-DEAF-06: Queue order, boundary holds, catch-up, lesson end, and seek.
import assert from "node:assert/strict";
import test from "node:test";
import {
  SCHEDULE, afterFailure, afterSeek, afterSkip, boundaryOf, catchUpRate, countsAsHold, dueIndex,
  endWait, gapHold, holdDecision, inSentence, lagSeconds, mediaUntil, openRun, pauseAffectsSigner,
  playbackCause, playableSegments, pointInSegment, projectedLag, queueStart, resumeSigner, signMode,
  signSpan, watchHold
} from "../deaf/sign-schedule.js";

const queue = [
  { cue: "A01", start: 0.78, end: 2.4, source: "memory", src: "a.mp4", from: 0.4, to: 3.0 },
  { cue: "A02", start: 2.82, end: 5.2, source: "memory", src: "b.mp4", from: 0.2, to: 2.0 }
];

test("json is cue mode and a video file stays continuous", () => {
  assert.equal(signMode("data/sign.json"), "cues");
  assert.equal(signMode("data/A_full.mp4#t=4.950"), "continuous");
});

test("segments play back to back, never before their cue", () => {
  assert.equal(queueStart(queue, 0, null), 0.78);
  assert.equal(queueStart(queue, 1, 2.0), 2.82);
  assert.equal(queueStart(queue, 1, 4.5), 4.5);
  assert.equal(signSpan(queue[0]), 2.6);
});

test("a hold is only in the gap and only when it is at least 0.5 s", () => {
  const boundary = boundaryOf(queue[0], queue[1]);
  assert.equal(boundary, 2.4);
  const gap = { wait: true, time: 2.45, boundary, cues: queue, h: 1.2, nextStart: 2.82 };
  assert.equal(holdDecision(gap), true);
  assert.equal(holdDecision({ ...gap, time: 1.2 }), false);
  assert.equal(holdDecision({ ...gap, h: 0.4 }), false);
  assert.equal(holdDecision({ ...gap, wait: false }), false);
  assert.equal(holdDecision({ ...gap, boundary: null }), false);
  assert.equal(inSentence(queue, 1.2), true);
  assert.equal(mediaUntil(queue, 0, 1, 1), 1.6);
  assert.equal(dueIndex(queue, 1, -1), 0);
  assert.equal(lagSeconds(queue, 3.5, 0), 3.5 - 2.82);
  assert.equal(SCHEDULE.maxLag, 3);
});

test("a hold does not pause the signer, a user pause does, and skip releases", () => {
  assert.equal(pauseAffectsSigner({ holding: true, userAction: false }), false);
  assert.equal(pauseAffectsSigner({ holding: true, userAction: true }), true);
  assert.equal(pauseAffectsSigner({ holding: false, userAction: false }), true);
  assert.equal(afterSkip().holding, false);
});

test("the end wait is not counted as a hold", () => {
  assert.equal(countsAsHold("boundary"), true);
  assert.equal(countsAsHold("end"), false);
  assert.equal(endWait(true, true), true);
  assert.equal(endWait(true, false), false);
  assert.equal(endWait(false, true), false);
});

test("catch-up is 1.10x only after the signer is 0.8 s behind", () => {
  assert.equal(catchUpRate(1, 0.5), 1);
  assert.ok(Math.abs(catchUpRate(0.75, 1) - 0.825) < 1e-9);
  assert.ok(catchUpRate(0.85, 4) <= 0.85 * 1.1 + 1e-9);
});

test("media.play() start is a user play and a hold pause is not", () => {
  assert.equal(playbackCause({ type: "play", own: false }), "user-play");
  assert.equal(playbackCause({ type: "pause", own: true }), "hold");
  assert.equal(playbackCause({ type: "pause", own: false }), "user-pause");
  assert.equal(resumeSigner({ holding: true, userPaused: false, signerPaused: true }), true);
  assert.equal(resumeSigner({ holding: true, userPaused: true, signerPaused: true }), false);
  assert.equal(resumeSigner({ holding: false, userPaused: false, signerPaused: true }), false);
});

test("a hold releases on the watchdog and cannot last forever", () => {
  assert.equal(watchHold({ held: 5, remain: 1, quiet: 0 }), true);
  assert.equal(watchHold({ held: 1, remain: 10, quiet: 3 }), true);
  assert.equal(watchHold({ held: 2, remain: 10, quiet: 1 }), false);
  assert.equal(watchHold({ held: 3, remain: 1, quiet: 0 }), false);
});

test("A01 ends at 2.40 s and holds about 2.3 s for A02, never at 0.83 s", () => {
  const cues = [
    { cue: "A01", start: 0.781, end: 2.398, src: "a.mp4", from: 0, to: 7.25 },
    { cue: "A02", start: 2.818, end: 5.281, src: "b.mp4", from: 0, to: 3.7 },
    { cue: "A03", start: 5.281, end: 8.397, src: "c.mp4", from: 0, to: 4.15 }
  ];
  const remain = 7.25 - (2.4 - 0.85);
  const h = gapHold({ remain, signRate: 1, captionIn: 2.818 - 2.4, lessonRate: 1 });
  assert.ok(Math.abs(h - 2.28) < 0.05);
  assert.equal(inSentence(cues, 0.83), true);
  assert.equal(holdDecision({ wait: true, time: 0.83, boundary: 2.398, cues, h, nextStart: 2.818 }), false);
  assert.equal(inSentence(cues, 2.4), false);
  assert.equal(holdDecision({ wait: true, time: 2.4, boundary: 2.398, cues, h, nextStart: 2.818 }), true);
  assert.equal(holdDecision({ wait: true, time: 2.36, boundary: 2.398, cues, h, nextStart: 2.818 }), true);
  assert.equal(holdDecision({ wait: true, time: 2.2, boundary: 2.398, cues, h, nextStart: 2.818 }), false);
  assert.equal(holdDecision({ wait: true, time: 2.4, boundary: 2.398, cues, h: 0.4, nextStart: 2.818 }), false);
  assert.deepEqual(openRun(cues, 1), [1, 2]);
  const later = gapHold({ remain: remain + 3.7, signRate: 1, captionIn: 5.281 - 2.4, lessonRate: 1 });
  assert.ok(later > h);
  assert.ok(Math.abs(projectedLag(4.4, 1.1) - 4) < 1e-9);
});

test("a failed segment is skipped once and the next cue does not wait for it", () => {
  const first = afterFailure(4, false);
  const again = afterFailure(4, true);
  assert.equal(first.skipped, 4);
  assert.equal(first.done, 4);
  assert.equal(first.play, -1);
  assert.equal(first.next, 5);
  assert.equal(first.card, true);
  assert.equal(again.card, false);
  const cues = [0, 1, 2, 3, 4, 5].map((id) => ({ cue: "A" + id, start: id, end: id + 1, src: "a.mp4", from: 0, to: id === 4 ? 5 : 2 }));
  const skipped = [];
  skipped[4] = true;
  assert.equal(mediaUntil(cues, 4, signSpan(cues[4]), 6, skipped), signSpan(cues[5]));
  assert.equal(mediaUntil(cues, 3, 0, 6, skipped), signSpan(cues[3]) + signSpan(cues[5]));
});

test("a seek clears the lag and lands inside the clip", () => {
  const landed = afterSeek(queue, 5);
  assert.equal(landed.lag, 0);
  assert.equal(landed.segment.cue, "A02");
  assert.ok(Math.abs(landed.point.time - pointInSegment(queue[1], 5).time) < 1e-9);
  assert.ok(landed.point.time >= 0.2 && landed.point.time <= 2);
});

test("a line with no sign is skipped and never holds", () => {
  const mixed = [queue[0], { cue: "X01", start: 2.4, end: 2.82, source: "none" }, queue[1]];
  const playable = playableSegments(mixed);
  assert.deepEqual(playable.map((segment) => segment.cue), ["A01", "A02"]);
  assert.equal(afterSeek(mixed, 2.5).segment, null);
  assert.equal(afterSeek(mixed, 2.5).lag, 0);
  const boundary = boundaryOf(playable[0], playable[1]);
  assert.equal(holdDecision({ wait: true, time: 2.6, boundary, started: -1, segment: 0 }), false);
});
