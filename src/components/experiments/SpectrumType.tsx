"use client";

import { useId, useLayoutEffect, useRef, useState } from "react";

const spectrum=[[197,8,18],[247,81,14],[255,211,22],[246,219,25],[0,149,86],[24,62,131],[93,43,120],[238,161,203],[157,219,230],[166,122,84],[255,252,244]];
const layers=160;
const faces=Array.from({length:layers},(_,i)=>{
  const t=(layers-i)/layers;
  const stop=t*(spectrum.length-1),index=Math.min(spectrum.length-2,Math.floor(stop));
  const rgb=spectrum[index].map((v,c)=>Math.round(v+(spectrum[index+1][c]-v)*(stop-index)));
  return {t,fill:`rgb(${rgb.join(",")})`};
});

export function SpectrumType({text="Prism",angle=70,depth=155}:{text?:string;angle?:number;depth?:number}){
  const id=useId(), glyph=useRef<SVGTextElement>(null);
  const [bounds,setBounds]=useState({x:-120,y:-75,width:240,height:80});
  useLayoutEffect(()=>{
    let mounted=true;
    function measure(){
      if(!mounted||!glyph.current)return;
      const {x,y,width,height}=glyph.current.getBBox();
      setBounds({x,y,width,height});
    }
    measure();void document.fonts.ready.then(measure);
    return ()=>{mounted=false};
  },[text]);
  const radians=angle*Math.PI/180,length=Math.max(0,depth);
  const dx=Math.cos(radians)*length,dy=Math.sin(radians)*length;
  const w=bounds.width/2,h=bounds.height/2,tip=.34;
  const left=Math.min(-w,dx-w*tip),right=Math.max(w,dx+w*tip);
  const top=Math.min(-h,dy-h*tip),bottom=Math.max(h,dy+h*tip);
  const margin=14;
  return <h1 style={{margin:0,width:"100%",lineHeight:1}}>
    <svg role="img" aria-label={text} viewBox={`${left-margin} ${top-margin} ${right-left+margin*2} ${bottom-top+margin*2}`}
      style={{display:"block",width:"100%",height:"100%",maxHeight:"inherit",overflow:"hidden"}}>
      <defs><g id={id} transform={`translate(${-bounds.x-w} ${-bounds.y-h})`}>
        <text ref={glyph} textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontSize="100" fontWeight="800" letterSpacing="-6">{text}</text>
      </g></defs>
      {length>0 && faces.map(({t,fill},i)=><use key={i} href={"#"+id} fill={fill}
        transform={`translate(${dx*t} ${dy*t}) scale(${1-(1-tip)*t})`}/>)}
      <use href={"#"+id} fill="#090909"/>
    </svg>
  </h1>;
}
