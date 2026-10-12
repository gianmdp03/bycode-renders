import React from "react";
import {
  AbsoluteFill,
  Img,
  staticFile,
  useCurrentFrame,
  interpolate,
} from "remotion";
import { theme, clamp } from "../theme";
import { ByCodeBrand } from "./Brand";

export const Background: React.FC<{ accent?: string }> = ({
  accent = "#244888",
}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: theme.ink, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          width: 1250,
          height: 1800,
          right: -380,
          top: -80,
          background: `radial-gradient(ellipse, ${accent}55 0%, transparent 65%)`,
          translate: `${interpolate(frame, [0, 300], [0, -60], clamp)}px 0`,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 1000,
          height: 650,
          left: -280,
          bottom: -430,
          background: "radial-gradient(ellipse, #0F708B36, transparent 70%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(#88B1D808 1px, transparent 1px), linear-gradient(90deg, #88B1D808 1px, transparent 1px)",
          backgroundSize: "96px 96px",
          maskImage: "linear-gradient(90deg, transparent, #000 70%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: -100,
          top: 770,
          opacity: 0.035,
          rotate: "-12deg",
        }}
      >
        <Img
          src={staticFile("logos/bycode.svg")}
          style={{ width: 710, height: 830, objectFit: "contain" }}
        />
      </div>
    </AbsoluteFill>
  );
};

export const Stage: React.FC<{
  children: React.ReactNode;
  accent?: string;
  brand?: boolean;
}> = ({ children, accent, brand = true }) => (
  <AbsoluteFill
    data-qa-stage="portrait"
    style={{ fontFamily: theme.font, color: theme.white, overflow: "hidden" }}
  >
    <Background accent={accent} />
    {brand ? (
      <div style={{ position: "absolute", left: 90, top: 112, zIndex: 1 }}>
        <ByCodeBrand size={42} iconSize={55} />
      </div>
    ) : null}
    {children}
  </AbsoluteFill>
);

export const WindowBar: React.FC<{
  title: string;
  color?: string;
  demo?: boolean;
}> = ({ title, color = theme.pointly, demo = true }) => (
  <div
    style={{
      height: 65,
      flexShrink: 0,
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "0 28px",
      background: "#F8FAFC",
      borderBottom: "1px solid #DFE5EC",
      color: "#526176",
    }}
  >
    <div
      style={{ width: 10, height: 10, borderRadius: 10, background: "#CAD2DD" }}
    />
    <div
      style={{ width: 10, height: 10, borderRadius: 10, background: "#CAD2DD" }}
    />
    <div
      style={{ width: 10, height: 10, borderRadius: 10, background: "#CAD2DD" }}
    />
    <span style={{ marginLeft: 15, color, fontSize: 26, fontWeight: 700 }}>
      {title}
    </span>
    {demo ? (
      <span style={{ marginLeft: "auto", fontSize: 20, color: "#7A8797" }}>
        Datos de demostración
      </span>
    ) : null}
  </div>
);

export const Panel: React.FC<{
  children: React.ReactNode;
  width?: number;
  height?: number;
}> = ({ children, width = 900, height = 1030 }) => (
  <div
    data-qa-panel="product"
    style={{
      width,
      height,
      borderRadius: 28,
      background: "#FFF",
      color: "#1F2937",
      overflow: "hidden",
      border: "1px solid #D7DFE9",
      boxShadow: "0 38px 100px #0006, 0 0 0 10px #FFFFFF05",
      position: "relative",
      display: "flex",
      flexDirection: "column",
    }}
  >
    {children}
  </div>
);
