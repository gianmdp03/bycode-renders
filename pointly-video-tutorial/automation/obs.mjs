import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import OBSWebSocket from '../../doctorchart-video-tutorial/node_modules/obs-websocket-js/dist/json.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export async function obsConnect(){
 const auth=JSON.parse(fs.readFileSync(path.join(root,'.local/obs-auth.json'),'utf8'));
 const obs=new OBSWebSocket();await obs.connect('ws://127.0.0.1:'+auth.port,auth.password);return obs;
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const obs=await obsConnect();
 try{console.log(JSON.stringify({version:await obs.call('GetVersion'),video:await obs.call('GetVideoSettings'),monitors:await obs.call('GetMonitorList'),scenes:await obs.call('GetSceneList')}));}finally{await obs.disconnect();}
}

