/* ============================================================
   Shared comic primitives: icons, web corners, spidey-sense,
   onomatopoeia, split headlines and the 3D scroll reveal.
   ============================================================ */

import React, { useRef, useLayoutEffect, useMemo } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Run animations on wall-clock time, not frame count.
 *
 * By default GSAP clamps any frame delta over 500ms down to 33ms so that a
 * backgrounded tab does not fast-forward. On a page with a heavy WebGL
 * scene that safeguard backfires: when the GPU starves requestAnimationFrame,
 * every tween stretches by the same factor, so a 1.1s intro can take tens of
 * seconds — leaving headlines and buttons stuck at opacity 0, invisible and
 * un-hoverable, long after the page looks ready. A choppy reveal that
 * finishes on time is strictly better than a smooth one that never does.
 */
gsap.ticker.lagSmoothing(0);

/* ---------------------------------------------------------- ICONS */
const S = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export const Icon = ({ name, size = 18, ...rest }) => {
  const paths = {
    arrow: <path d="M7 17L17 7M17 7H8M17 7v9" />,
    download: <path d="M12 3v12m0 0l4-4m-4 4l-4-4M4 21h16" />,
    mail: (
      <>
        <rect x="2.5" y="4.5" width="19" height="15" rx="2" />
        <path d="M3 6l9 7 9-7" />
      </>
    ),
    github: (
      <path
        d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.9a3.4 3.4 0 0 0-.9-2.6c3-.3 6.2-1.5 6.2-6.7A5.2 5.2 0 0 0 19.9 5a4.9 4.9 0 0 0-.1-3.6s-1.1-.3-3.7 1.4a12.7 12.7 0 0 0-6.6 0C6.9 1.1 5.8 1.4 5.8 1.4A4.9 4.9 0 0 0 5.7 5a5.2 5.2 0 0 0-1.4 3.6c0 5.2 3.2 6.4 6.2 6.7a3.4 3.4 0 0 0-.9 2.6V22"
        transform="translate(0 1)"
      />
    ),
    linkedin: (
      <>
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-11h4v1.5A5 5 0 0 1 16 8z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
      </>
    ),
    external: (
      <>
        <path d="M15 3h6v6" />
        <path d="M10 14L21 3" />
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      </>
    ),
    chevron: <path d="M6 9l6 6 6-6" />,
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      {...S}
      {...rest}
    >
      {paths[name]}
    </svg>
  );
};

/* --------------------------------------------------- WEB CORNERS */
/** A quarter spider-web anchored into a panel corner. */
export const WebCorner = ({ pos = "tl" }) => (
  <svg
    className={`web-corner web-corner--${pos}`}
    viewBox="0 0 100 100"
    aria-hidden="true"
    focusable="false"
  >
    <g stroke="currentColor" fill="none" strokeWidth="1.1">
      <path d="M0 0 L100 0M0 0 L94 34M0 0 L74 74M0 0 L34 94M0 0 L0 100" />
      <path d="M26 0 Q20 20 0 26" opacity="0.9" />
      <path d="M52 0 Q40 40 0 52" opacity="0.7" />
      <path d="M80 0 Q62 62 0 80" opacity="0.5" />
    </g>
  </svg>
);

export const WebCorners = () => (
  <>
    <WebCorner pos="tl" />
    <WebCorner pos="br" />
  </>
);

/* -------------------------------------------------- SPIDEY SENSE */
/** The three radiating arcs that fire when a panel is focused. */
export const Sense = () => (
  <svg
    className="sense"
    viewBox="0 0 200 200"
    preserveAspectRatio="none"
    aria-hidden="true"
    focusable="false"
  >
    <path d="M40 78 Q100 26 160 78" />
    <path d="M26 96 Q100 30 174 96" />
    <path d="M12 116 Q100 34 188 116" />
  </svg>
);

