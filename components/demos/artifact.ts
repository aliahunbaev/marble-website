import type { CSSProperties } from "react";

/**
 * The demos render in the APP'S material language — glass, rounded corners,
 * its type scale — as "artifacts of the app" sitting on the sharp matte
 * editorial page. Site chrome keeps its zero-radius rule; these do not.
 * Radii must be inline styles: globals.css zeroes border-radius on *.
 */
export const artifactCard: CSSProperties = {
  borderRadius: 18,
  background: "color-mix(in srgb, var(--card) 82%, transparent)",
  backdropFilter: "blur(14px) saturate(1.15)",
  WebkitBackdropFilter: "blur(14px) saturate(1.15)",
  border: "1px solid color-mix(in srgb, var(--ink) 8%, transparent)",
  boxShadow: "0 28px 70px -42px color-mix(in srgb, var(--ink) 50%, transparent)",
};

/** Small interior surfaces (inputs, checkboxes) — the app's 6% ink tint. */
export const artifactField: CSSProperties = {
  borderRadius: 8,
  background: "color-mix(in srgb, var(--ink) 6%, transparent)",
};
