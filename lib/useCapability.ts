"use client";

import { useSyncExternalStore } from "react";

export interface Capability {
  ready: boolean;
  webgl: boolean;
  reducedMotion: boolean;
  isMobile: boolean;
}

const SERVER_CAP: Capability = {
  ready: false,
  webgl: false,
  reducedMotion: false,
  isMobile: true,
};

// Detected once per page load; capabilities don't meaningfully change
// mid-session, so the store never notifies.
let cached: Capability | null = null;

function detect(): Capability {
  if (cached) return cached;

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const isMobile = coarse || window.innerWidth < 768;

  let webgl = false;
  try {
    const c = document.createElement("canvas");
    webgl = !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    webgl = false;
  }

  cached = { ready: true, webgl, reducedMotion, isMobile };
  return cached;
}

const subscribe = () => () => {};

/** Detects whether it's safe/worth running the GPU halftone shader.
    Server (and first hydration pass) report not-ready; the client snapshot
    takes over after hydration — no setState-in-effect, no mismatch. */
export function useCapability(): Capability {
  return useSyncExternalStore(subscribe, detect, () => SERVER_CAP);
}
