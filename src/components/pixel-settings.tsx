import { defaultPalettes, palettes, portraits, type PixelShape, type PixelPalette } from "./experiments/PixelCharacter";

export const defaultPixel = { shape: "wave" as PixelShape, colors: [...palettes.prism] as string[], speed: 1 };
export type PixelSettings = typeof defaultPixel;

export function PixelControls({ value, change }: { value: PixelSettings; change: (next: PixelSettings) => void }) {
  const preset = Object.entries(palettes).find(([, colors]) => colors.join() === value.colors.join())?.[0] ?? "custom";
  return <div className="pixel-controls">
    <label>Shape<select value={value.shape} onChange={event => {
      const shape = event.target.value as PixelShape;
      change({ ...value, shape, colors: [...palettes[defaultPalettes[shape]]] });
    }}>{Object.keys(portraits).map(shape => <option key={shape}>{shape}</option>)}</select></label>
    <label>Palette<select value={preset} onChange={event => change({ ...value, colors: [...palettes[event.target.value as PixelPalette]] })}>
      {Object.keys(palettes).map(name => <option key={name}>{name}</option>)}{preset === "custom" && <option value="custom">Custom</option>}
    </select></label>
    <fieldset><legend>Colors</legend><div>{value.colors.map((color, i) => <input key={i} type="color" value={color} aria-label={`Palette color ${i + 1}`}
      onChange={event => change({ ...value, colors: value.colors.map((old, n) => i === n ? event.target.value : old) })}/>)}</div></fieldset>
    <label>Speed · {value.speed}×<input type="range" min="0" max="3" step=".25" value={value.speed} onChange={event => change({ ...value, speed: Number(event.target.value) })}/></label>
  </div>;
}

export function pixelPrompt(settings: PixelSettings, source: string) {
  return [
    "Integrate the named React export PixelCharacter from the complete TSX below. Save it as PixelCharacter.tsx. Keep its crisp pixel grid, stepped hair and eye movements, and reduced-motion support. It needs React only.",
    'Selected usage:\n```tsx\nimport { PixelCharacter } from "./PixelCharacter";\n\nexport function Avatar() {\n  return <PixelCharacter shape="' + settings.shape + '" colors={' + JSON.stringify(settings.colors) + '} speed={' + settings.speed + '} size={192} />;\n}\n```',
    "PixelCharacter.tsx (complete source):\n```tsx\n" + source + "\n```",
  ].join("\n\n");
}
