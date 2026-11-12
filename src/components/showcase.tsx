"use client";

import { useState, useSyncExternalStore } from "react";
import { ArrowUpRight, Check, Code2, Copy, Home, Layers2, Menu, Orbit as OrbitIcon, Pause, Play, RotateCcw, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Orbit } from "@/components/experiments/orbit";
import { Chromatic } from "@/components/experiments/chromatic";
import { CardStack } from "@/components/experiments/card-stack";
import type { Token } from "@/lib/highlight";

const collection = [
  { title: "Orbit", description: "Three satellites trace intersecting ellipses around an amber sun. Each follows its own path through the same twelve-second loop.", slug: "orbit", component: "Orbit", icon: OrbitIcon, preview: Orbit },
  { title: "Chromatic", description: "Translucent planes fan out, then fold back together. Lilac and coral overlap to form deeper shades as the angles change.", slug: "chromatic", component: "Chromatic", icon: Sparkles, preview: Chromatic },
  { title: "Card stack", description: "Three pastel cards sit at slightly different angles. Click the front card or press Enter while it has focus to send it to the back.", slug: "card-stack", component: "CardStack", icon: Layers2, preview: CardStack },
];

function subscribe(listener: () => void) {
  window.addEventListener("hashchange", listener);
  return () => window.removeEventListener("hashchange", listener);
}
const snapshot = () => window.location.hash.slice(1);
const home = () => "";

function Detail({ index, source, lines }: { index: number; source: string; lines: Token[][] }) {
  const item = collection[index];
  const Preview = item.preview;
  const [playing, setPlaying] = useState(true);
  const [version, restart] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [manual, setManual] = useState("");
  async function copy(kind: "code" | "prompt") {
    const text = kind === "code" ? source : [
      `Integrate the ${item.title} React component into my project using the complete TSX source below.`,
      `Save it as ${item.slug}.tsx, import the named export ${item.component}, and render <${item.component} /> where requested.`,
      "Follow the existing project structure. Preserve the appearance, interactions, and reduced-motion behavior. Verify the integration.",
      "```tsx", source, "```",
    ].join("\n\n");
    try {
      await navigator.clipboard.writeText(text);
      setFeedback(kind);
      setManual("");
    } catch {
      setFeedback("");
      setManual(text);
    }
  }
  return <>
    <header className="detail-head">
      <h1>{item.title}</h1>
      <Button className="prompt-action" onClick={() => copy("prompt")}>{feedback === "prompt" ? <Check/> : <Copy/>}{feedback === "prompt" ? "Prompt copied" : "Copy prompt"}</Button>
      <p className="component-description">{item.description}</p>
    </header>
    <section className={'stage art-' + item.slug} aria-label={item.title + " preview"}>
      <div className="piece" key={version}><Preview playing={playing}/></div>
      <div className="playback">
        <button aria-label="Restart preview" onClick={() => restart(version + 1)}><RotateCcw/></button>
        {index !== 2 && <button aria-label={playing ? "Pause animation" : "Play animation"} onClick={() => setPlaying(!playing)}>{playing ? <Pause/> : <Play/>}</button>}
      </div>
    </section>
    <section className="editor" aria-label="Component source">
      <header><span><Code2/>{item.slug}.tsx</span><button onClick={() => copy("code")}>{feedback === "code" ? <Check/> : <Copy/>}{feedback === "code" ? "Copied" : "Copy code"}</button></header>
      <pre tabIndex={0} aria-label="Scrollable source code"><code>{lines.map((tokens, i) => <span className="line" key={i}><i aria-hidden="true">{i + 1}</i><span>{tokens.map((token, j) => <span key={j} className={'tok-' + token.kind}>{token.text}</span>)}{'\n'}</span></span>)}</code></pre>
    </section>
    {manual && <label className="manual">Select and copy the text<textarea autoFocus readOnly value={manual} onFocus={e => e.target.select()}/></label>}
    <span className="sr-only" role="status">{feedback && feedback + " copied"}</span>
  </>;
}

export function Showcase({ sources, highlighted }: { sources: string[]; highlighted: Token[][][] }) {
  const slug = useSyncExternalStore(subscribe, snapshot, home);
  const index = collection.findIndex(item => item.slug === slug);
  const [open, setOpen] = useState(false);
  return <div className="library">
    <aside className={open ? "rail open" : "rail"}>
      <div className="rail-head"><a className="wordmark" href="#home" onClick={() => setOpen(false)}>hype</a>
        <button className="menu-toggle" aria-expanded={open} aria-label="Component navigation" onClick={() => setOpen(!open)}>{open ? <X/> : <Menu/>}</button>
      </div>
      <nav aria-label="Library navigation" onClick={() => setOpen(false)}>
        <a href="#home" aria-current={index === -1 ? "page" : undefined}><Home/>Home</a>
        <h2>Components</h2>
        {collection.map((item, i) => <a key={item.slug} href={'#' + item.slug} aria-current={index === i ? "page" : undefined}><item.icon/>{item.title}</a>)}
      </nav>
    </aside>
    <main className="canvas" key={slug}>
      {index < 0 ? <>
        <h1>Components</h1>
        <div className="gallery">{collection.map(item => <article className={'tile art-' + item.slug} key={item.slug}>
          <div className="mini" inert aria-hidden="true"><item.preview playing={false}/></div>
          <a href={'#' + item.slug}>{item.title}<ArrowUpRight/></a>
        </article>)}</div>
      </> : <Detail index={index} source={sources[index]} lines={highlighted[index]}/>}
    </main>
  </div>;
}
