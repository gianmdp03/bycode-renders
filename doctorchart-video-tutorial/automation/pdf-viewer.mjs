import fs from 'node:fs';import path from 'node:path';import {execFileSync} from 'node:child_process';import {root} from './browser.mjs';
const wait=ms=>new Promise(r=>setTimeout(r,ms));
export async function showRealPdf(page,r,button=page.getByRole('button',{name:'Imprimir',exact:true}).first()){
 const popupPromise=page.waitForEvent('popup');const responsePromise=page.waitForResponse(x=>new URL(x.url()).pathname.endsWith('/pdf')&&x.request().method()==='GET');
 await r.click(button);const viewer=await popupPromise;const response=await responsePromise;
 if(response.status()!==200||!response.headers()['content-type']?.includes('application/pdf'))throw Error('Actual PDF failed: '+response.status());
 const bytes=await response.body();if(!bytes.subarray(0,5).equals(Buffer.from('%PDF-'))||bytes.length<1000)throw Error('Invalid actual PDF');
 fs.writeFileSync(path.join(root,'.local/generated-document-demo.pdf'),bytes);
 await viewer.waitForURL(/^blob:/,{timeout:30000});await viewer.waitForLoadState('load');await wait(1800);
 console.log('ACTUAL-PDF',JSON.stringify({status:response.status(),bytes:bytes.length,blobLoaded:true}));
 await showViewer(page,r,viewer);
}
export async function showViewer(page,r,viewer){
 let viewerItem=null;
 try{
  if(r.obs){
   const main=(await r.obs.call('GetInputSettings',{inputName:'DoctorChart REAL'})).inputSettings;
   const cdp=await viewer.context().newCDPSession(viewer);const w=await cdp.send('Browser.getWindowForTarget');await cdp.send('Browser.setWindowBounds',{windowId:w.windowId,bounds:{windowState:'fullscreen'}});await cdp.detach();await viewer.bringToFront();
   const title='Documento DEMO DoctorChart '+Date.now();await viewer.evaluate(t=>{document.title=t;},title);
   let match;for(let i=0;i<30;i++){const list=await r.obs.call('GetInputPropertiesListPropertyItems',{inputName:'DoctorChart REAL',propertyName:'window'});match=list.propertyItems.find(x=>String(x.itemName).includes(title));if(match)break;await wait(100);}if(!match)throw Error('PDF viewer window unavailable for real capture');
   const inputs=await r.obs.call('GetInputList');
   if(!inputs.inputs.some(x=>x.inputName==='DoctorChart PDF REAL'))await r.obs.call('CreateInput',{sceneName:'Tutorial',inputName:'DoctorChart PDF REAL',inputKind:'window_capture',inputSettings:{...main,window:match.itemValue},sceneItemEnabled:false});
   viewerItem=(await r.obs.call('GetSceneItemId',{sceneName:'Tutorial',sourceName:'DoctorChart PDF REAL'})).sceneItemId;
   await r.obs.call('SetSceneItemIndex',{sceneName:'Tutorial',sceneItemId:viewerItem,sceneItemIndex:0});
   await r.obs.call('SetInputSettings',{inputName:'DoctorChart PDF REAL',inputSettings:{...main,window:match.itemValue},overlay:false});
   await r.obs.call('SetSceneItemEnabled',{sceneName:'Tutorial',sceneItemId:viewerItem,sceneItemEnabled:true});await wait(1000);
   await r.obs.call('SaveSourceScreenshot',{sourceName:'DoctorChart PDF REAL',imageFormat:'png',imageFilePath:path.join(root,'qa/document-captured-real.png')});
   execFileSync(path.join(root,'.local/voice-venv/Scripts/python.exe'),[path.join(root,'automation/check-capture-image.py'),path.join(root,'qa/document-captured-real.png')]);
   const items=await r.obs.call('GetSceneItemList',{sceneName:'Tutorial'});
   await r.obs.call('SetSceneItemIndex',{sceneName:'Tutorial',sceneItemId:viewerItem,sceneItemIndex:items.sceneItems.length-1});await wait(6000);
  }
  await viewer.screenshot({path:path.join(root,'qa/document-viewer-rehearsal.png')});
 }finally{
  await page.bringToFront();await wait(300);
  if(viewerItem!==null)await r.obs.call('SetSceneItemEnabled',{sceneName:'Tutorial',sceneItemId:viewerItem,sceneItemEnabled:false});
  await viewer.close();
 }
}
