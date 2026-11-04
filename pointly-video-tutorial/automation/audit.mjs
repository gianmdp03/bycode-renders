import fs from 'node:fs';import path from 'node:path';import {createRequire} from 'node:module';import crypto from 'node:crypto';import {root} from './browser.mjs';
const source=path.resolve(root,'../../pointly-frontend');const require=createRequire(path.join(source,'package.json'));
const angular=await import('file:///'+path.join(source,'node_modules/@angular/compiler/fesm2022/compiler.mjs').replaceAll('\\','/'));
// Run the repository's actual Angular parser, replacing only output locations and
// historical verification annotations. Never write to the product checkout.
let script=fs.readFileSync(path.join(source,'scripts/audit-controls.mjs'),'utf8');
script=script.replace("import ts from 'typescript';",`const ts=require('typescript');`).replace("import {parseTemplate} from '@angular/compiler';",'const {parseTemplate}=angular;');
script=script.replace("import fs from 'node:fs';",'').replace("import path from 'node:path';",'');
script=script.replace("for (const control of controls) {",'for (const control of []) {');
script=script.slice(0,script.indexOf("fs.mkdirSync('docs'"))+`\nreturn {templates,count:controls.length,errors,controls};`;
process.chdir(source);
const data=new Function('fs','path','require','angular',script)(fs,path,require,angular);
const files=fs.readdirSync('src/app',{recursive:true}).filter(p=>/\.(html|ts)$/.test(p)&&!p.endsWith('.spec.ts')).map(p=>'src/app/'+p.replaceAll('\\','/'));
const hashes=Object.fromEntries(files.map(f=>[f,crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex')]));
data.generatedAt=new Date().toISOString();data.productCommit=String((await import('node:child_process')).execFileSync('git',['rev-parse','HEAD'],{cwd:source})).trim();data.sourceHashes=hashes;
fs.writeFileSync(path.join(root,'inventory/controls.json'),JSON.stringify(data,null,2));
console.log(JSON.stringify({templates:data.templates,controls:data.count,parseErrors:data.errors.length,byComponent:Object.groupBy(data.controls,c=>c.component)},{},2).slice(0,250));
