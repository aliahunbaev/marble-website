import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/primitives/Container";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { Wordmark } from "@/components/primitives/Wordmark";

export const metadata: Metadata = {
  title: "Library — Marble",
  description: "Further reading. The sources behind Marble's daily lines.",
};

// One editorial line each — drafts; Ali finalizes the copy.
const REFERENCES: { title: string; author: string; line: string }[] = [
  {
    title: "Meditations",
    author: "Marcus Aurelius",
    line: "The emperor's private notebook on self-command — where most of the daily lines begin.",
  },
  {
    title: "Letters from a Stoic",
    author: "Seneca",
    line: "On time, discipline, and difficulty as the thing that strengthens.",
  },
  {
    title: "Discourses & Enchiridion",
    author: "Epictetus",
    line: "What is in your control, and what is not. The whole of it.",
  },
  {
    title: "Sun and Steel",
    author: "Yukio Mishima",
    line: "The body as a language, and steel as the discipline that revives it.",
  },
  {
    title: "The Old Man and the Sea",
    author: "Ernest Hemingway",
    line: "Grace under pressure — and the strength found at the broken places.",
  },
  {
    title: "Man, the Unknown",
    author: "Alexis Carrel",
    line: "Both the marble and the sculptor. The line that gave Marble its name.",
  },
  {
    title: "Mishima: A Life in Four Chapters",
    author: "Paul Schrader (film)",
    line: "Pen and sword, body and word, made into a single act.",
  },
  {
    title: "Free Solo",
    author: "Chin & Vasarhelyi (film)",
    line: "What a body is capable of, with nothing held in reserve.",
  },
];

export default function Library() {
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
          <Eyebrow>Library</Eyebrow>
          <h1 className="mt-5 text-[clamp(2.5rem,7vw,5rem)] font-light leading-[0.98] tracking-[-0.03em]">
            Further reading.
          </h1>
          <p className="mt-6 max-w-xl text-lg font-light leading-relaxed text-taupe">
            The sources behind the daily lines. Stoics, Mishima, the classics —
            the texts Marble was built around.
          </p>
        </div>

        <ul className="mt-16 sm:mt-24">
          {REFERENCES.map((r) => (
            <li
              key={r.title}
              className="grid grid-cols-1 gap-2 border-t border-hairline py-7 md:grid-cols-12 md:gap-8"
            >
              <div className="md:col-span-5">
                <span className="text-xl font-light tracking-tight">
                  {r.title}
                </span>{" "}
                <span className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-taupe">
                  {r.author}
                </span>
              </div>
              <p className="text-base font-light leading-relaxed text-taupe md:col-span-6 md:col-start-7">
                {r.line}
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
