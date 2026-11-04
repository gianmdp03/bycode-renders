"""Reuse capture utilities in an isolated OBS profile; preserve historical captures."""
from pathlib import Path
import os,shutil
ROOT=Path(__file__).resolve().parents[1];OLD=ROOT.parent/'doctorchart-video-tutorial'
target=ROOT/'.local/obs-app'
if not target.exists():
 shutil.copytree(OLD/'.local/obs-app',target,copy_function=os.link,ignore=shutil.ignore_patterns('config','logs','recordings'))
for name in ['start-obs.py','calibrate-image.py','check-capture-image.py','obs.mjs','recorder.mjs']:
 s=(OLD/'automation'/name).read_text(encoding='utf8').replace('DoctorChart','Pointly')
 if name=='obs.mjs':s=s.replace("from 'obs-websocket-js'","from '../../doctorchart-video-tutorial/node_modules/obs-websocket-js/dist/json.js'")
 if name=='start-obs.py':s=s.replace("'port':24655","'port':25655")
 if name=='recorder.mjs':
  s=s.replace("path.join(root,'remotion/node_modules/@remotion/compositor-win32-x64-msvc')","path.join(root,'../node_modules/@remotion/compositor-win32-x64-msvc')")
  s=s.replace("path.join(root,'.local/voice-venv","path.join(root,'../doctorchart-video-tutorial/.local/voice-venv")
  s=s.replace("const python=path.join(root,'.local/voice-venv","const python=path.join(root,'../doctorchart-video-tutorial/.local/voice-venv")
 (ROOT/'automation'/name).write_text(s,encoding='utf8')
print('Independent OBS profile and existing native capture tools prepared.')

