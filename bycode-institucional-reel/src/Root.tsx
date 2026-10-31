import {Composition,Folder} from 'remotion';
import {BrandProvider} from '@bycode/video-system/brand';
import {brand} from './theme';
import {Reel} from './Reel';
import {Hook} from './scenes/Hook';
import {Intro} from './scenes/Intro';
import {Pointly} from './scenes/Pointly';
import {DoctorChart} from './scenes/DoctorChart';
import {Ecosystem} from './scenes/Ecosystem';
import {Closing} from './scenes/Closing';
import './fonts';
import qwenRuntime from '../captions/qwen-runtime.json';
export const Root=()=><BrandProvider brand={brand}>
 <Composition id="Bycode-Institucional" component={Reel} width={1080} height={1920} fps={60} durationInFrames={1728} defaultProps={{runtime:null,safeOverlay:false}} calculateMetadata={({props})=>({durationInFrames:Math.ceil((props.runtime?.duration??28.8)*60)})}/>
 <Composition id="Bycode-Qwen-Masculina" component={Reel} width={1080} height={1920} fps={60} durationInFrames={1734} defaultProps={{runtime:qwenRuntime,safeOverlay:false}} calculateMetadata={({props})=>({durationInFrames:Math.ceil((props.runtime?.duration??28.9)*60)})}/>
 <Folder name="Escenas">
 <Composition id="Bycode-Gancho" component={Hook} width={1080} height={1920} fps={60} durationInFrames={168} defaultProps={{duration:168}}/>
 <Composition id="Bycode-Empresa" component={Intro} width={1080} height={1920} fps={60} durationInFrames={252} defaultProps={{duration:252}}/>
 <Composition id="Bycode-Pointly" component={Pointly} width={1080} height={1920} fps={60} durationInFrames={300} defaultProps={{duration:300}}/>
 <Composition id="Bycode-DoctorChart" component={DoctorChart} width={1080} height={1920} fps={60} durationInFrames={312} defaultProps={{duration:312}}/>
 <Composition id="Bycode-Ecosistema" component={Ecosystem} width={1080} height={1920} fps={60} durationInFrames={372} defaultProps={{duration:372}}/>
 <Composition id="Bycode-Cierre" component={Closing} width={1080} height={1920} fps={60} durationInFrames={324} defaultProps={{duration:324}}/>
 </Folder></BrandProvider>;
