"use client";

import { useId, type PointerEvent } from "react";

const silhouettes = {
  spark: "M60 9 L64 43 103 27 78 57 100 83 69 75 57 109 49 75 13 88 37 59 14 42 48 44Z",
  vase: "M32 15 L84 12 76 34 Q101 38 99 59 Q97 79 79 103 L43 107 Q17 82 18 63 Q16 43 41 37Z",
  cube: "M13 34 L63 11 106 31 102 84 55 108 12 82Z",
  disc: "M104 60 A44 44 0 1 1 16 60 A44 44 0 1 1 104 60Z",
  bow: "M14 27 L101 18 Q98 43 69 57 Q96 65 105 89 L17 103 Q21 76 47 62 Q23 54 14 27Z",
  arrow: "M22 15 L105 64 65 71 32 105Z",
};
export type StickerShape = keyof typeof silhouettes;

// One compound path per screen keeps each sticker light in the DOM.
function screen(shape: StickerShape) {
  const dots=[];
  for(let row=0;row<46;row++) for(let col=0;col<46;col++){
    const x=col*3+(row%2)*1.5-8, y=row*2.65-4;
    let tone=.48+.43*Math.sin((x*.56+y)/25);
    if(shape==="disc") tone=Math.min(1,Math.hypot(x-39,y-30)/86);
    if(shape==="cube") tone=y<(x<62?34+(x-13)*.39:53-(x-62)*.5)?0:x<59?.53:.98;
    if(tone<=0)continue;
    const grain=Math.sin(col*79.3+row*41.7);
    const r=(.22+tone*1.48+grain*.14).toFixed(2);
    dots.push(`M${x.toFixed(1)} ${y.toFixed(1)}m-${r} 0a${r} ${r} 0 1 0 ${2*Number(r)} 0a${r} ${r} 0 1 0 -${2*Number(r)} 0z`);
  }
  return dots.join("");
}
const screens = new Map<StickerShape,string>();

export function HalftoneSticker({shape="spark",base="#ffce00",ink="#201b23"}:{
  shape?:StickerShape; base?:string; ink?:string;
}) {
  const id=useId();
  if(!screens.has(shape))screens.set(shape,screen(shape));
  function follow(event:PointerEvent<SVGSVGElement>){
    const svg=event.currentTarget, rect=svg.getBoundingClientRect();
    svg.style.setProperty("--ink-x",((event.clientX-rect.left)/rect.width*12-6)+"px");
    svg.style.setProperty("--ink-y",((event.clientY-rect.top)/rect.height*12-6)+"px");
  }
  function reset(event:PointerEvent<SVGSVGElement>){
    event.currentTarget.style.removeProperty("--ink-x");
    event.currentTarget.style.removeProperty("--ink-y");
  }
  return <svg viewBox="0 0 120 120" role="img" aria-label={shape+" halftone sticker"} style={{width:"100%",display:"block"}}
    onPointerEnter={follow} onPointerMove={follow} onPointerLeave={reset} onPointerCancel={reset} onPointerUp={e=>{if(e.pointerType==="touch")reset(e)}}>
    <defs><clipPath id={id}><path d={silhouettes[shape]}/></clipPath></defs>
    <path fill={base} d={silhouettes[shape]}/>
    <g className="sticker-ink"><g clipPath={`url(#${id})`}><path fill={ink} d={screens.get(shape)}/></g></g>
    <style>{`.sticker-ink{pointer-events:none;transform:translate(var(--ink-x,1.8px),var(--ink-y,2px));transition:transform 140ms ease-out}
      @media(prefers-reduced-motion:reduce){.sticker-ink{transform:translate(1.8px,2px);transition:none}}`}</style>
  </svg>;
}
