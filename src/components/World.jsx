/* ============================================================
   World — mounts the WebGL scene and wires the page to it.

   Scroll position   → camera position along the flight path
   Scroll velocity   → chromatic aberration (WebGL + CSS var)
   Pointer position  → camera parallax
   Section in view   → chapter change + dimension-tear pulse

   The <canvas> is created imperatively rather than rendered by
   React on purpose: disposing the renderer force-loses its GL
   context, and a canvas element can never hand out another one.
   A React-owned canvas would therefore come back dead on any
   remount (StrictMode's double-invoke included), so each mount
   gets a brand new element and a brand new context.
   ============================================================ */

import React, { useEffect, useRef, useState } from "react";
import SpiderVerse, { detectQuality } from "../three/SpiderVerse.js";
import { SECTIONS } from "../data/site.js";

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

export default function World({ onReady }) {
  const holderRef = useRef(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const holder = holderRef.current;
    if (!holder) return undefined;

    const canvas = document.createElement("canvas");
    canvas.className = "world";
    canvas.setAttribute("aria-hidden", "true");
    holder.appendChild(canvas);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const world = new SpiderVerse({
      reducedMotion: reduced,
      quality: detectQuality(),
    });

    const ok = world.mount(canvas);
    if (!ok) {
      canvas.remove();
      setFailed(true);
      onReady?.();
      return undefined;
    }
    if (process.env.NODE_ENV === "development") window.__spiderverse = world;
    // One composed frame is on screen — the preloader can stand down.
    onReady?.();

    // The scene idles until the boot sequence finishes. Rendering underneath
    // the preloader would starve it of frames and leave the counter crawling.
    const begin = () => world.start();
    if (document.body.classList.contains("is-booting")) {
      window.addEventListener("sv:entered", begin, { once: true });
    } else {
      begin();
    }

    const root = document.documentElement;
    let raf = 0;
    let lastY = window.scrollY;
    let smoothVel = 0;

    const loop = () => {
      raf = requestAnimationFrame(loop);

      const y = window.scrollY;
      const max = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight
      );

      world.setProgress(y / max);

      const raw = y - lastY;
      lastY = y;
      smoothVel += (raw - smoothVel) * 0.18;

      const v = reduced ? 0 : clamp(smoothVel * 0.12, -6, 6);
      world.setVelocity(v);
      // Feed the same value to CSS so headlines split their RGB in step
      root.style.setProperty("--vel", v.toFixed(3));
    };
    raf = requestAnimationFrame(loop);

    const onPointer = (e) => {
      world.setPointer(
        (e.clientX / window.innerWidth) * 2 - 1,
        (e.clientY / window.innerHeight) * 2 - 1
      );
    };
    const onClick = () => world.pulse(0.7);

    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("pointerdown", onClick, { passive: true });

    // Chapter tracking — drives the nav and the accent colour blend
    const sections = SECTIONS.map((s) => document.getElementById(s.id)).filter(
      Boolean
    );
    let current = -1;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const i = sections.indexOf(entry.target);
          if (i < 0 || i === current) return;
          current = i;
          world.setChapter(i);
          window.dispatchEvent(
            new CustomEvent("sv:chapter", { detail: { index: i } })
          );
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );
    sections.forEach((s) => io.observe(s));

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("pointerdown", onClick);
      io.disconnect();
      window.removeEventListener("sv:entered", begin);
      root.style.removeProperty("--vel");
      world.dispose();
      canvas.remove();
      if (window.__spiderverse === world) delete window.__spiderverse;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Only the canvas lives here. The painted backdrop, vignette and grain
  // are rendered by <Backdrop> from the first paint, so the page never
  // sits on flat black while this chunk is still loading.
  return <div ref={holderRef} className={failed ? "world-off" : ""} aria-hidden="true" />;
}
