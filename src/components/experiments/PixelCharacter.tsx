import type { CSSProperties } from "react";

// Each digit is a palette index. Dots are transparent, including the background.
export const portraits = {
  crest: [
    "......00....", "....00001...", "...2000111..", "...3224111..",
    "..55443322..", "..76665553..", "..77665553..", "...7666665..",
    "...7666655..", "...766665...", "...76665....", "...7666.....",
  ],
  fringe: [
    "....23456...", ".112234567..", "..12234567..", ".1.2234567..",
    "...2234567..", "..12234567..", "...1234567..", "....234567..",
    "....234567..", "....23456...", "....2345....", "....234.....",
  ],
  slant: [
    ".....01234..", "....0012345.", "....0123456.", "....0123456.",
    "...00123456.", "...01234567.", "...01234567.", "....1234567.",
    "....1234567.", "....234567..", "....34567...", "....456.....",
  ],
  hood: [
    "....11111...", "...2111111..", "..22211111..", "..32222222..",
    ".333333222..", ".4333333333.", "55444444443.", "65555544445.",
    "66555555555.", ".766666666..", "..7766666...", "....777.....",
  ],
  crown: [
    "...1.3.5....", "..11233455..", "..12233455..", "..12233455..",
    ".1122334556.", ".1223334556.", ".1223444556.", "..22334455..",
    "..22334455..", "..23344455..", "..3344445...", "..3344......",
  ],
  wave: [
    "....765432..", "...67654321.", "..567765432.", "..455677654.",
    ".33445567765", ".22334455677", ".12223344556", ".01122233445",
    ".00111222334", "000001112223", "..00000011..", "...000......",
  ],
  tuft: [
    "....1.3.5...", "...11234455.", "..11223445..", "..112234455.",
    "...1223445..", "..112234455.", "..12233445..", "...2233445..",
    "...2234455..", "...233445...", "...33445....", "...334......",
  ],
  comet: [
    "....765432.2", "..7766543222", "...67765432.", "..567765432.",
    ".34556776543", "223455677654", "..233445567.", ".00223344556",
    "...01122334.", "..0.011222.3", "....000111..", "....000.....",
  ],
  antenna: [
    "....01234...", "....012345..", "...0012345..", "...0012345..",
    ".00001234567", "...0012345..", "..00012345..", "..00012345..",
    "...0012345..", "...0012345..", "...001234...", "...00123....",
  ],
} as const;

export type PixelShape = keyof typeof portraits;
export const palettes = {
  prism: ["#4136DC","#6660EA","#3D233A","#B87828","#FF7625","#FF4468","#E88DD6","#66C9C3"],
  meadow: ["#5245E9","#3321C4","#513547","#ECA741","#FA8E94","#44A8BB","#389A63","#86BE8E"],
  sorbet: ["#A7CFA5","#91C397","#79B49A","#93C9D8","#A9DAC6","#F7BFD4","#FFAE9B","#FFD29B"],
  citrus: ["#9ED5A6","#B7E79C","#D5EF77","#F4ED69","#FFD64D","#FFB339","#FD952F","#FFE4A2"],
  dusk: ["#FBC698","#FFAF61","#CE9036","#6A4829","#40283F","#51437D","#8077CE","#ACAAE8"],
  tide: ["#16824E","#138658","#039085","#078DC5","#0C9EB5","#69B5A9","#A1C7E3","#EAA3CF"],
} as const;
export type PixelPalette = keyof typeof palettes;
export const defaultPalettes: Record<PixelShape, PixelPalette> = {
  crest: "meadow", fringe: "sorbet", slant: "prism", hood: "dusk",
  crown: "citrus", wave: "prism", tuft: "citrus", comet: "prism", antenna: "tide",
};

type Props = {
  shape?: PixelShape;
  colors?: readonly string[];
  speed?: number;
  size?: number | string;
  label?: string;
};

export function PixelCharacter({ shape = "wave", colors, speed = 1, size = 192, label = "Pixel character" }: Props) {
  const palette = colors?.length ? colors : palettes[defaultPalettes[shape]];
  const rate = Number.isFinite(speed) ? Math.max(0, speed) : 1;
  const timing = {
    width: size, height: "auto", maxWidth: "100%", display: "block",
    "--pixel-beat": (4 / (rate || 1)) + "s",
    "--pixel-play": rate ? "running" : "paused",
  } as CSSProperties;
  return (
    <svg viewBox="-1 -1 14 14" style={timing} role="img" aria-label={label} shapeRendering="crispEdges">
      <style>{`
        .px-fringe, .px-eyes, .px-pupils { animation: var(--pixel-beat) steps(1,end) infinite; animation-play-state:var(--pixel-play); }
        .px-fringe { animation-name:px-twitch; }
        .px-eyes { animation-name:px-blink; transform-box:fill-box; transform-origin:center; }
        .px-pupils { animation-name:px-glance; }
        @keyframes px-twitch { 0%,40%,100% {transform:none} 32% {transform:translateY(-1px)} }
        @keyframes px-blink { 0%,71%,100% {transform:none} 68% {transform:scaleY(.18)} }
        @keyframes px-glance { 0%,58%,100% {transform:none} 24% {transform:translateX(1px)} }
        @media (prefers-reduced-motion:reduce) { .px-fringe,.px-eyes,.px-pupils {animation:none} }
      `}</style>
      {portraits[shape].map((row, y) => [...row].map((index, x) => {
        if (index === ".") return null;
        const tuft = y === 0 && (x % 3 === 0 || x % 3 === 1);
        return <rect key={y * 12 + x} className={tuft ? "px-fringe" : undefined}
          x={x} y={y} width="1" height={tuft ? 2 : 1} fill={palette[Number(index) % palette.length]}/>;
      }))}
      <g className="px-eyes" fill="#FFFDF5">
        <rect x="4" y="5" width="2" height="1"/><rect x="7" y="5" width="2" height="1"/>
        <g className="px-pupils" fill="#14131A">
          <rect x="4" y="5" width="1" height="1"/><rect x="7" y="5" width="1" height="1"/>
        </g>
      </g>
    </svg>
  );
}
