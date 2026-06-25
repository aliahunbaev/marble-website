/**
 * The single email-capture seam. Swap the body for a real provider
 * (Buttondown / ConvertKit / Formspree / a route handler) later without
 * touching any component. For now it logs and fakes success.
 */
export async function subscribeEmail(
  email: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isValidEmail(email)) {
    return { ok: false, error: "Enter a valid email." };
  }
  // eslint-disable-next-line no-console
  console.log("[subscribeEmail] stub →", email);
  await new Promise((r) => setTimeout(r, 600)); // fake latency
  return { ok: true };
}

export function isValidEmail(email: string): boolean {
  // Pragmatic check — not RFC-perfect, just enough to reject obvious typos.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}
