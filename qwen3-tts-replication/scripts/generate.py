"""Portable adapter of verified production flows. One model/prompt per batch."""
from pathlib import Path
import argparse,json,os,hashlib,time,subprocess
ROOT=Path(__file__).resolve().parents[1]
os.environ.update(HF_HUB_OFFLINE='1',HF_HUB_DISABLE_IMPLICIT_TOKEN='1',HF_HUB_DISABLE_TELEMETRY='1',TOKENIZERS_PARALLELISM='false')
p=argparse.ArgumentParser();p.add_argument('--model',default=str(ROOT/'models/qwen-base'));p.add_argument('--ffmpeg',required=True);p.add_argument('--batch',default=str(ROOT/'test-text.json'));p.add_argument('--mode',choices=['bycode-current','pointly-tutorial','doctorchart-worker'],default='bycode-current');p.add_argument('--out',default='demo/public');a=p.parse_args()
out=(ROOT/a.out).resolve();assert out.is_relative_to(ROOT);out.mkdir(parents=True,exist_ok=True)
profile=json.loads((ROOT/'voice/profile.json').read_text(encoding='utf8'));ref=ROOT/profile['reference_audio']
assert hashlib.sha256(ref.read_bytes()).hexdigest()==profile['reference_sha256']
assert profile['reference_is_synthetic'] and not profile['user_voice_recordings_used']
manifest=next(x for x in json.loads((ROOT/'models-manifest.json').read_text(encoding='utf8')) if x['name']=='qwen-base')
for item in manifest['files']:
 path=Path(a.model)/item['file'];h=hashlib.sha256()
 with path.open('rb') as f:
  while block:=f.read(8*1024*1024):h.update(block)
 assert path.stat().st_size==item['bytes'] and h.hexdigest()==item['sha256'],'Wrong Qwen file: '+str(path)
import numpy as np,soundfile as sf,torch
from qwen_tts import Qwen3TTSModel
torch.set_num_threads(1);torch.set_num_interop_threads(1)
assert torch.cuda.is_available() and torch.cuda.is_bf16_supported(),'Requires verified CUDA/bfloat16 path; no silent fallback'
model=Qwen3TTSModel.from_pretrained(a.model,device_map='cuda:0',dtype=torch.bfloat16,attn_implementation='sdpa',local_files_only=True)
prompt=model.create_voice_clone_prompt(ref_audio=str(ref),ref_text=profile['reference_spoken_text'],x_vector_only_mode=False)
for i,item in enumerate(json.loads(Path(a.batch).read_text(encoding='utf8'))):
 assert item['id'].replace('-','').replace('_','').isalnum()
 target=out/(item['id']+'.wav');report=target.with_suffix('.generation.json')
 spoken=item['text'].replace('DoctorChart','Doctor Chart')
 if a.mode=='bycode-current':spoken=spoken.replace('Bycode','báicod');seed=20261030+i;limit=min(2048,max(384,len(spoken.split())*12))
 elif a.mode=='pointly-tutorial':
  for x,y in {'Pointly':'Pointli','Bycode':'baicode','JPEG':'ye pe ge','PNG':'pe ene ge','WebP':'web pe','QR':'cu erre','DNI':'de ene i','WhatsApp':'guasap'}.items():spoken=spoken.replace(x,y)
  seed=20261103;limit=min(2048,max(512,len(spoken.split())*12))
 else:spoken=spoken.replace('Bycode','baicode').replace('bycode','baicode');seed=20261030;limit=min(2048,max(384,len(spoken.split())*9))
 signature=hashlib.sha256(json.dumps([item,a.mode,seed,limit,profile['reference_sha256'],profile['generation_model_revision']],ensure_ascii=False).encode()).hexdigest()
 if target.exists():
  if report.exists():
   old=json.loads(report.read_text(encoding='utf8'))
   if old['signature']==signature and hashlib.sha256(target.read_bytes()).hexdigest()==old['sha256']:print('REUSE',target,flush=True);continue
  raise RuntimeError('Output exists with different configuration. Choose a fresh --out directory.')
 torch.manual_seed(seed);torch.cuda.manual_seed_all(seed);torch.cuda.reset_peak_memory_stats();began=time.monotonic()
 with torch.inference_mode():waves,sr=model.generate_voice_clone(text=spoken,language='Spanish',voice_clone_prompt=prompt,non_streaming_mode=True,max_new_tokens=limit)
 torch.cuda.synchronize();wave=np.asarray(waves[0],dtype=np.float32);duration=len(wave)/sr
 assert np.isfinite(wave).all() and .5<duration<limit*.08-.3 and np.max(np.abs(wave))>.005
 raw=target.with_suffix('.raw.wav');sf.write(raw,wave,sr,subtype='FLOAT')
 subprocess.run([a.ffmpeg,'-v','error','-y','-i',str(raw),'-af','loudnorm=I=-16:TP=-1.5:LRA=7','-ar','48000','-ac','2','-c:a','pcm_s16le',str(target)],check=True)
 data={'signature':signature,'displayText':item['text'],'spokenText':spoken,'mode':a.mode,'seed':seed,'max_new_tokens':limit,'effective_generation':model._merge_generate_kwargs(max_new_tokens=limit),'model_revision':profile['generation_model_revision'],'reference_sha256':profile['reference_sha256'],'rawSampleRate':sr,'rawDuration':duration,'outputSampleRate':48000,'outputChannels':2,'postprocessing':'loudnorm=I=-16:TP=-1.5:LRA=7; no rate change','sha256':hashlib.sha256(target.read_bytes()).hexdigest(),'generationSeconds':time.monotonic()-began,'peakVRAMMiB':torch.cuda.max_memory_allocated()/1024**2,'torch':torch.__version__,'cuda':torch.version.cuda,'gpu':torch.cuda.get_device_name(0),'quality_review':'Acoustic, visual and human listening review are separate gates'}
 report.write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf8');print('GENERATED',target,flush=True)
