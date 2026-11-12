"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ArrowUpRight, Check, Code2, Copy, Home, Layers2, Menu, Orbit as OrbitIcon, Pause, Play, RotateCcw, Sparkles, X } from "lucide-react";
import { motion, MotionConfig } from "motion/react";
import { Button } from "@/components/ui/button";
import { Orbit } from "@/components/experiments/orbit";
import { Chromatic } from "@/components/experiments/chromatic";
import { CardStack } from "@/components/experiments/card-stack";
import type { Token } from "@/lib/highlight";

const MotionButton = motion.create(Button);
const buttonGestures = {
  whileHover: { y: -1 },
  whileTap: { y: 0, scale: 0.97 },
};

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
  const promptTimer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(promptTimer.current), []);

  async function copy(kind: "code" | "prompt") {
    const text = kind === "code" ? source : [
      `Integrate the ${item.title} React component into my project using the complete TSX source below.`,
      `Save it as ${item.slug}.tsx, import the named export ${item.component}, and render <${item.component} /> where requested.`,
      "Follow the existing project structure. Preserve the appearance, interactions, and reduced-motion behavior. Verify the integration.",
      "```tsx", source, "```",
    ].join("\n\n");
    try {
      await navigator.clipboard.writeText(text);
      window.clearTimeout(promptTimer.current);
      setFeedback(kind);
      if (kind === "prompt") {
        promptTimer.current = window.setTimeout(() => setFeedback(""), 3500);
      }
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
    <section className={'stage art-' + item.slug} aria-label={item.title + " preview"}>
      <div className="piece" key={version}><Preview playing={playing}/></div>
      <div className="playback">
        <motion.button {...buttonGestures} aria-label="Restart preview" onClick={() => restart(version + 1)}><RotateCcw/></motion.button>
        {index !== 2 && <motion.button {...buttonGestures} aria-label={playing ? "Pause animation" : "Play animation"} onClick={() => setPlaying(!playing)}>{playing ? <Pause/> : <Play/>}</motion.button>}
      </div>
    </section>
    <section className="editor" aria-label="Component source">
      <header><span><Code2/>{item.slug}.tsx</span><motion.button {...buttonGestures} onClick={() => copy("code")}>{feedback === "code" ? <Check/> : <Copy/>}{feedback === "code" ? "Copied" : "Copy code"}</motion.button></header>
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
          <div className="mini" inert aria-hidden="true"><item.preview playing={false}/></div>
          <a href={'#' + item.slug}>{item.title}<ArrowUpRight/></a>
        </article>)}</div>
      </> : <Detail index={index} source={sources[index]} lines={highlighted[index]}/>}
    </main>
    </div>
  </MotionConfig>;
}
