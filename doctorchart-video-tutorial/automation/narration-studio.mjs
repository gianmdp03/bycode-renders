import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {promisify} from 'node:util';
import {execFile} from 'node:child_process';

const run = promisify(execFile);
export const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const fail = (status, message) => Object.assign(new Error(message), {status});
const mimeExtensions = {'audio/webm':'webm','video/webm':'webm','audio/ogg':'ogg','audio/wav':'wav','audio/x-wav':'wav','audio/mpeg':'mp3','audio/mp3':'mp3','audio/mp4':'m4a','video/mp4':'mp4','audio/flac':'flac'};

export async function atomicJson(filename, value) {
  const bytes = Buffer.from(JSON.stringify(value, null, 2) + '\n');
  const temporary = filename + '.' + crypto.randomUUID() + '.tmp';
  const handle = await fs.open(temporary, 'wx');
  try { await handle.writeFile(bytes); await handle.sync(); } finally { await handle.close(); }
  await fs.rename(temporary, filename);
  if (digest(await fs.readFile(filename)) !== digest(bytes)) throw fail(500, 'No se pudo verificar el archivo guardado. Tu toma sigue disponible para reintentar.');
}

export async function createNarrationStudio({dataDir = path.join(projectRoot, '.local/narration-studio'),webRoot=path.join(projectRoot,'narration-studio'),projectTitle='DoctorChart · Estudio de narración',extraRoute=null} = {}) {
  const timelineBytes = await fs.readFile(path.join(projectRoot, 'remotion/src/timeline.json'));
  const timeline = JSON.parse(timelineBytes);
  const templates = timeline.scenes.flatMap((scene, chapterIndex) => scene.beats.map((beat, index) => ({
    id: beat.id, chapterId: scene.id, chapterTitle: scene.title, chapterNumber: chapterIndex + 1,
    numberInChapter: index + 1, originalText: beat.text,
    originalTitle: beat.text.split(/[.!?]/)[0],
    sourceStart: beat.sourceStart, sourceEnd: beat.sourceEnd, footage: scene.footage,
    defaultSpeed: /formula|condition|first|measurements|wizard-number|conflict|growth-frame/.test(beat.id) ? 1.5 : /search|paging|scroll|open|clear|return|links/.test(beat.id) ? 2 : 1.75,
    cursor: (() => {const points = scene.cursor.filter(e => e.x !== undefined && e.y !== undefined && ['move','click'].includes(e.event)); return [...points.filter(e => e.frame < beat.sourceStart).slice(-1), ...points.filter(e => e.frame >= beat.sourceStart && e.frame <= beat.sourceEnd)].map(({event,frame,x,y})=>({event,frame,x,y}));})(),
  })));
  const byId = new Map(templates.map(t => [t.id, t]));
  await fs.mkdir(path.join(dataDir, 'audio'), {recursive:true});
  await fs.mkdir(path.join(dataDir, 'history'), {recursive:true});
  const stateFile = path.join(dataDir, 'state.json');
  let state;
  try { state = JSON.parse(await fs.readFile(stateFile, 'utf8')); }
  catch (error) { if (error.code !== 'ENOENT') throw error; state = {schemaVersion:1, timelineSha256:digest(timelineBytes), segments:{}}; await atomicJson(stateFile, state); }
  if (state.schemaVersion !== 1 || !state.segments) throw Error('Formato de narración desconocido; se preservaron los archivos existentes.');
  if (state.timelineSha256 !== digest(timelineBytes)) throw Error('Las capturas cambiaron desde la creación del estudio. Revisá las asociaciones antes de continuar; no se sobrescribieron tus tomas.');
  const ffprobe = path.join(projectRoot, 'remotion/node_modules/@remotion/compositor-win32-x64-msvc/ffprobe.exe');
  const binaries = path.join(projectRoot, '.local/voice-venv/Lib/site-packages/imageio_ffmpeg/binaries');
  const ffmpeg = process.env.FFMPEG_BINARY || path.join(binaries, (await fs.readdir(binaries)).find(f => f.endsWith('.exe')) || 'missing.exe');
  let queue = Promise.resolve();
  const serial = task => { const result = queue.then(task); queue = result.catch(()=>{}); return result; };
  const entry = id => {
    const template = byId.get(id);
    if (!template) throw fail(404, 'Fragmento inexistente.');
    return {...template, revision:0, title:template.originalTitle, text:template.originalText, speed:template.defaultSpeed, takes:[], selectedTakeId:null, ...state.segments[id]};
  };
  const publicEntry = (id, detailed = false) => {
    const value = entry(id);
    const selected = value.takes.find(t => t.id === value.selectedTakeId);
    const {cursor, ...rest} = value;
    return {...rest, ...(detailed ? {cursor} : {}),
      status: !selected ? 'pending' : selected.recordedText.trim() === value.text.trim() ? 'recorded' : 'review',
      footageUrl:'/footage/' + value.chapterId + '.mp4',
      takes: value.takes.map(t => ({...t, audioUrl:'/audio/' + t.id + '.wav', fullAudioUrl:'/audio/' + t.id + '.full.wav'})),
    };
  };
  const duration = async filename => {
    const {stdout} = await run(ffprobe, ['-v','error','-protocol_whitelist','file,pipe','-show_entries','format=duration','-of','json',filename], {timeout:15000,windowsHide:true,maxBuffer:100000});
    const seconds = Number(JSON.parse(stdout).format?.duration);
    if (!Number.isFinite(seconds) || seconds < .2 || seconds > 300) throw fail(422, 'La toma debe durar entre 0,2 segundos y 5 minutos.');
    return seconds;
  };
  const makeTrim = async (fullFile, output, start, end) => {
    await run(ffmpeg, ['-v','error','-y','-protocol_whitelist','file,pipe','-i',fullFile,'-vn','-af',`atrim=start=${start}:end=${end},asetpts=PTS-STARTPTS`,'-ar','48000','-ac','2','-c:a','pcm_s16le',output], {timeout:60000,windowsHide:true,maxBuffer:100000});
    const bytes = await fs.readFile(output);
    if (bytes.length < 1000) throw fail(422, 'La toma está vacía. No se reemplazó tu grabación anterior.');
    return {sha256:digest(bytes), bytes:bytes.length, durationSeconds:await duration(output)};
  };
  const save = (id, body) => serial(async () => {
    const current = entry(id);
    if (body.expectedRevision !== current.revision) throw fail(409, 'Este fragmento cambió en otra pestaña. Tu toma no se perdió: descargala y recargá antes de guardar.');
    const text = body.text;
    const title = body.title;
    if (typeof text !== 'string' || !text.trim() || text.length > 12000 || typeof title !== 'string' || !title.trim() || title.length > 300) throw fail(422, 'Completá el título y el guion.');
    if (![1.5,1.75,2].includes(body.speed)) throw fail(422, 'Elegí una velocidad entre ×1,5 y ×2.');
    let takes = [...current.takes];
    let selectedTakeId = body.selectedTakeId ?? null;
    if (selectedTakeId && !takes.some(t => t.id === selectedTakeId)) throw fail(422, 'La toma seleccionada no pertenece a este fragmento.');
    let take = takes.find(t => t.id === selectedTakeId);
    if (body.recording) {
      const recording = body.recording;
      const mime = String(recording.mimeType).split(';')[0];
      if (!mimeExtensions[mime] || typeof recording.base64 !== 'string' || !/^[A-Za-z0-9+/]*={0,2}$/.test(recording.base64)) throw fail(422, 'Formato de audio no admitido.');
      const bytes = Buffer.from(recording.base64, 'base64');
      if (bytes.length < 100 || bytes.length > 32 * 1024 * 1024) throw fail(422, 'El archivo de audio está vacío o supera 32 MB.');
      if (typeof recording.recordedText !== 'string' || recording.recordedText.length > 12000) throw fail(422, 'Falta el guion asociado a la toma.');
      const takeId = crypto.randomUUID();
      const originalFile = takeId + '.input.' + mimeExtensions[mime];
      const fullFile = takeId + '.full.wav';
      await fs.writeFile(path.join(dataDir, 'audio', originalFile), bytes, {flag:'wx'});
      try {
        await run(ffmpeg, ['-v','error','-y','-protocol_whitelist','file,pipe','-i',path.join(dataDir,'audio',originalFile),'-t','301','-vn','-ar','48000','-ac','2','-c:a','pcm_s16le',path.join(dataDir,'audio',fullFile)], {timeout:60000,windowsHide:true,maxBuffer:100000});
        const fullDurationSeconds = await duration(path.join(dataDir,'audio',fullFile));
        const provenance=recording.provenance;
        const qwen=provenance?.engine==='qwen3-tts'&&['masculina','femenina'].includes(provenance.voice)&&/^[0-9a-f-]{36}$/.test(provenance.jobId??'');
        const engine=provenance?.model==='Qwen3-TTS-12Hz-0.6B-Base'?provenance.model:'Qwen3-TTS-12Hz-1.7B-VoiceDesign';
        take = {id:takeId, originalFile, fullFile, fullDurationSeconds, recordedText:recording.recordedText, createdAt:new Date().toISOString(), source:qwen?'qwen-generated':'recording-or-import',...(qwen?{engine,voice:provenance.voice,generationJobId:provenance.jobId}:{})};
      } catch (error) { throw fail(error.status || 422, 'No se pudo leer ese audio. Se conservó la toma anterior. Probá con WAV, MP3, M4A o WebM.'); }
    }
    let verifiedAudio = null;
    if (take) {
      const start = Number(body.trimStart ?? take.trimStart ?? 0);
      const end = Number(body.trimEnd ?? take.trimEnd ?? take.fullDurationSeconds);
      if (!Number.isFinite(start) || !Number.isFinite(end) || start < 0 || end > take.fullDurationSeconds + .05 || end - start < .2) throw fail(422, 'El recorte debe conservar al menos 0,2 segundos y estar dentro de la toma.');
      const needsFile = body.recording || start !== take.trimStart || end !== take.trimEnd;
      if (needsFile) {
        const takeId = body.recording ? take.id : crypto.randomUUID();
        const file = takeId + '.wav';
        const encoded = await makeTrim(path.join(dataDir,'audio',take.fullFile), path.join(dataDir,'audio',file), start, end);
        take = {...take, id:takeId, file, trimStart:start, trimEnd:end, ...encoded, createdAt:new Date().toISOString(), ...(body.recording ? {} : {source:'trim', sourceTakeId:take.id})};
        takes.push(take);
        selectedTakeId = takeId;
      }
      const onDisk = await fs.readFile(path.join(dataDir,'audio',take.file));
      if (digest(onDisk) !== take.sha256) throw fail(500, 'La verificación del audio falló. No se confirmó el guardado.');
      verifiedAudio = {sha256:take.sha256, bytes:onDisk.length};
    }
    const next = {...state, segments:{...state.segments, [id]:{
      revision:current.revision + 1, title:title.trim(), text:text.trim(), speed:body.speed, takes, selectedTakeId, updatedAt:new Date().toISOString(),
    }}};
    await atomicJson(path.join(dataDir,'history', `${Date.now()}-${crypto.randomUUID()}.json`), state);
    await atomicJson(stateFile, next);
    state = JSON.parse(await fs.readFile(stateFile, 'utf8'));
    return {segment:publicEntry(id,true), verifiedOnDisk:true, verifiedAudio, savedAt:state.segments[id].updatedAt};
  });

  const serveFile = async (req,res,filename,contentType) => {
    const stat = await fs.stat(filename);
    const range = req.headers.range;
    const headers = {'Content-Type':contentType,'Accept-Ranges':'bytes','Cache-Control':'no-store'};
    let start=0, end=stat.size-1;
    if (range) {
      const match = /^bytes=(\d*)-(\d*)$/.exec(range);
      if (!match || (!match[1] && !match[2])) {res.writeHead(416,{'Content-Range':`bytes */${stat.size}`});res.end();return;}
      if (!match[1]) start=Math.max(0,stat.size-Number(match[2]));
      else {start=Number(match[1]);end=match[2]?Math.min(Number(match[2]),end):end;}
      if (start>end || start>=stat.size) {res.writeHead(416,{'Content-Range':`bytes */${stat.size}`});res.end();return;}
      headers['Content-Range']=`bytes ${start}-${end}/${stat.size}`;
    }
    headers['Content-Length']=end-start+1;
    res.writeHead(range?206:200,headers);
    if(req.method==='HEAD'){res.end();return;}
    const handle = await fs.open(filename,'r');
    const stream = handle.createReadStream({start,end,autoClose:true});
    stream.on('error',()=>res.destroy());
    res.on('close',()=>stream.destroy());
    stream.pipe(res);
  };
  const readJson = async req => {
    let size=0;const parts=[];
    for await (const chunk of req) {size+=chunk.length;if(size>45*1024*1024)throw fail(413,'El archivo supera el tamaño permitido.');parts.push(chunk);}
    try {return JSON.parse(Buffer.concat(parts).toString('utf8'));} catch {throw fail(400,'La solicitud está incompleta.');}
  };
  const server=http.createServer(async (req,res)=>{
    res.setHeader('X-Content-Type-Options','nosniff');
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; media-src 'self' blob:; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'");
    const json=(status,value)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(value));};
    try {
      if (!/^(localhost|127\.0\.0\.1):\d+$/.test(req.headers.host||'')) throw fail(403,'Acceso local únicamente.');
      if (req.headers['sec-fetch-site']==='cross-site') throw fail(403,'Acceso local únicamente.');
      const url=new URL(req.url,'http://'+req.headers.host);
      if (!['GET','HEAD'].includes(req.method)) {
        if (req.headers['x-narration-studio']!=='1' || (req.headers.origin && req.headers.origin!=='http://'+req.headers.host)) throw fail(403,'Solicitud de otro origen rechazada.');
      }
      if(extraRoute && await extraRoute(req,res,url))return;
      if(req.method==='GET' && url.pathname==='/api/project')return json(200,{title:projectTitle,fps:timeline.fps,segments:templates.map(t=>publicEntry(t.id)),storageDirectory:dataDir});
      const segmentMatch=/^\/api\/segments\/([a-z0-9-]+)$/.exec(url.pathname);
      if(segmentMatch && req.method==='GET')return json(200,publicEntry(segmentMatch[1],true));
      if(segmentMatch && req.method==='POST')return json(200,await save(segmentMatch[1],await readJson(req)));
      if(req.method==='GET' && url.pathname==='/api/export') {
        res.setHeader('Content-Disposition','attachment; filename="doctorchart-narracion.json"');
        return json(200,{schemaVersion:1,timelineSha256:state.timelineSha256,exportedAt:new Date().toISOString(),segments:templates.map(t=>publicEntry(t.id)).map(({cursor,...s})=>s)});
      }
      const audioMatch=/^\/audio\/([0-9a-f-]{36})(\.full)?\.wav$/.exec(url.pathname);
      if(audioMatch && ['GET','HEAD'].includes(req.method)) {
        const take=Object.values(state.segments).flatMap(s=>s.takes).find(t=>t.id===audioMatch[1]);
        if(!take)throw fail(404,'Toma inexistente.');
        return await serveFile(req,res,path.join(dataDir,'audio',audioMatch[2]?take.fullFile:take.file),'audio/wav');
      }
      const footageMatch=/^\/footage\/([a-z0-9-]+)\.mp4$/.exec(url.pathname);
      if(footageMatch && ['GET','HEAD'].includes(req.method) && timeline.scenes.some(s=>s.id===footageMatch[1]))return await serveFile(req,res,path.join(projectRoot,'remotion/public/footage',footageMatch[1]+'.mp4'),'video/mp4');
      const assets={'/':'index.html','/app.js':'app.js','/style.css':'style.css','/ai-provider.js':'ai-provider.js','/batch.js':'batch.js'};
      if(assets[url.pathname] && ['GET','HEAD'].includes(req.method))return await serveFile(req,res,path.join(['/app.js','/style.css'].includes(url.pathname)?path.join(projectRoot,'narration-studio'):webRoot,assets[url.pathname]),({'/':'text/html; charset=utf-8','/app.js':'text/javascript; charset=utf-8','/style.css':'text/css; charset=utf-8','/ai-provider.js':'text/javascript; charset=utf-8','/batch.js':'text/javascript; charset=utf-8'})[url.pathname]);
      throw fail(404,'No encontrado.');
    } catch(error) {if(res.headersSent){res.destroy();return;}json(error.status || (error.code==='ENOENT'?404:500),{error:error.status?error.message:'No se pudo completar la operación. Tu toma anterior se conserva.'});}
  });
  return {server,dataDir,stateFile,getSegments:()=>templates.map(t=>publicEntry(t.id,true)),saveSegment:save};
}

if(process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const port=Number(process.env.NARRATION_STUDIO_PORT || 3310);
  const {server,dataDir}=await createNarrationStudio({...(process.env.NARRATION_STUDIO_DATA_DIR?{dataDir:path.resolve(process.env.NARRATION_STUDIO_DATA_DIR)}:{})});
  server.listen(port,'127.0.0.1',()=>console.log(`Estudio de narración: http://localhost:${port}\nGuardado local: ${dataDir}`));
  server.on('error',error=>{console.error(error.code==='EADDRINUSE'?'El puerto ya está en uso. No se detuvo ningún otro proceso.':error.message);process.exitCode=1;});
}
