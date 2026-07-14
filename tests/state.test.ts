import assert from "node:assert/strict";
import test from "node:test";
import { applyScoreDelta, createInitialGameState } from "../src/game/state.ts";

test("createInitialGameState starts with a zero score", () => {
  const state = createInitialGameState(sequence([0, 0, 0.5, 0]));

  assert.equal(state.score, 0);
});

test("applyScoreDelta increases the current score without changing cells", () => {
  const state = createInitialGameState(sequence([0, 0, 0.5, 0]));
  const nextState = applyScoreDelta(state, 12);

  assert.equal(nextState.score, 12);
  assert.deepEqual(nextState.cells, state.cells);
});

test("applyScoreDelta rejects invalid score deltas", () => {
  const state = createInitialGameState(sequence([0, 0, 0.5, 0]));

  assert.throws(() => applyScoreDelta(state, -4), RangeError);
  assert.throws(() => applyScoreDelta(state, 1.5), RangeError);
});

function sequence(values: number[]): () => number {
  let index = 0;

  return () => {
    const value = values[index];

    if (value === undefined) {
      throw new Error("Random sequence was exhausted.");
    }

    index += 1;
    return value;
  };
}
