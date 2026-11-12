
// A dot is empty space. Each other character names a material.
const models = {
  Globe: ["....gggg....","..ggggggbb..",".ggggggbbbb.",".gggbggbbbb.","bbggbbbbbbbb","bbbgggbbbbgg","bbgggggbbbgg","bbbgggggbbgg",".bbbggggbbb.",".bbbgggbbbb.","..bbggbbbb..","....gbbb...."],
  Cursor: ["u............", "uu...........", "uwu..........", "uwwu.........", "uwwwu........", "uwwwwu.......", "uwwwwwu......", "uwwwwwwu.....", "uwwwwwwwu....", "uwwwwwwwwu...", "uwwwwwwwwwu..", "uwwwwwwwwwwu.", "uwwwwwwwwwwwu", "uwwwwwwwuuuuu", "uwwwwuwwu....", "uwwwuuwwu....", "uwwu.uwwwu...", "uwu...uwwu...", "uu....uwwwu..", "u......uwwu..", "........uu..."],
  Television: ["..k.......k..","...k.....k...","....k...k....",".....kkk.....",".kkkkkkkkkkk.","kkkkkkkkkkkkk","kkwybgprukkck","kkwybgprukkkk","kkwybgprukkck","kkwybgprukkkk","kkwybgprukkkk",".kkkkkkkkkkk.","..kk.....kk.."],
  Horns: ["..kk.....kk.",".kwwk...kwwk",".kwwk...kwwk",".kwwk...kwwk",".kwwkkkkkwwk",".kwwkwwkwwwk",".kwwkwwkwwwk",".kkkkwwkwwwk","kwwwwkkwwwwk","kwwwwwwwwwwk",".kwwwwwwwwk.","..kwwwwwwk..","...kkkkkk..."],
  Coin: ["....yyyy....", "..yyooooyy..", ".yoooyooooy.", ".yooyyyyooy.", "yoooyooooooy", "yoooyyyooooy", "yoooooyyoooy", "yooooooyoooy", ".yooyyyyooy.", ".yoooyooooy.", "..yyooooyy..", "....yyyy...."],
  Rainbow: ["....rrrrrr....", "...roooooor...", "..royyyyyyor..", ".royggggggyor.", "roygbbbbbbgyor", "roygbuuuubgyor", "roygbu..ubgyor", "roygbu..ubgyor"],
  Bloom: [".....pp.....","...pppppp...",".pppppppppp.","pppppyyppppp",".pppyyyyppp.","..pppyyppp..",".pppppppppp.","..pppggppp..",".....gg..gg.","..gg.gg.gg..","...gggggg...",".....gg....."],
  Camera: ["...kkkk.....", "..kcccck.yy.", ".cccccccccc.", "cwwccccccycc", "ccccckkkcccc", "kkkkuuuukkkk", "kkkubwwuukkk", "kkkubbuuukkk", "kkkkuuuukkkk", ".kkkkkkkkkk."],
  Landscape: ["bbbbbbbbbbbb","buuuuuuuyyyb","buwwuuuuyyyb","bwwwwwuuuuub","buuuuuuuguub","buuguuugggub","bugggugggggb","bggggggggggb","bggggggggggb","bbbbbbbbbbbb"],
  Mushroom: ["....rrrr....","..rrwwrrrr..",".rrrwwrrwwr.","rrwwrrrrwwrr","rrwwrrrrrrrr","rrrrrrwwrrrr",".kkkkkkkkkk.","....wwww....","...wwkwwkw..","...wwwwwww..","....wwwww..."],
} as const;

