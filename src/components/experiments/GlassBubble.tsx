import type { CSSProperties, ReactNode } from "react";

type Props = { children: ReactNode; side?: "incoming" | "outgoing" };

export function GlassBubble({children, side="outgoing"}:Props) {
  const incoming = side === "incoming";
  const radius = incoming ? "9px 28px 28px 28px" : "28px 9px 28px 28px";
  const surface:CSSProperties = {
    background: [
      "radial-gradient(ellipse 38% 36% at 52% 109%, #ffffffda, transparent)",
      incoming ? "radial-gradient(ellipse 78% 120% at 50% 20%, #9fbbd7 0%, #bcd2e5 48%, #eaf2f8 100%)"
        : "radial-gradient(ellipse 78% 120% at 49% 20%, #388ffc 0%, #79b5ff 48%, #cfe5ff 100%)",
    ].join(","),
    borderRadius:"inherit", padding:".7em 1.15em .76em",
    boxShadow:"inset 5px 1px 12px #ffffff48, inset -4px -3px 10px #ffffff38",
  };
  return <div style={{alignSelf:incoming?"flex-start":"flex-end",maxWidth:"86%",width:"fit-content",padding:"2px",
    borderRadius:radius,background:"linear-gradient(127deg,#f7fbff 3%,#b8dafe 32%,#a4ccf8 60%,#f7fcff 82%,#b9d9fc)",
    boxShadow:"0 2px 2px #0004, 0 8px 22px -12px #0009",color:"#0e2c48",lineHeight:1.45,letterSpacing:"-.015em",
    overflowWrap:"anywhere",whiteSpace:"pre-wrap",textAlign:"start"}}>
    <div style={surface}>{children}</div>
  </div>;
}
