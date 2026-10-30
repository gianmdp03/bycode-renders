import fs from 'node:fs';import path from 'node:path';import {root,base,openBrowser,login} from './browser.mjs';
const results=[];
for(const account of ['NO_PLAN','ADMIN','B']){
 const {browser,page}=await openBrowser();
 try{
  await login(page,account);
  if(account==='NO_PLAN'){await page.goto(base+'/patients');await page.waitForURL(/\/plan-required(?:\?|$)/);await page.getByRole('heading',{name:'Necesitás un plan para continuar'}).waitFor();}
  if(account==='ADMIN'){await page.getByRole('heading').first().waitFor();if(!page.url().includes('/admin/specialties'))throw Error('Admin role route not reached');}
  if(account==='B')for(const route of ['/assistant','/calculators']){await page.goto(base+route);await page.waitForURL('**/dashboard');}
  await page.screenshot({path:path.join(root,'qa/role-'+account+'.png')});results.push({account,status:'PASS',url:page.url(),headings:await page.getByRole('heading').allTextContents(),proof:'qa/role-'+account+'.png'});
 }catch(error){results.push({account,status:'FAIL',error:error.message});}
 finally{await browser.close();}
}
const report={status:results.every(r=>r.status==='PASS')?'PASS':'FAIL',results,scope:'Read-only guards and navigation. No purchase, billing changes or admin edits.'};fs.writeFileSync(path.join(root,'qa/roles-report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));if(report.status==='FAIL')process.exitCode=1;
