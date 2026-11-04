"""Read-only ledger and API evidence after filming. No repairs, resets, or production DSNs."""
from pathlib import Path
import sys,json,hashlib
ROOT=Path(__file__).resolve().parents[1];sys.path.insert(0,str(ROOT/'demo'))
from seed import verify,run,api,login,LOCAL,write
cfg=verify();ids=json.loads((LOCAL/'seed-ids.json').read_text());cid=ids['company']
sql=f"""BEGIN READ ONLY;
WITH ledger AS (SELECT points_account_id,sum(amount) net,coalesce(sum(available_amount) FILTER(WHERE transaction_type='EARNED'),0) remaining FROM points_transactions GROUP BY points_account_id)
SELECT json_build_object('database',current_database(),'accounts',(SELECT count(*) FROM points_accounts WHERE company_id={cid}),'balanceMismatch',(SELECT count(*) FROM points_accounts a LEFT JOIN ledger l ON a.id=l.points_account_id WHERE a.company_id={cid} AND (a.balance<>coalesce(l.net,0) OR a.balance<>coalesce(l.remaining,0))),'sales',(SELECT count(*) FROM sales WHERE company_id={cid}),'redemptions',(SELECT count(*) FROM points_transactions t JOIN points_accounts a ON a.id=t.points_account_id WHERE a.company_id={cid} AND t.transaction_type='REDEEMED'),'sentEmails',(SELECT count(*) FROM pointly_mail_outbox WHERE sent_at IS NOT NULL));
COMMIT;"""
raw=run(['docker','exec','-i',cfg['resources']['db'],'psql','-U','tutorial_demo','-d','tutorial_pointly_demo','-v','ON_ERROR_STOP=1','-Atq'],input=sql.encode()).decode().strip();ledger=json.loads(raw)
assert ledger['database']=='tutorial_pointly_demo' and ledger['balanceMismatch']==0 and ledger['sentEmails']==0
a=json.loads((LOCAL/'accounts.json').read_text());t=login(a['B']);company=api('GET',f'/companies/{cid}',token=t);clients=api('GET',f'/companies/{cid}/clients?size=100&status=ALL',token=t)
wallet=api('POST','/public/clients/access-links',{'country':'Argentina','dni':'99010001'})
public=api('POST',f"/public/client-access/companies/{company['publicName']}/query",{'accessToken':wallet['accessToken']})
privateAna=next(c for c in clients['content'] if c['client']['dni']=='99010001')
assert public['clientBalance']==privateAna['balance']
report={'status':'PASS','isolation':'Owned containers and private databases verified before read-only checks','ledger':ledger,'company':{'name':company['name'],'publicName':company['publicName'],'enabled':company['isEnabled']},'publicPrivateAnaBalanceAgreement':True,'salePointDisplay':'Current sales API may omit pointsGenerated; frontend honestly shows Sin dato por venta. Ledger is the authoritative verification.','productionTouched':False,'externalMessages':False}
write(ROOT/'qa/demo-verification.json',report);print('PASS: ledger, public/private balance, isolated DB and no sent emails.')
