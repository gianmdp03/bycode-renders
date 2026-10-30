import type {Caption} from '@remotion/captions';
export type Beat={id:string;start:number;end:number;text:string};
export type Runtime={beats:Beat[];captions:Caption[];duration:number;voice:boolean;url:string;voiceSource?:string;audioFile?:string};
export type SceneProps={duration:number};
