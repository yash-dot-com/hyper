"use client";

import { useId, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

type Kind = "rocker" | "latch" | "drawer";
const palettes = {
  rocker: ["#eaffdc","#a5ecbd","#45bba2","#257e78","#16494d"],
  latch: ["#fff2d6","#ffc1a0","#ef886e","#b54d53","#592e40"],
  drawer: ["#f6ebff","#d8b8fa","#a384dc","#7359ae","#403667"],
};
type Props = { size?: string | number; onChange?: (active:boolean)=>void };
function ObjectButton({kind,size=210,onChange}: Props & {kind:Kind}) {
  const id=useId(), [active,setActive]=useState(false), reduced=useReducedMotion();
  const [rim,light,body,fold,well]=palettes[kind];
  const fill=(key:string)=>`url(#${id}-${key})`;
  const spring=reduced?{duration:0}:{type:"spring" as const,stiffness:kind==="drawer"?230:390,damping:kind==="drawer"?27:33};
  const screw=(x:number,y:number)=><g key={x+":"+y}><circle cx={x} cy={y} r="2.7" fill={fold}/><path d={`M${x-1} ${y+1}l2-2`} stroke={well}/></g>;
  let object:ReactNode;
  if(kind==="rocker") {
    const face=active?"M73 48Q104 42 137 48L135 126Q105 137 75 126Z":"M75 57Q105 50 135 57L139 135Q105 145 71 135Z";
    object=<>
      <rect x="49" y="29" width="112" height="135" rx="26" fill={fill("shell")}/>
      <rect x="65" y="40" width="80" height="110" rx="18" fill={fill("well")}/>
      <motion.path animate={{d:active?"M75 121Q105 131 135 121L134 142Q105 149 76 142Z":"M71 131Q105 141 139 131L136 141Q105 149 74 141Z"}} transition={spring} fill={fold}/>
      <motion.path animate={{d:face}} transition={spring} fill={fill("face")} stroke={light}/>
      <motion.g animate={{y:active?-6:0}} transition={spring}><path d="M105 66v9" stroke={rim} strokeWidth="3" strokeLinecap="round"/><circle cx="105" cy="116" r="4" fill="none" stroke={well} strokeOpacity=".6" strokeWidth="2"/></motion.g>
      <circle cx="105" cy="156" r="2.5" fill={active?rim:well}/>
    </>;
  } else if(kind==="latch") {
    object=<>
      <rect x="20" y="71" width="124" height="64" rx="14" fill={fill("shell")}/><rect x="153" y="76" width="36" height="54" rx="8" fill={fill("shell")}/>
      {[[28,81],[28,125],[136,81],[181,122]].map(([x,y])=>screw(x,y))}
      <rect x="30" y="92" width="132" height="21" rx="9" fill={fill("well")}/>
      <motion.g animate={{x:active?22:0}} transition={spring}>
        <rect x="34" y="94" width="110" height="17" rx="6" fill={fill("barrel")}/>
        <path d="M88 103v-20" stroke={well} strokeWidth="7" strokeLinecap="round"/><circle cx="88" cy="80" r="8" fill={fill("pearl")}/>
      </motion.g>
      {[47,115,155].map(x=><g key={x}><rect x={x} y="88" width="17" height="29" rx="4" fill={fill("barrel")}/><path d={`M${x+2} 92h13`} stroke={rim} opacity=".7"/></g>)}
    </>;
  } else {
    object=<>
      <path d="M35 61l17-19h113l13 19v78H35Z" fill={fill("shell")} stroke={light}/>
      <rect x="42" y="66" width="129" height="65" rx="6" fill={fill("well")}/>
      <motion.path animate={{d:active?"M48 76h116l-6 74H43Z":"M48 76h116l-1 29H47Z"}} transition={spring} fill={fold}/>
      {[0,1,2].map(i=><motion.rect key={i} x={51-i} width="108" height="20" rx="3" animate={{y:active?83+i*6:80+i*2}} transition={spring} fill={["#e6d6e9","#faf1df","#fffcf2"][i]}/>)}
      <motion.g animate={{y:active?26:0,x:active?-4:0}} transition={spring}>
        <rect x="43" y="74" width="126" height="58" rx="6" fill={fill("face")} stroke={light}/>
        <rect x="84" y="93" width="42" height="12" rx="5" fill={well}/>
        <rect x="84" y="92" width="42" height="7" rx="3" fill={fill("barrel")}/>
      </motion.g>
    </>;
  }
  return <button type="button" aria-label={{rocker:"Power",latch:"Lock latch",drawer:"Open drawer"}[kind]} aria-pressed={active}
    onClick={()=>{setActive(!active);onChange?.(!active)}} style={{display:"block",width:size,maxWidth:"100%",padding:0,border:0,background:"transparent",borderRadius:16,cursor:"pointer"}}>
    <svg viewBox="0 0 210 190" aria-hidden="true" style={{display:"block",width:"100%"}}>
      <defs>
        <linearGradient id={id+"-shell"} x2=".7" y2="1"><stop stopColor={light}/><stop offset=".38" stopColor={body}/><stop offset="1" stopColor={fold}/></linearGradient>
        <linearGradient id={id+"-well"} x2=".2" y2="1"><stop stopColor={well}/><stop offset=".8" stopColor={fold}/></linearGradient>
        <linearGradient id={id+"-face"} x2=".55" y2="1"><stop stopColor={rim}/><stop offset=".16" stopColor={light}/><stop offset=".62" stopColor={body}/><stop offset="1" stopColor={fold}/></linearGradient>
        <linearGradient id={id+"-barrel"} x2="0" y2="1"><stop stopColor={fold}/><stop offset=".22" stopColor={rim}/><stop offset=".52" stopColor={light}/><stop offset=".8" stopColor={body}/><stop offset="1" stopColor={well}/></linearGradient>
        <radialGradient id={id+"-pearl"} cx=".35" cy=".23" r=".8"><stop stopColor={rim}/><stop offset=".4" stopColor={body}/><stop offset="1" stopColor={fold}/></radialGradient>
        <radialGradient id={id+"-ground"}><stop stopColor={well} stopOpacity=".22"/><stop offset="1" stopColor={well} stopOpacity="0"/></radialGradient>
      </defs>
      <ellipse cx="106" cy={{rocker:165,latch:137,drawer:151}[kind]} rx="77" ry="10" fill={fill("ground")}/>{object}
    </svg>
  </button>;
}
export const RockerSwitch=(props:Props)=><ObjectButton {...props} kind="rocker"/>;
export const SlideLatch=(props:Props)=><ObjectButton {...props} kind="latch"/>;
export const FileDrawer=(props:Props)=><ObjectButton {...props} kind="drawer"/>;
