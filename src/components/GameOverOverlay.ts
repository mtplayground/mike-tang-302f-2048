export function createGameOverOverlay(score: number, onRestart: () => void): HTMLElement {
  const overlay = document.createElement("section");
  overlay.className = "game-overlay";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-labelledby", "game-over-overlay-title");

  const content = document.createElement("div");
  content.className = "overlay-content";

  const title = document.createElement("h2");
  title.id = "game-over-overlay-title";
  title.className = "overlay-title";
  title.textContent = "Game over";

  const message = document.createElement("p");
  message.className = "overlay-message";
  message.textContent = "No moves remain.";

  const finalScore = document.createElement("p");
  finalScore.className = "overlay-score";
  finalScore.textContent = `Final score: ${score.toLocaleString()}`;

  const action = document.createElement("button");
  action.className = "overlay-action";
  action.type = "button";
  action.textContent = "Restart";
  action.addEventListener("click", onRestart);

  content.append(title, message, finalScore, action);
  overlay.append(content);

  return overlay;
}
