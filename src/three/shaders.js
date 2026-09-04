/* ============================================================
   GLSL library for the Spider-Verse world.
   Kept separate from the scene graph so each program is readable
   and can be tuned without touching object construction.
   ============================================================ */

/** Cheap hash + fbm shared by several programs. */
const NOISE = /* glsl */ `
  float hash21(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }
  float noise21(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash21(i), hash21(i + vec2(1.0, 0.0)), u.x),
      mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 5; i++) {
      v += a * noise21(p);
      p *= 2.02;
      a *= 0.5;
    }
    return v;
  }
`;

/* ------------------------------------------------------------
   CITY — instanced towers with procedural lit windows.
   Windows only appear on vertical faces; a slow hash-driven
   flicker keeps the skyline alive without any texture fetch.
   ------------------------------------------------------------ */
export const CITY_VERT = /* glsl */ `
  attribute float aSeed;
  attribute vec3 aTint;

  varying vec2 vUv;
  varying vec3 vTint;
  varying float vSeed;
  varying vec3 vWorld;
  varying vec3 vNrm;
  varying float vHeight;

  void main() {
    vUv = uv;
    vTint = aTint;
    vSeed = aSeed;

    vec4 local = instanceMatrix * vec4(position, 1.0);
    vec4 world = modelMatrix * local;
    vWorld = world.xyz;
    vNrm = normalize(mat3(instanceMatrix) * normal);
    vHeight = local.y;

    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

export const CITY_FRAG = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform vec3 uFogColor;
  uniform float uFogNear;
  uniform float uFogFar;
  uniform float uLights;

  varying vec2 vUv;
  varying vec3 vTint;
  varying float vSeed;
  varying vec3 vWorld;
  varying vec3 vNrm;
  varying float vHeight;

  ${NOISE}

  void main() {
    // Facade base — near black concrete with a faint vertical gradient
    vec3 col = mix(vec3(0.010, 0.011, 0.020), vec3(0.026, 0.028, 0.045), vUv.y);

    // Vertical faces only (roofs stay dark)
    float side = smoothstep(0.35, 0.05, abs(vNrm.y));

    // Window grid
    vec2 grid = vUv * vec2(7.0, 20.0);
    vec2 cell = floor(grid);
    vec2 f = fract(grid);
    float pane =
      step(0.18, f.x) * step(f.x, 0.82) *
      step(0.22, f.y) * step(f.y, 0.78);

    float lit = step(0.52, hash21(cell + vSeed * 17.3));
    // A handful of windows blink on a slow clock
    float blink = step(0.975, hash21(cell + floor(uTime * 0.6) + vSeed * 3.1));
    lit *= 1.0 - blink;

    vec3 warm = mix(
      vec3(1.00, 0.68, 0.30),
      vec3(0.42, 0.66, 1.00),
      hash21(cell + vSeed * 7.7)
    );

    // Distance fade on the grid itself. A 7x20 window grid on a far tower
    // lands under a pixel and aliases into stripes, so let it dissolve
    // into a soft glow long before it gets there.
    float d = length(cameraPosition - vWorld);
    float crisp = smoothstep(300.0, 90.0, d);
    float glow = smoothstep(340.0, 40.0, d);

    col += warm * pane * lit * side * uLights * 1.25 * crisp;
    col += warm * lit * side * uLights * 0.055 * glow;

    // Fresnel rim in the chapter accent — the "comic ink" edge
    vec3 V = normalize(cameraPosition - vWorld);
    float fres = pow(1.0 - max(dot(normalize(vNrm), V), 0.0), 3.2);
    col += vTint * fres * 0.45;

    // Ground haze creeping up the lower floors
    float haze = smoothstep(26.0, 0.0, vHeight);
    col = mix(col, uFogColor * 1.4, haze * 0.35);

    // Distance fog
    col = mix(col, uFogColor, smoothstep(uFogNear, uFogFar, d));

    gl_FragColor = vec4(col, 1.0);
  }
`;

/* ------------------------------------------------------------
   WEB — glowing line geometry with a pulse travelling outward.
   ------------------------------------------------------------ */
