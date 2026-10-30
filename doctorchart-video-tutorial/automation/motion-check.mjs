import fs from 'node:fs';import path from 'node:path';
import {root,base,openBrowser,login} from './browser.mjs';import {Recorder,calibrate,obsConnect} from './recorder.mjs';
const {browser,page}=await openBrowser({headed:true});const obs=await obsConnect();const r=new Recorder(page,obs);await r.init();let displayItem=null,windowItem=null;
try{
 await login(page,'B');await page.goto(base+'/patients');await page.getByRole('table',{name:'Directorio de pacientes'}).waitFor();await calibrate(page,obs);
 if(process.env.TUTORIAL_DISPLAY_TEST==='1'){
  const list=await obs.call('GetInputPropertiesListPropertyItems',{inputName:'DoctorChart Native Display',propertyName:'monitor_id'});const monitor=list.propertyItems.find(i=>i.itemEnabled&&String(i.itemName).includes('1920x1080'));
  if(!monitor)throw Error('No exact native display for diagnostic');
  await obs.call('SetInputSettings',{inputName:'DoctorChart Native Display',inputSettings:{monitor_id:monitor.itemValue,method:1,capture_cursor:false},overlay:true});
  displayItem=(await obs.call('GetSceneItemId',{sceneName:'Tutorial',sourceName:'DoctorChart Native Display'})).sceneItemId;windowItem=(await obs.call('GetSceneItemId',{sceneName:'Tutorial',sourceName:'DoctorChart REAL'})).sceneItemId;
  await obs.call('SetSceneItemEnabled',{sceneName:'Tutorial',sceneItemId:displayItem,sceneItemEnabled:true});await obs.call('SetSceneItemEnabled',{sceneName:'Tutorial',sceneItemId:windowItem,sceneItemEnabled:false});
  await page.bringToFront();await new Promise(r=>setTimeout(r,1000));
 }
 const chapter={id:displayItem!==null?'qa-native-display':'qa-native-motion',title:'Cadencia nativa de captura',expected_state:'Desplazamiento real del directorio con movimiento nativo de UI'};
 await r.begin(chapter);await r.beat({id:'qa-native-motion-beat',text:'Prueba de cadencia del desplazamiento real.',minSeconds:6,audioDurationMs:0},async()=>{await r.scroll(900);await r.scroll(-900);});await r.end();
}finally{if(displayItem!==null){await obs.call('SetSceneItemEnabled',{sceneName:'Tutorial',sceneItemId:displayItem,sceneItemEnabled:false});await obs.call('SetSceneItemEnabled',{sceneName:'Tutorial',sceneItemId:windowItem,sceneItemEnabled:true});}await browser.close();await obs.disconnect();}
