"use client";

import { useEffect } from "react";
import { ScrollTrigger } from "@/lib/gsap";

/**
 * Native scroll (smooth/inertia scrolling removed per request). Still refreshes
 * ScrollTrigger once fonts settle, since the variable-font swap shifts heights
 * and therefore pin/scrub start positions.
 */
export function ScrollProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    let done = false;
    const refresh = () => {
      if (done) return;
      done = true;
      ScrollTrigger.refresh();
    };
    document.fonts?.ready.then(refresh).catch(() => {});
    window.addEventListener("load", refresh);
    return () => window.removeEventListener("load", refresh);
  }, []);

  return <>{children}</>;
}
