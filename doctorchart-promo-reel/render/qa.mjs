import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {root,ffmpeg,ffprobe} from './tools.mjs';
const file=process.argv[2]??'out/reel_preview_bycode_integrado.mp4';
if(!fs.existsSync(path.join(root,file)))throw Error('Falta el MP4: '+file);
function run(bin,args){const p=spawnSync(bin,args,{encoding:'utf8',maxBuffer:12e6});if(p.status!==0)throw Error(p.stderr);return p}
const probe=JSON.parse(run(ffprobe,['-v','quiet','-show_format','-show_streams','-of','json',file]).stdout);
const v=probe.streams.find(s=>s.codec_type==='video'),a=probe.streams.find(s=>s.codec_type==='audio');
const checks={dimensions:v.width===1080&&v.height===1920,fps:v.avg_frame_rate==='60/1',codec:v.codec_name==='h264',pixelFormat:v.pix_fmt==='yuv420p',duration:Number(probe.format.duration)>=25&&Number(probe.format.duration)<=30.5,audio:a?.codec_name==='aac'&&a?.sample_rate==='48000'&&a?.channels===2};
const decode=run(ffmpeg,['-v','error','-i',file,'-f','null','-']);
const black=run(ffmpeg,['-hide_banner','-i',file,'-vf','blackdetect=d=0.04:pix_th=0.03:pic_th=0.98','-an','-f','null','-']).stderr;
const loud=run(ffmpeg,['-hide_banner','-i',file,'-af','loudnorm=I=-23:TP=-1:LRA=7:print_format=json','-vn','-f','null','-']).stderr;
const loudness=JSON.parse(loud.slice(loud.lastIndexOf('{'),loud.lastIndexOf('}')+1));
checks.decode=decode.stderr.trim()==='';checks.noBlackSegments=!black.includes('black_start:');checks.noClipping=Number(loudness.input_tp)<-1;
const result={status:Object.values(checks).every(Boolean)?'PASS':'FAIL',file,checks,video:v,audio:a,format:probe.format,loudness,blackSegments:black.split('\n').filter(s=>s.includes('black_start:')),note:'Visual review and listening of final human voice remain separate checks.'};
fs.writeFileSync(path.join(root,'qa/media-report.json'),JSON.stringify(result,null,2));
console.log(JSON.stringify({status:result.status,checks,loudness},null,2));
if(result.status!=='PASS')process.exitCode=1;
