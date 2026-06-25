import { Container } from "@/components/primitives/Container";

/**
 * Footer. Transparent — it shares the closing environment (page.tsx): one
 * halftone spans the final CTA and this, and the whole thing flips with the
 * page. Text inherits the flip-driven color; opacity does the hierarchy.
 */
export function Footer() {
  return (
    <footer className="relative flex min-h-[45vh] flex-col justify-end">
      <Container className="relative z-10">
        <div className="flex flex-col gap-8 border-t border-[rgba(128,128,128,0.25)] py-12 sm:flex-row sm:items-end sm:justify-between">
          <nav className="flex flex-wrap gap-x-8 gap-y-3 font-mono text-[0.6875rem] uppercase tracking-[0.16em]">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="opacity-70 transition-opacity hover:opacity-100"
            >
              Instagram
            </a>
            <a
              href="/library"
              className="opacity-70 transition-opacity hover:opacity-100"
            >
              Library
            </a>
            <a
              href="#"
              className="opacity-70 transition-opacity hover:opacity-100"
            >
              Privacy
            </a>
            <a
              href="#"
              className="opacity-70 transition-opacity hover:opacity-100"
            >
              Terms
            </a>
          </nav>
          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.16em] opacity-50">
            A Combat Créatif project
          </p>
        </div>
      </Container>
    </footer>
  );
}
