"use client";

import { useEffect, useRef } from "react";

export type LoaderVariant = "lattice" | "relay" | "bloom";
const variants: LoaderVariant[] = ["lattice","relay","bloom"];
const palettes = [
  ["#ffd620","#ff205b","#fffbea"],
  ["#ff205b","#fffbea","#ffd620"],
  ["#fffbea","#ffd620","#ff205b"],
];

// Each motif uses the same six frames and four dots, so every part has
// a destination when the layout changes.
function pose(motif:number, i:number) {
  const dot=i>=6, n=dot?i-6:i;
  const theta=n*Math.PI*2/(dot?4:6);
  if(motif===0) return [(n%(dot?2:3)-.5)*13-3, (Math.floor(n/(dot?2:3))-.5)*14, dot?5:12];
  if(motif===1) return [(n-2)*6+(dot?8:0), (2-n)*6+(dot?5:0), dot?4:14-n*.8];
  return [Math.cos(theta)*(dot?8:15),Math.sin(theta)*(dot?8:15),dot?6:9];
}

export function MomentumLoader({active=true,variant="lattice",size=112}:{
  active?:boolean;variant?:LoaderVariant;size?:number|string;
}) {
  const svg=useRef<SVGSVGElement>(null);
  const motion=useRef({speed:0,angle:0,phase:0});
  const index=variants.indexOf(variant);
  useEffect(()=>{
    const root=svg.current!;
    const rotor=root.querySelector("g")!;
    const parts=Array.from(rotor.children);
    const state=motion.current;
    const reduced=matchMedia("(prefers-reduced-motion: reduce)");
    let last=performance.now(),raf=0;
    function draw(now:number){
      const dt=Math.min(.05,(now-last)/1000);last=now;
      const target=active?1:0;
      state.speed=reduced.matches?target:target+(state.speed-target)*Math.exp(-dt*(active?3.8:2.6));
      if(Math.abs(target-state.speed)<.003)state.speed=target;
      if(!reduced.matches){
        state.angle=(state.angle+dt*100*state.speed)%360;
        state.phase=(state.phase+dt*.55*state.speed)%3;
      }
      rotor.setAttribute("transform",`rotate(${state.angle} 50 50)`);
      const phase=state.phase+index, base=Math.floor(phase), fraction=phase-base;
      const t=fraction*fraction*(3-2*fraction);
      parts.forEach((part,i)=>{
        const from=pose(base%3,i),to=pose((base+1)%3,i);
        const amount=state.speed;
        const x=50+(from[0]+(to[0]-from[0])*t)*amount;
        const y=50+(from[1]+(to[1]-from[1])*t)*amount;
        const radius=from[2]+(to[2]-from[2])*t;
        const rest=i===0?10:i===6?3:0;
        const scale=rest+(radius-rest)*amount;
        part.setAttribute("transform",`translate(${x} ${y}) scale(${scale})`);
        part.setAttribute("opacity",String(rest?1:amount*amount));
      });
      if(!reduced.matches && (active||state.speed>0))raf=requestAnimationFrame(draw);
    }
    function restart(){cancelAnimationFrame(raf);last=performance.now();draw(last)}
    restart();reduced.addEventListener("change",restart);
    return ()=>{cancelAnimationFrame(raf);reduced.removeEventListener("change",restart)};
  },[active,index]);
  const colors=palettes[index];
  return <svg ref={svg} role="img" aria-label={active?"Loading":"Idle"} viewBox="0 0 100 100" style={{width:size,maxWidth:"100%",height:"auto",display:"block"}}>
    <g>{Array.from({length:10},(_,i)=>i<6
      ? <rect key={i} x="-1" y="-1" width="2" height="2" fill="none" stroke={colors[i<3?0:1]} strokeWidth="1.6" vectorEffect="non-scaling-stroke" opacity={i===0?1:0} transform="translate(50 50) scale(10)"/>
      : <circle key={i} r="1" fill={colors[i%2?2:0]} opacity={i===6?1:0} transform="translate(50 50) scale(3)"/>)}</g>
  </svg>;
}
