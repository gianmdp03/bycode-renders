import {spawn} from 'node:child_process';import {createInterface} from 'node:readline';import {createWriteStream} from 'node:fs';import path from 'node:path';
import {projectRoot} from './narration-studio.mjs';
export class QwenResidentClient {
 constructor({logFile}){this.logFile=logFile;this.child=null;this.ready=null;this.loaded=false;this.pending=new Map();}
 async ensure(){
  if(this.ready)return this.ready;
  this.ready=new Promise((resolve,reject)=>{
   const log=createWriteStream(this.logFile,{flags:'a'});
   const child=spawn(path.join(projectRoot,'.local/qwen-venv/Scripts/python.exe'),['-u',path.join(projectRoot,'automation/qwen-worker.py')],{cwd:projectRoot,windowsHide:true,env:{...process.env,PYTHONIOENCODING:'utf-8'}});this.child=child;
   const timeout=setTimeout(()=>{child.kill();reject(Error('Qwen no terminó de cargar. Revisá el registro del estudio.'));},180000);
   const lines=createInterface({input:child.stdout});
   child.stderr.on('data',chunk=>log.write(chunk));
   lines.on('line',line=>{let message;try{message=JSON.parse(line);}catch{log.write(line+'\n');return;}
    if(message.event==='ready'){clearTimeout(timeout);this.loaded=true;this.pid=message.pid;this.model=message.model;resolve(message);return;}
    const pending=this.pending.get(message.id);if(!pending)return;
    if(message.event==='progress')pending.onProgress?.(message.message);
    if(message.event==='done'){clearTimeout(pending.timeout);this.pending.delete(message.id);pending.resolve(message.report);}
    if(message.event==='error'){clearTimeout(pending.timeout);this.pending.delete(message.id);pending.reject(Error(message.error));}
   });
   const ended=error=>{clearTimeout(timeout);this.loaded=false;this.child=null;this.ready=null;for(const pending of this.pending.values()){clearTimeout(pending.timeout);pending.reject(error);}this.pending.clear();reject(error);log.end();};
   child.once('error',ended);child.once('exit',()=>ended(Error('Se cerró el proceso de Qwen. Las tomas ya guardadas se conservan.')));
  });return this.ready;
 }
 async generate(request,onProgress){await this.ensure();return new Promise((resolve,reject)=>{const timeout=setTimeout(()=>{this.close();reject(Error('La generación superó el tiempo máximo.'));},600000);this.pending.set(request.id,{resolve,reject,timeout,onProgress});this.child.stdin.write(JSON.stringify(request)+'\n');});}
 close(){this.child?.kill();}
 status(){return{loaded:this.loaded,pid:this.loaded?this.pid:null,model:this.model||'Qwen3-TTS-12Hz-0.6B-Base',resident:true};}
}
