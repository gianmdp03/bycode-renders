import {Img,staticFile,useCurrentFrame} from 'remotion';
import {PromoCta,PromoReveal} from '@bycode/video-system/promo';
import {Stage,Line,Arrow,progress} from '../ui';
import {t} from '../theme';
import type {SceneProps} from '../types';
export const Closing=({duration}:SceneProps)=>{const f=useCurrentFrame();return <Stage kicker="BYCODE SOFTWARE">
 <div style={{width:200,height:200,marginBottom:36,scale:.92+progress(f,0,duration)*.08}}><Img src={staticFile('logos/bycode-logo.svg')} style={{width:'100%',height:'100%'}}/></div>
 <Line size={104}>Tecnología</Line><Line size={104} delay={10}>para tu</Line><Line size={104} delay={20} color={t.accent}>día a día.</Line>
 <PromoReveal start={38} duration={45}><PromoCta fontSize={39} style={{marginTop:42,borderRadius:16,padding:'26px 25px'}}><span style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:20}}>Conocé nuestras soluciones <Arrow color="#fff" size={38}/></span></PromoCta><div style={{marginTop:24,fontSize:43,fontWeight:600}}>@bycode.arg</div></PromoReveal>
 </Stage>};
