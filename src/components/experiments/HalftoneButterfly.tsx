"use client";

import { useEffect, useRef } from "react";

// A single wing in local coordinates, with the thorax at the origin.
const outline = "M2 -7 C18 -35 53 -65 83 -76 C106 -86 103 -57 99 -40 C96 -21 87 -5 75 0 Q63 6 47 5 C68 12 83 33 71 46 Q67 53 60 51 Q55 63 46 57 Q36 66 28 55 C12 50 6 27 2 12 Z";
// RGB equivalents of the voice blob’s resting CMYK-inspired ink stops.
const originalInks = [[0,196,250],[250,0,133],[250,225,0],[250,0,133],[22,25,44],[0,196,250]];

function generator(seed:number) {
  let state=seed>>>0;
  return ()=>{
    state=(state+0x6d2b79f5)>>>0;
    let v=Math.imul(state^(state>>>15),state|1);
    v^=v+Math.imul(v^(v>>>7),v|61);
    return ((v^(v>>>14))>>>0)/4294967296;
  };
}

function pigment(hue:number,saturation:number,light:number) {
  return [0,8,4].map(offset=>{
    const k=(offset+hue/30)%12;
    return Math.round(255*(light-saturation*Math.min(light,1-light)*Math.max(-1,Math.min(k-3,9-k,1))));
  });
}

export function HalftoneButterfly({ hue=0, seed=0 }: {hue?:number;seed?:number} = {}) {
  return <div role="img" aria-label="Two flying butterflies with distinct color-shifting halftone wings"
    style={{position:"relative",width:"100%",height:"100%",background:"#09090d",overflow:"hidden",filter:hue?`hue-rotate(${hue}deg)`:undefined}}>
    <ButterflyLayer seed={seed} companion={false}/>
    <ButterflyLayer seed={seed} companion/>
  </div>;
}

