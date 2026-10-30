import fs from 'node:fs';import path from 'node:path';import {root} from './browser.mjs';import {supplements as original} from '../script/supplements.mjs';import {recoverySupplements} from '../script/recovery-supplements.mjs';
import {edgeSupplements} from '../script/edge-supplements.mjs';
const supplements=[...original,...recoverySupplements,...edgeSupplements];
const target=path.join(root,'script/storyboard.json');const story=JSON.parse(fs.readFileSync(target,'utf8'));
for(const chapter of supplements)if(!story.some(c=>c.id===chapter.id))story.push({...chapter,role:'doctor',specialty:'pediatrics',fixture:chapter.account+':DEMO',beats:chapter.beats.map(([id,text,minSeconds,action_key])=>({id,scene_id:chapter.id,role:'doctor',specialty:'pediatrics',account:chapter.account,observable_action:action_key,prior_state:chapter.route,expected_state:chapter.expected_state,text,attention:action_key,overlay:'Rótulo y subtítulos discretos',zoom:{scale:1,focalX:960,focalY:540},minSeconds,action_key,locator:'automation/supplement-actions.mjs',evidence:'Acción real + resultado visual + aserción de API',required_fixture:chapter.account+':DEMO'}))});
fs.writeFileSync(target,JSON.stringify(story,null,2));
fs.writeFileSync(path.join(root,'script/narration-es-419.md'),'# DoctorChart · narración es-419\n\n'+story.map(c=>'## '+c.title+'\n\n'+c.beats.map(b=>`**${b.id}** ${b.text}`).join('\n\n')).join('\n\n')+'\n');
console.log(JSON.stringify({chapters:story.length,beats:story.flatMap(c=>c.beats).length,minimumSeconds:story.flatMap(c=>c.beats).reduce((s,b)=>s+b.minSeconds,0)}));
