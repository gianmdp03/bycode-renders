from pathlib import Path
import json,ssl,sys,urllib.request,urllib.error
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'demo'))
from runtime import verify,ROOT,LOCAL,ORIGIN,write
results=[]
def check(name,fn):
 try:
  result=fn();results.append({'name':name,'status':'PASS','detail':result});print('PASS',name)
 except Exception as e:results.append({'name':name,'status':'FAIL','detail':type(e).__name__});print('FAIL',name)
context=ssl.create_default_context(cafile=str(LOCAL/'certs/ca.pem'))
def get(url):
 with urllib.request.urlopen(url,context=context,timeout=8) as r:return {'status':r.status}
check('owned-container-identities',lambda: bool(verify()))
check('real-auth-health',lambda:get(ORIGIN+'/auth/v1/health'))
check('real-auth-jwks',lambda:get(ORIGIN+'/auth/v1/.well-known/jwks.json'))
check('real-billing-limits',lambda:get(ORIGIN+'/api/billing/limits/DOCTORCHART'))
check('real-frontend',lambda:get('http://localhost:24202/login'))
def private_guards():
 try:get(ORIGIN+'/api/doctorchart/patients')
 except urllib.error.HTTPError as e:
  if e.code in [401,403]:return {'unauthenticated_status':e.code}
 raise RuntimeError('Private route was not protected')
check('gateway-rejects-unauthenticated',private_guards)
if (LOCAL/'accounts.json').exists():
 from seed import api,login
 accounts=json.loads((LOCAL/'accounts.json').read_text())
 check('B-login-and-workspace',lambda:{'completed':api('GET','/workspace',token=login(accounts['B']))['onboardingCompleted']})
 check('B-directory-data',lambda:{'retrieved_count':len(api('GET','/patients?page=0&size=10&filter=ALL',token=login(accounts['B']))['content'])})
write(ROOT/'qa/preflight.json',{'results':results,'status':'PASS' if all(r['status']=='PASS' for r in results) else 'FAIL'})
sys.exit(0 if all(r['status']=='PASS' for r in results) else 1)
