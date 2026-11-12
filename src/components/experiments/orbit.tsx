"use client";

import type { CSSProperties } from "react";

/** A self-contained, responsive orbital study. No animation dependencies. */
export function Orbit({ playing = true }: { playing?: boolean }) {
  return (
    <div className="orbit-study" style={{ "--orbit-state": playing ? "running" : "paused" } as CSSProperties}>
      <svg viewBox="0 0 520 380" role="img" aria-label="Black satellites orbiting an amber sun on three intersecting paths">
        <g transform="translate(260 190)">
          {[0, 60, 120].map((angle) => (
            <g key={angle} transform={`rotate(${angle})`}>
              <ellipse rx="160" ry="65" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.25" />
            </g>
          ))}
          <circle r="45" fill="#f5b729" />
          <circle r="36" fill="none" stroke="#dd9e16" strokeWidth="0.7" />
          <circle r="2.5" fill="#78540c" />
          {[0, 60, 120].map((angle, index) => (
            <g key={angle} transform={`rotate(${angle})`}>
              <g className="orbit-satellite" style={{ animationDelay: `${index * -4}s` }}>
                <circle r={index === 1 ? 8 : 6} fill="currentColor" />
                <circle r="12" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
              </g>
            </g>
          ))}
          <path d="M-205 0h10m-5-5v10M195 0h10m-5-5v10M0-115v10m-5-5h10M0 105v10m-5-5h10" stroke="currentColor" opacity="0.3" strokeWidth="0.7" />
        </g>
      </svg>
      <style>{`
        .orbit-study { width: min(100%, 520px); color: #242424; }
        .orbit-study svg { display: block; width: 100%; overflow: visible; }
        .orbit-satellite { offset-path: path("M160,0 A160,65 0 1,1 -160,0 A160,65 0 1,1 160,0"); animation: satellite-travel 12s linear infinite; animation-play-state: var(--orbit-state); }
        @keyframes satellite-travel { to { offset-distance: 100%; } }
        @media (prefers-reduced-motion: reduce) { .orbit-satellite { animation: none; offset-distance: 22%; } }
      `}</style>
    </div>
  );
}
