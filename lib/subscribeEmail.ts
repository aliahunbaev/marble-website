/**
 * The single email-capture seam. The UI never talks to a provider directly — it
 * calls this, which POSTs to the /api/waitlist route handler. Swap the provider
 * server-side (Resend / Supabase / Buttondown …) in app/api/waitlist/route.ts
 * without touching any component.
 */
export async function subscribeEmail(
  email: string,
  honeypot = "",
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isValidEmail(email)) {
    return { ok: false, error: "Enter a valid email." };
  }
  try {
    const res = await fetch("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim(), company: honeypot }),
    });
    const data = (await res.json().catch(() => null)) as
      | { ok: true }
      | { ok: false; error: string }
      | null;

    if (res.ok && data?.ok) return { ok: true };
    return {
      ok: false,
      error:
        data && data.ok === false ? data.error : "Something went wrong. Try again.",
    };
  } catch {
    return { ok: false, error: "Network error. Try again." };
  }
}

export function isValidEmail(email: string): boolean {
  // Pragmatic check — not RFC-perfect, just enough to reject obvious typos.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}
