// FR-IN-02, FR-IN-04: Read text inside scope. Skip our UI, inputs, code, and hidden text.
import { sentenceAt } from "./caret.js";
import { splitSentences } from "./split.js";

const SKIP = "db-sign-pin, script, style, pre, code, textarea, input, select, button";
const BLOCKS = "h1, h2, h3, h4, h5, h6, p, li";

export function skipped(node) {
  const el = node?.nodeType === 1 ? node : node?.parentElement;
  if (!el || el.closest(SKIP)) return true;
  if (el.closest("[hidden], [aria-hidden='true']")) return true;
  const style = getComputedStyle(el);
  return style.display === "none" || style.visibility === "hidden";
}

export function textMap(root) {
  const nodes = [];
  let text = "";
  if (!root) return { text, nodes };
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (skipped(node) || !node.textContent) continue;
    const start = text.length;
    text += node.textContent;
    nodes.push({ node, start, end: text.length });
  }
  return { text, nodes };
}

export function rangeFor(map, sentence) {
  const start = map.nodes.find((item) => item.end > sentence.start);
  const end = [...map.nodes].reverse().find((item) => item.start < sentence.end);
  if (!start || !end) return null;
  const range = document.createRange();
  const from = Math.max(0, Math.min(sentence.start - start.start, start.node.length));
  const to = Math.max(0, Math.min(sentence.end - end.start, end.node.length));
  range.setStart(start.node, from);
  range.setEnd(end.node, to);
  return range;
}

export function sentencesIn(root) {
  const map = textMap(root);
  return splitSentences(map.text).map((sentence) => ({ ...sentence, range: rangeFor(map, sentence) })).filter((sentence) => sentence.range);
}

export function blocksIn(scope) {
  if (!scope) return [];
  return [...scope.querySelectorAll(BLOCKS)].filter((el) => scope.contains(el) && !skipped(el)).flatMap((node) => {
    const sentences = sentencesIn(node);
    const words = node.textContent.replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
    const label = words.slice(0, 6).join(" ");
    return label && sentences.length ? [{ node, label, sentences }] : [];
  });
}

function caretFrom(x, y) {
  const pos = document.caretPositionFromPoint?.(x, y);
  if (pos?.offsetNode) return { node: pos.offsetNode, offset: pos.offset };
  const range = document.caretRangeFromPoint?.(x, y);
  if (!range) return null;
  return { node: range.startContainer, offset: range.startOffset };
}

export function wordAt(x, y) {
  const hit = caretFrom(x, y);
  if (!hit || hit.node.nodeType !== 3) return "";
  const text = hit.node.textContent || "";
  let start = hit.offset;
  let end = hit.offset;
  while (start > 0 && !/\s/.test(text[start - 1])) start -= 1;
  while (end < text.length && !/\s/.test(text[end])) end += 1;
  return text.slice(start, end);
}

export function pointIn(x, y, scope) {
  const hit = caretFrom(x, y);
  if (!hit || !scope?.contains(hit.node) || skipped(hit.node)) return null;
  const block = (hit.node.nodeType === 1 ? hit.node : hit.node.parentElement)?.closest(BLOCKS);
  const host = block && scope.contains(block) ? block : scope;
  const map = textMap(host);
  const slot = map.nodes.find((item) => item.node === hit.node);
  if (!slot) return null;
  const sentences = splitSentences(map.text).map((sentence) => ({ ...sentence, range: rangeFor(map, sentence) })).filter((row) => row.range);
  const index = sentenceAt(sentences, slot.start + Math.min(hit.offset, slot.end - slot.start));
  if (index < 0) return null;
  return { block: host, sentences, index };
}
