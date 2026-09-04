/* ============================================================
   01 · THE MASK — who is behind it, and what he builds with.
   The portrait panel is a real 3D object: pointer position drives
   rotateX/rotateY on a preserve-3d stack with parallax layers.
   ============================================================ */

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { PROFILE, STACK, TRAITS } from "../data/site.js";
import { Head, Reveal, Panel, Boom, WebCorners, Sense } from "./common/Bits.jsx";
import portrait from "../assets/About/portrait.png";

function TiltPortrait() {
  const stageRef = useRef(null);
  const cardRef = useRef(null);

  useEffect(() => {
    const stage = stageRef.current;
    const card = cardRef.current;
    if (!stage || !card) return undefined;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return undefined;

    const rx = gsap.quickTo(card, "rotateX", { duration: 0.6, ease: "power3" });
    const ry = gsap.quickTo(card, "rotateY", { duration: 0.6, ease: "power3" });
    const layers = card.querySelectorAll("[data-depth]");

    const onMove = (e) => {
      const r = stage.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;

      rx(-py * 18);
      ry(px * 22);

      layers.forEach((l) => {
        const d = Number(l.dataset.depth);
        gsap.to(l, {
          x: px * d * 34,
          y: py * d * 26,
          duration: 0.7,
          ease: "power3",
          overwrite: "auto",
        });
      });
      card.style.setProperty("--gx", `${(px + 0.5) * 100}%`);
      card.style.setProperty("--gy", `${(py + 0.5) * 100}%`);
    };

    const onLeave = () => {
      rx(0);
      ry(0);
      layers.forEach((l) =>
        gsap.to(l, { x: 0, y: 0, duration: 0.9, ease: "power3" })
      );
      card.style.setProperty("--gx", "50%");
      card.style.setProperty("--gy", "50%");
    };

    stage.addEventListener("pointermove", onMove);
    stage.addEventListener("pointerleave", onLeave);
    return () => {
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div className="tilt" ref={stageRef}>
      <div className="tilt__card panel a-red" ref={cardRef}>
        <span className="halftone halftone--coarse" aria-hidden="true" />
        <WebCorners />
        <Sense />

        <div className="tilt__imgWrap" data-depth="0.3">
          <img
            className="tilt__img"
            src={portrait}
            alt={`${PROFILE.name}, software engineer`}
            width="640"
            height="800"
            loading="lazy"
            decoding="async"
          />
          <span className="tilt__ink" aria-hidden="true" />
        </div>

        <span className="tilt__glare" aria-hidden="true" />

        <span className="tilt__tag mono" data-depth="1.1">
          {PROFILE.now}
        </span>
        <span className="tilt__id" data-depth="0.75" aria-hidden="true">
          <b>SU</b>
          <i>EARTH-616</i>
        </span>
      </div>
      <span className="tilt__floor" aria-hidden="true" />
    </div>
  );
}

export default function Mask() {
  return (
    <section id="mask" className="act">
      <div className="wrap">
        <Head issue="01" title="The Mask" />

        <div className="mask__grid">
          <Reveal className="mask__media" from="left">
            <TiltPortrait />
          </Reveal>

          <div className="mask__body">
            <Reveal>
              <p className="lead mask__lead">{PROFILE.bio}</p>
            </Reveal>

            <Reveal className="mask__traits" stagger={0.08}>
              {TRAITS.map((t) => (
                <div className="mask__trait" key={t.k}>
                  <span className="mono mask__traitK">{t.k}</span>
                  <span className="mask__traitV">{t.v}</span>
                </div>
              ))}
            </Reveal>

            <div className="mask__stack">
              {STACK.map((g, i) => (
                <Reveal key={g.label} delay={i * 0.06}>
                  <Panel
                    accent={["red", "blue", "cyan"][i]}
                    corners={false}
                    className="mask__group"
                  >
                    <span className="mask__groupLabel mono">{g.label}</span>
                    <ul className="chips">
                      {g.items.map((it) => (
                        <li className="chip" key={it}>
                          {it}
                        </li>
                      ))}
                    </ul>
                  </Panel>
                </Reveal>
              ))}
            </div>
          </div>
        </div>

        <Boom style={{ bottom: "6%", left: "2%" }}>BAMF!</Boom>
      </div>
    </section>
  );
}
