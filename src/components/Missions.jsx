/* ============================================================
   02 · MISSION LOG — the timeline, strung along a silk spine
   that draws itself as you scroll past it.
   ============================================================ */

import React, { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { EXPERIENCE } from "../data/site.js";
import { Head, Reveal, Panel, Boom } from "./common/Bits.jsx";

const ACCENTS = ["red", "blue", "cyan"];

export default function Missions() {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // The spine draws in step with the scrollbar
        gsap.fromTo(
          ".log__spineFill",
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: {
              trigger: ".log",
              start: "top 72%",
              end: "bottom 78%",
              scrub: 0.6,
            },
          }
        );

        // Nodes pop as the silk reaches them
        gsap.utils.toArray(".log__node").forEach((node) => {
          gsap.fromTo(
            node,
            { scale: 0.2, opacity: 0 },
            {
              scale: 1,
              opacity: 1,
              duration: 0.5,
              ease: "back.out(3)",
              scrollTrigger: { trigger: node, start: "top 78%", once: true },
            }
          );
        });

        // Entries swing in from their own side of the spine
        gsap.utils.toArray(".log__row").forEach((row, i) => {
          gsap.from(row.querySelector(".log__card"), {
            opacity: 0,
            x: i % 2 ? 90 : -90,
            z: -300,
            rotateY: i % 2 ? -30 : 30,
            duration: 1.05,
            ease: "expo.out",
            clearProps: "transform,opacity,willChange",
            scrollTrigger: { trigger: row, start: "top 82%", once: true },
          });
        });

        return () => ScrollTrigger.getAll().forEach((t) => t.kill());
      });

      return () => mm.revert();
    }, ref);

    return () => ctx.revert();
  }, []);

  return (
    <section id="missions" className="act" ref={ref}>
      <div className="wrap">
        <Head issue="02" title="Mission Log" />

        <ol className="log">
          <span className="log__spine" aria-hidden="true">
            <span className="log__spineFill" />
          </span>

          {EXPERIENCE.map((x, i) => (
            <li className="log__row" key={x.company}>
              <span className={`log__node a-${ACCENTS[i % 3]}`} aria-hidden="true">
                <span />
              </span>

              <div className="log__meta">
                <span className="mono log__period">{x.period}</span>
                <span className="log__kind">{x.kind}</span>
              </div>

              <Panel accent={ACCENTS[i % 3]} className="log__card">
                <div className="log__cardHead">
                  <h3 className="log__company">{x.company}</h3>
                  <p className="log__role">{x.role}</p>
                </div>

                <ul className="log__details">
                  {x.details.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>

                <ul className="chips log__tags">
                  {x.tags.map((t) => (
                    <li className="chip" key={t}>
                      {t}
                    </li>
                  ))}
                </ul>
              </Panel>
            </li>
          ))}
        </ol>

        <Reveal className="log__foot">
          <p className="mono log__footNote">
            Three postings · two research labs · one bank
          </p>
        </Reveal>

        <Boom style={{ top: "8%", right: "3%" }}>KRAK!</Boom>
      </div>
    </section>
  );
}
