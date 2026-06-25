"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { Container } from "@/components/primitives/Container";
import { Halftone } from "@/components/halftone/Halftone";
import { WaitlistCTA } from "@/components/cta/WaitlistCTA";

function PlayTriangle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M4 2 L21 12 L4 22 Z" />
    </svg>
  );
}

/**
 * Coupled hero → film (Cosmos-style). Sequence on scroll (lg+ only):
 *   1. hero text/CTA fade out IN PLACE first (so they never overlap the film);
 *   2. the film group rises from its peek to centered (slight scale up) while
 *      the halftone scatters + fades;
 *   3. the "Watch the film" label above fades out past halfway;
 *   4. the white "Watch / the film" rises up over the movie as it centers;
 *   5. it holds.
 * Below lg / reduced-motion: a fixed, full-size static player, label above it.
 */
export function HeroFilm() {
  const sectionRef = useRef<HTMLElement>(null);
  const halftoneRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const filmGroupRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const watchTextRef = useRef<HTMLDivElement>(null);
  const dissolve = useRef(0);
  const [playing, setPlaying] = useState(false);

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
        // Film rises immediately — concurrent with the text fade, doesn't wait.
        // (No overlap: it rises from the bottom while the text fades in the center.)
        tl.fromTo(
          group,
          { y: restY, scale: REST_SCALE },
          { y: 0, scale: 1, ease: "none", duration: 0.5 },
          0,
        );
        // Hero text + CTA drift UP at the film's pace and fade as they go — like
        // they're being scrolled away as the film rises into their place.
        // Same velocity as the film (−0.4·restY / 0.2 == −restY / 0.5).
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

        // White "Watch / the film" — a timed, staggered fade-up (Watch first, then
        // the film), fired as an EVENT early in the rise (animates, not instant).
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
          whiteTrigger.kill();
          whiteIn.kill();
        };
      });
    },
    { scope: sectionRef },
  );

  return (
    <section id="top" ref={sectionRef} className="relative bg-paper">
      <div className="lg:motion-safe:sticky lg:motion-safe:top-0 lg:motion-safe:h-[100svh] lg:motion-safe:overflow-hidden">
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
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,transparent,var(--paper)_28%,var(--paper)_74%,transparent)] opacity-55"
            />
          </div>

          {/* Content layer — fades out (in place) by scroll % */}
          <div ref={contentRef} className="relative z-10 flex flex-1 flex-col">
            <Container className="flex flex-1 flex-col justify-center pt-16">
              <h1 className="text-[2.75rem] font-light leading-[0.92] tracking-[-0.03em] text-ink sm:text-[3.5rem] md:text-[4.5rem] lg:text-[5.75rem] xl:text-[7rem] 2xl:text-[8rem]">
                Document
                <br />
                your training.
              </h1>
              <div className="mt-9 flex justify-end sm:mt-12">
                <WaitlistCTA variant="bar" className="w-full max-w-[42rem]" />
              </div>
            </Container>
          </div>
        </div>

        {/* ---- Film layer ---- */}
        <div className="relative z-20 flex flex-col items-center bg-paper py-24 lg:motion-safe:absolute lg:motion-safe:inset-0 lg:motion-safe:justify-center lg:motion-safe:bg-transparent lg:motion-safe:py-0 lg:motion-safe:pointer-events-none">
          <Container className="w-full">
            {/* The moving group — label + frame ride together */}
            <div
              ref={filmGroupRef}
              className="relative mx-auto w-full origin-center lg:motion-safe:w-[min(100%,112svh)]"
            >
              {/* Label, glued just above the frame (fades out mid-rise) */}
              <div
                ref={labelRef}
                className="pointer-events-none absolute bottom-full left-0 mb-5 flex w-full justify-center"
              >
                <span className="flex items-center gap-2.5 text-lg font-normal text-taupe">
                  <PlayTriangle className="h-[0.7em] w-[0.7em]" />
                  Watch the film
                </span>
              </div>

              {/* Frame */}
              <div
                style={{ borderRadius: "1.25rem" }}
                className="pointer-events-auto relative aspect-[3/2] w-full overflow-hidden bg-dark"
              >
                {!playing ? (
                  <button
                    type="button"
                    onClick={() => setPlaying(true)}
                    aria-label="Play the film — The Sculptor"
                    className="group absolute inset-0 h-full w-full"
                  >
                    <Image
                      src="/images/sculptor.webp"
                      alt=""
                      aria-hidden
                      fill
                      priority
                      sizes="(max-width: 1024px) 100vw, 75vw"
                      className="object-cover grayscale transition-transform duration-700 group-hover:scale-[1.03]"
                    />
                    <span aria-hidden className="absolute inset-0 bg-black/40" />
                    {/* White in-film label — rises over the movie as it centers (lg+ only) */}
                    <div
                      ref={watchTextRef}
                      className="relative hidden h-full w-full items-center justify-between px-[7%] text-paper lg:motion-safe:flex"
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
                ) : (
                  <video
                    src="/video/the-film.mp4"
                    poster="/images/sculptor.webp"
                    controls
                    autoPlay
                    playsInline
                    preload="none"
                    className="absolute inset-0 h-full w-full bg-dark object-cover"
                  />
                )}
              </div>
            </div>
          </Container>
        </div>
      </div>
    </section>
  );
}
