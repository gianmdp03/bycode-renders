const $ = id => document.getElementById(id);
const aiMode=document.body.dataset.studio==='ai';
const voiceProvider=aiMode?await import('/ai-provider.js'):null;
const readyLabel=aiMode?'Generá una toma, escuchala y guardala si te convence.':'Cuando estés listo, grabá solamente esta parte.';
let aiController=null;
let project, current, draft = null, selectedTakeId = null;
let busy = false, recording = false, recorder, stream, meterContext, animation, timerInterval, recordStarted;
let recordedText = '', chunks = [], objectUrl = null, playbackMode = null;
let dirty = false, loadNumber = 0;
let requestingMic = false, cancelMicRequest = null;
const statusLabels = {pending:aiMode?'Sin generar':'Sin grabar',recorded:aiMode?'Generado':'Grabado',review:'Revisar guion'};
const seconds = value => Number(value).toLocaleString('es-AR',{maximumFractionDigits:1}) + ' s';
const clock = value => `${String(Math.floor(value/60)).padStart(2,'0')}:${String(Math.floor(value%60)).padStart(2,'0')}`;
const selectedTake = () => current?.takes.find(t => t.id === selectedTakeId);
const notify = (text, error = false) => { $('notice').textContent=text; $('notice').className=error?'error':''; $('notice').hidden=false; };
const hideNotice = () => { $('notice').hidden=true; };
async function api(url, options) {
  const response = await fetch(url, options);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'No se pudo conectar con el estudio.');
  return data;
}
function setBusy(value) {
  busy=value;
  document.body.classList.toggle('busy',value || recording);
  for (const id of ['save','save-next','previous','next','segment-title','script','speed','take-select','search','chapter-filter','status-filter','import-audio']) $(id).disabled=value || recording;
  $('record').disabled=value || recording || !current;
  $('stop').disabled=!recording&&!requestingMic&&!aiController;
  $('stop').textContent=aiController?'Cancelar generación':requestingMic?'Cancelar solicitud':'■ Detener';
  if($('ai-voice'))$('ai-voice').disabled=value||Boolean(aiController);
  $('play-clip').disabled=value || recording;
  $('play-with-voice').disabled=value || recording || !(draft || selectedTake());
  for (const id of ['trim-start','trim-end','listen-trim']) $(id).disabled=value || recording || !(draft || selectedTake());
  $('previous').disabled=value || recording || project?.segments[0]?.id===current?.id;
  $('next').disabled=value || recording || project?.segments.at(-1)?.id===current?.id;
}
function markDirty() {
  if (!current) return;
  dirty = Boolean(draft) || $('segment-title').value.trim()!==current.title || $('script').value.trim()!==current.text || Number($('speed').value)!==current.speed || selectedTakeId!==current.selectedTakeId ||
    Boolean(selectedTake() && (Number($('trim-start').value)!==selectedTake().trimStart || Number($('trim-end').value)!==selectedTake().trimEnd));
  $('dirty-label').textContent=dirty?'Cambios sin guardar':'Sin cambios';
  $('dirty-label').className=dirty?'dirty':'';
  $('word-count').textContent=`${$('script').value.trim().split(/\s+/).filter(Boolean).length} palabras`;
  if(dirty) {$('save-status').textContent='Tenés cambios sin guardar.';$('saved-at').textContent='Guardá este fragmento antes de cerrar.';}
  updateFit();
}
function renderList() {
  const query=$('search').value.toLocaleLowerCase('es');
  const chapter=$('chapter-filter').value, status=$('status-filter').value;
  const completed=project.segments.filter(s=>s.status==='recorded').length;
  const review=project.segments.filter(s=>s.status==='review').length;
  $('progress-label').textContent=`${completed} de ${project.segments.length} fragmentos ${aiMode?'generados':'grabados'}${review?` · ${review} para revisar`:''}`;
  $('progress').max=project.segments.length;$('progress').value=completed;
  const nav=$('segments');nav.replaceChildren();
  project.segments.forEach((segment,index)=>{
    if((chapter && segment.chapterId!==chapter) || (status!=='all' && segment.status!==status) || (query && !`${segment.title} ${segment.text} ${segment.chapterTitle}`.toLocaleLowerCase('es').includes(query)))return;
    const button=document.createElement('button');button.className='segment-link'+(segment.id===current?.id?' active':'');button.dataset.segment=segment.id;
    button.setAttribute('aria-current',segment.id===current?.id?'true':'false');
    const number=document.createElement('span');number.className='number';number.textContent=String(index+1).padStart(2,'0');
    const text=document.createElement('span');text.className='segment-label';text.textContent=segment.title;
    const small=document.createElement('small');small.textContent=`${segment.chapterNumber}. ${segment.chapterTitle}`;text.append(small);
    const dot=document.createElement('span');dot.className='status-dot '+segment.status;dot.title=statusLabels[segment.status];
    button.append(number,text,dot);button.addEventListener('click',()=>navigate(segment.id));nav.append(button);
  });
  if(!nav.childElementCount){const p=document.createElement('p');p.className='empty-list';p.textContent='No hay fragmentos con esos filtros.';nav.append(p);}
}
function resetPlayback() {
  playbackMode=null;$('audio').pause();$('footage').pause();
  $('play-clip').textContent='▶ Ver este tramo';$('play-with-voice').textContent='▶ Ver con esta toma';
  cancelAnimationFrame(animation);
}
function cleanupObjectUrl() {if(objectUrl){URL.revokeObjectURL(objectUrl);objectUrl=null;}}
function updateCursor() {
  if(!current)return;
  const frame=$('footage').currentTime*60;
  const points=current.cursor || [];
  const before=points.filter(p=>p.frame<=frame).at(-1)||points[0];
  const after=points.find(p=>p.frame>frame)||before;
  if(!before){$('cursor').hidden=true;return;}
  $('cursor').hidden=false;
  const fraction=after.frame===before.frame?0:Math.max(0,Math.min(1,(frame-before.frame)/(after.frame-before.frame)));
  const x=before.x+(after.x-before.x)*fraction,y=before.y+(after.y-before.y)*fraction;
  $('cursor').style.left=`${x/1920*100}%`;$('cursor').style.top=`${y/1080*100}%`;
}
async function seekVideo() {
  const video=$('footage');
  if(video.readyState<1)await new Promise((resolve,reject)=>{video.addEventListener('loadedmetadata',resolve,{once:true});video.addEventListener('error',()=>reject(new Error('No se pudo abrir la captura.')),{once:true});});
  video.currentTime=current.sourceStart/60;video.playbackRate=Number($('speed').value);updateCursor();
}
async function loadSegment(id) {
  const requestNumber=++loadNumber;setBusy(true);resetPlayback();hideNotice();
  try {
    const result=await api('/api/segments/'+encodeURIComponent(id));
    if(requestNumber!==loadNumber)return;
    current=result;draft=null;dirty=false;cleanupObjectUrl();selectedTakeId=current.selectedTakeId;
    localStorage.setItem('doctorchart-narration:last-segment',current.id);
    $('chapter-label').textContent=`${String(current.chapterNumber).padStart(2,'0')} · ${current.chapterTitle}`;
    $('position').textContent=`Fragmento ${project.segments.findIndex(s=>s.id===id)+1} de ${project.segments.length}`;
    $('segment-title').value=current.title;$('script').value=current.text;$('original-script').textContent=current.originalText;$('speed').value=String(current.speed);
    $('segment-status').textContent=statusLabels[current.status];$('segment-status').className='badge '+current.status;
    $('dirty-label').textContent='Sin cambios';$('dirty-label').className='';
    $('save-status').textContent=current.updatedAt?'Fragmento guardado en este equipo.':'Los cambios se guardan con el botón Guardar.';
    $('saved-at').textContent=current.updatedAt?`Último guardado: ${new Date(current.updatedAt).toLocaleString('es-AR')}`:'Cada fragmento conserva sus propias tomas y su guion.';
    const video=$('footage');
    if(video.getAttribute('src')!==current.footageUrl){video.src=current.footageUrl;video.load();}
    await seekVideo();
    renderTakes();renderList();markDirty();$('workspace').setAttribute('aria-busy','false');
  }catch(error){notify(error.message,true);}finally{setBusy(false);}
}
async function navigate(id) {
  if(busy || recording || id===current?.id)return;
  if(dirty && !confirm('Hay cambios o una toma sin guardar. ¿Querés dejarlos sin guardar y cambiar de fragmento?'))return;
  await loadSegment(id);
}
function renderTakes() {
  const select=$('take-select');select.replaceChildren();
  if(!current.takes.length){const option=new Option('Ninguna todavía','');select.add(option);}
  [...current.takes].reverse().forEach((take,index)=>select.add(new Option(`Toma ${current.takes.length-index}${take.voice?' · '+take.voice:''} · ${seconds(take.durationSeconds)} · ${new Date(take.createdAt).toLocaleDateString('es-AR')}`,take.id)));
  select.value=selectedTakeId || '';
  const take=selectedTake();
  $('audio').hidden=!(draft||take);
  if(!draft){
    cleanupObjectUrl();
    if(take){$('audio').src=take.fullAudioUrl;$('trim-start').value=String(take.trimStart);$('trim-end').value=String(take.trimEnd);}
    else{$('audio').removeAttribute('src');$('audio').load();$('trim-start').value='0';$('trim-end').value='';}
  }
  $('download-take').hidden=!take;
  if(take){$('download-take').href=take.audioUrl;$('download-take').download=current.id+'.wav';}
  $('download-draft').hidden=!draft;
  $('take-state').textContent=draft?'Toma nueva · todavía sin guardar':take?`Toma guardada · ${seconds(take.durationSeconds)}`:'Todavía no hay una grabación';
  $('record').innerHTML=aiMode?'<span aria-hidden="true">✦</span> '+(draft||take?'Generar otra toma':'Generar voz IA'):'<span aria-hidden="true">●</span> '+(draft||take?'Grabar otra toma':'Grabar mi voz');
  if(!recording)$('record-label').textContent=readyLabel;
  setBusy(busy);updateFit();
}
function updateFit() {
  if(!current)return;
  const clipSeconds=(current.sourceEnd-current.sourceStart)/60/Number($('speed').value);
  $('clip-duration').textContent=seconds(clipSeconds);
  const take=selectedTake(), source=draft||take;
  if(!source){$('fit-note').textContent=aiMode?'Generá una toma para escucharla con este tramo.':'Grabá o importá tu voz para verla con este tramo.';$('take-warning').textContent=aiMode?'Podés generar un fragmento, revisar la voz y continuar otro día.':'Podés grabar un fragmento hoy y continuar los demás otro día.';return;}
  const retained=Number($('trim-end').value)-Number($('trim-start').value);
  const gap=retained-clipSeconds;
  $('fit-note').textContent=`Tu voz: ${seconds(Math.max(0,retained))}. Imágenes: ${seconds(clipSeconds)}. `+(gap>.15?`Se mantiene la última imagen ${seconds(gap)} mientras terminás de hablar.`:gap<-.15?`Las imágenes continúan ${seconds(-gap)} después de tu voz.`:'El tramo y tu voz tienen una duración similar.');
  $('take-warning').textContent=source.recordedText.trim()!==$('script').value.trim()?'El guion cambió después de esta toma. Escuchala y revisá si necesitás grabarla otra vez.':'El recorte conserva el original y las tomas anteriores. Guardar no modifica otros fragmentos.';
}
async function acceptDraft(blob,text) {
  if(blob.size>32*1024*1024)throw Error('El archivo supera 32 MB. Importá un fragmento más corto.');
  const context=new AudioContext();let decoded;
  try{decoded=await context.decodeAudioData(await blob.arrayBuffer());}finally{await context.close();}
  if(decoded.duration<.2 || decoded.duration>300)throw Error('La toma debe durar entre 0,2 segundos y 5 minutos.');
  let energy=0;const samples=decoded.getChannelData(0);for(let i=0;i<samples.length;i+=10)energy+=samples[i]*samples[i];
  resetPlayback();cleanupObjectUrl();draft={blob,recordedText:text,durationSeconds:decoded.duration};objectUrl=URL.createObjectURL(blob);
  $('audio').src=objectUrl;$('trim-start').value='0';$('trim-end').value=String(Math.floor(decoded.duration*100)/100);
  $('download-draft').href=objectUrl;$('download-draft').download=current.id+'-sin-guardar.'+((blob.type.includes('wav'))?'wav':blob.type.includes('mpeg')?'mp3':blob.type.includes('mp4')?'m4a':'webm');
  renderTakes();markDirty();
  notify(energy/(samples.length/10)<.000001?'La toma tiene un volumen muy bajo. Escuchala antes de guardar.':'Toma lista para escuchar y recortar. Tocá Guardar fragmento para conservarla.',energy/(samples.length/10)<.000001);
}
function releaseMic() {
  clearInterval(timerInterval);stream?.getTracks().forEach(track=>track.stop());stream=null;
  meterContext?.close().catch(()=>{});meterContext=null;$('mic-level').value=0;recording=false;setBusy(false);
}
async function generateAiVoice() {
  if(busy||recording||!current)return;
  if(draft&&!confirm('Hay una toma sin guardar. ¿Querés generar otra? Las tomas guardadas se conservan.'))return;
  resetPlayback();hideNotice();aiController=new AbortController();setBusy(true);
  const text=$('script').value,voice=$('ai-voice').value;
  localStorage.setItem('doctorchart-ai:voice',voice);
  try{
    const generated=await voiceProvider.generateVoice({segmentId:current.id,text,voice,signal:aiController.signal,onProgress:message=>{$('record-label').textContent=message;$('take-state').textContent='Qwen está generando una toma…';}});
    await acceptDraft(generated.blob,text);
    draft.provenance={engine:'qwen3-tts',voice,jobId:generated.jobId,model:generated.model};
  }catch(error){notify(error.name==='AbortError'?'Generación cancelada. Se conservan las tomas anteriores.':error.message,error.name!=='AbortError');}
  finally{aiController=null;setBusy(false);$('record-label').textContent=readyLabel;$('take-state').textContent=draft?'Toma nueva · todavía sin guardar':selectedTake()?'Toma guardada':'Todavía no hay una grabación';}
}
async function startRecording() {
  if(busy || recording)return;
  if(draft && !confirm('Hay una toma nueva sin guardar. ¿Querés reemplazarla? Las tomas guardadas se conservan.'))return;
  if(!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder){notify('Este navegador no permite grabar. Abrí esta misma dirección en Chrome o Edge, o importá un audio.',true);return;}
  const requestedSegment=current.id, text=$('script').value;
  requestingMic=true;setBusy(true);hideNotice();resetPlayback();
  let abandoned=false, permissionTimer;
  try {
    $('record-label').textContent='Permití el micrófono en el aviso del navegador. Podés cancelar si preferís hacerlo después.';
    const pendingStream=navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true},video:false});
    pendingStream.then(acquired=>{if(abandoned)acquired.getTracks().forEach(track=>track.stop());},()=>{});
    const cancelled=new Promise((resolve,reject)=>{cancelMicRequest=()=>{abandoned=true;reject(Object.assign(Error('Solicitud cancelada.'),{name:'AbortError'}));};});
    const timedOut=new Promise((resolve,reject)=>{permissionTimer=setTimeout(()=>{abandoned=true;reject(Error('El navegador sigue esperando el permiso. Permití el micrófono e intentá de nuevo, o abrí esta dirección en Chrome o Edge.'));},30000);});
    stream=await Promise.race([pendingStream,cancelled,timedOut]);
    clearTimeout(permissionTimer);requestingMic=false;cancelMicRequest=null;
    if(current.id!==requestedSegment){releaseMic();return;}
    const mime=['audio/webm;codecs=opus','audio/webm','audio/ogg;codecs=opus','audio/mp4'].find(type=>MediaRecorder.isTypeSupported(type));
    recorder=new MediaRecorder(stream,mime?{mimeType:mime}:undefined);chunks=[];recordedText=text;
    recorder.addEventListener('dataavailable',event=>{if(event.data.size)chunks.push(event.data);});
    recorder.addEventListener('stop',async()=>{
      const blob=new Blob(chunks,{type:recorder.mimeType || mime || 'audio/webm'});releaseMic();setBusy(true);
      try{await acceptDraft(blob,recordedText);}catch(error){notify(error.message,true);}finally{setBusy(false);}
    },{once:true});
    recorder.addEventListener('error',()=>{releaseMic();notify('Se interrumpió el micrófono. Las tomas guardadas se conservan.',true);});
    recorder.start(250);recording=true;busy=false;setBusy(false);recordStarted=Date.now();
    $('record-label').textContent='Grabando tu voz. Leé con tranquilidad.';$('take-state').textContent='Micrófono activo';$('timer').textContent='00:00';
    meterContext=new AudioContext();const source=meterContext.createMediaStreamSource(stream);const analyser=meterContext.createAnalyser();analyser.fftSize=256;source.connect(analyser);const values=new Uint8Array(analyser.frequencyBinCount);
    timerInterval=setInterval(()=>{const elapsed=(Date.now()-recordStarted)/1000;$('timer').textContent=clock(elapsed);analyser.getByteTimeDomainData(values);let sum=0;for(const v of values)sum+=((v-128)/128)**2;$('mic-level').value=Math.min(1,Math.sqrt(sum/values.length)*4);if(elapsed>=299 && recorder.state==='recording')recorder.stop();},100);
  }catch(error){clearTimeout(permissionTimer);abandoned=true;requestingMic=false;cancelMicRequest=null;releaseMic();$('record-label').textContent='Cuando estés listo, grabá solamente esta parte.';notify(error.name==='AbortError'?'Solicitud cancelada. Podés grabar más tarde o importar un audio.':error.name==='NotAllowedError'?'No se habilitó el micrófono. Permití su uso para esta página en el navegador o importá una grabación.':`No se pudo iniciar el micrófono: ${error.message}`,error.name!=='AbortError');}
}
function tickPlayback() {
  if(!playbackMode || !current)return;
  const video=$('footage'), audio=$('audio'), start=current.sourceStart/60, end=current.sourceEnd/60;
  if(playbackMode==='voice'){
    const elapsed=Math.max(0,audio.currentTime-Number($('trim-start').value));
    const wanted=Math.min(end-.015,start+elapsed*Number($('speed').value));
    if(Math.abs(video.currentTime-wanted)>.16)video.currentTime=wanted;
    if(wanted>=end-.02)video.pause();
    const trimmedEnd=Number($('trim-end').value);
    if(audio.currentTime>=trimmedEnd-.02 || audio.ended){
      if(video.currentTime>=end-.04){resetPlayback();return;}
      playbackMode='tail';audio.pause();video.play().catch(()=>{});
    }
  }
  if((playbackMode==='clip'||playbackMode==='tail') && video.currentTime>=end-.03){video.currentTime=end-.015;resetPlayback();updateCursor();return;}
  updateCursor();animation=requestAnimationFrame(tickPlayback);
}
async function playClip(withVoice) {
  if(busy||recording)return;
  if(playbackMode){resetPlayback();return;}
  try{
    resetPlayback();await seekVideo();
    if(withVoice){
      if(!(draft||selectedTake()))return;
      if($('audio').readyState<1)await new Promise((resolve,reject)=>{$('audio').addEventListener('loadedmetadata',resolve,{once:true});$('audio').addEventListener('error',()=>reject(Error('No se pudo abrir tu toma.')),{once:true});});
      $('audio').currentTime=Number($('trim-start').value);await $('audio').play();playbackMode='voice';$('play-with-voice').textContent='■ Detener vista previa';
    }else{playbackMode='clip';$('play-clip').textContent='■ Detener tramo';}
    await $('footage').play();animation=requestAnimationFrame(tickPlayback);
  }catch(error){resetPlayback();notify('No se pudo reproducir: '+error.message,true);}
}
async function encodeBlob(blob) {
  const bytes=new Uint8Array(await blob.arrayBuffer());let binary='';for(let i=0;i<bytes.length;i+=32768)binary+=String.fromCharCode(...bytes.subarray(i,i+32768));return btoa(binary);
}
async function saveFragment(andNext=false) {
  if(busy||recording||!current)return;
  resetPlayback();setBusy(true);hideNotice();$('save-status').textContent='Guardando y verificando en disco…';
  try {
    const body={expectedRevision:current.revision,title:$('segment-title').value,text:$('script').value,speed:Number($('speed').value),selectedTakeId};
    if(draft||selectedTake()){body.trimStart=Number($('trim-start').value);body.trimEnd=Number($('trim-end').value);}
    if(draft)body.recording={base64:await encodeBlob(draft.blob),mimeType:draft.blob.type || 'audio/wav',recordedText:draft.recordedText,...(draft.provenance?{provenance:draft.provenance}:{})};
    const result=await api('/api/segments/'+encodeURIComponent(current.id),{method:'POST',headers:{'Content-Type':'application/json','X-Narration-Studio':'1'},body:JSON.stringify(body)});
    if(!result.verifiedOnDisk || ((draft||selectedTake())&&!result.verifiedAudio))throw Error('El servidor no confirmó el guardado del archivo. Conservá esta toma para reintentar.');
    const index=project.segments.findIndex(s=>s.id===current.id);project.segments[index]=result.segment;
    current=result.segment;draft=null;dirty=false;cleanupObjectUrl();selectedTakeId=current.selectedTakeId;
    $('script').value=current.text;$('segment-title').value=current.title;
    renderTakes();renderList();markDirty();
    $('segment-status').textContent=statusLabels[current.status];$('segment-status').className='badge '+current.status;
    $('save-status').textContent='Guardado y verificado en disco.';
    $('saved-at').textContent=`${new Date(result.savedAt).toLocaleString('es-AR')}${result.verifiedAudio?' · Audio y guion verificados':' · Guion verificado'}`;
    notify(result.verifiedAudio?'Audio y guion guardados. Podés cerrar y continuar otro día.':aiMode?'Guion guardado. Este fragmento sigue pendiente de generar.':'Guion guardado. Este fragmento sigue pendiente de grabar.');
    if(andNext && index<project.segments.length-1){setBusy(false);await loadSegment(project.segments[index+1].id);notify('El fragmento anterior quedó guardado y verificado. Ya podés continuar.');}
  }catch(error){$('save-status').textContent='No se guardó. Tu toma sigue acá.';$('saved-at').textContent='Reintentá o descargá la toma antes de cerrar.';notify(error.message,true);}
  finally{setBusy(false);}
}
$('script').addEventListener('input',markDirty);$('segment-title').addEventListener('input',markDirty);
$('speed').addEventListener('change',()=>{resetPlayback();markDirty();});
for(const id of ['trim-start','trim-end'])$(id).addEventListener('input',()=>{resetPlayback();markDirty();});
for(const id of ['search','chapter-filter','status-filter'])$(id).addEventListener(id==='search'?'input':'change',renderList);
$('previous').addEventListener('click',()=>{const index=project.segments.findIndex(s=>s.id===current.id);if(index>0)navigate(project.segments[index-1].id);});
$('next').addEventListener('click',()=>{const index=project.segments.findIndex(s=>s.id===current.id);if(index<project.segments.length-1)navigate(project.segments[index+1].id);});
$('record').addEventListener('click',aiMode?generateAiVoice:startRecording);$('stop').addEventListener('click',()=>{if(aiController){aiController.abort();return;}if(requestingMic&&cancelMicRequest){cancelMicRequest();return;}if(recorder?.state==='recording'){setBusy(true);recorder.stop();}});
$('import-audio').addEventListener('change',async event=>{
  const file=event.target.files[0];if(!file)return;
  if(draft&&!confirm('Hay una toma sin guardar. ¿Querés reemplazarla con este archivo?')){event.target.value='';return;}
  setBusy(true);try{const type=file.type || ({wav:'audio/wav',mp3:'audio/mpeg',m4a:'audio/mp4',webm:'audio/webm',ogg:'audio/ogg',flac:'audio/flac'})[file.name.split('.').at(-1).toLowerCase()];if(!type)throw Error('Importá un archivo WAV, MP3, M4A, WebM, OGG o FLAC.');await acceptDraft(new Blob([file],{type}),$('script').value);}catch(error){notify(error.message,true);}finally{event.target.value='';setBusy(false);}
});
$('take-select').addEventListener('change',()=>{
  if(draft&&!confirm('La toma nueva todavía no está guardada. ¿Querés escuchar una toma anterior y dejar esta sin guardar?')){$('take-select').value=selectedTakeId||'';return;}
  resetPlayback();draft=null;selectedTakeId=$('take-select').value||null;renderTakes();markDirty();
});
$('listen-trim').addEventListener('click',async()=>{resetPlayback();try{$('audio').currentTime=Number($('trim-start').value);await $('audio').play();}catch(error){notify(error.message,true);}});
$('audio').addEventListener('timeupdate',()=>{if(!playbackMode && Number($('trim-end').value)>0 && $('audio').currentTime>=Number($('trim-end').value))$('audio').pause();});
$('audio').addEventListener('pause',()=>{if(playbackMode==='voice'&&!$('audio').ended&&$('audio').currentTime<Number($('trim-end').value)-.03)resetPlayback();});
$('footage').addEventListener('seeked',updateCursor);
$('play-clip').addEventListener('click',()=>playClip(false));$('play-with-voice').addEventListener('click',()=>playClip(true));
$('save').addEventListener('click',()=>saveFragment(false));$('save-next').addEventListener('click',()=>saveFragment(true));
window.addEventListener('beforeunload',event=>{if(dirty||recording||busy){event.preventDefault();event.returnValue='';}});
window.addEventListener('pagehide',()=>{stream?.getTracks().forEach(track=>track.stop());});
export async function prepareAiBatch(){if(dirty)await saveFragment(false);return !dirty;}
export async function refreshAiBatch(){if(!aiMode||!project)return;const updated=await api('/api/project');project=updated;renderList();const fresh=updated.segments.find(s=>s.id===current?.id);if(fresh&&fresh.revision!==current.revision&&!dirty&&!busy&&!playbackMode)await loadSegment(current.id);}
try {
  if(aiMode&&$('ai-voice'))$('ai-voice').value=localStorage.getItem('doctorchart-ai:voice')==='femenina'?'femenina':'masculina';
  project=await api('/api/project');$('storage-path').textContent=project.storageDirectory;
  const chapters=new Map(project.segments.map(s=>[s.chapterId,`${s.chapterNumber}. ${s.chapterTitle}`]));
  for(const [id,title]of chapters)$('chapter-filter').add(new Option(title,id));
  const previous=localStorage.getItem('doctorchart-narration:last-segment');
  await loadSegment(project.segments.some(s=>s.id===previous)?previous:project.segments[0].id);
}catch(error){notify('No se pudo abrir el estudio: '+error.message,true);}
