"use client";

import { Fragment, useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { Container } from "@/components/primitives/Container";

/** Splits a string into opacity-fillable word spans (opacity only → no reflow). */
function Words({ text }: { text: string }) {
  const parts = text.split(" ");
  return (
    <>
      {parts.map((word, i) => (
        <Fragment key={i}>
          <span className="reveal-word inline-block">{word}</span>
          {i < parts.length - 1 ? " " : ""}
        </Fragment>
      ))}
    </>
  );
}

// One flowing paragraph (placeholder — final copy later). Consistent size.
const MANIFESTO =
  "Man cannot remake himself without suffering, for he is both the marble and the sculptor. This is your record — no coaches, no notifications, no noise. Just the work: the line you return to each morning, and the figure that slowly emerges from it. What you make of it is yours alone.";

/**
 * Pure-text section — one paragraph, lighter, filling word-by-word on scroll.
 * It also hosts the lights-off moment: at a threshold the whole page FLASHES to
 * dark in a single clean event (a --flip toggle), never a gradual scrub.
 */
export function Manifesto() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Word-by-word reveal to a lighter final opacity.
        gsap.fromTo(
          el.querySelectorAll(".reveal-word"),
          { opacity: 0.1 },
          {
            opacity: 0.72,
            ease: "none",
            stagger: 0.4,
            scrollTrigger: {
              trigger: el,
              start: "top 78%",
              end: "bottom 62%",
              scrub: true,
            },
          },
        );

        // Lights-off — a timed fade at a threshold (a dimmer being turned down,
        // fired as one event; NOT scroll-scrubbed, so no jittery in-between states).
        const flip = ScrollTrigger.create({
          trigger: el,
          start: "bottom 75%",
          onEnter: () =>
            gsap.to(document.documentElement, {
              "--flip": 1,
              duration: 0.7,
              ease: "power2.inOut",
              overwrite: true,
              onUpdate: () => window.dispatchEvent(new Event("marble:flip")),
            }),
          onLeaveBack: () =>
            gsap.to(document.documentElement, {
              "--flip": 0,
              duration: 0.7,
              ease: "power2.inOut",
              overwrite: true,
              onUpdate: () => window.dispatchEvent(new Event("marble:flip")),
            }),
        });

        return () => {
          flip.kill();
          gsap.killTweensOf(document.documentElement);
          document.documentElement.style.removeProperty("--flip");
        };
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} data-manifesto className="relative">
      <Container>
        <div className="mx-auto max-w-3xl py-40 sm:py-56">
          <p className="text-balance text-[clamp(1.5rem,3vw,2.4rem)] font-light leading-[1.4] tracking-[-0.01em]">
            <Words text={MANIFESTO} />
          </p>
          <a
            href="/library"
            className="group mt-14 inline-flex items-center gap-2 font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-taupe transition-colors hover:text-[var(--page-text)]"
          >
            Further reading
            <span
              aria-hidden
              className="transition-transform duration-300 group-hover:translate-x-1"
            >
              →
            </span>
          </a>
        </div>
      </Container>
    </section>
  );
}
