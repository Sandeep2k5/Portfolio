/* ============================================================
   04 · THE DAILY BUGLE — published research, set as newsprint.
   The one light surface in the whole site: paper stock lifted
   off the dark city so the peer-reviewed work reads as the
   headline it is.
   ============================================================ */

import React from "react";
import { PUBLICATIONS } from "../data/site.js";
import { Head, Reveal, Icon, Boom } from "./common/Bits.jsx";
import ieee from "../assets/Publications/pub-ieee.png";
import sciencedirect from "../assets/Publications/pub-sciencedirect.png";

const SHOTS = [ieee, sciencedirect];

export default function Bugle() {
  return (
    <section id="bugle" className="act">
      <div className="wrap">
        <Head issue="04" title="The Daily Bugle" />

        <Reveal className="press" distance={280}>
          <div className="press__masthead">
            <span className="press__ruleTop" aria-hidden="true" />
            <p className="press__strap mono">
              Late edition · Peer reviewed · 2025
            </p>
            <h3 className="press__name">THE DAILY BUGLE</h3>
            <p className="press__sub mono">
              Two papers · Deep learning &amp; sequence modelling
            </p>
            <span className="press__ruleBottom" aria-hidden="true" />
          </div>
        </Reveal>

        <ul className="press__grid">
          {PUBLICATIONS.map((pub, i) => (
            <li key={pub.title}>
              <Reveal from={i % 2 ? "right" : "left"} distance={300}>
                <a
                  className={`clip clip--${i % 2 ? "b" : "a"}`}
                  href={pub.source}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor="READ"
                >
                  <span className="clip__tape" aria-hidden="true" />

                  <div className="clip__thumb">
                    <img
                      src={SHOTS[i]}
                      alt=""
                      loading="lazy"
                      decoding="async"
                    />
                    <span className="clip__thumbInk" aria-hidden="true" />
                  </div>

                  <div className="clip__body">
                    <span className="clip__venue mono">
                      {pub.journal} · {pub.kind} · {pub.year}
                    </span>
                    <h4 className="clip__title">{pub.title}</h4>
                    <p className="clip__blurb">{pub.blurb}</p>
                    <span className="clip__cta">
                      Read the paper
                      <Icon name="arrow" size={14} />
                      <span className="sr-only">— opens in a new tab</span>
                    </span>
                  </div>
                </a>
              </Reveal>
            </li>
          ))}
        </ul>

        <Boom style={{ bottom: "10%", right: "5%" }}>EXTRA!</Boom>
      </div>
    </section>
  );
}
