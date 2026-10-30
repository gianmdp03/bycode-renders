import {AbsoluteFill,useCurrentFrame} from 'remotion';
import {Backdrop,Heading,Shot,Eyebrow,Index} from '../ui';
import {theme as t} from '../theme';
import type {SceneProps} from '../types';
export const Customize=({duration}:SceneProps)=>{const f=useCurrentFrame();return <AbsoluteFill><Backdrop/>
 <Heading><Eyebrow>Formularios personalizables</Eyebrow>Tu forma<br/>de <span style={{color:t.teal}}>trabajar.</span></Heading>
 <Index n="03" label="Partí de tu especialidad"/>
 <Shot asset={f<duration*.5?'customize':'custom-fields'} crop={f<duration*.5?[660,1040,1180,1000]:[660,1630,1180,970]} width={900} height={730} top={660} zoom={1.025}/>
 </AbsoluteFill>};
