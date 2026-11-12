import type { ButtonHTMLAttributes, HTMLAttributes } from "react";

// Draw each ink plate on its own angled screen. Dot area follows ink density.
const inks = ["#00cfe9", "#ff008a", "#ffe600"];
const plates = inks.map((ink, plate) => {
  const angle = [15, 75, 0][plate] * Math.PI / 180;
  const dots = [];
  for (let row = -20; row <= 20; row++) {
    for (let col = -20; col <= 20; col++) {
      const x = 100 + 6 * (col * Math.cos(angle) - row * Math.sin(angle));
      const y = 60 + 6 * (col * Math.sin(angle) + row * Math.cos(angle));
      if (x < -4 || x > 204 || y < -4 || y > 124) continue;
      const wave = Math.sin(x / 30 + Math.cos(y / 21) + plate * 1.6);
      const density = .46 + .31 * wave + .21 * Math.cos(y / 17 - x / 35 + plate);
      dots.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(3.85*Math.sqrt(density)).toFixed(2)}"/>`);
    }
  }
  return `<g fill="${ink}" style="mix-blend-mode:multiply">${dots.join("")}</g>`;
});
const print = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 120"><rect width="200" height="120" fill="#fffaf0"/>${plates.join("")}</svg>`;
const paper = {backgroundImage:`url("data:image/svg+xml,${encodeURIComponent(print)}")`,backgroundSize:"cover",backgroundPosition:"center"};

export function HalftoneButton({children,style,type="button",...props}:ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type={type} {...props} style={{...paper,border:"2px solid #211d1a",borderRadius:8,
    padding:"9px 14px",boxShadow:"2px 3px 0 #211d1a",cursor:"pointer",...style}}>
    <span style={{background:"#fffcf3",color:"#211d1a",padding:"2px 8px",fontWeight:650}}>{children}</span>
  </button>;
}

export function HalftoneSticker({children,style,...props}:HTMLAttributes<HTMLSpanElement>) {
  return <span {...props} style={{...paper,display:"inline-grid",placeItems:"center",width:"5em",aspectRatio:"1",
    borderRadius:"50%",border:"4px solid #fffaf0",boxShadow:"0 2px 4px #30201940",transform:"rotate(-9deg)",...style}}>
    <strong style={{background:"#211d1a",color:"#fffaf0",padding:"1px 6px"}}>{children}</strong>
  </span>;
}
