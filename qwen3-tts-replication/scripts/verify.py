from pathlib import Path
import argparse,json,importlib.metadata as m,hashlib,sys,platform
ROOT=Path(__file__).resolve().parents[1]
p=argparse.ArgumentParser();p.add_argument('--kind',choices=['qwen','subtitles'],required=True);a=p.parse_args()
lock=ROOT/(a.kind+'-requirements.lock.txt');errors=[]
for line in lock.read_text(encoding='utf-8-sig').splitlines():
 if not line.strip():continue
 name,version=line.split('==',1)
 try:actual=m.version(name)
 except m.PackageNotFoundError:actual='MISSING'
 if actual!=version:errors.append({'package':name,'expected':version,'actual':actual})
if platform.python_version()!='3.12.14':errors.append({'python':platform.python_version(),'expected':'3.12.14'})
profile=json.loads((ROOT/'voice/profile.json').read_text(encoding='utf8'))
assert hashlib.sha256((ROOT/'voice/reference.wav').read_bytes()).hexdigest()==profile['reference_sha256']
if a.kind=='qwen':
 import torch,qwen_tts
 if torch.version.cuda!='12.8' or not torch.cuda.is_available() or not torch.cuda.is_bf16_supported():errors.append({'CUDA':'Requires available CUDA 12.8 runtime with bfloat16 support'})
 source=Path(qwen_tts.__file__).parent
 for item in json.loads((ROOT/'evidence/qwen-code-hashes.json').read_text()):
  if hashlib.sha256((source/item['file']).read_bytes()).hexdigest()!=item['sha256']:errors.append({'qwen_code_modified':item['file']})
print(json.dumps({'kind':a.kind,'status':'FAIL' if errors else 'PASS','errors':errors},indent=2))
sys.exit(bool(errors))
