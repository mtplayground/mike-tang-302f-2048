const BEST_SCORE_KEY = "2048:best-score";

export interface BestScoreStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export function readBestScore(storage: BestScoreStorage | null = getBrowserStorage()): number {
  if (!storage) {
    return 0;
  }

  try {
    return parseStoredScore(storage.getItem(BEST_SCORE_KEY));
  } catch {
    return 0;
  }
}

export function syncBestScore(
  currentScore: number,
  storage: BestScoreStorage | null = getBrowserStorage()
): number {
  assertScore(currentScore);

  const storedBest = readBestScore(storage);
  const nextBest = Math.max(storedBest, currentScore);

  if (nextBest > storedBest) {
    writeBestScore(nextBest, storage);
  }

  return nextBest;
}

export function writeBestScore(
  score: number,
  storage: BestScoreStorage | null = getBrowserStorage()
): void {
  assertScore(score);

  if (!storage) {
    return;
  }

  try {
    storage.setItem(BEST_SCORE_KEY, String(score));
  } catch {
    return;
  }
}

function parseStoredScore(value: string | null): number {
  if (value === null) {
    return 0;
  }

  const score = Number(value);

  if (!Number.isInteger(score) || score < 0) {
    return 0;
  }

  return score;
}

function assertScore(score: number): void {
  if (!Number.isInteger(score) || score < 0) {
    throw new RangeError("Score must be a non-negative integer.");
  }
}

function getBrowserStorage(): BestScoreStorage | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}
