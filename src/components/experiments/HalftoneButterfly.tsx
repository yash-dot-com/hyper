"use client";

import { useEffect, useRef } from "react";

// A single wing in local coordinates, with the thorax at the origin.
const outline = "M2 -7 C18 -35 53 -65 83 -76 C106 -86 103 -57 99 -40 C96 -21 87 -5 75 0 Q63 6 47 5 C68 12 83 33 71 46 Q67 53 60 51 Q55 63 46 57 Q36 66 28 55 C12 50 6 27 2 12 Z";
// RGB equivalents of the voice blob’s resting CMYK-inspired ink stops.
const inks = [[0,196,250],[250,0,133],[250,225,0],[250,0,133],[22,25,44],[0,196,250]];

export function HalftoneButterfly() {
  const canvas=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const node=canvas.current!,ctx=node.getContext("2d");
    if(!ctx)return;
    ctx.resetTransform();
    const wing=new Path2D(outline);
    // Batch dots by pigment phase so each frame needs only a few fill calls.
    type Dot={x:number;y:number;radius:number;span:number;lag:number;drift:number;freedom:number};
    const bands=Array.from({length:64},(): Dot[]=>[]);
    for(let row=0;row<61;row++){
      const y=-80+row*2.5;
      for(let col=0;col<40;col++){
        const x=col*2.9+(row%2)*1.45;
        if(!ctx.isPointInPath(wing,x,y))continue;
        const distance=Math.hypot(x,y),angle=Math.atan2(y,x);
        const veins=Math.pow(.5+.5*Math.cos(angle*29+distance*.045),7);
        const phase=distance*.007+.18*Math.sin(angle*3)+.12*veins+(y>6?.18:0);
        const band=bands[(Math.floor(phase*64)%64+64)%64];
        const radius=.84+.51*veins+.19*Math.sin(distance*.12);
        const span=Math.min(1,distance/118);
        const lag=1.45*span+.65*(y+80)/140;
        const drift=row*2.31+col*3.81;
        // Measure clearance once. Edge dots ride the membrane while interior
        // dots retain their small independent currents.
        let clearance=0;
        for(const inset of [2,4,6,8]){
          if(!Array.from({length:8},(_,k)=>k*Math.PI/4).every(a=>
            ctx.isPointInPath(wing,x+inset*Math.cos(a),y+inset*Math.sin(a))))break;
          clearance=inset;
        }
        band.push({x,y,radius,span,lag,drift,freedom:Math.max(0,(clearance-2)/6)});
      }
    }
    const reduce=matchMedia("(prefers-reduced-motion: reduce)");
    let visible=false, frame=0, last=0, t=0;
    function paint(now:number){
      if(!reduce.matches)t+=Math.max(0,Math.min(.05,(now-last)/1000));
      last=now;
      const c=ctx!;
      c.setTransform(3,0,0,3,0,0);c.clearRect(0,0,260,180);
      c.translate(130,99+2*Math.sin(t*1.1));
      c.rotate(.035*Math.sin(t*.85));
      const beat=t*4.8+.65*Math.sin(t*1.7);
      for(let i=0;i<bands.length;i++){
        const phase=(i/bands.length+t*.082)*inks.length;
        const n=Math.floor(phase),f=phase-n,a=inks[n%inks.length],b=inks[(n+1)%inks.length];
        c.fillStyle=`rgb(${a.map((v,j)=>Math.round(v+(b[j]-v)*f)).join(",")})`;
        c.beginPath();
        for(const dot of bands[i]){
          // A traveling bend carries neighboring dots together; a smaller
          // independent drift breaks up the rows without losing the silhouette.
          const wave=beat-dot.lag;
          const flow=Math.sin(t*1.6+dot.y*.064+dot.x*.032);
          const dx=dot.freedom*dot.span*(2.9*flow+.95*Math.sin(t*2.1+dot.drift));
          const dy=dot.freedom*dot.span*(2.2*Math.cos(t*1.45+dot.x*.058)+.85*Math.cos(t*1.8+dot.drift));
          for(const side of [-1,1]){
            const localBeat=wave+side*.10;
            const fold=.78+.21*Math.cos(localBeat);
            const x=side*(dot.x*fold+dx);
            const y=dot.y+dy+9*dot.span*dot.span*Math.sin(localBeat);
            const radius=dot.radius*(.83+.17*fold);
            c.moveTo(x+radius,y);c.arc(x,y,radius,0,Math.PI*2);
          }
        }
        c.fill();
      }
      c.strokeStyle="#00c4fa";c.lineWidth=.8;c.beginPath();c.moveTo(-1,-9);c.quadraticCurveTo(-7,-24,-16,-30);
      c.moveTo(1,-9);c.quadraticCurveTo(8,-25,16,-30);c.stroke();
      for(let j=0;j<8;j++){
        c.fillStyle=j<3?"#fae100":"#00c4fa";c.beginPath();c.ellipse(0,-9+j*3,2.4-j*.18,1.5,0,0,Math.PI*2);c.fill();
      }
      if(visible&&!document.hidden&&!reduce.matches)frame=requestAnimationFrame(paint);
    }
    function sync(){cancelAnimationFrame(frame);last=performance.now();if(visible&&!document.hidden)paint(last)}
    const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync()});
    observer.observe(node);reduce.addEventListener("change",sync);document.addEventListener("visibilitychange",sync);
    return ()=>{observer.disconnect();cancelAnimationFrame(frame);reduce.removeEventListener("change",sync);document.removeEventListener("visibilitychange",sync)};
  },[]);
  return <canvas ref={canvas} width={780} height={540} role="img" aria-label="Butterfly with fluttering wings made of shifting cyan, magenta and yellow halftone dots" style={{display:"block",width:"min(100%, 560px)",maxHeight:"100%",objectFit:"contain",background:"#09090d"}}/>;
}
