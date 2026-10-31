import fs from 'node:fs';
import path from 'node:path';
import {root,ffmpeg,run} from './tools.mjs';
const runtime=JSON.parse(fs.readFileSync(path.join(root,'captions/qwen-runtime.json')));
const output=path.join(root,'out/pointly_preview_sin_voz.mp4');
if(fs.existsSync(output)){
 const archive=path.join(root,'out/history');fs.mkdirSync(archive,{recursive:true});fs.copyFileSync(output,path.join(archive,`pointly_preview_sin_voz-${Date.now()}.mp4`));
}
run(ffmpeg,['-hide_banner','-y','-i','out/pointly_preview_qwen_masculina.mp4','-i','public/audio/music-only.wav','-map','0:v:0','-map','1:a:0','-c:v','copy','-c:a','aac','-b:a','192k','-ar','48000','-ac','2','-t',String(runtime.duration),'-movflags','+faststart',output]);
console.log(output);
