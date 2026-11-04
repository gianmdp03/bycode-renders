import fs from 'node:fs';import path from 'node:path';import {root,base,openBrowser,login} from './browser.mjs';
const x=await openBrowser();
try{
 await login(x.page,'B');await x.page.getByRole('link',{name:'Ver Detalle',exact:true}).waitFor();
 const result=await x.page.evaluate(async()=>{
  const stream=await navigator.mediaDevices.getDisplayMedia({video:{width:{ideal:1920},height:{ideal:1080},frameRate:{ideal:60,max:60},displaySurface:'browser'},audio:false,preferCurrentTab:true,selfBrowserSurface:'include'});
  const settings=stream.getVideoTracks()[0].getSettings();const chunks=[];const rec=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp8',videoBitsPerSecond:40000000});await new Promise(resolve=>{rec.ondataavailable=e=>{chunks.push(e.data);resolve()};rec.start(250)});
  const begin=performance.now();let painted=0;await new Promise(resolve=>{const f=t=>{document.getElementById('tutorial-pointer').style.left=(200+(t-begin)*.3)+'px';painted++;if(t-begin<4000)requestAnimationFrame(f);else resolve()};requestAnimationFrame(f)});settings.paintFrames=painted;
  await new Promise(resolve=>{rec.onstop=resolve;rec.stop()});stream.getTracks().forEach(t=>t.stop());
  const blob=new Blob(chunks,{type:rec.mimeType});const data=await new Promise(resolve=>{const r=new FileReader();r.onload=()=>resolve(r.result.split(',')[1]);r.readAsDataURL(blob)});return {settings,data};
 });
 fs.writeFileSync(path.join(root,'qa/tab-capture-preflight.webm'),Buffer.from(result.data,'base64'));fs.writeFileSync(path.join(root,'qa/tab-capture-settings.json'),JSON.stringify(result.settings,null,2));console.log(result.settings);
}finally{await x.browser.close()}
