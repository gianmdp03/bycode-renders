"""Validate decoded deliverables, not only successful command exit codes."""
from pathlib import Path
import argparse,subprocess,json,hashlib
import numpy as np
from scipy.signal import correlate,correlation_lags
ROOT=Path(__file__).resolve().parents[1]
p=argparse.ArgumentParser();p.add_argument('--ffmpeg',required=True);p.add_argument('--assets',default=str(ROOT/'demo/public'));p.add_argument('--renders',default='renders');a=p.parse_args();assets=Path(a.assets).resolve();assert assets.is_relative_to(ROOT)
def decode(path):return np.frombuffer(subprocess.check_output([a.ffmpeg,'-v','error','-i',str(path),'-ar','8000','-ac','1','-f','f32le','pipe:1']),dtype=np.float32)
original=decode(assets/'reference.wav');alignment=json.loads((assets/'alignment.json').read_text(encoding='utf8'))
assert alignment['audio_sha256']==hashlib.sha256((assets/'reference.wav').read_bytes()).hexdigest()
probe=next((p for base in [ROOT/'demo/node_modules',ROOT.parent/'node_modules'] for p in base.glob('@remotion/compositor-win32-x64-msvc/ffprobe.exe')),None)
assert probe,'ffprobe installed by pinned Remotion is required'
report={'status':'TECHNICAL_PASS','asr':alignment['status'],'wordCount':len(alignment['words']),'scriptSimilarity':alignment['scriptSimilarity'],'differences':alignment['differences'],'human_listening_review':'Pending; technical checks do not certify naturalness, accent or word boundaries perceptually','videos':[]}
for mode in ['tutorial','reel']:
 video=assets/a.renders/(mode+'.mp4');decoded=decode(video)
 lagdata=correlate(decoded,original,mode='full',method='fft');lags=correlation_lags(len(decoded),len(original));mask=np.abs(lags)<4000;lag=int(lags[mask][np.argmax(lagdata[mask])])
 x=original[max(0,-lag):];y=decoded[max(0,lag):];n=min(len(x),len(y));x=x[:n];y=y[:n];corr=float(np.corrcoef(x,y)[0,1])
 dropouts=[]
 for start in range(0,n-800,800):
  xr=float(np.sqrt(np.mean(x[start:start+800]**2)));yr=float(np.sqrt(np.mean(y[start:start+800]**2)))
  if xr>.015 and yr<xr*.2:dropouts.append(start/8000)
 metadata=json.loads(subprocess.check_output([str(probe),'-v','error','-show_streams','-show_format','-of','json',str(video)],text=True))
 v=next(s for s in metadata['streams'] if s['codec_type']=='video');au=next(s for s in metadata['streams'] if s['codec_type']=='audio')
 validation=subprocess.run([a.ffmpeg,'-v','error','-i',str(video),'-f','null','-'],capture_output=True,text=True)
 entry={'mode':mode,'sha256':hashlib.sha256(video.read_bytes()).hexdigest(),'duration':float(metadata['format']['duration']),'video':{k:v.get(k) for k in ['codec_name','width','height','r_frame_rate','pix_fmt','nb_frames']},'audio':{k:au.get(k) for k in ['codec_name','sample_rate','channels']},'decodedAudioCorrelation':corr,'lagSeconds':lag/8000,'unexpectedDropouts':dropouts,'decodeErrors':validation.stderr}
 expected_size=(1920,1080) if mode=='tutorial' else (1080,1920)
 entry['pass']=corr>.98 and abs(lag)/8000<.04 and not dropouts and validation.returncode==0 and abs(entry['duration']-alignment['duration'])<.05 and v['r_frame_rate']=='60/1' and au['sample_rate']=='48000' and v['codec_name']=='h264' and au['codec_name']=='aac' and (v['width'],v['height'])==expected_size and au['channels']==2
 report['videos'].append(entry)
 if not entry['pass']:report['status']='FAIL'
 if alignment['differences']:report['status']='REVIEW_REQUIRED'
(assets/'qa.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8');print(json.dumps(report,ensure_ascii=True,indent=2))
assert report['status']=='TECHNICAL_PASS','Review required: resolve ASR differences before acceptance'
