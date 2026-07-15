import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { moveCellsWithSpawn, type Direction } from "../src/game/move.ts";
import type { CellValue } from "../src/game/state.ts";
import {
  handleKeyboardDirection,
  type KeyboardDirectionEvent
} from "../src/input/keyboard.ts";
import { handleTouchSwipe, type TouchPoint, type TouchSwipeEvent } from "../src/input/touch.ts";

test("keyboard and swipe input dispatch equivalent moves into the game", () => {
  const cells = board([
    [2, 2, null, null],
    [null, null, null, null],
    [null, null, null, null],
    [null, null, null, null]
  ]);

  const keyboardDirection = dispatchKeyboard("ArrowLeft");
  const swipeDirection = dispatchSwipe(point(120, 80), point(40, 80));

  assert.equal(keyboardDirection, "left");
  assert.equal(swipeDirection, "left");

  const keyboardMove = moveCellsWithSpawn(cells, keyboardDirection, sequence([0, 0]));
  const swipeMove = moveCellsWithSpawn(cells, swipeDirection, sequence([0, 0]));

  assert.equal(keyboardMove.moved, true);
  assert.equal(swipeMove.moved, true);
  assert.equal(keyboardMove.scoreDelta, 4);
  assert.equal(swipeMove.scoreDelta, 4);
  assert.deepEqual(swipeMove.cells, keyboardMove.cells);
  assert.deepEqual(swipeMove.spawned, keyboardMove.spawned);
});

test("responsive and animation CSS includes desktop, mobile, and short-screen safeguards", () => {
  const css = readFileSync(new URL("../src/styles.css", import.meta.url), "utf8");

  assert.match(css, /--board-size:\s*min\(calc\(100vw - \(var\(--page-inline-padding\) \* 2\)\), 520px\)/);
  assert.match(css, /min-height:\s*100dvh/);
  assert.match(css, /touch-action:\s*none/);
  assert.match(css, /@media \(max-width: 520px\)/);
  assert.match(css, /@media \(max-width: 360px\)/);
  assert.match(css, /@media \(max-height: 620px\) and \(orientation: landscape\)/);
  assert.match(css, /@keyframes tile-slide/);
  assert.match(css, /@keyframes tile-slide-pop/);
  assert.match(css, /@keyframes tile-spawn/);

  for (const declaration of css.matchAll(/font-size:\s*[^;]+;/g)) {
    assert.doesNotMatch(
      declaration[0],
      /\b\d*\.?\d+v[wh]\b/,
      "font-size declarations should not scale directly with viewport units"
    );
  }
});

function dispatchKeyboard(key: string): Direction {
  let direction: Direction | null = null;
  const handled = handleKeyboardDirection(keyboardEvent(key), (nextDirection) => {
    direction = nextDirection;
  });

  assert.equal(handled, true);
  assert.notEqual(direction, null);

  return direction;
}

function dispatchSwipe(start: TouchPoint, end: TouchPoint): Direction {
  let direction: Direction | null = null;
  const handled = handleTouchSwipe(swipeEvent(), start, end, (nextDirection) => {
    direction = nextDirection;
  });

  assert.equal(handled, true);
  assert.notEqual(direction, null);

  return direction;
}

function board(rows: CellValue[][]): CellValue[] {
  return rows.flat();
}

function point(clientX: number, clientY: number): TouchPoint {
  return { clientX, clientY };
}

function keyboardEvent(key: string): KeyboardDirectionEvent {
  return {
    key,
    preventDefault() {}
  };
}

function swipeEvent(): TouchSwipeEvent {
  return {
    preventDefault() {}
  };
}

function sequence(values: number[]): () => number {
  let index = 0;

  return () => {
    const value = values[index];

    if (value === undefined) {
      throw new Error("Random sequence was exhausted.");
    }

    index += 1;
    return value;
  };
}
