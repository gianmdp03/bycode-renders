import fs from 'node:fs';
import path from 'node:path';
import {bundle} from '@remotion/bundler';
import {selectComposition,renderStill,renderMedia} from '@remotion/renderer';
import {root,srt} from './tools.mjs';
const mode=process.argv[2]??'preview';
let runtime=null;
if(mode==='qwen'||mode==='qwen-stills'){
 runtime=JSON.parse(fs.readFileSync(path.join(root,'captions/qwen-runtime.json')));
 const report=JSON.parse(fs.readFileSync(path.join(root,'qa/qwen-alignment.json')));
 if(report.status!=='PASS'||runtime.voiceSource!=='qwen-masculina')throw Error('Falta la voz Qwen masculina alineada.');
}
if(mode==='final'){
 runtime=JSON.parse(fs.readFileSync(path.join(root,'captions/voice-runtime.json')));
 const report=JSON.parse(fs.readFileSync(path.join(root,'qa/voice-alignment.json')));
 if(report.status!=='PASS'||runtime.voice!==true)throw Error('Falta una locución humana alineada y validada.');
}
fs.mkdirSync(path.join(root,'out'),{recursive:true});
const serveUrl=await bundle({entryPoint:path.join(root,'src/index.ts'),outDir:path.join(root,'.local/bundle'),publicDir:path.join(root,'public')});
const inputProps={runtime,safeOverlay:false};
const composition=await selectComposition({serveUrl,id:mode.startsWith('qwen')?'Bycode-Qwen-Masculina':'Bycode-Institucional',inputProps});
if(mode==='qwen-stills'){
 const folder=path.join(root,'out/qwen');fs.mkdirSync(folder,{recursive:true});
 const frames=[0,composition.durationInFrames-1,...runtime.beats.flatMap((b,i)=>[Math.round((b.start+(b.end-b.start)*.55)*60),...(i>0?[Math.round(b.start*60)-1,Math.round(b.start*60)+18]:[])])];
 for(const frame of [...new Set(frames)].sort((a,b)=>a-b)){await renderStill({serveUrl,composition,inputProps,output:path.join(folder,`frame-${String(frame).padStart(4,'0')}.png`),frame,imageFormat:'png',scale:.5});console.log('Qwen still '+frame)}
}else if(mode==='stills'||mode==='safe'){
 const data=JSON.parse(fs.readFileSync(path.join(root,'captions/preview-runtime.json')));
 const frames=[0,45,100,167,168,185,260,419,420,438,550,719,720,738,850,1031,1032,1050,1160,1403,1404,1422,1540,1727];
 if(mode==='stills')for(const frame of frames){await renderStill({serveUrl,composition,inputProps,output:path.join(root,`out/frame-${String(frame).padStart(4,'0')}.png`),frame,imageFormat:'png',scale:.5});console.log('Still '+frame)}
 const safeProps={runtime:null,safeOverlay:true};
 const safeComposition=await selectComposition({serveUrl,id:'Bycode-Institucional',inputProps:safeProps});
 for(const frame of [550,850,1160,1540])await renderStill({serveUrl,composition:safeComposition,inputProps:safeProps,output:path.join(root,`out/safe-${frame}.png`),frame,imageFormat:'png',scale:.5});
 if(mode==='stills')fs.writeFileSync(path.join(root,'qa/reviewed-frames.json'),JSON.stringify({frames,sceneBoundaries:data.beats.map(b=>Math.round(b.start*60))},null,2));
}else{
 const filename=mode==='qwen'?'bycode_preview_qwen_masculina.mp4':mode==='final'?'bycode_final_con_voz.mp4':'bycode_preview_sin_voz.mp4';
 let last=-1;
 await renderMedia({serveUrl,composition,inputProps,outputLocation:path.join(root,'out',filename),codec:'h264',pixelFormat:'yuv420p',imageFormat:'png',colorSpace:'bt709',crf:17,x264Preset:'fast',audioCodec:'aac',audioBitrate:'192k',sampleRate:48000,concurrency:4,logLevel:'warn',onProgress:({progress})=>{const p=Math.floor(progress*20)*5;if(p!==last){last=p;console.log(`Render ${p}%`)}}});
 const data=runtime??JSON.parse(fs.readFileSync(path.join(root,'captions/preview-runtime.json')));
 fs.writeFileSync(path.join(root,'out',mode==='qwen'?'subtitulos-qwen.srt':mode==='final'?'subtitulos-finales.srt':'subtitulos-preview.srt'),srt(data.captions));
 console.log(path.join(root,'out',filename));
}
