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

const P1 =
  "At birth we are given a vessel of marble with which our soul will come to know and experience this world. It is the artist's duty to cultivate the vessel to reflect the beauty of the soul within, and the world we inhabit. This is a creative discipline.";
const P2 =
  "Marble is a tool designed to help you reach your greatest physical potential. We seek the highest form of human creativity is sculpting the vessel with which our soul comes in contact with this world.";

/**
 * Two-paragraph statement. Each paragraph fills word-by-word at the reading line
 * (lighter final opacity). The lights-off fade fires BETWEEN them — as the second
 * paragraph arrives the page dims to dark, so P2 reads in the dark.
 */
export function Manifesto() {
  const root = useRef<HTMLElement>(null);
  const p1Ref = useRef<HTMLParagraphElement>(null);
  const p2Ref = useRef<HTMLParagraphElement>(null);

  useGSAP(
    () => {
      const p1 = p1Ref.current;
      const p2 = p2Ref.current;
      if (!p1 || !p2) return;

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Reading-paced word reveal — each paragraph lights as it crosses center.
        const reveal = (p: HTMLElement) =>
          gsap.fromTo(
            p.querySelectorAll(".reveal-word"),
            { opacity: 0.1 },
            {
              opacity: 0.72,
              ease: "none",
              stagger: 0.12,
              scrollTrigger: {
                trigger: p,
                start: "top 82%",
                end: "top 45%",
                scrub: true,
              },
            },
          );
        reveal(p1);
        reveal(p2);

        // Lights-off — a timed fade fired BETWEEN the paragraphs (as P2 arrives).
        const pingNav = () => window.dispatchEvent(new Event("marble:flip"));
        const flip = ScrollTrigger.create({
          trigger: p2,
          start: "top 78%",
          onEnter: () =>
            gsap.to(document.documentElement, {
              "--flip": 1,
              duration: 0.7,
              ease: "power2.inOut",
              overwrite: true,
              onUpdate: pingNav,
            }),
          onLeaveBack: () =>
            gsap.to(document.documentElement, {
              "--flip": 0,
              duration: 0.7,
              ease: "power2.inOut",
              overwrite: true,
              onUpdate: pingNav,
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

  const paraCls =
    "text-balance text-[clamp(1.5rem,3vw,2.4rem)] font-light leading-[1.4] tracking-[-0.01em]";

  return (
    <section ref={root} data-manifesto className="relative">
      <Container>
        <div className="mx-auto flex max-w-3xl flex-col gap-16 py-40 sm:gap-24 sm:py-56">
          <p ref={p1Ref} className={paraCls}>
            <Words text={P1} />
          </p>
          <p ref={p2Ref} className={paraCls}>
            <Words text={P2} />
          </p>
        </div>
      </Container>
    </section>
  );
}
