import {
  BOARD_SIZE,
  CELL_COUNT,
  createRandomTileValue,
  getEmptyCellIndexes,
  type CellValue,
  type RandomSource,
  type TileValue
} from "./state";

export type Direction = "up" | "down" | "left" | "right";

export interface MergeEvent {
  index: number;
  value: TileValue;
}

export interface SpawnEvent {
  index: number;
  value: TileValue;
}

export interface TileMovement {
  fromIndex: number;
  toIndex: number;
  value: TileValue;
  merged: boolean;
}

export interface MoveResult {
  cells: CellValue[];
  moved: boolean;
  merges: MergeEvent[];
  movements: TileMovement[];
  scoreDelta: number;
}

export interface MoveWithSpawnResult extends MoveResult {
  spawned: SpawnEvent | null;
}

interface LineMergeResult {
  values: CellValue[];
  merges: Array<{
    offset: number;
    value: TileValue;
  }>;
  movements: Array<{
    sourceOffset: number;
    offset: number;
    value: TileValue;
    merged: boolean;
  }>;
}

export function moveCells(cells: CellValue[], direction: Direction): MoveResult {
  assertBoardShape(cells);

  const nextCells = Array<CellValue>(CELL_COUNT).fill(null);
  const merges: MergeEvent[] = [];
  const movements: TileMovement[] = [];

  for (const line of getLines(direction)) {
    const lineValues = line.map((index) => cells[index]);
    const mergedLine = mergeLine(lineValues);

    mergedLine.values.forEach((value, offset) => {
      nextCells[line[offset]] = value;
    });

    for (const merge of mergedLine.merges) {
      merges.push({
        index: line[merge.offset],
        value: merge.value
      });
    }

    for (const movement of mergedLine.movements) {
      movements.push({
        fromIndex: line[movement.sourceOffset],
        toIndex: line[movement.offset],
        value: movement.value,
        merged: movement.merged
      });
    }
  }

  return {
    cells: nextCells,
    moved: !areCellsEqual(cells, nextCells),
    merges,
    movements,
    scoreDelta: getMergeScore(merges)
  };
}

export function getMergeScore(merges: readonly MergeEvent[]): number {
  return merges.reduce((score, merge) => score + merge.value, 0);
}

export function moveCellsWithSpawn(
  cells: CellValue[],
  direction: Direction,
  random: RandomSource = Math.random
): MoveWithSpawnResult {
  const moveResult = moveCells(cells, direction);

  if (!moveResult.moved) {
    return {
      ...moveResult,
      spawned: null
    };
  }

  const spawnResult = spawnRandomTile(moveResult.cells, random);

  return {
    ...moveResult,
    cells: spawnResult.cells,
    spawned: spawnResult.spawned
  };
}

export function spawnRandomTile(
  cells: CellValue[],
  random: RandomSource = Math.random
): {
  cells: CellValue[];
  spawned: SpawnEvent | null;
} {
  assertBoardShape(cells);

  const emptyIndexes = getEmptyCellIndexes(cells);

  if (emptyIndexes.length === 0) {
    return {
      cells: [...cells],
      spawned: null
    };
  }

  const nextCells = [...cells];
  const index = emptyIndexes[getRandomIndex(emptyIndexes.length, random)];
  const value = createRandomTileValue(random);
  nextCells[index] = value;

  return {
    cells: nextCells,
    spawned: { index, value }
  };
}

export function mergeLine(values: CellValue[]): LineMergeResult {
  if (values.length !== BOARD_SIZE) {
    throw new RangeError(`Line must contain exactly ${BOARD_SIZE} cells.`);
  }

  const compactValues = values.flatMap((value, offset) => {
    if (value === null) {
      return [];
    }

    return [{ value, offset }];
  });
  const mergedValues: CellValue[] = [];
  const merges: LineMergeResult["merges"] = [];
  const movements: LineMergeResult["movements"] = [];

  for (let index = 0; index < compactValues.length; index += 1) {
    const tile = compactValues[index];
    const nextTile = compactValues[index + 1];

    if (nextTile?.value === tile.value) {
      const mergedValue = tile.value * 2;
      merges.push({
        offset: mergedValues.length,
        value: mergedValue
      });
      movements.push({
        sourceOffset: nextTile.offset,
        offset: mergedValues.length,
        value: mergedValue,
        merged: true
      });
      mergedValues.push(mergedValue);
      index += 1;
    } else {
      movements.push({
        sourceOffset: tile.offset,
        offset: mergedValues.length,
        value: tile.value,
        merged: false
      });
      mergedValues.push(tile.value);
    }
  }

  while (mergedValues.length < BOARD_SIZE) {
    mergedValues.push(null);
  }

  return {
    values: mergedValues,
    merges,
    movements
  };
}

function getLines(direction: Direction): number[][] {
  switch (direction) {
    case "left":
      return getRowLines(false);
    case "right":
      return getRowLines(true);
    case "up":
      return getColumnLines(false);
    case "down":
      return getColumnLines(true);
  }
}

function getRowLines(reverse: boolean): number[][] {
  return Array.from({ length: BOARD_SIZE }, (_, row) => {
    const line = Array.from({ length: BOARD_SIZE }, (__, column) => {
      return row * BOARD_SIZE + column;
    });

    return reverse ? line.reverse() : line;
  });
}

function getColumnLines(reverse: boolean): number[][] {
  return Array.from({ length: BOARD_SIZE }, (_, column) => {
    const line = Array.from({ length: BOARD_SIZE }, (__, row) => {
      return row * BOARD_SIZE + column;
    });

    return reverse ? line.reverse() : line;
  });
}

function areCellsEqual(left: CellValue[], right: CellValue[]): boolean {
  return left.every((value, index) => value === right[index]);
}

function getRandomIndex(length: number, random: RandomSource): number {
  if (!Number.isInteger(length) || length <= 0) {
    throw new RangeError("Random index length must be a positive integer.");
  }

  return Math.floor(readRandomUnit(random) * length);
}

function readRandomUnit(random: RandomSource): number {
  const value = random();

  if (!Number.isFinite(value) || value < 0 || value >= 1) {
    throw new RangeError("Random source must return a finite number from 0 up to 1.");
  }

  return value;
}

function assertBoardShape(cells: CellValue[]): void {
  if (cells.length !== CELL_COUNT) {
    throw new RangeError(`Board must contain exactly ${CELL_COUNT} cells.`);
  }
}
