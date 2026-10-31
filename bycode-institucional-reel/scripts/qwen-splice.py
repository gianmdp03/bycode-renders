"""Apply explicit sentence-boundary edits without changing the speech rate."""
from pathlib import Path
import os,json,hashlib,subprocess,wave
root=Path(__file__).resolve().parents[1]
settings=json.loads((root/'script/qwen-takes.json').read_text(encoding='utf-8'))
manifestPath=root/'qa/qwen-generation.json'
manifest=json.loads(manifestPath.read_text(encoding='utf-8'))
for i,take in enumerate(manifest['takes']):
    edit=settings.get('edits',{}).get(take['id'])
    if not edit:continue
    if take['displayText']!=edit['expectedText'] or take['spokenText']!=edit['expectedSpokenText'] or take['seed']!=edit['expectedSeed']:raise RuntimeError('La edición de oraciones requiere revisar sus cortes tras cambiar texto o toma.')
    prefix=root/take['file'];suffix=root/edit['suffixFile']
    sources={'prefixSHA256':hashlib.sha256(prefix.read_bytes()).hexdigest(),'suffixSHA256':hashlib.sha256(suffix.read_bytes()).hexdigest(),'settings':edit}
    key=hashlib.sha256(json.dumps(sources,sort_keys=True).encode()).hexdigest()[:12]
    output=root/f'public/voice/qwen-masculina/{take["id"]}-edit-{key}.wav'
    if not output.exists():
        filt=f'[0:a]atrim=0:{edit["prefixTo"]},asetpts=PTS-STARTPTS[p];anullsrc=r=24000:cl=mono,atrim=0:{edit["gap"]}[s];[1:a]atrim=start={edit["suffixFrom"]},asetpts=PTS-STARTPTS[t];[p][s][t]concat=n=3:v=0:a=1[out]'
        subprocess.run([os.environ['REEL_FFMPEG'],'-v','error','-y','-i',str(prefix),'-i',str(suffix),'-filter_complex',filt,'-map','[out]','-ar','24000','-ac','1',str(output)],check=True)
    with wave.open(str(output),'rb') as w:duration=w.getnframes()/w.getframerate()
    record={**take,'file':str(output.relative_to(root)).replace('\\','/'),'duration':duration,'sha256':hashlib.sha256(output.read_bytes()).hexdigest(),'sentenceEdit':sources,'sourceTake':take['file'],'rateChanged':False}
    output.with_suffix('.json').write_text(json.dumps(record,ensure_ascii=False,indent=2),encoding='utf-8')
    manifest['takes'][i]=record
    print(f'Edición entre oraciones {take["id"]}: {duration:.2f}s; originales conservados.',flush=True)
manifestPath.write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
