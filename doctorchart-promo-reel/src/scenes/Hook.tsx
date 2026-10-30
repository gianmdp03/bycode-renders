import {AbsoluteFill,useCurrentFrame,interpolate} from 'remotion';
import {Backdrop,Brand,Eyebrow,enter} from '../ui';
import {theme as t} from '../theme';
import type {SceneProps} from '../types';
export const Hook=({duration}:SceneProps)=>{const f=useCurrentFrame();const exit=interpolate(f,[duration-22,duration],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});return <AbsoluteFill><Backdrop dark/>
 <div style={{position:'absolute',left:84,top:270}}><Brand light small/></div>
 <div style={{position:'absolute',left:84,right:168,top:505,color:'white',fontSize:94,fontWeight:700,lineHeight:1.06,letterSpacing:-4,translate:`0px ${-exit*45}px`}}><Eyebrow dark>Tu día a día</Eyebrow>¿Tu consultorio<br/>en <span style={{color:'#66DBCD'}}>mil ventanas?</span></div>
 {['Papeles','Planillas','Más ventanas'].map((s,i)=>{const p=enter(f,i*18);return <div key={s} style={{position:'absolute',top:920+i*125,left:84+i*34,width:730-i*40,height:106,border:'1px solid #497078',borderRadius:22,padding:'22px 30px',color:i===2?'#70DCCE':'#E4EEEE',background:'#123C4B',fontSize:43,fontWeight:500,display:'flex',alignItems:'center',gap:20,opacity:p*(1-exit),translate:`${(1-p)*70+exit*200}px 0px`,rotate:`${[-3,2,-1][i]*(1-exit)}deg`}}><span style={{width:12,height:12,borderRadius:99,background:t.teal}}/>{s}<span style={{marginLeft:'auto',fontSize:35,opacity:.5}}>↗</span></div>})}
 <div style={{position:'absolute',left:84,top:1415,width:interpolate(f,[0,duration],[80,780]),height:4,background:t.teal}}/>
 </AbsoluteFill>};
