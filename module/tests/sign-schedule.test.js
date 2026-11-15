// FR-DEAF-05, FR-DEAF-06: Queue order, boundary holds, catch-up, lesson end, and seek.
import assert from "node:assert/strict";
import test from "node:test";
import {
  SCHEDULE, afterSeek, afterSkip, boundaryOf, catchUpRate, countsAsHold, dueIndex, endWait,
  holdDecision, lagSeconds, mediaUntil, pauseAffectsSigner, playableSegments, pointInSegment,
  predictHold, queueStart, signMode, signSpan
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

test("a hold is only at a cue boundary, and only when h is at least 0.5 s", () => {
  const boundary = boundaryOf(queue[0], queue[1]);
  assert.equal(boundary, 2.4);
  assert.equal(holdDecision({ wait: true, time: 1.2, boundary, h: 2 }), false);
  assert.equal(holdDecision({ wait: true, time: 0.2, boundary: null, h: 3 }), false);
  assert.equal(predictHold(2.6, 1).hold, true);
  assert.equal(predictHold(2.49, 1).hold, false);
  assert.equal(predictHold(2, 1).hold, false);
  assert.ok(predictHold(1.5, 1).h < 0);
  assert.equal(holdDecision({ wait: true, time: boundary, boundary, h: 0.49 }), false);
  assert.equal(holdDecision({ wait: true, time: boundary, boundary, h: 0.5 }), true);
  assert.equal(holdDecision({ wait: false, time: boundary, boundary, h: 2 }), false);
  assert.equal(mediaUntil(queue, 0, 1, 1), 1.6);
  assert.equal(dueIndex(queue, 1, -1), 0);
  assert.equal(lagSeconds(queue, 3.5, 0), 3.5 - 2.82);
  assert.equal(SCHEDULE.minHold, 0.5);
  assert.equal(SCHEDULE.maxLag, 2);
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
  assert.equal(holdDecision({ wait: true, time: 2.6, boundary, h: 2 }), false);
});
