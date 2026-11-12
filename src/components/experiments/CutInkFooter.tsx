"use client";

import { useId, useLayoutEffect, useRef, useState } from "react";

export const printInks=["#203bc6","#f43e7b","#ff9838","#65b94c"] as const;

// Original cutouts retain their hand-drawn silhouettes.
const cuts:Record<string,[number,string]>={
  B:[93,"M9 5L61 1 84 10 91 29 83 45 70 51 87 56 95 73 91 92 72 103 2 99ZM37 23L35 43 53 41 62 31 55 23ZM33 62L31 82 54 81 64 72 59 64Z"],
  l:[36,"M7 0L32 3 30 68 38 96 9 102 1 85Z"],
  o:[72,"M6 49L26 30 51 27 70 41 77 65 71 88 51 102 25 99 7 85 1 67ZM28 62L29 75 40 81 51 74 50 59 39 53Z"],
  m:[105,"M1 39L23 32 27 43 42 32 59 31 68 44 83 32 99 37 108 94 82 101 77 60 67 65 70 96 47 99 43 61 31 68 32 97 7 100Z"],
};
type Cut=[number,string];
type Point=[number,number];

// Simplify the traced perimeter into long scissor cuts while retaining corners.
function simplify(points:Point[], tolerance:number):Point[] {
  const a=points[0], b=points[points.length-1], dx=b[0]-a[0], dy=b[1]-a[1];
  let furthest=0, split=0;
  for(let i=1;i<points.length-1;i++){
    const [x,y]=points[i];
    const u=Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy||1)));
    const distance=Math.hypot(x-a[0]-u*dx,y-a[1]-u*dy);
    if(distance>furthest){furthest=distance;split=i;}
  }
  return furthest<=tolerance?[a,b]:[
    ...simplify(points.slice(0,split+1),tolerance).slice(0,-1),
    ...simplify(points.slice(split),tolerance)
  ];
}

function cutGlyph(ctx:CanvasRenderingContext2D,glyph:string):Cut {
  const font="900 100px Arial Black, Arial, sans-serif";
  ctx.font=font;
  const metrics=ctx.measureText(glyph);
  if(!glyph.trim())return [metrics.width,""];
  const left=Math.ceil(metrics.actualBoundingBoxLeft)+3;
  const baseline=Math.ceil(metrics.actualBoundingBoxAscent)+3;
  const width=Math.max(1,Math.ceil(left+metrics.actualBoundingBoxRight)+3);
  const height=Math.max(1,Math.ceil(baseline+metrics.actualBoundingBoxDescent)+3);
  ctx.canvas.width=width;ctx.canvas.height=height;ctx.font=font;
  ctx.fillText(glyph,left,baseline);
  const pixels=ctx.getImageData(0,0,width,height).data;
  const solid=(x:number,y:number)=>x>=0&&y>=0&&x<width&&y<height&&pixels[4*(y*width+x)+3]>95;
  const edges=new Map<number,number[]>(),stride=width+1;
  function edge(start:number,end:number){
    const next=edges.get(start);
    if(next)next.push(end);else edges.set(start,[end]);
  }
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){
    if(!solid(x,y))continue;
    const p=y*stride+x;
    if(!solid(x,y-1))edge(p,p+1);
    if(!solid(x+1,y))edge(p+1,p+1+stride);
    if(!solid(x,y+1))edge(p+1+stride,p+stride);
    if(!solid(x-1,y))edge(p+stride,p);
  }
  const loops=[];
  while(edges.size){
    const start=edges.keys().next().value as number;
    let p=start;
    const contour:Point[]=[];
    do {
      contour.push([p%stride-left,Math.floor(p/stride)-baseline+97]);
      const next=edges.get(p)!;
      const end=next.pop()!;
      if(!next.length)edges.delete(p);
      p=end;
    }while(p!==start);
    contour.push(contour[0]);
    const corners=simplify(contour,1.85).slice(0,-1);
    if(corners.length<3)continue;
    loops.push("M"+corners.map(([x,y])=>{
      // A continuous offset field keeps nearby cuts and narrow counters aligned.
      const cutX=x+2.3*Math.sin(y*.10+x*.032)-.058*(y-72);
      const cutY=y+1.9*Math.sin(x*.12+y*.045);
      return cutX.toFixed(1)+" "+cutY.toFixed(1);
    }).join("L")+"Z");
  }
  return [metrics.width,loops.join("")];
}

export function CutInkFooter({word="Bloom",inks=printInks}:{word?:string;inks?:readonly [string,string,string,string]}){
  const id=useId(), art=useRef<SVGGElement>(null);
  const cache=useRef(new Map<string,Cut>());
  const [letters,setLetters]=useState<Cut[]>([]);
  useLayoutEffect(()=>{
    const ctx=document.createElement("canvas").getContext("2d",{willReadFrequently:true});
    if(!ctx)return;
    const segments=new Intl.Segmenter(undefined,{granularity:"grapheme"}).segment(word);
    setLetters(Array.from(segments,({segment})=>{
      const existing=cuts[segment]??cache.current.get(segment);
      if(existing)return existing;
      const cut=cutGlyph(ctx,segment);cache.current.set(segment,cut);return cut;
    }));
  },[word]);
  const [box,setBox]=useState("0 -16 365 141");
  useLayoutEffect(()=>{
    const b=art.current?.getBBox();
    if(b?.width)setBox(`${b.x-12} ${b.y-13} ${b.width+24} ${b.height+30}`);
  },[letters]);
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
      <g ref={art}>{letters.map(([advance,path],i)=>{
        const x=cursor;
        cursor+=advance*.88;
        return <g key={i} transform={`translate(${x} ${[0,5,-2,4,-4][i%5]}) rotate(${[-4,3,-5,5,-3][i%5]} 35 80)`}
          filter={`url(#${id}grain)`} style={{mixBlendMode:"multiply"}} fill={`url(#${id}ink${i%5})`}>
          <path d={path} fillRule="evenodd"/>
        </g>;
      })}</g>
    </svg>
  </footer>;
}
