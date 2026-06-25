import { cn } from "@/lib/cn";
import { Container } from "@/components/primitives/Container";

/**
 * One showcase block: a primary heading (ink) with a same-size grayed secondary
 * line directly under it, then a website-proportioned media area below. The media
 * is a placeholder for now — real gifs / screen recordings / a small interactive
 * "complete a set" demo drop into these later.
 */
function ShowcaseBlock({
  title,
  sub,
  ratio,
  align = "left",
  label,
}: {
  title: string;
  sub: string;
  ratio: string;
  align?: "left" | "center";
  label?: string;
}) {
  const typeCls =
    "text-[clamp(1.5rem,2.4vw,2rem)] font-light leading-snug tracking-tight";
  return (
    <section className="border-t border-hairline py-16 sm:py-24">
      <Container>
        <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center")}>
          <h2 className={cn(typeCls, "text-ink")}>{title}</h2>
          <p className={cn(typeCls, "text-taupe")}>{sub}</p>
        </div>
        {/* Website-ratio media placeholder (assets drop in later). */}
        <div
          aria-hidden
          className={cn(
            "mx-auto mt-10 flex w-full max-w-5xl items-center justify-center border border-hairline bg-field sm:mt-14",
            ratio,
          )}
        >
          <span className="font-mono text-[0.625rem] uppercase tracking-[0.18em] text-taupe/50">
            {label ?? "placeholder"}
          </span>
        </div>
      </Container>
    </section>
  );
}

export function Features() {
  return (
    <>
      <ShowcaseBlock
        align="center"
        title="Grounded in philosophy."
        sub="Marble's design is rooted in focus and a harmony of mental and physical strength."
        ratio="aspect-[16/10]"
        label="Screen recording"
      />
      <ShowcaseBlock
        title="A line a day."
        sub="Open with a daily passage, not a streak counter."
        ratio="aspect-[3/2]"
        label="Daily reading"
      />
      <ShowcaseBlock
        title="Log it live."
        sub="Templates, live sets, and your last numbers as you go."
        ratio="aspect-[16/9]"
        label="Interactive — complete a set"
      />
      <ShowcaseBlock
        title="A record worth keeping."
        sub="Each session becomes an entry — a title, a photo, a note."
        ratio="aspect-[16/10]"
        label="Saved entry"
      />
      <ShowcaseBlock
        align="center"
        title="Iron sharpens iron."
        sub="Support and compete with fellow athletes."
        ratio="aspect-[3/2]"
        label="Community"
      />
    </>
  );
}
