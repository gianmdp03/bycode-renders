// Render reusable decorations with Remotion; keep its full renderer for animated zooms.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const require=createRequire(path.join(root,'remotion/package.json'));
const {bundle}=require('@remotion/bundler');
const {openBrowser,selectComposition,renderStill,renderMedia}=require('@remotion/renderer');
const data=JSON.parse(fs.readFileSync(path.join(root,'remotion/src/ai-timeline.json'),'utf8'));
const cache=path.join(root,'.local/ai-render');
fs.mkdirSync(path.join(cache,'layers'),{recursive:true});
fs.mkdirSync(path.join(cache,'clips'),{recursive:true});
const serveUrl=await bundle({entryPoint:path.join(root,'remotion/src/index.ts'),outDir:path.join(root,'.local/ai-hybrid-bundle'),publicDir:path.join(root,'remotion/public'),rootDir:path.join(root,'remotion'),rspack:true});
const browserExecutable='C:/Program Files/Google/Chrome/Application/chrome.exe';
const chromiumOptions={gl:'angle'};
const browser=await openBrowser('chrome',{browserExecutable,chromiumOptions,logLevel:'error'});
const common={serveUrl,puppeteerInstance:browser,browserExecutable,chromiumOptions,logLevel:'error'};
try{
 if(!process.argv.includes('--zooms-only')){
  for(let i=0;i<data.clips.length;i+=4){
   await Promise.all(data.clips.slice(i,i+4).map(async(clip,offset)=>{
    const inputProps={clipIndex:i+offset};
    const composition=await selectComposition({...common,id:'DoctorChart-IA-Overlay',inputProps});
    await renderStill({...common,composition,inputProps,frame:0,output:path.join(cache,'layers',clip.id+'.png'),imageFormat:'png'});
   }));
   console.log('LAYERS',Math.min(i+4,data.clips.length),data.clips.length);
  }
 }
 if(process.argv.includes('--layers-only'))process.exitCode=0;
 else{
  const composition=await selectComposition({...common,id:'DoctorChart-IA-Prueba'});
  const zooms=new Set(['wizard-number','patient-demographics','encounter-measurements','rx-medication','studies-preview']);
  for(const clip of data.clips.filter(c=>zooms.has(c.id))){
   const outputLocation=path.join(cache,'clips',clip.id+'.mp4');
   console.log('ZOOM_START',clip.id,clip.durationInFrames);
   let last=0;
   await renderMedia({...common,composition,frameRange:[clip.fromFrame,clip.fromFrame+clip.durationInFrames-1],muted:true,codec:'h264',pixelFormat:'yuv420p',colorSpace:'bt709',videoBitrate:'12M',hardwareAcceleration:'if-possible',imageFormat:'jpeg',jpegQuality:95,concurrency:4,offthreadVideoThreads:2,outputLocation,overwrite:true,onProgress:p=>{if(Date.now()-last>20000){last=Date.now();console.log('ZOOM',clip.id,Math.round(p.progress*100));}}});
   console.log('ZOOM_DONE',clip.id);
  }
 }
}finally{await browser.close({silent:true});}
