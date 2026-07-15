import type { Direction } from "../game/move";
import type { DirectionHandler, InputEnabledCheck } from "./keyboard";

export const MIN_SWIPE_DISTANCE = 40;

export interface TouchPoint {
  clientX: number;
  clientY: number;
}

export interface TouchSwipeEvent {
  preventDefault(): void;
}

export function getSwipeDirection(
  start: TouchPoint,
  end: TouchPoint,
  minimumDistance = MIN_SWIPE_DISTANCE
): Direction | null {
  const deltaX = end.clientX - start.clientX;
  const deltaY = end.clientY - start.clientY;
  const absoluteX = Math.abs(deltaX);
  const absoluteY = Math.abs(deltaY);

  if (Math.max(absoluteX, absoluteY) < minimumDistance) {
    return null;
  }

  if (absoluteX > absoluteY) {
    return deltaX > 0 ? "right" : "left";
  }

  return deltaY > 0 ? "down" : "up";
}

export function handleTouchSwipe(
  event: TouchSwipeEvent,
  start: TouchPoint,
  end: TouchPoint,
  onDirection: DirectionHandler,
  isEnabled: InputEnabledCheck = () => true,
  minimumDistance = MIN_SWIPE_DISTANCE
): boolean {
  const direction = getSwipeDirection(start, end, minimumDistance);

  if (!direction || !isEnabled()) {
    return false;
  }

  event.preventDefault();
  onDirection(direction);

  return true;
}

export function bindTouchControls(
  target: Pick<HTMLElement, "addEventListener" | "removeEventListener">,
  onDirection: DirectionHandler,
  isEnabled: InputEnabledCheck = () => true,
  minimumDistance = MIN_SWIPE_DISTANCE
): () => void {
  let touchStart: TouchPoint | null = null;

  const onTouchStart = (event: TouchEvent) => {
    const touch = event.touches.item(0);
    touchStart = touch ? toTouchPoint(touch) : null;
  };

  const onTouchEnd = (event: TouchEvent) => {
    const touchEnd = event.changedTouches.item(0);

    if (!touchStart || !touchEnd) {
      touchStart = null;
      return;
    }

    handleTouchSwipe(
      event,
      touchStart,
      toTouchPoint(touchEnd),
      onDirection,
      isEnabled,
      minimumDistance
    );
    touchStart = null;
  };

  const onTouchCancel = () => {
    touchStart = null;
  };

  target.addEventListener("touchstart", onTouchStart, { passive: true });
  target.addEventListener("touchend", onTouchEnd, { passive: false });
  target.addEventListener("touchcancel", onTouchCancel, { passive: true });

  return () => {
    target.removeEventListener("touchstart", onTouchStart);
    target.removeEventListener("touchend", onTouchEnd);
    target.removeEventListener("touchcancel", onTouchCancel);
  };
}

function toTouchPoint(touch: Touch): TouchPoint {
  return {
    clientX: touch.clientX,
    clientY: touch.clientY
  };
}
