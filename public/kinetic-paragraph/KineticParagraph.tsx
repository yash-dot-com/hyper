import React, { useLayoutEffect, useMemo, useRef } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";

export const referenceText =
  "Wikipédia (mot prononcé [wi.ki.pe.dja]) est une encyclopédie en ligne collaborative et multilingue créée par Jimmy Wales et Larry Sanger le 15 janvier 2001. Il s'agit d'une œuvre libre, c'est-à-dire qu'elle est en libre accès et que chacun peut la rediffuser gratuitement, telle quelle ou amendée, sous quelques conditions décrites par une licence. Son site web, géré en wiki grâce au logiciel MediaWiki, permet à tous les internautes d'écrire et de modifier des articles selon des principes collaboratifs, ce qui vaut à l'œuvre d'être qualifiée d'« encyclopédie participative » ou « contributive ».";
export type KineticParagraphProps = {
  text?: string;
  /** Length of one cycle in seconds. The composition controls the export length. */
  durationSeconds?: number;
  seed?: number;
  /** Fraction of composition width available to the expanded paragraph. */
  maxWidth?: number;
  /** Type size in pixels on a 720-unit short edge. */
  fontSize?: number;
  fontFamily?: string;
  background?: string;
  ink?: string;
  blue?: string;
  yellow?: string;
};
type Style = "plain" | "blue" | "yellow" | "outline";
type Word = { text: string; index: number; width: number };
type Row = { words: Word[]; width: number };
type Accent = { style: Style; extra?: number; start?: number; width?: number };
const serif = '"Times New Roman", "Liberation Serif", Times, serif';
const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

// Accent cues belong to words. They remain attached when the words change rows.
const heldAccents: Record<number, Accent> = {
  0: { style: "yellow", extra: 1.5 },
  3: { style: "outline", start: 0.24, width: 0.16 },
  2: { style: "blue", extra: 1.2 },
  6: { style: "blue" },
  9: { style: "blue" },
  12: { style: "yellow" },
  15: { style: "outline" },
  21: { style: "blue" },
  50: { style: "yellow" },
  52: { style: "outline" },
  54: { style: "outline" },
  56: { style: "yellow" },
  57: { style: "outline" },
  60: { style: "blue" },
  66: { style: "blue" },
  74: { style: "yellow" },
  75: { style: "yellow" },
  79: { style: "outline" },
  81: { style: "blue" },
  83: { style: "outline" },
  84: { style: "yellow" },
};
type Cue = {
  blue: number[];
  yellow: number[];
  outline: number[];
  partial?: Record<number, Accent>;
};
const frenchCues: Record<number, Cue> = {
  1: {
    blue: [0],
    yellow: [16],
    outline: [7],
    partial: { 0: { style: "blue", extra: 1.4 } },
  },
  2: {
    blue: [12, 37, 43],
    yellow: [5, 11, 29, 38],
    outline: [14, 31, 40, 49, 51],
    partial: {
      3: { style: "blue", start: 0.26, width: 0.18 },
      28: { style: "yellow", start: 0.55, width: 0.14 },
    },
  },
  3: {
    blue: [25, 45, 49, 50, 68, 77],
    yellow: [16, 17, 18, 21, 26, 41, 67],
    outline: [1, 43, 46, 65],
    partial: {
      3: { style: "outline", start: 0.62, width: 0.16 },
      28: { style: "blue", start: 0.54, width: 0.16 },
    },
  },
  4: {
    blue: [19, 21, 33, 40, 43, 63, 80],
    yellow: [8, 23, 36, 37, 42, 77, 79],
    outline: [6, 45, 56, 69, 72, 76, 82],
  },
  6: {
    blue: [7, 26, 40, 41, 45, 48, 70],
    yellow: [8, 19, 22, 33, 37, 50, 56],
    outline: [12, 13, 24, 60, 77, 82],
    partial: { 3: { style: "outline", start: 0.67, width: 0.31 } },
  },
  7: {
    blue: [1, 29, 31, 42, 59, 68],
    yellow: [22, 30, 40, 62, 64, 70, 79],
    outline: [32, 48, 61, 69, 76, 77, 78],
    partial: { 3: { style: "blue", start: 0.27, width: 0.16 } },
  },
  8: {
    blue: [4, 23, 26, 27, 44, 51, 63],
    yellow: [6, 9, 17, 32, 39, 42],
    outline: [35, 47, 50, 66],
    partial: { 28: { style: "outline", start: 0.49, width: 0.15 } },
  },
  9: {
    blue: [2, 15, 17, 26],
    yellow: [8, 10, 11, 19],
    outline: [4, 12, 13],
    partial: {
      3: { style: "blue", start: 0, width: 0.05 },
      28: { style: "outline", start: 0.49, width: 0.15 },
    },
  },
};
function accent(
  index: number,
  beat: number,
  seed: number,
  reference: boolean,
): Accent {
  if (reference) {
    if (beat === 5) return heldAccents[index] ?? { style: "plain" };
    const cue = frenchCues[beat];
    if (cue?.partial?.[index]) return cue.partial[index];
    for (const style of ["blue", "yellow", "outline"] as const) {
      if (cue?.[style].includes(index)) return { style };
    }
    return { style: "plain" };
  }
  if (index === 0 && beat === 1) return { style: "blue", extra: 0.65 };
  let h =
    Math.imul(index + 27, 0x9e3779b1) ^ Math.imul(beat + 7, 0x85ebca6b) ^ seed;
  h = Math.imul(h ^ (h >>> 16), 0x7feb352d);
  h = Math.imul(h ^ (h >>> 15), 0x846ca68b);
  const n = ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  return {
    style:
      n < 0.086
        ? "blue"
        : n < 0.166
          ? "yellow"
          : n < 0.228
            ? "outline"
            : "plain",
  };
}

