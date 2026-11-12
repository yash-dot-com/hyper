"use client";

import { useEffect, useRef, useState } from "react";

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
    let raf=0,last=0,time=0,energy=0,bright=0,visible=true;
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
        for(let i=12;i<84;i++)band+=bins[i];
        band/=72*255;
      }
      energy+=(rms-energy)*(1-Math.exp(-dt*(rms>energy?18:5)));
      bright+=(band-bright)*(1-Math.exp(-dt*7));
      if(!reduce.matches)time+=dt*(.6+energy);
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
      wash.addColorStop(0,"#55afc9");wash.addColorStop(.37,"#69b6a6");wash.addColorStop(.61,"#dab28f");wash.addColorStop(1,"#55afc9");
      c.fillStyle=wash;c.fillRect(20,20,200,200);
      c.save();c.translate(120,120);c.rotate(-.5+Math.sin(t*.7)*.28);c.scale(1,.76);
      const offset=12*Math.sin(t)+e*12;
      const core=c.createRadialGradient(offset,17,3,offset,18,81);
      core.addColorStop(0,`rgb(253,${Math.round(70+bright*85)},67)`);core.addColorStop(.52,"#fc5356");core.addColorStop(.75,"#ff9267");core.addColorStop(1,"rgba(250,159,117,0)");
      c.fillStyle=core;c.fillRect(-122,-150,244,300);c.restore();
      c.save();c.filter="blur(9px)";c.strokeStyle="rgba(255,183,121,.64)";c.lineWidth=13;
      c.beginPath();c.moveTo(61,112);c.bezierCurveTo(68,157+offset,109,180,162,129-offset*.4);c.stroke();c.restore();
      c.strokeStyle="rgba(177,237,213,.46)";c.lineWidth=4;c.filter="blur(2px)";c.stroke(outline);c.restore();
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
