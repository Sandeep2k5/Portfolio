import React, { Suspense, lazy, useEffect, useState } from "react";

import Backdrop from "./components/Backdrop.jsx";
import Cursor from "./components/Cursor.jsx";
import Preloader from "./components/Preloader.jsx";
import Nav from "./components/Nav.jsx";

import Hero from "./components/Hero.jsx";
import Mask from "./components/Mask.jsx";
import Missions from "./components/Missions.jsx";
import Multiverse from "./components/Multiverse.jsx";
import Bugle from "./components/Bugle.jsx";
import Signal from "./components/Signal.jsx";

/**
 * three.js plus the scene graph is the largest and slowest-to-compile
 * thing on the page. It is split into its own chunk, prefetched during
 * the boot sequence, and only mounted once the hero has landed — see the
 * choreography note below.
 */
const World = lazy(() => import("./components/World.jsx"));

/** Minimum time the boot sequence stays up, so it reads as intent. */
const MIN_BOOT_MS = 1100;
/** Breathing room after the curtain so the hero intro plays clean. */
const WORLD_DELAY_MS = 700;

const idle = (fn, timeout) =>
  typeof window.requestIdleCallback === "function"
    ? window.requestIdleCallback(fn, { timeout })
    : setTimeout(fn, timeout);

export default function App() {
  const [bootDone, setBootDone] = useState(false);
  const [worldUp, setWorldUp] = useState(false);

  /* ---- when the curtain may lift ---- */
  useEffect(() => {
    let cancelled = false;
    const started = performance.now();

    const release = () => {
      if (cancelled) return;
      const rest = Math.max(0, MIN_BOOT_MS - (performance.now() - started));
      setTimeout(() => !cancelled && setBootDone(true), rest);
    };

    // Hold only for the display faces — otherwise the hero headline
    // reflows a beat after the reveal. The GPU is deliberately NOT part of
    // this gate: waiting on shader compilation made the loader feel broken.
    if (document.fonts?.ready) document.fonts.ready.then(release).catch(release);
    else release();

    // Never let a stalled font request keep the site behind the curtain.
    const bail = setTimeout(() => !cancelled && setBootDone(true), 3000);

    return () => {
      cancelled = true;
      clearTimeout(bail);
    };
  }, []);

  /* ---- scene choreography ----
     Download the chunk immediately, but build the scene only after the
     curtain has actually gone. Constructing it compiles every shader
     program in one synchronous burst; doing that while the preloader is
     still animating blocks the main thread and stalls the very timers
     meant to dismiss it — which is what "slow to load" actually was.
     The short extra delay lets the hero headline land first, then the
     city fades up behind it. */
  useEffect(() => {
    import("./components/World.jsx").catch(() => {});

    let handle;
    const onEntered = () => {
      handle = idle(() => setWorldUp(true), WORLD_DELAY_MS);
    };
    window.addEventListener("sv:entered", onEntered, { once: true });

    return () => {
      window.removeEventListener("sv:entered", onEntered);
      if (handle && window.cancelIdleCallback) window.cancelIdleCallback(handle);
      clearTimeout(handle);
    };
  }, []);

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <Backdrop />

      {worldUp && (
        <Suspense fallback={null}>
          <World />
        </Suspense>
      )}

      <Cursor />
      <Preloader ready={bootDone} />
      <Nav />

      <main className="shell" id="main">
        <Hero />
        <Mask />
        <Missions />
        <Multiverse />
        <Bugle />
      </main>

      <Signal />
    </>
  );
}
