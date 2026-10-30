"""DoctorChart promo only: fixed synthetic male reference, recoverable takes, local alignment."""
from pathlib import Path
import os,sys,json,hashlib,time,subprocess,re,unicodedata,difflib,wave
root=Path(__file__).resolve().parents[1];repo=root.parent
local=root/'.local/qwen';local.mkdir(parents=True,exist_ok=True)
spec=json.loads((root/'script/voice-beats.json').read_text(encoding='utf-8'))
profile=json.loads((repo/'docs/tutorial-handoffs/VOZ_MASCULINA_DOCTORCHART.json').read_text(encoding='utf-8'))
reference=Path(profile['reference_audio'])
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
if sha(reference)!=profile['reference_sha256'] or not profile['reference_is_synthetic'] or profile['user_voice_recordings_used']:raise RuntimeError('Invalid synthetic voice reference')
def save(p,data):
    p=root/p;p.parent.mkdir(parents=True,exist_ok=True);tmp=p.with_suffix('.tmp.json');tmp.write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8');tmp.replace(p)
def run(args):
    p=subprocess.run(args,capture_output=True,text=True,encoding='utf-8',errors='replace')
    if p.returncode:raise RuntimeError(p.stderr[-3000:])
    return p
# Full sentences avoid choppy synthesis at visual cut points. No change to the script.
groups=[spec['beats'][0:1],spec['beats'][1:4],spec['beats'][4:6],spec['beats'][6:7],spec['beats'][7:8]]
if sys.argv[1]=='generate':
    os.environ.update(HF_HUB_OFFLINE='1',HF_HUB_DISABLE_IMPLICIT_TOKEN='1',HF_HUB_DISABLE_TELEMETRY='1',TOKENIZERS_PARALLELISM='false')
    import numpy as np
    import soundfile as sf
    import torch
    from qwen_tts import Qwen3TTSModel
    torch.set_num_threads(1);torch.set_num_interop_threads(1)
    if not torch.cuda.is_available():raise RuntimeError('CUDA unavailable')
    model=None;prompt=None;records=[]
    seeds=json.loads((root/'script/qwen-seeds.json').read_text()) if (root/'script/qwen-seeds.json').exists() else {}
    for i,group in enumerate(groups):
        text=' '.join(b['text'] for b in group);spoken=text.replace('DoctorChart','Doctor Chart')
        for name,pronunciation in profile['pronunciation_aliases'].items():spoken=spoken.replace(name,pronunciation)
        seed=seeds.get(group[0]['id'],20261030+i)
        key=hashlib.sha256((spoken+profile['reference_sha256']+str(seed)).encode()).hexdigest()[:12]
        target=root/f'public/voice/qwen-masculina/{group[0]["id"]}-{key}.wav';meta=target.with_suffix('.json')
        if target.exists() and meta.exists():
            record=json.loads(meta.read_text(encoding='utf-8'))
            if sha(target)!=record['sha256']:raise RuntimeError('Saved take changed')
            records.append(record);print('Reusing '+record['id'],flush=True);continue
        if model is None:
            print('Loading fixed Qwen male reference once on CUDA',flush=True)
            model=Qwen3TTSModel.from_pretrained(profile['generation_model_path'],device_map='cuda:0',dtype=torch.bfloat16,attn_implementation='sdpa',local_files_only=True)
            prompt=model.create_voice_clone_prompt(ref_audio=str(reference),ref_text=profile['reference_spoken_text'],x_vector_only_mode=False)
        print(f'Generating DoctorChart {i+1}/5: {group[0]["id"]}',flush=True);began=time.monotonic()
        torch.manual_seed(seed);torch.cuda.manual_seed_all(seed)
        limit=max(384,len(spoken.split())*12)
        with torch.inference_mode():waves,rate=model.generate_voice_clone(text=spoken,language='Spanish',voice_clone_prompt=prompt,non_streaming_mode=True,max_new_tokens=limit)
        torch.cuda.synchronize();samples=np.asarray(waves[0],dtype=np.float32);duration=len(samples)/rate
        if not np.isfinite(samples).all() or duration<.5 or duration>=limit*.08-.3 or np.max(np.abs(samples))<.005:raise RuntimeError('Invalid generated take')
        target.parent.mkdir(parents=True,exist_ok=True);tmp=target.with_suffix('.tmp.wav');sf.write(tmp,samples,rate,subtype='PCM_16');tmp.replace(target)
        record={'id':group[0]['id'],'text':text,'spokenText':spoken,'file':str(target.relative_to(root)).replace('\\','/'),'duration':duration,'sha256':sha(target),'seed':seed,'generationSeconds':round(time.monotonic()-began,2)}
        save(str(meta.relative_to(root)),record);records.append(record);print(f'Saved {duration:.2f}s',flush=True)
    save('qa/qwen-generation.json',{'synthetic':True,'userVoiceUsed':False,'profile':profile['profile_id'],'referenceSHA256':sha(reference),'engine':profile['generation_engine'],'modelRevision':profile['generation_model_revision'],'modelLoadedOnce':True,'takes':records})
