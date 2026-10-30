import React from 'react';
import data from './ai-timeline.json';
import {RetimedBeat} from './RetimedBeat';
export const AIOverlay:React.FC<{clipIndex:number}>=({clipIndex})=><RetimedBeat clip={data.clips[clipIndex]} decorationsOnly/>;
