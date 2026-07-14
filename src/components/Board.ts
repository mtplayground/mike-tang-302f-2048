import { createTile, type TileViewModel } from "./Tile";

const BOARD_SIZE = 4;
const CELL_COUNT = BOARD_SIZE * BOARD_SIZE;

export function createBoard(tiles: TileViewModel[]): HTMLElement {
  const board = document.createElement("section");
  board.className = "board";
  board.setAttribute("aria-label", "2048 board");

  const cells = document.createElement("div");
  cells.className = "board-cells";
  cells.setAttribute("aria-hidden", "true");

  for (let index = 0; index < CELL_COUNT; index += 1) {
    const cell = document.createElement("div");
    cell.className = "board-cell";
    cells.append(cell);
  }

  const tileLayer = document.createElement("div");
  tileLayer.className = "tile-layer";

  for (const tile of tiles) {
    tileLayer.append(createTile(tile));
  }

  board.append(cells, tileLayer);
  return board;
}
