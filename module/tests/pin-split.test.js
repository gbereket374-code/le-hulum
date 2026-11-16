// FR-IN-04: Sentence boundaries for Amharic and English.
import assert from "node:assert/strict";
import test from "node:test";
import { splitSentences } from "../deaf/pin/split.js";

test("Amharic sentences split on ። ፧ ? and !", () => {
  const parts = splitSentences("አንድ። ሁለት፧ ሦስት? አራት!");
  assert.deepEqual(parts.map((row) => row.text), ["አንድ።", "ሁለት፧", "ሦስት?", "አራት!"]);
  assert.equal(parts[0].start, 0);
  assert.equal(parts[1].start, "አንድ። ".length);
});

test("English abbreviations and initials stay inside the sentence", () => {
  const parts = splitSentences("Dr. Smith left. See e.g. this. U.S.A. is next. He waved.");
  assert.deepEqual(parts.map((row) => row.text), ["Dr. Smith left.", "See e.g. this.", "U.S.A. is next.", "He waved."]);
});

test("a decimal point is not a sentence end", () => {
  assert.deepEqual(splitSentences("Use 3.14 here. Then stop.").map((row) => row.text), ["Use 3.14 here.", "Then stop."]);
});
