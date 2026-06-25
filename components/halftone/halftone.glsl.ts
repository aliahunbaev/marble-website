// Fullscreen halftone shader. Renders the source photo as crisp SQUARE blocks
// whose SIZE scales with the photo's tone (capped so they never fully merge →
// clean vector grid). The cursor leaves a Browser-Company-style trail: recently
// crossed cells grow to full blocks and shrink back individually (uTrail).

export const halftoneVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    // ScreenQuad positions span clip space [-1,1]; derive 0..1 screen uv.
    vUv = position.xy * 0.5 + 0.5;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

export const TRAIL_LEN = 20;

export const halftoneFragment = /* glsl */ `
  precision highp float;

  uniform sampler2D uTexture;
  uniform vec2  uResolution;       // CSS px
  uniform vec2  uImageRes;         // texture px
  uniform vec2  uFocal;            // cover focal point 0..1
  uniform float uCell;             // CSS px
  uniform float uDotScale;         // tile fill ratio 0..1 (gap = 1 - this)
  uniform float uContrast;
  uniform float uInvert;           // 1 = bright→ink, 0 = dark→ink
  uniform vec3  uDotColor;
  uniform float uGhost;
  uniform float uDissolve;         // 0 = intact, 1 = scattered

  uniform vec2  uTrail[20];        // recent cursor cell centers (CSS px)
  uniform float uTrailDecay[20];   // their activation 0..1

  varying vec2 vUv;

  float luma(vec3 c) { return dot(c, vec3(0.299, 0.587, 0.114)); }
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

  void main() {
    vec2 fragPx = vUv * uResolution;
    vec2 cellId = floor(fragPx / uCell);
    vec2 cellCenter = (cellId + 0.5) * uCell;

    // Dissolve — each cell drops out (shrinks away) at its own random threshold,
    // so the field depopulates box-by-box as the film resolves.
    // Dissolve — each cell scatters in a hashed direction as the film resolves.
    vec2 blockCenter = cellCenter;
    float ang = hash(cellId) * 6.2831853;
    blockCenter += vec2(cos(ang), sin(ang)) * uDissolve * 90.0;

    // Tone for this cell (cover-fit sample).
    vec2 uvScreen = cellCenter / uResolution;
    float resAR = uResolution.x / uResolution.y;
    float imgAR = uImageRes.x / uImageRes.y;
    vec2 s = (imgAR > resAR) ? vec2(resAR / imgAR, 1.0) : vec2(1.0, imgAR / resAR);
    vec2 uvImg = (uvScreen - 0.5) * s + uFocal;
    float l = luma(texture2D(uTexture, uvImg).rgb);
    float v = mix(1.0 - l, l, uInvert);
    v = pow(clamp(v, 0.0, 1.0), uContrast);

    // Cursor trail — strongest activation among recent cells matching this one.
    float activation = 0.0;
    for (int i = 0; i < 20; i++) {
      vec2 dlt = abs(uTrail[i] - cellCenter);
      if (dlt.x < uCell * 0.5 && dlt.y < uCell * 0.5) {
        activation = max(activation, uTrailDecay[i]);
      }
    }

    // Size-varying square block — grows with tone, boosted to full by the trail.
    float amount = max(v, activation);
    float hs = (uCell * 0.5) * uDotScale * amount * (1.0 - uDissolve * 0.6);
    vec2 q = abs(fragPx - blockCenter);
    float dd = max(q.x, q.y);
    float aa = 0.5; // tight AA → vectorized
    float coverage = 1.0 - smoothstep(hs - aa, hs + aa, dd);
    float alpha = coverage * uGhost;
    if (alpha <= 0.001) discard;

    gl_FragColor = vec4(uDotColor, alpha);
  }
`;
