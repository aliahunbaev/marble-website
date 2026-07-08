"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { cn } from "@/lib/cn";
import { useCapability } from "@/lib/useCapability";
import { useMediaQuery } from "@/lib/useMediaQuery";
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
  /** Portrait-composed alternate source for narrow viewports (<768px) —
      landscape statues slice badly on phones. */
  srcPortrait?: string;
  /** Focal overrides while the portrait source is active. */
  portraitFocalX?: number;
  portraitFocalY?: number;
  /** Cell size override on narrow viewports — a phone has ~4× fewer columns
      than desktop, so a smaller cell keeps the figure legible (finer dots). */
  cellPortrait?: number;
}

/**
 * Public halftone surface. Renders the reactive WebGL shader when the device
 * can carry it (WebGL × fine-pointer/desktop × motion-OK); otherwise the static
 * canvas. Both fill the same absolutely-positioned box → zero layout change.
 * On narrow viewports the portrait source (if given) replaces the landscape.
 */
export function Halftone(props: HalftoneProps) {
  // Shader-/wrapper-only props are pulled out so they never reach
  // HalftoneStatic's spread; the shader path reads from `resolved` directly.
  const {
    className,
    forceStatic,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    active: _active,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    srcPortrait: _srcPortrait,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    portraitFocalX: _pfx,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    portraitFocalY: _pfy,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    cellPortrait: _cellP,
    ...rest
  } = props;
  const cap = useCapability();
  const narrow = useMediaQuery("(max-width: 767px)");

  const portraitActive = narrow && !!props.srcPortrait;
  const resolved: HalftoneProps = portraitActive
    ? {
        ...props,
        src: props.srcPortrait!,
        focalX: props.portraitFocalX ?? props.focalX,
        focalY: props.portraitFocalY ?? props.focalY,
        cell: props.cellPortrait ?? props.cell,
      }
    : props;

  const useShader =
    SHADER_ENABLED &&
    cap.ready &&
    cap.webgl &&
    !cap.reducedMotion &&
    !cap.isMobile &&
    !forceStatic;

  const staticProps: HalftoneStaticProps = {
    ...rest,
    src: resolved.src,
    focalX: resolved.focalX,
    focalY: resolved.focalY,
    cell: resolved.cell,
  };

  return (
    <div
      data-halftone-src={resolved.src}
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full",
        className,
      )}
    >
      {useShader ? (
        <Suspense fallback={<HalftoneStatic {...staticProps} />}>
          <HalftoneShader {...resolved} />
        </Suspense>
      ) : (
        <HalftoneStatic {...staticProps} />
      )}
    </div>
  );
}
