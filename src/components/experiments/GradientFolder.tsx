"use client";

import { useId, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

export const folderColors = {
  persimmon: ["#ffb560","#f97240","#ce4931","#8b2e31","#fff0be"],
  lagoon: ["#91eee0","#42bfcc","#267ca8","#204968","#e3fff3"],
  iris: ["#e5b8fc","#af89ef","#7959c8","#493675","#ffebff"],
} as const;
export type FolderColor = keyof typeof folderColors;

export function GradientFolder({ color="persimmon", label="Field notes", size=240 }: {
  color?: FolderColor; label?: string; size?: number|string;
}) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g,"");
  const paint = (name:string) => `url(#${uid}-${name})`;
  const [light,mid,deep,shade,glow] = folderColors[color];
  const [hover,setHover] = useState(false);
  const [pinned,setPinned] = useState(false);
  const [focus,setFocus] = useState(false);
  const open = hover || focus || pinned;
  const reduce = useReducedMotion();
  const spring = reduce ? {duration:0} : {type:"spring" as const, stiffness:300, damping:27, mass:.75};
  const pocket = "M32 107Q31 98 42 98H86Q92 98 98 104L105 111Q109 115 116 115H218Q227 115 226 125L221 192Q220 204 207 204H52Q39 204 38 192Z";
  return <button type="button" aria-label={`Pin ${label} folder open`} aria-pressed={pinned}
    onPointerEnter={e=>setHover(e.pointerType!=="touch")} onPointerLeave={()=>setHover(false)}
    onFocus={e=>setFocus(e.currentTarget.matches(":focus-visible"))} onBlur={()=>setFocus(false)}
    onClick={()=>setPinned(p=>!p)}
    style={{display:"block",width:size,maxWidth:"100%",padding:0,border:0,background:"transparent",borderRadius:20,cursor:"pointer"}}>
    <svg viewBox="0 0 260 240" aria-hidden="true" style={{display:"block",width:"100%",overflow:"visible"}}>
      <defs>
        <linearGradient id={uid+"-back"} x1="0" y1="0" x2=".55" y2="1"><stop stopColor={light}/><stop offset=".32" stopColor={deep}/><stop offset="1" stopColor={shade}/></linearGradient>
        <linearGradient id={uid+"-front"} x1=".2" y1="0" x2=".83" y2="1"><stop stopColor={light}/><stop offset=".47" stopColor={mid}/><stop offset="1" stopColor={deep}/></linearGradient>
        <radialGradient id={uid+"-glaze"} cx=".22" cy="0" r=".98"><stop stopColor={glow} stopOpacity=".66"/><stop offset=".78" stopColor={glow} stopOpacity="0"/></radialGradient>
        <linearGradient id={uid+"-paper"} x2=".23" y2="1"><stop stopColor="#fffefa"/><stop offset=".7" stopColor="#f7f3ed"/><stop offset="1" stopColor="#d8cec3"/></linearGradient>
        <radialGradient id={uid+"-shadow"}><stop stopColor={shade} stopOpacity=".29"/><stop offset="1" stopColor={shade} stopOpacity="0"/></radialGradient>
      </defs>
      <ellipse cx="132" cy="208" rx="99" ry="12" fill={paint("shadow")}/>
      <g>
        <motion.path initial={false} animate={{d: open
          ? "M39 81Q39 70 51 70H93Q99 70 105 76L112 82Q115 85 122 85H215Q227 85 227 98L220 189Q220 202 207 202H51Q38 202 38 188Z"
          : "M38 75Q38 64 50 64H88Q94 64 100 70L106 76Q109 79 116 79H208Q220 79 220 92L220 189Q220 202 207 202H51Q38 202 38 188Z"}}
          transition={spring} fill={paint("back")}/>
        {[0,1,2].map((i)=><motion.g key={i}
          style={{transformOrigin:"130px 175px"}}
          animate={{y:open?[-27,-19,-12][i]:0,rotate:open?[-10,2,10][i]:[-4,1,4][i],x:open?(i-1)*5:0}}
          transition={{...spring,delay:reduce?0:(open?i:2-i)*.025}}>
          <rect x={59+i*4} y={86+i*4} width="134" height="103" rx="6" fill={paint("paper")} stroke="#6b5143" strokeOpacity=".17"/>
          <g transform={`translate(${70+i*4} ${98+i*4})`} fill={i===2?deep:"#9a9792"}>
            <rect width="28" height="3" rx="1.5" opacity=".65"/><path d="M0 11h87m-87 6h72m-72 6h83" fill="none" stroke="currentColor" color="#c8c2bb" strokeWidth="2"/>
          </g>
        </motion.g>)}
        <g>
          <path d={pocket} fill={paint("front")}/><path d={pocket} fill={paint("glaze")} stroke={glow} strokeOpacity=".46" strokeWidth="1"/>
          <path d="M47 194q1 5 7 5h151" fill="none" stroke={shade} strokeOpacity=".13"/>
          <text x="53" y="183" fontFamily="system-ui,sans-serif" fontSize="12" fontWeight="600" fill={shade}>{label}</text>
          <g fill={shade} opacity=".75">{[0,1,2].map(i=><circle key={i} cx="203" cy={175+i*3.4} r="1.1"/>)}</g>
        </g>
      </g>
    </svg>
  </button>;
}
