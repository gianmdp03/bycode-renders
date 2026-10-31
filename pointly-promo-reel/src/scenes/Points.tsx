import {interpolate,useCurrentFrame} from 'remotion';
import {PromoReveal} from '@bycode/video-system/promo';
import {Backdrop,Headline,Kicker,Capture,Icon,ease} from '../ui';
import {t} from '../theme';
import type {SceneProps} from '../types';
export const Points=({duration}:SceneProps)=>{const f=useCurrentFrame();return <Backdrop>
 <div style={{position:'absolute',left:84,right:168,top:245}}><Kicker>COMPRA → PUNTOS</Kicker><Headline>Cada compra<br/><span style={{color:t.accent}}>suma.</span></Headline></div>
 <Capture id="points" top={640} height={724} offset={interpolate(f,[0,65,110,duration],[-350,-350,0,-20],ease)}/>
 <div style={{position:'absolute',left:500,top:505,rotate:`${interpolate(f,[0,duration],[-6,2],ease)}deg`}}><PromoReveal start={60} duration={22} distance={36}><div style={{display:'flex',alignItems:'center',gap:16,background:t.accent,color:'white',padding:'18px 25px',borderRadius:26,boxShadow:'0 18px 42px #1a73e83a'}}><Icon name="coin" size={44}/><span style={{fontSize:46,fontWeight:700}}>+80 puntos</span></div></PromoReveal></div>
 </Backdrop>};
