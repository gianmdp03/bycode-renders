import {AbsoluteFill,Sequence,useCurrentFrame,interpolate} from 'remotion';
import {Audio} from '@remotion/media';
import {staticFile} from 'remotion';
import {Hook} from './scenes/Hook';
import {Reveal} from './scenes/Reveal';
import {Patients} from './scenes/Patients';
import {History} from './scenes/History';
import {Customize} from './scenes/Customize';
import {Encounter} from './scenes/Encounter';
import {Focus} from './scenes/Focus';
import {Cta} from './scenes/Cta';
import {Captions} from './Captions';
import {theme as t} from './theme';
import type {Runtime} from './types';
import preview from '../captions/preview-runtime.json';
export type Props={runtime:Runtime|null;mobileOverlay:boolean};
export const Reel=({runtime,mobileOverlay}:Props)=>{const data=runtime??preview;const f=useCurrentFrame();const components={hook:Hook,reveal:Reveal,patients:Patients,history:History,customize:Customize,encounter:Encounter,focus:Focus,cta:Cta};return <AbsoluteFill style={{fontFamily:t.font,background:t.paper}}>
 {data.beats.map((b,i)=>{const Component=components[b.id as keyof typeof components];const start=Math.round(b.start*60),end=Math.round(b.end*60);return <Sequence key={b.id} name={b.id} from={start} durationInFrames={end-start+12} style={{opacity:i===0?1:interpolate(f,[start,start+12],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'})}}><Component duration={end-start} url={data.url}/></Sequence>})}
 {f<data.beats.find(b=>b.id==='cta')!.start*60?<Captions captions={data.captions}/>:null}
 {!data.voice?<div style={{position:'absolute',top:152,left:84,color:'#6C9299',fontSize:20,letterSpacing:2,fontWeight:700}}>PREVIEW SIN VOZ · SUBTÍTULOS PROVISIONALES</div>:null}
 <Audio src={staticFile(data.voice?'audio/final-mix.wav':'audio/preview-mix.wav')}/>
 {mobileOverlay?<AbsoluteFill style={{pointerEvents:'none',fontFamily:t.font}}><div style={{height:190,background:'#FF50702B',padding:40,color:'#AC2840',fontSize:30}}>Reels · overlay ilustrativo</div><div style={{position:'absolute',right:0,top:750,width:150,height:850,background:'#FF507026',padding:25,fontSize:48,color:'#AC2840'}}>♡<br/><br/>◯<br/><br/>➤</div><div style={{position:'absolute',bottom:0,height:330,width:'100%',background:'#FF50702B',color:'#AC2840',padding:40,fontSize:30}}>@doctorchart · descripción y controles<br/>Área reservada; UI de Instagram puede variar</div></AbsoluteFill>:null}
 </AbsoluteFill>};
