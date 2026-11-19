"""Download immutable public model files and verify ALL recorded SHA-256 hashes."""
from pathlib import Path
import argparse,json,hashlib,urllib.request,os
ROOT=Path(__file__).resolve().parents[1]
p=argparse.ArgumentParser();p.add_argument('--verify-only',action='store_true');p.add_argument('--qwen');p.add_argument('--whisper');a=p.parse_args()
for model in json.loads((ROOT/'models-manifest.json').read_text(encoding='utf8')):
 if not model['required']:continue
 override=a.qwen if model['name']=='qwen-base' else a.whisper
 dest=Path(override) if override else ROOT/'models'/model['name']
 for item in model['files']:
  target=dest/item['file']
  if not target.exists():
   if a.verify_only:raise FileNotFoundError(target)
   target.parent.mkdir(parents=True,exist_ok=True)
   url=model['source']+'/resolve/'+model['revision']+'/'+item['file']
   tmp=target.with_suffix(target.suffix+'.partial')
   with urllib.request.urlopen(url,timeout=120) as response,tmp.open('wb') as output:
    while block:=response.read(8*1024*1024):output.write(block)
   tmp.replace(target)
  h=hashlib.sha256()
  with target.open('rb') as f:
   while block:=f.read(8*1024*1024):h.update(block)
  if target.stat().st_size!=item['bytes'] or h.hexdigest()!=item['sha256']:raise RuntimeError('HASH MISMATCH; do not use '+str(target))
  print('OK',model['name'],item['file'],flush=True)
