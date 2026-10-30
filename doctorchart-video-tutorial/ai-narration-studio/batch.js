import {prepareAiBatch,refreshAiBatch} from '/app.js';
const $=id=>document.getElementById(id);let lastCompleted=-1;
async function request(path,body){const response=await fetch(path,body?{method:'POST',headers:{'Content-Type':'application/json','X-Narration-Studio':'1'},body:JSON.stringify(body)}:{});const value=await response.json();if(!response.ok)throw Error(value.error||'No se pudo actualizar el lote.');return value;}
async function update(){try{
 const [batch,worker]=await Promise.all([request('/api/voice/batch'),request('/api/voice/status')]);
 if(lastCompleted===-1&&batch.voice==='masculina'&&batch.status!=='idle'){$('ai-voice').value='masculina';localStorage.setItem('doctorchart-ai:voice','masculina');}
 $('batch-progress').max=batch.total;$('batch-progress').value=batch.completed;
 $('batch-count').textContent=`${batch.completed} de ${batch.total} guardados${batch.failed?' · '+batch.failed+' para revisar':''}`;
 $('batch-message').textContent=batch.message||'Un solo inicio: genera y guarda los 144 fragmentos con voz masculina.';
 $('batch-worker').textContent=worker.loaded?'Modelo cargado y residente en tu RTX.':'El modelo se carga una sola vez al iniciar el trabajo.';
 $('batch-start').textContent=['paused','needs-review'].includes(batch.status)?'Continuar lote masculino':batch.status==='completed'?'Volver a generar el lote masculino':'Generar todo con voz masculina';
 $('batch-start').disabled=batch.status==='running';$('batch-pause').disabled=batch.status!=='running'||batch.pauseRequested;
 $('batch-eta').textContent=batch.status==='running'&&batch.estimatedRemainingSeconds?`Tiempo restante estimado: ${Math.ceil(batch.estimatedRemainingSeconds/60)} min.`:'';
 if(lastCompleted!==batch.completed){lastCompleted=batch.completed;await refreshAiBatch();}
 }catch(error){$('batch-message').textContent=error.message;}
}
$('batch-start').addEventListener('click',async()=>{try{$('batch-start').disabled=true;if(!await prepareAiBatch())throw Error('Guardá los cambios de este fragmento antes de iniciar el lote.');$('ai-voice').value='masculina';localStorage.setItem('doctorchart-ai:voice','masculina');await request('/api/voice/batch',{voice:'masculina'});await update();}catch(error){$('batch-message').textContent=error.message;$('batch-start').disabled=false;}});
$('batch-pause').addEventListener('click',async()=>{try{await request('/api/voice/batch/pause',{});await update();}catch(error){$('batch-message').textContent=error.message;}});
await update();setInterval(update,2500);
