from seed import *
verify();ids=json.loads((LOCAL/'seed-ids.json').read_text(encoding='utf8'));t=login(json.loads((LOCAL/'accounts.json').read_text(encoding='utf8'))['B']);rows=api('GET',f"/companies/{ids['company']}/clients?size=100&status=ALL",token=t)['content'];bruno=next(a for a in rows if a['client']['dni']=='99010002')
if bruno['membershipStatus']=='ARCHIVED':api('POST',f"/points-accounts/{ids['company']}/{bruno['id']}/reactivate",{},t);print('DEMO Bruno reactivated with real API before new archival take.')
else:print('DEMO Bruno already active; no change.')
