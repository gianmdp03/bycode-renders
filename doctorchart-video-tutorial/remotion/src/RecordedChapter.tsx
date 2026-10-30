import React from 'react';
import {AbsoluteFill,staticFile,useCurrentFrame,interpolate,Easing,Html5Video,OffthreadVideo,getRemotionEnvironment} from 'remotion';
import type {Caption} from '@remotion/captions';
import {theme} from './theme';
type CursorEvent={event:string;frame:number;x?:number;y?:number};
type Beat={id:string;text:string;from:number;durationInFrames:number;audio:string;audioDurationMs:number;sourceStart:number;sourceEnd:number;captions?:Caption[]};
type Scene={id:string;title:string;durationInFrames:number;sourceStart:number;footage:string;cursor:CursorEvent[];beats:Beat[]};
const zoomBeats=new Set(['wizard-number','patient-demographics','encounter-measurements','rx-medication','studies-preview']);
const clamp=(v:number,lo:number,hi:number)=>Math.max(lo,Math.min(hi,v));
export const RecordedChapter:React.FC<{scene:Scene;children?:React.ReactNode;decorationsOnly?:boolean}>=({scene,children,decorationsOnly=false})=>{
 const frame=useCurrentFrame();const sourceFrame=scene.sourceStart+frame;
 const Footage=getRemotionEnvironment().isRendering?OffthreadVideo:Html5Video;
 const points=scene.cursor.filter((e):e is CursorEvent&{x:number;y:number}=>e.x!==undefined&&e.y!==undefined&&['move','click'].includes(e.event));
 const before=points.filter(e=>e.frame<=sourceFrame).pop()??points[0];const next=points.find(e=>e.frame>sourceFrame)??before;
 const fraction=before&&next&&next.frame!==before.frame?clamp((sourceFrame-before.frame)/(next.frame-before.frame),0,1):0;
 const x=before?before.x+(next.x-before.x)*fraction:1700;const y=before?before.y+(next.y-before.y)*fraction:900;
 const click=points.filter(e=>e.event==='click'&&sourceFrame>=e.frame&&sourceFrame<e.frame+18).pop();
 const beat=scene.beats.find(b=>frame>=b.from&&frame<b.from+b.durationInFrames);const localFrame=beat?frame-beat.from:0;
 const focus=beat?points.filter(e=>e.event==='click'&&e.frame>=beat.sourceStart&&e.frame<=beat.sourceEnd).pop():null;
 const zoom=beat&&zoomBeats.has(beat.id)?interpolate(localFrame,[0,45,66,Math.max(67,beat.durationInFrames-28),beat.durationInFrames],[1,1,1.28,1.28,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp',easing:Easing.bezier(.22,.8,.25,1)}):1;
 const scale=theme.uiScale*zoom;const panX=clamp(1728/2-(focus?.x??1000)*scale,1728-1920*scale,0);const panY=clamp(972/2-(focus?.y??540)*scale,972-1080*scale,0);
 const caption:Caption|null=beat?(beat.captions?.find(c=>localFrame/60*1000>=c.startMs&&localFrame/60*1000<c.endMs)??(!beat.captions&&localFrame/60*1000<beat.audioDurationMs?{text:beat.text,startMs:0,endMs:beat.audioDurationMs,timestampMs:null,confidence:null}:null)):null;
 return <AbsoluteFill style={{backgroundColor:decorationsOnly?'transparent':theme.paper,color:theme.ink,fontFamily:'Arial, sans-serif'}}>
  {decorationsOnly?null:<div style={{position:'absolute',left:theme.uiLeft,top:0,width:1728,height:972,overflow:'hidden',boxShadow:'0 1px 0 #cedce0'}}>
   <div style={{position:'absolute',width:1920,height:1080,transformOrigin:'0 0',scale,translate:`${panX}px ${panY}px`}}>
    <Footage name={scene.title+' · captura real'} src={staticFile(scene.footage)} trimBefore={scene.sourceStart} muted style={{width:1920,height:1080}}/>
    {before?<div style={{position:'absolute',left:x,top:y,pointerEvents:'none'}}>
     {click?<div style={{position:'absolute',width:40,height:40,border:'2px solid #069eab',borderRadius:'50%',translate:'-50% -50%',scale:interpolate(sourceFrame-click.frame,[0,18],[.6,1.7],{extrapolateRight:'clamp'}),opacity:interpolate(sourceFrame-click.frame,[0,18],[.5,0],{extrapolateRight:'clamp'})}}/>:null}
     <svg width="26" height="30" viewBox="0 0 26 30" style={{filter:'drop-shadow(1px 2px 2px #0006)'}}><path d="M2 1L23 15L14 17L10 27Z" fill="white" stroke="#153744" strokeWidth="1.5" strokeLinejoin="round"/></svg>
    </div>:null}
   </div>
  </div>}
  {children}
  {beat?.id==='encounter-first'?<aside style={{position:'absolute',left:116,top:425,width:180,padding:16,background:'#e8f6f5',borderLeft:'3px solid #007582',borderRadius:8,fontSize:20,lineHeight:1.4}}><strong>Primera consulta obligatoria</strong><p style={{marginBottom:0}}>Se usa cuando este paciente todavía no tiene atenciones registradas.</p></aside>:null}
  <div style={{position:'absolute',left:28,top:995,width:230,fontSize:16,lineHeight:1.4,color:theme.muted}}><span style={{fontSize:12,letterSpacing:1.2,color:theme.teal,fontWeight:700}}>DOCTORCHART · TUTORIAL</span><div style={{marginTop:5}}>{scene.title}</div></div>
  {caption?<div data-caption="true" style={{position:'absolute',left:288,width:1320,top:987,height:84,display:'flex',alignItems:'center',justifyContent:'center',textAlign:'center',fontSize:theme.captionSize,lineHeight:1.17,fontWeight:400,color:theme.ink}}>{caption.text}</div>:null}
  <div style={{position:'absolute',right:25,top:1000,width:230,textAlign:'right',fontSize:16,lineHeight:1.4,color:theme.muted}}>{beat?.id==='edge-growth-source'?<>Referencia oficial<br/>de la OMS</>:<>Datos ficticios<br/>de demostración</>}</div>
 </AbsoluteFill>;
};
