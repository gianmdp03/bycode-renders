import {Backdrop,Headline,Kicker,Capture} from '../ui';
import {t} from '../theme';
import type {SceneProps} from '../types';
export const Wallet=(_props:SceneProps)=><Backdrop>
 <div style={{position:'absolute',left:84,right:168,top:245}}><Kicker>DEL LADO DE TU CLIENTE</Kicker><Headline>Sus puntos.<br/><span style={{color:t.accent}}>En el celular.</span></Headline></div>
 <Capture id="wallet" top={620} height={744}/>
 </Backdrop>;
