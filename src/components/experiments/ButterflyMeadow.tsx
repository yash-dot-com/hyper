"use client";

import { useEffect, useId, useRef } from "react";

const starts=[[94,92],[241,145],[378,75]];
const colors=[["#ffd367","#db6230"],["#abede0","#2b8eae"],["#ffc09e","#c66786"]];

export function ButterflyMeadow() {
  const svg=useRef<SVGSVGElement>(null), id=useId();
  useEffect(()=>{
    const node=svg.current!;
    const reduce=matchMedia("(prefers-reduced-motion: reduce)");
    const insects=Array.from(node.querySelectorAll<SVGGElement>("[data-butterfly]")).map((body,i)=>({
      body,wings:Array.from(body.querySelectorAll<SVGGElement>("[data-wing]")),
      x:starts[i][0],y:starts[i][1],sx:0,sy:0,tx:0,ty:0,bend:0,
      age:0,duration:1.2+i*.9,phase:i*2,angle:i*15-20,cooldown:0
    }));
    type Insect=typeof insects[number];
    function depart(b:Insect,escape=0){
      b.age=0;b.sx=b.x;b.sy=b.y;
      const direction=b.x<90?1:b.x>410?-1:escape||(Math.random()>.5?1:-1);
      b.tx=Math.max(45,Math.min(455,b.x+direction*(60+Math.random()*135)));
      b.ty=75+Math.random()*99;
      b.bend=(Math.random()-.5)*65;
      b.duration=.8+Math.hypot(b.tx-b.x,b.ty-b.y)/120;
    }
    insects.forEach(b=>depart(b));
    function startle(event:PointerEvent){
      const matrix=node.getScreenCTM();if(!matrix||reduce.matches)return;
      const p=new DOMPoint(event.clientX,event.clientY).matrixTransform(matrix.inverse());
      insects.forEach(b=>{if(b.cooldown<=0 && Math.hypot(b.x-p.x,b.y-p.y)<42){b.cooldown=.8;depart(b,b.x>=p.x?1:-1)}});
    }
    let raf=0,last=0,visible=true;
    function draw(now:number){
      const dt=Math.min(.04,(now-last)/1000);last=now;
      for(const b of insects){
        const oldX=b.x,oldY=b.y;
        b.age+=dt;
        const t=Math.min(1,b.age/b.duration);
        b.cooldown-=dt;
        const ease=t*t*(3-2*t), arch=Math.sin(Math.PI*t);
        b.x=b.sx+(b.tx-b.sx)*ease+b.bend*arch+4*arch*Math.sin(t*8);
        b.y=b.sy+(b.ty-b.sy)*ease-(17+Math.abs(b.bend)*.4)*arch+4*arch*Math.sin(t*14+b.sx);
        if(Math.hypot(b.x-oldX,b.y-oldY)>.015){
          const heading=Math.atan2(b.y-oldY,b.x-oldX)*180/Math.PI+90;
          b.angle+=(((heading-b.angle+540)%360+360)%360-180)*(1-Math.exp(-dt*7));
        }
        const glide=t>.44 && t<.63;
        b.phase+=dt*(glide?2:40);
        const spread=glide?.91+.05*Math.sin(b.phase):.6+.37*Math.sin(b.phase);
        b.body.setAttribute("transform",`translate(${b.x} ${b.y}) rotate(${b.angle})`);
        b.wings.forEach((wing,j)=>wing.setAttribute("transform",`scale(${(j?1:-1)*spread} 1)`));
        if(t===1)depart(b);
      }
      raf=requestAnimationFrame(draw);
    }
    function sync(){cancelAnimationFrame(raf);if(visible&&!document.hidden&&!reduce.matches){last=performance.now();raf=requestAnimationFrame(draw)}}
    const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync()});
    observer.observe(node);node.addEventListener("pointermove",startle);node.addEventListener("pointerdown",startle);
    reduce.addEventListener("change",sync);document.addEventListener("visibilitychange",sync);sync();
    return ()=>{cancelAnimationFrame(raf);observer.disconnect();node.removeEventListener("pointermove",startle);node.removeEventListener("pointerdown",startle);reduce.removeEventListener("change",sync);document.removeEventListener("visibilitychange",sync)};
  },[]);
  return <svg ref={svg} viewBox="0 0 500 215" role="img" aria-label="Three butterflies roaming in open space" style={{display:"block",width:"100%",background:"#f5f0df"}}>
    <defs>{colors.map(([light,dark],i)=><linearGradient key={i} id={id+i} x2=".8" y2="1"><stop stopColor={light}/><stop offset="1" stopColor={dark}/></linearGradient>)}</defs>
    {colors.map((_,i)=><g key={i} data-butterfly="" transform={`translate(${starts[i].join(" ")}) rotate(${i*15-20})`}>
      {[0,1].map(side=><g key={side} data-wing="" transform={`scale(${side?1:-1} 1)`}>
        <path d="M1 1C4 -6 18 -22 26 -22C32 -21 24 -4 17 3C27 5 18 17 10 16C4 15 2 8 1 1Z" fill={`url(#${id+i})`} stroke="#39322e" strokeWidth="1.8"/>
        <path d="M1 1Q14 -6 26 -21M2 1L23 -8M2 2L17 3M2 3L16 12M2 4L9 15" fill="none" stroke="#513e36" strokeWidth=".8"/>
        {[[25,-18],[24,-14],[22,-10],[19,8],[17,11]].map(([x,y])=><circle key={y} cx={x} cy={y} r="1" fill="#fff3d9"/>)}
      </g>)}
      <ellipse rx="1.7" ry="6" fill="#332f26"/><circle cy="-5" r="1.8" fill="#332f26"/><path d="M0 -5Q-2 -10 -4 -11M0 -5Q2 -10 4 -11" fill="none" stroke="#332f26" strokeWidth=".8"/>
    </g>)}
  </svg>;
}
