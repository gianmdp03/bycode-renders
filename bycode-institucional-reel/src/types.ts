import type {Caption} from '@remotion/captions';
export type Beat={id:string;start:number;end:number;text:string};
export type Runtime={duration:number;voice:boolean;voiceSource?:string;audioFile?:string;beats:Beat[];captions:Caption[]};
export type Props={runtime:Runtime|null;safeOverlay:boolean};
export type SceneProps={duration:number};
