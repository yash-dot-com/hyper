"use client";

import { Popover } from "@base-ui/react/popover";
import { useState } from "react";

type Tone={h:number;s:number;l:number};
function readTone(hex:string):Tone{
  const [r,g,b]=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255);
  const max=Math.max(r,g,b),min=Math.min(r,g,b),d=max-min,l=(max+min)/2;
  const hue=d===0?0:max===r?(g-b)/d:max===g?(b-r)/d+2:(r-g)/d+4;
  return {h:(60*hue+360)%360,s:d===0?0:d/(1-Math.abs(2*l-1))*100,l:l*100};
}
function hexOf({h,s,l}:Tone){
  const light=l/100;
  return "#"+[0,8,4].map(offset=>{
    const k=(offset+h/30)%12;
    const channel=light-(s/100)*Math.min(light,1-light)*Math.max(-1,Math.min(k-3,9-k,1));
    return Math.round(channel*255).toString(16).padStart(2,"0");
  }).join("");
}
function ToneEditor({label,value,onChange}:{label:string;value:string;onChange:(hex:string)=>void}){
  const [tone,setTone]=useState(()=>readTone(value));
  const [draft,setDraft]=useState(value);
  function apply(next:Tone){
    const hex=hexOf(next);setTone(next);setDraft(hex);onChange(hex);
  }
  const clamp=(v:number)=>Math.min(100,Math.max(0,v));
  function pick(target:HTMLElement,x:number,y:number){
    const rect=target.getBoundingClientRect();
    apply({...tone,s:clamp(100*(x-rect.left)/rect.width),l:clamp(100*(1-(y-rect.top)/rect.height))});
  }
  return <>
    <Popover.Title className="ink-picker-title">{label}</Popover.Title>
    <div className="shade-plane" role="group" tabIndex={0} aria-label="Shade. Left and right adjust saturation; up and down adjust lightness."
      style={{background:`linear-gradient(to bottom,#fff,transparent 50%,#000),linear-gradient(to right,#808080,hsl(${tone.h} 100% 50%))`}}
      onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);pick(e.currentTarget,e.clientX,e.clientY)}}
      onPointerMove={e=>{if(e.currentTarget.hasPointerCapture(e.pointerId))pick(e.currentTarget,e.clientX,e.clientY)}}
      onKeyDown={e=>{
        if(!["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.key))return;
        e.preventDefault();apply({...tone,s:clamp(tone.s+(e.key==="ArrowRight"?2:e.key==="ArrowLeft"?-2:0)),l:clamp(tone.l+(e.key==="ArrowUp"?2:e.key==="ArrowDown"?-2:0))});
      }}>
      <i style={{left:tone.s+"%",top:(100-tone.l)+"%",background:value}}/>
    </div>
    <input className="hue-track" aria-label="Hue" type="range" min="0" max="360" value={Math.round(tone.h)} onChange={e=>apply({...tone,h:e.target.valueAsNumber})}/>
    <label className="ink-hex">Hex<input value={draft} maxLength={7} spellCheck={false} onBlur={()=>setDraft(value)} onChange={e=>{
      const raw=e.target.value;setDraft(raw);
      if(/^#?[0-9a-f]{6}$/i.test(raw)){const hex="#"+raw.replace("#","").toLowerCase();setTone(readTone(hex));onChange(hex)}
    }}/></label>
  </>;
}
export function DirectoryColor({label,value,onChange,compact=false}:{label:string;value:string;onChange:(hex:string)=>void;compact?:boolean}){
  return <Popover.Root>
    <span className={compact?"ink-control compact":"ink-control"}>
      {!compact&&<span>{label}</span>}
      <Popover.Trigger className="ink-swatch" aria-label={label+" color"} title={label+" · "+value}>
        <i style={{backgroundColor:value}}/>
      </Popover.Trigger>
    </span>
    <Popover.Portal><Popover.Positioner sideOffset={7} align="start" className="directory-select-position">
      <Popover.Popup className="ink-picker"><ToneEditor label={label} value={value} onChange={onChange}/></Popover.Popup>
    </Popover.Positioner></Popover.Portal>
  </Popover.Root>;
}
