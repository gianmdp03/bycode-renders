import {Chapter} from './Chapter';
import timeline from './timeline.json';
export const Scene1=({layerOnly=false}:{layerOnly?:boolean})=><Chapter data={timeline.chapters[0]} layerOnly={layerOnly}/>;
