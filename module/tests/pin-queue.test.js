// FR-IN-04: Next, previous, and stop across blocks.
import assert from "node:assert/strict";
import test from "node:test";
import { createQueue } from "../deaf/pin/queue.js";

function sample() {
  return createQueue([
    { sentences: [{ text: "a" }, { text: "b" }] },
    { sentences: [{ text: "c" }] }
  ]);
}

test("next walks the paragraph, then the next block when continue is on", () => {
  const queue = sample();
  assert.equal(queue.current().item.text, "a");
  assert.equal(queue.next(false).item.text, "b");
  assert.equal(queue.next(false), null);
  assert.equal(queue.next(true).item.text, "c");
  assert.equal(queue.next(true), null);
});

test("previous moves back, and stop ends the queue", () => {
  const queue = sample();
  queue.next(true);
  queue.next(true);
  assert.equal(queue.prev().item.text, "b");
  assert.equal(queue.prev().item.text, "a");
  assert.equal(queue.prev().item.text, "a");
  assert.equal(queue.stop(), null);
  assert.equal(queue.stopped, true);
  assert.equal(queue.next(true), null);
  assert.equal(queue.prev(), null);
});
