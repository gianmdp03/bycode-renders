"""Owned initial historical fixture. Never a UI operation or a fake API result."""
from seed import *
cfg=verify();ids=json.loads((LOCAL/'seed-ids.json').read_text());cid=ids['company'];a=json.loads((LOCAL/'accounts.json').read_text());t=login(a['B'])
rows=api('GET',f'/promotions/{cid}?size=100',token=t)['content'];name='Beneficio de la semana DEMO'
p=next((x for x in rows if x['name']==name),None)
if not p:
 start=(dt.datetime.now(dt.timezone.utc)+dt.timedelta(days=1)).isoformat();end=(dt.datetime.now(dt.timezone.utc)+dt.timedelta(days=3)).isoformat()
 p=api('POST','/promotions',{'companyId':cid,'name':name,'description':'Doble de puntos durante el horario indicado. Datos ficticios del tutorial.','startDate':start,'endDate':end,'multiplier':2},t)
sql=f"""BEGIN;
DO $$ BEGIN IF current_database()<>'tutorial_pointly_demo' THEN RAISE EXCEPTION 'Not DEMO'; END IF; END $$;
UPDATE promotions SET start_date=now()-interval '2 hours',end_date=now()+interval '6 hours' WHERE id={p['id']} AND company_id={cid} AND name='Beneficio de la semana DEMO';
COMMIT;"""
run(['docker','exec','-i',cfg['resources']['db'],'psql','-U','tutorial_demo','-d','tutorial_pointly_demo','-v','ON_ERROR_STOP=1','-q'],input=sql.encode())
write(ROOT/'demo/promotion-fixture-report.json',{'state':'HISTORICAL_INITIAL_FIXTURE','createdViaRealAPI':True,'datePreparation':'Owned row only, 2 hours ago through 6 hours ahead; no product source changes.','name':name,'id':p['id']})
print('Owned historical promotion prepared; real backend will calculate benefits.')
