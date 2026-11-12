import React, { useLayoutEffect, useRef, type CSSProperties } from "react";

export type ImageRippleLoaderProps = {
  width?: CSSProperties["width"];
  height?: CSSProperties["height"];
  aspectRatio?: CSSProperties["aspectRatio"];
  /** Colors of the active marks. CSS variables and single-color palettes work too. */
  colors?: readonly string[];
  background?: string;
  idleColor?: string;
  outline?: string;
  /** Cell pitch in CSS pixels. The default fits 31 cells across the disc. */
  pitch?: number;
  period?: number;
  phase?: number;
  seed?: number;
  motion?: "ripple" | "sweep";
  silhouette?: "disc" | "frame";
  label?: string;
  decorative?: boolean;
  className?: string;
  style?: CSSProperties;
  children?: React.ReactNode;
};
const inks = ["#449c5f", "#fcf7b6", "#f97daa"] as const;
const tau = Math.PI * 2;
const clamp = (v: number) => Math.max(0, Math.min(1, v));
const smooth = (a: number, b: number, v: number) => {
  const p = clamp((v - a) / (b - a));
  return p * p * (3 - 2 * p);
};
function noise(x: number, y: number, s: number) {
  let n =
    Math.imul(x + 87, 0x85ebca6b) ^
    Math.imul(y + 219, 0xc2b2ae35) ^
    Math.imul(s, 0x27d4eb2d);
  n = Math.imul(n ^ (n >>> 16), 0x7feb352d);
  n = Math.imul(n ^ (n >>> 15), 0x846ca68b);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
}
type Cell = {
  x: number;
  y: number;
  u: number;
  radial: number;
  threshold: number;
  tone: number;
};
function makeMarks(pitch: number) {
  // Four cubic arcs share their end points. Their handles move from convex to flat to concave.
  return Array.from({ length: 65 }, (_, i) => {
    const k = i / 32,
      r = pitch * 0.5 * (0.765 + 0.235 * Math.min(1, k));
    const convex = 0.55228475 * Math.max(0, 1 - k),
      concave = 0.55228475 * Math.max(0, k - 1);
    const p = new Path2D();
    p.moveTo(0, -r);
    const axes = [
      [0, -1],
      [1, 0],
      [0, 1],
      [-1, 0],
      [0, -1],
    ];
    for (let s = 0; s < 4; s++) {
      const [x, y] = axes[s],
        [a, b] = axes[s + 1];
      p.bezierCurveTo(
        r * (x * (1 - concave) + a * convex),
        r * (y * (1 - concave) + b * convex),
        r * (a * (1 - concave) + x * convex),
        r * (b * (1 - concave) + y * convex),
        r * a,
        r * b,
      );
    }
    p.closePath();
    return p;
  });
}

