import React, { useLayoutEffect, useRef, type CSSProperties } from "react";
import * as THREE from "three";
const TAU = Math.PI * 2;
export type MotifName =
  | "circle"
  | "diamond"
  | "spark"
  | "square"
  | "triangle"
  | "hexagon"
  | "star"
  | "cross"
  | "flower";
export type Point = readonly [number, number];
/** Use points around the origin in boundary order. Polar morphs require a star-shaped outline. */
export type Motif = MotifName | { points: readonly Point[]; rotation?: number };
function polygon(sides: number, outer: number, inner = outer): Point[] {
  return Array.from({ length: sides }, (_, i) => {
    const angle = (i * TAU) / sides - Math.PI / 2,
      r = i % 2 ? inner : outer;
    return [Math.cos(angle) * r, Math.sin(angle) * r] as const;
  });
}
const vertices: Partial<Record<MotifName, readonly Point[]>> = {
  triangle: polygon(3, 0.99),
  hexagon: polygon(6, 0.96),
  star: polygon(10, 1, 0.44),
  cross: [
    [-0.32, -0.88],
    [0.32, -0.88],
    [0.32, -0.32],
    [0.88, -0.32],
    [0.88, 0.32],
    [0.32, 0.32],
    [0.32, 0.88],
    [-0.32, 0.88],
    [-0.32, 0.32],
    [-0.88, 0.32],
    [-0.88, -0.32],
    [-0.32, -0.32],
  ],
};
function radiusOnPolygon(angle: number, points: readonly Point[]): number {
  const dx = Math.cos(angle),
    dy = Math.sin(angle);
  let distance = Infinity;
  for (let i = 0; i < points.length; i++) {
    const [ax, ay] = points[i],
      [bx, by] = points[(i + 1) % points.length],
      ex = bx - ax,
      ey = by - ay;
    const cross = dx * ey - dy * ex;
    if (Math.abs(cross) < 1e-8) continue;
    const ray = (ax * ey - ay * ex) / cross,
      edge = (ax * dy - ay * dx) / cross;
    if (ray > 0 && edge >= -1e-7 && edge <= 1 + 1e-7)
      distance = Math.min(ray, distance);
  }
  return Number.isFinite(distance) ? distance : 0;
}
function radiusAt(motif: Motif, angle: number) {
  if (typeof motif === "object")
    return radiusOnPolygon(
      angle - ((motif.rotation ?? 0) * Math.PI) / 180,
      motif.points,
    );
  const x = Math.abs(Math.cos(angle)),
    y = Math.abs(Math.sin(angle));
  if (motif === "circle") return 0.765;
  if (motif === "diamond") return 1 / (x + y);
  // The sparkle edge is a quadrant of a circle centered at a cell corner.
  if (motif === "spark") {
    const sum = x + y;
    return sum - Math.sqrt(Math.max(0, sum * sum - 1));
  }
  if (motif === "square") return 0.77 / Math.max(x, y);
  if (motif === "flower")
    return 0.73 + 0.23 * Math.cos(5 * (angle + Math.PI / 2));
  return radiusOnPolygon(angle, vertices[motif] ?? vertices.hexagon!);
}

