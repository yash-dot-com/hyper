import { useId, type CSSProperties } from "react";

export const avatarShapes = ["square", "triangle", "circle", "cloud"] as const;
export type AvatarShape = typeof avatarShapes[number];

export const agentStates = ["idle", "listening", "thinking", "reading", "planning", "working", "checking", "waiting", "blocked", "done"] as const;
export type AgentState = typeof agentStates[number];
/** Retained for callers using the original portrait API. */
export type AgentCharacter = "girl" | "guy";

const outlines = {
  open: "M-23 4C-24-12-16-29-3-30C12-32 22-14 23 2C24 18 17 28 1 29C-13 30-22 22-23 4Z",
  round: "M-24 1C-24-16-15-28 0-28C16-28 25-14 25 2C25 19 15 29 0 29C-16 29-24 17-24 1Z",
  half: "M-23-7C-12-8 12-8 23-9C24-4 24 0 23 5C21 20 11 27-3 26C-17 25-23 14-23-7Z",
  focus: "M-23 1C-23-12-15-20-1-20C13-20 22-13 23 0C24 16 16 26 1 27C-14 28-23 18-23 1Z",
  soft: "M-23 2C-21-10-12-18 0-19C14-19 22-8 23 6C13 3 5 4-2 7C-11 10-18 16-22 20C-24 15-24 8-23 2Z",
};
type Eye = keyof typeof outlines;
type Expression = { eyes: [Eye, Eye]; tilt: number; gaze: [number, number]; pupil: number; mouth: string; brows?: string; rhythm: string };
const faces: Record<AgentState, Expression> = {
  idle: {eyes:["open","open"], tilt:0, gaze:[1,2], pupil:12, mouth:"M73 99q7 4 14-1", rhythm:"drift"},
  listening: {eyes:["round","open"], tilt:-4, gaze:[-4,1], pupil:15, mouth:"M75 99q6 7 12-1", brows:"M48 34q6-5 12-4", rhythm:"nod"},
  thinking: {eyes:["half","open"], tilt:-7, gaze:[6,-7], pupil:13, mouth:"M78 100q4-4 9-2", brows:"M92 29q7-6 13-3", rhythm:"ponder"},
  reading: {eyes:["focus","focus"], tilt:3, gaze:[0,5], pupil:11, mouth:"M76 98q6 2 12 0", rhythm:"scan"},
  planning: {eyes:["open","round"], tilt:-3, gaze:[5,-5], pupil:10, mouth:"M72 98q9 8 18-3", rhythm:"plot"},
  working: {eyes:["focus","focus"], tilt:1, gaze:[1,7], pupil:13, mouth:"M74 98q7 6 14 0", rhythm:"tap"},
  checking: {eyes:["half","round"], tilt:7, gaze:[-5,1], pupil:9, mouth:"M76 99q5-3 11-2", brows:"M93 29q8-7 16-2", rhythm:"inspect"},
  waiting: {eyes:["half","half"], tilt:-4, gaze:[-6,6], pupil:13, mouth:"M74 101q7-1 14-2", rhythm:"sigh"},
  blocked: {eyes:["round","open"], tilt:4, gaze:[0,2], pupil:6, mouth:"M74 102q6-9 15-3", brows:"M42 37q8 1 15-6M98 30q6 7 14 6", rhythm:"flinch"},
  done: {eyes:["soft","soft"], tilt:-3, gaze:[2,0], pupil:14, mouth:"M69 96q12 17 25-2", rhythm:"bounce"},
};

