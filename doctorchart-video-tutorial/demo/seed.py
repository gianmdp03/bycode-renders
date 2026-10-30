"""Deterministic fictitious content through the real Gateway/API only."""
from runtime import ROOT, LOCAL, ORIGIN, verify, write, run
import base64, datetime as dt, json, random, secrets, ssl, urllib.request, urllib.error, sys, http.client

CTX=ssl.create_default_context(cafile=str(LOCAL/'certs/ca.pem'))
PREFIX='/api/doctorchart'
PRIVATE=json.loads((LOCAL/'auth-private.json').read_text())
CONNECTION=http.client.HTTPSConnection('localhost',24443,context=CTX,timeout=30)
def request(method,route,body=None,token=None,extra=None):
 if not route.startswith(('/api/','/auth/v1/')):raise RuntimeError('API route outside demo allowlist')
 headers={'Content-Type':'application/json','apikey':PRIVATE['anon']}
 if token:headers['Authorization']='Bearer '+token
 if extra:headers.update(extra)
 CONNECTION.request(method,route,body=json.dumps(body,ensure_ascii=False).encode() if body is not None else None,headers=headers)
 res=CONNECTION.getresponse();payload=res.read()
 if res.status>=400:
  write(LOCAL/'logs/last-api-error.json',{'route':route,'status':res.status,'body':payload.decode(errors='replace')})
  raise RuntimeError(f'{method} {route}: HTTP {res.status}; private diagnostic saved')
 return json.loads(payload) if payload else None
def login(account):
 return request('POST','/auth/v1/token?grant_type=password',{'email':account['email'],'password':account['password']})['access_token']
def api(method,route,body=None,token=None):return request(method,PREFIX+route,body,token)
def accounts():
 verify()
 file=LOCAL/'accounts.json'; data=json.loads(file.read_text()) if file.exists() else {}
 for key,role,label in [('ADMIN','SUPER_ADMIN','Administración DEMO'),('A','USER','Médica DEMO Inicio'),('B','USER','Médica DEMO Pediatría'),('NO_PLAN','USER','Cuenta DEMO sin plan')]:
  if key not in data:
   account={'email':key.lower()+'@doctorchart-demo.test','password':secrets.token_urlsafe(24),'label':label}
   # Persist intent first so an interrupted request cannot lose credentials.
   data[key]=account;write(file,data)
  account=data[key]
  if not account.get('id'):
   existing=request('GET','/auth/v1/admin/users?page=1&per_page=100',token=PRIVATE['service_role'])
   user=next((u for u in existing['users'] if u.get('email')==account['email']),None)
   if user is None:user=request('POST','/auth/v1/admin/users',{'email':account['email'],'password':account['password'],'email_confirm':True,'app_metadata':{'role':role},'user_metadata':{'full_name':label,'first_name':'Médica DEMO','last_name':key,'license':'DEMO - sin validez profesional'}},PRIVATE['service_role'])
   account['id']=user['id'];write(file,data)
 admin=login(data['ADMIN'])
 for key in ['A','B']:
  user=request('GET','/auth/v1/admin/users/'+data[key]['id'],token=PRIVATE['service_role'])
  benefit=user.get('app_metadata',{}).get('app_modules',{}).get('doctorchart',{})
  if benefit.get('active') is True:continue
  grant={'userId':data[key]['id'],'module':'DOCTORCHART','tier':'PRO','days':60,'reason':'Datos ficticios DEMO: producción local del videotutorial, sin pago ni servicio real.'}
  preview=request('POST','/api/billing/admin/subscription-grants/preview',grant,admin)
  result=request('POST','/api/billing/admin/subscription-grants',{**grant,'previewToken':preview['previewToken'],'conversionConfirmed':preview['conversionRequired']},admin,{'Idempotency-Key':'doctorchart-tutorial-demo-grant-'+key})
  if result['state']!='done':raise RuntimeError('Billing grant was not confirmed')
 write(ROOT/'demo/accounts-report.json',{'accounts':[{k:v for k,v in a.items() if k in ['label','email']} for a in data.values()],'access':'A/B granted PRO by real Billing admin workflow; NO_PLAN has no grant','secrets':'Only .local/accounts.json; never film password visibility.'})
 print('Four DEMO accounts; A/B genuine Billing PRO grants; no purchases.');return data
