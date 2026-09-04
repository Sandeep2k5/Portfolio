/* ============================================================
   SpiderVerse — the persistent WebGL world behind the whole site.

   One scene, one camera, one continuous flight. Scroll drives the
   camera along a Catmull-Rom path through a city canyon; each DOM
   chapter corresponds to a keyframe on that path, so the page and
   the 3D world are literally the same journey.

   Public API (called from React):
     .mount(canvas)      · .setProgress(0..1)
     .setPointer(x, y)   · .setVelocity(v)
     .setChapter(i)      · .pulse()
     .dispose()
   ============================================================ */

import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";

import {
  CITY_VERT,
  CITY_FRAG,
  WEB_VERT,
  WEB_FRAG,
  MOTE_VERT,
  MOTE_FRAG,
  PORTAL_VERT,
  PORTAL_FRAG,
  CHROME_VERT,
  CHROME_FRAG,
  SHAFT_VERT,
  SHAFT_FRAG,
  SPIDERVERSE_PASS,
} from "./shaders.js";

/* ---------------- chapter keyframes ----------------
   Position + look-at for each DOM section, in world units.
   The camera starts at the mouth of the canyon and finishes
   rising above the skyline at the contact section.            */
export const CHAPTERS = [
  { pos: [0, 26, 132], look: [0, 30, 30], accent: 0xff3b4a },
  { pos: [-34, 24, 46], look: [8, 26, -40], accent: 0x4d86ff },
  { pos: [28, 40, -34], look: [-10, 30, -104], accent: 0x34e7f2 },
  { pos: [0, 20, -112], look: [0, 18, -182], accent: 0xff2a6d },
  { pos: [-26, 46, -188], look: [10, 34, -250], accent: 0xffd54a },
  { pos: [0, 72, -258], look: [0, 38, -344], accent: 0xff3b4a },
];

const FOG_COLOR = new THREE.Color(0x07070e);

const lerp = (a, b, t) => a + (b - a) * t;
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);

/** Frame-rate independent exponential smoothing. */
const damp = (current, target, lambda, dt) =>
  lerp(current, target, 1 - Math.exp(-lambda * dt));

/* ------------------------------------------------------------
   Procedural spider-web geometry: radial spokes + sagging
   chords, bulged toward the viewer so it reads as a 3D dome.
   ------------------------------------------------------------ */
function webGeometry({ rings = 9, spokes = 16, radius = 60, bulge = 16 }) {
  const pos = [];
  const aT = [];
  const aRing = [];

  const point = (ri, si) => {
    const r = radius * Math.pow(ri / rings, 1.14);
    const a = (si / spokes) * Math.PI * 2;
    const z = bulge * Math.cos((r / radius) * Math.PI * 0.5);
    return new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, z);
  };

  // Spokes — centre out to the rim
  for (let si = 0; si < spokes; si++) {
    for (let ri = 0; ri < rings; ri++) {
      const a = point(ri, si);
      const b = point(ri + 1, si);
      pos.push(a.x, a.y, a.z, b.x, b.y, b.z);
      const t0 = ri / rings;
      const t1 = (ri + 1) / rings;
      aT.push(t0, t1);
      aRing.push(si, si);
    }
  }

  // Chords — each span sags slightly toward the centre
  const SUB = 7;
  for (let ri = 1; ri <= rings; ri++) {
    for (let si = 0; si < spokes; si++) {
      const p1 = point(ri, si);
      const p2 = point(ri, si + 1);
      let prev = null;
      for (let s = 0; s <= SUB; s++) {
        const t = s / SUB;
        const v = p1.clone().lerp(p2, t);
        const sag = 1 - 0.075 * Math.sin(Math.PI * t);
        v.x *= sag;
        v.y *= sag;
        if (prev) {
          pos.push(prev.x, prev.y, prev.z, v.x, v.y, v.z);
          aT.push(ri / rings, ri / rings);
          aRing.push(si, si);
        }
        prev = v;
      }
    }
  }

  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("aT", new THREE.Float32BufferAttribute(aT, 1));
  g.setAttribute("aRing", new THREE.Float32BufferAttribute(aRing, 1));
  return g;
}

