import fs from 'node:fs';
const spec=JSON.parse(fs.readFileSync('script/voice-beats.json','utf8'));
const caps=spec.beats.flatMap(b=>{
 const words=b.text.split(/\s+/);const sizes=[];let n=words.length;
 while(n>0){const k=n<=5?n:(n===6||n===9?3:4);sizes.push(k);n-=k}
 let cursor=0;const breaks=new Set(sizes.map(size=>cursor+=size));
 return words.map((text,i)=>({text:' '+text,startMs:Math.round((b.start+(b.end-b.start)*i/words.length)*1000),endMs:Math.round((b.start+(b.end-b.start)*(i+1)/words.length)*1000),timestampMs:null,confidence:null,pageBreakAfter:breaks.has(i+1)}));
});
fs.writeFileSync('captions/provisional.json',JSON.stringify(caps,null,2));
fs.writeFileSync('captions/preview-runtime.json',JSON.stringify({beats:spec.beats,captions:caps,duration:spec.duration,voice:false,url:''},null,2));
const stamp=ms=>new Date(ms).toISOString().slice(11,23).replace('.',',');
const groups=[];let g=[];for(const c of caps){g.push(c);if(c.pageBreakAfter){groups.push(g);g=[]}}
fs.writeFileSync('captions/subtitulos-provisionales.srt',groups.map((g,i)=>`${i+1}\n${stamp(g[0].startMs)} --> ${stamp(g.at(-1).endMs)}\n${g.map(c=>c.text).join('').trim()}`).join('\n\n')+'\n');
console.log('Preview metadata prepared; all word timings estimated, no human voice present.');
