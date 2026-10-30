import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const require=createRequire(path.join(root,'remotion/package.json'));
const {bundle}=require('@remotion/bundler');
const {openBrowser,selectComposition,renderStill,renderMedia}=require('@remotion/renderer');
const data=JSON.parse(fs.readFileSync(path.join(root,'remotion/src/ai-timeline.json'),'utf8'));
const full=process.argv.includes('--full');
const benchmark=process.argv.includes('--benchmark');
const sampleFrames=benchmark?240:1200;
const concurrency=Number(process.env.AI_RENDER_CONCURRENCY??4);
const started=Date.now();
const errors=[];
const progressFile=path.join(root,'qa/ai-render-progress.json');
const outputLocation=path.join(root,full?'output/DoctorChart-Tutorial-Prueba-IA.mp4':benchmark?'qa/ai-benchmark.mp4':'qa/DoctorChart-IA-muestra-20s.mp4');
const save=value=>fs.writeFileSync(progressFile,JSON.stringify({purpose:'test-export',full,startedAt:new Date(started).toISOString(),outputLocation,...value},null,2));
save({status:'bundling'});
const serveUrl=await bundle({entryPoint:path.join(root,'remotion/src/index.ts'),outDir:path.join(root,'.local/ai-test-bundle'),publicDir:path.join(root,'remotion/public'),rootDir:path.join(root,'remotion'),rspack:true});
const browserExecutable='C:/Program Files/Google/Chrome/Application/chrome.exe';
const chromiumOptions={gl:process.env.AI_RENDER_GL??'angle'};
const browser=await openBrowser('chrome',{browserExecutable,chromiumOptions,logLevel:'error'});
const onBrowserLog=e=>{if(e.type==='error')errors.push(e.text);};
try{
 const composition=await selectComposition({serveUrl,id:'DoctorChart-IA-Prueba',puppeteerInstance:browser,browserExecutable,chromiumOptions,onBrowserLog});
 if(!full&&!benchmark){
  const ids=['access-context','wizard-number','encounter-first','rx-medication','edge-growth-source'];
  for(const id of ids){
   const clip=data.clips.find(c=>c.id===id);
   if(!clip)throw new Error('Missing QA clip '+id);
   const frame=clip.fromFrame+Math.min(180,Math.floor(clip.motionFrames*.55));
   await renderStill({serveUrl,composition,frame,output:path.join(root,'qa','ai-'+id+'.png'),imageFormat:'png',puppeteerInstance:browser,browserExecutable,chromiumOptions,onBrowserLog,logLevel:'error'});
   console.log('STILL',id,frame);
  }
 }
 let last=0;
 await renderMedia({serveUrl,composition,...(full?{}:{frameRange:[0,sampleFrames-1]}),codec:'h264',pixelFormat:'yuv420p',colorSpace:'bt709',audioCodec:'aac',sampleRate:48000,audioBitrate:'192k',videoBitrate:'12M',hardwareAcceleration:'if-possible',imageFormat:'jpeg',jpegQuality:95,concurrency,offthreadVideoThreads:2,offthreadVideoCacheSizeInBytes:1024*1024*1024,mediaCacheSizeInBytes:512*1024*1024,outputLocation,overwrite:true,puppeteerInstance:browser,browserExecutable,chromiumOptions,onBrowserLog,logLevel:'error',onProgress:p=>{
  if(Date.now()-last<15000&&p.progress<1)return;
  last=Date.now();
  const elapsed=(Date.now()-started)/1000;
  const info={status:'rendering',progress:p.progress,renderedFrames:p.renderedFrames,encodedFrames:p.encodedFrames,totalFrames:full?data.durationInFrames:sampleFrames,elapsedSeconds:elapsed,estimateRemainingSeconds:p.progress>0?elapsed*(1/p.progress-1):null,browserErrors:errors};
  save(info);console.log(JSON.stringify(info));
 }});
 save({status:errors.length?'review-required':'completed',elapsedSeconds:(Date.now()-started)/1000,browserErrors:errors,snapshotStateSha256:data.stateSha256});
 console.log('OUTPUT',outputLocation);
 if(errors.length)throw new Error('Browser errors: '+errors.join('\n'));
}catch(error){save({status:'failed',error:String(error),browserErrors:errors});throw error;}
finally{await browser.close({silent:true});}
