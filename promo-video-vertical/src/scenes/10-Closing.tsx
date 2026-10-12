import {useCurrentFrame} from 'remotion';
import {T} from '../theme';
import {Card,Logo,Icon} from '../ui';
import {enter,mix,p} from '../motion';
import {Action,Company,VReward} from '../vertical';
export const ClosingScene=()=>{const f=useCurrentFrame();const recede=p(f,26,46);return <div style={{position:'absolute',inset:0,background:T.canvas,color:T.ink,fontFamily:T.font,overflow:'hidden'}}>
 <div style={{position:'absolute',left:120,top:mix(230,120,recede),width:840,scale:mix(.95,.84,recede),opacity:mix(.8,.25,recede)}}><Card style={{padding:30}}><Company balance={650}/><div style={{marginTop:24,paddingTop:24,borderTop:T.border,fontSize:30,color:T.secondary}}>Clientes y Cuentas de Puntos</div></Card></div>
 <div style={{position:'absolute',left:140,top:mix(1430,1350,recede),width:800,scale:mix(.95,.84,recede),opacity:mix(.8,.25,recede)}}><VReward balance={650}/></div>
 <div style={{position:'absolute',left:80,right:80,top:540,textAlign:'center'}}><div style={{display:'flex',justifyContent:'center',...enter(f,3,10)}}><Logo size={136}/></div><div style={{fontSize:118,letterSpacing:'-5px',lineHeight:1.04,fontWeight:700,marginTop:100,...enter(f,28,25)}}>Haz que<br/><span style={{color:T.blue}}>vuelvan.</span></div><div style={{fontSize:39,color:T.secondary,lineHeight:1.4,marginTop:44,...enter(f,42,15)}}>Puntos. Premios.<br/>Relaciones que crecen.</div><div style={{margin:'54px auto 0',width:610,...enter(f,65,20)}}><Action style={{height:98,fontSize:36,borderRadius:50}}><Icon name="arrow" size={32}/>Sumar mi Empresa</Action></div></div>
 <div style={{position:'absolute',bottom:110,left:100,right:100,textAlign:'center',fontSize:26,color:T.secondary,opacity:p(f,70,24)}}>Fidelización inteligente para comercios y clientes.</div>
 </div>;};
