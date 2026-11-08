"""Recreate missing DEMO containers around their verified retained volume.
No reset, schema change, or adoption of another project's volume is allowed.
"""
from runtime import *
cfg=json.loads((LOCAL/'ownership.json').read_text(encoding='utf8'));assert cfg['owner']==OWNER and cfg['project']==PROJECT
volume=PROJECT+'_data';info=json.loads(run(['docker','volume','inspect',volume]))[0]
assert info['Labels'][LABEL]==OWNER and info['Labels']['com.docker.compose.project']==PROJECT
assert not run(['docker','ps','-aq','--filter','label=com.docker.compose.project='+PROJECT]).strip(), 'Existing containers require ordinary verify/start, not recovery.'
backup=LOCAL/'backups';backup.mkdir(exist_ok=True);stamp=dt.datetime.now().strftime('%Y%m%d-%H%M%S')
# Original database bytes are copied read-only before starting PostgreSQL again.
run(['docker','run','--rm','--network','none','--entrypoint','tar','-v',volume+':/retained:ro','-v',str(backup)+':/backup','postgres:17','-czf','/backup/database-volume-'+stamp+'.tar.gz','-C','/retained','.'])
write(backup/('ownership-'+stamp+'.json'),cfg)
compose('up','-d')
cfg['resources']={s:run(['docker','inspect','--format','{{.Id}}',compose('ps','-a','-q',s).decode().strip()]).decode().strip() for s in ['db','auth','proxy','billing','backend','gateway','converter']}
write(LOCAL/'ownership.json',cfg);verify()
write(ROOT/'qa/container-recovery.json',{'state':'RECOVERED_EXISTING_DATA','retainedOwnedVolume':volume,'coldBackup':str((backup/('database-volume-'+stamp+'.tar.gz')).relative_to(ROOT)),'schemaChanged':False,'productionTouched':False})
print('DEMO containers recreated around original owned volume; cold backup retained. No database reset.')
