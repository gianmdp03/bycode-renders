import path from 'node:path';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {bundle} from '@remotion/bundler';
import {selectComposition,renderMedia,renderStill} from '@remotion/renderer';
const root=path.dirname(fileURLToPath(import.meta.url));
const assets=path.resolve(process.argv[2]??path.join(root,'public'));
if(!assets.startsWith(path.resolve(root,'..')+path.sep))throw Error('Assets must be inside replication package');
if(!fs.existsSync(path.join(assets,'fonts')))fs.cpSync(path.join(root,'public/fonts'),path.join(assets,'fonts'),{recursive:true});
const read=f=>JSON.parse(fs.readFileSync(path.join(assets,f),'utf8'));
const alignment=read('alignment.json');
const output=path.resolve(assets,process.argv[3]??'renders');if(!output.startsWith(assets+path.sep))throw Error('Output outside assets');fs.mkdirSync(output,{recursive:true});
const serveUrl=await bundle({entryPoint:path.join(root,'src/index.tsx'),publicDir:assets});
for(const mode of ['tutorial','reel']){
 const inputProps={words:read('words.json'),phrases:read('phrases.json'),duration:alignment.duration,mode};
 const id=mode==='tutorial'?'Tutorial':'Reel';
 const composition=await selectComposition({serveUrl,id,inputProps});
 const outputLocation=path.join(output,mode+'.mp4');
 if(fs.existsSync(outputLocation))throw Error('Render exists: choose a fresh run folder');
 await renderMedia({serveUrl,composition,inputProps,codec:'h264',pixelFormat:'yuv420p',outputLocation,concurrency:2});
 const cue=inputProps.words[Math.min(4,inputProps.words.length-1)];const frame=Math.round((cue.startMs+cue.endMs)/2/1000*60);
 await renderStill({serveUrl,composition,inputProps,frame,output:path.join(output,mode+'.png')});
 console.log('Rendered',outputLocation);
}
