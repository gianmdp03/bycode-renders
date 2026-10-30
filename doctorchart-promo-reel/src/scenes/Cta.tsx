import {AbsoluteFill} from 'remotion';
import {Backdrop,Brand} from '../ui';
import {PromoCta,PromoReveal,PromoTitle} from '@bycode/video-system/promo';
import {theme as t} from '../theme';
import type {SceneProps} from '../types';
export const Cta=({url=''}:SceneProps&{url?:string})=> <AbsoluteFill><Backdrop/>
 <PromoReveal duration={32} distance={35} style={{position:'absolute',left:84,top:555}}><Brand/></PromoReveal>
 <PromoTitle fontSize={83} style={{position:'absolute',left:84,right:168,top:750,lineHeight:1.07,letterSpacing:-3}}>Tu consultorio,<br/><span style={{color:t.teal}}>mejor organizado.</span></PromoTitle>
 <PromoReveal start={14} duration={32} distance={18} style={{position:'absolute',top:1090,left:84,right:168}}><PromoCta fontSize={41} style={{height:115,backgroundColor:t.ink,color:'white',borderRadius:60,justifyContent:'center',alignItems:'stretch',padding:'0 40px'}}><span style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>Conocé DoctorChart<span style={{color:t.teal,fontSize:50}}>↗</span></span></PromoCta></PromoReveal>
 {url?<div style={{position:'absolute',left:84,top:1250,color:t.muted,fontSize:30}}>{url}</div>:null}
 </AbsoluteFill>;
