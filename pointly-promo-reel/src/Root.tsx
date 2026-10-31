import {Composition,Folder} from 'remotion';
import {Reel} from './Reel';
import {Hook} from './scenes/Hook';
import {Intro} from './scenes/Intro';
import {Points} from './scenes/Points';
import {Rewards} from './scenes/Rewards';
import {Wallet} from './scenes/Wallet';
import {Value} from './scenes/Value';
import {Closing} from './scenes/Closing';
import runtime from '../captions/qwen-runtime.json';
import './fonts';
import './style.css';
export const Root=()=> <>
 <Composition id="Pointly-Qwen-Masculina" component={Reel} width={1080} height={1920} fps={60} durationInFrames={Math.round(runtime.duration*60)} defaultProps={{runtime,musicOnly:false,safeOverlay:false}} calculateMetadata={({props})=>({durationInFrames:Math.round(props.runtime.duration*60)})}/>
 <Folder name="Escenas-Pointly">
  <Composition id="Pointly-Gancho" component={Hook} width={1080} height={1920} fps={60} durationInFrames={162} defaultProps={{duration:162}}/>
  <Composition id="Pointly-Presentacion" component={Intro} width={1080} height={1920} fps={60} durationInFrames={218} defaultProps={{duration:218}}/>
  <Composition id="Pointly-Puntos" component={Points} width={1080} height={1920} fps={60} durationInFrames={260} defaultProps={{duration:260}}/>
  <Composition id="Pointly-Premios" component={Rewards} width={1080} height={1920} fps={60} durationInFrames={224} defaultProps={{duration:224}}/>
  <Composition id="Pointly-Celular" component={Wallet} width={1080} height={1920} fps={60} durationInFrames={298} defaultProps={{duration:298}}/>
  <Composition id="Pointly-Valor" component={Value} width={1080} height={1920} fps={60} durationInFrames={347} defaultProps={{duration:347}}/>
  <Composition id="Pointly-Cierre" component={Closing} width={1080} height={1920} fps={60} durationInFrames={260} defaultProps={{duration:260}}/>
 </Folder>
</>;
