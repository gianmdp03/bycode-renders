"""Generate six recoverable takes with the installed fixed synthetic male voice.
Read-only reuse of DoctorChart model/reference; no personal voice recordings.
"""
from pathlib import Path
import os,json,hashlib,time,sys
os.environ.update(HF_HUB_OFFLINE='1',HF_HUB_DISABLE_IMPLICIT_TOKEN='1',HF_HUB_DISABLE_TELEMETRY='1',TOKENIZERS_PARALLELISM='false')
root=Path(__file__).resolve().parents[1];repo=root.parent
profile=json.loads((repo/'docs/tutorial-handoffs/VOZ_MASCULINA_DOCTORCHART.json').read_text(encoding='utf-8'))
reference=Path(profile['reference_audio'])
if hashlib.sha256(reference.read_bytes()).hexdigest()!=profile['reference_sha256']:raise RuntimeError('La referencia masculina no coincide con su hash fijo.')
if not profile['reference_is_synthetic'] or profile['user_voice_recordings_used']:raise RuntimeError('Se requiere la referencia sintética aprobada.')
spec=json.loads((root/'script/voice-beats.json').read_text(encoding='utf-8'))
settingsFile=root/'script/qwen-takes.json'
settings=json.loads(settingsFile.read_text(encoding='utf-8')) if settingsFile.exists() else {}
dest=root/'public/voice/qwen-masculina';dest.mkdir(parents=True,exist_ok=True)
import numpy as np
import soundfile as sf
import torch
from qwen_tts import Qwen3TTSModel
torch.set_num_threads(1);torch.set_num_interop_threads(1)
if not torch.cuda.is_available():raise RuntimeError('CUDA no disponible.')
model=None;prompt=None;records=[]
for index,beat in enumerate(spec['beats']):
    spoken=beat['text'].replace('DoctorChart','Doctor Chart')
    for written,pronunciation in profile['pronunciation_aliases'].items():spoken=spoken.replace(written,pronunciation)
    seed=settings.get('seeds',{}).get(beat['id'],20261030+index)
    seedKey=f':seed={seed}' if beat['id'] in settings.get('seeds',{}) else ''
    key=hashlib.sha256((spoken+profile['reference_sha256']+profile['generation_model_revision']+seedKey).encode()).hexdigest()[:12]
    target=dest/f'{beat["id"]}-{key}.wav';meta=target.with_suffix('.json')
    if target.exists() and meta.exists():
        record=json.loads(meta.read_text(encoding='utf-8'))
        if hashlib.sha256(target.read_bytes()).hexdigest()!=record['sha256']:raise RuntimeError('Toma guardada alterada: '+str(target))
        print(f'Reutilizando {beat["id"]}: {record["duration"]:.2f} s',flush=True)
        records.append(record);continue
    if model is None:
        began=time.monotonic();print('Cargando Qwen Base una sola vez en CUDA…',flush=True)
        model=Qwen3TTSModel.from_pretrained(profile['generation_model_path'],device_map='cuda:0',dtype=torch.bfloat16,attn_implementation='sdpa',local_files_only=True)
        prompt=model.create_voice_clone_prompt(ref_audio=str(reference),ref_text=profile['reference_spoken_text'],x_vector_only_mode=False)
        print(f'Modelo y referencia residentes listos en {time.monotonic()-began:.1f} s',flush=True)
    began=time.monotonic();print(f'Generando {index+1}/6: {beat["id"]}',flush=True)
    torch.manual_seed(seed);torch.cuda.manual_seed_all(seed)
    limit=min(2048,max(384,len(spoken.split())*12));torch.cuda.reset_peak_memory_stats()
    with torch.inference_mode():
        waves,rate=model.generate_voice_clone(text=spoken,language='Spanish',voice_clone_prompt=prompt,non_streaming_mode=True,max_new_tokens=limit)
    torch.cuda.synchronize();wave=np.asarray(waves[0],dtype=np.float32);duration=len(wave)/rate
    if not np.isfinite(wave).all() or duration<.5 or duration>=limit*.08-.3 or np.max(np.abs(wave))<.005:raise RuntimeError('Audio inválido o incompleto: '+beat['id'])
    temp=target.with_suffix('.tmp.wav');sf.write(temp,wave,rate,subtype='PCM_16');temp.replace(target)
    record={'id':beat['id'],'file':str(target.relative_to(root)).replace('\\','/'),'displayText':beat['text'],'spokenText':spoken,'duration':duration,'sampleRate':rate,'seed':seed,'sha256':hashlib.sha256(target.read_bytes()).hexdigest(),'generationSeconds':round(time.monotonic()-began,2),'peakVRAMMiB':round(torch.cuda.max_memory_allocated()/1024**2),'engine':profile['generation_engine'],'referenceSHA256':profile['reference_sha256'],'voice':'masculina','userVoiceUsed':False}
    meta.write_text(json.dumps(record,ensure_ascii=False,indent=2),encoding='utf-8');records.append(record)
    print(f'Guardado {beat["id"]}: {duration:.2f} s ({record["generationSeconds"]} s de generación)',flush=True)
manifest={'engine':profile['generation_engine'],'modelRevision':profile['generation_model_revision'],'voiceProfile':profile['profile_id'],'referenceSHA256':profile['reference_sha256'],'synthetic':True,'userVoiceUsed':False,'modelLoadedOnce':True,'takes':records}
(root/'qa/qwen-generation.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
print(f'Lote completo. Audio bruto: {sum(r["duration"] for r in records):.2f} s',flush=True)
