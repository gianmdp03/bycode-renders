import {AbsoluteFill,Audio,OffthreadVideo,Img,Freeze,staticFile,useCurrentFrame,interpolate} from 'remotion';
import {BrandProvider,BrandLockup,createProductBrand,pointlyFrontendTheme} from '@bycode/video-system/brand';
import type {Caption} from '@remotion/captions';
import './fonts';
export type ChapterData={id:string;title:string;footage:string;audio:string;durationInFrames:number;sourceStart:number;sourceFrames:number;captions:Caption[];opening?:boolean;closing?:boolean};
const brand=createProductBrand('pointly',pointlyFrontendTheme);
export const Chapter=({data,layerOnly=false}:{data:ChapterData;layerOnly?:boolean})=>{
 const frame=useCurrentFrame();const caption=data.captions.find(c=>c.startMs<=frame/60*1000&&c.endMs>frame/60*1000);
 const cover=data.opening&&frame<270||data.closing&&frame>Math.max(0,data.durationInFrames-420);
 return <BrandProvider brand={brand}><AbsoluteFill style={{background:'#f3f6fb',color:'#10284b',fontFamily:brand.typography.fontFamily}}>
  <div style={{position:'absolute',left:96,top:9,fontSize:24,fontWeight:600}}><span style={{color:'#1a73e8',marginRight:16}}>{data.id.slice(0,2)}</span>{data.title}</div>
  <div style={{position:'absolute',left:96,top:49,width:1728,height:956,overflow:'hidden',borderRadius:12,boxShadow:'0 4px 24px #10284b12',background:'white'}}>
   {!layerOnly&&<div style={{width:'100%',height:'100%',transformOrigin:'68% 60%',scale:data.id==='16-physical-reward'?1+.12*(.5-.5*Math.cos(Math.PI*Math.min(Math.max((frame-480)/120,0),1)))*(.5-.5*Math.cos(Math.PI*Math.min(Math.max((1560-frame)/120,0),1))):1}}>{frame<data.sourceFrames?<OffthreadVideo muted src={staticFile(data.footage)} startFrom={data.sourceStart} style={{width:1728,height:972,marginTop:-7.2}}/>:<Freeze frame={data.sourceStart+data.sourceFrames-1}><OffthreadVideo muted src={staticFile(data.footage)} style={{width:1728,height:972,marginTop:-7.2}}/></Freeze>}</div>}
  </div>
  {!layerOnly&&<Audio src={staticFile(data.audio)}/>}
  {!layerOnly&&caption&&<div style={{position:'absolute',left:220,right:220,top:1017,height:54,display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,fontWeight:400,lineHeight:1.18,textAlign:'center',color:'#10284b'}}>{caption.text}</div>}
  <div style={{position:'absolute',left:96,bottom:5,width:1728,height:3,background:'#dce3ed'}}/>
  {cover&&<AbsoluteFill style={{background:'#f3f6fb',opacity:data.opening?interpolate(frame,[0,20,240,270],[0,1,1,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'}):interpolate(frame,[data.durationInFrames-420,data.durationInFrames-390],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'}),alignItems:'center',justifyContent:'center'}}>
   <Img src={staticFile('logo.svg')} style={{width:120,height:120,objectFit:'contain',marginBottom:28}}/>
   <BrandLockup style={{fontSize:88,fontWeight:700}}/>
   <div style={{fontSize:34,marginTop:18,color:'#576980'}}>{data.opening?'Tutorial completo · del primer ingreso al canje':'Clientes, compras y recompensas'}</div>
   <div style={{display:'flex',alignItems:'center',gap:14,marginTop:44}}><Img src={staticFile('bycode-logo.svg')} style={{width:64,height:64,objectFit:'contain'}}/><span style={{fontSize:24,color:'#576980'}}>Bycode Software</span></div>
   {!layerOnly&&caption&&<div style={{position:'absolute',left:220,right:220,bottom:35,fontSize:28,lineHeight:1.2,textAlign:'center'}}>{caption.text}</div>}
  </AbsoluteFill>}
  <AbsoluteFill style={{background:'#f3f6fb',opacity:interpolate(frame,[0,9,Math.max(10,data.durationInFrames-9),data.durationInFrames],[1,0,0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'})}}/>
 </AbsoluteFill></BrandProvider>;
};
