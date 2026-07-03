"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { Container } from "@/components/primitives/Container";
import { WaitlistCTA } from "@/components/cta/WaitlistCTA";

/**
 * Fixed full-width bar. Its palette is derived from the same continuous --flip
 * variable as the body (--page-bg / --page-text), so the bar and the page dim
 * to dark in perfect lockstep — no separate probe, no mid-transition snap.
 * Subtle frost: a high-opacity page-tinted backdrop with a light blur — depth
 * without going glossy; still tracks --flip so it dims with the page.
 *
 * The logo is a block with the wordmark inside: at the top of the page it
 * reads "Marble"; scrolled, the text is chiseled away and only the bare
 * block remains (ink on paper; bone after lights-off — it rides --flip).
 */
export function Nav() {
  const [condensed, setCondensed] = useState(false);

  useEffect(() => {
    let raf = 0;
    const sync = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setCondensed(window.scrollY > 80));
    };
    sync(); // also corrects a mid-page reload (rAF-deferred, not sync setState)
    window.addEventListener("scroll", sync, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", sync);
    };
  }, []);

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
        {/* Left — the block: wordmark inside at rest, bare marble scrolled */}
        <a href="#top" aria-label="Marble — top of page" className="shrink-0">
          <span className="flex h-10 min-w-10 items-center justify-center overflow-hidden bg-[var(--page-text)] text-[var(--page-bg)]">
            <span
              className={cn(
                "overflow-hidden whitespace-nowrap text-lg font-light leading-none transition-[max-width,opacity,padding] duration-300 ease-out motion-reduce:transition-none",
                condensed
                  ? "max-w-0 px-0 opacity-0"
                  : "max-w-[8rem] px-4 opacity-100",
              )}
            >
              Marble
            </span>
          </span>
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
