"""One separate historical client for the brief tour, never changing Ana's state."""
from seed import *
cfg=verify();state=json.loads((LOCAL/'brief-state.json').read_text(encoding='utf8'));cid=int(state['company']['id']);t=login(json.loads((LOCAL/'accounts.json').read_text(encoding='utf8'))['BRIEF'])
marker=LOCAL/('brief-retention-'+str(cid)+'.json')
if marker.exists():print('Existing owned retention fixture retained.');raise SystemExit
company=api('GET',f'/companies/{cid}',token=t);assert company['publicName']==state['slug']
a=api('POST','/points-accounts',{'companyId':cid,'country':'Argentina','dni':'99952008','name':'Luis Rojas DEMO','email':'luis.recorrido@example.invalid','phone':'+5492235550198'},t)
sale=api('POST','/sales',{'companyId':cid,'country':'Argentina','dni':'99952008','amount':3500},t,'brief-retention-'+str(cid)+'-v1')
aid=int(a['id']);sid=int(sale['id']);client=int(a['client']['id'])
sql=f"""BEGIN;
DO $$ BEGIN IF current_database()<>'tutorial_pointly_demo' THEN RAISE EXCEPTION 'Wrong DEMO'; END IF; END $$;
UPDATE sales SET created_at=now()-interval '45 days' WHERE id={sid} AND company_id={cid} AND client_id={client};
UPDATE points_transactions SET created_at=now()-interval '45 days',expires_at=now()+interval '45 days' WHERE points_account_id={aid} AND transaction_type='EARNED';
UPDATE points_accounts SET last_activity_date=now()-interval '45 days' WHERE id={aid} AND company_id={cid} AND client_id={client};
COMMIT;"""
run(['docker','exec','-i',cfg['resources']['db'],'psql','-U','tutorial_demo','-d','tutorial_pointly_demo','-v','ON_ERROR_STOP=1','-q'],input=sql.encode())
write(marker,{'company':cid,'account':aid,'sale':sid,'person':'Luis Rojas DEMO','preparation':'Real API purchase; only timestamps of newly owned fixture rows set 45 days back. No balance amounts fabricated. Ana untouched.'})
print('Separate historical example prepared for the same owned company; Ana retained at zero.')
