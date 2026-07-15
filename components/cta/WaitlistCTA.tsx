"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";
import { subscribeEmail } from "@/lib/subscribeEmail";

// The site's signature ease (drives the nav width-grow).
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

// Launch switch. Set in the environment (Vercel → redeploy) and every CTA
// site-wide flips from waitlist capture to a straight App Store link —
// no code change on approval day. Unset = waitlist, exactly as before.
// The app is live, so Download is the default everywhere. An env override
// (NEXT_PUBLIC_APPSTORE_URL) still wins if ever set to point elsewhere.
const APPSTORE_URL =
  process.env.NEXT_PUBLIC_APPSTORE_URL ??
  "https://apps.apple.com/us/app/marble-training-journal/id6779775636";

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

function ArrowUpRightIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      aria-hidden
      className={className}
    >
      <path d="M7 17 17 7M8 7h9v9" />
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

/**
 * Honeypot: a decoy field hidden from real users (off-screen, non-focusable,
 * aria-hidden). Bots fill every field, so a non-empty value flags a bot and the
 * server silently drops the submission. Read by ref, not form serialization.
 */
function Honeypot({ inputRef }: { inputRef: React.Ref<HTMLInputElement> }) {
  return (
    <input
      ref={inputRef}
      type="text"
      name="company"
      tabIndex={-1}
      autoComplete="off"
      aria-hidden="true"
      className="pointer-events-none absolute left-[-9999px] top-0 h-0 w-0 opacity-0"
    />
  );
}

type Variant = "nav" | "bar";
type Tone = "light" | "dark" | "auto";
type Phase = "idle" | "open" | "submitting" | "success" | "error";

/**
 * The one CTA pattern. `bar` = full-width plinth (hero / final CTA);
 * `nav` = outlined soft-cornered control (the app's control language) that
 * opens the waitlist dialog — or links straight to the store once launched.
 * The bar's hover invert is INSTANT (pure CSS) and it swaps phases flatly with
 * no transition. Submits via the swappable subscribeEmail seam.
 *
 * Two modes: with NEXT_PUBLIC_APPSTORE_URL set, both variants render a plain
 * "Download" link to the store (same plinth/chip, ↗ instead of +); without it,
 * the waitlist capture flow below.
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
  const [modalOpen, setModalOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const honeypotRef = useRef<HTMLInputElement>(null);

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
    const res = await subscribeEmail(email, honeypotRef.current?.value ?? "");
    if (res.ok) setPhase("success");
    else {
      setError(res.error);
      setPhase("open");
    }
  }

  // Click-away collapses the field back to the resting CTA — unless focus moved
  // to the submit button (let that click submit first).
  function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
    const next = e.relatedTarget as HTMLElement | null;
    if (next?.closest("[data-cta-submit]")) return;
    if (phase === "open" || phase === "error") setPhase("idle");
  }

  // Outlined control for the nav — hairline frame at rest (no second monument
  // beside the lockup); hover just darkens the stroke to full.
  // `auto` rides the continuous --flip palette so it dims with the page.
  const chipTone =
    tone === "auto"
      ? "border-[color-mix(in_srgb,var(--page-text)_35%,transparent)] text-[var(--page-text)] hover:border-[var(--page-text)]"
      : tone === "dark"
        ? "border-paper/35 text-paper hover:border-paper"
        : "border-ink/35 text-ink hover:border-ink";

  // ---- BAR (hero / final CTA): ONE rectangle; content swaps by phase with no
  //      transition. Instant hover-invert; no press, no sending state. ----------
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
    const bar = "flex h-[4.5rem] w-full items-center gap-4 px-5 sm:h-24 sm:px-7";
    const textCls =
      "text-[2rem] font-light leading-none tracking-tight sm:text-[2.85rem]";
    const iconCls = "h-9 w-9 shrink-0 sm:h-11 sm:w-11";

    // Download mode — the same plinth, now a straight link to the store.
    if (APPSTORE_URL) {
      return (
        <div className={cn("relative w-full", className)}>
          <a
            href={APPSTORE_URL}
            target="_blank"
            rel="noopener"
            aria-label="Download Marble on the App Store"
            className={cn(bar, base, hover)}
          >
            <span className={cn("flex-1 text-left", textCls)}>Download</span>
            <ArrowUpRightIcon className={iconCls} />
          </a>
        </div>
      );
    }

    return (
      <div className={cn("relative w-full", className)}>
        {phase === "idle" ? (
          <button
            type="button"
            onClick={open}
            className={cn(bar, base, hover)}
          >
            <span className={cn("flex-1 text-left", textCls)}>{label}</span>
            <PlusIcon className={iconCls} />
          </button>
        ) : phase === "success" ? (
          <div className={cn(bar, field)}>
            <span className={cn("flex-1", textCls)}>
              You&rsquo;re on the list.
            </span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={cn(bar, field)}>
            <Honeypot inputRef={honeypotRef} />
            <input
              ref={inputRef}
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={handleBlur}
              aria-label="Email address"
              aria-invalid={!!error}
              className={cn("min-w-0 flex-1 bg-transparent outline-none", textCls)}
            />
            <button
              type="submit"
              data-cta-submit
              aria-label="Join the waitlist"
              className="shrink-0"
            >
              <PlusIcon className={iconCls} />
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

  // ---- NAV: outlined soft-cornered control. Pre-launch it opens the waitlist
  //      dialog; with the store URL set it IS the download link. -------------
  if (APPSTORE_URL) {
    return (
      <a
        href={APPSTORE_URL}
        target="_blank"
        rel="noopener"
        aria-label="Download Marble on the App Store"
        className={cn(
          "flex h-10 items-center gap-2 rounded-[8px] border px-4 text-[1.0625rem] font-light tracking-tight",
          chipTone,
          className,
        )}
      >
        Download
        <ArrowUpRightIcon className="h-4 w-4" />
      </a>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        aria-haspopup="dialog"
        className={cn(
          "flex h-10 items-center gap-2 rounded-[8px] border px-4 text-[1.0625rem] font-light tracking-tight",
          chipTone,
          className,
        )}
      >
        {label}
        <PlusIcon className="h-4 w-4" />
      </button>
      <WaitlistModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}

/**
 * The waitlist dialog — a clean solid-paper card over a plain dim (no blur),
 * soft-cornered controls, Figma-style filled email field with the mono label
 * inside. Portaled to <body>: the frosted nav's backdrop-filter would
 * otherwise become the containing block for the fixed overlay. Paper in both
 * palettes — dialogs keep their own light, they don't ride --flip.
 */
function WaitlistModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [phase, setPhase] = useState<"idle" | "submitting" | "success">("idle");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const honeypotRef = useRef<HTMLInputElement>(null);

  // Portal target exists only client-side (false during SSR/hydration).
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  // While open: scroll locked (scrollbar-compensated), field focused, Esc
  // closes, focus returns to the opener on close.
  useEffect(() => {
    if (!open) return;
    const prevActive = document.activeElement as HTMLElement | null;
    const body = document.body;
    const prevOverflow = body.style.overflow;
    const prevPad = body.style.paddingRight;
    const sb = window.innerWidth - document.documentElement.clientWidth;
    body.style.overflow = "hidden";
    if (sb > 0) body.style.paddingRight = `${sb}px`;
    requestAnimationFrame(() => inputRef.current?.focus());
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      body.style.overflow = prevOverflow;
      body.style.paddingRight = prevPad;
      window.removeEventListener("keydown", onKey);
      prevActive?.focus?.({ preventScroll: true });
    };
  }, [open, onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (phase === "submitting") return;
    setPhase("submitting");
    setError(null);
    const res = await subscribeEmail(email, honeypotRef.current?.value ?? "");
    if (res.ok) setPhase("success");
    else {
      setError(res.error);
      setPhase("idle");
    }
  }

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="waitlist-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[80] flex items-center justify-center p-5"
        >
          {/* Dimmed page behind the card (plain dim, no blur); click-away closes */}
          <div
            aria-hidden
            onClick={onClose}
            className="absolute inset-0 bg-ink/30"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Join the waitlist"
            initial={{ opacity: 0, y: 10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.24, ease: EASE }}
            className="relative flex min-h-[20rem] w-[min(26rem,100%)] flex-col rounded-[12px] bg-paper p-7 shadow-[0_24px_80px_rgba(14,10,7,0.25)]"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute right-7 top-7 text-ink hover:opacity-60"
            >
              <CloseIcon className="h-5 w-5" />
            </button>

            {/* Header — constant across states so the card never resizes */}
            <p className="pr-10 text-2xl font-light tracking-tight text-ink">
              Join the waitlist
            </p>

            {phase === "success" ? (
              <p className="mt-2 text-[0.9375rem] font-light leading-snug text-taupe">
                You&rsquo;re on the list.
              </p>
            ) : (
              <>
                <p className="mt-2 text-[0.9375rem] font-light leading-snug text-taupe">
                  Be first in when Marble reaches the App&nbsp;Store.
                </p>
                <form
                  onSubmit={handleSubmit}
                  className="mt-auto flex flex-col gap-3 pt-6"
                >
                  <Honeypot inputRef={honeypotRef} />
                  {/* Filled field — no stroke at rest, ink stroke on focus */}
                  <label className="block cursor-text rounded-[8px] border border-transparent bg-ink/[0.07] px-4 py-3 focus-within:border-ink">
                    <span className="block font-mono text-[0.625rem] uppercase tracking-[0.16em] text-taupe">
                      Email
                    </span>
                    <input
                      ref={inputRef}
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      aria-invalid={!!error}
                      className="mt-1 w-full bg-transparent text-[1.0625rem] font-light text-ink caret-ink outline-none"
                    />
                  </label>
                  <button
                    type="submit"
                    disabled={phase === "submitting"}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-[8px] bg-ink text-[1.0625rem] font-light text-paper disabled:opacity-60"
                  >
                    Join
                    <PlusIcon className="h-4 w-4" />
                  </button>
                </form>
                {error && (
                  <p className="mt-3 font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-[#9e2e29]">
                    {error}
                  </p>
                )}
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
