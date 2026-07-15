import { createBoard } from "./components/Board";
import { createGameOverOverlay } from "./components/GameOverOverlay";
import { createHeader } from "./components/Header";
import { createWinOverlay } from "./components/WinOverlay";
import {
  acknowledgeWin,
  createInitialGameState,
  getCellPosition,
  isGameOver,
  shouldShowWinOverlay,
  type GameState
} from "./game/state";
import { syncBestScore } from "./storage/bestScore";
import "./styles.css";

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("App root element was not found.");
}

let gameState = createInitialGameState();

const page = document.createElement("section");
page.className = "game-shell";
app.append(page);

renderGame();

function renderGame(): void {
  const bestScore = syncBestScore(gameState.score);
  const boardArea = document.createElement("div");
  boardArea.className = "game-board-area";

  boardArea.append(createBoard(createTiles(gameState)));

  if (shouldShowWinOverlay(gameState)) {
    boardArea.append(
      createWinOverlay(() => {
        gameState = acknowledgeWin(gameState);
        renderGame();
      })
    );
  } else if (isGameOver(gameState.cells)) {
    boardArea.append(
      createGameOverOverlay(gameState.score, () => {
        gameState = createInitialGameState();
        renderGame();
      })
    );
  }

  page.replaceChildren(createHeader({ score: gameState.score, bestScore }), boardArea);
}

function createTiles(state: GameState) {
  return state.cells.flatMap((value, index) => {
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
}
