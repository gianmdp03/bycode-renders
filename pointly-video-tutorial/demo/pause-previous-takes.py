"""Retain previous temporary rewards, pausing duplicates from earlier film takes."""
from seed import *
verify();ids=json.loads((LOCAL/'seed-ids.json').read_text(encoding='utf8'));cid=ids['company'];t=login(json.loads((LOCAL/'accounts.json').read_text(encoding='utf8'))['B']);rows=api('GET',f'/rewards/{cid}?size=100',token=t)['content'];paused=[]
physical=[r for r in rows if r['name']=='Desayuno de regalo DEMO'];keep=max((r['id'] for r in physical),default=0)
for r in rows:
 if (r['name']=='Desayuno de regalo DEMO' and r['id']!=keep) or r['name']=='Voucher tutorial DEMO':
  api('POST',f"/rewards/{cid}/{r['id']}/pause",{},t);paused.append(r['id'])
write(ROOT/'qa/previous-take-rewards.json',{'preserved':True,'pausedRewardIds':paused,'activePhysicalRewardId':keep,'scope':'Only temporary tutorial names; original customer rewards and every historical movement retained.'});print('Prior temporary rewards preserved and paused; final demonstration catalog stays clear.')
