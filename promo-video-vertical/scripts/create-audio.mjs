import fs from 'node:fs';
import path from 'node:path';
import {VIDEO,soundCues} from './project-timing.mjs';
// Original procedural instrumental and accents. No samples or third-party songs.
const rate=48000, length=Math.round(rate*VIDEO.seconds);
const left=new Float32Array(length),right=new Float32Array(length),sfxL=new Float32Array(length),sfxR=new Float32Array(length);
const root=path.resolve(import.meta.dirname,'..');
const freq=n=>440*2**((n-69)/12), TAU=2*Math.PI;
function add(l,r,time,duration,fn,pan=0) {const start=Math.round(time*rate),count=Math.round(duration*rate);for(let i=0;i<count && start+i<length;i++){const v=fn(i/rate,duration);l[start+i]+=v*(1-Math.max(0,pan));r[start+i]+=v*(1+Math.min(0,pan));}}
const beat=60/108,chords=[[50,57,61,66],[47,54,57,62],[43,54,59,62],[45,52,59,64]];
for(let bar=0;bar*beat*8<VIDEO.seconds-2;bar++){
 const c=chords[bar%4],start=bar*beat*8;
 c.forEach((n,j)=>add(left,right,start,beat*8+.5,(t,d)=>.017*Math.min(1,t/.7)*Math.min(1,(d-t)/1.2)*(Math.sin(TAU*freq(n)*t)+.25*Math.sin(TAU*freq(n)*2*t)),(j-1.5)*.23));
 for(let b=0;b<8;b++){const time=start+b*beat;if(time>VIDEO.seconds-2)break;add(left,right,time,.28,t=>.07*Math.sin(TAU*(49*t+7*(1-Math.exp(-22*t))))*Math.exp(-18*t));if(b%2===0)add(left,right,time,.8,t=>.035*Math.sin(TAU*freq(c[0]-12)*t)*Math.exp(-5*t));const note=c[(b*3+bar)%4]+12;add(left,right,time+beat/2,1.4,t=>.024*(Math.sin(TAU*freq(note)*t)+.17*Math.sin(TAU*freq(note)*3*t))*Math.exp(-4.5*t)*Math.min(1,t/.009),b%2?-.3:.3);}
}
const clicks=soundCues.filter(c=>c.kind==='click').map(c=>c.frame/VIDEO.fps);
clicks.forEach(t=>add(sfxL,sfxR,t,.08,x=>.10*Math.sin(TAU*(1800*x-4200*x*x))*Math.exp(-85*x)));
for(const t of soundCues.filter(c=>c.kind==='success').map(c=>c.frame/VIDEO.fps)) [74,78,81].forEach((n,i)=>add(sfxL,sfxR,t+i*.09,.7,x=>.055*Math.sin(TAU*freq(n)*x)*Math.exp(-6*x)*Math.min(1,x/.006),(i-1)*.15));
function wav(name,l,r){const out=Buffer.alloc(44+length*4);out.write('RIFF',0);out.writeUInt32LE(out.length-8,4);out.write('WAVEfmt ',8);out.writeUInt32LE(16,16);out.writeUInt16LE(1,20);out.writeUInt16LE(2,22);out.writeUInt32LE(rate,24);out.writeUInt32LE(rate*4,28);out.writeUInt16LE(4,32);out.writeUInt16LE(16,34);out.write('data',36);out.writeUInt32LE(length*4,40);let peak=0;for(let i=0;i<length;i++){const t=i/rate,fade=Math.min(1,t/.5,(VIDEO.seconds-t)/1.1);const a=l[i]*fade,b=r[i]*fade;peak=Math.max(peak,Math.abs(a),Math.abs(b));out.writeInt16LE(Math.round(Math.max(-1,Math.min(1,a))*32767),44+i*4);out.writeInt16LE(Math.round(Math.max(-1,Math.min(1,b))*32767),46+i*4);}fs.writeFileSync(path.join(root,'public/audio',name),out);console.log(name,'peak',peak.toFixed(3));}
wav('pointly-original-bed.wav',left,right);wav('pointly-ui-sfx.wav',sfxL,sfxR);
fs.writeFileSync('qa/audio-cues.json',JSON.stringify(soundCues,null,2));
