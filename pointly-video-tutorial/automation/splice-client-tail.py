"""Replace only the mispronounced final sentence; retain all earlier Qwen audio."""
from pathlib import Path
import json,hashlib,shutil,subprocess,wave
ROOT=Path(__file__).resolve().parents[1];audio=ROOT/'audio';id='08-client';wav=audio/(id+'.wav');meta=json.loads(wav.with_suffix('.json').read_text(encoding='utf8'));alignment=json.loads(wav.with_suffix('.alignment.json').read_text(encoding='utf8'))
assert alignment['audio_sha256']==meta['sha256'];words=alignment['words'];index=next(i for i,w in enumerate(words) if w['word']=='Al' and i+1<len(words) and words[i+1]['word'].lower().startswith('guardar'))
cut=(words[index-1]['end']+words[index]['start'])/2
tail=audio/'08-client-tail.wav';part=json.loads(tail.with_suffix('.json').read_text(encoding='utf8'));assert hashlib.sha256(tail.read_bytes()).hexdigest()==part['sha256']
archive=ROOT/'.local/audio-versions'/id/meta['sha256'][:16];archive.mkdir(parents=True,exist_ok=True)
for file in [wav,wav.with_suffix('.json'),wav.with_suffix('.alignment.json')]:shutil.copy2(file,archive/file.name)
ffmpeg=next((ROOT.parent/'doctorchart-video-tutorial/.local/voice-venv/Lib/site-packages/imageio_ffmpeg/binaries').glob('*.exe'));temporary=audio/'08-client-spliced.wav'
subprocess.run([str(ffmpeg),'-v','error','-y','-i',str(wav),'-i',str(tail),'-filter_complex',f'[0:a]atrim=end={cut},asetpts=PTS-STARTPTS[a];[1:a]asetpts=PTS-STARTPTS[b];[a][b]acrossfade=d=0.015:c1=tri:c2=tri,loudnorm=I=-16:TP=-1.5:LRA=7[out]','-map','[out]','-ar','48000','-ac','2','-c:a','pcm_s16le',str(temporary)],check=True);temporary.replace(wav)
chapters=json.loads((ROOT/'script/chapters.json').read_text(encoding='utf8'));text=next(c['narration'] for c in chapters if c['id']==id)
with wave.open(str(wav)) as w:duration=w.getnframes()/w.getframerate()
meta.update(text=text,text_sha256=hashlib.sha256(text.encode()).hexdigest(),sha256=hashlib.sha256(wav.read_bytes()).hexdigest(),duration=duration,spokenText=text.replace('Pointly','Pointli').replace('Bycode','baicode').replace('DNI','de ene i'),review='Final sentence replaced with locally generated Qwen phrase; complete acoustic realignment required.',correction={'cutSeconds':cut,'crossfadeSeconds':.015,'priorAudioSha256':alignment['audio_sha256'],'tailAudioSha256':part['sha256'],'fragment':'audio/08-client-tail.wav','sameSyntheticMaleReference':True,'reason':'Low-confidence mispronunciation at final sentence; only that sentence regenerated.'})
wav.with_suffix('.json').write_text(json.dumps(meta,ensure_ascii=False,indent=2),encoding='utf8');print('Corrected final sentence only:',round(duration,3),'seconds; prior full version retained.')
