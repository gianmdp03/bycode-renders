"""Original instrumental bed. Deterministic synthesis, no third party samples."""
from pathlib import Path
import numpy as np, wave
root=Path(__file__).resolve().parents[1]
sr=48000;duration=64.;n=int(sr*duration)
mix=np.zeros((n,2),np.float64);rng=np.random.default_rng(30102026)
def add(signal,start,gain=.1,pan=0):
    k=int(start*sr);a=max(0,-k);k=max(0,k)
    if k>=n:return
    signal=signal[a:a+n-k]
    if len(signal):mix[k:k+len(signal),0]+=signal*gain*np.sqrt((1-pan)/2);mix[k:k+len(signal),1]+=signal*gain*np.sqrt((1+pan)/2)
def hz(m):return 440*2**((m-69)/12)
def piano(note,length=3.4):
    x=np.arange(int(length*sr))/sr;f=hz(note)
    y=(np.sin(2*np.pi*f*x)+.17*np.sin(2*np.pi*f*2.002*x)+.04*np.sin(2*np.pi*f*3*x))*np.exp(-x/1.3)*(1-np.exp(-x/.009))
    return y
chords=[[48,55,59,62,64],[45,52,55,59,62],[41,48,52,55,60],[43,50,55,57,62]]
beat=60/84;bar=beat*4
for cidx,start in enumerate(np.arange(0,duration,bar*2)):
    chord=chords[cidx%4];length=min(8.,duration-start);x=np.arange(int(length*sr))/sr
    env=np.minimum(x/1.3,1)*np.minimum((length-x)/2.2,1)
    for j,note in enumerate(chord):
        tone=(np.sin(2*np.pi*hz(note)*x+.12*np.sin(x*.8))+np.sin(2*np.pi*hz(note)*1.0014*x))/2
        add(tone*env,start,.035,(-.55+j*.26))
    for j,offset in enumerate([.18,1.5*beat,4.2*beat,6.5*beat]):
        add(piano(chord[[2,4,3,2][j]]+12),start+offset,.032,[-.35,.3,-.15,.35][j])
    add(piano(chord[0]-12,5),start,.055,0)
for k,start in enumerate(np.arange(.04,duration,beat)):
    x=np.arange(int(.35*sr))/sr
    if k%4==0:
        kick=np.sin(2*np.pi*(43*x+20*.035*(1-np.exp(-x/.035))))*np.exp(-x/.075)*(1-np.exp(-x/.004))
        add(kick,start,.018)
    if k%2==1:
        noise=rng.normal(0,1,len(x));noise=np.convolve(noise,np.ones(10)/10,mode='same');noise-=np.convolve(noise,np.ones(180)/180,mode='same')
        add(noise*np.exp(-x/.025),start,.011,(-1 if k%4==1 else 1)*.35)
dry=mix.copy()
for delay,gain in [(.23,.14),(.41,.10),(.67,.07),(.93,.035)]:
    shift=int(delay*sr);mix[shift:]+=dry[:-shift,::-1]*gain
fade=np.minimum(np.arange(n)/sr/1.2,1)*np.minimum((n-np.arange(n))/sr/2.0,1)
mix=np.tanh(mix*1.7)*fade[:,None]
def write(path,a):
    with wave.open(str(path),'wb') as w:w.setnchannels(2);w.setsampwidth(2);w.setframerate(sr);w.writeframes((np.clip(a,-1,1)*32767).astype('<i2').tobytes())
write(root/'public/audio/orden-original.wav',mix)
print('Original composition: 64 s stereo / 48 kHz, deterministic seed 30102026')
