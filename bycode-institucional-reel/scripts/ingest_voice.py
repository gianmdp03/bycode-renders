"""Ingest real human voice, align real words, retime edit, sidechain music.
No TTS or generated speech. Stop on uncertain alignment rather than guess.
"""
from pathlib import Path
import sys,os,json,re,unicodedata,difflib,subprocess,shutil,hashlib
root=Path(__file__).resolve().parents[1]
ffmpeg=os.environ['REEL_FFMPEG'];ffprobe=os.environ['REEL_FFPROBE']
source=Path(sys.argv[1])
def run(args):
    p=subprocess.run(args,cwd=root,capture_output=True,text=True,encoding='utf-8',errors='replace')
    if p.returncode:raise RuntimeError(p.stderr[-3000:])
    return p
def save(file,data):
    p=root/file;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')
def norm(w):return ''.join(c for c in unicodedata.normalize('NFKD',w.lower()) if c.isalnum() and not unicodedata.combining(c))
def normalize(src,dest,level,channels):
    scan=run([ffmpeg,'-hide_banner','-i',str(src),'-af',f'loudnorm=I={level}:TP=-2:LRA=7:print_format=json','-f','null','-']).stderr
    m=json.loads(scan[scan.rfind('{'):scan.rfind('}')+1])
    filt=f'loudnorm=I={level}:TP=-2:LRA=7:measured_I={m["input_i"]}:measured_TP={m["input_tp"]}:measured_LRA={m["input_lra"]}:measured_thresh={m["input_thresh"]}:offset={m["target_offset"]}:linear=true'
    run([ffmpeg,'-y','-i',str(src),'-af',filt,'-ar','48000','-ac',str(channels),str(dest)])
    return m
for folder in ['voice','.local','public/voice','qa','captions']: (root/folder).mkdir(parents=True,exist_ok=True)
# A failed reimport cannot accidentally render the previous successful voice.
for file in ['captions/voice-runtime.json','public/audio/final-mix.wav']:(root/file).unlink(missing_ok=True)
save('qa/voice-alignment.json',{'status':'PENDING','source':source.name})
original=root/'voice'/('original-'+hashlib.sha256(source.read_bytes()).hexdigest()[:12]+source.suffix.lower())
if source.resolve()!=original.resolve():shutil.copy2(source,original)
decoded=root/'.local/voice-decoded.wav'
run([ffmpeg,'-y','-i',str(source),'-vn','-ac','1','-ar','48000',str(decoded)])
length=float(json.loads(run([ffprobe,'-v','quiet','-show_format','-of','json',str(decoded)]).stdout)['format']['duration'])
scan=run([ffmpeg,'-hide_banner','-i',str(decoded),'-af','silencedetect=n=-48dB:d=0.35','-f','null','-']).stderr
silences=[];begin=None
for e in re.finditer(r'silence_(start|end): ([\d.]+)',scan):
    if e[1]=='start':begin=float(e[2])
    elif begin is not None:silences.append((begin,float(e[2])));begin=None
if begin is not None:silences.append((begin,length))
start=max(0,silences[0][1]-.22) if silences and silences[0][0]<.05 else 0
end=min(length,silences[-1][0]+.35) if silences and silences[-1][1]>length-.05 else length
if not 10<end-start<31:raise RuntimeError('La toma debe contener el guion completo en unos 25–29 segundos, sin música.')
trimmed=root/'.local/voice-trimmed.wav'
run([ffmpeg,'-y','-i',str(decoded),'-af',f'atrim=start={start}:end={end},asetpts=PTS-STARTPTS','-ar','48000',str(trimmed)])
voice=root/'public/voice/locucion-normalizada.wav';measurement=normalize(trimmed,voice,-16,1)
from faster_whisper import WhisperModel
model=Path(os.environ.get('REEL_ASR_MODEL',''))
engine=WhisperModel(str(model) if (model/'model.bin').exists() else 'small',device='cpu',compute_type='int8',download_root=str(root/'.local/models'))
segments,_=engine.transcribe(str(voice),language='es',word_timestamps=True,vad_filter=True,beam_size=5,condition_on_previous_text=False,initial_prompt='Bycode Software. Pointly. DoctorChart. Software para comercios y consultorios. Español argentino.')
words=[{'text':w.word.strip(),'start':w.start,'end':w.end,'confidence':w.probability} for s in segments for w in (s.words or [])]
# Join recognizer splits of authentic product/company names without inventing times.
merged=[];i=0
while i<len(words):
    pair=norm(words[i]['text'])+norm(words[i+1]['text']) if i+1<len(words) else ''
    name={'bycode':'Bycode','doctorchart':'DoctorChart','pointly':'Pointly'}.get(pair)
    if name:
        merged.append({'text':name,'start':words[i]['start'],'end':words[i+1]['end'],'confidence':min(words[i]['confidence'],words[i+1]['confidence'])});i+=2
    else:merged.append(words[i]);i+=1
