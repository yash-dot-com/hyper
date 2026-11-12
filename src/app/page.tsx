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
  const [sampler, voxel, kawaii, pixel, globe, ripple] = await Promise.all([
    readFile(path.join(process.cwd(), "src/components/experiments/PocketSampler.tsx"), "utf8"),
    readFile(path.join(process.cwd(), "src/components/experiments/VoxelSticker.tsx"), "utf8"),
    readFile(path.join(process.cwd(), "src/components/experiments/KawaiiFace.tsx"), "utf8"),
    readFile(path.join(process.cwd(), "src/components/experiments/PixelCharacter.tsx"), "utf8"),
    readFile(path.join(process.cwd(), "public/motif-globe/MotifGlobe.tsx"), "utf8"),
    readFile(path.join(process.cwd(), "src/components/experiments/ImageRippleLoader.tsx"), "utf8"),
  ]);
  const sources = [sampler, voxel, kawaii, pixel, globe, ripple, component];
  return <Showcase composition={composition} sources={sources} highlighted={sources.map(highlight)} />;
}
