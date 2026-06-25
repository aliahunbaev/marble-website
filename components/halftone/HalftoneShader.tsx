"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ScreenQuad, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { halftoneFragment, halftoneVertex, TRAIL_LEN } from "./halftone.glsl";
import type { HalftoneProps } from "./Halftone";

const OFFSCREEN = new THREE.Vector2(-9999, -9999);

function HalftonePlane({
  src,
  cell = 7,
  dotScale = 0.95,
  contrast = 1,
  invert = true,
  dotColor = "#0e0a07",
  ghost = 1,
  focalX = 0.5,
  focalY = 0.42,
  trailDecay = 0.95,
  interactive = true,
  dissolveRef,
}: HalftoneProps) {
  const texture = useTexture(src);
  const { size, gl } = useThree();
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const target = useRef(OFFSCREEN.clone());
  // Browser-Company box trail: recently crossed cells with decaying activation.
  const trail = useRef<{ cx: number; cy: number; decay: number }[]>([]);
  const lastCell = useRef("");

  const uniforms = useMemo(
    () => ({
      uTexture: { value: texture },
      uResolution: { value: new THREE.Vector2(size.width, size.height) },
      uImageRes: {
        value: (() => {
          const img = texture.image as { width?: number; height?: number };
          return new THREE.Vector2(img?.width ?? 1, img?.height ?? 1);
        })(),
      },
      uFocal: { value: new THREE.Vector2(focalX, 1 - focalY) },
      uCell: { value: cell },
      uDotScale: { value: dotScale },
      uContrast: { value: contrast },
      uInvert: { value: invert ? 1 : 0 },
      uDotColor: { value: new THREE.Color(dotColor) },
      uGhost: { value: ghost },
      uTrail: {
        value: Array.from(
          { length: TRAIL_LEN },
          () => new THREE.Vector2(-9999, -9999),
        ),
      },
      uTrailDecay: { value: new Array(TRAIL_LEN).fill(0) },
      uDissolve: { value: 0 },
    }),
    // Recreated only when the texture changes; scalar knobs synced below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [texture],
  );

  // Keep scalar uniforms live when knobs change.
  useEffect(() => {
    const u = matRef.current?.uniforms;
    if (!u) return;
    u.uCell.value = cell;
    u.uDotScale.value = dotScale;
    u.uContrast.value = contrast;
    u.uInvert.value = invert ? 1 : 0;
    u.uGhost.value = ghost;
    (u.uDotColor.value as THREE.Color).set(dotColor);
    (u.uFocal.value as THREE.Vector2).set(focalX, 1 - focalY);
  }, [cell, dotScale, contrast, invert, ghost, dotColor, focalX, focalY]);

  useEffect(() => {
    const u = matRef.current?.uniforms;
    if (!u) return;
    (u.uResolution.value as THREE.Vector2).set(size.width, size.height);
  }, [size.width, size.height]);

  // Cursor tracking mapped to the canvas rect (correct at any scroll position).
  useEffect(() => {
    if (!interactive) return; // no cursor tracking → no trail
    const el = gl.domElement;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      target.current.set(e.clientX - r.left, r.height - (e.clientY - r.top));
    };
    const onLeave = () => target.current.copy(OFFSCREEN);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerout", onLeave, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerout", onLeave);
    };
  }, [gl, interactive]);

  useFrame(() => {
    const list = trail.current;
    for (let i = 0; i < list.length; i++) list[i].decay *= trailDecay;

    // Push the cursor's current cell when it changes → a fading trail of cells.
    const t = target.current;
    if (t.x > -9000) {
      const gx = Math.floor(t.x / cell);
      const gy = Math.floor(t.y / cell);
      const key = `${gx},${gy}`;
      if (key !== lastCell.current) {
        lastCell.current = key;
        list.unshift({ cx: (gx + 0.5) * cell, cy: (gy + 0.5) * cell, decay: 1 });
        if (list.length > TRAIL_LEN) list.length = TRAIL_LEN;
      }
    }

    const uTrail = uniforms.uTrail.value as THREE.Vector2[];
    const uDecay = uniforms.uTrailDecay.value as number[];
    for (let i = 0; i < TRAIL_LEN; i++) {
      const e = list[i];
      if (e) {
        uTrail[i].set(e.cx, e.cy);
        uDecay[i] = e.decay;
      } else {
        uTrail[i].set(-9999, -9999);
        uDecay[i] = 0;
      }
    }
    uniforms.uDissolve.value = dissolveRef?.current ?? 0;
  });

  return (
    <ScreenQuad>
      <shaderMaterial
        ref={matRef}
        vertexShader={halftoneVertex}
        fragmentShader={halftoneFragment}
        uniforms={uniforms}
        transparent
        depthTest={false}
        depthWrite={false}
      />
    </ScreenQuad>
  );
}

export function HalftoneShader(props: HalftoneProps) {
  // Always render so the cursor trail keeps animating. (Single hero shader →
  // negligible cost; the demand/visibility toggle was unreliable on the pinned
  // hero layout and could freeze the loop.)
  return (
    <div className="absolute inset-0 h-full w-full">
      <Canvas
        flat
        frameloop="always"
        dpr={[1, 2]}
        gl={{ alpha: true, antialias: true, premultipliedAlpha: false }}
        style={{ width: "100%", height: "100%" }}
      >
        <HalftonePlane {...props} />
      </Canvas>
    </div>
  );
}