function ButterflyLayer({seed,companion}:{seed:number;companion:boolean}) {
  const canvas=useRef<HTMLCanvasElement>(null);
  const flight=useRef({t:companion?3.4:0,travel:0,heading:companion?-1.5:.55,bank:0,pitch:0,wingPhase:companion?2:0,destination:companion?2:0,
    route:companion?[[.96,.23,18],[.91,.63,30],[.24,.82,-42],[.05,.68,-23]]:[[.04,.72,-42],[.08,.45,-48],[.76,.19,24],[.96,.31,34]]});
  useEffect(()=>{
    const node=canvas.current!,ctx=node.getContext("2d");
    if(!ctx)return;
    ctx.resetTransform();
    const wing=new Path2D(outline);
    // Batch dots by pigment phase so each frame needs only a few fill calls.
    type Dot={x:number;y:number;radius:number;span:number;lag:number;drift:number;freedom:number};
    const pair=generator(seed);
    const base=(seed===0?195:pair()*360)+(companion?150+pair()*60:0);
    const random=generator(seed^(companion?0x6271dac3:0x15f389bd));
    const classic=!companion&&seed===0;
    const inks=classic?originalInks:Array.from({length:4+Math.floor(random()*4)},()=>
      pigment((base+(random()-.5)*116+360)%360,.68+random()*.31,.38+random()*.38));
    const frequency=.006+random()*.022, stripes=2+random()*6;
    const spotX=20+random()*50,spotY=-48+random()*70, twist=random()*5;
    const spacing=2.55+random()*.9;
    const bands=Array.from({length:64},(): Dot[]=>[]);
    for(let row=0;row<Math.ceil(148/(classic?2.5:spacing*.86));row++){
      const y=-80+row*(classic?2.5:spacing*.86);
      for(let col=0;col<42;col++){
        const x=(col+(row%2)*.5)*(classic?2.9:spacing);
        if(!ctx.isPointInPath(wing,x,y))continue;
        const distance=Math.hypot(x,y),angle=Math.atan2(y,x);
        const veins=Math.pow(.5+.5*Math.cos(angle*29+distance*.045),7);
        const phase=classic?distance*.007+.18*Math.sin(angle*3)+.12*veins+(y>6?.18:0)
          : Math.hypot(x-spotX,y-spotY)*frequency+.24*Math.sin(angle*stripes+twist+distance*.035)+.16*veins;
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
    let visible=false, frame=0, last=0;
    // Overlapping spline spans preserve velocity through each new destination.
    // Pairs of destinations at each side produce broad passes and sweeping turns.
    const route=flight.current.route;
    let {t,destination,travel,heading,bank,pitch,wingPhase}=flight.current;
    function paint(now:number){
      const dt=reduce.matches?0:Math.max(0,Math.min(.05,(now-last)/1000));
      t+=dt;
      last=now;
      const c=ctx!;
      const width=node.clientWidth||260,height=node.clientHeight||180;
      const dpr=Math.min(window.devicePixelRatio||1,2);
      if(node.width!==Math.round(width*dpr)||node.height!==Math.round(height*dpr)){
        node.width=Math.round(width*dpr);node.height=Math.round(height*dpr);
      }
      c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,width,height);
      const unit=Math.min(width/260,height/180);
      const margin=52*unit;
      const glide=Math.min(1,Math.max(0,.55+.8*Math.sin(t*.85+.55*Math.sin(t*.41))));
      travel+=dt*(.35+.045*Math.sin(t*.51)-.035*glide);
      if(travel>=1){
        travel-=1;
        const left=destination%4<2;
        const high=(destination+1)%4<2;
        destination++;
        route.shift();route.push([left?Math.random()*.15:.85+Math.random()*.15,
          high?Math.random()*.24:.76+Math.random()*.24,-58+Math.random()*102]);
      }
      const u=travel,v=1-u;
      const weights=[v**3,3*u**3-6*u*u+4,-3*u**3+3*u*u+3*u+1,u**3];
      const tangent=[-3*v*v,9*u*u-12*u,-9*u*u+6*u+3,3*u*u];
      const sum=(axis:number,coeff:number[])=>route.reduce((n,p,i)=>n+p[axis]*coeff[i]/6,0);
      const target=Math.atan2(sum(1,tangent)*(height-2*margin),sum(0,tangent)*(width-2*margin))+Math.PI/2;
      const turn=Math.atan2(Math.sin(target-heading),Math.cos(target-heading));
      heading+=turn*(1-Math.exp(-dt*7));
      bank+=(Math.max(-.45,Math.min(.45,turn))-bank)*(1-Math.exp(-dt*4));
      wingPhase+=dt*(7+.8*Math.sin(t*1.3))*(1-.8*glide);
      const cameraDistance=285, depth=cameraDistance-sum(2,weights);
      const perspective=cameraDistance/depth;
      const climb=Math.atan2(sum(2,tangent),Math.hypot(sum(0,tangent)*210,sum(1,tangent)*110));
      pitch+=(Math.max(-.95,Math.min(.95,climb))-pitch)*(1-Math.exp(-dt*5));
      const cp=Math.cos(pitch),sp=Math.sin(pitch),cb=Math.cos(bank),sb=Math.sin(bank);
      c.translate(margin+sum(0,weights)*(width-2*margin),margin+sum(1,weights)*(height-2*margin)+unit*Math.sin(wingPhase));
      c.rotate(heading);
      c.scale(.40*unit*perspective,.40*unit*perspective);
      const beat=wingPhase;
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
            // Hinge the membrane at the thorax, then roll and pitch it into camera space.
            const flap=(.47-.68*Math.cos(localBeat))*(1-glide)+.18*glide;
            const span=dot.x+dx, lateral=side*span*Math.cos(flap), lift=span*Math.sin(flap);
            const fore=dot.y+dy;
            const rolledZ=lateral*sb+lift*cb;
            const localZ=rolledZ*cp-fore*sp;
            const projection=depth/(depth-.47*localZ);
            const x=(lateral*cb-lift*sb)*projection;
            const y=(fore*cp+rolledZ*sp)*projection;
            const radius=dot.radius*projection;
            c.moveTo(x+radius,y);c.arc(x,y,radius,0,Math.PI*2);
          }
        }
        c.fill();
      }
      c.scale(cb,cp);
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
    return ()=>{Object.assign(flight.current,{t,destination,travel,heading,bank,pitch,wingPhase});observer.disconnect();cancelAnimationFrame(frame);reduce.removeEventListener("change",sync);document.removeEventListener("visibilitychange",sync)};
  },[seed,companion]);
  return <canvas ref={canvas} width={780} height={540} aria-hidden="true" style={{position:"absolute",inset:0,width:"100%",height:"100%"}}/>;
}
