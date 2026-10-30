"""Copy unchanged frontend into THIS production folder. Existing repositories read only."""
from pathlib import Path
import shutil, subprocess, json
root=Path(__file__).resolve().parents[1]
repos=root.parent.parent
target=root/'.local/frontend'
if not target.exists():
    shutil.copytree(repos/'doctorchart-frontend',target,ignore=shutil.ignore_patterns('.git','node_modules','.angular','dist','test-results','.env*','local.public.json','environment.local.generated.ts'))
    subprocess.run(['cmd','/d','/c','mklink','/J',str(target/'node_modules'),str(repos/'doctorchart-frontend/node_modules')],check=True,capture_output=True)
shutil.copy2(root.parent/'doctorchart-video-tutorial/.local/frontend-public.json',target/'config/local.public.json')
print('Frontend copy ready inside new project. Source repository unchanged.')
