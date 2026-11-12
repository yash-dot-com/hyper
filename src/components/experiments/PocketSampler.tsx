import { useId } from "react";

export type Projection = "isometric" | "dimetric";
export function PocketSampler({ projection = "isometric", size = 240 }: { projection?: Projection; size?: number | string }) {
  const id = useId();
  // A camera on the horizontal diagonal gives equal X/Y foreshortening.
  // At elevation asin(1/sqrt(3)), the vertical axis has that same scale.
  const elevation = projection === "isometric" ? Math.asin(1/Math.sqrt(3)) : Math.PI/9;
  const u = Math.SQRT1_2, v = u*Math.sin(elevation), h = Math.cos(elevation);
  const top = `matrix(${u} ${v} ${-u} ${v} 101 24)`;
  const foot = 12*h;
  return <svg viewBox={`0 10 204 ${260*v+foot+29}`} role="img" aria-label={`Pocket sampler in ${projection} projection`} style={{width:size,maxWidth:"100%",height:"auto",display:"block"}}>
    <defs>
      <linearGradient id={id+"metal"} x2=".8" y2="1"><stop stopColor="#fff4d9"/><stop offset="1" stopColor="#c8bea7"/></linearGradient>
      <pattern id={id+"grid"} width="5" height="5" patternUnits="userSpaceOnUse"><path d="M5 0H0V5" fill="none" stroke="#568675" strokeWidth=".4"/></pattern>
      <clipPath id={id+"screen"}><rect x="12" y="12" width="69" height="24" rx="2"/></clipPath>
    </defs>
    <g transform={`matrix(${u} ${v} 0 1 ${101-114*u} ${24+114*v})`}>
      <rect width="146" height={foot} fill="#958773"/>
      <path d={`M8 ${foot*.62}h23m7 0h4`} stroke="#403e39" strokeWidth="2"/>
    </g>
    <g transform={`matrix(${-u} ${v} 0 1 ${101+146*u} ${24+146*v})`}>
      <rect width="114" height={foot} fill="#716859"/>
      {[12,17,22,27,32,37].map(x=><rect key={x} x={x} y="3" width="2" height="4" rx="1" fill="#393a35"/>)}
    </g>
    <g transform={top}>
      <rect width="146" height="114" fill={`url(#${id}metal)`}/>
      <rect x="8" y="8" width="77" height="32" rx="4" fill="#736f61"/>
      <g clipPath={`url(#${id}screen)`}><rect x="12" y="12" width="69" height="24" fill="#183c37"/><rect width="85" height="40" fill={`url(#${id}grid)`}/>
        <path d="M10 25h9l3-3 2 5 3-12 3 18 2-11 3 5 4-2h5l4-7 3 12 4-15 3 16 3-8 3 3h15" stroke="#affbad" strokeWidth="1.5" fill="none"/></g>
      {[100,124].map((x,i)=><g key={x}><circle cx={x} cy="24" r="9" fill="#968879"/><circle cx={x-1} cy="21" r="8" fill="#434743"/><circle cx={x-1} cy="20" r="6.6" fill="#5d6159"/><path d={i?`M${x} 20l4-3`:`M${x-1} 20l-2-5`} stroke="#f4e4c0" strokeWidth="1.6"/></g>)}
      {Array.from({length:12},(_,i)=>{const x=11+i%4*25,y=48+Math.floor(i/4)*18;return <g key={i}><rect x={x} y={y+2} width="21" height="14" rx="3" fill="#696257"/><rect x={x} y={y} width="21" height="13" rx="3" fill={i===3?"#ed8b55":i===7?"#e9ba72":"#494f50"}/><path d={`M${x+3} ${y+2}h15`} stroke="#fff" opacity=".2"/></g>})}
      {[114,127].map((x,i)=><g key={x}><rect x={x} y="51" width="3" height="47" rx="1" fill="#605e53"/><rect x={x-4} y={i?60:76} width="11" height="6" rx="1.5" fill="#313c3d"/><path d={`M${x-2} ${i?62:78}h7`} stroke="#efe5cb"/></g>)}
      {[[4,4],[142,4],[4,110],[142,110]].map(([x,y])=><g key={x+"-"+y}><circle cx={x} cy={y} r="1.7" fill="#928b79"/><path d={`M${x-1} ${y+1}l2-2`} stroke="#514f46" strokeWidth=".6"/></g>)}
    </g>
  </svg>;
}
