"""Validate the rendered delivery itself, then create reviewable final frames."""
from pathlib import Path
import json,subprocess,re,hashlib,math
from PIL import Image,ImageDraw
ROOT=Path(__file__).resolve().parents[1]
timeline=json.loads((ROOT/'remotion/src/timeline.json').read_text(encoding='utf8'))
ffmpeg=next((ROOT.parent/'doctorchart-video-tutorial/.local/voice-venv/Lib/site-packages/imageio_ffmpeg/binaries').glob('*.exe'))
ffprobe=ROOT.parent/'node_modules/@remotion/compositor-win32-x64-msvc/ffprobe.exe'
video=ROOT/'output/Pointly-tutorial-completo-1080p60.mp4'
probe=json.loads(subprocess.check_output([str(ffprobe),'-v','quiet','-show_streams','-show_format','-show_chapters','-of','json',str(video)]))
v=next(s for s in probe['streams'] if s['codec_type']=='video');a=next(s for s in probe['streams'] if s['codec_type']=='audio')
assert (v['width'],v['height'],v['r_frame_rate'],v['avg_frame_rate'],v['codec_name'])==(1920,1080,'60/1','60/1','h264')
assert v['pix_fmt']=='yuv420p' and a['channels']==2 and a['sample_rate']=='48000' and a['codec_name']=='aac'
assert int(v['nb_frames'])==timeline['durationInFrames']
assert len(probe['chapters'])==len(timeline['chapters'])
assert abs(float(probe['format']['duration'])-timeline['durationInFrames']/60)<.1
check=subprocess.run([str(ffmpeg),'-hide_banner','-nostats','-threads','2','-i',str(video),'-vf','crop=1728:956:96:49,scale=320:180,blackdetect=d=0.15:pix_th=0.04:pic_th=0.98','-af','loudnorm=I=-16:TP=-1.5:LRA=7:print_format=json','-f','null','NUL'],stdout=subprocess.DEVNULL,stderr=subprocess.PIPE)
log=check.stderr.decode(errors='replace');(ROOT/'.local/logs/final-decode.log').write_text(log,encoding='utf8');assert check.returncode==0,'Final decode failed'
black=re.findall(r'black_start:([\d.]+) black_end:([\d.]+) black_duration:([\d.]+)',log);assert not black,'Unexpected fully black intervals'
loud=json.loads(re.findall(r'\{\s*"input_i".*?\}',log,re.S)[-1]);assert -17.5<=float(loud['input_i'])<=-14.5 and float(loud['input_tp'])<=-.9
frames=ROOT/'qa/final-frames';frames.mkdir(exist_ok=True);samples=[]
for c in timeline['chapters']:
 for fraction in (.20,.50,.80):
  local=c['durationInFrames']/60*fraction;absolute=c['from']/60+local;name=f"{c['id']}-{round(local*100):05}.png";out=frames/name
  subprocess.run([str(ffmpeg),'-v','error','-y','-ss',str(absolute),'-i',str(video),'-frames:v','1',str(out)],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.PIPE)
  with Image.open(out) as im:
   assert im.size==(1920,1080)
   small=im.crop((96,49,1824,1005)).convert('L').resize((320,180));hist=small.histogram();content=sum(hist[:200])/(320*180)
   assert content>.0015,f"Blank interface sample: {c['id']} at {local:.3f}s"
  samples.append({'chapter':c['id'],'localSeconds':round(local,3),'absoluteSeconds':round(absolute,3),'visibleContentFraction':round(content,5),'file':str(out.relative_to(ROOT)).replace('\\','/')})
for group in range(math.ceil(len(timeline['chapters'])/5)):
 chunk=samples[group*15:(group+1)*15];sheet=Image.new('RGB',(1920,1950),'#f3f6fb');draw=ImageDraw.Draw(sheet)
 for i,s in enumerate(chunk):
  x=(i%3)*640;y=(i//3)*390
  with Image.open(ROOT/s['file']) as im:sheet.paste(im.resize((640,360)),(x,y+30))
  draw.text((x+12,y+8),s['chapter']+' · '+str(s['localSeconds'])+' s',fill='#10284b')
 sheet.save(ROOT/f'qa/final-contact-sheet-{group+1}.jpg',quality=94)
manifest=json.loads((ROOT/'recordings/manifest.json').read_text(encoding='utf8'));cadence=[{'chapter':r['scene_id'],'averageFps':r.get('sourceMotion',{}).get('actualAverageFps'),'maximumGapMs':r.get('sourceMotion',{}).get('maxFrameGapMs')} for r in manifest['recordings']]
readiness=json.loads((ROOT/'qa/input-readiness.json').read_text(encoding='utf8'));assert readiness['ready'],readiness['gaps']
report={'state':'TECHNICAL_PASS_PENDING_VISUAL_REVIEW','file':str(video.relative_to(ROOT)).replace('\\','/'),'sha256':hashlib.sha256(video.read_bytes()).hexdigest(),'width':1920,'height':1080,'fps':'60/1 CFR','frames':v['nb_frames'],'durationSeconds':probe['format']['duration'],'bytes':video.stat().st_size,'codec':'H.264 High / yuv420p','audio':'AAC, stereo, 48000 Hz','loudness':loud,'chapterCount':len(probe['chapters']),'completeDecode':'PASS','blackIntervals':black,'renderedFrameSamples':samples,'sourceCadence':cadence,'sourceCadenceNote':'Original browser-tab frames have measured variable cadence, retained in the manifest. CFR conforming and deliberate reading holds do not imply 60 unique source pictures in every second.','narrationEndGaps':[{'id':c['id'],'seconds':round(c['durationInFrames']/60-json.loads((ROOT/'audio'/f"{c['id']}.json").read_text(encoding='utf8'))['duration'],3)} for c in timeline['chapters']]}
(ROOT/'qa/final-video-verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8')
print('PASS: format, complete decode, loudness, no black intervals, chapter metadata and 90 rendered-frame samples.')
