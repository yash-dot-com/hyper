import { useId, type ReactNode } from "react";

export type EyeStyle = "dot" | "beam" | "droop" | "wide" | "squint" | "sleep" | "sparkle" | "spiral" | "half" | "wink";
export type MouthStyle = "smile" | "grin" | "o" | "frown" | "pout" | "wobble" | "flat" | "tongue" | "gasp" | "cat";
type Brow = "none" | "raised" | "knit" | "worried" | "one";
type Accent = "none" | "spark" | "sweat" | "tear" | "anger" | "heart" | "chill";
type Recipe = readonly [EyeStyle, MouthStyle, Brow, Accent, number, number];

// Eyes, mouth, brows, accent, gaze direction, head tilt in degrees.
export const kawaiiExpressions = {
  happy: ["beam","grin","none","none",0,0],
  sad: ["droop","frown","worried","tear",-1,-3],
  angry: ["half","wobble","knit","anger",0,0],
  confused: ["wide","o","one","none",1,7],
  pleased: ["beam","cat","none","heart",0,-3],
  pain: ["squint","wobble","worried","none",0,-3],
  scared: ["wide","gasp","raised","sweat",-1,0],
  serious: ["half","flat","knit","none",0,0],
  silly: ["wink","tongue","raised","none",1,6],
  flirty: ["wink","smile","one","heart",1,-5],
  nervous: ["dot","wobble","worried","sweat",1,-3],
  tired: ["droop","flat","none","none",-1,3],
  surprised: ["wide","o","raised","none",0,0],
  irritated: ["half","frown","knit","none",1,2],
  bewildered: ["wide","wobble","one","sweat",-1,8],
  rage: ["squint","gasp","knit","anger",0,0],
  disgusted: ["wink","wobble","knit","none",-1,-7],
  confident: ["sleep","cat","one","spark",0,-4],
  dizzy: ["spiral","o","one","sweat",0,8],
  concerned: ["dot","frown","worried","none",-1,-4],
  curious: ["sparkle","o","one","none",1,7],
  pouty: ["half","pout","knit","none",-1,-4],
  sick: ["sleep","wobble","worried","sweat",0,5],
  laughing: ["squint","grin","none","tear",0,-4],
  embarrassed: ["dot","pout","worried","sweat",-1,6],
  incredulous: ["half","o","one","none",1,-6],
  bored: ["half","flat","none","none",1,4],
  snooty: ["sleep","pout","one","none",1,-8],
  cold: ["wide","wobble","worried","chill",0,0],
  calm: ["dot","smile","none","none",0,0],
  crying: ["squint","frown","worried","tear",0,2],
  mischievous: ["half","grin","one","none",1,-6],
  pensive: ["droop","pout","worried","none",-1,5],
  excited: ["sparkle","grin","raised","spark",0,-3],
  triumphant: ["wink","grin","raised","spark",0,4],
} as const satisfies Record<string, Recipe>;
export type KawaiiExpression = keyof typeof kawaiiExpressions;

function Eye({ kind, gaze }: { kind: EyeStyle; gaze: number }) {
  const clip = useId();
  if (kind === "beam" || kind === "wink")
    return <path stroke="none" d="M-14 7Q-10-5-2-13L1-14Q8-6 13 7L10 8Q4-2 0-6Q-6-1-11 8Z"/>;
  if (kind === "sleep") return <path stroke="none" d="M-13-2Q0 10 13-3Q5 15-5 10Q-12 7-13-2Z"/>;
  if (kind === "squint") return <path stroke="none" d="M-14-8L13 0 12 3-13 10-10 6 4 1-12-4Z"/>;
  if (kind === "spiral") return <path d="M0 0q4-4 6 1t-8 5q-9-4-4-12t16 1" fill="none"/>;

  const low = kind === "half" || kind === "droop";
  const contour = kind === "half" ? "M-14-6L13-5Q14 9 4 12Q-11 15-14 2Z" :
    kind === "droop" ? "M-14-3Q-5-4 9-12L13-9Q15 10 4 13Q-12 14-14 3Z" :
    "M-14 2Q-14-11-4-14Q8-18 13-6Q18 7 8 12Q-6 19-13 9Z";
  const radius = kind === "wide" ? 3 : kind === "sparkle" ? 10 : 6;
  return <>
    <defs><clipPath id={clip}><path d={contour}/></clipPath></defs>
    <path d={contour} fill="#fffefa" strokeWidth="1.8"/>
    <g clipPath={`url(#${clip})`} stroke="none">
      <g transform={`translate(${gaze*3} ${low ? -1 : 0})`}>
        <ellipse rx={radius} ry={radius*1.3}/>
        {kind !== "wide" && <ellipse cx={-radius*.37} cy={-radius*.65} rx={radius*.25} ry={radius*.32} fill="#fffefa"/>}
        {kind === "sparkle" && <path fill="#fffefa" d="m4 1 1.2 3L8 5l-2.8 1L4 9 3 6 .2 5 3 4Z"/>}
      </g>
    </g>
    {low && <path d={kind==="half"?"M-14-6 13-5":"M-14-3Q-5-4 9-12"} fill="none" strokeWidth="3"/>}
  </>;
}

