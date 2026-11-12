"use client";

import { useSyncExternalStore } from "react";

export type RippleDemoMode = "disc" | "frame";
const mediaQuery = "(prefers-reduced-motion: reduce)";
function subscribe(change: () => void) {
  const query = window.matchMedia(mediaQuery);
  query.addEventListener("change", change);
  return () => query.removeEventListener("change", change);
}

export function RippleDemo({ mode = "disc" }: { mode?: RippleDemoMode }) {
  const still = useSyncExternalStore(subscribe, () => window.matchMedia(mediaQuery).matches, () => true);
  const base = `/image-ripple-loader/${mode}`;
  const label = mode === "disc" ? "Green rings moving outward across a disc of marks" : "A band of colored marks sweeping across a cream field";
  const size = mode === "disc" ? { width: 480, height: 480 } : { width: 768, height: 432 };
  if (still) return <img {...size} src={base + ".webp"} alt={label}/>;
  return <video key={mode} {...size} muted playsInline loop autoPlay poster={base + ".webp"} src={base + ".mp4"} aria-label={label}/>;
}

export function ripplePrompt(mode: RippleDemoMode, source: string) {
  const props = mode === "disc"
    ? 'silhouette="disc" motion="ripple" aspectRatio={1} pitch={7} period={4} colors={["#24754D", "#67E8A5", "#E4FFD2"]} background="#07110D" idleColor="#0B1B13" outline="transparent"'
    : 'silhouette="frame" motion="sweep" aspectRatio="16 / 9" pitch={18} period={5} colors={["#263C73", "#EF6948", "#FFCA65"]} background="#F5ECDD" idleColor="#F5ECDD" outline="#B7A994"';
  return [
    "Integrate the supplied named React export ImageRippleLoader directly. Choose one purposeful placement such as a generation preview or card illustration. Fit the composition to its container. In Next.js App Router, place the hook-based component behind a client boundary.",
    "Start from the selected demo below. Disc and frame control the silhouette; ripple and sweep control the motion. Compare pitch 6, 12, and 20, periods 3, 5, and 9, and seeds 7, 19, and 42. Compare palettes at the same seed and phase (0.12, 0.32, or 0.62). Any defined phase freezes the image; omit it for motion.",
    'Other directions to compare are a cream printed frame with outlined marks, a green phosphor ripple, and a 96px amber indicator with motion="sweep", pitch={4}, period={3}, colors={["#FFB84A"]}, background="#17120C", idleColor="#302419", outline="transparent". Ship the best fit. For real loading use decorative={false} and a task-specific label. For decoration use decorative. Verify mobile and desktop sizing, overlay contrast if applicable, and reduced-motion behavior.',
    'Selected usage:\n```tsx\nimport { ImageRippleLoader } from "./ImageRippleLoader";\n\nexport function Preview() {\n  return <ImageRippleLoader ' + props + ' seed={7} decorative />;\n}\n```',
    "ImageRippleLoader.tsx (complete source):\n```tsx\n" + source + "\n```",
  ].join("\n\n");
}
