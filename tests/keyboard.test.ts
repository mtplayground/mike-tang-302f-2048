import assert from "node:assert/strict";
import test from "node:test";
import {
  getDirectionForKey,
  handleKeyboardDirection,
  type KeyboardDirectionEvent
} from "../src/input/keyboard.ts";

test("getDirectionForKey maps arrow keys to move directions", () => {
  assert.equal(getDirectionForKey("ArrowUp"), "up");
  assert.equal(getDirectionForKey("ArrowDown"), "down");
  assert.equal(getDirectionForKey("ArrowLeft"), "left");
  assert.equal(getDirectionForKey("ArrowRight"), "right");
});

test("getDirectionForKey ignores non-arrow keys", () => {
  assert.equal(getDirectionForKey("w"), null);
  assert.equal(getDirectionForKey("Enter"), null);
});

test("handleKeyboardDirection prevents default and dispatches enabled arrow keys", () => {
  const directions: string[] = [];
  const event = keyboardEvent("ArrowLeft");

  const handled = handleKeyboardDirection(
    event,
    (direction) => {
      directions.push(direction);
    },
    () => true
  );

  assert.equal(handled, true);
  assert.equal(event.prevented, true);
  assert.deepEqual(directions, ["left"]);
});

test("handleKeyboardDirection ignores arrow keys while disabled", () => {
  const directions: string[] = [];
  const event = keyboardEvent("ArrowRight");

  const handled = handleKeyboardDirection(
    event,
    (direction) => {
      directions.push(direction);
    },
    () => false
  );

  assert.equal(handled, false);
  assert.equal(event.prevented, false);
  assert.deepEqual(directions, []);
});

test("handleKeyboardDirection ignores non-arrow keys", () => {
  const event = keyboardEvent("Escape");
  const handled = handleKeyboardDirection(event, () => {
    throw new Error("Non-arrow keys should not dispatch a direction.");
  });

  assert.equal(handled, false);
  assert.equal(event.prevented, false);
});

function keyboardEvent(key: string): KeyboardDirectionEvent & { prevented: boolean } {
  return {
    key,
    prevented: false,
    preventDefault() {
      this.prevented = true;
    }
  };
}
