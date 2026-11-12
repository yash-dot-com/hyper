"use client";

import { useSyncExternalStore } from "react";

const mediaQuery = "(prefers-reduced-motion: reduce)";
function subscribe(change: () => void) {
  const query = window.matchMedia(mediaQuery);
  query.addEventListener("change", change);
  return () => query.removeEventListener("change", change);
}

type DemoVideoProps = { base: string; label: string; width: number; height: number };

export function DemoVideo({ base, label, width, height }: DemoVideoProps) {
  const still = useSyncExternalStore(subscribe, () => window.matchMedia(mediaQuery).matches, () => true);
  const poster = base + ".webp";
  if (still) return <img width={width} height={height} src={poster} alt={label}/>;
  return <video key={base} width={width} height={height} muted playsInline loop autoPlay poster={poster} src={base + ".mp4"} aria-label={label}/>;
}
