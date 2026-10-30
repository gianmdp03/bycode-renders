import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {createNarrationStudio,projectRoot} from './narration-studio.mjs';

function wavFixture() {
  const rate=24000, count=rate*4, bytes=Buffer.alloc(44+count*2);
  bytes.write('RIFF');bytes.writeUInt32LE(bytes.length-8,4);bytes.write('WAVEfmt ',8);bytes.writeUInt32LE(16,16);bytes.writeUInt16LE(1,20);bytes.writeUInt16LE(1,22);bytes.writeUInt32LE(rate,24);bytes.writeUInt32LE(rate*2,28);bytes.writeUInt16LE(2,32);bytes.writeUInt16LE(16,34);bytes.write('data',36);bytes.writeUInt32LE(count*2,40);
  for(let i=0;i<count;i++){const t=i/rate;const amplitude=t<.5||t>3.5?0:.15;bytes.writeInt16LE(Math.round(Math.sin(t*Math.PI*2*(t<2?440:660))*32767*amplitude),44+i*2);}
  return bytes;
}
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
test('guardado real de guion, audio, recorte y recuperación tras reinicio',async t=>{
  const dataDir=await fs.mkdtemp(path.join(projectRoot,'.local/narration-studio-test-'));
  const fixture=wavFixture();await fs.writeFile(path.join(projectRoot,'qa/narration-test-input.wav'),fixture);
  let instance, base;
  const start=async()=>{instance=await createNarrationStudio({dataDir});await new Promise(resolve=>instance.server.listen(0,'127.0.0.1',resolve));base='http://127.0.0.1:'+instance.server.address().port;};
  const stop=async()=>{instance.server.closeAllConnections();await new Promise(resolve=>instance.server.close(resolve));};
  const get=async route=>{const response=await fetch(base+route);assert.equal(response.status,200);return response.json();};
  const post=async(id,body,headers={})=>{const response=await fetch(base+'/api/segments/'+id,{method:'POST',headers:{'Content-Type':'application/json','X-Narration-Studio':'1',...headers},body:JSON.stringify(body)});return {status:response.status,body:await response.json()};};
  const payload=segment=>({expectedRevision:segment.revision,text:segment.text,title:segment.title,speed:segment.speed,selectedTakeId:segment.selectedTakeId});
  const checks=[];let segment, originalOther, savedTake, secondTake;
  await start();
  try {
    await t.test('144 asociaciones reales, 23 capítulos y lectura parcial de las capturas',async()=>{
      const project=await get('/api/project');assert.equal(project.segments.length,144);assert.equal(new Set(project.segments.map(s=>s.chapterId)).size,23);
      segment=await get('/api/segments/access-context');originalOther=await get('/api/segments/access-account');assert.ok(originalOther.cursor.length);
      const response=await fetch(base+segment.footageUrl,{headers:{Range:'bytes=0-1023'}});assert.equal(response.status,206);assert.equal((await response.arrayBuffer()).byteLength,1024);
      const invalidRange=await fetch(base+segment.footageUrl,{headers:{Range:'bytes=999999999999-'}});assert.equal(invalidRange.status,416);checks.push('144 actual source mappings; ranged footage');
    });
    await t.test('cambio manual de una palabra y título, sin modificar otro fragmento',async()=>{
      const result=await post(segment.id,{...payload(segment),title:'Agarramos los datos · QA',text:segment.text.replace('reúne','agarramos')});assert.equal(result.status,200);assert.equal(result.body.verifiedOnDisk,true);segment=result.body.segment;assert.equal(segment.status,'pending');
      const persisted=JSON.parse(await fs.readFile(instance.stateFile,'utf8'));assert.equal(persisted.segments[segment.id].text,segment.text);assert.equal(persisted.segments[segment.id].title,segment.title);assert.deepEqual(await get('/api/segments/access-account'),originalOther);checks.push('edited word and title persisted; other segment unchanged');
    });
    await t.test('audio real convertido, recortado, descargado y comparado con el archivo físico',async()=>{
      const result=await post(segment.id,{...payload(segment),recording:{mimeType:'audio/wav',base64:fixture.toString('base64'),recordedText:segment.text},trimStart:.5,trimEnd:3.25});assert.equal(result.status,200);assert.equal(result.body.verifiedOnDisk,true);assert.ok(result.body.verifiedAudio.bytes>1000);segment=result.body.segment;savedTake=segment.takes.at(-1);assert.equal(segment.status,'recorded');assert.ok(Math.abs(savedTake.durationSeconds-2.75)<.02);
      const persisted=await fs.readFile(path.join(dataDir,'audio',savedTake.file));const response=await fetch(base+savedTake.audioUrl);const served=Buffer.from(await response.arrayBuffer());assert.equal(hash(served),hash(persisted));assert.equal(hash(served),result.body.verifiedAudio.sha256);assert.equal(served.toString('ascii',0,4),'RIFF');checks.push('WAV trim 0.5–3.25 seconds; downloaded bytes equal disk SHA256');
    });
    await t.test('reinicio completo del servidor conserva texto, toma seleccionada y bytes',async()=>{
      await stop();await start();const read=await get('/api/segments/'+segment.id);assert.deepEqual(read,segment);const response=await fetch(base+read.takes.at(-1).audioUrl);assert.equal(hash(Buffer.from(await response.arrayBuffer())),savedTake.sha256);checks.push('new server instance reads exact saved audio and edited script');
    });
    await t.test('segunda toma, recorte posterior y recuperación de una toma anterior',async()=>{
      let result=await post(segment.id,{...payload(segment),recording:{mimeType:'audio/wav',base64:fixture.toString('base64'),recordedText:segment.text},trimStart:0,trimEnd:4});assert.equal(result.status,200);segment=result.body.segment;secondTake=segment.takes.at(-1);assert.equal(segment.takes.length,2);
      result=await post(segment.id,{...payload(segment),trimStart:1,trimEnd:3});assert.equal(result.status,200);segment=result.body.segment;assert.equal(segment.takes.length,3);assert.equal(segment.takes.at(-1).sourceTakeId,secondTake.id);assert.ok(Math.abs(segment.takes.at(-1).durationSeconds-2)<.02);
      result=await post(segment.id,{...payload(segment),selectedTakeId:savedTake.id,trimStart:savedTake.trimStart,trimEnd:savedTake.trimEnd});assert.equal(result.status,200);segment=result.body.segment;assert.equal(segment.selectedTakeId,savedTake.id);const response=await fetch(base+savedTake.audioUrl);assert.equal(hash(Buffer.from(await response.arrayBuffer())),savedTake.sha256);checks.push('previous takes preserved, later trimming non-destructive, old take selectable');
    });
    await t.test('guion posterior marca revisar, sin perder audio ni otros fragmentos',async()=>{
      const result=await post(segment.id,{...payload(segment),text:segment.text+' Frase nueva.'});assert.equal(result.status,200);segment=result.body.segment;assert.equal(segment.status,'review');assert.equal(segment.selectedTakeId,savedTake.id);assert.deepEqual(await get('/api/segments/access-account'),originalOther);checks.push('script/audio mismatch flagged after editing');
    });
    await t.test('conflicto entre pestañas, audio inválido y recorte inválido no pisan el guardado',async()=>{
      let result=await post(segment.id,{...payload(segment),expectedRevision:0});assert.equal(result.status,409);
      result=await post(segment.id,{...payload(segment),recording:{mimeType:'audio/wav',base64:Buffer.from('this is not audio'.repeat(40)).toString('base64'),recordedText:segment.text}});assert.equal(result.status,422);
      result=await post(segment.id,{...payload(segment),trimStart:3,trimEnd:2});assert.equal(result.status,422);assert.deepEqual(await get('/api/segments/'+segment.id),segment);checks.push('stale revision, malformed audio, invalid trim rejected without overwriting');
    });
    await t.test('fallo real de escritura devuelve error y no informa guardado',async()=>{
      const stateFile=instance.stateFile;await fs.rename(stateFile,stateFile+'.previous');await fs.mkdir(stateFile);
      try{const result=await post(segment.id,{...payload(segment),title:'ESTE TÍTULO NO SE DEBE GUARDAR'});assert.equal(result.status,500);assert.equal(result.body.verifiedOnDisk,undefined);assert.deepEqual(await get('/api/segments/'+segment.id),segment);}finally{await fs.rmdir(stateFile);await fs.rename(stateFile+'.previous',stateFile);}
      await stop();await start();assert.deepEqual(await get('/api/segments/'+segment.id),segment);checks.push('actual EISDIR/rename write failure reports error and old state survives restart');
    });
    await t.test('origen externo rechazado y exportación contiene guion editado y asociación de audio',async()=>{
      const result=await post(segment.id,payload(segment),{Origin:'https://example.org'});assert.equal(result.status,403);const external=await fetch(base+'/api/project',{headers:{'Sec-Fetch-Site':'cross-site'}});assert.equal(external.status,403);
      const exported=await get('/api/export');const row=exported.segments.find(s=>s.id===segment.id);assert.equal(row.text,segment.text);assert.equal(row.selectedTakeId,savedTake.id);assert.equal(row.sourceStart,segment.sourceStart);checks.push('local origin enforced; export keeps source/action/audio association');
    });
    await fs.writeFile(path.join(projectRoot,'qa/narration-studio-report.json'),JSON.stringify({status:checks.length===9?'PASS':'FAIL',testedAt:new Date().toISOString(),isolatedDataDirectory:dataDir,productionDataModified:false,checks,microphoneHardware:'Browser UI verification tracked separately; fixture is synthetic audio, not a user recording.'},null,2)+'\n');
  } finally {await stop();}
});
