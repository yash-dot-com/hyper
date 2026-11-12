"use client";

import {useId} from "react";
import {motion,useReducedMotion} from "motion/react";

const stickers = {
  heart: { colors:["#ffdfd7","#ff929d","#eb496e","#ab3159"], path:"M60 96C49 88 14 65 14 40C14 18 42 10 60 32C78 10 106 18 106 40C106 65 72 89 60 96Z", gloss:"M24 39Q25 28 38 26" },
  chat: { colors:["#deffe5","#8bedcb","#3abda9","#277d89"], path:"M34 20H86Q107 20 107 41V65Q107 87 84 87H54L32 100Q27 103 29 96L32 85Q13 82 13 65V42Q13 22 34 20Z", gloss:"M22 42Q22 30 36 29" },
  bell: { colors:["#fff4c4","#ffda76","#ffa345","#d37a34"], path:"M54 24Q52 14 60 14Q68 14 66 24Q89 28 90 51Q91 68 101 78Q106 86 97 87H23Q14 86 19 78Q29 67 30 51Q31 29 54 24Z", gloss:"M40 50Q40 37 51 34" },
};
export type StickerKind = keyof typeof stickers;
export function GradientSticker({kind,size=96,decorative=false}:{kind:StickerKind;size?:number|string;decorative?:boolean}) {
  const id=useId(), reduce=useReducedMotion();
  const {colors:[rim,light,body,edge],path,gloss}=stickers[kind];
  return <motion.svg viewBox="0 0 120 116" role={decorative?undefined:"img"} aria-hidden={decorative||undefined} aria-label={kind}
    initial="rest" animate="rest" whileHover="hover" whileTap="press" style={{width:size,maxWidth:"100%",height:"auto",display:"block"}}>
    <defs>
      <linearGradient id={id+"face"} x2=".6" y2="1"><stop stopColor={light}/><stop offset=".55" stopColor={body}/><stop offset="1" stopColor={edge}/></linearGradient>
      <radialGradient id={id+"shine"} cx=".25" cy=".1" r=".8"><stop stopColor={rim} stopOpacity=".85"/><stop offset="1" stopColor={light} stopOpacity="0"/></radialGradient>
    </defs>
    <motion.g style={{transformOrigin:kind==="bell"?"60px 20px":"60px 60px"}} variants={{rest:{scale:1,rotate:0,y:0},hover:reduce?{}:kind==="bell"?{rotate:[0,-12,8,-4,0]}:kind==="heart"?{scale:1.07,rotate:-4}:{y:-3,rotate:3},press:reduce?{}:{scale:.96}}}>
      {kind==="bell" && <path d="M48 83h24q0 17-12 17T48 83Z" fill={edge} stroke="#fffaf4" strokeWidth="5"/>}
      <path d={path} transform="translate(0 3)" fill={edge} stroke="#fffaf4" strokeWidth="6" strokeLinejoin="round"/>
      <path d={path} fill={`url(#${id}face)`}/><path d={path} fill={`url(#${id}shine)`}/>
      <path d={gloss} fill="none" stroke={rim} strokeWidth="3.5" strokeLinecap="round"/>
      {kind==="chat" && [0,1,2].map(i=><motion.circle key={i} cx={42+i*18} cy="55" r="4.5" fill="#faffed" variants={{rest:{y:0},hover:reduce?{}:{y:[0,-4,0],transition:{duration:.32,delay:i*.09}}}}/>)}
    </motion.g>
  </motion.svg>;
}
