import fs from 'node:fs';import path from 'node:path';
import {openBrowser,login,root,base} from './browser.mjs';
import {Recorder,calibrate,obsConnect} from './recorder.mjs';
import {actionsFor} from './chapter-actions.mjs';
import {supplementActions} from './supplement-actions.mjs';
import {recoveryActions} from './recovery-actions.mjs';
import {edgeActions} from './edge-actions.mjs';
const wanted=process.argv.slice(2).filter(x=>!x.startsWith('--'));
const dry=process.argv.includes('--rehearse');
const from=Number(process.argv.find(a=>a.startsWith('--from='))?.split('=')[1]??0);
const story=JSON.parse(fs.readFileSync(path.join(root,'script/storyboard.json'),'utf8')).filter(c=>(!wanted.length||wanted.includes(c.id))&&Number(c.id.slice(0,2))>=from);
const obs=dry?null:await obsConnect();
let current=null,currentAccount=null,recorder=null;
fs.mkdirSync(path.join(root,'qa'),{recursive:true});
try{
 for(const chapter of story){
  if(currentAccount!==chapter.account){
   if(current)await current.browser.close();
   current=await openBrowser({headed:!dry,profile:'take-'+chapter.account+'-'+Date.now()});currentAccount=chapter.account;
   recorder=new Recorder(current.page,obs);await recorder.init();
   if(chapter.id==='01-access')await current.page.goto(base+'/login');else await login(current.page,chapter.account);
  }
  if(chapter.id!=='01-access'&&(new URL(current.page.url()).pathname==='/login'||await current.page.getByRole('heading',{name:'Iniciar sesión',exact:true}).isVisible()))await login(current.page,chapter.account);
  const handlers={...actionsFor(current.page,recorder),...supplementActions(current.page,recorder),...recoveryActions(current.page,recorder),...edgeActions(current.page,recorder)};
  if(chapter.prepare_key)await handlers[chapter.prepare_key]();
  if(!dry){await current.page.bringToFront();await calibrate(current.page,obs);}
  if(!dry)await recorder.begin(chapter);
  for(const beat of chapter.beats){
   if(!handlers[beat.action_key])throw Error('Missing action '+beat.action_key);
   if(dry){await handlers[beat.action_key]();console.log('REHEARSED',beat.id);await current.page.screenshot({path:path.join(root,'qa',beat.id+'-rehearsal.png')});}
   else await recorder.beat(beat,handlers[beat.action_key]);
  }
  if(!dry){const result=await recorder.end();console.log('RECORDING',result.scene_id,result.probe.frame_rate,{renderSkippedFrames:result.obs_stats.renderSkippedFrames,outputSkippedFrames:result.obs_stats.outputSkippedFrames});}
 }
}catch(error){
 if(current){await current.page.screenshot({path:path.join(root,'qa/capture-failure.png')});fs.writeFileSync(path.join(root,'qa/capture-failure.json'),JSON.stringify({error:error.message,url:current.page.url(),buttons:await current.page.getByRole('button').allTextContents(),headings:await current.page.getByRole('heading').allTextContents()},null,2));}
 if(obs){const status=await obs.call('GetRecordStatus');if(status.outputActive){const stopped=await obs.call('StopRecord');console.log('Failed take retained privately for diagnosis:',path.basename(stopped.outputPath));}}
 throw error;
}finally{if(current)await current.browser.close();if(obs)await obs.disconnect();}
