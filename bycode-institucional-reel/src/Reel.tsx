import {AbsoluteFill,Sequence,useCurrentFrame,interpolate,staticFile} from 'remotion';
import {Audio} from '@remotion/media';
import {BrandProvider} from '@bycode/video-system/brand';
import {PromoCaptions,groupCaptionWords,captionGroupAt} from '@bycode/video-system/promo';
import {brand,t} from './theme';
import {Hook} from './scenes/Hook';
import {Intro} from './scenes/Intro';
import {Pointly} from './scenes/Pointly';
import {DoctorChart} from './scenes/DoctorChart';
import {Ecosystem} from './scenes/Ecosystem';
import {Closing} from './scenes/Closing';
import type {Props} from './types';
import preview from '../captions/preview-runtime.json';
const scenes={hook:Hook,intro:Intro,pointly:Pointly,doctorchart:DoctorChart,ecosystem:Ecosystem,cta:Closing};
export const Reel=({runtime,safeOverlay}:Props)=>{const data=runtime??preview;const f=useCurrentFrame();const group=captionGroupAt(groupCaptionWords(data.captions),f/60*1000);const captionIn=interpolate(f,[(group?.[0].startMs??0)*.06,(group?.[0].startMs??0)*.06+6],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});return <BrandProvider brand={brand}><AbsoluteFill style={{fontFamily:t.font,background:t.background}}>
 {data.beats.map((b,i)=>{const C=scenes[b.id as keyof typeof scenes];const start=Math.round(b.start*60),duration=Math.round(b.end*60)-start;return <Sequence key={b.id} name={b.id} from={start} durationInFrames={duration+(i===data.beats.length-1?0:18)} style={{clipPath:i===0?undefined:`inset(0 ${100-interpolate(f,[start,start+18],[0,100],{extrapolateLeft:'clamp',extrapolateRight:'clamp'})}% 0 0)`}}><C duration={duration}/></Sequence>})}
 <PromoCaptions captions={data.captions} fontSize={44} style={{left:84,right:168,bottom:410,minHeight:100,opacity:captionIn,translate:`0 ${(1-captionIn)*10}px`}}/>
 <Audio src={staticFile(runtime?.audioFile??(data.voice?'audio/final-mix.wav':'audio/preview-mix.wav'))}/>
 {safeOverlay?<AbsoluteFill style={{pointerEvents:'none',border:'3px solid #ff3155'}}><div style={{position:'absolute',top:210,left:84,width:828,height:1300,border:'3px solid #ff3155'}}/><div style={{height:200,background:'#ff31552e',padding:35,fontSize:28}}>Reserva superior</div><div style={{position:'absolute',right:0,top:550,bottom:330,width:150,background:'#ff31552e'}}/><div style={{position:'absolute',bottom:0,height:350,width:'100%',background:'#ff31552e',padding:35,fontSize:28}}>Reserva de descripción y controles · simulación</div></AbsoluteFill>:null}
 </AbsoluteFill></BrandProvider>};
