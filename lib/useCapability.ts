"use client";

import { useEffect, useState } from "react";

export interface Capability {
  ready: boolean;
  webgl: boolean;
  reducedMotion: boolean;
  isMobile: boolean;
}

/** Detects whether it's safe/worth running the GPU halftone shader. */
export function useCapability(): Capability {
  const [cap, setCap] = useState<Capability>({
    ready: false,
    webgl: false,
    reducedMotion: false,
    isMobile: true,
  });

  useEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const isMobile = coarse || window.innerWidth < 768;

    let webgl = false;
    try {
      const c = document.createElement("canvas");
      webgl = !!(
        c.getContext("webgl2") || c.getContext("webgl")
      );
    } catch {
      webgl = false;
    }

    setCap({ ready: true, webgl, reducedMotion, isMobile });
  }, []);

  return cap;
}
