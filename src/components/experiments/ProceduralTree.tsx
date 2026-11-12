"use client";

import { useEffect, useId, useMemo, useState } from "react";

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
// Each print pairs a branching habit, a cut-paper leaf and a ceramic pattern.
const prints = {
  "Scarlet vine": ["#18714d","#14764c","#cb3026","#f7aa29","#e04a21","vine","petal"],
  "Lime lattice": ["#248e81","#91bd32","#629e31","#ea8730","#765b37","fork","diamond"],
  "Golden lantern": ["#a28a41","#cb2f23","#f3d332","#b99a43","#346744","vine","lantern"],
  "Blue stalks": ["#1a6345","#167545","#197fc3","#f5a42e","#e24720","stalk","wheel"],
  "Copper fern": ["#b32c68","#e99a55","#df8650","#cf3725","#313946","fork","fern"],
  "Cobalt canopy": ["#a72857","#1168a0","#164b87","#395159","#232d41","arch","fold"],
  "Citrus blossom": ["#18714f","#11734b","#ed8528","#17628d","#f59c24","fork","outline"],
  "Indigo pinwheel": ["#95a53a","#136b9f","#155a99","#ec9225","#cb3824","vine","wheel"],
  "Stacked succulent": ["#789345","#497b39","#c83c29","#cd452b","#37434a","stalk","stack"],
} as const;
export type TreeDesign = "Original" | keyof typeof prints;
export const treeDesigns: TreeDesign[] = ["Original", ...Object.keys(prints) as (keyof typeof prints)[]];