/** Long silk strands hanging between the towers. */
function strandGeometry(count, spread, height) {
  const pos = [];
  const aT = [];
  const aRing = [];
  const SEG = 22;

  for (let i = 0; i < count; i++) {
    // Bias away from x=0: the camera flies down the middle and a strand
    // crossing the lens reads as a white streak, not as silk.
    const side = Math.random() < 0.5 ? -1 : 1;
    const x = side * (44 + Math.random() * (spread * 0.5 - 44));
    const z = 30 - Math.random() * 420;
    const top = height * (0.6 + Math.random() * 0.4);
    const drop = top * (0.5 + Math.random() * 0.5);
    const drift = (Math.random() - 0.5) * 26;

    let prev = null;
    for (let s = 0; s <= SEG; s++) {
      const t = s / SEG;
      // catenary-ish sag
      const y = top - drop * t;
      const v = new THREE.Vector3(
        x + drift * t * t,
        y,
        z + Math.sin(t * 2.4) * 4
      );
      if (prev) {
        pos.push(prev.x, prev.y, prev.z, v.x, v.y, v.z);
        aT.push((s - 1) / SEG, t);
        aRing.push(i, i);
      }
      prev = v;
    }
  }

  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("aT", new THREE.Float32BufferAttribute(aT, 1));
  g.setAttribute("aRing", new THREE.Float32BufferAttribute(aRing, 1));
  return g;
}

export default class SpiderVerse {
  constructor(opts = {}) {
    this.reducedMotion = !!opts.reducedMotion;
    this.quality = opts.quality || "high";

    this.progress = 0;
    this.targetProgress = 0;
    this.velocity = 0;
    this.pointer = { x: 0, y: 0 };
    this.smoothPointer = { x: 0, y: 0 };
    this.glitch = 0;
    this.chapter = 0;

    this.running = false;
    this.disposed = false;
    this._raf = null;
    this._clock = new THREE.Clock();
    this._disposables = [];
    this._materials = [];

    this._onResize = this._onResize.bind(this);
    this._onVisibility = this._onVisibility.bind(this);
    this._tick = this._tick.bind(this);
  }

