"""Fresh DEMO identities for repeat filming; preserve all earlier identities."""
from seed import request,PRIVATE,login,api
from runtime import ROOT,LOCAL,verify,write
import json,secrets,re,sys
take=sys.argv[1] if len(sys.argv)>1 else 'native'
if not re.fullmatch(r'[a-z0-9-]{1,24}',take):raise RuntimeError('Use a short explicit filming take ID')
verify();data=json.loads((LOCAL/'accounts.json').read_text());admin=login(data['ADMIN'])
for alias,mail,label in [('A',take+'-start@doctorchart-demo.test','Médica DEMO Inicio'),('A2',take+'-draft@doctorchart-demo.test','Médica DEMO Borradores')]:
 if data.get(alias,{}).get('email')!=mail:
  data['ARCHIVE_'+alias+'_'+data[alias].get('id','unassigned')[:8]]=data[alias]
  data[alias]={'email':mail,'password':secrets.token_urlsafe(24),'label':label};write(LOCAL/'accounts.json',data)
 account=data[alias]
 if not account.get('id'):
  users=request('GET','/auth/v1/admin/users?page=1&per_page=100',token=PRIVATE['service_role'])['users'];user=next((u for u in users if u['email']==mail),None)
  if not user:user=request('POST','/auth/v1/admin/users',{'email':mail,'password':account['password'],'email_confirm':True,'app_metadata':{'role':'USER'},'user_metadata':{'full_name':label,'license':'DEMO - sin validez profesional'}},PRIVATE['service_role'])
  account['id']=user['id'];write(LOCAL/'accounts.json',data)
 user=request('GET','/auth/v1/admin/users/'+account['id'],token=PRIVATE['service_role'])
 if user.get('app_metadata',{}).get('app_modules',{}).get('doctorchart',{}).get('active') is not True:
  grant={'userId':account['id'],'module':'DOCTORCHART','tier':'PRO','days':60,'reason':'Nueva cuenta ficticia para repetir la captura con cadencia nativa, sin compra.'};preview=request('POST','/api/billing/admin/subscription-grants/preview',grant,admin)
  request('POST','/api/billing/admin/subscription-grants',{**grant,'previewToken':preview['previewToken'],'conversionConfirmed':preview['conversionRequired']},admin,{'Idempotency-Key':'tutorial-'+take+'-'+alias+'-'+account['id']})
 if api('GET','/workspace',token=login(account)) is not None:raise RuntimeError('New filming account has already progressed; do not reset it')
write(LOCAL/'manifest-before-native-retake.json',json.loads((ROOT/'recordings/manifest.json').read_text(encoding='utf8')))
print('Fresh isolated filming accounts ready; previous identities and takes retained.')
