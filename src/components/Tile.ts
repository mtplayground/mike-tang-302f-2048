export interface TileViewModel {
  id: string;
  value: number;
  row: number;
  column: number;
  previousRow?: number;
  previousColumn?: number;
  merged?: boolean;
  spawned?: boolean;
}

export function createTile(tile: TileViewModel): HTMLElement {
  const element = document.createElement("div");
  element.id = tile.id;
  element.className = getTileClassName(tile);
  element.dataset.value = String(tile.value);
  element.style.setProperty("--tile-row", String(tile.row));
  element.style.setProperty("--tile-column", String(tile.column));

  if (tile.previousRow !== undefined && tile.previousColumn !== undefined) {
    element.style.setProperty("--tile-previous-row", String(tile.previousRow));
    element.style.setProperty("--tile-previous-column", String(tile.previousColumn));
  }

  element.textContent = String(tile.value);
  element.setAttribute("aria-label", `Tile ${tile.value}`);

  return element;
}

function getTileClassName(tile: TileViewModel): string {
  const classNames = ["tile"];

  if (tile.previousRow !== undefined && tile.previousColumn !== undefined) {
    classNames.push("tile--slide");
  }

  if (tile.merged) {
    classNames.push("tile--merged");
  }

  if (tile.spawned) {
    classNames.push("tile--spawned");
  }

  return classNames.join(" ");
}
