import { BOARD_SIZE, CELL_COUNT, type CellValue, type TileValue } from "./state";

export type Direction = "up" | "down" | "left" | "right";

export interface MergeEvent {
  index: number;
  value: TileValue;
}

export interface MoveResult {
  cells: CellValue[];
  moved: boolean;
  merges: MergeEvent[];
}

interface LineMergeResult {
  values: CellValue[];
  merges: Array<{
    offset: number;
    value: TileValue;
  }>;
}

export function moveCells(cells: CellValue[], direction: Direction): MoveResult {
  assertBoardShape(cells);

  const nextCells = Array<CellValue>(CELL_COUNT).fill(null);
  const merges: MergeEvent[] = [];

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
  }

  return {
    cells: nextCells,
    moved: !areCellsEqual(cells, nextCells),
    merges
  };
}

export function mergeLine(values: CellValue[]): LineMergeResult {
  if (values.length !== BOARD_SIZE) {
    throw new RangeError(`Line must contain exactly ${BOARD_SIZE} cells.`);
  }

  const compactValues = values.filter((value): value is TileValue => value !== null);
  const mergedValues: CellValue[] = [];
  const merges: LineMergeResult["merges"] = [];

  for (let index = 0; index < compactValues.length; index += 1) {
    const value = compactValues[index];
    const nextValue = compactValues[index + 1];

    if (nextValue === value) {
      const mergedValue = value * 2;
      merges.push({
        offset: mergedValues.length,
        value: mergedValue
      });
      mergedValues.push(mergedValue);
      index += 1;
    } else {
      mergedValues.push(value);
    }
  }

  while (mergedValues.length < BOARD_SIZE) {
    mergedValues.push(null);
  }

  return {
    values: mergedValues,
    merges
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

function assertBoardShape(cells: CellValue[]): void {
  if (cells.length !== CELL_COUNT) {
    throw new RangeError(`Board must contain exactly ${CELL_COUNT} cells.`);
  }
}