elif sys.argv[1]=='align':
    import numpy as np
    from faster_whisper import WhisperModel
    ffmpeg=os.environ['REEL_FFMPEG'];manifest=json.loads((root/'qa/qwen-generation.json').read_text(encoding='utf-8'))
    engine=WhisperModel(str(root/'.local/whisper-small'),device='cpu',compute_type='int8')
    norm=lambda s:''.join(c for c in unicodedata.normalize('NFKD',s.lower()) if c.isalnum() and not unicodedata.combining(c))
    aligned=[];issues=[]
    for group,take in zip(groups,manifest['takes']):
        if take['text']!=' '.join(b['text'] for b in group) or sha(root/take['file'])!=take['sha256']:raise RuntimeError('Script or take changed')
        decoded=local/f'{take["id"]}-48k.wav'
        run([ffmpeg,'-v','error','-y','-i',str(root/take['file']),'-ac','1','-ar','48000',str(decoded)])
        with wave.open(str(decoded),'rb') as w:pcm=np.frombuffer(w.readframes(w.getnframes()),dtype='<i2').astype(np.float64)/32768
        levels=np.array([np.sqrt(np.mean(pcm[i:i+480]**2)) for i in range(0,len(pcm),480)]);active=np.where(levels>10**(-44/20))[0]
        if not len(active):raise RuntimeError('Silent take')
        start=max(0,active[0]*.01-.1);end=min(len(pcm)/48000,(active[-1]+1)*.01+.15)
        trimmed=local/f'{take["id"]}-trimmed.wav';asr=local/f'{take["id"]}-16k.wav'
        run([ffmpeg,'-v','error','-y','-i',str(decoded),'-af',f'atrim=start={start}:end={end},asetpts=PTS-STARTPTS','-ar','48000',str(trimmed)])
        run([ffmpeg,'-v','error','-y','-i',str(trimmed),'-ar','16000',str(asr)])
        with wave.open(str(asr),'rb') as w:asrPcm=np.frombuffer(w.readframes(w.getnframes()),dtype='<i2').astype(np.float32)/32768
        segments,_=engine.transcribe(asrPcm,language='es',word_timestamps=True,vad_filter=False,beam_size=5,condition_on_previous_text=False,initial_prompt=take['spokenText'])
        words=[{'text':w.word.strip(),'start':w.start,'end':w.end,'confidence':w.probability} for s in segments for w in (s.words or [])]
        merged=[];i=0
        while i<len(words):
            if i+1<len(words) and norm(words[i]['text'])+norm(words[i+1]['text']) in ['doctorchart','doctorchard','doctorchardt']:
                merged.append({'text':'DoctorChart','start':words[i]['start'],'end':words[i+1]['end'],'confidence':min(words[i]['confidence'],words[i+1]['confidence'])});i+=2
            else:merged.append(words[i]);i+=1
        words=merged;expected=take['text'].split();matcher=difflib.SequenceMatcher(a=list(map(norm,expected)),b=[norm(w['text']) for w in words],autojunk=False)
        matches={a+k:b+k for a,b,n in matcher.get_matching_blocks() for k in range(n)}
        item={'id':take['id'],'expected':expected,'words':words,'matches':matches,'duration':end-start,'trimmed':str(trimmed),'coverage':len(matches)/len(expected)};aligned.append(item)
        print(take['id'],f'{end-start:.2f}s',item['coverage'],' '.join(w['text'] for w in words),flush=True)
        if len(matches)!=len(expected) or len(words)!=len(expected):issues.append(take['id']+': ASR differs from script')
    save('qa/qwen-word-alignment.json',{'status':'FAIL' if issues else 'PASS','issues':issues,'groups':aligned})
    if issues:raise RuntimeError('; '.join(issues))
    lengths=[max(2.8,a['duration']+.4) for a in aligned];total=sum(lengths)
    if total>30:raise RuntimeError(f'Natural reading needs {total:.2f}s; regenerate a long take, do not speed speech')
    extra=max(0,28-total);lengths=[d+extra*(group[-1]['end']-group[0]['start'])/28 for d,group in zip(lengths,groups)]
    boundaries=[0]
    for length in lengths:boundaries.append(round((boundaries[-1]+length)*60)/60)
    duration=boundaries[-1];voice=np.zeros(round(duration*48000));caps=[];beats=[]
    for g,(group,a) in enumerate(zip(groups,aligned)):
        offset=boundaries[g]+.15
        with wave.open(a['trimmed'],'rb') as w:pcm=np.frombuffer(w.readframes(w.getnframes()),dtype='<i2').astype(np.float64)/32768
        first=round(offset*48000);voice[first:first+len(pcm)]+=pcm;cursor=0
        for j,b in enumerate(group):
            indices=list(range(cursor,cursor+len(b['text'].split())));start=boundaries[g] if j==0 else round((offset+a['words'][a['matches'][cursor]]['start']-.08)*60)/60
            beats.append({**b,'start':start,'end':0});cursor+=len(indices)
        for k,display in enumerate(a['expected']):
            w=a['words'][a['matches'][k]];caps.append({'text':' '+display,'startMs':round((offset+w['start'])*1000),'endMs':max(round((offset+w['end'])*1000),round((offset+w['start'])*1000)+30),'timestampMs':round((offset+(w['start']+w['end'])/2)*1000),'confidence':w['confidence'],'pageBreakAfter':False})
    for i,b in enumerate(beats):b['end']=beats[i+1]['start'] if i+1<len(beats) else duration
    if any(b['end']-b['start']<.65 for b in beats):raise RuntimeError('A visual beat is too short; inspect anchor timings')
    cursor=0
    while cursor<len(caps):
        remaining=len(caps)-cursor;n=remaining if remaining<=5 else (3 if remaining in [6,9] else 4);caps[cursor+n-1]['pageBreakAfter']=True;cursor+=n
    raw=local/'assembled.wav'
    with wave.open(str(raw),'wb') as w:w.setnchannels(1);w.setsampwidth(2);w.setframerate(48000);w.writeframes((np.clip(voice,-1,1)*32767).astype('<i2').tobytes())
    def normalize(source,dest,level,channels):
        log=run([ffmpeg,'-hide_banner','-i',str(source),'-af',f'loudnorm=I={level}:TP=-2:LRA=7:print_format=json','-f','null','-']).stderr;m=json.loads(log[log.rfind('{'):log.rfind('}')+1])
        filt=f'loudnorm=I={level}:TP=-2:LRA=7:measured_I={m["input_i"]}:measured_TP={m["input_tp"]}:measured_LRA={m["input_lra"]}:measured_thresh={m["input_thresh"]}:offset={m["target_offset"]}:linear=true'
        run([ffmpeg,'-v','error','-y','-i',str(source),'-af',filt,'-ar','48000','-ac',str(channels),str(dest)])
    voiceFile=root/'public/voice/doctorchart-qwen-masculina.wav';music=local/'music-low.wav'
    normalize(raw,voiceFile,-16,1);normalize(root/'public/audio/musica-spot-provista.mp3',music,-35,2)
    filt=f'[0:a]asplit=2[v][sc];[1:a]atrim=0:{duration},afade=t=in:d=0.7,afade=t=out:st={duration-1.8}:d=1.8[m];[m][sc]sidechaincompress=threshold=0.03:ratio=3:attack=100:release=650:makeup=1[duck];[v][duck]amix=inputs=2:normalize=0,alimiter=limit=0.84:level=0,aresample=48000[out]'
    run([ffmpeg,'-v','error','-y','-i',str(voiceFile),'-i',str(music),'-filter_complex',filt,'-map','[out]','-ar','48000','-ac','2',str(root/'public/audio/qwen-mix.wav')])
    save('captions/qwen-runtime.json',{'duration':duration,'voice':True,'voiceSource':'qwen-masculina','audioFile':'audio/qwen-mix.wav','url':'','beats':beats,'captions':caps})
    save('qa/qwen-alignment.json',{'status':'PASS','duration':duration,'words':len(caps),'synthetic':True,'humanRecordingUsed':False,'profile':profile['profile_id'],'referenceSHA256':sha(reference),'musicSource':'public/audio/musica-spot-provista.mp3','musicSHA256':sha(root/'public/audio/musica-spot-provista.mp3'),'voiceLUFS':-16,'musicLUFS':-35,'sidechain':True,'rateChanged':False,'listeningReview':'pending user review'})
    print(f'DoctorChart ready: {duration:.2f}s, {len(caps)} aligned words',flush=True)
else:raise RuntimeError('Use generate or align')
