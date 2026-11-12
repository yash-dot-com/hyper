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
      if(mounted && width)setScale(Math.min(2.1,1025/width));
    };
    fit();void document.fonts.ready.then(fit);
    return ()=>{mounted=false};
  },[word]);
  const useWord={href:"#"+id+"word",strokeLinejoin:"round" as const,paintOrder:"stroke"};
  return <footer style={{position:"relative",isolation:"isolate",width:"100%",overflow:"hidden",
    background:`linear-gradient(178deg,${palette.sky} 24%,${palette.horizon} 96%)`}}>
    <svg viewBox="0 0 1000 500" style={{display:"block",width:"100%",fontFamily:"inherit"}} role="img" aria-label={[heading,word].filter(Boolean).join(" ")}>
      <defs>
        <text ref={lettering} id={id+"word"} textAnchor="middle" fontWeight="700" fontSize="205" letterSpacing="-.045em">{word}</text>
        {[1.6,3.5,7,12].map(blur=><filter key={blur} id={id+"blur"+blur} x="-25%" y="-85%" width="150%" height="270%">
          <feGaussianBlur stdDeviation={blur}/>
        </filter>)}
        <linearGradient id={id+"face"} x1="0" y1="0" x2=".2" y2="1">
          <stop stopColor={palette.core}/><stop offset=".55" stopColor={palette.core}/>
          <stop offset="1" stopColor={palette.rim}/>
        </linearGradient>
        <filter id={id+"inner"} x="-20%" y="-30%" width="140%" height="160%">
          <feMorphology operator="erode" radius="3.5"/>
          <feGaussianBlur stdDeviation="3.2"/>
        </filter>
        <linearGradient id={id+"fade"} x2="0" y2="1">
          <stop offset=".72" stopColor="black"/><stop offset=".98" stopColor="white"/>
        </linearGradient>
        <mask id={id+"bottom"} maskUnits="userSpaceOnUse" x="0" y="0" width="1000" height="500">
          <rect width="1000" height="500" fill={`url(#${id}fade)`}/>
        </mask>
        <linearGradient id={id+"sky"} x2="0" y2="1"><stop offset=".24" stopColor={palette.sky}/><stop offset=".96" stopColor={palette.horizon}/></linearGradient>
        <g id={id+"print"}>
          <rect x="-50" y="-50" width="1100" height="600" fill={`url(#${id}sky)`}/>
          <g transform={`translate(500 513) scale(${scale})`}>
        <use {...useWord} fill={palette.halo} stroke={palette.halo} strokeWidth="40" opacity=".83" filter={`url(#${id}blur12)`}/>
        <use {...useWord} fill={palette.halo} stroke={palette.halo} strokeWidth="24" filter={`url(#${id}blur7)`}/>
        <use {...useWord} fill={palette.rim} stroke={palette.rim} strokeWidth="16" filter={`url(#${id}blur3.5)`}/>
        <use {...useWord} fill={`url(#${id}face)`} stroke={palette.core} strokeWidth="2" filter={`url(#${id}blur1.6)`}/>
        <use {...useWord} fill={`color-mix(in srgb, ${palette.core} 68%, white)`} filter={`url(#${id}inner)`}/>
          </g>
        </g>
      </defs>
      <use href={"#"+id+"print"}/>
      <g mask={`url(#${id}bottom)`}><use href={"#"+id+"print"} filter={`url(#${id}blur7)`}/></g>
      <text x="81" y="132" fill="white" fontSize="62" fontWeight="620" letterSpacing="-.055em">{heading}</text>
      <path d="M70 0V500M695 0V500M0 54H1000M0 193H1000" fill="none" stroke="white" opacity=".48" strokeWidth=".8"/>
      <rect x="68" y="52" width="4" height="4" fill="white"/>
    </svg>
  </footer>;
}
