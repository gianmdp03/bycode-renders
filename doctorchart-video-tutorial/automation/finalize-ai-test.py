"""Decode and inspect the complete test MP4, then write its delivery manifest."""
from pathlib import Path
import hashlib
import json
import re
import subprocess
import sys

ROOT=Path(__file__).resolve().parent.parent
DATA=json.loads((ROOT/'remotion/src/ai-timeline.json').read_text(encoding='utf-8'))
VIDEO=ROOT/'output/DoctorChart-Tutorial-Prueba-IA.mp4'
FF=next((ROOT/'.local/voice-venv/Lib/site-packages/imageio_ffmpeg/binaries').glob('*.exe'))
LOG=ROOT/'qa/ai-final-decode.log'
PROGRESS=ROOT/'.local/ai-render/decode-progress.txt'
if '--from-log' not in sys.argv:
    with LOG.open('w',encoding='utf-8') as log:
        subprocess.run([str(FF),'-hide_banner','-nostats','-hwaccel','cuda','-hwaccel_output_format','cuda','-i',str(VIDEO),'-vf','scale_cuda=192:108,hwdownload,format=nv12,crop=172:97:10:0,blackdetect=d=0.05:pic_th=0.98:pix_th=0.015','-af','loudnorm=I=-16:TP=-1:LRA=7:print_format=json','-progress',str(PROGRESS),'-f','null','NUL'],stdout=log,stderr=log,check=True)
log=LOG.read_text(encoding='utf-8')
progress=dict(line.split('=',1) for line in PROGRESS.read_text().splitlines() if '=' in line)
measurement=json.loads(re.findall(r'\{\s*"input_i"[\s\S]*?\}',log)[-1])
black=re.findall(r'black_start:[^\r\n]+',log)
errors=re.findall(r'(?im)^.*(?:Error while|Invalid data found|corrupt decoded|CUDA_ERROR).*$',log)
report=dict(status='PASS',decodedFrames=int(progress['frame']),expectedFrames=DATA['durationInFrames'],
            unexpectedBlackIntervals=black,decodeErrors=errors,droppedFrames=int(progress['drop_frames']),
            duplicatedFrames=int(progress['dup_frames']),integratedLUFS=float(measurement['input_i']),
            truePeakDBTP=float(measurement['input_tp']),loudnessRangeLU=float(measurement['input_lra']),
            method='Full MP4 decoded using CUDA; downscaled capture-area black detection; full AAC loudnorm input analysis. No processing applied to delivered file.')
if not (report['decodedFrames']==DATA['durationInFrames'] and progress['progress']=='end'
        and not black and not errors and not report['droppedFrames'] and not report['duplicatedFrames']
        and report['truePeakDBTP'] < -1 and -17 < report['integratedLUFS'] < -15):
    report['status']='FAIL'
(ROOT/'qa/ai-final-media-report.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
print(json.dumps(report,indent=2),flush=True)
if report['status']!='PASS':
    raise RuntimeError('Media review required')
audio=json.loads((ROOT/'qa/ai-test-video-report.json').read_text(encoding='utf-8'))
assert audio['status']=='PASS'
manifest=dict(status='PASS',purpose='test-export-awaiting-user-review',file=str(VIDEO),
              bytes=VIDEO.stat().st_size,sha256=hashlib.sha256(VIDEO.read_bytes()).hexdigest(),
              width=1920,height=1080,fps=60,durationSeconds=DATA['durationInFrames']/60,
              fragments=144,chapters=23,audioPlaybackRate=1,sourceStateSha256=DATA['stateSha256'],
              reports=['qa/ai-test-video-report.json','qa/ai-final-media-report.json'])
(ROOT/'qa/ai-test-export-manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
(ROOT/'qa/ai-render-progress.json').write_text(json.dumps(dict(manifest,status='completed',full=True),indent=2),encoding='utf-8')
for name in ['wizard-number','encounter-first','edge-login-home']:
    clip=next(c for c in DATA['clips'] if c['id']==name)
    frame=clip['fromFrame']+min(180,clip['durationInFrames']//2)
    subprocess.run([str(FF),'-v','error','-y','-ss',str(frame/60),'-i',str(VIDEO),'-frames:v','1',str(ROOT/'qa'/('ai-final-'+name+'.png'))],check=True)
print(json.dumps(manifest,indent=2),flush=True)
