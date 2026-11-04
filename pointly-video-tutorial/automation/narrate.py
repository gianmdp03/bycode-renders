"""Resident local Qwen generation. Reuse existing verified synthetic male reference.
No cloud provider, personal recording, or paid API. Regenerate a chapter by ID.
"""
from pathlib import Path
import os,sys,json,time,hashlib,subprocess,shutil
ROOT=Path(__file__).resolve().parents[1];VOICE=ROOT.parent/'doctorchart-video-tutorial'
os.environ.update(HF_HUB_OFFLINE='1',HF_HUB_DISABLE_IMPLICIT_TOKEN='1',HF_HUB_DISABLE_TELEMETRY='1',TOKENIZERS_PARALLELISM='false')
import numpy as np,soundfile as sf,torch
from qwen_tts import Qwen3TTSModel
torch.set_num_threads(1);torch.set_num_interop_threads(1)
manifest=next((x.split('=',1)[1] for x in sys.argv[1:] if x.startswith('--manifest=')),'script/chapters.json')
manifest=(ROOT/manifest).resolve()
if not manifest.is_relative_to(ROOT):raise ValueError('Manifest outside audiovisual project')
chapters=json.loads(manifest.read_text(encoding='utf8'))
wanted={x for x in sys.argv[1:] if not x.startswith('--')};chapters=[c for c in chapters if not wanted or c['id'] in wanted]
reference=VOICE/'qa/qwen-voz-masculina.wav';meta=json.loads(reference.with_suffix('.json').read_text(encoding='utf8'))
assert meta['user_voice_reference'] is None and hashlib.sha256(reference.read_bytes()).hexdigest()==meta['sha256']
model=Qwen3TTSModel.from_pretrained(str(VOICE/'.local/qwen/base-model'),device_map='cuda:0',dtype=torch.bfloat16,attn_implementation='sdpa',local_files_only=True)
prompt=model.create_voice_clone_prompt(ref_audio=str(reference),ref_text=meta['text'],x_vector_only_mode=False)
ffmpeg=next((VOICE/'.local/voice-venv/Lib/site-packages/imageio_ffmpeg/binaries').glob('*.exe'))
for c in chapters:
 out=ROOT/'audio'/f"{c['id']}.wav";report=out.with_suffix('.json')
 text=c['narration'];digest=hashlib.sha256(text.encode()).hexdigest()
 if out.exists() and report.exists() and json.loads(report.read_text())['text_sha256']==digest:
  print('REUSE',c['id'],flush=True);continue
 if out.exists():
  previous=hashlib.sha256(out.read_bytes()).hexdigest()[:16];archive=ROOT/'.local/audio-versions'/c['id']/previous;archive.mkdir(parents=True,exist_ok=True)
  for old in [out,report,out.with_suffix('.raw.wav'),out.with_suffix('.alignment.json')]:
   if old.exists():shutil.copy2(old,archive/old.name)
 spoken=text.replace('Pointly','Pointli').replace('Bycode','baicode').replace('JPEG','ye pe ge').replace('PNG','pe ene ge').replace('WebP','web pe').replace('QR','cu erre').replace('DNI','de ene i').replace('WhatsApp','guasap')
 begin=time.monotonic();torch.manual_seed(20261103);torch.cuda.manual_seed_all(20261103)
 limit=min(2048,max(512,len(spoken.split())*12))
 print('GENERATE',c['id'],len(spoken.split()),'words',flush=True)
 with torch.inference_mode():waves,sr=model.generate_voice_clone(text=spoken,language='Spanish',voice_clone_prompt=prompt,non_streaming_mode=True,max_new_tokens=limit)
 wave=np.asarray(waves[0],dtype=np.float32);duration=len(wave)/sr
 if not np.isfinite(wave).all() or duration<3 or duration>=limit*.08-.3:raise RuntimeError('Potential truncation: '+c['id'])
 raw=out.with_suffix('.raw.wav');sf.write(raw,wave,sr,subtype='FLOAT')
 temp=out.with_suffix('.normalizing.wav')
 subprocess.run([str(ffmpeg),'-v','error','-y','-i',str(raw),'-af','loudnorm=I=-16:TP=-1.5:LRA=7','-ar','48000','-ac','2','-c:a','pcm_s16le',str(temp)],check=True)
 temp.replace(out)
 report.write_text(json.dumps({'engine':'Qwen3-TTS-12Hz-0.6B-Base','voice':'masculina','reference':str(reference.relative_to(ROOT.parent)),'reference_sha256':meta['sha256'],'personalVoice':False,'externalSpeechAPI':None,'text':text,'spokenText':spoken,'text_sha256':digest,'sha256':hashlib.sha256(out.read_bytes()).hexdigest(),'duration':duration,'sampleRate':48000,'channels':2,'generationSeconds':round(time.monotonic()-begin,2),'seed':20261103,'review':'Awaiting acoustic transcription and audiovisual QA'},ensure_ascii=False,indent=2),encoding='utf8')
 print('DONE',c['id'],round(duration,2),round(time.monotonic()-begin,1),flush=True)
