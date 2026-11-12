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
      @keyframes hype-caustic{from{transform:rotate(-3deg) scale(.98,1.02)}to{transform:rotate(3deg) scale(1.03,.99)}}
      @media(prefers-reduced-motion:reduce){.hype-luminous .hype-light{transition:none}.hype-luminous .hype-light svg{animation:none}}
    `}</style>
    <span aria-hidden="true" className="hype-light" style={{position:"absolute",inset:0,zIndex:-1,pointerEvents:"none",
      translate:"calc(var(--light-x,50%) - 50%) calc(var(--light-y,45%) - 45%)",mixBlendMode:"screen"}}>
      <svg viewBox="0 0 160 100" preserveAspectRatio="none">
        <path fill={rim} opacity=".48" d="M27 50C26 32 45 19 66 20C81 21 91 16 105 20C125 24 136 39 133 55C131 72 112 81 94 79C78 77 66 83 50 76C36 71 27 62 27 50Z"/>
        <path fill="#fff" opacity=".32" d="M49 47C51 34 66 29 80 30C98 29 111 38 111 49C109 61 93 66 79 64C63 65 48 59 49 47Z"/>
      </svg>
    </span>
    {children}
  </div>;
}
