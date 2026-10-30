import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {pathToFileURL, fileURLToPath} from 'node:url';

export const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const repos=path.resolve(root,'../..');
const front=path.join(repos,'doctorchart-frontend');
const back=path.join(repos,'doctorchart-backend-go');
const require=createRequire(path.join(front,'package.json'));
const ts=require('typescript');
const {parseTemplate}=await import(pathToFileURL(path.join(front,'node_modules/@angular/compiler/fesm2022/compiler.mjs')));
const slash=p=>p.replaceAll('\\','/');
const read=p=>fs.readFileSync(p,'utf8');
const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]);
const relative=p=>slash(path.relative(front,p));
const sources=walk(path.join(front,'src/app')).filter(p=>p.endsWith('.ts')&&!p.endsWith('.spec.ts'));
const templates=[]; const controls=[]; const fields=[];
for(const owner of sources){
 const ast=ts.createSourceFile(owner,read(owner),ts.ScriptTarget.Latest,true);
 const visit=n=>{
  if(ts.isPropertyAssignment(n)&&['template','templateUrl'].includes(n.name.getText(ast))&&ts.isStringLiteralLike(n.initializer)){
   const external=n.name.getText(ast)==='templateUrl';
   const file=external?path.resolve(path.dirname(owner),n.initializer.text):owner;
   templates.push({owner,file,text:external?read(file):n.initializer.text,base:external?0:ast.getLineAndCharacterOfPosition(n.initializer.getStart()).line});
  } ts.forEachChild(n,visit);
 };visit(ast);
}
for(const t of templates){
 const parsed=parseTemplate(t.text,t.file,{preserveWhitespaces:false});
 if(parsed.errors?.length)throw Error(relative(t.file)+': invalid template');
 const visit=nodes=>{for(const n of nodes??[]){
  const attrs=Object.fromEntries((n.attributes??[]).map(a=>[a.name,a.value]));
  const bindings=Object.fromEntries((n.inputs??[]).map(i=>[i.name,i.value.source]));
  const outputs=(n.outputs??[]).map(o=>({event:o.name,expression:o.handler.source}));
  const item={source_file:relative(t.file)+':'+(t.base+n.sourceSpan.start.line+1),owner:relative(t.owner),element:n.name,
   label:attrs['aria-label']||attrs.placeholder||attrs.title||n.sourceSpan.toString().replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim().slice(0,220),attrs,bindings,outputs};
  if(['button','a','summary','form'].includes(n.name)||(n.name==='input'&&['submit','button','reset'].includes(attrs.type))||outputs.some(o=>['click','triggered','ngSubmit','submit'].includes(o.event)))controls.push(item);
  else if(['input','textarea','select','app-date-picker'].includes(n.name)||outputs.some(o=>['change','input','ngModelChange','valueChange','checkedChange','selectionChange'].includes(o.event)))fields.push(item);
  visit(n.children);visit(n.branches?.flatMap(b=>b.children??[]));visit(n.cases?.flatMap(c=>c.children??[]));
  for(const k of ['empty','placeholder','loading','error'])visit(n[k]?.children);
 }};visit(parsed.nodes);
}
const routes=read(path.join(front,'src/app/app.routes.ts'));
const flags=Object.fromEntries([...read(path.join(front,'src/app/core/config/feature-flags.ts')).matchAll(/^\s*(\w+_ENABLED): (true|false)/gm)].map(m=>[m[1],m[2]==='true']));
const seed=JSON.parse(read(path.join(back,'internal/bootstrap/seed.json')));
const specialty=seed.specialties.filter(s=>s.active).map(s=>({...s,effective_navigation:s.navigation.filter(id=>id!=='CALCULATORS'||flags.CALCULATORS_ENABLED),runtime_verified:false}));
const routeFor=f=>f.includes('onboarding-wizard')||f.includes('form-field-editor')?'/onboarding/setup':f.includes('specialty-selection')?'/onboarding/select-specialty':f.includes('dashboard')?'/dashboard':f.includes('patient-list')?'/patients':f.includes('patient-form')?'/patients/new | /patients/:id/edit':f.includes('patient-record')||f.includes('encounter-modal')?'/patients/:id':f.includes('encounter-detail')?'/encounters/:id':f.includes('consultas')?'/encounters':f.includes('vaccination-calendar')?'/vaccination-calendar':f.includes('user-profile')?'/profile':f.includes('login')?'/login':f.includes('no-plan')?'/plan-required':f.includes('admin-specialties')?'/admin/specialties':f.includes('medical-calculators')?'/calculators':f.includes('ai-assistant')?'/assistant':f.includes('landing')?'/':'shared UI';
const areaFor=f=>f.includes('onboarding')||f.includes('form-field-editor')?'onboarding':f.includes('patient-growth')?'growth':f.includes('vaccin')?'vaccination':f.includes('prescription')?'prescriptions':f.includes('studies')?'studies':f.includes('patient-encounters')||f.includes('encounter')||f.includes('consultas')?'encounters':f.includes('patient-list')?'directory':f.includes('patient-form')?'patient-form':f.includes('dashboard')?'dashboard':f.includes('auth')?'access-profile':f.includes('patient-record')?'patient-record':'navigation-shared';
const rows=[...controls.map(c=>({...c,kind:'action'})),...fields.map(c=>({...c,kind:'field-control'}))].map((c,i)=>{
 const f=c.source_file;const action=c.outputs.map(o=>o.event+': '+o.expression).join('; ')||c.bindings.routerLink||c.attrs.routerLink||c.bindings.href||c.attrs.href||c.element;
 let status='PENDING',reason='',flag='';let role='doctor';
 if(f.includes('admin-specialties')){status='OUT_OF_SCOPE';reason='Sólo ROLE_SUPER_ADMIN; inventariado fuera del recorrido médico.';role='ROLE_SUPER_ADMIN';}
 else if(f.includes('landing')){status='OUT_OF_SCOPE';reason='Página comercial pública, fuera de las operaciones clínicas.';role='public';}
 else if(f.includes('no-plan')){status='OUT_OF_SCOPE';reason='Rama sin beneficio; se documenta por separado del médico con plan.';role='no-plan';}
 if(f.includes('medical-calculators')||action.includes('openCalculators')){status='DISABLED';flag='CALCULATORS_ENABLED=false';reason='Feature flag efectiva desactivada; no reactivar para grabación.';}
 if(f.includes('ai-assistant')){status='DISABLED';flag='AI_ASSISTANT_ENABLED=false';reason='Feature flag efectiva desactivada.';}
 if(action.includes('handleGoogleOAuth')){status='DISABLED';reason='Proveedor Google bloqueado por auth-policy.ts.';}
 return {feature_id:`DCV-${String(i+1).padStart(3,'0')}`,area:areaFor(f),subfuncion:c.label||action,route_or_ui:routeFor(f),source_file:f,role,specialty:role==='doctor'?'pediatrics (seed; verificar catálogo runtime)':'n/a',feature_flag:flag,available_at_runtime:'UNKNOWN',required_fixture:'isolated-real-auth-billing; A:new-workspace; B:rich-demo',scene_id:`scene-${areaFor(f)}`,planned_seconds:status==='PENDING'?(c.kind==='action'?5:4):0,recording_id:'',voice_segment:'',verified_visual_timestamp:'',status,reason_if_excluded:reason,static_evidence:c,action};
});
const write=(p,v)=>{fs.mkdirSync(path.dirname(path.join(root,p)),{recursive:true});fs.writeFileSync(path.join(root,p),typeof v==='string'?v:JSON.stringify(v,null,2)+'\n');};
write('inventory/features.json',{generated_at:new Date().toISOString(),scope:'Auditoría estática actual. No acredita ejecución ni cobertura completa.',flags,routes:[...routes.matchAll(/path: '([^']*)'/g)].map(m=>m[1]),specialties:specialty,templates:templates.length,controls:controls.length,field_controls:fields.length,features:rows});
const columns='feature_id,area,subfuncion,route_or_ui,source_file,role,specialty,feature_flag,available_at_runtime,required_fixture,scene_id,planned_seconds,recording_id,voice_segment,verified_visual_timestamp,status,reason_if_excluded'.split(',');
write('inventory/coverage-matrix.csv','\uFEFF'+[columns.join(','),...rows.map(r=>columns.map(k=>'"'+String(r[k]??'').replaceAll('"','""')+'"').join(','))].join('\n')+'\n');
const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
write('inventory/source-provenance.json',{repositories:[front,back,path.join(repos,'api-ai-gateway-go'),path.join(repos,'bycode-backend-go')].map(p=>({path:slash(p),commit:execFileSync('git',['-C',p,'rev-parse','HEAD'],{encoding:'utf8'}).trim(),status:execFileSync('git',['-C',p,'status','--porcelain'],{encoding:'utf8'}).trim()})),frontend_files:Object.fromEntries([...sources,...templates.map(t=>t.file)].filter((p,i,a)=>a.indexOf(p)===i).map(p=>[relative(p),sha(p)])),backend_seed_sha256:sha(path.join(back,'internal/bootstrap/seed.json'))});
const apiEvidence=walk(path.join(front,'src/app/core/services')).filter(p=>p.endsWith('.ts')&&!p.endsWith('.spec.ts')).flatMap(p=>read(p).split('\n').flatMap((line,i)=>/http\.(get|post|put|delete|patch)|baseUrl.*environment|fetch\(/.test(line)?[{file:relative(p),line:i+1,text:line.trim()}]:[]));
write('inventory/api-evidence.json',apiEvidence);
write('inventory/specialty-union.json',{source:'doctorchart-backend-go/internal/bootstrap/seed.json',runtime_verified:false,specialties:specialty,union_tabs:[...new Set(specialty.flatMap(s=>s.patient_record_tabs))],additional_account_C_required:false,note:'Único seed activo: Pediatría. Catálogo runtime pendiente; no crear especialidades ficticias para ampliar alcance.'});
const counts=Object.fromEntries([...new Set(rows.map(r=>r.status))].map(s=>[s,rows.filter(r=>r.status===s).length]));
write('inventory/summary.json',{templates:templates.length,controls:controls.length,field_controls:fields.length,total:rows.length,status_counts:counts,estimated_seconds:rows.reduce((s,r)=>s+r.planned_seconds,0),runtime_verified:0});
console.log(JSON.stringify({templates:templates.length,controls:controls.length,fields:fields.length,total:rows.length,counts,estimated_seconds:rows.reduce((s,r)=>s+r.planned_seconds,0)}));
