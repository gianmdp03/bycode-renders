import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {root,repo,python,ffmpeg,run,save,srt} from './tools.mjs';
const front=process.env.BYCODE_FRONTEND??path.join(repo,'../bycode-frontend');
const files=['bycode-logo.svg','pointly-logo.svg','doctorchart-logo.svg','fonts/google-sans-latin-normal-b8059800eca3.woff2','fonts/OFL.txt','fonts/README.md','images/products/pointly-rewards-light.webp','images/products/pointly-promotions-light.webp','images/products/doctorchart-growth-light.webp','images/products/doctorchart-vaccines-light.webp'];
const assets=[];
for(const file of files){const source=path.join(front,'public',file);const dest=file.includes('images/products/')?'captures/'+path.basename(file):file.includes('fonts/')?file:'logos/'+file;const target=path.join(root,'public',dest);fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(source,target);assets.push({source:path.join('public',file),destination:'public/'+dest,sha256:crypto.createHash('sha256').update(fs.readFileSync(source)).digest('hex')})}
save('qa/assets.json',{source:'../bycode-frontend',assets});
const spec=JSON.parse(fs.readFileSync(path.join(root,'script/voice-beats.json')));
const captions=spec.beats.flatMap(b=>{const words=b.text.split(/\s+/);let count=0;return words.map((w,i)=>{count++;const isBreak=count===3||i===words.length-1||/[.!?]$/.test(w);if(isBreak)count=0;return {text:' '+w,startMs:Math.round((b.speechStart+(b.speechEnd-b.speechStart)*i/words.length)*1000),endMs:Math.round((b.speechStart+(b.speechEnd-b.speechStart)*(i+1)/words.length)*1000),timestampMs:null,confidence:null,pageBreakAfter:isBreak}})});
save('captions/provisional.json',captions);save('captions/preview-runtime.json',{duration:spec.duration,voice:false,beats:spec.beats,captions});
fs.writeFileSync(path.join(root,'captions/subtitulos-provisionales.srt'),srt(captions));
fs.writeFileSync(path.join(root,'script/guion.txt'),spec.beats.map(b=>b.text).join('\n\n')+'\n');
run(python,[path.join(root,'scripts/compose.py')]);
run(ffmpeg,['-hide_banner','-y','-i','public/audio/menos-vueltas-original.wav','-t',String(spec.duration),'-af',`afade=t=in:d=0.7,afade=t=out:st=${spec.duration-1.8}:d=1.8,loudnorm=I=-29:TP=-6:LRA=7`,'-ar','48000','-ac','2','public/audio/preview-mix.wav']);
console.log('Assets auténticos, subtítulos provisionales y música original preparados.');
