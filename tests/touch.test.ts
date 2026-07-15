import assert from "node:assert/strict";
import test from "node:test";
import {
  getSwipeDirection,
  handleTouchSwipe,
  MIN_SWIPE_DISTANCE,
  type TouchPoint,
  type TouchSwipeEvent
} from "../src/input/touch.ts";

test("getSwipeDirection maps swipes to move directions", () => {
  assert.equal(getSwipeDirection(point(100, 100), point(100, 20)), "up");
  assert.equal(getSwipeDirection(point(100, 100), point(100, 180)), "down");
  assert.equal(getSwipeDirection(point(100, 100), point(20, 100)), "left");
  assert.equal(getSwipeDirection(point(100, 100), point(180, 100)), "right");
});

test("getSwipeDirection ignores gestures below the minimum distance", () => {
  assert.equal(
    getSwipeDirection(point(100, 100), point(100 + MIN_SWIPE_DISTANCE - 1, 100)),
    null
  );
});

test("getSwipeDirection uses the dominant swipe axis", () => {
  assert.equal(getSwipeDirection(point(100, 100), point(155, 130)), "right");
  assert.equal(getSwipeDirection(point(100, 100), point(125, 45)), "up");
});

test("handleTouchSwipe prevents default and dispatches enabled swipes", () => {
  const event = swipeEvent();
  const directions: string[] = [];

  const handled = handleTouchSwipe(
    event,
    point(100, 100),
    point(40, 100),
    (direction) => {
      directions.push(direction);
    },
    () => true
  );

  assert.equal(handled, true);
  assert.equal(event.prevented, true);
  assert.deepEqual(directions, ["left"]);
});

test("handleTouchSwipe ignores swipes while disabled", () => {
  const event = swipeEvent();
  const directions: string[] = [];

  const handled = handleTouchSwipe(
    event,
    point(100, 100),
    point(100, 40),
    (direction) => {
      directions.push(direction);
    },
    () => false
  );

  assert.equal(handled, false);
  assert.equal(event.prevented, false);
  assert.deepEqual(directions, []);
});

test("handleTouchSwipe ignores short gestures", () => {
  const event = swipeEvent();

  const handled = handleTouchSwipe(
    event,
    point(100, 100),
    point(130, 100),
    () => {
      throw new Error("Short touch gestures should not dispatch a direction.");
    }
  );

  assert.equal(handled, false);
  assert.equal(event.prevented, false);
});

function point(clientX: number, clientY: number): TouchPoint {
  return { clientX, clientY };
}

function swipeEvent(): TouchSwipeEvent & { prevented: boolean } {
  return {
    prevented: false,
    preventDefault() {
      this.prevented = true;
    }
  };
}
