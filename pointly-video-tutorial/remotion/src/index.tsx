import {registerRoot,Composition,Sequence,AbsoluteFill} from 'remotion';
import {BriefCompositions} from './Brief';
import {Scene1} from './Scene1';
import {Scene2} from './Scene2';
import {Scene3} from './Scene3';
import {Scene4} from './Scene4';
import {Scene5} from './Scene5';
import {Scene6} from './Scene6';
import {Scene7} from './Scene7';
import {Scene8} from './Scene8';
import {Scene9} from './Scene9';
import {Scene10} from './Scene10';
import {Scene11} from './Scene11';
import {Scene12} from './Scene12';
import {Scene13} from './Scene13';
import {Scene14} from './Scene14';
import {Scene15} from './Scene15';
import {Scene16} from './Scene16';
import {Scene17} from './Scene17';
import {Scene18} from './Scene18';
import {Scene19} from './Scene19';
import {Scene20} from './Scene20';
import {Scene21} from './Scene21';
import {Scene22} from './Scene22';
import {Scene23} from './Scene23';
import {Scene24} from './Scene24';
import {Scene25} from './Scene25';
import {Scene26} from './Scene26';
import {Scene27} from './Scene27';
import {Scene28} from './Scene28';
import {Scene29} from './Scene29';
import {Scene30} from './Scene30';
export const Tutorial=()=> <AbsoluteFill>
 <Sequence from={0} durationInFrames={1551} name="Pointly, paso a paso"><Scene1/></Sequence>
 <Sequence from={1551} durationInFrames={2222} name="Ingresar a tu cuenta"><Scene2/></Sequence>
 <Sequence from={3773} durationInFrames={1551} name="Primer ingreso"><Scene3/></Sequence>
 <Sequence from={5324} durationInFrames={1705} name="Crear el comercio"><Scene4/></Sequence>
 <Sequence from={7029} durationInFrames={2060} name="Reglas y vencimientos"><Scene5/></Sequence>
 <Sequence from={9089} durationInFrames={1988} name="Foto y enlace del comercio"><Scene6/></Sequence>
 <Sequence from={11077} durationInFrames={2324} name="Orientarse en el panel"><Scene7/></Sequence>
 <Sequence from={13401} durationInFrames={2085} name="Agregar un cliente"><Scene8/></Sequence>
 <Sequence from={15486} durationInFrames={1844} name="Registro por QR"><Scene9/></Sequence>
 <Sequence from={17330} durationInFrames={2324} name="Buscar y revisar clientes"><Scene10/></Sequence>
 <Sequence from={19654} durationInFrames={1815} name="Registrar una compra"><Scene11/></Sequence>
 <Sequence from={21469} durationInFrames={2185} name="Ventas e incidencias"><Scene12/></Sequence>
 <Sequence from={23654} durationInFrames={1849} name="Crear una promoción"><Scene13/></Sequence>
 <Sequence from={25503} durationInFrames={1787} name="Editar, pausar y eliminar"><Scene14/></Sequence>
 <Sequence from={27290} durationInFrames={2391} name="Productos del catálogo"><Scene15/></Sequence>
 <Sequence from={29681} durationInFrames={1952} name="Premios físicos y calculadora"><Scene16/></Sequence>
 <Sequence from={31633} durationInFrames={1729} name="Vouchers de descuento"><Scene17/></Sequence>
 <Sequence from={33362} durationInFrames={1772} name="Administrar premios"><Scene18/></Sequence>
 <Sequence from={35134} durationInFrames={1883} name="Registrar un canje"><Scene19/></Sequence>
 <Sequence from={37017} durationInFrames={1887} name="Cuando no se puede canjear"><Scene20/></Sequence>
 <Sequence from={38904} durationInFrames={1767} name="Clientes sin actividad"><Scene21/></Sequence>
 <Sequence from={40671} durationInFrames={1777} name="Archivar y reactivar"><Scene22/></Sequence>
 <Sequence from={42448} durationInFrames={1979} name="Correos a clientes"><Scene23/></Sequence>
 <Sequence from={44427} durationInFrames={2310} name="La billetera del cliente"><Scene24/></Sequence>
 <Sequence from={46737} durationInFrames={1983} name="Detalle de puntos"><Scene25/></Sequence>
 <Sequence from={48720} durationInFrames={2214} name="Guardar el acceso"><Scene26/></Sequence>
 <Sequence from={50934} durationInFrames={1863} name="Estado del comercio y plan"><Scene27/></Sequence>
 <Sequence from={52797} durationInFrames={1969} name="Permisos y administración"><Scene28/></Sequence>
 <Sequence from={54766} durationInFrames={1902} name="Ayuda y problemas frecuentes"><Scene29/></Sequence>
 <Sequence from={56668} durationInFrames={1556} name="Listo para el uso diario"><Scene30/></Sequence>
