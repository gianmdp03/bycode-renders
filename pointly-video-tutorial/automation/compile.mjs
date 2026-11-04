import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import {chapters} from '../script/chapters.mjs';import {root} from './browser.mjs';
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));const write=(p,v)=>{const f=path.join(root,p);fs.mkdirSync(path.dirname(f),{recursive:true});fs.writeFileSync(f,typeof v==='string'?v:JSON.stringify(v,null,2)+'\n')};
const manifest=fs.existsSync(path.join(root,'recordings/manifest.json'))?read('recordings/manifest.json'):{recordings:[]};
const edits=fs.existsSync(path.join(root,'.local/retimed-manifest.json'))?read('.local/retimed-manifest.json').chapters:{};
const stamp=ms=>{const n=Math.max(0,Math.round(ms));return `${String(Math.floor(n/3600000)).padStart(2,'0')}:${String(Math.floor(n/60000)%60).padStart(2,'0')}:${String(Math.floor(n/1000)%60).padStart(2,'0')},${String(n%1000).padStart(3,'0')}`};
let from=0;const cues=[];const gaps=[];const data=[];
for(const c of chapters){
 const rec=manifest.recordings.find(r=>r.scene_id===c.id);const metaFile=path.join(root,'audio',c.id+'.json');const alignFile=path.join(root,'audio',c.id+'.alignment.json');
 const meta=fs.existsSync(metaFile)?read('audio/'+c.id+'.json'):null;const alignment=fs.existsSync(alignFile)?read('audio/'+c.id+'.alignment.json'):null;
 const corrections=fs.existsSync(path.join(root,'script/caption-corrections.json'))?read('script/caption-corrections.json')[c.id]:null;
 const caps=alignment?.captions.map(cap=>({...cap,text:corrections?.reduce((s,x)=>s.replaceAll(x.from,x.to),cap.text)??cap.text}))??[];
 const edit=edits[c.id];const validEdit=edit&&edit.rawRecording===rec?.file&&edit.audioSha256===meta?.sha256;
 const sourceFile=validEdit?edit.file:rec?.file;const sourceFrames=validEdit?edit.sourceFrames:rec?rec.source_end-rec.source_start:1;const durationInFrames=Math.max(Math.ceil(((meta?.duration??c.narration.split(/\s+/).length/2.7)+.65)*60),sourceFrames);
 const target={...c,footage:'footage/'+(sourceFile?path.basename(sourceFile):c.id+'.mp4'),audio:'audio/'+c.id+'.wav',sourceStart:validEdit?0:rec?.source_start??0,sourceFrames,durationInFrames,from,captions:caps,opening:c.id==='01-intro',closing:c.id==='30-close'};
 data.push(target);for(const cap of caps)cues.push({...cap,startMs:cap.startMs+from/60*1000,endMs:cap.endMs+from/60*1000});from+=durationInFrames;
 for(const [what,ok] of [['capture',rec],['narration',meta],['alignment',alignment]])if(!ok)gaps.push(c.id+': '+what);
 if(meta&&meta.text_sha256!==crypto.createHash('sha256').update(c.narration).digest('hex'))gaps.push(c.id+': narration-stale');
 if(alignment&&meta&&alignment.audio_sha256!==meta.sha256)gaps.push(c.id+': alignment-stale');
 if(edit&&!validEdit)gaps.push(c.id+': editing-stale');
 if(rec){fs.mkdirSync(path.join(root,'remotion/public/footage'),{recursive:true});fs.copyFileSync(path.join(root,sourceFile),path.join(root,'remotion/public',target.footage));}
 if(meta){fs.mkdirSync(path.join(root,'remotion/public/audio'),{recursive:true});fs.copyFileSync(path.join(root,'audio',c.id+'.wav'),path.join(root,'remotion/public',target.audio));}
 write('script/'+c.id+'.srt',caps.map((cap,i)=>`${i+1}\n${stamp(cap.startMs)} --> ${stamp(cap.endMs)}\n${cap.text}\n`).join('\n'));
}
write('remotion/src/timeline.json',{fps:60,width:1920,height:1080,durationInFrames:from,chapters:data});
write('script/pointly-tutorial.srt',cues.map((c,i)=>`${i+1}\n${stamp(c.startMs)} --> ${stamp(c.endMs)}\n${c.text}\n`).join('\n'));
write('script/captions.json',cues);
write('script/guion-completo.md','# Tutorial de Pointly\n\nNarración masculina local Qwen3-TTS. Identidad audiovisual draft; adaptación del frontend local.\n\n'+data.map(c=>`## ${c.id} · ${c.title}\n\nObjetivo: ${c.objective}.\n\nDuración de montaje: ${(c.durationInFrames/60).toFixed(2)} s. Inicio: ${stamp(c.from/60*1000)}.\n\n${c.narration}\n`).join('\n'));
write('script/storyboard.json',data.map(c=>({id:c.id,title:c.title,objective:c.objective,account:c.account,from:c.from,durationInFrames:c.durationInFrames,recording:manifest.recordings.find(r=>r.scene_id===c.id)?.file??null,actionEvidence:fs.existsSync(path.join(root,'qa',c.id+'-evidence.json'))?read('qa/'+c.id+'-evidence.json').evidence:[],narration:c.narration,visuals:'Original Chromium UI, annotated pointer and click rings; safe subtitle band; chapter title. No UI reconstruction.',zoom:'Contextual source crop only where approved in edit decisions.'})));
for(let i=0;i<data.length;i++)write(`remotion/src/Scene${i+1}.tsx`,`import {Chapter} from './Chapter';\nimport timeline from './timeline.json';\nexport const Scene${i+1}=({layerOnly=false}:{layerOnly?:boolean})=><Chapter data={timeline.chapters[${i}]} layerOnly={layerOnly}/>;\n`);
write('remotion/src/index.tsx',`import {registerRoot,Composition,Sequence,AbsoluteFill} from 'remotion';\n${data.map((c,i)=>`import {Scene${i+1}} from './Scene${i+1}';`).join('\n')}\nexport const Tutorial=()=> <AbsoluteFill>${data.map((c,i)=>`\n <Sequence from={${c.from}} durationInFrames={${c.durationInFrames}} name=${JSON.stringify(c.title)}><Scene${i+1}/></Sequence>`).join('')}\n</AbsoluteFill>;\nconst Root=()=> <>\n <Composition id="PointlyTutorial" component={Tutorial} durationInFrames={${from}} fps={60} width={1920} height={1080}/>\n${data.map((c,i)=>` <Composition id="Chapter${i+1}" component={Scene${i+1}} durationInFrames={${c.durationInFrames}} fps={60} width={1920} height={1080} defaultProps={{layerOnly:false}}/>`).join('\n')}\n</>;\nregisterRoot(Root);\n`);
write('qa/input-readiness.json',{ready:gaps.length===0,gaps,durationSeconds:from/60});console.log('Compiled editable timeline:',(from/3600).toFixed(2),'minutes; missing inputs:',gaps.length);
if(process.argv.includes('--final')&&gaps.length)process.exitCode=1;
