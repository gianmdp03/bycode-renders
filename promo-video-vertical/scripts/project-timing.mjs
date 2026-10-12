import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const code=ts.transpileModule(fs.readFileSync('src/data.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
const context={exports:{}};
vm.runInNewContext(code,context);
export const {VIDEO,beats,demo,ledger}=context.exports;

// Read cues directly from the authored interaction frames; no rounded seconds.
export const soundCues=[];
for(const scene of beats){
 const source=fs.readFileSync(`src/scenes/${scene.source}.tsx`,'utf8');
 for(const match of source.matchAll(/\{f:\s*(\d+),[^}]*click:\s*true/g))soundCues.push({scene:scene.id,kind:'click',localFrame:Number(match[1]),frame:scene.startFrame+Number(match[1])});
 if(scene.id==='03-QR'){
  const frame=Number(source.match(/\{f >= (\d+) && f < \d+ && <div/)[1]);
  soundCues.push({scene:scene.id,kind:'click',localFrame:frame,frame:scene.startFrame+frame});
 }
 const result=source.match(/const (?:success|awarded|done) = f >= (\d+)/);
 if(result){const frame=Number(result[1])+2;soundCues.push({scene:scene.id,kind:'success',localFrame:frame,frame:scene.startFrame+frame});}
 if(scene.id==='07-Rangos'){
  const timings=JSON.parse(source.match(/const timings = (\[[^;]+\])/)[1]);
  const frame=timings.at(-1)+6;soundCues.push({scene:scene.id,kind:'success',localFrame:frame,frame:scene.startFrame+frame});
 }
}
soundCues.sort((a,b)=>a.frame-b.frame);
