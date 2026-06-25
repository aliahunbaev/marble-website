"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { Container } from "@/components/primitives/Container";
import { Wordmark } from "@/components/primitives/Wordmark";
import { WaitlistCTA } from "@/components/cta/WaitlistCTA";

/**
 * Fixed full-width bar. Inverts to light marks/text whenever its probe line
 * sits over a [data-nav-dark] section (final CTA, footer) or the lights-off
 * flip has crossed over. Plain scroll probe — works with native scroll.
 */
export function Nav() {
  const [invert, setInvert] = useState(false);

  useEffect(() => {
    let raf = 0;
    const probeY = 32; // ~vertical center of the bar
    const update = () => {
      raf = 0;
      let dark = false;
      // Always-dark sections (final CTA, footer) under the probe line.
      document.querySelectorAll<HTMLElement>("[data-nav-dark]").forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top <= probeY && r.bottom >= probeY) dark = true;
      });
      // The lights-off flip (manifesto → footer) also inverts the bar.
      const flip =
        parseFloat(
          getComputedStyle(document.documentElement).getPropertyValue("--flip"),
        ) || 0;
      if (flip > 0.5) dark = true;
      setInvert(dark);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    // The lights-off tween pings this so the bar tracks the fade even if the
    // user stops scrolling mid-transition.
    window.addEventListener("marble:flip", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("marble:flip", onScroll);
    };
  }, []);

  return (
    <header
      id="site-nav"
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b transition-colors duration-150",
        invert
          ? "border-white/15 bg-dark text-paper"
          : "border-hairline bg-paper text-ink",
      )}
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
        <p className="pointer-events-none absolute left-1/2 hidden -translate-x-1/2 text-[0.8rem] font-light text-taupe lg:block">
          Training journal designed by Combat Créatif
        </p>

        {/* Right — waitlist */}
        <WaitlistCTA
          variant="nav"
          tone={invert ? "dark" : "light"}
          className="shrink-0"
        />
      </Container>
    </header>
  );
}
