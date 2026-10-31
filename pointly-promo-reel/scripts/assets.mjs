import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {root,repo,save} from './tools.mjs';
const front=path.resolve(repo,'../pointly-frontend');
const files=[['public/logo.svg','public/logos/pointly.svg'],['public/bycode-logo.svg','public/logos/bycode.svg'],['public/fonts/google-sans-latin-normal-b8059800eca3.woff2','public/fonts/google-sans-latin-normal-b8059800eca3.woff2'],['public/fonts/OFL.txt','public/fonts/OFL.txt']];
const assets=files.map(([source,destination])=>{const bytes=fs.readFileSync(path.join(front,source));if(!bytes.equals(fs.readFileSync(path.join(root,destination))))throw Error('Asset mismatch: '+destination);return {source,destination,sha256:crypto.createHash('sha256').update(bytes).digest('hex')};});
save('qa/assets.json',{source:'../pointly-frontend',assets});
