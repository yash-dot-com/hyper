import type { HTMLAttributes, CSSProperties } from "react";

type Props = HTMLAttributes<HTMLElement> & {
  label?: string;
  colors?: readonly [string, string, string];
};

export function FrostedTileFooter({
  label = "Bloom", colors = ["#287940", "#65db13", "#d4ee16"],
  style, className = "", children, ...props
}: Props) {
  return <footer {...props} className={`frosted-tile-footer ${className}`}
    style={{ "--fern": colors[0], "--shoot": colors[1], "--pollen": colors[2], ...style } as CSSProperties}>
    <span className="ft-panes" aria-hidden="true">
      {Array.from({length:16}, (_,i)=><i key={i} style={{backgroundPosition:`${(i%8)*100/7}% ${Math.floor(i/8)*100}%`}}/>)}
    </span>
    <div className="ft-content"><strong>{label}</strong>{children}</div>
    <style>{`
      .frosted-tile-footer {
        --field: radial-gradient(ellipse at 66% 72%,var(--pollen),transparent 33%),
          radial-gradient(ellipse at 40% 67%,var(--shoot),transparent 51%),
          radial-gradient(ellipse at 57% 41%,var(--fern),transparent 64%);
        display:grid; align-items:end; position:relative; isolation:isolate;
        box-sizing:border-box;width:100%;min-height:clamp(140px,20vw,240px); overflow:hidden; border:0; padding:0; border-radius:0; background:#f1f4ec;
        font:inherit;
      }
      .frosted-tile-footer::before {content:"";position:absolute;inset:0;background:var(--field);filter:blur(9px);z-index:-1}
      .ft-panes {position:absolute;inset:0;display:grid;grid-template:repeat(2,1fr)/repeat(8,1fr);pointer-events:none}
      .ft-panes i {border-radius:0;background-color:#f1f4ec99;background-image:var(--field);background-size:770% 195%;
        box-shadow:inset 1px 1px 2px #ffffffaa,inset -1px -1px 2px #ffffff66,inset 2px 3px 8px #ecffdf42;
        transition:filter .22s ease}
      .ft-content {position:relative;display:flex;align-items:baseline;justify-content:space-between;
        flex-wrap:wrap;gap:1rem;padding:1.25em 1.5em;color:#183323;
        background:linear-gradient(transparent,#f1f4eccf 55%,#f1f4eced);overflow-wrap:anywhere}
      .ft-content strong {font-size:1.5em;letter-spacing:-.045em}
    `}</style>
  </footer>;
}
