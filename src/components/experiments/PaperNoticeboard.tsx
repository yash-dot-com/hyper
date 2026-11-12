import { useId } from "react";

type Notice = { title: string; detail: string; href?: string };
type Props = { notices?: readonly [Notice, Notice, Notice, Notice]; label?: string };

const studio: NonNullable<Props["notices"]> = [
  { title:"Open studio", detail:"Saturday · 10 am–4 pm" },
  { title:"Print room", detail:"Drop in for screen printing." },
  { title:"Find us", detail:"14 Willow Lane · Floor 2" },
  { title:"Bring along", detail:"A cotton tote to print on." },
];

// Round each turn, including the inward steps, using the available edge length.
function cutPaper(points:number[][]) {
  return points.map(([x,y],i)=>{
    const near=(offset:number)=>{
      const [a,b]=points[(i+offset+points.length)%points.length];
      const d=Math.hypot(a-x,b-y);
      const t=Math.min(10,d/2)/d;
      return [x+(a-x)*t,y+(b-y)*t].join(" ");
    };
    return `${i?"L":"M"}${near(-1)} Q${x} ${y} ${near(1)}`;
  }).join(" ")+" Z";
}
const shapes=[
  [[0,17],[69,17],[69,1],[108,1],[108,17],[158,17],[158,90],[139,90],[139,111],[119,111],[119,85],[0,85]],
  [[21,18],[39,18],[39,0],[60,0],[60,18],[132,18],[132,48],[158,48],[158,76],[134,76],[134,94],[64,94],[64,111],[25,111],[25,90],[0,90],[0,41],[31,41],[31,33],[21,33]],
  [[0,29],[80,29],[80,8],[101,8],[101,0],[158,0],[158,72],[139,72],[139,86],[158,86],[158,105],[99,105],[99,111],[0,111],[0,84],[33,84],[33,76],[0,76]],
  [[0,18],[46,18],[46,0],[68,0],[68,19],[121,19],[121,61],[142,61],[142,84],[158,84],[158,103],[91,103],[91,111],[45,111],[45,98],[0,98],[0,77],[17,77],[17,61],[0,61]],
].map(cutPaper);
const fills=["#ffdc70","#2039d6","#f5c7eb","#f5ac91"];
const inks=["#584116","#fff9da","#782762","#702c1e"];
const grain='url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'96\' height=\'96\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'.82\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Cpath fill=\'%23fff\' filter=\'url(%23n)\' d=\'M0 0h96v96H0z\'/%3E%3C/svg%3E")';

export function PaperNoticeboard({notices=studio,label="Studio information"}:Props) {
  const id=useId();
  return <section className="paper-board" aria-label={label}>
    <div className="paper-layout">{notices.map(({title,detail,href},i)=>
      <article key={i} className="paper-piece" style={{color:inks[i]}}>
        <svg aria-hidden="true" viewBox="0 0 160 115" preserveAspectRatio="none">
          <defs><clipPath id={id+i}><path d={shapes[i]}/></clipPath></defs>
          <path d={shapes[i]} transform="translate(2 3)" fill={inks[i]} opacity=".48"/>
          <path d={shapes[i]} fill={fills[i]}/>
          <foreignObject width="160" height="115" clipPath={`url(#${id+i})`}><div style={{height:"100%",backgroundImage:grain,opacity:.16}}/></foreignObject>
        </svg>
        <div className="paper-copy"><h3>{href?<a href={href}>{title}</a>:title}</h3><p>{detail}</p></div>
      </article>)}</div>
    <style>{`
      .paper-board {container-type:inline-size;width:100%;color-scheme:light}
      .paper-layout {display:grid;grid-template-columns:repeat(3,minmax(0,1fr));grid-template-rows:auto auto;gap:0 2%;align-items:center}
      .paper-piece {position:relative;isolation:isolate;min-width:0;display:grid;align-items:center;min-height:21cqw;padding:6cqw 5cqw 6cqw 2.6cqw;box-sizing:border-box}
      .paper-piece svg {position:absolute;inset:0;width:100%;height:100%;z-index:-1;pointer-events:none}
      .paper-piece:nth-child(2) {grid-area:1/2/span 2/3;min-height:32cqw;padding-inline:3.1cqw 5.5cqw;align-self:start}
      .paper-piece:nth-child(3) {grid-area:1/3/span 2/4;min-height:34cqw;align-self:end}
      .paper-piece:nth-child(4) {grid-area:2/1;padding-left:4cqw;margin-top:-2cqw}
      .paper-copy {overflow-wrap:anywhere;line-height:1.2}
      .paper-copy h3 {font-size:clamp(13px,3.2cqw,28px);font-weight:720;letter-spacing:-.045em;margin:0}
      .paper-copy a {color:inherit;text-decoration:underline;text-underline-offset:.14em}
      .paper-copy p {font-size:clamp(10px,1.8cqw,16px);margin:.45em 0 0}
      @container(max-width:460px){
        .paper-layout {grid-template-columns:repeat(2,minmax(0,1fr));gap:2cqw}
        .paper-layout .paper-piece {grid-area:auto;align-self:stretch;margin:0;min-height:32cqw;padding:10cqw 8cqw 8cqw 5cqw}
      }
    `}</style>
  </section>;
}
