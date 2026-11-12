"use client";

import { useEffect, useState } from "react";

export type AgentCharacter = "girl" | "guy";

// All coordinates sit on a 48 × 48 pixel grid. Offsets are whole pixels.
const expressions = {
  idle:      { brow: "level", eye: 2, look: 0, lift: 0, mouth: "small" },
  listening: { brow: "up", eye: 3, look: 0, lift: -1, mouth: "small" },
  thinking:  { brow: "one", eye: 2, look: -1, lift: 0, mouth: "smirk" },
  reading:   { brow: "level", eye: 2, look: 1, lift: 1, mouth: "flat" },
  planning:  { brow: "one", eye: 3, look: 1, lift: 0, mouth: "smirk" },
  working:   { brow: "level", eye: 2, look: 0, lift: 1, mouth: "flat" },
  checking:  { brow: "one", eye: 1, look: 1, lift: 0, mouth: "purse" },
  waiting:   { brow: "level", eye: 1, look: -1, lift: 0, mouth: "small" },
  blocked:   { brow: "worried", eye: 3, look: 0, lift: 1, mouth: "frown" },
  done:      { brow: "up", eye: 1, look: 0, lift: -1, mouth: "grin" },
} as const;
export type AgentState = keyof typeof expressions;
export const agentStates = Object.keys(expressions) as AgentState[];

const brows = {
  level: "M19 19h6v1h-6z M31 19h6v1h-6z",
  up: "M19 18h1v-1h5v2h-6z M31 17h5v1h1v1h-6z",
  one: "M19 18h1v-1h5v2h-6z M31 20h6v1h-6z",
  in: "M19 18h3v1h3v2h-3v-1h-3z M31 19h3v-1h3v2h-3v1h-3z",
  worried: "M19 20h3v-2h3v2h-2v1h-4z M31 18h3v2h3v1h-4v-1h-2z",
};
const mouths = {
  small: "M26 31h1v1h4v-1h1v2h-5v-1h-1z",
  purse: "M29 31h3v1h-1v1h-3v-1h1z",
  flat: "M27 32h5v1h-5z",
  smirk: "M26 32h5v-1h2v2h-7z",
  frown: "M25 33v-2h2v-1h4v1h2v2h-2v-1h-4v1z",
  grin: "M24 30h2v1h7v-1h2v2h-2v2h-7v-2h-2z",
};
// A single pencil changes ownership at the ear. Each row is a held sprite pose:
// hand x/y, pencil parked behind ear, hold in milliseconds.
const workFrames: readonly [number, number, boolean, number][] = [
  [24, 47, false, 420], [26, 46, false, 210], [25, 47, false, 180],
  [28, 46, false, 260], [27, 47, false, 180], [29, 46, false, 850],
  [24, 43, false, 110], [18, 38, false, 100], [13, 31, false, 110],
  [10, 25, false, 240], [10, 25, true, 160], [12, 31, true, 120],
  [16, 39, true, 140], [20, 46, true, 1450], [15, 38, true, 140],
  [11, 30, true, 120], [10, 25, true, 200], [10, 25, false, 170],
  [13, 32, false, 100], [18, 39, false, 110], [23, 45, false, 140],
];

function Pencil({ x, y }: { x: number; y: number }) {
  return <g transform={`translate(${x} ${y})`}>
    <path fill="#573e42" d="M-3-8h2v3h1v3h1v3h1v3H0V1h-1v-3h-1v-3h-1z"/>
    <path fill="#f4c367" d="M-2-7h1v3h1v3h1v3H0v-3h-1v-3h-1z"/>
    <path fill="#f39896" d="M-3-9h2v2h-2z"/><path fill="#332c33" d="M1 3h1v2H1z"/>
  </g>;
}

// Masks share a wrist anchor; the grip leaves the pencil visible between fingers.
const hands = {
  chin: [
    ".....oo...", "....ohso..", "...ohso...", "..ohsoooo.", ".ohssshhso",
    ".ossssooo.", ".osssshso.", ".ossssdo..", "..dssdo...", "..oddo....",
  ],
  grip: [
    "....oooo..", "...ohhhso.", "..ohso.oso", ".ohso..oso", ".osssodsso",
    ".ossshhso.", ".ossssso..", "..dssdo...", "..oddo....", "..ooo.....",
  ],
  relaxed: [
    "..........", "....oo....", "...ohsoo..", "..ohsshso.", "..ossssso.",
    "..ossshso.", "..osssdo..", "..osddo...", "..oddo....", "..ooo.....",
  ],
} as const;

function Hand({ kind, skin, shade, highlight }: {
  kind: keyof typeof hands; skin: string; shade: string; highlight: string;
}) {
  const colors: Record<string, string> = { o: "#553c42", s: skin, h: highlight, d: shade };
  return <g transform="translate(-5 -4)">{hands[kind].map((row, y) =>
    [...row].map((pixel, x) => pixel === "." ? null :
      <rect key={10*y+x} x={x} y={y} width="1" height="1" fill={colors[pixel]}/>))}</g>;
}

