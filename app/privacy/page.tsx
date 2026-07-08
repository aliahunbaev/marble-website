import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/primitives/Container";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { Wordmark } from "@/components/primitives/Wordmark";

export const metadata: Metadata = {
  title: "Privacy — Marble",
  description: "What Marble collects (your email) and what it never does.",
};

// Plain-language draft — Ali edits. Keep it honest and short; expand only
// when the product actually collects more than a waitlist email.
const SECTIONS: { title: string; body: string }[] = [
  {
    title: "The short version",
    body: "We collect one thing: the email address you choose to give us. It is used for Marble updates and nothing else.",
  },
  {
    title: "What we collect",
    body: "The email address you submit to the waitlist. This site sets no tracking cookies and runs no third-party analytics.",
  },
  {
    title: "How it's used",
    body: "To confirm your place on the waitlist and to send occasional updates about Marble — the app, the launch, the work.",
  },
  {
    title: "Where it lives",
    body: "Addresses are stored with Resend, the email service that delivers our messages, and nowhere else.",
  },
  {
    title: "What we never do",
    body: "Sell, rent, or share your address. No lists change hands, no brokers, no exceptions.",
  },
  {
    title: "Leaving",
    body: "Every email we send includes an unsubscribe link. Use it and you're gone from the list — or reply to any Marble email and ask, and we'll remove you.",
  },
];

export default function Privacy() {
  return (
    <main className="min-h-screen bg-paper pb-32 pt-24 text-ink">
      <Container>
        <Link
          href="/"
          className="inline-block text-[0.95rem]"
          aria-label="Marble — home"
        >
          <Wordmark withMark />
        </Link>

        <div className="mt-20 max-w-3xl sm:mt-28">
          <Eyebrow>Privacy</Eyebrow>
          <h1 className="mt-5 text-[clamp(2.5rem,7vw,5rem)] font-light leading-[0.98] tracking-[-0.03em]">
            Only your email.
          </h1>
          <p className="mt-6 font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-taupe">
            Updated · July 2026
          </p>
        </div>

        <ul className="mt-16 max-w-3xl sm:mt-24">
          {SECTIONS.map((s) => (
            <li
              key={s.title}
              className="grid grid-cols-1 gap-2 border-t border-hairline py-7 md:grid-cols-12 md:gap-8"
            >
              <div className="md:col-span-4">
                <span className="text-xl font-light tracking-tight">
                  {s.title}
                </span>
              </div>
              <p className="text-base font-light leading-relaxed text-taupe md:col-span-7 md:col-start-6">
                {s.body}
              </p>
            </li>
          ))}
        </ul>

        <div className="mt-20">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-taupe transition-colors hover:text-ink"
          >
            <span
              aria-hidden
              className="transition-transform duration-300 group-hover:-translate-x-1"
            >
              ←
            </span>
            Back to Marble
          </Link>
        </div>
      </Container>
    </main>
  );
}
