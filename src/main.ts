import { createBoard } from "./components/Board";
import { createInitialGameState, getCellPosition } from "./game/state";
import "./styles.css";

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("App root element was not found.");
}

const gameState = createInitialGameState();
const tiles = gameState.cells.flatMap((value, index) => {
  if (value === null) {
    return [];
  }

  const position = getCellPosition(index);

  return [
    {
      id: `tile-${index}`,
      value,
      row: position.row,
      column: position.column
    }
  ];
});

const page = document.createElement("section");
page.className = "game-shell";

const heading = document.createElement("h1");
heading.className = "game-title";
heading.textContent = "2048";

page.append(heading, createBoard(tiles));
app.append(page);
