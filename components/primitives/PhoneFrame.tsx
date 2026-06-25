import { cn } from "@/lib/cn";

/**
 * A sharp-cornered rectangle at phone aspect ratio (no rounded chrome — sharp
 * edges are the brand). Holds either a live app mock or a screenshot
 * placeholder. Real captures drop in later.
 */
export function PhoneFrame({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "relative mx-auto aspect-[9/19.5] w-full max-w-[330px] overflow-hidden border border-hairline bg-card shadow-[0_30px_80px_-40px_rgba(14,10,7,0.45)]",
        className,
      )}
    >
      {children}
    </div>
  );
}
