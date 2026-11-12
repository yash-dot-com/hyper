"use client";

import { useId, useLayoutEffect, useRef, useState } from "react";

export const afterglowColors = {
  sky:"#8784ef", horizon:"#d4ebe3", core:"#7270ff", rim:"#ee09dc", halo:"#ffae38",
};

export function AfterglowFooter({word="Afterglow", colors={}, heading="Made for the curious."}:{
  word?:string; colors?:Partial<typeof afterglowColors>; heading?:string;
}) {
  const palette={...afterglowColors,...colors};
  const id=useId(), lettering=useRef<SVGTextElement>(null);
  const [scale,setScale]=useState(1);
  useLayoutEffect(()=>{
    let mounted=true;
    const fit=()=>{
      const width=lettering.current?.getComputedTextLength();
      if(mounted && width)setScale(Math.min(2.1,960/width));
    };
    fit();void document.fonts.ready.then(fit);
    return ()=>{mounted=false};
  },[word]);
  const useWord={href:"#"+id+"word",strokeLinejoin:"round" as const,paintOrder:"stroke"};
  return <footer style={{position:"relative",isolation:"isolate",width:"100%",overflow:"hidden",
    background:`linear-gradient(178deg,${palette.sky} 24%,${palette.horizon} 96%)`}}>
    <svg viewBox="0 0 1000 450" style={{display:"block",width:"100%",fontFamily:"inherit"}} role="img" aria-label={[heading,word].filter(Boolean).join(" ")}>
      <defs>
        <text ref={lettering} id={id+"word"} textAnchor="middle" fontWeight="700" fontSize="205" letterSpacing="-.045em">{word}</text>
        {[1.25,5].map(blur=><filter key={blur} id={id+"blur"+blur} x="-100%" y="-100%" width="300%" height="300%" filterUnits="userSpaceOnUse">
          <feGaussianBlur stdDeviation={blur}/>
        </filter>)}
        <linearGradient id={id+"face"} x1="0" y1="0" x2=".2" y2="1">
          <stop stopColor={palette.core}/><stop offset=".55" stopColor={palette.core}/>
          <stop offset="1" stopColor={palette.rim}/>
        </linearGradient>
        <filter id={id+"bevel"} x="-10%" y="-30%" width="120%" height="160%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2.8"/>
          <feOffset dx=".8" dy="1.6"/>
          <feComposite in="SourceAlpha" operator="out"/>
          <feComponentTransfer result="edge"><feFuncA type="linear" slope=".55"/></feComponentTransfer>
          <feFlood floodColor="#281290"/>
          <feComposite in2="edge" operator="in"/>
        </filter>
      </defs>
      <text x="77" y="115" fill="white" fontSize="53" fontWeight="620" letterSpacing="-.055em">{heading}</text>
      <g transform={`translate(500 446) scale(${scale})`}>
        <use {...useWord} fill={palette.halo} stroke={palette.halo} strokeWidth="19" filter={`url(#${id}blur5)`}/>
        <use {...useWord} fill={palette.rim} stroke={palette.rim} strokeWidth="8" filter={`url(#${id}blur1.25)`}/>
        <use {...useWord} fill={`url(#${id}face)`}/>
        <use {...useWord} filter={`url(#${id}bevel)`}/>
      </g>
      <path d="M70 0V450M695 0V450M0 54H1000M0 156H1000" fill="none" stroke="white" opacity=".48" strokeWidth=".8"/>
      <rect x="68" y="52" width="4" height="4" fill="white"/>
    </svg>
  </footer>;
}
