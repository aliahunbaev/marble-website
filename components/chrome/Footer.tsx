import Link from "next/link";
import { Container } from "@/components/primitives/Container";

/**
 * Footer. Transparent — it shares the closing environment (page.tsx): one
 * halftone spans the final CTA and this, and the whole thing flips with the
 * page. The closing scene is a single composed viewport; the footer is its
 * bottom row. Text inherits the flip-driven color; opacity does hierarchy.
 */
export function Footer() {
  return (
    <footer className="relative">
      <Container className="relative z-10">
        <div className="flex flex-col gap-8 border-t border-[rgba(128,128,128,0.25)] py-10 sm:flex-row sm:items-end sm:justify-between">
          {/* Instagram joins here once the final handle exists. /library is
              parked — page kept, unlinked, pending a decision. */}
          <nav className="flex flex-wrap gap-x-10 gap-y-3 font-mono text-[0.75rem] uppercase tracking-[0.16em]">
            <Link
              href="/privacy"
              className="opacity-85 transition-opacity hover:opacity-100"
            >
              Privacy
            </Link>
          </nav>
          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.16em] opacity-60">
            A Combat Créatif project
          </p>
        </div>
      </Container>
    </footer>
  );
}
