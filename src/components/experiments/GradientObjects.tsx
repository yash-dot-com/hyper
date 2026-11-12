"use client";

import { useId, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

const folders = {
  progress: { label:"Projects", back:"#ec921a", cavity:"#b96910", lip:"#ffc577", base:"#f49a28", ink:"#654014" },
  receipts: { label:"Receipts", back:"#5267df", cavity:"#293b98", lip:"#ffe089", base:"#f5bb3e", ink:"#624414" },
  scripts:  { label:"Scripts", back:"#f56e32", cavity:"#b33b17", lip:"#f7ccba", base:"#d87c58", ink:"#663326" },
  files:    { label:"Documents", back:"#8dcefa", cavity:"#2789c6", lip:"#a6ddff", base:"#319de1", ink:"#154d73" },
};
export type FolderKind = keyof typeof folders;
export function FolderSticker({kind,size=180}:{kind:FolderKind;size?:number|string}) {
  const id=useId(), reduce=useReducedMotion();
  const [hover,setHover]=useState(false),[focus,setFocus]=useState(false),[pinned,pin]=useState(false);
  const open=hover||focus||pinned, c=folders[kind];
  const wallet=kind==="receipts", stack=kind==="files", simple=kind==="progress";
  const spring=reduce?{duration:0}:{type:"spring" as const,stiffness:290,damping:28};
  const drop=open?4:0, spread=open?2:0;
  const top=wallet?80:stack?70:simple?56:62;
  const contour=`M${20-spread} ${top+12+drop} Q${20-spread} ${top+drop} 33 ${top+drop} C58 ${top+drop} 62 ${top+drop+(wallet?10:simple||stack?0:17)} 76 ${top+drop+(wallet?14:simple||stack?0:17)} L148 ${top+drop+(wallet?32:simple||stack?0:17)} Q${160+spread} ${top+drop+(wallet?35:simple||stack?0:17)} ${160+spread} ${top+drop+(wallet?44:simple||stack?12:29)} L157 147 Q157 156 146 156 H34 Q23 156 23 146Z`;
  const count=stack?5:simple?1:3;
  return <button type="button" aria-pressed={pinned} aria-label={`Pin ${c.label} folder open`}
    onPointerEnter={e=>setHover(e.pointerType!=="touch")} onPointerLeave={()=>setHover(false)}
    onFocus={e=>setFocus(e.currentTarget.matches(":focus-visible"))} onBlur={()=>setFocus(false)} onClick={()=>pin(!pinned)}
    style={{width:size,maxWidth:"100%",background:"transparent",padding:0,border:0,display:"block",borderRadius:12}}>
    <svg viewBox="0 0 180 180" aria-hidden="true" style={{width:"100%",display:"block"}}>
      <defs>
        <linearGradient id={id+"b"} x2=".25" y2="1"><stop stopColor={c.back}/><stop offset="1" stopColor={c.cavity}/></linearGradient>
        <linearGradient id={id+"f"} x2=".2" y2="1"><stop stopColor={c.lip}/><stop offset=".45" stopColor={c.lip}/><stop offset="1" stopColor={c.base}/></linearGradient>
        <radialGradient id={id+"g"} cx=".38" cy="0" r=".88"><stop stopColor="white" stopOpacity={kind==="scripts"?".52":".2"}/><stop offset="1" stopColor="white" stopOpacity="0"/></radialGradient>
      </defs>
      <path d={simple||stack?"M23 39Q23 29 34 29H57Q64 29 70 35L76 39H146Q157 39 157 49V145Q157 155 146 155H34Q23 155 23 145Z":"M23 41Q23 28 37 28H143Q157 28 157 42V144Q157 155 145 155H35Q23 155 23 143Z"} fill={`url(#${id}b)`}/>
      {Array.from({length:count},(_,i)=>{
        const x=stack?40-i*3:simple?30:42+i*3,y=stack?39+i*6:simple?47:48+i*5,w=stack?100+i*6:simple?120:90;
        return <motion.g key={i} initial={false} animate={{y:open?-(stack?12-i*2:simple?10:18-i*4):0, rotate:stack||simple?0:(i-1)*(open?12:7)}} style={{transformOrigin:"90px 110px"}} transition={{...spring,delay:reduce?0:i*.022}}>
          <rect x={x} y={y} width={w} height="87" rx="5" fill={stack?"#e6f5ff":"#fffaf2"} stroke={stack?"#b9dfef":"#e6ded4"} strokeWidth=".8"/>
          {stack?<path d={`M${x+6} ${y+4}h${w-12}`} stroke="#fff"/>:<g fill="#dedbd5"><rect x={x+8} y={y+8} width="24" height="3" rx="1"/><rect x={x+8} y={y+16} width={w-20} height="2" rx="1"/></g>}
        </motion.g>;
      })}
      {wallet && <motion.g animate={{y:open?-7:0}} transition={spring}>
        <path d="M23 89Q23 79 34 75L145 49Q156 48 157 61V143H24Z" fill="#8790ff"/>
        <g transform="rotate(9 115 92)"><rect x="83" y="80" width="62" height="33" rx="4" fill="#fffaf1"/><path d="M90 88h22m-22 5h16" stroke="#746f78" strokeWidth="2"/></g>
      </motion.g>}
      <path d={contour} fill={`url(#${id}f)`} style={{transition:reduce?"none":"d 260ms ease-out"}}/>
      <path d={contour} fill={`url(#${id}g)`} style={{transition:reduce?"none":"d 260ms ease-out"}}/>
      <text x="33" y="143" fontSize="9" fontFamily="system-ui,sans-serif" fill={c.ink}>{c.label}</text>
      {simple && <text x="146" y="143" textAnchor="end" fontSize="15" fill={c.ink} fontFamily="system-ui,sans-serif">78%</text>}
    </svg>
  </button>;
}
