import {AbsoluteFill, Sequence, staticFile} from 'remotion';
import {Audio} from '@remotion/media';
import {beats} from './data';
import {PromiseScene} from './scenes/01-Promise';
import {BusinessScene} from './scenes/02-Business';
import {JoinScene} from './scenes/03-Join';
import {PurchaseScene} from './scenes/04-Purchase';
import {BalanceScene} from './scenes/05-Balance';
import {RewardScene} from './scenes/06-Reward';
import {TiersScene} from './scenes/07-Tiers';
import {PromotionScene} from './scenes/08-Promotion';
import {RetentionScene} from './scenes/09-Retention';
import {ClosingScene} from './scenes/10-Closing';
export type PromoProps = {audio: boolean; musicVolume: number; sfxVolume: number};
// Individually retimed scenes; native frames and springs retain their original time base.
export const PointlyPromo = ({audio = true, musicVolume = 0.55, sfxVolume = 0.65}: PromoProps) => <AbsoluteFill>
  <Sequence name="01 · La promesa" from={beats[0].startFrame} durationInFrames={beats[0].frames} premountFor={60}><PromiseScene/></Sequence>
  <Sequence name="02 · Tu programa" from={beats[1].startFrame} durationInFrames={beats[1].frames} premountFor={60}><BusinessScene/></Sequence>
  <Sequence name="03 · Registro QR" from={beats[2].startFrame} durationInFrames={beats[2].frames} premountFor={60}><JoinScene/></Sequence>
  <Sequence name="04 · Compra y puntos" from={beats[3].startFrame} durationInFrames={beats[3].frames} premountFor={60}><PurchaseScene/></Sequence>
  <Sequence name="05 · Saldo y catálogo" from={beats[4].startFrame} durationInFrames={beats[4].frames} premountFor={60}><BalanceScene/></Sequence>
  <Sequence name="06 · Canje en el comercio" from={beats[5].startFrame} durationInFrames={beats[5].frames} premountFor={60}><RewardScene/></Sequence>
  <Sequence name="07 · Visitas y rangos" from={beats[6].startFrame} durationInFrames={beats[6].frames} premountFor={60}><TiersScene/></Sequence>
  <Sequence name="08 · Promoción 2x" from={beats[7].startFrame} durationInFrames={beats[7].frames} premountFor={60}><PromotionScene/></Sequence>
  <Sequence name="09 · Mensajes y retención" from={beats[8].startFrame} durationInFrames={beats[8].frames} premountFor={60}><RetentionScene/></Sequence>
  <Sequence name="10 · Pointly" from={beats[9].startFrame} durationInFrames={beats[9].frames} premountFor={60}><ClosingScene/></Sequence>
  {audio && <><Audio src={staticFile('audio/pointly-original-bed.wav')} volume={musicVolume}/><Audio src={staticFile('audio/pointly-ui-sfx.wav')} volume={sfxVolume}/></>}
</AbsoluteFill>;
