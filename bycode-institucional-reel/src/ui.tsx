import type {ReactNode} from 'react';
import {Easing,Img,interpolate,staticFile,useCurrentFrame} from 'remotion';
import {SafeArea} from '@bycode/video-system/brand';
import {PromoStage,PromoTitle} from '@bycode/video-system/promo';
import {t} from './theme';
export const ease=Easing.bezier(.16,1,.3,1);
export const progress=(f:number,start=0,len=42)=>interpolate(f,[start,start+len],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp',easing:ease});
export const Stage=({children,dark=false,kicker}:{children:ReactNode;dark?:boolean;kicker:string})=><PromoStage style={{background:dark?t.backgroundDark:t.background,color:dark?'#fff':t.text}}>
 <SafeArea insets={{left:84,right:168,top:355,bottom:490}}><div style={{fontSize:25,letterSpacing:3.5,fontWeight:600,color:dark?'#93bcff':t.accent,marginBottom:34}}>{kicker}</div>{children}</SafeArea>
 <div style={{position:'absolute',left:84,right:168,bottom:361,height:1,background:dark?'#ffffff20':t.border}}/>
 </PromoStage>;
export const Line=({children,delay=0,size=100,color=t.text}:{children:ReactNode;delay?:number;size?:number;color?:string})=>{const f=useCurrentFrame();return <div style={{overflow:'hidden',paddingBottom:10}}><PromoTitle fontSize={size} style={{color,letterSpacing:-4,translate:`0 ${(1-progress(f,delay,48))*115}%`,lineHeight:1.04}}>{children}</PromoTitle></div>};
export const Arrow=({size=60,color=t.accent}:{size?:number;color?:string})=><svg width={size} height={size} viewBox="0 0 64 64" fill="none"><path d="M12 50 50 12M12 12h38v38" stroke={color} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
export const Rule=({delay=0,dark=false}:{delay?:number;dark?:boolean})=>{const f=useCurrentFrame();return <div style={{height:5,background:dark?'#fff':t.accent,width:`${progress(f,delay,65)*100}%`,marginTop:35}}/>};
export const ProductName=({name,file}:{name:string;file:string})=><div style={{display:'flex',alignItems:'center',gap:22,marginBottom:30}}><Img src={staticFile(`logos/${file}`)} style={{width:88,height:88,objectFit:'contain'}}/><span style={{fontSize:62,fontWeight:700,letterSpacing:-2}}>{name}</span></div>;
