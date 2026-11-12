"use client";

import type { CSSProperties } from "react";

/** Twelve translucent planes, one continuous loop. */
export function Chromatic({ playing = true }: { playing?: boolean }) {
  return (
    <div className="chromatic-study" role="img" aria-label="A sculptural fan of translucent lilac and coral planes" style={{ "--ribbon-state": playing ? "running" : "paused" } as CSSProperties}>
      {Array.from({ length: 12 }, (_, i) => (
        <div className="chromatic-plane" key={i} style={{ "--i": i, background: `hsla(${255 + i * 9}, 78%, 72%, 0.28)` } as CSSProperties} />
      ))}
      <style>{`
        .chromatic-study { width: 310px; height: 300px; position: relative; perspective: 800px; }
        .chromatic-plane { position: absolute; width: 150px; height: 210px; left: 80px; top: 45px; border: 1px solid #ffffff80; border-radius: 65px 65px 24px 24px; transform-origin: center 85%; transform: rotate(calc((var(--i) - 5.5) * 14deg)); animation: chromatic-breathe 6s ease-in-out infinite alternate; animation-delay: calc(var(--i) * -0.12s); animation-play-state: var(--ribbon-state); }
        @keyframes chromatic-breathe { to { transform: rotate(calc((var(--i) - 5.5) * 7deg)) rotateY(30deg) translateY(-15px); } }
        @media (prefers-reduced-motion: reduce) { .chromatic-plane { animation: none; } }
      `}</style>
    </div>
  );
}
