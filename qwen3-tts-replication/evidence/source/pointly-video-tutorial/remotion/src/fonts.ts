import {continueRender,delayRender,staticFile,cancelRender} from 'remotion';
const handle=delayRender('Local Google Sans');
if(typeof document!=='undefined'){
 const face=new FontFace('Google Sans',`url("${staticFile('fonts/google-sans.woff2')}")`,{weight:'400 700',style:'normal'});
 face.load().then(f=>{(document.fonts as FontFaceSet&{add:(font:FontFace)=>FontFaceSet}).add(f);continueRender(handle)}).catch(cancelRender);
}else continueRender(handle);
