import { cn } from "@/lib/cn";

/**
 * Mono small-caps label — the "log" voice. Used for eyebrows, dates,
 * captions, column headers. Favorit Mono, uppercase, tracked.
 */
export function Eyebrow({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "font-mono text-[0.6875rem] font-normal uppercase leading-none tracking-[0.16em] text-taupe",
        className,
      )}
    >
      {children}
    </span>
  );
}
