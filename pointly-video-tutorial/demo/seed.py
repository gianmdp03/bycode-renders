"""Fictitious demo data via unchanged real APIs; isolated DB ownership verified."""
from runtime import ROOT,LOCAL,ORIGIN,verify,write,run
import json,secrets,ssl,http.client,datetime as dt,time
CTX=ssl.create_default_context(cafile=str(LOCAL/'certs/ca.pem'))
PRIVATE=json.loads((LOCAL/'auth-private.json').read_text())
def request(method,route,body=None,token=None,extra=None):
 if not route.startswith(('/api/','/auth/v1/')):raise ValueError('Non-demo route')
 c=http.client.HTTPSConnection('localhost',25443,context=CTX,timeout=90)
 h={'Content-Type':'application/json','apikey':PRIVATE['anon']}
 if token:h['Authorization']='Bearer '+token
 if extra:h.update(extra)
 c.request(method,route,json.dumps(body,ensure_ascii=False).encode() if body is not None else None,h)
 r=c.getresponse();payload=r.read();c.close()
 if r.status>=400:
  write(LOCAL/'logs/last-api-error.json',{'route':route,'status':r.status,'body':payload.decode(errors='replace')})
  raise RuntimeError(f'{method} {route}: HTTP {r.status}; private diagnostic saved')
 return json.loads(payload) if payload else None
def login(a):return request('POST','/auth/v1/token?grant_type=password',{'email':a['email'],'password':a['password']})['access_token']
def api(method,route,body=None,token=None,key=None):
 return request(method,'/api/pointly'+route,body,token,{'X-Request-ID':'pointly-idem:'+key} if key else None)
def accounts():
 verify();f=LOCAL/'accounts.json';data=json.loads(f.read_text()) if f.exists() else {}
 for key,role,label in [('ADMIN','SUPER_ADMIN','Administración DEMO'),('A','COMPANY','Comerciante Inicio DEMO'),('B','COMPANY','Lucía Comercio DEMO'),('NO_PLAN','COMPANY','Comercio sin plan DEMO')]:
  if key not in data:data[key]={'email':key.lower()+'@pointly-demo.test','password':secrets.token_urlsafe(24),'label':label};write(f,data)
  a=data[key]
  if not a.get('id'):
   users=request('GET','/auth/v1/admin/users?page=1&per_page=100',token=PRIVATE['service_role'])['users']
   u=next((u for u in users if u.get('email')==a['email']),None)
   if u is None:u=request('POST','/auth/v1/admin/users',{'email':a['email'],'password':a['password'],'email_confirm':True,'app_metadata':{'role':role},'user_metadata':{'name':label,**({'dni':'99000101'} if key!='A' else {})}},PRIVATE['service_role'])
   a['id']=u['id'];write(f,data)
 admin=login(data['ADMIN'])
 for key in ['A','B']:
  u=request('GET','/auth/v1/admin/users/'+data[key]['id'],token=PRIVATE['service_role'])
  if u.get('app_metadata',{}).get('app_modules',{}).get('pointly',{}).get('active'):continue
  grant={'userId':data[key]['id'],'module':'POINTLY','tier':'PRO','days':60,'reason':'Entorno ficticio local del videotutorial. Sin pago real.'}
  p=request('POST','/api/billing/admin/subscription-grants/preview',grant,admin)
  r=request('POST','/api/billing/admin/subscription-grants',{**grant,'previewToken':p['previewToken'],'conversionConfirmed':p['conversionRequired']},admin,{'Idempotency-Key':'pointly-tutorial-grant-'+key})
  if r['state']!='done':raise RuntimeError('Billing grant unconfirmed')
 return data
