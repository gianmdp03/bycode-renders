import {Img,staticFile,useCurrentFrame} from 'remotion';
import {PromoReveal} from '@bycode/video-system/promo';
import {Stage,Line,progress,Rule} from '../ui';
import {t} from '../theme';
import type {SceneProps} from '../types';
export const Intro=({duration}:SceneProps)=>{const f=useCurrentFrame();return <Stage kicker="SOMOS BYCODE">
 <div style={{marginTop:30,display:'flex',alignItems:'center',justifyContent:'space-between'}}><div style={{background:'#fff',border:`1px solid ${t.border}`,borderRadius:28,width:220,height:220,display:'grid',placeItems:'center',scale:.92+progress(f,0,duration)*.08}}><Img src={staticFile('logos/bycode-logo.svg')} style={{width:190,height:190}}/></div><div style={{fontSize:93,fontWeight:700,letterSpacing:-5,lineHeight:1}}>Bycode<span style={{display:'block',fontSize:32,letterSpacing:5,color:t.muted,marginTop:17}}>SOFTWARE</span></div></div>
 <div style={{marginTop:70}}><Line size={94} delay={8}>Creamos</Line><Line size={94} delay={18} color={t.accent}>soluciones.</Line></div><Rule delay={30}/>
 <PromoReveal start={38} duration={32}><div style={{marginTop:38,fontSize:46,lineHeight:1.3}}>Para comercios.<br/>Para consultorios.<br/><span style={{color:t.muted}}>Para tu día a día.</span></div></PromoReveal>
 </Stage>};
