// FR-IN-04: Split Amharic and English sentences. Offsets only, the DOM stays as it is.
const ABBR = new Set("mr mrs ms dr prof sr jr st vs etc eg ie fig no vol pp al inc ltd".split(" "));

function boundary(text, index) {
  const ch = text[index];
  if ("።፧?!".includes(ch)) return true;
  if (ch !== ".") return false;
  const prev = text[index - 1] || "";
  const next = text[index + 1] || "";
  if (/\d/.test(prev) && /\d/.test(next)) return false;
  let start = index;
  while (start > 0 && /[A-Za-z]/.test(text[start - 1])) start -= 1;
  const word = text.slice(start, index).toLowerCase();
  return Boolean(word) && !ABBR.has(word) && word.length !== 1;
}

export function splitSentences(text) {
  const out = [];
  let cursor = 0;
  const cut = (end) => {
    const raw = text.slice(cursor, end);
    const lead = raw.length - raw.trimStart().length;
    const slice = raw.trim();
    if (slice) out.push({ text: slice, start: cursor + lead, end: cursor + lead + slice.length });
    cursor = end;
  };
  for (let i = 0; i < text.length; i += 1) if (boundary(text, i)) cut(i + 1);
  if (cursor < text.length) cut(text.length);
  return out;
}
