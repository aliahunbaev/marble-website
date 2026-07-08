import { Nav } from "@/components/chrome/Nav";
import { Footer } from "@/components/chrome/Footer";
import { Halftone } from "@/components/halftone/Halftone";
import { HeroFilm } from "@/components/sections/HeroFilm";
import { Features } from "@/components/sections/Features";
import { Manifesto } from "@/components/sections/Manifesto";
import { FinalCta } from "@/components/sections/FinalCta";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <HeroFilm />
        <Features />
        <Manifesto />
      </main>

      {/* Closing environment — the final CTA and footer share ONE halftone and
          flip to dark together with the rest of the page (never pre-dark). The
          halftone's ink dots invert to light via CSS when --flip crosses. */}
      <div className="relative isolate overflow-hidden bg-[var(--page-bg)] text-[var(--page-text)]">
        <div
          className="pointer-events-none absolute inset-0"
          style={{ filter: "invert(var(--flip))" }}
        >
          <Halftone
            src="/images/halftone-wide.webp"
            srcPortrait="/images/halftone-mobile.webp"
            cell={6}
            cellPortrait={5}
            dotScale={0.9}
            invert
            dotColor="#0e0a07"
            ghost={0.25}
            focalX={0.5}
            focalY={0.5}
            portraitFocalX={0.5}
            portraitFocalY={0.4}
            forceStatic
          />
        </div>
        {/* One composed final viewport: CTA centered, footer at the bottom edge. */}
        <div className="relative z-10 flex min-h-[100svh] flex-col">
          <FinalCta />
          <Footer />
        </div>
      </div>
    </>
  );
}
