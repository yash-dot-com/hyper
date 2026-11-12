import { readFile } from "node:fs/promises";
import path from "node:path";
import { Showcase } from "@/components/showcase";

import { highlight } from "@/lib/highlight";

export default async function Home() {
  "use cache";
  const files = ["orbit", "chromatic", "card-stack"];
  const sources = await Promise.all(files.map((file) => readFile(path.join(process.cwd(), "src/components/experiments", `${file}.tsx`), "utf8")));
  return <Showcase sources={sources} highlighted={sources.map(highlight)} />;
}
