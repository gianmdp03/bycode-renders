import fs from 'node:fs';import path from 'node:path';import {storyboard} from '../script/production.mjs';import {root} from './browser.mjs';
fs.mkdirSync(path.join(root,'script'),{recursive:true});
const target=path.join(root,'script/storyboard.json');
if(fs.existsSync(target)&&!process.argv.includes('--replace-generated'))throw Error('Storyboard already exists; preserve audio timestamps unless explicitly regenerating');
fs.writeFileSync(target,JSON.stringify(storyboard,null,2));
fs.writeFileSync(path.join(root,'script/narration-es-419.md'),'# DoctorChart · narración es-419\n\n'+storyboard.map(c=>'## '+c.title+'\n\n'+c.beats.map(b=>`**${b.id}** ${b.text}`).join('\n\n')).join('\n\n')+'\n');
console.log(JSON.stringify({chapters:storyboard.length,beats:storyboard.flatMap(c=>c.beats).length,minimumSeconds:storyboard.flatMap(c=>c.beats).reduce((s,b)=>s+b.minSeconds,0)}));
