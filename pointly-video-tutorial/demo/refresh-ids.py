"""Refresh display metadata from the real DEMO APIs; no data mutation."""
from seed import *
verify();ids=json.loads((LOCAL/'seed-ids.json').read_text(encoding='utf8'));data=json.loads((LOCAL/'accounts.json').read_text(encoding='utf8'));t=login(data['B'])
cid=ids['company'];company=api('GET',f'/companies/{cid}',token=t)
ids['publicName']=company['publicName'];ids['rewards']=api('GET',f'/rewards/{cid}?size=100',token=t)['content'];ids['clients']=api('GET',f'/companies/{cid}/clients?size=100&status=ALL',token=t)['content']
write(LOCAL/'seed-ids.json',ids);print('Display metadata refreshed from authenticated real APIs, without changing records.')
