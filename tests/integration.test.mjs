import assert from 'node:assert/strict';
import {test} from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {createRequire} from 'node:module';
import {createProductBrand} from '@bycode/video-system/brand';
const root=path.resolve(import.meta.dirname,'..');

test('workspaces share the same React, React DOM and Remotion runtime',()=>{
 const requireAt=folder=>createRequire(path.join(root,folder,'package.json'));
 const readers=[requireAt('.'),requireAt('shared/bycode-video-system'),requireAt('doctorchart-promo-reel')];
 for(const name of ['react','react-dom','remotion']){
  const resolved=readers.map(r=>fs.realpathSync(r.resolve(name)));
  assert.equal(new Set(resolved).size,1,`Duplicate context for ${name}: ${resolved}`);
 }
});

test('all three products use the one registry and remain explicitly provisional',()=>{
 for(const [id,name] of [['bycode','Bycode'],['doctorchart','DoctorChart'],['pointly','Pointly']]){
  const first=createProductBrand(id);assert.equal(first.name,name);assert.equal(first.status,'draft');
  first.colors.accent='#123456';assert.notEqual(createProductBrand(id).colors.accent,'#123456');
 }
 assert.equal(createProductBrand('bycode').colors.accent,createProductBrand('pointly').colors.accent);
 assert.notEqual(createProductBrand('bycode').colors.accent,createProductBrand('doctorchart').colors.accent);
 assert.throws(()=>createProductBrand('invented-product'),RangeError);
});

test('root instructions and three implicit skills have resolvable local references',()=>{
 const files=['AGENTS.md',...['bycode-brand','bycode-promo','bycode-tutorial'].map(n=>`.agents/skills/${n}/SKILL.md`)];
 for(const file of files){
  const full=path.join(root,file),source=fs.readFileSync(full,'utf8');
  for(const match of source.matchAll(/\]\(([^)]+)\)/g)){
   if(!match[1].startsWith('https:'))assert(fs.existsSync(path.resolve(path.dirname(full),match[1])),`${file}: missing ${match[1]}`);
  }
 }
 for(const name of ['bycode-brand','bycode-promo','bycode-tutorial']){
  const config=fs.readFileSync(path.join(root,`.agents/skills/${name}/agents/openai.yaml`),'utf8');
  assert.match(config,/allow_implicit_invocation:\s*true/);
 }
});

test('original DoctorChart captures, script, music and archived MP4 remain intact',()=>{
 const fixture=JSON.parse(fs.readFileSync(path.join(root,'tests/fixtures/doctorchart-preservation.json'),'utf8'));
 for(const record of fixture){
  const bytes=fs.readFileSync(path.join(root,record.path));
  const payload=record.text?Buffer.from(bytes.toString('utf8').replaceAll('\r\n','\n')):bytes;
  assert.equal(crypto.createHash('sha256').update(payload).digest('hex'),record.sha256,record.path);
 }
 const data=JSON.parse(fs.readFileSync(path.join(root,'doctorchart-promo-reel/captions/preview-runtime.json')));
 assert.equal(data.duration,28);assert.equal(data.voice,false);
 assert.deepEqual(data.beats.map(b=>b.id),['hook','reveal','patients','history','customize','encounter','focus','cta']);
});
