"use client";

import { useEffect, useId, useRef } from "react";

const flowers=[[83,169],[218,149],[348,179],[447,133]];
const colors=[["#ffd367","#db6230"],["#abede0","#2b8eae"],["#ffc09e","#c66786"]];

export function ButterflyMeadow() {
  const svg=useRef<SVGSVGElement>(null), id=useId();
  useEffect(()=>{
    const node=svg.current!;
    const reduce=matchMedia("(prefers-reduced-motion: reduce)");
    const insects=Array.from(node.querySelectorAll<SVGGElement>("[data-butterfly]")).map((body,i)=>({
      body,wings:Array.from(body.querySelectorAll<SVGGElement>("[data-wing]")),
      x:flowers[i][0],y:flowers[i][1],sx:0,sy:0,tx:0,ty:0,bend:0,
      age:0,duration:1.2+i*.9,phase:i*2,angle:i*15-20,perched:true,landing:false,legs:0
    }));
    type Insect=typeof insects[number];
    function depart(b:Insect,escape=0){
      b.age=0;b.sx=b.x;b.sy=b.y;b.perched=false;b.legs++;
      b.landing=!escape && b.legs>=3;
      const flower=flowers[Math.floor(Math.random()*flowers.length)];
      b.tx=b.landing?flower[0]:Math.max(40,Math.min(460,b.x+(escape||((Math.random()>.5)?1:-1))*(60+Math.random()*150)));
      b.ty=b.landing?flower[1]:35+Math.random()*83;
      b.bend=(Math.random()-.5)*65;
      b.duration=.8+Math.hypot(b.tx-b.x,b.ty-b.y)/120;
    }
    function startle(event:PointerEvent){
      const matrix=node.getScreenCTM();if(!matrix||reduce.matches)return;
      const p=new DOMPoint(event.clientX,event.clientY).matrixTransform(matrix.inverse());
      insects.forEach(b=>{if(b.perched && Math.hypot(b.x-p.x,b.y-p.y)<42){b.legs=0;depart(b,b.x>=p.x?1:-1)}});
    }
    let raf=0,last=0,visible=true;
    function draw(now:number){
      const dt=Math.min(.04,(now-last)/1000);last=now;
      for(const b of insects){
        const oldX=b.x,oldY=b.y;
        b.age+=dt;
        const t=Math.min(1,b.age/b.duration);
        if(!b.perched){
          const ease=t*t*(3-2*t), arch=Math.sin(Math.PI*t);
          b.x=b.sx+(b.tx-b.sx)*ease+b.bend*arch+4*arch*Math.sin(t*8);
          b.y=b.sy+(b.ty-b.sy)*ease-(17+Math.abs(b.bend)*.4)*arch+4*arch*Math.sin(t*14+b.sx);
          if(Math.hypot(b.x-oldX,b.y-oldY)>.015){
            const heading=Math.atan2(b.y-oldY,b.x-oldX)*180/Math.PI+90;
            b.angle+=(((heading-b.angle+540)%360+360)%360-180)*(1-Math.exp(-dt*7));
          }
        }
        const glide=!b.perched && t>.44 && t<.63;
        b.phase+=dt*(b.perched?2.8:glide?2:40);
        const spread=b.perched?.54+.17*Math.sin(b.phase):glide?.91+.05*Math.sin(b.phase):.6+.37*Math.sin(b.phase);
        b.body.setAttribute("transform",`translate(${b.x} ${b.y}) rotate(${b.angle})`);
        b.wings.forEach((wing,j)=>wing.setAttribute("transform",`scale(${(j?1:-1)*spread} 1)`));
        if(t===1){
          if(b.landing){b.landing=false;b.perched=true;b.age=0;b.legs=0;b.duration=2+Math.random()*4;}
          else depart(b);
        }
      }
      raf=requestAnimationFrame(draw);
    }
    function sync(){cancelAnimationFrame(raf);if(visible&&!document.hidden&&!reduce.matches){last=performance.now();raf=requestAnimationFrame(draw)}}
    const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync()});
    observer.observe(node);node.addEventListener("pointermove",startle);node.addEventListener("pointerdown",startle);
    reduce.addEventListener("change",sync);document.addEventListener("visibilitychange",sync);sync();
    return ()=>{cancelAnimationFrame(raf);observer.disconnect();node.removeEventListener("pointermove",startle);node.removeEventListener("pointerdown",startle);reduce.removeEventListener("change",sync);document.removeEventListener("visibilitychange",sync)};
  },[]);
  return <svg ref={svg} viewBox="0 0 500 215" role="img" aria-label="Three butterflies fluttering between wildflowers" style={{display:"block",width:"100%",background:"#f5f0df"}}>
    <defs>{colors.map(([light,dark],i)=><linearGradient key={i} id={id+i} x2=".8" y2="1"><stop stopColor={light}/><stop offset="1" stopColor={dark}/></linearGradient>)}</defs>
    {flowers.map(([x,y],i)=><g key={x} transform={`translate(${x} ${y})`}>
      <path d="M0 0Q-5 28 8 88M0 34Q10 26 18 26Q14 34 0 36M1 51Q-13 48 -18 37Q-7 39 1 48" fill="#889269" stroke="#78835c" strokeWidth="1.2"/>
      {Array.from({length:9},(_,j)=><ellipse key={j} rx="3" ry="7" cy="-5" fill={i%2?"#d8a4a0":"#e5c470"} transform={`rotate(${j*40})`}/>)}
      <circle r="3.3" fill="#946d37"/>
    </g>)}
    {colors.map((_,i)=><g key={i} data-butterfly="" transform={`translate(${flowers[i].join(" ")}) rotate(${i*15-20})`}>
      {[0,1].map(side=><g key={side} data-wing="" transform={`scale(${side?1:-1} 1)`}>
        <path d="M1 1C4 -6 18 -22 26 -22C32 -21 24 -4 17 3C27 5 18 17 10 16C4 15 2 8 1 1Z" fill={`url(#${id+i})`} stroke="#39322e" strokeWidth="1.8"/>
        <path d="M1 1Q14 -6 26 -21M2 1L23 -8M2 2L17 3M2 3L16 12M2 4L9 15" fill="none" stroke="#513e36" strokeWidth=".8"/>
        {[[25,-18],[24,-14],[22,-10],[19,8],[17,11]].map(([x,y])=><circle key={y} cx={x} cy={y} r="1" fill="#fff3d9"/>)}
      </g>)}
      <ellipse rx="1.7" ry="6" fill="#332f26"/><circle cy="-5" r="1.8" fill="#332f26"/><path d="M0 -5Q-2 -10 -4 -11M0 -5Q2 -10 4 -11" fill="none" stroke="#332f26" strokeWidth=".8"/>
    </g>)}
  </svg>;
}
