<div align="center">

<img src="public/spiderman-icon.png" width="84" alt="" />

# SANDEEP UTHAYAKUMAR — PORTFOLIO

### Not a page. A flight through a city.

One WebGL scene. One camera. One continuous shot.<br>
Scroll doesn't move a document past you — it flies a camera down a procedural
skyline, and every chapter of the résumé is a keyframe on that flight path.

### [→ sandeep2k5.netlify.app](https://sandeep2k5.netlify.app/)

[![React](https://img.shields.io/badge/React-18.3-61dafb?style=for-the-badge&logo=react&logoColor=000)](https://react.dev)
[![three.js](https://img.shields.io/badge/three.js-r180-000000?style=for-the-badge&logo=three.js&logoColor=fff)](https://threejs.org)
[![GSAP](https://img.shields.io/badge/GSAP-ScrollTrigger-88ce02?style=for-the-badge&logo=greensock&logoColor=000)](https://gsap.com)
[![GLSL](https://img.shields.io/badge/GLSL-6_custom_shaders-ff3b4a?style=for-the-badge)](src/three/shaders.js)

</div>

---

![Origin — the hero chapter](docs/media/01-hero.jpg)

---

## The idea

Most developer portfolios are a stack of cards on a dark background. This one
asks a harder question: **what if the page and the 3D world were literally the
same journey?**

There is exactly one scene, mounted once, alive for the whole session.
Scrolling is not a page transition — it is camera travel along a Catmull-Rom
spline through a canyon of procedurally-lit towers. Each of the six chapters is
a keyframe on that spline with its own camera position, look-at target and
accent colour. The DOM scrolls, the camera flies, and the two stay in sync.

The visual language is Spider-Verse — halftone dots, chromatic aberration,
comic slats, onomatopoeia, newsprint. Not as decoration, as structure.
Six issues, one story.

---

## 01 · The Mask

Who's behind it, and the stack he builds with. The portrait is a real 3D
object — pointer position drives `rotateX`/`rotateY` on a `preserve-3d` stack
with parallax layers, not a CSS background trick.

![The Mask](docs/media/02-mask.jpg)

## 02 · Mission Log

Experience, hung on a silk spine that draws itself as the scroll passes it.

![Mission Log](docs/media/03-missions.jpg)

## 03 · Multiverse

Every project is a comic cover suspended in front of its own dimensional rift.
The whole stack tilts with the pointer.

![Multiverse](docs/media/04-multiverse.jpg)

## 04 · The Bugle

Peer-reviewed research, set as newsprint — the one light surface in the entire
site, paper stock lifted off the dark city.

![The Bugle](docs/media/05-bugle.jpg)

## 05 · Signal

The camera has risen above the skyline. What's left is the spider-signal thrown
at the clouds, and three ways to reach me.

![Signal](docs/media/06-signal.jpg)

---

## Under the hood

Six hand-written GLSL programs do the heavy lifting — procedurally-lit tower
façades with thousands of windows and no textures, a spider-web dome of spokes
and sagging chords, up to 2,600 drifting motes, the dimensional rifts,
velocity-driven chromatic ghosting, volumetric light shafts, and a full-screen
pass for the halftone dots and RGB split.

A few things that were harder than they look:

**The preloader that looked broken.** Constructing the scene compiles every
shader in one synchronous burst — doing that while the preloader animated
blocked the main thread and stalled the very timers meant to dismiss it. The
chunk downloads immediately, but the scene is *built* only after the curtain
lifts.

**The cursor that vanished.** When the GPU starves the frame loop during
scroll, GSAP's lag smoothing stretches every tween and the reticle falls
seconds behind the pointer. Fix: `lagSmoothing(0)`, the dot written
synchronously inside the pointer event, everything else damped against
wall-clock time rather than frame count.

**Three quality tiers, chosen at runtime.** `detectQuality()` reads viewport,
`hardwareConcurrency` and `deviceMemory`, then scales DPR, building count,
particles and bloom — dropping the bloom pass entirely on low. A phone gets a
scene it can actually render.

**Budget.** three.js and the whole scene graph are code-split into a lazily
loaded ~538 KB chunk, so the ~291 KB main bundle never waits on WebGL. The page
paints its own background before React boots — there is never a white flash.

**Accessibility isn't an afterthought.** Every colour pair is checked against
WCAG AA, `prefers-reduced-motion` is honoured in the CSS *and* the 3D scene,
and WebGL failure is a supported state — lose the context and what remains is a
complete, readable portfolio.

---

<div align="center">

## Reach me

Software Engineer at **HSBC** — backend systems and full-stack products in C++,
Python and the MERN stack. Two peer-reviewed papers, IEEE Access and
ScienceDirect.

[![Email](https://img.shields.io/badge/Email-sandeeputhayakumar%40gmail.com-ff3b4a?style=for-the-badge&logo=gmail&logoColor=fff)](mailto:sandeeputhayakumar@gmail.com)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-sandeep--uthayakumar-4d86ff?style=for-the-badge&logo=linkedin&logoColor=fff)](https://www.linkedin.com/in/sandeep-uthayakumar-8b7242255/)
[![GitHub](https://img.shields.io/badge/GitHub-%40Sandeep2k5-34e7f2?style=for-the-badge&logo=github&logoColor=000)](https://github.com/Sandeep2k5)

<br>

**THWIP.**

</div>