export type StickerName = keyof typeof models;
export const stickerNames = Object.keys(models) as StickerName[];
const materials: Record<string,string> = {
  g:"#38bd70", b:"#6ecbfa", u:"#326ce0", w:"#fff8e8", k:"#333640",
  c:"#bcc6cc", y:"#ffc748", o:"#dd962f", p:"#f589bd", r:"#f15a42",
};
function shade(hex:string, light:number) {
  const n=parseInt(hex.slice(1),16);
  return "rgb("+[n>>16,(n>>8)&255,n&255].map(v=>Math.round(light>1?v+(255-v)*(light-1):v*light)).join(",")+")";
}
function build(name:StickerName) {
  const rows=models[name], width=Math.max(...rows.map(row=>row.length));
  const height=(x:number,y:number)=>{
    const key=rows[y]?.[x];
    if(!key || key===".") return 0;
    const relief = name==="Coin"?key==="y":name==="Globe"?key==="g":name==="Television"?key==="c":name==="Bloom"?key==="y":name==="Landscape"?key==="w"||key==="y":name==="Camera"?key==="u":false;
    return (name==="Television"?3:2)+Number(relief);
  };
  // Orthographic projection: x runs right, y down, z towards the viewer.
  const yaw = 24 * Math.PI / 180, pitch = 16 * Math.PI / 180;
  const cy = Math.cos(yaw), sy = Math.sin(yaw);
  const cp = Math.cos(pitch), sp = Math.sin(pitch);
  const roll = name === "Cursor" ? -22 * Math.PI / 180 : 0;
  const project = (x:number, y:number, z:number) => {
    const u = 10 * (x * cy - z * sy), v = 10 * (y * cp + (x * sy + z * cy) * sp);
    return [u * Math.cos(roll) - v * Math.sin(roll), u * Math.sin(roll) + v * Math.cos(roll)];
  };
  const depth = (cell: {x:number; y:number; z:number}) =>
    (cell.x * sy + cell.z * cy) * cp - cell.y * sp;
  const faces:{points:string;color:string}[]=[];
  const xs:number[]=[],ys:number[]=[];
  function face(vertices:number[][],hex:string,light:number) {
    const points=vertices.map(([x,y,z])=>{const [u,v]=project(x,y,z);xs.push(u);ys.push(v);return u+","+v;}).join(" ");
    faces.push({points,color:shade(hex,light)});
  }
  const cells=[];
  for(let y=0;y<rows.length;y++) for(let x=0;x<width;x++) for(let z=0;z<height(x,y);z++) cells.push({x,y,z});
  // The viewer sees right, top and front. Paint far cubes before nearer ones.
  cells.sort((a,b) => depth(a) - depth(b));
  for(const {x,y,z} of cells){
    const hex=materials[rows[y][x]],grain=((x*17+y*31)%7-3)*.009;
    if(height(x,y-1)<=z) face([[x,y,z],[x+1,y,z],[x+1,y,z+1],[x,y,z+1]],hex,1.43+grain);
    if(height(x+1,y)<=z) face([[x+1,y,z],[x+1,y+1,z],[x+1,y+1,z+1],[x+1,y,z+1]],hex,.63+grain);
    if(height(x,y)===z+1) face([[x,y,z+1],[x+1,y,z+1],[x+1,y+1,z+1],[x,y+1,z+1]],hex,.98+grain);
  }
  const side=Math.max(Math.max(...xs)-Math.min(...xs),Math.max(...ys)-Math.min(...ys))*1.17;
  return {faces,viewBox:[(Math.min(...xs)+Math.max(...xs)-side)/2,(Math.min(...ys)+Math.max(...ys)-side)/2,side,side].join(" ")};
}
const cache=new Map<StickerName,ReturnType<typeof build>>();
export function VoxelSticker({name="Globe",size=240}:{name?:StickerName;size?:number|string}) {
  let mesh=cache.get(name);
  if(!mesh){mesh=build(name);cache.set(name,mesh);}
  return <svg viewBox={mesh.viewBox} aria-label={name + " voxel sticker"} role="img" style={{width:size,maxWidth:"100%",height:"auto",display:"block"}}>
    {mesh.faces.map((face,i)=><polygon key={i} points={face.points} fill={face.color} stroke={face.color} strokeWidth=".18" strokeLinejoin="miter"/>)}
  </svg>;
}
