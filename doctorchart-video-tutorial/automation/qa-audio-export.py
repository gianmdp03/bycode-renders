from pathlib import Path
import json,numpy as np
root=Path(__file__).resolve().parents[1];local=root/'.local'
x=np.fromfile(local/'export-audio.raw',dtype='<f4');y=np.fromfile(local/'reference-audio.raw',dtype='<f4');n=min(len(x),len(y));x=x[:n];y=y[:n]
size=1<<(2*n-1).bit_length();corr=np.fft.irfft(np.fft.rfft(x,size)*np.conj(np.fft.rfft(y,size)),size)
lags=range(-2000,2001);lag=max(lags,key=lambda k:corr[k%size])
if lag>=0:x=x[lag:];y=y[:len(x)]
else:y=y[-lag:];x=x[:len(y)]
similarity=float(np.dot(x,y)/np.sqrt(np.dot(x,x)*np.dot(y,y)));dropouts=[]
for start in range(0,len(x)-800,800):
 a=float(np.sqrt(np.mean(x[start:start+800]**2)));b=float(np.sqrt(np.mean(y[start:start+800]**2)))
 if b>.015 and a<b*.4:dropouts.append(round(start/8000,3))
report={'status':'PASS' if similarity>.98 and not dropouts else 'FAIL','method':'Decode exported AAC and independent actual timeline mix to PCM; align by cross-correlation and inspect 100ms voiced windows.','sample_rate_for_comparison':8000,'alignment_lag_samples':lag,'waveform_correlation':similarity,'unexpected_dropout_seconds':dropouts,'listening_review':'Technical continuity does not certify perceived naturalness; listen to the draft.'}
(root/'qa/audio-export-report.json').write_text(json.dumps(report,indent=2),encoding='utf8');print(json.dumps(report));raise SystemExit(0 if report['status']=='PASS' else 1)
