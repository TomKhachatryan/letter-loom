const fs=require('fs');
const path=require('path');
const OUT=path.join(__dirname,'levels.json');
const dict=new Set(fs.readFileSync('/usr/share/dict/words','utf8').split('\n').map(w=>w.toUpperCase()));
const L=[
 // Construction theme: singular, well-known construction words only (see levels/construction-words.txt)
 ["TRAP",["TRAP","TARP","TAP","TAR"],[]],
 ["BEND",["BEND","BED","END"],[]],
 ["STONE",["STONE","SET","NET","TON"],[]],
 ["PAINT",["PAINT","TIN","PIN","TAP","PIT","PAN"],[]],
 ["DELAY",["DELAY","LEAD","DAY","LAY"],[]],
 ["STAGE",["STAGE","GATE","SEAT","GAS","SET"],[]],
 ["PATCH",["PATCH","PATH","TAP","CAP"],[]],
 ["TRADE",["TRADE","TREAD","RATE","DATE","TAR"],[]],
 ["PANEL",["PANEL","PLANE","PANE","LANE","PLAN","PAN"],[]],
 ["CRATE",["CRATE","CART","RATE","ACRE","ARC","TAR"],[]],
 ["STAKE",["STAKE","TASK","SEAT","SET"],[]],
 ["SLATE",["SLATE","SEAL","SEAT","SET"],[]],
 ["CLIENT",["CLIENT","LINE","TILE","TIN","TIE","NET"],[]],
 ["LOADER",["LOADER","LOAD","ROAD","LEAD","ROD","ORE"],[]],
 ["MORTAR",["MORTAR","TAR","RAM","ROT","MAT"],[]],
 ["TROWEL",["TROWEL","TOWER","LOT","ROT","ORE"],[]],
 ["PAVING",["PAVING","PIN","VAN","GAP","PAN"],[]],
 ["SPRING",["SPRING","SIGN","PIN","RIP","RIG"],[]],
 ["STRAIN",["STRAIN","STAIN","STAIR","TIN","TAR"],[]],
 ["TIMBER",["TIMBER","TRIM","ITEM","TIER","BIT","RIB","RIM","TIE"],[]],
 ["BRIDGE",["BRIDGE","RIDGE","GRID","BED","BID","DIG","RIB","RIG"],[]],
 ["PERMIT",["PERMIT","PIER","ITEM","TIER","TRIM","PIT","RIP","RIM","TIE"],[]],
 ["BUILDER",["BUILDER","BUILD","BID","BED","LID","RIB"],[]],
 ["WELDING",["WELDING","WELD","WING","LINE","DIG","END","LID"],[]],
 ["TENSION",["TENSION","STONE","NOISE","SITE","TIN","TIE","SET","NET","TON"],[]],
 ["GRANITE",["GRANITE","GRAIN","GATE","RATE","RENT","TIER","TIN","TIE","RIG","NET","TAR"],[]],
 ["BRACKET",["BRACKET","BRACE","TRACK","CRATE","CART","RAKE","RATE","ACRE","BAR","ARC","TAR"],[]],
 ["PLASTER",["PLASTER","STAPLER","PLATE","SLATE","STRAP","LASER","TRAP","TARP","STEP","TAPE","SEAL"],[]],
 ["PAINTER",["PAINTER","PAINT","TAPE","PANE","PIER","RENT","RATE","TRAP","TARP","TIER","TIN","PIN"],[]],
 ["DRAWING",["DRAWING","DRAIN","GRAIN","GRIND","WING","GRID","DIG","RIG"],[]],
];
const counts=s=>{const c={};for(const ch of s)c[ch]=(c[ch]||0)+1;return c};
const fits=(w,l)=>{const a=counts(l),b=counts(w);return Object.keys(b).every(k=>(a[k]||0)>=b[k])};
function place(words){
  // try orderings, pick best
  let best=null;
  const base=[...words].sort((a,b)=>b.length-a.length||a.localeCompare(b));
  for(let attempt=0;attempt<400;attempt++){
    let order=[...base];
    if(attempt>0){ // seeded shuffle keeping first longest
      let s=attempt*9301+49297; const rnd=()=>(s=(s*9301+49297)%233280)/233280;
      const rest=order.slice(1); for(let i=rest.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[rest[i],rest[j]]=[rest[j],rest[i]];}
      rest.sort((a,b)=> (b.length-a.length)*(rnd()<.5?1:0) );
      order=[order[0],...rest];
    }
    const grid=new Map(); const dirs=new Map(); const placed=[];
    const key=(x,y)=>x+','+y;
    const put=(w,x,y,d)=>{for(let i=0;i<w.length;i++){const k=key(d?x:x+i,d?y+i:y);grid.set(k,w[i]);dirs.set(k,(dirs.get(k)||'')+d);}placed.push({w,x,y,d});};
    put(order[0],0,0,0);
    const can=(w,x,y,d)=>{let inter=0;const dx=d?0:1,dy=d?1:0;
      if(grid.has(key(x-dx,y-dy))||grid.has(key(x+dx*w.length,y+dy*w.length)))return -1;
      for(let i=0;i<w.length;i++){const cx=x+dx*i,cy=y+dy*i,g=grid.get(key(cx,cy));
        if(g!==undefined){if(g!==w[i]||(dirs.get(key(cx,cy))||'').includes(String(d)))return -1;inter++;}
        else{ // perpendicular neighbors must be empty
          if(grid.has(key(cx+dy,cy+dx))||grid.has(key(cx-dy,cy-dx)))return -1;}
      }
      // must not overlap a word in same direction entirely
      return inter;};
    for(const w of order.slice(1)){
      let cand=null;
      for(const p of placed){for(let i=0;i<p.w.length;i++){for(let j=0;j<w.length;j++){if(p.w[i]!==w[j])continue;
        const d=1-p.d; const px=p.d?p.x:p.x+i, py=p.d?p.y+i:p.y;
        const x=d?px:px-j, y=d?py-j:py; const inter=can(w,x,y,d);
        if(inter>0){ // bbox
          let xs=[...grid.keys()].map(k=>+k.split(',')[0]),ys=[...grid.keys()].map(k=>+k.split(',')[1]);
          xs.push(x,x+(d?0:w.length-1));ys.push(y,y+(d?w.length-1:0));
          const W=Math.max(...xs)-Math.min(...xs)+1,H=Math.max(...ys)-Math.min(...ys)+1;
          const sc=inter*10-W*H*0.3-Math.max(0,W-9)*50-Math.abs(W-H)*0.5;
          if(!cand||sc>cand.sc)cand={x,y,d,sc};}
      }}}
      if(cand)put(w,cand.x,cand.y,cand.d);
    }
    const xs=placed.flatMap(p=>[p.x,p.d?p.x:p.x+p.w.length-1]),ys=placed.flatMap(p=>[p.y,p.d?p.y+p.w.length-1:p.y]);
    const mx=Math.min(...xs),my=Math.min(...ys),W=Math.max(...xs)-mx+1,H=Math.max(...ys)-my+1;
    const score=placed.length*1000-W*H-Math.max(0,W-9)*500-Math.max(0,H-10)*500;
    if(!best||score>best.score)best={score,W,H,words:placed.map(p=>({w:p.w,x:p.x-mx,y:p.y-my,d:p.d}))};
  }
  return best;
}
const out=[];
for(const [letters,ans,bonus] of L){
  for(const w of [...ans,...bonus]) if(!fits(w,letters)) console.error('BAD',letters,w);
  for(const w of ans) if(!dict.has(w)&&!dict.has(w.replace(/S$/,''))) console.error('notdict?',letters,w);
  const r=place(ans);
  const dropped=ans.filter(a=>!r.words.find(p=>p.w===a));
  const bon=[...new Set([...bonus,...dropped])].filter(b=>fits(b,letters)&&!r.words.find(p=>p.w===b));
  console.error(letters,`${r.W}x${r.H}`,'placed',r.words.length,'/',ans.length,dropped.length?'dropped '+dropped:'');
  out.push({l:letters,W:r.W,H:r.H,words:r.words,bonus:bon});
}
fs.writeFileSync(OUT,JSON.stringify(out));
// render a couple of grids as a sanity check
for(const lv of out.slice(5,7)){const g=Array.from({length:lv.H},()=>Array(lv.W).fill('.'));for(const p of lv.words)for(let i=0;i<p.w.length;i++)g[p.d?p.y+i:p.y][p.d?p.x:p.x+i]=p.w[i];console.error(g.map(r=>r.join(' ')).join('\n')+'\n');}
