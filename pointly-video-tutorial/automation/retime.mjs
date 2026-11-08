// Align useful actions to the FINAL recorded voice. Motion remains at 1x;
// readable pauses use authentic rest frames from the recorded interface.
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import {execFileSync} from 'node:child_process';import {root} from './browser.mjs';import {ffmpeg,ffprobe} from './recorder.mjs';
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const norm=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
const cue=(words,phrases,last=false)=>{let found=[];for(const phrase of [phrases].flat()){const n=norm(phrase);for(let i=0;i<words.length;i++){let text='';for(let j=i;j<Math.min(words.length,i+8);j++){text+=norm(words[j].display??words[j].word);if(text===n){found.push(Math.round(words[i].start*60));break}if(text.length>n.length)break}}}return found.length?(last?Math.max(...found):Math.min(...found)):null};
const rules={
 '02-access':[{note:/Current public merchant onboarding/,voice:'abre una guía'},{click:/Ya tengo cuenta/i,voice:'ingresás con el mismo'},{note:/invalid-credential/,voice:'Si los datos no coinciden'}],
 '03-profile':[{click:/Continuar al Panel/i,voice:['Completalo','Continuamos','continuá al']}],
 '04-company':[{click:/Argentina/i,voice:'País es obligatorio'},{click:/Crear empresa/i,voice:'antes de crear'}],
 '05-settings':[{click:/Guardar Cambios/i,voice:'antes de guardar'}],
 '06-photo':[{click:/Guardar foto/i,voice:'guardamos la imagen'},{click:/Cambiar enlace e invalidar/i,voice:'al confirmar el cambio'}],
 '07-navigation':[{click:/^Clientes$/,voice:'Las pestañas'}],
 '08-client':[{click:/Guardar cliente/i,occurrence:0,voice:'El alta es inmediata'},{click:/Guardar cliente/i,occurrence:1,voice:'se conservan sus datos'}],
 '09-qr':[{click:/Imprimir cartel/i,voice:'impresión'},{note:/printable QR view/,voice:'El enlace abre'},{click:/Registrarme|Registr|Unirme|Sumarme/i,voice:'confirma el alta'}],
 '10-search':[{click:/Ver detalle de/i,voice:'Entramos en Ver detalle'},{note:/contacts load automatically/,voice:'Los contactos aparecen'},{click:/^Siguiente$/,voice:'varias páginas'}],
 '11-sale':[{click:/Registrar venta y sumar puntos/i,voice:'Al confirmar'}],
 '12-sales-history':[{note:/Stored amounts/,voice:'Una compra menor'},{note:/browser response interrupted/,voice:'Si la conexión'},{click:/Reintentar venta pendiente/i,voice:'Reintentar venta pendiente'}],
 '13-promotion':[{clickAt:0,voice:['cincuenta por ciento','50%']},{clickAt:2,voice:'el triple'},{clickAt:4,voice:'personalizado'},{clickAt:7,voice:'Revisá la equivalencia'},{click:/Guardar Promoción/i,voice:'Guardá y verificá'}],
 '15-products':[{click:/Guardar Producto/i,voice:'Primero guardamos'},{click:/^Editar$/,voice:'Desde Editar'},{note:/Direct image URL persisted/,voice:'comprobamos el resultado'},{click:/Quitar imagen/i,voice:'Quitar imagen'},{click:/^Eliminar$/,voice:'Eliminar pide'}],
 '16-physical-reward':[{click:/nuestra calculadora/i,voice:'La calculadora'},{click:/Calcular y usar puntos/i,voice:'Calculá'},{click:/Guardar Premio/i,voice:'confirmar el formulario'}],
 '17-voucher':[{clickAt:0,voice:'Elegí Voucher'},{click:/Guardar Premio/i,voice:'antes de guardar'}],
 '19-redeem':[{click:/Descontar puntos y registrar canje/i,voice:['confirmá una sola','confirma una sola']}],
 '20-redeem-errors':[{note:/browser response interrupted/,voice:'Si el resultado'},{click:/Reintentar canje pendiente/i,voice:'Reintentar canje pendiente'}],
 '21-inactive':[{click:/WhatsApp/i,voice:'Preparar WhatsApp'},{click:/Copiar/i,voice:['copiamos','copiar']}],
 '22-archive':[{note:/Public wallet displays/,voice:'La billetera sigue'},{click:/Reactivar cliente/i,voice:'la reactivación'}],
 '23-emails':[{note:/Actual fixed template preview/,voice:'Hay tres ejemplos'},{clickAt:'last',voice:'Si elegís No'}],
 '24-wallet':[{click:/^Promociones$/,voice:'Las otras pestañas'}],
 '25-expiration':[{click:/Ver detalle/i,voice:['Ver detalle','Ver detalles']},{click:/Cargar más vencimientos/i,voice:'Cargar más vencimientos'}],
 '26-wallet-access':[{click:/Copiar enlace/i,voice:'copiar el enlace'},{note:/Saved wallet reopened/,voice:'Abrir mi acceso guardado',optional:true},{note:/install guidance expanded/,voice:'una guía',optional:true},{click:/Quitar acceso guardado/i,voice:'También podés quitar'},{click:/Consultar otro DNI/i,voice:['Consultar otro DNI','Consultar otro DNE']}],
 '27-company-status':[{click:/^Confirmar$/,voice:'Leé la confirmación'},{click:/^Habilitar$/,voice:['habilitalo nuevamente','habilitarlo nuevamente']}],
 '28-roles':[{click:/Ver Detalle/i,voice:'Algunas acciones visibles'}],
 '29-help':[{click:/Cambiar a modo/,occurrence:0,voice:'cambiar entre'},{click:/Cambiar a modo/,occurrence:1,voice:'oscuro'},{click:/Cerrar sesión/i,voice:'cerrá la sesión'}],
};
const manifest=read('recordings/manifest.json');const wanted=process.argv.slice(2).filter(s=>!s.startsWith('--'));const folder=path.join(root,'.local/retimed');fs.mkdirSync(folder,{recursive:true});
const rulesHash=crypto.createHash('sha256').update(fs.readFileSync(new URL(import.meta.url))).digest('hex');
const reviewed=fs.existsSync(path.join(root,'script/reviewed-edits.json'))?read('script/reviewed-edits.json'):{};
const indexFile=path.join(root,'.local/retimed-manifest.json');const index=fs.existsSync(indexFile)?read('.local/retimed-manifest.json'):{chapters:{}};
for(const r of manifest.recordings){
 if(!rules[r.scene_id]||wanted.length&&!wanted.includes(r.scene_id))continue;
 const id=r.scene_id;const aFile=path.join(root,'audio',id+'.alignment.json');if(!fs.existsSync(aFile))continue;
 const a=read('audio/'+id+'.alignment.json'),meta=read('audio/'+id+'.json');if(a.audio_sha256!==meta.sha256)continue;
 const manual=reviewed[r.scene_id];
 if(manual&&(manual.rawRecording!==r.file||manual.audioSha256!==meta.sha256))throw Error(r.scene_id+': reviewed cuts belong to another take/audio; review or remove that override first.');
 const fingerprint=crypto.createHash('sha256').update(JSON.stringify({recording:r.file,audio:meta.sha256,rulesHash,manual})).digest('hex');
 if(index.chapters[id]?.fingerprint===fingerprint&&fs.existsSync(path.join(root,index.chapters[id].file))){console.log('REUSE EDIT',id);continue}
 const proofFile=path.join(root,'qa',id+'-evidence.json');const proof=fs.existsSync(proofFile)?read('qa/'+id+'-evidence.json'):null;
 const localTime=ms=>r.sync.markerFrame+Math.round((ms-r.sync.browserMs)*.06)-r.source_start;
 const clicks=r.cursor_events.filter(e=>e.event==='click');let anchors=[];let unresolved=[];let cuts=[];
 // Omit a repeated authentication passage. The archived public wallet and the
 // successful merchant reactivation remain genuine, uninterrupted UI excerpts.
 if(id==='22-archive'){
  const wallet=proof?.evidence.find(e=>/Public wallet displays/.test(e.label));const reactivate=clicks.find(e=>/Reactivar cliente/.test(e.target));
  if(wallet&&reactivate){const start=localTime(wallet.at)+45,end=reactivate.frame-r.source_start-75;if(end-start>60)cuts.push({start,end,reason:'Repeated sign-in and return navigation, after actual public archived-wallet evidence'});}
 }
 const compressed=f=>f-cuts.reduce((sum,cut)=>sum+Math.max(0,Math.min(f,cut.end)-cut.start),0);
 for(const rule of rules[id]){
  let event;if(rule.note){const n=proof?.evidence.find(e=>rule.note.test(e.label));event=n?{frame:r.source_start+localTime(n.at),label:n.label}:null;}
  else{const matches=rule.clickAt!==undefined?clicks:clicks.filter(e=>rule.click.test(e.target));event=matches[rule.clickAt==='last'?matches.length-1:rule.clickAt??rule.occurrence??0];}
  const target=cue(a.words,rule.voice,rule.lastVoice);
  if(!event||target===null){if(!rule.optional)unresolved.push({click:String(rule.click??rule.note??rule.clickAt),voice:rule.voice});continue}
  anchors.push({source:compressed(Math.max(0,event.frame-r.source_start)),target,label:event.label??event.target,spoken:rule.voice});
 }
 anchors=anchors.sort((x,y)=>x.source-y.source);let prevS=0,prevT=0;const segments=[];
 for(const anchor of anchors){
  if(anchor.source<=prevS)continue;
  anchor.actualTarget=Math.max(anchor.target,prevT+anchor.source-prevS);
  const hold=anchor.actualTarget-prevT-(anchor.source-prevS);const rest=Math.max(prevS,anchor.source-45);
  if(rest>prevS)segments.push({start:prevS,end:rest,hold});
  else if(hold){segments.push({start:prevS,end:prevS+1,hold});}
  const motionStart=rest===prevS&&hold?prevS+1:rest;
  if(anchor.source>motionStart)segments.push({start:motionStart,end:anchor.source,hold:0});
  prevS=anchor.source;prevT=anchor.actualTarget;
 }
 const lastEvent=compressed(Math.max(0,...r.cursor_events.map(e=>e.frame-r.source_start),...(proof?.evidence.map(e=>localTime(e.at))??[])));const usefulEnd=Math.min(compressed(r.source_end-r.source_start),Math.max(prevS+30,lastEvent+90));
 const speechEnd=Math.ceil((meta.duration+.65)*60);const tail=Math.max(0,speechEnd-(prevT+usefulEnd-prevS));segments.push({start:prevS,end:usefulEnd,hold:tail});
 if(process.argv.includes('--plan')&&!manual){console.log(JSON.stringify({id,anchors,segments,seconds:segments.reduce((sum,s)=>sum+s.end-s.start+s.hold,0)/60,voice:meta.duration,unresolved}));continue;}
 const pieces=[];let original=0,edited=0;for(const cut of [...cuts,{start:r.source_end-r.source_start,end:r.source_end-r.source_start}]){if(cut.start>original)pieces.push({start:original,end:cut.start,editedStart:edited,editedEnd:edited+cut.start-original});edited+=cut.start-original;original=cut.end;}
 let expanded=segments.flatMap(s=>{const parts=pieces.filter(p=>p.editedEnd>s.start&&p.editedStart<s.end).map(p=>({start:p.start+Math.max(0,s.start-p.editedStart),end:p.start+Math.min(p.end-p.start,s.end-p.editedStart),hold:0}));if(parts.length)parts.at(-1).hold=s.hold;return parts});
 if(manual){expanded=manual.segments.map(s=>({...s}));cuts=manual.reviewNotes;anchors=[];unresolved=[];const total=expanded.reduce((sum,s)=>sum+s.end-s.start+s.hold,0);expanded.at(-1).hold+=Math.max(0,speechEnd-total);if(expanded.some(s=>s.start<0||s.end>r.source_end-r.source_start||s.end<=s.start||s.hold<0))throw Error('Invalid reviewed excerpt: '+id);}
 if(process.argv.includes('--plan')){console.log(JSON.stringify({id,reviewed:true,segments:expanded,seconds:expanded.reduce((sum,s)=>sum+s.end-s.start+s.hold,0)/60,voice:meta.duration}));continue;}
 const file=path.join(folder,id+'-'+fingerprint.slice(0,10)+'.mp4');
 const split=`[0:v]split=${expanded.length}`+expanded.map((_,i)=>`[s${i}]`).join('')+';';
 const filters=expanded.map((s,i)=>`[s${i}]trim=start_frame=${r.source_start+s.start}:end_frame=${r.source_start+s.end},setpts=PTS-STARTPTS,fps=60${s.hold?`,tpad=stop=${s.hold}:stop_mode=clone`:''}[v${i}]`).join(';');
 const concat=expanded.map((_,i)=>`[v${i}]`).join('')+`concat=n=${expanded.length}:v=1:a=0,format=yuv420p[out]`;
 execFileSync(ffmpeg,['-v','error','-y','-i',path.join(root,r.file),'-filter_complex',split+filters+';'+concat,'-map','[out]','-an','-r','60','-c:v','h264_nvenc','-preset','p4','-cq','17','-b:v','18M','-pix_fmt','yuv420p','-movflags','+faststart',file],{stdio:'pipe',maxBuffer:3e6});
 const probe=JSON.parse(execFileSync(ffprobe,['-v','quiet','-show_streams','-of','json',file],{encoding:'utf8'}));const frames=Number(probe.streams[0].nb_frames);
 const expectedFrames=expanded.reduce((sum,s)=>sum+s.end-s.start+s.hold,0);if(Math.abs(frames-expectedFrames)>2)throw Error(id+': reading holds not encoded at the intended cadence: '+frames+' vs '+expectedFrames);
 index.chapters[id]={fingerprint,file:path.relative(root,file).replaceAll('\\','/'),rawRecording:r.file,audioSha256:meta.sha256,sourceFrames:frames,anchors,segments:expanded,cuts,unresolved,reviewedOverride:manual?'script/reviewed-edits.json':null,motion:'Original recorded movement at 1x; intentional rest holds aligned to acoustic voice cues'};fs.writeFileSync(indexFile,JSON.stringify(index,null,2));console.log('EDITED',id,(frames/60).toFixed(2)+'s',anchors.length,'voice anchors',unresolved.length,'unresolved');
}
