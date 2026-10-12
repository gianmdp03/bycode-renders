import './index.css';
import {VIDEO, beats} from './data';
import {Composition, Folder} from 'remotion';
import {PointlyPromo} from './Video';
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
export const RemotionRoot = () => <>
  <Composition id={VIDEO.id} component={PointlyPromo} durationInFrames={VIDEO.frames} fps={60} width={1080} height={1920} defaultProps={{audio: true, musicVolume: 0.55, sfxVolume: 0.65}}/>
  <Folder name="Pointly-Scenes">
    <Composition id="01-Promesa" component={PromiseScene} durationInFrames={beats[0].frames} fps={60} width={1080} height={1920}/>
    <Composition id="02-Negocio" component={BusinessScene} durationInFrames={beats[1].frames} fps={60} width={1080} height={1920}/>
    <Composition id="03-QR" component={JoinScene} durationInFrames={beats[2].frames} fps={60} width={1080} height={1920}/>
    <Composition id="04-Compra" component={PurchaseScene} durationInFrames={beats[3].frames} fps={60} width={1080} height={1920}/>
    <Composition id="05-Puntos" component={BalanceScene} durationInFrames={beats[4].frames} fps={60} width={1080} height={1920}/>
    <Composition id="06-Premios" component={RewardScene} durationInFrames={beats[5].frames} fps={60} width={1080} height={1920}/>
    <Composition id="07-Rangos" component={TiersScene} durationInFrames={beats[6].frames} fps={60} width={1080} height={1920}/>
    <Composition id="08-Promociones" component={PromotionScene} durationInFrames={beats[7].frames} fps={60} width={1080} height={1920}/>
    <Composition id="09-Retencion" component={RetentionScene} durationInFrames={beats[8].frames} fps={60} width={1080} height={1920}/>
    <Composition id="10-Pointly" component={ClosingScene} durationInFrames={beats[9].frames} fps={60} width={1080} height={1920}/>
  </Folder>
</>;
