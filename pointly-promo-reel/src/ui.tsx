import type {CSSProperties,ReactNode} from 'react';
import {AbsoluteFill,interpolate,spring,staticFile,useCurrentFrame} from 'remotion';
import {Video} from '@remotion/media';
import {BrandProvider} from '@bycode/video-system/brand';
import {PromoStage,PromoTitle,PromoReveal} from '@bycode/video-system/promo';
import {brand,t} from './theme';
export const ease={extrapolateLeft:'clamp',extrapolateRight:'clamp'} as const;
export const Backdrop=({children,dark=false}:{children:ReactNode;dark?:boolean})=>{
 const f=useCurrentFrame();
 return <BrandProvider brand={brand}><PromoStage style={{background:dark?t.backgroundDark:t.background,color:dark?'white':t.text}}>
  <AbsoluteFill style={{backgroundImage:`radial-gradient(${dark?'#ffffff12':'#1a73e815'} 1.1px, transparent 1.1px)`,backgroundSize:'44px 44px',opacity:.65}}/>
  <div style={{position:'absolute',width:1050,height:1050,borderRadius:'50%',border:`1px solid ${dark?'#8ab4f826':'#1a73e81a'}`,left:300,top:680,translate:`${Math.sin(f/180)*25}px ${Math.cos(f/200)*18}px`}}/>
  <div style={{position:'absolute',width:740,height:740,borderRadius:'50%',border:`1px solid ${dark?'#8ab4f826':'#1a73e81a'}`,left:450,top:835}}/>
  {children}
 </PromoStage></BrandProvider>;
};
export const Kicker=({children,dark=false}:{children:ReactNode;dark?:boolean})=><div style={{fontSize:27,fontWeight:700,letterSpacing:4,color:dark?t.accentLight:t.accent,marginBottom:26}}>{children}</div>;
export const Headline=({children,dark=false,size=86,style}:{children:ReactNode;dark?:boolean;size?:number;style?:CSSProperties})=><PromoReveal duration={22} distance={24}><PromoTitle fontSize={size} style={{letterSpacing:-3.7,color:dark?'white':t.text,...style}}>{children}</PromoTitle></PromoReveal>;
export const Icon=({name,size=72,color='currentColor'}:{name:'gift'|'store'|'person'|'arrow'|'check'|'coin';size?:number;color?:string})=><svg width={size} height={size} viewBox="0 0 64 64" fill="none" stroke={color} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
 {name==='gift'?<><path d="M10 29h44v26H10zM7 20h50v11H7zM32 20v35"/><path d="M32 20c-20 2-22-19-10-14 7 2 10 14 10 14Zm0 0c20 2 22-19 10-14-7 2-10 14-10 14Z"/></>:name==='store'?<><path d="M10 25h44v31H10zM7 25l6-15h38l6 15M22 56V37h20v19M8 25c0 9 12 9 12 0 0 9 12 9 12 0 0 9 12 9 12 0 0 9 12 9 12 0"/></>:name==='person'?<><circle cx="32" cy="21" r="10"/><path d="M13 55v-6c0-21 38-21 38 0v6"/></>:name==='arrow'?<path d="M10 32h44M40 18l14 14-14 14"/>:name==='check'?<path d="m13 32 13 13 26-28"/>:<><circle cx="32" cy="32" r="25"/><path d="M32 19v26M21 32h22"/></>}
</svg>;
export const Capture=({id,top=650,height=720,width=828,left=84,style,zoom=1,offset=0}:{id:string;top?:number;height?:number;width?:number;left?:number;style?:CSSProperties;zoom?:number;offset?:number})=>{
 const f=useCurrentFrame();const p=spring({frame:f-9,fps:60,config:{damping:23,stiffness:120}});
 return <div style={{position:'absolute',left,top,width,height,borderRadius:34,overflow:'hidden',background:t.surface,border:`2px solid ${t.border}`,boxShadow:'0 28px 80px #10284b24',translate:`0 ${(1-p)*60}px`,opacity:Math.min(1,p),...style}}>
  <div style={{height:54,background:'white',display:'flex',alignItems:'center',gap:9,padding:'0 24px',borderBottom:`1px solid ${t.border}`}}><span style={{width:9,height:9,borderRadius:20,background:'#D5DCE6'}}/><span style={{width:9,height:9,borderRadius:20,background:'#D5DCE6'}}/><span style={{width:9,height:9,borderRadius:20,background:'#D5DCE6'}}/><div style={{marginLeft:20,fontSize:19,color:t.muted}}>Pointly · Café Demo</div></div>
  <div style={{height:height-54,overflow:'hidden',position:'relative'}}>
   <Video muted src={staticFile(`captures/${id}.mp4`)} style={{width:'100%',height:'auto',display:'block',scale:interpolate(f,[0,260],[zoom,zoom+.025],ease),translate:`0 ${offset}px`,transformOrigin:'50% 0'}}/>
  </div>
 </div>;
};
export const Rule=()=> <div style={{position:'absolute',left:84,right:168,bottom:335,height:2,background:'#1a73e820'}}/>;
