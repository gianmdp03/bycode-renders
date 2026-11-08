// Remotion authors and renders the shared visual layout. The deterministic media
// assembly reuses original recorded frames instead of screenshotting them again.
// A full Remotion render remains available through --full-remotion.
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import {spawn,execFileSync} from 'node:child_process';import {bundle} from '@remotion/bundler';import {selectComposition,renderStill,renderMedia} from '@remotion/renderer';import {root} from './browser.mjs';import {ffmpeg,ffprobe} from './recorder.mjs';
const data=JSON.parse(fs.readFileSync(path.join(root,'remotion/src/timeline.json'),'utf8'));const cache=path.join(root,'.local/render');fs.mkdirSync(cache,{recursive:true});
fs.writeFileSync(path.join(root,'.local/render-process.json'),JSON.stringify({pid:process.pid,started:new Date().toISOString(),project:'pointly-video-tutorial'}));
const visualEdits=JSON.parse(fs.readFileSync(path.join(root,'remotion/src/visual-edits.json'),'utf8'));
const serveUrl=await bundle({entryPoint:path.join(root,'remotion/src/index.tsx'),publicDir:path.join(root,'remotion/public'),outDir:path.join(root,'.local/remotion-bundle')});
if(process.argv.includes('--full-remotion')){const composition=await selectComposition({serveUrl,id:'PointlyTutorial'});await renderMedia({serveUrl,composition,codec:'h264',crf:16,pixelFormat:'yuv420p',audioBitrate:'256k',outputLocation:path.join(root,'output/Pointly-tutorial-remotion.mp4'),concurrency:2});process.exit(0)}
const want=process.argv.filter(a=>/^\d\d-/.test(a));
const layersOnly=process.argv.includes('--layers-only');
const stateFile=path.join(cache,'render-state.json');const state=fs.existsSync(stateFile)?JSON.parse(fs.readFileSync(stateFile,'utf8')):{};
const implementation=fs.readFileSync(new URL(import.meta.url),'utf8')+fs.readFileSync(path.join(root,'remotion/src/Chapter.tsx'),'utf8')+JSON.stringify(visualEdits);
const fingerprint=c=>{const {from,...local}=c;return crypto.createHash('sha256').update(JSON.stringify(local)+implementation).digest('hex')};
for(let i=0;i<data.chapters.length;i++){
 const c=data.chapters[i];if(want.length&&!want.includes(c.id))continue;
 if(process.argv.includes('--assemble-only'))continue;
 if(!layersOnly&&state[c.id]===fingerprint(c)&&fs.existsSync(path.join(cache,c.id+'.mp4'))){console.log('REUSE RENDER',c.id);continue}
 if(!layersOnly&&(!fs.existsSync(path.join(root,'remotion/public',c.footage))||!fs.existsSync(path.join(root,'remotion/public',c.audio))))throw Error('Missing production media: '+c.id);
 const composition=await selectComposition({serveUrl,id:'Chapter'+(i+1),inputProps:{layerOnly:true}});
 const layer=path.join(cache,c.id+'-layout.png');await renderStill({serveUrl,composition,frame:c.opening?300:0,inputProps:{layerOnly:true},output:layer,imageFormat:'png'});
 let cover=null;if(c.opening||c.closing){cover=path.join(cache,c.id+'-brand.png');await renderStill({serveUrl,composition,frame:c.opening?120:c.durationInFrames-1,inputProps:{layerOnly:true},output:cover,imageFormat:'png'})}
 if(layersOnly)continue;
 const at=ms=>{const cs=Math.round(ms/10);return `${Math.floor(cs/360000)}:${String(Math.floor(cs/6000)%60).padStart(2,'0')}:${String(Math.floor(cs/100)%60).padStart(2,'0')}.${String(cs%100).padStart(2,'0')}`};
 const ass=`[Script Info]\nScriptType: v4.00+\nPlayResX: 1920\nPlayResY: 1080\nWrapStyle: 0\nScaledBorderAndShadow: yes\n\n[V4+ Styles]\nFormat: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\nStyle: Tutorial,Google Sans,28,&H004B2810,&H004B2810,&H00FFFFFF,&H00FFFFFF,0,0,0,0,100,100,0,0,1,0,0,2,220,220,14,1\n\n[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n`+c.captions.map(cap=>`Dialogue: 0,${at(cap.startMs)},${at(cap.endMs)},Tutorial,,0,0,0,,${cap.text.replaceAll('\n','\\N')}`).join('\n');
 const assFile=path.join(cache,c.id+'.ass');fs.writeFileSync(assFile,ass);
 const seconds=c.durationInFrames/60;const sourceSeconds=c.sourceFrames/60;
 const args=['-hide_banner','-v','warning','-y','-ss',String(c.sourceStart/60),'-i',path.join(root,'remotion/public',c.footage),'-loop','1','-framerate','60','-i',layer,'-i',path.join(root,'remotion/public',c.audio)];
 if(cover)args.push('-loop','1','-framerate','60','-i',cover);
 if(c.supplement)args.push('-ss',String(c.supplement.sourceStart/60),'-i',path.join(root,'remotion/public',c.supplement.footage));
 const z=visualEdits[c.id];const zoom=z?`zoompan=z='1+${z.amount}*(0.5-0.5*cos(PI*min(max((on-${z.start})/120,0),1)))*(0.5-0.5*cos(PI*min(max((${z.end}-on)/120,0),1)))':x='(iw-iw/zoom)*${z.x}':y='(ih-ih/zoom)*${z.y}':d=1:s=1728x956:fps=60`:'scale=1728:956:flags=lanczos';
 let filter=`[0:v]trim=duration=${sourceSeconds},setpts=PTS-STARTPTS,crop=1920:1062:0:8,${zoom},fps=60,tpad=stop_mode=clone:stop_duration=${Math.max(0,seconds-sourceSeconds)+1}[ui];[1:v][ui]overlay=96:49:shortest=0[base];`;
 let current='base';
 if(c.supplement){const s=c.supplement,at=s.from/60,end=(s.from+s.durationInFrames)/60,source=s.sourceFrames/60,input=cover?4:3;
  filter+=`[${input}:v]trim=duration=${source},setpts=PTS-STARTPTS,crop=1920:1062:0:8,scale=1728:956:flags=lanczos,fps=60,tpad=stop_mode=clone:stop_duration=${s.durationInFrames/60+1},format=rgba,fade=t=in:st=0:d=0.1:alpha=1,fade=t=out:st=${s.durationInFrames/60-.1}:d=0.1:alpha=1,setpts=PTS+${at}/TB[guide];[base][guide]overlay=96:49:eof_action=pass:enable='gte(t,${at})*lt(t,${end})'[responsive];[responsive]drawtext=fontfile='remotion/public/fonts/google-sans.ttf':text='Vista en pantalla pequeña':fontsize=18:fontcolor=0x576980:x=w-tw-96:y=13:enable='gte(t,${at})*lt(t,${end})'[guideLabel];`;current='guideLabel';}
 if(cover){const fade=c.opening?'fade=t=in:st=0:d=0.333333:alpha=1,fade=t=out:st=4:d=0.5:alpha=1':`fade=t=in:st=${Math.max(0,seconds-7)}:d=0.5:alpha=1`;filter+=`[3:v]format=rgba,${fade}[cover];[base][cover]overlay=0:0[branded];`;current='branded'}
 const captionFilters=c.captions.map((cap,n)=>{const txt=path.join(cache,c.id+'-caption-'+n+'.txt');fs.writeFileSync(txt,cap.text);return `drawtext=fontfile='remotion/public/fonts/google-sans.ttf':textfile='${path.relative(root,txt).replaceAll('\\','/')}':fontsize=28:fontcolor=0x10284b:x=(w-tw)/2:y=1031:enable='gte(t,${cap.startMs/1000})*lt(t,${cap.endMs/1000})'`});
 filter+=`[${current}]${captionFilters.length?captionFilters.join(',')+',':''}fade=t=in:st=0:d=0.15:color=0xf3f6fb,fade=t=out:st=${seconds-.15}:d=0.15:color=0xf3f6fb,format=yuv420p[out]`;
 const filterFile=path.join(cache,c.id+'.filter');fs.writeFileSync(filterFile,filter);
 const output=path.join(cache,c.id+'.mp4');args.push('-filter_complex_script',filterFile,'-map','[out]','-map','2:a:0','-t',String(seconds),'-r','60','-c:v','h264_nvenc','-preset','p5','-profile:v','high','-cq','17','-b:v','18M','-g','120','-bf','2','-c:a','aac','-b:a','256k','-ar','48000','-ac','2','-af','apad,afade=t=in:st=0:d=0.008','-colorspace','bt709','-color_primaries','bt709','-color_trc','bt709','-color_range','tv','-movflags','+faststart',output);
 console.log('RENDER',c.id,seconds.toFixed(2)+'s');await new Promise((resolve,reject)=>{const p=spawn(ffmpeg,args,{cwd:root,windowsHide:true,stdio:['ignore','ignore','pipe']});let err='';p.stderr.on('data',d=>err+=d);p.on('error',reject);p.on('close',code=>code===0?resolve():reject(Error(err.slice(-3500))))});
 const probe=JSON.parse(execFileSync(ffprobe,['-v','quiet','-show_streams','-show_format','-of','json',output],{encoding:'utf8'}));fs.writeFileSync(path.join(cache,c.id+'-probe.json'),JSON.stringify(probe,null,2));state[c.id]=fingerprint(c);fs.writeFileSync(stateFile,JSON.stringify(state,null,2));console.log('DONE',c.id);
}
if(want.length||layersOnly)process.exit(0);
const missing=data.chapters.filter(c=>!fs.existsSync(path.join(cache,c.id+'.mp4')));if(missing.length)throw Error('Unrendered chapters: '+missing.map(c=>c.id).join(','));
const stale=data.chapters.filter(c=>state[c.id]!==fingerprint(c));if(stale.length)throw Error('Stale rendered chapters: '+stale.map(c=>c.id).join(','));
const concat=path.join(cache,'concat.txt');fs.writeFileSync(concat,data.chapters.map(c=>`file '${c.id}.mp4'`).join('\n'));
const metadata=path.join(cache,'chapters.txt');fs.writeFileSync(metadata,';FFMETADATA1\n'+data.chapters.map(c=>`[CHAPTER]\nTIMEBASE=1/60\nSTART=${c.from}\nEND=${c.from+c.durationInFrames}\ntitle=${c.title}\n`).join(''));
execFileSync(path.join(root,'../doctorchart-video-tutorial/.local/qwen-venv/Scripts/python.exe'),[path.join(root,'automation/mix.py')],{cwd:root,stdio:'pipe'});
const output=path.join(root,'output/Pointly-tutorial-completo-1080p60.mp4');execFileSync(ffmpeg,['-v','error','-y','-f','concat','-safe','0','-i',concat,'-i',path.join(cache,'final-narration.wav'),'-i',metadata,'-map','0:v:0','-map','1:a:0','-map_metadata','2','-map_chapters','2','-c:v','copy','-c:a','aac','-b:a','256k','-ar','48000','-ac','2','-t',String(data.durationInFrames/60),'-movflags','+faststart',output],{cwd:root,stdio:'pipe'});console.log('ASSEMBLED',output);
