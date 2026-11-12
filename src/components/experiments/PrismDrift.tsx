"use client";

import { useEffect, useRef, type ReactNode, type CSSProperties } from "react";

const warm=[[245,235,25],[251,176,82],[238,44,176],[198,58,194],[239,116,21]];
const cool=[[245,235,25],[71,213,192],[36,151,198],[59,57,154],[76,34,131]];
const widths=[5,42,34,64,46,22,14,13,24,12,8,15,20,12,31,27,33,61,24,24,32,24,49,19,26];

export function PrismDrift({children,className,style,speed=1}:{
  children?:ReactNode;className?:string;style?:CSSProperties;speed?:number;
}){
  const canvas=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const node=canvas.current!,c=node.getContext("2d");
    if(!c)return;
    const reduced=matchMedia("(prefers-reduced-motion: reduce)");
    const total=widths.reduce((a,b)=>a+b,0);
    let visible=false,frame=0,elapsed=0,last=0;
    function draw(now:number){
      const ctx=c!;
      if(last && !reduced.matches)elapsed+=Math.min(.1,(now-last)/1000)*speed;
      last=now;
      const t=elapsed*2*Math.PI/20;
      // Ease between the two ink sets twice per loop, holding each at full strength.
      const mix=Math.max(0,Math.min(1,(-Math.cos(t)-.05)*2.1+.5));
      const colors=warm.map((base,i)=>"rgb("+base.map((v,j)=>Math.round(v+(cool[i][j]-v)*mix)).join(",")+")");
      const h=node.height,w=node.width;
      let x=0;
      widths.forEach(width=>{
        const u=(x+width*.5)/total, a=u*2*Math.PI;
        const wave=.68*Math.sin(a)+.24*Math.sin(2*a-.5)+.1*Math.sin(a+t);
        const period=h*1.43;
        const offset=((wave*h*.90+elapsed*h*.20)%period+period)%period;
        const g=ctx.createLinearGradient(0,offset-period,0,offset+period);
        for(let loop=0;loop<2;loop++)colors.forEach((color,i)=>g.addColorStop((loop+i/colors.length)/2,color));
        g.addColorStop(1,colors[0]);
        const left=Math.round(w*x/total);x+=width;
        ctx.fillStyle=g;ctx.fillRect(left,0,Math.round(w*x/total)-left,h);
      });
      if(visible&&!document.hidden&&!reduced.matches&&speed!==0)frame=requestAnimationFrame(draw);
    }
    function sync(){cancelAnimationFrame(frame);last=0;if(visible&&!document.hidden)draw(performance.now())}
    const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync()});
    observer.observe(node);reduced.addEventListener("change",sync);document.addEventListener("visibilitychange",sync);
    return ()=>{observer.disconnect();cancelAnimationFrame(frame);reduced.removeEventListener("change",sync);document.removeEventListener("visibilitychange",sync)};
  },[speed]);
  return <div className={className} style={{position:"relative",isolation:"isolate",overflow:"hidden",background:"linear-gradient(120deg,#ef7415,#ed2cb0,#f5eb19)",...style}}>
    <canvas ref={canvas} aria-hidden="true" width={960} height={480} style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none",zIndex:-1}}/>
    {children}
  </div>;
}