export const WEB_VERT = /* glsl */ `
  attribute float aT;     // 0..1 along the strand
  attribute float aRing;  // ring index, drives the pulse offset

  uniform float uTime;
  uniform float uSway;

  varying float vT;
  varying float vRing;
  varying vec3 vWorld;

  void main() {
    vT = aT;
    vRing = aRing;

    vec3 p = position;
    // Silk breathes: a slow sine along the strand
    float s = sin(uTime * 0.6 + aRing * 1.7 + p.x * 0.05) * uSway;
    p.z += s;
    p.y += cos(uTime * 0.45 + aRing * 2.1) * uSway * 0.5;

    vec4 world = modelMatrix * vec4(p, 1.0);
    vWorld = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

export const WEB_FRAG = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform vec3 uColor;
  uniform vec3 uColor2;
  uniform float uOpacity;
  uniform vec3 uFogColor;
  uniform float uFogFar;

  varying float vT;
  varying float vRing;
  varying vec3 vWorld;

  void main() {
    // A bead of light runs along each strand
    float phase = fract(uTime * 0.18 + vRing * 0.11);
    float pulse = smoothstep(0.10, 0.0, abs(vT - phase));

    vec3 col = mix(uColor, uColor2, vT);
    col += vec3(1.0) * pulse * 0.45;

    float a = uOpacity * (0.30 + pulse * 0.55);

    // Fade the far end of the web into the fog
    float d = length(cameraPosition - vWorld);
    a *= 1.0 - smoothstep(uFogFar * 0.45, uFogFar, d);

    gl_FragColor = vec4(col, a);
  }
`;

/* ------------------------------------------------------------
   MOTES — additive drifting dust / drizzle.
   ------------------------------------------------------------ */
export const MOTE_VERT = /* glsl */ `
  attribute float aSize;
  attribute float aSeed;
  attribute vec3 aTint;

  uniform float uTime;
  uniform float uPixelRatio;

  varying float vAlpha;
  varying vec3 vTint;

  void main() {
    vTint = aTint;

    vec3 p = position;
    p.y = mod(p.y - uTime * (2.0 + aSeed * 5.0), 220.0) - 40.0;
    p.x += sin(uTime * 0.35 + aSeed * 12.0) * 3.0;
    p.z += cos(uTime * 0.28 + aSeed * 8.0) * 3.0;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float dist = -mv.z;

    // Fade in the distance AND fade out very close, so nothing smears
    // across the lens as the camera flies past it.
    vAlpha = smoothstep(340.0, 60.0, dist)
           * smoothstep(6.0, 26.0, dist)
           * (0.18 + aSeed * 0.34);

    gl_PointSize = min(aSize * uPixelRatio * (150.0 / max(dist, 1.0)), 7.0 * uPixelRatio);
    gl_Position = projectionMatrix * mv;
  }
`;

export const MOTE_FRAG = /* glsl */ `
  precision mediump float;

  varying float vAlpha;
  varying vec3 vTint;

  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    if (d > 0.5) discard;
    float a = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(vTint, a * a * vAlpha);
  }
`;

/* ------------------------------------------------------------
   PORTAL — a dimensional rift disc for the Multiverse chapter.
   ------------------------------------------------------------ */
