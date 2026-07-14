export const BOARD_SIZE = 4;
export const CELL_COUNT = BOARD_SIZE * BOARD_SIZE;
export const INITIAL_TILE_COUNT = 2;

export type TileValue = number;
export type CellValue = TileValue | null;
export type RandomSource = () => number;

export interface GameState {
  cells: CellValue[];
}

export interface CellPosition {
  row: number;
  column: number;
}

export function createInitialGameState(random: RandomSource = Math.random): GameState {
  let cells = createEmptyCells();

  for (let count = 0; count < INITIAL_TILE_COUNT; count += 1) {
    cells = placeRandomTile(cells, random);
  }

  return { cells };
}

export function createEmptyCells(): CellValue[] {
  return Array<CellValue>(CELL_COUNT).fill(null);
}

export function getEmptyCellIndexes(cells: CellValue[]): number[] {
  assertBoardShape(cells);

  return cells.reduce<number[]>((indexes, cell, index) => {
    if (cell === null) {
      indexes.push(index);
    }

    return indexes;
  }, []);
}

export function getCellPosition(index: number): CellPosition {
  if (!Number.isInteger(index) || index < 0 || index >= CELL_COUNT) {
    throw new RangeError(`Cell index must be an integer from 0 to ${CELL_COUNT - 1}.`);
  }

  return {
    row: Math.floor(index / BOARD_SIZE),
    column: index % BOARD_SIZE
  };
}

export function placeRandomTile(
  cells: CellValue[],
  random: RandomSource = Math.random
): CellValue[] {
  assertBoardShape(cells);

  const emptyIndexes = getEmptyCellIndexes(cells);

  if (emptyIndexes.length === 0) {
    return [...cells];
  }

  const nextCells = [...cells];
  const targetIndex = emptyIndexes[getRandomIndex(emptyIndexes.length, random)];
  nextCells[targetIndex] = createRandomTileValue(random);

  return nextCells;
}

export function createRandomTileValue(random: RandomSource = Math.random): TileValue {
  return readRandomUnit(random) < 0.9 ? 2 : 4;
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
