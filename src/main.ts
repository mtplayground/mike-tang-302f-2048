import { createBoard } from "./components/Board";
import { createGameOverOverlay } from "./components/GameOverOverlay";
import { createHeader } from "./components/Header";
import { createWinOverlay } from "./components/WinOverlay";
import { moveCellsWithSpawn, type Direction, type TileMovement } from "./game/move";
import {
  acknowledgeWin,
  applyScoreDelta,
  createInitialGameState,
  getCellPosition,
  isGameOver,
  shouldShowWinOverlay,
  type GameState
} from "./game/state";
import { bindKeyboardControls } from "./input/keyboard";
import { bindTouchControls } from "./input/touch";
import { syncBestScore } from "./storage/bestScore";
import "./styles.css";

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("App root element was not found.");
}

let gameState = createInitialGameState();
let tileAnimations = new Map<number, TileAnimation>();

const page = document.createElement("section");
page.className = "game-shell";
app.append(page);

bindKeyboardControls(window, move, isInputEnabled);
bindTouchControls(page, move, isInputEnabled);
renderGame();

function move(direction: Direction): void {
  const moveResult = moveCellsWithSpawn(gameState.cells, direction);

  if (!moveResult.moved) {
    return;
  }

  tileAnimations = createTileAnimations(moveResult.movements, moveResult.spawned?.index);
  gameState = applyScoreDelta(
    {
      ...gameState,
      cells: moveResult.cells
    },
    moveResult.scoreDelta
  );
  renderGame();
}

function isInputEnabled(): boolean {
  return !shouldShowWinOverlay(gameState) && !isGameOver(gameState.cells);
}

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
        tileAnimations = new Map();
        renderGame();
      })
    );
  }

  page.replaceChildren(createHeader({ score: gameState.score, bestScore }), boardArea);
  tileAnimations = new Map();
}

function createTiles(state: GameState) {
  return state.cells.flatMap((value, index) => {
    if (value === null) {
      return [];
    }

    const position = getCellPosition(index);
    const animation = tileAnimations.get(index);

    return [
      {
        id: `tile-${index}`,
        value,
        row: position.row,
        column: position.column,
        previousRow: animation?.previousRow,
        previousColumn: animation?.previousColumn,
        merged: animation?.merged,
        spawned: animation?.spawned
      }
    ];
  });
}

interface TileAnimation {
  previousRow?: number;
  previousColumn?: number;
  merged?: boolean;
  spawned?: boolean;
}

function createTileAnimations(
  movements: TileMovement[],
  spawnedIndex?: number
): Map<number, TileAnimation> {
  const animations = new Map<number, TileAnimation>();

  for (const movement of movements) {
    if (!movement.merged && movement.fromIndex === movement.toIndex) {
      continue;
    }

    const from = getCellPosition(movement.fromIndex);

    animations.set(movement.toIndex, {
      previousRow: from.row,
      previousColumn: from.column,
      merged: movement.merged
    });
  }

  if (spawnedIndex !== undefined) {
    animations.set(spawnedIndex, { spawned: true });
  }

  return animations;
}