function PaperPlant({design,width,height,depth,seed,animated}:TreeSettings & {design:keyof typeof prints;animated:boolean}) {
  const [ink,green,accent,clay,glaze,habit,motif]=prints[design];
  let n=seed>>>0;
  const random=()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296;};
  const rows=depth+3;
  const clipId=useId();
  const pattern=Object.keys(prints).indexOf(design);
  const sprout=(x:number,y:number,angle:number,scale:number,flower:boolean,delay:number)=><g transform={`translate(${x} ${y}) rotate(${angle}) scale(${scale})`}>
    <g className="paper-leaf" style={{animation:animated?`paper-unfold .24s ease-out ${delay}s both`:undefined}}>
      {flower && motif==="wheel" ? [0,90,180,270].map(r=><path key={r} transform={`rotate(${r})`} d="M0 0 -6-3 -4-9 2-5Z" fill={accent}/>) :
       flower && motif==="lantern" ? <><path d="m0 0-6-5 6-6 6 6z" fill={accent}/><circle cy="-5" r=".9" fill={ink}/></> :
       flower && motif==="outline" ? <path d="m0 0-5-3v-6l5-3 5 3v6z" fill="#fffcf2" stroke="#145784" strokeWidth="1.25"/> :
       motif==="fern" ? <path d="m0 0-6-3 4-1-5-3 5 1-3-5 5 3 1-5 2 8z" fill={green}/> :
       motif==="stack" ? <><path d="m0 0-6-7H6z M0-4l-5-7H5z" fill={green}/>{flower&&<path d="m0-10-4-5 4 3 4-3z" fill={accent}/>}</> :
       <path d={motif==="diamond"?"M0 0-5-5 0-12 5-6Z":motif==="fold"?"M0 0-8-2-8-10 0-7Z":"M0 0-5-5-4-13 2-7Z"} fill={flower?accent:green}/>}
      {flower && motif==="wheel" && <rect x="-1.6" y="-1.6" width="3.2" height="3.2" fill="#ffd342"/>}
    </g></g>;
  const pots=["M46 143h28l-3 5 3 9-7 6H53l-7-6 3-9Z","M41 143h38l-5 6 5 7-6 4 4 3H43l4-4-5-5 5-5Z","M47 143h26l3 4-2 12-5 4H51l-5-5-1-11Z","M32 141h56l-5 5 5 4-5 5 5 4-4 4H36l-4-4 5-4-5-5 5-4Z","M48 141h24v4l-3 2 8 10v6H43v-6l8-10-3-2Z","M46 142h28v21H46Z","M39 145l5-5h32l5 5v13l-7 5H47l-8-5Z","M39 146l8-7h26l8 7v11l-7 4 2 3H44l2-3-7-5Z","M35 140h50v6l-4 2-3 14H43l-3-15-5-1Z"];
  return <svg viewBox="0 0 120 174" width={width} height={height} role="img" aria-label={design+" potted plant"}>
    <style>{`@keyframes paper-grow{from{stroke-dashoffset:1}to{stroke-dashoffset:0}}@keyframes paper-unfold{from{transform:scale(.1);opacity:0}to{transform:scale(1);opacity:1}}@media(prefers-reduced-motion:reduce){.paper-stem,.paper-leaf{animation:none!important}}`}</style>
    <g key={design+seed+":"+depth}>{[-1,0,1].map((axis,j)=>{
      let x=60+(habit==="stalk"?axis*15:axis*3),y=145;
      const step=(120-Math.abs(axis)*(7+random()*15))/rows;
      return <g key={axis}>{Array.from({length:rows},(_,i)=>{
        const oldX=x,oldY=y,side=(i+j)%2?1:-1;
        x=60+axis*(habit==="stalk"?15:14+10*Math.sin((i+1)/rows*Math.PI))+(habit==="stalk"?0:(random()-.5)*10);
        y-=step;
        const reach=5+random()*8,tx=x+side*reach,ty=y+(habit==="arch"?4:-5);
        const delay=i*.16+j*.045;
        const style={animation:animated?`paper-grow .20s linear ${delay}s both`:undefined};
        return <g key={i}>
          <path className="paper-stem" d={`M${oldX} ${oldY}V${y+Math.min(step*.6,Math.abs(x-oldX))}L${x} ${y}m0 0l${side*reach*.5} -5L${tx} ${ty}`} stroke={ink} fill="none" strokeWidth="1.25" pathLength="1" strokeDasharray="1 1" style={style}/>
          {sprout(tx,ty,side*(22+random()*18),.76+random()*.32,(habit!=="stalk"&&i%3===1)||i===rows-1,delay+.18)}
          {sprout(x,y,-side*23,.8,i===rows-1,delay+.16)}
        </g>;
      })}</g>;
    })}</g>
    <path d={pots[pattern]} fill={clay}/>
    <svg x="30" y="137" width="60" height="30" viewBox="30 137 60 30">
      <defs><clipPath id={clipId}><path d={pots[pattern]}/></clipPath></defs>
      <g clipPath={`url(#${clipId})`} fill="none" stroke={glaze} strokeWidth="2">
        {pattern%3===0?<path d="M28 146h65m-65 9h65"/>:pattern%3===1?<path d="m32 154 7-5 7 5 7-5 7 5 7-5 7 5 7-5 7 5"/>:[0,1,2,3,4,5,6,7].map(i=><path key={i} d={`M${40+i*5} 162l5-20`}/>)}
      </g>
    </svg>
  </svg>;
}
export function ProceduralTree({width=460,height=380,depth=3,seed,animated=true,design="Original"}: Partial<TreeSettings>&{animated?:boolean;design?:TreeDesign}) {
  const w=limit(width,160,1200,460),h=limit(height,160,1200,380);
  const levels=Math.round(limit(depth,1,5,3));
  const [randomSeed,setRandomSeed]=useState(19);
  useEffect(()=>{if(seed===undefined)setRandomSeed(Math.floor(Math.random()*0xffffffff));},[seed]);
  const actualSeed=seed??randomSeed;
  const {stems,unit}=useMemo(()=>grow({width:w,height:h,depth:levels,seed:actualSeed}),[w,h,levels,actualSeed]);
  const flowerScale=Math.min(unit*.8,w/(2**levels*11));
  return <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="100%" role="img" aria-label={design==="Original"?"Procedurally grown flowering tree":design+" potted plant"}
    style={{display:"block",background:design==="Original"?"#101311":"#fffcf2"}}>
    {design!=="Original" ? <PaperPlant design={design} width={w} height={h} depth={levels} seed={actualSeed} animated={animated}/> : <>
    <style>{`@keyframes tree-draw{from{stroke-dashoffset:1}to{stroke-dashoffset:0}}@keyframes tree-bloom{from{opacity:0;transform:scale(.15)}to{opacity:1;transform:scale(1)}}@media(prefers-reduced-motion:reduce){.tree-stem,.tree-bloom{animation:none!important}}`}</style>
    <g key={`${w}-${h}-${levels}-${actualSeed}`}>{stems.map(({d,color,start,duration,tip,weight,flower},i)=><g key={i}>
      <path className="tree-stem" d={d} stroke={color} strokeWidth={weight} strokeLinecap="round" strokeLinejoin="round" fill="none" pathLength="1" strokeDasharray="1 1"
        style={{animation:animated?`tree-draw ${duration}s linear ${start}s both`:undefined}}/>
      {flower>=0 && <g transform={`translate(${tip}) scale(${flowerScale})`}><g className="tree-bloom" style={{animation:animated?`tree-bloom .32s ease-out ${start+duration}s both`:undefined}}><Bloom kind={flower}/></g></g>}
    </g>)}</g>
    </>}
  </svg>;
}
