"use client";

import { useEffect, useState, useId, useRef, type ComponentPropsWithoutRef, type PointerEvent } from "react";

export function InkFusion({ children, ink = "#1c1918", style, className = "", ...props }:
  ComponentPropsWithoutRef<"div"> & { ink?: string }) {
  const filter = useId();
  const svg = useRef<SVGSVGElement>(null);
  const previous=useRef<DOMPoint|null>(null);
  const trailTimer=useRef<number|undefined>(undefined);
  const [grid,setGrid]=useState({width:160,height:150});
  useEffect(()=>{
    const node=svg.current!;
    const observer=new ResizeObserver(([entry])=>{
      const {width,height}=entry.contentRect;
      if(width && height)setGrid({width,height});
    });
    observer.observe(node);
    return ()=>{observer.disconnect();window.clearTimeout(trailTimer.current);};
  },[]);
  const columns=Math.ceil(grid.width/21)+1, rows=Math.ceil(grid.height/21)+1;
  function track(event: PointerEvent<HTMLDivElement>) {
    const matrix = svg.current?.getScreenCTM();
    if (!matrix || !svg.current) return;
    const point = new DOMPoint(event.clientX,event.clientY).matrixTransform(matrix.inverse());
    const start=previous.current ?? point;
    previous.current=point;
    const vx=point.x-start.x, vy=point.y-start.y;
    const lengthSquared=vx*vx+vy*vy;
    const swept: SVGCircleElement[]=[];
    window.clearTimeout(trailTimer.current);
    for (const dot of svg.current.querySelectorAll("circle")) {
      const x=dot.cx.baseVal.value, y=dot.cy.baseVal.value;
      let dx=point.x-x, dy=point.y-y;
      if(Math.hypot(dx,dy)>42 && lengthSquared>0){
        // Hit-test the stroke between events, including on low-rate pointers.
        const along=Math.max(0,Math.min(1,((x-start.x)*vx+(y-start.y)*vy)/lengthSquared));
        dx=start.x+along*vx-x; dy=start.y+along*vy-y;
        if(Math.hypot(dx,dy)<52)swept.push(dot);
      }
      const falloff=Math.max(0,1-Math.hypot(dx,dy)/52);
      if(!falloff){dot.style.removeProperty("transform");continue;}
      const pull=falloff*falloff*(3-2*falloff);
      dot.style.transform=`translate(${dx*.34*pull}px,${dy*.34*pull}px) scale(${1+1.9*pull})`;
    }
    if(swept.length)trailTimer.current=window.setTimeout(()=>{
      swept.forEach(dot=>dot.style.removeProperty("transform"));
    },55);
  }
  function reset() {
    previous.current=null;
    window.clearTimeout(trailTimer.current);
    svg.current?.querySelectorAll("circle").forEach(dot=>dot.style.removeProperty("transform"));
  }
  return <div {...props}
    onPointerEnter={e=>{track(e);props.onPointerEnter?.(e)}}
    onPointerMove={e=>{track(e);props.onPointerMove?.(e)}}
    onPointerLeave={e=>{reset();props.onPointerLeave?.(e)}}
    onPointerCancel={e=>{reset();props.onPointerCancel?.(e)}}
    onPointerUp={e=>{if(e.pointerType==="touch")reset();props.onPointerUp?.(e)}} className={`ink-fusion ${className}`} style={{position:"relative",isolation:"isolate",...style}}>
    <svg ref={svg} className="ink-fusion-field" aria-hidden="true" focusable="false" viewBox={`0 0 ${grid.width} ${grid.height}`} preserveAspectRatio="xMidYMid slice"
      style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none",borderRadius:"inherit",zIndex:-1}}>
      <defs><filter id={filter} x="-15%" y="-15%" width="130%" height="130%" colorInterpolationFilters="sRGB">
        <feGaussianBlur stdDeviation="2.3"/>
        <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -8"/>
      </filter></defs>
      <g fill={ink} filter={`url(#${filter})`}>
        {Array.from({length:columns*rows},(_,i)=>{
          const x=i%columns, y=Math.floor(i/columns);
          return <circle key={i} cx={x*21+(y%2)*9} cy={y*21} r={4+(x*3+y*5)%3}/>;
        })}
      </g>
    </svg>
    {children}
    <style>{`
      .ink-fusion > .ink-fusion-field circle {transform-box:fill-box;transform-origin:center;transition:transform 125ms ease-out}
      .ink-fusion > .ink-fusion-field circle[style*="transform:"] {transition-duration:12ms}
      .ink-fusion:focus-visible > .ink-fusion-field circle:nth-child(3n) {transform:scale(2)}
      @media(prefers-reduced-motion:reduce){.ink-fusion > .ink-fusion-field circle {transition:none!important}}
    `}</style>
  </div>;
}
