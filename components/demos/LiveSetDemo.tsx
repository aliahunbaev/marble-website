"use client";

import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { cn } from "@/lib/cn";
import { artifactCard } from "./artifact";

export interface LiveSetDemoHandle {
  /** Restart the logging loop from the top (used by the connected flow). */
  run: () => void;
}

function TimerGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      aria-hidden
      className={className}
    >
      <circle cx="12" cy="13" r="8" />
      <path d="M12 13V9M10 3h4" />
    </svg>
  );
}

function CheckGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      aria-hidden
      className={className}
    >
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

const REST_TOTAL = 90; // the app's 1:30 default
const LOOP_DRAIN = 4.5; // ambient loop: compressed rest between sets
const USER_DRAIN = 14; // user-started rest: slower, watchable
const PRESETS = [30, 60, 90, 120, 180, 300];

/** The rotation — each "locked" exercise hands off to the next card. */
const EXERCISES = [
  {
    name: "Bench Press",
    last: [
      ["225", "8"],
      ["235", "5"],
      ["245", "3"],
    ],
    plan: [
      ["225", "8"],
      ["235", "6"],
      ["245", "4"],
    ],
  },
  {
    name: "Incline Press",
    last: [
      ["165", "10"],
      ["175", "8"],
      ["185", "6"],
    ],
    plan: [
      ["170", "10"],
      ["180", "8"],
      ["185", "6"],
    ],
  },
  {
    name: "Back Squat",
    last: [
      ["275", "6"],
      ["295", "4"],
      ["315", "2"],
    ],
    plan: [
      ["285", "6"],
      ["305", "3"],
      ["315", "3"],
    ],
  },
] as const;

type Row = { w: string; r: string; done: boolean };
const emptyRows = (): Row[] => [
  { w: "", r: "", done: false },
  { w: "", r: "", done: false },
  { w: "", r: "", done: false },
];

