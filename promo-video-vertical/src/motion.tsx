import React from 'react';
import {Easing, interpolate, spring, useCurrentFrame} from 'remotion';

export const ease = Easing.bezier(0.22, 1, 0.36, 1);
export const p = (f: number, from: number, length = 40) => interpolate(f, [from, from + length], [0, 1], {easing: ease, extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
export const mix = (a: number, b: number, v: number) => a + (b - a) * v;
export const settle = (f: number, start = 0) => spring({frame: Math.max(0, f - start), fps: 60, config: {damping: 26, stiffness: 170, mass: 1}});
export const enter = (f: number, start = 0, dy = 36): React.CSSProperties => ({opacity: p(f, start, 18), translate: `0 ${mix(dy, 0, settle(f, start))}px`});

export const Camera: React.FC<React.PropsWithChildren<{scale?: number; x?: number; y?: number; origin?: string}>> = ({children, scale = 1, x = 0, y = 0, origin = '50% 50%'}) => <div style={{position: 'absolute', inset: 0, scale, translate: `${x}px ${y}px`, transformOrigin: origin}}>{children}</div>;

type Stop = {f: number; x: number; y: number; click?: boolean};
export const Cursor: React.FC<{stops: Stop[]; until?: number}> = ({stops, until = Infinity}) => {
  const f = useCurrentFrame();
  if (f < stops[0].f || f > until) return null;
  const i = Math.max(0, stops.findIndex((s, idx) => idx === stops.length - 1 || f < stops[idx + 1].f));
  const a = stops[i]; const b = stops[Math.min(i + 1, stops.length - 1)];
  const t = a === b ? 1 : p(f, a.f, b.f - a.f);
  const click = stops.find(s => s.click && f >= s.f && f < s.f + 28);
  const cp = click ? (f - click.f) / 28 : 0;
  return <div style={{position: 'absolute', left: mix(a.x, b.x, t), top: mix(a.y, b.y, t), zIndex: 90, pointerEvents: 'none', opacity: Math.min(p(f, stops[0].f, 12), until === Infinity ? 1 : 1 - p(f, until - 15, 15))}}>
    {click && <div style={{position: 'absolute', width: 64, height: 64, left: -32, top: -32, border: '3px solid #1A73E8', borderRadius: '50%', opacity: 1 - cp, scale: 0.45 + cp}}/>}
    <svg width="38" height="44" viewBox="0 0 32 38" style={{filter: 'drop-shadow(0 3px 3px #0003)', scale: click ? 0.9 + cp * 0.1 : 1}}><path d="M3 2L27 22L17 23L13 34L3 2Z" fill="#1F1F1F" stroke="white" strokeWidth="2.5" strokeLinejoin="round"/></svg>
  </div>;
};

export const NumberRoll: React.FC<{from: number; to: number; start: number; duration?: number}> = ({from, to, start, duration = 55}) => {
  const f = useCurrentFrame();
  return <>{Math.round(mix(from, to, p(f, start, duration))).toLocaleString('es-AR')}</>;
};
