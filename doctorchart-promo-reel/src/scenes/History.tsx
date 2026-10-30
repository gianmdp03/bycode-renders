import {AbsoluteFill,useCurrentFrame} from 'remotion';
import {Backdrop,Heading,Shot,Eyebrow,Index} from '../ui';
import {theme as t} from '../theme';
import type {SceneProps} from '../types';
export const History=({duration}:SceneProps)=>{const f=useCurrentFrame();return <AbsoluteFill><Backdrop/>
 <Heading><Eyebrow>Historia clínica</Eyebrow>Cada atención.<br/><span style={{color:t.teal}}>Una misma historia.</span></Heading>
 <Index n="02" label="Consultas e información reunidas"/>
 {f<duration*.52?<Shot asset="history" crop={[545,625,1380,1200]} width={900} height={710} top={670} zoom={1.045}/>:<Shot key="close" asset="history" crop={[540,1200,1370,700]} width={900} height={600} top={720} zoom={1.06}/>}
 </AbsoluteFill>};
