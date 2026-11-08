// Reconcile recorded workflows against the actual reviewed export, without
// claiming that every conditional duplicate button was independently exercised.
import fs from 'node:fs';
import path from 'node:path';
import {root} from './browser.mjs';
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const write=(p,v)=>fs.writeFileSync(path.join(root,p),typeof v==='string'?v:JSON.stringify(v,null,2)+'\n');
const video=read('qa/final-video-verification.json'),visual=read('qa/visual-review.json');
if(video.completeDecode!=='PASS'||visual.state!=='PASS'||visual.videoSha256!==video.sha256)throw Error('Review the current rendered export before finalizing coverage.');
const timeline=read('remotion/src/timeline.json'),features=read('inventory/coverage-features.json'),controls=read('inventory/coverage-controls.json');
const audio=read('qa/audio-input-verification.json'),demo=read('qa/demo-verification.json');
if(audio.state!=='PASS'||demo.status!=='PASS'||read('qa/source-drift-files.json').length)throw Error('Audio, DEMO or source gate failed');
const stamp=n=>`${Math.floor(n/60)}:${String(Math.floor(n%60)).padStart(2,'0')}`;
for(const f of features){
 const c=timeline.chapters.find(c=>c.id===f.scene),a=audio.chapters.find(a=>a.id===f.scene),proof=read(`qa/${f.scene}-evidence.json`);
 if(!c||!a||!f.frontendEvidence.length||!proof.evidence.length||!c.captions.length)throw Error('Missing evidence: '+f.id);
 f.state=f.id==='F09'?'PARTIAL_PRINT_ENVIRONMENT_LIMITATION':'DEMONSTRATED_AND_NARRATED';
 f.export={file:video.file,sha256:video.sha256,startSeconds:c.from/60,endSeconds:(c.from+c.durationInFrames)/60,timecode:stamp(c.from/60)};
 f.narration={script:'script/chapters.mjs',audio:`audio/${c.id}.wav`,sha256:a.sha256,alignment:`audio/${c.id}.alignment.json`,subtitles:'script/pointly-tutorial.srt'};
 f.validation={source:true,realCapture:proof.source,visibleResults:proof.evidence.map(e=>e.label),httpStatuses:[...new Set((proof.network??[]).map(n=>n.status))],finalFrameSamples:video.renderedFrameSamples.filter(s=>s.chapter===c.id).map(s=>s.file),review:'qa/visual-review.json'};
 if(f.id==='F09')f.validation.limitation=read('qa/print-verification.json');
 if(f.id==='F28')f.validation.additionalScene='25-expiration: actual Te alcanza and Faltan states across genuine accounts';
 if(f.id==='F31')f.validation.supplement=read('recordings/supplements.json')[0];
}
const dormant=new Set(['unmounted-legacy','legacy-unreachable','dormant-policy-or-unmounted','library-control']);
for(const c of controls.rows){
 const tier=c.component==='TabOverviewComponent'&&/Tier|tier/.test(c.action);
 if(tier){c.availability='disabled-feature-flag';c.note='LOYALTY_TIERS_ENABLED=false; no se activa para la grabación.';}
 if(tier||dormant.has(c.availability)){c.verification='EXCLUDED_WITH_REASON';continue;}
 if(!c.recordedScenes.length)throw Error('Unmapped active workflow: '+c.control);
 c.verification=c.control==='P061'?'PARTIAL_PRINT_ENVIRONMENT_LIMITATION':/Bycode|ByCodePricing|WhatsApp/.test(c.action)?'LOCAL_FLOW_SHOWN_EXTERNAL_ACTION_NOT_EXECUTED':'MAPPED_TO_DEMONSTRATED_WORKFLOW';
 c.finalSceneTimes=c.recordedScenes.map(id=>{const s=timeline.chapters.find(s=>s.id===id);return {id,startSeconds:s.from/60,endSeconds:(s.from+s.durationInFrames)/60};});
 c.validationScope='Cruce con el flujo enseñado; no afirma ejecución independiente de cada botón duplicado, cancelación o estado condicional.';
}
controls.generatedAt=new Date().toISOString();controls.review='qa/coverage-final-review.json';
write('inventory/coverage-features.json',features);write('inventory/coverage-controls.json',controls);
const esc=s=>String(s??'').replaceAll('|','\\|').replaceAll('\n',' ');
write('inventory/matriz-cobertura.md','# Matriz funcional de Pointly · cruce con el MP4 final\n\nAuditoría local: 76 plantillas, 291 controles, 34 grupos funcionales. Los 34 grupos tienen escena real y narración. La impresión conserva validación parcial; no se declara cobertura operativa total de esa dependencia. Cada grupo enlaza fuentes, toma, respuesta, audio, alineación y tiempos en `coverage-features.json`. Los controles repetidos se vinculan al flujo, sin afirmar 291 acciones independientes.\n\n| ID | Función | Evidencia frontend | Escena / inicio | Validación | Condiciones / límites |\n|---|---|---|---|---|---|\n'+features.map(f=>'| '+[f.id,f.name,f.frontendEvidence[0],f.scene+' · '+f.export.timecode,f.state,f.note].map(esc).join(' | ')+' |').join('\n')+'\n\n## Límites y exclusiones comprobados\n\n- QR: copia y PNG validados; ventana de impresión parcial en headless. No se muestra impresión vacía como éxito.\n- Bycode: se enseña el recorrido de registro, perfil y plan; no se crea una cuenta externa ni se contrata un plan.\n- Correos: configuración persistida y tres vistas previas reales; envío saliente desactivado. WhatsApp: borrador y copia, sin envío externo.\n- Instalación: guía responsive real; no se afirma instalación en Android, iOS ni en el sistema operativo local.\n- SUPER_ADMIN: vista global real; permisos de escritura contrastados con servidor, sin afirmar que toda acción global esté autorizada.\n- IA y niveles: flags desactivados. Autogestión histórica, confirmación de email, LoginModal, carrusel, Hero, WalletPreview y CheckPointsModal no montados en el recorrido vigente. `/points` redirige a Home.\n- No hay gráficos estadísticos, carrito, stock, facturación, ajustes arbitrarios de puntos ni canje público autogestionado. Los indicadores existentes sí se explican.\n- La política de vencimiento se contrasta con datos reales y fuente del servidor; no se espera el transcurso de 90 días durante la grabación.\n\nDetalle individual: `coverage-controls.json`. Pruebas de reintentos sin duplicación: `qa/12-sales-history-pending-proof.json` y `qa/20-redeem-errors-pending-proof.json`. Auditoría audiovisual: `qa/final-video-verification.json`, `qa/audio-input-verification.json` y `qa/visual-review.json`.\n');
write('qa/coverage-final-review.json',{state:'COMPLETE_RECONCILIATION_WITH_DOCUMENTED_PRINT_LIMITATION',videoSha256:video.sha256,functionalGroups:features.length,demonstratedAndNarrated:features.length,partialValidation:['F09: print popup rendering / physical printing'],individualControls:controls.controlCount,controlStates:Object.fromEntries([...new Set(controls.rows.map(c=>c.verification))].map(s=>[s,controls.rows.filter(c=>c.verification===s).length])),unmappedActiveControls:0,sourceDrift:0,scope:'Source audit, actual UI captures/HTTP outcomes, final narration and acoustically timed captions, sampled rendered-video visual review. No claim that all conditional controls or external dependencies were independently exercised.'});
console.log('Reconciled 34 narrated functional groups; print limitation retained.');
