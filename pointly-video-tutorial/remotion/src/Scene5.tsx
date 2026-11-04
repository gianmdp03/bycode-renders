import {Chapter} from './Chapter';
import timeline from './timeline.json';
export const Scene5=({layerOnly=false}:{layerOnly?:boolean})=><Chapter data={timeline.chapters[4]} layerOnly={layerOnly}/>;
