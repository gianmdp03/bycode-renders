import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import {fileURLToPath} from 'node:url';import {chromium} from 'playwright';
export const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export const base='http://localhost:25201';
export const accounts=()=>JSON.parse(fs.readFileSync(path.join(root,'.local/accounts.json'),'utf8'));
export async function openBrowser({headed=false,responsive=process.argv.includes('--responsive')}={}){
 const cert=new crypto.X509Certificate(fs.readFileSync(path.join(root,'.local/certs/server.pem')));const pin=crypto.createHash('sha256').update(cert.publicKey.export({type:'spki',format:'der'})).digest('base64');
 const context=await chromium.launchPersistentContext(path.join(root,'.local','chrome-'+Date.now()),{channel:'chrome',headless:!headed,chromiumSandbox:true,viewport:responsive?{width:864,height:486}:{width:1920,height:1080},deviceScaleFactor:responsive?20/9:1,locale:'es-AR',timezoneId:'America/Argentina/Buenos_Aires',colorScheme:'light',acceptDownloads:true,args:['--auto-select-tab-capture-source-by-title=Pointly DEMO','--enable-usermedia-screen-capturing','--ignore-certificate-errors-spki-list='+pin,'--disable-notifications','--disable-features=Translate,PasswordManagerOnboarding','--disable-save-password-bubble','--force-device-scale-factor=1','--window-size=1936,1200','--window-position=-1936,0','--disable-gpu','--disable-gpu-compositing','--disable-direct-composition']});
 const browser={close:()=>context.close()};
 await context.grantPermissions(['clipboard-read','clipboard-write']);
 const blocked=[];await context.route('**/*',r=>{const u=new URL(r.request().url());if(['localhost','127.0.0.1'].includes(u.hostname)||['data:','blob:','chrome:','chrome-extension:'].includes(u.protocol))return r.continue();blocked.push(u.origin+u.pathname);return r.abort('blockedbyclient');});
 await context.addInitScript(()=>{
  // Recording annotation only: no UI content, validation or network behavior replaced.
  const install=()=>{if(document.getElementById('tutorial-pointer'))return;const p=document.createElement('div');p.id='tutorial-pointer';p.innerHTML='<svg width="30" height="36" viewBox="0 0 30 36"><path d="M3 2L3 29L10 22L16 34L22 31L16 20L26 20Z" fill="white" stroke="#10284b" stroke-width="2.2"/></svg>';Object.assign(p.style,{position:'fixed',left:'1600px',top:'900px',zIndex:2147483646,pointerEvents:'none',filter:'drop-shadow(0 2px 2px #0005)'});document.documentElement.appendChild(p);document.addEventListener('mousemove',e=>{p.style.left=e.clientX+'px';p.style.top=e.clientY+'px'},{passive:true});document.addEventListener('click',e=>{const c=document.createElement('div');Object.assign(c.style,{position:'fixed',left:(e.clientX-18)+'px',top:(e.clientY-18)+'px',width:'36px',height:'36px',border:'3px solid #1a73e8',background:'#1a73e822',borderRadius:'50%',zIndex:2147483645,pointerEvents:'none'});document.documentElement.appendChild(c);setTimeout(()=>c.remove(),350)},true);
   // A one-pixel production clock forces genuine compositor frames at native
   // cadence even on static screens. It is cropped out of the final picture.
   const clock=document.createElement('div');clock.id='capture-cadence';Object.assign(clock.style,{position:'fixed',left:'0',top:'0',width:'1px',height:'1px',zIndex:2147483644,pointerEvents:'none'});document.documentElement.appendChild(clock);let tick=0;const paint=()=>{clock.style.background=++tick%2?'#fff':'#000';requestAnimationFrame(paint)};requestAnimationFrame(paint);
  };document.addEventListener('DOMContentLoaded',install);if(document.documentElement)install();
 });
 const page=context.pages()[0]??await context.newPage();const failures=[];page.on('pageerror',e=>failures.push(e.message.slice(0,250)));
 return {browser,context,page,failures,blocked};
}
export async function login(page,key){const a=accounts()[key];await page.goto(base+'/login');await page.locator('input[type=email]').fill(a.email);await page.locator('input[type=password]').fill(a.password);await page.getByRole('button',{name:/Ingresar al panel/}).click();await page.waitForURL(u=>!u.pathname.includes('login'),{timeout:30000});}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const x=await openBrowser();try{await login(x.page,'B');await x.page.getByText('Mis comercios',{exact:true}).first().waitFor();await x.page.screenshot({path:path.join(root,'qa/initial-dashboard.png')});console.log((await x.page.locator('body').innerText()).slice(0,6000));console.log('FAILURES',x.failures,'BLOCKED',x.blocked);}finally{await x.browser.close();}
}



