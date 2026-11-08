"""A fresh onboarding take, preserving the merchant created in earlier takes."""
from seed import *
import sys
take=next((s.split('=',1)[1] for s in sys.argv[1:] if s.startswith('--take=')),'inicio')
assert take.replace('-','').isalnum()
verify();data=json.loads((LOCAL/'accounts.json').read_text(encoding='utf8'));email='a-'+take+'@pointly-demo.test'
if data['A']['email']!=email:
 data.setdefault('A_PREVIOUS_'+take,data['A']);data['A']={'email':email,'password':secrets.token_urlsafe(24),'label':'Comerciante Inicio DEMO'};write(LOCAL/'accounts.json',data)
account=data['A']
if not account.get('id'):
 users=request('GET','/auth/v1/admin/users?page=1&per_page=100',token=PRIVATE['service_role'])['users'];u=next((u for u in users if u.get('email')==email),None)
 if not u:u=request('POST','/auth/v1/admin/users',{'email':email,'password':account['password'],'email_confirm':True,'app_metadata':{'role':'COMPANY'},'user_metadata':{'name':'Comerciante Inicio DEMO'}},PRIVATE['service_role'])
 account['id']=u['id'];write(LOCAL/'accounts.json',data)
u=request('GET','/auth/v1/admin/users/'+account['id'],token=PRIVATE['service_role'])
if not u.get('app_metadata',{}).get('app_modules',{}).get('pointly',{}).get('active'):
 admin=login(data['ADMIN']);grant={'userId':account['id'],'module':'POINTLY','tier':'PRO','days':60,'reason':'Nueva toma inicial ficticia del tutorial. Sin pago real.'};p=request('POST','/api/billing/admin/subscription-grants/preview',grant,admin);r=request('POST','/api/billing/admin/subscription-grants',{**grant,'previewToken':p['previewToken'],'conversionConfirmed':p['conversionRequired']},admin,{'Idempotency-Key':'pointly-tutorial-a-'+take+'-grant-v1'});assert r['state']=='done'
print('Fresh onboarding merchant ready; previous merchant and company preserved.')
