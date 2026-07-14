export interface HeaderScores {
  score: number;
  bestScore: number;
}

export function createHeader(scores: HeaderScores): HTMLElement {
  const header = document.createElement("header");
  header.className = "game-header";

  const title = document.createElement("h1");
  title.className = "game-title";
  title.textContent = "2048";

  const scoresGroup = document.createElement("div");
  scoresGroup.className = "score-group";

  scoresGroup.append(
    createScoreCard("Score", scores.score, "Current score"),
    createScoreCard("Best", scores.bestScore, "Best score")
  );

  header.append(title, scoresGroup);

  return header;
}

function createScoreCard(labelText: string, score: number, ariaLabel: string): HTMLElement {
  const scoreCard = document.createElement("section");
  scoreCard.className = "score-card";
  scoreCard.setAttribute("aria-label", ariaLabel);
  scoreCard.setAttribute("aria-live", "polite");

  const label = document.createElement("span");
  label.className = "score-label";
  label.textContent = labelText;

  const value = document.createElement("span");
  value.className = "score-value";
  value.textContent = score.toLocaleString();

  scoreCard.append(label, value);
  return scoreCard;
}
