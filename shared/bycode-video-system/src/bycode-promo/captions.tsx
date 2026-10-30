import type {CSSProperties} from 'react';
import type {Caption} from '@remotion/captions';
import {useCurrentFrame,useVideoConfig} from 'remotion';
import {useBrand} from '../bycode-brand/index';

export const groupCaptionWords=(captions:Caption[]):Caption[][]=>{
  const groups:Caption[][]=[];let group:Caption[]=[];
  for(const c of captions){group.push(c);if(group.length>=5||c.pageBreakAfter){groups.push(group);group=[]}}
  if(group.length)groups.push(group);
  return groups;
};
export const captionGroupAt=(groups:Caption[][],ms:number)=>groups.find(g=>ms>=g[0].startMs&&ms<g[g.length-1].endMs+70);

/** Render provided timings only. Preview/ASR provenance remains the caller's responsibility. */
export const PromoCaptions=({captions,fontSize=42,style}:{captions:Caption[];fontSize?:number;style?:CSSProperties})=>{
  const {fps}=useVideoConfig();const ms=useCurrentFrame()/fps*1000;
  const brand=useBrand();const visible=captionGroupAt(groupCaptionWords(captions),ms);
  if(!visible)return null;
  return <div style={{position:'absolute',left:'8%',right:'16%',bottom:'21%',display:'flex',justifyContent:'center',alignItems:'center',minHeight:82,...style}}>
    <div style={{display:'flex',flexWrap:'wrap',justifyContent:'center',gap:'6px 9px',fontFamily:brand.typography.fontFamily,background:brand.colors.backgroundDark,borderRadius:18,padding:'14px 22px',boxShadow:'0 8px 20px #00000020'}}>
      {visible.map((c,i)=>{const active=ms>=c.startMs&&ms<c.endMs;return <span key={i} style={{fontSize,lineHeight:1.25,color:active?brand.colors.accentLight:brand.colors.onDark,fontWeight:active?brand.typography.titleWeight:500,scale:active?'1.025':'1',whiteSpace:'nowrap'}}>{c.text.trim()}</span>})}
    </div>
  </div>;
};
