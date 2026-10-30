import fs from 'node:fs/promises';import path from 'node:path';import crypto from 'node:crypto';import {atomicJson} from './narration-studio.mjs';
export async function createVoiceBatch({dataDir,getSegments,saveSegment,generate,claim,release}){
 const filename=path.join(dataDir,'batch-state.json');let batch=null,loop=null,writeQueue=Promise.resolve();
 const persist=()=>{const snapshot=structuredClone(batch);const writing=writeQueue.then(()=>atomicJson(filename,snapshot));writeQueue=writing.catch(()=>{});return writing;};
 try{batch=JSON.parse(await fs.readFile(filename,'utf8'));if(batch.status==='running'){batch.status='paused';batch.message='Lote interrumpido. Podés continuarlo desde donde quedó.';await persist();}}catch(error){if(error.code!=='ENOENT')throw error;}
 const status=()=>{
  if(!batch)return{status:'idle',completed:0,total:getSegments().length,voice:'masculina',resident:true};
  const completed=batch.items.filter(i=>i.status==='saved').length,failed=batch.items.filter(i=>['error','conflict'].includes(i.status)).length;
  const finished=batch.items.filter(i=>i.seconds);const mean=finished.length?finished.reduce((s,i)=>s+i.seconds,0)/finished.length:0;
  return{id:batch.id,status:batch.status,voice:batch.voice,completed,failed,total:batch.items.length,message:batch.message,currentSegment:batch.currentSegment,estimatedRemainingSeconds:mean?Math.round(mean*(batch.items.length-completed-failed)):null,pauseRequested:Boolean(batch.pauseRequested),updatedAt:batch.updatedAt};
 };
 const run=async()=>{
  try{
   for(const item of batch.items){
    if(batch.pauseRequested)break;
    if(item.status==='saved')continue;
    const current=getSegments().find(s=>s.id===item.segmentId);
    if(current.text!==item.text){item.text=current.text;item.jobId=crypto.randomUUID();}
    const already=current.takes.find(t=>t.generationJobId===item.jobId);
    if(already){item.status='saved';item.takeId=already.id;await persist();continue;}
    item.status='generating';batch.currentSegment=item.segmentId;batch.message='Generando y guardando: '+current.title;batch.updatedAt=new Date().toISOString();await persist();
    const began=Date.now();const output=path.join(dataDir,'generated',item.jobId+'.wav');
    try{
     let report;
     try{const cached=JSON.parse(await fs.readFile(output.replace(/\.wav$/,'.json'),'utf8'));const audio=await fs.readFile(output);if(cached.display_text===item.text&&cached.voice===batch.voice&&crypto.createHash('sha256').update(audio).digest('hex')===cached.sha256)report=cached;}catch{}
     if(!report)report=await generate({id:item.jobId,segmentId:item.segmentId,voice:batch.voice,text:item.text,output});
     const latest=getSegments().find(s=>s.id===item.segmentId);
     if(latest.text!==item.text){item.status='conflict';item.error='El guion cambió durante la generación. Se conserva el audio generado para revisar.';await persist();continue;}
     const bytes=await fs.readFile(output);if(crypto.createHash('sha256').update(bytes).digest('hex')!==report.sha256)throw Error('El audio generado no pasó la verificación.');
     const saved=await saveSegment(item.segmentId,{expectedRevision:latest.revision,title:latest.title,text:latest.text,speed:latest.speed,selectedTakeId:latest.selectedTakeId,trimStart:0,trimEnd:report.duration_seconds,recording:{base64:bytes.toString('base64'),mimeType:'audio/wav',recordedText:item.text,provenance:{engine:'qwen3-tts',model:report.engine,voice:batch.voice,jobId:item.jobId}}});
     item.status='saved';item.takeId=saved.segment.selectedTakeId;item.seconds=(Date.now()-began)/1000;delete item.error;
    }catch(error){item.status=error.status===409?'conflict':'error';item.error=error.message;}
    batch.updatedAt=new Date().toISOString();await persist();
   }
   const incomplete=batch.items.some(i=>i.status!=='saved');batch.status=batch.pauseRequested?'paused':incomplete?'needs-review':'completed';batch.currentSegment=null;batch.message=batch.status==='completed'?'Lote terminado. Todos los audios quedaron guardados.':batch.status==='paused'?'Lote pausado. Los audios terminados quedaron guardados.':'Lote finalizado con fragmentos para revisar o reintentar.';batch.updatedAt=new Date().toISOString();await persist();
  }catch(error){batch.status='paused';batch.message='Lote detenido: '+error.message;await persist();}
  finally{loop=null;release();}
 };
 const start=async(voice='masculina')=>{
  if(loop)return status();
  if(!['masculina','femenina'].includes(voice))throw Object.assign(Error('Voz inválida'),{status:422});
  if(!claim())throw Object.assign(Error('Hay una toma en curso. Esperá a que termine antes de iniciar el lote.'),{status:409});
  try{
   if(!batch||batch.voice!==voice||batch.status==='completed'){
    if(batch)await atomicJson(path.join(dataDir,'history','batch-'+batch.id+'.json'),batch);
    batch={id:crypto.randomUUID(),voice,status:'running',createdAt:new Date().toISOString(),items:getSegments().map(s=>({segmentId:s.id,text:s.text,jobId:crypto.randomUUID(),status:'pending'}))};
   }
   batch.status='running';batch.pauseRequested=false;batch.message='Preparando el modelo una sola vez para todo el lote.';batch.updatedAt=new Date().toISOString();await persist();
   loop=run();return status();
  }catch(error){release();throw error;}
 };
 return{status,start,pause:async()=>{if(batch&&loop){batch.pauseRequested=true;batch.message='Se pausará después de guardar la toma actual.';await persist();}return status();},wait:()=>loop};
}
