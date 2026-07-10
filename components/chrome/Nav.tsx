"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { Container } from "@/components/primitives/Container";
import { WaitlistCTA } from "@/components/cta/WaitlistCTA";

// Combat Créatif's site — the colophon bar links there.
const COMBAT_URL = "https://combatcreatif.com";

/**
 * Colophon strip + fixed nav. The strip is the inverse of the page (ink on
 * paper at rest, bone on ink after lights-off — both derived from --flip) and
 * carries the designed-by credit as a link to Combat. The nav sits just below
 * it; its palette rides the same continuous --flip so everything dims in
 * lockstep. Subtle frost on the nav: a high-opacity page-tinted backdrop with
 * a light blur — depth without going glossy.
 *
 * The logo is a lockup: the solid block (the app-icon square) with the
 * wordmark beside it. The block never changes; scrolled, the name fades
 * away and the mark carries on alone.
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
    <>
      {/* Colophon strip — the site's one accent: powder blue field, marine
          text, credit as a link. Fixed colors on purpose — it stays blue
          through the lights-off flip. */}
      <a
        href={COMBAT_URL}
        target="_blank"
        rel="noopener"
        className="fixed hidden inset-x-0 top-0 z-50 flex h-8 items-center justify-center gap-6 bg-[#d8e5f6] px-4 text-[0.9375rem] font-normal tracking-normal text-[#1c3d73]"
      >
        <span className="hidden sm:inline">
          Marble is a training journal designed by Combat Créatif.
        </span>
        <span className="sm:hidden">Designed by Combat Créatif.</span>
      </a>

      <header
      id="site-nav"
      className="fixed inset-x-0 z-50 border-b text-[var(--page-text)] backdrop-blur-md backdrop-saturate-150"
      style={{
        backgroundColor: "color-mix(in srgb, var(--page-bg) 82%, transparent)",
        borderColor: "color-mix(in srgb, var(--page-text) 14%, transparent)",
        WebkitBackdropFilter: "blur(12px) saturate(1.5)",
      }}
    >
      <Container className="flex h-16 items-center justify-between gap-4">
        {/* Left — the lockup: constant block, the name fades once scrolled.
            Masthead scale: the wordmark's cap height ≈ the block, per the mark. */}
        <a
          href="#top"
          aria-label="Marble — top of page"
          className="flex shrink-0 items-center"
        >
          <span
            aria-hidden
            className="h-8 w-8 shrink-0 bg-[var(--page-text)]"
          />
          <span
            className={cn(
              "overflow-hidden whitespace-nowrap text-[2.25rem] font-light leading-none tracking-tight text-[var(--page-text)] transition-[max-width,opacity,margin] duration-300 ease-out motion-reduce:transition-none",
              condensed
                ? "ml-0 max-w-0 opacity-0"
                : "ml-1.5 max-w-[12rem] opacity-100",
            )}
          >
            Marble
          </span>
        </a>

        {/* Right — waitlist */}
        <WaitlistCTA variant="nav" tone="auto" className="shrink-0" />
      </Container>
      </header>
    </>
  );
}