def seed():
 data=accounts(); token=login(data['B']);rng=random.Random(20261029)
 catalog=api('GET','/specialties',token=token)
 write(ROOT/'inventory/runtime-specialties.json',catalog)
 pediatrics=next(s for s in catalog if s['code']=='pediatrics')
 workspace=api('GET','/workspace',token=token)
 if workspace is None:workspace=api('PUT','/workspace/specialty',{'specialtyId':pediatrics['id'],'expectedVersion':None},token)
 if not workspace['onboardingCompleted']:workspace=api('POST','/workspace/finish-onboarding',{'expectedVersion':workspace['version']},token)
 write(LOCAL/'workspace-B.json',workspace)
 rows=api('GET','/patients?page=0&size=100&filter=ALL',token=token)['content']
 patient_ids=[];encounter_ids=[];historical=[]
 today=dt.date(2026,10,29)
 for i in range(40):
  first=f'Persona DEMO {i+1:02}';last='Tutorial Ficticio'
  age_months=[2,6,14,24,42,66,96,144][i%8]+(i//8)*3
  birth=today-dt.timedelta(days=round(age_months*30.4375))
  values={'sys_firstName':first,'sys_lastName':last,'sys_dni':str(99000000+i+1),'sys_dob':birth.isoformat(),'sys_sex':'FEMALE' if i%2==0 else 'MALE','sys_phone':f'555000{i+1:04}','sys_email':f'paciente-demo-{i+1:02}@example.invalid','address':'Domicilio ficticio de demostración','nationality':'DEMO','paternalDiseases':'Sin datos clínicos reales. Caso ficticio.','maternalDiseases':'Información sintética para tutorial.','motherFullName':f'Tutora DEMO {i+1:02}','fatherFullName':f'Tutor DEMO {i+1:02}','hasSiblings':i%2==0}
  existing=next((p for p in rows if p['fullName']==first+' '+last),None)
  patient=api('GET','/patients/'+str(existing['id']),token=token) if existing else api('POST','/patients',{'workspaceVersion':workspace['version'],'values':values},token)
  pid=patient['id'];patient_ids.append(pid)
  previous=api('GET',f'/encounters/patient/{pid}',token=token)
  n=8 if i<8 else 2
  for j in range(n):
   marker=f'DEMO-{i+1:02}-{j+1:02}: control ficticio para tutorial'
   date=today-dt.timedelta(days=(n-1-j)*(7 if age_months<12 else 29)+(i%4))
   months=max(0.2,(date-birth).days/30.4375)
   weight=round((3.4+months*.55 if months<12 else 8.8+months*.18)+rng.uniform(-.12,.12),2)
   height=round((50+months*1.9 if months<12 else 70+months*.52)+rng.uniform(-.2,.2),1)
   clinical={'chiefComplaint':marker,'presentIllness':'Caso completamente ficticio. Demostración de registro longitudinal, sin indicación clínica.','weightKg':weight,'heightCm':height,'physicalExam':'Texto sintético, no corresponde a una persona ni evaluación real.','meetsMilestones':True,'milestoneNotes':'Dato ficticio de demostración.','diagnosis':'Control de demostración, sin valor diagnóstico.','treatment':'Ejemplo de documentación. No constituye una recomendación médica.'}
   if months<24:clinical['headCircumferenceCm']=round(min(49,34+months*.65),1)
   if j==n-1:clinical['followUpDate']=(today+dt.timedelta(days=i%12+1)).isoformat()
   kind='FIRST_VISIT' if j==0 else ['FOLLOW_UP','ROUTINE_CHECKUP','INTERCONSULTATION'][j%3]
   old=next((e for e in previous if e.get('chiefComplaint')==marker),None)
   encounter=api('GET',f'/encounters/{old["id"]}',token=token) if old else api('POST','/encounters',{'patientId':pid,'workspaceVersion':workspace['version'],'consultationType':kind,'values':clinical},token)
   historical.append({'id':encounter['id'],'patient_id':pid,'owner':data['B']['id'],'marker':marker,'instant':date.isoformat()+'T10:00:00-03:00','kind':kind})
   encounter_ids.append(encounter['id'])
  if i<8:
   schedule=api('GET',f'/patients/{pid}/vaccinations',token=token)
   for dose in schedule['doses'][:2]:
    if dose['status']=='APLICADA':continue
    result=api('PUT',f'/patients/{pid}/vaccinations/{dose["id"]}',{'expectedVersion':schedule['patientVersion'],'calendarId':schedule['calendarId'],'applied':True,'appliedAt':max(birth,date).isoformat()},token)
    schedule=result['schedule']
  print(f'DEMO {i+1:02}/40: patient and {n} encounters retrieved from API.',flush=True)
 # The real API deliberately assigns immutable creation timestamps. Initial
 # historical fixtures therefore require scoped data SQL, never a UI feature.
 # All FK/snapshot/values are first created by the real API. After dating the
 # fixture rows, a normal API update rebuilds formulaContext from their date.
 owner=verify();db=owner['resources']['db']
 encoded=base64.b64encode(json.dumps(historical).encode()).decode()
 sql=f"""BEGIN;
CREATE TEMP TABLE demo_history AS SELECT * FROM jsonb_to_recordset(convert_from(decode('{encoded}','base64'),'UTF8')::jsonb) AS x(id bigint,patient_id bigint,owner text,marker text,instant timestamptz,kind text);
DO $$ BEGIN IF (SELECT current_database()) <> 'tutorial_clinical_demo' THEN RAISE EXCEPTION 'Not DEMO database'; END IF;
IF (SELECT count(*) FROM demo_history h JOIN public.clinical_encounters e ON e.id=h.id AND e.patient_id=h.patient_id AND e.chief_complaint=h.marker JOIN public.patients p ON p.id=e.patient_id AND p.user_id=h.owner WHERE p.full_name LIKE 'Persona DEMO % Tutorial Ficticio') <> (SELECT count(*) FROM demo_history) THEN RAISE EXCEPTION 'DEMO row identity mismatch'; END IF; END $$;
UPDATE public.clinical_encounters e SET encounter_date=h.instant FROM demo_history h WHERE e.id=h.id;
COMMIT;"""
 run(['docker','exec','-i',db,'psql','-U','tutorial_demo','-d','tutorial_clinical_demo','-v','ON_ERROR_STOP=1','-q'],input=sql.encode())
 for h in historical:
  e=api('GET',f'/encounters/{h["id"]}',token=token)
  api('PUT',f'/encounters/{h["id"]}',{'expectedVersion':e['version'],'consultationType':h['kind'],'values':e['formValues']},token)
 api('PUT','/workspace/quick-notes',{'content':'DEMO · Datos ficticios de demostración.\nRevisar seguimientos y documentación antes de cerrar la jornada.'},token)
 for typ in ['PRESCRIPTION','STUDY_ORDERS']:
  saved=api('GET',f'/patients/{patient_ids[0]}/prescriptions',token=token)
  if not any(p['diagnosisDescription']=='DEMO · Documento sin validez clínica' and p['type']==typ for p in saved):
   api('POST',f'/patients/{patient_ids[0]}/prescriptions',{'type':typ,'diagnosisDescription':'DEMO · Documento sin validez clínica','generalInstructions':'Contenido ficticio para demostrar el registro y la impresión. No utilizar para atención.','prescriptions':[{'medicationName':'PREPARADO DEMO · NO ADMINISTRAR','dosage':'Sin dosis clínica','administrationRoute':'Ejemplo ficticio','frequency':'No utilizar','instructions':'Documento de demostración sin validez médica.'}] if typ=='PRESCRIPTION' else [],'diagnosticOrders':['Estudio ficticio de demostración'] if typ=='STUDY_ORDERS' else []},token)
 dashboard=api('GET','/encounters/dashboard',token=token)
 write(LOCAL/'seed-ids.json',{'patients':patient_ids,'encounters':encounter_ids})
 write(ROOT/'demo/seed-report.json',{'status':'PASS','rng_seed':20261029,'reference_date':today.isoformat(),'patient_count':len(patient_ids),'encounter_count':len(encounter_ids),'longitudinal_patients':8,'measurements_per_longitudinal_patient':8,'historical_fixture_exception':'Scoped initial-data SQL only for immutable encounter_date; normal API update regenerates formulaContext. Never presented as a UI capability.','retrieved_via_real_gateway':True,'dashboard':dashboard,'browser_verified':False,'clinical_disclaimer':'Dataset sintético sin valor diagnóstico ni terapéutico.','account_A_new_workspace':api('GET','/workspace',token=login(data['A'])) is None})
 print('Seed complete: 40 patients and 128 encounters. Browser verification remains required.')
if __name__=='__main__':
 try:seed() if len(sys.argv)==1 or sys.argv[1]=='seed' else accounts()
 except Exception as e:print(str(e),file=sys.stderr);sys.exit(1)
