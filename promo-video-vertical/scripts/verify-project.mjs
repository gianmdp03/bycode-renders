import fs from 'node:fs';
import assert from 'node:assert/strict';
import {VIDEO,demo,ledger,beats,soundCues} from './project-timing.mjs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);

assert.equal(VIDEO.width,1080);assert.equal(VIDEO.height,1920);
assert.equal(VIDEO.fps,60);assert.equal(VIDEO.frames,3828);assert.equal(VIDEO.seconds,63.8);
let frame=0;for(const beat of beats){assert.equal(beat.startFrame,frame);frame+=beat.frames;}assert.equal(frame,VIDEO.frames);assert.equal(beats.length,10);
let balance=0;for(let i=0;i<ledger.length;i++){
 const row=ledger[i], multiplier=i>=6?2:i>=3?1.5:1;
 assert.equal(row.award,Math.floor(row.amount/demo.amountStep*demo.pointsPerStep*multiplier));
 balance+=row.award-row.redeemed;assert.equal(row.balance,balance);assert.equal(row.purchases,i+1);
 assert.equal(row.tier,row.purchases>=6?'Oro':row.purchases>=3?'Plata':'Bronce');
}
assert.equal(balance,demo.finalBalance);assert.equal(ledger[0].redeemed,demo.rewardCost);
assert.equal((Date.UTC(2026,9,27)-Date.UTC(2026,8,24))/86400000,demo.inactiveDays);
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
const versions=Object.entries({...pkg.dependencies,...pkg.devDependencies}).filter(([n])=>n==='remotion'||n.startsWith('@remotion/'));
for(const[name,version]of versions){assert.equal(version,'4.0.530');assert.equal(require(`${name}/package.json`).version,version);}
const queue=require('../node_modules/@remotion/cli/dist/render-queue/queue.js');assert.equal(typeof queue.getRenderQueue,'function');assert.equal(queue.getRenderQueue().length,0);
const tracks=['pointly-original-bed.wav','pointly-ui-sfx.wav'].map(name=>{const b=fs.readFileSync(`public/audio/${name}`);assert.equal(b.toString('ascii',0,4),'RIFF');assert.equal(b.readUInt16LE(22),2);assert.equal(b.readUInt32LE(24),48000);assert.equal(b.readUInt16LE(34),16);assert.equal((b.length-44)/4/48000,VIDEO.seconds);return b;});
let peak=0,sum=0;for(let pos=44;pos<tracks[0].length;pos+=2){const v=tracks[0].readInt16LE(pos)/32768*.55+tracks[1].readInt16LE(pos)/32768*.65;peak=Math.max(peak,Math.abs(v));sum+=v*v;}
assert.ok(peak<1);
const generatedCues=JSON.parse(fs.readFileSync('qa/audio-cues.json','utf8'));assert.deepEqual(generatedCues,soundCues);
for(const cue of soundCues){const scene=beats.find(b=>b.id===cue.scene);assert.ok(cue.localFrame>=0 && cue.localFrame<scene.frames);assert.equal(cue.frame,scene.startFrame+cue.localFrame);}
const report={soundCues,composition:VIDEO,sceneCount:beats.length,sceneTiming:beats,ledger,finalBalance:balance,remotionVersion:'4.0.530',renderQueueExport:'function',audio:{sampleRate:48000,channels:2,duration:VIDEO.seconds,mixPeakDbFS:20*Math.log10(peak),mixRmsDbFS:20*Math.log10(Math.sqrt(sum/((tracks[0].length-44)/2)))},finalMp4Rendered:false};
fs.writeFileSync('qa/technical-report.json',JSON.stringify(report,null,2));
console.log(JSON.stringify({status:'PASS',...report,audio:report.audio,ledger:undefined,sceneTiming:undefined},null,2));
