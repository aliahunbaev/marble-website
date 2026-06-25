"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { inscriptionDate, quoteForDate } from "@/lib/dailyQuote";

/**
 * The site's one live interaction. Computes today's quote with the app's exact
 * logic, on the client (the user's local day), so it mirrors what their phone
 * shows. Renders a measure-locked placeholder first → no hydration mismatch,
 * no layout shift.
 *
 * `page` = large editorial display; `frame` = compact, for the phone mock.
 */
export function DailyQuote({
  variant = "page",
  className,
}: {
  variant?: "page" | "frame";
  className?: string;
}) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => setNow(new Date()), []);

  const frame = variant === "frame";

  return (
    <figure className={cn("flex flex-col", className)}>
      <figcaption
        className={cn(
          "font-mono uppercase leading-none tracking-[0.16em] text-taupe transition-opacity duration-500",
          frame ? "text-[0.5rem]" : "text-[0.6875rem]",
          now ? "opacity-100" : "opacity-0",
        )}
      >
        {now ? inscriptionDate(now) : " "}
      </figcaption>

      <blockquote
        className={cn(
          "text-balance font-light tracking-[-0.01em] text-ink",
          frame
            ? "mt-3 min-h-[8.5em] text-[0.95rem] leading-[1.32]"
            : "mt-6 min-h-[7.5em] text-[1.75rem] leading-[1.18] sm:text-[2.1rem] sm:leading-[1.16]",
        )}
      >
        <span
          className={cn(
            "transition-opacity duration-700",
            now ? "opacity-100" : "opacity-0",
          )}
        >
          {now ? quoteForDate(now) : ""}
        </span>
      </blockquote>
    </figure>
  );
}
