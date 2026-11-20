const fs=require('fs');
const path=require('path');
const FILE=path.join(__dirname,'levels.json');
const DICT=process.argv[2]||path.join(__dirname,'..','words','enable1.txt');
const words=fs.readFileSync(DICT,'utf8').split(/\r?\n/).filter(w=>/^[a-z]{3,}$/.test(w)).map(w=>w.toUpperCase());
const counts=s=>{const c={};for(const ch of s)c[ch]=(c[ch]||0)+1;return c};
const fits=(w,l)=>{const a=counts(l),b=counts(w);return Object.keys(b).every(k=>(a[k]||0)>=b[k])};
const L=JSON.parse(fs.readFileSync(FILE,'utf8'));
for(const lv of L){
  const grid=new Set(lv.words.map(p=>p.w));
  const fromDict=words.filter(w=>w.length<=lv.l.length&&fits(w,lv.l));
  const added=fromDict.filter(w=>!grid.has(w)&&!lv.bonus.includes(w));
  const missingHand=lv.bonus.filter(w=>!fromDict.includes(w));
  lv.bonus=fromDict.filter(w=>!grid.has(w)).sort();
  console.log(lv.l.padEnd(7),'bonus',String(lv.bonus.length).padStart(3),'| hand-picked words not in the dictionary (dropped):',missingHand.join(' ')||'-');
}
fs.writeFileSync(FILE,JSON.stringify(L));
console.log('bytes',JSON.stringify(L).length);
