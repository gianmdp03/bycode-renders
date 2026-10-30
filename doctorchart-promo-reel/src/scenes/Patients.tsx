import {AbsoluteFill,useCurrentFrame,interpolate} from 'remotion';
import {Backdrop,Heading,Shot,Eyebrow,Index} from '../ui';
import {theme as t} from '../theme';
import type {SceneProps} from '../types';
export const Patients=({duration}:SceneProps)=>{const f=useCurrentFrame();return <AbsoluteFill><Backdrop/>
 <Heading><Eyebrow>Pacientes</Eyebrow>Encontrá a quien<br/><span style={{color:t.teal}}>necesitás.</span></Heading>
 <Index n="01" label="Tu directorio, organizado"/>
 <Shot asset="patients" crop={[545,790,910,760]} width={900} height={660} top={680} zoom={1.04}/>
 <div style={{position:'absolute',left:106,top:680,width:5,height:660,background:t.teal,scale:`1 ${interpolate(f,[0,duration],[.25,1])}`,transformOrigin:'top'}}/>
 </AbsoluteFill>};
