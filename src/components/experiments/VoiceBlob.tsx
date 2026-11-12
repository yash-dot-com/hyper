"use client";

import { useEffect, useRef, useState } from "react";

// Each row pairs an outer rim and wash with a contrasting core and ribbon.
const pigments = [
  [0x55afc9,0x69b6a6,0xfc5356,0xff9267],
  [0xffa68b,0xf75877,0xff8b08,0xffcc34],
  [0xf4dc36,0xffb126,0xf42e71,0xff799b],
  [0xf5a6ac,0xed658c,0xc62e8b,0x8d6ab6],
  [0xec8dba,0x9875bd,0x327fbb,0x49b5c4],
  [0x80cbb3,0x4aa8a5,0x155a73,0x399caf],
  [0x61aa74,0x92c24b,0xf37330,0xf5c829],
  [0x6ab6af,0xc9d58b,0xe93975,0xff7da4],
];
function pigment(phase:number, layer:number, alpha=1) {
  const n=Math.floor(phase), f=phase-n, mix=f*f*(3-2*f);
  const a=pigments[n%pigments.length][layer], b=pigments[(n+1)%pigments.length][layer];
  const rgb=[16,8,0].map(shift=>{const from=(a>>shift)&255;return Math.round(from+(((b>>shift)&255)-from)*mix);});
  return `rgba(${rgb.join(",")},${alpha})`;
}

export function VoiceBlob({ microphone=true, size=320 }: {microphone?:boolean;size?:number|string}) {
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
    const samples=new Float32Array(1024),bins=new Uint8Array(512);
    let raf=0,last=0,time=0,energy=0,phase=0,bright=0,visible=true;
    function draw(now:number){
      raf=requestAnimationFrame(draw);
      if(now-last<(reduce.matches?100:32))return;
      const dt=Math.min((now-last)/1000,.08);last=now;
      let rms=0,band=0;
      if(audio.current){
        audio.current.getFloatTimeDomainData(samples);
        for(const v of samples)rms+=v*v;
        rms=Math.min(1,Math.max(0,Math.sqrt(rms/samples.length)-.006)*8);
        audio.current.getByteFrequencyData(bins);
        let power=0;
        const hzPerBin=audio.current.context.sampleRate/audio.current.fftSize;
        for(let i=1;i<bins.length && i*hzPerBin<5000;i++){
          const magnitude=bins[i]**2;
          power+=magnitude; band+=magnitude*i*hzPerBin;
        }
        band=power?Math.min(1,band/power/2300):0;
      }
      energy+=(rms-energy)*(1-Math.exp(-dt*(rms>energy?18:5)));
      bright+=(band-bright)*(1-Math.exp(-dt*7));
      if(!reduce.matches)time+=dt*(.6+energy);
      phase=(phase+dt*(.22+energy*(.9+bright*1.4))*(reduce.matches?.25:1))%pigments.length;
      const rimPhase=phase+energy*.38, corePhase=phase+bright*energy*1.6;
      const c=ctx!, t=time, e=reduce.matches?0:energy;
      c.setTransform(node.width/240,0,0,node.height/240,0,0);c.clearRect(0,0,240,240);
      const outline=new Path2D();
      for(let i=0;i<=180;i++){
        const a=i*Math.PI/90;
        const r=78+e*11+(4+e*6)*Math.sin(3*a+t)+3*Math.cos(2*a-t*.7)+e*5*Math.cos(5*a+t*2);
        const x=120+r*Math.cos(a),y=120+r*Math.sin(a);
        if(i)outline.lineTo(x,y);else outline.moveTo(x,y);
      }
      outline.closePath();c.save();c.clip(outline);
      const wash=c.createLinearGradient(62,50,166,192);
      wash.addColorStop(0,pigment(rimPhase,0));wash.addColorStop(.37,pigment(phase,1));wash.addColorStop(.68,pigment(corePhase,3));wash.addColorStop(1,pigment(rimPhase,0));
      c.fillStyle=wash;c.fillRect(20,20,200,200);
      const offset=12*Math.sin(t)+e*12;
      c.save();
      c.translate(120+9*Math.sin(t*.61),125+6*Math.sin(t*.83));
      c.rotate(-.35+.28*Math.sin(t*.7));
      // Independent harmonics change the pigment's silhouette, not just its position.
      const pool=new Path2D(), voiceTone=reduce.matches?0:bright*e;
      for(let i=0;i<=96;i++){
        const a=i*Math.PI/48;
        const radius=44+(10+7*e)*Math.cos(2*a+t*.97)
          +(8+5*voiceTone)*Math.sin(3*a-t*1.21+voiceTone*2)
          +4*Math.cos(4*a+t*.56);
        const x=radius*Math.cos(a)*1.13;
        const y=radius*Math.sin(a)*.91+8*Math.sin(x/29+t*.81);
        if(i)pool.lineTo(x,y);else pool.moveTo(x,y);
      }
      pool.closePath();
      const core=c.createLinearGradient(-49,-29,42,39);
      core.addColorStop(0,pigment(corePhase,3));core.addColorStop(.39,pigment(corePhase,2));
      core.addColorStop(.73,pigment(corePhase+.22,2));core.addColorStop(1,pigment(corePhase,3));
      c.filter="blur(6px)";c.fillStyle=core;c.fill(pool);c.restore();
      c.save();c.filter="blur(9px)";c.strokeStyle=pigment(corePhase,3,.7);c.lineWidth=13;
      c.beginPath();c.moveTo(61,112);c.bezierCurveTo(68,157+offset,109,180,162,129-offset*.4);c.stroke();c.restore();
      c.strokeStyle=pigment(rimPhase,1,.6);c.lineWidth=4;c.filter="blur(2px)";c.stroke(outline);c.restore();
    }
    function sync(){cancelAnimationFrame(raf);if(visible&&!document.hidden){last=performance.now()-110;draw(performance.now());}}
    const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync();});observer.observe(node);
    document.addEventListener("visibilitychange",sync);sync();
    return ()=>{cancelAnimationFrame(raf);observer.disconnect();document.removeEventListener("visibilitychange",sync);};
  },[]);
  return <div style={{maxWidth:"100%",display:"grid",justifyItems:"center",alignContent:"center",gap:4}}>
    <canvas ref={canvas} width={480} height={480} role="img" aria-label="Voice-reactive pigment blob" style={{width:size,maxWidth:"100%",height:"auto"}}/>
    {microphone && <><button type="button" aria-pressed={enabled} onClick={()=>{setStatus(enabled?"":"Connecting…");setEnabled(!enabled);}}
      style={{background:"#222625",color:"#eff7f2",border:"1px solid #45524b",borderRadius:24,padding:"7px 15px"}}>{enabled?"Stop microphone":"Enable microphone"}</button>
      <span role="status" style={{minHeight:"1.5em",fontSize:12,color:"#bfcdc6",textAlign:"center"}}>{status}</span></>}
  </div>;
}
