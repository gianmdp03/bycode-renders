"""Build a shareable ZIP with explicit exclusion of runtimes, caches and large models."""
from pathlib import Path
import os,json,hashlib,zipfile
ROOT=Path(__file__).resolve().parents[1]
files=[]
for folder,dirs,names in os.walk(ROOT):
 dirs[:]=[x for x in dirs if x not in ['node_modules','__pycache__','models','.python','.venv-qwen','.venv-subtitles','runs']]
 for name in names:
  p=Path(folder)/name
  if name=='PACKAGE_MANIFEST.json' or name.endswith('.zip') or name=='qwen-runtime-install.lock.txt':continue
  files.append(p)
manifest=[{'file':p.relative_to(ROOT).as_posix(),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in sorted(files)]
(ROOT/'PACKAGE_MANIFEST.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf8')
files.append(ROOT/'PACKAGE_MANIFEST.json')
target=ROOT/'qwen3-tts-replication.zip'
if target.exists():raise FileExistsError('Preserve existing ZIP; use a new filename before rebuilding')
with zipfile.ZipFile(target,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
 for p in sorted(files):z.write(p,'qwen3-tts-replication/'+p.relative_to(ROOT).as_posix())
with zipfile.ZipFile(target) as z:assert z.testzip() is None
print(json.dumps({'zip':str(target),'bytes':target.stat().st_size,'sha256':hashlib.sha256(target.read_bytes()).hexdigest(),'files':len(files)},indent=2))
