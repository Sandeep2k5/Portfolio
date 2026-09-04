/* ============================================================
   Preloader — a web is spun while fonts and the first WebGL
   frame land, then the screen tears open in comic slats.
   ============================================================ */

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";

const SLATS = 7;

/** Radial spokes + concentric rings for the SVG web being woven. */
function buildWeb() {
  const cx = 100;
  const cy = 100;
  const spokes = 14;
  const rings = 6;
  const R = 92;

  const pt = (ri, si) => {
    const r = (R * Math.pow(ri / rings, 1.1)).toFixed(2);
    const a = (si / spokes) * Math.PI * 2 - Math.PI / 2;
    return [
      (cx + Math.cos(a) * r).toFixed(2),
      (cy + Math.sin(a) * r).toFixed(2),
    ];
  };

  const spokePaths = [];
  for (let si = 0; si < spokes; si++) {
    const [x, y] = pt(rings, si);
    spokePaths.push(`M${cx} ${cy} L${x} ${y}`);
  }

  const ringPaths = [];
  for (let ri = 1; ri <= rings; ri++) {
    let d = "";
    for (let si = 0; si <= spokes; si++) {
      const [x, y] = pt(ri, si);
      if (si === 0) d += `M${x} ${y}`;
      else {
        // pull each chord slightly toward the centre so it sags like silk
        const [px, py] = pt(ri, si - 1);
        const mx = (Number(px) + Number(x)) / 2;
        const my = (Number(py) + Number(y)) / 2;
        const qx = cx + (mx - cx) * 0.9;
        const qy = cy + (my - cy) * 0.9;
        d += ` Q${qx.toFixed(2)} ${qy.toFixed(2)} ${x} ${y}`;
      }
    }
    ringPaths.push(d);
  }

  return { spokePaths, ringPaths };
}

export default function Preloader({ ready }) {
  const rootRef = useRef(null);
  const webRef = useRef(null);
  const [pct, setPct] = useState(0);
  const [gone, setGone] = useState(false);
  const { spokePaths, ringPaths } = useRef(buildWeb()).current;

  /* -------- weave the web + count up -------- */
  useEffect(() => {
    document.body.classList.add("is-booting");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      if (reduced) return;
      const strands = webRef.current.querySelectorAll("path");
      // Hand-rolled stroke draw: measure each strand, then unspool it
      strands.forEach((p) => {
        const len = p.getTotalLength();
        p.style.strokeDasharray = len;
        p.style.strokeDashoffset = len;
      });
      gsap.to(strands, {
        strokeDashoffset: 0,
        duration: 1.15,
        stagger: 0.022,
        ease: "power2.inOut",
      });
      gsap.to(webRef.current, {
        rotate: 22,
        scale: 1.06,
        duration: 3.2,
        ease: "none",
      });
    }, rootRef);

    // Count toward 90% on wall-clock time, not on rAF: shader compilation
    // can starve the frame loop on first paint, and a counter that freezes
    // reads as a broken site.
    const t0 = performance.now();
    const id = setInterval(() => {
      const e = Math.min(1, (performance.now() - t0) / 1500);
      setPct(Math.round(90 * (1 - Math.pow(1 - e, 3))));
      if (e >= 1) clearInterval(id);
    }, 40);

    return () => {
      ctx.revert();
      clearInterval(id);
    };
  }, []);

  /* -------- tear the screen open -------- */
  useEffect(() => {
    if (!ready) return undefined;
    const root = rootRef.current;
    if (!root) return undefined;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      setPct(100);
      document.body.classList.remove("is-booting");
      setGone(true);
      window.dispatchEvent(new CustomEvent("sv:entered"));
    };

    const count = { v: pct };
    const tl = gsap.timeline({ onComplete: finish });

    // GSAP is driven by requestAnimationFrame, so a stalled first frame can
    // stretch this timeline indefinitely. Wall-clock backstop: the curtain
    // always lifts, choppy or not.
    const backstop = setTimeout(() => {
      if (tl.isActive()) tl.progress(1);
      finish();
    }, 3200);

    tl.to(count, {
      v: 100,
      duration: 0.45,
      ease: "power2.out",
      onUpdate: () => setPct(Math.round(count.v)),
    });

    if (reduced) {
      tl.to(root, { autoAlpha: 0, duration: 0.3 });
    } else {
      tl.to(
        root.querySelectorAll(".boot__core"),
        { scale: 1.5, autoAlpha: 0, duration: 0.5, ease: "expo.in" },
        "-=0.1"
      ).to(
        root.querySelectorAll(".boot__slat"),
        {
          yPercent: (i) => (i % 2 ? 108 : -108),
          rotateY: (i) => (i % 2 ? 34 : -34),
          z: -520,
          duration: 0.95,
          stagger: { each: 0.055, from: "center" },
          ease: "power4.inOut",
        },
        "-=0.25"
      );
    }

    return () => {
      clearTimeout(backstop);
      tl.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  if (gone) return null;

  return (
    <div className="boot" ref={rootRef} role="status" aria-live="polite">
      <div className="boot__slats" aria-hidden="true">
        {Array.from({ length: SLATS }, (_, i) => (
          <span className="boot__slat" key={i} />
        ))}
      </div>

      <div className="boot__core">
        <svg
          className="boot__web"
          ref={webRef}
          viewBox="0 0 200 200"
          aria-hidden="true"
        >
          <g fill="none" strokeLinecap="round">
            {spokePaths.map((d, i) => (
              <path d={d} key={`s${i}`} className="boot__spoke" />
            ))}
            {ringPaths.map((d, i) => (
              <path d={d} key={`r${i}`} className="boot__ring" />
            ))}
          </g>
        </svg>

        <div className="boot__meta">
          <span className="boot__label">Calibrating spidey-sense</span>
          <span className="boot__pct">
            {String(pct).padStart(3, "0")}
            <em>%</em>
          </span>
        </div>

        <div className="boot__bar" aria-hidden="true">
          <span style={{ transform: `scaleX(${pct / 100})` }} />
        </div>
      </div>

      <span className="sr-only">Loading portfolio, {pct} percent complete</span>
    </div>
  );
}
