import type { CSSProperties, ReactNode } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { useBrand } from "../bycode-brand/index";
import { entranceProgress } from "./motion";

export { entranceProgress } from "./motion";

/** Add only to a scene whose background and base typography you intend to adopt. */
export const PromoStage = ({ children, style }: { children: ReactNode; style?: CSSProperties }) => {
  const brand = useBrand();
  return (
    <AbsoluteFill style={{
      backgroundColor: brand.colors.background, color: brand.colors.text,
      fontFamily: brand.typography.fontFamily, ...style,
    }}>{children}</AbsoluteFill>
  );
};

export const PromoTitle = ({ children, fontSize = 72, style }: {
  children: ReactNode; fontSize?: number; style?: CSSProperties;
}) => {
  const brand = useBrand();
  return (
    <h1 style={{
      margin: 0, fontFamily: brand.typography.fontFamily,
      color: brand.colors.text, fontWeight: brand.typography.titleWeight,
      lineHeight: brand.typography.titleLineHeight, fontSize, overflowWrap: "anywhere", ...style,
    }}>{children}</h1>
  );
};

/** Visual CTA only. Caller supplies verified copy/destination; nothing is invented. */
export const PromoCta = ({ children, destination, fontSize = 40, style }: {
  children: ReactNode; destination?: string; fontSize?: number; style?: CSSProperties;
}) => {
  const brand = useBrand();
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
      backgroundColor: brand.colors.accent, color: brand.colors.onAccent,
      borderRadius: brand.shape.radius, padding: "24px 32px",
      fontFamily: brand.typography.fontFamily, fontWeight: brand.typography.titleWeight,
      lineHeight: brand.typography.bodyLineHeight, fontSize,
      textAlign: "center", overflowWrap: "anywhere", ...style,
    }}>
      <div>{children}</div>
      {destination ? <div style={{ fontSize: "0.7em", fontWeight: brand.typography.bodyWeight }}>{destination}</div> : null}
    </div>
  );
};

/** Pure frame-driven motion. Does not create Sequences or alter the timeline. */
export const PromoReveal = ({ children, start = 0, duration = 18, distance = 24, style }: {
  children: ReactNode; start?: number; duration?: number; distance?: number; style?: CSSProperties;
}) => {
  const frame = useCurrentFrame();
  const progress = entranceProgress(frame, start, duration);
  return (
    <div style={{ opacity: progress, translate: `0 ${(1 - progress) * distance}px`, ...style }}>
      {children}
    </div>
  );
};
