/* ============================================================
   Backdrop — the always-on atmosphere: painted skyline bed,
   vignette and film grain.

   Rendered from the very first paint and kept out of <World> on
   purpose: the WebGL chunk arrives late by design, and without
   these the page would sit on flat black until it does. It is
   also the complete picture when WebGL is unavailable.
   ============================================================ */

import React from "react";

export default function Backdrop() {
  return (
    <>
      <div className="world-fallback" aria-hidden="true" />
      <div className="vignette" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />
    </>
  );
}
