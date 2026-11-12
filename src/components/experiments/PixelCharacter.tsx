"use client";

import { useEffect, useRef } from "react";

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
  const root = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const svg = root.current;
    if (!svg || !rate) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const timers = new Set<number>();
    const animations = new Set<Animation>();
    const between = (min: number, max: number) => min + Math.random() * (max - min);

    function later(callback: () => void, delay: number) {
      const timer = window.setTimeout(() => {
        timers.delete(timer);
        callback();
      }, delay / rate);
      timers.add(timer);
    }

    function move(selector: string, poses: string[], duration: number) {
      for (const part of svg!.querySelectorAll(selector)) {
        const animation = part.animate(poses.map(transform => ({ transform })), {
          duration: duration / rate, easing: "steps(2, end)",
        });
        animations.add(animation);
        animation.onfinish = () => animations.delete(animation);
      }
    }

    let previous = -1;
    function gesture() {
      // Choose a different gesture each time, then vary its reach and dwell.
      const kind = (previous + 1 + Math.floor(between(0, previous < 0 ? 3 : 2))) % 3;
      previous = kind;
      const duration = between(560, 1300);
      const tilt = between(4, 9) * (Math.random() < 0.5 ? -1 : 1);
      const peak = kind === 0 ? `rotate(${tilt}deg)` :
        kind === 1 ? "translateY(-.7px)" : `translateY(.35px) rotate(${tilt / 2}deg)`;
      move(".px-pose", ["none", peak, peak, "none"], duration);
      if (Math.random() < 0.75) move(".px-pupils", ["none", "translateX(1px)", "translateX(1px)", "none"], duration * 0.9);
      if (Math.random() < 0.65) later(() => move(".px-fringe", ["none", "translateY(-1px)", "none"], 260), duration * 0.28);
      later(gesture, duration + between(180, 1900));
    }

    function blink() {
      const close = () => move(".px-eyes", ["none", "scaleY(.16)", "none"], 150);
      close();
      if (Math.random() < 0.18) later(close, 240);
      later(blink, between(1900, 5600));
    }

    function stop() {
      timers.forEach(timer => window.clearTimeout(timer));
      timers.clear();
      animations.forEach(animation => animation.cancel());
      animations.clear();
    }
    function sync() {
      stop();
      if (reduced.matches || document.hidden) return;
      later(gesture, between(120, 650));
      later(blink, between(700, 2800));
    }
    sync();
    reduced.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    return () => {
      stop();
      reduced.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, [rate, shape]);

  return (
    <svg ref={root} viewBox="-2 -2 16 16" style={{ width: size, height: "auto", maxWidth: "100%", display: "block" }} role="img" aria-label={label} shapeRendering="crispEdges">
      <style>{`
        .px-pose { transform-box:fill-box; transform-origin:50% 85%; }
        .px-eyes { transform-box:fill-box; transform-origin:center; }
      `}</style>
      <g className="px-pose">
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
      </g>
    </svg>
  );
}