function wrap(words: Word[], width: number, gap: number): Row[] {
  if (words.length === 0) return [];
  const rows: Row[] = [];
  let row: Row = { words: [], width: 0 };
  for (const word of words) {
    if (row.words.length && row.width + gap + word.width > width) {
      rows.push(row);
      row = { words: [], width: 0 };
    }
    row.width += (row.words.length ? gap : 0) + word.width;
    row.words.push(word);
  }
  rows.push(row);
  return rows;
}

function measure(
  ctx: CanvasRenderingContext2D,
  strings: string[],
  size: number,
  family: string,
): Word[] {
  ctx.font = `${size}px ${family}`;
  return strings.map((text, index) => ({
    text,
    index,
    width: ctx.measureText(text).width,
  }));
}

function progressAt(t: number) {
  if (t < 17 || t >= 115.7) return 0;
  if (t < 60) {
    const u = (t - 17) / 43;
    return 1 - (1 - u) ** 2;
  }
  if (t <= 76) return 1;
  return Math.max(0, 1 - ((t - 76) / 41) ** 2);
}

/** A frame-driven Remotion component. All words, rectangles and line breaks are generated live. */
export function KineticParagraph({
  text = referenceText,
  durationSeconds = 5.6,
  seed = 1,
  maxWidth = 0.798,
  fontSize = 27,
  fontFamily = serif,
  background = "#ffffff",
  ink = "#070707",
  blue = "#0800ff",
  yellow = "#ffef00",
}: KineticParagraphProps) {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const canvas = useRef<HTMLCanvasElement>(null);
  const strings = useMemo(
    () => text.trim().split(/\s+/u).filter(Boolean),
    [text],
  );
  const layout = useMemo(() => {
    if (typeof document === "undefined" || !strings.length) return null;
    const ctx = document.createElement("canvas").getContext("2d");
    if (!ctx) return null;
    const targetWidth = width * clamp(maxWidth, 0.1, 0.97);
    let size = (Math.max(1, fontSize) * Math.min(width, height)) / 720;
    // Fit a longer passage to the available height while preserving its margins.
    let words = measure(ctx, strings, size, fontFamily);
    for (let pass = 0; pass < 8; pass++) {
      const rows = wrap(words, targetWidth, size * 0.69);
      const longest = words.reduce((m, w) => Math.max(m, w.width), 0);
      const factor = Math.min(
        1,
        targetWidth / Math.max(1, longest),
        (height * 0.87) / (rows.length * size * 1.377),
      );
      if (factor > 0.999) break;
      size *= factor;
      words = measure(ctx, strings, size, fontFamily);
    }
    return {
      words,
      size,
      targetWidth,
      firstWidth: Math.min(targetWidth, words[0].width + size * 0.46),
    };
  }, [width, height, maxWidth, fontSize, fontFamily, strings]);

  useLayoutEffect(() => {
    const node = canvas.current,
      ctx = node?.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, width, height);
    if (!layout) return;
    const { size, words, targetWidth, firstWidth } = layout;
    const cycle = Math.max(
      1,
      Math.round(fps * Math.max(0.01, durationSeconds)),
    );
    const phase = ((frame % cycle) * 140) / cycle;
    const opening = progressAt(phase);
    const tail = phase > 114 ? Math.max(0, (115.7 - phase) / 1.7) : 1;
    const count = 1 + Math.round(opening * tail * (words.length - 1));
    const column = firstWidth + (targetWidth - firstWidth) * opening;
    const gap = size * 0.69,
      lineHeight = size * 1.377;
    ctx.font = `${size}px ${fontFamily}`;
    const tokens = words.slice(0, count).flatMap((word) => {
      if (word.width <= column) return [word];
      // Unbroken tokens can exceed the narrow column during entry or exit.
      const parts: Word[] = [];
      let part = "";
      for (const letter of Array.from(word.text)) {
        if (part && ctx.measureText(part + letter).width > column) {
          parts.push({
            ...word,
            text: part,
            width: ctx.measureText(part).width,
          });
          part = "";
        }
        part += letter;
      }
      if (part)
        parts.push({ ...word, text: part, width: ctx.measureText(part).width });
      return parts;
    });
    const rows = wrap(tokens, column, gap);
    const left = (width - column) / 2,
      firstBaseline =
        height / 2 - ((rows.length - 1) * lineHeight) / 2 + size * 0.32;
    const beat = Math.floor(phase / 12);
    ctx.font = `${size}px ${fontFamily}`;
    ctx.textBaseline = "alphabetic";
    const placements: { word: Word; x: number; y: number }[] = [];
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i],
        last = i === rows.length - 1;
      const space =
        !last && row.words.length > 1
          ? gap + (column - row.width) / (row.words.length - 1)
          : size * 0.46;
      let x = left;
      for (const word of row.words) {
        placements.push({ word, x, y: firstBaseline + i * lineHeight });
        x += word.width + space;
      }
    }
    // Markers can enter the space between words. Paint all ink after all markers.
    for (const { word, x, y } of placements) {
      const item: Accent =
        count === 1
          ? {
              style: (beat === 1 || beat === 10 ? "blue" : "plain") as Style,
              extra: 0,
            }
          : accent(
              word.index,
              beat,
              seed,
              text === referenceText && seed === 1,
            );
      if (item.style === "plain") continue;
      const px = size * 0.17;
      const bx = x - px + (item.start ?? 0) * word.width,
        by = y - size * 0.9;
      const bw =
          (item.width ?? 1) * word.width + 2 * px + (item.extra ?? 0) * size,
        bh = size * 1.14;
      if (item.style === "outline") {
        ctx.strokeStyle = ink;
        ctx.lineWidth = Math.max(0.7, size / 31);
        ctx.strokeRect(bx, by, bw, bh);
      } else {
        ctx.fillStyle = item.style === "blue" ? blue : yellow;
        ctx.fillRect(bx, by, bw, bh);
      }
    }
    ctx.fillStyle = ink;
    for (const { word, x, y } of placements) ctx.fillText(word.text, x, y);
  }, [
    frame,
    fps,
    width,
    height,
    layout,
    background,
    ink,
    blue,
    yellow,
    durationSeconds,
    fontFamily,
    seed,
    text,
  ]);
  return (
    <canvas
      ref={canvas}
      width={width}
      height={height}
      role="img"
      aria-label={text}
      style={{ display: "block", width: "100%", height: "100%", background }}
    />
  );
}
