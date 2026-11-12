"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ArrowUpRight, Check, Code2, Copy, Globe, Grid2X2, Home, Layers2, Menu, Type, X } from "lucide-react";
import { motion, MotionConfig } from "motion/react";
import { Button } from "@/components/ui/button";
import { InkFusion } from "./experiments/InkFusion";
import { HalftoneSticker } from "./experiments/HalftoneSticker";
import { HalftoneVoiceBlob } from "./experiments/HalftoneVoiceBlob";
import { FrostedTileFooter } from "./experiments/FrostedTileFooter";
import { VoiceBlob } from "./experiments/VoiceBlob";
import { CardCascade } from "./experiments/CardCascade";
import { BlockType, IsoBlockType } from "./experiments/BlockType";
import { ProceduralTree, treeDesigns, type TreeDesign, type TreeSettings } from "./experiments/ProceduralTree";
import { LuminousSurface, lightFinishes, type LightFinish } from "./experiments/LuminousSurface";
import { MetalEmblem, emblemMarks, type EmblemMark } from "./experiments/MetalEmblem";
import { GlassBubble } from "./experiments/GlassBubble";
import { JellyAvatar } from "./experiments/JellyAvatar";
import { EmbossedBadge, badgeFinishes, type BadgeFinish } from "./experiments/EmbossedBadge";
import { MotionBadge, badgeKinds, type BadgeKind } from "./experiments/MotionBadge";
import { FolderSticker } from "./experiments/GradientObjects";
import { GradientFolder, folderColors, type FolderColor } from "./experiments/GradientFolder";
import { PocketSampler } from "./experiments/PocketSampler";
import { VoxelSticker, stickerNames, type StickerName } from "./experiments/VoxelSticker";
import { KawaiiFace } from "./experiments/KawaiiFace";
import { KawaiiControls, initialFace, kawaiiPrompt } from "./kawaii-kit";
import { PixelCharacter } from "./experiments/PixelCharacter";
import { PixelControls, defaultPixel, pixelPrompt } from "./pixel-settings";
import { DemoVideo } from "./demo-video";
import { RippleDemo, ripplePrompt, type RippleDemoMode } from "@/components/ripple-demo";
import type { Token } from "@/lib/highlight";

const MotionButton = motion.create(Button);
const buttonGestures = {
  whileHover: { y: -1 },
  whileTap: { y: 0, scale: 0.97 },
};

function KineticVideo({ fullSize = false }: { fullSize?: boolean }) {
  const base = fullSize ? "/kinetic-paragraph/preview-hd" : "/kinetic-paragraph/preview";
  return (
    <video autoPlay muted loop playsInline width={720} height={720}
      src={base + ".mp4"} poster={fullSize ? base + ".webp" : "/kinetic-paragraph/poster.webp"}
      aria-label="Kinetic paragraph animation" />
  );
}

function GlobeDemo({ fullSize = false }: { fullSize?: boolean }) {
  const base = "/motif-globe/preview" + (fullSize ? "-hd" : "");
  return <DemoVideo upperHemisphere={!fullSize} base={base} width={1440} height={1440} label="Rotating globe of morphing geometric marks"/>;
}

function RippleThumbnail() { return <RippleDemo mode="frame"/>; }

function PixelThumbnail() {
  return <PixelCharacter size={168}/>;
}


function KawaiiThumbnail() { return <KawaiiFace size={180} expression="pleased"/>; }

function StickerThumbnail() { return <VoxelSticker size={186}/>; }

