import { createBoard } from "./components/Board";
import { createHeader } from "./components/Header";
import { createInitialGameState, getCellPosition } from "./game/state";
import { syncBestScore } from "./storage/bestScore";
import "./styles.css";

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("App root element was not found.");
}

const gameState = createInitialGameState();
const bestScore = syncBestScore(gameState.score);
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

page.append(createHeader({ score: gameState.score, bestScore }), createBoard(tiles));
app.append(page);
