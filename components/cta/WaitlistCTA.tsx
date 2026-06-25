"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { subscribeEmail } from "@/lib/subscribeEmail";

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      aria-hidden
      className={className}
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

type Variant = "nav" | "bar";
type Tone = "light" | "dark" | "auto";
type Phase = "idle" | "open" | "submitting" | "success" | "error";

/**
 * The one CTA pattern. `bar` = full-width plinth (hero / final CTA);
 * `nav` = compact chip. Hover invert is INSTANT (pure CSS, transition-none);
 * only the expand/grow is eased. Submits via the swappable subscribeEmail seam.
 */
export function WaitlistCTA({
  variant,
  tone = "light",
  className,
  label = "Join Waitlist",
}: {
  variant: Variant;
  tone?: Tone;
  className?: string;
  label?: string;
}) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const busy = phase === "submitting";

  function open() {
    setPhase("open");
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setPhase("submitting");
    setError(null);
    const res = await subscribeEmail(email);
    if (res.ok) setPhase("success");
    else {
      setError(res.error);
      setPhase("open");
    }
  }

  // Instant-invert color pair for the nav idle chip (the tactile signature).
  const idleInvert =
    tone === "dark"
      ? "border border-paper bg-paper text-ink hover:bg-transparent hover:text-paper"
      : "border border-ink bg-ink text-paper hover:bg-paper hover:text-ink";

  // ---- BAR (hero / final CTA): ONE persistent rectangle — color + content
  //      swap by phase (no fade between states). Big light type, + submits. ----
  if (variant === "bar") {
    const base =
      tone === "auto"
        ? "border border-[var(--page-text)] bg-[var(--page-text)] text-[var(--page-bg)]"
        : tone === "dark"
          ? "bg-paper text-ink border border-paper"
          : "bg-ink text-paper border border-ink";
    const hover =
      tone === "auto"
        ? "hover:bg-[var(--page-bg)] hover:text-[var(--page-text)]"
        : tone === "dark"
          ? "hover:bg-transparent hover:text-paper"
          : "hover:bg-paper hover:text-ink";
    const field =
      "bg-paper text-ink border border-ink caret-ink placeholder:text-taupe";
    // Same rectangle for every phase — equal padding all round, big light type.
    // transition-transform only: color inverts instantly, the press eases.
    const bar =
      "flex h-[4.5rem] w-full items-center gap-4 px-5 sm:h-24 sm:px-7";
    const textCls =
      "text-[2rem] font-light leading-none tracking-tight sm:text-[2.85rem]";

    return (
      <div className={cn("relative w-full", className)}>
        {phase === "idle" ? (
          <button
            type="button"
            onClick={open}
            className={cn(
              bar,
              base,
              hover,
              "transition-transform duration-100 active:scale-[0.99]",
            )}
          >
            <span className={cn("flex-1 text-left", textCls)}>{label}</span>
            <PlusIcon className="h-9 w-9 shrink-0 sm:h-11 sm:w-11" />
          </button>
        ) : phase === "success" ? (
          <div className={cn(bar, field)}>
            <span className={cn("flex-1", textCls)}>You&rsquo;re on the list.</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={cn(bar, field)}>
            <input
              ref={inputRef}
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-label="Email address"
              aria-invalid={!!error}
              className={cn("min-w-0 flex-1 bg-transparent outline-none", textCls)}
            />
            <button
              type="submit"
              disabled={busy}
              aria-label="Join the waitlist"
              className="shrink-0 transition-opacity disabled:opacity-40"
            >
              <PlusIcon className="h-9 w-9 sm:h-11 sm:w-11" />
            </button>
          </form>
        )}

        {error && (
          <p className="absolute -bottom-6 left-0 font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-[#9e2e29]">
            {error}
          </p>
        )}
      </div>
    );
  }

  // ---- NAV: compact chip that grows in place ------------------------------
  return (
    <motion.div layout className={cn("flex items-center", className)}>
      <AnimatePresence initial={false} mode="wait">
        {phase === "idle" && (
          <motion.button
            key="nav-idle"
            type="button"
            onClick={open}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.14 }}
            className={cn(
              "flex h-10 items-center gap-2.5 px-4 text-[1.0625rem] font-light tracking-tight transition-transform duration-100 active:scale-[0.98]",
              idleInvert,
            )}
          >
            {label}
            <PlusIcon className="h-5 w-5" />
          </motion.button>
        )}

        {(phase === "open" || phase === "submitting" || phase === "error") && (
          <motion.form
            key="nav-open"
            onSubmit={handleSubmit}
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "min(22rem, 72vw)" }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="flex h-10 items-stretch overflow-hidden border border-ink bg-paper text-ink"
          >
            <input
              ref={inputRef}
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-label="Email address"
              className="h-full min-w-0 flex-1 bg-transparent px-4 text-[1.0625rem] font-light text-ink caret-ink outline-none placeholder:text-taupe"
            />
            <button
              type="submit"
              disabled={busy}
              aria-label="Join the waitlist"
              className="flex h-full shrink-0 items-center pr-3 text-ink transition-transform duration-100 active:scale-90 disabled:opacity-40"
            >
              <PlusIcon className="h-5 w-5" />
            </button>
          </motion.form>
        )}

        {phase === "success" && (
          <motion.span
            key="nav-success"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "font-mono text-[0.6875rem] uppercase tracking-[0.16em]",
              tone === "dark" ? "text-paper" : "text-ink",
            )}
          >
            You&rsquo;re on the list.
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
