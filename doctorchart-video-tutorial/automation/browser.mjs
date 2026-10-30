import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
export const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export const local=path.join(root,'.local');
export const base='http://localhost:24202';
export const accounts=()=>JSON.parse(fs.readFileSync(path.join(local,'accounts.json'),'utf8'));
export async function openBrowser({headed=false,profile='recording'}={}){
 const cert=new crypto.X509Certificate(fs.readFileSync(path.join(local,'certs/server.pem')));
 const pin=crypto.createHash('sha256').update(cert.publicKey.export({type:'spki',format:'der'})).digest('base64');
 const launch={channel:'chrome',headless:!headed,chromiumSandbox:true,args:['--ignore-certificate-errors-spki-list='+pin,'--disable-notifications','--disable-features=Translate,PasswordManagerOnboarding','--disable-save-password-bubble','--force-device-scale-factor=1','--window-size=1920,1200','--window-position=0,0']};
 const settings={viewport:{width:1920,height:1080},deviceScaleFactor:1,locale:'es-AR',timezoneId:'America/Argentina/Buenos_Aires',colorScheme:'light',acceptDownloads:true};
 if((process.env.TUTORIAL_UNLIMITED_COMPOSITOR??'1')==='1')launch.args.push('--disable-frame-rate-limit','--disable-gpu-vsync');
 if((process.env.TUTORIAL_SOFTWARE_COMPOSITOR??'1')==='1')launch.args.push('--disable-gpu','--disable-gpu-compositing','--disable-direct-composition');
 const browser=await chromium.launch(launch);
 const context=await browser.newContext(settings);
 // No HAR or full network trace: those contain bearer/refresh tokens.
 const page=context.pages()[0]??await context.newPage();
 await context.route('**/*',route=>{const u=new URL(route.request().url());const internalPdf=u.protocol==='chrome-extension:'&&u.hostname==='mhjfbmdgcfjbbpaeojofohoefgiehjai'||u.protocol==='chrome:'&&u.hostname==='resources';return ['localhost','127.0.0.1'].includes(u.hostname)||['data:','blob:'].includes(u.protocol)||internalPdf?route.continue():route.abort('blockedbyclient');});
 const failures=[];
 page.on('requestfailed',r=>{const u=new URL(r.url());if(u.pathname.startsWith('/api/'))failures.push({path:u.pathname,error:r.failure()?.errorText});});
 page.on('pageerror',e=>failures.push({error:e.name,message:e.message.slice(0,200)}));
 return {browser:browser??{close:()=>context.close()},context,page,failures};
}
export async function login(page,key){
 const a=accounts()[key];
 await page.goto(base+'/login');
 await page.getByLabel('Correo electrónico',{exact:true}).fill(a.email);
 await page.getByLabel('Contraseña',{exact:true}).fill(a.password);
 await page.getByRole('button',{name:'Ingresar a DoctorChart',exact:true}).click();
 await page.waitForURL(['A','A2'].includes(key)?/\/onboarding\/(setup|select-specialty)$/:key==='NO_PLAN'?/\/plan-required(?:\?|$)/:key==='ADMIN'?'**/admin/specialties':'**/dashboard',{timeout:30000});
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const {browser,page,failures}=await openBrowser();
 try{
  await login(page,'B');await page.getByRole('link',{name:'Ver directorio',exact:true}).waitFor();
  await page.screenshot({path:path.join(root,'qa/runtime-dashboard.png')});
  console.log(JSON.stringify({url:page.url(),headings:await page.getByRole('heading').allTextContents(),failures}));
 }catch(e){
  await page.screenshot({path:path.join(root,'qa/runtime-login-failure.png')});
  console.log(JSON.stringify({url:page.url(),alerts:await page.getByRole('alert').allTextContents(),failures}));
  throw e;
 }finally{await browser.close();}
}