export function ImageRippleLoader({
  width = "100%",
  height,
  aspectRatio = 1,
  colors = inks,
  background = "#000000",
  idleColor = "#090000",
  outline = "#edd9be",
  pitch,
  period = 5,
  phase,
  seed = 7,
  motion = "ripple",
  silhouette = "disc",
  label = "Generating image",
  decorative = false,
  className,
  style,
  children,
}: ImageRippleLoaderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null),
    probeRef = useRef<HTMLSpanElement>(null);
  const palette = colors.length ? colors : inks;
  useLayoutEffect(() => {
    const node = canvasRef.current,
      probes = probeRef.current;
    if (!node || !probes) return;
    const ctx = node.getContext("2d");
    if (!ctx) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fixed = phase !== undefined && Number.isFinite(phase);
    let w = 0,
      h = 0,
      dpr = 1,
      step = 0,
      id = 0,
      onScreen = true,
      marks: Path2D[] = [];
    let cells: Cell[] = [];
    const start = performance.now();
    function layout() {
      w = node!.clientWidth;
      h = node!.clientHeight;
      if (w <= 0 || h <= 0) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2, 4096 / Math.max(w, h));
      node!.width = Math.max(1, Math.round(w * dpr));
      node!.height = Math.max(1, Math.round(h * dpr));
      const diameter = Math.min(w, h) * 0.8073;
      step = Math.max(
        2,
        Number.isFinite(pitch) && pitch! > 0 ? pitch! : diameter / 31,
        Math.sqrt((w * h) / 14000),
      );
      marks = makeMarks(step);
      cells = [];
      const rx = Math.ceil((silhouette === "disc" ? diameter : w) / 2 / step),
        ry = Math.ceil((silhouette === "disc" ? diameter : h) / 2 / step);
      const span = silhouette === "disc" ? diameter : w,
        radius = silhouette === "disc" ? diameter / 2 : Math.hypot(w, h) / 2;
      for (let j = -ry; j <= ry; j++)
        for (let i = -rx; i <= rx; i++) {
          const dx = i * step,
            dy = j * step;
          if (silhouette === "disc" && Math.hypot(dx, dy) >= radius) continue;
          cells.push({
            x: w / 2 + dx,
            y: h / 2 + dy,
            u: 0.5 + dx / span,
            radial: Math.hypot(dx, dy) / radius,
            threshold: noise(i, j, seed),
            tone: noise(i, j, seed + 2099),
          });
        }
    }
    function paint(now: number) {
      if (!w || !h) return;
      const t = fixed
        ? phase!
        : mq.matches
          ? 0.16
          : (now - start) /
            (1000 * (Number.isFinite(period) && period > 0 ? period : 5));
      // Resolve the small palette once per draw, including values inherited through CSS.
      const [line, off, ...active] = Array.from(
        probes!.children,
        (el) => getComputedStyle(el).color,
      );
      ctx!.resetTransform();
      ctx!.clearRect(0, 0, node!.width, node!.height);
      ctx!.lineWidth = step * 0.033;
      ctx!.strokeStyle = line;
      for (const cell of cells) {
        const m = smooth(
          0.27,
          0.74,
          0.5 + 0.5 * Math.sin(tau * ((cell.u - 0.44) * 0.8 - t)),
        );
        const band =
          motion === "sweep"
            ? (cell.u - 0.115) * 0.92
            : cell.radial * 0.87 - 0.13;
        const light = 0.5 + 0.5 * Math.cos(tau * (band - 2 * t));
        const heat = clamp((light - 0.26) / 0.73);
        const idx = Math.min(
          active.length - 1,
          Math.floor(cell.tone * active.length * heat),
        );
        ctx!.fillStyle =
          cell.threshold < 0.87 * smooth(0.075, 0.7, light) ? active[idx] : off;
        ctx!.setTransform(dpr, 0, 0, dpr, cell.x * dpr, cell.y * dpr);
        const mark = marks[Math.round(m * 64)];
        ctx!.fill(mark);
        ctx!.stroke(mark);
      }
    }
    function tick(now: number) {
      paint(now);
      id = requestAnimationFrame(tick);
    }
    function sync() {
      cancelAnimationFrame(id);
      if (document.hidden || !onScreen) return;
      paint(performance.now());
      if (!fixed && !mq.matches) id = requestAnimationFrame(tick);
    }
    function resize() {
      layout();
      sync();
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(node);
    const io = new IntersectionObserver((entries) => {
      onScreen = entries[0].isIntersecting;
      sync();
    });
    io.observe(node);
    mq.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    return () => {
      cancelAnimationFrame(id);
      ro.disconnect();
      io.disconnect();
      mq.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, [
    pitch,
    period,
    phase,
    seed,
    motion,
    silhouette,
    colors,
    outline,
    idleColor,
  ]);
  return (
    <div
      className={className}
      style={{
        position: "relative",
        isolation: "isolate",
        overflow: "hidden",
        minWidth: 0,
        width,
        height,
        aspectRatio,
        background,
        ...style,
      }}
    >
      <span ref={probeRef} aria-hidden="true" style={{ display: "none" }}>
        {[outline, idleColor, ...palette].map((color, i) => (
          <span key={i} style={{ color }} />
        ))}
      </span>
      <canvas
        ref={canvasRef}
        role={decorative ? undefined : "status"}
        aria-hidden={decorative || undefined}
        aria-label={decorative ? undefined : label}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          display: "block",
          pointerEvents: "none",
        }}
      />
      {children && (
        <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
      )}
    </div>
  );
}
