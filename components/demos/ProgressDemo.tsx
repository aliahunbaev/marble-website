"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { artifactCard } from "./artifact";

/** Lift history, month by month — cycles through the big three. */
const MONTHS = ["Feb", "Mar", "Apr", "May", "Jun"];
const EXERCISES = [
  { label: "Bench · Best weight", values: [185, 205, 220, 235, 245], delta: "+8%" },
  { label: "Squat · Best weight", values: [255, 275, 290, 305, 315], delta: "+12%" },
  { label: "Deadlift · Best weight", values: [315, 335, 345, 355, 365], delta: "+9%" },
] as const;

// Chart space: 260 × 140. Each exercise maps to its own value range.
const X = (i: number) => 10 + i * 60;
const yMapper = (values: readonly number[]) => {
  const min = Math.min(...values) - 12;
  const max = Math.max(...values) + 12;
  return (v: number) => 128 - ((v - min) / (max - min)) * 102;
};
const pointsFor = (values: readonly number[]) => {
  const Y = yMapper(values);
  return values.map((v, i) => `${X(i)},${Y(v).toFixed(1)}`).join(" ");
};

const monoLabel = "font-mono text-[0.625rem] uppercase tracking-[0.14em]";

/**
 * "Strength, climbing." — the line draws in point by point while the best
 * counts up, then the card moves to the next lift: Bench → Squat → Deadlift,
 * cycling while in view. Server renders Bench complete (reduced motion /
 * no JS); the loop takes over on scroll-in.
 */
export function ProgressDemo() {
  const rootRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<SVGPolylineElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const valueRef = useRef<HTMLSpanElement>(null);
  const deltaRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      const line = lineRef.current;
      if (!root || !line) return;

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const dots = gsap.utils.toArray<SVGCircleElement>(
          root.querySelectorAll("[data-dot]"),
        );
        const state = { len: 0 };
        const tl = gsap.timeline({ repeat: -1, paused: true });

        EXERCISES.forEach((ex) => {
          const Y = yMapper(ex.values);
          const counter = { v: ex.values[0] };
          const draw = { p: 0 };

          // Set the stage for this lift — line undrawn, dots parked.
          tl.call(() => {
            if (labelRef.current) labelRef.current.textContent = ex.label;
            if (valueRef.current)
              valueRef.current.textContent = String(ex.values[0]);
            if (deltaRef.current) deltaRef.current.textContent = ex.delta;
            line.setAttribute("points", pointsFor(ex.values));
            state.len = line.getTotalLength();
            gsap.set(line, {
              strokeDasharray: state.len,
              strokeDashoffset: state.len,
              autoAlpha: 1,
            });
            dots.forEach((d, i) => {
              d.setAttribute("cx", String(X(i)));
              d.setAttribute("cy", Y(ex.values[i]).toFixed(1));
              gsap.set(d, { scale: 0, autoAlpha: 1, transformOrigin: "center" });
            });
            gsap.set(deltaRef.current, { autoAlpha: 0 });
            counter.v = ex.values[0];
            draw.p = 0;
          });

          const seg = gsap.timeline();
          seg.to(draw, {
            p: 1,
            duration: 1.7,
            ease: "power1.inOut",
            onUpdate: () => {
              gsap.set(line, { strokeDashoffset: state.len * (1 - draw.p) });
            },
          });
          seg.to(
            counter,
            {
              v: ex.values[ex.values.length - 1],
              duration: 1.7,
              ease: "power1.inOut",
              onUpdate: () => {
                if (valueRef.current)
                  valueRef.current.textContent = String(Math.round(counter.v));
              },
            },
            0,
          );
          // Points land as the line reaches them.
          dots.forEach((d, i) => {
            seg.fromTo(
              d,
              { scale: 0 },
              { scale: 1, duration: 0.35, ease: "back.out(2.2)" },
              i * (1.7 / (dots.length - 1)) * 0.92,
            );
          });
          seg.to(deltaRef.current, { autoAlpha: 1, duration: 0.4 }, "-=0.2");
          seg.to({}, { duration: 1.9 }); // hold
          seg.to([line, ...dots, deltaRef.current], {
            autoAlpha: 0,
            duration: 0.35,
            ease: "power1.in",
          });
          tl.add(seg);
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

  // Server-composed: Bench, fully drawn.
  const bench = EXERCISES[0];
  const Y0 = yMapper(bench.values);

  return (
    <div
      ref={rootRef}
      style={artifactCard}
      className="flex h-[21rem] w-full flex-col px-5 pb-5 pt-4 sm:px-6"
    >
      <span ref={labelRef} className={`${monoLabel} text-taupe`}>
        {bench.label}
      </span>
      <div className="mt-1.5 flex items-baseline gap-2.5">
        <span ref={valueRef} className="text-[1.75rem] font-light text-ink">
          {bench.values[bench.values.length - 1]}
        </span>
        <span
          ref={deltaRef}
          className="font-mono text-[0.6875rem] tracking-[0.08em] text-ink/70"
        >
          {bench.delta}
        </span>
      </div>

      <div className="mt-2 min-h-0 flex-1">
        <svg viewBox="0 0 260 140" className="h-full w-full" aria-hidden>
          {[40, 73, 106].map((y) => (
            <line
              key={y}
              x1="10"
              x2="250"
              y1={y}
              y2={y}
              stroke="color-mix(in srgb, var(--ink) 7%, transparent)"
              strokeWidth="1"
            />
          ))}
          <polyline
            ref={lineRef}
            points={pointsFor(bench.values)}
            fill="none"
            stroke="var(--ink)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {bench.values.map((v, i) => (
            <circle
              key={i}
              data-dot
              cx={X(i)}
              cy={Y0(v).toFixed(1)}
              r="3"
              fill="var(--ink)"
            />
          ))}
        </svg>
      </div>

      <div className="mt-2 flex justify-between px-0.5">
        {MONTHS.map((m) => (
          <span
            key={m}
            className="font-mono text-[0.5625rem] uppercase tracking-[0.12em] text-taupe/70"
          >
            {m}
          </span>
        ))}
      </div>
    </div>
  );
}
