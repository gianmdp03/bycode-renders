from pathlib import Path
import json,hashlib
ROOT=Path(__file__).resolve().parents[1]
for item in json.loads((ROOT/'PACKAGE_MANIFEST.json').read_text(encoding='utf8')):
 p=ROOT/item['file'];assert p.resolve().is_relative_to(ROOT)
 assert p.is_file() and hashlib.sha256(p.read_bytes()).hexdigest()==item['sha256'],'Package modified: '+item['file']
print('Package hashes PASS')
