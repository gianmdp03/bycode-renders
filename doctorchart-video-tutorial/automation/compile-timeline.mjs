import fs from 'node:fs';import path from 'node:path';import {execFileSync} from 'node:child_process';
import {root} from './browser.mjs';import {ffmpeg} from './recorder.mjs';
const manifest=JSON.parse(fs.readFileSync(path.join(root,'recordings/manifest.json'),'utf8'));
const story=JSON.parse(fs.readFileSync(path.join(root,'script/storyboard.json'),'utf8'));
const publicRoot=path.join(root,'remotion/public');
fs.mkdirSync(path.join(publicRoot,'footage'),{recursive:true});fs.mkdirSync(path.join(publicRoot,'audio'),{recursive:true});fs.mkdirSync(path.join(root,'subtitles'),{recursive:true});
const ordered=story.flatMap(chapter=>{const capture=manifest.recordings.find(r=>r.scene_id===chapter.id&&['CAPTURED','EXPLAINED','VERIFIED'].includes(r.status));return capture?[{chapter,capture}]:[];});
let frame=0;const scenes=[];const captions=[];const voice=[];
for(const {chapter,capture} of ordered){
 const clip=path.join(publicRoot,'footage',chapter.id+'.mp4');const source=path.join(root,capture.file);
 if(!fs.existsSync(clip)||fs.statSync(clip).mtimeMs<fs.statSync(source).mtimeMs)execFileSync(ffmpeg,['-v','error','-y','-i',source,'-map','0:v:0','-an','-c:v','copy','-movflags','+faststart',clip],{stdio:'pipe'});
 const scene={id:chapter.id,title:chapter.title,startFrame:frame,durationInFrames:capture.source_end-capture.source_start,sourceStart:capture.source_start,footage:'footage/'+chapter.id+'.mp4',beats:[],cursor:capture.cursor_events};
 for(const beat of capture.beats){
  const audioMeta=JSON.parse(fs.readFileSync(path.join(root,'audio',beat.id+'.json'),'utf8'));
  beat.audioDurationMs=audioMeta.durationMs;
  if(beat.audioDurationMs>(beat.sourceEnd-beat.sourceStart)/60*1000+17)throw Error('Voice would be truncated: '+beat.id);
  const from=beat.sourceStart-capture.source_start;
  const audio=path.join(publicRoot,'audio',beat.id+'.wav');const original=path.join(root,'audio',beat.id+'.wav');
  if(!fs.existsSync(audio)||fs.statSync(audio).mtimeMs<fs.statSync(original).mtimeMs)execFileSync(ffmpeg,['-v','error','-y','-i',original,'-af','loudnorm=I=-16:TP=-1.5:LRA=7','-ar','48000','-ac','2','-c:a','pcm_s16le',audio],{stdio:'pipe'});
  scene.beats.push({...beat,from,durationInFrames:beat.sourceEnd-beat.sourceStart,audio:'audio/'+beat.id+'.wav',captions:audioMeta.sentence_captions});
  const startMs=(frame+from)/60*1000;
  for(const caption of audioMeta.sentence_captions??[{text:beat.text,startMs:0,endMs:beat.audioDurationMs,timestampMs:null,confidence:null}])captions.push({...caption,startMs:Math.round(startMs+caption.startMs),endMs:Math.round(startMs+caption.endMs),timestampMs:null});
  voice.push({scene_id:chapter.id,voice_segment:beat.id,text:beat.text,audio:'audio/'+beat.id+'.wav',durationMs:beat.audioDurationMs,startMs:Math.round(startMs),endMs:Math.round(startMs+beat.audioDurationMs)});
 }
 scenes.push(scene);frame+=scene.durationInFrames;
}
const timeline={width:1920,height:1080,fps:60,durationInFrames:frame,complete:false,scenes};
const out=(name,v)=>fs.writeFileSync(path.join(root,name),typeof v==='string'?v:JSON.stringify(v,null,2));
out('remotion/src/timeline.json',timeline);out('subtitles/doctorchart-captions.json',captions);out('script/voice-segments.json',voice);
const stamp=ms=>{const n=Math.round(ms);return `${String(Math.floor(n/3600000)).padStart(2,'0')}:${String(Math.floor(n/60000)%60).padStart(2,'0')}:${String(Math.floor(n/1000)%60).padStart(2,'0')},${String(n%1000).padStart(3,'0')}`;};
const srtLines=text=>{if(text.length<=80)return text;const spaces=[...text.matchAll(/ /g)].map(m=>m.index);const split=spaces.reduce((best,i)=>Math.abs(i-text.length/2)<Math.abs(best-text.length/2)?i:best,spaces[0]??text.length);return text.slice(0,split)+'\n'+text.slice(split+1);};
out('subtitles/doctorchart-es-419.srt',captions.map((c,i)=>`${i+1}\n${stamp(c.startMs)} --> ${stamp(c.endMs)}\n${srtLines(c.text)}\n`).join('\n'));
const principalEndMs=scenes.filter(s=>Number(s.id.slice(0,2))<=12).reduce((n,s)=>n+s.durationInFrames,0)/60*1000;
const asSrt=rows=>rows.map((c,i)=>`${i+1}\n${stamp(c.startMs)} --> ${stamp(c.endMs)}\n${srtLines(c.text)}\n`).join('\n');
out('subtitles/doctorchart-principal-es-419.srt',asSrt(captions.filter(c=>c.startMs<principalEndMs)));
out('subtitles/doctorchart-complementos-es-419.srt',asSrt(captions.filter(c=>c.startMs>=principalEndMs).map(c=>({...c,startMs:c.startMs-principalEndMs,endMs:c.endMs-principalEndMs}))));
const identifiers=scenes.map((_,i)=>'Chapter'+String(i+1).padStart(2,'0'));
const authored=scenes.map((s,i)=>`export const ${identifiers[i]} = () => <RecordedChapter scene={timeline.scenes[${i}]}>${s.beats.map(b=>`<Sequence name=${JSON.stringify('Voz · '+b.id)} from={${b.from}} durationInFrames={${b.durationInFrames}} premountFor={120}><Narration src={staticFile(${JSON.stringify(b.audio)})}/></Sequence>`).join('\n')}</RecordedChapter>;`).join('\n');
const mainFrames=scenes.filter(s=>Number(s.id.slice(0,2))<=12).reduce((n,s)=>n+s.durationInFrames,0);
const sequence=(s,i,offset=0)=>`<Sequence name=${JSON.stringify(s.title)} from={${s.startFrame-offset}} durationInFrames={${s.durationInFrames}} premountFor={180}><${identifiers[i]}/></Sequence>`;
out('remotion/src/GeneratedTimeline.tsx',`// Generated from measured recordings and actual voice files. Every independently editable clip is an authored JSX node.\nimport {Composition,Folder,Sequence,staticFile} from 'remotion';\nimport {Narration} from './Narration';\nimport {RecordedChapter} from './RecordedChapter';\nimport timeline from './timeline.json';\n${authored}\nexport const DoctorChartTutorial=()=> <>\n${scenes.map((s,i)=>sequence(s,i)).join('\n')}\n</>;\nexport const DoctorChartMain=()=> <>${scenes.map((s,i)=>Number(s.id.slice(0,2))<=12?sequence(s,i):'').join('\n')}</>;\nexport const DoctorChartExtras=()=> <>${scenes.map((s,i)=>Number(s.id.slice(0,2))>12?sequence(s,i,mainFrames):'').join('\n')}</>;\nexport const ChapterCompositions=()=> <Folder name="Chapters">\n${scenes.map((s,i)=>`<Composition id=${JSON.stringify(s.id)} component={${identifiers[i]}} width={1920} height={1080} fps={60} durationInFrames={${s.durationInFrames}}/>`).join('\n')}\n</Folder>;\n`);
fs.mkdirSync(path.join(root,'output'),{recursive:true});
out('output/youtube-chapters.txt',scenes.map(s=>`${String(Math.floor(s.startFrame/3600)).padStart(2,'0')}:${String(Math.floor(s.startFrame/60)%60).padStart(2,'0')} ${s.title}`).join('\n')+'\n');
console.log(JSON.stringify({capturedChapters:scenes.length,plannedChapters:story.length,durationSeconds:frame/60,voiceSegments:voice.length,fullCoverage:false}));
