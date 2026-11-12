"use client";

import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";

const colors = {
  Digital: ["#e4eeff","#0874ef","#145bb9"], Finance: ["#def7ef","#079e72","#087354"],
  Simple: ["#f0e8ff","#9060ed","#7043bf"], Fast: ["#fff3e3","#f68a0a","#ac5700"],
  Secure: ["#e1e6f3","#2c478d","#1d3678"], Fluid: ["#dff7fa","#08acc4","#067186"],
};
export type BadgeKind = keyof typeof colors;
export const badgeKinds = Object.keys(colors) as BadgeKind[];

export function MotionBadge({kind="Digital",label,onClick}:{kind?:BadgeKind;label?:string;onClick?:()=>void}) {
  const [paper,edge,ink]=colors[kind];
  const reduced=useReducedMotion();
  const [cycle,replay]=useState(0);
  const duration=reduced?0:.48;
  const stroke={fill:"none",stroke:"currentColor",strokeWidth:2.2,strokeLinecap:"round" as const,strokeLinejoin:"round" as const};
  const icon=<svg key={cycle} width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" style={{color:edge,overflow:"visible"}}>
    {kind==="Digital" && <><motion.rect x="1" y="3" width="22" height="15" rx="4" fill="currentColor" opacity=".42" animate={cycle&&!reduced?{scaleY:[1,.86,1]}:{}} transition={{duration}}/><path d="M6 21q6-2 12 0" {...stroke}/></>}
    {kind==="Finance" && <motion.g animate={cycle&&!reduced?{rotate:[0,-9,6,0]}:{}} transition={{duration}} style={{transformOrigin:"12px 5px"}}><path d="M8 7V5q0-2 2-2h4q2 0 2 2v2" {...stroke}/><rect x="1" y="7" width="22" height="15" rx="4" fill="currentColor" opacity=".42"/><path d="M15 11h-5q-3 3 1 3h2q4 3-1 3H9m3-8v2m0 6v2" {...stroke}/></motion.g>}
    {kind==="Simple" && <><rect x="2" y="4" width="19" height="19" rx="4" fill="currentColor" opacity=".3"/><motion.path d="M6 18Q8 3 23 2q-1 7-5 9l2 1-6 2h-4l-2 5z" fill="currentColor" animate={cycle&&!reduced?{rotate:[0,-12,4,0],y:[0,-2,0,0]}:{}} transition={{duration}} style={{transformOrigin:"7px 18px"}}/></>}
    {kind==="Fast" && <><circle cx="12" cy="12" r="11" fill="currentColor" opacity=".35"/><motion.path d="M14 4 6 13h5l-1 7 8-10h-6z" fill="currentColor" animate={cycle&&!reduced?{x:[0,2,-1,0],scale:[1,1.15,1,1]}:{}} transition={{duration:.28}}/></>}
    {kind==="Secure" && <><path d="m12 1 10 4v8q0 7-10 10Q2 20 2 13V5z" fill="currentColor" opacity=".36"/><motion.path d="m7.5 12 3 3 6-7" {...stroke} initial={{pathLength:cycle&&!reduced?0:1}} animate={{pathLength:1}} transition={{duration}}/></>}
    {kind==="Fluid" && <><motion.g {...stroke} opacity=".54" animate={cycle&&!reduced?{x:[0,1.5,-1,0]}:{}} transition={{duration}}><path d="M2 6q2-3 5-1t5 0t5 0t5 0M2 12q2-3 5-1t5 0M2 18q2-3 5-1t4 0"/></motion.g><motion.path d="M18 10q-8 10-1 12q9 1 1-12" fill="currentColor" animate={cycle&&!reduced?{y:[0,-2,1,0]}:{}} transition={{duration}}/></>}
  </svg>;
  const attributes={style:{display:"inline-flex",alignItems:"center",gap:8,padding:"6px 14px 6px 9px",borderRadius:99,border:"1.7px solid "+edge,boxShadow:"0 2px 0 "+edge,background:paper,color:ink,font:"500 18px/1.25 system-ui,sans-serif",letterSpacing:"-.025em"},onPointerEnter:()=>replay(n=>n+1)};
  return onClick?<button {...attributes} type="button" onFocus={()=>replay(n=>n+1)} onClick={()=>{replay(n=>n+1);onClick()}}>{icon}{label??kind}</button>:<span {...attributes}>{icon}{label??kind}</span>;
}
