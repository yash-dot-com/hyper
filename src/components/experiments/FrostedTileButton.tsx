"use client";

import type { ButtonHTMLAttributes, CSSProperties } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  label?: string;
  colors?: readonly [string, string, string];
  size?: CSSProperties["width"];
};

export function FrostedTileButton({
  label = "Bloom", colors = ["#287940", "#65db13", "#d4ee16"], size = 220,
  style, className = "", type = "button", ...props
}: Props) {
  return <button {...props} type={type} className={`frosted-tile-button ${className}`}
    style={{ "--fern": colors[0], "--shoot": colors[1], "--pollen": colors[2], width: size, ...style } as CSSProperties}>
    <span className="ft-panes" aria-hidden="true">
      {Array.from({length:16}, (_,i)=><i key={i} style={{backgroundPosition:`${(i%8)*100/7}% ${Math.floor(i/8)*100}%`}}/>)}
    </span>
    <span className="ft-label">{label || "Bloom"}</span>
    <style>{`
      .frosted-tile-button {
        --field: radial-gradient(ellipse at 66% 72%,var(--pollen),transparent 33%),
          radial-gradient(ellipse at 40% 67%,var(--shoot),transparent 51%),
          radial-gradient(ellipse at 57% 41%,var(--fern),transparent 64%);
        display:inline-grid; place-items:center; position:relative; isolation:isolate;
        max-width:100%; min-height:44px; aspect-ratio:4 / 1; overflow:hidden; border:0; padding:8px 12px; border-radius:0; background:transparent;
        cursor:pointer; font:inherit; transition:transform .18s ease;
      }
      .frosted-tile-button::before {content:"";position:absolute;inset:0;background:var(--field);filter:blur(9px);z-index:-1}
      .ft-panes {position:absolute;inset:0;display:grid;grid-template:repeat(2,1fr)/repeat(8,1fr);pointer-events:none}
      .ft-panes i {border-radius:0;background-color:#f1f4ec99;background-image:var(--field);background-size:770% 195%;
        box-shadow:inset 1px 1px 2px #ffffffaa,inset -1px -1px 2px #ffffff66,inset 2px 3px 8px #ecffdf42;
        transition:filter .22s ease}
      .ft-label {position:relative;max-width:90%;overflow-wrap:anywhere;text-shadow:0 1px 3px #fffc;
        background:radial-gradient(ellipse,#ffffffe0,transparent 73%);padding:.12em .65em;color:#153321;font-weight:600;line-height:1.2}
      .frosted-tile-button:hover .ft-panes i {filter:brightness(1.07)}
      .frosted-tile-button:active {transform:scale(.97)}
      .frosted-tile-button:focus-visible {outline:3px solid #315d45;outline-offset:5px}
      @media(prefers-reduced-motion:reduce){.frosted-tile-button,.ft-panes i {transition:none}.frosted-tile-button:active{transform:none}}
    `}</style>
  </button>;
}
