"""Remove only the empty patient created by this filming take, never seed rows."""
import json,sys
from runtime import verify,LOCAL
from seed import api,login
owner=verify();accounts=json.loads((LOCAL/'accounts.json').read_text());state=json.loads((LOCAL/'filming-state.json').read_text())
if accounts['B']['email']!='b@doctorchart-demo.test':raise RuntimeError('Unexpected DEMO identity')
pid=state['patientId'];token=login(accounts['B'])
p=api('GET',f'/patients/{pid}',token=token)
if p['fullName']!='Alta DEMO Tutorial Ficticio' or p['formValues']['sys_dni']!='99999001':raise RuntimeError('Scratch identity mismatch')
encounters=api('GET',f'/encounters/patient/{pid}',token=token)
if encounters and '--include-demo-encounters' not in sys.argv:raise RuntimeError('Scratch patient is not empty; explicit DEMO encounter cleanup flag required')
if any(not e.get('chiefComplaint','').startswith('DEMO ·') for e in encounters):raise RuntimeError('Encounter not marked as filming DEMO; refusing cleanup')
for e in encounters:api('DELETE',f'/encounters/{e["id"]}',token=token)
api('DELETE',f'/patients/{pid}',token=token)
print('Removed only the verified empty filming scratch patient; the 40 seed patients are retained.')
