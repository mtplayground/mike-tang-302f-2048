import assert from "node:assert/strict";
import test from "node:test";
import { moveCellsWithSpawn, type Direction } from "../src/game/move.ts";
import {
  acknowledgeWin,
  applyScoreDelta,
  createInitialGameState,
  hasEmptyCell,
  isGameOver,
  shouldShowWinOverlay,
  type CellValue,
  type GameState
} from "../src/game/state.ts";

test("complete game flow covers moves, scoring, win, game-over, and restart", () => {
  let state = createInitialGameState(sequence([0, 0, 0, 0]));

  assert.deepEqual(
    state.cells.slice(0, 4),
    [2, 2, null, null],
    "deterministic start should create two initial tiles"
  );
  assert.equal(state.score, 0);
  assert.equal(shouldShowWinOverlay(state), false);

  let turn = playMove(state, "right", sequence([0, 0]));
  state = turn.state;

  assert.equal(turn.move.scoreDelta, 4);
  assert.deepEqual(state.cells.slice(0, 4), [2, null, null, 4]);
  assert.equal(state.score, 4);

  state = stateWithRows(
    [
      [2, 2, 4, 4],
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null]
    ],
    state.score
  );
  turn = playMove(state, "left", sequence([0, 0]));
  state = turn.state;

  assert.equal(turn.move.scoreDelta, 12);
  assert.deepEqual(turn.move.merges, [
    { index: 0, value: 4 },
    { index: 1, value: 8 }
  ]);
  assert.deepEqual(state.cells.slice(0, 4), [4, 8, 2, null]);
  assert.equal(state.score, 16);

  state = stateWithRows(
    [
      [2, null, null, null],
      [2, null, null, null],
      [null, null, null, null],
      [null, null, null, null]
    ],
    state.score
  );
  turn = playMove(state, "up", sequence([0, 0]));
  state = turn.state;

  assert.equal(turn.move.scoreDelta, 4);
  assert.equal(state.cells[0], 4);
  assert.equal(state.score, 20);

  state = stateWithRows(
    [
      [2, null, null, null],
      [2, null, null, null],
      [null, null, null, null],
      [null, null, null, null]
    ],
    state.score
  );
  turn = playMove(state, "down", sequence([0, 0]));
  state = turn.state;

  assert.equal(turn.move.scoreDelta, 4);
  assert.equal(state.cells[12], 4);
  assert.equal(state.score, 24);

  state = stateWithRows(
    [
      [1024, 1024, null, null],
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null]
    ],
    state.score
  );
  turn = playMove(state, "left", sequence([0, 0]));
  state = turn.state;

  assert.equal(turn.move.scoreDelta, 2048);
  assert.equal(state.cells[0], 2048);
  assert.equal(state.score, 2072);
  assert.equal(shouldShowWinOverlay(state), true);

  state = acknowledgeWin(state);
  assert.equal(shouldShowWinOverlay(state), false);

  state = stateWithRows(
    [
      [2048, 2048, null, null],
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null]
    ],
    state.score,
    true
  );
  turn = playMove(state, "left", sequence([0, 0]));
  state = turn.state;

  assert.equal(turn.move.scoreDelta, 4096);
  assert.equal(state.cells[0], 4096);
  assert.equal(state.score, 6168);
  assert.equal(shouldShowWinOverlay(state), false);

  state = stateWithRows(
    [
      [2, 4, 2, 4],
      [4, 2, 4, 2],
      [2, 4, 2, 4],
      [4, 2, 4, 2]
    ],
    state.score,
    state.hasAcknowledgedWin
  );

  assert.equal(hasEmptyCell(state.cells), false);
  assert.equal(isGameOver(state.cells), true);

  state = createInitialGameState(sequence([0, 0, 0, 0]));

  assert.equal(state.score, 0);
  assert.equal(state.hasAcknowledgedWin, false);
  assert.equal(isGameOver(state.cells), false);
});

function playMove(
  state: GameState,
  direction: Direction,
  random: () => number
): {
  state: GameState;
  move: ReturnType<typeof moveCellsWithSpawn>;
} {
  const move = moveCellsWithSpawn(state.cells, direction, random);

  assert.equal(move.moved, true, `${direction} move should change the board`);

  return {
    move,
    state: applyScoreDelta({ ...state, cells: move.cells }, move.scoreDelta)
  };
}

function stateWithRows(
  rows: CellValue[][],
  score: number,
  hasAcknowledgedWin = false
): GameState {
  return {
    cells: rows.flat(),
    score,
    hasAcknowledgedWin
  };
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
