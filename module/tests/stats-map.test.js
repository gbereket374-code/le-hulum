// FR-01: Home impact stats mapping stays honest (no invented ratings).
import assert from "node:assert/strict";
import test from "node:test";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";

const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const { mapHomeStats } = require(path.join(root, "demo/v3-design/stats-map.js"));

const T = {
  of: "of",
  stats: [
    ["64", "EthSL word signs"],
    ["39", "recorded phrases"],
    ["0", "sentences cut mid-way: the teacher waits for the signer"],
    ["14", "lesson lines signed by a real interpreter"],
  ],
  statCut: "sentences cut mid-way: the teacher waits for the signer",
  statCutUnit: "in our sync test",
  statUnderstood: "sentences understood by our Deaf co-designer",
  statLinesSigned: "lesson lines signed by a real interpreter",
};

test("null codesigner rating becomes lesson-lines card, cut stays 0", () => {
  const cards = mapHomeStats(
    {
      signs: 64,
      phrases: 39,
      lesson_lines: 14,
      sentences_cut_midway: 0,
      codesigner_understood: null,
      codesigner_total: 10,
    },
    T,
  );
  assert.equal(cards.length, 4);
  assert.equal(cards[0].n, "64");
  assert.equal(cards[1].n, "39");
  assert.equal(cards[2].n, "0");
  assert.equal(cards[2].unit, "in our sync test");
  assert.equal(cards[3].n, "14");
  assert.match(cards[3].label, /lesson lines signed/i);
  assert.equal(cards[3].ph, false);
  assert.equal(cards[3].unit, "");
});

test("codesigner rating shows only when measured", () => {
  const cards = mapHomeStats(
    {
      signs: 64,
      phrases: 39,
      lesson_lines: 14,
      sentences_cut_midway: 0,
      codesigner_understood: 8,
      codesigner_total: 10,
    },
    T,
  );
  assert.equal(cards[3].n, "8");
  assert.equal(cards[3].unit, "of 10");
  assert.match(cards[3].label, /understood/i);
});

test("never maps auto_lines_signed into the cut-midway card", () => {
  const cards = mapHomeStats(
    {
      signs: 10,
      phrases: 5,
      auto_lines_signed: 14,
      lesson_lines: 14,
      sentences_cut_midway: 0,
      codesigner_understood: null,
      codesigner_total: 10,
    },
    T,
  );
  assert.equal(cards[2].n, "0");
  assert.notEqual(cards[2].n, "14");
});
