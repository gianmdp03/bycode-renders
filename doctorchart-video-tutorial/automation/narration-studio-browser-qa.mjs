// Isolated developer harness. Synthetic microphone only here, never in the user's studio.
import fs from 'node:fs/promises';
import path from 'node:path';
import {createNarrationStudio,projectRoot} from './narration-studio.mjs';
const dataDir=await fs.mkdtemp(path.join(projectRoot,'.local/narration-studio-browser-qa-'));
const {server}=await createNarrationStudio({dataDir});
const originalListener=server.listeners('request')[0];server.removeAllListeners('request');
server.on('request',async(req,res)=>{
  if(req.method==='GET'&&req.url==='/app.js'){
    const fixture=`
      // Deterministic test source exercises the real MediaRecorder and upload path.
      const qaAudioContext=new AudioContext();
      navigator.mediaDevices.getUserMedia=async()=>{
        await qaAudioContext.resume();
        const oscillator=qaAudioContext.createOscillator();
        oscillator.frequency.value=440;
        const gain=qaAudioContext.createGain();gain.gain.value=0.12;
        const destination=qaAudioContext.createMediaStreamDestination();
        oscillator.connect(gain);gain.connect(destination);oscillator.start();
        destination.stream.getAudioTracks()[0].addEventListener('ended',()=>oscillator.stop(),{once:true});
        return destination.stream;
      };
      document.title='QA AISLADO · Micrófono sintético';
      document.querySelector('h1').textContent='QA aislado · micrófono sintético';
    `;
    res.writeHead(200,{'Content-Type':'text/javascript; charset=utf-8','Cache-Control':'no-store'});
    res.end(fixture+await fs.readFile(path.join(projectRoot,'narration-studio/app.js'),'utf8'));return;
  }
  originalListener(req,res);
});
server.listen(3312,'127.0.0.1',()=>console.log(JSON.stringify({url:'http://localhost:3312',dataDir,syntheticMicrophone:true,productionDataModified:false})));
