"use client";

import { useEffect, useMemo, useState } from "react";

type Point = [number,number];
type Stem = {d:string; color:string; start:number; duration:number; tip:Point; flower:number; weight:number};
export type TreeSettings = {width:number;height:number;depth:number;seed:number};
const pigments = ["#ef5b67","#53b457","#ff8951","#d95192"];
const limit=(n:number,min:number,max:number,fallback:number)=>Number.isFinite(n)?Math.max(min,Math.min(max,n)):fallback;

function grow({width:w,height:h,depth,seed}:TreeSettings) {
  let n=seed>>>0;
  const rand=()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296;};
  const stems:Stem[]=[];
  const unit=Math.min(w,h)/55;
  function branch(root:Point,left:number,right:number,level:number,start:number,color:number) {
    const leaf=level===depth;
    const center=(left+right)/2;
    const x=center+(rand()-.5)*(right-left)*.34;
    const budget=(h*.78)/(depth+1);
    const rise=budget*(level===0?1.45:leaf?.72+rand()*.48:.82+rand()*.23);
    const y=Math.max(unit*4,root[1]-rise);
    const diagonal=Math.min(Math.abs(x-root[0]),(root[1]-y)*(.48+rand()*.32));
    const sign=Math.sign(x-root[0]);
    const tip:Point=[x,y];
    const duration=.24+rise/h*.9;
    stems.push({d:`M${root}V${y+diagonal}l${sign*diagonal},${-diagonal}H${x}`,tip,
      color:pigments[color],start,duration,weight:unit*(1.05-level*.095),flower:leaf?Math.floor(rand()*4):-1});
    if(leaf)return;
    // Sample distance along the actual parent polyline so each sprig stays attached.
    const vertical=root[1]-y-diagonal, slant=diagonal*Math.SQRT2;
    const total=vertical+slant+Math.abs(x-root[0])-diagonal;
    const count=level===0?2:level<=2?1:Number(rand()<.35);
    const firstSide=rand()<.5?-1:1;
    for(let j=0;j<count;j++){
      const fraction=(j+.35+rand()*.35)/count, along=total*fraction;
      const onSlope=Math.min(diagonal,Math.max(0,along-vertical)/Math.SQRT2);
      const ax=root[0]+sign*(onSlope+Math.max(0,along-vertical-slant));
      const ay=root[1]-Math.min(vertical,along)-onSlope;
      let side=j%2?-firstSide:firstSide;
      const reach=Math.min((right-left)*.27,unit*(3+rand()*3));
      if(ax+side*reach<unit*4 || ax+side*reach>w-unit*4)side=-side;
      const end:Point=[ax+side*reach,ay-reach*.35];
      stems.push({d:`M${ax},${ay}l${side*reach*.35},${-reach*.35}H${end[0]}`,
        tip:end,color:pigments[color],start:start+duration*fraction,duration:.22,
        weight:unit*.65,flower:Math.floor(rand()*4)});
    }
    const split=left+(right-left)*(.42+rand()*.16);
    branch(tip,left,split,level+1,start+duration,color);
    branch(tip,split,right,level+1,start+duration,(color+1+Math.floor(rand()*2))%4);
  }
  branch([w*.5,h-unit*3],unit*3,w-unit*3,0,0,0);
  return {stems,unit};
}
function Bloom({kind}: {kind:number}) {
  if(kind===0)return <><path fill="#e7324a" d="M-1-1C-4-5 0-7 1-5C4-7 6-4 4-2L1 1Z"/><circle cx="1" cy="-3" r="1" fill="#ff9893"/></>;
  if(kind===1)return <><circle cy="-1" r="2" fill="#f33e58"/><path fill="#76ba52" d="M0-2q-3 0-3-3 3-1 4 2z"/></>;
  if(kind===2)return <><path fill="#ff9558" d="m0 0-3-1-1-2 2-1 2 2-1-3 1-1 2 1-1 3 2-2 2 1-1 2z"/><circle r=".8" fill="#ffe4a1"/></>;
  return <><path fill="#72c76d" d="M0 1v-2q-3-1-2-4h4q1 3-1 4v2z"/><path stroke="#9ce18d" strokeWidth=".7" d="M0 0v-3"/></>;
}
export function ProceduralTree({width=460,height=380,depth=3,seed,animated=true}: Partial<TreeSettings>&{animated?:boolean}) {
  const w=limit(width,160,1200,460),h=limit(height,160,1200,380);
  const levels=Math.round(limit(depth,1,5,3));
  const [randomSeed,setRandomSeed]=useState(19);
  useEffect(()=>{if(seed===undefined)setRandomSeed(Math.floor(Math.random()*0xffffffff));},[seed]);
  const actualSeed=seed??randomSeed;
  const {stems,unit}=useMemo(()=>grow({width:w,height:h,depth:levels,seed:actualSeed}),[w,h,levels,actualSeed]);
  const flowerScale=Math.min(unit*.8,w/(2**levels*11));
  return <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} role="img" aria-label="Procedurally grown flowering tree"
    style={{display:"block",maxWidth:"100%",maxHeight:"100%",background:"#101311"}}>
    <style>{`@keyframes tree-draw{from{stroke-dashoffset:1}to{stroke-dashoffset:0}}@keyframes tree-bloom{from{opacity:0;transform:scale(.15)}to{opacity:1;transform:scale(1)}}@media(prefers-reduced-motion:reduce){.tree-stem,.tree-bloom{animation:none!important}}`}</style>
    <g key={`${w}-${h}-${levels}-${actualSeed}`}>{stems.map(({d,color,start,duration,tip,weight,flower},i)=><g key={i}>
      <path className="tree-stem" d={d} stroke={color} strokeWidth={weight} strokeLinecap="round" strokeLinejoin="round" fill="none" pathLength="1" strokeDasharray="1 1"
        style={{animation:animated?`tree-draw ${duration}s linear ${start}s both`:undefined}}/>
      {flower>=0 && <g transform={`translate(${tip}) scale(${flowerScale})`}><g className="tree-bloom" style={{animation:animated?`tree-bloom .32s ease-out ${start+duration}s both`:undefined}}><Bloom kind={flower}/></g></g>}
    </g>)}</g>
  </svg>;
}
