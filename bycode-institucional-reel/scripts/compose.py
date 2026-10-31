"""Original instrumental score: no samples, voices, model or external music.
96 BPM, Dmaj9 / Bm7 / Gmaj9 / Asus2. Soft pad, muted pulse and brushed noise.
All oscillators, deterministic noise and stereo delay synthesized here.
"""
from pathlib import Path
import numpy as np
import wave
root=Path(__file__).resolve().parents[1]
rate=48000; duration=45; beat=60/96
n=round(rate*duration); audio=np.zeros((n,2),dtype=np.float64)
rng=np.random.default_rng(3407)
def add(signal,start,pan=0):
    a=round(start*rate); length=min(len(signal),n-a)
    if length<=0:return
    audio[a:a+length,0]+=signal[:length]*np.sqrt((1-pan)/2)
    audio[a:a+length,1]+=signal[:length]*np.sqrt((1+pan)/2)
def tone(midi,length,amp,attack=.4,release=1.2):
    t=np.arange(round(length*rate))/rate;freq=440*2**((midi-69)/12)
    env=np.minimum(1,t/max(.001,attack))*np.minimum(1,(length-t)/release)
    return amp*env*(np.sin(2*np.pi*freq*t)+.12*np.sin(2*np.pi*freq*2*t))
chords=[[50,57,61,64,69],[47,54,57,62,66],[43,50,54,57,62],[45,52,57,59,64]]
for bar in range(18):
    start=bar*beat*4
    for i,note in enumerate(chords[bar%4]):add(tone(note,3.6,.035,1,1.6),start,(-.55+i*.27))
    for step in [0,2]:
        tt=np.arange(round(.25*rate))/rate
        kick=np.sin(2*np.pi*(52*tt+1.4*(1-np.exp(-tt*28))))*np.exp(-tt*23)*.045
        add(kick,start+step*beat,0)
    for step in [1,3]:
        tt=np.arange(round(.13*rate))/rate
        noise=rng.normal(0,1,len(tt));noise=np.concatenate(([0],np.diff(noise)))
        add(noise*np.exp(-tt*50)*.004,start+step*beat,.25 if step==1 else -.25)
    # Sparse, low-register soft electronic pluck; no lead melody.
    if bar%2==0:
        note=chords[bar%4][2]+12
        tt=np.arange(round(1.1*rate))/rate
        p=tone(note,1.1,.018,.008,.5)*np.exp(-tt*4)
        add(p,start+1.5*beat,-.3);add(p*.25,start+1.5*beat+.313,.45)
fade=np.minimum(1,np.arange(n)/rate/1.2)*np.minimum(1,(duration-np.arange(n)/rate)/2)
audio*=fade[:,None]
dest=root/'public/audio/menos-vueltas-original.wav';dest.parent.mkdir(parents=True,exist_ok=True)
with wave.open(str(dest),'wb') as wav:
    wav.setnchannels(2);wav.setsampwidth(2);wav.setframerate(rate)
    wav.writeframes((np.clip(audio,-.98,.98)*32767).astype('<i2').tobytes())
print('Música instrumental original: 45 s, 96 BPM, estéreo 48 kHz.')
