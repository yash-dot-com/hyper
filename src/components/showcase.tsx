"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ArrowUpRight, Check, Code2, Copy, Home, Layers2, Menu, Orbit as OrbitIcon, Pause, Play, RotateCcw, Sparkles, Type, X } from "lucide-react";
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

function KineticVideo() {
  return (
    <video autoPlay muted loop playsInline width={720} height={720}
      src="/kinetic-paragraph/preview.mp4" poster="/kinetic-paragraph/poster.webp"
      aria-label="Kinetic paragraph animation" />
  );
}

const collection = [
  { title: "Kinetic paragraph", description: "A single word opens into a paragraph. Colored highlights mark the rhythm as the words move across the page.", slug: "kinetic-paragraph", component: "KineticParagraph", icon: Type, preview: KineticVideo },
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

function Detail({ index, source, lines, composition }: { composition: string; index: number; source: string; lines: Token[][] }) {
  const item = collection[index];
  const Preview = item.preview;
  const isVideo = item.slug === "kinetic-paragraph";
  const [playing, setPlaying] = useState(true);
  const [version, restart] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [manual, setManual] = useState("");
  const copyTimer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(copyTimer.current), []);

  async function copy(kind: "code" | "prompt") {
    const text = kind === "code" ? source : isVideo ? [
      "Use the named export KineticParagraph from the full component below in a Remotion composition. Keep its existing animation. Return ready-to-use TSX for the composition.",
      "The example uses an original paragraph beginning with a word that stands alone. Pass it through text. Set background for the canvas, ink for text and outlines, and blue and yellow for the two highlights. Keep these prop names. If adapting the palette, keep ink legible on all three surfaces.",
      "Use one complete 5.6-second cycle with durationInFrames={Math.round(fps * durationSeconds)}. Register the composition in the project's Remotion root.",
      "Root.tsx (complete example):", "```tsx", composition, "```",
      "KineticParagraph.tsx (complete source):", "```tsx", source, "```",
    ].join("\n\n") : [
      `Integrate the ${item.title} React component into my project using the complete TSX source below.`,
      `Save it as ${item.slug}.tsx, import the named export ${item.component}, and render <${item.component} /> where requested.`,
      "Follow the existing project structure. Preserve the appearance, interactions, and reduced-motion behavior. Verify the integration.",
      "```tsx", source, "```",
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
    <section className={'stage art-' + item.slug} aria-label={item.title + " preview"}>
      {isVideo ? (
        <KineticVideo/>
      ) : <>
      <div className="piece" key={version}><Preview playing={playing}/></div>
      <div className="playback">
        <motion.button {...buttonGestures} aria-label="Restart preview" onClick={() => restart(version + 1)}><RotateCcw/></motion.button>
        {item.slug !== "card-stack" && <motion.button {...buttonGestures} aria-label={playing ? "Pause animation" : "Play animation"} onClick={() => setPlaying(!playing)}>{playing ? <Pause/> : <Play/>}</motion.button>}
      </div>
      </>}
    </section>
    <section className="editor" aria-label="Component source">
      <header><span><Code2/>{isVideo ? "KineticParagraph" : item.slug}.tsx</span><motion.button {...buttonGestures} onClick={() => copy("code")}>{feedback === "code" ? <Check/> : <Copy/>}{feedback === "code" ? "Copied" : "Copy code"}</motion.button></header>
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
          <div className="mini" inert aria-hidden="true"><item.preview playing={false}/></div>
          <a href={'#' + item.slug}>{item.title}<ArrowUpRight/></a>
        </article>)}</div>
      </> : <Detail composition={composition} index={index} source={sources[index]} lines={highlighted[index]}/>}
    </main>
    </div>
  </MotionConfig>;
}
