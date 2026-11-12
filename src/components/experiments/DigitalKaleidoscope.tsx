"use client";

import { Children, useEffect, useId, useRef, type ReactNode } from "react";

const root3=Math.sqrt(3);
function triangle(x:number,y:number,down:boolean) {
  const points=down?[[x+1,y],[x+1,y+1],[x,y+1]]:[[x,y],[x+1,y],[x,y+1]];
  // Give shared vertices the same local color index. Adjacent panes then
  // reflect the same image across their common edge.
  points.sort(([a,b],[c,d])=>(a+2*b)%3-(c+2*d)%3);
  const [a,b,c]=points.map(([u,v])=>[(u+v*.5)*52,v*26*root3]);
  return `matrix(${(b[0]-a[0])/100} ${(b[1]-a[1])/100} ${(c[0]-a[0])/100} ${(c[1]-a[1])/100} ${a[0]} ${a[1]})`;
}
const panes:string[]=[];
for(let y=0;y<3;y++)for(let x=0;x<3-y;x++){
  panes.push(triangle(x,y,false));
  if(x+y<2)panes.push(triangle(x,y,true));
}

export const scopePresets={
  Prism:{mirrors:6,speed:8,zoom:1,drift:1},
  Orbit:{mirrors:10,speed:-14,zoom:1.3,drift:1.5},
  Voltage:{mirrors:8,speed:22,zoom:.85,drift:2.3},
  Petal:{mirrors:12,speed:5,zoom:1.65,drift:.65},
};
type ScopeVariant=keyof typeof scopePresets;
// Alter the pieces before mirroring so every reflection inherits the same cut.
function Pattern({seed,children}:{seed:number;children:ReactNode}){
  if(!seed)return <>{children}</>;
  let state=seed>>>0;
  function sample(){
    state=(Math.imul(state,1664525)+1013904223)>>>0;
    return state/4294967296;
  }
  return <>{Children.map(children,piece=>{
    const x=(sample()-.5)*44,y=(sample()-.5)*44;
    const tilt=Math.round((sample()-.5)*124);
    const width=.68+sample()*.88,height=.68+sample()*.88;
    return <g transform={`translate(${x} ${y}) rotate(${tilt}) scale(${width} ${height})`}>{piece}</g>;
  })}</>;
}
export function DigitalKaleidoscope({variant="Prism",seed=0,mirrors=scopePresets[variant].mirrors,speed=scopePresets[variant].speed,
  zoom=scopePresets[variant].zoom,drift=scopePresets[variant].drift}:{
    variant?:ScopeVariant;seed?:number;mirrors?:number;speed?:number;zoom?:number;drift?:number;
  }={}){
  const count=Math.max(4,Math.min(16,Math.round(mirrors/2)*2)), wedge=2*Math.PI/count;
  const sectorMap=`matrix(1 0 ${(Math.cos(wedge)-.5)*2/root3} ${Math.sin(wedge)*2/root3} 0 0)`;
  const heading=useRef(0);
  const id=useId(), svg=useRef<SVGSVGElement>(null), glass=useRef<SVGGElement>(null);
  useEffect(()=>{
    const node=svg.current!, shards=glass.current!;
    const reduce=matchMedia("(prefers-reduced-motion: reduce)");
    let last=0,raf=0,visible=false,held:number|null=null,previous=0;
    function render(){
      const angle=heading.current,phase=angle*Math.PI/180;
      shards.setAttribute("transform",`translate(${32+9*drift*Math.sin(phase)} ${32+7*drift*Math.cos(phase)}) rotate(${angle}) scale(${zoom})`);
    }
    function draw(now:number){
      if(last && held===null)heading.current+=Math.min(.05,Math.max(0,(now-last)/1000))*speed;
      last=now;render();raf=requestAnimationFrame(draw);
    }
    function sync(){
      cancelAnimationFrame(raf);last=0;render();
      if(visible&&!document.hidden&&!reduce.matches&&speed!==0)raf=requestAnimationFrame(draw);
    }
    function down(e:PointerEvent){if(held!==null)return;held=e.pointerId;previous=e.clientX;node.setPointerCapture(held);}
    function move(e:PointerEvent){if(held!==e.pointerId)return;heading.current+=(e.clientX-previous)*220/node.getBoundingClientRect().width;previous=e.clientX;render();}
    function release(e:PointerEvent){if(held===e.pointerId)held=null;}
    function key(e:KeyboardEvent){if(e.key==="ArrowRight"||e.key==="ArrowLeft"){e.preventDefault();heading.current+=e.key==="ArrowRight"?12:-12;render();}}
    const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync()});observer.observe(node);
    node.addEventListener("pointerdown",down);node.addEventListener("pointermove",move);node.addEventListener("lostpointercapture",release);node.addEventListener("keydown",key);
    document.addEventListener("visibilitychange",sync);reduce.addEventListener("change",sync);sync();
    return ()=>{observer.disconnect();cancelAnimationFrame(raf);node.removeEventListener("pointerdown",down);node.removeEventListener("pointermove",move);node.removeEventListener("lostpointercapture",release);node.removeEventListener("keydown",key);document.removeEventListener("visibilitychange",sync);reduce.removeEventListener("change",sync)};
  },[speed,zoom,drift]);
  return <svg ref={svg} viewBox="-175 -175 350 350" role="img" tabIndex={0} aria-label="Digital kaleidoscope. Drag horizontally or use left and right arrow keys to turn the glass." style={{display:"block",width:"100%",height:"100%",touchAction:"pan-y",cursor:"grab"}}>
    <defs>
      <clipPath id={id+"clip"}><path d="M0 0H100L0 100Z"/></clipPath>
      <g id={id+"pane"} clipPath={`url(#${id}clip)`}>
        <path d="M0 0H100L0 100Z" fill={{Prism:"#f3e625",Orbit:"#14133e",Voltage:"#23102c",Petal:"#fbe6bd"}[variant]}/>
        <g ref={glass} transform="translate(32 39)">
          {variant==="Orbit"? <Pattern seed={seed}>
            {[14,29,49,76].map((r,i)=><circle key={r} cx="9" cy="-9" r={r} fill="none" stroke={["#ffbc60","#ff537b","#65f4e9","#7976ef"][i]} strokeWidth={i%2?7:3}/>)}
            <circle cx="-18" cy="5" r="8" fill="#f7dcca"/>
          </Pattern>:variant==="Voltage"? <Pattern seed={seed}>
            {[-50,-16,18,52].map((x,i)=><path key={x} transform={`translate(${x} 0)`} d="M-14 -90H5L-7 -18H10L-3 19H12L-18 91L-6 34H-24L-12 -6H-24Z" fill={["#f43292","#a3ff32","#04cbd7","#ff691f"][i]}/>)}
          </Pattern>:variant==="Petal"? <Pattern seed={seed}>
            {Array.from({length:7},(_,i)=><ellipse key={i} rx="10" ry="37" cy="-27" transform={`rotate(${i*360/7})`} fill={["#b02e62","#f46d5f","#458d79"][i%3]}/>)}
            <circle r="10" fill="#f6be37"/>
          </Pattern>:<Pattern seed={seed}>
          <path fill="#ed139f" d="M-110 -68L80 -30 70 -9 -90 -30ZM-35 0L-7 29 -26 89 -58 64Z"/>
          <path fill="#88bd29" d="M-87 2L-34 -38 -10 -20 -43 13ZM16 21L94 0 74 34 26 53Z"/>
          <path fill="#101334" d="M-57 -43L-25 -24 -40 -5ZM6 14L36 12 19 39Z"/>
          <path fill="#143892" d="M-24 -21L-3 -28 13 -10 4 12 -18 15 -32 -3Z"/>
          <path fill="#00bce4" d="M22 -20L47 -23 59 -4 43 16 21 12 14 -5Z"/>
          <path fill="#f82569" d="M-2 44L14 35 32 51 12 68Z"/>
          </Pattern>}
        </g>
      </g>
      <g id={id+"sector"}>{panes.map(transform=><g key={transform} transform={transform}><use href={"#"+id+"pane"}/><path d="M0 0H100L0 100Z" fill="none" stroke="#fffef9" strokeWidth="2.5" vectorEffect="non-scaling-stroke"/></g>)}</g>
    </defs>
    {Array.from({length:count},(_,i)=><use key={i} href={"#"+id+"sector"} transform={`rotate(${-90+(i+i%2)*360/count}) scale(1 ${i%2?-1:1}) ${sectorMap}`}/>)}
  </svg>;
}
