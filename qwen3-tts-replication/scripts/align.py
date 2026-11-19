"""Acoustic timing from FINAL audio; preserve ASR and expose script differences."""
from pathlib import Path
import argparse,json,os,subprocess,hashlib,re,unicodedata,difflib
ROOT=Path(__file__).resolve().parents[1]
os.environ.update(HF_HUB_OFFLINE='1',HF_HUB_DISABLE_TELEMETRY='1',HF_HUB_DISABLE_IMPLICIT_TOKEN='1')
p=argparse.ArgumentParser();p.add_argument('--model',default=str(ROOT/'models/whisper-small'));p.add_argument('--ffmpeg',required=True);p.add_argument('--audio',default=str(ROOT/'demo/public/reference.wav'));p.add_argument('--out',default=str(ROOT/'demo/public'));a=p.parse_args();out=Path(a.out).resolve();assert out.is_relative_to(ROOT);out.mkdir(parents=True,exist_ok=True)
import numpy as np
from faster_whisper import WhisperModel
audio=Path(a.audio);gen=json.loads(audio.with_suffix('.generation.json').read_text(encoding='utf8'))
assert hashlib.sha256(audio.read_bytes()).hexdigest()==gen['sha256']
pcm=subprocess.check_output([a.ffmpeg,'-v','error','-i',str(audio),'-ac','1','-ar','16000','-f','f32le','pipe:1'])
samples=np.frombuffer(pcm,dtype=np.float32);duration=len(samples)/16000
manifest=next(x for x in json.loads((ROOT/'models-manifest.json').read_text(encoding='utf8')) if x['name']=='whisper-small')
for item in manifest['files']:
 path=Path(a.model)/item['file'];h=hashlib.sha256()
 with path.open('rb') as f:
  while block:=f.read(8*1024*1024):h.update(block)
 assert path.stat().st_size==item['bytes'] and h.hexdigest()==item['sha256'],'Wrong Whisper file: '+str(path)
engine=WhisperModel(a.model,device='cpu',compute_type='int8',cpu_threads=4,num_workers=1,local_files_only=True)
prompt='Pointly, Bycode Software, DNI, QR, WhatsApp, JPEG, PNG, WebP.'
segments,info=engine.transcribe(samples,language='es',beam_size=5,word_timestamps=True,vad_filter=False,condition_on_previous_text=False,initial_prompt=prompt)
words=[{'word':w.word.strip(),'start':w.start,'end':w.end,'probability':w.probability} for s in segments for w in (s.words or [])]
assert words and all(0<=w['start']<w['end']<=duration+.04 for w in words)
assert all(words[i]['start']>=words[i-1]['start'] for i in range(1,len(words)))
def norm(s):
 s=re.sub('[^a-z0-9]','',unicodedata.normalize('NFD',s.lower()).encode('ascii','ignore').decode())
 return {'baicod':'bycode','baicode':'bycode','baicoud':'bycode','pointli':'pointly','poinly':'pointly','pointley':'pointly'}.get(s,s)
expected=gen['displayText'].split();matcher=difflib.SequenceMatcher(None,[norm(w) for w in expected],[norm(w['word']) for w in words],autojunk=False)
edits=[]
for op,i,j,k,l in matcher.get_opcodes():
 if op=='equal':
  for x,y in zip(range(i,j),range(k,l)):words[y]['display']=expected[x]
 else:edits.append({'op':op,'expected':' '.join(expected[i:j]),'heard':' '.join(w['word'] for w in words[k:l])})
for w in words:w.setdefault('display',w['word'])
wordcaps=[{'text':w['display'],'startMs':round(w['start']*1000),'endMs':round(w['end']*1000),'timestampMs':None,'confidence':w['probability']} for w in words]
phrases=[];group=[]
def flush():
 if group:
  phrases.append({'text':' '.join(w['text'] for w in group),'startMs':group[0]['startMs'],'endMs':group[-1]['endMs'],'timestampMs':None,'confidence':sum(w['confidence'] for w in group)/len(group)});group.clear()
for w in wordcaps:
 if group and (len(' '.join(x['text'] for x in group))+len(w['text'])>88 or w['endMs']-group[0]['startMs']>5300 or w['startMs']-group[-1]['endMs']>500):flush()
 group.append(w)
 if re.search(r'[.!?;:]$',w['text']):flush()
flush()
def save(name,data):(out/name).write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf8')
save('words.json',wordcaps);save('phrases.json',phrases)
save('alignment.json',{'method':'faster-whisper small acoustic timestamps, CPU int8; NOT WhisperX forced alignment','audio_sha256':gen['sha256'],'duration':duration,'words':words,'transcript':' '.join(w['word'] for w in words),'scriptSimilarity':matcher.ratio(),'differences':edits,'status':'REVIEW_REQUIRED' if edits else 'ACOUSTIC_MATCH','asr':{'language':'es','beam_size':5,'word_timestamps':True,'vad_filter':False,'condition_on_previous_text':False,'initial_prompt':prompt},'normalization':'Explicit brand aliases; only matched typography restored; unmatched ASR preserved'})
def stamp(ms):
 h,r=divmod(ms,3600000);m,r=divmod(r,60000);s,ms=divmod(r,1000);return f'{h:02}:{m:02}:{s:02},{ms:03}'
(out/'reference.srt').write_text('\n\n'.join(f"{i+1}\n{stamp(c['startMs'])} --> {stamp(c['endMs'])}\n{c['text']}" for i,c in enumerate(phrases))+'\n',encoding='utf8')
print(json.dumps({'words':len(words),'duration':duration,'differences':edits},ensure_ascii=True))
