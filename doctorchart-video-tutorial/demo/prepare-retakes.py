"""Only replenish explicitly marked local fixtures; never reset an existing account."""
from seed import api,login,request,PRIVATE
from runtime import ROOT,LOCAL,verify,write
import json,secrets
verify();data=json.loads((LOCAL/'accounts.json').read_text());token=login(data['B']);state=json.loads((LOCAL/'filming-state.json').read_text());pid=state['patientId']
p=api('GET',f'/patients/{pid}',token=token)
if p['fullName']!='Alta DEMO Tutorial Ficticio' or p['formValues']['sys_dni']!='99999001':raise RuntimeError('Unexpected scratch fixture')
history=api('GET',f'/encounters/patient/{pid}',token=token)
if any(not e.get('chiefComplaint','').startswith('DEMO ·') for e in history):raise RuntimeError('Unmarked encounter in scratch patient')
workspace=api('GET','/workspace',token=token)
while len(history)<2:
 e=api('POST','/encounters',{'patientId':pid,'workspaceVersion':workspace['version'],'consultationType':'FOLLOW_UP' if history else 'FIRST_VISIT','values':{'chiefComplaint':'DEMO · Control descartable para revisar confirmación.','weightKg':17.4,'heightCm':104.2,'presentIllness':'Registro ficticio para filmación.'}},token)
 history.append(e)
if 'A2' not in data:
 data['A2']={'email':'a2@doctorchart-demo.test','password':secrets.token_urlsafe(24),'label':'Médica DEMO Borradores'};write(LOCAL/'accounts.json',data)
a=data['A2']
if not a.get('id'):
 users=request('GET','/auth/v1/admin/users?page=1&per_page=100',token=PRIVATE['service_role'])['users'];user=next((u for u in users if u['email']==a['email']),None)
 if not user:user=request('POST','/auth/v1/admin/users',{'email':a['email'],'password':a['password'],'email_confirm':True,'app_metadata':{'role':'USER'},'user_metadata':{'full_name':a['label'],'license':'DEMO - sin validez profesional'}},PRIVATE['service_role'])
 a['id']=user['id'];write(LOCAL/'accounts.json',data)
user=request('GET','/auth/v1/admin/users/'+a['id'],token=PRIVATE['service_role'])
if user.get('app_metadata',{}).get('app_modules',{}).get('doctorchart',{}).get('active') is not True:
 admin=login(data['ADMIN']);grant={'userId':a['id'],'module':'DOCTORCHART','tier':'PRO','days':60,'reason':'Cuenta ficticia aislada para grabar borradores, sin compra.'};preview=request('POST','/api/billing/admin/subscription-grants/preview',grant,admin)
 request('POST','/api/billing/admin/subscription-grants',{**grant,'previewToken':preview['previewToken'],'conversionConfirmed':preview['conversionRequired']},admin,{'Idempotency-Key':'doctorchart-tutorial-demo-grant-A2'})
print('Marked scratch history prepared; separate real DEMO account A2 ready, existing accounts retained.')
