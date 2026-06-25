import { cn } from "@/lib/cn";

/**
 * The Marble wordmark — title case, Favorit Light. The word is the mark.
 * `withMark` prepends the small solid square (optional nav mark). Font-size
 * is inherited from the parent so the same component serves nav and footer.
 */
export function Wordmark({
  className,
  withMark = false,
  markClassName,
}: {
  className?: string;
  withMark?: boolean;
  markClassName?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center font-light leading-none tracking-[-0.02em]",
        withMark && "gap-[0.5em]",
        className,
      )}
    >
      {withMark && (
        <span
          aria-hidden
          className={cn("inline-block bg-current", markClassName ?? "size-[0.8em]")}
        />
      )}
      Marble
    </span>
  );
}
