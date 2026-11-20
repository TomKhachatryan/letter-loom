const fs=require('fs');
const path=require('path');
const OUT=path.join(__dirname,'levels.json');
const dict=new Set(fs.readFileSync('/usr/share/dict/words','utf8').split('\n').map(w=>w.toUpperCase()));
const L=[
 ["ART",["ART","RAT","TAR"],[]],
 ["TEA",["TEA","EAT","ATE"],["ETA"]],
 ["NOW",["NOW","OWN","WON"],[]],
 ["LIVE",["LIVE","VILE","EVIL","VEIL","LIE"],[]],
 ["STAR",["STAR","RATS","ARTS","ART","RAT","SAT","TAR"],["TSAR","TARS"]],
 ["HEART",["HEART","EARTH","HATE","HEAT","RATE","TEAR","HEAR","HAT","EAT"],["HARE","RAT","TAR","ART","ATE","TEA","THE","ERA","ETH","HER","HATER","RHEA","TEAR","TARE","HART"]],
 // 5-letter wheels
 ["LEMON",["LEMON","MELON","MOLE","LONE","OMEN","ONE","ELM","MEN"],[]],
 ["TIGER",["TIGER","TIRE","TIER","RITE","GRIT","GET","TIE","RIG"],[]],
 ["STONE",["STONE","NOTES","TONES","NOTE","TONE","NOSE","NEST","SENT","TOES"],[]],
 ["SPARE",["SPARE","SPEAR","PEARS","PARSE","PEAR","REAP","SPAR","RASP","APE"],[]],
 ["PLANET",["PLANET","PLANE","PLATE","PANEL","LEAP","PALE","NEAT","TAPE","PLAN","ANT"],["PANT","PELT","PETAL","LEAPT","PENAL","LANE","LATE","TALE","TEAL","PEAT","PANE","NAPE","PEN","PET","NET","TEN","APE","PEA","NAP","PAN","PAT","TAP","LAP","PAL","ATE","EAT","TEA","LET","ANTE"]],
 ["GARDEN",["GARDEN","DANGER","RANGED","GRADE","RANGE","ANGER","DEAR","READ","GEAR","NEAR","DARN"],["RAGED","EARN","AGED","RANG","GRAND","DRAG","DARE","DEAN","GRAN","END","AND","DEN","RAN","RAG","NAG","AGE","ERA","EAR","ARE","RED","RAD","GAD","DANG","ANGERED"]],
 ["STREAM",["STREAM","MASTER","STEAM","TEAMS","MEAT","SEAM","MATE","STAR","REST","TEAR"],["TAMER","MATES","MEATS","TAMES","SMEAR","MARES","TERM","TERMS","ARMS","ARTS","RATS","EAST","EATS","SEAT","TEAS","MAST","MATS","TRAM","TRAMS","MARE","REAM","STEM","RATE","SAME","MEAT","TEAM","ARM","MAT","SAT","EAT","TEA","ATE","ART","RAT","TAR","ERA","EAR","ARE","SEA","MET","SET","ARMS"]],
 ["FOREST",["FOREST","FOSTER","SOFTER","STORE","FORTE","SORE","ROSE","REST","SOFT","FORT"],["FORTS","FROST","FORES","FORE","FRET","FRETS","TOES","TORE","ROTE","ROTS","SORT","SET","TOE","ORE","ROE","FOE","FOR","OFT","ROT","SOT","RET","EFT","TORES","STEREO"]],
 ["WINTER",["WINTER","TWINE","WRITE","TWIN","WINE","WIRE","TIRE","RENT","TIER","WENT"],["INTER","NITER","WRIT","WREN","REIN","TINE","NEWT","WRITTEN","WEIR","TERN","WIT","WIN","NEW","NET","TEN","TIN","WET","TIE","IRE","WINTERS"]],
 ["CASTLE",["CASTLE","SCALE","LACES","CLEAT","SLATE","STEAL","LEAST","CAST","SALT","SEAL","LATE"],["CLEATS","TALES","TEALS","STALE","CATS","ACTS","LAST","EAST","SEAT","EATS","TEAS","LACE","TALE","TEAL","SALE","LETS","CASE","ACE","ACT","CAT","SAT","EAT","TEA","ATE","LET","SET","SEA","ALE","LAC"]],
 ["SILVER",["SILVER","SLIVER","LIVERS","LIVES","EVILS","VEILS","LIVE","VILE","ISLE","LIES","RISE"],["LIVER","RILES","RIVE","RIVES","VIES","SIRE","SLIER","LIRE","EVIL","VEIL","LEIS","IRE","LIE","SIR","VIE","SLIVERS"]],
 ["ORANGE",["ORANGE","RANGE","ANGER","GROAN","ORGAN","GONER","GEAR","GONE","OGRE","NEAR","EARN"],["ONAGER","ARGON","GORE","RAGE","AEON","NOR","EGO","AGO","NAG","RAG","EON","ONE","ORE","ROE","ERA","EAR","ARE","RAN","AGE","GOER"]],
 ["SPRING",["SPRING","GRINS","RINGS","GRIP","SPIN","PINS","RING","SING","SNIP","GRIN"],["PRIGS","GRIPS","SPRIG","PRIG","RIPS","SIGN","NIPS","PIG","PIGS","PIN","SIP","RIP","NIP","SIN","GIN","RIG","RIGS","GINS"]],
 ["BRIDGE",["BRIDGE","BRIDE","RIDGE","DIRGE","BIRD","GRID","RIDE","BIDE"],["BRIG","DIRE","BIER","GIBE","BRED","BIG","BID","RID","RED","BED","DIG","DIE","IRE","REB"]],
 ["CANDLE",["CANDLE","LANCED","CLEAN","LANCE","DANCE","LACED","LANE","LEAD","DEAL","CANE","LAND"],["ACNE","CLAN","LACE","DALE","LADE","DEAN","ACED","DECAL","LADEN","CLAD","DAN","AND","END","DEN","LAD","LED","ACE","CAD","CAN","ALE","ELAND"]],
 ["SHADOW",["SHADOW","SHOW","HOWS","WASH","DASH","SHAD","SHOD","SODA","WHO","HOW"],["DHOWS","DHOW","HOD","HODS","ADO","ADS","ASH","HAS","WAS","SAW","SOW","SOD","DOS","OHS","WHOA","HOWDAH","DOWS","WADS","WAD"]],
 // 7-letter wheels
 ["PAINTER",["PAINTER","PIRATE","RETAIN","PAINT","PRINT","TRAIN","TAPER","RIPEN","INEPT","PINE","RAIN"],[]],
 ["STAINED",["STAINED","INSTEAD","DETAIN","SAINT","STAND","SNIDE","ASIDE","DATES","TIDE","DINE"],[]],
 ["KITCHEN",["KITCHEN","THICKEN","ETHNIC","THICK","THINK","NICHE","INCH","KNIT","HIKE","CHIN","THEN","NECK"],[]],
 ["MARBLES",["MARBLES","RAMBLE","BLAMES","AMBLE","LAMBS","SMEAR","BEAMS","REALM","BEAR","MALE"],[]],
 ["HOLIDAY",["HOLIDAY","DAILY","HOLY","IDOL","DIAL","HAIL","HOLD","LOAD","LADY","OILY"],[]],
 ["SOLDIER",["SOLDIER","SOILED","RESOLD","IDLERS","SLIDE","OILED","LORDS","RIDES","SOLE","ROLE","IDOL","DOSE"],[]],
 ["CAPTURE",["CAPTURE","CURATE","ERUPT","CRATE","TRACE","CAPER","TAPER","CURE","CUTE","PACT","TRAP"],[]],
 ["MONSTER",["MONSTER","MENTOR","TENORS","STONE","STORM","SNORE","TERMS","MOST","NOSE","OMEN","REST"],[]],
 ["BLANKET",["BLANKET","TABLE","BLANK","ANKLE","BLEAT","TAKEN","KNELT","BANK","TANK","BEAK","BELT","LEAN"],[]],
 ["WEATHER",["WEATHER","WREATH","HEATER","WATER","WHEAT","THREW","WHERE","THERE","THREE","HEART","TREE"],[]],
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
