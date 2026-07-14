export interface TileViewModel {
  id: string;
  value: number;
  row: number;
  column: number;
}

export function createTile(tile: TileViewModel): HTMLElement {
  const element = document.createElement("div");
  element.id = tile.id;
  element.className = "tile";
  element.dataset.value = String(tile.value);
  element.style.setProperty("--tile-row", String(tile.row));
  element.style.setProperty("--tile-column", String(tile.column));
  element.textContent = String(tile.value);
  element.setAttribute("aria-label", `Tile ${tile.value}`);

  return element;
}
