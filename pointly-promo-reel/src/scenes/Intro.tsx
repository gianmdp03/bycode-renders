import {staticFile} from 'remotion';
import {BrandLockup} from '@bycode/video-system/brand';
import {Backdrop,Headline,Capture} from '../ui';
import {t} from '../theme';
import type {SceneProps} from '../types';
export const Intro=(_props:SceneProps)=><Backdrop>
 <div style={{position:'absolute',left:84,top:238}}><BrandLockup logoSrc={staticFile('logos/pointly.svg')} size={66} iconSize={88}/></div>
 <div style={{position:'absolute',left:84,right:168,top:397}}><Headline>Un motivo<br/>para <span style={{color:t.accent}}>volver.</span></Headline></div>
 <Capture id="clients" top={690} height={680}/>
 </Backdrop>;