function SkillExamples() {
  const tiles = [
    ["turntable", 3, 6, 24, 43], ["speaker", 32, 2, 14, 44],
    ["sampler", 50, 7, 25, 43], ["handheld", 80, 5, 16, 45],
    ["cassette", 9, 55, 21, 39], ["camera", 36, 50, 24, 47],
    ["keyboard", 65, 54, 29, 39],
  ] as const;
  return <figure aria-label="Axonometric icon collage" style={{position:"relative",width:"100%",height:"100%",minHeight:0,margin:0,containerType:"size"}}>
    {tiles.map(([name,x,y,w,h]) => <div key={name} style={{position:"absolute",left:x+"%",top:y+"%",width:w+"%",height:h+"%",display:"grid",placeItems:"center"}}>
      {name==="sampler" ? <div style={{width:"min(100%, 32cqh)"}}><PocketSampler size="100%"/></div> :
        <img src={`/skills/axonometric-icons/examples/${name}.svg`} alt={name} style={{width:"100%",height:"100%",objectFit:"contain"}}/>}
    </div>)}
  </figure>;
}
function GradientObjectsDemo() {
  return <div className="material-objects" style={{width:"94%",height:"96%",display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gridTemplateRows:"repeat(2,minmax(0,1fr))",justifyItems:"center",alignItems:"center",containerType:"size"}}>
    <FolderSticker kind="progress" size="min(96%, 48cqh)"/><FolderSticker kind="receipts" size="min(96%, 49cqh)"/>
    <FolderSticker kind="scripts" size="min(96%, 49cqh)"/><FolderSticker kind="files" size="min(96%, 49cqh)"/>
  </div>;
}
function BadgeSheet({choose}:{choose?:(kind:BadgeKind)=>void}) {
  return <div style={{display:"grid",gap:14,justifyItems:"start",gridTemplateColumns:choose?"1fr":"repeat(2,auto)"}}>
    {badgeKinds.map(kind=><MotionBadge key={kind} kind={kind} onClick={choose?()=>choose(kind):undefined}/>)}
  </div>;
}
function EmbossedSheet({choose}:{choose?:(finish:BadgeFinish)=>void}) {
  return <div style={{display:"grid",justifyItems:"center",gap:14}}>
    {badgeFinishes.map((finish,i)=><div key={finish} style={{transform:`rotate(${[4,-6,-2][i]}deg)`}}>
      <EmbossedBadge finish={finish} onClick={choose?()=>choose(finish):undefined}/>
    </div>)}
  </div>;
}
function JellyThumbnail() { return <JellyAvatar size={176}/>; }
function GlassConversation({compact=false}:{compact?:boolean}) {
  const [largeIndex,setLargeIndex] = useState(1);
  useEffect(() => { setLargeIndex(Math.floor(Math.random() * (compact ? 2 : 3))); }, [compact]);
  return <div style={{width:"86%",maxWidth:compact?290:440,display:"flex",flexDirection:"column",gap:compact?9:14,fontSize:compact?14:18}}>
    {(compact ? ["What are we making?", "A little light in glass."] : ["What are we making?", "A little light in glass.", "Let’s try it."]).map((message,i) =>
      <GlassBubble key={message} side={i%2 ? "outgoing" : "incoming"} >{message}{i===largeIndex && [" I was thinking of something that catches the afternoon light.", " See how the blue deepens near the middle?", " I’ll send you a preview once it’s ready."][i]}</GlassBubble>
    )}
  </div>;
}
function GlassThumbnail() { return <GlassConversation compact/>; }
function ChromeThumbnail() { return <MetalEmblem mark="Glacier I" size="84%"/>; }
function LightSheet({choose}:{choose?:(finish:LightFinish)=>void}) {
  return <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",width:"86%",maxWidth:450,gap:8,fontSize:choose?16:10,textAlign:"center"}}>
    {lightFinishes.map(finish=><LuminousSurface key={finish} finish={finish} style={{padding:0}}>
      {choose?<button style={{width:"100%",padding:"1.5em 0",textTransform:"capitalize"}} onClick={()=>choose(finish)}>{finish}</button>:<span style={{display:"block",padding:"1em",textTransform:"capitalize"}}>{finish}</span>}
    </LuminousSurface>)}
  </div>;
}
function TreeThumbnail() {return <ProceduralTree width={300} height={200} seed={19}/>;}
function InkStickerSheet() {
  return <div className="ink-sticker-sheet">{(["disc","arrow","spark","bow","vase","cube"] as const).map(shape=><HalftoneSticker key={shape} shape={shape}/>)}</div>;
}
function FusionSample({fullSize=false}: {fullSize?:boolean} = {}) {
  return <InkFusion className="fusion-sample" style={{width:fullSize?320:168,maxWidth:"100%",aspectRatio:"16 / 15",background:"#c9cec3"}} role="img" aria-label="Interactive ink dot pattern" tabIndex={0}/>;
}
const collection = [
  {title:"Ink Fusion",description:"Move the pointer across the print. Nearby dots draw together and fuse, then release as you pass.",slug:"ink-fusion",component:"InkFusion",icon:Layers2,preview:FusionSample},
  {title:"Parallax Ink Stickers",description:"Move across a sticker to slide its dot screen over the yellow print.",slug:"parallax-ink-stickers",component:"HalftoneSticker",icon:Layers2,preview:InkStickerSheet},
  {title:"Halftone Voice Blob",description:"Speech stirs the colored ink dots. Pause and they swirl into a spinning ring before drifting back.",slug:"halftone-voice-blob",component:"HalftoneVoiceBlob",icon:Layers2,preview:()=> <HalftoneVoiceBlob microphone={false} size={180}/>},
  {title:"Frosted Tile Footer",description:"A single wash of color passes through two rows of straight-edged glass tiles.",slug:"frosted-tile-footer",component:"FrostedTileFooter",icon:Layers2,preview:()=> <FrostedTileFooter/>},
  {title:"Voice Blob",description:"Pigments drift through a single blob. Louder syllables accelerate the color changes; vocal tone shifts the core. Enable the microphone to shape it with sound; audio stays in your browser.",slug:"voice-blob",component:"VoiceBlob",icon:Layers2,preview:()=> <VoiceBlob microphone={false} size={175}/>},
  {title:"Card Cascade",description:"Cards bounce across the felt, leaving a trail of frozen frames. Replay to clear the table.",slug:"card-cascade",component:"CardCascade",icon:Layers2,preview:()=> <CardCascade/>},
  {title:"Isometric Block Type",description:"Cube-built pieces tumble onto an isometric plane and assemble into your text.",slug:"isometric-block-type",component:"IsoBlockType",icon:Type,preview:()=> <IsoBlockType/>},
  {title:"Block Type",description:"Falling pieces turn and lock into letterforms. Change the text to build a new word.",slug:"block-type",component:"BlockType",icon:Type,preview:()=> <BlockType/>},
  {title:"Procedural Tree", description:"Angular stems grow from a single root. Change the dimensions, branching depth, or seed to grow another tree.",slug:"procedural-tree",component:"ProceduralTree",icon:Layers2,preview:TreeThumbnail},
  {title:"Luminous Surfaces", description:"A frosted rim surrounds a pool of color. Move across a surface to shift its light, or select a finish to copy it.",slug:"luminous-surfaces",component:"LuminousSurface",icon:Layers2,preview:LightSheet},
  {title:"Chrome Emblems", description:"Six marks from the HVNTER 2020 specimen sheet, finished with mirrored bands and polished bevels.", slug:"chrome-emblems", component:"MetalEmblem", icon:Layers2, preview:ChromeThumbnail},
  {title:"Glass Bubbles", description:"Frosted edges catch the light around a pool of blue. The corner turns toward the sender as the message grows.", slug:"glass-bubbles", component:"GlassBubble", icon:Layers2, preview:GlassThumbnail},
  {title:"Jelly Avatar", description:"A translucent avatar flows from a blue scallop to a pink ripple and a mint clover. Its color moves with its silhouette.", slug:"jelly-avatar",component:"JellyAvatar",icon:Layers2,preview:JellyThumbnail},
  {title:"Embossed Badges", description:"Three softly beveled labels with engraved marks. Select a finish to copy its usage.", slug:"embossed-badges", component:"EmbossedBadge", icon:Layers2, preview:EmbossedSheet},
  {title:"Motion Badges", description:"Six pastel badges with a gesture for each icon. Select a badge to use it in your prompt.", slug:"motion-badges", component:"MotionBadge", icon:Layers2, preview:BadgeSheet},
  {title:"Gradient Stickers", description:"Four folder stickers for projects, receipts, scripts, and documents. Hover to peek inside, or tap to pin one open.", slug:"gradient-objects", component:"SKILL", icon:Layers2, preview:GradientObjectsDemo},
  {title:"Gradient Folder", description:"Hover to fan the pages, or click to pin the folder open.", slug:"gradient-folder", component:"GradientFolder", icon:Layers2, preview:() => <GradientFolder size={195}/>},
  {title:"Axonometric Icons", description:"A reusable skill for drawing isometric and dimetric SVG objects. Copy the instructions into your agent, then describe the object you want.", slug:"axonometric-icons", component:"SKILL", icon:Layers2, preview:SkillExamples},
  {title:"Voxel Stickers", description:"Ten miniature objects built from colored blocks. Pick a sticker to see its raised details and copy its source.", slug:"voxel-stickers", component:"VoxelSticker", icon:Layers2, preview:StickerThumbnail},
  { title: "Kawaii Face Kit", description: "A blushing face for a conversation. Pick an expression, then mix the eyes, mouth, and cheek color.", slug: "kawaii-face-kit", component: "KawaiiFace", icon: Grid2X2, preview: KawaiiThumbnail },
  { title: "Pixel Character", description: "A little portrait built from colored squares. It glances to one side, tilts its head, and bobs back into place.", slug: "pixel-character", component: "PixelCharacter", icon: Grid2X2, preview: PixelThumbnail },
  { title: "Motif Globe", description: "Continents turn across a field of shifting geometric marks. A band of teal, gold, and coral travels over the surface as the globe rotates.", slug: "motif-globe", component: "MotifGlobe", icon: Globe, preview: GlobeDemo },
  { title: "Image Ripple Loader", description: "A grid of tiny marks lights up in passing waves. Watch the rings travel outward in a disc, or follow a band of color across the full frame.", slug: "image-ripple-loader", component: "ImageRippleLoader", icon: Layers2, preview: RippleThumbnail },
  { title: "Kinetic paragraph", description: "A single word opens into a paragraph. Colored highlights mark the rhythm as the words move across the page.", slug: "kinetic-paragraph", component: "KineticParagraph", icon: Type, preview: KineticVideo },
];

