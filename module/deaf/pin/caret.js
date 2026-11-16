// FR-IN-04: Map a caret offset onto one sentence. Pure numbers, no DOM.
export function sentenceAt(sentences, offset) {
  if (!sentences.length || offset < sentences[0].start) return -1;
  for (let index = 0; index < sentences.length; index += 1) {
    const row = sentences[index];
    const next = sentences[index + 1];
    const until = next ? next.start : row.end;
    if (offset >= row.start && offset < Math.max(until, row.end)) return index;
  }
  return sentences.length - 1;
}
