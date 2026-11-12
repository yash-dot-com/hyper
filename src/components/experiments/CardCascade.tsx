"use client";

import { useEffect,useRef } from "react";

const width=560,height=310,cw=54,ch=74;
function sprite(index:number) {
  const canvas=document.createElement("canvas");
  canvas.width=cw*2;canvas.height=ch*2;
  const ctx=canvas.getContext("2d")!;
  ctx.scale(2,2);
  ctx.fillStyle="#fffefa";ctx.strokeStyle="#171615";
  ctx.beginPath();ctx.roundRect(.5,.5,cw-1,ch-1,3);ctx.fill();ctx.stroke();
  const suit=["♥","♠","♦","♣"][index%4], rank=[10,9,8,7][index%4];
  ctx.fillStyle=index%2?"#171615":"#db172a";
  ctx.textAlign="center";ctx.textBaseline="middle";
  for(let corner=0;corner<2;corner++){
    ctx.save();if(corner){ctx.translate(cw,ch);ctx.rotate(Math.PI);}
    ctx.font="bold 9px monospace";ctx.fillText(String(rank),8,8);
    ctx.font="10px Georgia,serif";ctx.fillText(suit,8,17);ctx.restore();
  }
  ctx.font="12px Georgia,serif";
  const rows=rank===7?3:4;
  for(let j=0;j<rows;j++)for(const x of [18,36])ctx.fillText(suit,x,15+j*(43/(rows-1)));
  if(rank%2 || rank===10)ctx.fillText(suit,27,rank===10?28:36);
  if(rank===10)ctx.fillText(suit,27,48);
  return canvas;
}

export function CardCascade({replay=0,paused=false}:{replay?:number;paused?:boolean}) {
  const ref=useRef<HTMLCanvasElement>(null), pause=useRef(paused);
  useEffect(()=>{pause.current=paused;},[paused]);
  useEffect(()=>{
    const node=ref.current,ctx=node?.getContext("2d");if(!node||!ctx)return;
    const dpr=Math.min(window.devicePixelRatio||1,2);
    node.width=width*dpr;node.height=height*dpr;ctx.scale(dpr,dpr);
    const cards=Array.from({length:4},(_,i)=>sprite(i));
    let x=2,y=4,vx=3.2,vy=.2,tick=0,card=0,id=0,last=0,visible=true;
    function stamp(){ctx!.drawImage(cards[card],Math.round(x),Math.round(y),cw,ch);}
    function advance(){
      x+=vx;y+=vy;vy+=.32;
      if(y>=height-ch){y=height-ch;vy=-Math.max(6,Math.abs(vy)*.81);}
      if(++tick%2===0)stamp();
      if(x>width || x < -cw){
        card=(card+1)%4;vx=(vx>0?-1:1)*(2.6+Math.random()*1.6);
        x=vx>0?-cw+2:width-2;y=Math.random()*60;vy=-1-Math.random()*2;
      }
    }
    const mq=matchMedia("(prefers-reduced-motion: reduce)");
    function frame(now:number){
      if(!pause.current && now-last>=1000/60-1){const steps=Math.min(4,Math.max(1,Math.round((now-last)/16.67)));for(let i=0;i<steps;i++)advance();last=now;}
      if(pause.current)last=now;
      id=requestAnimationFrame(frame);
    }
    function sync(){
      cancelAnimationFrame(id);last=performance.now();
      if(!visible||document.hidden)return;
      if(!mq.matches)id=requestAnimationFrame(frame);
    }
    function preference(){if(mq.matches){for(let i=0;i<180;i++)advance();}sync();}
    ctx.fillStyle="#0d624c";ctx.fillRect(0,0,width,height);stamp();preference();
    const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync();});observer.observe(node);
    mq.addEventListener("change",preference);document.addEventListener("visibilitychange",sync);
    return ()=>{observer.disconnect();cancelAnimationFrame(id);mq.removeEventListener("change",preference);document.removeEventListener("visibilitychange",sync);};
  },[replay]);
  return <canvas ref={ref} role="img" aria-label="Solitaire cards bouncing across green felt, leaving layered trails" style={{display:"block",width:"100%",height:"auto",aspectRatio:"560/310"}}/>;
}
