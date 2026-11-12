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
// Local origin is the attachment to the shoot; fruit hangs below that point.
function Leaf({rotation=0,scale=1}: {rotation?:number; scale?:number}) {
  return <g transform={`rotate(${rotation}) scale(${scale})`}>
    <path fill="#64ac56" d="M0 0C-2.5-1.5-3.1-4.2-2.9-6.6C-.5-5.4 1.3-3.2 0 0Z"/>
    <path fill="#92c96d" d="M0 0Q-1.2-3.5-2.9-6.6C-.5-5.4 1.3-3.2 0 0Z"/>
    <path fill="none" stroke="#447d43" strokeWidth=".2" d="M0 0Q-1-3.4-2.6-6M-1-2.6l-1.1-.55M-1.4-3.8l.35-1"/>
  </g>;
}
function Bloom({kind}: {kind:number}) {
  if(kind===0)return <>
    <path d="M0 0Q.9 1 .3 2.2" fill="none" stroke="#9d8050" strokeWidth=".55"/>
    <Leaf rotation={75} scale={.46}/>
    <path fill="#dc4353" d="M.3 2.1C1.5 1.1 3.3 1.5 3.35 3.2C3.45 4.9 2.3 6.8 1.2 6.65Q.45 6.35-.2 6.6C-1.6 7-3.1 4.65-2.85 3.05C-2.58 1.5-1.05 1.1.3 2.1Z"/>
    <path d="M-2 3.7q-.1-1 .8-1.35" fill="none" stroke="#ff9c96" strokeLinecap="round" strokeWidth=".45"/>
  </>;
  if(kind===1)return <>
    <path d="M-2.1 3.6Q-.5 2.4 0 0Q1.9 1.2 2.5 4.4" fill="none" stroke="#98a05a" strokeWidth=".42"/>
    <Leaf rotation={-42} scale={.48}/>
    {[[-2.1,4.5],[2.5,5.2]].map(([x,y],i)=><g key={i} transform={`translate(${x} ${y})`}>
      <path fill={i?"#ef4857":"#c83651"} d="M0-1.2C1.3-1.9 2.1-.8 1.8.55C1.4 2.55-1.25 2.6-1.85.65C-2.25-.7-1.55-1.85 0-1.2Z"/>
      <ellipse cx="-.7" cy="-.5" rx=".45" ry=".28" fill="#ffb0a3"/>
    </g>)}
  </>;
  if(kind===2)return <><path d="M0 0q.8-1.2.4-2.4" fill="none" stroke="#71a357" strokeWidth=".55"/>
    <g transform="translate(.4 -2.4)">{[0,72,144,216,288].map((angle,i)=><g key={angle} transform={`rotate(${angle})`}>
      <path fill={i%2?"#ff986f":"#f78066"} d="M0 .2C-1.35-.6-2.55-2.7-1.55-3.55Q-.75-4.2-.16-3.6Q.72-4.45 1.55-3.55C2.35-2.5 1.3-.65 0 .2Z"/>
      <path d="M0-.55l-.35-1.65" stroke="#d86259" strokeWidth=".23"/>
    </g>)}<circle r=".94" fill="#ffc95d"/><circle cx="-.22" cy="-.26" r=".33" fill="#fff1a2"/></g>
  </>;
  return <><Leaf rotation={-24} scale={.78}/><Leaf rotation={62}/></>;
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
