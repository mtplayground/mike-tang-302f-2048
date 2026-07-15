import assert from "node:assert/strict";
import test from "node:test";
import {
  getMergeScore,
  mergeLine,
  moveCells,
  moveCellsWithSpawn
} from "../src/game/move.ts";
import type { CellValue } from "../src/game/state.ts";

function board(rows: CellValue[][]): CellValue[] {
  return rows.flat();
}

test("mergeLine slides values left and merges each tile once", () => {
  const first = mergeLine([2, 2, 2, null]);
  const second = mergeLine([2, 2, 2, 2]);
  const third = mergeLine([2, 2, 4, null]);

  assert.deepEqual(first.values, [4, 2, null, null]);
  assert.deepEqual(second.values, [4, 4, null, null]);
  assert.deepEqual(third.values, [4, 4, null, null]);
  assert.deepEqual(first.movements, [
    { sourceOffset: 1, offset: 0, value: 4, merged: true },
    { sourceOffset: 2, offset: 1, value: 2, merged: false }
  ]);
});

test("moveCells moves and merges left in row order", () => {
  const result = moveCells(
    board([
      [2, 2, 2, null],
      [4, null, 4, 4],
      [null, null, null, null],
      [8, 16, null, 16]
    ]),
    "left"
  );

  assert.equal(result.moved, true);
  assert.deepEqual(
    result.cells,
    board([
      [4, 2, null, null],
      [8, 4, null, null],
      [null, null, null, null],
      [8, 32, null, null]
    ])
  );
  assert.deepEqual(result.merges, [
    { index: 0, value: 4 },
    { index: 4, value: 8 },
    { index: 13, value: 32 }
  ]);
  assert.deepEqual(result.movements.filter((movement) => movement.fromIndex !== movement.toIndex), [
    { fromIndex: 1, toIndex: 0, value: 4, merged: true },
    { fromIndex: 2, toIndex: 1, value: 2, merged: false },
    { fromIndex: 6, toIndex: 4, value: 8, merged: true },
    { fromIndex: 7, toIndex: 5, value: 4, merged: false },
    { fromIndex: 15, toIndex: 13, value: 32, merged: true }
  ]);
  assert.equal(result.scoreDelta, 44);
});

test("moveCells moves and merges right in reverse row order", () => {
  const result = moveCells(
    board([
      [2, 2, 2, null],
      [4, null, 4, 4],
      [null, null, null, null],
      [8, 16, null, 16]
    ]),
    "right"
  );

  assert.equal(result.moved, true);
  assert.deepEqual(
    result.cells,
    board([
      [null, null, 2, 4],
      [null, null, 4, 8],
      [null, null, null, null],
      [null, null, 8, 32]
    ])
  );
  assert.deepEqual(result.merges, [
    { index: 3, value: 4 },
    { index: 7, value: 8 },
    { index: 15, value: 32 }
  ]);
  assert.equal(result.scoreDelta, 44);
});

test("moveCells moves and merges up in column order", () => {
  const result = moveCells(
    board([
      [2, 4, null, 8],
      [2, null, null, 8],
      [4, 4, null, null],
      [4, 4, null, 8]
    ]),
    "up"
  );

  assert.equal(result.moved, true);
  assert.deepEqual(
    result.cells,
    board([
      [4, 8, null, 16],
      [8, 4, null, 8],
      [null, null, null, null],
      [null, null, null, null]
    ])
  );
  assert.deepEqual(result.merges, [
    { index: 0, value: 4 },
    { index: 4, value: 8 },
    { index: 1, value: 8 },
    { index: 3, value: 16 }
  ]);
  assert.equal(result.scoreDelta, 36);
});

test("moveCells moves and merges down in reverse column order", () => {
  const result = moveCells(
    board([
      [2, 4, null, 8],
      [2, null, null, 8],
      [4, 4, null, null],
      [4, 4, null, 8]
    ]),
    "down"
  );

  assert.equal(result.moved, true);
  assert.deepEqual(
    result.cells,
    board([
      [null, null, null, null],
      [null, null, null, null],
      [4, 4, null, 8],
      [8, 8, null, 16]
    ])
  );
  assert.deepEqual(result.merges, [
    { index: 12, value: 8 },
    { index: 8, value: 4 },
    { index: 13, value: 8 },
    { index: 15, value: 16 }
  ]);
  assert.equal(result.scoreDelta, 36);
});

test("moveCells reports no movement when the board is unchanged", () => {
  const cells = board([
    [2, 4, 8, 16],
    [32, 64, 128, 256],
    [512, 1024, 2, 4],
    [8, 16, 32, 64]
  ]);

  const result = moveCells(cells, "left");

  assert.equal(result.moved, false);
  assert.deepEqual(result.cells, cells);
  assert.deepEqual(result.merges, []);
  assert.deepEqual(
    result.movements.filter((movement) => movement.fromIndex !== movement.toIndex),
    []
  );
  assert.equal(result.scoreDelta, 0);
});

test("moveCellsWithSpawn adds one random tile after a changed move", () => {
  const result = moveCellsWithSpawn(
    board([
      [2, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null]
    ]),
    "right",
    sequence([0, 0.95])
  );

  assert.equal(result.moved, true);
  assert.deepEqual(
    result.cells,
    board([
      [4, null, null, 2],
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null]
    ])
  );
  assert.deepEqual(result.spawned, { index: 0, value: 4 });
  assert.equal(result.scoreDelta, 0);
});

test("moveCellsWithSpawn does not spawn when a move leaves the board unchanged", () => {
  const cells = board([
    [2, 4, 8, 16],
    [32, 64, 128, 256],
    [512, 1024, 2, 4],
    [8, 16, 32, 64]
  ]);

  const result = moveCellsWithSpawn(cells, "left", () => {
    throw new Error("Random source should not be read for an unchanged move.");
  });

  assert.equal(result.moved, false);
  assert.deepEqual(result.cells, cells);
  assert.equal(result.spawned, null);
  assert.equal(result.scoreDelta, 0);
});

test("getMergeScore sums each newly merged tile value", () => {
  assert.equal(
    getMergeScore([
      { index: 0, value: 4 },
      { index: 1, value: 8 },
      { index: 2, value: 16 }
    ]),
    28
  );
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
