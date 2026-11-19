"""Resident Qwen Base worker. References are our own synthetic samples, never user audio."""
from pathlib import Path
import contextlib,hashlib,json,os,subprocess,sys,threading,time,traceback
ROOT=Path(__file__).resolve().parents[1]
os.environ.update(HF_HUB_OFFLINE='1',HF_HUB_DISABLE_IMPLICIT_TOKEN='1',HF_HUB_DISABLE_TELEMETRY='1',TOKENIZERS_PARALLELISM='false')
def emit(event,**data): print(json.dumps({'event':event,**data},ensure_ascii=True),flush=True)
with contextlib.redirect_stdout(sys.stderr):
 import numpy as np
 import soundfile as sf
 import torch
 from qwen_tts import Qwen3TTSModel
torch.set_num_threads(1)
torch.set_num_interop_threads(1)
if not torch.cuda.is_available(): raise RuntimeError('CUDA no disponible')
started=time.monotonic()
with contextlib.redirect_stdout(sys.stderr):
 model=Qwen3TTSModel.from_pretrained(str(ROOT/'.local/qwen/base-model'),device_map='cuda:0',dtype=torch.bfloat16,attn_implementation='sdpa',local_files_only=True)
prompts={}
emit('ready',model='Qwen3-TTS-12Hz-0.6B-Base',loadSeconds=round(time.monotonic()-started,2),pid=os.getpid(),gpu=torch.cuda.get_device_name(0))
ffmpeg=next((ROOT/'.local/voice-venv/Lib/site-packages/imageio_ffmpeg/binaries').glob('*.exe'))
for line in sys.stdin:
 try:
  request=json.loads(line);job_id=request['id'];text=request['text'];voice=request['voice'];output=Path(request['output']).resolve()
  if voice not in ['masculina','femenina'] or len(text)>2000 or not output.is_relative_to(ROOT/'.local') or output.is_relative_to(ROOT/'.local/narration-studio'):
   raise ValueError('Solicitud de generación inválida')
  began=time.monotonic();finished=threading.Event();torch.cuda.reset_peak_memory_stats()
  if voice not in prompts:
   reference=ROOT/'qa'/f'qwen-voz-{voice}.wav';meta=json.loads(reference.with_suffix('.json').read_text(encoding='utf-8'))
   if meta.get('user_voice_reference') is not None or hashlib.sha256(reference.read_bytes()).hexdigest()!=meta['sha256']:raise ValueError('La referencia sintética no pasó la verificación')
   emit('progress',id=job_id,message='Preparando la referencia de voz sintética…')
   with contextlib.redirect_stdout(sys.stderr):prompts[voice]=model.create_voice_clone_prompt(ref_audio=str(reference),ref_text=meta['text'],x_vector_only_mode=False)
  spoken=text.replace('DoctorChart','Doctor Chart').replace('Bycode','baicode').replace('bycode','baicode')
  limit=min(2048,max(384,len(spoken.split())*9));torch.manual_seed(20261030);torch.cuda.manual_seed_all(20261030)
  def heartbeat():
   while not finished.wait(10):emit('progress',id=job_id,message='Generando la narración…',elapsedSeconds=round(time.monotonic()-began))
  threading.Thread(target=heartbeat,daemon=True).start()
  try:
   with torch.inference_mode(),contextlib.redirect_stdout(sys.stderr):
    waves,rate=model.generate_voice_clone(text=spoken,language='Spanish',voice_clone_prompt=prompts[voice],non_streaming_mode=True,max_new_tokens=limit)
   torch.cuda.synchronize()
  finally:finished.set()
  wave=np.asarray(waves[0],dtype=np.float32);seconds=len(wave)/rate
  if not np.isfinite(wave).all() or seconds<.5 or seconds>=limit*.08-.3 or np.max(np.abs(wave))<.005:raise ValueError('Audio vacío o posiblemente incompleto; no se guardó como toma válida')
  raw=output.with_suffix('.raw.wav');output.parent.mkdir(parents=True,exist_ok=True);sf.write(raw,wave,rate,subtype='FLOAT')
  temporary=output.with_suffix('.normalizing.wav')
  subprocess.run([str(ffmpeg),'-v','error','-y','-i',str(raw),'-af','loudnorm=I=-16:TP=-1.5:LRA=7','-ar','48000','-ac','2','-c:a','pcm_s16le',str(temporary)],check=True,timeout=90)
  temporary.replace(output)
  report={'status':'TECHNICAL_PASS_LISTENING_REVIEW_PENDING','engine':'Qwen3-TTS-12Hz-0.6B-Base','voice':voice,'text':spoken,'display_text':text,'synthesis_seconds':round(time.monotonic()-began,2),'duration_seconds':round(seconds,3),'sha256':hashlib.sha256(output.read_bytes()).hexdigest(),'worker_pid':os.getpid(),'model_loaded_once':True,'synthetic_reference':'qa/qwen-voz-'+voice+'.wav','user_voice_reference':None,'peak_vram_allocated_mib':round(torch.cuda.max_memory_allocated()/1024**2),'sample_rate':48000,'channels':2}
  output.with_suffix('.json').write_text(json.dumps(report,indent=2,ensure_ascii=False),encoding='utf-8');emit('done',id=job_id,report=report)
 except Exception as error:
  traceback.print_exc(file=sys.stderr);emit('error',id=locals().get('job_id'),error=str(error))
