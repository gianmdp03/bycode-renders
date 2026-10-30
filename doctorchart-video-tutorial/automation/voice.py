"""Local neural Spanish voice, explicit license, measured segment durations."""
from pathlib import Path
import hashlib,json,re,subprocess,sys,wave
ROOT=Path(__file__).resolve().parents[1];LOCAL=ROOT/'.local'
sys.path.insert(0,str(LOCAL/'voice-venv/Lib/site-packages'))
from piper import PiperVoice, SynthesisConfig
voice=PiperVoice.load(str(LOCAL/'voices/es_MX-ald-medium.onnx'))
story=json.loads((ROOT/'script/storyboard.json').read_text(encoding='utf8'))
selected=sys.argv[1:]
for chapter in story:
 if selected and chapter['id'] not in selected:continue
 for beat in chapter['beats']:
  target=ROOT/'audio'/f'{beat["id"]}.wav';target.parent.mkdir(exist_ok=True)
  text=beat['text'].replace('DoctorChart','Doctor Chart')
  digest=hashlib.sha256(text.encode()).hexdigest();meta=target.with_suffix('.json')
  if not target.exists() or not meta.exists() or json.loads(meta.read_text()).get('text_sha256')!=digest or 'sentence_captions' not in json.loads(meta.read_text()):
   sentences=re.split(r'(?<=[.!?])\s+',beat['text'].strip())
   chunks=list(voice.synthesize(text,syn_config=SynthesisConfig(length_scale=1.08,noise_scale=.45,noise_w_scale=.6)))
   if len(sentences)!=len(chunks):raise RuntimeError('Sentence/audio chunk mismatch: '+beat['id'])
   captions=[];samples=0
   with wave.open(str(target),'wb') as wav:
    wav.setnchannels(1);wav.setsampwidth(2);wav.setframerate(voice.config.sample_rate)
    for sentence,chunk in zip(sentences,chunks):
     start=samples;wav.writeframes(chunk.audio_int16_bytes);samples+=len(chunk.audio_int16_array)
     captions.append({'text':sentence,'startMs':round(start*1000/chunk.sample_rate),'endMs':round(samples*1000/chunk.sample_rate),'timestampMs':None,'confidence':None,'pageBreakAfter':True})
   with wave.open(str(target),'rb') as wav:duration=wav.getnframes()/wav.getframerate()
   meta.write_text(json.dumps({'text_sha256':digest,'text':beat['text'],'durationMs':round(duration*1000),'sampleRate':22050,'voice':'Piper es_MX ald medium','sentence_captions':captions,'alignment':'Exact sample boundaries of the actual synthesized sentence chunks; no estimated text timing.','quality_review':'Pending listening review; local neural voice, not a paid service.'},ensure_ascii=False,indent=2),encoding='utf8')
  beat['audio']='audio/'+target.name;beat['audioDurationMs']=json.loads(meta.read_text(encoding='utf8'))['durationMs']
  print('VOICE',beat['id'],beat['audioDurationMs'],flush=True)
(ROOT/'script/storyboard.json').write_text(json.dumps(story,ensure_ascii=False,indent=2),encoding='utf8')
(ROOT/'audio/README.md').write_text('Voz neuronal local: Piper 1.8.0, es_MX-ald-medium. Dataset Unlicense según MODEL_CARD; ver docs/voice-provenance.json. Revisión auditiva de naturalidad y pronunciación pendiente de la preview. Sin música. Archivos WAV reales; duraciones medidas.\n',encoding='utf8')
