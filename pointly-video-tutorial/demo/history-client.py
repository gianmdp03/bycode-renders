"""A separate fictitious client with enough real movements to teach pagination."""
from seed import *
verify();ids=json.loads((LOCAL/'seed-ids.json').read_text(encoding='utf8'));cid=ids['company'];a=json.loads((LOCAL/'accounts.json').read_text(encoding='utf8'));t=login(a['B'])
rows=api('GET',f'/companies/{cid}/clients?size=100&status=ALL',token=t)['content']
client=next((x for x in rows if x['client']['dni']=='99030001'),None)
if not client:client=api('POST','/points-accounts',{'companyId':cid,'country':'Argentina','dni':'99030001','name':'Camila Historial DEMO','email':'camila@example.invalid','phone':'+5492235550102'},t)
for i in range(12):api('POST','/sales',{'companyId':cid,'country':'Argentina','dni':'99030001','amount':1000+(i%3)*500},t,f'history-client-purchase-{i}-v1')
ids['historyClient']=client['client'];write(LOCAL/'seed-ids.json',ids)
print('Separate demo client prepared with 12 real purchases for history pagination.')
