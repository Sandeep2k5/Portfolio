/* ============================================================
   00 · ORIGIN — the opening splash page.
   ============================================================ */

import React, { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { PROFILE, STATS } from "../data/site.js";
import { Icon, Split, Boom, Panel } from "./common/Bits.jsx";
import resumePdf from "../assets/Hero/Sandeep_Resume.pdf";

export default function Hero() {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const play = () => {
          // clearProps matters beyond tidiness: GSAP leaves an inline matrix3d behind
          // after animating z, and a 3D-transformed element inside a preserve-3d
          // parent stops being hit-tested — the button looks finished but no longer
          // takes hover or clicks. Clearing returns it to a plain, interactive box.
          const tl = gsap.timeline({
            defaults: { ease: "expo.out", clearProps: "transform,opacity,willChange" },
          });

          tl.from(".hero__stamp", { opacity: 0, y: 24, duration: 0.7 })
            .from(
              ".hero__line--1 .split__c",
              {
                opacity: 0,
                yPercent: 120,
                rotateX: -78,
                z: -180,
                duration: 0.95,
                stagger: 0.028,
              },
              "-=0.35"
            )
            .from(
              ".hero__line--2 .split__c",
              {
                opacity: 0,
                yPercent: 120,
                rotateX: -78,
                z: -180,
                duration: 0.95,
                stagger: 0.022,
              },
              "-=0.72"
            )
            .from(".hero__rule", { scaleX: 0, duration: 0.9 }, "-=0.55")
            .from(
              ".hero__lead, .hero__actions > *",
              { opacity: 0, y: 30, z: -120, duration: 0.8, stagger: 0.09 },
              "-=0.6"
            )
            .from(
              ".hero__stat",
              {
                opacity: 0,
                y: 46,
                z: -280,
                rotateX: -35,
                duration: 0.9,
                stagger: 0.09,
              },
              "-=0.55"
            )
            .from(".hero__cue", { opacity: 0, duration: 0.6 }, "-=0.3");

          return tl;
        };

        // Wait for the preloader to tear away so nothing plays off-screen
        let tl;
        const start = () => {
          tl = play();
        };
        if (document.body.classList.contains("is-booting")) {
          window.addEventListener("sv:entered", start, { once: true });
        } else {
          start();
        }
        return () => {
          window.removeEventListener("sv:entered", start);
          tl?.kill();
        };
      });

      return () => mm.revert();
    }, ref);

    return () => ctx.revert();
  }, []);

  return (
    <section id="origin" className="act act--hero" ref={ref}>
      <div className="wrap hero">
        <span className="stamp hero__stamp a-red">
          <span className="stamp__dot" />
          {PROFILE.alias} · {PROFILE.location}
        </span>

        <h1 className="hero__title display">
          <Split text={PROFILE.first} className="hero__line hero__line--1" />
          <Split text={PROFILE.last} className="hero__line hero__line--2" />
        </h1>

        <span className="hero__rule" aria-hidden="true" />

        <p className="hero__lead lead">{PROFILE.intro}</p>

        <div className="hero__actions">
          <a href="#multiverse" className="btn" data-cursor="SWING">
            Enter the multiverse
            <Icon name="arrow" size={15} />
          </a>
          <a
            href={resumePdf}
            download="Sandeep-Uthayakumar-Resume.pdf"
            className="btn btn--ghost"
            data-cursor="GRAB"
          >
            Résumé
            <Icon name="download" size={15} />
          </a>
        </div>

        <ul className="hero__stats">
          {STATS.map((s, i) => (
            <li key={s.label} className="hero__stat">
              <Panel
                accent={["red", "blue", "cyan"][i]}
                lift
                className="hero__statPanel"
              >
                <strong className="hero__statValue">{s.value}</strong>
                <span className="hero__statLabel">{s.label}</span>
                <span className="hero__statSub mono">{s.sub}</span>
              </Panel>
            </li>
          ))}
        </ul>

        <Boom className="hero__boom" style={{ top: "16%", right: "4%" }}>
          THWIP!
        </Boom>

        <a href="#mask" className="hero__cue" aria-label="Scroll to the next chapter">
          <span className="hero__cueLine" aria-hidden="true" />
          <span className="mono">Scroll</span>
          <Icon name="chevron" size={16} />
        </a>
      </div>

      {/* kinetic band that closes the splash page.
          The wrapper clips the deliberate over-scale — putting the clip on
          .act--hero instead would force transform-style:flat and collapse
          the whole chapter's 3D stage. */}
      <div className="marquee-bleed" aria-hidden="true">
      <div className="marquee">
        <div className="marquee__track">
          {Array.from({ length: 2 }, (_, k) => (
            <React.Fragment key={k}>
              <span>C++ <em>◆</em> Python <em>◆</em> React <em>◆</em> Node.js <em>◆</em> FastAPI <em>◆</em></span>
              <span>Deep Learning <em>◆</em> Blockchain <em>◆</em> IEEE Access <em>◆</em> MERN <em>◆</em></span>
              <span>Systems <em>◆</em> Research <em>◆</em> Shipping <em>◆</em></span>
            </React.Fragment>
          ))}
        </div>
      </div>
      </div>
    </section>
  );
}
