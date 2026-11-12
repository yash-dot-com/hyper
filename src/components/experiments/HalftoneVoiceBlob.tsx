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
    let raf=0,last=0,time=0,energy=0,visible=true;
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
      const c=ctx!;
      c.setTransform(node.width/240,0,0,node.height/240,0,0);
      c.globalCompositeOperation="source-over";
      c.fillStyle="#fffcf5"; c.fillRect(0,0,240,240);
      c.globalCompositeOperation="multiply";
      plates.forEach((sites,k)=>{
        const hue=[193,328,54,233][k]+energy*[33,31,-21,48][k];
        c.fillStyle=`hsl(${hue} ${k===3?33:100}% ${k===3?13:49}%)`;
        const bearing=time*.5+k*Math.PI/2;
        const cx=29*Math.cos(bearing),cy=29*Math.sin(bearing);
        c.beginPath();
        for(const site of sites){
          const edge=74+energy*14+(4+energy*4)*Math.sin(3*site.angle+time)+4*Math.cos(2*site.angle-time*.67);
          const fade=Math.min(1,Math.max(0,(edge-site.distance)/20));
          const dx=site.x-cx,dy=site.y-cy;
          const ink=Math.exp(-(dx*dx+dy*dy)/2400);
          const amount=fade*(.13+.67*ink+.55*energy)-site.threshold*.56;
          if(amount<=.015)continue;
          const radius=Math.min(4.3,4.6*Math.sqrt(amount)*Math.min(1,amount*5));
          c.moveTo(120+site.x+radius,120+site.y);
          c.arc(120+site.x,120+site.y,radius,0,Math.PI*2);
        }
        c.fill();
      });
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
