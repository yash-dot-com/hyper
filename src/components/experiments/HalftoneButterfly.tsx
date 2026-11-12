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

function wingContour(seed:number,companion:boolean) {
  if(!seed)return outline;
  const random=generator(seed^(companion?0x615eaa:0x1408dd));
  // Alternate which butterfly gets the long forewing and tapered hindwing.
  const pointed=Boolean(seed&1)!==companion;
  const tipX=(pointed?89:70)+random()*10;
  const tipY=(pointed?-77:-60)+random()*8;
  const notch=36+random()*16;
  const hip=58+random()*18;
  const hindwing=pointed
    ? `Q${hip+5} 38 ${hip-7} 39 Q${hip-11} 45 ${hip-16} ${56+random()*8} Q${hip-20} 50 ${hip-22} 47`
    : `C${hip+4} 50 ${hip-6} 62 ${hip-18} 57 Q${hip-25} 64 ${hip-31} 54`;
  return `M2 -7 Q28 -51 ${tipX} ${tipY}
    Q${pointed?tipX+3:tipX+26} ${pointed?tipY+2:tipY-8} ${pointed?tipX-2:tipX+19} -34
    Q85 -2 ${notch} 5 Q${hip+4} 13 ${hip} 31
    ${hindwing} Q12 55 2 12 Z`;
}

function pigment(hue:number,saturation:number,light:number) {
  return [0,8,4].map(offset=>{
    const k=(offset+hue/30)%12;
    return Math.round(255*(light-saturation*Math.min(light,1-light)*Math.max(-1,Math.min(k-3,9-k,1))));
  });
}

export function HalftoneButterfly({ hue=0, seed=0, patternSeed=0, shapeSeed=0 }: {hue?:number;seed?:number;patternSeed?:number;shapeSeed?:number} = {}) {
  return <div role="img" aria-label="Four flying butterflies with distinct color-shifting halftone wings"
    style={{position:"relative",width:"100%",height:"100%",background:"#fff",overflow:"hidden",filter:hue?`hue-rotate(${hue}deg)`:undefined}}>
    {[0,1,2,3].map(index=><ButterflyLayer key={index} index={index} shapeSeed={shapeSeed} patternSeed={patternSeed} seed={seed}/>)}
  </div>;
}

