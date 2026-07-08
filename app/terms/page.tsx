import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/primitives/Container";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { Wordmark } from "@/components/primitives/Wordmark";

export const metadata: Metadata = {
  title: "Terms — Marble",
  description: "Plain terms for a site about an app in the making.",
};

// Plain-language draft — Ali edits. Expand when the app itself ships.
const SECTIONS: { title: string; body: string }[] = [
  {
    title: "The short version",
    body: "This is the marketing site for Marble, a training journal in development. Reading it and joining the waitlist cost nothing and commit you to nothing.",
  },
  {
    title: "The waitlist",
    body: "Joining the waitlist reserves your interest, not a product. It is not a purchase, and it doesn't guarantee access, features, or a launch date. You can leave at any time.",
  },
  {
    title: "The content",
    body: "The design, text, and imagery of this site belong to Combat Créatif. Referenced works — films, passages, photographs of classical sculpture — belong to their respective owners and appear as reference.",
  },
  {
    title: "No warranties",
    body: "The site is provided as-is. We work to keep it accurate and available, but we make no promises about either.",
  },
  {
    title: "Changes",
    body: "These terms may evolve as Marble does. The date below reflects the latest revision; continued use of the site means the current version applies.",
  },
];

export default function Terms() {
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
          <Eyebrow>Terms</Eyebrow>
          <h1 className="mt-5 text-[clamp(2.5rem,7vw,5rem)] font-light leading-[0.98] tracking-[-0.03em]">
            Plain terms.
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
