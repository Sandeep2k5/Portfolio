/* ============================================================
   03 · THE MULTIVERSE — the project wall.
   Each build is a comic cover suspended in front of its own
   dimensional rift; pointer movement tilts the whole stack.
   ============================================================ */

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { PROJECTS } from "../data/site.js";
import { Head, Reveal, Icon, Boom, WebCorners, Sense } from "./common/Bits.jsx";

/** Pointer-driven tilt for a single cover. */
function useCoverTilt(ref) {
  useEffect(() => {
    const card = ref.current;
    if (!card) return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return undefined;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches)
      return undefined;

    const rx = gsap.quickTo(card, "rotateX", { duration: 0.55, ease: "power3" });
    const ry = gsap.quickTo(card, "rotateY", { duration: 0.55, ease: "power3" });
    const layers = card.querySelectorAll("[data-depth]");

    const onMove = (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      rx(-py * 15);
      ry(px * 19);
      layers.forEach((l) => {
        const d = Number(l.dataset.depth);
        gsap.to(l, {
          x: px * d * 28,
          y: py * d * 20,
          duration: 0.6,
          ease: "power3",
          overwrite: "auto",
        });
      });
    };
    const onLeave = () => {
      rx(0);
      ry(0);
      layers.forEach((l) =>
        gsap.to(l, { x: 0, y: 0, duration: 0.85, ease: "power3" })
      );
    };

    card.addEventListener("pointermove", onMove);
    card.addEventListener("pointerleave", onLeave);
    return () => {
      card.removeEventListener("pointermove", onMove);
      card.removeEventListener("pointerleave", onLeave);
    };
  }, [ref]);
}

function Cover({ p, index }) {
  const ref = useRef(null);
  useCoverTilt(ref);

  return (
    <li className="verse__cell">
      <Reveal from={index % 2 ? "right" : "left"} distance={320}>
        <article className={`verse__cover panel a-${p.accent}`} ref={ref}>
          <span className="halftone" aria-hidden="true" />
          <WebCorners />
          <Sense />

          {/* the rift behind the cover */}
          <svg className="verse__rift" viewBox="0 0 200 200" aria-hidden="true">
            <defs>
              <radialGradient id={`rift-${p.n}`}>
                <stop offset="45%" stopColor="currentColor" stopOpacity="0" />
                <stop offset="72%" stopColor="currentColor" stopOpacity="0.55" />
                <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle cx="100" cy="100" r="92" fill={`url(#rift-${p.n})`} />
            <circle
              cx="100"
              cy="100"
              r="74"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.8"
              strokeDasharray="6 10"
              opacity="0.6"
            />
          </svg>

          <header className="verse__top">
            <span className="verse__n" aria-hidden="true">
              {p.n}
            </span>
            <span className="verse__universe mono" data-depth="1.2">
              {p.universe}
            </span>
          </header>

          <h3 className="verse__title" data-depth="0.55">
            <span className="rgb-split" data-text={p.title}>
              {p.title}
            </span>
          </h3>

          <p className="verse__blurb">{p.blurb}</p>

          <ul className="chips verse__chips">
            {p.skills.map((s) => (
              <li className="chip" key={s}>
                {s}
              </li>
            ))}
          </ul>

          <a
            className="verse__link"
            href={p.source}
            target="_blank"
            rel="noopener noreferrer"
            data-cursor="OPEN"
          >
            <span className="verse__linkText">View source</span>
            <span className="verse__linkIcon" aria-hidden="true">
              <Icon name="external" size={16} />
            </span>
            <span className="sr-only">
              {`${p.title} — opens GitHub in a new tab`}
            </span>
          </a>
        </article>
      </Reveal>
    </li>
  );
}

export default function Multiverse() {
  return (
    <section id="multiverse" className="act act--tall">
      <div className="wrap">
        <Head issue="03" title="The Multiverse" />

        <Reveal>
          <p className="lead verse__intro">
            Three builds from three different corners of the stack — a signed
            blockchain client, a published malware classifier, and an LLM study
            assistant that streams.
          </p>
        </Reveal>

        <ul className="verse">
          {PROJECTS.map((p, i) => (
            <Cover p={p} index={i} key={p.n} />
          ))}
        </ul>

        <Boom style={{ top: "4%", left: "6%" }}>SNIKT!</Boom>
      </div>
    </section>
  );
}
