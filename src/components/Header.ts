export function createHeader(score: number): HTMLElement {
  const header = document.createElement("header");
  header.className = "game-header";

  const title = document.createElement("h1");
  title.className = "game-title";
  title.textContent = "2048";

  const scoreCard = document.createElement("section");
  scoreCard.className = "score-card";
  scoreCard.setAttribute("aria-label", "Current score");
  scoreCard.setAttribute("aria-live", "polite");

  const label = document.createElement("span");
  label.className = "score-label";
  label.textContent = "Score";

  const value = document.createElement("span");
  value.className = "score-value";
  value.textContent = score.toLocaleString();

  scoreCard.append(label, value);
  header.append(title, scoreCard);

  return header;
}
