import fs from 'node:fs';import path from 'node:path';import {openBrowser,login,root,base} from './browser.mjs';
const x=await openBrowser();try{
 // Headless has no physical print dialog. Keep only its print popup open long
 // enough to record the product's own HTML; no business handler is replaced.
 await x.context.addInitScript(()=>{if(window.opener){window.print=()=>{};window.close=()=>{};}});
 await login(x.page,'B');const ids=JSON.parse(fs.readFileSync(path.join(root,'.local/seed-ids.json')));
 await x.page.goto(base+'/companies/'+ids.publicName+'/actions/qr');
 const popupReady=x.page.waitForEvent('popup');await x.page.getByRole('button',{name:'Imprimir cartel'}).click();const popup=await popupReady;
 try{await popup.locator('.card').waitFor({timeout:5000});}catch(e){console.log(JSON.stringify({errors:x.failures,popupTitle:await popup.title(),html:(await popup.content()).slice(0,2000)}));throw e;}await popup.evaluate(()=>document.fonts.ready);await popup.locator('img.qr-img').evaluate(img=>img.decode());
 await popup.screenshot({path:path.join(root,'qa/qr-print-output.png')});await popup.locator('.card').screenshot({path:path.join(root,'remotion/public/print-qr.png')});
 fs.writeFileSync(path.join(root,'qa/print-verification.json'),JSON.stringify({state:'REAL_PRODUCT_PRINT_HTML',title:await popup.title(),heading:await popup.locator('h1').innerText(),qrDecoded:true,physicalPrintSent:false,captureOnly:'Native print and auto-close suppressed only in the headless popup to preserve its actual rendered content.'},null,2));
 console.log('Actual print card captured with loaded fonts and decoded QR.');
}finally{await x.browser.close()}
