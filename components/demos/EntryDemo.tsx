"use client";

import { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { artifactCard } from "./artifact";

/** The week, cycling through the feed window. */
const ENTRIES = [
  {
    name: "Push",
    date: "Monday · June 23",
    sets: 18,
    timeSec: 72 * 60,
    volume: 24150,
    note: "Heavy triples. Felt strong.",
    photo: "/images/sculptor.webp",
  },
  {
    name: "Pull",
    date: "Wednesday · June 25",
    sets: 16,
    timeSec: 64 * 60,
    volume: 21300,
    note: "Rows and chins. Smooth.",
    photo: "/images/halftone-alt.jpg",
  },
  {
    name: "Legs",
    date: "Friday · June 27",
    sets: 20,
    timeSec: 86 * 60,
    volume: 31400,
    note: "Squats moved fast today.",
    photo: "/images/halftone-marble.jpg",
  },
] as const;

type Entry = (typeof ENTRIES)[number];

const monoLabel = "font-mono text-[0.625rem] uppercase tracking-[0.14em]";

function fmtTime(sec: number): string {
  const m = Math.floor(sec / 60);
  return `${Math.floor(m / 60)}:${String(m % 60).padStart(2, "0")}`;
}

/** One feed entry — the app's card anatomy: text above, the photograph
    square and full-bleed to the card's edges below. Completing an entry
    plays the app's "Recorded." screen INSIDE the card (data-recorded). */
function FeedCard({ e }: { e: Entry }) {
  return (
    <div
      data-card
      style={artifactCard}
      className="relative w-full overflow-hidden"
    >
      <div className="px-6 pb-5 pt-5">
        <span className={`${monoLabel} text-taupe`}>{e.date}</span>
        <h3 className="mt-2 text-[1.5rem] font-light leading-tight text-ink">
          {e.name}
        </h3>
        <div className="mt-5 grid grid-cols-3 gap-3">
          <div className="flex flex-col gap-1">
            <span className={`${monoLabel} text-taupe/80`}>Sets</span>
            <span data-sets className="text-[1.25rem] font-light text-ink">
              {e.sets}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className={`${monoLabel} text-taupe/80`}>Time</span>
            <span data-time className="text-[1.25rem] font-light text-ink">
              {fmtTime(e.timeSec)}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className={`${monoLabel} text-taupe/80`}>Volume</span>
            <span data-vol className="text-[1.25rem] font-light text-ink">
              {e.volume.toLocaleString("en-US")}
            </span>
          </div>
        </div>
        <p className="mt-5 min-h-6 text-[0.9375rem] font-light leading-relaxed text-ink/85">
          <span data-note>{e.note}</span>
          <span
            data-caret
            aria-hidden
            className="ml-px inline-block h-[1em] w-px translate-y-[0.15em] bg-ink opacity-0"
          />
        </p>
      </div>
      {/* Photo hero — square, edge to edge, to the card's bottom. */}
      <div
        data-photo
        className="relative aspect-square w-full overflow-hidden bg-dark"
      >
        <Image
          src={e.photo}
          alt=""
          aria-hidden
          fill
          sizes="(max-width: 1024px) 90vw, 416px"
          className="object-cover grayscale"
        />
      </div>

    </div>
  );
}

/**
 * "A record worth keeping." — one entry at a time: it assembles in the
 * window, takes the app's "Recorded." screen inside the card, then rides up
 * through the fade and is gone — the next forms in its place. Neighbors sit
 * fully outside the masked window, and the cycle resets invisibly while the
 * window is empty. Cards live in normal flow inside the track (spacing is
 * flex gap — nothing to mismeasure). Server renders the feed composed;
 * the motion context winds it back on first scroll-in.
 */
export function EntryDemo() {
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      const track = trackRef.current;
      if (!root || !track) return;

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const cards = gsap.utils.toArray<HTMLElement>(
          track.querySelectorAll("[data-card]"),
        );
        if (cards.length !== 3) return;

        let tl: gsap.core.Timeline | null = null;
        const blinks: gsap.core.Tween[] = [];

        const q = (card: HTMLElement, sel: string) =>
          card.querySelector<HTMLElement>(sel);

        const windBack = (card: HTMLElement) => {
          const s = q(card, "[data-sets]");
          const t = q(card, "[data-time]");
          const v = q(card, "[data-vol]");
          const n = q(card, "[data-note]");
          if (s) s.textContent = "0";
          if (t) t.textContent = "0:00";
          if (v) v.textContent = "0";
          if (n) n.textContent = "";
          gsap.set(q(card, "[data-photo]"), { autoAlpha: 0 });
          gsap.set(q(card, "[data-caret]"), { autoAlpha: 0 });
        };

        // Track offset that centers card i in the window — read from live
        // layout at the moment it's needed, never cached.
        const centerFor = (i: number) =>
          (root.offsetHeight - cards[i].offsetHeight) / 2 - cards[i].offsetTop;

        // Built lazily on first activation, measuring settled layout.
        const build = () => {
          cards.forEach(windBack);
          gsap.set(track, { y: centerFor(0) });

          const cycle = gsap.timeline({ repeat: -1, paused: true });

          ENTRIES.forEach((entry, s) => {
            const A = cards[s];
            const counters = { sets: 0, time: 0, vol: 0 };
            const typing = { i: 0 };

            const caret = q(A, "[data-caret]");
            const blink = gsap.to(caret, {
              autoAlpha: 0,
              duration: 0.45,
              repeat: -1,
              yoyo: true,
              ease: "steps(1)",
              paused: true,
            });
            blinks.push(blink);

            cycle.call(() => {
              counters.sets = 0;
              counters.time = 0;
              counters.vol = 0;
              typing.i = 0;
            });
            // Assemble the centered card.
            cycle.to(counters, {
              sets: entry.sets,
              time: entry.timeSec,
              vol: entry.volume,
              duration: 0.9,
              ease: "power1.inOut",
              onUpdate: () => {
                const sEl = q(A, "[data-sets]");
                const tEl = q(A, "[data-time]");
                const vEl = q(A, "[data-vol]");
                if (sEl) sEl.textContent = String(Math.round(counters.sets));
                if (tEl) tEl.textContent = fmtTime(counters.time);
                if (vEl)
                  vEl.textContent = Math.round(counters.vol).toLocaleString(
                    "en-US",
                  );
              },
            });
            cycle.set(caret, { autoAlpha: 1 }, "-=0.25");
            cycle.call(() => blink.play(), undefined, "<");
            cycle.to(
              typing,
              {
                i: entry.note.length,
                duration: entry.note.length * 0.04,
                ease: "none",
                onUpdate: () => {
                  const n = q(A, "[data-note]");
                  if (n)
                    n.textContent = entry.note.slice(0, Math.round(typing.i));
                },
              },
              "<0.1",
            );
            cycle.call(() => {
              blink.pause();
              gsap.set(caret, { autoAlpha: 0 });
            });
            cycle.to(q(A, "[data-photo]"), { autoAlpha: 1, duration: 0.7 }, "-=0.1");
            cycle.to({}, { duration: 1.8 }); // hold the finished record

            // Then the entry rides up through the fade and is gone.
            cycle.call(() => {
              gsap.to(track, {
                y:
                  s < ENTRIES.length - 1
                    ? centerFor(s + 1)
                    : centerFor(s) - (cards[s].offsetHeight + root.offsetHeight),
                duration: 0.9,
                ease: "power2.inOut",
              });
            });
            cycle.to({}, { duration: 1.0 });

            if (s === ENTRIES.length - 1) {
              // Window is empty — reset invisibly and begin the week again.
              cycle.call(() => {
                cards.forEach(windBack);
                gsap.set(track, { y: centerFor(0) });
              });
              cycle.to({}, { duration: 0.4 });
            }
          });

          tl = cycle;
        };

        // Run only while on screen; build on the first entrance.
        const st = ScrollTrigger.create({
          trigger: root,
          start: "top 78%",
          end: "bottom 5%",
          onToggle: (self) => {
            if (self.isActive) {
              if (!tl) build();
              tl?.play();
            } else tl?.pause();
          },
        });

        return () => {
          st.kill();
          tl?.kill();
          blinks.forEach((b) => b.kill());
        };
      });
    },
    { scope: rootRef },
  );

  return (
    <div
      ref={rootRef}
      style={{
        maskImage:
          "linear-gradient(to bottom, transparent, black 16%, black 84%, transparent)",
        WebkitMaskImage:
          "linear-gradient(to bottom, transparent, black 16%, black 84%, transparent)",
      }}
      className="relative mx-auto h-[46rem] w-full max-w-[26rem] overflow-hidden"
    >
      {/* The feed — normal flow inside a sliding track; the wide gap keeps
          neighbors fully outside the window, so it reads one at a time. */}
      <div ref={trackRef} className="absolute inset-x-0 top-0 flex flex-col gap-40">
        {ENTRIES.map((e) => (
          <FeedCard key={e.name} e={e} />
        ))}
      </div>
    </div>
  );
}
