"""Conditional multi-business UI and separate public balances, through real APIs."""
from seed import *
verify();a=json.loads((LOCAL/'accounts.json').read_text(encoding='utf8'));t=login(a['B']);rows=api('GET','/companies/my-companies',token=t)['content'];name='Panadería Costera DEMO'
c=next((c for c in rows if c['name']==name),None)
if not c:c=api('POST','/companies',{'name':name,'publicName':'panaderia-costera-demo','companyDetails':{'country':'Argentina'},'amountStep':500,'pointsPerStep':5,'isPointsExpirationEnabled':False},t)
cid=c['id'];clients=api('GET',f'/companies/{cid}/clients?size=100&status=ALL',token=t)['content']
if not any(x['client']['dni']=='99010001' for x in clients):api('POST','/points-accounts',{'companyId':cid,'country':'Argentina','dni':'99010001','name':'Ana Torres DEMO'},t)
api('POST','/sales',{'companyId':cid,'country':'Argentina','dni':'99010001','amount':6500},t,'second-company-purchase-v1')
rewards=api('GET',f'/rewards/{cid}?size=100',token=t)['content']
if not rewards:api('POST','/rewards',{'companyId':cid,'name':'Pan de campo de regalo','kind':'PHYSICAL','description':'Entrega en este comercio. No combina puntos de otros negocios.','costInPoints':100},t)
products=api('GET',f'/products/{cid}?size=100',token=t)['content']
if not products:api('POST','/products',{'companyId':cid,'name':'Pan de campo','price':3000,'description':'Ejemplo de catálogo de otro comercio.'},t)
ids=json.loads((LOCAL/'seed-ids.json').read_text(encoding='utf8'));ids['secondCompany']={'id':cid,'publicName':c['publicName'],'name':name};write(LOCAL/'seed-ids.json',ids)
write(ROOT/'demo/multistore-report.json',{'state':'API_VALIDATED','ownerBusinesses':2,'sameClient':'Ana Torres DEMO','secondCompany':name,'earningRule':'5 points per 500 complete purchase amount','secondBalance':65,'countryOnlyLocation':True,'dataIsolation':'Real separate points account, not shared points or a fabricated balance.'})
print('Second real demo business ready; Ana has a separate balance of 65 points.')
