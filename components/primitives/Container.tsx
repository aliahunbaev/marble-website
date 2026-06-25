import { cn } from "@/lib/cn";

/** Page container — consistent editorial margins; everything aligns to it. */
export function Container({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-[1680px] px-5 sm:px-7 lg:px-10", className)}>
      {children}
    </div>
  );
}
