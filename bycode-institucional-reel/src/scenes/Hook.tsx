import {useCurrentFrame} from 'remotion';
import {Stage,Line,progress,Arrow} from '../ui';
import {t} from '../theme';
import type {SceneProps} from '../types';
export const Hook=({duration}:SceneProps)=>{const f=useCurrentFrame();return <Stage kicker="TECNOLOGÍA PARA EL TRABAJO REAL">
 <div style={{marginTop:94}}><Line size={106}>Tu comercio.</Line><Line size={106} delay={10}>Tu consultorio.</Line><div style={{marginTop:16}}><Line size={122} delay={29} color={t.accent}>Más simple.</Line></div></div>
 <div style={{position:'absolute',top:650,left:0,width:828,height:260,overflow:'hidden',borderTop:`2px solid ${t.border}`}}><div style={{position:'absolute',top:35,left:0,translate:`${progress(f,35,Math.max(50,duration-35))*670}px 0`,rotate:`${progress(f,25,100)*45}deg`}}><Arrow size={100}/></div><div style={{position:'absolute',top:165,left:0,fontSize:32,color:t.muted,lineHeight:1.4}}>Software para tu día a día.</div></div>
 </Stage>};
