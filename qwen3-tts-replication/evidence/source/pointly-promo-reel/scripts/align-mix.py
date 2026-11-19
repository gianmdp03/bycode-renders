"""Align actual Qwen speech locally, assemble natural-rate takes and duck music."""
from pathlib import Path
import os,json,re,difflib,unicodedata,subprocess,wave,sys
import numpy as np
root=Path(__file__).resolve().parents[1];repo=root.parent
ffmpeg=os.environ['REEL_FFMPEG'];ffprobe=os.environ['REEL_FFPROBE']
def run(args):
    p=subprocess.run(args,cwd=root,capture_output=True,text=True,encoding='utf-8',errors='replace')
    if p.returncode:raise RuntimeError(p.stderr[-3000:])
    return p
def save(file,data):
    p=root/file;p.parent.mkdir(parents=True,exist_ok=True);temp=p.with_suffix('.tmp.json');temp.write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8');temp.replace(p)
def norm(s):return ''.join(c for c in unicodedata.normalize('NFKD',s.lower()) if c.isalnum() and not unicodedata.combining(c))
def canonical(s):return {'baicod':'bycode','baicoud':'bycode','baicode':'bycode','bycode':'bycode','pointly':'pointly','poinly':'pointly','pointli':'pointly','pointley':'pointly'}.get(norm(s),norm(s))
spec=json.loads((root/'script/voice-beats.json').read_text(encoding='utf-8'))
human=len(sys.argv)>1 and sys.argv[1]=='human'
mode='human' if human else 'qwen'
manifest=json.loads((root/f'qa/{mode}-generation.json').read_text(encoding='utf-8'))
if human:
    for take in manifest['takes']:take['spokenText']=take['displayText'].replace('Bycode','baicod')
if [t['id'] for t in manifest['takes']] != [b['id'] for b in spec['beats']]:
    raise RuntimeError('El manifiesto debe incluir exactamente los siete beats, en el orden del guion.')
local=root/'.local/qwen';local.mkdir(parents=True,exist_ok=True)
from faster_whisper import WhisperModel
engine=WhisperModel(str(repo/'doctorchart-promo-reel/.local/whisper-small'),device='cpu',compute_type='int8')
aligned=[];issues=[]
for beat,take in zip(spec['beats'],manifest['takes']):
    if beat['id']!=take['id'] or beat['text']!=take['displayText']:raise RuntimeError('El guion cambió; regenerar Qwen antes de alinear.')
    decoded=local/f'{beat["id"]}.wav'
    run([ffmpeg,'-y','-i',str(root/take['file']),'-vn','-ac','1','-ar','48000',str(decoded)])
    with wave.open(str(decoded),'rb') as w: samples=np.frombuffer(w.readframes(w.getnframes()),dtype='<i2').astype(np.float64)/32768
    # Trim external silence only, preserving breath and internal pauses.
    block=480;levels=np.array([np.sqrt(np.mean(samples[i:i+block]**2)) for i in range(0,len(samples),block)])
    active=np.where(levels>10**(-44/20))[0]
    if len(active)==0:raise RuntimeError('Toma vacía: '+beat['id'])
    start=max(0,active[0]*.01-.09);end=min(len(samples)/48000,(active[-1]+1)*.01+.13)
    trimmed=local/f'{beat["id"]}-trimmed.wav'
    run([ffmpeg,'-y','-i',str(decoded),'-af',f'atrim=start={start}:end={end},asetpts=PTS-STARTPTS','-ar','48000',str(trimmed)])
    asr=local/f'{beat["id"]}-16k.wav'
    run([ffmpeg,'-y','-i',str(trimmed),'-ar','16000','-ac','1',str(asr)])
    # Pass PCM directly: installed PyAV lacks the metadata_errors keyword used by ASR.
    with wave.open(str(asr),'rb') as w:asrSamples=np.frombuffer(w.readframes(w.getnframes()),dtype='<i2').astype(np.float32)/32768
    segments,_=engine.transcribe(asrSamples,language='es',word_timestamps=True,vad_filter=False,beam_size=5,condition_on_previous_text=False,initial_prompt=take['spokenText'])
    words=[{'text':w.word.strip(),'start':w.start,'end':w.end,'confidence':w.probability} for s in segments for w in (s.words or [])]
    merged=[];i=0
    while i<len(words):
        pair=norm(words[i]['text'])+norm(words[i+1]['text']) if i+1<len(words) else ''
        if pair in ['doctorchart','doctorchard','doctorchardt','baicod','baicoud','baicode','bycode','pointly']:
            merged.append({'text':{'doctorchard':'DoctorChart','doctorchardt':'DoctorChart','doctorchart':'DoctorChart','baicod':'Bycode','baicoud':'Bycode','baicode':'Bycode','bycode':'Bycode','pointly':'Pointly'}[pair],'start':words[i]['start'],'end':words[i+1]['end'],'confidence':min(words[i]['confidence'],words[i+1]['confidence'])});i+=2
        else:merged.append(words[i]);i+=1
    words=merged;expected=beat['text'].split()
    matcher=difflib.SequenceMatcher(a=[canonical(w) for w in expected],b=[canonical(w['text']) for w in words],autojunk=False)
    matches={a+k:b+k for a,b,n in matcher.get_matching_blocks() for k in range(n)}
    record={'id':beat['id'],'expected':expected,'words':words,'coverage':len(matches)/len(expected),'ratio':matcher.ratio(),'duration':end-start,'trim':{'start':start,'end':end},'trimmed':str(trimmed),'matches':matches}
    aligned.append(record)
    print(beat['id'],f'{end-start:.2f}s',f'coverage {record["coverage"]:.2f}', ' '.join(w['text'] for w in words),flush=True)
    if len(matches)!=len(expected) or len(words)!=len(expected):issues.append(beat['id']+': revisar diferencias de transcripción antes de usar los tiempos.')
