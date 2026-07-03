"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { cn } from "@/lib/cn";
import { artifactCard } from "./artifact";

/** Three months of rhythm — dense training, a handful of rest days. */
const month = (label: string, len: number, rest: number[], stat: string) => ({
  label,
  len,
  filled: Array.from({ length: len }, (_, i) => i + 1).filter(
    (d) => !rest.includes(d),
  ),
  stat,
});

const MONTHS = [
  month("April", 30, [9, 21], "28 workouts"),
  month("May", 31, [7, 19, 28], "28 workouts"),
  month("June", 30, [12, 24], "28 workouts"),
];
const MAX_LEN = 31;
const CURRENT = MONTHS[2]; // server-composed month

const monoLabel = "font-mono text-[0.625rem] uppercase tracking-[0.14em]";
// The square's box never changes — only its colors do. (A disappearing
// border reads as the square growing; keep the border and fade its color.)
const FILLED_CLS = ["bg-ink", "border-transparent"];
const REST_CLS = ["bg-transparent", "border-ink/15"];

/**
 * "A month you can see." — the TRACK hero, alive: each month's trained days
 * fill cleanly in date order, then the calendar turns — April → May → June,
 * cycling while in view. The card stays solid throughout; only its contents
 * change. Server renders June complete (reduced motion / no JS).
 */
export function MonthGridDemo() {
  const rootRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const statRef = useRef<HTMLParagraphElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      const grid = gridRef.current;
      if (!root || !grid) return;

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const squares = gsap.utils.toArray<HTMLElement>(
          grid.querySelectorAll("[data-day]"),
        );

        const styleSquare = (el: HTMLElement, filled: boolean) => {
          el.classList.remove(...(filled ? REST_CLS : FILLED_CLS));
          el.classList.add(...(filled ? FILLED_CLS : REST_CLS));
        };

        const resetMonth = (m: (typeof MONTHS)[number]) => {
          if (labelRef.current) labelRef.current.textContent = m.label;
          if (statRef.current) statRef.current.textContent = m.stat;
          squares.forEach((el, i) => {
            const day = i + 1;
            el.style.display = day <= m.len ? "" : "none";
            styleSquare(el, false);
          });
        };

        const tl = gsap.timeline({ repeat: -1, paused: true });

        MONTHS.forEach((m) => {
          const scan = { d: 0 };
          tl.call(() => {
            resetMonth(m);
            scan.d = 0;
          });
          // Day-by-day populate — squares fill in place, colors only.
          tl.to(scan, {
            d: m.len,
            duration: m.len * 0.055,
            ease: "none",
            onUpdate: () => {
              const cur = Math.floor(scan.d);
              for (let day = 1; day <= cur; day++) {
                const el = squares[day - 1];
                if (
                  m.filled.includes(day) &&
                  !el.classList.contains(FILLED_CLS[0])
                ) {
                  styleSquare(el, true);
                }
              }
            },
          });
          tl.to({}, { duration: 2.0 }); // hold the finished month
        });

        const st = ScrollTrigger.create({
          trigger: root,
          start: "top 78%",
          end: "bottom 5%",
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
      style={artifactCard}
      className="flex h-[21rem] w-full flex-col px-5 pb-5 pt-4 sm:px-6"
    >
      <span ref={labelRef} className={`${monoLabel} text-taupe`}>
        {CURRENT.label}
      </span>
      <div className="flex min-h-0 flex-1 items-center">
        <div ref={gridRef} className="grid w-full grid-cols-10 gap-1.5">
          {Array.from({ length: MAX_LEN }, (_, i) => {
            const day = i + 1;
            const filled = CURRENT.filled.includes(day);
            return (
              <span
                key={day}
                data-day={day}
                style={{
                  borderRadius: 3,
                  display: day <= CURRENT.len ? undefined : "none",
                }}
                className={cn(
                  "aspect-square w-full border transition-colors duration-300",
                  filled
                    ? "border-transparent bg-ink"
                    : "border-ink/15 bg-transparent",
                )}
              />
            );
          })}
        </div>
      </div>
      <p
        ref={statRef}
        className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-taupe"
      >
        {CURRENT.stat}
      </p>
    </div>
  );
}
