import {useCurrentFrame} from 'remotion';
import {T} from '../theme';
import {demo} from '../data';
import {Card,Icon,TierBadge} from '../ui';
import {Cursor,enter,mix,p} from '../motion';
import {Action,Award,Catalog,Field,Panel,VStage} from '../vertical';
export const BalanceScene=()=>{const f=useCurrentFrame();const catalog=f>=182;const match=p(f,0,48);return <VStage number="05" title="Tus puntos y beneficios." accent="Sin contraseña." role="Cliente · Consulta con País y DNI">
 <Panel top={545} height={catalog?1120:1160} customer>{!catalog?<div style={{padding:32}}><strong style={{fontSize:35}}>Consulta tus Puntos y Beneficios</strong><div style={{marginTop:30}}><Field label="País" value="Argentina"/></div><div style={{marginTop:24}}><Field label="DNI / Identificación" value={demo.dni}/></div><Action style={{marginTop:26}}>Consultar Saldo</Action><div style={{position:'absolute',left:32,right:32,top:718,...enter(f,58,25)}}><Card style={{padding:27}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}><strong style={{fontSize:35}}>Café Aurora</strong><TierBadge/></div><div style={{fontSize:25,color:T.secondary,marginTop:15}}>Sucursal Centro · Mar del Plata</div><div style={{fontSize:27,color:T.secondary,margin:'24px 0'}}>1 compra en los últimos 30 días</div><Action>Ver Premios y Catálogo</Action></Card></div></div>:<Catalog scroll={p(f,288,48)*130}/>}</Panel>
 {!catalog&&<Award top={mix(950,1120,match)} left={mix(180,150,match)} width={mix(720,780,match)} balance={f>=27} label={f<27?'Puntos otorgados':'Tu saldo en Aurora'}/>}
 {catalog&&f>354&&<div style={{position:'absolute',left:130,top:1690,width:820,background:T.greenPale,borderRadius:14,padding:'18px 22px',fontSize:29,color:T.green,display:'flex',gap:15,alignItems:'center',...enter(f,354,16)}}><Icon name="check"/>Ya tienes puntos para tu primer premio.</div>}
 <Cursor stops={[{f:10,x:920,y:1460},{f:40,x:540,y:1067},{f:50,x:540,y:1067,click:true},{f:136,x:540,y:1067},{f:168,x:540,y:1580},{f:178,x:540,y:1580,click:true}]} until={206}/>
 </VStage>;};
