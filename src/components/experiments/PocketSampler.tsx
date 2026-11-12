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
  const point = (x: number, y: number, z = 0) => [101 + u*(x-y), 24 + v*(x+y) - h*z];
  function cap(x: number, y: number, w: number, d: number, z: number, color: string) {
    const corners = [[1,0],[w-1,0],[w,1],[w,d-1],[w-1,d],[1,d],[0,d-1],[0,1]];
    const ring = (height: number) => corners.map(([a,b]) => point(x+a,y+b,height));
    const base = ring(0), lid = ring(z);
    return <g>
      {base.map((a,i) => {
        const j=(i+1)%base.length, b=base[j];
        if (b[0]>=a[0]) return null;
        return <g key={i}><polygon points={[a,b,lid[j],lid[i]].join(" ")} fill={color}/>
          <polygon points={[a,b,lid[j],lid[i]].join(" ")} opacity={i<4?.46:i===4?.36:.27}/></g>;
      })}
      <polygon points={lid.join(" ")} fill={color} stroke="#fff" strokeOpacity=".25" strokeWidth=".4"/>
    </g>;
  }
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
      {[114,127].map(x=><rect key={x} x={x} y="51" width="3" height="47" rx="1" fill="#514e47"/>)}
      {[[4,4],[142,4],[4,110],[142,110]].map(([x,y])=><g key={x+"-"+y}><circle cx={x} cy={y} r="1.7" fill="#928b79"/><path d={`M${x-1} ${y+1}l2-2`} stroke="#514f46" strokeWidth=".6"/></g>)}
    </g>
    {[100,124].map((x,i) => {
      const [cx,cy]=point(x,24), radius=9, ry=radius*Math.sin(elevation), lift=10*h;
      return <g key={x} transform={`translate(${cx} ${cy})`}>
        <ellipse cy="1" rx="10.4" ry={ry+1} fill="#786d59" opacity=".48"/>
        <path d={`M-${radius} 0a${radius} ${ry} 0 0 0 ${2*radius} 0v-${lift}h-${2*radius}z`} fill="#343b38"/>
        {[-7,-4,0,4,7].map(dx=>{
          const y=ry*Math.sqrt(1-(dx/radius)**2);
          return <path key={dx} d={`M${dx} ${y-1}v-${lift-2}`} stroke="#70766a" strokeWidth=".85"/>;
        })}
        <ellipse cy={-lift} rx={radius} ry={ry} fill="#646b61" stroke="#909588" strokeWidth=".6"/>
        <path d={`M0 ${-lift}l${i?6:-5} -2`} stroke="#f7e8c6" strokeWidth="1.6"/>
      </g>;
    })}
    {Array.from({length:12},(_,i)=>{
      const x=11+i%4*25, y=48+Math.floor(i/4)*18;
      return <g key={i}>{cap(x,y,21,14,5,i===3?"#ed8b55":i===7?"#e9ba72":"#525b5b")}</g>;
    })}
    {[114,127].map((x,i)=>{
      const y=i?60:76;
      return <g key={x}>{cap(x-4,y,11,7,6,"#586360")}
        <polyline points={[point(x-3,y+3,6),point(x+5,y+3,6)].join(" ")} stroke="#f2e6cd" strokeWidth="1.1"/>
      </g>;
    })}
  </svg>;
}