function subscribe(listener: () => void) {
  window.addEventListener("hashchange", listener);
  return () => window.removeEventListener("hashchange", listener);
}
const snapshot = () => window.location.hash === "#agent-portrait" ? "kawaii-face-kit" : window.location.hash === "#frosted-tile-button" ? "frosted-tile-footer" : window.location.hash.slice(1);
const home = () => "";

function Detail({ index, source, lines, composition }: { composition: string; index: number; source: string; lines: Token[][] }) {
  const item = collection[index];
  const Preview = item.preview;
  const isFolder = item.slug === "gradient-folder";
  const [folderColor,setFolderColor] = useState<FolderColor>("persimmon");
  const isoBlock = item.slug === "isometric-block-type";
  const isFrost = item.slug === "frosted-tile-footer";
  const [tileLabel,setTileLabel]=useState("Bloom");
  const [tileColors,setTileColors]=useState<[string,string,string]>(["#287940","#65db13","#d4ee16"]);
  const isVoice = item.slug === "voice-blob";
  const isCascade = item.slug === "card-cascade";
  const [paused,setPaused]=useState(false);
  const [deal,setDeal]=useState(0);
  const isBlock = isoBlock || item.slug === "block-type";
  const TextDemo = isoBlock ? IsoBlockType : BlockType;
  const [word,setWord]=useState("Hype");
  const [draftWord,setDraftWord]=useState("Hype");
  useEffect(() => {
    if (draftWord === word) return;
    const timer = window.setTimeout(() => setWord(draftWord), 300);
    return () => window.clearTimeout(timer);
  }, [draftWord, word]);
  const [drop,replayDrop]=useState(0);
  const isTree = item.slug === "procedural-tree";
  const [design,setDesign]=useState<TreeDesign>("Original");
  const [tree,setTree] = useState<TreeSettings>({width:460,height:380,depth:3,seed:19});
  useEffect(()=>{if(isTree)setTree(t=>({...t,seed:Math.floor(Math.random()*1000)}));},[isTree]);
  const [growth,regrow] = useState(0);
  const isLight = item.slug === "luminous-surfaces";
  const [light,setLight] = useState<LightFinish>("bloom");
  const isChrome = item.slug === "chrome-emblems";
  const [mark,setMark] = useState<EmblemMark>("Glacier I");
  const isGlass = item.slug === "glass-bubbles";
  const isJelly = item.slug === "jelly-avatar";
  const isEmbossed = item.slug === "embossed-badges";
  const [finish,setFinish] = useState<BadgeFinish>("branding");
  const isBadge = item.slug === "motion-badges";
  const [badge,setBadge] = useState<BadgeKind>("Digital");
  const isGradientSkill = item.slug === "gradient-objects";
  const isSkill = isGradientSkill || item.slug === "axonometric-icons";
  const isVoxel = item.slug === "voxel-stickers";
  const [sticker,setSticker] = useState<StickerName>("Globe");
  const isKawaii = item.slug === "kawaii-face-kit";
  const [face, setFace] = useState(initialFace);
  const isPixel = item.slug === "pixel-character";
  const [pixel, setPixel] = useState(defaultPixel);
  const isGlobe = item.slug === "motif-globe";
  const isRipple = item.slug === "image-ripple-loader";
  const [mode, setMode] = useState<RippleDemoMode>("disc");
  const [feedback, setFeedback] = useState("");
  const [manual, setManual] = useState("");
  const copyTimer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(copyTimer.current), []);

  async function copy(kind: "code" | "prompt") {
    const text = kind === "code" ? source : item.slug === "ink-fusion" ? ["Use the supplied InkFusion wrapper around your component. Give the wrapper dimensions or let its children size it. Set ink to customize the dot color. Keep the decorative layer behind content; transparent surfaces reveal it. Retain hover, focus and reduced-motion behavior.", "```tsx", source, "```"].join("\n\n") : item.slug === "parallax-ink-stickers" ? ["Use the supplied HalftoneSticker React component inside a sized container. Choose spark, disc, cube, bow, arrow or vase with the shape prop. Set base and ink colors as needed. Preserve pointer parallax on the ink layer and reduced-motion support.", "```tsx", source, "```"].join("\n\n") : item.slug === "halftone-voice-blob" ? ["Render the supplied HalftoneVoiceBlob with opt-in microphone input. Set microphone={false} for an ambient thumbnail. Preserve local voice analysis and microphone cleanup.", "```tsx", source, "```"].join("\n\n") : isFrost ? [
      `Integrate the supplied FrostedTileFooter. Render <FrostedTileFooter label={${JSON.stringify(tileLabel)}} colors={${JSON.stringify(tileColors)}} /> at the bottom of the page. Pass footer links or secondary content as children if needed.`, "```tsx", source, "```",
    ].join("\n\n") : isVoice ? [
      "Use the named VoiceBlob client component below. Render <VoiceBlob /> to offer opt-in microphone input, or <VoiceBlob microphone={false}/> for an ambient preview. Keep processing local, handle denied permission, and release the stream on stop or unmount.", "```tsx", source, "```",
    ].join("\n\n") : isCascade ? [
      "Use the supplied CardCascade React canvas component in a client boundary. Render <CardCascade/>. Toggle paused to pause or resume and increment replay to clear the trails. Preserve the reduced-motion still and offscreen pause.", "```tsx", source, "```",
    ].join("\n\n") : isBlock ? [
      `Integrate the named ${item.component} React component in a client boundary. Render <${item.component} text={${JSON.stringify(word)}} />. Increment its replay prop to restart the drop. Keep the reduced-motion still and accessible text label.`, "```tsx", source, "```",
    ].join("\n\n") : isTree ? [
      `Use the named ProceduralTree export in a React project. Render <ProceduralTree design="${design}" width={${tree.width}} height={${tree.height}} depth={${tree.depth}} seed={${tree.seed}} />. Keep seeded geometry, parent-before-child animation and reduced-motion behavior. In Next.js import from a client boundary.`,
      "```tsx", source, "```",
    ].join("\n\n") : isLight ? [
      `Use the named LuminousSurface React export in a client boundary. Wrap your content with <LuminousSurface finish="${light}">…</LuminousSurface>. Preserve the frosted rim, pointer lighting, focus feedback, and reduced-motion fallback.`, "```tsx", source, "```",
    ].join("\n\n") : isChrome ? [
      `Use the supplied MetalEmblem React SVG component with mark="${mark}". Preserve its cutouts, layered extrusion, chrome reflections, and reduced-motion handling. The source artwork is credited to HVNTER 2020.`,
      "```tsx", source, "```",
    ].join("\n\n") : isGlass ? [
      'Use the supplied GlassBubble React component in a column flex container. Render <GlassBubble side="incoming">Incoming message</GlassBubble> or <GlassBubble side="outgoing">Outgoing message</GlassBubble>. Preserve its layered radial gradients, shaded rim, readable text, and responsive wrapping. It requires only React.',
      "```tsx", source, "```",
    ].join("\n\n") : isJelly ? [
      'Save the complete source as JellyAvatar.tsx and import its named JellyAvatar export. Render <JellyAvatar size={240} cycleSeconds={12} />. Keep the shape and color tracks synchronized, scoped SVG definitions, and reduced-motion fallback. Set animated={false} for a static avatar.',
      "```tsx", source, "```",
    ].join("\n\n") : isEmbossed ? [
      `Use the complete EmbossedBadge React component with motion/react. Render <EmbossedBadge finish="${finish}" />. Preserve its matching face, bevel, engraved text and icon treatments. Use label for custom copy and onClick for an interactive badge.`, "```tsx", source, "```",
    ].join("\n\n") : isBadge ? [
      `Integrate the named MotionBadge React export below using motion/react. Render <MotionBadge kind="${badge}" />. Pass label to customize the text or onClick for an actionable badge. Preserve reduced-motion support.`,
      "```tsx", source, "```",
    ].join("\n\n") : isFolder ? [
      `Integrate the supplied GradientFolder named React export with motion/react from the motion package. Use a client boundary. Render <GradientFolder color="${folderColor}" label="Field notes" />. Preserve its layered gradients, staggered springs, keyboard focus and touch interaction, and reduced-motion handling.`,
      "GradientFolder.tsx (complete source):", "```tsx", source, "```",
    ].join("\n\n") : isGradientSkill ? "Use this skill to design a gradient object. Ask which object and palette if unspecified.\n\n" + source : isSkill ? "Create an isometric or dimetric SVG icon using the skill below. If I have not named the object yet, ask which object to draw.\n\n" + source : isVoxel ? [
      "Use the named React export VoxelSticker from the complete source below. Preserve its transparent background, block geometry, and shading. It needs React only.",
      `Save as VoxelSticker.tsx, import { VoxelSticker } from "./VoxelSticker", and render <VoxelSticker name="${sticker}" size={240} />.`,
      "```tsx", source, "```",
    ].join("\n\n") : isKawaii ? kawaiiPrompt(face, source) : isGlobe ? [
      "Integrate the named React export MotifGlobe using the complete component below. Save it as MotifGlobe.tsx in a client boundary. It imports three, including when using its software renderer. Use the project's package manager to provide three and matching TypeScript declarations if needed.",
      "Mount the globe in a responsive square. Preserve the built-in geographic mask, reduced-motion still, offscreen pause, and cleanup. Leave phase unset for animation; choose a fixed phase in [0,1) only for a still. Use a descriptive label for meaningful content or decorative for a purely decorative placement.",
      'Example usage:\n```tsx\nimport { MotifGlobe } from "./MotifGlobe";\n\nexport function Preview() {\n  return <MotifGlobe aspectRatio={1} period={5} renderer="software" background="#0B1011" colors={["#5EA79D", "#EFD38E", "#FFB49F"]} outline="#75928A" idleColor="#1E302F" label="Rotating motif globe" />;\n}\n```',
      "MotifGlobe.tsx (complete source):", "```tsx", source, "```",
    ].join("\n\n") : isRipple ? ripplePrompt(mode, source) : [
      "Use the named export KineticParagraph from the full component below in a Remotion composition. Keep its existing animation. Return ready-to-use TSX for the composition.",
      "The example uses an original paragraph beginning with a word that stands alone. Pass it through text. Set background for the canvas, ink for text and outlines, and blue and yellow for the two highlights. Keep these prop names. If adapting the palette, keep ink legible on all three surfaces.",
      "Use one complete 5.6-second cycle with durationInFrames={Math.round(fps * durationSeconds)}. Register the composition in the project's Remotion root.",
      "Root.tsx (complete example):", "```tsx", composition, "```",
      "KineticParagraph.tsx (complete source):", "```tsx", source, "```",
    ].join("\n\n");
    try {
      await navigator.clipboard.writeText(text);
      window.clearTimeout(copyTimer.current);
      setFeedback(kind);
      copyTimer.current = window.setTimeout(() => setFeedback(""), 1000);
      setManual("");
    } catch {
      setFeedback("");
      setManual(text);
    }
  }
  return <>
    <header className="detail-head">
      <h1>{item.title}</h1>
      <MotionButton {...buttonGestures} className="prompt-action" onClick={() => copy("prompt")}>{feedback === "prompt" ? <Check/> : <Copy/>}{feedback === "prompt" ? "Prompt copied" : "Copy prompt"}</MotionButton>
    </header>
    <p className="component-description">{item.description}</p>
    {isRipple && <div className="demo-modes" role="group" aria-label="Preview style">
      {(["disc", "frame"] as const).map(value => <MotionButton {...buttonGestures} variant="outline" key={value} aria-pressed={mode === value} onClick={() => setMode(value)}>{value === "disc" ? "Disc ripple" : "Full-frame sweep"}</MotionButton>)}
    </div>}
    <section data-mode={isRipple ? mode : undefined} className={'stage art-' + item.slug} aria-label={item.title + " preview"}>
      {item.slug === "halftone-voice-blob" ? <HalftoneVoiceBlob size="min(64vw, 260px)"/> : isFrost ? <FrostedTileFooter label={tileLabel} colors={tileColors}/> : isVoice ? <VoiceBlob size="min(63vw, 280px)"/> : isCascade ? <CardCascade paused={paused} replay={deal}/> : isBlock ? <TextDemo text={word} replay={drop}/> : isTree ? <ProceduralTree key={growth} design={design} {...tree}/> : isLight ? <LightSheet choose={setLight}/> : isChrome ? <MetalEmblem mark={mark} size="84%"/> : isGlass ? <GlassConversation/> : isJelly ? <JellyAvatar size="min(85%, 360px)"/> : isEmbossed ? <EmbossedSheet choose={setFinish}/> : isBadge ? <BadgeSheet choose={setBadge}/> : isFolder ? <GradientFolder color={folderColor} size="min(85%, 360px)"/> : isGradientSkill ? <GradientObjectsDemo/> : isSkill ? <SkillExamples/> : isVoxel ? <VoxelSticker name={sticker} size="min(80%, 340px)"/> : isKawaii ? <KawaiiFace expression={face.expression} eyes={face.eyes || undefined} mouth={face.mouth || undefined} blush={face.blush} size="min(78%, 320px)"/> : isPixel ? <PixelCharacter {...pixel} size="min(75%, 336px)"/> : isRipple ? <RippleDemo mode={mode} fullSize/> : <Preview fullSize/>}
    </section>
    {isFrost && <div className="pixel-controls">
      <label>Footer text<input value={tileLabel} maxLength={48} placeholder="Bloom" onChange={e=>setTileLabel(e.target.value)}/></label>
      {["Base","Midtone","Highlight"].map((name,i)=><label key={name}>{name}<input type="color" value={tileColors[i]} onChange={e=>{
        const next: typeof tileColors=[...tileColors]; next[i]=e.target.value; setTileColors(next);
      }}/></label>)}
    </div>}
    {isCascade && <div className="demo-modes" style={{marginTop:14}}><Button variant="outline" onClick={()=>setPaused(p=>!p)}>{paused?"Resume":"Pause"}</Button><Button variant="outline" onClick={()=>{setPaused(false);setDeal(n=>n+1)}}>Replay cascade</Button></div>}
    {isBlock && <div className="pixel-controls"><label>Text<input maxLength={24} value={draftWord} onChange={e=>setDraftWord(e.target.value)} style={{border:"1px solid var(--edge)",borderRadius:6,padding:"6px 10px",color:"var(--foreground)"}}/></label><Button variant="outline" onClick={()=>{setWord(draftWord); replayDrop(n=>n+1)}}>Replay drop</Button></div>}
    {isTree && <div className="pixel-controls">
      <label>Design<select value={design} onChange={e=>setDesign(e.target.value as TreeDesign)}>{treeDesigns.map(d=><option key={d}>{d}</option>)}</select></label>
      {(["width","height","depth","seed"] as const).map(k=><label key={k}>{k[0].toUpperCase()+k.slice(1)} · {tree[k]}<input type="range" min={k==="seed"?0:k==="depth"?1:160} max={k==="depth"?5:k==="seed"?999:800} step={k==="width"||k==="height"?10:1} value={tree[k]} onChange={e=>setTree({...tree,[k]:Number(e.target.value)})}/></label>)}
      <Button variant="outline" onClick={()=>setTree(t=>({...t,seed:(t.seed+1+Math.floor(Math.random()*999))%1000}))}>New tree</Button>
      <Button variant="outline" onClick={()=>regrow(n=>n+1)}>Replay growth</Button>
    </div>}
    {isLight && <p role="status" style={{marginTop:12}}>Selected finish: {light}</p>}
    {isChrome && <div className="pixel-controls"><label>Mark<select value={mark} onChange={e=>setMark(e.target.value as EmblemMark)}>{emblemMarks.map(name=><option key={name}>{name}</option>)}</select></label></div>}
    {isEmbossed && <p role="status" style={{marginTop:12,color:"var(--quiet)",fontSize:13}}>Selected finish: {finish}</p>}
    {isBadge && <p role="status" style={{marginTop:12,color:"var(--quiet)",fontSize:13}}>Selected badge: {badge}</p>}
    {isFolder && <div className="demo-modes" style={{marginTop:14}} role="group" aria-label="Folder palette">{(Object.keys(folderColors) as FolderColor[]).map(color=><Button key={color} variant="outline" aria-pressed={folderColor===color} onClick={()=>setFolderColor(color)}>{color[0].toUpperCase()+color.slice(1)}</Button>)}</div>}
    {isVoxel && <div className="face-sheet" role="group" aria-label="Sticker designs">{stickerNames.map(name =>
      <button key={name} aria-label={name} aria-pressed={name===sticker} onClick={()=>setSticker(name)}><span aria-hidden="true"><VoxelSticker name={name} size={56}/></span>{name}</button>
    )}</div>}
    {isKawaii && <KawaiiControls value={face} change={setFace}/>}
    {isPixel && <PixelControls value={pixel} change={setPixel}/>}
    {isSkill && <div style={{paddingTop:20,marginBottom:-22,paddingBottom:20}}><a className="skill-download" style={{display:"inline-flex",alignItems:"center",padding:"8px 0",margin:0}} href={`/skills/${item.slug}.zip`} download>Download skill and {isGradientSkill ? "components" : "SVG examples"} ↓</a></div>}
    <section className="editor" aria-label="Component source">
      <header><span><Code2/>{item.component}.{isSkill ? "md" : "tsx"}</span><motion.button {...buttonGestures} onClick={() => copy("code")}>{feedback === "code" ? <Check/> : <Copy/>}{feedback === "code" ? "Copied" : isSkill ? "Copy skill" : "Copy code"}</motion.button></header>
      <pre tabIndex={0} aria-label="Scrollable source code"><code>{lines.map((tokens, i) => <span className="line" key={i}><i aria-hidden="true">{i + 1}</i><span>{tokens.map((token, j) => <span key={j} className={'tok-' + token.kind}>{token.text}</span>)}{'\n'}</span></span>)}</code></pre>
    </section>
    {manual && <label className="manual">Select and copy the text<textarea autoFocus readOnly value={manual} onFocus={e => e.target.select()}/></label>}
    <span className="sr-only" role="status">{feedback && feedback + " copied"}</span>
  </>;
}

