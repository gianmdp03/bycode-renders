// Recover metadata only from an existing genuine take, never recreate UI or events.
import fs from 'node:fs';import path from 'node:path';import {execFileSync} from 'node:child_process';
import {root} from './browser.mjs';import {ffmpeg,ffprobe} from './recorder.mjs';
const take=JSON.parse(fs.readFileSync(path.join(root,'.local/current-take.json'),'utf8'));
const file=path.join(root,'recordings',take.scene.id+'.mkv');
const probe=JSON.parse(execFileSync(ffprobe,['-v','quiet','-print_format','json','-show_streams','-show_format',file],{encoding:'utf8'}));
const s=probe.streams.find(s=>s.codec_type==='video');if(s.width!==1920||s.height!==1080||s.r_frame_rate!=='60/1')throw Error('Incorrect original source');
const bytes=execFileSync(ffmpeg,['-v','error','-i',file,'-t','2','-vf','crop=8:8:0:0,format=rgb24','-f','rawvideo','pipe:1'],{maxBuffer:2e6});
let markerFrame=-1;const size=8*8*3;
for(let frame=0;frame<bytes.length/size;frame++){const o=frame*size+(4*8+4)*3;if(bytes[o]>180&&bytes[o+1]<50&&bytes[o+2]>180){markerFrame=frame;break;}}
if(markerFrame<0)throw Error('Original encoded sync marker absent');
const toFrame=ms=>markerFrame+Math.round((ms-take.syncBrowserMs)*.06);
const entry={scene_id:take.scene.id,recording_id:take.scene.id,file:'recordings/'+take.scene.id+'.mkv',source_start:toFrame(take.startBrowserMs),source_end:toFrame(take.endBrowserMs),browser_url:take.browser_url??'http://localhost:24202/onboarding/select-specialty',expected_state:take.scene.expected_state,cursor_events:take.events.map(e=>({...e,frame:toFrame(e.timeMs)})),network_assertions:take.network,beats:take.beats.map(b=>({...b,sourceStart:toFrame(b.startBrowserMs),sourceEnd:toFrame(b.endBrowserMs)})),sync:{method:'encoded magenta marker + original browser performance clock',markerFrame,browserMs:take.syncBrowserMs,maximum_quantization_frames:1},probe:{width:s.width,height:s.height,frame_rate:s.r_frame_rate,codec:s.codec_name,pixel_format:s.pix_fmt,duration:probe.format.duration},obs_stats:null,status:'CAPTURED',recovery_note:'Take successfully recorded; recovered metadata after ffmpeg muxer compatibility issue. OBS skip statistics must be checked from original OBS log.'};
const dest=path.join(root,'recordings/manifest.json');const manifest=fs.existsSync(dest)?JSON.parse(fs.readFileSync(dest,'utf8')):{fps:60,width:1920,height:1080,recordings:[]};
manifest.recordings=manifest.recordings.filter(r=>r.scene_id!==entry.scene_id);manifest.recordings.push(entry);fs.writeFileSync(dest,JSON.stringify(manifest,null,2));
console.log(JSON.stringify({scene:entry.scene_id,frames:entry.source_end-entry.source_start,markerFrame,status:'RECOVERED_FROM_REAL_TAKE'}));
