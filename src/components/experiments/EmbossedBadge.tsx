"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

const finishes = {
  branding: ["#e2f3ff","#cceaff","#95c8f0","#337cca"],
  website: ["#f1ffa5","#e6fa71","#afd05b","#577b12"],
  interface: ["#dfffe7","#bff8bc","#87cea1","#167f64"],
} as const;
export type BadgeFinish = keyof typeof finishes;
export const badgeFinishes = Object.keys(finishes) as BadgeFinish[];

export function EmbossedBadge({finish="branding",label=finish,onClick,compact=false,icon,className}:{
  finish?:BadgeFinish; label?:string; onClick?:()=>void; compact?:boolean; icon?:ReactNode; className?:string;
}) {
  const [top,base,edge,ink]=finishes[finish];
  const still=useReducedMotion();
  const Element=onClick?motion.button:motion.span;
  return <Element className={className} type={onClick?"button":undefined} onClick={onClick}
    initial="rest" animate="rest" whileHover="lit" whileFocus="lit" whileTap="pressed"
    variants={{rest:{y:0},lit:{y:0},pressed:still?{}:{y:.75}}}
    transition={{duration:.14,ease:"easeOut"}}
    style={{display:"inline-flex",position:"relative",alignItems:"center",gap:compact?8:10,minHeight:compact?44:undefined,padding:"8px 17px",borderRadius:13,
      background:`linear-gradient(174deg,${top},${base})`,border:`1px solid ${edge}`,color:ink,
      boxShadow:`inset 0 1.5px 0 #ffffffda,inset 0 -1px 1px ${edge},0 2px 0 ${edge},0 5px 6px -3px #322f3840`,
      font:compact?"600 16px/1.2 system-ui,sans-serif":"500 28px/1.2 system-ui,sans-serif",letterSpacing:"-.045em",whiteSpace:"nowrap"}}>
    {icon ? <span aria-hidden="true" style={{display:"inline-flex",filter:"drop-shadow(0 1px 0 #fffc)"}}>{icon}</span> : <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
      style={{filter:"drop-shadow(0 -0.5px 0 #25344166) drop-shadow(0 1px 0 #fff9)"}}>
      {finish==="branding"?<motion.g variants={{rest:{rotate:0,scale:1},lit:still?{}:{rotate:4,scale:1.015,transition:{duration:.16}}}} style={{transformOrigin:"14px 14px"}}>
        <path d="m14 3 3.6 7.4L25 14l-7.4 3.6L14 25l-3.6-7.4L3 14l7.4-3.6Z"/><path d="m4 4 1.4 1.5M24 4l-1.4 1.5M4 24l1.4-1.5M24 24l-1.4-1.5"/>
      </motion.g>:finish==="website"?<><circle cx="14" cy="14" r="11"/><motion.ellipse cx="14" cy="14" rx="4.5" ry="11" variants={{rest:{scaleX:1,rotate:0},lit:still?{}:{scaleX:.96,rotate:-3,transition:{duration:.16}}}} style={{transformOrigin:"14px 14px"}}/><ellipse cx="14" cy="14" rx="11" ry="4"/></>:
        <><path d="M13 25A11 11 0 1 1 25 13M12 19a5.5 5.5 0 1 1 7-7"/><motion.path d="m14 14 12 3.5-5 3-2.5 5Z" variants={{rest:{x:0,y:0},lit:still?{}:{x:-.65,y:-.65,transition:{duration:.16}}}}/></>}
    </svg>}
    <span style={{textShadow:"0 -0.6px 0 #24303b66,0 1px 0 #ffffffe0"}}>{label}</span>
  </Element>;
}
