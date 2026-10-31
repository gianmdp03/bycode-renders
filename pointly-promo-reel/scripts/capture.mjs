import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import crypto from 'node:crypto';
import {chromium} from 'playwright';
import {root,repo,ffmpeg,run,save} from './tools.mjs';
const front=path.resolve(repo,'../pointly-frontend');
const base=path.join(root,'.local/frontend/browser');
const env=fs.readFileSync(path.join(front,'src/environments/environment.local.generated.ts'),'utf8');
const value=name=>env.match(new RegExp(`['"]?${name}['"]?\\s*:\\s*['"]([^'"]+)['"]`))?.[1];
const supabaseUrl=value('supabaseUrl');
if(!supabaseUrl)throw Error('Falta configuración local de Supabase para identificar el almacenamiento de la sesión ficticia.');
const sessionKey=`sb-${new URL(supabaseUrl).hostname.split('.')[0]}-auth-token`;
const company={id:71,publicName:'cafe-demo',name:'Café Demo',companyDetails:{country:'Argentina',city:'Mar del Plata'},amountStep:1000,pointsPerStep:10,isEnabled:true,isPointsExpirationEnabled:false,isInactiveClientPurgeEnabled:false,isTiersEnabled:false,totalClientsCount:3,products:[],promotions:[],rewards:[
 {id:1,name:'Café de regalo',description:'Un café para disfrutar en tu próxima visita.',costInPoints:200,isEnabled:true,kind:'PHYSICAL'},
 {id:2,name:'Descuento en tu compra',description:'Canjeá tus puntos por un descuento del 15%.',costInPoints:350,isEnabled:true,kind:'VOUCHER',voucherType:'PERCENTAGE',voucherValue:15}
]};
const client={id:801,dni:'99000101',country:'Argentina',name:'Lucía Demo',email:'lucia@example.invalid',isNotificationEnabled:false};
let balance=320;
let sales=[{id:901,amount:5000,client,userName:client.name,pointsGenerated:50,createdAt:'2026-10-30T14:30:00-03:00'}];
const accounts=()=>[client,{...client,id:802,dni:'99000102',name:'Mateo Demo'},{...client,id:803,dni:'99000103',name:'Sofía Demo'}].map((c,i)=>({id:810+i,company,client:c,balance:i===0?balance:180+i*45,membershipStatus:'ACTIVE',lastActivityDate:'2026-10-30T14:30:00-03:00'}));
const publicCompany=()=>({...company,clientBalance:balance,clientName:client.name,membershipStatus:'ACTIVE',activePromotions:[]});
const paged=content=>({content,page:{size:100,number:0,totalElements:content.length,totalPages:1},totalElements:content.length,totalPages:1,number:0,size:100});
const user={id:'00000000-0000-4000-8000-000000000071',email:'comercio@example.invalid',aud:'authenticated',role:'authenticated',created_at:'2026-10-30T00:00:00Z',user_metadata:{name:'Comercio Demo',dni:'99000001'},app_metadata:{role:'COMPANY',app_modules:{pointly:{tier:'PRO',active:true,expires_at:'2099-12-31T23:59:59Z'}}}};
const jwt=[{alg:'HS256',typ:'JWT'},{sub:user.id,aud:'authenticated',role:'authenticated',exp:4102444800,...user},'fixture-only'].map((x,i)=>i===2?x:Buffer.from(JSON.stringify(x)).toString('base64url')).join('.');
const session={access_token:jwt,refresh_token:'synthetic-local-fixture',expires_in:3600*24*365,expires_at:4102444800,token_type:'bearer',user};
const requests=[],errors=[],records=[];
const mime={'.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.woff2':'font/woff2','.png':'image/png','.json':'application/json'};
const server=http.createServer((req,res)=>{
 let file=path.resolve(base,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
 if(!file.startsWith(base+path.sep)&&file!==base){res.writeHead(403).end();return;}
 if(!fs.existsSync(file)||fs.statSync(file).isDirectory())file=path.join(base,fs.existsSync(path.join(base,'index.csr.html'))?'index.csr.html':'index.html');
 res.setHeader('Content-Type',mime[path.extname(file)]??'text/html');res.end(fs.readFileSync(file));
});
await new Promise(resolve=>server.listen(4361,'127.0.0.1',resolve));
const browser=await chromium.launch({channel:'chrome',headless:true});
async function context(viewport={width:600,height:850}){
 const ctx=await browser.newContext({viewport,deviceScaleFactor:2,locale:'es-AR',timezoneId:'America/Argentina/Buenos_Aires',colorScheme:'light',serviceWorkers:'block'});
 await ctx.addInitScript(({sessionKey,session})=>{localStorage.setItem('color-theme','light');localStorage.setItem(sessionKey,JSON.stringify(session));},{sessionKey,session});
 await ctx.route('**/*',async route=>{
  const req=route.request(),url=new URL(req.url()),p=url.pathname;
  if(url.hostname==='127.0.0.1'&&url.port==='4361')return route.continue();
  requests.push({method:req.method(),path:p});
  const fulfill=data=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(data)});
  if(p.includes('/auth/v1/token'))return fulfill(session);
  if(p.includes('/auth/v1/user'))return fulfill(user);
  if(p.includes('/api/billing/account/profile'))return fulfill({id:user.id,name:'Comercio Demo',dni:'99000001',email:user.email});
  if(p.endsWith('/countries.json'))return fulfill([{name:{common:'Argentina',official:'República Argentina'},cca2:'AR',idd:{root:'+5',suffixes:['4']}}]);
  if(p.includes('/limits/'))return fulfill({plan:'PRO',maxBranches:3,maxClients:500,canHavePromotions:true});
  if(p.includes('/point-expirations/query'))return fulfill({availablePoints:balance,expiringPoints:0,nonExpiringPoints:balance,asOf:'2026-10-30T17:30:00Z',timeZone:'America/Argentina/Buenos_Aires',revision:'demo',expirations:[],page:{size:50,number:0,totalElements:0,totalPages:0}});
  if(p.includes('/client-access/companies/cafe-demo/query')||p.match(/\/public\/clients\/[^/]+\/[^/]+\/companies\/71$/))return fulfill(publicCompany());
  if(p.includes('/client-access/companies/query'))return fulfill({...paged([{...company,clientBalance:balance}]),clientName:client.name});
  if(p.includes('/company-names/cafe-demo/company')||p.match(/\/companies\/71$/))return fulfill(company);
  if(p.match(/\/companies(\/my-companies)?$/))return fulfill(paged([company]));
  if(p.match(/\/sales$/)&&req.method()==='POST'){
   const data=req.postDataJSON();const earned=Math.floor(data.amount/company.amountStep)*company.pointsPerStep;balance+=earned;
   const sale={id:902,amount:data.amount,client,userName:client.name,pointsGenerated:earned,createdAt:'2026-10-30T17:35:00Z'};sales=[sale,...sales];return fulfill({...sale,company});
  }
  if(p.match(/\/sales\/71$/))return fulfill(paged(sales));
  if(p.match(/\/points-accounts\/71$/))return fulfill(paged(accounts()));
  if(p.includes('/public/clients/access-links'))return fulfill({accessToken:'DEMO12345678',clientPath:'/client/DEMO12345678',clientName:client.name});
  errors.push('Unexpected blocked request: '+req.method()+' '+p);return route.abort();
 });
 return ctx;
}
async function ready(page){await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(700);}
async function scroll(page,delta,duration=1200){await page.evaluate(async({delta,duration})=>{const start=scrollY,began=performance.now();await new Promise(resolve=>{const tick=now=>{const t=Math.min(1,(now-began)/duration);window.scrollTo({top:start+delta*(t*t*(3-2*t)),behavior:'instant'});if(t<1)requestAnimationFrame(tick);else resolve();};requestAnimationFrame(tick);});},{delta,duration});}
async function top(locator){await locator.evaluate(el=>window.scrollTo({top:window.scrollY+el.getBoundingClientRect().top-26,behavior:'instant'}));}
async function record(page,id,action,seconds=4){
 const cdp=await page.context().newCDPSession(page);const dir=path.join(root,'.local/screencast',id);fs.mkdirSync(dir,{recursive:true});
 const frames=[];let count=0;
 cdp.on('Page.screencastFrame',async event=>{const n=count++;const file=path.join(dir,`${String(n).padStart(5,'0')}.png`);fs.writeFileSync(file,Buffer.from(event.data,'base64'));frames.push({file,time:event.metadata.timestamp});await cdp.send('Page.screencastFrameAck',{sessionId:event.sessionId}).catch(()=>{});});
 await cdp.send('Page.startScreencast',{format:'png',everyNthFrame:1,maxWidth:1600,maxHeight:2000});
 await page.waitForTimeout(180);const began=Date.now();await action();await page.waitForTimeout(Math.max(400,seconds*1000-(Date.now()-began)));
 await page.screenshot({path:path.join(root,'public/captures',id+'.png')});
 await cdp.send('Page.stopScreencast');await cdp.detach();
 if(!frames.length)throw Error('No screencast frames: '+id);
 const tail=Math.max(.3,seconds+.2-(frames.at(-1).time-frames[0].time));
 const concat=frames.map((f,i)=>`file '${f.file.replaceAll('\\','/')}'\nduration ${i+1<frames.length?Math.max(.0167,frames[i+1].time-f.time):tail}`).join('\n')+`\nfile '${frames.at(-1).file.replaceAll('\\','/')}'\n`;
 fs.writeFileSync(path.join(dir,'frames.txt'),concat);
 run(ffmpeg,['-v','error','-y','-f','concat','-safe','0','-i',path.join(dir,'frames.txt'),'-vf','fps=60,scale=1200:-2','-c:v','libx264','-preset','fast','-crf','16','-pix_fmt','yuv420p',path.join(root,'public/captures',id+'.mp4')]);
 records.push({id,url:new URL(page.url()).pathname,viewport:page.viewportSize(),frames:frames.length,duration:frames.at(-1).time-frames[0].time+tail,method:'Original Angular frontend; CDP screencast of actual controls; isolated in-memory API fixtures; no production requests'});
 console.log('Captured '+id+' '+frames.length+' actual frames');
}
try{
 const ctx=await context();const page=await ctx.newPage();page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4361/companies/cafe-demo');await page.getByRole('button',{name:'Registrar venta',exact:true}).waitFor({timeout:20000});await ready(page);
 await record(page,'overview',async()=>{await scroll(page,330);},3.5);
 await top(page.getByRole('heading',{name:'Clientes y Cuentas de Puntos',exact:true}));await ready(page);
 await record(page,'clients',async()=>{await page.waitForTimeout(500);await scroll(page,160);},4);
 await page.goto('http://127.0.0.1:4361/companies/cafe-demo/actions/sale');await page.getByPlaceholder('Ej. 40123456').waitFor();await ready(page);
 await page.getByPlaceholder('Ej. 40123456').fill('99000101');await page.getByPlaceholder('Ej. 1500').fill('8000');await ready(page);
 await top(page.getByText('Puntos estimados a sumar:',{exact:false}));await ready(page);
 await record(page,'points',async()=>{
  await page.waitForTimeout(600);await page.getByRole('button',{name:'Registrar venta y sumar puntos',exact:true}).click();await page.waitForTimeout(700);
  await page.waitForTimeout(500);await top(page.getByRole('heading',{name:'Clientes y Cuentas de Puntos',exact:true}));
 },4.4);
 if(balance!==400)throw Error('La compra ficticia no actualizó los puntos.');
 await page.getByRole('button',{name:/^Premios/}).click();await page.locator('.reward-card').first().waitFor();await top(page.locator('.reward-card').first());await ready(page);
 await record(page,'rewards',async()=>{await page.waitForTimeout(700);await scroll(page,95);},4.4);
 await ctx.close();
 const mobile=await context({width:430,height:820});const wallet=await mobile.newPage();wallet.on('pageerror',e=>errors.push(e.message));
 await wallet.goto('http://127.0.0.1:4361/client/DEMO12345678/cafe-demo');await wallet.locator('.cw-balance').waitFor();await ready(wallet);await top(wallet.locator('.cw-balance'));
 await record(wallet,'wallet',async()=>{await wallet.waitForTimeout(900);await scroll(wallet,210,1600);},5.2);
 await wallet.goto('http://127.0.0.1:4361/client/DEMO12345678/cafe-demo');await wallet.locator('.cw-balance').waitFor();await ready(wallet);await top(wallet.locator('.cw-balance'));
 await record(wallet,'balance',async()=>{await wallet.waitForTimeout(600);await wallet.locator('.cw-balance').click();await wallet.locator('.cw-detail-total').waitFor();await wallet.waitForTimeout(450);await top(wallet.locator('.cw-detail-total'));await wallet.waitForTimeout(450);await scroll(wallet,30);},5.2);
 await mobile.close();
}catch(e){console.error(e);errors.push(String(e));throw e;}finally{
 save('qa/capture-manifest.json',{frontend:'../pointly-frontend',commit:run('git',['-C',front,'rev-parse','HEAD']).stdout.trim(),fictionalData:true,backendSimulated:true,externalNetworkBlocked:true,records,requests,errors});
 await browser.close();await new Promise(resolve=>server.close(resolve));
}
