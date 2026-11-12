import type { ButtonHTMLAttributes } from "react";

// Make one repeatable foil swatch. Each noise channel cuts a different
// group of reflective flakes out of the same multiscale grain.
const swatch = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128">
<filter id="foil" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
<feTurbulence type="fractalNoise" baseFrequency=".32" numOctaves="2" seed="31" stitchTiles="stitch"/>
<feComponentTransfer>
<feFuncR type="linear" slope="5" intercept="-1.9"/>
<feFuncG type="linear" slope="6" intercept="-2.45"/>
<feFuncB type="linear" slope="5" intercept="-1.95"/>
</feComponentTransfer></filter><rect width="100%" height="100%" filter="url(#foil)"/></svg>`;
const texture = `url("data:image/svg+xml,${encodeURIComponent(swatch)}")`;

export function FoilButton({ children = "Prism", type = "button", className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type={type} className={`foil-pill ${className}`} {...props}>
    <span className="foil-face" style={{backgroundImage:`linear-gradient(175deg,#fff9,transparent 28%,#26132f44 73%,#fff6), ${texture}, linear-gradient(118deg,#cc7040,#a38acb 27%,#30cfda 40%,#dfd155 54%,#ff768d 72%,#8b7dd2)`}}>
      <span className="foil-caption">{children}</span>
    </span>
    <style>{`
      .foil-pill {position:relative;display:inline-grid;vertical-align:middle;isolation:isolate;border:0;
        font:inherit;font-weight:650;color:white;border-radius:999px;padding:0 0 6px;cursor:pointer;
        background:linear-gradient(90deg,#5c395a,#ad787f 12%,#695078 48%,#65466b 85%,#4b354e);
        box-shadow:0 9px 14px -6px #2e1c3d77,0 2px 3px #34213938}
      .foil-face {position:relative;overflow:hidden;display:grid;place-items:center;min-height:52px;
        padding:.65em 2em;border-radius:inherit;background-size:100% 100%,92px 92px,150% 100%;
        background-blend-mode:normal,hard-light,normal;
        box-shadow:inset 0 2px 2px #fff, inset 2px 0 4px #fff9,inset -2px -4px 6px #381c456b;
        transition:transform .16s ease,background-position .45s ease}
      .foil-face::before {content:"";position:absolute;inset:0;border-radius:inherit;
        background:linear-gradient(112deg,transparent 26%,#fff8 48%,transparent 65%) -120px 0 / 110px 100% no-repeat;
        transition:background-position .5s ease}
      .foil-caption {position:relative;line-height:1.15;color:#302339;text-shadow:0 1px 0 #fff9;
        padding:.22em .55em}
      .foil-pill:is(:hover,:focus-visible):enabled .foil-face {background-position:0 0,2px 0,100% 0}
      .foil-pill:is(:hover,:focus-visible):enabled .foil-face::before {background-position:calc(100% + 100px) 0}
      .foil-pill:active:enabled .foil-face {transform:translateY(5px)}
      .foil-pill:focus-visible {outline:2px solid #5f4496;outline-offset:5px}
      .foil-pill:disabled {opacity:.55;cursor:default}
      @media(prefers-reduced-motion:reduce){.foil-face,.foil-face::before{transition:none}}
    `}</style>
  </button>;
}