</AbsoluteFill>;
const Root=()=> <>
 <Composition id="PointlyTutorial" component={Tutorial} durationInFrames={58224} fps={60} width={1920} height={1080}/>
 <Composition id="Chapter1" component={Scene1} durationInFrames={1551} fps={60} width={1920} height={1080} defaultProps={{layerOnly:false}}/>
 <Composition id="Chapter2" component={Scene2} durationInFrames={2222} fps={60} width={1920} height={1080} defaultProps={{layerOnly:false}}/>
 <Composition id="Chapter3" component={Scene3} durationInFrames={1551} fps={60} width={1920} height={1080} defaultProps={{layerOnly:false}}/>
 <Composition id="Chapter4" component={Scene4} durationInFrames={1705} fps={60} width={1920} height={1080} defaultProps={{layerOnly:false}}/>
 <Composition id="Chapter5" component={Scene5} durationInFrames={2060} fps={60} width={1920} height={1080} defaultProps={{layerOnly:false}}/>
 <Composition id="Chapter6" component={Scene6} durationInFrames={1988} fps={60} width={1920} height={1080} defaultProps={{layerOnly:false}}/>
 <Composition id="Chapter7" component={Scene7} durationInFrames={2324} fps={60} width={1920} height={1080} defaultProps={{layerOnly:false}}/>
 <Composition id="Chapter8" component={Scene8} durationInFrames={2085} fps={60} width={1920} height={1080} defaultProps={{layerOnly:false}}/>
 <Composition id="Chapter9" component={Scene9} durationInFrames={1844} fps={60} width={1920} height={1080} defaultProps={{layerOnly:false}}/>
 <Composition id="Chapter10" component={Scene10} durationInFrames={2324} fps={60} width={1920} height={1080} defaultProps={{layerOnly:false}}/>
 <Composition id="Chapter11" component={Scene11} durationInFrames={1815} fps={60} width={1920} height={1080} defaultProps={{layerOnly:false}}/>
 <Composition id="Chapter12" component={Scene12} durationInFrames={2185} fps={60} width={1920} height={1080} defaultProps={{layerOnly:false}}/>
 <Composition id="Chapter13" component={Scene13} durationInFrames={1849} fps={60} width={1920} height={1080} defaultProps={{layerOnly:false}}/>
 <Composition id="Chapter14" component={Scene14} durationInFrames={1787} fps={60} width={1920} height={1080} defaultProps={{layerOnly:false}}/>
 <Composition id="Chapter15" component={Scene15} durationInFrames={2391} fps={60} width={1920} height={1080} defaultProps={{layerOnly:false}}/>
 <Composition id="Chapter16" component={Scene16} durationInFrames={1952} fps={60} width={1920} height={1080} defaultProps={{layerOnly:false}}/>
 <Composition id="Chapter17" component={Scene17} durationInFrames={1729} fps={60} width={1920} height={1080} defaultProps={{layerOnly:false}}/>
 <Composition id="Chapter18" component={Scene18} durationInFrames={1772} fps={60} width={1920} height={1080} defaultProps={{layerOnly:false}}/>
 <Composition id="Chapter19" component={Scene19} durationInFrames={1883} fps={60} width={1920} height={1080} defaultProps={{layerOnly:false}}/>
 <Composition id="Chapter20" component={Scene20} durationInFrames={1887} fps={60} width={1920} height={1080} defaultProps={{layerOnly:false}}/>
 <Composition id="Chapter21" component={Scene21} durationInFrames={1767} fps={60} width={1920} height={1080} defaultProps={{layerOnly:false}}/>
 <Composition id="Chapter22" component={Scene22} durationInFrames={1777} fps={60} width={1920} height={1080} defaultProps={{layerOnly:false}}/>
 <Composition id="Chapter23" component={Scene23} durationInFrames={1979} fps={60} width={1920} height={1080} defaultProps={{layerOnly:false}}/>
 <Composition id="Chapter24" component={Scene24} durationInFrames={2310} fps={60} width={1920} height={1080} defaultProps={{layerOnly:false}}/>
 <Composition id="Chapter25" component={Scene25} durationInFrames={1983} fps={60} width={1920} height={1080} defaultProps={{layerOnly:false}}/>
 <Composition id="Chapter26" component={Scene26} durationInFrames={2214} fps={60} width={1920} height={1080} defaultProps={{layerOnly:false}}/>
 <Composition id="Chapter27" component={Scene27} durationInFrames={1863} fps={60} width={1920} height={1080} defaultProps={{layerOnly:false}}/>
 <Composition id="Chapter28" component={Scene28} durationInFrames={1969} fps={60} width={1920} height={1080} defaultProps={{layerOnly:false}}/>
 <Composition id="Chapter29" component={Scene29} durationInFrames={1902} fps={60} width={1920} height={1080} defaultProps={{layerOnly:false}}/>
 <Composition id="Chapter30" component={Scene30} durationInFrames={1556} fps={60} width={1920} height={1080} defaultProps={{layerOnly:false}}/>
 <BriefCompositions/>
</>;
registerRoot(Root);
