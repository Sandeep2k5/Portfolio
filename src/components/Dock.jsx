/* ============================================================
   Dock — the floating action cluster, bottom-right.
   Copy email · jump to Signal · back to top. Hidden until the
   reader is past the hero, so it never competes with the intro.
   ============================================================ */

import React, { useCallback, useEffect, useRef, useState } from "react";
import { PROFILE } from "../data/site.js";
import { Icon } from "./common/Bits.jsx";

/** Clipboard API needs a secure context; fall back to the old trick. */
const writeClipboard = async (text) => {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through */
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.cssText = "position:fixed;top:-1000px;opacity:0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
};

const scrollTo = (target) => {
  const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ? "auto"
    : "smooth";
  if (target === "top") window.scrollTo({ top: 0, behavior });
  else document.getElementById(target)?.scrollIntoView({ behavior, block: "start" });
};

export default function Dock() {
  const [shown, setShown] = useState(false);
  const [copied, setCopied] = useState(null); // null | "ok" | "fail"
  const timer = useRef(0);

  /* reveal once the hero is behind us */
  useEffect(() => {
    const onScroll = () => setShown(window.scrollY > window.innerHeight * 0.8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = useCallback(async () => {
    const ok = await writeClipboard(PROFILE.email);
    setCopied(ok ? "ok" : "fail");
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(null), 2200);
  }, []);

  return (
    <div className={`dock ${shown ? "is-shown" : ""}`}>
      {/* Announced politely so the copy result is not silent for SR users. */}
      <p className="sr-only" role="status" aria-live="polite">
        {copied === "ok"
          ? "Email address copied to clipboard"
          : copied === "fail"
          ? "Could not copy — the address is sandeeputhayakumar@gmail.com"
          : ""}
      </p>

      <button
        type="button"
        className={`dock__btn ${copied ? `is-${copied}` : ""}`}
        onClick={copy}
        aria-label={`Copy email address, ${PROFILE.email}`}
        data-cursor={copied === "ok" ? "COPIED" : "COPY"}
      >
        <Icon name={copied === "ok" ? "check" : "copy"} size={17} />
        <span className="dock__tip mono">
          {copied === "ok" ? "Copied" : copied === "fail" ? "Copy failed" : "Copy email"}
        </span>
      </button>

      <button
        type="button"
        className="dock__btn dock__btn--cta"
        onClick={() => scrollTo("signal")}
        aria-label="Jump to contact"
        data-cursor="SEND"
      >
        <Icon name="mail" size={17} />
        <span className="dock__tip mono">Contact</span>
      </button>

      <button
        type="button"
        className="dock__btn"
        onClick={() => scrollTo("top")}
        aria-label="Back to top"
        data-cursor="UP"
      >
        <Icon name="up" size={17} />
        <span className="dock__tip mono">Top</span>
      </button>
    </div>
  );
}
