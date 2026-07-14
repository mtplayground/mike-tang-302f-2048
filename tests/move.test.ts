import assert from "node:assert/strict";
import test from "node:test";
import { mergeLine, moveCells, moveCellsWithSpawn } from "../src/game/move.ts";
import type { CellValue } from "../src/game/state.ts";

function board(rows: CellValue[][]): CellValue[] {
  return rows.flat();
}

test("mergeLine slides values left and merges each tile once", () => {
  assert.deepEqual(mergeLine([2, 2, 2, null]).values, [4, 2, null, null]);
  assert.deepEqual(mergeLine([2, 2, 2, 2]).values, [4, 4, null, null]);
  assert.deepEqual(mergeLine([2, 2, 4, null]).values, [4, 4, null, null]);
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
