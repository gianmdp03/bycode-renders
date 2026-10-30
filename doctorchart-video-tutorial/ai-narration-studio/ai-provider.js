export async function generateVoice({segmentId,text,voice,onProgress,signal}) {
  const headers={'Content-Type':'application/json','X-Narration-Studio':'1'};
  const response=await fetch('/api/voice/generate',{method:'POST',headers,body:JSON.stringify({segmentId,text,voice})});
  let job=await response.json();if(!response.ok)throw Error(job.error||'No se pudo iniciar Qwen.');
  const cancel=()=>{fetch('/api/voice/jobs/'+job.id,{method:'DELETE',headers:{'X-Narration-Studio':'1'}}).catch(()=>{});};
  signal.addEventListener('abort',cancel,{once:true});
  if(signal.aborted)cancel();
  try{
    while(job.status==='running'){
      if(signal.aborted)throw Object.assign(Error('Generación cancelada.'),{name:'AbortError'});
      onProgress(`${job.message} ${job.elapsedSeconds?`(${job.elapsedSeconds} s)`:''}`);
      await new Promise(resolve=>setTimeout(resolve,1000));
      const update=await fetch('/api/voice/jobs/'+job.id);job=await update.json();if(!update.ok)throw Error(job.error||'Se perdió la conexión con Qwen.');
    }
    if(job.status==='cancelled'||signal.aborted)throw Object.assign(Error('Generación cancelada.'),{name:'AbortError'});
    if(job.status!=='done')throw Error(job.error||'No se completó la generación.');
    const audio=await fetch(job.audioUrl);if(!audio.ok)throw Error('No se pudo recuperar la toma generada.');return {blob:await audio.blob(),jobId:job.id,model:'Qwen3-TTS-12Hz-0.6B-Base'};
  }catch(error){if(job.status==='running')cancel();throw error;}finally{signal.removeEventListener('abort',cancel);}
}
