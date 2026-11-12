import { readFile } from "node:fs/promises";
import path from "node:path";
import { Showcase } from "@/components/showcase";

import { highlight } from "@/lib/highlight";

export default async function Home() {
  "use cache";
  const directory = path.join(process.cwd(), "public/kinetic-paragraph");
  const [component, composition] = await Promise.all(
    ["KineticParagraph.tsx", "Root.tsx"].map(file => readFile(path.join(directory, file), "utf8"))
  );
  const [drift, cutInk, spectrum, magnetic, afterglow, dottedButterfly, butterfly, meadow, paper, momentum, fusion, stickers, halftone, frost, voice, cascade, blockType, tree, light, chrome, glass, jelly, embossed, badge, gradientSkill, folder, skill, voxel, kawaii, pixel, globe, ripple] = await Promise.all([
    readFile(path.join(process.cwd(), "src/components/experiments/PrismDrift.tsx"), "utf8"),
    readFile(path.join(process.cwd(), "src/components/experiments/CutInkFooter.tsx"), "utf8"),
    readFile(path.join(process.cwd(), "src/components/experiments/SpectrumType.tsx"), "utf8"),
    readFile(path.join(process.cwd(), "src/components/experiments/MagneticSticker.tsx"), "utf8"),
    readFile(path.join(process.cwd(), "src/components/experiments/AfterglowFooter.tsx"), "utf8"),
    readFile(path.join(process.cwd(), "src/components/experiments/HalftoneButterfly.tsx"), "utf8"),
    readFile(path.join(process.cwd(), "src/components/experiments/ButterflyMeadow.tsx"), "utf8"),
    readFile(path.join(process.cwd(), "src/components/experiments/MeadowFooter.tsx"), "utf8"),
    readFile(path.join(process.cwd(), "src/components/experiments/PaperNoticeboard.tsx"), "utf8"),
    readFile(path.join(process.cwd(), "src/components/experiments/MomentumLoader.tsx"), "utf8"),
    readFile(path.join(process.cwd(), "src/components/experiments/InkFusion.tsx"), "utf8"),
    readFile(path.join(process.cwd(), "src/components/experiments/HalftoneSticker.tsx"), "utf8"),
    readFile(path.join(process.cwd(), "src/components/experiments/HalftoneVoiceBlob.tsx"), "utf8"),
    readFile(path.join(process.cwd(), "src/components/experiments/FrostedTileFooter.tsx"), "utf8"),
    readFile(path.join(process.cwd(), "src/components/experiments/VoiceBlob.tsx"), "utf8"),
    readFile(path.join(process.cwd(), "src/components/experiments/CardCascade.tsx"), "utf8"),
    readFile(path.join(process.cwd(), "src/components/experiments/BlockType.tsx"), "utf8"),
    readFile(path.join(process.cwd(), "src/components/experiments/ProceduralTree.tsx"), "utf8"),
    readFile(path.join(process.cwd(), "src/components/experiments/LuminousSurface.tsx"), "utf8"),
    readFile(path.join(process.cwd(), "src/components/experiments/MetalEmblem.tsx"), "utf8"),
    readFile(path.join(process.cwd(), "src/components/experiments/GlassBubble.tsx"), "utf8"),
    readFile(path.join(process.cwd(), "src/components/experiments/JellyAvatar.tsx"), "utf8"),
    readFile(path.join(process.cwd(), "src/components/experiments/EmbossedBadge.tsx"), "utf8"),
    readFile(path.join(process.cwd(), "src/components/experiments/MotionBadge.tsx"), "utf8"),
    readFile(path.join(process.cwd(), "public/skills/gradient-objects/SKILL.md"), "utf8"),
    readFile(path.join(process.cwd(), "src/components/experiments/GradientFolder.tsx"), "utf8"),
    readFile(path.join(process.cwd(), "public/skills/axonometric-icons/SKILL.md"), "utf8"),
    readFile(path.join(process.cwd(), "src/components/experiments/VoxelSticker.tsx"), "utf8"),
    readFile(path.join(process.cwd(), "src/components/experiments/KawaiiFace.tsx"), "utf8"),
    readFile(path.join(process.cwd(), "src/components/experiments/PixelCharacter.tsx"), "utf8"),
    readFile(path.join(process.cwd(), "public/motif-globe/MotifGlobe.tsx"), "utf8"),
    readFile(path.join(process.cwd(), "src/components/experiments/ImageRippleLoader.tsx"), "utf8"),
  ]);
  const sources = [drift, cutInk, spectrum, magnetic, afterglow, dottedButterfly, butterfly, meadow, paper, momentum, fusion, stickers, halftone, frost, voice, cascade, blockType, blockType, tree, light, chrome, glass, jelly, embossed, badge, gradientSkill, folder, skill, voxel, kawaii, pixel, globe, ripple, component];
  return <Showcase composition={composition} sources={sources} highlighted={sources.map((source, i) => i === 25 || i === 27 ? source.split("\n").map(text => [{ text, kind: "plain" }]) : highlight(source))} />;
}
