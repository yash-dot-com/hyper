import { useId, type ButtonHTMLAttributes, type HTMLAttributes, type CSSProperties } from "react";

const finishes={
  lagoon:["#074b52","#10ede1","#95f59d"],
  iris:["#28106e","#9681ff","#08d8fb"],
  ember:["#831534","#ff7958","#ffcf40"],
  dusk:["#172760","#e590ec","#997aff"],
} as const;
export type ChromaFinish=keyof typeof finishes;
function surface(finish:ChromaFinish):CSSProperties{
  const [base,edge,light]=finishes[finish];
  return {color:"#fffaf6",backgroundColor:base,border:`1px solid ${light}`,
    backgroundImage:`linear-gradient(155deg,${edge}38,transparent 48%,${edge}22)`,
    boxShadow:`inset 0 1px 2px ${light}, inset 0 0 7px ${edge}, inset 0 0 15px ${edge}88`};
}
export function ChromaButton({finish="iris",type="button",children,style,...props}:ButtonHTMLAttributes<HTMLButtonElement>&{finish?:ChromaFinish}){
  return <button {...props} type={type} data-chroma-action="" style={{...surface(finish),borderRadius:12,minHeight:44,padding:"7px 21px",fontWeight:620,cursor:"pointer",...style}}>
    {children}
    <style>{`[data-chroma-action]{transition:filter .18s ease,transform .18s ease}[data-chroma-action]:enabled:hover{filter:brightness(1.18)}[data-chroma-action]:enabled:active{transform:translateY(2px)}[data-chroma-action]:focus-visible{outline:2px solid white;outline-offset:3px}[data-chroma-action]:disabled{opacity:.55;cursor:default!important}@media(prefers-reduced-motion:reduce){[data-chroma-action]{transition:none}}`}</style>
  </button>;
}
export function ChromaBadge({finish="ember",style,...props}:HTMLAttributes<HTMLSpanElement>&{finish?:ChromaFinish}){
  return <span {...props} style={{...surface(finish),display:"inline-flex",alignItems:"center",borderRadius:999,padding:"4px 12px",fontSize:12,fontWeight:650,...style}}/>;
}
const forms={
  arch:"M4 97V48a46 46 0 0 1 92 0v49ZM4 98h92a46 46 0 0 1-92 0Z",
  diamond:"M50 2 97 73 50 144 3 73Z",
  steps:"M29 3H71V11H82V21H92V32H98V116H90V127H80V137H69V144H31V137H20V127H10V116H2V32H8V21H18V11H29Z",
};
export function ChromaCard({finish="lagoon",shape="arch",children,style,...props}:HTMLAttributes<HTMLElement>&{finish?:ChromaFinish;shape?:keyof typeof forms}){
  const id=useId(),[base,edge,light]=finishes[finish],path=forms[shape];
  return <article {...props} style={{...surface(finish),position:"relative",overflow:"hidden",isolation:"isolate",borderRadius:14,minWidth:0,padding:"18px",display:"flex",flexDirection:"column",justifyContent:"flex-end",...style}}>
    <svg aria-hidden="true" viewBox="0 0 100 148" preserveAspectRatio="xMidYMid meet" style={{position:"absolute",right:"-4%",top:"-7%",height:"115%",width:"74%",zIndex:-2,pointerEvents:"none"}}>
      <defs><clipPath id={id+"cut"}><path d={path}/></clipPath><filter id={id+"soft"} x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="4"/></filter></defs>
      <path d={path} fill={base}/>
      <g clipPath={`url(#${id}cut)`} fill="none"><path d={path} stroke={edge} strokeWidth="21" filter={`url(#${id}soft)`}/><path d={path} stroke={light} strokeWidth="3.5"/></g>
    </svg>
    <span aria-hidden="true" style={{position:"absolute",inset:0,zIndex:-1,pointerEvents:"none",background:`linear-gradient(75deg,${base}d9,transparent 68%)`}}/>
    {children}
  </article>;
}
