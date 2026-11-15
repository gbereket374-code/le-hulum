// FR-DEAF-05, FR-DEAF-06: Queue the signer. Hold the lesson only at a cue boundary.
export const SCHEDULE = { maxLag: 3, catchUpLag: 0.8, catchUp: 1.1, pillAfter: 0.6, minHold: 0.5 };

export function signMode(src) {
  return /\.json(?:$|[?#])/i.test(String(src || "")) ? "cues" : "continuous";
}

export function itemsOf(segment) {
  if (!segment || segment.source === "none") return [];
  if (segment.playlist && segment.playlist.length) return segment.playlist;
  if (segment.src) return [{ src: segment.src, from: Number(segment.from) || 0, to: Number(segment.to) }];
  return [];
}

export function segmentAt(segments, time) {
  let found = null;
  for (const segment of segments || []) {
    if (time + 1e-3 >= segment.start) found = segment;
    else break;
  }
  return found;
}

export function pointInSegment(segment, lessonTime) {
  const items = itemsOf(segment);
  if (!items.length) return null;
  const span = Math.max(0.001, segment.end - segment.start);
  const lengths = items.map((item) => Math.max(0, Number(item.to) - Number(item.from)));
  const total = lengths.reduce((sum, length) => sum + length, 0) || 0.001;
  const frac = Math.min(1, Math.max(0, (lessonTime - segment.start) / span));
  let remain = frac * total;
  for (let index = 0; index < items.length; index += 1) {
    if (remain <= lengths[index] + 1e-6 || index === items.length - 1) {
      const time = Number(items[index].from) + Math.min(Math.max(0, remain), lengths[index]);
      return { index, time };
    }
    remain -= lengths[index];
  }
  return { index: 0, time: Number(items[0].from) || 0 };
}

export function playableSegments(segments) {
  return (segments || []).filter((segment) => segment && segment.source !== "none" && itemsOf(segment).length);
}

export function signSpan(segment) {
  return itemsOf(segment).reduce((sum, item) => sum + Math.max(0, Number(item.to) - Number(item.from)), 0);
}

export function queueStart(segments, index, previousDoneAt) {
  const segment = segments[index];
  if (!segment) return 0;
  if (index <= 0 || previousDoneAt == null) return segment.start;
  return Math.max(segment.start, previousDoneAt);
}

export function dueIndex(segments, lessonTime, started) {
  for (let index = started + 1; index < (segments || []).length; index += 1) {
    if (lessonTime + 1e-3 >= segments[index].start) return index;
  }
  return -1;
}

export function lagSeconds(segments, lessonTime, started) {
  const index = dueIndex(segments, lessonTime, started);
  if (index < 0) return 0;
  return Math.max(0, lessonTime - segments[index].start);
}

export function boundaryOf(prev, next) {
  if (!prev || !next) return null;
  return next.start > prev.end + 0.02 ? prev.end : next.start;
}

export function mediaUntil(cues, started, into, target, skipped) {
  if (!cues?.length || target <= 0) return 0;
  let remain = 0;
  let from = Math.max(0, started + 1);
  if (started >= 0 && started < target && !skipped?.[started]) {
    const span = signSpan(cues[started]);
    if (into < span - 1e-6) remain += Math.max(0, span - into);
    else from = started + 1;
  }
  for (let index = from; index < target && index < cues.length; index += 1) {
    if (!skipped?.[index]) remain += signSpan(cues[index]);
  }
  return remain;
}

export function projectedLag(remain, rate) {
  const speed = Number(rate) > 0 ? Number(rate) : 1;
  return Math.max(0, Number(remain) || 0) / speed;
}

export function inSentence(cues, time) {
  return (cues || []).some((cue) => time > Number(cue.start) && time < Number(cue.end) - 0.05);
}

export function gapHold({ remain, signRate, captionIn, lessonRate }) {
  const lesson = Number(lessonRate) > 0 ? Number(lessonRate) : 1;
  return projectedLag(remain, signRate) - Math.max(0, Number(captionIn) || 0) / lesson - SCHEDULE.maxLag;
}

export function openRun(cues, index) {
  const run = [];
  for (let i = index; i < (cues || []).length; i += 1) {
    if (i > index && cues[i].start > cues[i - 1].end + 1e-3) break;
    run.push(i);
  }
  return run;
}

export function holdDecision({ wait, time, boundary, cues, h, nextStart }) {
  if (!wait || boundary == null || !(h >= SCHEDULE.minHold - 1e-9)) return false;
  if (inSentence(cues, time)) return false;
  if (cues?.[0] && time < Number(cues[0].end) - 0.05) return false;
  if (time + 0.05 < boundary) return false;
  if (nextStart != null && time > Number(nextStart) - 1e-3) return false;
  if (nextStart == null && time > boundary + 0.15) return false;
  return true;
}

export function afterFailure(play, cardShown) {
  const index = play >= 0 ? play : -1;
  return { skipped: index, done: index, play: -1, next: index + 1, card: index >= 0 && !cardShown };
}

export function playbackCause({ type, own }) {
  if (own) return "hold";
  if (type === "play") return "user-play";
  if (type === "pause") return "user-pause";
  return "";
}

export function resumeSigner({ holding, userPaused, signerPaused }) {
  return !!(holding && !userPaused && signerPaused);
}

export function watchHold({ held, remain, quiet }) {
  return held > Math.max(0, Number(remain) || 0) + 2 || quiet >= 3;
}

export function pauseAffectsSigner({ holding, userAction }) {
  return !holding || !!userAction;
}

export function afterSkip() {
  return { holding: false };
}

export function countsAsHold(kind) {
  return kind === "boundary";
}

export function catchUpRate(signRate, lag) {
  const base = Number(signRate) || 1;
  const rate = lag > SCHEDULE.catchUpLag ? base * SCHEDULE.catchUp : base;
  return Math.min(rate, base * SCHEDULE.catchUp);
}

export function endWait(lessonEnded, signerBusy) {
  return !!(lessonEnded && signerBusy);
}

export function afterSeek(segments, time) {
  const segment = segmentAt(segments, time);
  const queue = playableSegments(segments);
  const playable = segment && queue.includes(segment);
  return { segment: playable ? segment : null, lag: 0, point: playable ? pointInSegment(segment, time) : null };
}
