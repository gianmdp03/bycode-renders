import {Img,staticFile,useCurrentFrame} from 'remotion';
import {PromoReveal} from '@bycode/video-system/promo';
import {Stage,Line,ProductName,progress} from '../ui';
import {t} from '../theme';
import type {SceneProps} from '../types';
export const DoctorChart=({duration}:SceneProps)=>{const f=useCurrentFrame();return <Stage kicker="DESARROLLAMOS DOCTORCHART">
 <ProductName name="DoctorChart" file="doctorchart-logo.svg"/><Line size={88} delay={8}>Tu consultorio,</Line><Line size={88} delay={18} color={t.accent}>organizado.</Line>
 <PromoReveal start={24} duration={42} distance={90}><div style={{marginTop:42,border:`2px solid ${t.border}`,borderRadius:24,overflow:'hidden',height:540,background:'#fff',boxShadow:'0 22px 50px #10284b10'}}>
 <div style={{height:58,background:'#f3f6fb',display:'flex',alignItems:'center',padding:'0 24px',fontSize:23,color:t.muted,borderBottom:`1px solid ${t.border}`}}>DoctorChart <span style={{marginLeft:'auto'}}>Crecimiento pediátrico</span></div>
 <div style={{height:480,overflow:'hidden',position:'relative'}}><Img src={staticFile('captures/doctorchart-growth-light.webp')} style={{position:'absolute',width:1190,maxWidth:'none',left:-20-progress(f,60,duration)*100,top:-160-progress(f,60,duration)*40}}/></div>
 </div></PromoReveal><div style={{marginTop:20,fontSize:24,color:t.muted}}>Captura real · Paciente ficticio</div>
 </Stage>};
