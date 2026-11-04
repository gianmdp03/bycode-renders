"""One sample-exact stereo narration mix; final AAC is encoded only once."""
from pathlib import Path
import json,numpy as np,soundfile as sf
ROOT=Path(__file__).resolve().parents[1];data=json.loads((ROOT/'remotion/src/timeline.json').read_text(encoding='utf8'));out=ROOT/'.local/render/final-narration.wav';out.parent.mkdir(parents=True,exist_ok=True)
with sf.SoundFile(out,'w',samplerate=48000,channels=2,subtype='PCM_16') as mix:
 for c in data['chapters']:
  samples,rate=sf.read(ROOT/'remotion/public'/c['audio'],dtype='float32',always_2d=True)
  assert rate==48000 and samples.shape[1]==2
  target=c['durationInFrames']*800
  if len(samples)>target:raise RuntimeError('Audio exceeds its chapter: '+c['id'])
  samples[:384]*=np.linspace(0,1,min(384,len(samples)),dtype=np.float32)[:,None]
  mix.write(samples);mix.write(np.zeros((target-len(samples),2),dtype=np.float32))
assert sf.info(out).frames==data['durationInFrames']*800
print('Exact full narration mix:',sf.info(out).duration,'seconds.')