export const PORTAL_VERT = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vWorld;
  void main() {
    vUv = uv;
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorld = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

export const PORTAL_FRAG = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform float uOpacity;

  varying vec2 vUv;
  varying vec3 vWorld;

  ${NOISE}

  void main() {
    vec2 p = vUv - 0.5;
    float r = length(p) * 2.0;
    float ang = atan(p.y, p.x);

    // Swirl the noise field around the centre
    float swirl = ang + uTime * 0.35 - r * 3.4;
    float n = fbm(vec2(cos(swirl), sin(swirl)) * 2.6 + r * 4.0 - uTime * 0.25);

    // Ring: bright at the rim, hollow in the middle
    float ring = smoothstep(0.42, 0.72, r) * smoothstep(1.02, 0.80, r);
    float core = smoothstep(0.85, 0.20, r) * 0.30;

    vec3 col = mix(uColorA, uColorB, n);
    float a = (ring * (0.55 + n * 0.9) + core * n) * uOpacity;

    // Torn edges
    a *= smoothstep(0.12, 0.55, n + 0.25);

    gl_FragColor = vec4(col * (0.8 + n), a);
  }
`;

/* ------------------------------------------------------------
   CHROME — dark lacquer with a coloured fresnel rim.
   Used for the spider itself; no lights or env map needed.
   ------------------------------------------------------------ */
export const CHROME_VERT = /* glsl */ `
  varying vec3 vNrm;
  varying vec3 vWorld;
  varying vec3 vPos;
  void main() {
    vNrm = normalize(mat3(modelMatrix) * normal);
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorld = world.xyz;
    vPos = position;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

export const CHROME_FRAG = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform vec3 uRim;
  uniform vec3 uBase;
  uniform float uGloss;

  varying vec3 vNrm;
  varying vec3 vWorld;
  varying vec3 vPos;

  void main() {
    vec3 N = normalize(vNrm);
    vec3 V = normalize(cameraPosition - vWorld);

    // Two fixed key lights keep the silhouette readable from any angle
    vec3 L1 = normalize(vec3(-0.5, 0.85, 0.4));
    vec3 L2 = normalize(vec3(0.7, -0.2, 0.6));

    float d1 = max(dot(N, L1), 0.0);
    float d2 = max(dot(N, L2), 0.0);

    float s1 = pow(max(dot(reflect(-L1, N), V), 0.0), 48.0);
    float s2 = pow(max(dot(reflect(-L2, N), V), 0.0), 22.0);

    float fres = pow(1.0 - max(dot(N, V), 0.0), 2.6);

    vec3 col = uBase * (0.10 + d1 * 0.30 + d2 * 0.14);
    col += vec3(1.0) * s1 * uGloss;
    col += uRim * s2 * uGloss * 0.6;
    col += uRim * fres * 1.35;

    gl_FragColor = vec4(col, 1.0);
  }
`;

/* ------------------------------------------------------------
   SHAFT — additive volumetric light plane.
   ------------------------------------------------------------ */
export const SHAFT_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const SHAFT_FRAG = /* glsl */ `
  precision mediump float;

  uniform float uTime;
  uniform vec3 uColor;
  uniform float uOpacity;
  uniform float uSeed;

  varying vec2 vUv;

  ${NOISE}

  void main() {
    // Soft horizontal falloff, fades out toward the bottom
    float x = smoothstep(0.0, 0.42, vUv.x) * smoothstep(1.0, 0.58, vUv.x);
    float y = smoothstep(0.0, 0.30, vUv.y) * smoothstep(1.0, 0.12, 1.0 - vUv.y);
    float n = fbm(vec2(vUv.x * 3.0, vUv.y * 1.6 - uTime * 0.06) + uSeed);
    float a = x * y * (0.45 + n * 0.75) * uOpacity;
    gl_FragColor = vec4(uColor, a);
  }
`;

/* ------------------------------------------------------------
   SPIDER-VERSE COMPOSITE PASS
   Radial chromatic aberration driven by scroll velocity,
   rotated Ben-Day halftone weighted into the shadows,
   dimension-tear glitch, scanlines, grain and vignette.
   ------------------------------------------------------------ */
export const SPIDERVERSE_PASS = {
  uniforms: {
    tDiffuse: { value: null },
    uTime: { value: 0 },
    uVel: { value: 0 },
    uGlitch: { value: 0 },
    uHalftone: { value: 0.85 },
    uAberration: { value: 0.5 },
    uVignette: { value: 0.55 },
    uGrain: { value: 0.05 },
    uRes: { value: [1, 1] },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    precision highp float;

    uniform sampler2D tDiffuse;
    uniform float uTime;
    uniform float uVel;
    uniform float uGlitch;
    uniform float uHalftone;
    uniform float uAberration;
    uniform float uVignette;
    uniform float uGrain;
    uniform vec2 uRes;

    varying vec2 vUv;

    float hash21(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }

    void main() {
      vec2 uv = vUv;
      vec2 c = uv - 0.5;
      float r = length(c);

      // --- dimension tear: a few horizontal bands slip sideways
      float band = floor(uv.y * 26.0);
      float g = hash21(vec2(band, floor(uTime * 14.0)));
      float torn = step(0.90, g) * (g - 0.90) * 10.0 * uGlitch;
      uv.x += torn * (hash21(vec2(band, 7.0)) - 0.5) * 0.35;

      // --- radial chromatic aberration, amplified by scroll speed
      float amt = (uAberration + abs(uVel) * 0.035) * (0.35 + r * 1.9) * 0.0065;
      vec3 col;
      col.r = texture2D(tDiffuse, uv + c * amt).r;
      col.g = texture2D(tDiffuse, uv).g;
      col.b = texture2D(tDiffuse, uv - c * amt).b;

      // --- Ben-Day dots, rotated 45deg, printed into the shadows
      const float A = 0.7853981634;
      mat2 R = mat2(cos(A), -sin(A), sin(A), cos(A));
      vec2 dp = R * (uv * uRes / 4.2);
      float dotd = length(fract(dp) - 0.5);
      float dots = smoothstep(0.48, 0.16, dotd);
      float lum = dot(col, vec3(0.299, 0.587, 0.114));
      float shadowMask = smoothstep(0.52, 0.02, lum);
      col += vec3(0.075, 0.020, 0.038) * dots * shadowMask * uHalftone;

      // --- CRT scanline
      col *= 1.0 - 0.030 * step(0.5, fract(uv.y * uRes.y * 0.5));

      // --- film grain
      col += (hash21(uv * uRes + uTime * 60.0) - 0.5) * uGrain;

      // --- vignette
      col *= 1.0 - uVignette * smoothstep(0.34, 1.0, r);

      gl_FragColor = vec4(col, 1.0);
    }
  `,
};