/* --------------------------------------------------- PANEL SHELL */
export const Panel = ({
  as: Tag = "div",
  accent = "red",
  lift = true,
  corners = true,
  sense = true,
  halftone = true,
  className = "",
  children,
  ...rest
}) => (
  <Tag
    className={`panel a-${accent} ${lift ? "panel--lift" : ""} ${className}`}
    {...rest}
  >
    {halftone && <span className="halftone" aria-hidden="true" />}
    {corners && <WebCorners />}
    {sense && <Sense />}
    {children}
  </Tag>
);

/* -------------------------------------------------- SECTION HEAD */
export const Head = ({ issue, title, kicker }) => (
  <Reveal className="head" stagger={0.07}>
    <span className="head__issue" aria-hidden="true">
      {issue}
    </span>
    <h2 className="head__title">
      {title}
      {kicker && <span className="head__kicker">{kicker}</span>}
    </h2>
    <span className="head__rule" aria-hidden="true" />
  </Reveal>
);

/* ------------------------------------------------ SPLIT HEADLINE */
/**
 * Splits a string into per-character spans for staggered motion.
 * The container carries the accessible name; the spans are hidden
 * from assistive tech so nothing is announced letter by letter.
 */
export const Split = ({ text, className = "", tag: Tag = "span" }) => {
  const chars = useMemo(() => Array.from(text), [text]);
  return (
    <Tag className={`split ${className}`}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {chars.map((c, i) => (
          <span className="split__c" key={`${c}-${i}`}>
            {c}
          </span>
        ))}
      </span>
    </Tag>
  );
};

/* ------------------------------------------------------ ONOMATOPOEIA */
/** Comic sound effect that snaps in when its section scrolls into view. */
export const Boom = ({ children, style, className = "" }) => {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap
          .timeline({
            scrollTrigger: { trigger: el, start: "top 82%", once: true },
          })
          .to(el, {
            opacity: 1,
            scale: 1,
            rotate: -7,
            duration: 0.42,
            ease: "back.out(2.4)",
          })
          .to(el, { scale: 1.06, duration: 0.1, yoyo: true, repeat: 1 })
          .to(el, { opacity: 0.16, duration: 0.8, delay: 0.5 });
      });
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(el, { opacity: 0.2, scale: 1, rotate: -7 });
      });
      return () => mm.revert();
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <span ref={ref} className={`boom ${className}`} style={style} aria-hidden="true">
      {children}
    </span>
  );
};

/* --------------------------------------------------- 3D REVEAL */
/**
 * Scroll reveal that moves elements through real Z depth.
 * Under prefers-reduced-motion the final state renders immediately.
 */
export const Reveal = ({
  children,
  className = "",
  as: Tag = "div",
  delay = 0,
  stagger = 0,
  from = "up",
  distance = 200,
  ...rest
}) => {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const targets = stagger ? Array.from(el.children) : el;
        if (!targets || (Array.isArray(targets) && !targets.length)) return;

        // Deliberately NOT setting transform-style: preserve-3d here. The
        // wrapper's own z/rotateY already resolve against .act's perspective
        // via .wrap, and preserve-3d on the wrapper puts a direct child
        // (.clip, .wire) into a 3D rendering context where Chrome mis-hit-
        // tests it — the link stops responding to hover and clicks.
        gsap.from(targets, {
          opacity: 0,
          y: from === "up" ? 54 : 0,
          x: from === "left" ? -60 : from === "right" ? 60 : 0,
          z: -distance,
          rotateX: from === "up" ? -22 : 0,
          rotateY: from === "left" ? 26 : from === "right" ? -26 : 0,
          duration: 1.1,
          delay,
          stagger,
          ease: "expo.out",
          // Leave no inline transform behind. A lingering matrix3d keeps a
          // stacking context and a 3D-rotated hit area on the element long
          // after the reveal is visually finished.
          clearProps: "transform,opacity,willChange",
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        });
      });

      return () => mm.revert();
    }, ref);

    return () => ctx.revert();
  }, [delay, stagger, from, distance]);

  return (
    <Tag ref={ref} className={className} {...rest}>
      {children}
    </Tag>
  );
};

export { gsap, ScrollTrigger };
