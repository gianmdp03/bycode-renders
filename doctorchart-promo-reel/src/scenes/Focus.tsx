import {AbsoluteFill,useCurrentFrame} from 'remotion';
import {Backdrop,Brand,Eyebrow,enter} from '../ui';
import {theme as t} from '../theme';
import type {SceneProps} from '../types';
export const Focus=(_:SceneProps)=>{const f=useCurrentFrame();return <AbsoluteFill><Backdrop dark/>
 <div style={{position:'absolute',left:84,top:260}}><Brand light small/></div>
 <div style={{position:'absolute',left:84,right:168,top:620,color:'#fff',fontSize:99,fontWeight:700,letterSpacing:-4,lineHeight:1.08,opacity:enter(f),translate:`0px ${(1-enter(f))*32}px`}}><Eyebrow dark>Todo más organizado</Eyebrow>Más foco<br/>en <span style={{color:'#66DBCD'}}>tus<br/>pacientes.</span></div>
 <div style={{position:'absolute',left:84,top:1240,width:90,height:5,background:t.teal,scale:`${enter(f,22)} 1`,transformOrigin:'left'}}/>
 </AbsoluteFill>};
