"use client";

import { useId, useSyncExternalStore } from "react";

const query = "(prefers-reduced-motion: reduce)";
function subscribe(update: () => void) {
  const preference = matchMedia(query);
  preference.addEventListener("change", update);
  return () => preference.removeEventListener("change", update);
}

// Corresponding knots keep every lobe attached as one silhouette melts into the next.
function contour(form: number) {
  const n = 72;
  const points = Array.from({length:n}, (_,i) => {
    const a = i * 2 * Math.PI / n;
    const r = form === 0 ? 74 + 4.8*Math.cos(12*a+.3) :
      form === 1 ? 70 + 9*Math.cos(5*a-.7) + 5*Math.sin(3*a) :
      65 + 13*Math.cos(4*a+.35) + 5*Math.sin(3*a-.8);
    return [100+Math.cos(a)*r*(form===2?1.05:1),100+Math.sin(a)*r];
  });
  const at=(i:number)=>points[(i+n)%n];
  const fmt=(p:number[])=>p.map(x=>x.toFixed(2)).join(" ");
  return "M"+fmt(at(0))+points.map((p,i)=>{
    const prev=at(i-1),next=at(i+1),after=at(i+2);
    return "C"+fmt(p.map((x,k)=>x+(next[k]-prev[k])/6))+" "+
      fmt(next.map((x,k)=>x-(after[k]-p[k])/6))+" "+fmt(next);
  }).join("")+"Z";
}
const forms=[0,1,2].map(contour);
const tones=[
  ["#76eaff","#ffabf2","#a1ffd3"], ["#38b5ff","#ff4ace","#45ec81"],
  ["#4388ef","#f024b1","#1dc675"], ["#9dfafa","#ffb9ec","#a4f6df"],
];
const ease="0.45 0 0.25 1";
export function JellyAvatar({size=240,animated=true,cycleSeconds=12}:{size?:number|string;animated?:boolean;cycleSeconds?:number}) {
  const id=useId();
  const still=useSyncExternalStore(subscribe,()=>matchMedia(query).matches,()=>true);
  const timing={dur:Math.max(3,cycleSeconds)+"s",repeatCount:"indefinite",calcMode:"spline",keyTimes:"0;.16;.33;.49;.66;.82;1",keySplines:Array(6).fill(ease).join(";")};
  function tween(attributeName:string,values:string[]) {
    return animated&&!still && <animate {...timing} attributeName={attributeName} values={[values[0],values[0],values[1],values[1],values[2],values[2],values[0]].join(";")}/>;
  }
  const url=(key:string)=>`url(#${id}-${key})`;
  const layer=(fill:string)=><use href={"#"+id+"-body"} fill={fill}/>;
  return <svg viewBox="0 0 200 200" role="img" aria-label="Jelly avatar" style={{display:"block",width:size,maxWidth:"100%",height:"auto"}}>
    <defs>
      <path id={id+"-body"} d={forms[0]}>{tween("d",forms)}</path>
      <radialGradient id={id+"-skin"} cx=".39" cy=".32" r=".79">
        {tones.map((colors,i)=><stop key={i} offset={[0,.35,.66,1][i]} stopColor={colors[0]}>{tween("stop-color",colors)}</stop>)}
      </radialGradient>
      <radialGradient id={id+"-rim"} cx=".53" cy=".49" r=".54"><stop offset=".67" stopColor="white" stopOpacity="0"/><stop offset="1" stopColor="white" stopOpacity=".46"/></radialGradient>
      <radialGradient id={id+"-shine"} cx=".27" cy=".16" r=".38"><stop stopColor="white" stopOpacity=".78"/><stop offset=".32" stopColor="white" stopOpacity=".36"/><stop offset="1" stopColor="white" stopOpacity="0"/></radialGradient>
      <filter id={id+"-blur"} x="-40%" y="-40%" width="180%" height="190%"><feGaussianBlur stdDeviation="6"/></filter>
      <filter id={id+"-glow"}><feGaussianBlur stdDeviation="1.4"/></filter>
      <pattern id={id+"-flecks"} width="37" height="41" patternUnits="userSpaceOnUse">
        {Array.from({length:44},(_,i)=><circle key={i} cx={(i*17.3+i*i*.73)%37} cy={(i*13.7+i*i*.31)%41} r={i%7===0?.65:.3} fill="#fff" opacity={i%3===0?.66:.31}/>)}
      </pattern>
    </defs>
    <g opacity=".28" transform="translate(0 6)" filter={url("blur")}>{layer(url("skin"))}</g>
    {layer(url("skin"))}{layer(url("rim"))}{layer(url("shine"))}{layer(url("flecks"))}
    <g>{animated&&!still && <animateTransform {...timing} attributeName="transform" type="rotate" values="-8 100 100;-8 100 100;-16 100 100;-16 100 100;9 100 100;9 100 100;-8 100 100"/>}
      <g>
        {animated&&!still && <animateTransform attributeName="transform" type="translate" dur="6.7s" repeatCount="indefinite"
          values="0 0;0 0;5 -3;5 -3;2 -2;2 -2;-4 2;-4 2;0 0" keyTimes="0;.18;.21;.39;.42;.57;.61;.82;1"/>}
        {[0,1].map(i => {
          // The same cubic spine stretches into a curious look, then curls into a smile.
          const poses = ["M0-6 C0-3 0 3 0 6", i ? "M0-10 C-1-5 0 3 1 8" : "M-2-4 C-1-3 0 1 1 3", "M-5 2 C-3-5 3-5 5 2"];
          return <g key={i} transform={`translate(${89+20*i} 96)`}>
            <g>
              {animated&&!still && <animateTransform attributeName="transform" type="scale" begin={i?"0.035s":"0s"} dur="5.3s" repeatCount="indefinite"
                values="1 1;1 1;1.14 .12;1 1;1 1" keyTimes="0;.6;.619;.65;1"/>}
              {[true,false].map(glow=><path key={String(glow)} d={poses[0]} fill="none" stroke="white" strokeLinecap="round"
                strokeWidth={glow?11:8} opacity={glow?.66:1} filter={glow?url("glow"):undefined}>{tween("d",poses)}</path>)}
            </g>
          </g>;
        })}
      </g>
    </g>
  </svg>;
}
