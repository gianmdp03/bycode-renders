import {useCurrentFrame} from 'remotion';
import {T} from '../theme';
import {demo,money} from '../data';
import {Badge,Card,Logo} from '../ui';
import {enter,p,settle} from '../motion';
import {VReward} from '../vertical';
export const PromiseScene=()=>{const f=useCurrentFrame();return <div style={{position:'absolute',inset:0,background:T.canvas,color:T.ink,fontFamily:T.font,overflow:'hidden'}}>
 <div style={{position:'absolute',left:80,top:110}}><Logo size={76}/></div>
 <div style={{position:'absolute',left:80,right:80,top:310}}><div style={{fontSize:104,fontWeight:700,letterSpacing:'-4px',lineHeight:1.08,...enter(f,0)}}>Cada compra.</div><div style={{fontSize:104,fontWeight:700,letterSpacing:'-4px',lineHeight:1.08,color:T.blue,marginTop:14,...enter(f,14)}}>Una razón<br/>para volver.</div><div style={{fontSize:38,color:T.secondary,lineHeight:1.35,marginTop:35,...enter(f,38,15)}}>Puntos, premios y clientes<br/>que regresan.</div></div>
 <Card style={{position:'absolute',left:110,top:925,width:860,padding:38,scale:.97+.03*settle(f,6),translate:`0 ${-20*p(f,110,30)}px`}}><div style={{display:'flex',gap:18,alignItems:'center'}}><Logo size={48} word={false}/><strong style={{fontSize:33}}>{demo.business}</strong></div><div style={{fontSize:28,color:T.secondary,marginTop:26}}>Compra registrada</div><strong style={{display:'block',fontSize:76,marginTop:6}}>{money(demo.purchase)}</strong><div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginTop:20,opacity:p(f,48,28)}}><span style={{fontSize:28,color:T.secondary}}>Puntos otorgados</span><Badge style={{fontSize:36}}>+100 pts</Badge></div></Card>
 <div style={{position:'absolute',left:150,top:1280,width:780,...enter(f,110,55)}}><VReward/></div>
 <div style={{position:'absolute',left:80,bottom:120,fontSize:27,color:T.secondary}}>Fidelización para comercios</div>
 </div>;};
