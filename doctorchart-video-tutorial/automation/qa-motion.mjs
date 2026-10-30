import fs from 'node:fs';import path from 'node:path';import {execFileSync} from 'node:child_process';
import {root} from './browser.mjs';import {ffmpeg} from './recorder.mjs';
const manifest=JSON.parse(fs.readFileSync(path.join(root,'recordings/manifest.json'),'utf8'));
const id=process.argv[2]??'03-onboarding';const rec=manifest.recordings.find(r=>r.scene_id===id);if(!rec)throw Error('No captured source');
const scroll=rec.cursor_events.filter(e=>e.event==='scroll');
const clusters=scroll.filter((e,i)=>i===0||e.frame-scroll[i-1].frame>25);
const windows=[];
for(const event of clusters){
 const start=Math.max(0,event.frame-3);const bytes=execFileSync(ffmpeg,['-v','error','-ss',String(start/60),'-i',path.join(root,rec.file),'-t','2.2','-vf','crop=1200:700:300:200,scale=160:94,format=gray','-fps_mode','passthrough','-f','rawvideo','pipe:1'],{maxBuffer:5e6});
 const size=160*94,n=Math.floor(bytes.length/size),changed=[];
 for(let i=1;i<n;i++){let sum=0,large=0;for(let p=0;p<size;p++){const d=Math.abs(bytes[i*size+p]-bytes[(i-1)*size+p]);sum+=d;if(d>4)large++;}changed.push(sum/size>.25&&large/size>.02);}
 let max=0,max30=0;for(let i=0;i<=changed.length-60;i++)max=Math.max(max,changed.slice(i,i+60).filter(Boolean).length);for(let i=0;i<=changed.length-30;i++)max30=Math.max(max30,changed.slice(i,i+30).filter(Boolean).length);
 windows.push({source_start_frame:start,source_start_seconds:start/60,framesDecoded:n,maxMeaningfulChangesIn60:max,maxMeaningfulChangesIn30:max30});
}
const maximum=Math.max(0,...windows.map(w=>w.maxMeaningfulChangesIn60)),maximum30=Math.max(0,...windows.map(w=>w.maxMeaningfulChangesIn30));
const result={scene_id:id,file:rec.file,status:maximum>=50||maximum30>=25?'PASS':'REVIEW_REQUIRED',sourceFrameRate:rec.probe.frame_rate,method:'Original encoded OBS frames, no fps conversion. Pixel changes in the scrolling UI (cursor excluded). Require >=50 changes in 60 frames OR >=25 in 30 frames for short scrolls reaching their boundary in <1s. Both require >=50 updates/sec; 30fps doubled cannot pass.',maximumMeaningfulChangesIn60:maximum,maximumMeaningfulChangesIn30:maximum30,windows};
fs.writeFileSync(path.join(root,'qa',id+'-native-motion.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result));
process.exitCode=result.status==='PASS'?0:1;
