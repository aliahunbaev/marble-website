"use client";

import { useSyncExternalStore } from "react";

/**
 * Reactive media query — hydration-safe (server snapshot = false) and free of
 * setState-in-effect. Use for VIEWPORT decisions (e.g. portrait art on narrow
 * screens); use `useCapability` for device decisions (pointer, WebGL).
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}
