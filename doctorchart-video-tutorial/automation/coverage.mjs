import fs from 'node:fs';import path from 'node:path';import {root} from './browser.mjs';
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const data=read('inventory/features.json'),manifest=read('recordings/manifest.json'),story=read('script/storyboard.json');
const timeline=fs.existsSync(path.join(root,'remotion/src/timeline.json'))?read('remotion/src/timeline.json'):{scenes:[]};
const links=read('inventory/coverage-links.json');
const excluded={
 27:'El vínculo remite al registro en Bycode; operación externa inventariada por separado. Se explica el destino sin simular el registro.',
 28:'Recuperación de acceso en Bycode; flujo externo al frontend clínico.',
 183:'Rama else-if de otra especialidad con curvas, no publicada en el catálogo runtime de sólo Pediatría.',184:'Rama else-if de otra especialidad, no publicada.',185:'Duplicado de vacunación en rama de otra especialidad no publicada.',186:'Rama sin Pediatría/curvas, no publicada en el catálogo actual.',187:'Rama sin Pediatría/curvas, no publicada en el catálogo actual.',
 189:'Presentación móvil; oculta por CSS en el alcance de escritorio 1920×1080. La acción equivalente existe en la tabla.',190:'Presentación móvil oculta en 1920×1080.',191:'Presentación móvil oculta; se cubre el equivalente en la tabla de escritorio.',
 253:'Referencia de la presentación móvil del calendario; oculta a 1920×1080.',
 260:'Salida a Bycode, fuera de las operaciones clínicas; no se simula el destino.',264:'Edición central de perfil en Bycode, fuera del servicio DoctorChart.',265:'Planes y pagos en Bycode/Billing; inventario externo, no compra ni pago durante el tutorial.',
 160:'Rama defensiva sin acceso por navegación normal: loadInitial redirige currentStepKey=specialty a select-specialty antes de montar ese contenido. El acceso real al paso de especialidad se muestra en el capítulo 21.',
 263:'Contenedor del menú con stopPropagation; no constituye una función independiente. Sus controles reales de perfil, personalización y cierre de sesión tienen filas propias.',
 277:'Aviso de impresión en la rama de onboarding incompleto. Los guards impiden acceder a documentos antes de completar la configuración; la rama médica efectiva se muestra con DCV-279.',
 269:'MainNavComponent no se monta en el shell actual (sin consumidores de app-main-nav).',270:'MainNavComponent no se monta en el shell actual.',271:'PatientQuickBannerComponent no se monta en el shell actual (sin consumidores).',273:'PatientQuickBannerComponent no se monta en el shell actual.',
 274:'Banner de documentos en la rama de superadministración, fuera del rol médico.',281:'Navegación exclusiva de ROLE_SUPER_ADMIN.',284:'Página pública 404, fuera de las operaciones clínicas del médico.',
 348:'Selector móvil de gráficos; a 1920×1080 se muestran las pestañas equivalentes.',366:'Selector móvil por edad del calendario; oculto a 1920×1080.'
};
const matches=[];const invalid=[];
const blocked={71:'El guard exige workspace completo y definición antes de montar este formulario; loadForm usa la copia ya cargada. No se fuerza un estado interno inválido para hacer aparecer el botón.',154:'El fallo inicial de workspace se captura en el guard/shell antes del wizard; una vez cargado, loadInitial utiliza la copia del store. Se acredita el reintento real del shell y se conserva esta rama defensiva como no reproducida.'};
for(const feature of data.features){
 const n=Number(feature.feature_id.slice(4));
 if([272,278].includes(n)){feature.status='DISABLED';feature.feature_flag=n===272?'CALCULATORS_ENABLED=false':'AI_ASSISTANT_ENABLED=false';feature.available_at_runtime=false;feature.reason_if_excluded='Flag efectiva del checkout desactivada; no se habilita para la grabación.';continue;}
 if(excluded[n]){feature.status='OUT_OF_SCOPE';feature.available_at_runtime=false;feature.reason_if_excluded=excluded[n];continue;}
 if(blocked[n]){feature.status='BLOCKED';feature.available_at_runtime='NOT_REPRODUCED';feature.reason_if_excluded=blocked[n];continue;}
 if(['DISABLED','OUT_OF_SCOPE'].includes(feature.status))continue;
 const beatId=Object.keys(links).find(id=>links[id].includes(n));
 feature.status='PENDING';feature.available_at_runtime='UNKNOWN';feature.recording_id='';feature.voice_segment='';feature.verified_visual_timestamp='';
 if(!beatId)continue;
 const chapter=story.find(c=>c.beats.some(b=>b.id===beatId));
 if(!chapter){invalid.push({feature:feature.feature_id,beatId,error:'Missing storyboard beat'});continue;}
 feature.scene_id=chapter.id;feature.planned_seconds=chapter.beats.find(b=>b.id===beatId).minSeconds;
 const recording=manifest.recordings.find(r=>r.scene_id===chapter.id&&['CAPTURED','EXPLAINED','VERIFIED'].includes(r.status));
 const beat=recording?.beats.find(b=>b.id===beatId&&b.result==='PASS');
 if(!beat)continue;
 const visual=path.join(root,beat.screenshot);const audio=path.join(root,'audio',beatId+'.wav');
 if(!fs.existsSync(visual)||!fs.existsSync(audio)){invalid.push({feature:feature.feature_id,beatId,error:'Missing evidence or actual audio'});continue;}
 feature.status='CAPTURED';feature.available_at_runtime=true;feature.recording_id=recording.recording_id;feature.voice_segment=beatId;
 const timelineScene=timeline.scenes.find(s=>s.id===chapter.id),timelineBeat=timelineScene?.beats.find(b=>b.id===beatId);
 feature.evidence={screenshot:beat.screenshot,source_action_interval_frames:[beat.sourceStart,beat.sourceEnd],narration_audio:'audio/'+beatId+'.wav',timeline_start_seconds:timelineBeat?(timelineScene.startFrame+timelineBeat.from)/60:null,review:'Capture and audible segment exist; visual/audio review still required for VERIFIED.'};
 matches.push({feature_id:feature.feature_id,beatId,scene_id:chapter.id,in_timeline:!!timelineBeat});
}
const columns='feature_id,area,subfuncion,route_or_ui,source_file,role,specialty,feature_flag,available_at_runtime,required_fixture,scene_id,planned_seconds,recording_id,voice_segment,verified_visual_timestamp,status,reason_if_excluded'.split(',');
fs.writeFileSync(path.join(root,'inventory/features.json'),JSON.stringify(data,null,2));
fs.writeFileSync(path.join(root,'inventory/coverage-matrix.csv'),'\uFEFF'+[columns.join(','),...data.features.map(f=>columns.map(k=>'"'+String(f[k]??'').replaceAll('"','""')+'"').join(','))].join('\n')+'\n');
const counts=Object.fromEntries([...new Set(data.features.map(r=>r.status))].map(s=>[s,data.features.filter(r=>r.status===s).length]));
const report={status:invalid.length?'FAIL':counts.PENDING?'PASS_WITH_PENDING_COVERAGE':counts.BLOCKED?'PASS_WITH_BLOCKED_BRANCHES':'CAPTURED_PENDING_REVIEW',full_coverage:false,status_counts:counts,invalid_links:invalid,matched_evidence:matches,uncovered:data.features.filter(f=>f.status==='PENDING').map(({feature_id,area,subfuncion,source_file,action})=>({feature_id,area,subfuncion,source_file,action})),blocked:data.features.filter(f=>f.status==='BLOCKED').map(({feature_id,subfuncion,source_file,reason_if_excluded})=>({feature_id,subfuncion,source_file,reason:reason_if_excluded})),captured_chapters:manifest.recordings.filter(r=>!r.scene_id.startsWith('qa-')).length,storyboard_chapters:story.length,timeline_chapters:timeline.scenes.length,acceptance:'No row is marked VERIFIED merely because a test, screenshot or audio file exists. Every pending function remains explicit.'};
fs.writeFileSync(path.join(root,'qa/coverage-report.json'),JSON.stringify(report,null,2));
fs.writeFileSync(path.join(root,'inventory/remaining-coverage.md'),'# Cobertura pendiente o no reproducida\n\n'+(report.uncovered.length?report.uncovered.map(f=>`- PENDING ${f.feature_id}: ${f.subfuncion.replace(/\s+/g,' ')} · ${f.source_file}`).join('\n'):'No quedan filas PENDING.\n')+'\n\n'+report.blocked.map(f=>`- BLOCKED ${f.feature_id}: ${f.subfuncion} · ${f.source_file}\n  ${f.reason}`).join('\n')+'\n');
console.log(JSON.stringify({counts,invalidLinks:invalid.length,fullCoverage:false}));
if(invalid.length)process.exitCode=1;
