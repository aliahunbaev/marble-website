"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * One clean line — the only control in the film theater. Drag to seek
 * (pointer-capture), tracks playback via a self-contained timeupdate listener,
 * keyboard ←/→ (±5s) and space. Guards duration NaN before metadata loads.
 */
export function FilmScrubber({
  videoRef,
}: {
  videoRef: React.RefObject<HTMLVideoElement | null>;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onTime = () => {
      if (dragging.current || !v.duration) return;
      setProgress(v.currentTime / v.duration);
    };
    v.addEventListener("timeupdate", onTime);
    return () => v.removeEventListener("timeupdate", onTime);
  }, [videoRef]);

  const seekToX = useCallback(
    (clientX: number) => {
      const v = videoRef.current;
      const track = trackRef.current;
      if (!v || !track || !v.duration) return;
      const r = track.getBoundingClientRect();
      const frac = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
      v.currentTime = frac * v.duration;
      setProgress(frac);
    },
    [videoRef],
  );

  const onDown = (e: React.PointerEvent) => {
    dragging.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    seekToX(e.clientX);
  };
  const onMove = (e: React.PointerEvent) => {
    if (dragging.current) seekToX(e.clientX);
  };
  const onUp = (e: React.PointerEvent) => {
    dragging.current = false;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
  };
  const onKey = (e: React.KeyboardEvent) => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      v.currentTime = Math.max(0, v.currentTime - 5);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      v.currentTime = Math.min(v.duration, v.currentTime + 5);
    } else if (e.key === " ") {
      e.preventDefault();
      if (v.paused) v.play().catch(() => {});
      else v.pause();
    }
  };

  return (
    <div
      ref={trackRef}
      role="slider"
      tabIndex={0}
      aria-label="Seek"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress * 100)}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onKeyDown={onKey}
      className="group relative h-4 w-full cursor-pointer touch-none select-none outline-none"
    >
      <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-white/30" />
      <span
        className="absolute left-0 top-1/2 h-px -translate-y-1/2 bg-white"
        style={{ width: `${progress * 100}%` }}
      />
      <span
        className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 bg-white opacity-0 transition-opacity group-hover:opacity-100"
        style={{ left: `${progress * 100}%` }}
      />
    </div>
  );
}
