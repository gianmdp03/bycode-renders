import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {root} from './browser.mjs';
import {obsConnect} from './obs.mjs';
const ffdir=path.join(root,'../node_modules/@remotion/compositor-win32-x64-msvc');
const fullBinDir=path.join(root,'../doctorchart-video-tutorial/.local/voice-venv/Lib/site-packages/imageio_ffmpeg/binaries');
export const ffmpeg=process.env.FFMPEG_BINARY??(fs.existsSync(fullBinDir)?path.join(fullBinDir,fs.readdirSync(fullBinDir).find(f=>f.endsWith('.exe'))??'missing.exe'):path.join(ffdir,'ffmpeg.exe'));
export const ffprobe=path.join(ffdir,'ffprobe.exe');
const python=path.join(root,'../doctorchart-video-tutorial/.local/voice-venv/Scripts/python.exe');
const pause=ms=>new Promise(r=>setTimeout(r,ms));
export async function calibrate(page,obs){
 const sources=await obs.call('GetSceneItemList',{sceneName:'Tutorial'});
 for(const item of sources.sceneItems)if(['Pointly REAL','Pointly Native Display','Pointly PDF REAL'].includes(item.sourceName))await obs.call('SetSceneItemEnabled',{sceneName:'Tutorial',sceneItemId:item.sceneItemId,sceneItemEnabled:item.sourceName==='Pointly REAL'});
 await page.setViewportSize({width:1920,height:1081});
 await page.setViewportSize({width:1920,height:1080});
 const session=await page.context().newCDPSession(page);
 const win=await session.send('Browser.getWindowForTarget');
 await session.send('Browser.setWindowBounds',{windowId:win.windowId,bounds:{windowState:'normal'}});
 // Secondary display is to the left of the primary. Keep the entire 1920px
 // capture window at negative X so it never covers the user's main workspace.
 await session.send('Browser.setWindowBounds',{windowId:win.windowId,bounds:{left:-1936,top:0,width:1936,height:1280}});
 await session.detach();
 const geometry=await page.evaluate(()=>({width:innerWidth,height:innerHeight,dpr:devicePixelRatio}));
 if(geometry.width!==1920||geometry.height!==1080||geometry.dpr!==1)throw Error('Browser content geometry is not exact');
 await page.getByRole('heading').first().waitFor();
 const captureTitle='Pointly Tutorial DEMO capture-'+Date.now();
 await page.evaluate(title=>{document.title=title;},captureTitle);
 let matches=[];
 for(let attempt=0;attempt<15;attempt++){
  const list=await obs.call('GetInputPropertiesListPropertyItems',{inputName:'Pointly REAL',propertyName:'window'});
  matches=list.propertyItems.filter(x=>String(x.itemName).includes(captureTitle)&&String(x.itemValue).includes('chrome.exe'));
  if(matches.length===1)break;await pause(100);
 }
 if(matches.length!==1)throw Error('Capture target is ambiguous or absent');
 await obs.call('SetInputSettings',{inputName:'Pointly REAL',inputSettings:{window:''},overlay:true});
 await pause(250);
 const captureMethod=Number(process.env.TUTORIAL_CAPTURE_METHOD??1);
 await obs.call('SetInputSettings',{inputName:'Pointly REAL',inputSettings:{window:matches[0].itemValue,cursor:false,client_area:true,method:captureMethod},overlay:true});
 await marker(page,true);await page.evaluate(()=>new Promise(r=>{let n=0;const next=()=>++n===45?r():requestAnimationFrame(next);requestAnimationFrame(next);}));
 const file=path.join(root,'.local/calibration.png');
 for(let attempt=0;attempt<12;attempt++){
  try{await obs.call('SaveSourceScreenshot',{sourceName:'Pointly REAL',imageFormat:'png',imageFilePath:file});break;}
  catch(error){if(attempt===11)throw error;await pause(200);}
 }
 console.log('NATIVE-GEOMETRY',JSON.stringify(await page.evaluate(()=>({innerWidth,innerHeight,outerWidth,outerHeight}))));
 const crop=JSON.parse(execFileSync(python,[path.join(root,'automation/calibrate-image.py'),file],{encoding:'utf8'}));
 const id=(await obs.call('GetSceneItemId',{sceneName:'Tutorial',sourceName:'Pointly REAL'})).sceneItemId;
 await obs.call('SetSceneItemTransform',{sceneName:'Tutorial',sceneItemId:id,sceneItemTransform:crop});
 await marker(page,false);
 fs.writeFileSync(path.join(root,'qa/capture-calibration.json'),JSON.stringify({geometry,crop,method:captureMethod===1?'BitBlt window capture with software-composited real Chrome; exact native pixels, no resizing':'Windows Graphics Capture; exact native pixels, no resizing',captured_cursor:false},null,2));
 return crop;
}
async function marker(page,on){return page.evaluate(on=>new Promise(resolve=>requestAnimationFrame(()=>{
 document.getElementById('tutorial-sync-marker')?.remove();
 if(on){const d=document.createElement('div');d.id='tutorial-sync-marker';Object.assign(d.style,{position:'fixed',left:'0',top:'0',width:'1920px',height:'8px',background:'#ff00ff',zIndex:'2147483647',pointerEvents:'none'});document.documentElement.appendChild(d);}
 resolve(performance.timeOrigin+performance.now());
})),on);}
export class Recorder{
 constructor(page,obs){this.page=page;this.obs=obs;this.events=[];this.scenes=[];this.position={x:1600,y:900};this.network=[];}
 async init(){
  const self=this;
  await this.page.exposeBinding('tutorialEvent',(_source,event)=>{if(self.active)self.events.push(event);});
  await this.page.addInitScript(()=>{
   const send=(event,data={})=>window.tutorialEvent?.({event,timeMs:performance.timeOrigin+performance.now(),...data});
   document.addEventListener('mousemove',e=>send('move',{x:e.clientX,y:e.clientY}),{passive:true});
   document.addEventListener('click',e=>send('click',{x:e.clientX,y:e.clientY,target:e.target.closest('button,a,input,select,summary')?.getAttribute('aria-label')??e.target.closest('button,a,summary')?.textContent?.trim().slice(0,90)??e.target.id??''}),true);
   document.addEventListener('input',e=>send('type',{field:e.target.id??'',length:e.target.value?.length??0}),true);
   document.addEventListener('scroll',e=>send('scroll',{scrollY:e.target instanceof Element?e.target.scrollTop:window.scrollY,scrollX:e.target instanceof Element?e.target.scrollLeft:window.scrollX}),{passive:true,capture:true});
  });
  this.page.on('response',r=>{const u=new URL(r.url());if(this.active&&u.pathname.startsWith('/api/'))this.network.push({method:r.request().method(),path:u.pathname,status:r.status()});});
 }
 async begin(scene){
  this.active=true;this.events=[];this.network=[];this.beats=[];this.scene=scene;this.beforeStats=await this.obs.call('GetStats');
  const started=new Promise(resolve=>{const listener=e=>{if(e.outputState==='OBS_WEBSOCKET_OUTPUT_STARTED'){this.obs.off('RecordStateChanged',listener);resolve(e);}};this.obs.on('RecordStateChanged',listener);});await this.obs.call('StartRecord');await started;
  this.syncBrowserMs=await marker(this.page,true);await pause(180);await marker(this.page,false);await pause(120);
  this.startBrowserMs=await this.page.evaluate(()=>performance.timeOrigin+performance.now());
 }
 async move(locator){
  for(let attempt=0;;attempt++){try{await locator.scrollIntoViewIfNeeded();break;}catch(error){if(attempt>=3||!/not attached/.test(error.message))throw error;await pause(150);}}
  const box=await locator.boundingBox();if(!box)throw Error('Target is not visible');
  const end={x:box.x+box.width/2,y:box.y+box.height/2},start=this.position;
  for(let i=1;i<=30;i++){const t=i/30,e=t*t*(3-2*t);await this.page.mouse.move(start.x+(end.x-start.x)*e,start.y+(end.y-start.y)*e);await pause(1000/60);}
  this.position=end;await pause(150);return end;
 }
 async click(locator){await this.move(locator);await locator.click();}
 async fill(locator,value){await this.move(locator);await locator.fill(value);}
 async select(locator,value){await this.move(locator);await locator.selectOption(value);}
 async scroll(dy,dx=0){
  const viewport=this.page.viewportSize();const point={x:Math.min(1845,viewport.width-40),y:Math.min(760,viewport.height-70)};
  await this.page.mouse.move(point.x,point.y);this.position=point;
  // Scroll the real overflow element on browser animation frames. This avoids
  // round-trip wheel dispatch limiting actual UI motion to 30–40 updates/sec.
  // No DOM content, values, state or results are replaced.
  const samples=await this.page.evaluate(({dx,dy,point})=>new Promise(resolve=>{
   let target=document.elementFromPoint(point.x,point.y);
   while(target&&target!==document.documentElement){
    const s=getComputedStyle(target),canY=dy&&target.scrollHeight>target.clientHeight+2&&/(auto|scroll)/.test(s.overflowY),canX=dx&&target.scrollWidth>target.clientWidth+2&&/(auto|scroll)/.test(s.overflowX);
    if(canY||canX)break;target=target.parentElement;
   }
   target=target??document.scrollingElement;
   const startX=target.scrollLeft,startY=target.scrollTop,start=performance.now(),duration=1600,samples=[];
   const step=now=>{const t=Math.min(1,(now-start)/duration),e=t*t*(3-2*t);target.scrollTo({left:startX+dx*e,top:startY+dy*e,behavior:'instant'});samples.push({ms:now-start,x:target.scrollLeft,y:target.scrollTop});if(t<1)requestAnimationFrame(step);else resolve(samples);};requestAnimationFrame(step);
  }),{dx,dy,point});
  if(process.env.TUTORIAL_MOTION_DIAGNOSTIC==='1')fs.writeFileSync(path.join(root,'qa','browser-motion-'+Date.now()+'.json'),JSON.stringify(samples));
 }
 async beat(beat,fn){
  const start=await this.page.evaluate(()=>performance.timeOrigin+performance.now());
  if(fn)await fn();
  const minimumMs=Math.max(beat.audioDurationMs??0,beat.minSeconds*1000);
  const elapsed=await this.page.evaluate(t=>performance.timeOrigin+performance.now()-t,start);
  await pause(Math.max(0,minimumMs-elapsed)+450);
  const end=await this.page.evaluate(()=>performance.timeOrigin+performance.now());
  const evidence=path.join(root,'qa',beat.id+'.png');await this.page.screenshot({path:evidence});
  const native=path.join(root,'qa',beat.id+'-native.png');await this.obs.call('SaveSourceScreenshot',{sourceName:'Tutorial',imageFormat:'png',imageFilePath:native});
  execFileSync(path.join(root,'../doctorchart-video-tutorial/.local/voice-venv/Scripts/python.exe'),[path.join(root,'automation/check-capture-image.py'),native]);
  this.beats.push({...beat,startBrowserMs:start,endBrowserMs:end,screenshot:'qa/'+beat.id+'.png',result:'PASS'});
  console.log('CAPTURED',beat.id);
 }
 async end(){
  this.endBrowserMs=await this.page.evaluate(()=>performance.timeOrigin+performance.now());await pause(350);
  fs.writeFileSync(path.join(root,'.local/current-take.json'),JSON.stringify({scene:this.scene,beats:this.beats,events:this.events,network:this.network,syncBrowserMs:this.syncBrowserMs,startBrowserMs:this.startBrowserMs,endBrowserMs:this.endBrowserMs,beforeStats:this.beforeStats,browser_url:this.page.url()},null,2));
  const finalized=new Promise(resolve=>{const listener=e=>{if(e.outputState==='OBS_WEBSOCKET_OUTPUT_STOPPED'){this.obs.off('RecordStateChanged',listener);resolve(e);}};this.obs.on('RecordStateChanged',listener);});
  const stopped=await this.obs.call('StopRecord');await finalized;this.active=false;
  const afterStats=await this.obs.call('GetStats');
  const target=path.join(root,'recordings',this.scene.id+'-'+Date.now()+'.mkv');
  for(let attempt=0;attempt<20;attempt++){try{fs.renameSync(stopped.outputPath,target);break;}catch(error){if(attempt===19)throw error;await pause(100);}}
  const metadata=JSON.parse(execFileSync(ffprobe,['-v','quiet','-print_format','json','-show_streams','-show_format',target],{encoding:'utf8'}));
  const stream=metadata.streams.find(s=>s.codec_type==='video');
  if(stream.width!==1920||stream.height!==1080||stream.r_frame_rate!=='60/1')throw Error('Source is not native OBS 1080p60');
  // Locate the actual flash in the encoded source. The flash is trimmed out.
  const bytes=execFileSync(ffmpeg,['-v','error','-i',target,'-t','2','-vf','crop=8:8:0:0,format=rgb24','-f','rawvideo','pipe:1'],{maxBuffer:2e6});
  let markerFrame=-1;const size=8*8*3;
  for(let frame=0;frame<bytes.length/size;frame++){const o=frame*size+(4*8+4)*3;if(bytes[o]>180&&bytes[o+1]<50&&bytes[o+2]>180){markerFrame=frame;break;}}
  if(markerFrame<0)throw Error('Encoded synchronization marker was not captured');
  const toFrame=ms=>markerFrame+Math.round((ms-this.syncBrowserMs)*.06);
  const expectedEnd=toFrame(this.endBrowserMs),encodedFrames=Math.round(Number(metadata.format.duration)*60);
  if(expectedEnd>encodedFrames+2||encodedFrames-expectedEnd>90)throw Error('Encoded clip and browser clock disagree; do not use this take');
  if(this.beats.some(b=>b.endBrowserMs<b.startBrowserMs||b.startBrowserMs<this.startBrowserMs-20))throw Error('Non-monotonic beat clock; do not use this take');
  const entry={scene_id:this.scene.id,recording_id:this.scene.id,file:path.relative(root,target).replaceAll('\\','/'),capture_settings:JSON.parse(fs.readFileSync(path.join(root,'qa/capture-calibration.json'),'utf8')),source_start:toFrame(this.startBrowserMs),source_end:toFrame(this.endBrowserMs),browser_url:this.page.url(),expected_state:this.scene.expected_state,cursor_events:this.events.map(e=>({...e,frame:toFrame(e.timeMs)})),network_assertions:this.network,beats:this.beats.map(b=>({...b,sourceStart:toFrame(b.startBrowserMs),sourceEnd:toFrame(b.endBrowserMs)})),sync:{method:'encoded magenta marker + browser performance clock',markerFrame,browserMs:this.syncBrowserMs,maximum_quantization_frames:1},probe:{width:stream.width,height:stream.height,frame_rate:stream.r_frame_rate,codec:stream.codec_name,pixel_format:stream.pix_fmt,duration:metadata.format.duration},obs_stats:{renderSkippedFrames:afterStats.renderSkippedFrames-this.beforeStats.renderSkippedFrames,outputSkippedFrames:afterStats.outputSkippedFrames,rawBefore:this.beforeStats,rawAfter:afterStats,note:'Render counters accumulate since OBS startup; output counters reset when recording starts.'},status:'CAPTURED'};
  const manifestFile=path.join(root,'recordings/manifest.json');const manifest=fs.existsSync(manifestFile)?JSON.parse(fs.readFileSync(manifestFile,'utf8')):{fps:60,width:1920,height:1080,recordings:[]};
  manifest.recordings=manifest.recordings.filter(s=>s.scene_id!==entry.scene_id);manifest.recordings.push(entry);fs.writeFileSync(manifestFile,JSON.stringify(manifest,null,2));
  this.scenes.push(entry);return entry;
 }
}
export {obsConnect};