// Geographic mask, south-to-north rows, 512 × 256. Source: Natural Earth via QGIS world_map.gpkg.
const landBits =
  "////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////" +
  "////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////" +
  "////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////" +
  "////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////" +
  "////////////////////////////////////////gAf///////////////////////////////////////////////////////////////////////////////8AAAH/////////////" +
  "///////////////////////////////////////////////////////////////////wAAf4AP//////////////////////D///////////////////////////////////////////" +
  "//////////4AAAAAAAAD/////////////////////gD////////////////////////////////////////////////////gAAAAAAACD////////////////////8AAADAf////////" +
  "////////////////////////////////////////AAAAAAAAAH////////////////////8AAAAAA///////////////////////////////////////////////+AAAAAAAAAAAP///" +
  "//////////////gAP+Af+AAAv/////////////////////////////////////////////AAAAAAAACcIAP////////////////wAGBgAf/gADAH////////////////////////////" +
  "///////////////gAAAAAAAD4Ab////////////////wADwAAAD/wAX3////////////////////////////////////////////+AAAAAAAAAAP/////////////////8AAgAAAf8AP" +
  "///////////////////////////////////////////////wAAAAAAAB/9//////////////////AAAAAAAAAf//////////////////////////////////////////////hQAAAAAA" +
  "AAAof///////////////4AAAAAAAAAAf/////////////////////////////////////////////gAAAAAAAAAADn/////////////////8AAAAAAAAAP//////////////////////" +
  "//////////////////////4AAAAAAAAAAACd//////////////////gAAAAAAAAAH///////////////////////////////////////////AAAAAAAAAAAAAAe+///9wAB////////9" +
  "AAAAAAAAAAP//////////////////////////////////////////gAAAAAAAAAAAAAAAANwTgAA/////////4AAAAAAAAAgP//////////////////////////////////////////A" +
  "AAAAAAAAAAAAAAAYAAAAAB///g8k//8AAAAAAAAAAP///////////////////////////////////////////EAAAAAAAAAAAAAAAAAAAAYAAmAAAAD/wAAAAAAAAAAH////////////" +
  "//////5////////////////////////AAAAAAAAAAAAAAAAAAAAD4gAAAAIefsAAAAAAAAAAAP//////////////////D///////////////////////wAAAAAAAAAAAAAAAAAAAAAAA" +
  "AAABfv+AAAAAAAAAAAJn8v///////////////4f//////////////////////4AAAAAAAAAAAAAAAAAAAAAAAAAABh7/QAAAAAAAAAAAAAAB/n/iYH/////////B////////////////" +
  "/////fgAAAAAAAAAAAAAAAAAAAAAAAAAAAw9/gAAAAAAAAAAAAAAAAACAAAB/f//////wP///////////////////+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAcH0AAAAAAAAAAAAAAAAA" +
  "AAAAAcB//////+AH//////////////////+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABgAAAAAAAAAAAAAAAAAAAAAAAAH//////wAP////////////////4QAAAAAAAAAAAAAAAAAAAA" +
  "AAAAAAAAAAAA4AAAAAAAAAAAAAAAAAAAAAAAAAH/////oAAf//////////////8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/AAAAAAAAAAAAAAAAAAAAAAAAAABv/gAAAAAL//////" +
  "50/////8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAaAAAAAAAAAAAAAAAAAAAAAAAAAAH/gAAAAAAAAAn/B+AAIP/wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADwAAAAAAAAAA" +
  "AAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" +
  "AAAAAAAAAAAAAAAAAAAFYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" +
  "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAA" +
  "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" +
  "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" +
  "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" +
  "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" +
  "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" +
  "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" +
  "AAAAAAADwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP8AAAAAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" +
  "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAL8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADOAAAAAAAAAAAAAAAA" +
  "AAAAAAAAAAAAAAAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABeAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" +
  "AAAAAAAAAAAAB/wADAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" +
  "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/8AAAAAAAAA" +
  "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" +
  "AAAAAAAAAAAAAAAAAAAG/8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" +
  "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH/wAA" +
  "AAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAB8AAAAAAAAAAAAAAAAAAAAAAAAAAAP+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAfg" +
  "AAAAAAAAAAAAAAAAAAAAAAAAAAJ/4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD4AAAAAAAAAAAAAAAAAAAAAAAAAAA/+AAAAAAAAAAAAAAAAAAAAAAAAAA" +
  "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAPgAAAAAAAAAAAAAAAAAAAAAAAAAAv/wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAYAAAAA8AAAAAAAAAAAAAAAAAAAAAAAA" +
  "AAD/9AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHAAAAAHgAAAAAAAAAAAAAAAAAAAAAAAAAA//AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD" +
  "4AAAAA8AAAAAAAAAAAAAAAAAAAAAAAAAAf/kAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA2AAAAAFQAAAAAAAAAAAAAAAAAAAAAAAAAH//gAAAAAAAAAAAAAAAAAA" +
  "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGAAAAAAAAAAAAAAAAAAAAAAAAAA//8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADwAAAAAAAAAAAAAAAA" +
  "AAAAAAAAAP/+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA+AAAAAAAAAAAAAAAAAAAAAAAAAH///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" +
  "AAAAADuAAAAAAPwAAAAAAAAAAAAAAAAAAAAAAAAB///+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH/+AAAAABEAAAAAAAAAAAAAAAAAAAAAAAAAP///gAAAAAAAAAA" +
  "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB//gAAAAAgAAAAAAAAAAAAAAAAAAAAAAAAAD///4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf/8AAAAAUAAAAAAAAAA" +
  "AAAAAAAAAAAAAAAAf//+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP//AAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAH///MAAAAAAAAAAAAAAAAAIAAAAAAAAAAAAAAAA" +
  "AAAAAAcAAAAX//wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA////wAAAAAAAAAAAAAAAAHwAAAAAAAAAAAAAAAAAAAAAPwAAAz//+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP///+AAA" +
  "AAAAAAAAAAAAAD/+AAAAAAAAAAAAAAAAAAAAD/8AAO///gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD////gAAAAAAAAAAAAAAAA//wAAAAAAAAAAAAAAAAAAAAf/wAH///8AAAAAAAAA" +
  "AAAAAAAAAAAAAAAAAAAAAAA////8AAAAAAAAAAAAAAAAP/+AAAAAAAAAAAAAAAAAAAAH//wH////gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP////QAAAAAAAAAAAAAAAH//4AAAAAAA" +
  "AAAAAAAAAAAAD////////8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD////4AAAAAAAAAAAAAAAB//+AAAAAAAAAAAAAAAAAAAA/////////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf" +
  "////gAAAAAAAAAAAAAAA///wAAAAAAAAAAAAAAAAAAAP////////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP////4AAAAAAAAAAAAAAAP//+AAAAAAAAAAAAAAAAAAAH////////8AA" +
  "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAB/////gAAAAAAAAAAAAAAH///wAAAAAAAAAAAAAAAAAAB/////////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf////4AAAAAAAAAAAAAAD///8" +
  "AAAAAAAAAAAAAAAAAAA/////////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH////+AAAAAAAAAAAAAAA////gAAAAAAAAAAAAAAAAAAP////////8AAAAAAAAAAAAAAAAAAAAAAAAAA" +
  "AAAAAA/////gAAAAAAAAAAAAAAf///4AAAAAAAAAAAAAAAAAAH/////////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf////4AAAAAAAAAAAAAAH///+AAAAAAAAAAAAAAAAAAB/////" +
  "////gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/////AAAAAAAAAAAAAAB////4AB4AAAAAAAAAAAAAAAP////////4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/////4AAAAAAAAAAAA" +
  "AAf////AA+AAAAAAAAAAAAAAAH////////8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/////wAAAAAAAAAAAAAH////wAPwAAAAAAAAAAAAAAA////////+AAAAAAAAAAAAAAAAAAAA" +
  "AAAAAAAAAAAAD//////wAAAAAAAAAAAAB////+AD8AAAAAAAAAAAAAAAP////////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//////+AAAAAAAAAAAAA/////AA/AAAAAAAAAAAAAA" +
  "AB////////gAAAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAP//////wAAAAAAAAAAAAP////wAP4AAAAAAAAAAAAAAAP///////wAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAD//////8AAAA" +
  "AAAAAAAAH////8AB+AAAAAAAAAAAAAAAA///////8AAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAA///////gAAAAAAAAAAAB////+AAfgAAAAAAAAAAAAAAAB//////+AAAAAAAAAAAAAA" +
  "AAAAAAAAAAAAAAAAAAAP//////8AAAAAAAAAAAA/////4AH8AAAAAAAAAAAAAAAAB/////+AAAAAAAAAgAAAAAAAAAAAAAAAAAAAAAAAD//////+AAAAAAAAAAAAf/////AB/AAAAAAA" +
  "AAAAAAAAAAf/////AAAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAB///////wAAAAAAAAAAAH/////4AfwAAAAAAAAAAAAAAAAD/////wAAAAAADEAAAAAAAAAAAAAAAAAAAAAAAAA/////" +
  "//8AAAAAAAAAAAB//////AH8AAAAAAAAAAAAAAAAAv///P8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA////////AAAAAAAAAAAAf/////8B/gAAAAAAAAAAAAAAAAD///B+AAAAAAAC" +
  "AAAAAAAAAAAAAAAAAAAAAAAAA////////4AAAAAAAAAAAH//////gH8AAAAAAAAAAAAAAAAAf//AfgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf///////+AAAAAAAAAAAB//////8Af" +
  "AAAAAAAAAAAAAAAAAD//gH4AAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAP////////gAAAAAAAAAAAP//////ADgAAAAAAAAAAAAAAAAAc/4B8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" +
  "D////////4AAAAAAAAAAAD//////wA4AAAAAAAAAAAAAAAAAAH+AcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB////////+AAAAAAAAAAAA//////8ACAAAAAAAAAAAAAAAAAAB/wHAA" +
  "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf////////wAAAAAAAAAAAH//////AAAAAAAAAAAAAAAAAAAAAP6AgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP////////+AAAAAAAAAAAA//" +
  "////wAAAAAAAAAAAAAAAAAAAAGAAIAAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/////////gAAAAAAAAAAAP/////8AAAAAAAAAAAAAAAAAAAAAAACAAAAAAAAAAAAAAAAAAAAAAAAAA" +
  "AAAAAAB/////////+AAAAAAAAAAAH/////+AAAAAAAAAAAAAAAAAABGAAAAADAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//////////gAAAAAAAAAAB//////AAAAAAAAAAAAAAAAAABg" +
  "wAAAAHIAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/////////8AAAAAAAAAAAf/////wAAAAAAAAAAAAAAAAAHvDAAAPDgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH//////////AAAAAAA" +
  "AAAAH/////8AAAAAAAAAAAAAAAAH4AAAAAvw4AEgAAAAAAAAAAAAAAAAAAAAAAAAAAAB//////////wAAAAAAAAAAD//////AAAAAAAAAAAAAAAB/wAAAAAD/4AAAAAAAAAAAAAAAAAA" +
  "AAAAAAAAAAAAA//////////8AAAAAAAAAAA//////wAAAAAAAAAAAAAAA8QAAAABB//ABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf//////////AAAAAAAAAAAP/////4AAAAAAAAAAAAA" +
  "AACAAAAAAQf/zggAAAAAAAAAAAAAAAAAAAAAAAAAAAAH//////////wAAAAAAAAAAH//////gAAAAAAAAAAAAAAOAAAkAAAP/gEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD//////////A" +
  "AAAAAAAAAAB//////wAAAAAAAAAAAAAAHgAAJAAAf/4AwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf/////////gAAAAAAAAAAA//////+AAAAAAAAAAAAAAD4AECwABf/8AAAAAAAAAAAA" +
  "AAAAAAAAAAAAAAAAAAAD////////fwAAAAAAAAAAAf//////gAAAAAAAAAAAAAD+AfhsC8d/4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABf///////6AAAAAAAAAAAAP//////8AAAAAA" +
  "AAAAAAAA/Af8eAAGPwAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf//////z+AAAAAAAAAAAAH///////gAAAAAAAAAAAAAfoP+DhADngAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH////" +
  "//38AAAAAAAAAAAAB///////8AAAAAAAAAAAAAnwD/4mAB5AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAA//////+4AAAAAAAAAAAAAf///////gAAAAAAAAAAAAD4B/+JAAAAAAAAAAA" +
  "AAAAAAAAAAAAAAAAAAAAAAAAAAP//////0AAAAAAAAAAAABH///////4AAAAAAAAAAAAB8Af/iEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB//////+AAAAAAAAAAAAAA///////" +
  "/gAAAAAAAAAAACfoH/+IRgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP//////gAAAAAAAAAAAAAP///////8AAAAAAAAAAAAPsBP/AAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" +
  "AAD//////wAAAAAAAAAAAAAD////////gAAAAAAAAAAAHnAD/wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/////4AAAAAAAAAAAAAA////////8AAAAAAAAAAADzgAH4AAAAA" +
  "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/////+AAAAAAAAAAAAAAP////////gAAAAAAAAAABx4AA/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//////AAAAAAAAAAMAAD/" +
  "////////8AAAAAAAAAAA4eAAP4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/////gAAAAAAAAAH/4A//////////gAAAAAAAAAAYPgAA/AAAAAAAAAAAAAAAAAAAAAAAAAAAAA" +
  "AAAAAAAAAD////4AAAAAAAAAAD//gf/////////8AAAAAAAgAAABwAAGCGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA////8AAAAAAAAAAD//////////////AAAAAAAMAAAA4AA" +
  "AgDQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEf///+AAAAAAAAAAD//////////////4AAAAAADAAAAYAAAAAcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADH////AAAAAAAAAA" +
  "A//////////////+AAAAAABwAAAOAAAAA/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH7f///AAAAAAAAAAAf//////////////wAAAAAGIAAADAQAAQBwAAAAAAAAAAAAAAAAAAAA" +
  "AAAAAAAAAAAAAADhD9//gAAAAAAAAAAH//////////////8AAAAABwAAAAgGAACDIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADwAff7oAAAAAAAAAAD///////////////AAAAAA+A" +
  "AAAIBwAAQEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4AH/gAAAAAAAAAAAB/////////////8H4AAAAAPwAAADA/AAAdAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAeAAMAAAAAA" +
  "AAAAAAA/////////////+ACAAAAAH4AAAAw/4AAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPgAAgAAAAAAAAAAAA//////////////wAAAAAAB/AAAAMP+AADUAAAAAAAAAAAAAA" +
  "AAAAAAAAAAAAAAAAAAAAH4AAAAAAAAAAAAAAAP/////////////7AAAAAAA/wAAADP/wAAiAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP+AAAAAAAAAAAAAAAD/////////////8/AA" +
  "AAAAP8AAAA//4AAJgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf/wAAAAAAAAAAAAAAA/////////////+f8AAAAAD/AAAAf/+AACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/8AA" +
  "AAAAAAAAAAACAP////////////8H/wAAAAB/wAAAH//gABgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH9cAAAAAAAAAAAAAAAD/////////////B//AAAAAf8AAAB//wAAYAAAAAAAA" +
  "AAAAAAAAAAAAAAAAAAAAAAAAD//AAAAAAAAAAAAAAAAAf////////////wf/4AAAAP/4AAO//4AAHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP//wAAAAAAAAAAAAAAAAH//////////" +
  "//4P//4AAAD/+AAD//8AABwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH//+AAcCAAAAAAAAAAAAB////////////+H///AAAA//4AA//+AAAcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH" +
  "/4vgAAJ+AAAAAAAAAAAAf////////////B///4AAAP//AAP//BgAAAAAAAAAAAAAAAAAAAAAMAAAAAAAAAAAH/4B4AgAfAAAAAAAAAAAAH////////////g////AAAD//4AH//wYAAAA" +
  "AAAAAAAAAAAAAAAAACAAAAAAAAAAAD/+AfAAPIAAAAAAAAAAAAB////////////4f///wAAB///gB//+BAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAA//AHwAHAAAAAAAAAAAAAA////" +
  "////////+P///+AAAP//8B///wgAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAP/wAMADgAAAAAAAAAAAAAP////////////j////wAB////Af///MAAAAAAAAAAAAAAAAAAAAAAAAAAAA" +
  "AAAAAD/4AACLgAAAAAAAAAAAAAD////////////x////+AA/////3////8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB/+AAAfAAAAAAAAAAAAAAAf///////////4f////AAL///////" +
  "//+wEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQ//gAAAAAAAAAAAAAAAAAAH///////////8H////gAH///////////BgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIf/4AAAAQAAAAAAAAAAA" +
  "AAA////////////H///HgAD///////////8YAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMP/+AAAAAAAAAAAAAAAAAAAH///////////x///gwAB////////////iAAAAAAAAAAAAAAAAAAA" +
  "AAAAAAAAAABP//wAAAwAAAAAAAAAAAAAAB///////////4///oE//////////////8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAx//8AAAMAAAAAAAAAAAAAAAP//////////+P//4Af///" +
  "///////////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4///AAAHAAAAAAAAAAAAAAAB///////////H//+D3//////////////4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAsf//wAABwAAAAA" +
  "AAAAAAAAAgf//////////z///D////////////////ABAAAAAAAAAAAAAAAAAAAAAAAAAAACf//+AAA4AAAAAAAAAAAAAAAA//////////////h////////////////4AAAAAAAAAAAA" +
  "AAAAAAAAAAAAAAAABP///4AAOAAAAAAAAAAAAAAAAH/////////9v//w////////////////+AAAAAAAAAAAAAAAAAAAAAAAAAAAABj////fAXAAAAAAAAAAAAAAAAA/////////////" +
  "+f////////////////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAZ///////wAAAAAAAAAAAAAAAAP//////P///////////////////////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAOf//////" +
  "8AAAAAAAAAAAAAAAAD/////+B/4Yf///////////////////+ABAAAAAAAAAAAAAAAAAAAAAAAAAAD////////gAAAAAAAAAAAAAAAAf/////A/gAH////////////////////gAYAAA" +
  "AAAAAAAAAAAAAAAAAAAAAAB////////8AAAAAAAAAAAAAAAAH/////ADgAA////////////////////wACAAAAAAAAAAAAAAAAAAAAAAAAABf////////gAAAAAAAAAAAAAAAA////8A" +
  "AAAAP///////////////////8ABsAAAAAAAAAAAAAAAAAAAAAAAAAf////////+AAAAAAAAAAAAAAAAD///8AAAAAB///////////////////+AAOsAAAAAAAAAAAAAAAAAAAAAAAA//" +
  "////////4AAAAAAAAAAAAAAAAf///gAAAAMf///////////////////ADA/cAAAAAAAAAAAAAAAAAAAAAAAP//////////AAAAAAAAAAAAAAAAGD//8AAAAAH///////////////////" +
  "wA8HfwAAAAAAAAAAAAAAAAAAAAAAH//////////wAAAAAAAAAAAAAAABAH/+AAAAIx////////////////////APBD8AAAAAAAAAAAAAAAAAAAAAAB//////////8AAAAAAAAAAAAAAA" +
  "AfgAbwwBgP////8H///////////////4BwA/AAAAAAAAAAAAAAAAAAAAAAA//////////+AAAAAAAAAAAAAAAB/+AAA8AYH////8B///////////////kA8AB4AAAAAAAAAAAAAAAAAA" +
  "AAAAf//////////IAAAAAAAAAAAAAAAf/gAAAADH/////Af//////////////wA+AAOAAAAAAAAAAAAAAAAAAAAAAP//////////7AAAAAAAAAAAAAAAH/8ACAEHh/////wH////////" +
  "//////6APAABwAAAAAAAAAAAAAAAAAAAAAD///////////4AAAAAAAAAAAAAAB//CAwDD4f////8D///////////////xjgAAcAAAAAAAAAAAAAAAAAAAAAB///////////+AAAAAAAA" +
  "AAAAAAAf/4AMB99Lf////x////////////////P+AAHAAAAAAAAAAAAAAAAAAAAAAf///////////wAAAAAAAAAAAAAAD//ABA8P//f4P/wD/////////////////wABAAAAAAAAAAAA" +
  "AAAAAAAAAAH////////////wAAAAAAAAAAAAAB//8Ah+D/8DwB/4B/////////////////+AAYAAAAAAAAAAAAAAAAAAAAAB////////////4AAAAAAAAAAAAAAf//AM8D/+AAAf8B//" +
  "////////////////wAGwAAAAAAAAAAAAAAAAAAAAAf////////////AAAAAAAAAAAAAAH//4gfD//wAAf/B//////////////////+4AfgAAAAAAAAAAAAAAAAAAAAH////////////4" +
  "MCAAAAAAAAAAAAAD//PH//+AAP/g////////////////////gHgAAAAAAAAAAAAAAAAAAAAA/////////////xwAAAAAAAAAAAAAA///h///gIP/wH///////////////////8AgAAAA" +
  "AAAAAAAAAAAAAAAAAP/////////////jgAAAAAAAAAAAAAP//5///8Pb/+Bv///////////////////gQBAAAAAAAAAAAAAAAAAAAAD/////////////+CAAAAAAAAAAAAAD///////g" +
  "w//4H///////////////////8AAEAAAAAAAAAAAAAAAAAAAA//////////////hACAAAAAAAAAAAB/////////H//g////////////////////gwAAAAAAAAAAAAAAAAAAAAAf//////" +
  "///////wALgAAAAAAAAAAA/////////////////////////////////8IAAAAAAAAAAAAAAAAAAAAAE////////////78A/wAAAAAAAAAAA/////////////////////////////////" +
  "/iAAAAAAAAAAAAAAAAAAAAADf////////////PgH4AAAAAAAAAAAA/////////////////////////////////8gAAAAAAAAAAAAAAAAAAAADv////////////8GA4AAAAAAAAAAAAT/" +
  "////////////////////////////////OAAAAAAAAAAAAAAAAAAAAD3/////////////5eMAAAAAAAAAAACgP////////////////////////////////zgABAAAAAAAAAAAAAAAAAAf" +
  "///////////////xgAAAAAAAAAAAP5////////////////////////////////8wAAAAAAAAAAAAAAAAAAAAL//////////4/////wAAAAAAAAAAED+H////////////////////////" +
  "////////sAABgAAAAAAAAAAAAAAAAH//////////8P////+AAAAAAAAAAD4/w/////////////////////////////////AAA4AAAAAAAAAAAAAAAAj///////////j/////gAAAAAAA" +
  "AAAePwD///////////////////////////////+wAAPAAAAAAAAwAAAAAAAR///////////g////rgAAAAAAAAAAPg8AD/f////////////////////////////XAAAD4AAAAAAABIAA" +
  "AAAAAf//////////4f////wAAAAAAAAAAA8eAAQBz///////////////////////////4AAAB/AAAAAAAAD4AAAAABP//////////8B////gAAAAAAAAAAAEfAAOgAP/////////////" +
  "/////////////4AAAAf8AAAAAAAALAAAAAAL//////////AAH///wAAAAAAAAAAAAfgADvAD///////////////////////////gAAAH/AAAAAAAAAYAAAAA///////////AAB///wAA" +
  "AAAAAAAAAADwAA4/A///////////////////////////8AAAA/8AAAAAAAABjAAAAR/////////4AACf//8AAAAAAAAAAAAF+AACfiOf//////////////////////////wAAAH/AAAA" +
  "AAAAAPAAAAP/////////8AAAP//+AAAAAAAAAAAAAuAAAP8BH///////////////////////////AAAAfAAAAAAAAAV8AAAN//////////AAAP/+fAAAAAAAAAAAAAAAAPj/AH//////" +
  "/////////////////////8AAAB4AAAAAAAA/+MAAPv////////+AAAB/+BgAAAAAAAAAAAAAAAF//8Af////////////////////////////cPgPAAAAAAAz//7uH///////////gAAA" +
  "P/gAAAAA4AAAAAAAAAAAf//gYB/////////////////////////////wA+gAAAAABf//fP///////////8AAAH/4AAAAEcAAAAAAAAAAAP//g///////////////////////////////" +
  "/Aj/8AAAAAv////////////////AAAA/wBAAAD/wAAAAAAAAAAH//wH///////////////////////////////4Of/wAAAAH////////////////8AACfwHAAAB/8AAAAAAAAAAAf/+D" +
  "/////////////////////////////////3//wAAAA/////////////////wAMAAfMAAA//gAAAAAAAAAAD//w/////////////////////////////////////4ABAAf////////////" +
  "////CwggPegAAf/8AAAAHAAAAAAL//D////////////////////////////////////8AEAAH////////////////+fwIP/gAAD//AAAAH/gAAAAAf/8P//D////////////////////" +
  "////////////+APgH//////////////////3gH//hAAD//wAAAB/+AAAAAB//g//zH///////////////////////////////++/8D//////////////////ewAB/hwAB///4AAB3/AA" +
  "AAAAP/8f/4B///////////////////////////////////gGL/////////////////nAAf5/AAv///4AAQCAAAAAAB////8/yf/////h//////////////////////////4AAf//////" +
  "////////////8AB/9AAf////AAAAAAAAAAAP///7/+GP/////H/////////////////////////8AAP///////////Az/Ar/z+A7f6AAC////8AAAAAAAAAAB/////+Bx/////8/////" +
  "////////////////////wAAP///////////944AGHuPwA/4AAAH/////gAAAAAAAAAL////8AgAZ9/8/vf///////////////////////wAAAP/////h7//+A/96Dh0B8K//gAAB////" +
  "//AAAAAAAAAA7///gAAGAAP4fn////////////////////v+H/4AAAB////4AAIwAH///wX4ADs//wAAGP/////+AAAAAAAAABP/xAAAAAAMAf5////////////////////gARwAAAAA" +
  "D/4AAAAAAAB7//gB+H////QAADz/////c4AAAAAAAAAAlUAAAAACwAL+P///////////////////4AAAAOAAAAAAAAAAAADgH//wEfD///7gAAAj//////+AAAAAAAAAAAAAAAAADwAA" +
  "/OP9//////////8P7//8AAAAAAEAAAAAAAAAAAAH+f/94H5A+/t8AAAAf/////7+AAAAAAAAAAAAAAAAAH4AAD4h5//////////+AAH+eAAAAAAAAAAAAAAAAAAAA/57k8N+yHt9AAAA" +
  "AP//////1oAAAAAAAAAAAAAAAAAeAAA+IJ/////7/////wAAgAAAAAAAAAAAAAAAAAAAAAH/8ADg/P48f8AAAAB///////GgAAAAAAAAAAAAAAAAB4AACBAf/////x//AfQAAPAAAAAA" +
  "AAAAAAAAAAAAAAAB/4AAAAAAAAAAAAAB////////YAAAAAAAAAAAAAAAAAPgAAAAAB/////xgAAAAAGAAAAAAAAAAAAAAAAAAAAAAAAB8AAB5//+AAAAAf////////AAAAAAAAAAAAAA" +
  "AAAA/AAAAAAP/////wAAAAANIDwAAAAAAAAAAAAAAAAAAAADb8fCOceB/AAAAAf////////wAAAAAAAAAAAAAAAAAB/AAAAAAP////9AAAAAX94AAAAAAAAAAAAAAAAAAAAAPhwcBTjv" +
  "gAYAA/X/////////gAAAAAAAAAAAAAAAAAAAP4AAAAAAB///AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAfgAAABgD/+gB////////////wAAAAAAAGAAAAAAAAAAACAAAACAID9gAAAAAAA" +
  "AAAAAAAAAAAAAAAAAAAAAAAAAeBAAfAd/4Af//////////+6AAAAAAADw8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHwH8ePT//4f///////////wAAAAAAA" +
  "uOcAAAAAAAAAAAAAAAAAA/gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADwAH/h//AD///////////AAAAAAAH/wAAAAAAAAAAAAAAAAEfzQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" +
  "AAAAEf/37/zgD//////////mAAAAAADzvfwAAAAAAAAAAAAAABv8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH/gAP//H///////////QAAAAAAAAgAAAAASgAOAAAAAAAfwAAA" +
  "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGP3/f/vCf////////z/8AAAAAAAAAAAAAAABoAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB2/f///C/3Pn//x/nA" +
  "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABf3//wAAA79////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" +
  "AAAAAAAAAAAAAAAAAAAAAAAAAn//4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" +
  "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" +
  "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" +
  "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" +
  "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" +
  "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" +
  "AAAAAA==";

