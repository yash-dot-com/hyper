"use client";

import { useSyncExternalStore } from "react";

const mediaQuery = "(prefers-reduced-motion: reduce)";
function subscribe(change: () => void) {
  const query = window.matchMedia(mediaQuery);
  query.addEventListener("change", change);
  return () => query.removeEventListener("change", change);
}

type DemoVideoProps = { base: string; label: string; width: number; height: number; fillThumbnail?: boolean; upperHemisphere?: boolean };

export function DemoVideo({ base, label, width, height, fillThumbnail, upperHemisphere }: DemoVideoProps) {
  const still = useSyncExternalStore(subscribe, () => window.matchMedia(mediaQuery).matches, () => true);
  const poster = base + ".webp";
  // Align the square video's equator with the thumbnail's bottom edge.
  const style = upperHemisphere ? {
    position: "absolute" as const, width: "100%", height: "200%", left: 0, bottom: 0,
    transform: "translateY(50%)", objectFit: "cover" as const,
  } : fillThumbnail ? { width: "100%", height: "100%", objectFit: "cover" as const, position: "absolute" as const, inset: 0 } : undefined;
  if (still) return <img style={style} width={width} height={height} src={poster} alt={label}/>;
  return <video style={style} key={base} width={width} height={height} muted playsInline loop autoPlay poster={poster} src={base + ".mp4"} aria-label={label}/>;
}
