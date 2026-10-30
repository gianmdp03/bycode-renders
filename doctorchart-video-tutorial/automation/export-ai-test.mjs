// Reproducible TEST export. This does not register approval or produce a final master.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const python=path.join(root,'.local/voice-venv/Scripts/python.exe');
const run=(command,args)=>new Promise((resolve,reject)=>{
 const child=spawn(command,args,{cwd:root,stdio:'inherit',windowsHide:true});
 child.on('error',reject);
 child.on('exit',code=>code===0?resolve():reject(new Error(`${path.basename(command)} exited ${code}`)));
});
await run(python,['automation/compile-ai-video.py']);
const data=JSON.parse(fs.readFileSync(path.join(root,'remotion/src/ai-timeline.json'),'utf8'));
const cache=path.join(root,'.local/ai-render');
const snapshot=path.join(cache,'snapshot.json');
if(fs.existsSync(snapshot)&&JSON.parse(fs.readFileSync(snapshot,'utf8')).stateSha256!==data.stateSha256){
 const archives=path.join(root,'.local/ai-render-archives');
 fs.mkdirSync(archives,{recursive:true});
 const target=path.join(archives,new Date().toISOString().replace(/[:.]/g,'-'));
 // Both resolved absolute paths are constrained to this project's owned render cache.
 if(path.dirname(cache)!==path.join(root,'.local')||path.dirname(target)!==archives)throw new Error('Unsafe cache archive path');
 fs.renameSync(cache,target);
 console.log('Previous render cache preserved:',target);
}
await run(process.execPath,['automation/render-ai-layers.mjs','--layers-only']);
const settled=await Promise.allSettled([
 run(process.execPath,['automation/render-ai-layers.mjs','--zooms-only']),
 run(python,['automation/render-ai-captures.py'])
]);
for(const result of settled)if(result.status==='rejected')throw result.reason;
await run(python,['automation/render-ai-captures.py','--assemble']);
await run(python,['automation/verify-ai-video.py']);
await run(python,['automation/finalize-ai-test.py']);
console.log('TEST MP4 ready:',path.join(root,'output/DoctorChart-Tutorial-Prueba-IA.mp4'));
