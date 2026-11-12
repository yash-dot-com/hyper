"use client";

import { useEffect, useRef } from "react";

export type LoaderVariant = "lattice" | "relay" | "bloom";
const variants: LoaderVariant[] = ["lattice","relay","bloom"];
const palettes = [
  ["#ffd620","#ff205b","#fffbea"],
  ["#ff205b","#fffbea","#ffd620"],
  ["#fffbea","#ffd620","#ff205b"],
];

// Generate a coherent scaffold, then offset its satellites as complexity grows.
function arrangement(motif:number,count:number) {
  const orientation=Math.random()*Math.PI*2;
  const spread=16+Math.random()*11, arms=2+Math.floor(Math.random()*4);
  return Array.from({length:24},(_,i)=>{
    const n=Math.floor(i/2), satellite=i%2, angle=orientation+n*2*Math.PI/arms;
    const step=(n/arms)%1;
    let x=Math.cos(angle)*spread*(.4+.6*step);
    let y=Math.sin(angle)*spread*(.4+.6*step);
    if(motif===0){x=(n%4-1.5)*10; y=(Math.floor(n/4)-1)*12;}
    if(motif===1){x=(n-5)*4; y=Math.sin(angle)*spread;}
    const jitter=1.5;
    x+=(Math.random()-.5)*jitter+satellite*5;
    y+=(Math.random()-.5)*jitter-satellite*4;
    return {x,y,r: satellite?2+Math.random()*4:5+Math.random()*8,visible:i<count?1:0};
  });
}

export function MomentumLoader({active=true,variant="lattice",size=112}:{
  active?:boolean;variant?:LoaderVariant;size?:number|string;
}) {
  const svg=useRef<SVGSVGElement>(null);
  const motion=useRef({speed:0,angle:0,phase:0});
  const index=variants.indexOf(variant);
  const running=useRef(active);
  const wake=useRef<()=>void>(()=>{});
  useEffect(()=>{running.current=active;wake.current()},[active]);
  useEffect(()=>{
    const root=svg.current!;
    const rotor=root.querySelector("g")!;
    const parts=Array.from(rotor.children);
    const state=motion.current;
    const reduced=matchMedia("(prefers-reduced-motion: reduce)");
    let last=performance.now(),raf=0;
    let count=6, motif=index;
    let from=arrangement(motif,count), to=from;
    state.phase=0;
    function draw(now:number){
      const dt=Math.min(.05,(now-last)/1000);last=now;
      const active=running.current;
      const target=active?1:0;
      state.speed=reduced.matches?target:target+(state.speed-target)*Math.exp(-dt*(active?3.8:2.6));
      if(Math.abs(target-state.speed)<.003)state.speed=target;
      if(!reduced.matches){
        state.angle=(state.angle+dt*100*state.speed)%360;
        state.phase+=dt*.46*state.speed;
        if(state.phase>=1){
          state.phase-=1; from=to;
          const previousCount=count;
          count=Math.min(24,count+2);
          motif=(motif+1+Math.floor(Math.random()*2))%3;
          const sketch=arrangement(motif,count);
          // Grow each new pair beside an existing pair. Move established parts
          // only a short distance toward the new motif on each transition.
          from=from.map((part,i)=>i>=previousCount && i<count
            ? {...from[i-2],r:0,visible:0} : part);
          to=sketch.map((goal,i)=>{
            const start=from[i], dx=goal.x-start.x, dy=goal.y-start.y;
            const step=Math.min(.48,6/Math.max(1,Math.hypot(dx,dy)));
            return {...goal,x:start.x+dx*step,y:start.y+dy*step,
              r:start.visible?start.r+(goal.r-start.r)*.24:goal.r};
          });
        }
      }
      if(!active && state.speed===0 && count>6){count=6;from=to=arrangement(index,count);state.phase=0;}
      rotor.setAttribute("transform",`rotate(${state.angle} 50 50)`);
      const fraction=state.phase;
      const t=fraction**3*(fraction*(6*fraction-15)+10);
      parts.forEach((part,i)=>{
        const a=from[i],b=to[i];
        const amount=state.speed;
        const x=50+(a.x+(b.x-a.x)*t)*amount;
        const y=50+(a.y+(b.y-a.y)*t)*amount;
        const radius=a.r+(b.r-a.r)*t;
        const rest=i===0?10:i===1?3:0;
        const scale=rest+(radius-rest)*amount;
        part.setAttribute("transform",`translate(${x} ${y}) scale(${scale})`);
        part.setAttribute("opacity",String(rest?1:amount*amount*(a.visible+(b.visible-a.visible)*t)));
      });
      if(!reduced.matches && (active||state.speed>0))raf=requestAnimationFrame(draw);
    }
    function restart(){cancelAnimationFrame(raf);last=performance.now();draw(last)}
    wake.current=restart;restart();reduced.addEventListener("change",restart);
    return ()=>{cancelAnimationFrame(raf);reduced.removeEventListener("change",restart)};
  },[index]);
  const colors=palettes[index];
  return <svg ref={svg} role="img" aria-label={active?"Loading":"Idle"} viewBox="0 0 100 100" style={{width:size,maxWidth:"100%",height:"auto",display:"block"}}>
    <g>{Array.from({length:24},(_,i)=>i%2===0
      ? <rect key={i} x="-1" y="-1" width="2" height="2" fill="none" stroke={colors[i<3?0:1]} strokeWidth="1.6" vectorEffect="non-scaling-stroke" opacity={i===0?1:0} transform="translate(50 50) scale(10)"/>
      : <circle key={i} r="1" fill={colors[i%4===1?0:2]} opacity={i===1?1:0} transform="translate(50 50) scale(3)"/>)}</g>
  </svg>;
}
