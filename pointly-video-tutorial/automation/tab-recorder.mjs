import fs from 'node:fs';import path from 'node:path';import {execFileSync} from 'node:child_process';import {Recorder,ffmpeg,ffprobe} from './recorder.mjs';import {root,base} from './browser.mjs';
const pause=ms=>new Promise(r=>setTimeout(r,ms));
// Real Chromium tab surface recording. It is independent of display resolution;
// no business UI is recreated, mocked, or replaced. Original VFR bytes retained.
export class TabRecorder extends Recorder{
 async move(locator){
  await locator.scrollIntoViewIfNeeded();const b=await locator.boundingBox();if(!b)throw Error('Invisible target');const end={x:b.x+b.width/2,y:b.y+b.height/2};
  await this.page.evaluate(({start,end})=>new Promise(resolve=>{const p=document.getElementById('tutorial-pointer');const began=performance.now();const step=now=>{const t=Math.min(1,(now-began)/550),e=t*t*(3-2*t);p.style.left=(start.x+(end.x-start.x)*e)+'px';p.style.top=(start.y+(end.y-start.y)*e)+'px';if(t<1)requestAnimationFrame(step);else resolve()};requestAnimationFrame(step)}),{start:this.position,end});
  await this.page.mouse.move(end.x,end.y);this.position=end;await pause(100);return end;
 }
 async begin(scene){
  this.scene=scene;this.events=[];this.network=[];this.active=true;
  await this.page.evaluate(()=>{document.title='Pointly DEMO'});
  this.controller=await this.page.context().newPage();await this.controller.goto(base+'/');
  this.settings=await this.controller.evaluate(async()=>{
   document.title='Grabador local';
   const stream=await navigator.mediaDevices.getDisplayMedia({video:{width:{ideal:1920},height:{ideal:1080},frameRate:{ideal:60,max:60},displaySurface:'browser'},audio:false,preferCurrentTab:false,selfBrowserSurface:'exclude'});
   const track=stream.getVideoTracks()[0];const settings=track.getSettings();
   if(settings.width!==1920||settings.height!==1080||settings.frameRate!==60||settings.displaySurface!=='browser')throw Error('Not a native Full HD browser tab at 60 FPS');
   window.capture={stream,chunks:[],timestamps:[]};const c=window.capture;
   const processor=new MediaStreamTrackProcessor({track:track.clone()});c.reader=processor.readable.getReader();
   (async()=>{while(true){const {value,done}=await c.reader.read();if(done)break;c.timestamps.push(value.timestamp);value.close()}})().catch(()=>{});
   c.rec=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp8',videoBitsPerSecond:40000000});
   await new Promise(resolve=>{c.rec.ondataavailable=e=>{c.chunks.push(e.data);resolve()};c.rec.start(250)});return settings;
  });
  this.syncBrowserMs=await this.page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>{const d=document.createElement('div');d.id='tutorial-sync-marker';Object.assign(d.style,{position:'fixed',left:'0',top:'0',width:'1920px',height:'8px',background:'#ff00ff',zIndex:2147483647,pointerEvents:'none'});document.documentElement.appendChild(d);resolve(performance.timeOrigin+performance.now())})));
  await pause(200);await this.page.evaluate(()=>document.getElementById('tutorial-sync-marker')?.remove());await pause(100);
  this.startBrowserMs=await this.page.evaluate(()=>performance.timeOrigin+performance.now());
 }
 async end(){
  this.endBrowserMs=await this.page.evaluate(()=>performance.timeOrigin+performance.now());await pause(200);this.active=false;
  const data=await this.controller.evaluate(async()=>{const c=window.capture;await new Promise(resolve=>{c.rec.onstop=resolve;c.rec.stop()});await c.reader.cancel();c.stream.getTracks().forEach(t=>t.stop());const blob=new Blob(c.chunks,{type:c.rec.mimeType});const data=await new Promise(resolve=>{const r=new FileReader();r.onload=()=>resolve(r.result.split(',')[1]);r.readAsDataURL(blob)});return {data,timestamps:c.timestamps}});
  await this.controller.close();const stem=this.scene.id+'-'+Date.now();const original=path.join(root,'recordings',stem+'.webm');fs.writeFileSync(original,Buffer.from(data.data,'base64'));
  const target=path.join(root,'recordings',stem+'.mp4');
  execFileSync(ffmpeg,['-v','error','-y','-i',original,'-an','-vf','fps=60','-c:v','h264_nvenc','-preset','p4','-cq','17','-b:v','16M','-pix_fmt','yuv420p','-movflags','+faststart',target],{stdio:'pipe'});
  const metadata=JSON.parse(execFileSync(ffprobe,['-v','quiet','-print_format','json','-show_streams','-show_format',target],{encoding:'utf8'}));const stream=metadata.streams.find(s=>s.codec_type==='video');
  const bytes=execFileSync(ffmpeg,['-v','error','-i',target,'-t','2','-vf','crop=8:8:0:0,format=rgb24','-f','rawvideo','pipe:1'],{maxBuffer:2e6});let markerFrame=-1;const size=192;
  for(let f=0;f<bytes.length/size;f++){const o=f*size+108;if(bytes[o]>180&&bytes[o+1]<50&&bytes[o+2]>180){markerFrame=f;break}}
  if(markerFrame<0)throw Error('No actual encoded sync marker; source retained for diagnosis');
  const toFrame=ms=>markerFrame+Math.round((ms-this.syncBrowserMs)*.06);const source_start=toFrame(this.startBrowserMs);const source_end=Math.min(Number(stream.nb_frames),toFrame(this.endBrowserMs));
  const timestamps=data.timestamps;const gaps=timestamps.slice(1).map((t,i)=>(t-timestamps[i])/1000);const motion={nativeFrames:timestamps.length,nominalFrameRate:this.settings.frameRate,actualAverageFps:timestamps.length>1?+(1000000*(timestamps.length-1)/(timestamps.at(-1)-timestamps[0])).toFixed(3):0,maxFrameGapMs:gaps.length?Math.max(...gaps):null,frameTimestampsUs:timestamps};
  const entry={scene_id:this.scene.id,recording_id:stem,file:path.relative(root,target).replaceAll('\\','/'),original:path.relative(root,original).replaceAll('\\','/'),source_start,source_end,browser_url:new URL(this.page.url()).pathname,expected_state:this.scene.expected_state,cursor_events:this.events.map(e=>({...e,frame:toFrame(e.timeMs)})),network_assertions:this.network,sync:{method:'encoded magenta marker plus actual browser clock; original tab VFR retained',markerFrame,browserMs:this.syncBrowserMs,maximum_quantization_frames:1},capture_settings:this.settings,sourceMotion:motion,probe:{width:stream.width,height:stream.height,frame_rate:stream.r_frame_rate,codec:stream.codec_name,pixel_format:stream.pix_fmt,duration:metadata.format.duration},obs_stats:null,status:'CAPTURED'};
  const f=path.join(root,'recordings/manifest.json');const manifest=fs.existsSync(f)?JSON.parse(fs.readFileSync(f,'utf8')):{fps:60,width:1920,height:1080,recordings:[]};manifest.recordings=manifest.recordings.filter(r=>r.scene_id!==entry.scene_id);manifest.recordings.push(entry);fs.writeFileSync(f,JSON.stringify(manifest,null,2));return entry;
 }
}
