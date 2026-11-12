import { useId, type ComponentPropsWithoutRef, type CSSProperties } from "react";

const field = [
  ".#..#.#",
  "..###..",
  ".##.##.",
  ".##..#.",
  "#...##.",
  "##.##..",
  ".####.#",
];

// Alternate half-column offsets form diagonals. Only selected sites swell
// enough to cross the filter threshold and form bridges with their neighbors.
export function InkFusion({ children, ink = "#1c1918", style, className = "", ...props }:
  ComponentPropsWithoutRef<"div"> & { ink?: string }) {
  const filter = useId();
  return <div {...props} className={`ink-fusion ${className}`} style={{position:"relative",isolation:"isolate",...style}}>
    <svg className="ink-fusion-field" aria-hidden="true" focusable="false" viewBox="0 0 160 150" preserveAspectRatio="xMidYMid slice"
      style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none",borderRadius:"inherit",zIndex:-1}}>
      <defs><filter id={filter} x="-15%" y="-15%" width="130%" height="130%" colorInterpolationFilters="sRGB">
        <feGaussianBlur stdDeviation="2.3"/>
        <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -8"/>
      </filter></defs>
      <g fill={ink} filter={`url(#${filter})`}>
        {field.flatMap((row,y)=>Array.from(row,(cell,x)=>{
          const joins=cell==="#";
          return <circle key={y*7+x} cx={13+x*21+(y%2)*9} cy={12+y*21} r={4+(x*3+y*5)%3}
            style={{"--fuse-scale":joins?2.8:1,"--fuse-delay":`${(x+y)*9}ms`} as CSSProperties}/>;
        }))}
      </g>
    </svg>
    {children}
    <style>{`
      .ink-fusion > .ink-fusion-field circle {transform-box:fill-box;transform-origin:center;transition:transform 440ms cubic-bezier(.22,.75,.18,1)}
      @media(hover:hover){.ink-fusion:hover > .ink-fusion-field circle {transform:scale(var(--fuse-scale));transition-delay:var(--fuse-delay)}}
      .ink-fusion:focus-visible > .ink-fusion-field circle,.ink-fusion:focus-within > .ink-fusion-field circle,.ink-fusion:active > .ink-fusion-field circle {transform:scale(var(--fuse-scale))}
      @media(prefers-reduced-motion:reduce){.ink-fusion > .ink-fusion-field circle {transition:none!important}}
    `}</style>
  </div>;
}
