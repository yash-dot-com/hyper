"use client";

import { useRef, useState } from "react";
import type { CSSProperties } from "react";

const cards = [
  { name: "A little unexpected.", color: "#e8edcb", label: "FIELD NOTES — 001" },
  { name: "Make room for play.", color: "#e8ddf2", label: "FIELD NOTES — 002" },
  { name: "Stay a little curious.", color: "#f5d7bd", label: "FIELD NOTES — 003" },
];

export function CardStack({ playing = true }: { playing?: boolean }) {
  const [active, setActive] = useState(0);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  function advance() {
    const next = (active + 1) % cards.length;
    setActive(next);
    requestAnimationFrame(() => buttons.current[next]?.focus({ preventScroll: true }));
  }
  return (
    <div className="stack-study" style={{ "--stack-duration": playing ? "450ms" : "0ms" } as CSSProperties}>
      {cards.map((card, i) => {
        const position = (i - active + cards.length) % cards.length;
        return (
          <button ref={(node) => { buttons.current[i] = node; }} key={card.label} className="study-card" tabIndex={position === 0 ? 0 : -1} aria-hidden={position !== 0} aria-label={`${card.name} Show next card`} onClick={advance} style={{ background: card.color, zIndex: 3 - position, transform: `translateY(${-position * 12}px) rotate(${position * 7 - 5}deg) scale(${1 - position * 0.045})` }}>
            <span className="study-card-label">{card.label}</span>
            <span className="study-card-flower" aria-hidden="true">✳</span>
            <strong>{card.name}</strong>
            <span className="study-card-foot">Click to explore <span aria-hidden="true">↗</span></span>
          </button>
        );
      })}
      <style>{`
        .stack-study { position: relative; width: 240px; height: 270px; }
        .study-card { position: absolute; inset: 0; padding: 23px; display: flex; flex-direction: column; text-align: left; border: 1px solid #29292918; border-radius: 13px; box-shadow: 0 9px 20px #2424240a; color: #30352b; cursor: pointer; transition: transform var(--stack-duration) cubic-bezier(.2,.8,.2,1); font-family: inherit; }
        .study-card:focus-visible { outline: 2px solid #333; outline-offset: 5px; }
        .study-card-label { font: 9px monospace; letter-spacing: 1px; }
        .study-card-flower { font-size: 68px; line-height: 1.2; margin: 15px 0 5px; }
        .study-card strong { font-size: 26px; line-height: 1.1; font-weight: 500; letter-spacing: -1px; }
        .study-card-foot { margin-top: auto; display: flex; justify-content: space-between; font-size: 10px; }
        @media (prefers-reduced-motion: reduce) { .study-card { transition: none; } }
      `}</style>
    </div>
  );
}