// A broad elbow narrows toward the cuff. Round vertices onto the sprite grid.
function sleeve(x: number, y: number, wristX: number, wristY: number) {
  const dx = wristX-x, dy = wristY-y, length = Math.hypot(dx, dy) || 1;
  const point = (t: number, w: number) =>
    [Math.round(x+t*dx-w*dy/length), Math.round(y+t*dy+w*dx/length)];
  const vertices = [point(0,-3),point(.3,-3),point(1,-2),point(1,2),point(.25,4),point(0,3)];
  const rows: string[] = [];
  for (let y = Math.min(...vertices.map(p => p[1])); y < Math.max(...vertices.map(p => p[1])); y++) {
    const hits: number[] = [];
    vertices.forEach(([ax, ay], i) => {
      const [bx, by] = vertices[(i+1) % vertices.length];
      const mid = y + 0.5;
      if ((ay > mid) !== (by > mid)) hits.push(ax + (mid-ay)*(bx-ax)/(by-ay));
    });
    if (hits.length >= 2) {
      const left = Math.round(Math.min(...hits)), right = Math.round(Math.max(...hits));
      rows.push(`M${left} ${y}H${right}v1H${left}z`);
    }
  }
  return rows.join(" ");
}
const rest = { blink: false, gaze: 0, bob: 0, hair: 0, frame: 0 };

function useIdleMotion(state: AgentState) {
  const [pose, setPose] = useState(rest);
  useEffect(() => {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    const pending = new Set<number>();
    function after(delay: number, callback: () => void) {
      const id = window.setTimeout(() => { pending.delete(id); callback(); }, delay);
      pending.add(id);
    }
    function blink() {
      setPose(p => ({ ...p, blink: true }));
      after(110, () => setPose(p => ({ ...p, blink: false })));
      after(2100 + Math.random() * 3400, blink);
    }
    function glance() {
      const gaze = Math.random() < .5 ? -1 : 1;
      setPose(p => ({ ...p, gaze }));
      after(140, () => setPose(p => ({ ...p, bob: gaze })));
      after(235, () => setPose(p => ({ ...p, hair: gaze })));
      after(650 + Math.random() * 600, () => {
        setPose(p => ({ ...p, gaze: 0, bob: 0 }));
        after(120, () => setPose(p => ({ ...p, hair: 0 })));
      });
      after((state === "reading" || state === "working" ? 2100 : 3200) + Math.random() * 1800, glance);
    }
    function work(frame: number) {
      setPose(p => ({ ...p, frame }));
      after(workFrames[frame][3], () => work((frame + 1) % workFrames.length));
    }
    function clear() { pending.forEach(id => window.clearTimeout(id)); pending.clear(); }
    function sync() {
      clear(); setPose(rest);
      if (reduce.matches || document.hidden) return;
      if (state === "working") work(0);
      after(700 + Math.random() * 1500, blink);
      after(350 + Math.random() * 850, glance);
    }
    sync();
    reduce.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    return () => { clear(); reduce.removeEventListener("change", sync); document.removeEventListener("visibilitychange", sync); };
  }, [state]);
  return pose;
}

