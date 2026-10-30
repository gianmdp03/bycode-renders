"""Human recording only. Local ASR with word timestamps; no speech generation."""
from pathlib import Path
import os,sys,json,re,subprocess,unicodedata,difflib,shutil,wave
root=Path(__file__).resolve().parents[1]
ffmpeg=os.environ['REEL_FFMPEG'];ffprobe=os.environ['REEL_FFPROBE']
source=Path(sys.argv[1]);allow_longer='--allow-longer' in sys.argv
def run(args):
    p=subprocess.run(args,capture_output=True,text=True,encoding='utf-8',errors='replace')
    if p.returncode:raise RuntimeError(p.stderr[-2500:])
    return p
def save(p,data): (root/p).write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')
def norm(s):return ''.join(c for c in unicodedata.normalize('NFKD',s.lower()) if not unicodedata.combining(c) and c.isalnum())
def loudnorm(source,target,level):
    scan=run([ffmpeg,'-hide_banner','-i',str(source),'-af',f'loudnorm=I={level}:TP=-2:LRA=7:print_format=json','-f','null','-']).stderr
    measured=json.loads(scan[scan.rfind('{'):scan.rfind('}')+1])
    filt=f'loudnorm=I={level}:TP=-2:LRA=7:measured_I={measured["input_i"]}:measured_TP={measured["input_tp"]}:measured_LRA={measured["input_lra"]}:measured_thresh={measured["input_thresh"]}:offset={measured["target_offset"]}:linear=true'
    run([ffmpeg,'-hide_banner','-y','-i',str(source),'-af',filt,'-ar','48000','-ac','1' if level==-16 else '2',str(target)])
    return measured
# Never preserve a successful runtime if a later import fails.
for p in ['captions/voice-runtime.json','out/subtitulos.srt','public/audio/final-mix.wav']:
    (root/p).unlink(missing_ok=True)
save('qa/voice-alignment.json',{'status':'PENDING','source':source.name})
original=root/'voice'/('locucion-original'+source.suffix.lower())
if source.resolve()!=original.resolve():shutil.copy2(source,original)
decoded=root/'.local/decoded.wav'
run([ffmpeg,'-hide_banner','-y','-i',str(source),'-vn','-ac','1','-ar','48000',str(decoded)])
scan=run([ffmpeg,'-hide_banner','-i',str(decoded),'-af','silencedetect=n=-48dB:d=0.35','-f','null','-']).stderr
probe=json.loads(run([ffprobe,'-v','quiet','-show_format','-of','json',str(decoded)]).stdout)
length=float(probe['format']['duration']);start=0.;end=length
events=list(re.finditer(r'silence_(start|end): ([\d.]+)',scan));silences=[];s=None
for e in events:
    if e[1]=='start':s=float(e[2])
    elif s is not None:silences.append((s,float(e[2])));s=None
if s is not None:silences.append((s,length))
if silences and silences[0][0]<.05:start=max(0,silences[0][1]-.22)
if silences and silences[-1][1]>length-.05:end=min(length,silences[-1][0]+.3)
if end-start<3:raise RuntimeError('La toma no contiene suficiente locución.')
trimmed=root/'.local/trimmed.wav'
run([ffmpeg,'-hide_banner','-y','-i',str(decoded),'-af',f'atrim=start={start}:end={end},asetpts=PTS-STARTPTS','-ar','48000',str(trimmed)])
voice=root/'public/voice/locucion-normalizada.wav';measurement=loudnorm(trimmed,voice,-16)
from faster_whisper import WhisperModel
model=root/'.local/whisper-small'
engine=WhisperModel(str(model) if (model/'model.bin').exists() else 'small',device='cpu',compute_type='int8',download_root=str(root/'.local/models'))
segments,info=engine.transcribe(str(voice),language='es',word_timestamps=True,vad_filter=True,beam_size=5,condition_on_previous_text=False)
words=[{'text':w.word.strip(),'start':w.start,'end':w.end,'confidence':w.probability} for s in segments for w in (s.words or [])]
# Recognizers can split this proper noun; merge only contiguous Doctor + Chart.
merged=[];i=0
while i<len(words):
    if i+1<len(words) and norm(words[i]['text'])=='doctor' and norm(words[i+1]['text']) in ['chart','chard','chardt']:
        merged.append({'text':'DoctorChart','start':words[i]['start'],'end':words[i+1]['end'],'confidence':min(words[i]['confidence'],words[i+1]['confidence'])});i+=2
    else:merged.append(words[i]);i+=1
