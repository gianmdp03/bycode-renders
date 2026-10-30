import {Composition} from 'remotion';
import {DoctorChartTutorial,DoctorChartMain,DoctorChartExtras,ChapterCompositions} from './GeneratedTimeline';
import timeline from './timeline.json';
import {DoctorChartAI,AIChapterCompositions} from './GeneratedAITimeline';
import aiTimeline from './ai-timeline.json';
import {AIOverlay} from './AIOverlay';
export const RemotionRoot=()=> <>
 <Composition id="DoctorChart-IA-Overlay" component={AIOverlay} defaultProps={{clipIndex:0}} width={1920} height={1080} fps={60} durationInFrames={1}/>
 <Composition id="DoctorChart-IA-Prueba" component={DoctorChartAI} width={1920} height={1080} fps={60} durationInFrames={Math.max(1,aiTimeline.durationInFrames)}/>
 <AIChapterCompositions/>
 <Composition id="DoctorChart-Tutorial-Preview" component={DoctorChartTutorial} width={1920} height={1080} fps={60} durationInFrames={Math.max(1,timeline.durationInFrames)} defaultProps={{}}/>
 <Composition id="DoctorChart-Recorrido-Principal" component={DoctorChartMain} width={1920} height={1080} fps={60} durationInFrames={Math.max(1,timeline.scenes.filter(s=>Number(s.id.slice(0,2))<=12).reduce((n,s)=>n+s.durationInFrames,0))}/>
 <Composition id="DoctorChart-Capitulos-Complementarios" component={DoctorChartExtras} width={1920} height={1080} fps={60} durationInFrames={Math.max(1,timeline.scenes.filter(s=>Number(s.id.slice(0,2))>12).reduce((n,s)=>n+s.durationInFrames,0))}/>
 <ChapterCompositions/>
</>;
