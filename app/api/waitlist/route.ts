import { promises as fs } from "node:fs";
import path from "node:path";
import { isValidEmail } from "@/lib/subscribeEmail";
import { rateLimit } from "@/lib/rateLimit";

// fs access below requires the Node runtime (not edge). POST is never cached.
export const runtime = "nodejs";

const RESEND_API = "https://api.resend.com";

/**
 * The waitlist sink. When RESEND_API_KEY + RESEND_AUDIENCE_ID are set, each
 * signup is added to a Resend Audience (production). Otherwise it's appended to
 * .data/waitlist.jsonl so the form works locally with zero setup. Swapping the
 * provider is a change here only — the client seam (lib/subscribeEmail) and the
 * UI never change.
 */
export async function POST(request: Request) {
  // 1) Rate-limit by client IP — shed floods before doing any work.
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const rl = rateLimit(`waitlist:${ip}`, { limit: 5, windowMs: 60_000 });
  if (!rl.ok) {
    return Response.json(
      { ok: false, error: "Too many requests. Please try again in a moment." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } },
    );
  }

  // 2) Parse the body.
  let body: { email?: unknown; company?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Bad request." }, { status: 400 });
  }

  // 3) Honeypot: real users never fill the hidden "company" field. If it's
  //    populated, it's a bot — feign success so it doesn't retry, store nothing.
  if (typeof body.company === "string" && body.company.trim() !== "") {
    return Response.json({ ok: true });
  }

  // 4) Validate the email.
  if (typeof body.email !== "string" || !isValidEmail(body.email)) {
    return Response.json(
      { ok: false, error: "Enter a valid email." },
      { status: 400 },
    );
  }
  const email = body.email.trim().toLowerCase();

  const apiKey = process.env.RESEND_API_KEY;
  const audienceId = process.env.RESEND_AUDIENCE_ID;

  if (apiKey && audienceId) {
    return addToResend(email, apiKey, audienceId);
  }
  if (apiKey && !audienceId) {
    console.warn(
      "[waitlist] RESEND_API_KEY is set but RESEND_AUDIENCE_ID is missing — falling back to local file.",
    );
  }
  return appendToFile(email);
}

async function addToResend(email: string, apiKey: string, audienceId: string) {
  try {
    const res = await fetch(`${RESEND_API}/audiences/${audienceId}/contacts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, unsubscribed: false }),
    });

    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as {
        message?: string;
      } | null;
      // Re-subscribing an existing contact isn't an error — treat as success.
      const duplicate =
        res.status === 409 || /already/i.test(data?.message ?? "");
      if (!duplicate) {
        console.error("[waitlist] resend error", res.status, data);
        return Response.json(
          { ok: false, error: "Could not subscribe right now." },
          { status: 502 },
        );
      }
    }
    return Response.json({ ok: true });
  } catch (err) {
    console.error("[waitlist] resend request failed", err);
    return Response.json(
      { ok: false, error: "Could not subscribe right now." },
      { status: 502 },
    );
  }
}

async function appendToFile(email: string) {
  try {
    const dir = path.join(process.cwd(), ".data");
    const file = path.join(dir, "waitlist.jsonl");
    await fs.mkdir(dir, { recursive: true });

    let existing = "";
    try {
      existing = await fs.readFile(file, "utf8");
    } catch {
      // First signup — file doesn't exist yet.
    }
    const known = existing
      .split("\n")
      .filter(Boolean)
      .some((line) => {
        try {
          return JSON.parse(line).email === email;
        } catch {
          return false;
        }
      });

    if (!known) {
      const row = JSON.stringify({ email, ts: new Date().toISOString() });
      await fs.appendFile(file, row + "\n", "utf8");
    }
    return Response.json({ ok: true });
  } catch (err) {
    console.error("[waitlist] file write failed", err);
    return Response.json(
      { ok: false, error: "Could not subscribe right now." },
      { status: 500 },
    );
  }
}
