"use client";

import type { ReactNode, CSSProperties } from "react";

const finishes = {
  bloom: ["#c8dfff","#f65eaa","#ff8e56","#ac91e4"],
  cobalt: ["#7ca4ff","#124acd","#16b8ff","#112c77"],
  amber: ["#ffedaf","#ffbd34","#fff0bd","#d89737"],
  fern: ["#bcdfa0","#187928","#4ad91a","#0d3820"],
  orchid: ["#ecbcff","#863bce","#e064ff","#433873"],
  ember: ["#ffbd8e","#ec591f","#ffb44a","#a03c24"],
} as const;
export type LightFinish = keyof typeof finishes;
export const lightFinishes = Object.keys(finishes) as LightFinish[];

export function LuminousSurface({ finish="bloom", children, style }: {
  finish?: LightFinish; children: ReactNode; style?: CSSProperties;
}) {
  const [rim,body,core,shadow] = finishes[finish];
  return <div className="hype-luminous" onPointerMove={event=>{
    if(event.pointerType==="touch" || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el=event.currentTarget, r=el.getBoundingClientRect();
    el.style.setProperty("--light-x", ((event.clientX-r.left)/r.width*100)+"%");
    el.style.setProperty("--light-y", ((event.clientY-r.top)/r.height*100)+"%");
  }} style={{
    position:"relative", isolation:"isolate", overflow:"hidden", borderRadius:"1.55em", padding:"1.6em 1.35em",
    color:"#fff", textShadow:"0 1px 4px #1118", background:[
      `radial-gradient(ellipse at 48% 46%, ${core} 0%, transparent 51%)`,
      `radial-gradient(ellipse at 58% 15%, ${body} 6%, transparent 69%)`,
      `linear-gradient(145deg,${rim},${body} 42%,${shadow} 79%,${rim})`,
    ].join(","),boxShadow:`inset 0 2px 2px #ffffffad,inset 0 0 16px 3px ${rim}, inset 0 -6px 15px ${rim},0 6px 14px -7px #0009`, ...style,
  }}>
    <style>{`.hype-luminous .hype-light{opacity:0;transition:opacity .3s ease}.hype-luminous:hover>.hype-light,.hype-luminous:focus-within>.hype-light{opacity:1}@media(prefers-reduced-motion:reduce){.hype-luminous .hype-light{transition:none}}`}</style>
    <span aria-hidden="true" className="hype-light" style={{position:"absolute",inset:0,zIndex:-1,pointerEvents:"none",background:"radial-gradient(ellipse at var(--light-x,50%) var(--light-y,40%),#ffffff75, transparent 45%)"}}/>
    {children}
  </div>;
}
