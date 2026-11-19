"""Read-only inventory; all outputs confined to the replication package."""
from pathlib import Path
import hashlib,json,subprocess,sys,shutil,tarfile,platform,os
ROOT=Path(__file__).resolve().parents[1]; REPO=ROOT.parent
def save(p,v):
 p=ROOT/p;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(v,ensure_ascii=False,indent=2),encoding='utf8')
def sha(p):
 h=hashlib.sha256()
 with p.open('rb') as f:
  for b in iter(lambda:f.read(8*1024*1024),b''):h.update(b)
 return h.hexdigest()
def run(args):return subprocess.check_output([str(a) for a in args],text=True,encoding='utf8',errors='replace').strip()
envs={'qwen':REPO/'doctorchart-video-tutorial/.local/qwen-venv','subtitles':REPO/'doctorchart-promo-reel/.local/voice-venv','audio-tools':REPO/'doctorchart-video-tutorial/.local/voice-venv'}
for name,env in envs.items():
 py=env/'Scripts/python.exe'
 code="import sys,importlib.metadata as m,json;print(json.dumps({'python':sys.version,'executable':sys.executable,'packages':{d.metadata['Name']:d.version for d in m.distributions()}},sort_keys=True))"
 info=json.loads(run([py,'-c',code]));save('evidence/'+name+'-environment.json',info)
 (ROOT/(name+'-requirements.lock.txt')).write_text('\n'.join(f'{k}=={v}' for k,v in sorted(info['packages'].items()) if k.lower() not in ['pip'])+'\n',encoding='utf8')
profile=json.loads((REPO/'docs/tutorial-handoffs/VOZ_MASCULINA_DOCTORCHART.json').read_text(encoding='utf8'))
reference=Path(profile['reference_audio']);assert sha(reference)==profile['reference_sha256']
assert profile['reference_is_synthetic'] and not profile['user_voice_recordings_used']
assert sha(REPO/'doctorchart-video-tutorial/qa/qwen-voz-masculina.wav')==sha(reference)
shutil.copy2(reference,ROOT/'voice/reference.wav')
meta=json.loads(Path(profile['reference_metadata']).read_text(encoding='utf8'))
for key in ['output','raw_output']:meta.pop(key,None)
save('voice/reference-metadata.json',meta)
for key in ['reference_audio','reference_metadata','generation_model_path','python_executable']:profile.pop(key,None)
profile.update(reference_audio='voice/reference.wav',generation_model_path='models/qwen-base')
save('voice/profile.json',profile)
models=[]
for name,folder,repo,rev in [('qwen-base',REPO/'doctorchart-video-tutorial/.local/qwen/base-model','Qwen/Qwen3-TTS-12Hz-0.6B-Base',profile['generation_model_revision']),('whisper-small',REPO/'doctorchart-promo-reel/.local/whisper-small','Systran/faster-whisper-small','536b0662742c02347bc0e980a01041f333bce120'),('voice-design-origin',REPO/'doctorchart-video-tutorial/.local/qwen/model','Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign','5ecdb67327fd37bb2e042aab12ff7391903235d3')]:
 files=[]
 for p in sorted(folder.rglob('*')):
  if p.is_file() and '.cache' not in p.relative_to(folder).parts:
   files.append({'file':p.relative_to(folder).as_posix(),'bytes':p.stat().st_size,'sha256':sha(p)})
 models.append({'name':name,'local_source':str(folder),'repo_id':repo,'revision':rev,'source':'https://huggingface.co/'+repo,'required':name!='voice-design-origin','files':files})
save('models-manifest.json',models)
sources=['doctorchart-video-tutorial/automation/qwen-worker.py','doctorchart-video-tutorial/automation/compile-ai-video.py','doctorchart-video-tutorial/automation/setup-qwen.py','doctorchart-video-tutorial/docs/qwen-base-provenance.json','doctorchart-video-tutorial/docs/qwen-provenance.json','pointly-video-tutorial/automation/narrate.py','pointly-video-tutorial/automation/align.py','pointly-video-tutorial/automation/revise-captions.mjs','pointly-video-tutorial/remotion/src/Chapter.tsx','pointly-video-tutorial/remotion/src/fonts.ts','pointly-promo-reel/scripts/qwen-generate.py','pointly-promo-reel/scripts/align-mix.py','shared/bycode-video-system/src/bycode-promo/captions.tsx','shared/bycode-video-system/src/bycode-brand/products.ts']
manifest=[]
for s in sources:
 p=REPO/s;dst=ROOT/'evidence/source'/s;dst.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(p,dst);manifest.append({'path':s,'sha256':sha(p)})
save('evidence/source-manifest.json',manifest)
package=envs['qwen']/'Lib/site-packages/qwen_tts'
save('evidence/qwen-code-hashes.json',[{'file':p.relative_to(package).as_posix(),'sha256':sha(p)} for p in sorted(package.rglob('*.py'))])
# Share a compiled, minimal distribution of the existing library, not a second source tree.
with tarfile.open(ROOT/'vendor/bycode-video-system-0.1.0.tgz','w:gz') as t:
 lib=REPO/'shared/bycode-video-system'
 for p in [lib/'package.json',lib/'README.md',*sorted((lib/'dist').rglob('*'))]:
  if p.is_file():t.add(p,arcname='package/'+p.relative_to(lib).as_posix())
for name in ['google-sans.woff2','OFL.txt']:
 dst=ROOT/'demo/public/fonts'/name;dst.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(REPO/'pointly-video-tutorial/remotion/public/fonts'/name,dst)
ff=next((envs['audio-tools']/'Lib/site-packages/imageio_ffmpeg/binaries').glob('*.exe'))
save('evidence/host-tools.json',{'platform':platform.platform(),'node':run(['node','--version']),'git_commit':run(['git','rev-parse','HEAD']),'ffmpeg_path':str(ff),'ffmpeg_version':run([ff,'-version']),'nvidia':run(['nvidia-smi']),'relevant_environment':{k:v for k,v in os.environ.items() if k in ['HF_HOME','HF_HUB_CACHE','TRANSFORMERS_CACHE','CUDA_PATH','CUDA_VISIBLE_DEVICES','HF_HUB_OFFLINE','TOKENIZERS_PARALLELISM','REEL_ASR_MODEL']}})
print('Audit complete; model and reference hashes recorded.')
