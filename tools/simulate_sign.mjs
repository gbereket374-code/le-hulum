// FR-DEAF-06: Boundary holds for a few lag limits. A hold is printed as A0x -> A0y.
import { readFileSync } from "fs";
import { boundaryOf, catchUpRate, endWait, holdDecision, lagSeconds, mediaUntil, playableSegments, predictHold, signSpan } from "../module/deaf/sign-schedule.js";

const DT = 0.05;

export function simulate(raw, maxLag, signRate = 1) {
  const cues = playableSegments(raw);
  const lengths = cues.map(signSpan);
  const lessonEnd = cues.reduce((end, cue) => Math.max(end, cue.end), 0);
  const decided = [];
  const episodes = [];
  let lesson = 0;
  let wall = 0;
  let play = -1;
  let done = -1;
  let into = 0;
  let holding = null;
  let endSum = 0;
  const lags = [];
  for (let step = 0; step < 40000; step += 1) {
    const started = play >= 0 ? play : done;
    const intoNow = play >= 0 ? into : (done >= 0 ? lengths[done] : 0);
    const lag = lagSeconds(cues, lesson, started);
    lags.push(lag);
    const rate = catchUpRate(signRate, lag);
    const busy = play >= 0 && into < lengths[play] - 1e-9;
    const atEnd = lesson >= lessonEnd - 1e-9;
    if (holding) {
      const left = mediaUntil(cues, started, intoNow, holding.index) / rate;
      if (left <= maxLag) {
        episodes.push({ from: holding.from, to: holding.to, at: holding.at, length: wall - holding.wall });
        holding = null;
      }
    } else if (endWait(atEnd, busy)) endSum += DT;
    else {
      const nextTime = Math.min(lessonEnd, lesson + DT);
      for (let index = 1; index < cues.length; index += 1) {
        if (decided[index]) continue;
        const boundary = boundaryOf(cues[index - 1], cues[index]);
        if (boundary == null || nextTime + 1e-9 < boundary) break;
        decided[index] = true;
        if (nextTime > boundary + 0.12) continue;
        const remain = mediaUntil(cues, started, intoNow, index);
        const pred = predictHold(remain, rate, maxLag);
        if (pred.hold && holdDecision({ wait: true, time: boundary, boundary, h: pred.h })) {
          holding = { index, from: cues[index - 1].cue, to: cues[index].cue, at: boundary, wall };
          lesson = boundary;
        }
        break;
      }
    }
    if (busy) {
      into += DT * rate;
      if (into >= lengths[play] - 1e-9) { done = play; play = -1; into = 0; }
    }
    if (play < 0 && done + 1 < cues.length && lesson + 1e-9 >= cues[done + 1].start) { play = done + 1; into = 0; }
    wall += DT;
    if (!holding && !endWait(atEnd, busy)) lesson = Math.min(lessonEnd, lesson + DT);
    if (lesson >= lessonEnd && !busy && play < 0 && done >= cues.length - 1) break;
  }
  const mean = lags.reduce((sum, value) => sum + value, 0) / (lags.length || 1);
  const holdSum = episodes.reduce((sum, row) => sum + row.length, 0);
  const longest = episodes.reduce((max, row) => Math.max(max, row.length), 0);
  return { episodes, holds: episodes.length, holdSum, longest, endWait: endSum, mean, max: Math.max(0, ...lags), wall };
}

function print(doc) {
  const live = simulate(doc.segments, 2);
  for (const row of live.episodes) console.log(`${row.from} -> ${row.to}  lesson ${row.at.toFixed(2)} s  hold ${row.length.toFixed(2)} s`);
  if (!live.episodes.length) console.log("no mid-lesson holds");
  console.log(`end wait ${live.endWait.toFixed(2)} s (not a hold)  mean lag ${live.mean.toFixed(2)}  max lag ${live.max.toFixed(2)}  wall ${live.wall.toFixed(2)} s`);
  console.log("maxLag | mid holds | mid s | longest | end wait | mean lag | max lag | wall s");
  for (const maxLag of [1, 1.5, 2, 2.5, 3]) {
    const row = simulate(doc.segments, maxLag);
    const cell = (value) => value.toFixed(2).padStart(7);
    console.log(`${String(maxLag).padStart(6)} | ${String(row.holds).padStart(9)} | ${cell(row.holdSum)} | ${cell(row.longest)} | ${cell(row.endWait)} | ${cell(row.mean)} | ${cell(row.max)} | ${cell(row.wall)}`);
  }
}

if (process.argv[1] && process.argv[1].endsWith("simulate_sign.mjs")) {
  print(JSON.parse(readFileSync(new URL("../demo/data/sign.json", import.meta.url), "utf8")));
}