const heritage: readonly Motif[] = ["circle", "diamond", "spark"];
const inks = ["#449c5f", "#fcf7b6", "#f97daa"] as const;
const clamp = (n: number) => Math.max(0, Math.min(1, n));
const wrap = (n: number) => n - Math.floor(n);
function ease(a: number, b: number, n: number) {
  const t = clamp((n - a) / (b - a));
  return t * t * (3 - 2 * t);
}
let map: Uint8Array | undefined;
function landMap() {
  if (map) return map;
  const bytes = atob(landBits);
  map = new Uint8Array(512 * 256);
  for (let i = 0; i < map.length; i++)
    map[i] = ((bytes.charCodeAt(i >> 3) >> (7 - (i & 7))) & 1) * 255;
  return map;
}
export type GlobeCell = {
  row: number;
  column: number;
  x: number;
  y: number;
  depth: number;
  coverage: number;
  morph: number;
  light: number;
  fill: string;
  outline: string;
  radius: number;
  phase: number;
  latitude: number;
  longitude: number;
};
export type GlobeOptions = {
  renderer?: "auto" | "webgl" | "software";
  rimColor?: string;
  motifs?: readonly Motif[];
  colors?: readonly string[];
  outline?: string;
  idleColor?: string;
  density?: number;
  seed?: number;
  tilt?: number;
  longitude?: number;
  reverse?: boolean;
  motion?: "sweep" | "ripple";
  entrance?: "continuous" | "reference";
  /** Called in a [-1,1] cell coordinate system centered on each visible land cell. */
  drawCell?: (
    context: CanvasRenderingContext2D,
    cell: GlobeCell,
    drawDefault: () => void,
  ) => void;
};
export type MotifGlobeProps = GlobeOptions & {
  width?: CSSProperties["width"];
  height?: CSSProperties["height"];
  aspectRatio?: CSSProperties["aspectRatio"];
  background?: string;
  period?: number;
  phase?: number;
  label?: string;
  decorative?: boolean;
  children?: React.ReactNode;
  style?: CSSProperties;
  className?: string;
};
function intro(t: number) {
  // The reference opens on one cell, establishes the silhouette quickly, then holds its scale.
  return (
    0.027 +
    0.973 *
      (0.62 * ease(0.055, 0.081, t) +
        0.23 * ease(0.075, 0.135, t) +
        0.15 * ease(0.13, 0.25, t)) *
      (1 -
        0.14 * ease(0.68, 0.826, t) -
        0.26 * ease(0.825, 0.881, t) -
        0.6 * ease(0.879, 0.91, t))
  );
}
function rand(x: number, y: number, k: number) {
  let n =
    Math.imul(x + 87, 0x85ebca6b) ^
    Math.imul(y + 219, 0xc2b2ae35) ^
    Math.imul(k, 0x27d4eb2d);
  n = Math.imul(n ^ (n >>> 16), 0x7feb352d);
  n = Math.imul(n ^ (n >>> 15), 0x846ca68b);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
}
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

