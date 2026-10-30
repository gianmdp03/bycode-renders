import React from 'react';
import {AbsoluteFill,Img,staticFile,useCurrentFrame,interpolate,Easing} from 'remotion';
import {theme as t} from './theme';
import {BrandLockup} from '@bycode/video-system/brand';
import {PromoTitle,entranceProgress} from '@bycode/video-system/promo';
const clamp={extrapolateLeft:'clamp',extrapolateRight:'clamp'} as const;
export const ease=Easing.bezier(.16,1,.3,1);
export const enter=(f:number,delay=0)=>entranceProgress(f,delay,32);
export const Brand=({light=false,small=false}:{light?:boolean;small?:boolean})=><BrandLockup logoSrc={staticFile('assets/doctorchart-logo.svg')} logoAlt="DoctorChart" size={small?34:60} iconSize={small?46:84} logoStyle={{background:light?'#fff':undefined,borderRadius:18,padding:light?5:0}} style={{color:light?'#fff':t.ink,gap:small?12:22,letterSpacing:-1.8}}/>;
export const Backdrop=({dark=false}:{dark?:boolean})=>{const f=useCurrentFrame();return <AbsoluteFill style={{background:dark?t.deep:t.paper,overflow:'hidden'}}><svg width="1080" height="1920" style={{position:'absolute',opacity:dark?.14:.28,translate:`${Math.sin(f/180)*12}px 0px`}}><circle cx="1110" cy="960" r="680" fill="none" stroke={dark?'#3EC8BA':'#B5D5D3'} strokeWidth="1"/><circle cx="1110" cy="960" r="540" fill="none" stroke={dark?'#3EC8BA':'#B5D5D3'} strokeWidth="1"/><path d="M0 1670H1080M0 1702H1080" stroke={dark?'#3EC8BA':'#B5D5D3'} /></svg></AbsoluteFill>};
export const Eyebrow=({children,dark=false}:{children:React.ReactNode;dark?:boolean})=><div style={{fontSize:25,letterSpacing:4,fontWeight:700,color:dark?'#72DACE':t.muted,textTransform:'uppercase',marginBottom:22}}>{children}</div>;
export const Heading=({children,dark=false,size=78}:{children:React.ReactNode;dark?:boolean;size?:number})=>{const f=useCurrentFrame();return <PromoTitle fontSize={size} style={{position:'absolute',top:280,left:84,right:168,opacity:enter(f,3),translate:`0px ${(1-enter(f,3))*32}px`,color:dark?'#fff':t.ink,letterSpacing:-3,lineHeight:1.08}}>{children}</PromoTitle>};
export const Shot=({asset,crop,width=900,height=760,left=84,top=650,zoom=1.04,tilt=0}:{asset:string;crop:[number,number,number,number];width?:number;height?:number;left?:number;top?:number;zoom?:number;tilt?:number})=>{
 const f=useCurrentFrame();const p=enter(f,8);const scale=width/crop[2];
 return <div style={{position:'absolute',left,top,width,height,borderRadius:30,overflow:'hidden',background:'#fff',border:'2px solid #D8E6E7',boxShadow:'0 30px 80px #062B3A24',opacity:p,translate:`0px ${(1-p)*78}px`,rotate:`${tilt*(1-p)}deg`,scale:interpolate(f,[0,240],[1,zoom],{...clamp,easing:Easing.inOut(Easing.quad)}),transformOrigin:'50% 30%'}}><Img src={staticFile(`assets/${asset}.png`)} style={{position:'absolute',width:2000*scale,height:2500*scale,maxWidth:'none',left:-crop[0]*scale,top:-crop[1]*scale}}/></div>
};
export const Index=({n,label}:{n:string;label:string})=><div style={{position:'absolute',left:84,top:570,right:168,display:'flex',gap:18,alignItems:'center',fontSize:26,color:t.muted}}><span style={{color:t.teal,fontWeight:700}}>{n}</span><span style={{height:1,width:52,background:t.line}}/><span>{label}</span></div>;