words=merged
spec=json.loads((root/'script/voice-beats.json').read_text(encoding='utf-8'))
expected=[w for b in spec['beats'] for w in b['text'].split()]
matcher=difflib.SequenceMatcher(a=[norm(w) for w in expected],b=[norm(w['text']) for w in words],autojunk=False)
matches={a+k:b+k for a,b,n in matcher.get_matching_blocks() for k in range(n)}
anchors=[];offset=0
for beat in spec['beats']:anchors.append(offset);offset+=len(beat['text'].split())
problems=[]
if not words:problems.append('No se detectó voz suficiente.')
if len(matches)/len(expected)<.92 or matcher.ratio()<.92:problems.append('La transcripción difiere del guion; revisar la toma y captions/transcription-raw.json.')
if any(a not in matches for a in anchors):problems.append('Falta una palabra de anclaje; no se puede ajustar el montaje automáticamente.')
if len([w for w in words if w['confidence']<.45])>3:problems.append('Varias palabras tienen baja confianza; revisar el audio.')
save('captions/transcription-raw.json',{'words':words,'transcript':' '.join(w['text'] for w in words)})
starts=[0]+[max(0,words[matches[a]]['start']-.12) for a in anchors[1:]] if not problems else []
duration=max(25,end-start+.6,(words[-1]['end']+.65 if words else 0),(starts[-1]+4 if starts else 0))
if duration>30:problems.append('La lectura o el cierre superan 30 s; grabá otra toma sin acelerar artificialmente la voz.')
if starts and any(b-a<1.8 for a,b in zip(starts,starts[1:])):problems.append('Una escena queda demasiado corta para leer; revisar pausas y ritmo.')
report={'status':'FAIL' if problems else 'PENDING_MIX','source':original.name,'duration':duration,'coverage':len(matches)/len(expected),'similarity':matcher.ratio(),'problems':problems,'trim':{'start':start,'end':end,'interiorPausesPreserved':True},'normalization':measurement,'method':'Local faster-whisper small multilingual / real word timestamps; human listening review required.'}
save('qa/voice-alignment.json',report)
if problems:print('\n'.join(problems));sys.exit(3)
beats=[{**b,'start':starts[i],'end':starts[i+1] if i+1<len(starts) else duration} for i,b in enumerate(spec['beats'])]
caps=[];count=0
for i,w in enumerate(words):
    count+=1;boundary=count==3 or bool(re.search(r'[.!?]$',w['text'])) or i==len(words)-1
    if boundary:count=0
    caps.append({'text':' '+w['text'],'startMs':round(w['start']*1000),'endMs':round(w['end']*1000),'timestampMs':round((w['start']+w['end'])*500),'confidence':w['confidence'],'pageBreakAfter':boundary})
save('captions/aligned.json',caps)
music=root/'.local/music-low.wav'
music_source=root/'public/audio/musica-spot-provista.mp3'
normalize(music_source if music_source.exists() else root/'public/audio/menos-vueltas-original.wav',music,-34,2)
filt=f'[0:a]apad,atrim=0:{duration},asplit=2[v][sc];[1:a]atrim=0:{duration},afade=t=in:d=0.7,afade=t=out:st={duration-1.8}:d=1.8[m];[m][sc]sidechaincompress=threshold=0.03:ratio=3:attack=80:release=650:makeup=1[duck];[v][duck]amix=inputs=2:normalize=0,alimiter=limit=0.84:level=0,aresample=48000[out]'
run([ffmpeg,'-y','-i',str(voice),'-i',str(music),'-filter_complex',filt,'-map','[out]','-ar','48000','-ac','2',str(root/'public/audio/final-mix.wav')])
save('captions/voice-runtime.json',{'duration':duration,'voice':True,'beats':beats,'captions':caps})
report.update({'status':'PASS','musicTargetLUFS':-34,'sidechain':True});save('qa/voice-alignment.json',report)
print(f'Voz humana alineada: {duration:.2f} segundos. Escenas y mezcla ajustadas. Escuchar el final antes de publicar.')
