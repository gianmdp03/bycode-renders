import fs from 'node:fs';import path from 'node:path';import {spawnSync} from 'node:child_process';import {root} from './browser.mjs';
const candidates=[process.env.TUTORIAL_PYTHON,path.join(root,'.local/voice-venv/Scripts/python.exe'),path.join(process.env.USERPROFILE??'','.cache','codex-runtimes/codex-primary-runtime/dependencies/python/python.exe')].filter(Boolean);
const python=candidates.find(p=>fs.existsSync(p))??'python';
const routes={bootstrap:'automation/bootstrap.py',preflight:'automation/preflight.py',voice:'automation/voice.py',runtime:'demo/runtime.py',seed:'demo/seed.py',obs:'automation/start-obs.py'};
const [action,...args]=process.argv.slice(2);if(!routes[action])throw Error('Unknown Python task');
const p=spawnSync(python,[path.join(root,routes[action]),...args],{cwd:root,stdio:'inherit'});if(p.error)throw p.error;process.exitCode=p.status??1;
