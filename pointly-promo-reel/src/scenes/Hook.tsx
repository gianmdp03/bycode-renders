import {interpolate,useCurrentFrame} from 'remotion';
import {Backdrop,Headline,Kicker,Icon,ease} from '../ui';
import {t} from '../theme';
import type {SceneProps} from '../types';
export const Hook=({duration}:SceneProps)=>{
 const f=useCurrentFrame();const path=interpolate(f,[12,85],[0,1],ease);
 return <Backdrop dark><div style={{position:'absolute',left:84,right:168,top:245}}>
  <Kicker dark>PARA TU COMERCIO</Kicker>
  <Headline dark size={100}>Compran.<br/>Se van.<br/><span style={{color:t.accentLight}}>¿Y vuelven?</span></Headline>
 </div>
 <div style={{position:'absolute',left:84,top:880,width:828,height:410}}>
  <svg width="828" height="390" viewBox="0 0 828 390" style={{position:'absolute'}}><path d="M150 240C170 60 510 5 658 170S540 410 320 265" stroke="#609aff" strokeWidth="5" strokeDasharray="1000" strokeDashoffset={1000*(1-path)} fill="none"/><path d="m333 228-24 36 44 8" stroke="#609aff" strokeWidth="5" fill="none" opacity={path}/></svg>
  <div style={{position:'absolute',left:310,top:112,width:170,height:170,borderRadius:40,background:t.accent,display:'grid',placeItems:'center',rotate:`${interpolate(f,[0,duration],[-5,3],ease)}deg`}}><Icon name="store" size={98} color="white"/></div>
  <div style={{position:'absolute',left:80,top:210,width:116,height:116,borderRadius:'50%',background:'white',color:t.accent,display:'grid',placeItems:'center',translate:`0 ${Math.sin(f/28)*9}px`}}><Icon name="person" size={66}/></div>
  <div style={{position:'absolute',right:35,top:130,width:116,height:116,borderRadius:'50%',background:'#609AFF',color:t.backgroundDark,display:'grid',placeItems:'center',opacity:interpolate(f,[40,65],[0,1],ease)}}><Icon name="person" size={66}/></div>
 </div></Backdrop>;
};
