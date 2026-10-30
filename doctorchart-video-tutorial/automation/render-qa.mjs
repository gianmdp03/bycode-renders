import fs from 'node:fs';import path from 'node:path';import {createRequire} from 'node:module';import {root} from './browser.mjs';
const require=createRequire(path.join(root,'remotion/package.json'));const {bundle}=require('@remotion/bundler');const {openBrowser,selectComposition,renderStill,renderMedia}=require('@remotion/renderer');
const timeline=JSON.parse(fs.readFileSync(path.join(root,'remotion/src/timeline.json'),'utf8'));
const serveUrl=await bundle({entryPoint:path.join(root,'remotion/src/index.ts'),outDir:path.join(root,'.local/qa-bundle'),publicDir:path.join(root,'remotion/public'),rootDir:path.join(root,'remotion'),rspack:true});
const browserExecutable='C:/Program Files/Google/Chrome/Application/chrome.exe';const browser=await openBrowser('chrome',{browserExecutable,logLevel:'error'});const errors=[];
const onBrowserLog=e=>{if(e.type==='error')errors.push(e.text);};
const samples=[];
try{
 const composition=await selectComposition({serveUrl,id:'DoctorChart-Tutorial-Preview',puppeteerInstance:browser,browserExecutable,onBrowserLog});
 for(const scene of process.argv.includes('--draft-only')?[]:timeline.scenes){
  const beat=scene.beats[Math.min(scene.beats.length-1,Math.floor(scene.beats.length*.55))];const frame=scene.startFrame+beat.from+Math.min(180,Math.floor(beat.durationInFrames*.6));
  const output=path.join(root,'qa','preview-'+scene.id+'.png');await renderStill({serveUrl,composition,frame,output,imageFormat:'png',scale:1,puppeteerInstance:browser,browserExecutable,onBrowserLog,logLevel:'error'});samples.push({scene:scene.id,beat:beat.id,frame,file:path.relative(root,output)});console.log('STILL',scene.id);
  const detailIds=new Set(['wizard-number','patient-demographics','encounter-first','encounter-measurements','growth-chart','rx-medication','studies-preview','rx-print','extra-document-view','more-rx-output','edge-growth-source','edge-pdf-study']);
  for(const detail of scene.beats.filter(b=>b.id!==beat.id&&detailIds.has(b.id))){const detailFrame=scene.startFrame+detail.from+Math.floor(detail.durationInFrames*.55);const detailOutput=path.join(root,'qa','detail-'+detail.id+'.png');await renderStill({serveUrl,composition,frame:detailFrame,output:detailOutput,imageFormat:'png',scale:1,puppeteerInstance:browser,browserExecutable,onBrowserLog,logLevel:'error'});samples.push({scene:scene.id,beat:detail.id,frame:detailFrame,file:path.relative(root,detailOutput)});}
 }
 if(!process.argv.includes('--stills-only')){
  let progress=0;
  await renderMedia({serveUrl,composition,frameRange:[0,1199],codec:'h264',pixelFormat:'yuv420p',audioCodec:'aac',sampleRate:48000,audioBitrate:'192k',crf:20,x264Preset:'veryfast',concurrency:2,outputLocation:path.join(root,'qa/preview-audio-sync-20s.mp4'),puppeteerInstance:browser,browserExecutable,onBrowserLog,logLevel:'error',onProgress:p=>{const mark=Math.floor(p.progress*10);if(mark>progress){progress=mark;console.log('DRAFT',mark*10+'%');}}});
 }
 fs.writeFileSync(path.join(root,'qa/render-review.json'),JSON.stringify({status:errors.length?'REVIEW_REQUIRED':'PASS',actual_remotion_render:true,full_final_render:false,samples,browser_errors:errors,short_draft:process.argv.includes('--stills-only')?null:'qa/preview-audio-sync-20s.mp4'},null,2));
}finally{await browser.close({silent:true});}
