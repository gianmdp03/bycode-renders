import fs from 'node:fs';
import path from 'node:path';
import {bundle} from '@remotion/bundler';
import {selectComposition,renderStill,renderMedia} from '@remotion/renderer';
import {root,srt,save} from './tools.mjs';
const mode=process.argv[2]??'qwen';
const human=mode==='human';
const runtime=JSON.parse(fs.readFileSync(path.join(root,`captions/${human?'human':'qwen'}-runtime.json`),'utf8'));
const alignment=JSON.parse(fs.readFileSync(path.join(root,`qa/${human?'human':'qwen'}-alignment.json`),'utf8'));
if(alignment.status!=='PASS')throw Error('Falta la alineación validada.');
const inputProps={runtime,musicOnly:mode==='music',safeOverlay:mode==='safe'};
const serveUrl=await bundle({entryPoint:path.join(root,'src/index.ts'),outDir:path.join(root,'.local/bundle'),publicDir:path.join(root,'public')});
const composition=await selectComposition({serveUrl,id:'Pointly-Qwen-Masculina',inputProps});
fs.mkdirSync(path.join(root,'out'),{recursive:true});
if(['stills','safe'].includes(mode)){
 const frames=process.argv[3]?process.argv[3].split(',').map(Number):[0,30,85,composition.durationInFrames-1,...runtime.beats.flatMap((b,i)=>[Math.round((b.start+.7)*60),Math.round((b.start+(b.end-b.start)*.65)*60),...(i?[Math.round(b.start*60)-1,Math.round(b.start*60)+8,Math.round(b.start*60)+22]:[])])];
 fs.mkdirSync(path.join(root,'out/frames'),{recursive:true});
 for(const frame of [...new Set(frames)].sort((a,b)=>a-b)){
  await renderStill({serveUrl,composition,inputProps,output:path.join(root,`out/frames/${mode}-${String(frame).padStart(4,'0')}.png`),frame,imageFormat:'png',scale:.5});
  console.log('Frame '+frame);
 }
 save('qa/reviewed-frames.json',{frames,sceneStarts:runtime.beats.map(b=>Math.round(b.start*60))});
}else{
 const name=human?'pointly_final_voz_humana':mode==='music'?'pointly_preview_sin_voz':'pointly_preview_qwen_masculina';
 const output=path.join(root,'out',name+'.mp4');
 if(fs.existsSync(output)){
  const archive=path.join(root,'out/history');fs.mkdirSync(archive,{recursive:true});fs.copyFileSync(output,path.join(archive,`${name}-${Date.now()}.mp4`));
 }
 let last=-1;
 await renderMedia({serveUrl,composition,inputProps,outputLocation:output,codec:'h264',pixelFormat:'yuv420p',imageFormat:'jpeg',jpegQuality:95,colorSpace:'bt709',crf:17,x264Preset:'fast',audioCodec:'aac',audioBitrate:'192k',sampleRate:48000,concurrency:4,logLevel:'warn',onProgress:({progress})=>{const p=Math.floor(progress*20)*5;if(p!==last){last=p;console.log(`Render ${p}%`)}}});
 fs.writeFileSync(path.join(root,'out',name+'.srt'),srt(runtime.captions));console.log(output);
}
