import { cn } from "@/lib/cn";
import { Container } from "@/components/primitives/Container";

/**
 * One feature block. `centered` = big title + sub centered, media large below
 * (the lead). `split` = title/sub on one side, media the other (`mediaSide`).
 * Big title, slighter secondary text, no tiny labels.
 */
export function FeatureSection({
  title,
  sub,
  media,
  layout = "split",
  mediaSide = "right",
}: {
  title: string;
  sub?: string;
  media: React.ReactNode;
  layout?: "centered" | "split";
  mediaSide?: "left" | "right";
}) {
  const titleCls =
    "text-[clamp(2.25rem,5.5vw,4.5rem)] font-light leading-[1.0] tracking-[-0.03em] text-ink";
  const subCls = "font-light leading-relaxed text-taupe";

  if (layout === "centered") {
    return (
      <section className="relative border-t border-hairline py-28 sm:py-36">
        <Container>
          <div className="mx-auto max-w-4xl text-center">
            <h2 className={titleCls}>{title}</h2>
            {sub && (
              <p className={cn("mx-auto mt-6 max-w-xl text-xl", subCls)}>{sub}</p>
            )}
          </div>
          <div className="mt-14 flex justify-center sm:mt-20">{media}</div>
        </Container>
      </section>
    );
  }

  const textCol = mediaSide === "right" ? "md:col-start-1" : "md:col-start-7";
  const mediaCol = mediaSide === "right" ? "md:col-start-7" : "md:col-start-1";

  return (
    <section className="relative border-t border-hairline py-28 sm:py-36">
      <Container>
        <div className="grid grid-cols-1 items-center gap-14 md:grid-cols-12 md:gap-10">
          <div className={cn("md:col-span-6", textCol)}>
            <h2 className={titleCls}>{title}</h2>
            {sub && (
              <p className={cn("mt-6 max-w-md text-xl", subCls)}>{sub}</p>
            )}
          </div>
          <div className={cn("flex justify-center md:col-span-6", mediaCol)}>
            {media}
          </div>
        </div>
      </Container>
    </section>
  );
}
