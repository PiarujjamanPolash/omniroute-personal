/**
 * Decide whether the Turbopack build should alias @/mitm/manager to the
 * feature-degraded stub (src/mitm/manager.stub.ts).
 *
 * History (#6344): the alias used to be UNCONDITIONAL in next.config.mjs
 * because Docker images were the only Turbopack consumers (webpack was the
 * production default and never aliased the manager). When v3.8.45 flipped the
 * production bundler default to Turbopack, the stub silently shipped to every
 * npm / Electron / VPS artifact — Agent Bridge start then threw
 * "MITM manager stub reached at runtime" for all non-Docker users.
 *
 * The stub is only correct where the runtime genuinely cannot run the MITM
 * stack (containers without host access — #3390 graceful degradation; Vercel
 * Functions), so it is opt-in via OMNIROUTE_MITM_STUB=1 (Dockerfile) or VERCEL=1.
 */
export function shouldStubMitmManager(env = process.env) {
  const vercel = env.VERCEL?.trim().toLowerCase();
  return env.OMNIROUTE_MITM_STUB === "1" || vercel === "1" || vercel === "true";
}

/** Turbopack resolveAlias fragment for @/mitm/manager, derived from the env. */
export function mitmManagerAliasFor(env = process.env) {
  return shouldStubMitmManager(env) ? { "@/mitm/manager": "./src/mitm/manager.stub.ts" } : {};
}
