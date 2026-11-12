"use client";

import { useEffect, useRef, useState } from "react";

export function HalftoneVoiceBlob({ microphone=true, size=320 }: {microphone?:boolean;size?:number|string}) {
  const canvas=useRef<HTMLCanvasElement>(null);
  const [enabled,setEnabled]=useState(false),[status,setStatus]=useState("");
  const audio=useRef<AnalyserNode|null>(null);
  useEffect(()=>{
    if(!enabled || !microphone)return;
    let cancelled=false, stream:MediaStream|undefined, context:AudioContext|undefined;
    function release(){audio.current=null;stream?.getTracks().forEach(t=>t.stop());if(context && context.state!=="closed")void context.close().catch(()=>{});}
    async function start(){
      try{
        if(!navigator.mediaDevices?.getUserMedia)throw new Error("Microphone unavailable");
        context=new AudioContext();
        await context.resume();
        if(cancelled)return;
        stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true}});
        if(cancelled){stream.getTracks().forEach(t=>t.stop());return;}
        const analyser=context.createAnalyser();analyser.fftSize=1024;
        context.createMediaStreamSource(stream).connect(analyser);
        audio.current=analyser;
        stream.getAudioTracks()[0].onended=()=>{if(!cancelled){setEnabled(false);setStatus("Microphone disconnected.");}};
        setStatus("Listening");
      }catch{if(!cancelled){setStatus("Microphone unavailable. Check browser permissions and try again.");setEnabled(false);}}
    }
    void start();
    return ()=>{cancelled=true;release();};
  },[enabled,microphone]);

  useEffect(()=>{
    const node=canvas.current!,ctx=node.getContext("2d");if(!ctx)return;
    const reduce=matchMedia("(prefers-reduced-motion: reduce)");
    const samples = new Float32Array(1024);
    // Each plate has a different screen angle. Stable sites let new dots grow
    // from pinpoints during a syllable without randomly flickering on and off.
    const plates = [15, 72, 0, 43].map((degrees, k) => {
      const angle = degrees * Math.PI / 180;
      const sites = [];
      for (let row = -23; row <= 23; row++) {
        for (let col = -23; col <= 23; col++) {
          const x = 4.9 * (col*Math.cos(angle) - row*Math.sin(angle));
          const y = 4.9 * (col*Math.sin(angle) + row*Math.cos(angle));
          const distance = Math.hypot(x,y);
          if (distance > 104) continue;
          const hash = Math.sin(row*127.1 + col*311.7 + k)*43758.5453;
          sites.push({x,y,distance,angle:Math.atan2(y,x),threshold:hash-Math.floor(hash)});
        }
      }
      return sites;
    });
    const flares: {angle:number; start:number; reach:number; speed:number; travel:number; radius:number; hue:number}[]=[];
    let raf=0,last=0,time=0,energy=0,visible=true;
    let heardSpeech=false, quiet=0, cycle=3, gather=0, rotation=0;
    function draw(now:number) {
      raf=requestAnimationFrame(draw);
      if(now-last<(reduce.matches?100:33))return;
      const dt=Math.min((now-last)/1000,.1); last=now;
      let rms=0;
      if(audio.current){
        audio.current.getFloatTimeDomainData(samples);
        for(const sample of samples)rms+=sample*sample;
        rms=Math.min(1,Math.max(0,Math.sqrt(rms/samples.length)-.004)*9);
      }
      energy+=(rms-energy)*(1-Math.exp(-dt*(rms>energy?17:4)));
      if(!reduce.matches)time+=dt*(.35+energy);
      if(audio.current && energy>.085){
        heardSpeech=true; quiet=0; cycle=3;
      } else if(heardSpeech && energy<.045){
        quiet+=dt;
        if(quiet>.38){ cycle=0; heardSpeech=false; }
      }
      cycle=Math.min(3,cycle+dt);
      const gathering=cycle<2.05 && !reduce.matches && !!audio.current;
      gather=Math.max(0,Math.min(1,gather+(gathering?1.5:-1.35)*dt));
      const ring=gather*gather*(3-2*gather);
      if(gather===0)rotation=0;
      else rotation+=dt*3.6*ring;
      const c=ctx!;
      c.setTransform(node.width/240,0,0,node.height/240,0,0);
      c.globalCompositeOperation="source-over";
      c.fillStyle="#fffcf5"; c.fillRect(0,0,240,240);
      c.globalCompositeOperation="multiply";
      const density=.72+.28*Math.sqrt(energy);
      const roll=Math.sin(time*.8)*.14, cos=Math.cos(roll), sin=Math.sin(roll);
      plates.forEach((sites,k)=>{
        const spin=rotation*[.86,1.12,1,.93][k];
        const hue=[193,328,54,233][k]+energy*[33,31,-21,48][k];
        c.globalAlpha=k===3?.23:.91;
        c.fillStyle=`hsl(${hue} ${k===3?33:100}% ${k===3?13:49}%)`;
        const bearing=time*.5+k*Math.PI/2;
        const cx=29*Math.cos(bearing),cy=29*Math.sin(bearing);
        c.beginPath();
        for(const site of sites){
          const edge=74+energy*14+(4+energy*4)*Math.sin(3*site.angle+time)+4*Math.cos(2*site.angle-time*.67);
          const fade=Math.min(1,Math.max(0,(edge-site.distance)/20));
          const dx=site.x-cx,dy=site.y-cy;
          const blobInk=Math.exp(-(dx*dx+dy*dy)/2400);
          // Shift ink coverage around each complete screen as it rotates.
          const ringInk=.65+.19*Math.cos(2*site.angle+k)+.12*Math.sin(3*site.angle-k);
          const ink=blobInk+(ringInk-blobInk)*ring;
          const amount=fade*(.22+.80*ink+.18*energy)-site.threshold*.45;
          const emerge=Math.min(1,Math.max(0,(density-site.threshold)*10));
          if(!emerge)continue;
          if(amount<=.015)continue;
          const radius=Math.min(4.3,3.55*Math.sqrt(amount)*Math.min(1,amount*5)*emerge*(k===3?.68:1));
          const drift=site.threshold*2*Math.PI;
          let x=site.x*cos-site.y*sin+(1.6+energy*3)*Math.sin(time*1.7+drift);
          let y=site.x*sin+site.y*cos+(1.6+energy*3)*Math.cos(time*1.3+drift);
          if(ring>0){
            const start=Math.atan2(y,x);
            const angle=start+spin*ring+ring*(1-ring)*1.8;
            const r=Math.hypot(x,y)*(1-ring)+(50+site.distance*.42)*ring;
            x=Math.cos(angle)*r; y=Math.sin(angle)*r;
          }
          x+=120; y+=120;
          c.moveTo(x+radius,y);
          c.arc(x,y,radius,0,Math.PI*2);
        }
        c.fill();
      });
      if(reduce.matches)flares.length=0;
      else if(Math.random()<1-Math.exp(-dt*energy*12)){
        const direction=Math.random()*Math.PI*2;
        const count=1+Math.floor(energy*4);
        for(let i=0;i<count && flares.length<80;i++){
          const angle=direction+(Math.random()-.5)*.55;
          const start=61+energy*12+5*Math.sin(3*angle+time);
          flares.push({angle,start,reach:113-start,speed:22+Math.random()*28,travel:0,
            radius:1.6+Math.random()*2,hue:[193,328,54][Math.floor(Math.random()*3)]});
        }
      }
      for(let i=flares.length-1;i>=0;i--){
        const dot=flares[i];
        dot.travel+=dt*dot.speed;
        const remaining=1-dot.travel/dot.reach;
        if(remaining<=0){flares.splice(i,1);continue;}
        const distance=dot.start+dot.travel;
        c.globalAlpha=.85*remaining*remaining;
        c.fillStyle=`hsl(${dot.hue} 100% 49%)`;
        c.beginPath();
        c.arc(120+distance*Math.cos(dot.angle),120+distance*Math.sin(dot.angle),dot.radius*remaining,0,Math.PI*2);
        c.fill();
      }
      c.globalAlpha=1;
    }
    function sync(){cancelAnimationFrame(raf);if(visible&&!document.hidden){last=performance.now()-110;draw(performance.now());}}
    const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync();});observer.observe(node);
    document.addEventListener("visibilitychange",sync);sync();
    return ()=>{cancelAnimationFrame(raf);observer.disconnect();document.removeEventListener("visibilitychange",sync);};
  },[]);
  return <div style={{maxWidth:"100%",display:"grid",justifyItems:"center",alignContent:"center",gap:4}}>
    <canvas ref={canvas} width={480} height={480} role="img" aria-label="Voice-reactive halftone ink blob" style={{width:size,maxWidth:"100%",height:"auto"}}/>
    {microphone && <><button type="button" aria-pressed={enabled} onClick={()=>{setStatus(enabled?"":"Connecting…");setEnabled(!enabled);}}
      style={{background:"#222625",color:"#eff7f2",border:"1px solid #45524b",borderRadius:24,padding:"7px 15px"}}>{enabled?"Stop microphone":"Enable microphone"}</button>
      <span role="status" style={{minHeight:"1.5em",fontSize:12,color:"#474440",textAlign:"center"}}>{status}</span></>}
  </div>;
}
