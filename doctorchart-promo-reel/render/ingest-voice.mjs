import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {root,python,ffmpeg,ffprobe} from './tools.mjs';
const args=process.argv.slice(2);const source=args.find(a=>!a.startsWith('--'))??path.join(root,'voice/locucion-original.wav');
if(!fs.existsSync(source)){console.error('Falta la grabación humana: '+source+'\nUso: npm run ingest-voice -- "C:\\ruta\\toma.m4a"');process.exit(2)}
if(!fs.existsSync(python)){console.error('Prepará .local/voice-venv e instalá requirements-voice.txt. Ver README.');process.exit(2)}
const p=spawnSync(python,[path.join(root,'render/ingest_voice.py'),path.resolve(source),...(args.includes('--allow-longer')?['--allow-longer']:[])],{cwd:root,stdio:'inherit',env:{...process.env,REEL_FFMPEG:ffmpeg,REEL_FFPROBE:ffprobe,HF_HUB_DISABLE_SYMLINKS_WARNING:'1'}});
if(p.error)throw p.error;
if(p.status===0&&args.includes('--approved')){
 const render=spawnSync(process.execPath,[path.join(root,'render/render.mjs'),'final','--approved'],{cwd:root,stdio:'inherit'});
 process.exitCode=render.status??1;
}else process.exitCode=p.status??1;
