import {staticFile,Img,interpolate,useCurrentFrame} from 'remotion';
import {BrandLockup} from '@bycode/video-system/brand';
import {PromoCta,PromoReveal} from '@bycode/video-system/promo';
import {Backdrop,Headline,Icon,ease} from '../ui';
import {t} from '../theme';
import type {SceneProps} from '../types';
export const Closing=({duration}:SceneProps)=>{const f=useCurrentFrame();return <Backdrop>
 <div style={{position:'absolute',left:84,top:265,width:828,display:'flex',justifyContent:'center'}}><PromoReveal><Img src={staticFile('logos/pointly.svg')} style={{width:208,height:208,scale:interpolate(f,[0,duration],[.96,1.04],ease)}}/></PromoReveal></div>
 <div style={{position:'absolute',left:84,right:168,top:535,textAlign:'center'}}><Headline size={112}>Pointly</Headline><div style={{fontSize:43,color:t.muted,lineHeight:1.25,marginTop:35}}>Un motivo para que<br/>vuelvan a elegirte.</div></div>
 <div style={{position:'absolute',left:84,top:940,width:828}}><PromoReveal start={15}><PromoCta fontSize={44} style={{padding:'30px 25px',borderRadius:28}}><span style={{display:'flex',alignItems:'center',justifyContent:'center',gap:22}}>Conocé Pointly <Icon name="arrow" size={42}/></span><div style={{fontSize:40,fontWeight:400,marginTop:16}}>pointly.bycode.com.ar</div></PromoCta></PromoReveal></div>
 <div style={{position:'absolute',left:84,top:1210,width:828,display:'flex',alignItems:'center',justifyContent:'center',gap:22,color:t.muted,fontSize:29}}><span>Un producto de</span><BrandLockup name="Bycode" logoSrc={staticFile('logos/bycode.svg')} size={35} iconSize={50}/></div>
 </Backdrop>};
