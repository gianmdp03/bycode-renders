import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {root,repo,python,ffmpeg,ffprobe} from './tools.mjs';
const source=process.argv.slice(2).find(a=>!a.startsWith('--'));
if(!source||!fs.existsSync(path.resolve(source)))throw Error('Uso desde la raíz: npm run voice:bycode -- "C:\\ruta\\mi-voz.wav"');
if(!fs.existsSync(python))throw Error('Configurá REEL_PYTHON con un Python que tenga numpy y faster-whisper. Ver README.');
const job=spawnSync(python,[path.join(root,'scripts/ingest_voice.py'),path.resolve(source)],{cwd:root,stdio:'inherit',env:{...process.env,REEL_FFMPEG:ffmpeg,REEL_FFPROBE:ffprobe,REEL_ASR_MODEL:process.env.REEL_ASR_MODEL??path.join(repo,'doctorchart-promo-reel/.local/whisper-small'),HF_HUB_DISABLE_SYMLINKS_WARNING:'1'}});
if(job.error)throw job.error;
if(job.status!==0)process.exit(job.status??1);
if(!process.argv.includes('--no-render')){
 const render=spawnSync(process.execPath,[path.join(root,'scripts/render.mjs'),'final'],{cwd:root,stdio:'inherit'});if(render.status!==0)process.exit(render.status??1);
 const qa=spawnSync(process.execPath,[path.join(root,'scripts/qa.mjs'),'out/bycode_final_con_voz.mp4'],{cwd:root,stdio:'inherit'});process.exitCode=qa.status??1;
}
