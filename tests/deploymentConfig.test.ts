import assert from "node:assert/strict";
import test from "node:test";
import type { UserConfig } from "vite";
import viteConfig from "../vite.config.ts";

const config = viteConfig as UserConfig;

test("build config produces a portable static bundle", () => {
  assert.equal(config.base, "./");
  assert.equal(config.build?.outDir, "dist");
  assert.equal(config.build?.assetsDir, "assets");
  assert.equal(config.build?.emptyOutDir, true);
  assert.equal(config.build?.sourcemap, false);
});

test("local server commands bind to the deployment port", () => {
  assert.equal(config.server?.host, "0.0.0.0");
  assert.equal(config.server?.port, 8080);
  assert.equal(config.server?.strictPort, true);
  assert.equal(config.preview?.host, "0.0.0.0");
  assert.equal(config.preview?.port, 8080);
  assert.equal(config.preview?.strictPort, true);
});
