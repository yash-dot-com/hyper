"use client";

import { useId, useRef, type ComponentPropsWithoutRef, type PointerEvent } from "react";

export function InkFusion({ children, ink = "#1c1918", style, className = "", ...props }:
  ComponentPropsWithoutRef<"div"> & { ink?: string }) {
  const filter = useId();
  const svg = useRef<SVGSVGElement>(null);
  function track(event: PointerEvent<HTMLDivElement>) {
    const matrix = svg.current?.getScreenCTM();
    if (!matrix || !svg.current) return;
    const point = new DOMPoint(event.clientX,event.clientY).matrixTransform(matrix.inverse());
    for (const dot of svg.current.querySelectorAll("circle")) {
      const dx = point.x-dot.cx.baseVal.value, dy = point.y-dot.cy.baseVal.value;
      const falloff = Math.max(0,1-Math.hypot(dx,dy)/48);
      const pull = falloff*falloff*(3-2*falloff);
      dot.style.transform = `translate(${dx*.28*pull}px,${dy*.28*pull}px) scale(${1+1.65*pull})`;
    }
  }
  function reset() {
    svg.current?.querySelectorAll("circle").forEach(dot=>dot.style.removeProperty("transform"));
  }
  return <div {...props}
    onPointerEnter={e=>{track(e);props.onPointerEnter?.(e)}}
    onPointerMove={e=>{track(e);props.onPointerMove?.(e)}}
    onPointerLeave={e=>{reset();props.onPointerLeave?.(e)}}
    onPointerCancel={e=>{reset();props.onPointerCancel?.(e)}}
    onPointerUp={e=>{if(e.pointerType==="touch")reset();props.onPointerUp?.(e)}} className={`ink-fusion ${className}`} style={{position:"relative",isolation:"isolate",...style}}>
    <svg ref={svg} className="ink-fusion-field" aria-hidden="true" focusable="false" viewBox="0 0 160 150" preserveAspectRatio="xMidYMid slice"
      style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none",borderRadius:"inherit",zIndex:-1}}>
      <defs><filter id={filter} x="-15%" y="-15%" width="130%" height="130%" colorInterpolationFilters="sRGB">
        <feGaussianBlur stdDeviation="2.3"/>
        <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -8"/>
      </filter></defs>
      <g fill={ink} filter={`url(#${filter})`}>
        {Array.from({length:49},(_,i)=>{
          const x=i%7, y=Math.floor(i/7);
          return <circle key={i} cx={13+x*21+(y%2)*9} cy={12+y*21} r={4+(x*3+y*5)%3}/>;
        })}
      </g>
    </svg>
    {children}
    <style>{`
      .ink-fusion > .ink-fusion-field circle {transform-box:fill-box;transform-origin:center;transition:transform 110ms ease-out}
      .ink-fusion:focus-visible > .ink-fusion-field circle:nth-child(3n) {transform:scale(2)}
      @media(prefers-reduced-motion:reduce){.ink-fusion > .ink-fusion-field circle {transition:none!important}}
    `}</style>
  </div>;
}
