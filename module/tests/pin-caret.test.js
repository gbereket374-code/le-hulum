// FR-IN-04: Caret offset to sentence index.
import assert from "node:assert/strict";
import test from "node:test";
import { sentenceAt } from "../deaf/pin/caret.js";
import { splitSentences } from "../deaf/pin/split.js";

const sentences = splitSentences("አንድ። ሁለት።");

test("an offset inside a sentence maps to that sentence", () => {
  assert.equal(sentenceAt(sentences, sentences[0].start), 0);
  assert.equal(sentenceAt(sentences, sentences[0].end - 1), 0);
  assert.equal(sentenceAt(sentences, sentences[1].start), 1);
  assert.equal(sentenceAt(sentences, sentences[1].end - 1), 1);
});

test("the gap between sentences stays with the sentence before it", () => {
  assert.equal(sentenceAt(sentences, sentences[0].end), 0);
  assert.equal(sentenceAt(sentences, -1), -1);
  assert.equal(sentenceAt(sentences, 999), 1);
});