save(f'qa/{mode}-word-alignment.json',{'status':'REVIEW' if issues else 'PASS','issues':issues,'beats':aligned})
if issues:raise RuntimeError('\n'.join(issues))
# No time stretching: each scene follows its speech, with natural breathing room.
minimums=[2.6,3.5,4.2,3.6,4.8,5.6,4.2]
lengths=[max(minimums[i],a['duration']+.4) for i,a in enumerate(aligned)]
total=sum(lengths)
if total>30:raise RuntimeError(f'La lectura natural necesita {total:.2f}s. Regenerar una toma; no acelerar la voz.')
target=max(29.5,total);extra=target-total
weights=[b['end']-b['start'] for b in spec['beats']]
lengths=[d+extra*w/sum(weights) for d,w in zip(lengths,weights)]
boundaries=[0]
for length in lengths:boundaries.append(round((boundaries[-1]+length)*60)/60)
duration=boundaries[-1]
voice=np.zeros(round(duration*48000),dtype=np.float64);captions=[];beats=[]
for index,(beat,a) in enumerate(zip(spec['beats'],aligned)):
    sceneStart=boundaries[index];offset=sceneStart+.16
    with wave.open(a['trimmed'],'rb') as w:pcm=np.frombuffer(w.readframes(w.getnframes()),dtype='<i2').astype(np.float64)/32768
    first=round(offset*48000);voice[first:first+len(pcm)]+=pcm
    count=0
    for j,display in enumerate(a['expected']):
        word=a['words'][a['matches'][j]];count+=1
        boundary=count==3 or bool(re.search(r'[.!?]$',display)) or j==len(a['expected'])-1
        if boundary:count=0
        captions.append({'text':' '+display,'startMs':round((offset+word['start'])*1000),'endMs':round((offset+word['end'])*1000),'timestampMs':round((offset+(word['start']+word['end'])/2)*1000),'confidence':word['confidence'],'pageBreakAfter':boundary})
    beats.append({**beat,'start':sceneStart,'end':boundaries[index+1]})
raw=local/'assembled-voice.wav'
with wave.open(str(raw),'wb') as w:
    w.setnchannels(1);w.setsampwidth(2);w.setframerate(48000);w.writeframes((np.clip(voice,-1,1)*32767).astype('<i2').tobytes())
def normalize(source,dest,level,channels):
    result=run([ffmpeg,'-hide_banner','-i',str(source),'-af',f'loudnorm=I={level}:TP=-2:LRA=7:print_format=json','-f','null','-']).stderr
    m=json.loads(result[result.rfind('{'):result.rfind('}')+1])
    filt=f'loudnorm=I={level}:TP=-2:LRA=7:measured_I={m["input_i"]}:measured_TP={m["input_tp"]}:measured_LRA={m["input_lra"]}:measured_thresh={m["input_thresh"]}:offset={m["target_offset"]}:linear=true'
    run([ffmpeg,'-y','-i',str(source),'-af',filt,'-ar','48000','-ac',str(channels),str(dest)])
voiceFile=root/f'public/voice/pointly-{mode}.wav';voiceFile.parent.mkdir(parents=True,exist_ok=True);normalize(raw,voiceFile,-16,1)
musicSource=root/'public/audio/musica-spot-provista.mp3'
music=local/'music-low.wav';normalize(musicSource,music,-34,2)
filt=f'[0:a]asplit=2[v][sc];[1:a]atrim=0:{duration},afade=t=in:d=0.7,afade=t=out:st={duration-1.8}:d=1.8[m];[m][sc]sidechaincompress=threshold=0.03:ratio=3:attack=80:release=650:makeup=1[duck];[v][duck]amix=inputs=2:normalize=0,alimiter=limit=0.84:level=0,aresample=48000[out]'
run([ffmpeg,'-y','-i',str(voiceFile),'-i',str(music),'-filter_complex',filt,'-map','[out]','-ar','48000','-ac','2',str(root/f'public/audio/{mode}-mix.wav')])
run([ffmpeg,'-y','-i',str(music),'-t',str(duration),'-af',f'afade=t=in:d=0.7,afade=t=out:st={duration-1.8}:d=1.8','-ar','48000','-ac','2',str(root/'public/audio/music-only.wav')])
runtime={'duration':duration,'voice':True,'voiceSource':mode,'audioFile':f'audio/{mode}-mix.wav','beats':beats,'captions':captions}
save(f'captions/{mode}-runtime.json',runtime);save(f'captions/{mode}-aligned.json',captions)
save(f'qa/{mode}-alignment.json',{'status':'PASS','duration':duration,'words':len(captions),'synthetic':not human,'voiceProfile':manifest['voiceProfile'],'referenceSHA256':manifest.get('referenceSHA256'),'spokenBycode':'baicod','rateChanged':False,'musicSource':str(musicSource.relative_to(root)),'musicProvidedByUser':True,'musicLUFS':-34,'voiceLUFS':-16,'sidechain':True,'listeningReview':'pending user review'})
print(f'Mezcla Qwen y timeline listos: {duration:.3f}s, {len(captions)} palabras reales alineadas.',flush=True)
