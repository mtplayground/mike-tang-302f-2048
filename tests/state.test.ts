import assert from "node:assert/strict";
import test from "node:test";
import {
  acknowledgeWin,
  applyScoreDelta,
  createInitialGameState,
  hasAvailableMerge,
  hasEmptyCell,
  hasWinningTile,
  isGameOver,
  shouldShowWinOverlay,
  type GameState
} from "../src/game/state.ts";

test("createInitialGameState starts with a zero score", () => {
  const state = createInitialGameState(sequence([0, 0, 0.5, 0]));

  assert.equal(state.score, 0);
  assert.equal(state.hasAcknowledgedWin, false);
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

test("hasWinningTile detects a tile at or above 2048", () => {
  assert.equal(hasWinningTile(stateWithCells([null, 1024, null, 2]).cells), false);
  assert.equal(hasWinningTile(stateWithCells([null, 2048, null, 2]).cells), true);
  assert.equal(hasWinningTile(stateWithCells([4096, null, null, 2]).cells), true);
});

test("shouldShowWinOverlay is true until the win is acknowledged", () => {
  const winningState = stateWithCells([2048, null, null, 2]);

  assert.equal(shouldShowWinOverlay(winningState), true);

  const acknowledgedState = acknowledgeWin(winningState);

  assert.equal(acknowledgedState.hasAcknowledgedWin, true);
  assert.equal(shouldShowWinOverlay(acknowledgedState), false);
});

test("hasEmptyCell detects whether the board has open spaces", () => {
  assert.equal(hasEmptyCell(stateWithCells([2, null]).cells), true);
  assert.equal(hasEmptyCell(fullBoardWithoutMerges()), false);
});

test("hasAvailableMerge detects horizontal or vertical merge options", () => {
  assert.equal(hasAvailableMerge(fullBoardWithoutMerges()), false);
  assert.equal(
    hasAvailableMerge([
      2, 2, 4, 8,
      16, 32, 64, 128,
      256, 512, 1024, 2,
      4, 8, 16, 32
    ]),
    true
  );
  assert.equal(
    hasAvailableMerge([
      2, 4, 8, 16,
      2, 32, 64, 128,
      256, 512, 1024, 2,
      4, 8, 16, 32
    ]),
    true
  );
});

test("isGameOver requires a full board with no available merges", () => {
  assert.equal(isGameOver(fullBoardWithoutMerges()), true);
  assert.equal(isGameOver(stateWithCells([2, null]).cells), false);
  assert.equal(
    isGameOver([
      2, 2, 4, 8,
      16, 32, 64, 128,
      256, 512, 1024, 2,
      4, 8, 16, 32
    ]),
    false
  );
});

function stateWithCells(values: Array<number | null>): GameState {
  return {
    cells: [...values, ...Array<null>(16 - values.length).fill(null)],
    score: 0,
    hasAcknowledgedWin: false
  };
}

function fullBoardWithoutMerges() {
  return [
    2, 4, 2, 4, 4, 2, 4, 2, 2, 4, 2, 4, 4, 2, 4, 2
  ];
}

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
