import {interpolate,useCurrentFrame} from 'remotion';
import {PromoReveal} from '@bycode/video-system/promo';
import {Backdrop,Headline,Kicker,Icon,Capture,ease} from '../ui';
import {t} from '../theme';
import type {SceneProps} from '../types';
export const Value=(_props:SceneProps)=>{const f=useCurrentFrame();return <Backdrop dark>
 <div style={{position:'absolute',left:84,right:168,top:245}}><Kicker dark>FIDELIZACIÓN PARA TU COMERCIO</Kicker><Headline dark>Todo conectado.<br/><span style={{color:t.accentLight}}>Más simple.</span></Headline></div>
 <div style={{position:'absolute',left:84,top:650,width:828,display:'flex',gap:18}}>
  <PromoReveal start={10}><div style={{width:264,height:185,borderRadius:28,background:'#ffffff0c',border:'1px solid #ffffff20',padding:'26px 24px',color:'white'}}><Icon name="person" size={54}/><div style={{fontSize:34,fontWeight:700,marginTop:16}}>Clientes</div></div></PromoReveal>
  <PromoReveal start={27}><div style={{width:264,height:185,borderRadius:28,background:t.accent,padding:'26px 24px',color:'white'}}><Icon name="coin" size={54}/><div style={{fontSize:34,fontWeight:700,marginTop:16}}>Puntos</div></div></PromoReveal>
  <PromoReveal start={44}><div style={{width:264,height:185,borderRadius:28,background:'#ffffff0c',border:'1px solid #ffffff20',padding:'26px 24px',color:'white'}}><Icon name="gift" size={54}/><div style={{fontSize:34,fontWeight:700,marginTop:16}}>Premios</div></div></PromoReveal>
 </div>
 <Capture id="balance" top={885} height={470} offset={interpolate(f,[0,85,120,340],[0,0,-520,-520],ease)} style={{borderColor:'#ffffff25',scale:interpolate(f,[0,340],[.98,1.01],ease)}}/>
 </Backdrop>};