export function Showcase({ sources, highlighted, composition }: { composition: string; sources: string[]; highlighted: Token[][][] }) {
  const slug = useSyncExternalStore(subscribe, snapshot, home);
  const index = collection.findIndex(item => item.slug === slug);
  const [open, setOpen] = useState(false);
  return <MotionConfig reducedMotion="user" transition={{ type: "spring", stiffness: 460, damping: 32 }}>
    <div className="library">
    <aside className={open ? "rail open" : "rail"}>
      <div className="rail-head"><motion.a whileHover={{ rotate: -2, scale: 1.035 }} whileTap={{ rotate: 0, scale: 0.97 }} className="wordmark" href="#home" onClick={() => setOpen(false)}>hype</motion.a>
        <motion.button {...buttonGestures} className="menu-toggle" aria-expanded={open} aria-label="Component navigation" onClick={() => setOpen(!open)}>{open ? <X/> : <Menu/>}</motion.button>
      </div>
      <nav aria-label="Directory navigation" onClick={() => setOpen(false)}>
        <a href="#home" aria-current={index === -1 ? "page" : undefined}><Home/>Home</a>
        <h2>Components</h2>
        {collection.map((item, i) => <a key={item.slug} href={'#' + item.slug} aria-current={index === i ? "page" : undefined}><item.icon/>{item.title}</a>)}
      </nav>
    </aside>
    <main className="canvas" key={slug}>
      {index < 0 ? <>
        <header className="directory-intro">
          <p>Hype is an open-source directory of small experiments in motion and interaction. Try a piece, take its code, or copy a prompt for your coding agent.</p>
        </header>
        <div className="gallery">{collection.map(item => <article className={'tile art-' + item.slug} key={item.slug}>
          <div className="mini" inert aria-hidden="true"><item.preview/></div>
          <a href={'#' + item.slug}>{item.title}<ArrowUpRight/></a>
        </article>)}</div>
      </> : <Detail composition={composition} index={index} source={sources[index]} lines={highlighted[index]}/>}
    </main>
    </div>
  </MotionConfig>;
}
