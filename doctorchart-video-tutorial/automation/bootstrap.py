"""Install isolated production tools, verify licensed voice bytes. No product writes."""
from pathlib import Path
import hashlib,json,subprocess,sys,urllib.request,venv
ROOT=Path(__file__).resolve().parents[1];LOCAL=ROOT/'.local';target=LOCAL/'voice-venv'
if not (target/'Scripts/python.exe').exists():venv.create(target,with_pip=True)
python=target/'Scripts/python.exe'
subprocess.run([str(python),'-m','pip','install','-r',str(ROOT/'requirements-production.txt')],check=True)
base='https://huggingface.co/rhasspy/piper-voices/resolve/main/es/es_MX/ald/medium/'
pins={'es_MX-ald-medium.onnx':'019b3803293c93e34a206dd2e53a3889209a514e786fd7144f7b70196c579b63','es_MX-ald-medium.onnx.json':'5a71498158e04afc8099bfd019c7e87c68eb9d042505a2b1a87e5c1ac2b1a61d','MODEL_CARD':'1f0694ceb3f1e78c1e2ee0e2d5da40f19f965bc638e1b4fb4fca9bdca420d713'}
folder=LOCAL/'voices';folder.mkdir(exist_ok=True)
for name,digest in pins.items():
 p=folder/name
 if not p.exists():
  with urllib.request.urlopen(base+name,timeout=120) as response:p.write_bytes(response.read())
 if hashlib.sha256(p.read_bytes()).hexdigest()!=digest:raise RuntimeError('Voice provenance mismatch: '+name)
provenance={'engine':'piper-tts==1.8.0','voice':'es_MX-ald-medium','language':'Spanish, Mexico','sample_rate_hz':22050,'source':base,'sha256':pins,'dataset_license':'Unlicense according to included MODEL_CARD','model_card':(folder/'MODEL_CARD').read_text(),'review':'Naturalness and pronunciation require preview listening approval. No claim of human narration.','music':None}
(ROOT/'docs/voice-provenance.json').write_text(json.dumps(provenance,ensure_ascii=False,indent=2),encoding='utf8')
print('Isolated production dependencies and exact voice bytes verified.')