export function AgentPortrait({ character = "girl", state = "idle", size = 240 }: {
  character?: AgentCharacter; state?: AgentState; size?: number | string;
}) {
  const pose = useIdleMotion(state);
  const face = expressions[state];
  const girl = character === "girl";
  const ink = "#191b2a", skin = girl ? "#efa4b7" : "#dfa47c", shade = girl ? "#cf7897" : "#b97959";
  const highlight = girl ? "#ffcfce" : "#f8c9a3";
  const gaze = Math.max(-1, Math.min(1, face.look + pose.gaze));
  const working = state === "working", thinking = state === "thinking";
  const [handX, handY, parked] = working ? workFrames[pose.frame] : [24, 38, false] as const;
  const eyeY = 22 + (state === "reading" || (working && handY > 38 && !parked) ? 1 : 0);
  const jacket = girl ? "#679773" : "#537899";
  const headX = working || thinking ? 0 : pose.bob;
  const headY = thinking ? 1 : working && handY < 34 ? 0 : face.lift;
  const arm = sleeve(thinking ? 15 : Math.round(10 + (handX-10)*.25), thinking ? 49 : Math.min(50, handY + 15), handX - 2, handY + 4);
  return <svg viewBox="0 0 48 52" width={48} height={52} role="img" aria-label={`${girl ? "Girl" : "Guy"} agent, ${state}`} shapeRendering="crispEdges" style={{display:"block",width:size,maxWidth:"100%",height:"auto"}}>
    {/* Jacket, collar and neck stay anchored while the head shifts. */}
    <path fill={ink} d="M5 48v-3h3v-3h5v-2h6v-8h12v7h4v2h6v2h3v2h2v3z"/>
    <path fill={shade} d="M21 33h9v8h3v2h-5v2h-4v-2h-3z"/>
    <path fill={girl ? "#679773" : "#537899"} d="M7 48v-2h3v-3h6v-2h3v3h3v4z M32 48v-4h3v-2h4v2h4v4z"/>
    <path fill={girl ? "#b5ce86" : "#e6ad76"} d="M12 44h5v-2h2v2h-2v2h-5z M34 43h3v2h-3z"/>
    <path fill={jacket} d="M5 48h40v4H5z"/>
    <g transform={`translate(${headX} ${headY})`}>
      {girl && <path fill={ink} d="M8 18h29v7h3v5h2v6h-2v3h-4v1h-7v-5H18v4h-7v-2H7v-3H5v-5h2v-6h1z"/>}
      <path fill={ink} d="M13 11h19v2h5v4h2v13h-2v4h-3v3h-4v1H20v-2h-4v-3h-3v-4H9v-2H7v-6h2v-2h4z"/>
      <path fill={skin} d="M16 12h15v2h4v3h2v13h-2v3h-3v2h-3v1h-8v-2h-4v-3h-2v-5h-3v1h-2v-2H9v-4h4v2h2v-6h1z"/>
      <path fill={shade} d="M10 22h3v3h-1v-2h-2z M17 28h4v2h-4z M35 27h2v2h-2z M18 32h2v2h4v1h-3v-1h-3z"/>
      <path fill={highlight} d="M33 17h2v2h-2z M29 26h2v1h-2z"/>
      {girl ? <>
        <path fill={ink} d="M8 22v-9h2V9h3V6h5V4h10v1h5v2h3v3h2v5h-4v-2h-4v-3h-4v2h-3v3h-4v3h-4v4h-2v-3h-3v3z"/>
        <path fill="#47405c" d="M11 12h2v-3h4V7h5v1h-4v2h-4v3h-3z M30 7h3v2h2v2h-2V9h-3z M8 31h2v3h3v2h-4v-2H8z"/>
        <g transform={`translate(${pose.hair} 0)`}><path fill={ink} d="M16 13h6v3h-3v3h-2v4h-2v-6h1z M34 11h3v4h2v5h-2v-4h-3z"/><path fill="#91afcb" d="M18 13h3v1h-3z M34 12h2v1h-2z"/></g>
      </> : <>
        <path fill={ink} d="M9 20v-8h2V8h4V5h10V4h7v2h4v3h2v3h3v4h-3v1H25v-2h-4v2h-5v3h-3v-2h-2v2z"/>
        <path fill="#504149" d="M12 13v-3h4V8h5v1h-3v2h-3v2z M25 7h6v1h-6z"/>
        <g transform={`translate(${pose.hair} 0)`}><path fill={ink} d="M19 11h9v3h-3v3h-3v1h-2v-4h-2z"/><path fill="#927966" d="M20 11h5v1h-5z"/></g>
        <path fill="#996348" d="M18 31h1v1h-1z M20 33h1v1h-1z M23 34h1v1h-1z M31 33h1v1h-1z"/>
      </>}
      <path fill={girl ? "#69445b" : "#63463e"} d={brows[face.brow]}/>
      {[20,31].map(x => <g key={x} transform={`translate(${x} ${eyeY})`}>
        {pose.blink || state === "done" ? <path fill={ink} d="M0 1h1V0h3v1h1v1H4V1H1v1H0z"/> :
          <g transform={`translate(${gaze} 0)`}>
            <rect x="1" width="3" height={Math.max(2, face.eye+1)} fill={ink}/>
            <rect x="1" width="1" height="1" fill="#fff2d8"/>
          </g>}
      </g>)}
      <path fill={shade} d="M28 26h1v1h2v1h-3z"/>
      <path fill="#694454" d={mouths[face.mouth]}/>
      {working && parked && <Pencil x={10} y={25}/>}
    </g>
    {working && <g>
      <path fill="#947360" d="M4 48h22l4-2h15v6H4z"/>
      <path fill="#fff0cd" d="M5 49h22l3-2h13v4H5z"/>
      <path fill="#a5b3a0" d="M30 49h8v1h-8z"/>
    </g>}
    {(thinking || working) && <g>
      <path fill={ink} d={thinking ? "M7 48v-5h2v-3h4v-2h3v3h2v8z" : "M6 49v-5h2v-3h5v2h3v6z"}/>
      <path fill={jacket} d={thinking ? "M8 48v-4h2v-3h4v-1h1v4h2v4z" : "M7 48v-3h2v-3h3v2h3v4z"}/>
      <path d={arm} stroke={ink} strokeWidth="2"/><path d={arm} fill={jacket}/>
      {working && !parked && <Pencil x={handX} y={handY}/>}
      <g transform={`translate(${handX} ${handY})`}>
        <Hand kind={thinking ? "chin" : parked ? "relaxed" : "grip"} skin={skin} shade={shade} highlight={highlight}/>
      </g>
    </g>}
  </svg>;
}
