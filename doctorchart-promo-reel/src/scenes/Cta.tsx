import {AbsoluteFill,useCurrentFrame} from 'remotion';
import {Backdrop,Brand,enter} from '../ui';
import {theme as t} from '../theme';
import type {SceneProps} from '../types';
export const Cta=({url=''}:SceneProps&{url?:string})=>{const f=useCurrentFrame();return <AbsoluteFill><Backdrop/>
 <div style={{position:'absolute',left:84,top:555,opacity:enter(f),translate:`0px ${(1-enter(f))*35}px`}}><Brand/></div>
 <div style={{position:'absolute',left:84,right:168,top:750,color:t.ink,fontSize:83,lineHeight:1.07,letterSpacing:-3,fontWeight:700}}>Tu consultorio,<br/><span style={{color:t.teal}}>mejor organizado.</span></div>
 <div style={{position:'absolute',top:1090,left:84,right:168,height:115,background:t.ink,color:'white',borderRadius:60,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 40px',fontSize:41,fontWeight:700,opacity:enter(f,14)}}>Conocé DoctorChart<span style={{color:'#65DACC',fontSize:50}}>↗</span></div>
 {url?<div style={{position:'absolute',left:84,top:1250,color:t.muted,fontSize:30}}>{url}</div>:null}
 </AbsoluteFill>};
