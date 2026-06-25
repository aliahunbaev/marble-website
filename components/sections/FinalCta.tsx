import { Container } from "@/components/primitives/Container";
import { WaitlistCTA } from "@/components/cta/WaitlistCTA";

/**
 * Closing CTA. Transparent — it lives inside the closing environment (page.tsx)
 * and inherits the flip-driven palette, so it starts light and flips to dark
 * with the whole page. The bar uses tone="auto" (colors track --flip).
 */
export function FinalCta() {
  return (
    <section className="relative py-32 sm:py-44">
      <Container>
        <h2 className="text-center text-[clamp(2.5rem,8vw,6rem)] font-light leading-[0.96] tracking-[-0.03em]">
          Start training.
        </h2>
        <div className="mx-auto mt-9 max-w-[44rem] sm:mt-12">
          <WaitlistCTA variant="bar" tone="auto" />
        </div>
      </Container>
    </section>
  );
}
