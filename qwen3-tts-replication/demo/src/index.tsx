import React from 'react';
import {registerRoot,Composition,AbsoluteFill,Audio,staticFile,useCurrentFrame,useVideoConfig,delayRender,continueRender} from 'remotion';
import {BrandProvider,createProductBrand,pointlyFrontendTheme} from '@bycode/video-system/brand';
import {PromoCaptions} from '@bycode/video-system/promo';
import type {Caption} from '@remotion/captions';
const handle=delayRender('Google Sans local');
const font=new FontFace('Google Sans',`url("${staticFile('fonts/google-sans.woff2')}")`,{weight:'400 700'});
font.load().then(f=>{document.fonts.add(f);continueRender(handle)}).catch(e=>{throw e});
type Props={words:Caption[];phrases:Caption[];duration:number;mode:'tutorial'|'reel'};
// Exact Pointly tutorial caption geometry extracted from Chapter.tsx, no promotional import in this component.
const TutorialCaptions=({phrases}:{phrases:Caption[]})=>{
 const {fps}=useVideoConfig();const ms=useCurrentFrame()/fps*1000;const caption=phrases.find(c=>c.startMs<=ms&&ms<c.endMs);
 return caption?<div style={{position:'absolute',left:220,right:220,top:1017,height:54,display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,fontWeight:400,lineHeight:1.18,textAlign:'center',color:'#10284b'}}>{caption.text}</div>:null;
};
const Demo=(p:Props)=><BrandProvider brand={createProductBrand('pointly',pointlyFrontendTheme)}><AbsoluteFill style={{background:'#f3f6fb',fontFamily:'Google Sans',color:'#10284b'}}>
 <div style={{position:'absolute',left:96,top:80,fontSize:p.mode==='tutorial'?42:64}}>Bycode Software</div>
 <div style={{position:'absolute',left:96,right:120,top:250,fontSize:36,lineHeight:1.45}}>En este tutorial vamos a aprender<br/>a utilizar Pointly de forma sencilla y rápida.</div>
 <Audio src={staticFile('reference.wav')}/>
 {p.mode==='tutorial'?<TutorialCaptions phrases={p.phrases}/>:<PromoCaptions captions={p.words} fontSize={42}/>}
 </AbsoluteFill></BrandProvider>;
const defaults:Props={words:[],phrases:[],duration:10,mode:'tutorial'};
const Root=()=> <>{(['tutorial','reel'] as const).map(mode=><Composition key={mode} id={mode==='tutorial'?'Tutorial':'Reel'} component={Demo} fps={60} width={mode==='tutorial'?1920:1080} height={mode==='tutorial'?1080:1920} durationInFrames={600} defaultProps={{...defaults,mode}} calculateMetadata={({props})=>({durationInFrames:Math.ceil(props.duration*60)})}/>)}</>;
registerRoot(Root);
