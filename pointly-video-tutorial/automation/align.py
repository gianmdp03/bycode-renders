"""Local acoustic word timing and independent script comparison, never text-length timing.
Run after generation, or --watch while Qwen renders chapters. GPU remains with Qwen.
"""
from pathlib import Path
import os,sys,json,time,re,unicodedata,difflib,subprocess,hashlib,numpy as np
ROOT=Path(__file__).resolve().parents[1]
os.environ.update(HF_HUB_DISABLE_TELEMETRY='1')
from faster_whisper import WhisperModel
model=WhisperModel('small',device='cpu',compute_type='int8',cpu_threads=4,num_workers=1,local_files_only=False)
manifest=next((s.split('=',1)[1] for s in sys.argv[1:] if s.startswith('--manifest=')),'script/chapters.json')
manifest=(ROOT/manifest).resolve()
if not manifest.is_relative_to(ROOT):raise ValueError('Manifest outside audiovisual project')
chapters=json.loads(manifest.read_text(encoding='utf8'))
def norm(s):return re.sub(r'[^a-z0-9]','',unicodedata.normalize('NFD',s.lower()).encode('ascii','ignore').decode())
def process(c):
 wav=ROOT/'audio'/f"{c['id']}.wav";out=ROOT/'audio'/f"{c['id']}.alignment.json"
 if not wav.exists() or not wav.with_suffix('.json').exists():return False
 meta=json.loads(wav.with_suffix('.json').read_text(encoding='utf8'))
 if meta['text_sha256']!=hashlib.sha256(c['narration'].encode()).hexdigest():return False
 if out.exists() and json.loads(out.read_text(encoding='utf8')).get('audio_sha256')==meta['sha256']:return True
 ffmpeg=next((ROOT.parent/'doctorchart-video-tutorial/.local/voice-venv/Lib/site-packages/imageio_ffmpeg/binaries').glob('*.exe'))
 pcm=subprocess.check_output([str(ffmpeg),'-v','error','-i',str(wav),'-ac','1','-ar','16000','-f','f32le','pipe:1'])
 segments,info=model.transcribe(np.frombuffer(pcm,dtype=np.float32),language='es',beam_size=5,word_timestamps=True,vad_filter=False,condition_on_previous_text=False,initial_prompt='Pointly, Bycode Software, DNI, QR, WhatsApp, JPEG, PNG, WebP.')
 words=[{'word':w.word.strip(),'start':w.start,'end':w.end,'probability':w.probability} for s in segments for w in (s.words or [])]
 actual=' '.join(w['word'] for w in words)
 expected=c['narration'].split();a=[norm(w) for w in expected];b=[norm(w['word']) for w in words]
 matcher=difflib.SequenceMatcher(None,a,b,autojunk=False);edits=[{'op':op,'expected':' '.join(expected[i:j]),'heard':' '.join(w['word'] for w in words[k:l])} for op,i,j,k,l in matcher.get_opcodes() if op!='equal']
 # Correct typography on acoustically matched words. Unmatched ASR stays visible
 # in the review report; it is never silently replaced with unspoken script text.
 for op,i,j,k,l in matcher.get_opcodes():
  if op=='equal':
   for x,y in zip(range(i,j),range(k,l)):words[y]['display']=expected[x]
 for w in words:w.setdefault('display',w['word'])
 captions=[];group=[]
 def flush():
  if group:
   captions.append({'text':' '.join(w['display'] for w in group),'startMs':round(group[0]['start']*1000),'endMs':round(group[-1]['end']*1000),'timestampMs':None,'confidence':round(sum(w['probability'] for w in group)/len(group),3)})
   group.clear()
 for w in words:
  if group and (len(' '.join(x['display'] for x in group))+len(w['display'])>77 or w['end']-group[0]['start']>5.3):flush()
  group.append(w)
  if re.search(r'[.!?;:]$',w['display']):flush()
 flush()
 result={'method':'faster-whisper-small acoustic word timestamps, local CPU int8; independent transcription vs source','audio_sha256':meta['sha256'],'transcript':actual,'scriptSimilarity':round(matcher.ratio(),4),'differences':edits,'words':words,'captions':captions,'status':'REVIEW_REQUIRED' if edits else 'ACOUSTIC_MATCH'}
 out.write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf8');print('ALIGNED',c['id'],round(matcher.ratio(),3),len(edits),'differences',flush=True);return True
while True:
 done=sum(process(c) for c in chapters)
 if done==len(chapters) or '--watch' not in sys.argv:break
 time.sleep(5)
