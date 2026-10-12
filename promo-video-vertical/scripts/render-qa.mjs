import {bundle} from '@remotion/bundler';
import {openBrowser, selectComposition, renderStill} from '@remotion/renderer';
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import {VIDEO,beats,soundCues} from './project-timing.mjs';

const frames = process.argv.slice(2).map(Number);
const samples = frames.length ? frames : [...new Set([...beats.flatMap(b=>[b.startFrame+Math.round(b.frames*.35),b.startFrame+Math.round(b.frames*.75),b.startFrame+b.frames-1]),...soundCues.map(c=>Math.min(VIDEO.frames-1,c.frame+5))])].sort((a,b)=>a-b);
await fs.mkdir('qa/vertical', {recursive:true});
const serveUrl = await bundle({entryPoint:path.resolve('src/index.ts'), outDir:path.resolve('build')});
const browser = await openBrowser('chrome');
const composition = await selectComposition({serveUrl,id:VIDEO.id,puppeteerInstance:browser});
await fs.writeFile('qa/vertical/composition.json',JSON.stringify(composition,null,2));
for (const frame of samples) {
  await renderStill({serveUrl,composition,puppeteerInstance:browser,frame,output:`qa/vertical/frame-${frame}.png`,imageFormat:'png'});
  console.log(`Rendered ${frame} (${(frame/60).toFixed(2)}s)`);
}
await browser.close({silent:true});
// Targeted rerenders refresh the overview without discarding earlier samples.
const reviewFrames=(await fs.readdir('qa/vertical')).filter(name=>/^frame-\d+\.png$/.test(name)).map(name=>Number(name.match(/\d+/)[0])).sort((a,b)=>a-b);
for(let start=0;start<reviewFrames.length;start+=9){
  const group=reviewFrames.slice(start,start+9); const tiles=[];
  for(let i=0;i<group.length;i++){
    const frame=group[i];
    const img=await sharp(`qa/vertical/frame-${frame}.png`).resize(360,640).toBuffer();
    tiles.push({input:img,left:(i%3)*360,top:Math.floor(i/3)*672});
    const label=Buffer.from(`<svg width="360" height="32"><rect width="360" height="32" fill="#202124"/><text x="14" y="23" font-size="17" fill="white">Frame ${frame} · ${(frame/60).toFixed(2)} sec</text></svg>`);
    tiles.push({input:label,left:(i%3)*360,top:Math.floor(i/3)*672+640});
  }
  await sharp({create:{width:1080,height:Math.ceil(group.length/3)*672,channels:4,background:'#202124'}}).composite(tiles).png().toFile(`qa/vertical/contact-${Math.floor(start/9)+1}.png`);
}
