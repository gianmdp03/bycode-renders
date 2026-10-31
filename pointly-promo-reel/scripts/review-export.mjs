import fs from 'node:fs';
import path from 'node:path';
import {root,ffmpeg,run,save} from './tools.mjs';
const frames=[85,304,422,549,786,906,1058,1388,1480,1678,1768];
const folder=path.join(root,'out/export-review');fs.mkdirSync(folder,{recursive:true});
for(const frame of frames)run(ffmpeg,['-v','error','-y','-ss',String(frame/60),'-i','out/pointly_preview_qwen_masculina.mp4','-frames:v','1',path.join(folder,`frame-${frame}.png`)]);
run(ffmpeg,['-v','error','-y','-ss','27.5','-i','out/pointly_preview_qwen_masculina.mp4','-frames:v','1','out/pointly-poster.png']);
save('qa/export-frames.json',{source:'out/pointly_preview_qwen_masculina.mp4',frames,method:'Extracted from the delivered H.264 after encoding'});
console.log('Export frames ready.');
