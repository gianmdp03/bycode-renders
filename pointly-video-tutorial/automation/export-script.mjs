import fs from 'node:fs';import path from 'node:path';import {chapters} from '../script/chapters.mjs';import {root} from './browser.mjs';
fs.writeFileSync(path.join(root,'script/chapters.json'),JSON.stringify(chapters,null,2)+'\n');console.log('Narration input updated:',chapters.length,'chapters.');
