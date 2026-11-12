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
    <style>{`
      .hype-light{opacity:0;transition:opacity .32s ease,translate .22s ease-out}
      .hype-luminous:hover>.hype-light,.hype-luminous:focus-within>.hype-light{opacity:1}
      .hype-light svg{display:block;width:100%;height:100%;filter:blur(7px)}
      .hype-luminous:is(:hover,:focus-within) .hype-light svg{animation:hype-caustic 3.8s ease-in-out infinite alternate}
      @keyframes hype-caustic{from{transform:rotate(-12deg) scale(.95,1.08)}to{transform:rotate(9deg) skewX(-9deg) scale(1.12,.9)}}
      @media(prefers-reduced-motion:reduce){.hype-luminous .hype-light{transition:none}.hype-luminous .hype-light svg{animation:none}}
    `}</style>
    <span aria-hidden="true" className="hype-light" style={{position:"absolute",inset:0,zIndex:-1,pointerEvents:"none",
      translate:"calc(var(--light-x,50%) - 50%) calc(var(--light-y,45%) - 45%)",mixBlendMode:"screen"}}>
      <svg viewBox="0 0 160 100" preserveAspectRatio="none">
        <path fill={rim} opacity=".48" d="M19 57C32 45 48 53 62 37S80 19 95 24C108 29 108 43 128 43C115 57 99 48 88 54S73 75 58 70C46 66 36 55 19 57Z"/>
        <path fill="#fff" opacity=".55" d="M41 57C61 59 64 31 83 31C96 31 96 43 106 46C94 46 90 38 82 40C68 43 62 62 41 57Z"/>
      </svg>
    </span>
    {children}
  </div>;
}
