import { useId } from "react";

const editions = {
  sound: ["The Sound", "24", "#77b6bb", "#133f55", 154,100],
  peak: ["Alpine Post", "55", "#f29c70", "#753d57", 108,140],
  citrus: ["Citron", "18", "#f3cb53", "#30594c", 118,118],
  night: ["Night Mail", "72", "#7976bc", "#212a50", 152,94],
  reeds: ["Fenlands", "36", "#9eb68b", "#314e48", 94,145],
  shell: ["Tide Pool", "41", "#e4a2af", "#803f58", 132,110],
} as const;
export type StampEdition=keyof typeof editions;

function Illustration({edition}:{edition:StampEdition}){
  switch(edition){
    case "sound":return <><circle cx="77" cy="19" r="8" fill="#ffd18c"/><path d="M0 46Q24 34 46 45T100 42V68H0Z" fill="#eef0ce"/><path d="M8 44Q20 30 40 37Q52 39 58 34Q67 30 69 25Q76 28 71 36Q78 33 82 38Q67 47 56 46Q40 62 19 49Z"/><circle cx="19" cy="43" r="1.2" fill="#fff1d6"/><path d="M15 55q19 8 40 1m9-7 18-2" fill="none" stroke="currentColor"/></>;
    case "peak":return <><circle cx="68" cy="19" r="12" fill="#ffe4a1"/><path d="M-4 65L39 10L62 46L75 27L108 68Z"/><path d="M23 30l16-20 12 19-12-6-6 7-2-6z" fill="#ffefd4"/><path d="M2 63l30-19 14 8 22-10 35 22" fill="#c46b60"/></>;
    case "citrus":return <><path d="M49 29Q32 29 25 13Q44 9 50 24Q54 10 69 11Q67 25 51 28Z"/><circle cx="48" cy="43" r="20" fill="#df6639"/><circle cx="59" cy="47" r="15" fill="#fff1bf"/>{Array.from({length:8},(_,i)=><path key={i} d="M60 45L60 34Q65 34 68 38Z" fill="#f3904f" transform={`rotate(${i*45} 59 47)`}/>)}</>;
    case "night":return <><path d="M24 10Q15 29 36 31Q9 39 11 19Z" fill="#ffe0a0"/><path d="M0 53Q25 36 56 50Q79 33 100 45V67H0Z"/><path d="M33 31l50-15-17 30-11-12-11 6 5-12z" fill="#fff0d7"/><path d="M49 33l29-15-23 16" fill="#bcb7e1"/><path d="M14 49q12-9 28-10" fill="none" stroke="#ffe5b4" strokeDasharray="2 3"/></>;
    case "reeds":return <><circle cx="68" cy="24" r="15" fill="#ecdca8"/>{[18,30,46,62,78].map((x,i)=><g key={x} transform={`translate(${x} ${i%2*9}) rotate(${i*4-12})`}><path d="M0 68V22m0 34q-10-2-11-14 10 5 11 14m0-10q10-4 12-13-10 4-12 13" stroke="currentColor"/><rect x="-2.8" y="9" width="5.6" height="19" rx="3"/></g>)}</>;
    case "shell":return <><path d="M48 60C34 50 7 42 15 29Q12 19 25 18Q27 8 39 12Q47 2 55 11Q69 4 74 15Q88 13 88 26Q98 37 77 45L56 60Z" fill="#f8daab" stroke="currentColor" strokeWidth="2"/>{[18,28,40,52,65,76,86].map((x,i)=><path key={x} d={`M51 57Q${x} 30 ${x} ${12+Math.abs(i-3)*4}`} fill="none" stroke="currentColor" strokeWidth="1.3"/>)}</>;
  }
}

export function PostalStamp({edition="sound"}:{edition?:StampEdition}){
  const id=useId(),[name,value,paper,ink,w,h]=editions[edition];
  const oval=edition==="citrus",arch=edition==="peak";
  const edge=oval?`M3 ${h/2}a${w/2-3} ${h/2-3} 0 1 0 ${w-6} 0a${w/2-3} ${h/2-3} 0 1 0 -${w-6} 0Z`:arch?`M3 ${h-3}V53a51 49 0 0 1 102 0V${h-3}Z`:`M3 3H${w-3}V${h-3}H3Z`;
  return <svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label={`${name}, ${value} denomination postage stamp`} style={{display:"block",width:"100%",height:"100%",color:ink}}>
    <defs><mask id={id}><path d={edge} fill="white"/><path d={edge} fill="none" stroke="black" strokeWidth="4.4" strokeDasharray=".25 6" strokeLinecap="round"/></mask></defs>
    <g mask={`url(#${id})`}><rect width={w} height={h} fill="#faf0cf"/><path d={edge} transform={`translate(${w*.057} ${h*.057}) scale(.886)`} fill={paper}/>
      <svg x="8%" y={arch?"26%":"17%"} width="84%" height={arch?"55%":"62%"} viewBox="0 0 100 68" fill={ink}><Illustration edition={edition}/></svg>
      <g fill={ink} fontFamily="Georgia,serif" fontWeight="bold" textAnchor="middle"><text x="50%" y={arch?"29%":"23%"} fontSize="10">{value}</text><text x="50%" y="86%" fontSize={oval?12:14}>{name}</text></g>
    </g>
  </svg>;
}
