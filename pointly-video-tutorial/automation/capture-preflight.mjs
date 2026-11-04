import fs from 'node:fs';import path from 'node:path';import {root,base,openBrowser,login} from './browser.mjs';import {calibrate,obsConnect} from './recorder.mjs';
const x=await openBrowser({headed:true});const obs=await obsConnect();
try{await login(x.page,'B');await x.page.getByRole('link',{name:'Ver Detalle',exact:true}).waitFor();
if(!(await obs.call('GetInputList')).inputs.some(x=>x.inputName==='Pointly REAL'))await obs.call('CreateInput',{sceneName:'Tutorial',inputName:'Pointly REAL',inputKind:'window_capture',inputSettings:{cursor:false,client_area:true,method:1},sceneItemEnabled:true});
await calibrate(x.page,obs);await obs.call('SaveSourceScreenshot',{sourceName:'Tutorial',imageFormat:'png',imageFilePath:path.join(root,'qa/native-preflight.png')});console.log('CALIBRATED');
}finally{await obs.disconnect();await x.browser.close();}
