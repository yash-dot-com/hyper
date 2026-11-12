"use client";

import { useEffect,useRef,type ReactNode } from "react";

const inks={
  citrus:["#ff8b09","#ffd335","#ffb42b","#ff7546","#ff4835","#ed1249","#fd8897"],
  prism:["#f50e8c","#ff719c","#ff5c41","#ffaa21","#f5278b","#ad40c2","#4f86da","#0083ae","#19bbae","#a1e9bd"],
  lime:["#008aa9","#13c4bd","#67efd0","#00af78","#57d72a","#aff017","#edea15","#ffc022"],
} as const;
export type BandPalette=keyof typeof inks;
// Intersect concentric elliptical contours with horizontal slices. Sampling
// each contour at the row center gives the print its stepped, woven edges.
export function BreathingBandsFooter({children,palette="citrus"}:{children?:ReactNode;palette?:BandPalette}){
  const ref=useRef<HTMLCanvasElement>(null);
  const elapsed=useRef(0);
  useEffect(()=>{
    const node=ref.current!,ctx=node.getContext("2d");
    if(!ctx)return;
    const reduced=matchMedia("(prefers-reduced-motion: reduce)");
    let visible=false,frame=0,last=0;
    const colors=inks[palette];
    function paint(now:number){
      elapsed.current+=reduced.matches?0:Math.min(.08,(now-last)/1000);
      last=now;
      const c=ctx!;
      c.setTransform(1,0,0,node.height/110,0,0);
      const phase=elapsed.current*Math.PI/4;
      const breath=(1-Math.cos(phase))/2;
      c.fillStyle=colors[0];c.fillRect(0,0,960,110);
      for(let group=0;group<4;group++){
        const center=group*269+38+Math.sin(phase+group)*19;
        for(let ring=8;ring>0;ring--){
          const rx=(ring*20+12)*(1+.23*breath);
          const ry=(ring*11+5)*(1+.17*Math.sin(phase+group*.8));
          c.fillStyle=colors[(group*2+8-ring)%colors.length];
          for(let row=0;row<10;row++){
            const dy=(row*11+5.5-55)/ry;
            if(Math.abs(dy)>=1)continue;
            const half=rx*(group%3===2?1-Math.abs(dy):Math.sqrt(1-dy*dy));
            c.fillRect(center-half,row*11,half*2,11);
          }
        }
      }
      if(visible&&!document.hidden&&!reduced.matches)frame=requestAnimationFrame(paint);
    }
    function sync(){cancelAnimationFrame(frame);last=performance.now();if(visible&&!document.hidden)paint(last)}
    const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync()});
    observer.observe(node);document.addEventListener("visibilitychange",sync);reduced.addEventListener("change",sync);
    return ()=>{cancelAnimationFrame(frame);observer.disconnect();document.removeEventListener("visibilitychange",sync);reduced.removeEventListener("change",sync)};
  },[palette]);
  return <footer style={{width:"100%",background:"#fff9ee",color:"#252318"}}>
    <canvas ref={ref} width="960" height="280" aria-hidden="true" style={{display:"block",width:"100%",height:"auto",minHeight:"130px"}}/>
    {children&&<div style={{padding:"1rem 4%"}}>{children}</div>}
  </footer>;
}
