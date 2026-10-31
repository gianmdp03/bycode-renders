import {Img,staticFile,useCurrentFrame} from 'remotion';
import {PromoReveal} from '@bycode/video-system/promo';
import {Stage,Line,progress,Arrow} from '../ui';
import type {SceneProps} from '../types';
export const Ecosystem=({duration}:SceneProps)=>{const f=useCurrentFrame();return <Stage dark kicker="CADA APLICACIÓN, ESPECIALIZADA">
 <div style={{marginTop:35}}><Line size={93} color="#fff">Elegí lo que</Line><Line size={93} delay={10} color="#fff">tu trabajo</Line><Line size={102} delay={20} color="#93bcff">necesita.</Line></div>
 <div style={{position:'relative',height:275,marginTop:42}}><svg width="828" height="260" viewBox="0 0 828 260" style={{position:'absolute'}}><path d="M175 80H650" stroke="#93bcff" strokeWidth="2" strokeDasharray="475" strokeDashoffset={475*(1-progress(f,45,90))}/><path d="M414 80V215" stroke="#93bcff" strokeWidth="2" strokeDasharray="135" strokeDashoffset={135*(1-progress(f,85,60))}/></svg>
 {['pointly','doctorchart'].map((n,i)=><PromoReveal key={n} start={35+i*15} duration={35} style={{position:'absolute',left:i?534:48,top:5}}><div style={{width:155,height:155,borderRadius:26,background:'#fff',display:'grid',placeItems:'center'}}><Img src={staticFile(`logos/${n}-logo.svg`)} style={{width:125,height:125}}/></div><div style={{textAlign:'center',fontSize:30,marginTop:17}}>{i?'DoctorChart':'Pointly'}</div></PromoReveal>)}
 <PromoReveal start={85} duration={35} style={{position:'absolute',top:214,left:310,width:208,textAlign:'center',background:'#10284b',color:'#b9c9e3',fontSize:28}}>Tu cuenta</PromoReveal>
 </div><PromoReveal start={95} duration={40}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',borderTop:'1px solid #ffffff30',paddingTop:30}}><div style={{fontSize:44,lineHeight:1.3}}>Desde tu navegador.<br/><span style={{fontSize:29,color:'#b9c9e3'}}>Servicios independientes.</span></div><div style={{rotate:`${progress(f,105,duration)*8}deg`}}><Arrow color="#93bcff" size={72}/></div></div></PromoReveal>
 </Stage>};
