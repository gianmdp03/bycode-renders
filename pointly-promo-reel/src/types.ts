import type {Caption} from '@remotion/captions';
export type Beat={id:string;text:string;start:number;end:number};
export type Runtime={duration:number;voice:boolean;voiceSource:string;audioFile:string;beats:Beat[];captions:Caption[]};
export type ReelProps={runtime:Runtime;musicOnly:boolean;safeOverlay:boolean};
export type SceneProps={duration:number};
