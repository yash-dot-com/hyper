import type { ReactNode } from "react";

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
  if (kind === "beam" || kind === "wink") return <path d="M-7 2 Q0 -10 7 2" fill="none"/>;
  if (kind === "sleep") return <path d="M-7 -1 Q0 7 7 -1" fill="none"/>;
  if (kind === "squint") return <path d="M-6 -4 L5 0 -6 4" fill="none"/>;
  if (kind === "spiral") return <path d="M0 0q3-3 4 1t-6 3q-6-3-2-9t11 1" fill="none"/>;
  if (kind === "dot") return <ellipse cx={gaze*2} rx="3.5" ry="5" stroke="none"/>;
  const sleepy = kind === "half" || kind === "droop";
  return <>
    <path d={sleepy ? "M-9-2Q0-1 9-3C9 9-9 11-9-2Z" : "M-9 1C-9-12 8-13 9 0C10 12-9 13-9 1Z"} fill="#fffdf8" strokeWidth="1.7"/>
    <ellipse cx={gaze*2} cy={sleepy ? 1 : 0} rx={kind==="wide"?2.5:sleepy?3.4:6.3} ry={kind==="wide"?3:sleepy?3:7} stroke="none"/>
    {kind==="sparkle" && <path fill="#fffdf8" stroke="none" d="M-1-6l1.1 2.5L3-2.5.1-1.4-1 1l-.9-2.4L-5-2.5l3.1-1z"/>}
  </>;
}

const mouths: Record<MouthStyle,string> = {
  smile:"M-5 0Q0 5 5 0", grin:"M-7-2Q0 0 7-2Q6 7 0 7T-7-2Z",
  o:"M-3 2a3 4 0 1 0 6 0a3 4 0 1 0-6 0Z", frown:"M-5 3Q0-3 5 3",
  pout:"M-3-1q8-1 4 2q4 2-4 3", wobble:"M-6 2q1-5 4-2t4 0t4 1",
  flat:"M-4 1h8", tongue:"M-6-1q6 4 12-1q0 9-5 7q-3 0-3-4",
  gasp:"M-5 4q0-9 5-9t5 9q-5-2-10 0Z", cat:"M-6 0q2 5 6 0q4 5 6 0",
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
    <g className="kf-float"><g transform={`rotate(${tilt} 50 46)`}>
      <path fill="#fff6eb" stroke="#42343d" strokeWidth="2" d="M15 45C15 25 28 13 49 13C71 12 85 25 86 46C89 62 77 73 60 74C50 75 37 75 28 72C15 70 10 60 15 45Z"/>
      {blush && [25,75].map(x=><g key={x} transform={`translate(${x} 53)`}><ellipse rx="7" ry="3.8" fill={blush} opacity=".68"/><path d="m-3 1 1-2m2 2 1-2" stroke={blush} strokeWidth="1.4" strokeLinecap="round"/></g>)}
      {[35,65].map((x,i)=><g key={x} transform={`translate(${x} 42)`} stroke="#362c35" fill="#362c35" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
        {brow!=="none" && <path fill="none" transform={`scale(${i?-1:1} 1)`} strokeWidth="1.8" d={brow==="one"&&i?"M-4-12q4-4 9-2":brow==="knit"?"M-5-11l10 3":brow==="worried"?"M-5-9q6 0 9-4":"M-4-13q4-3 8-1"}/>}
        <g transform={eye==="squint"&&i?"scale(-1 1)":undefined}><g className="kf-blink"><Eye kind={eye==="wink"&&i===0?"dot":eye} gaze={gaze}/></g></g>
      </g>)}
      <path transform="translate(50 55)" d={mouths[lip]} fill={["grin","tongue","o","gasp"].includes(lip)?"#e998a5":"none"} stroke="#42343d" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"/>
      <g transform={mark==="tear"?"translate(28 51)":"translate(80 23)"}>{accents[mark]}</g>
    </g></g>{children}
  </svg>;
}
