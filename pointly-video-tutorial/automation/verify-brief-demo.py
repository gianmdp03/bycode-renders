"""Cross-check the nine real captures against the isolated walkthrough ledger."""
from pathlib import Path
import json,sys
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'demo'))
from seed import api,login,run,verify,write,LOCAL

cfg=verify()
state=json.loads((LOCAL/'brief-state.json').read_text(encoding='utf8'))
merchant=json.loads((LOCAL/'accounts.json').read_text(encoding='utf8'))['BRIEF']
token=login(merchant)
cid=int(state['company']['id']);client=int(state['person']['id']);aid=int(state['person']['accountId']);reward=int(state['reward']['id'])
company=api('GET',f'/companies/{cid}',token=token)
assert company['publicName']==state['slug'] and company['name']=='Café del Puerto DEMO'
assert (company['amountStep'],company['pointsPerStep'],company['isPointsExpirationEnabled'],company['pointsExpirationDays'])==(1000,10,True,90)
account=api('GET',f'/companies/{cid}/clients/{client}',token=token)
assert account['balance']==0 and account['client']['name']==state['person']['name']
access=api('POST','/public/clients/access-links',{'country':state['person']['country'],'dni':state['person']['dni']})
public=api('POST',f"/public/client-access/companies/{state['slug']}/query",{'accessToken':access['accessToken']})
assert public['clientBalance']==0
sql=f"""BEGIN READ ONLY;
SELECT json_build_object(
 'database',current_database(),
 'saleCount',(SELECT count(*) FROM sales WHERE company_id={cid} AND client_id={client}),
 'saleAmount',(SELECT sum(amount) FROM sales WHERE company_id={cid} AND client_id={client}),
 'movements',(SELECT json_agg(json_build_object('type',transaction_type,'amount',amount,'rewardId',reward_original_id,'rewardName',reward_name,'rewardCost',reward_cost,'validityDays',extract(epoch from expires_at-created_at)/86400) ORDER BY id) FROM points_transactions WHERE points_account_id={aid}),
 'sentEmails',(SELECT count(*) FROM pointly_mail_outbox WHERE sent_at IS NOT NULL)
);
COMMIT;"""
ledger=json.loads(run(['docker','exec','-i',cfg['resources']['db'],'psql','-U','tutorial_demo','-d','tutorial_pointly_demo','-v','ON_ERROR_STOP=1','-Atq'],input=sql.encode()))
assert ledger['database']=='tutorial_pointly_demo' and ledger['sentEmails']==0
assert ledger['saleCount']==1 and ledger['saleAmount']==8500
earned,redeemed=ledger['movements']
assert earned['type']=='EARNED' and earned['amount']==80 and abs(earned['validityDays']-90)<.01
assert (redeemed['type'],redeemed['amount'],redeemed['rewardId'],redeemed['rewardName'],redeemed['rewardCost'])==('REDEEMED',-80,reward,'Café de regalo',80)
manifest=json.loads((ROOT/'recordings/brief-manifest.json').read_text(encoding='utf8'))
captures=[]
for rec in manifest['recordings']:
 proof=json.loads((ROOT/f"qa/{rec['scene_id']}-evidence.json").read_text(encoding='utf8'))
 assert rec['file']==proof['source'] and (rec['probe']['width'],rec['probe']['height'])==(1920,1080)
 assert (ROOT/rec['original']).exists() and (ROOT/rec['file']).exists()
 captures.append({'scene':rec['scene_id'],'file':rec['file'],'evidence':[e['label'] for e in proof['evidence']]})
assert len(captures)==9
write(ROOT/'qa/brief-demo-verification.json',{'state':'PASS','company':{'name':company['name'],'publicName':company['publicName'],'baseRule':[1000,10],'expirationDays':90},'person':account['client']['name'],'ledger':ledger,'balanceSequence':[0,80,0],'publicBalance':public['clientBalance'],'merchantBalance':account['balance'],'sameRewardCreatedAndRedeemed':True,'captures':captures,'scope':'Verified tutorial-owned DB and localhost real API. No production data and no outbound messages.'})
print('PASS: one genuine $8,500 purchase, +80, same reward -80, public/private zero and 90-day validity.')
