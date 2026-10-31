import {Img,staticFile,useCurrentFrame} from 'remotion';
import {PromoReveal} from '@bycode/video-system/promo';
import {Stage,Line,ProductName,progress} from '../ui';
import {t} from '../theme';
import type {SceneProps} from '../types';
export const Pointly=({duration}:SceneProps)=>{const f=useCurrentFrame();return <Stage kicker="DESARROLLAMOS POINTLY">
 <ProductName name="Pointly" file="pointly-logo.svg"/><Line size={86} delay={8}>Clientes. Puntos.</Line><Line size={86} delay={19} color={t.accent}>Recompensas.</Line>
 <PromoReveal start={24} duration={42} distance={90}><div style={{marginTop:45,border:`2px solid ${t.border}`,borderRadius:24,overflow:'hidden',background:'#fff',height:540,boxShadow:'0 22px 50px #10284b10'}}>
 <div style={{height:58,background:'#f3f6fb',display:'flex',alignItems:'center',padding:'0 24px',fontSize:23,color:t.muted,borderBottom:`1px solid ${t.border}`}}>Pointly <span style={{marginLeft:'auto'}}>Premios canjeables</span></div>
 <div style={{overflow:'hidden',height:480,width:670,margin:'0 auto',position:'relative',scale:1+progress(f,40,duration)*.015}}><Img src={staticFile('captures/pointly-rewards-light.webp')} style={{position:'absolute',width:2112,maxWidth:'none',left:0,top:-137}}/></div>
 </div></PromoReveal><div style={{marginTop:20,fontSize:24,color:t.muted}}>Captura real · Datos de demostración</div>
 </Stage>};
