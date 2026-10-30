import {Composition,Folder} from 'remotion';
import {BrandProvider} from '@bycode/video-system/brand';
import {doctorChartBrand} from './theme';
import {Reel} from './Reel';
import {Hook} from './scenes/Hook';
import {Reveal} from './scenes/Reveal';
import {Patients} from './scenes/Patients';
import {History} from './scenes/History';
import {Customize} from './scenes/Customize';
import {Encounter} from './scenes/Encounter';
import {Focus} from './scenes/Focus';
import {Cta} from './scenes/Cta';
import './style.css';
import qwenRuntime from '../captions/qwen-runtime.json';
export const RemotionRoot=()=> <BrandProvider brand={doctorChartBrand}>
 <Composition id="DoctorChart-Reel" component={Reel} width={1080} height={1920} fps={60} durationInFrames={1680} defaultProps={{runtime:null,mobileOverlay:false}} calculateMetadata={({props})=>({durationInFrames:Math.ceil((props.runtime?.duration??28)*60)})}/>
 <Composition id="DoctorChart-Qwen-Masculina" component={Reel} width={1080} height={1920} fps={60} durationInFrames={1681} defaultProps={{runtime:qwenRuntime,mobileOverlay:false}} calculateMetadata={({props})=>({durationInFrames:Math.ceil((props.runtime?.duration??28)*60)})}/>
 <Composition id="Reels-Safe-Area" component={Reel} width={1080} height={1920} fps={60} durationInFrames={1680} defaultProps={{runtime:null,mobileOverlay:true}}/>
 <Folder name="Scenes">
  <Composition id="Hook" component={Hook} width={1080} height={1920} fps={60} durationInFrames={198} defaultProps={{duration:198}}/>
  <Composition id="Reveal" component={Reveal} width={1080} height={1920} fps={60} durationInFrames={132} defaultProps={{duration:132}}/>
  <Composition id="Patients" component={Patients} width={1080} height={1920} fps={60} durationInFrames={162} defaultProps={{duration:162}}/>
  <Composition id="History" component={History} width={1080} height={1920} fps={60} durationInFrames={234} defaultProps={{duration:234}}/>
  <Composition id="Customize" component={Customize} width={1080} height={1920} fps={60} durationInFrames={288} defaultProps={{duration:288}}/>
  <Composition id="Encounter" component={Encounter} width={1080} height={1920} fps={60} durationInFrames={204} defaultProps={{duration:204}}/>
  <Composition id="Focus" component={Focus} width={1080} height={1920} fps={60} durationInFrames={246} defaultProps={{duration:246}}/>
  <Composition id="CTA" component={Cta} width={1080} height={1920} fps={60} durationInFrames={216} defaultProps={{duration:216,url:''}}/>
 </Folder>
</BrandProvider>;
