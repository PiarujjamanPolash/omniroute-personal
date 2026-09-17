import { test } from "node:test";
import assert from "node:assert/strict";

import {
  isGlibcTooOldForNextSwc,
  isTurbopackUnsupportedPlatformOutput,
  resolveNextBuildBundlerFlag,
} from "../../../scripts/build/build-next-isolated.mjs";

test("resolveNextBuildBundlerFlag returns --turbopack by default", () => {
  const flag = resolveNextBuildBundlerFlag({}, { glibcVersionRuntime: "2.39" });
  assert.equal(flag, "--turbopack");
});

test("resolveNextBuildBundlerFlag returns --webpack when OMNIROUTE_USE_TURBOPACK is '0'", () => {
  const flag = resolveNextBuildBundlerFlag(
    { OMNIROUTE_USE_TURBOPACK: "0" },
    { glibcVersionRuntime: "2.39" }
  );
  assert.equal(flag, "--webpack");
});

test("resolveNextBuildBundlerFlag returns --turbopack when OMNIROUTE_USE_TURBOPACK is '1'", () => {
  const flag = resolveNextBuildBundlerFlag(
    { OMNIROUTE_USE_TURBOPACK: "1" },
    { glibcVersionRuntime: "2.39" }
  );
  assert.equal(flag, "--turbopack");
});

test("resolveNextBuildBundlerFlag uses webpack when glibc is older than 2.29 (Hostinger)", () => {
  const flag = resolveNextBuildBundlerFlag(
    { OMNIROUTE_USE_TURBOPACK: "1" },
    { glibcVersionRuntime: "2.17" }
  );
  assert.equal(flag, "--webpack");
});

test("isGlibcTooOldForNextSwc detects Hostinger-class glibc", () => {
  assert.equal(isGlibcTooOldForNextSwc("2.17"), true);
  assert.equal(isGlibcTooOldForNextSwc("2.28"), true);
  assert.equal(isGlibcTooOldForNextSwc("2.29"), false);
  assert.equal(isGlibcTooOldForNextSwc("2.39"), false);
  assert.equal(isGlibcTooOldForNextSwc(undefined), false);
});

test("isTurbopackUnsupportedPlatformOutput matches the Next.js Hostinger error", () => {
  assert.equal(
    isTurbopackUnsupportedPlatformOutput(
      "Error: Turbopack is not supported on this platform (linux/x64) because native bindings are not available."
    ),
    true
  );
  assert.equal(isTurbopackUnsupportedPlatformOutput("Compiled successfully"), false);
});
