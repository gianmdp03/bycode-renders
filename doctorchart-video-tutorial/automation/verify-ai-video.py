"""Verify format and compare exported AAC against the independently assembled WAV."""
from pathlib import Path
import json
import subprocess
import sys
import numpy as np

ROOT=Path(__file__).resolve().parent.parent
CACHE=ROOT/'.local/ai-render'
FF=next((ROOT/'.local/voice-venv/Lib/site-packages/imageio_ffmpeg/binaries').glob('*.exe'))
PROBE=ROOT/'remotion/node_modules/@remotion/compositor-win32-x64-msvc/ffprobe.exe'
DATA=json.loads((ROOT/'remotion/src/ai-timeline.json').read_text(encoding='utf-8'))
sample='--sample' in sys.argv
video=ROOT/('qa/DoctorChart-IA-muestra-20s.mp4' if sample else 'output/DoctorChart-Tutorial-Prueba-IA.mp4')
expected=20 if sample else DATA['durationInFrames']/60
for source,name in [(video,'export-8k.f32'),(CACHE/'narration.wav','reference-8k.f32')]:
    subprocess.run([str(FF),'-v','error','-y','-i',str(source),'-t',str(expected),'-vn','-ar','8000','-ac','1','-f','f32le',str(CACHE/name)],check=True)
x=np.fromfile(CACHE/'export-8k.f32',dtype='<f4')
y=np.fromfile(CACHE/'reference-8k.f32',dtype='<f4')
n=min(len(x),len(y),160000)
size=1<<(2*n-1).bit_length()
corr=np.fft.irfft(np.fft.rfft(x[:n],size)*np.conj(np.fft.rfft(y[:n],size)),size)
lag=max(range(-2000,2001),key=lambda k:corr[k%size])
if lag>=0:
    x=x[lag:]
else:
    y=y[-lag:]
n=min(len(x),len(y))
x,y=x[:n],y[:n]
correlation=float(np.dot(x,y)/np.sqrt(np.dot(x,x)*np.dot(y,y)))
dropouts=[]
for start in range(0,n-800,800):
    actual=float(np.sqrt(np.mean(x[start:start+800]**2)))
    reference=float(np.sqrt(np.mean(y[start:start+800]**2)))
    if reference>.015 and actual<reference*.4:
        dropouts.append(round(start/8000,3))
segments=[]
for clip in DATA['clips']:
    start=round(clip['fromFrame']/60*8000)
    end=min(n,round((clip['fromFrame']/60+clip['audioDurationMs']/1000)*8000))
    if start>=n:
        continue
    a,b=x[start:end],y[start:end]
    value=float(np.dot(a,b)/np.sqrt(np.dot(a,a)*np.dot(b,b)))
    segments.append({'id':clip['id'],'correlation':value,'status':'PASS' if value>.98 else 'FAIL'})
probe=json.loads(subprocess.check_output([str(PROBE),'-v','error','-show_streams','-show_format','-show_chapters','-of','json',str(video)]))
vs=next(s for s in probe['streams'] if s['codec_type']=='video')
aus=next(s for s in probe['streams'] if s['codec_type']=='audio')
format_pass=(vs['width'],vs['height'],vs['r_frame_rate'],vs['codec_name'])==(1920,1080,'60/1','h264') and (aus['codec_name'],aus['sample_rate'],aus['channels'])==('aac','48000',2) and abs(float(probe['format']['duration'])-expected)<.06
if not sample:
    format_pass=format_pass and vs['pix_fmt']=='yuv420p' and int(vs['nb_frames'])==DATA['durationInFrames'] and len(segments)==144 and len(probe.get('chapters',[]))==23
report={'status':'PASS' if format_pass and correlation>.98 and not dropouts and all(s['status']=='PASS' for s in segments) else 'FAIL',
        'file':str(video),'sampleOnly':sample,'durationSeconds':float(probe['format']['duration']),
        'video':{k:vs.get(k) for k in ('codec_name','width','height','r_frame_rate','pix_fmt','nb_frames','color_space','color_range')},
        'audio':{k:aus.get(k) for k in ('codec_name','sample_rate','channels')},
        'formatPass':format_pass,'alignmentLagSamplesAt8k':lag,'audioCorrelation':correlation,
        'chapters':len(probe.get('chapters',[])),
        'unexpectedDropoutSeconds':dropouts,'segmentsChecked':len(segments),'segments':segments,
        'method':'Independently assemble original selected WAVs at 800 audio samples per video frame; compare exported AAC in 100ms voiced windows and per fragment.',
        'limitation':'Technical continuity check; naturalness and pronunciation require listening review.'}
destination=ROOT/('qa/ai-sample-audio-report.json' if sample else 'qa/ai-test-video-report.json')
destination.write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({k:v for k,v in report.items() if k!='segments'},ensure_ascii=False,indent=2))
raise SystemExit(0 if report['status']=='PASS' else 1)
