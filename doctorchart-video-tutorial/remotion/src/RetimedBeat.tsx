import React from 'react';
import {AbsoluteFill,Freeze,staticFile,useCurrentFrame} from 'remotion';
import original from './timeline.json';
import {RecordedChapter} from './RecordedChapter';
import {Narration} from './Narration';
import {theme} from './theme';

type AIClip={id:string;sceneIndex:number;text:string;captionText:string;sourceStart:number;sourceEnd:number;sourceFrames:number;visualSpeed:number;audio:string;audioDurationMs:number};

/** Retimes real footage/cursor together. Narration and captions use the output clock. */
export const RetimedBeat:React.FC<{clip:AIClip;decorationsOnly?:boolean}>=({clip,decorationsOnly=false})=>{
 const frame=useCurrentFrame();
 const sourceFrame=Math.min(clip.sourceFrames-1,Math.floor(frame*clip.visualSpeed));
 const scene={...original.scenes[clip.sceneIndex],sourceStart:clip.sourceStart,durationInFrames:clip.sourceFrames,
  beats:[{id:clip.id,text:clip.text,from:0,durationInFrames:clip.sourceFrames,audio:clip.audio,audioDurationMs:clip.audioDurationMs,sourceStart:clip.sourceStart,sourceEnd:clip.sourceEnd,captions:[]}]};
 return <AbsoluteFill>
  <Freeze frame={sourceFrame}><RecordedChapter scene={scene} decorationsOnly={decorationsOnly}/></Freeze>
  {decorationsOnly?null:<Narration src={staticFile(clip.audio)}/>}
  {frame/60*1000<clip.audioDurationMs?<div data-caption="ai" style={{position:'absolute',left:288,width:1320,top:987,height:84,display:'flex',alignItems:'center',justifyContent:'center',textAlign:'center',fontFamily:'Arial, sans-serif',fontSize:32,lineHeight:1.17,fontWeight:400,color:theme.ink,whiteSpace:'pre-line'}}>{clip.captionText}</div>:null}
 </AbsoluteFill>;
};
