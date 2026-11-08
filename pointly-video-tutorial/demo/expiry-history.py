"""Historical initial fixture for Camila, using real purchases and owned rows only."""
from seed import *
cfg=verify();ids=json.loads((LOCAL/'seed-ids.json').read_text(encoding='utf8'));cid=int(ids['company']);client=int(ids['historyClient']['id']);t=login(json.loads((LOCAL/'accounts.json').read_text(encoding='utf8'))['B'])
def sql(text):return run(['docker','exec','-i',cfg['resources']['db'],'psql','-U','tutorial_demo','-d','tutorial_pointly_demo','-Atq','-v','ON_ERROR_STOP=1'],input=text.encode()).decode().strip()
marker=LOCAL/'expiry-fixture.json'
if marker.exists():print('Historical expiry fixture already prepared; no repeated sales.');raise SystemExit
account=int(sql(f'SELECT id FROM points_accounts WHERE company_id={cid} AND client_id={client};'))
before=set(map(int,sql(f"SELECT id FROM points_transactions WHERE points_account_id={account} AND transaction_type='EARNED';").split()))
sales=[]
for i in range(51):sales.append(api('POST','/sales',{'companyId':cid,'country':'Argentina','dni':'99030001','amount':3500},t,f'camila-expiry-history-{i}-v1')['id'])
after=set(map(int,sql(f"SELECT id FROM points_transactions WHERE points_account_id={account} AND transaction_type='EARNED';").split()));transactions=sorted(after-before);assert len(transactions)==51
updates=[]
for i,(sale,tx) in enumerate(zip(sales,transactions)):
 days=65-i;date=f"date_trunc('day',now())-interval '{days} days'+interval '10 hours'";expiry='NULL' if i==0 else f"({date})+interval '90 days'"
 updates.append(f"UPDATE sales SET created_at={date} WHERE id={int(sale)} AND company_id={cid} AND client_id={client};UPDATE points_transactions SET created_at={date},expires_at={expiry} WHERE id={int(tx)} AND points_account_id={account} AND transaction_type='EARNED';")
sql("BEGIN; DO $$ BEGIN IF current_database()<>'tutorial_pointly_demo' THEN RAISE EXCEPTION 'Not DEMO'; END IF; END $$;"+''.join(updates)+'COMMIT;')
report={'state':'HISTORICAL_INITIAL_FIXTURE','client':'Camila Historial DEMO','realApiPurchases':51,'amountEach':3500,'dates':'One purchase per day, 65 through 15 days ago; earliest group without expiry, subsequent groups at 90 days.','scope':'Only returned sale IDs and new earned rows of the owned Camila account. No point amount or balance fabricated.','sales':sales,'transactions':transactions}
write(marker,report);write(ROOT/'demo/expiry-fixture-report.json',report);print('Historical real purchases prepared for public expiry pagination and non-expiring group.')
