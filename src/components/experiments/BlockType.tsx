"use client";

import {useEffect,useState,type CSSProperties} from "react";

type Cell = [number,number];
const shapes:Cell[][]=[
  [[0,0],[1,0],[2,0],[3,0]], [[0,0],[1,0],[0,1],[1,1]],
  [[0,0],[1,0],[2,0],[1,1]], [[0,0],[0,1],[0,2],[1,2]],
  [[1,0],[1,1],[1,2],[0,2]], [[1,0],[2,0],[0,1],[1,1]], [[0,0],[1,0],[1,1],[2,1]],
];
const rotations=shapes.flatMap(shape=>Array.from({length:4},(_,angle)=>{
  const cells=shape.map(([x,y])=>[[x,y],[-y,x],[-x,-y],[y,-x]][angle]);
  const first=cells.sort((a,b)=>b[1]-a[1]||a[0]-b[0])[0];
  return cells.map(([x,y])=>[x-first[0],y-first[1]] as Cell);
}));
const palette=["#ff309c","#21baff","#ffdf23","#69cf68","#ffa0cd","#e9f9ff"];
function assemble(word:string){
  const canvas=document.createElement("canvas");
  const ctx=canvas.getContext("2d",{willReadFrequently:true})!;
  const font="bold 26px Georgia, serif";
  ctx.font=font;
  canvas.width=Math.ceil(ctx.measureText(word).width)+6;canvas.height=36;
  ctx.font=font;ctx.fillText(word,3,27);
  const w=canvas.width,h=canvas.height, pixels=ctx.getImageData(0,0,w,h).data;
  const mask=Uint8Array.from({length:w*h},(_,i)=>Number(pixels[4*i+3]>85));
  let seed=Array.from(word).reduce((s,c)=>Math.imul(s,31)+c.charCodeAt(0)|0,17);
  const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
  const pieces=[];
  for(let y=h-1;y>=0;y--)for(let x=0;x<w;x++){
    if(!mask[y*w+x])continue;
    const offset=Math.floor(random()*rotations.length);
    let group:Cell[]=[[0,0]];
    for(let i=0;i<rotations.length;i++){
      const test=rotations[(offset+i)%rotations.length];
      if(test.every(([dx,dy])=>x+dx>=0&&x+dx<w&&y+dy>=0&&mask[(y+dy)*w+x+dx])){group=test;break;}
    }
    for(const [dx,dy] of group)mask[(y+dy)*w+x+dx]=0;
    const color=palette[Math.floor(random()*palette.length)];
    pieces.push({x,y,cells:group,path:group.map(([dx,dy])=>`M${dx+.05} ${dy+.05}h.9v.9h-.9Z`).join(""),
      color,land:y<11&&random()<.82?"#fff9ef":color,delay:(h-y)*.043+random()*.48,
      drift:(random()-.5)*24,turn:(Math.floor(random()*5)-2)*90});
  }
  return {w,pieces};
}

export function BlockType({text="Hype",replay=0}:{text?:string;replay?:number}) {
  const word=Array.from(text.trim()).slice(0,24).join("");
  const [model,setModel]=useState<ReturnType<typeof assemble>>();
  useEffect(()=>{setModel(assemble(word));},[word]);
  if(!model||!word)return null;
  const height=Math.max(54,model.w*.6);
  return <svg viewBox={`-4 0 ${model.w+8} ${height}`} role="img" aria-label={word} style={{display:"block",width:"92%",height:"100%",overflow:"hidden"}}>
    <style>{`@keyframes block-type-drop{0%{transform:translate(var(--dx),var(--dy)) rotate(var(--turn));fill:var(--fly)}72%{transform:translate(0,-5px) rotate(0);fill:var(--fly)}91%{transform:translate(0,0)}96%{transform:translate(0,-.45px)}100%{transform:none;fill:var(--land)}}@media(prefers-reduced-motion:reduce){.block-type-piece{animation:none!important}}`}</style>
    <g key={word+":"+replay}>{model.pieces.map((p,i)=><g key={i} transform={`translate(${p.x} ${p.y+height/2-17})`}>
      <path className="block-type-piece" fill={p.land} d={p.path} style={{"--dx":p.drift+"px","--dy":-(height+12)+"px","--turn":p.turn+"deg","--fly":p.color,"--land":p.land,
        transformBox:"fill-box",transformOrigin:"center",animation:`block-type-drop .94s cubic-bezier(.45,.04,.72,1) ${p.delay}s both`} as CSSProperties}/>
    </g>)}</g>
  </svg>;
}

// The lettering lies on an isometric base plane. Each unit tile is one cube;
// a piece drops as a rigid group before all its cubes meet that plane.
export function IsoBlockType({text="Hype",replay=0}:{text?:string;replay?:number}) {
  const word=Array.from(text.trim()).slice(0,24).join("");
  const [model,setModel]=useState<ReturnType<typeof assemble>>();
  useEffect(()=>{setModel(assemble(word));},[word]);
  if(!model||!word)return null;
  const u=Math.sqrt(3)/2;
  const width=(model.w+36)*u+6, height=(model.w+36)/2+12;
  const ordered=model.pieces.slice().sort((a,b)=>a.x+a.y-b.x-b.y);
  return <svg viewBox={`${-36*u-3} -5 ${width} ${height}`} role="img" aria-label={word}
    style={{display:"block",width:"96%",height:"100%",overflow:"hidden"}}>
    <style>{`@keyframes iso-block-drop{0%{opacity:0;transform:translate(var(--sway),var(--fall)) rotate(var(--spin))}8%{opacity:1}76%{transform:translateY(-3px)}90%{transform:none}96%{transform:translateY(-.55px)}100%{transform:none}}@media(prefers-reduced-motion:reduce){.iso-block-piece{animation:none!important}}`}</style>
    <g key={word+":"+replay}>{ordered.map((piece,i)=><g key={i} transform={`translate(${(piece.x-piece.y)*u} ${(piece.x+piece.y)/2})`}>
      <g className="iso-block-piece" style={{"--sway":piece.drift*.4+"px","--fall":-(height+8)+"px","--spin":piece.turn/2+"deg",transformBox:"fill-box",transformOrigin:"center",animation:`iso-block-drop 1.12s cubic-bezier(.42,.05,.8,1) ${piece.delay}s both`} as CSSProperties}>
        {piece.cells.slice().sort(([x,y],[a,b])=>x+y-a-b).map(([x,y])=><g key={x+","+y} transform={`translate(${(x-y)*u} ${(x+y)/2})`} fill={piece.land}>
          <path d={`M-${u} .5 0 1v.96l-${u}-.5Z`}/><path fill="#13253b" opacity=".27" d={`M-${u} .5 0 1v.96l-${u}-.5Z`}/>
          <path d={`M0 1 ${u} .5v.96l-${u} .5Z`}/><path fill="#14182b" opacity=".48" d={`M0 1 ${u} .5v.96l-${u} .5Z`}/>
          <path d={`M0 0 ${u} .5 0 1 -${u} .5Z`} stroke="#fff" strokeOpacity=".25" strokeWidth=".035"/>
        </g>)}
      </g>
    </g>)}</g>
  </svg>;
}
