import React from 'react';
import {Html5Audio,getRemotionEnvironment} from 'remotion';
import {Audio} from '@remotion/media';
export const Narration:React.FC<{src:string}>=({src})=>getRemotionEnvironment().isRendering
 ? <Audio src={src}/>
 : <Html5Audio src={src} pauseWhenBuffering useWebAudioApi/>;
