"use client";

import { useId, useLayoutEffect, useRef, useState } from "react";

export const printInks=["#203bc6","#f43e7b","#ff9838","#65b94c"] as const;

// Cut contours and counters for the specimen word. Other glyphs use the
// same ink plates and individually skewed type, including accented letters.
const cuts:Record<string,[number,string]>={
  B:[93,"M9 5L61 1 84 10 91 29 83 45 70 51 87 56 95 73 91 92 72 103 2 99ZM37 23L35 43 53 41 62 31 55 23ZM33 62L31 82 54 81 64 72 59 64Z"],
  l:[36,"M7 0L32 3 30 68 38 96 9 102 1 85Z"],
  o:[72,"M6 49L26 30 51 27 70 41 77 65 71 88 51 102 25 99 7 85 1 67ZM28 62L29 75 40 81 51 74 50 59 39 53Z"],
  m:[105,"M1 39L23 32 27 43 42 32 59 31 68 44 83 32 99 37 108 94 82 101 77 60 67 65 70 96 47 99 43 61 31 68 32 97 7 100Z"],
};
export function CutInkFooter({word="Bloom",inks=printInks}:{word?:string;inks?:readonly [string,string,string,string]}){
  const id=useId(), art=useRef<SVGGElement>(null);
  const [box,setBox]=useState("0 -16 365 141");
  useLayoutEffect(()=>{
    const b=art.current?.getBBox();
    if(b?.width)setBox(`${b.x-12} ${b.y-13} ${b.width+24} ${b.height+30}`);
  },[word]);
  let cursor=0;
  return <footer style={{width:"100%",padding:"4% 5%",background:"#fffdf8",boxSizing:"border-box"}}>
    <svg role="img" aria-label={word||"Cut ink lettering"} viewBox={box} style={{display:"block",width:"100%",height:"clamp(150px,31vw,370px)",isolation:"isolate"}}>
      <defs>
        {[[3,2,1,0],[1,1,2,0],[0,0,3,2],[2,3,3,0],[1,2,1,2]].map((stops,i)=>
          <linearGradient key={i} id={id+"ink"+i} x1={i%2?".85":"0"} y1="0" x2={i%2?".15":"1"} y2="1">
            {stops.map((v,j)=><stop key={j} offset={j/3} stopColor={inks[v]}/>)}
          </linearGradient>)}
        <filter id={id+"grain"} x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency=".88" numOctaves="3" seed="11"/>
          <feColorMatrix type="saturate" values="0"/>
          <feComponentTransfer><feFuncR type="linear" slope="2.5" intercept="-.75"/><feFuncG type="linear" slope="2.5" intercept="-.75"/><feFuncB type="linear" slope="2.5" intercept="-.75"/></feComponentTransfer>
          <feBlend in2="SourceGraphic" mode="soft-light"/><feComposite in2="SourceGraphic" operator="in"/>
        </filter>
      </defs>
      <g ref={art}>{Array.from(word).map((letter,i)=>{
        const cut=cuts[letter],x=cursor;
        cursor+=(cut?.[0]??(letter===" "?40:73))*.88;
        return <g key={i} transform={`translate(${x} ${[0,5,-2,4,-4][i%5]}) rotate(${[-4,3,-5,5,-3][i%5]} 35 80)`}
          filter={`url(#${id}grain)`} style={{mixBlendMode:"multiply"}} fill={`url(#${id}ink${i%5})`}>
          {cut?<path d={cut[1]} fillRule="evenodd"/>:letter!==" "&&<text x="0" y="97" fontFamily="Arial Black,Arial,sans-serif" fontSize="114" fontWeight="900" textLength="77" lengthAdjust="spacingAndGlyphs" transform="skewX(-5)">{letter}</text>}
        </g>;
      })}</g>
    </svg>
  </footer>;
}
