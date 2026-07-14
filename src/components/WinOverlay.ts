export function createWinOverlay(onKeepPlaying: () => void): HTMLElement {
  const overlay = document.createElement("section");
  overlay.className = "game-overlay";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-labelledby", "win-overlay-title");

  const content = document.createElement("div");
  content.className = "overlay-content";

  const title = document.createElement("h2");
  title.id = "win-overlay-title";
  title.className = "overlay-title";
  title.textContent = "You win!";

  const message = document.createElement("p");
  message.className = "overlay-message";
  message.textContent = "You reached 2048.";

  const action = document.createElement("button");
  action.className = "overlay-action";
  action.type = "button";
  action.textContent = "Keep Playing";
  action.addEventListener("click", onKeepPlaying);

  content.append(title, message, action);
  overlay.append(content);

  return overlay;
}
