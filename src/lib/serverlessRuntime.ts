/**
 * Leaf helper for hosted/serverless platforms (currently Vercel).
 *
 * Zero imports so db/data-path/instrumentation code can depend on it without
 * creating cycles. Platform env vars (`VERCEL`, `VERCEL_ENV`, …) are set by
 * the host and must stay on the env-doc-sync ignore list.
 */

export function isVercelRuntime(env: NodeJS.ProcessEnv = process.env): boolean {
  const value = env.VERCEL?.trim().toLowerCase();
  return value === "1" || value === "true";
}

/** Writable ephemeral dir used when Vercel has no durable disk. */
export function getVercelDataDir(): string {
  return "/tmp/omniroute";
}