const mouths: Record<MouthStyle,string> = {
  smile:"M-7-1Q0 7 7-2", grin:"M-9-3Q-1 0 8-5L10-1Q8 7 2 8Q-7 9-9 2Z",
  o:"M-4-2 2-4 5-1 3 6-3 5Z", frown:"M-6 3-2-1Q1-3 6 2",
  pout:"M-5-2 3-2 5 0 1 2 4 4-4 4", wobble:"M-8 3-5-2-1 0 2-2 7 1 8 4",
  flat:"M-5 1 5 0", tongue:"M-8-2Q-1 2 7-3L7 3Q6 9 1 7L-2 3-5 2Z",
  gasp:"M-7 6-5-4-1-7 4-6 7-2 6 8Q0 5-7 6Z", cat:"M-7-1Q-4 5 0 0Q4 5 7-2",
};
const accents: Record<Accent,ReactNode> = {
  none:null, spark:<path fill="#e7a839" d="m0-8 2 6 5 2-5 2-2 6-2-6-5-2 5-2z"/>,
  sweat:<path fill="#93c9d7" d="M0-7Q8 4 2 6Q-5 8-3 2Z"/>,
  tear:<path fill="#83c4da" d="M0-3Q7 6 1 7Q-4 7-3 3Z"/>,
  anger:<path stroke="#df677a" fill="none" strokeWidth="2" d="M-6-2q5 0 4-5M2-7q-1 5 4 5M6 2Q1 2 2 6M-2 6q1-4-4-4"/>,
  heart:<path fill="#df7897" d="M0 6Q-10 0-6-5Q-3-8 0-3Q5-9 8-4Q10 0 0 6Z"/>,
  chill:<path stroke="#79baca" strokeWidth="1.5" d="M0-6V6M-5-3 5 3M-5 3 5-3"/>,
};

export function KawaiiFace({ expression="happy", eyes, mouth, brows, accent, blush="#f19bb1", size=180, animated=true, children }: {
  expression?: KawaiiExpression; eyes?: EyeStyle; mouth?: MouthStyle; brows?: Brow; accent?: Accent;
  blush?: string | false; size?: number|string; animated?: boolean;
  /** Additional SVG artwork, in the 100 × 88 viewBox. */
  children?: ReactNode;
}) {
  const [e,m,b,a,gaze,tilt] = kawaiiExpressions[expression];
  const eye = eyes??e, lip = mouth??m, brow = brows??b, mark = accent??a;
  return <svg viewBox="0 0 100 88" role="img" aria-label={`Kawaii face: ${expression}`} className={animated?"kf-live":undefined} style={{width:size,maxWidth:"100%",height:"auto",display:"block"}}>
    {animated && <style>{`
      .kf-live .kf-blink{transform-box:fill-box;transform-origin:center;animation:kf-blink 5.3s linear infinite}
      .kf-live .kf-float{animation:kf-float 3.2s ease-in-out infinite}
      @keyframes kf-blink{0%,45%,49%,100%{transform:scaleY(1)}47%{transform:scaleY(.06)}}
      @keyframes kf-float{50%{transform:translateY(-1.4px)}}
      @media(prefers-reduced-motion:reduce){.kf-live .kf-blink,.kf-live .kf-float{animation:none}}
    `}</style>}
    <rect x="13" y="7" width="74" height="74" fill="#fffefa" stroke="#272325" strokeWidth="1.8"/>
    <g className="kf-float"><g transform={`rotate(${tilt} 50 46)`}>
      {blush && [21,79].map(x=><path key={x} transform={`translate(${x} 54)`} d="m-6 2 3-5 -1 6 5-7 -1 6 5-5" fill="none" stroke={blush} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>)}
      {[34,66].map((x,i)=><g key={x} transform={`translate(${x} 43)`} stroke="#241f23" fill="#241f23" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
        {brow!=="none" && <path fill="none" transform={`scale(${i?-1:1} 1)`} strokeWidth="1.8" d={brow==="one"&&i?"M-6-19q5-4 12-2":brow==="knit"?"M-8-16l14 5":brow==="worried"?"M-7-15q7 0 12-6":"M-6-19q6-4 12-1"}/>}
        <g transform={eye==="squint"&&i?"scale(-1 1)":undefined}><g className="kf-blink"><Eye kind={eye==="wink"&&i===0?"dot":eye} gaze={gaze}/></g></g>
      </g>)}
      <path transform="translate(50 64)" d={mouths[lip]} fill={["grin","tongue","o","gasp"].includes(lip)?(lip==="grin"?"#fffefa":"#d98797"):"none"} stroke="#42343d" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"/>
      {lip==="grin" && <path transform="translate(50 64)" d="M-3-1q-1 3 1 6M4-2q2 3 1 5" fill="none" stroke="#382b33" strokeWidth="1.4"/>}
      <g transform={mark==="tear"?"translate(28 51)":"translate(80 23)"}>{accents[mark]}</g>
    </g></g>{children}
  </svg>;
}
