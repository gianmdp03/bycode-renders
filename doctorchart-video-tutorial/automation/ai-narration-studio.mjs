import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {createNarrationStudio,projectRoot} from './narration-studio.mjs';
import {QwenResidentClient} from './qwen-client.mjs';
import {createVoiceBatch} from './ai-batch.mjs';

export async function createAIStudio({dataDir=path.join(projectRoot,'.local/ai-narration-studio'),runGeneration=null}={}) {
  const resolved=path.resolve(dataDir), human=path.join(projectRoot,'.local/narration-studio');
  if(resolved===human||resolved.startsWith(human+path.sep))throw Error('El estudio de IA no puede usar la carpeta de las grabaciones personales.');
  const generated=path.join(resolved,'generated');await fs.mkdir(generated,{recursive:true});
  const timeline=JSON.parse(await fs.readFile(path.join(projectRoot,'remotion/src/timeline.json'),'utf8'));
  const ids=new Set(timeline.scenes.flatMap(scene=>scene.beats.map(beat=>beat.id)));
  const jobs=new Map();let active=null;
  // Completed staged takes remain downloadable across server upgrades/restarts.
  for(const filename of await fs.readdir(generated)){
    const match=/^([0-9a-f-]{36})\.job\.json$/.exec(filename);if(!match)continue;
    try{const config=JSON.parse(await fs.readFile(path.join(generated,filename),'utf8'));const report=JSON.parse(await fs.readFile(path.join(generated,match[1]+'.json'),'utf8'));const bytes=await fs.readFile(path.join(generated,match[1]+'.wav'));if(crypto.createHash('sha256').update(bytes).digest('hex')!==report.sha256)continue;jobs.set(match[1],{id:match[1],segmentId:config.segmentId||'',voice:config.voice,status:'done',startedAt:(await fs.stat(path.join(generated,filename))).birthtimeMs,message:'Toma generada y recuperada del disco.',report});}catch{}
  }
  const resident=new QwenResidentClient({logFile:path.join(generated,'resident-worker.log')});
  let batchManager;
  const json=(res,status,data)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(data));return true;};
  const readBody=async req=>{let size=0;const chunks=[];for await(const chunk of req){size+=chunk.length;if(size>16000)throw Object.assign(Error('El guion es demasiado largo para un fragmento.'),{status:413});chunks.push(chunk);}try{return JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{throw Object.assign(Error('Solicitud inválida.'),{status:400});}};
  const visible=job=>({id:job.id,status:job.status,segmentId:job.segmentId,voice:job.voice,elapsedSeconds:Math.round((Date.now()-job.startedAt)/1000),message:job.message,...(job.status==='done'?{audioUrl:'/generated/'+job.id+'.wav',durationSeconds:job.report.duration_seconds}:{}),...(job.error?{error:job.error}:{})});
  const defaultRunner=async(job,jobFile)=>{
    const config=JSON.parse(await fs.readFile(jobFile,'utf8'));
    job.cancel=()=>resident.close();
    await resident.generate({id:job.id,text:config.text,voice:config.voice,output:config.output},message=>{job.message=message;});
  };
  const extraRoute=async(req,res,url)=>{
    if(req.method==='GET'&&url.pathname==='/api/voice/status')return json(res,200,resident.status());
    if(url.pathname==='/api/voice/batch'&&req.method==='GET')return json(res,200,batchManager.status());
    if(url.pathname==='/api/voice/batch'&&req.method==='POST'){const body=await readBody(req);return json(res,202,await batchManager.start(body.voice||'masculina'));}
    if(url.pathname==='/api/voice/batch/pause'&&req.method==='POST')return json(res,200,await batchManager.pause());
    if(req.method==='POST'&&url.pathname==='/api/voice/generate'){
      if(active)return json(res,429,{error:'Qwen está generando otra toma. Esperá a que termine o cancelala antes de iniciar otra.'});
      const body=await readBody(req);
      if(!ids.has(body.segmentId)||!['masculina','femenina'].includes(body.voice)||typeof body.text!=='string'||!body.text.trim()||body.text.length>2000||body.text.trim().split(/\s+/).length>200)return json(res,422,{error:'Elegí un fragmento y una voz. El guion debe tener entre 1 y 200 palabras, hasta 2000 caracteres.'});
      const id=crypto.randomUUID(),output=path.join(generated,id+'.wav');
      if(active)return json(res,429,{error:'Qwen está generando otra toma. Esperá a que termine.'});
      active=id;
      const job={id,segmentId:body.segmentId,voice:body.voice,status:'running',startedAt:Date.now(),message:'Preparando Qwen en tu RTX…'};
      const jobFile=path.join(generated,id+'.job.json');
      try{await fs.writeFile(jobFile,JSON.stringify({text:body.text,voice:body.voice,output}),{flag:'wx'});}catch(error){active=null;throw error;}
      jobs.set(id,job);active=id;
      (async()=>{
        try{
          await (runGeneration||defaultRunner)(job,jobFile);
          if(job.status==='cancelled')return;
          job.report=JSON.parse(await fs.readFile(output.replace(/\.wav$/,'.json'),'utf8'));
          const bytes=await fs.readFile(output);
          if(crypto.createHash('sha256').update(bytes).digest('hex')!==job.report.sha256)throw Error('No se pudo verificar el audio generado.');
          job.status='done';job.message='Toma generada. Escuchala y guardala si te convence.';
        }catch(error){if(job.status!=='cancelled'){job.status='error';job.error=error.message;job.message='La generación no se completó. Las tomas guardadas se conservan.';}}
        finally{if(active===id)active=null;}
      })();
      json(res,202,visible(job));return true;
    }
    const match=/^\/api\/voice\/jobs\/([0-9a-f-]{36})$/.exec(url.pathname);
    if(match&&['GET','DELETE'].includes(req.method)){
      const job=jobs.get(match[1]);if(!job){json(res,404,{error:'No se encontró la generación. Las tomas guardadas siguen disponibles.'});return true;}
      if(req.method==='DELETE'&&job.status==='running'){job.status='cancelled';job.message='Generación cancelada. Las tomas guardadas se conservan.';job.cancel?.();}
      json(res,200,visible(job));return true;
    }
    const media=/^\/generated\/([0-9a-f-]{36})\.wav$/.exec(url.pathname);
    if(media&&req.method==='GET'){
      const job=jobs.get(media[1]);if(!job||job.status!=='done'){json(res,404,{error:'La toma todavía no está lista.'});return true;}
      const bytes=await fs.readFile(path.join(generated,job.id+'.wav'));res.writeHead(200,{'Content-Type':'audio/wav','Content-Length':bytes.length,'Cache-Control':'no-store'});res.end(bytes);return true;
    }
    const samples={'/samples/masculina.wav':'qwen-voz-masculina.wav','/samples/femenina.wav':'qwen-voz-femenina.wav'};
    if(samples[url.pathname]&&req.method==='GET'){
      try{const bytes=await fs.readFile(path.join(projectRoot,'qa',samples[url.pathname]));res.writeHead(200,{'Content-Type':'audio/wav','Content-Length':bytes.length});res.end(bytes);}catch{json(res,404,{error:'La muestra todavía no está disponible.'});}return true;
    }
    return false;
  };
  const result=await createNarrationStudio({dataDir:resolved,webRoot:path.join(projectRoot,'ai-narration-studio'),projectTitle:'DoctorChart · Estudio de voz IA',extraRoute});
  batchManager=await createVoiceBatch({dataDir:resolved,getSegments:result.getSegments,saveSegment:result.saveSegment,claim:()=>{if(active)return false;active='batch';return true;},release:()=>{if(active==='batch')active=null;},generate:async item=>{const jobFile=path.join(generated,item.id+'.job.json');await fs.writeFile(jobFile,JSON.stringify({text:item.text,voice:item.voice,output:item.output}),{flag:'w'});await(runGeneration||defaultRunner)(item,jobFile);return JSON.parse(await fs.readFile(item.output.replace(/\.wav$/,'.json'),'utf8'));}});
  result.server.on('close',()=>{resident.close();if(active)jobs.get(active)?.cancel?.();});
  result.batchManager=batchManager;
  return result;
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const {server,dataDir}=await createAIStudio();
  server.listen(3320,'127.0.0.1',()=>console.log(`Estudio de voz IA: http://localhost:3320\nDatos propios: ${dataDir}\nTu estudio de voz personal permanece en http://localhost:3310`));
  server.on('error',error=>{console.error(error.message);process.exitCode=1;});
}
