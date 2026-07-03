"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { cn } from "@/lib/cn";
import { Container } from "@/components/primitives/Container";
import { Halftone } from "@/components/halftone/Halftone";
import { WaitlistCTA } from "@/components/cta/WaitlistCTA";
import { FilmScrubber } from "./FilmScrubber";

function PlayTriangle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M4 2 L21 12 L4 22 Z" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      aria-hidden
      className={className}
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

// Scroll progress at which the film sits centered + held (0.5–1.0 in the timeline).
const FOCUS_PROGRESS = 0.6;

type Phase = "idle" | "focused";

/**
 * Coupled hero → film. Scrolling pins the hero and rises the film from a peek to
 * centered. Clicking the film (from anywhere) scrolls the page to that centered
 * hold point, then the SAME frame becomes the movie IN PLACE: the page washes
 * near-white over everything (nav included), the video plays from the start, and
 * one clean scrubber line + a close X appear. Close returns it to the poster.
 */
export function HeroFilm() {
  const sectionRef = useRef<HTMLElement>(null);
  const halftoneRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const filmGroupRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const watchTextRef = useRef<HTMLDivElement>(null);
  const filmFrameRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const previewRef = useRef<HTMLVideoElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const dissolve = useRef(0);

  const stRef = useRef<ScrollTrigger | null>(null);
  const scrollTweenRef = useRef<gsap.core.Tween | null>(null);

  const [phase, setPhase] = useState<Phase>("idle");
  const focused = phase === "focused";

  useGSAP(
    () => {
      const section = sectionRef.current;
      const group = filmGroupRef.current;
      if (!section || !group) return;

      const mm = gsap.matchMedia();
      // Large screens + motion-ok only. Below lg (or reduced-motion) the film
      // is a fixed, full-size static player — no pin, no scrub.
      mm.add("(prefers-reduced-motion: no-preference) and (min-width: 1024px)", () => {
        section.style.height = "260vh"; // extra distance = longer hold once centered

        const REST_SCALE = 0.84;
        const PEEK_PX = 60; // fixed px of the film showing at rest
        const restY = () => {
          const vh = window.innerHeight;
          const gh = group.offsetHeight || vh * 0.7;
          return vh / 2 - PEEK_PX + (REST_SCALE * gh) / 2;
        };

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.5,
            invalidateOnRefresh: true,
          },
        });
        stRef.current = tl.scrollTrigger ?? null;

        // Film rises immediately — concurrent with the text fade, doesn't wait.
        tl.fromTo(
          group,
          { y: restY, scale: REST_SCALE },
          { y: 0, scale: 1, ease: "none", duration: 0.5 },
          0,
        );
        // Hero text + CTA drift UP at the film's pace and fade as they go.
        tl.to(
          contentRef.current,
          { y: () => -0.4 * restY(), autoAlpha: 0, ease: "none", duration: 0.2 },
          0,
        );
        // Halftone scatters + fades concurrently.
        tl.to(halftoneRef.current, { opacity: 0, ease: "none", duration: 0.45 }, 0);
        tl.to(dissolve, { current: 1, ease: "none", duration: 0.45 }, 0);
        // "Watch the film" label above fades out past the halfway mark.
        tl.to(labelRef.current, { autoAlpha: 0, ease: "none", duration: 0.15 }, 0.3);
        // Hold centered — stays pinned a bit longer.
        tl.to({}, { duration: 0.5 }, 0.5);

        // White "Watch / the film" — a timed, staggered fade-up.
        const whiteIn = gsap.timeline({ paused: true });
        if (watchTextRef.current) {
          whiteIn.from(Array.from(watchTextRef.current.children), {
            autoAlpha: 0,
            y: 22,
            duration: 0.5,
            ease: "power2.out",
            stagger: 0.16,
          });
        }
        const whiteTrigger = ScrollTrigger.create({
          trigger: section,
          start: "top top-=55%",
          onEnter: () => whiteIn.play(),
          onLeaveBack: () => whiteIn.reverse(),
        });

        return () => {
          section.style.height = "";
          stRef.current = null;
          whiteTrigger.kill();
          whiteIn.kill();
        };
      });

      // Entrance — one-time load choreography (all widths, motion-ok).
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const h1 = section.querySelector("h1");
        const cta = section.querySelector<HTMLElement>("[data-hero-cta]");
        const film = filmGroupRef.current;
        if (!h1 || !cta) return;

        const tl = gsap.timeline({ delay: 0.15 });
        tl.to(h1, { autoAlpha: 1, duration: 0.7, ease: "power2.out" });
        tl.to(cta, { autoAlpha: 1, duration: 0.5, ease: "power2.out" }, "-=0.4");
        if (film)
          tl.to(film, { autoAlpha: 1, duration: 0.7, ease: "power1.out" }, "-=0.35");

        return () => {
          tl.kill();
          gsap.set([h1, cta], { clearProps: "opacity,visibility" });
          if (film) gsap.set(film, { clearProps: "opacity,visibility" });
        };
      });
    },
    { scope: sectionRef },
  );

  // The scroll Y where the film is centered: from the pinned trigger (read live),
  // else (no pin) computed from the frame's current rect.
  const centeredScrollY = useCallback(() => {
    const st = stRef.current;
    if (st) return st.start + FOCUS_PROGRESS * (st.end - st.start);
    const frame = filmFrameRef.current;
    if (frame) {
      const r = frame.getBoundingClientRect();
      return window.scrollY + r.top - (window.innerHeight - r.height) / 2;
    }
    return window.scrollY;
  }, []);

  const closeFocus = useCallback(() => {
    scrollTweenRef.current?.kill();
    setPhase("idle");
  }, []);

  // Enter focus immediately — wash + movie reveal apply at once; the scroll runs
  // in the focus effect. The movie's unmuted play() MUST happen synchronously in
  // the click gesture: Safari only allows sound while transient user activation
  // lasts, and a scroll-tween onComplete ~0.55s later is past that window.
  const openFocus = () => {
    if (phase !== "idle") return;
    const movie = videoRef.current;
    if (movie) {
      movie.muted = false;
      movie.currentTime = 0;
      movie.play().catch(() => {});
    }
    previewRef.current?.pause();
    setPhase("focused");
  };

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => {});
    else v.pause();
  };

  // The wash + movie reveal apply immediately (state); playback already started
  // in the click. This effect scrolls the film to center under the wash; once
  // landed it locks scroll and settles the frame dead-center.
  useEffect(() => {
    if (phase !== "focused") return;
    const body = document.body;
    const group = filmGroupRef.current;
    const movie = videoRef.current;
    const preview = previewRef.current;
    const prevActive = document.activeElement as HTMLElement | null;
    let prevBodyOverflow = "";
    let prevPad = "";
    const blockScroll = (e: Event) => e.preventDefault();

    const lockAndPlay = () => {
      prevBodyOverflow = body.style.overflow;
      prevPad = body.style.paddingRight;
      const sb = window.innerWidth - document.documentElement.clientWidth;
      body.style.overflow = "hidden";
      if (sb > 0) body.style.paddingRight = `${sb}px`;
      window.addEventListener("wheel", blockScroll, { passive: false });
      window.addEventListener("touchmove", blockScroll, { passive: false });
      // Settle dead-center (the scrub can lag the tween). The trigger stays
      // ENABLED — the locked scroll just holds it here, so leaving focus needs
      // no re-enable (re-enabling is what snapped the film up from below).
      gsap.to(group, {
        y: 0,
        scale: 1,
        duration: 0.4,
        ease: "power2.out",
      });
    };

    const target = centeredScrollY();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || Math.abs(window.scrollY - target) < 4) {
      if (reduce) window.scrollTo(0, target);
      lockAndPlay();
    } else {
      scrollTweenRef.current = gsap.to(window, {
        scrollTo: { y: target, autoKill: false },
        duration: 0.55,
        ease: "power2.inOut",
        onComplete: lockAndPlay,
      });
    }

    closeBtnRef.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeFocus();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      scrollTweenRef.current?.kill();
      // Just leave focus: unlock, stop the movie, hand the frame back to the
      // scrub. The scroll never moved, so the film stays put — no snap.
      window.removeEventListener("wheel", blockScroll);
      window.removeEventListener("touchmove", blockScroll);
      body.style.overflow = prevBodyOverflow;
      body.style.paddingRight = prevPad;
      gsap.set(group, { clearProps: "transform" });
      movie?.pause();
      preview?.play().catch(() => {});
      window.removeEventListener("keydown", onKey);
      prevActive?.focus?.({ preventScroll: true });
    };
  }, [phase, closeFocus, centeredScrollY]);

  // Idle preview: reduced motion holds the first frame; otherwise nudge play()
  // in case the autoplay attribute raced hydration and never fired.
  useEffect(() => {
    const p = previewRef.current;
    if (!p) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) p.pause();
    else p.play().catch(() => {});
  }, []);

  return (
    <section id="top" ref={sectionRef} className="relative bg-paper">
      <div
        className={cn(
          "relative lg:motion-safe:sticky lg:motion-safe:top-0 lg:motion-safe:h-[100svh] lg:motion-safe:overflow-hidden",
          focused && "z-[60]",
        )}
      >
        {/* ---- Hero block (halftone + content) ---- */}
        <div className="relative z-10 flex min-h-[100svh] flex-col overflow-hidden lg:motion-safe:absolute lg:motion-safe:inset-0 lg:motion-safe:min-h-0">
          {/* Halftone layer — scrubbed fade + shader scatter */}
          <div ref={halftoneRef} className="absolute inset-0">
            <Halftone
              src="/images/halftone-source.jpg"
              cell={7}
              dotScale={0.9}
              contrast={1.1}
              invert
              dotColor="#0e0a07"
              focalX={0.52}
              focalY={0.4}
              dissolveRef={dissolve}
              className="halftone-fade-in"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,transparent,var(--paper)_28%,var(--paper)_74%,transparent)] opacity-55"
            />
          </div>

          {/* Content layer — fades out (in place) by scroll % */}
          <div ref={contentRef} className="relative z-10 flex flex-1 flex-col">
            <Container className="flex flex-1 flex-col justify-center pt-16">
              <h1 className="text-[2.75rem] font-light leading-[0.92] tracking-[-0.03em] text-ink opacity-0 motion-reduce:opacity-100 sm:text-[3.5rem] md:text-[4.5rem] lg:text-[5.75rem] xl:text-[7rem] 2xl:text-[8rem]">
                Document
                <br />
                your training.
              </h1>
              <div
                data-hero-cta
                className="mt-9 flex justify-end opacity-0 motion-reduce:opacity-100 sm:mt-12"
              >
                <WaitlistCTA variant="bar" className="w-full max-w-[42rem]" />
              </div>
            </Container>
          </div>
        </div>

        {/* ---- Whiteout wash — inside the stage (over the hero, under the film) ---- */}
        <div
          onClick={closeFocus}
          aria-hidden={!focused}
          className={cn(
            "fixed inset-0 z-[15] bg-[#f6f2ec]/90 transition-opacity duration-300",
            focused ? "opacity-100" : "pointer-events-none opacity-0",
          )}
        />

        {/* ---- Film layer (above the wash) ---- */}
        <div
          className={cn(
            "relative z-20 flex flex-col items-center bg-paper py-24 lg:motion-safe:absolute lg:motion-safe:inset-0 lg:motion-safe:justify-center lg:motion-safe:bg-transparent lg:motion-safe:py-0 lg:motion-safe:pointer-events-none",
            focused && "pointer-events-none",
          )}
        >
          <Container className="w-full">
            {/* The moving group — label + frame ride together */}
            <div
              ref={filmGroupRef}
              className="relative mx-auto w-full origin-center opacity-0 motion-reduce:opacity-100 lg:motion-safe:w-[min(100%,112svh)]"
            >
              {/* Label, glued just above the frame (fades out mid-rise / on focus) */}
              <div
                ref={labelRef}
                className={cn(
                  "pointer-events-none absolute bottom-full left-0 mb-5 flex w-full justify-center",
                  focused && "opacity-0",
                )}
              >
                <span className="flex items-center gap-2.5 text-lg font-normal text-taupe">
                  <PlayTriangle className="h-[0.7em] w-[0.7em]" />
                  Watch the film
                </span>
              </div>

              {/* Frame — persistent layers: a tiny looping preview cut under-
                  neath, the movie above it (revealed on focus), the click layer
                  + labels on top. Nothing unmounts across open/close, so the
                  label timeline keeps valid targets and the movie element
                  exists when the click needs to play() it synchronously. */}
              <div
                ref={filmFrameRef}
                style={{ borderRadius: "1.25rem" }}
                className="group/film pointer-events-auto relative aspect-[3/2] w-full overflow-hidden bg-dark"
              >
                {/* Idle preview — a 190KB ping-pong loop, not the 22MB film */}
                <video
                  src="/video/film-preview.mp4"
                  muted
                  loop
                  autoPlay
                  playsInline
                  preload="auto"
                  aria-hidden
                  ref={(el) => {
                    previewRef.current = el;
                    if (el) el.muted = true;
                  }}
                  className="absolute inset-0 h-full w-full object-cover grayscale"
                />

                {/* The movie — fetched only when played (preload none) */}
                <video
                  ref={videoRef}
                  src="/video/mishimamovie.mp4"
                  playsInline
                  preload="none"
                  onClick={togglePlay}
                  onEnded={closeFocus}
                  className={cn(
                    "absolute inset-0 h-full w-full cursor-pointer bg-dark object-cover transition-opacity duration-300",
                    focused ? "opacity-100" : "pointer-events-none opacity-0",
                  )}
                />

                {/* Idle click layer + white in-film label (lg+ only) */}
                <button
                  type="button"
                  onClick={openFocus}
                  aria-label="Play the film — The Sculptor"
                  aria-hidden={focused}
                  tabIndex={focused ? -1 : 0}
                  className={cn(
                    "absolute inset-0 h-full w-full",
                    focused && "pointer-events-none opacity-0",
                  )}
                >
                  <div
                    ref={watchTextRef}
                    className="hidden h-full w-full items-center justify-between px-[7%] text-paper lg:motion-safe:flex"
                  >
                    <span className="flex items-center gap-4 text-[clamp(1.5rem,3.5vw,2.75rem)] font-light leading-none">
                      <PlayTriangle className="h-[0.66em] w-[0.66em]" />
                      Watch
                    </span>
                    <span className="text-[clamp(1.5rem,3.5vw,2.75rem)] font-light leading-none">
                      the film
                    </span>
                  </div>
                </button>

                {/* Scrubber — bottom edge, reveals on hover or keyboard focus */}
                <div
                  className={cn(
                    "pointer-events-none absolute inset-x-0 bottom-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.34),transparent)] px-4 pb-4 pt-9 opacity-0 transition-opacity duration-300",
                    focused
                      ? "focus-within:pointer-events-auto focus-within:opacity-100 group-hover/film:pointer-events-auto group-hover/film:opacity-100"
                      : "hidden",
                  )}
                >
                  <FilmScrubber videoRef={videoRef} />
                </div>
              </div>
            </div>
          </Container>
        </div>
      </div>

      {/* ---- Close ---- */}
      <button
        ref={closeBtnRef}
        type="button"
        onClick={closeFocus}
        aria-label="Close"
        tabIndex={focused ? 0 : -1}
        className={cn(
          "fixed right-5 top-5 z-[61] text-ink/70 transition-opacity duration-300 hover:text-ink",
          focused ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <CloseIcon className="h-7 w-7" />
      </button>
    </section>
  );
}
