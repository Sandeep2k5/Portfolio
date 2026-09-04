/* ============================================================
   Cursor — a web-shooter reticle, live across the whole site.

   · Crosshair sits exactly on the pointer, always
   · Ring trails behind it with time-based damping
   · Silk trail draws the last dozen positions as a strand
   · Over anything interactive the reticle opens and reads THWIP
   · Clicking (or tapping) fires six web lines out of the centre

   Frame-rate independence is the whole point here. The previous
   version drove the dot with GSAP tweens, which run on rAF: while
   scrolling, the 3D scene starves the frame loop, GSAP's lag
   smoothing stretches those tweens, and the reticle falls seconds
   behind the real pointer — with the native cursor hidden, that
   reads as "my cursor vanished". So the dot is now written
   synchronously inside the pointer event, and everything that
   smooths is damped against real elapsed time, not frame count.
   ============================================================ */

import React, { useEffect, useRef } from "react";

const TRAIL = 14;
const HIT = 'a, button, [role="button"], input, textarea, select, .interactive';

export default function Cursor() {
  const rootRef = useRef(null);
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const trailRef = useRef(null);
  const burstRef = useRef(null);
  const labelRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    const dot = dotRef.current;
    const ring = ringRef.current;
    const trail = trailRef.current;
    const burst = burstRef.current;
    const label = labelRef.current;
    if (!root) return undefined;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return undefined;

    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    // Touch devices get the web-shot on tap, but keep their native
    // behaviour — there is no pointer to replace.
    if (!fine) root.classList.add("cursor--touch");
    else document.documentElement.classList.add("web-cursor");

    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const ringPos = { ...pos };
    const pts = Array.from({ length: TRAIL }, () => ({ ...pos }));
    let visible = false;
    let raf = 0;
    let last = performance.now();

    const show = (on) => {
      if (visible === on) return;
      visible = on;
      root.style.opacity = on ? "1" : "0";
    };

    /* ---- the dot is written straight from the input event ---- */
    const place = (x, y) => {
      pos.x = x;
      pos.y = y;
      dot.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    };

    const onMove = (e) => {
      if (e.pointerType === "touch") return;
      place(e.clientX, e.clientY);
      show(true);
      // pointermove's target is already the topmost element under the
      // pointer, so this re-resolves the hover state for free and heals the
      // case where a revealing card slides in under a stationary cursor.
      applyHot(e.target);
    };

    /* ---- ring + trail smooth against wall-clock time ---- */
    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;

      // Converges in ~0.15s of real time whatever the frame rate is
      const k = 1 - Math.exp(-16 * dt);
      ringPos.x += (pos.x - ringPos.x) * k;
      ringPos.y += (pos.y - ringPos.y) * k;
      ring.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0)`;

      pts.unshift({ x: pos.x, y: pos.y });
      pts.length = TRAIL;
      let d = `M ${pts[0].x} ${pts[0].y}`;
      for (let i = 1; i < pts.length; i++) {
        const p = pts[i];
        const q = pts[i - 1];
        d += ` Q ${q.x} ${q.y} ${(p.x + q.x) / 2} ${(p.y + q.y) / 2}`;
      }
      trail.setAttribute("d", d);
    };

    /* ---- hover state ----
       Resolved entirely from pointerover. Pairing it with a pointerout
       handler drops the state when the pointer crosses between two
       children of the SAME link (out fires for the old child and matches
       the ancestor just as readily as over does), which left the reticle
       closed over most of the site's links. pointerover alone fires on
       every element entry, so one handler answers both questions. */
    const applyHot = (target) => {
      const hit = target?.closest?.(HIT);
      if (hit) {
        root.classList.add("is-hot");
        const next = hit.dataset.cursor || "THWIP";
        if (label.textContent !== next) label.textContent = next;
      } else {
        root.classList.remove("is-hot");
      }
    };

    const onOver = (e) => applyHot(e.target);

    /* ---- web-shot ---- */
    let burstTimer = 0;
    const onDown = (e) => {
      const x = e.clientX ?? pos.x;
      const y = e.clientY ?? pos.y;
      if (e.pointerType === "touch") place(x, y);

      burst.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${
        Math.random() * 60 - 30
      }deg) scale(0.2)`;
      burst.style.opacity = "1";
      // next frame so the browser registers the start state
      requestAnimationFrame(() => {
        burst.style.transition =
          "transform 550ms cubic-bezier(0.16,1,0.3,1), opacity 550ms ease-out";
        burst.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(0deg) scale(1.9)`;
        burst.style.opacity = "0";
      });
      clearTimeout(burstTimer);
      burstTimer = setTimeout(() => {
        burst.style.transition = "none";
      }, 580);

      root.classList.add("is-firing");
      setTimeout(() => root.classList.remove("is-firing"), 180);
      if (e.pointerType === "touch") show(true);
    };

    const onLeaveWindow = () => fine && show(false);
    const onEnterWindow = () => fine && show(true);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    document.addEventListener("pointerover", onOver, true);
    document.addEventListener("mouseleave", onLeaveWindow);
    document.addEventListener("mouseenter", onEnterWindow);
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(burstTimer);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      document.removeEventListener("pointerover", onOver, true);
      document.removeEventListener("mouseleave", onLeaveWindow);
      document.removeEventListener("mouseenter", onEnterWindow);
      document.documentElement.classList.remove("web-cursor");
    };
  }, []);

  return (
    <div className="cursor" ref={rootRef} aria-hidden="true">
      <svg className="cursor__trail" width="100%" height="100%">
        <path ref={trailRef} d="" />
      </svg>

      <div className="cursor__ring" ref={ringRef}>
        <svg viewBox="0 0 60 60">
          <circle cx="30" cy="30" r="26" className="cursor__circle" />
          <path
            d="M30 4 L30 14M30 46 L30 56M4 30 L14 30M46 30 L56 30"
            className="cursor__ticks"
          />
        </svg>
        <span className="cursor__label" ref={labelRef}>
          THWIP
        </span>
      </div>

      <div className="cursor__dot" ref={dotRef} />

      <svg className="cursor__burst" ref={burstRef} viewBox="0 0 100 100">
        <g stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" fill="none">
          <path d="M50 50 L50 6M50 50 L81 19M50 50 L94 50M50 50 L81 81M50 50 L50 94M50 50 L19 81M50 50 L6 50M50 50 L19 19" />
          <circle cx="50" cy="50" r="16" strokeWidth="1.4" opacity="0.7" />
          <circle cx="50" cy="50" r="30" strokeWidth="1" opacity="0.4" />
        </g>
      </svg>
    </div>
  );
}
