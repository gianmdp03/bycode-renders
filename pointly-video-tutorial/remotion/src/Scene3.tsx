import {Chapter} from './Chapter';
import timeline from './timeline.json';
export const Scene3=({layerOnly=false}:{layerOnly?:boolean})=><Chapter data={timeline.chapters[2]} layerOnly={layerOnly}/>;
