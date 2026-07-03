"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { cn } from "@/lib/cn";
import { useCapability } from "@/lib/useCapability";
import { HalftoneStatic, type HalftoneStaticProps } from "./HalftoneStatic";

const SHADER_ENABLED = true;

// three/r3f live only in this lazily-loaded chunk — never on the server or in
// the initial bundle. Until it loads (or on mobile/reduced-motion), the static
// canvas fills the exact same box.
const HalftoneShader = dynamic(
  () => import("./HalftoneShader").then((m) => m.HalftoneShader),
  { ssr: false },
);

export interface HalftoneProps extends HalftoneStaticProps {
  /** Trail-box fade per frame, 0..1 (shader only). Lower = shorter trail. */
  trailDecay?: number;
  forceStatic?: boolean;
  /** Cursor-reactivity (shader only). Default true. */
  interactive?: boolean;
  /** Scroll-driven scatter 0..1 (shader only); static path ignores it. */
  dissolveRef?: { current: number };
  /** Render loop gate (shader only): false parks the WebGL loop entirely —
      set by the owner when the halftone has scrolled out of view. */
  active?: boolean;
}

/**
 * Public halftone surface. Renders the reactive WebGL shader when the device
 * can carry it (WebGL × fine-pointer/desktop × motion-OK); otherwise the static
 * canvas. Both fill the same absolutely-positioned box → zero layout change.
 */
export function Halftone(props: HalftoneProps) {
  // `active` is pulled out so it never reaches HalftoneStatic's DOM spread;
  // the shader path reads it from `props` directly.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { className, forceStatic, active: _active, ...rest } = props;
  const cap = useCapability();

  const useShader =
    SHADER_ENABLED &&
    cap.ready &&
    cap.webgl &&
    !cap.reducedMotion &&
    !cap.isMobile &&
    !forceStatic;

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full",
        className,
      )}
    >
      {useShader ? (
        <Suspense fallback={<HalftoneStatic {...rest} />}>
          <HalftoneShader {...props} />
        </Suspense>
      ) : (
        <HalftoneStatic {...rest} />
      )}
    </div>
  );
}
