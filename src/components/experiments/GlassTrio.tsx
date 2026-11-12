"use client";

import { useEffect, useRef } from "react";

const lenses = [
  { name: "Coral", x: 50, y: 33, color: "#ee7268" },
  { name: "Cobalt", x: 34, y: 59, color: "#579de8" },
  { name: "Leaf", x: 66, y: 59, color: "#66ce60" },
];

export function GlassTrio({ interactive = true }: { interactive?: boolean }) {
  const frame = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!interactive || !frame.current) return;
    const stage = frame.current;
    const discs = Array.from(stage.querySelectorAll<HTMLElement>("[data-lens]"));
    const bodies = lenses.map(() => ({ x: 0, y: 0, vx: 0, vy: 0 }));
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let held = -1, pointer = -1, originX = 0, originY = 0, targetX = 0, targetY = 0;
    let raf = 0, last = 0;

    function step(now: number) {
      const dt = Math.min((now-last)/1000, 1/30);
      last = now;
      let moving = false;
      // Coupling springs pull toward neighbors' displacements; anchors restore the triangle.
      const forces = bodies.map((body, i) => {
        let ax = -48*body.x, ay = -48*body.y;
        for (const other of bodies) {
          ax += 36*(other.x-body.x);
          ay += 36*(other.y-body.y);
        }
        if (i === held) {
          ax += 650*(targetX-body.x);
          ay += 650*(targetY-body.y);
        }
        const drag = reduced.matches || i === held ? 42 : 12;
        return [ax-drag*body.vx, ay-drag*body.vy];
      });
      bodies.forEach((body,i) => {
        body.vx += forces[i][0]*dt;
        body.vy += forces[i][1]*dt;
        body.x += body.vx*dt;
        body.y += body.vy*dt;
        moving ||= Math.hypot(body.vx,body.vy,body.x,body.y) > .035;
        discs[i].style.left = (lenses[i].x+body.x)+"%";
        discs[i].style.top = (lenses[i].y+body.y)+"%";
      });
      raf = moving && (held < 0 || bodies.some(b=>Math.hypot(b.vx,b.vy)>.035)) ? requestAnimationFrame(step) : 0;
    }
    function wake() {
      if (!raf) { last = performance.now()-8; raf = requestAnimationFrame(step); }
    }
    function down(event: PointerEvent) {
      const i = discs.indexOf(event.target as HTMLElement);
      if (i < 0 || pointer !== -1 || event.button !== 0) return;
      held = i; pointer = event.pointerId;
      originX = event.clientX; originY = event.clientY;
      targetX = bodies[i].x; targetY = bodies[i].y;
      const rect = stage.getBoundingClientRect();
      originX -= targetX*rect.width/100; originY -= targetY*rect.height/100;
      discs[i].setPointerCapture(pointer);
    }
    function move(event: PointerEvent) {
      if (pointer !== event.pointerId) return;
      const rect = stage.getBoundingClientRect();
      targetX = Math.max(-20, Math.min(20, (event.clientX-originX)*100/rect.width));
      targetY = Math.max(-18, Math.min(18, (event.clientY-originY)*100/rect.height));
      wake();
    }
    function release(event: PointerEvent) {
      if (pointer !== event.pointerId) return;
      pointer = held = -1; wake();
    }
    function nudge(event: KeyboardEvent) {
      const i = discs.indexOf(event.target as HTMLElement);
      const directions: Record<string, number[]> = {ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]};
      const direction = directions[event.key];
      if (i < 0 || !direction) return;
      event.preventDefault();
      bodies[i].vx = direction[0]*95; bodies[i].vy = direction[1]*95; wake();
    }
    stage.addEventListener("pointerdown",down);
    stage.addEventListener("pointermove",move);
    stage.addEventListener("lostpointercapture",release);
    stage.addEventListener("keydown",nudge);
    return () => {
      cancelAnimationFrame(raf);
      stage.removeEventListener("pointerdown",down);
      stage.removeEventListener("pointermove",move);
      stage.removeEventListener("lostpointercapture",release);
      stage.removeEventListener("keydown",nudge);
    };
  },[interactive]);

  return <div ref={frame} role="group" aria-label="Glass Trio" style={{position:"relative",width:"min(100%, 440px)",height:"auto",aspectRatio:"1.25",display:"grid",placeItems:"center",background:"#d8dbe0",isolation:"isolate",overflow:"hidden"}}>
    {lenses.map(lens=><span key={lens.name} data-lens="" role="img" tabIndex={interactive?0:undefined}
      aria-label={lens.name+" lens. Drag or use arrow keys to nudge."}
      style={{position:"absolute",left:lens.x+"%",top:lens.y+"%",width:"43%",maxWidth:"none",height:"auto",aspectRatio:"1",maxHeight:"none",
        transform:"translate(-50%,-50%)",borderRadius:"50%",touchAction:"none",cursor:interactive?"grab":undefined,
        background:`radial-gradient(ellipse at 28% 14%,#ffffff55,transparent 52%),radial-gradient(ellipse at 68% 78%,${lens.color},transparent 64%),${lens.color}dd`,
        mixBlendMode:"multiply",boxShadow:`inset 2px 2px 3px #fffe,inset -2px -3px 4px #ffffffb8,inset 0 0 14px #18334732,0 18px 21px -13px ${lens.color}99`}}/>)}
  </div>;
}
