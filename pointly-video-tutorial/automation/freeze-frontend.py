"""Copy current local product sources unchanged into DEMO; preserve prior copy.
Never writes to Pointly, dependencies, environments or any database.
"""
from pathlib import Path
import hashlib,json,shutil,datetime
ROOT=Path(__file__).resolve().parents[1];source=ROOT.parent.parent/'pointly-frontend';target=ROOT/'.local/frontend'
stamp=datetime.datetime.now().strftime('%Y%m%d-%H%M%S');archive=ROOT/'.local/frontend-versions'/stamp;changed=[];hashes={}
for base in ('src','public'):
 for src in (source/base).rglob('*'):
  if not src.is_file():continue
  rel=src.relative_to(source)
  if src.name=='environment.local.generated.ts' or src.name.startswith('.env'):continue
  if src.suffix not in ('.ts','.html','.css','.svg','.js','.json','.woff2','.txt','.webmanifest','.png','.ico'):continue
  content=src.read_bytes();hashes[str(rel).replace('\\','/')]=hashlib.sha256(content).hexdigest();dst=target/rel
  if dst.exists() and dst.read_bytes()==content:continue
  if dst.exists():old=archive/rel;old.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(dst,old)
  dst.parent.mkdir(parents=True,exist_ok=True);dst.write_bytes(content);changed.append(str(rel).replace('\\','/'))
(ROOT/'inventory/recorded-source-snapshot.json').write_text(json.dumps({'timestamp':stamp,'source':'../../pointly-frontend','sourceUnmodified':True,'preservedPreviousCopy':str(archive.relative_to(ROOT)),'updatedFiles':changed,'sha256':hashes},indent=2))
print('Unchanged local frontend sources synchronized:',len(changed),'files; previous files preserved.')
