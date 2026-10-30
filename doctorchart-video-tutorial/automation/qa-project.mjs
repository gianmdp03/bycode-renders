import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import {execFileSync} from 'node:child_process';import {root,openBrowser} from './browser.mjs';import {ffprobe} from './recorder.mjs';
const read=f=>JSON.parse(fs.readFileSync(path.join(root,f),'utf8'));
const checks=[];const add=(name,pass,detail)=>checks.push({name,status:pass?'PASS':'FAIL',detail});
const timeline=read('remotion/src/timeline.json'),manifest=read('recordings/manifest.json'),coverage=read('qa/coverage-report.json'),provenance=read('inventory/source-provenance.json');
for(const repo of provenance.repositories){const commit=execFileSync('git',['rev-parse','HEAD'],{cwd:repo.path,encoding:'utf8'}).trim(),dirty=execFileSync('git',['status','--porcelain'],{cwd:repo.path,encoding:'utf8'}).trim();add('Unchanged product '+path.basename(repo.path),commit===repo.commit&&!dirty,{commit,clean:!dirty});}
const frontend=provenance.repositories[0].path;const differences=[];
for(const [file,expected] of Object.entries(provenance.frontend_files))for(const base of [frontend,path.join(root,'.local/frontend')]){const p=path.join(base,file);if(!fs.existsSync(p)||crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')!==expected)differences.push(path.relative(root,p));}
add('Original frontend and filming copy source hashes',differences.length===0,{differences});
let cursorClicks=0,beats=0;const audioIssues=[],captionIssues=[],sourceIssues=[],captureWarnings=[];const {browser,page}=await openBrowser();
try{
 for(const scene of timeline.scenes){
  const capture=manifest.recordings.find(r=>r.scene_id===scene.id);if(!capture){sourceIssues.push(scene.id+': absent');continue;}
  if(capture.probe.width!==1920||capture.probe.height!==1080||capture.probe.frame_rate!=='60/1'||capture.source_end-capture.source_start!==scene.durationInFrames)sourceIssues.push(scene.id+': source geometry/time');
  if(!capture.obs_stats||capture.obs_stats.outputSkippedFrames||capture.obs_stats.renderSkippedFrames)captureWarnings.push({scene:scene.id,obs_stats:capture.obs_stats,note:'Inspect original motion before master; metadata is not cadence proof.'});
  cursorClicks+=capture.cursor_events.filter(e=>e.event==='click').length;
  for(const beat of scene.beats){
   beats++;const file=path.join(root,'remotion/public',beat.audio);const audio=JSON.parse(execFileSync(ffprobe,['-v','quiet','-show_streams','-show_format','-of','json',file],{encoding:'utf8'}));const stream=audio.streams[0];
   if(stream.sample_rate!=='48000'||stream.channels!==2||beat.audioDurationMs>beat.durationInFrames/60*1000+17)audioIssues.push(beat.id);
   for(const caption of beat.captions??[]){const lines=await page.evaluate(text=>{const c=document.createElement('canvas');const context=c.getContext('2d');context.font='32px Arial';let lines=1,line='';for(const word of text.split(/\s+/)){const candidate=(line?line+' ':'')+word;if(context.measureText(candidate).width>1320){lines++;line=word;}else line=candidate;}return lines;},caption.text);if(lines>2||caption.endMs>beat.audioDurationMs+1||caption.startMs<0)captionIssues.push({beat:beat.id,lines,text:caption.text});}
  }
 }
}finally{await browser.close();}
add('Native source geometry and synchronized clock',sourceIssues.length===0,{issues:sourceIssues,captureWarnings});
add('Actual audio 48kHz stereo and no truncated narration',audioIssues.length===0,{segments:beats,issues:audioIssues});
add('Captions max two lines at actual 32px Arial',captionIssues.length===0,{issues:captionIssues});
add('Recorded cursor clicks',cursorClicks>0,{cursorClicks});
add('Coverage references exist in actual timeline',coverage.invalid_links.length===0&&coverage.matched_evidence.every(e=>e.in_timeline),{invalid_links:coverage.invalid_links,counts:coverage.status_counts});
const unresolved=['Visual and listening review before master approval.'];
if(coverage.status_counts.PENDING)unresolved.push(`${coverage.status_counts.PENDING} inventory rows still PENDING; no claim of full coverage.`);
if(coverage.status_counts.BLOCKED)unresolved.push(`${coverage.status_counts.BLOCKED} defensive error branches could not be reached through the authorized guards; each reason remains explicit in the matrix.`);
const motionFile=path.join(root,'qa/qa-native-motion-native-motion.json');const motion=fs.existsSync(motionFile)?read('qa/qa-native-motion-native-motion.json'):null;
unresolved.push('Motion cadence is assessed on actual source changes; a 60/1 metadata value alone is insufficient. See per-source motion reports.');
const report={status:checks.every(c=>c.status==='PASS')?'PREVIEW_WITH_OPEN_ITEMS':'FAIL',width:1920,height:1080,fps:60,seconds:timeline.durationInFrames/60,chapters:timeline.scenes.length,beats,checks,motion,full_coverage:false,unresolved,timeline_sha256:crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'remotion/src/timeline.json'))).digest('hex')};
fs.writeFileSync(path.join(root,'qa/project-report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({status:report.status,chapters:report.chapters,seconds:report.seconds,checks:checks.map(({name,status})=>({name,status})),unresolved}));if(checks.some(c=>c.status==='FAIL'))process.exitCode=1;
