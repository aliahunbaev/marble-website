"use client";

import { Container } from "@/components/primitives/Container";
import { Wordmark } from "@/components/primitives/Wordmark";
import { WaitlistCTA } from "@/components/cta/WaitlistCTA";

/**
 * Fixed full-width bar. Its palette is derived from the same continuous --flip
 * variable as the body (--page-bg / --page-text), so the bar and the page dim
 * to dark in perfect lockstep — no separate probe, no mid-transition snap.
 * Subtle frost: a high-opacity page-tinted backdrop with a light blur — depth
 * without going glossy; still tracks --flip so it dims with the page.
 */
export function Nav() {
  return (
    <header
      id="site-nav"
      className="fixed inset-x-0 top-0 z-50 border-b text-[var(--page-text)] backdrop-blur-md backdrop-saturate-150"
      style={{
        backgroundColor: "color-mix(in srgb, var(--page-bg) 82%, transparent)",
        borderColor: "color-mix(in srgb, var(--page-text) 14%, transparent)",
        WebkitBackdropFilter: "blur(12px) saturate(1.5)",
      }}
    >
      <Container className="flex h-16 items-center justify-between gap-4">
        {/* Left — wordmark + mark */}
        <a
          href="#top"
          className="inline-flex shrink-0 items-center text-lg leading-none"
          aria-label="Marble — top of page"
        >
          <Wordmark withMark markClassName="size-10" />
        </a>

        {/* Center — byline / positioning (text, not a link) */}
        <p className="pointer-events-none absolute left-1/2 hidden -translate-x-1/2 font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-taupe lg:block">
          Training journal designed by Combat Créatif
        </p>

        {/* Right — waitlist */}
        <WaitlistCTA variant="nav" tone="auto" className="shrink-0" />
      </Container>
    </header>
  );
}
