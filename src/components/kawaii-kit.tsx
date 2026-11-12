import { KawaiiFace, kawaiiExpressions, type KawaiiExpression, type EyeStyle, type MouthStyle } from "./experiments/KawaiiFace";

export const initialFace = { expression: "happy" as KawaiiExpression, eyes: "" as EyeStyle|"", mouth: "" as MouthStyle|"", blush: "#f19bb1" };
export type FaceSettings = typeof initialFace;
const names = Object.keys(kawaiiExpressions) as KawaiiExpression[];
const eyeStyles = Array.from(new Set(names.map(name => kawaiiExpressions[name][0])));
const mouthStyles = Array.from(new Set(names.map(name => kawaiiExpressions[name][1])));

export function KawaiiControls({value,change}:{value:FaceSettings;change:(value:FaceSettings)=>void}) {
  return <>
    <div className="pixel-controls">
      <label>Eyes<select value={value.eyes} onChange={e=>change({...value,eyes:e.target.value as FaceSettings["eyes"]})}><option value="">Expression default</option>{eyeStyles.map(s=><option key={s}>{s}</option>)}</select></label>
      <label>Mouth<select value={value.mouth} onChange={e=>change({...value,mouth:e.target.value as FaceSettings["mouth"]})}><option value="">Expression default</option>{mouthStyles.map(s=><option key={s}>{s}</option>)}</select></label>
      <label>Blush<input type="color" value={value.blush} onChange={e=>change({...value,blush:e.target.value})}/></label>
    </div>
    <div role="group" aria-label="Expression presets" className="face-sheet">{names.map(name=>
      <button key={name} aria-label={name} aria-pressed={value.expression===name} onClick={()=>change({...value,expression:name,eyes:"",mouth:""})}>
        <span aria-hidden="true"><KawaiiFace expression={name} size={58} animated={false} blush={value.blush}/></span>{name}
      </button>
    )}</div>
  </>;
}

export function kawaiiPrompt(value:FaceSettings,source:string) {
  const props={expression:value.expression, ...(value.eyes && {eyes:value.eyes}), ...(value.mouth && {mouth:value.mouth}), blush:value.blush};
  return [
    "Integrate the named React export KawaiiFace from the complete source below. Use the selected settings as the initial expression. Map conversational events to expressions: calm while listening, pensive while composing, curious for a follow-up question, concerned for a recoverable error, and pleased when finished. Use explicit events from the application. Preserve reduced-motion support.",
    "The preset composes eyes, mouth, brows, accent and blush. Override individual features when needed. Optional SVG children use a 100 × 88 coordinate system.",
    'Selected usage:\n```tsx\nimport { KawaiiFace } from "./KawaiiFace";\n\nexport function Avatar() {\n  return <KawaiiFace '+Object.entries(props).map(([key,v])=>key+'='+JSON.stringify(v)).join(' ')+' />;\n}\n```',
    "KawaiiFace.tsx (complete source):\n```tsx\n"+source+"\n```",
  ].join("\n\n");
}
