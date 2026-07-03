"use client";

import { Fragment, useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { cn } from "@/lib/cn";
import { QUOTES, inscriptionDate } from "@/lib/dailyQuote";

/** The cycle: the marble/sculptor line leads (it named the app). Each
    passage gets its own image — stand-ins from the repo until the final
    public-domain set is curated. */
const CYCLE = [
  { quote: 1, img: "/images/sculptor.webp" },
  { quote: 0, img: "/images/halftone-alt.jpg" },
  { quote: 9, img: "/images/halftone-source.jpg" },
  { quote: 3, img: "/images/halftone-marble.jpg" },
] as const;

function Words({ text }: { text: string }) {
  const parts = text.split(" ");
  return (
    <>
      {parts.map((word, i) => (
        <Fragment key={i}>
          <span className="dl-word inline-block">{word}</span>
          {i < parts.length - 1 ? " " : ""}
        </Fragment>
      ))}
    </>
  );
}

/**
 * "A line a day." — a full-width cinematic card (the Cosmos read): the
 * inscription date ticks forward, each day's real passage materializes
 * word-by-word over its own slow-drifting image, Start Workout centered
 * beneath — clicking it carries you into the work section.
 * Reduced motion / no JS: the first passage over its image, static.
 */
export function DailyLineDemo({ onStart }: { onStart?: () => void }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const dateRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      const dateEl = dateRef.current;
      if (!root || !dateEl) return;

      const blocks = gsap.utils.toArray<HTMLElement>(root.querySelectorAll(".dl-quote"));
      const images = gsap.utils.toArray<HTMLElement>(root.querySelectorAll(".dl-img"));
      const dates = CYCLE.map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i);
        return inscriptionDate(d);
      });

      // Client-only date fill (SSR renders it empty — no hydration mismatch).
      dateEl.textContent = dates[0];

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const HOLD = 3.4;
        const tl = gsap.timeline({ repeat: -1, paused: true });

        blocks.forEach((block, i) => {
          const words = block.querySelectorAll<HTMLElement>(".dl-word");
          const seg = gsap.timeline();
          seg
            .set(blocks, { autoAlpha: 0 })
            .call(() => {
              dateEl.textContent = dates[i];
            })
            // The day's image crossfades in — steady, no drift.
            .to(images, { autoAlpha: 0, duration: 0.8, ease: "power1.inOut" }, 0)
            .to(images[i], { autoAlpha: 1, duration: 0.8, ease: "power1.inOut" }, 0)
            .fromTo(
              dateEl,
              { autoAlpha: 0, y: 6 },
              { autoAlpha: 1, y: 0, duration: 0.45, ease: "power2.out" },
              0.25,
            )
            .set(block, { autoAlpha: 1 }, 0.3)
            .fromTo(
              words,
              { autoAlpha: 0, y: 10 },
              {
                autoAlpha: 1,
                y: 0,
                duration: 0.45,
                ease: "power2.out",
                stagger: 0.05,
              },
              0.35,
            )
            .to({}, { duration: HOLD }, ">")
            .to(
              [block, dateEl],
              { autoAlpha: 0, duration: 0.45, ease: "power1.in" },
              ">",
            );
          tl.add(seg);
        });

        // Run only while on screen.
        const st = ScrollTrigger.create({
          trigger: root,
          start: "top 85%",
          end: "bottom top",
          onToggle: (self) => (self.isActive ? tl.play() : tl.pause()),
        });

        return () => {
          st.kill();
          tl.kill();
        };
      });
    },
    { scope: rootRef },
  );

  return (
    <div
      ref={rootRef}
      style={{ borderRadius: "1.25rem" }}
      className="relative h-[26rem] w-full overflow-hidden bg-dark sm:h-[30rem]"
    >
      {/* The day's imagery — stacked, crossfaded with the passage. */}
      {CYCLE.map((c, i) => (
        <Image
          key={c.img}
          src={c.img}
          alt=""
          aria-hidden
          fill
          sizes="100vw"
          className={cn(
            "dl-img object-cover grayscale",
            i > 0 && "opacity-0",
          )}
        />
      ))}
      {/* Legibility scrim */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(to_top,rgba(10,9,8,0.72),rgba(10,9,8,0.4)_50%,rgba(10,9,8,0.28))]"
      />

      {/* Content — the column sits centered in the card; the text inside it
          reads from its left edge, like the app. */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 sm:px-10">
        <div className="w-full max-w-2xl text-left">
          <span
            ref={dateRef}
            className="block h-4 font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-[#f4eee4]/65"
          />
          {/* Stacked quote blocks — the cell sizes to the longest passage, so
              the layout never shifts. Non-first start hidden (CSS) so reduced
              motion / no JS shows a single static passage. */}
          <div className="mt-5 grid">
            {CYCLE.map((c, i) => (
              <p
                key={c.quote}
                className={cn(
                  "dl-quote text-[1.375rem] font-light leading-[1.4] tracking-[-0.01em] text-[#f4eee4] [grid-area:1/1] sm:text-[1.75rem]",
                  i > 0 && "opacity-0",
                )}
              >
                <Words text={QUOTES[c.quote]} />
              </p>
            ))}
          </div>

          {/* Start Workout — the app's capsule in its dark-glass form. */}
          <button
            type="button"
            onClick={onStart}
            style={{
              borderRadius: 999,
              background: "color-mix(in srgb, #f4eee4 12%, transparent)",
              border: "1px solid color-mix(in srgb, #f4eee4 18%, transparent)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
            }}
            className="mt-10 w-full py-3.5 text-[1.125rem] font-light tracking-[-0.01em] text-[#f4eee4] transition-opacity hover:opacity-85 sm:text-[1.375rem]"
          >
            Start Workout
          </button>
        </div>
      </div>
    </div>
  );
}
