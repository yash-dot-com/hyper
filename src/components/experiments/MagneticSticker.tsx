"use client";

import { useId, type PointerEvent } from "react";
import { motion, useReducedMotion, useSpring } from "motion/react";

const stock = {
  ticket: [210,78,"#bc9ae3","Field notes"],
  seal: [90,90,"#ed9a20","North"],
  pass: [120,167,"#e4d58b","Open access"],
  tabs: [180,82,"#588cff","Index"],
  coupon: [200,100,"#f5f3e6","Studio pass"],
  strip: [46,185,"#79cb69","Archive"],
} as const;
export type StickerCut = keyof typeof stock;

export function MagneticSticker({cut="ticket",label,color}:{cut?:StickerCut;label?:string;color?:string}){
  const [w,h,paper,title]=stock[cut], text=label??title;
  const id=useId(), reduced=useReducedMotion();
  const spring={stiffness:310,damping:19,mass:.62};
  const x=useSpring(0,spring),y=useSpring(0,spring),rotate=useSpring(0,spring);
  function follow(e:PointerEvent<HTMLDivElement>){
    if(reduced)return;
    const b=e.currentTarget.getBoundingClientRect();
    const dx=(e.clientX-b.left)/b.width-.5,dy=(e.clientY-b.top)/b.height-.5;
    x.set(dx*14);y.set(dy*12);rotate.set(dx*7);
  }
  function release(){x.set(0);y.set(0);rotate.set(0)}
  const stamp=cut==="seal"||cut==="pass"||cut==="coupon";
  const paired=cut==="ticket"||cut==="tabs";
  const split=cut==="ticket"?w-58:w*.5;
  return <div onPointerMove={follow} onPointerDown={follow} onPointerLeave={release} onPointerCancel={release} onPointerUp={e=>{if(e.pointerType==="touch")release()}}
    style={{width:"100%",aspectRatio:`${w}/${h}`}}>
    <motion.svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label={text+" sticker"} style={{width:"100%",display:"block",x:reduced?0:x,y:reduced?0:y,rotate:reduced?0:rotate,color:"#181713",fontFamily:"Arial,sans-serif"}} fill="currentColor">
      <defs>
        <mask id={id}><rect width={w} height={h} rx={stamp?3:8} fill="white"/>
          {stamp && [0,h].map(edge=>Array.from({length:Math.floor(w/10)},(_,i)=><circle key={edge+"-"+i} cx={6+i*10} cy={edge} r="3.1"/>))}
          {(cut==="coupon"||cut==="seal") && [0,w].map(edge=>Array.from({length:Math.floor(h/10)},(_,i)=><circle key={edge+"-"+i} cy={6+i*10} cx={edge} r="3.1"/>))}
          {cut==="strip" && [138,151,164].map(cy=><circle key={cy} cx="23" cy={cy} r="3.2"/>)}
        </mask>
        <linearGradient id={id+"pin"} x2=".8" y2="1"><stop stopColor="#f6f2de"/><stop offset=".43" stopColor="#8b8d86"/><stop offset=".64" stopColor="#eeeada"/><stop offset="1" stopColor="#656861"/></linearGradient>
      </defs>
      {paired?<g fill={color??paper}><rect width={split} height={h} rx={cut==="tabs"?18:11}/><rect x={split} width={w-split} height={h} rx={cut==="tabs"?18:11}/></g>:<rect width={w} height={h} fill={color??paper} mask={`url(#${id})`}/>}
      {cut==="ticket" && <><text x="13" y="30" fontFamily="Georgia,serif" fontSize="15">Correspondence</text><text x="13" y="55" fontWeight="700" fontSize="23">{text}</text><circle cx="181" cy="39" r="17" fill="none" stroke="currentColor" strokeWidth="2"/><path d="M181 48V29m-8 8 8-8 8 8" fill="none" stroke="currentColor" strokeWidth="3"/></>}
      {cut==="seal" && <><path d="M45 15L59 52L45 46L31 52Z"/><circle cx="45" cy="39" r="25" fill="none" stroke="currentColor" strokeWidth="1.5"/><text x="45" y="77" textAnchor="middle" fontSize="11" letterSpacing="1.5">{text}</text></>}
      {cut==="pass" && <><text x="10" y="34" fontFamily="Georgia,serif" fontSize="19">Admit one</text><path d="M88 40h15v47m-6-6 6 6 6-6" stroke="currentColor" fill="none" strokeWidth="2"/><text x="11" y="95" fontSize="11">Reading room</text><path d="M0 115h120" stroke="currentColor" strokeWidth="2" strokeDasharray="1 4"/><text x="10" y="145" fontWeight="700" fontSize="18">{text}</text></>}
      {cut==="tabs" && <><text x="10" y="48" fontSize="24" fontWeight="700">{text}</text><rect x="103" y="28" width="62" height="26" rx="6" fill="none" stroke="currentColor"/><text x="134" y="46" textAnchor="middle" fontSize="14">A — Z</text></>}
      {cut==="coupon" && <><path d="M82 6v88" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="2 5"/><text x="12" y="29" fontSize="12">Workshop</text><text x="10" y="78" fontSize="41" fontFamily="Georgia,serif">01</text><text x="93" y="49" fontSize="18" fontWeight="700">{text}</text><path d="M94 66h84m-7-5 7 5-7 5" fill="none" stroke="currentColor" strokeWidth="1.6"/></>}
      {cut==="strip" && <><circle cx="24" cy="22" r="10" opacity=".22"/><circle cx="23" cy="20" r="10" fill={`url(#${id}pin)`}/><text transform="translate(16 43) rotate(90)" fontSize="22" fontWeight="700">{text}</text></>}
    </motion.svg>
  </div>;
}
