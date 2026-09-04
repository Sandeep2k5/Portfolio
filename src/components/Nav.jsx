/* ============================================================
   Nav — fixed header, chapter rail and the mobile web overlay.
   Active chapter comes from the `sv:chapter` event World emits.
   ============================================================ */

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { SECTIONS, PROFILE } from "../data/site.js";
import { Icon } from "./common/Bits.jsx";
import resumePdf from "../assets/Hero/Sandeep_Resume.pdf";

export default function Nav() {
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const [lifted, setLifted] = useState(false);
  const overlayRef = useRef(null);
  const barRef = useRef(null);

  /* active chapter */
  useEffect(() => {
    const onChapter = (e) => setActive(e.detail.index);
    window.addEventListener("sv:chapter", onChapter);
    return () => window.removeEventListener("sv:chapter", onChapter);
  }, []);

  /* header condenses after the hero */
  useEffect(() => {
    const onScroll = () => setLifted(window.scrollY > window.innerHeight * 0.55);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* scroll strand fill */
  useEffect(() => {
    const el = barRef.current;
    if (!el) return undefined;
    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const max = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight
      );
      el.style.transform = `scaleY(${window.scrollY / max})`;
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  /* overlay open/close + focus trap essentials */
  useEffect(() => {
    const node = overlayRef.current;
    if (!node) return undefined;

    if (open) {
      document.body.style.overflow = "hidden";
      gsap.set(node, { display: "grid" });
      gsap.fromTo(
        node,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.3, ease: "power2.out" }
      );
      gsap.fromTo(
        node.querySelectorAll(".menu__item"),
        { opacity: 0, y: 40, z: -220, rotateX: -35 },
        {
          opacity: 1,
          y: 0,
          z: 0,
          rotateX: 0,
          duration: 0.7,
          stagger: 0.06,
          ease: "expo.out",
          clearProps: "transform,willChange",
        }
      );
      node.querySelector("a")?.focus();
    } else {
      document.body.style.overflow = "";
      gsap.to(node, {
        autoAlpha: 0,
        duration: 0.25,
        onComplete: () => gsap.set(node, { display: "none" }),
      });
    }

    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const go = (id) => (e) => {
    e.preventDefault();
    setOpen(false);
    document.getElementById(id)?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      block: "start",
    });
  };

  return (
    <>
      {/* ---------- header ---------- */}
      <header className={`nav ${lifted ? "nav--lifted" : ""}`}>
        <a href="#origin" className="nav__mark" onClick={go("origin")} aria-label={`${PROFILE.name} — back to top`}>
          <svg viewBox="0 0 44 44" aria-hidden="true">
            <path
              d="M22 2 L38 11 L38 33 L22 42 L6 33 L6 11 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
            />
            <path
              d="M22 2 L22 42M6 11 L38 33M38 11 L6 33M22 22 L38 11M22 22 L6 11M22 22 L38 33M22 22 L6 33"
              stroke="currentColor"
              strokeWidth="0.55"
              opacity="0.55"
            />
            <circle cx="22" cy="22" r="4.6" fill="currentColor" />
          </svg>
          <span className="nav__markText">SU</span>
        </a>

        <nav className="nav__links" aria-label="Sections">
          {SECTIONS.map((s, i) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              onClick={go(s.id)}
              className={`nav__link ${i === active ? "is-active" : ""}`}
              aria-current={i === active ? "true" : undefined}
            >
              <span className="nav__num">{s.issue}</span>
              {s.label}
            </a>
          ))}
        </nav>

        <div className="nav__end">
          <a
            className="btn btn--sm"
            href={resumePdf}
            download="Sandeep-Uthayakumar-Resume.pdf"
            data-cursor="GRAB"
          >
            Résumé
            <Icon name="download" size={14} />
          </a>
          <button
            className="nav__burger"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="web-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            data-cursor={open ? "SHUT" : "OPEN"}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      {/* ---------- scroll strand ---------- */}
      <div className="strand" aria-hidden="true">
        <span className="strand__fill" ref={barRef} />
      </div>

      {/* ---------- chapter rail ---------- */}
      <nav className="rail" aria-label="Chapter navigation">
        {SECTIONS.map((s, i) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            onClick={go(s.id)}
            className={`rail__node ${i === active ? "is-active" : ""}`}
            aria-current={i === active ? "true" : undefined}
          >
            <span className="rail__label">{s.label}</span>
            <span className="rail__dot" aria-hidden="true" />
            <span className="sr-only">{`Issue ${s.issue} — ${s.label}`}</span>
          </a>
        ))}
      </nav>

      {/* ---------- mobile overlay ---------- */}
      <div
        className="menu"
        id="web-menu"
        ref={overlayRef}
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        style={{ display: "none" }}
      >
        <svg className="menu__web" viewBox="0 0 100 100" aria-hidden="true" preserveAspectRatio="none">
          <g stroke="currentColor" fill="none" strokeWidth="0.25">
            <path d="M0 0 L100 100M100 0 L0 100M50 0 L50 100M0 50 L100 50" />
            <path d="M50 50 m-40 0 a40 40 0 1 0 80 0 a40 40 0 1 0 -80 0" />
            <path d="M50 50 m-26 0 a26 26 0 1 0 52 0 a26 26 0 1 0 -52 0" />
            <path d="M50 50 m-13 0 a13 13 0 1 0 26 0 a13 13 0 1 0 -26 0" />
          </g>
        </svg>

        {SECTIONS.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            onClick={go(s.id)}
            className="menu__item"
          >
            <span className="menu__num">{s.issue}</span>
            <span className="menu__label">{s.title}</span>
            <Icon name="arrow" size={22} />
          </a>
        ))}

        <a
          className="menu__item menu__item--cta"
          href={resumePdf}
          download="Sandeep-Uthayakumar-Resume.pdf"
        >
          <span className="menu__num">06</span>
          <span className="menu__label">Résumé</span>
          <Icon name="download" size={22} />
        </a>
      </div>
    </>
  );
}
