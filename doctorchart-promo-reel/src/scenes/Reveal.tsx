import {AbsoluteFill,useCurrentFrame} from 'remotion';
import {Backdrop,Brand,Heading,Shot,enter} from '../ui';
import {theme as t} from '../theme';
import type {SceneProps} from '../types';
export const Reveal=(_:SceneProps)=>{const f=useCurrentFrame();return <AbsoluteFill><Backdrop/>
 <div style={{position:'absolute',left:84,top:248,opacity:enter(f)}}><Brand small/></div>
 <Heading size={88}><div style={{marginTop:95}}>Todo en<br/><span style={{color:t.teal}}>un solo lugar.</span></div></Heading>
 <Shot asset="patients" crop={[530,100,1400,1460]} width={930} height={830} top={680} left={84} tilt={-3} zoom={1.03}/>
 <div style={{position:'absolute',left:124,top:1265,background:t.ink,color:'#fff',padding:'24px 32px',borderRadius:20,fontSize:36,fontWeight:700,opacity:enter(f,28),translate:`0px ${(1-enter(f,28))*35}px`}}>Pacientes. Historias. Consultas.</div>
 </AbsoluteFill>};
