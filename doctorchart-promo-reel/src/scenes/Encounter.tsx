import {AbsoluteFill} from 'remotion';
import {Backdrop,Heading,Shot,Eyebrow,Index} from '../ui';
import {theme as t} from '../theme';
import type {SceneProps} from '../types';
export const Encounter=(_:SceneProps)=><AbsoluteFill><Backdrop/>
 <Heading><Eyebrow>Consultas</Eyebrow>La información,<br/><span style={{color:t.teal}}>a mano.</span></Heading>
 <Index n="04" label="Registrá cada atención"/>
 <Shot asset="detail" crop={[545,750,1400,1200]} width={900} height={730} top={660} zoom={1.055}/>
 </AbsoluteFill>;
