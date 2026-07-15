import type { Direction } from "../game/move";

export interface KeyboardDirectionEvent {
  key: string;
  preventDefault(): void;
}

export type DirectionHandler = (direction: Direction) => void;
export type InputEnabledCheck = () => boolean;

export function getDirectionForKey(key: string): Direction | null {
  switch (key) {
    case "ArrowUp":
      return "up";
    case "ArrowDown":
      return "down";
    case "ArrowLeft":
      return "left";
    case "ArrowRight":
      return "right";
    default:
      return null;
  }
}

export function handleKeyboardDirection(
  event: KeyboardDirectionEvent,
  onDirection: DirectionHandler,
  isEnabled: InputEnabledCheck = () => true
): boolean {
  const direction = getDirectionForKey(event.key);

  if (!direction || !isEnabled()) {
    return false;
  }

  event.preventDefault();
  onDirection(direction);

  return true;
}

export function bindKeyboardControls(
  target: Pick<Window, "addEventListener" | "removeEventListener">,
  onDirection: DirectionHandler,
  isEnabled: InputEnabledCheck = () => true
): () => void {
  const onKeyDown = (event: KeyboardEvent) => {
    handleKeyboardDirection(event, onDirection, isEnabled);
  };

  target.addEventListener("keydown", onKeyDown);

  return () => {
    target.removeEventListener("keydown", onKeyDown);
  };
}
