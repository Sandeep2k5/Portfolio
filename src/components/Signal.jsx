/* ============================================================
   05 · SIGNAL — the close. Camera has risen above the skyline,
   so this chapter is the spider-signal thrown at the clouds.
   ============================================================ */

import React from "react";
import { PROFILE, LINKS } from "../data/site.js";
import { Head, Reveal, Icon, Split, Panel } from "./common/Bits.jsx";
import resumePdf from "../assets/Hero/Sandeep_Resume.pdf";

export default function Signal() {
  return (
    <footer id="signal" className="act act--tall signal">
      <div className="wrap">
        <Head issue="05" title="Signal" />

        <div className="signal__beam" aria-hidden="true">
          <svg viewBox="0 0 200 200">
            <g stroke="currentColor" fill="none" strokeWidth="1">
              <circle cx="100" cy="100" r="94" opacity="0.35" />
              <circle cx="100" cy="100" r="70" opacity="0.5" />
              <circle cx="100" cy="100" r="46" opacity="0.7" />
              <path d="M100 6 L100 194M6 100 L194 100M30 30 L170 170M170 30 L30 170" opacity="0.28" />
            </g>
          </svg>
        </div>

        <Reveal className="signal__headWrap">
          <p className="stamp a-amber signal__stamp">
            <span className="stamp__dot" />
            Open to conversations
          </p>
          <h3 className="signal__title display">
            <Split text="LET'S BUILD" className="signal__line" />
            <Split text="SOMETHING" className="signal__line" />
            <Split text="WORTH SHIPPING." className="signal__line signal__line--accent" />
          </h3>
        </Reveal>

        <Reveal>
          <p className="lead signal__lead">
            Roles, collaborations, research, or a hard problem that needs a
            second pair of hands — the fastest way in is email.
          </p>
        </Reveal>

        <ul className="signal__links">
          {LINKS.map((l, i) => (
            <li key={l.label}>
              <Reveal delay={i * 0.06}>
                <a
                  className="wire"
                  href={l.href}
                  target={l.icon === "mail" ? undefined : "_blank"}
                  rel={l.icon === "mail" ? undefined : "noopener noreferrer"}
                  data-cursor="SEND"
                >
                  <span className="wire__icon" aria-hidden="true">
                    <Icon name={l.icon} size={20} />
                  </span>
                  <span className="wire__label mono">{l.label}</span>
                  <span className="wire__value">{l.value}</span>
                  <span className="wire__arrow" aria-hidden="true">
                    <Icon name="arrow" size={18} />
                  </span>
                </a>
              </Reveal>
            </li>
          ))}
        </ul>

        <Reveal className="signal__ctaRow" stagger={0.08}>
          <a className="btn" href={`mailto:${PROFILE.email}`} data-cursor="SEND">
            Start a conversation
            <Icon name="mail" size={15} />
          </a>
          <a
            className="btn btn--ghost"
            href={resumePdf}
            download="Sandeep-Uthayakumar-Resume.pdf"
            data-cursor="GRAB"
          >
            Download résumé
            <Icon name="download" size={15} />
          </a>
        </Reveal>

        <Reveal className="signal__colophon">
          <Panel accent="red" corners={false} sense={false} className="signal__card">
            <span className="mono">© {new Date().getFullYear()} {PROFILE.name}</span>
            <span className="mono signal__built">
              React · three.js · GSAP · hand-written GLSL
            </span>
            <a className="signal__top" href="#origin" data-cursor="UP">
              Back to the top
              <Icon name="arrow" size={14} />
            </a>
          </Panel>
        </Reveal>
      </div>
    </footer>
  );
}