def seed():
 data=accounts();t=login(data['B']);old=api('GET','/companies/my-companies',token=t)['content']
 company=next((c for c in old if c['name']=='Café del Puerto DEMO'),None)
 if company is None:
  company=api('POST','/companies',{'name':'Café del Puerto DEMO','publicName':'cafe-del-puerto-demo','companyDetails':{'country':'Argentina','province':'Buenos Aires','city':'Mar del Plata','address':'Paseo Ficticio 123','zipCode':'7600'},'amountStep':1000,'pointsPerStep':10,'isPointsExpirationEnabled':True,'pointsExpirationDays':90},t)
 cid=company['id'];names=['Ana Torres','Bruno Díaz','Carla López','Diego Ruiz','Elena Soto','Facundo Vega','Gabriela Luna','Hugo Paz','Inés Roca','Julián Costa','Lara Gil','Marcos León','Nadia Sol','Omar Ríos','Paula Vidal','Ramiro Cruz','Sofía Rey','Tomás Arias','Valeria Lago','Walter Mena','Ximena Luz','Yago Serra','Zoe Ponce','Amelia del Mar']
 rows=api('GET',f'/companies/{cid}/clients?size=100&status=ALL',token=t)['content'];clients=[]
 for i,n in enumerate(names):
  dni=str(99010001+i);acc=next((a for a in rows if a['client']['dni']==dni),None)
  if not acc:acc=api('POST','/points-accounts',{'companyId':cid,'country':'Argentina','dni':dni,'name':n+' DEMO',**({'email':f'cliente{i+1}@example.invalid','phone':'+5492235550101'} if i<4 else {})},t)
  clients.append(acc)
  for j in range(3 if i<4 else 1):
   api('POST','/sales',{'companyId':cid,'country':'Argentina','dni':dni,'amount':[8500,12000,6500][j%3]+i*1000},t,f'demo-seed-sale-{i}-{j}-v1')
 products=api('GET',f'/products/{cid}?size=100',token=t)['content']
 for n,d,p in [('Café doble','Preparación de café de especialidad',3500),('Desayuno del puerto','Café con dos medialunas',6500),('Tostado artesanal','Pan de campo con queso',5500)]:
  if not any(x['name']==n for x in products):api('POST','/products',{'companyId':cid,'name':n,'description':d,'price':p},t)
 rewards=api('GET',f'/rewards/{cid}?size=100',token=t)['content']
 for n,cost,benefit in [('Café de regalo',80,{'kind':'PHYSICAL'}),('Voucher 10 por ciento',120,{'kind':'VOUCHER','voucherType':'PERCENTAGE','voucherValue':10}),('Voucher 2000 pesos',180,{'kind':'VOUCHER','voucherType':'AMOUNT','voucherValue':2000})]:
  if not any(x['name']==n for x in rewards):api('POST','/rewards',{'companyId':cid,'name':n,'description':'Beneficio de demostración, coordiná la entrega en el comercio.','costInPoints':cost,**benefit},t)
 rewards=api('GET',f'/rewards/{cid}?size=100',token=t)['content'];rid=next(r['id'] for r in rewards if r['name']=='Café de regalo')
 api('POST','/rewards/redeem',{'companyId':cid,'rewardId':rid,'country':'Argentina','dni':'99010001'},t,'demo-seed-redeem-v1')
 # Dates are initial fixture preparation, never represented as a user capability.
 # The sales and ledger amounts were generated transactionally by the real API.
 cfg=verify();db=cfg['resources']['db']
 sql=f"""BEGIN;
 DO $$ BEGIN IF current_database()<>'tutorial_pointly_demo' THEN RAISE EXCEPTION 'Wrong DEMO database'; END IF; END $$;
 UPDATE sales SET created_at=now() - ((id % 50)+1)*interval '1 day' WHERE company_id={cid};
 UPDATE points_accounts SET last_activity_date=now()-interval '45 days' WHERE company_id={cid} AND client_id IN (SELECT id FROM clients WHERE dni IN ('99010002','99010003','99010004'));
 COMMIT;"""
 run(['docker','exec','-i',db,'psql','-U','tutorial_demo','-d','tutorial_pointly_demo','-v','ON_ERROR_STOP=1','-q'],input=sql.encode())
 write(LOCAL/'seed-ids.json',{'company':cid,'publicName':company['publicName'],'clients':clients,'rewards':rewards})
 write(ROOT/'demo/seed-report.json',{'status':'API_VALIDATED','company':'Café del Puerto DEMO','clients':len(clients),'sales':32,'rewardTypes':['PHYSICAL','VOUCHER/PERCENTAGE','VOUCHER/AMOUNT'],'realAuthBillingGatewayPointly':True,'emailProviderDisabled':True,'externalRequests':False,'fixtureDating':'Owned DEMO sales and three inactivity timestamps only; never taught as product action.','stateA':'New merchant, no company, missing DNI.','stateB':'Configured cafe; 24 clients; purchases and redemption persisted via real APIs.'})
 print('Real API seed complete:',len(clients),'clients. No external operations.')
if __name__=='__main__':seed()