words=merged
spec=json.loads((root/'script/voice-beats.json').read_text(encoding='utf-8'))
expected=[w for b in spec['beats'] for w in b['text'].split()]
matcher=difflib.SequenceMatcher(a=[norm(w) for w in expected],b=[norm(w['text']) for w in words],autojunk=False)
matches={a+k:b+k for a,b,n in matcher.get_matching_blocks() for k in range(n)}
coverage=len(matches)/len(expected);ratio=matcher.ratio()
missing=[expected[i] for i in range(len(expected)) if i not in matches]
low=[w for w in words if w['confidence']<.45]
save('captions/transcription-raw.json',{'words':words,'transcript':' '.join(w['text'] for w in words)})
duration=max(25.,(words[-1]['end']+1.5) if words else 0,end-start+.5)
problems=[]
if coverage<.90 or ratio<.90:problems.append('La transcripción difiere del guion: revisar palabras y/o grabar otra toma.')
if len(low)>3:problems.append('Varias palabras tienen confianza baja; revisar la toma.')
if duration>30.5 and not allow_longer:problems.append('La lectura supera 30,5 s; repetir con ritmo natural más ágil o usar --allow-longer.')
# Match the first real word of every scene. No proportional guessed timing in final.
beat_indices=[];offset=0
for b in spec['beats']:beat_indices.append(offset);offset+=len(b['text'].split())
if any(i not in matches for i in beat_indices):problems.append('Falta una palabra de anclaje de escena; corregir transcripción antes de automatizar.')
report={'status':'FAIL' if problems else 'PENDING_MIX','source':source.name,'duration':duration,'trim':{'start':start,'end':end,'interior_pauses_preserved':True},'script_word_coverage':coverage,'similarity':ratio,'missing_words':missing,'low_confidence':low,'problems':problems,'normalization_measurement':measurement,'method':'faster-whisper small multilingual, local CPU int8, ASR word timestamps; human review still required'}
save('qa/voice-alignment.json',report)
if problems:print('\n'.join(problems));sys.exit(3)
starts=[0.]+[max(0,words[matches[i]]['start']-.1) for i in beat_indices[1:]]
if any(b-a<.6 for a,b in zip(starts,starts[1:])):
    report['status']='FAIL';report['problems']=['Dos escenas tienen menos de 0,6 s; revisar ritmo o reubicar el anclaje editorial.'];save('qa/voice-alignment.json',report);sys.exit(3)
beats=[{**b,'start':starts[i],'end':starts[i+1] if i+1<len(starts) else duration} for i,b in enumerate(spec['beats'])]
# Make the CTA readable at least 2 seconds, without accelerating audio.
duration=max(duration,beats[-1]['start']+2.2);beats[-1]['end']=duration
caps=[]
for i,w in enumerate(words):
    caps.append({'text':' '+w['text'],'startMs':round(w['start']*1000),'endMs':round(w['end']*1000),'timestampMs':round((w['start']+w['end'])*500),'confidence':w['confidence'],'pageBreakAfter':False})
groups=[];cursor=0
while cursor<len(caps):
    remaining=len(caps)-cursor
    size=remaining if remaining<=5 else (3 if remaining in [6,9] else 4)
    group=caps[cursor:cursor+size];group[-1]['pageBreakAfter']=True;groups.append(group);cursor+=size
save('captions/aligned.json',caps)
runtime={'beats':beats,'captions':caps,'duration':duration,'voice':True,'url':''}
save('captions/voice-runtime.json',runtime)
def stamp(ms):
    ms=round(ms);return f'{ms//3600000:02}:{ms//60000%60:02}:{ms//1000%60:02},{ms%1000:03}'
(root/'out/subtitulos.srt').write_text('\n\n'.join(f'{i+1}\n{stamp(g[0]["startMs"])} --> {stamp(g[-1]["endMs"])}\n'+''.join(w['text'] for w in g).strip() for i,g in enumerate(groups))+'\n',encoding='utf-8')
music=root/'.local/music-low.wav';loudnorm(root/'public/audio/orden-original.wav',music,-36)
# Gentle sidechain uses a separate split voice control. Voice remains uncompressed by the sidechain.
filt=f'[0:a]apad,atrim=0:{duration},asplit=2[v][sc];[1:a]atrim=0:{duration},afade=t=in:d=0.6,afade=t=out:st={max(0,duration-1.6)}:d=1.6[m];[m][sc]sidechaincompress=threshold=0.04:ratio=2:attack=100:release=650:makeup=1[duck];[v][duck]amix=inputs=2:normalize=0,alimiter=limit=0.84:level=0,aresample=48000[out]'
run([ffmpeg,'-hide_banner','-y','-i',str(voice),'-i',str(music),'-filter_complex',filt,'-map','[out]','-ar','48000','-ac','2',str(root/'public/audio/final-mix.wav')])
report['duration']=duration;report['music_target_lufs']=-36;report['status']='PASS';save('qa/voice-alignment.json',report)
print(f'Grabación humana integrada: {duration:.2f} s. Revisá captions/aligned.json y qa/voice-alignment.json. Final disponible tras aprobación.')
