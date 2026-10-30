import fs from 'node:fs';
import path from 'node:path';
import {bundle} from '@remotion/bundler';
import {selectComposition,renderMedia,renderStill} from '@remotion/renderer';
import {root} from './tools.mjs';
import {srtFromCaptions} from './subtitles.mjs';
const mode=process.argv[2]??'preview';
const final=mode==='final';
if(final&&!process.argv.includes('--approved'))throw Error('El render final requiere aprobación de la preview. Agregá --approved después de aprobarla.');
let runtime=null;
if(mode.startsWith('qwen')){
 runtime=JSON.parse(fs.readFileSync(path.join(root,'captions/qwen-runtime.json')));
 const qa=JSON.parse(fs.readFileSync(path.join(root,'qa/qwen-alignment.json')));
 if(qa.status!=='PASS'||runtime.voiceSource!=='qwen-masculina')throw Error('DoctorChart Qwen alignment is not ready');
 fs.writeFileSync(path.join(root,'out/subtitulos-qwen.srt'),srtFromCaptions(runtime.captions));
}
if(final){
 if(!fs.existsSync(path.join(root,'captions/voice-runtime.json'))||!fs.existsSync(path.join(root,'public/voice/locucion-normalizada.wav')))throw Error('Falta tu voz humana. Ejecutá npm run ingest-voice -- ruta-a-tu-grabacion');
 runtime=JSON.parse(fs.readFileSync(path.join(root,'captions/voice-runtime.json')));
 runtime.captions=JSON.parse(fs.readFileSync(path.join(root,'captions/aligned.json')));
 const qa=JSON.parse(fs.readFileSync(path.join(root,'qa/voice-alignment.json')));
 if(qa.status!=='PASS')throw Error('QA de locución pendiente o fallida; revisar qa/voice-alignment.json');
 fs.writeFileSync(path.join(root,'out/subtitulos.srt'),srtFromCaptions(runtime.captions));
}
const serveUrl=await bundle({entryPoint:path.join(root,'src/index.ts'),outDir:path.join(root,'.local/bundle'),publicDir:path.join(root,'public')});
const inputProps={runtime,mobileOverlay:false};
const composition=await selectComposition({serveUrl,id:'DoctorChart-Reel',inputProps});
if(mode==='qwen-stills'){
 const frames=[0,...runtime.beats.map(b=>Math.round((b.start+(b.end-b.start)*.6)*60)),composition.durationInFrames-1];
 for(const frame of frames){await renderStill({serveUrl,composition,inputProps,output:path.join(root,`out/qwen/frame-${String(frame).padStart(4,'0')}.png`),frame,imageFormat:'png',scale:.5});console.log('Qwen still '+frame)}
}else if(mode==='stills'){
 for(const frame of [0,55,170,255,400,565,680,825,970,1100,1330,1570]){await renderStill({serveUrl,composition,inputProps,output:path.join(root,`out/frame-${String(frame).padStart(4,'0')}.png`),frame,imageFormat:'png',scale:.5});console.log('Still '+frame)}
 const safeProps={runtime:null,mobileOverlay:true};
 const safeComposition=await selectComposition({serveUrl,id:'Reels-Safe-Area',inputProps:safeProps});
 for(const frame of [400,970,1570])await renderStill({serveUrl,composition:safeComposition,inputProps:safeProps,output:path.join(root,`out/mobile-safe-area-${frame}.png`),frame,imageFormat:'png',scale:.5});
}else{
 const output=path.join(root,mode==='qwen'?'out/doctorchart_preview_qwen_masculina.mp4':final?'out/reel_final_con_voz.mp4':mode==='short'?'out/motion-check.mp4':'out/reel_preview_bycode_integrado.mp4');
 await renderMedia({serveUrl,composition,inputProps,outputLocation:output,codec:'h264',pixelFormat:'yuv420p',imageFormat:'png',colorSpace:'bt709',crf:18,audioCodec:'aac',audioBitrate:'192k',sampleRate:48000,x264Preset:'fast',concurrency:4,logLevel:'warn',...(mode==='short'?{frameRange:[150,420]}:{}),onProgress:({progress})=>{const p=Math.floor(progress*100);if(p%10===0&&p!==globalThis.lastProgress){console.log('Render '+p+'%');globalThis.lastProgress=p}}});
 console.log(output);
}