function marksFor(motifs: readonly Motif[]) {
  const list = motifs.length ? motifs : heritage;
  if (list.length === 3 && list.every((m, i) => m === heritage[i]))
    return makeMarks(2);
  const count = 120,
    angles = Array.from(
      { length: count },
      (_, i) => (i * TAU) / count - Math.PI / 2,
    );
  const profiles = list.map((m) => angles.map((a) => radiusAt(m, a)));
  return Array.from({ length: list.length === 1 ? 1 : 65 }, (_, j) => {
    const q = (j / 64) * (list.length - 1),
      lo = Math.floor(q),
      hi = Math.min(lo + 1, list.length - 1),
      p = new Path2D();
    angles.forEach((a, i) => {
      const r =
        profiles[lo][i] + (profiles[hi][i] - profiles[lo][i]) * (q - lo);
      const x = r * Math.cos(a),
        y = r * Math.sin(a);
      if (i) p.lineTo(x, y);
      else p.moveTo(x, y);
    });
    p.closePath();
    return p;
  });
}
// Real sphere and orthographic camera. The render target has one sample per motif.
function makeGpuSurface(side: number, preferHardware: boolean) {
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: false,
    stencil: false,
    powerPreference: "low-power",
  });
  const gl = renderer.getContext();
  const debug = gl.getExtension("WEBGL_debug_renderer_info");
  if (
    preferHardware &&
    debug &&
    /swiftshader|llvmpipe|software rasterizer/i.test(
      String(gl.getParameter(debug.UNMASKED_RENDERER_WEBGL)),
    )
  ) {
    renderer.dispose();
    renderer.forceContextLoss();
    return null;
  }
  renderer.setSize(side, side, false);
  renderer.setClearColor(0, 0);
  const world = new THREE.Scene(),
    camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.01, 8);
  camera.position.z = 3;
  const land = new THREE.DataTexture(landMap(), 512, 256, THREE.RedFormat);
  land.wrapS = THREE.RepeatWrapping;
  land.magFilter = land.minFilter = THREE.LinearFilter;
  land.needsUpdate = true;
  const shader = new THREE.ShaderMaterial({
    uniforms: { land: { value: land } },
    vertexShader: `
 varying vec2 surfaceUV; varying vec3 facing;
 void main(){surfaceUV=uv;facing=normalMatrix*normal;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}
 `,
    fragmentShader: `
 uniform sampler2D land;varying vec2 surfaceUV;varying vec3 facing;
 void main(){gl_FragColor=vec4(texture2D(land,surfaceUV).r, max(0.,normalize(facing).z),surfaceUV.x,surfaceUV.y);}
 `,
  });
  const geo = new THREE.SphereGeometry(1, 96, 64),
    mesh = new THREE.Mesh(geo, shader);
  world.add(mesh);
  const rt = new THREE.WebGLRenderTarget(side, side, {
    depthBuffer: true,
    stencilBuffer: false,
    magFilter: THREE.NearestFilter,
    minFilter: THREE.NearestFilter,
  });
  const pixels = new Uint8Array(side * side * 4);
  return {
    sample(scale: number, lat: number, lon: number) {
      mesh.rotation.set(
        (lat * Math.PI) / 180,
        ((-90 - lon) * Math.PI) / 180,
        0,
        "XYZ",
      );
      mesh.scale.setScalar(scale);
      renderer.setRenderTarget(rt);
      renderer.clear();
      renderer.render(world, camera);
      renderer.readRenderTargetPixels(rt, 0, 0, side, side, pixels);
      renderer.setRenderTarget(null);
      return pixels;
    },
    lost: () => renderer.getContext().isContextLost(),
    dispose() {
      rt.dispose();
      geo.dispose();
      shader.dispose();
      land.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
// The same orthographic ray/sphere intersection provides a WebGL-free browser fallback.
function cpuSurface(
  side: number,
  pixels: Uint8Array,
  scale: number,
  latitude: number,
  longitude: number,
) {
  const m = landMap(),
    lat = (latitude * Math.PI) / 180,
    co = Math.cos(lat),
    si = Math.sin(lat);
  pixels.fill(0);
  for (let j = 0; j < side; j++)
    for (let i = 0; i < side; i++) {
      const x = (((i + 0.5) * 2) / side - 1) / scale,
        y = (((j + 0.5) * 2) / side - 1) / scale,
        z2 = 1 - x * x - y * y;
      if (z2 <= 0) continue;
      const z = Math.sqrt(z2),
        lon = wrap(
          0.5 +
            ((longitude * Math.PI) / 180 + Math.atan2(x, co * z - si * y)) /
              TAU,
        ),
        v =
          0.5 + Math.asin(Math.max(-1, Math.min(1, y * co + z * si))) / Math.PI;
      const off = 4 * (j * side + i),
        u = lon * 512 - 0.5,
        k = Math.floor(u),
        vF = v * 256 - 0.5,
        l = Math.floor(vF),
        fx = u - k,
        fy = vF - l;
      const row0 = Math.min(255, Math.max(0, l)) * 512,
        row1 = Math.min(255, Math.max(0, l + 1)) * 512;
      const west = (k + 512) % 512,
        east = (west + 1) % 512;
      pixels[off] =
        (1 - fy) * ((1 - fx) * m[row0 + west] + fx * m[row0 + east]) +
        fy * ((1 - fx) * m[row1 + west] + fx * m[row1 + east]);
      pixels[off + 1] = z * 255;
      pixels[off + 2] = lon * 255;
      pixels[off + 3] = v * 255;
    }
  return pixels;
}
function buildPainter(
  canvas: HTMLCanvasElement,
  opts: GlobeOptions,
  swatches: HTMLElement,
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("A Canvas 2D context is required.");
  const side =
    2 * Math.round((Math.max(9, Math.min(101, opts.density ?? 41)) - 1) / 2) +
    1;
  const cells = Array.from({ length: side * side }, (_, i) => ({
    col: i % side,
    row: Math.floor(i / side),
    noise: rand(i % side, Math.floor(i / side), opts.seed ?? 7),
    tone: rand(i % side, Math.floor(i / side), (opts.seed ?? 7) + 2099),
  }));
  const marks = marksFor(opts.motifs ?? heritage);
  let gpu: ReturnType<typeof makeGpuSurface> | null = null;
  try {
    if (opts.renderer !== "software")
      gpu = makeGpuSurface(side, opts.renderer !== "webgl");
  } catch {
    /* Canvas will sample the same land mask on the CPU. */
  }
  const buffer = new Uint8Array(side * side * 4);
  let w = 0,
    h = 0,
    ratio = 1;
  return {
    resize() {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      if (!w || !h) return;
      ratio = Math.min(window.devicePixelRatio || 1, 2, 4096 / Math.max(w, h));
      canvas.width = Math.max(1, Math.round(w * ratio));
      canvas.height = Math.max(1, Math.round(h * ratio));
    },
    draw(progress: number) {
      if (!w || !h) return;
      const t = wrap(progress),
        scale = opts.entrance === "reference" ? intro(t) : 1;
      const yaw =
        (opts.longitude ?? 16) +
        (opts.reverse ? 1 : -1) *
          360 *
          (opts.entrance === "reference" ? ease(0.08, 0.9, t) : t);
      if (gpu?.lost()) {
        gpu.dispose();
        gpu = null;
      }
      const pixels = gpu
        ? gpu.sample(scale, opts.tilt ?? 14, yaw)
        : cpuSurface(side, buffer, scale, opts.tilt ?? 14, yaw);
      const pitch = (Math.min(w, h) * 0.9) / side,
        r = pitch * 0.5;
      const [outline, off, rim, ...colors] = Array.from(
        swatches.children,
        (el) => getComputedStyle(el).color,
      );
      ctx.resetTransform();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = outline;
      ctx.lineWidth = 0.06;
      ctx.lineJoin = "round";
      if (scale <= 0.065) {
        const a =
          opts.entrance === "reference"
            ? ease(0.018, 0.05, t) * (1 - ease(0.925, 0.966, t))
            : 1;
        ctx.globalAlpha = a;
        ctx.setTransform(
          r * ratio,
          0,
          0,
          r * ratio,
          (w * ratio) / 2,
          (h * ratio) / 2,
        );
        ctx.fillStyle = colors[0];
        ctx.fill(marks[Math.floor(marks.length / 2)]);
        ctx.globalAlpha = 1;
        return;
      }
      ctx.setTransform(ratio, 0, 0, ratio, (w / 2) * ratio, (h / 2) * ratio);
      ctx.globalAlpha = ease(0.1, 0.65, scale);
      ctx.strokeStyle = rim;
      ctx.lineWidth = Math.max(0.65, pitch * 0.06);
      ctx.beginPath();
      ctx.arc(0, 0, pitch * side * 0.5 * scale, 0, TAU);
      ctx.stroke();
      for (const c of cells) {
        const k = 4 * ((side - 1 - c.row) * side + c.col),
          coverage = pixels[k] / 255;
        if (coverage < 0.08) continue;
        const u = (c.col + 0.5) / side,
          v = (c.row + 0.5) / side,
          depth = pixels[k + 1] / 255;
        const morph = ease(
          0.23,
          0.78,
          0.5 + 0.5 * Math.sin(TAU * ((u - 0.44) * 0.86 - t)),
        );
        const location =
          opts.motion === "ripple"
            ? Math.hypot(u - 0.5, v - 0.5) * 1.7
            : (u - 0.115) * 0.92;
        const light = 0.5 + 0.5 * Math.cos(TAU * (location - 2 * t));
        const active = c.noise < 0.87 * (0.5 + 0.5 * ease(0.05, 0.74, light));
        const fill = active
          ? colors[
              Math.min(
                colors.length - 1,
                Math.floor(c.tone * colors.length * (0.4 + 0.6 * light)),
              )
            ]
          : off;
        const x = w / 2 + (c.col - (side - 1) / 2) * pitch,
          y = h / 2 + (c.row - (side - 1) / 2) * pitch;
        const path = marks[Math.round(morph * (marks.length - 1))];
        ctx.setTransform(r * ratio, 0, 0, r * ratio, x * ratio, y * ratio);
        ctx.globalAlpha = (0.76 + 0.24 * depth) * ease(0.08, 0.87, coverage);
        const drawDefault = () => {
          ctx.fillStyle = fill;
          ctx.strokeStyle = outline;
          ctx.lineWidth = 0.06;
          ctx.fill(path);
          ctx.stroke(path);
        };
        if (opts.drawCell) {
          ctx.save();
          try {
            opts.drawCell(
              ctx,
              {
                row: c.row,
                column: c.col,
                x,
                y,
                depth,
                coverage,
                morph,
                light,
                fill,
                outline,
                radius: r,
                phase: t,
                longitude: (pixels[k + 2] / 255) * 360 - 180,
                latitude: (pixels[k + 3] / 255) * 180 - 90,
              },
              drawDefault,
            );
          } finally {
            ctx.restore();
          }
        } else drawDefault();
      }
      ctx.globalAlpha = 1;
      ctx.resetTransform();
    },
    dispose() {
      gpu?.dispose();
    },
  };
}
/** One optical-size globe. All dimensions and colors are CSS values; children form a separate overlay. */
export function MotifGlobe({
  width = "100%",
  height,
  aspectRatio = 1,
  background = "transparent",
  colors = inks,
  outline = "#edd9be",
  idleColor = "#233b2c",
  period = 5,
  phase,
  label = "Rotating motif globe",
  decorative = false,
  children,
  style,
  className,
  ...options
}: MotifGlobeProps) {
  const cv = useRef<HTMLCanvasElement>(null),
    sw = useRef<HTMLSpanElement>(null),
    painter = useRef<ReturnType<typeof buildPainter> | null>(null);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  const paused = typeof phase === "number" && Number.isFinite(phase);
  const shapeKey = JSON.stringify(options.motifs ?? heritage);
  useLayoutEffect(() => {
    if (!cv.current || !sw.current) return;
    const el = cv.current,
      draw = buildPainter(el, options, sw.current);
    painter.current = draw;
    let id = 0,
      visible = true;
    const start = performance.now(),
      mq = matchMedia("(prefers-reduced-motion: reduce)");
    const time = (now: number) =>
      paused
        ? phaseRef.current!
        : mq.matches
          ? 0.27
          : (now - start) / (Math.max(0.05, period) * 1000);
    const tick = (now: number) => {
      draw.draw(time(now));
      id = requestAnimationFrame(tick);
    };
    function sync() {
      cancelAnimationFrame(id);
      if (!paused && (!visible || document.hidden)) return;
      draw.draw(time(performance.now()));
      if (!paused && !mq.matches) id = requestAnimationFrame(tick);
    }
    const resize = () => {
      draw.resize();
      sync();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    const io = new IntersectionObserver((e) => {
      visible = e[0].isIntersecting;
      sync();
    });
    io.observe(el);
    mq.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    return () => {
      cancelAnimationFrame(id);
      mq.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
      io.disconnect();
      ro.disconnect();
      draw.dispose();
      painter.current = null;
    };
  }, [
    shapeKey,
    options.density,
    options.seed,
    options.renderer,
    options.tilt,
    options.longitude,
    options.reverse,
    options.motion,
    options.entrance,
    options.drawCell,
    period,
    paused,
  ]);
  const colorKey = JSON.stringify([
    outline,
    idleColor,
    options.rimColor ?? "rgba(130,160,134,.19)",
    ...colors,
  ]);
  useLayoutEffect(() => {
    if (paused) painter.current?.draw(phase!);
    else if (matchMedia("(prefers-reduced-motion: reduce)").matches)
      painter.current?.draw(0.27);
  }, [paused, phase, colorKey]);
  return (
    <div
      className={className}
      style={{
        position: "relative",
        isolation: "isolate",
        minWidth: 0,
        overflow: "hidden",
        width,
        height,
        aspectRatio,
        background,
        ...style,
      }}
    >
      <span ref={sw} aria-hidden="true" style={{ display: "none" }}>
        {[
          outline,
          idleColor,
          options.rimColor ?? "rgba(130,160,134,.19)",
          ...(colors.length ? colors : inks),
        ].map((color, i) => (
          <span key={i} style={{ color }} />
        ))}
      </span>
      <canvas
        ref={cv}
        aria-label={decorative ? undefined : label}
        role={decorative ? undefined : "img"}
        aria-hidden={decorative || undefined}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          display: "block",
          pointerEvents: "none",
        }}
      />
      {children && <div style={{ position: "relative" }}>{children}</div>}
    </div>
  );
}