  /* ============================ mount ============================ */
  mount(canvas) {
    if (!canvas) return false;
    this.canvas = canvas;

    try {
      this.renderer = new THREE.WebGLRenderer({
        canvas,
        // Every frame is composited through EffectComposer's own targets,
        // so MSAA on the default framebuffer is paid for and never used.
        antialias: false,
        alpha: false,
        powerPreference: "high-performance",
        stencil: false,
        depth: true,
      });
    } catch (err) {
      // No WebGL — the CSS layer alone still presents the full site.
      return false;
    }

    const maxDpr = this.quality === "low" ? 1.25 : 1.75;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxDpr));
    this.renderer.setSize(window.innerWidth, window.innerHeight, false);
    this.renderer.setClearColor(0x05050a, 1);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.92;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(FOG_COLOR, 50, 340);

    this.camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.5,
      900
    );
    this.camera.position.set(...CHAPTERS[0].pos);

    this._buildPaths();
    this._buildCity();
    this._buildWebs();
    this._buildSpider();
    this._buildPortals();
    this._buildShafts();
    this._buildMotes();
    this._buildComposer();

    window.addEventListener("resize", this._onResize, { passive: true });
    document.addEventListener("visibilitychange", this._onVisibility);

    this._onResize();

    // Compose exactly one frame so the caller has something on screen,
    // then idle. The render loop is expensive enough to starve the boot
    // sequence of frames, so World only starts it once the curtain is up.
    this._applyCamera(0);
    this._render(0);
    canvas.classList.add("is-live");
    return true;
  }

  /* ========================= camera paths ========================= */
  _buildPaths() {
    this.camPath = new THREE.CatmullRomCurve3(
      CHAPTERS.map((c) => new THREE.Vector3(...c.pos)),
      false,
      "catmullrom",
      0.4
    );
    this.lookPath = new THREE.CatmullRomCurve3(
      CHAPTERS.map((c) => new THREE.Vector3(...c.look)),
      false,
      "catmullrom",
      0.4
    );
    this.accents = CHAPTERS.map((c) => new THREE.Color(c.accent));
    this._camPos = new THREE.Vector3();
    this._lookAt = new THREE.Vector3();
    this._accent = new THREE.Color(CHAPTERS[0].accent);
  }

  /* ============================= city ============================= */
  _buildCity() {
    const COUNT =
      this.quality === "low" ? 130 : this.quality === "mid" ? 210 : 300;

    const geo = new THREE.BoxGeometry(1, 1, 1);
    const mat = new THREE.ShaderMaterial({
      vertexShader: CITY_VERT,
      fragmentShader: CITY_FRAG,
      uniforms: {
        uTime: { value: 0 },
        uFogColor: { value: FOG_COLOR.clone() },
        uFogNear: { value: 60 },
        uFogFar: { value: 360 },
        uLights: { value: 1 },
      },
    });
    this._materials.push(mat);

    const mesh = new THREE.InstancedMesh(geo, mat, COUNT);
    mesh.frustumCulled = false;

    const seeds = new Float32Array(COUNT);
    const tints = new Float32Array(COUNT * 3);
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const s = new THREE.Vector3();
    const p = new THREE.Vector3();
    const tint = new THREE.Color();

    for (let i = 0; i < COUNT; i++) {
      const side = Math.random() < 0.5 ? -1 : 1;
      // A wide clear corridor: with towers close to the centre line the
      // camera flies face-first into a wall of window grid.
      const lane = 78 + Math.pow(Math.random(), 0.7) * 190;
      const z = 64 - Math.random() * 500;

      const w = 8 + Math.random() * 18;
      const d = 8 + Math.random() * 18;
      // Towers nearest the corridor are tallest — a canyon, not a field
      const near = 1 - clamp01((lane - 78) / 190);
      const h = 20 + Math.random() * 55 + near * 80;

      p.set(side * lane, h / 2, z);
      s.set(w, h, d);
      q.setFromAxisAngle(
        new THREE.Vector3(0, 1, 0),
        (Math.random() - 0.5) * 0.35
      );
      m.compose(p, q, s);
      mesh.setMatrixAt(i, m);

      seeds[i] = Math.random() * 100;

      // Tint by depth so the skyline shifts hue as the camera travels
      const band = clamp01((64 - z) / 564) * (CHAPTERS.length - 1);
      const i0 = Math.floor(band);
      const i1 = Math.min(i0 + 1, CHAPTERS.length - 1);
      tint
        .copy(this.accents[i0])
        .lerp(this.accents[i1], band - i0)
        .multiplyScalar(0.32 + Math.random() * 0.4);
      tints[i * 3] = tint.r;
      tints[i * 3 + 1] = tint.g;
      tints[i * 3 + 2] = tint.b;
    }

    geo.setAttribute("aSeed", new THREE.InstancedBufferAttribute(seeds, 1));
    geo.setAttribute("aTint", new THREE.InstancedBufferAttribute(tints, 3));
    mesh.instanceMatrix.needsUpdate = true;

    this.city = mesh;
    this.cityMat = mat;
    this.scene.add(mesh);
    this._disposables.push(geo, mat);
  }

  /* ============================= webs ============================= */
  _webMaterial(colorA, colorB, opacity, sway) {
    const mat = new THREE.ShaderMaterial({
      vertexShader: WEB_VERT,
      fragmentShader: WEB_FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(colorA) },
        uColor2: { value: new THREE.Color(colorB) },
        uOpacity: { value: opacity },
        uSway: { value: sway },
        uFogColor: { value: FOG_COLOR.clone() },
        uFogFar: { value: 460 },
      },
    });
    this._materials.push(mat);
    this._disposables.push(mat);
    return mat;
  }

  _buildWebs() {
    this.webs = [];

    const specs = [
      { z: 6, y: 34, r: 62, rings: 10, spokes: 18, rot: 0.02, o: 0.34, c: [0xff3b4a, 0x4d86ff] },
      { z: -132, y: 24, r: 92, rings: 8, spokes: 14, rot: -0.014, o: 0.26, c: [0xff2a6d, 0x34e7f2] },
      { z: -266, y: 42, r: 110, rings: 7, spokes: 12, rot: 0.01, o: 0.22, c: [0xffd54a, 0xff3b4a] },
    ];

    specs.forEach((sp) => {
      const geo = webGeometry({
        rings: sp.rings,
        spokes: sp.spokes,
        radius: sp.r,
        bulge: sp.r * 0.26,
      });
      const mat = this._webMaterial(sp.c[0], sp.c[1], sp.o, 0.9);
      const lines = new THREE.LineSegments(geo, mat);
      lines.position.set(0, sp.y, sp.z);
      lines.userData.spin = sp.rot;
      lines.frustumCulled = false;
      this.scene.add(lines);
      this.webs.push(lines);
      this._disposables.push(geo);
    });

    // Hanging silk between the towers
    const strandCount = this.quality === "low" ? 14 : 28;
    const sGeo = strandGeometry(strandCount, 210, 150);
    const sMat = this._webMaterial(0xffffff, 0x4d86ff, 0.10, 1.6);
    this.strands = new THREE.LineSegments(sGeo, sMat);
    this.strands.frustumCulled = false;
    this.scene.add(this.strands);
    this._disposables.push(sGeo);
  }

  /* ============================ spider ============================ */
  _buildSpider() {
    const mat = new THREE.ShaderMaterial({
      vertexShader: CHROME_VERT,
      fragmentShader: CHROME_FRAG,
      uniforms: {
        uTime: { value: 0 },
        uRim: { value: new THREE.Color(0xff3b4a) },
        uBase: { value: new THREE.Color(0x0b0b14) },
        uGloss: { value: 1.35 },
      },
    });
    this._materials.push(mat);
    this.spiderMat = mat;

    const g = new THREE.Group();
    const seg = this.quality === "low" ? 12 : 22;

    const abdomenGeo = new THREE.SphereGeometry(1, seg * 2, seg);
    const abdomen = new THREE.Mesh(abdomenGeo, mat);
    abdomen.scale.set(1.0, 1.2, 1.55);
    abdomen.position.set(0, 0, -1.35);
    g.add(abdomen);

    const headGeo = new THREE.SphereGeometry(0.72, seg * 2, seg);
    const head = new THREE.Mesh(headGeo, mat);
    head.scale.set(1.15, 0.9, 1.05);
    head.position.set(0, 0.06, 0.6);
    g.add(head);

    this._disposables.push(abdomenGeo, headGeo, mat);

    // Eight legs, four per side, each a tube through hip → knee → foot
    this.legs = [];
    for (let i = 0; i < 4; i++) {
      for (const side of [-1, 1]) {
        const hip = new THREE.Vector3(side * 0.5, 0.08, 0.75 - i * 0.5);
        const knee = new THREE.Vector3(
          side * (1.55 + i * 0.3),
          1.5 - i * 0.1,
          1.5 - i * 0.95
        );
        const foot = new THREE.Vector3(
          side * (2.75 + i * 0.5),
          -1.15,
          2.3 - i * 1.75
        );
        const curve = new THREE.CatmullRomCurve3([hip, knee, foot]);
        const tubeGeo = new THREE.TubeGeometry(
          curve,
          this.quality === "low" ? 10 : 20,
          0.105,
          this.quality === "low" ? 5 : 8,
          false
        );
        const leg = new THREE.Mesh(tubeGeo, mat);
        leg.userData.phase = i * 0.6 + (side > 0 ? 0 : Math.PI);
        g.add(leg);
        this.legs.push(leg);
        this._disposables.push(tubeGeo);
      }
    }

    g.scale.setScalar(4.6);
    g.position.set(0, 34, 4);
    g.rotation.x = -0.18;
    this.spider = g;
    this.scene.add(g);
  }

  /* ============================ portals =========================== */
  _buildPortals() {
    this.portals = [];
    const specs = [
      { x: -58, y: 20, z: -150, r: 30, a: 0x34e7f2, b: 0x1f4fd8 },
      { x: 4, y: 32, z: -172, r: 38, a: 0xff3b4a, b: 0xff2a6d },
      { x: 62, y: 16, z: -146, r: 26, a: 0xff2a6d, b: 0xa855f7 },
    ];

    specs.forEach((sp, i) => {
      const geo = new THREE.PlaneGeometry(sp.r * 2, sp.r * 2, 1, 1);
      const mat = new THREE.ShaderMaterial({
        vertexShader: PORTAL_VERT,
        fragmentShader: PORTAL_FRAG,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: i * 3.1 },
          uColorA: { value: new THREE.Color(sp.a) },
          uColorB: { value: new THREE.Color(sp.b) },
          uOpacity: { value: 0.0 },
        },
      });
      this._materials.push(mat);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(sp.x, sp.y, sp.z);
      mesh.rotation.y = (-sp.x / 120) * 0.8;
      mesh.userData.spin = i % 2 ? 0.06 : -0.05;
      this.scene.add(mesh);
      this.portals.push(mesh);
      this._disposables.push(geo, mat);
    });
  }

  /* ============================ shafts ============================ */
  _buildShafts() {
    this.shafts = [];
    const n = this.quality === "low" ? 3 : 6;
    for (let i = 0; i < n; i++) {
      const geo = new THREE.PlaneGeometry(70, 190, 1, 1);
      const mat = new THREE.ShaderMaterial({
        vertexShader: SHAFT_VERT,
        fragmentShader: SHAFT_FRAG,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: i * 4.0 },
          uColor: {
            value: new THREE.Color(i % 2 ? 0x4d86ff : 0xff3b4a).multiplyScalar(
              0.5
            ),
          },
          uOpacity: { value: 0.055 },
          uSeed: { value: i * 11.3 },
        },
      });
      this._materials.push(mat);
      const mesh = new THREE.Mesh(geo, mat);
      const side = i % 2 ? 1 : -1;
      mesh.position.set(
        side * (58 + Math.random() * 80),
        80,
        20 - (i / n) * 400 - Math.random() * 40
      );
      mesh.rotation.set(0.28, (Math.random() - 0.5) * 0.7, 0.12);
      this.scene.add(mesh);
      this.shafts.push(mesh);
      this._disposables.push(geo, mat);
    }
  }

  /* ============================= motes ============================ */
  _buildMotes() {
    const COUNT =
      this.quality === "low" ? 700 : this.quality === "mid" ? 1600 : 2600;

    const pos = new Float32Array(COUNT * 3);
    const size = new Float32Array(COUNT);
    const seed = new Float32Array(COUNT);
    const tint = new Float32Array(COUNT * 3);
    const c = new THREE.Color();

    for (let i = 0; i < COUNT; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 340;
      pos[i * 3 + 1] = Math.random() * 220;
      pos[i * 3 + 2] = 40 - Math.random() * 520;
      size[i] = 0.5 + Math.random() * 1.5;
      seed[i] = Math.random();
      c.setHSL(Math.random() < 0.55 ? 0.0 : 0.58, 0.75, 0.62);
      tint[i * 3] = c.r;
      tint[i * 3 + 1] = c.g;
      tint[i * 3 + 2] = c.b;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
    geo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    geo.setAttribute("aTint", new THREE.BufferAttribute(tint, 3));

    const mat = new THREE.ShaderMaterial({
      vertexShader: MOTE_VERT,
      fragmentShader: MOTE_FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: this.renderer.getPixelRatio() },
      },
    });
    this._materials.push(mat);

    this.motes = new THREE.Points(geo, mat);
    this.motes.frustumCulled = false;
    this.scene.add(this.motes);
    this._disposables.push(geo, mat);
  }

  /* =========================== composer =========================== */
  _buildComposer() {
    const w = window.innerWidth;
    const h = window.innerHeight;

    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));

    if (this.quality !== "low") {
      this.bloom = new UnrealBloomPass(
        new THREE.Vector2(w, h),
        this.quality === "high" ? 0.55 : 0.4, // strength
        0.52, // radius
        0.62 // threshold — only lit windows and silk should bloom
      );
      this.composer.addPass(this.bloom);
    }

    this.fx = new ShaderPass(SPIDERVERSE_PASS);
    this.fx.uniforms.uRes.value = new THREE.Vector2(w, h);
    this.fx.uniforms.uHalftone.value = this.quality === "low" ? 0.28 : 0.45;
    this.fx.uniforms.uAberration.value = 0.14;
    if (this.reducedMotion) {
      this.fx.uniforms.uGrain.value = 0;
      this.fx.uniforms.uAberration.value = 0.2;
    }
    this.composer.addPass(this.fx);

    this.composer.addPass(new OutputPass());
  }

  /* ============================== API ============================= */
  setProgress(p) {
    this.targetProgress = clamp01(p);
  }

  setVelocity(v) {
    this.velocity = v;
  }

  setPointer(x, y) {
    this.pointer.x = x;
    this.pointer.y = y;
  }

  setChapter(i) {
    if (i === this.chapter) return;
    this.chapter = i;
    this.pulse(0.9);
  }

  /** A dimension-tear burst — fired on chapter change and on click. */
  pulse(amount = 1) {
    if (this.reducedMotion) return;
    this.glitch = Math.min(1.4, this.glitch + amount);
  }

  start() {
    if (this.running || this.disposed || this.reducedMotion) return;
    this.entered = true;
    this.running = true;
    this._clock.getDelta();
    this._raf = requestAnimationFrame(this._tick);
  }

  stop() {
    this.running = false;
    if (this._raf) cancelAnimationFrame(this._raf);
    this._raf = null;
  }

  /* ============================= loop ============================= */
  _tick() {
    if (!this.running) return;
    this._raf = requestAnimationFrame(this._tick);

    const dt = Math.min(this._clock.getDelta(), 0.05);
    const t = this._clock.getElapsedTime();

    this.progress = damp(this.progress, this.targetProgress, 5.5, dt);
    this.smoothPointer.x = damp(this.smoothPointer.x, this.pointer.x, 3.2, dt);
    this.smoothPointer.y = damp(this.smoothPointer.y, this.pointer.y, 3.2, dt);
    this.glitch = Math.max(0, this.glitch - dt * 2.2);

    this._applyCamera(t);
    this._render(t);
    this._watchBudget(dt);
  }

  /**
   * If the frame budget is being blown consistently, drop the two most
   * expensive things (bloom and pixel ratio) once rather than letting the
   * whole site judder. Costs one visual notch; saves the demo.
   */
  _watchBudget(dt) {
    if (this._degraded || this.reducedMotion) return;
    this._frames = (this._frames || 0) + 1;
    this._acc = (this._acc || 0) + dt;
    if (this._frames < 90) return;

    const avg = this._acc / this._frames;
    this._frames = 0;
    this._acc = 0;

    if (avg <= 0.042) return; // better than ~24fps, leave it alone

    this._degraded = true;
    if (this.bloom) this.bloom.enabled = false;
    if (this.fx) this.fx.uniforms.uHalftone.value *= 0.6;
    this.renderer.setPixelRatio(1);
    this.composer.setSize(window.innerWidth, window.innerHeight);
    if (this.motes) this.motes.material.uniforms.uPixelRatio.value = 1;
  }

  _applyCamera(t) {
    const p = clamp01(this.progress);

    this.camPath.getPointAt(p, this._camPos);
    this.lookPath.getPointAt(p, this._lookAt);

    // Pointer parallax — the world leans with the cursor
    const px = this.smoothPointer.x;
    const py = this.smoothPointer.y;
    this._camPos.x += px * 9;
    this._camPos.y += -py * 6;

    if (!this.reducedMotion) {
      // Handheld float so the shot never feels locked off
      this._camPos.x += Math.sin(t * 0.31) * 1.5;
      this._camPos.y += Math.cos(t * 0.24) * 1.1;
    }

    this.camera.position.copy(this._camPos);
    this._lookAt.x += px * 5;
    this._lookAt.y += -py * 3;
    this.camera.lookAt(this._lookAt);

    if (!this.reducedMotion) {
      this.camera.rotation.z = Math.sin(t * 0.17) * 0.012 + px * 0.03;
    }

    // Blend the chapter accent for the web + spider rim colours
    const band = p * (this.accents.length - 1);
    const i0 = Math.floor(band);
    const i1 = Math.min(i0 + 1, this.accents.length - 1);
    this._accent.copy(this.accents[i0]).lerp(this.accents[i1], band - i0);
  }

  _render(t) {
    const vel = this.velocity;

    if (this.cityMat) this.cityMat.uniforms.uTime.value = t;

    if (this.webs) {
      this.webs.forEach((web, i) => {
        if (!this.reducedMotion) web.rotation.z += web.userData.spin * 0.01;
        web.material.uniforms.uTime.value = t;
        if (i === 0) web.material.uniforms.uColor.value.copy(this._accent);
      });
    }
    if (this.strands) this.strands.material.uniforms.uTime.value = t;
    if (this.motes) this.motes.material.uniforms.uTime.value = t;

    if (this.spider) {
      this.spiderMat.uniforms.uTime.value = t;
      this.spiderMat.uniforms.uRim.value.copy(this._accent);
      if (!this.reducedMotion) {
        this.spider.rotation.y = Math.sin(t * 0.22) * 0.55 + this.smoothPointer.x * 0.4;
        this.spider.rotation.z = Math.cos(t * 0.19) * 0.1;
        this.spider.position.y = 34 + Math.sin(t * 0.5) * 1.4;
        // Legs flex as if the whole thing is breathing
        this.legs.forEach((leg) => {
          leg.scale.setScalar(1 + Math.sin(t * 1.1 + leg.userData.phase) * 0.035);
        });
      }
    }

    if (this.portals) {
      // Portals only light up around the Multiverse chapter
      const near = 1 - Math.min(1, Math.abs(this.progress - 0.62) / 0.24);
      this.portals.forEach((pl) => {
        pl.material.uniforms.uTime.value = t;
        pl.material.uniforms.uOpacity.value = Math.max(0, near) * 0.95;
        if (!this.reducedMotion) pl.rotation.z += pl.userData.spin * 0.004;
      });
    }

    if (this.shafts) {
      this.shafts.forEach((s) => {
        s.material.uniforms.uTime.value = t;
      });
    }

    if (this.fx) {
      const u = this.fx.uniforms;
      u.uTime.value = t;
      u.uVel.value = vel;
      u.uGlitch.value = this.glitch;
    }

    if (this.bloom) {
      this.bloom.strength =
        (this.quality === "high" ? 0.55 : 0.4) + Math.min(0.3, Math.abs(vel) * 0.015);
    }

    this.composer.render();
  }

  /* ============================ plumbing =========================== */
  _onResize() {
    if (!this.renderer || this.disposed) return;
    const w = window.innerWidth;
    const h = window.innerHeight;

    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h, false);
    this.composer.setSize(w, h);
    if (this.bloom) this.bloom.setSize(w, h);
    if (this.fx) this.fx.uniforms.uRes.value.set(w, h);
    if (this.motes)
      this.motes.material.uniforms.uPixelRatio.value =
        this.renderer.getPixelRatio();

    if (this.reducedMotion) {
      this._applyCamera(0);
      this._render(0);
    }
  }

  _onVisibility() {
    if (document.hidden) this.stop();
    else if (this.entered && !this.reducedMotion) this.start();
  }

  dispose() {
    this.disposed = true;
    this.stop();
    window.removeEventListener("resize", this._onResize);
    document.removeEventListener("visibilitychange", this._onVisibility);

    this._disposables.forEach((d) => {
      if (d && typeof d.dispose === "function") d.dispose();
    });
    this._disposables.length = 0;

    if (this.composer) {
      this.composer.passes.forEach((pass) => {
        if (pass.dispose) pass.dispose();
      });
      if (this.composer.renderTarget1) this.composer.renderTarget1.dispose();
      if (this.composer.renderTarget2) this.composer.renderTarget2.dispose();
    }
    if (this.scene) this.scene.clear();
    if (this.renderer) {
      this.renderer.dispose();
      this.renderer.forceContextLoss?.();
    }
    this.renderer = null;
    this.scene = null;
  }
}

/** Pick a render tier from the device, before anything is built. */
export function detectQuality() {
  if (typeof window === "undefined") return "low";
  const mobile = window.matchMedia("(max-width: 820px)").matches;
  const cores = navigator.hardwareConcurrency || 4;
  const mem = navigator.deviceMemory || 4;
  if (mobile || cores <= 4 || mem <= 4) return "low";
  if (cores <= 8 || window.innerWidth < 1280) return "mid";
  return "high";
}
