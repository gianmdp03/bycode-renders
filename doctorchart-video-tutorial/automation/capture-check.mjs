import fs from 'node:fs';
import path from 'node:path';
import {openBrowser,login,root} from './browser.mjs';
import {obsConnect} from './obs.mjs';
const {browser,page}=await openBrowser({headed:true});
const obs=await obsConnect();
try{
 await login(page,'B');await page.getByRole('link',{name:'Ver directorio',exact:true}).waitFor();
 console.log('BROWSER',JSON.stringify(await page.evaluate(()=>({innerWidth,innerHeight,outerWidth,outerHeight,devicePixelRatio,screen:{width:screen.width,height:screen.height}}))));
 if(!(await obs.call('GetInputList')).inputs.some(x=>x.inputName==='DoctorChart REAL'))await obs.call('CreateInput',{sceneName:'Tutorial',inputName:'DoctorChart REAL',inputKind:'window_capture',inputSettings:{cursor:false,client_area:true,method:2},sceneItemEnabled:true});
 const windows=await obs.call('GetInputPropertiesListPropertyItems',{inputName:'DoctorChart REAL',propertyName:'window'});
 console.log('WINDOWS',JSON.stringify(windows));
 fs.writeFileSync(path.join(root,'.local/capture-windows.json'),JSON.stringify(windows,null,2));
 const candidates=windows.propertyItems.filter(x=>String(x.itemName).includes('DoctorChart')&&String(x.itemValue).includes('chrome.exe'));
 if(candidates.length!==1)throw Error('Expected exactly one DoctorChart window; found '+candidates.length);
 await obs.call('SetInputSettings',{inputName:'DoctorChart REAL',inputSettings:{window:candidates[0].itemValue,cursor:false,client_area:true,method:2},overlay:true});
 await page.screenshot({path:path.join(root,'qa/browser-native-check.png')});
 await obs.call('SaveSourceScreenshot',{sourceName:'DoctorChart REAL',imageFormat:'png',imageFilePath:path.join(root,'qa/obs-native-check.png')});
 console.log('TRANSFORM',JSON.stringify(await obs.call('GetSceneItemTransform',{sceneName:'Tutorial',sceneItemId:(await obs.call('GetSceneItemId',{sceneName:'Tutorial',sourceName:'DoctorChart REAL'})).sceneItemId})));
 fs.writeFileSync(path.join(root,'qa/capture-native-dimensions.json'),JSON.stringify({windows:candidates},null,2));
}finally{await obs.disconnect();await browser.close();}
