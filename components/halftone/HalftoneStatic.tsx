"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";

export interface HalftoneStaticProps {
  /** A NORMAL continuous-tone photo. The dot-screen is computed from its grays. */
  src: string;
  /** Grid cell size in CSS px (smaller = denser). */
  cell?: number;
  /** Max block fill at full tone, 0..1 (gap = 1 − this). */
  dotScale?: number;
  /** Gamma applied to the value curve (>1 sharpens the figure out of the field). */
  contrast?: number;
  /** true: bright source → dot (figure-on-black); false: dark source → dot. */
  invert?: boolean;
  /** Dot fill color (hex). */
  dotColor?: string;
  /** Global alpha (footer ghost ≈ 0.12). */
  ghost?: number;
  /** Cover-crop focal point, 0..1. */
  focalX?: number;
  focalY?: number;
  className?: string;
}

/**
 * Runtime halftone: downsamples the source into a one-pixel-per-cell grid, then
 * paints one square block per cell whose SIZE = the cell's tone. Redraws on
 * resize. Static (no loop) → cheap, reduced-motion-safe.
 */
export function HalftoneStatic({
  src,
  cell = 7,
  dotScale = 0.82,
  contrast = 1,
  invert = true,
  dotColor = "#0e0a07",
  ghost = 1,
  focalX = 0.5,
  focalY = 0.42,
  className,
}: HalftoneStaticProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let cancelled = false;
    let raf = 0;
    const image = new Image();
    image.decoding = "async";

    const draw = () => {
      const wrap = wrapRef.current;
      const canvas = canvasRef.current;
      if (!wrap || !canvas || !image.naturalWidth) return;

      const cw = wrap.clientWidth;
      const ch = wrap.clientHeight;
      if (cw === 0 || ch === 0) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(cw * dpr);
      canvas.height = Math.round(ch * dpr);
      canvas.style.width = `${cw}px`;
      canvas.style.height = `${ch}px`;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cw, ch);

      const cols = Math.max(1, Math.ceil(cw / cell));
      const rows = Math.max(1, Math.ceil(ch / cell));

      // Sample the cover-cropped image into a tiny grid (browser averages each cell).
      const off = document.createElement("canvas");
      off.width = cols;
      off.height = rows;
      const octx = off.getContext("2d", { willReadFrequently: true });
      if (!octx) return;

      const iw = image.naturalWidth;
      const ih = image.naturalHeight;
      const targetAR = cols / rows;
      const imgAR = iw / ih;
      let sx: number, sy: number, sw: number, sh: number;
      if (imgAR > targetAR) {
        sh = ih;
        sw = ih * targetAR;
        sx = (iw - sw) * focalX;
        sy = 0;
      } else {
        sw = iw;
        sh = iw / targetAR;
        sx = 0;
        sy = (ih - sh) * focalY;
      }
      octx.drawImage(image, sx, sy, sw, sh, 0, 0, cols, rows);
      const data = octx.getImageData(0, 0, cols, rows).data;

      ctx.fillStyle = dotColor;
      ctx.globalAlpha = ghost;
      const maxHalf = (cell / 2) * dotScale; // block half-size at full tone
      for (let gy = 0; gy < rows; gy++) {
        for (let gx = 0; gx < cols; gx++) {
          const i = (gy * cols + gx) * 4;
          if (data[i + 3] < 128) continue; // transparent source → no dot
          const lum =
            (0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]) / 255;
          let v = invert ? lum : 1 - lum;
          if (contrast !== 1) v = Math.pow(v, contrast);
          const r = maxHalf * v;
          if (r < 0.35) continue;
          // Size-varying square block (marble/brick) — crisp, vectorized.
          ctx.fillRect((gx + 0.5) * cell - r, (gy + 0.5) * cell - r, r * 2, r * 2);
        }
      }
      ctx.globalAlpha = 1;
    };

    const scheduleDraw = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(draw);
    };

    image.onload = () => {
      if (!cancelled) scheduleDraw();
    };
    image.src = src;
    if (image.complete && image.naturalWidth) scheduleDraw();

    const ro = new ResizeObserver(scheduleDraw);
    if (wrapRef.current) ro.observe(wrapRef.current);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [src, cell, dotScale, contrast, invert, dotColor, ghost, focalX, focalY]);

  return (
    <div
      ref={wrapRef}
      aria-hidden
      className={cn("absolute inset-0 h-full w-full overflow-hidden", className)}
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
