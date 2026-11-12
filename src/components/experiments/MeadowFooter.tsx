"use client";

import { useEffect, useRef } from "react";

type LinkGroup = { title: string; links: readonly { label: string; href: string }[] };
const directory: LinkGroup[] = [
  {title:"Directory",links:[{label:"Home",href:"#home"},{label:"Paper Noticeboard",href:"#paper-noticeboard"}]},
  {title:"Motion",links:[{label:"Ink Fusion",href:"#ink-fusion"}]},
];
const grain = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.77' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23g)'/%3E%3C/svg%3E\")";

// Seeded outlines keep every impression of the same tree identical.
function canopy(seed:number) {
  let state=seed;
  const random=()=>((state=(Math.imul(state,1664525)+1013904223)>>>0)/4294967296);
  return Array.from({length:125},(_,i)=>{
    const a=i*Math.PI*2/125, r=1+random()*.11+.065*Math.sin(11*a);
    return (i?"L":"M")+(Math.cos(a)*r*38).toFixed(1)+" "+(Math.sin(a)*r*44).toFixed(1);
  }).join("")+"Z";
}
const crown=canopy(71);
export function MeadowFooter({brand="Hype",description="An open directory of visual experiments.",groups=directory,credit}:{
  brand?:string;description?:string;groups?:readonly LinkGroup[];credit?:string;
}) {
  const footer=useRef<HTMLElement>(null);
  useEffect(()=>{
    const node=footer.current!;
    const scrollport=node.closest<HTMLElement>("[data-meadow-scroll]");
    const scrollTarget=scrollport ?? window;
    const reduced=matchMedia("(prefers-reduced-motion: reduce)");
    let frame=0;
    function paint(){
      frame=0;
      const rect=node.getBoundingClientRect();
      if(reduced.matches){node.style.setProperty("--meadow-shift","0px");return;}
      const travel=scrollport ? scrollport.scrollTop/Math.max(1,scrollport.scrollHeight-scrollport.clientHeight) : (innerHeight-rect.top)/(innerHeight+rect.height*.25);
      node.style.setProperty("--meadow-shift",((Math.max(0,Math.min(1,travel))-.5)*130)+"px");
    }
    function schedule(){if(!frame)frame=requestAnimationFrame(paint)}
    paint();scrollTarget.addEventListener("scroll",schedule,{passive:true});
    window.addEventListener("resize",schedule);reduced.addEventListener("change",schedule);
    return ()=>{cancelAnimationFrame(frame);scrollTarget.removeEventListener("scroll",schedule);window.removeEventListener("resize",schedule);reduced.removeEventListener("change",schedule)};
  },[]);
  return <footer ref={footer} className="meadow-footer">
    <svg viewBox="0 0 960 330" preserveAspectRatio="none" aria-hidden="true" className="meadow-art">
      <g fill="#fff0d7" style={{transform:"translateY(calc(var(--meadow-depth) * .08))"}}>
        <path d="M-10 85Q17 86 30 95Q32 51 115 52Q194 48 195 88Q194 100 228 99Q284 99 294 115Q300 126 252 126L174 126Q145 131 176 137Q213 147 348 140Q397 132 412 151Q425 168 376 166Q352 168 365 176Q416 193 487 178Q533 169 612 166Q699 164 704 152Q705 143 676 145Q590 153 536 151Q506 146 550 137Q585 129 622 129Q628 81 662 82Q691 81 699 120Q741 82 785 115Q812 112 824 140Q853 126 880 150Q914 141 972 151V340H-10Z"/>
        <path d="M108 26Q147 19 191 31Q219 39 228 50Q173 35 119 34Z M279 84Q295 83 311 94Q284 97 271 89Z"/>
      </g>
      <g fill="#d97c56" style={{transform:"translateY(calc(var(--meadow-depth) * .14))"}}>
        <path d="M-20 260 Q195 288 371 264 T720 259 T983 251 V355 H-20Z"/>
        {Array.from({length:57},(_,i)=> <path key={i} d={crown} transform={`translate(${i*18-14} ${(259+13*Math.sin(i*.12)+5*Math.cos(i*2)).toFixed(1)}) scale(.42 .29)`}/>)}
      </g>
      <g style={{transform:"translateY(calc(var(--meadow-depth) * .2))"}}>
        <path fill="#c4c795" d="M-10 268Q225 225 440 257T970 245V390H-10Z"/>
        <path fill="#85adb3" d="M326 249Q420 248 489 253T693 255Q598 259 542 269T327 300L497 297Q555 276 626 268T751 255Q734 250 638 253T455 250Z"/>
        <g transform="translate(620 235)">
          <path fill="#f9e2bd" d="M0 6L12 -4L24 6V18H0ZM24 6H46V18H24Z"/>
          <path fill="#ac634d" d="M-3 7L12 -7H33L48 6H24L12 -3L1 8Z"/>
          <path fill="#566b63" d="M9 10H15V18H9ZM31 9H36V13H31Z"/>
        </g>
      </g>
      <g fill="#527d97" style={{transform:"translateY(calc(var(--meadow-depth) * .32))"}}>
        <path d="M182 302L179 224L161 199L179 214L182 180L186 214L205 196L186 225L189 303Z"/>
        <path d={crown} transform="translate(161 209) scale(.65 .63)"/><path d={crown} transform="translate(184 184) scale(.78 .81)"/><path d={crown} transform="translate(205 210) scale(.63 .67)"/>
        <path fill="none" stroke="#fff0d7" strokeWidth="2" d="M180 223l-14-18m18 8 3-29m-1 34 17-16"/>
      </g>
      <g style={{transform:"translateY(calc(var(--meadow-depth) * .82))"}}>
        <path fill="#a0ab72" d="M-10 253Q212 246 412 279Q676 239 970 243V392H-10Z"/>
        <g fill="#f9edce"><path d="M-5 260Q171 254 407 280Q202 263-5 265ZM400 280Q706 246 963 250V254Q708 251 459 284ZM-5 323L171 278L-5 311ZM18 338L178 283L48 338ZM692 269L947 337H968L723 269ZM760 264L970 293V286ZM511 305L712 322L528 312Z"/></g>
      </g>
    </svg>
    <div aria-hidden="true" className="meadow-grain" style={{backgroundImage:grain}}/>
    <div className="meadow-links"><div><strong>{brand}</strong><p>{description}</p></div>
      {groups.map(group=><nav aria-label={group.title} key={group.title}><b>{group.title}</b>{group.links.map(link=><a href={link.href} key={link.href}>{link.label}</a>)}</nav>)}
    </div>
    {credit && <small>{credit}</small>}
    <style>{`
      .meadow-footer{--meadow-depth:var(--meadow-shift,0px);isolation:isolate;position:relative;overflow:hidden;background:#87b5df;color:#182f39;width:100%;container-type:inline-size}
      .meadow-art,.meadow-grain{position:absolute;pointer-events:none;width:100%;inset:auto 0 -1px;height:66%;z-index:-2}
      .meadow-grain{inset:0;height:100%;opacity:.22;mix-blend-mode:multiply;z-index:-1}
      .meadow-links{display:flex;align-items:flex-start;flex-wrap:wrap;gap:clamp(12px,4cqw,48px);padding:5cqw 5cqw 30cqw;font-size:clamp(12px,1.65cqw,16px)}
      .meadow-links>div{flex:1 1 30%}.meadow-links strong{font-size:2em;letter-spacing:-.055em}.meadow-links p{margin:.45em 0;max-width:25ch}
      .meadow-links nav{display:grid;gap:.4em}.meadow-links b{margin-bottom:.3em}.meadow-links a{color:inherit;text-decoration:none}.meadow-links a:hover,.meadow-links a:focus-visible{text-decoration:underline}
      .meadow-footer small{display:block;padding:2cqw 5cqw;font-size:clamp(10px,1.35cqw,14px);color:#25311f}
      @media(prefers-reduced-motion:reduce){.meadow-art > g{transform:none!important}}
      @container(max-width:450px){.meadow-links>div{flex-basis:100%}.meadow-links{padding-bottom:40cqw}.meadow-art{height:48%}}
    `}</style>
  </footer>;
}