export function AgentPortrait({ state = "idle", shape = "square", size = 240 }: {
  state?: AgentState; shape?: AvatarShape; size?: number | string; character?: AgentCharacter;
}) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const f = faces[state];
  const ink = "#20211d";
  return <svg className="agent-eyes" viewBox="0 -15 160 160" role="img" aria-label={`Agent: ${state}`}
    style={{width:size,maxWidth:"100%",height:"auto",display:"block"} as CSSProperties}>
    <style>{`
      .agent-eyes .ae-pose {transform-origin:80px 86px;transition:transform .36s cubic-bezier(.2,.8,.2,1)}
      .agent-eyes .ae-blink {transform-box:fill-box;transform-origin:center;animation:ae-blink 5.9s linear infinite}
      .agent-eyes .ae-body {transform-origin:80px 83px;animation:ae-breathe 3.8s ease-in-out infinite}
      .agent-eyes .ae-gaze {animation:ae-look 6.7s ease-in-out infinite}
      .agent-eyes .nod {animation-name:ae-nod}.agent-eyes .ponder {animation-name:ae-ponder}
      .agent-eyes .scan .ae-gaze {animation:ae-scan 2.8s ease-in-out infinite}
      .agent-eyes .plot .ae-gaze {animation:ae-plot 3.1s ease-in-out infinite}
      .agent-eyes .tap {animation:ae-tap 1.6s ease-in-out infinite}
      .agent-eyes .inspect {animation:ae-inspect 3.4s ease-in-out infinite}
      .agent-eyes .sigh {animation:ae-sigh 4.8s ease-in-out infinite}
      .agent-eyes .flinch {animation:ae-flinch 4.2s ease-in-out infinite}
      .agent-eyes .bounce {animation:ae-bounce 3.5s ease-in-out infinite}
      @keyframes ae-blink {0%,42%,46%,100%{transform:scaleY(1)}44%{transform:scaleY(.055)}}
      @keyframes ae-look {0%,25%,75%,100%{transform:none}32%,60%{transform:translate(3px,-1px)}}
      @keyframes ae-breathe {50%{transform:translateY(-2px)}}
      @keyframes ae-nod {0%,15%,56%,100%{transform:none}23%{transform:translateY(4px) scaleY(.93)}32%{transform:translateY(-1px)}43%{transform:translateY(2px) scaleY(.97)}}
      @keyframes ae-ponder {50%{transform:translate(-2px,-2px) rotate(-3deg)}}
      @keyframes ae-scan {0%,100%{transform:translateX(-7px)}70%,78%{transform:translateX(7px)}}
      @keyframes ae-plot {15%,75%{transform:none}35%,52%{transform:translate(-7px,4px)}}
      @keyframes ae-tap {30%{transform:translateY(2px) rotate(1deg)}65%{transform:translateY(-1px) rotate(-1deg)}}
      @keyframes ae-inspect {40%,60%{transform:translateX(3px) scale(1.05)}}
      @keyframes ae-sigh {55%,67%{transform:translateY(3px) scaleY(.94)}}
      @keyframes ae-flinch {8%{transform:rotate(-3deg)}17%{transform:rotate(2deg)}24%,100%{transform:none}}
      @keyframes ae-bounce {12%{transform:scale(1.04,.95)}24%{transform:translateY(-5px)}38%{transform:scale(1.02,.98)}49%,100%{transform:none}}
      @media(prefers-reduced-motion:reduce){.agent-eyes * {animation:none!important;transition:none!important}}
    `}</style>
    <g fill="#f6dca3" stroke={ink} strokeWidth="3" strokeLinejoin="round">
      {shape === "square" && <rect x="3" y="-12" width="154" height="154" rx="29"/>}
      {shape === "circle" && <circle cx="80" cy="65" r="77"/>}
      {shape === "triangle" && <path d="M70 2Q80-15 90 2L154 121Q163 139 143 139H17Q-3 139 6 121Z"/>}
      {shape === "cloud" && <path d="M35 120C15 120 3 105 3 87C3 70 12 57 27 53C23 31 43 15 63 22C75-5 116-3 126 29C143 29 156 43 152 62C169 83 152 118 129 118C118 133 98 136 81 125C64 138 44 134 35 120Z"/>}
    </g>
    <g transform={shape === "triangle" ? "translate(29 45) scale(.64)" : shape === "cloud" ? "translate(12 16) scale(.85)" : undefined}>
    <g className="ae-pose" style={{transform:`rotate(${f.tilt}deg)`}}>
      <g className={`ae-body ${f.rhythm}`}>
        {f.eyes.map((shape,i) => {
          const d = outlines[shape], clip = id + "-eye-" + i;
          const mirror = i === 1 && shape === "soft";
          return <g key={i} transform={`translate(${i ? 105 : 55} ${i ? 63 : 65})`}>
            <g className="ae-blink">
              <defs><clipPath id={clip}><path d={d} transform={mirror ? "scale(-1 1)" : undefined}/></clipPath></defs>
              <path d={d} transform={mirror ? "scale(-1 1)" : undefined} fill="#fffdf5" stroke={ink} strokeWidth="3.6" strokeLinejoin="round"/>
              <g clipPath={`url(#${clip})`}><g className="ae-gaze">
                <ellipse cx={f.gaze[0]+(i ? -2 : 2)} cy={f.gaze[1]} rx={f.pupil} ry={f.pupil*1.35} fill={ink}/>
                <circle cx={f.gaze[0]+(i ? -2 : 2)-3} cy={f.gaze[1]-f.pupil*.65} r={state==="blocked"?1.6:2.7} fill="#fffdf5"/>
              </g></g>
            </g>
          </g>;
        })}
        <g stroke={ink} fill="none" strokeWidth="2.8" strokeLinecap="round"><path d={f.mouth}/>{f.brows && <path d={f.brows}/>}</g>
        {state==="done" && <path fill="#e99a45" d="m135 36 2-6 2 6 5 2-5 2-2 6-2-6-5-2z"/>}
      </g>
    </g>
    </g>
  </svg>;
}
