import test from "node:test";
import assert from "node:assert/strict";
import { getVercelDataDir, isVercelRuntime } from "../../src/lib/serverlessRuntime.ts";

test("isVercelRuntime is true for VERCEL=1 and VERCEL=true", () => {
  assert.equal(isVercelRuntime({ VERCEL: "1" }), true);
  assert.equal(isVercelRuntime({ VERCEL: "true" }), true);
  assert.equal(isVercelRuntime({ VERCEL: "TRUE" }), true);
  assert.equal(isVercelRuntime({ VERCEL: " 1 " }), true);
});

test("isVercelRuntime is false when VERCEL is unset or not a truthy platform flag", () => {
  assert.equal(isVercelRuntime({}), false);
  assert.equal(isVercelRuntime({ VERCEL: "" }), false);
  assert.equal(isVercelRuntime({ VERCEL: "0" }), false);
  assert.equal(isVercelRuntime({ VERCEL: "false" }), false);
});

test("getVercelDataDir is the ephemeral /tmp path", () => {
  assert.equal(getVercelDataDir(), "/tmp/omniroute");
});
