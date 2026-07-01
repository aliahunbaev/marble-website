/**
 * Minimal in-memory sliding-window rate limiter — a spam speed bump for the
 * waitlist endpoint. Fully effective locally / on a single instance.
 *
 * NOTE: on serverless (e.g. Vercel) each instance has its own memory, so this
 * is a PER-INSTANCE limit, not a global one. For a hard global cap, swap the
 * Map for a shared store (Upstash Redis / Vercel KV) behind this same function.
 */
const hits = new Map<string, number[]>();
const MAX_KEYS = 10_000; // bound memory; wholesale clear if exceeded (rare)

export function rateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number },
): { ok: boolean; retryAfter: number } {
  const now = Date.now();
  const cutoff = now - windowMs;

  if (hits.size > MAX_KEYS) hits.clear();

  const recent = (hits.get(key) ?? []).filter((t) => t > cutoff);

  if (recent.length >= limit) {
    hits.set(key, recent);
    const retryAfter = Math.ceil((recent[0] + windowMs - now) / 1000);
    return { ok: false, retryAfter: Math.max(retryAfter, 1) };
  }

  recent.push(now);
  hits.set(key, recent);
  return { ok: true, retryAfter: 0 };
}
