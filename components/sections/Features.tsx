"use client";

import { useRef } from "react";
import { gsap } from "@/lib/gsap";
import { cn } from "@/lib/cn";
import { Container } from "@/components/primitives/Container";
import { DailyLineDemo } from "@/components/demos/DailyLineDemo";
import { LiveSetDemo, type LiveSetDemoHandle } from "@/components/demos/LiveSetDemo";
import { ProgressDemo } from "@/components/demos/ProgressDemo";
import { MonthGridDemo } from "@/components/demos/MonthGridDemo";
import { EntryDemo } from "@/components/demos/EntryDemo";

const titleCls =
  "text-[clamp(1.625rem,2.6vw,2.25rem)] font-light leading-snug tracking-tight";
const captionCls = "mt-4 text-center text-[1.0625rem] font-light text-taupe";

export function Features() {
  const workSectionRef = useRef<HTMLElement>(null);
  const liveSet = useRef<LiveSetDemoHandle>(null);
  const scrollTween = useRef<gsap.core.Tween | null>(null);

  // The connected flow: Start Workout in the first demo carries you into the
  // work section and begins the set — the page as one day in the app.
  const startWorkout = () => {
    const target = workSectionRef.current;
    if (!target) return;
    scrollTween.current?.kill();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      target.scrollIntoView();
      liveSet.current?.run();
      return;
    }
    scrollTween.current = gsap.to(window, {
      scrollTo: { y: target, offsetY: 40, autoKill: false },
      duration: 0.9,
      ease: "power2.inOut",
      onComplete: () => liveSet.current?.run(),
    });
  };

  return (
    <>
      {/* §1 Mind and body — the line pair centered above the cinematic card */}
      <section className="border-t border-hairline py-16 sm:py-24">
        <Container>
          {/* Primary left, secondary right on one line; stacked left when narrow */}
          <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8">
            <h2 className={cn(titleCls, "shrink-0 text-ink")}>
              Mind over matter.
            </h2>
            <p className={cn(titleCls, "text-taupe sm:text-right")}>
              Ground the workout in wisdom.
            </p>
          </div>
          <div className="mt-10 sm:mt-14">
            <DailyLineDemo onStart={startWorkout} />
          </div>
        </Container>
      </section>

      {/* §2 Focus on the work — three features in a row */}
      <section ref={workSectionRef} className="border-t border-hairline py-16 sm:py-24">
        <Container>
          
          <div className="mx-auto max-w-3xl text-center">
            <h2 className={cn(titleCls, "text-ink")}>Focus on the work.</h2>
          </div>
          <div className="mt-10 grid w-full grid-cols-1 gap-10 sm:mt-14 sm:grid-cols-3 sm:gap-8">
            <div className="mx-auto flex w-full max-w-[28rem] flex-col">
              <ProgressDemo />
              <p className={captionCls}>Visualize your progress.</p>
              
            </div>
            <div className="mx-auto flex w-full max-w-[28rem] flex-col">
              <LiveSetDemo ref={liveSet} />
              <p className={captionCls}>Rest and history built in.</p>
            </div>
            <div className="mx-auto flex w-full max-w-[28rem] flex-col">
              <MonthGridDemo />
              <p className={captionCls}>Keep stacking days.</p>
            </div>
          </div>
        </Container>
      </section>

      {/* §3 A record worth keeping — the journal feed, flanked */}
      <section className="border-t border-hairline py-16 sm:py-24">
        <Container>
          {/* Primary faces the card from the left, secondary from the right —
              columns hug the feed rather than the screen edges. */}
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,18rem)_minmax(0,26rem)_minmax(0,18rem)] lg:justify-center lg:gap-14">
            <h2 className={cn(titleCls, "text-ink lg:text-right")}>
              Your training journal.
            </h2>
            <EntryDemo />
            <p className={cn(titleCls, "text-taupe")}>Beautifully documented.</p>
          </div>
        </Container>
      </section>
    </>
  );
}
