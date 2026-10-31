import path from 'node:path';
import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
import {root,repo,python,ffmpeg,ffprobe} from './tools.mjs';
const qwenPython=path.join(repo,'doctorchart-video-tutorial/.local/qwen-venv/Scripts/python.exe');
const run=(bin,args)=>{const p=spawnSync(bin,args,{cwd:root,stdio:'inherit',windowsHide:true,env:{...process.env,REEL_FFMPEG:ffmpeg,REEL_FFPROBE:ffprobe,PYTHONIOENCODING:'utf-8'}});if(p.error)throw p.error;if(p.status!==0)process.exit(p.status??1)};
if(process.argv[2]==='human'){
 const manifest=process.argv[3];
 if(!manifest)throw Error('Uso: npm run ingest-voice -- <tomas.json>. Formato: {takes:[{id,file,displayText}]} con una toma por beat.');
 const data=JSON.parse(fs.readFileSync(path.resolve(manifest),'utf8'));
 for(const take of data.takes)take.file=path.resolve(path.dirname(path.resolve(manifest)),take.file);
 fs.writeFileSync(path.join(root,'qa/human-generation.json'),JSON.stringify({...data,synthetic:false,voiceProfile:'human'},null,2));
 run(python,['-u',path.join(root,'scripts/align-mix.py'),'human']);
}else{
 run(qwenPython,['-u',path.join(root,'scripts/qwen-generate.py')]);
 run(python,['-u',path.join(root,'scripts/align-mix.py')]);
}
