import {Backdrop,Headline,Kicker,Capture} from '../ui';
import {t} from '../theme';
import type {SceneProps} from '../types';
export const Rewards=(_props:SceneProps)=><Backdrop>
 <div style={{position:'absolute',left:84,right:168,top:245}}><Kicker>PUNTOS → BENEFICIOS</Kicker><Headline>Premios que<br/><span style={{color:t.accent}}>dan ganas.</span></Headline></div>
 <Capture id="rewards" top={620} height={744}/>
 </Backdrop>;
