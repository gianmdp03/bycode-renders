import {AbsoluteFill,Sequence,interpolate,staticFile,useCurrentFrame} from 'remotion';
import {Audio} from '@remotion/media';
import {BrandProvider} from '@bycode/video-system/brand';
import {PromoCaptions,captionGroupAt,groupCaptionWords} from '@bycode/video-system/promo';
import {brand} from './theme';
import {ease} from './ui';
import {Hook} from './scenes/Hook';
import {Intro} from './scenes/Intro';
import {Points} from './scenes/Points';
import {Rewards} from './scenes/Rewards';
import {Wallet} from './scenes/Wallet';
import {Value} from './scenes/Value';
import {Closing} from './scenes/Closing';
import type {ReelProps} from './types';
export const Reel=({runtime,musicOnly,safeOverlay}:ReelProps)=>{
 const f=useCurrentFrame();const b=runtime.beats;const start=(i:number)=>Math.round(b[i].start*60);const duration=(i:number)=>Math.round(b[i].end*60)-start(i);
 const reveal=(i:number)=>({clipPath:i===0?undefined:`inset(0 ${100-interpolate(f,[start(i),start(i)+16],[0,100],ease)}% 0 0)`});
 const group=captionGroupAt(groupCaptionWords(runtime.captions),f/60*1000);const a=interpolate(f,[(group?.[0].startMs??0)*.06,(group?.[0].startMs??0)*.06+5],[0,1],ease);
 return <BrandProvider brand={brand}><AbsoluteFill style={{fontFamily:brand.typography.fontFamily,background:brand.colors.background}}>
  <Sequence name="Gancho" from={start(0)} durationInFrames={duration(0)+16}><Hook duration={duration(0)}/></Sequence>
  <Sequence name="Pointly" from={start(1)} durationInFrames={duration(1)+16} style={reveal(1)}><Intro duration={duration(1)}/></Sequence>
  <Sequence name="Compra y puntos" from={start(2)} durationInFrames={duration(2)+16} style={reveal(2)}><Points duration={duration(2)}/></Sequence>
  <Sequence name="Premios" from={start(3)} durationInFrames={duration(3)+16} style={reveal(3)}><Rewards duration={duration(3)}/></Sequence>
  <Sequence name="Cliente móvil" from={start(4)} durationInFrames={duration(4)+16} style={reveal(4)}><Wallet duration={duration(4)}/></Sequence>
  <Sequence name="Valor comercial" from={start(5)} durationInFrames={duration(5)+16} style={reveal(5)}><Value duration={duration(5)}/></Sequence>
  <Sequence name="Conocé Pointly" from={start(6)} durationInFrames={duration(6)} style={reveal(6)}><Closing duration={duration(6)}/></Sequence>
  <PromoCaptions captions={runtime.captions} fontSize={44} style={{left:84,right:168,bottom:410,minHeight:100,opacity:a,translate:`0 ${(1-a)*12}px`}}/>
  <Audio src={staticFile(musicOnly?'audio/music-only.wav':runtime.audioFile)}/>
  {safeOverlay?<AbsoluteFill style={{pointerEvents:'none'}}><div style={{position:'absolute',left:84,right:168,top:210,bottom:410,border:'3px solid #ff3155'}}/><div style={{position:'absolute',right:0,top:0,bottom:0,width:150,background:'#ff315524'}}/><div style={{position:'absolute',bottom:0,left:0,right:0,height:350,background:'#ff315524'}}/></AbsoluteFill>:null}
 </AbsoluteFill></BrandProvider>;
};