function ButterflyLayer({seed,patternSeed,shapeSeed,index}:{seed:number;patternSeed:number;shapeSeed:number;index:number}) {
  const companion=index%2===1;
  const canvas=useRef<HTMLCanvasElement>(null);
  const flight=useRef({t:index*3.4,travel:0,heading:companion?-1.5:.55,bank:0,pitch:0,wingPhase:index*1.7,pace:[.32,.40,.29,.36][index],
    route:index===2?[[.13,.25,-30],[.2,.16,-22],[.83,.62,12],[.7,.87,26]]:index===3?[[.94,.83,11],[.85,.89,-18],[.3,.52,-41],[.18,.24,19]]:companion?[[.96,.23,18],[.91,.63,30],[.24,.82,-42],[.05,.68,-23]]:[[.04,.72,-42],[.08,.45,-48],[.76,.19,24],[.96,.31,34]]});
  useEffect(()=>{
    const node=canvas.current!,ctx=node.getContext("2d");
    if(!ctx)return;
    ctx.resetTransform();
    const silhouette=wingContour(shapeSeed,companion);
    const wing=new Path2D(silhouette);
    const contour=document.createElementNS("http://www.w3.org/2000/svg","path");
    contour.setAttribute("d",silhouette);
    const length=contour.getTotalLength(), count=Math.ceil(length/2);
    const rim=Array.from({length:count},(_,i)=>{
      const {x,y}=contour.getPointAtLength(i*length/count);
      return {x,y,lag:1.45*Math.min(1,Math.hypot(x,y)/118)+.65*(y+80)/140};
    });
    // Batch dots by pigment phase so each frame needs only a few fill calls.
    type Dot={x:number;y:number;radius:number;span:number;lag:number;drift:number;freedom:number};
    const pair=generator(seed);
    const base=(seed===0?195:pair()*360)+[0,180,90,270][index];
    const random=generator(seed^(companion?0x6271dac3:0x15f389bd)^(index>>1)*0x45d9f3b);
    const classic=index===0&&seed===0;
    const inks=classic?originalInks:Array.from({length:4+Math.floor(random()*4)},()=>
      pigment((base+(random()-.5)*116+360)%360,.68+random()*.31,.38+random()*.38));
    const frequency=.006+random()*.022, stripes=2+random()*6;
    const spotX=20+random()*50,spotY=-48+random()*70, twist=random()*5;
    const spacing=2.55+random()*.9;
    // Sample one bilateral ink field at construction; each dot keeps its marking in flight.
    const pattern=generator(patternSeed^(index>>1)*0x45d9f3b^(companion?0x31a5b7:0x7ab123));
    const spots=Array.from({length:2+Math.floor(pattern()*7)},()=>({
      x:pattern()*102,y:pattern()*140-80,rx:6+pattern()*25,ry:6+pattern()*32,
      strength:pattern()*.95+.2,
    }));
    const tilt=pattern()*Math.PI, pitchX=Math.cos(tilt),pitchY=Math.sin(tilt);
    const stripeWidth=9+pattern()*46, bend=pattern()*2, offset=pattern()*6;
    const bands=Array.from({length:64},(): Dot[]=>[]);
    for(let row=0;row<Math.ceil(148/(classic?2.5:spacing*.86));row++){
      const y=-80+row*(classic?2.5:spacing*.86);
      for(let col=0;col<42;col++){
        const x=(col+(row%2)*.5)*(classic?2.9:spacing);
        if(!ctx.isPointInPath(wing,x,y))continue;
        const distance=Math.hypot(x,y),angle=Math.atan2(y,x);
        const veins=Math.pow(.5+.5*Math.cos(angle*29+distance*.045),7);
        let phase=classic?distance*.007+.18*Math.sin(angle*3)+.12*veins+(y>6?.18:0)
          : Math.hypot(x-spotX,y-spotY)*frequency+.24*Math.sin(angle*stripes+twist+distance*.035)+.16*veins;
        if(patternSeed){
          const across=x*pitchX+y*pitchY,along=y*pitchX-x*pitchY;
          phase=.45*Math.sin(across/stripeWidth+bend*Math.sin(along/23+offset));
          for(const spot of spots){
            const r2=((x-spot.x)/spot.rx)**2+((y-spot.y)/spot.ry)**2;
            phase+=spot.strength*Math.exp(-r2)*Math.cos(3*r2);
          }
        }
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
    const route=flight.current.route;
    let {t,pace,travel,heading,bank,pitch,wingPhase}=flight.current;
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
      // Give each spline its own flight space. Stagger the horizontal divides
      // so the two pairs roam at different heights without influencing one another.
      const right=index%2===1, lower=index===0 || index===3;
      const splitX=width*.5,splitY=height*(right?.55:.45);
      const scale=Math.min(.34*unit,Math.min(splitX,height*.45)/480);
      const inset=scale*160+unit;
      const spanX=splitX-2*inset;
      const spanY=(lower?height-splitY:splitY)-2*inset;
      const glide=Math.min(1,Math.max(0,.55+.8*Math.sin(t*.85+.55*Math.sin(t*.41))));
      travel+=dt*(pace+.045*Math.sin(t*.51)-.035*glide);
      if(travel>=1){
        travel-=1;
        const previous=route[2],tip=route[3];
        const bearing=Math.atan2(tip[1]-previous[1],tip[0]-previous[0]);
        const turn=bearing+(Math.random()-.5)*Math.PI*1.45;
        const stride=.42+Math.random()*.46;
        // Reflect waypoints at the bounds so individual paths curve back into view.
        const reflect=(n:number)=>1-Math.abs(1-Math.abs(n));
        route.shift();
        route.push([reflect(tip[0]+stride*Math.cos(turn)),
          reflect(tip[1]+stride*Math.sin(turn)),-58+Math.random()*102]);
        pace=.25+Math.random()*.2;
      }
      const u=travel,v=1-u;
      const weights=[v**3,3*u**3-6*u*u+4,-3*u**3+3*u*u+3*u+1,u**3];
      const tangent=[-3*v*v,9*u*u-12*u,-9*u*u+6*u+3,3*u*u];
      const sum=(axis:number,coeff:number[])=>route.reduce((n,p,i)=>n+p[axis]*coeff[i]/6,0);
      const target=Math.atan2(sum(1,tangent)*spanY,sum(0,tangent)*spanX)+Math.PI/2;
      const turn=Math.atan2(Math.sin(target-heading),Math.cos(target-heading));
      heading+=turn*(1-Math.exp(-dt*7));
      bank+=(Math.max(-.45,Math.min(.45,turn))-bank)*(1-Math.exp(-dt*4));
      wingPhase+=dt*(7+.8*Math.sin(t*1.3))*(1-.8*glide);
      const cameraDistance=285, depth=cameraDistance-sum(2,weights);
      const perspective=cameraDistance/depth;
      const climb=Math.atan2(sum(2,tangent),Math.hypot(sum(0,tangent)*210,sum(1,tangent)*110));
      pitch+=(Math.max(-.95,Math.min(.95,climb))-pitch)*(1-Math.exp(-dt*5));
      const cp=Math.cos(pitch),sp=Math.sin(pitch),cb=Math.cos(bank),sb=Math.sin(bank);
      c.translate((right?splitX:0)+inset+sum(0,weights)*spanX,
        (lower?splitY:0)+inset+sum(1,weights)*spanY+unit*Math.sin(wingPhase));
      c.rotate(heading);
      c.scale(scale*perspective,scale*perspective);
      function project(span:number,fore:number,lag:number,side:number){
        const flap=(.47-.68*Math.cos(wingPhase-lag+side*.10))*(1-glide)+.18*glide;
        const lateral=side*span*Math.cos(flap),lift=span*Math.sin(flap);
        const rolledZ=lateral*sb+lift*cb;
        const projection=depth/(depth-.47*(rolledZ*cp-fore*sp));
        return {x:(lateral*cb-lift*sb)*projection,y:(fore*cp+rolledZ*sp)*projection,projection};
      }
      for(let i=0;i<bands.length;i++){
        const phase=(i/bands.length+t*.082)*inks.length;
        const n=Math.floor(phase),f=phase-n,a=inks[n%inks.length],b=inks[(n+1)%inks.length];
        c.fillStyle=`rgb(${a.map((v,j)=>Math.round(v+(b[j]-v)*f)).join(",")})`;
        c.beginPath();
        for(const dot of bands[i]){
          // A traveling bend carries neighboring dots together; a smaller
          // independent drift breaks up the rows without losing the silhouette.
          const flow=Math.sin(t*1.6+dot.y*.064+dot.x*.032);
          const dx=dot.freedom*dot.span*(2.9*flow+.95*Math.sin(t*2.1+dot.drift));
          const dy=dot.freedom*dot.span*(2.2*Math.cos(t*1.45+dot.x*.058)+.85*Math.cos(t*1.8+dot.drift));
          for(const side of [-1,1]){
            const {x,y,projection}=project(dot.x+dx,dot.y+dy,dot.lag,side);
            const radius=dot.radius*projection;
            c.moveTo(x+radius,y);c.arc(x,y,radius,0,Math.PI*2);
          }
        }
        c.fill();
      }
      c.strokeStyle=`rgba(${inks[0].map(channel=>Math.round(channel*.48)).join(",")},.78)`;
      c.lineWidth=1.35;
      c.lineJoin="round";
      c.beginPath();
      for(const side of [-1,1]){
        rim.forEach((point,i)=>{
          const {x,y}=project(point.x,point.y,point.lag,side);
          if(i===0)c.moveTo(x,y);else c.lineTo(x,y);
        });
        c.closePath();
      }
      c.stroke();
      c.scale(cb,cp);
      c.strokeStyle="#000";c.lineWidth=.8;c.beginPath();c.moveTo(-1,-9);c.quadraticCurveTo(-7,-24,-16,-30);
      c.moveTo(1,-9);c.quadraticCurveTo(8,-25,16,-30);c.stroke();
      c.fillStyle="#000";
      for(let j=0;j<8;j++){
        c.beginPath();c.ellipse(0,-9+j*3,2.4-j*.18,1.5,0,0,Math.PI*2);c.fill();
      }
      if(visible&&!document.hidden&&!reduce.matches)frame=requestAnimationFrame(paint);
    }
    function sync(){cancelAnimationFrame(frame);last=performance.now();if(visible&&!document.hidden)paint(last)}
    const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync()});
    observer.observe(node);reduce.addEventListener("change",sync);document.addEventListener("visibilitychange",sync);
    return ()=>{Object.assign(flight.current,{t,pace,travel,heading,bank,pitch,wingPhase});observer.disconnect();cancelAnimationFrame(frame);reduce.removeEventListener("change",sync);document.removeEventListener("visibilitychange",sync)};
  },[seed,patternSeed,shapeSeed,companion,index]);
  return <canvas ref={canvas} width={780} height={540} aria-hidden="true" style={{position:"absolute",inset:0,width:"100%",height:"100%"}}/>;
}