function fmt(sec: number): string {
  const s = Math.max(0, Math.ceil(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

const monoLabel = "font-mono text-[0.625rem] uppercase tracking-[0.14em]";

/**
 * "Set by set." — a continuous logging loop in the app's own language.
 * Each set types itself in and completes (row takes the app's warm wash,
 * the field loses its tint, the check settles to ink), the rest bar wipes
 * between sets, and a locked exercise hands off to the next card. Touching
 * anything pauses the ambient loop — check sets, edit numbers, open the
 * glass timer — and it resumes on its own after you leave it alone.
 * The card never changes height, so the page never shifts.
 */
export function LiveSetDemo({ ref }: { ref?: React.Ref<LiveSetDemoHandle> }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const boneLayerRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<SVGCircleElement>(null);

  const [exIdx, setExIdx] = useState(0);
  const [rows, setRows] = useState<Row[]>(emptyRows);
  const [resting, setResting] = useState(false);
  // The card morphs in place: the workout view becomes the timer menu, a
  // running timer becomes the ring view; X returns to the workout.
  const [view, setView] = useState<"sets" | "timer">("sets");
  const viewRef = useRef<"sets" | "timer">("sets");

  const restProxy = useRef({ t: REST_TOTAL, total: REST_TOTAL });
  const restTween = useRef<gsap.core.Tween | null>(null);
  const loop = useRef<gsap.core.Timeline | null>(null);
  const idleTimer = useRef<gsap.core.Tween | null>(null);
  const inView = useRef(false);
  const exIdxRef = useRef(0);

  const reduced = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /** Paint every countdown surface directly — no re-renders at 60fps. */
  const paint = useCallback(() => {
    const { t, total } = restProxy.current;
    const p = Math.min(1, Math.max(0, t / total));
    if (fillRef.current) fillRef.current.style.width = `${p * 100}%`;
    if (boneLayerRef.current)
      boneLayerRef.current.style.clipPath = `inset(0 ${(1 - p) * 100}% 0 0)`;
    if (ringRef.current) {
      const c = 2 * Math.PI * 62;
      ringRef.current.style.strokeDashoffset = `${c * (1 - p)}`;
    }
    const text = fmt(t);
    rootRef.current
      ?.querySelectorAll<HTMLElement>("[data-count]")
      .forEach((el) => (el.textContent = text));
  }, []);

  const endRest = useCallback(() => {
    restTween.current?.kill();
    setResting(false);
    // A finished/skipped rest hands the card back to the workout.
    setView("sets");
    viewRef.current = "sets";
  }, []);

  const openTimer = useCallback(() => {
    setView("timer");
    viewRef.current = "timer";
  }, []);

  const closeTimer = useCallback(() => {
    setView("sets");
    viewRef.current = "sets";
  }, []);

  const startRest = useCallback(
    (total: number = REST_TOTAL, drain: number = USER_DRAIN) => {
      restTween.current?.kill();
      restProxy.current = { t: total, total };
      setResting(true);
      paint();
      if (reduced()) {
        restProxy.current.t = total * 0.6;
        paint();
        return;
      }
      restTween.current = gsap.to(restProxy.current, {
        t: 0,
        duration: (total / REST_TOTAL) * drain,
        ease: "none",
        onUpdate: paint,
        onComplete: endRest,
      });
    },
    [paint, endRest],
  );

  const adjustRest = useCallback(
    (delta: number) => {
      const r = restProxy.current;
      r.t = Math.min(300, Math.max(1, r.t + delta));
      r.total = Math.max(r.total, r.t);
      restTween.current?.kill();
      paint();
      if (!reduced())
        restTween.current = gsap.to(r, {
          t: 0,
          duration: (r.t / REST_TOTAL) * USER_DRAIN,
          ease: "none",
          onUpdate: paint,
          onComplete: endRest,
        });
    },
    [paint, endRest],
  );

  /* ---- The ambient loop ------------------------------------------------ */

  const stopLoop = useCallback(() => {
    loop.current?.kill();
    loop.current = null;
  }, []);

  // The loop chains into itself from inside a GSAP call — route the
  // recursion through a ref so the callback isn't self-referential.
  const startLoopRef = useRef<(idx: number) => void>(() => {});

  const startLoop = useCallback(
    (idx: number) => {
      stopLoop();
      exIdxRef.current = idx;
      setExIdx(idx);
      setRows(emptyRows());
      setResting(false);
      if (reduced()) return; // static idle card for reduced motion

      const ex = EXERCISES[idx];
      const tl = gsap.timeline();

      // The card stays solid — only its contents change between exercises.
      let cursor = 0.5;
      ex.plan.forEach(([w, r], setIdx) => {
        // Type the weight, then the reps.
        w.split("").forEach((_, ci) => {
          tl.call(
            () =>
              setRows((rs) =>
                rs.map((row, i) =>
                  i === setIdx ? { ...row, w: w.slice(0, ci + 1) } : row,
                ),
              ),
            undefined,
            cursor + ci * 0.13,
          );
        });
        cursor += w.length * 0.13 + 0.2;
        r.split("").forEach((_, ci) => {
          tl.call(
            () =>
              setRows((rs) =>
                rs.map((row, i) =>
                  i === setIdx ? { ...row, r: r.slice(0, ci + 1) } : row,
                ),
              ),
            undefined,
            cursor + ci * 0.13,
          );
        });
        cursor += r.length * 0.13 + 0.3;
        // Complete the set — the wash settles, rest begins.
        tl.call(
          () => {
            setRows((rs) =>
              rs.map((row, i) => (i === setIdx ? { ...row, done: true } : row)),
            );
            startRest(REST_TOTAL, LOOP_DRAIN);
          },
          undefined,
          cursor,
        );
        cursor += LOOP_DRAIN + 0.5;
      });

      // Locked — hold the finished exercise, then swap to the next in place.
      cursor += 1.2;
      tl.call(
        () => startLoopRef.current((exIdxRef.current + 1) % EXERCISES.length),
        undefined,
        cursor,
      );

      loop.current = tl;
    },
    [stopLoop, startRest],
  );

  useEffect(() => {
    startLoopRef.current = startLoop;
  }, [startLoop]);

  /** Any touch pauses the ambience; it resumes after you leave it alone
      (and never while you're in the timer or mid-rest). */
  const interact = useCallback(() => {
    stopLoop();
    idleTimer.current?.kill();
    idleTimer.current = gsap.delayedCall(10, () => {
      if (
        inView.current &&
        !reduced() &&
        viewRef.current === "sets" &&
        !restTween.current?.isActive()
      )
        startLoop((exIdxRef.current + 1) % EXERCISES.length);
    });
  }, [stopLoop, startLoop]);

  const run = useCallback(() => {
    idleTimer.current?.kill();
    endRest();
    startLoop(0);
  }, [endRest, startLoop]);

  useImperativeHandle(ref, () => ({ run }), [run]);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const st = ScrollTrigger.create({
          trigger: stageRef.current,
          start: "top 78%",
          end: "bottom 5%",
          onToggle: (self) => {
            inView.current = self.isActive;
            if (self.isActive) {
              if (!loop.current && !idleTimer.current?.isActive()) startLoop(exIdxRef.current);
              else loop.current?.resume();
              restTween.current?.resume();
            } else {
              loop.current?.pause();
              restTween.current?.pause();
            }
          },
        });
        return () => st.kill();
      });
    },
    { scope: stageRef, dependencies: [startLoop] },
  );

  useEffect(() => {
    return () => {
      loop.current?.kill();
      restTween.current?.kill();
      idleTimer.current?.kill();
    };
  }, []);

  // Count surfaces that mount mid-rest (chip pill, ring view) render empty
  // until the next tween tick — repaint whenever one appears.
  useEffect(() => {
    if (resting || view === "timer") paint();
  }, [resting, view, paint]);

  const ex = EXERCISES[exIdx];
  const setRow = (i: number, patch: Partial<Row>) =>
    setRows((rs) => rs.map((row, ri) => (ri === i ? { ...row, ...patch } : row)));

  const toggleSet = (i: number) => {
    const row = rows[i];
    if (!row.done) {
      // App behavior: empty fields inherit last time's numbers on complete.
      setRow(i, {
        done: true,
        w: row.w || ex.last[i][0],
        r: row.r || ex.last[i][1],
      });
      startRest();
    } else {
      setRow(i, { done: false });
      endRest();
    }
  };

  const digits = (v: string) => v.replace(/\D/g, "").slice(0, 4);
  const fieldCls =
    "w-full py-2 text-center font-mono text-[0.8125rem] text-ink outline-none transition-colors duration-300 placeholder:text-ink/25";

  return (
    <div ref={stageRef} className="w-full max-w-[28rem]">
      <div
        ref={rootRef}
        style={artifactCard}
        className="relative flex h-[21rem] w-full flex-col justify-center px-5 pb-5 pt-4 sm:px-6"
        onPointerDown={interact}
        onFocus={interact}
      >
        {view === "sets" ? (
          <>
        {/* Header — exercise name + timer chip */}
        <div className="flex items-center justify-between">
          <span className="text-[1.0625rem] font-light text-ink">{ex.name}</span>
          <button
            type="button"
            aria-label="Rest timer"
            onClick={openTimer}
            style={{ borderRadius: 999 }}
            className={cn(
              "flex h-9 items-center justify-center border border-ink/10 bg-paper/60 text-ink transition-[width,background-color] hover:bg-paper",
              resting ? "gap-1.5 px-3" : "w-9",
            )}
          >
            <TimerGlyph className="h-[0.9375rem] w-[0.9375rem]" />
            {resting && (
              <span
                data-count
                className="font-mono text-[0.8125rem] tabular-nums tracking-[0.06em]"
              />
            )}
          </button>
        </div>

        {/* Column heads */}
        <div
          className={cn(
            "-mx-2 mt-4 grid grid-cols-[1.75rem_1fr_1fr_1fr_1.75rem] items-center gap-x-3 px-2 text-taupe/80",
            monoLabel,
          )}
        >
          <span>Set</span>
          <span>Last</span>
          <span className="text-center">Weight</span>
          <span className="text-center">Reps</span>
          <span />
        </div>

        {/* Set rows — completed fields lose their tint and settle to plain ink. */}
        <div className="mt-1 flex flex-col">
          {rows.map((row, i) => (
            <div
              key={`${exIdx}-${i}`}
              className="-mx-2 grid grid-cols-[1.75rem_1fr_1fr_1fr_1.75rem] items-center gap-x-3 border-t border-ink/5 px-2 py-2 first:border-t-0"
            >
              <span className="font-mono text-[0.8125rem] text-ink/80">
                {i + 1}
              </span>
              <span className="font-mono text-[0.8125rem] tracking-[0.04em] text-taupe/70">
                {ex.last[i][0]} × {ex.last[i][1]}
              </span>
              <input
                inputMode="numeric"
                aria-label={`Set ${i + 1} weight`}
                placeholder={ex.last[i][0]}
                value={row.w}
                onChange={(e) => setRow(i, { w: digits(e.target.value) })}
                style={{
                  borderRadius: 8,
                  background: row.done
                    ? "transparent"
                    : "color-mix(in srgb, var(--ink) 6%, transparent)",
                }}
                className={fieldCls}
              />
              <input
                inputMode="numeric"
                aria-label={`Set ${i + 1} reps`}
                placeholder={ex.last[i][1]}
                value={row.r}
                onChange={(e) => setRow(i, { r: digits(e.target.value) })}
                style={{
                  borderRadius: 8,
                  background: row.done
                    ? "transparent"
                    : "color-mix(in srgb, var(--ink) 6%, transparent)",
                }}
                className={fieldCls}
              />
              <button
                type="button"
                aria-label={`Set ${i + 1} ${row.done ? "complete" : "incomplete"}`}
                onClick={() => toggleSet(i)}
                style={{ borderRadius: 7 }}
                className={cn(
                  "flex h-6 w-6 items-center justify-center justify-self-end border transition-colors duration-200",
                  row.done
                    ? "border-ink bg-ink text-paper"
                    : "border-ink/20 bg-transparent text-transparent hover:border-ink/40",
                )}
              >
                <CheckGlyph className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>

        {/* Rest bar slot — space is ALWAYS reserved so the card (and the
            page) never changes height; the bar fades within it. */}
        <div className="relative mt-3 h-10">
          <div
            ref={barRef}
            role="button"
            tabIndex={resting ? 0 : -1}
            aria-label="Open rest timer"
            aria-hidden={!resting}
            onClick={() => resting && openTimer()}
            onKeyDown={(e) => e.key === "Enter" && openTimer()}
            style={{ borderRadius: 12 }}
            className={cn(
              "absolute inset-0 cursor-pointer overflow-hidden transition-[opacity,transform] duration-400",
              resting ? "opacity-100" : "pointer-events-none translate-y-1 opacity-0",
            )}
          >
            <div className="absolute inset-0 bg-ink/5" />
            <div ref={fillRef} className="absolute inset-y-0 left-0 bg-ink" />
            <div className="relative flex h-full items-center gap-3 px-4 text-ink">
              <TimerGlyph className="h-3.5 w-3.5 shrink-0" />
              <span className={monoLabel}>Resting</span>
              <span className="flex-1" />
              <span
                data-count
                className="font-mono text-[0.9375rem] tabular-nums tracking-[0.06em]"
              />
              <span className={cn(monoLabel, "opacity-55")}>Skip</span>
            </div>
            <div
              ref={boneLayerRef}
              className="absolute inset-0 flex items-center gap-3 px-4 text-paper"
              style={{ clipPath: "inset(0 0% 0 0)" }}
            >
              <TimerGlyph className="h-3.5 w-3.5 shrink-0" />
              <span className={monoLabel}>Resting</span>
              <span className="flex-1" />
              <span
                data-count
                className="font-mono text-[0.9375rem] tabular-nums tracking-[0.06em]"
              />
              <span className={cn(monoLabel, "opacity-55")}>Skip</span>
            </div>
            <button
              type="button"
              aria-label="Skip rest"
              tabIndex={resting ? 0 : -1}
              onClick={(e) => {
                e.stopPropagation();
                endRest();
              }}
              className="absolute inset-y-0 right-0 w-14"
            />
          </div>
        </div>

          </>
        ) : (
          <div className="flex flex-1 flex-col">
            {/* Timer header — X returns to the workout view */}
            <div className="flex items-center justify-between">
              <span className={cn(monoLabel, "text-taupe")}>Rest</span>
              <button
                type="button"
                aria-label="Back to workout"
                onClick={closeTimer}
                style={{ borderRadius: 999 }}
                className="flex h-9 w-9 items-center justify-center border border-ink/10 bg-paper/60 text-ink transition-colors hover:bg-paper"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.6}
                  aria-hidden
                  className="h-4 w-4"
                >
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            {resting ? (
              /* The running timer — ring, time controls, skip */
              <div className="flex flex-1 flex-col items-center justify-center">
                <div className="relative h-[8.25rem] w-[8.25rem]">
                  <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90">
                    <circle
                      cx="70"
                      cy="70"
                      r="62"
                      fill="none"
                      stroke="color-mix(in srgb, var(--ink) 10%, transparent)"
                      strokeWidth="1.5"
                    />
                    <circle
                      ref={ringRef}
                      cx="70"
                      cy="70"
                      r="62"
                      fill="none"
                      stroke="var(--ink)"
                      strokeWidth="1.5"
                      strokeDasharray={2 * Math.PI * 62}
                      strokeDashoffset="0"
                    />
                  </svg>
                  <span
                    data-count
                    className="absolute inset-0 flex items-center justify-center font-mono text-[1.625rem] font-light tabular-nums text-ink"
                  />
                </div>
                <div className="mt-4 flex w-full items-center justify-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => adjustRest(-10)}
                    style={{ borderRadius: 999 }}
                    className={cn(
                      monoLabel,
                      "border border-ink/15 px-4 py-2 text-ink transition-colors hover:bg-ink/5",
                    )}
                  >
                    −10s
                  </button>
                  <button
                    type="button"
                    onClick={() => adjustRest(10)}
                    style={{ borderRadius: 999 }}
                    className={cn(
                      monoLabel,
                      "border border-ink/15 px-4 py-2 text-ink transition-colors hover:bg-ink/5",
                    )}
                  >
                    +10s
                  </button>
                  <button
                    type="button"
                    onClick={endRest}
                    style={{ borderRadius: 999 }}
                    className={cn(
                      monoLabel,
                      "bg-ink px-5 py-2 text-paper transition-opacity hover:opacity-85",
                    )}
                  >
                    Skip
                  </button>
                </div>
              </div>
            ) : (
              /* The timer menu — the app's presets */
              <div className="mt-1 flex flex-1 flex-col justify-center">
                {PRESETS.map((s, i) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => startRest(s)}
                    className={cn(
                      "flex items-center justify-between py-[0.4375rem] text-left font-mono text-[0.875rem] text-ink transition-colors hover:text-taupe",
                      i > 0 && "border-t border-ink/5",
                    )}
                  >
                    {fmt(s)}
                    <span className="text-ink/25">→</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
