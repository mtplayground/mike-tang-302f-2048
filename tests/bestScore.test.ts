import assert from "node:assert/strict";
import test from "node:test";
import {
  readBestScore,
  syncBestScore,
  writeBestScore,
  type BestScoreStorage
} from "../src/storage/bestScore.ts";

test("readBestScore returns zero when storage is unavailable", () => {
  assert.equal(readBestScore(null), 0);
});

test("readBestScore returns zero for missing, malformed, or negative scores", () => {
  const storage = new MemoryStorage();

  assert.equal(readBestScore(storage), 0);

  storage.setItem("2048:best-score", "not-a-number");
  assert.equal(readBestScore(storage), 0);

  storage.setItem("2048:best-score", "-4");
  assert.equal(readBestScore(storage), 0);
});

test("writeBestScore persists a valid best score", () => {
  const storage = new MemoryStorage();

  writeBestScore(128, storage);

  assert.equal(readBestScore(storage), 128);
});

test("syncBestScore stores a new high score and returns it", () => {
  const storage = new MemoryStorage();

  assert.equal(syncBestScore(256, storage), 256);
  assert.equal(readBestScore(storage), 256);
});

test("syncBestScore preserves a higher stored score", () => {
  const storage = new MemoryStorage();
  writeBestScore(512, storage);

  assert.equal(syncBestScore(128, storage), 512);
  assert.equal(readBestScore(storage), 512);
});

test("best score storage fails soft when writes throw", () => {
  const storage = new ThrowingStorage();

  assert.doesNotThrow(() => writeBestScore(64, storage));
  assert.equal(syncBestScore(64, storage), 64);
});

test("best score helpers reject invalid current scores", () => {
  const storage = new MemoryStorage();

  assert.throws(() => writeBestScore(-1, storage), RangeError);
  assert.throws(() => syncBestScore(2.5, storage), RangeError);
});

class MemoryStorage implements BestScoreStorage {
  private readonly values = new Map<string, string>();

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }
}

class ThrowingStorage implements BestScoreStorage {
  getItem(): string | null {
    return null;
  }

  setItem(): void {
    throw new Error("Storage is unavailable.");
  }
}
